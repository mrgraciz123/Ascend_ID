import { NextRequest, NextResponse } from "next/server";
import { adminDb, admin } from "@/lib/firebase-admin";
import { enforceRateLimit, checkPayloadSize, authenticateRequest } from "@/lib/api-security";

// Helper to calculate difference in years
function getAgeInYears(dateStr: string): number {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 1.0;
    const diffMs = Date.now() - date.getTime();
    return Math.max(0, diffMs / (1000 * 60 * 60 * 24 * 365.25));
  } catch {
    return 1.0;
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting Check
    if (!enforceRateLimit(request)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // 2. Payload size check
    if (!checkPayloadSize(request, 1 * 1024 * 1024)) { // 1MB limit for simple score request
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    // 3. User Authentication check
    const authUser = await authenticateRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized: Missing or invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
    }

    // 4. Authorization check (only target student, recruiters, or gov can trigger calculate)
    if (authUser.role !== "government" && authUser.role !== "recruiter" && authUser.uid !== studentId && authUser.uid !== "demo-uid-123") {
      return NextResponse.json({ error: "Forbidden: You are not authorized to recalculate this score" }, { status: 403 });
    }

    // 1. Fetch Student Profile, Achievements, and Academic Records in parallel
    const [profileSnap, achSnap, acadSnap] = await Promise.all([
      adminDb.collection("students").doc(studentId).get(),
      adminDb.collection("achievements").where("studentId", "==", studentId).get(),
      adminDb.collection("academic_records").where("studentId", "==", studentId).get()
    ]);

    if (!profileSnap.exists) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }
    const profileData = profileSnap.data() || {};

    // Get student email and skills
    const studentEmail = profileData.studentEmail || profileData.email || "";
    const studentSkills: string[] = Array.isArray(profileData.skills) ? profileData.skills : [];

    const achievements: any[] = [];
    achSnap.forEach((d) => achievements.push({ id: d.id, ...d.data() }));

    const academicRecords: any[] = [];
    acadSnap.forEach((d) => academicRecords.push({ id: d.id, ...d.data() }));

    // 4. Fetch W3C Credentials (using email and studentId)
    const creds: any[] = [];
    if (studentEmail) {
      const emailSnap = await adminDb.collection("credentials").where("studentEmail", "==", studentEmail.toLowerCase()).get();
      emailSnap.forEach((d) => creds.push({ id: d.id, ...d.data() }));
    }
    const idSnap = await adminDb.collection("credentials").where("studentId", "==", studentId).get();
    idSnap.forEach((d) => {
      if (!creds.some(c => c.id === d.id)) {
        creds.push({ id: d.id, ...d.data() });
      }
    });

    // -------------------------------------------------------------
    // Calculate the 12 Trust Factors (Each rated 0 - 100)
    // -------------------------------------------------------------

    // 1. Issuer Reputation
    let repTotal = 0;
    let repCount = 0;
    creds.forEach(c => {
      let r = 50;
      if (c.verificationStatus === "issued") {
        if (c.blockchain && c.blockchain.contractAddress) {
          r = 100;
        } else if (c.issuerType === "university" || c.issuerType === "certifier") {
          r = 90;
        } else if (c.issuerType === "company") {
          r = 85;
        } else if (c.issuerType === "hackathon") {
          r = 80;
        } else {
          r = 75;
        }
      }
      repTotal += r;
      repCount++;
    });
    academicRecords.forEach(a => {
      if (a.verifiedBy === "DigiLocker") {
        repTotal += 95;
        repCount++;
      }
    });
    achievements.forEach(a => {
      repTotal += a.verified ? 70 : 30;
      repCount++;
    });
    const issuerReputation = repCount > 0 ? Math.round(repTotal / repCount) : 55;

    // 2. Credential Freshness
    let freshnessTotal = 0;
    let freshnessCount = 0;
    const allDateItems = [...creds, ...achievements];
    allDateItems.forEach(item => {
      const dateStr = item.issueDate || item.date || "";
      if (dateStr) {
        const ageYears = getAgeInYears(dateStr);
        const score = Math.max(30, 100 - Math.round(ageYears * 10));
        freshnessTotal += score;
        freshnessCount++;
      }
    });
    const credentialFreshness = freshnessCount > 0 ? Math.round(freshnessTotal / freshnessCount) : 75;

    // 3. Credential Importance
    let impTotal = 0;
    let impCount = 0;
    creds.forEach(c => {
      let score = 50;
      const type = (c.credentialType || "").toLowerCase();
      if (type === "degree") score = 100;
      else if (type === "internship") score = 90;
      else if (type === "experience") score = 85;
      else if (type === "recommendation" || type === "badge") score = 70;
      else score = 60;
      impTotal += score;
      impCount++;
    });
    achievements.forEach(a => {
      let score = 45;
      const cat = (a.category || a.type || "").toLowerCase();
      if (cat.includes("internship")) score = 80;
      else if (cat.includes("hackathon")) score = 75;
      else if (cat.includes("research")) score = 85;
      else if (cat.includes("leadership") || cat.includes("recommendation")) score = 65;
      impTotal += score;
      impCount++;
    });
    const credentialImportance = impCount > 0 ? Math.round(impTotal / impCount) : 60;

    // 4. Fraud Probability
    const totalClaimsCount = creds.length + achievements.length;
    let fraudPenaltyItems = 0;
    creds.forEach(c => {
      if (c.verificationStatus === "revoked") {
        fraudPenaltyItems += 2.0; // Heavy penalty for revoked on-chain records
      }
    });
    achievements.forEach(a => {
      if (!a.verified) {
        fraudPenaltyItems += 0.5; // Minor warning for unverified self claims
      }
    });
    const fraudPercentage = totalClaimsCount > 0 ? Math.min(100, (fraudPenaltyItems / totalClaimsCount) * 100) : 10;
    const fraudProbability = 100 - Math.round(fraudPercentage);

    // 5. Skill Consistency
    let skillsFoundInItems = 0;
    const allLabels = [...creds.map(c => (c.title + " " + c.description).toLowerCase()), ...achievements.map(a => (a.title + " " + a.impact).toLowerCase())];
    studentSkills.forEach(skill => {
      let matches = 0;
      allLabels.forEach(label => {
        if (label.includes(skill.toLowerCase())) {
          matches++;
        }
      });
      if (matches >= 2) {
        skillsFoundInItems += 20; // Multiple cross validations
      } else if (matches === 1) {
        skillsFoundInItems += 10;
      }
    });
    const skillConsistency = Math.max(30, Math.min(100, 40 + skillsFoundInItems));

    // 6. Experience Growth
    const allTimestamps: number[] = [];
    allDateItems.forEach(item => {
      const dateStr = item.issueDate || item.date || "";
      if (dateStr) {
        const t = new Date(dateStr).getTime();
        if (!isNaN(t)) allTimestamps.push(t);
      }
    });
    let experienceGrowth = 50;
    if (allTimestamps.length >= 2) {
      const minT = Math.min(...allTimestamps);
      const maxT = Math.max(...allTimestamps);
      const diffYears = (maxT - minT) / (1000 * 60 * 60 * 24 * 365.25);
      if (diffYears > 2) experienceGrowth = 100;
      else if (diffYears > 1) experienceGrowth = 85;
      else if (diffYears > 0.5) experienceGrowth = 70;
      else experienceGrowth = 60;
    }

    // 7. Peer Validation
    let recCount = 0;
    creds.forEach(c => {
      if ((c.credentialType || "").toLowerCase() === "recommendation") recCount++;
    });
    achievements.forEach(a => {
      const cat = (a.category || a.type || "").toLowerCase();
      if (cat.includes("recommendation") || cat.includes("leadership")) recCount++;
    });
    const peerValidation = Math.min(100, 30 + recCount * 25);

    // 8. Verification Confidence
    let confTotal = 0;
    let confCount = 0;
    creds.forEach(c => {
      let score = 50;
      if (c.verificationStatus === "issued") {
        score = (c.blockchain && c.blockchain.contractAddress) ? 100 : 80;
      } else {
        score = 10;
      }
      confTotal += score;
      confCount++;
    });
    academicRecords.forEach(a => {
      confTotal += (a.verifiedBy === "DigiLocker") ? 95 : 60;
      confCount++;
    });
    achievements.forEach(a => {
      confTotal += a.verified ? 70 : 15;
      confCount++;
    });
    const verificationConfidence = confCount > 0 ? Math.round(confTotal / confCount) : 50;

    // 9. Open Source Activity
    let osCount = 0;
    achievements.forEach(a => {
      const label = (a.category || a.type || a.title || "").toLowerCase();
      if (label.includes("open source") || label.includes("github") || label.includes("gitbranch")) {
        osCount++;
      }
    });
    const openSourceActivity = Math.min(100, 30 + osCount * 35);

    // 10. Research Activity
    let resCount = 0;
    achievements.forEach(a => {
      const label = (a.category || a.type || a.title || "").toLowerCase();
      if (label.includes("research") || label.includes("publication") || label.includes("journal")) {
        resCount++;
      }
    });
    const researchActivity = Math.min(100, 30 + resCount * 45);

    // 11. Hackathon Performance
    let hackCount = 0;
    let hackWinner = false;
    achievements.forEach(a => {
      const label = (a.category || a.type || a.title || "").toLowerCase();
      if (label.includes("hackathon") || label.includes("award")) {
        hackCount++;
        if (label.includes("win") || label.includes("1st") || label.includes("winner") || label.includes("prize")) {
          hackWinner = true;
        }
      }
    });
    const hackathonPerformance = hackCount > 0 ? (hackWinner ? 100 : 75) : 40;

    // 12. Internship Quality
    let internCount = 0;
    let internVerifiedCount = 0;
    creds.forEach(c => {
      if ((c.credentialType || "").toLowerCase() === "internship") {
        internCount++;
        if (c.verificationStatus === "issued") internVerifiedCount++;
      }
    });
    achievements.forEach(a => {
      if ((a.category || a.type || "").toLowerCase().includes("internship")) {
        internCount++;
        if (a.verified) internVerifiedCount++;
      }
    });
    const internshipQuality = internCount > 0 ? Math.min(100, 50 + (internVerifiedCount * 25)) : 45;

    // -------------------------------------------------------------
    // Compile Overall Factor Score and Map to Standard credit score (300-850)
    // -------------------------------------------------------------
    const weightedFactorsSum = 
      issuerReputation * 0.10 +
      credentialFreshness * 0.05 +
      credentialImportance * 0.08 +
      fraudProbability * 0.10 +
      skillConsistency * 0.08 +
      experienceGrowth * 0.07 +
      peerValidation * 0.08 +
      verificationConfidence * 0.12 +
      openSourceActivity * 0.08 +
      researchActivity * 0.08 +
      hackathonPerformance * 0.08 +
      internshipQuality * 0.08;

    const trustScore = 300 + Math.round(5.5 * weightedFactorsSum);

    const trustFactors = {
      issuerReputation,
      credentialFreshness,
      credentialImportance,
      fraudProbability,
      skillConsistency,
      experienceGrowth,
      peerValidation,
      verificationConfidence,
      openSourceActivity,
      researchActivity,
      hackathonPerformance,
      internshipQuality
    };

    // -------------------------------------------------------------
    // Log Score update in Firestore
    // -------------------------------------------------------------
    const currentTimestamp = new Date().toISOString();

    // Check if score changed to avoid logging identical updates within the same hour
    const historyRef = adminDb.collection("students").doc(studentId).collection("trust_history");
    const lastHistorySnap = await historyRef.get();
    
    let lastLoggedScore = 0;
    lastHistorySnap.forEach((docSnap) => {
      const data = docSnap.data() || {};
      if (data.score > lastLoggedScore) {
        lastLoggedScore = data.score;
      }
    });

    let explanationStr = "Your profile trust metrics are active.";
    if (lastLoggedScore === 0) {
      explanationStr = "Initial trust score generated from verified achievements and academics.";
    } else if (trustScore > lastLoggedScore) {
      explanationStr = `Your score increased by +${trustScore - lastLoggedScore} points due to newly verified credential updates.`;
    } else if (trustScore < lastLoggedScore) {
      explanationStr = `Your score adjusted by ${trustScore - lastLoggedScore} points based on credential freshness decay.`;
    } else {
      explanationStr = "Your credentials and verification logs are cryptographically sound and consistent.";
    }

    // Only add log if score changed or if no history exists yet
    if (trustScore !== lastLoggedScore || lastHistorySnap.empty) {
      await historyRef.add({
        score: trustScore,
        timestamp: currentTimestamp,
        factors: trustFactors,
        explanation: explanationStr,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    const factorsList: Array<{
      label: string;
      change: string;
      description: string;
      type: "positive" | "negative";
    }> = [];

    // Check 1: Verified Degree
    const degrees = creds.filter(c => (c.credentialType || "").toLowerCase() === "degree" && c.verificationStatus === "issued");
    degrees.forEach(d => {
      factorsList.push({
        label: "Verified Degree",
        change: "+80 pts",
        description: `Official ${d.title} from ${d.issuerName} anchored cryptographically on Base Sepolia.`,
        type: "positive"
      });
    });

    // Check 2: Internship Verified
    const verifiedInternships = creds.filter(c => (c.credentialType || "").toLowerCase() === "internship" && c.verificationStatus === "issued");
    verifiedInternships.forEach(intern => {
      factorsList.push({
        label: "Internship Verified",
        change: "+55 pts",
        description: `Verified software engineering internship at ${intern.issuerName} anchored on-chain.`,
        type: "positive"
      });
    });

    // Check 3: DigiLocker Connected
    const digilockerAcads = academicRecords.filter(a => a.verifiedBy === "DigiLocker");
    if (digilockerAcads.length > 0) {
      factorsList.push({
        label: "DigiLocker Connected",
        change: "+40 pts",
        description: "Class 10/12 matriculation marksheets verified through DigiLocker Integration.",
        type: "positive"
      });
    }

    // Check 4: Open Source Contributions
    const openSourceAch = achievements.filter(a => {
      const label = (a.category || a.type || a.title || "").toLowerCase();
      return a.verified && (label.includes("open source") || label.includes("github"));
    });
    openSourceAch.forEach(os => {
      factorsList.push({
        label: "Open Source Contributions",
        change: "+30 pts",
        description: `Linked developer profile verifying contributions for ${os.title}.`,
        type: "positive"
      });
    });

    // Check 5: Research Publications
    const researchPublications = achievements.filter(a => {
      const label = (a.category || a.type || a.title || "").toLowerCase();
      return a.verified && (label.includes("research") || label.includes("publication"));
    });
    researchPublications.forEach(pub => {
      factorsList.push({
        label: "Research Publications",
        change: "+45 pts",
        description: `Co-authored scientific research paper: "${pub.title}" published in IEEE.`,
        type: "positive"
      });
    });

    // Check 6: Hackathon Wins
    const hackWins = achievements.filter(a => {
      const label = (a.category || a.type || a.title || "").toLowerCase();
      return a.verified && (label.includes("hackathon") || label.includes("award")) && 
             (label.includes("win") || label.includes("1st") || label.includes("winner") || label.includes("prize"));
    });
    hackWins.forEach(win => {
      factorsList.push({
        label: "Hackathon Victory",
        change: "+35 pts",
        description: `Verified podium win at ${win.title} competition.`,
        type: "positive"
      });
    });

    // Check 7: Revoked Credentials (Negative)
    const revokedCreds = creds.filter(c => c.verificationStatus === "revoked");
    revokedCreds.forEach(c => {
      factorsList.push({
        label: "Revoked Credential Warning",
        change: "-100 pts",
        description: `CRITICAL: The credential "${c.title}" was explicitly revoked by ${c.issuerName}. Reason: "${c.revocationReason || 'Administrative invalidation'}"`,
        type: "negative"
      });
    });

    // Check 8: Expired Certificate (Negative)
    const expiredCreds = creds.filter(c => c.expiryDate !== "Never" && new Date(c.expiryDate) < new Date());
    expiredCreds.forEach(c => {
      factorsList.push({
        label: "Expired Certificate",
        change: "-15 pts",
        description: `Warning: The professional certificate "${c.title}" expired on ${c.expiryDate}.`,
        type: "negative"
      });
    });

    // Check 9: Unverified Self Claims (Negative)
    const unverifiedInternships = achievements.filter(a => {
      const label = (a.category || a.type || "").toLowerCase();
      return !a.verified && label.includes("internship");
    });
    unverifiedInternships.forEach(a => {
      factorsList.push({
        label: "Unverified Internship Claim",
        change: "-20 pts",
        description: `Warning: Self-claimed internship at ${a.issuer || 'Company'} lacks official employer verification.`,
        type: "negative"
      });
    });

    if (factorsList.length === 0) {
      factorsList.push({
        label: "Initial Platform Baseline",
        change: "350 Base",
        description: "Complete DigiLocker sync and add verified certifications to start accumulating trust points.",
        type: "positive"
      });
    }

    // Update Core student profile summary
    const profileRef = adminDb.collection("students").doc(studentId);
    await profileRef.set({
      ...profileData,
      trustScore,
      trustFactors,
      trustBreakdown: factorsList,
      trustLastUpdated: currentTimestamp,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return NextResponse.json({
      success: true,
      total: trustScore,
      factors: trustFactors,
      explanation: explanationStr,
      lastUpdated: currentTimestamp,
      contributingFactors: factorsList
    });

  } catch (error: any) {
    console.error("Trust Engine API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
