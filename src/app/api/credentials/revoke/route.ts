import { NextRequest, NextResponse } from "next/server";
import { adminDb, admin } from "@/lib/firebase-admin";
import { getBlockchainProvider } from "@/lib/blockchain";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, reason } = body;

    if (!id || !reason) {
      return NextResponse.json({ error: "Missing credential ID or revocation reason" }, { status: 400 });
    }

    // 1. Fetch current credential document from Firestore
    const docRef = adminDb.collection("credentials").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Credential not found" }, { status: 404 });
    }

    const cred = docSnap.data() || {};
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
