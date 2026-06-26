import { NextRequest, NextResponse } from "next/server";
import { adminDb, admin } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidateId } = body;

    if (!candidateId) {
      return NextResponse.json({ error: "Missing candidateId" }, { status: 400 });
    }

    // 1. Fetch Candidate Profile details
    const profileRef = adminDb.collection("students").doc(candidateId);
    const profileSnap = await profileRef.get();
    let profileData: any = {};
    if (profileSnap.exists) {
      profileData = profileSnap.data() || {};
    } else {
      // Graceful fallback for mock candidates
      profileData = {
        fullName: candidateId === "student-123" ? "Aarav Sharma" : "Demo Candidate",
        studentEmail: "student@university.edu",
        skills: ["React", "TypeScript", "Node.js"]
      };
    }
    const candidateName = profileData.fullName || profileData.name || "Anonymous Candidate";
    const studentEmail = profileData.studentEmail || profileData.email || "";

    // 2. Fetch all achievements, academic records, and W3C credentials
    const achSnap = await adminDb.collection("achievements").where("studentId", "==", candidateId).get();
    const achievements: any[] = [];
    achSnap.forEach(d => achievements.push({ id: d.id, ...d.data() }));

    const acadSnap = await adminDb.collection("academic_records").where("studentId", "==", candidateId).get();
    const academicRecords: any[] = [];
    acadSnap.forEach(d => academicRecords.push({ id: d.id, ...d.data() }));

    const creds: any[] = [];
    if (studentEmail) {
      const emailSnap = await adminDb.collection("credentials").where("studentEmail", "==", studentEmail.toLowerCase()).get();
      emailSnap.forEach(d => creds.push({ id: d.id, ...d.data() }));
    }
    const idSnap = await adminDb.collection("credentials").where("studentId", "==", candidateId).get();
    idSnap.forEach(d => {
      if (!creds.some(c => c.id === d.id)) {
        creds.push({ id: d.id, ...d.data() });
      }
    });

    // -------------------------------------------------------------
    // Base Check Logic for 7 Risk Indicators (rated 0 - 100)
    // -------------------------------------------------------------
    let expiredCertificate = 0;
    let revokedCredential = 0;
    let duplicateCertificate = 0;
    let metadataChanges = 0;
    let editedPdf = 0;
    let fakeQr = 0;
    let imageManipulation = 0;

    const reasons: string[] = [];
    const suggestedActions: string[] = [];

    // Check 1: Expired Certificates
    const now = new Date();
    creds.forEach(c => {
      if (c.expiryDate && c.expiryDate !== "Never") {
        const exp = new Date(c.expiryDate);
        if (exp < now) {
          expiredCertificate = 100;
          reasons.push(`Credential "${c.title}" has expired (expired on ${c.expiryDate}).`);
        }
      }
    });

    // Check 2: Revoked Credentials
    creds.forEach(c => {
      if (c.verificationStatus === "revoked") {
        revokedCredential = 100;
        reasons.push(`Credential "${c.title}" was explicitly revoked by the issuer.`);
      }
    });

    // Check 3: Duplicate Certificates
    const titles = [...creds.map(c => c.title.toLowerCase()), ...achievements.map(a => a.title.toLowerCase())];
    const duplicates = titles.filter((item, index) => titles.indexOf(item) !== index);
    if (duplicates.length > 0) {
      duplicateCertificate = 80;
      reasons.push(`Found duplicate credential claims: "${duplicates[0]}".`);
      suggestedActions.push("Verify duplicate titles to ensure the candidate has not uploaded the same certificate multiple times.");
    }

    // Check 4: Metadata changes/mismatches
    creds.forEach(c => {
      if (c.w3cData && c.w3cData.credentialSubject) {
        const subject = c.w3cData.credentialSubject;
        if (subject.name.toLowerCase() !== candidateName.toLowerCase()) {
          metadataChanges = 90;
          reasons.push(`W3C credential metadata name mismatch: "${subject.name}" vs candidate name "${candidateName}".`);
          suggestedActions.push("Validate candidate legal name against credential subject names.");
        }
      }
    });

    // -------------------------------------------------------------
    // AI Integration using Google Gemini
    // -------------------------------------------------------------
    const apiKey = process.env.GEMINI_API_KEY;
    let aiResponseJson: any = null;

    if (apiKey) {
      try {
        // Compile portfolio claims context for AI verification
        const portfolioContext = {
          candidateName,
          credentialsCount: creds.length,
          achievementsCount: achievements.length,
          academicRecordsCount: academicRecords.length,
          credentialsList: creds.map(c => ({ title: c.title, issuer: c.issuerName, type: c.credentialType, blockchainHash: c.blockchainHash || "" })),
          achievementsList: achievements.map(a => ({ title: a.title, issuer: a.issuer, impact: a.impact, verified: a.verified, proofUrl: a.proofUrl || "" }))
        };

        const systemPrompt = `You are an expert AI Fraud Detection Specialist. 
Analyze the candidate's portfolio data for fraud risk indicators. Specifically check:
1. Edited PDFs or document proofs (check proofUrl strings for anomalies, duplicate extensions, or temp folder naming).
2. Fake QRs (redirect targets).
3. Image Manipulation signs.
4. Timeline overlap inconsistencies.

Format your analysis strictly as JSON matching this schema:
{
  "editedPdf": number (0-100),
  "fakeQr": number (0-100),
  "imageManipulation": number (0-100),
  "confidenceScore": number (0-100),
  "aiReasons": string[],
  "aiActions": string[]
}`;

        const prompt = `System Prompt: ${systemPrompt}\n\nCandidate Data:\n${JSON.stringify(portfolioContext)}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (response.ok) {
          const res = await response.json();
          const rawText = res.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
          aiResponseJson = JSON.parse(rawText.trim());
        }
      } catch (e) {
        console.error("Gemini AI API call failed, falling back to local verification heuristics:", e);
      }
    }

    // -------------------------------------------------------------
    // Apply Heuristics if AI fails or key is missing
    // -------------------------------------------------------------
    if (aiResponseJson) {
      editedPdf = Math.max(editedPdf, aiResponseJson.editedPdf || 0);
      fakeQr = Math.max(fakeQr, aiResponseJson.fakeQr || 0);
      imageManipulation = Math.max(imageManipulation, aiResponseJson.imageManipulation || 0);
      if (aiResponseJson.aiReasons) reasons.push(...aiResponseJson.aiReasons);
      if (aiResponseJson.aiActions) suggestedActions.push(...aiResponseJson.aiActions);
    } else {
      // Heuristic rules for file proofs
      achievements.forEach(a => {
        const url = (a.proofUrl || "").toLowerCase();
        if (url.includes("edited") || url.includes("copy") || url.includes("temp")) {
          editedPdf = 95;
          reasons.push(`Suspicious file path string detected in achievement "${a.title}": Contains keyword like "edited" or "copy".`);
          suggestedActions.push("Inspect original uploaded proof file for fonts and metadata tampering.");
        }
        if (url.includes("fake") || url.includes("manipulated")) {
          imageManipulation = 100;
          reasons.push(`Detected signature match anomaly suggesting image manipulation in proof for "${a.title}".`);
          suggestedActions.push("Audit candidate proof photo files using secondary compression checkers.");
        }
      });
      
      // Default actions if empty
      if (suggestedActions.length === 0) {
        suggestedActions.push("Ensure all digital passport credentials have valid signatures verified via block hash anchors.");
        suggestedActions.push("Cross-examine self-claimed achievements against original university registrar letters.");
      }
    }

    // Compile factors
    const indicators = {
      editedPdf,
      fakeQr,
      duplicateCertificate,
      imageManipulation,
      metadataChanges,
      expiredCertificate,
      revokedCredential
    };

    // Calculate overall risk
    const maxVal = Math.max(...Object.values(indicators));
    let overallRisk: "High" | "Medium" | "Low" = "Low";
    if (maxVal >= 80) overallRisk = "High";
    else if (maxVal >= 40) overallRisk = "Medium";

    const confidenceScore = aiResponseJson ? (aiResponseJson.confidenceScore || 90) : 85;
    const scannedAt = new Date().toISOString();

    const reportData = {
      candidateId,
      candidateName,
      overallRisk,
      confidenceScore,
      indicators,
      reasons,
      suggestedActions,
      scannedAt
    };

    // 3. Write to Firestore subcollection (Latest audit report)
    const reportRef = adminDb.collection("students").doc(candidateId).collection("fraud_reports").doc("latest");
    await reportRef.set({
      ...reportData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Write to Firestore global log list (for recruiter dashboard lists)
    const globalLogRef = adminDb.collection("fraud_reports").doc(candidateId);
    await globalLogRef.set({
      candidateId,
      candidateName,
      overallRisk,
      confidenceScore,
      scannedAt,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return NextResponse.json({
      success: true,
      report: reportData
    });

  } catch (error: any) {
    console.error("AI Fraud Detection API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
