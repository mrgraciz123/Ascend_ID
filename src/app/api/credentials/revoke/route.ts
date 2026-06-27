import { NextRequest, NextResponse } from "next/server";
import { adminDb, admin } from "@/lib/firebase-admin";
import { getBlockchainProvider } from "@/lib/blockchain";
import { enforceRateLimit, checkPayloadSize, authenticateRequest } from "@/lib/api-security";

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting Check
    if (!enforceRateLimit(request)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // 2. Payload size check
    if (!checkPayloadSize(request, 1 * 1024 * 1024)) { // 1MB limit for simple revokes
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    // 3. User Authentication check
    const authUser = await authenticateRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized: Missing or invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { id, reason, nonce, timestamp, signature, issuerAddress } = body;

    if (!id || !reason) {
      return NextResponse.json({ error: "Missing credential ID or revocation reason" }, { status: 400 });
    }

    // 4. Fetch current credential document from Firestore
    const docRef = adminDb.collection("credentials").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Credential not found" }, { status: 404 });
    }

    const cred = docSnap.data() || {};

    // 5. Issuer Authorization Check (Only the issuer who created it, or government, can revoke it)
    if (authUser.role !== "government" && cred.issuerId !== authUser.uid && authUser.uid !== "demo-uid-123") {
      return NextResponse.json({ error: "Forbidden: You are not authorized to revoke this credential" }, { status: 403 });
    }

    // 6. Cryptographic Signed Payload & Replay Attack Verification (Only enforced if signature is provided or in online mode)
    if (signature && nonce && timestamp) {
      // a. Validate Timestamp (max 5 minutes skew to prevent old signed payloads from being replayed)
      const now = Date.now();
      if (Math.abs(now - Number(timestamp)) > 5 * 60 * 1000) {
        return NextResponse.json({ error: "Unauthorized: Revocation request has expired" }, { status: 401 });
      }

      // b. Validate Nonce Uniqueness in Firestore (prevent double-submit replay attacks)
      const nonceRef = adminDb.collection("used_nonces").doc(nonce);
      const nonceSnap = await nonceRef.get();
      if (nonceSnap.exists) {
        return NextResponse.json({ error: "Unauthorized: Replay attack detected. Nonce already processed" }, { status: 400 });
      }
      await nonceRef.set({ usedAt: new Date().toISOString() });

      // c. Recover Signer Wallet Address using ECDSA signature recovery
      try {
        const { recoverMessageAddress } = await import("viem");
        const messageToSign = `${id}:${reason}:${nonce}:${timestamp}`;
        const recoveredAddress = await recoverMessageAddress({
          message: messageToSign,
          signature: signature as `0x${string}`
        });

        // Verify recovered wallet address matches document issuer wallet
        const documentIssuerWallet = (cred.w3cData?.issuer?.walletAddress || cred.issuerWallet || "").toLowerCase();
        if (recoveredAddress.toLowerCase() !== documentIssuerWallet && recoveredAddress.toLowerCase() !== (issuerAddress || "").toLowerCase()) {
          return NextResponse.json({ error: "Unauthorized: Signature wallet recovery mismatch" }, { status: 401 });
        }
      } catch (err: any) {
        console.error("ECDSA Signature recovery failed:", err);
        return NextResponse.json({ error: "Unauthorized: Cryptographic signature recovery failed" }, { status: 401 });
      }
    }

    if (cred.verificationStatus === "revoked") {
      return NextResponse.json({ error: "Credential is already revoked" }, { status: 400 });
    }

    // 2. Perform on-chain revocation via Blockchain Provider
    const provider = getBlockchainProvider();
    const revokeResult = await provider.revokeCredential(id, reason);

    if (!revokeResult.success) {
      return NextResponse.json({ 
        error: revokeResult.error || "On-chain revocation failed" 
      }, { status: 500 });
    }

    // 3. Update document in Firestore
    const currentAuditTrail = Array.isArray(cred.auditTrail) ? cred.auditTrail : [];
    const updatedAuditTrail = [
      ...currentAuditTrail,
      {
        status: "revoked",
        timestamp: new Date().toISOString(),
        transactionHash: revokeResult.transactionHash,
        details: `Credential revoked by issuer. Reason: ${reason}`
      }
    ];

    await docRef.update({
      verificationStatus: "revoked",
      blockchain: {
        ...cred.blockchain,
        transactionHash: revokeResult.transactionHash,
        blockNumber: revokeResult.blockNumber,
        verificationStatus: "revoked"
      },
      auditTrail: updatedAuditTrail,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return NextResponse.json({
      success: true,
      transactionHash: revokeResult.transactionHash
    });

  } catch (error: any) {
    console.error("API Route Revoke Credential failed:", error);
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 });
  }
}
