import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";
import { DataFactory } from "./DataFactory";
import { ValidationEngine } from "./ValidationEngine";

// Load .env.local variables
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
      process.env[key] = val;
    }
  });
}

// Initialize Firebase Admin
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ascendid-web";

if (process.env.FIRESTORE_EMULATOR_HOST) {
  console.log(`Connecting to Firestore Emulator at ${process.env.FIRESTORE_EMULATOR_HOST} for Project: ${projectId}`);
  if (!admin.apps.length) {
    admin.initializeApp({ projectId });
  }
} else {
  console.log(`Connecting to Live Firestore Project: ${projectId}`);
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: projectId
      });
    } catch (e) {
      console.log("No Service Account JSON found. Initializing with empty config (requires authenticated gcloud CLI).");
      admin.initializeApp({ projectId });
    }
  }
}

const db = admin.firestore();

// Batch Operations Helper
let currentBatch = db.batch();
let batchOpCount = 0;

async function setDocInBatch(docRef: admin.firestore.DocumentReference, data: any) {
  currentBatch.set(docRef, data);
  batchOpCount++;
  if (batchOpCount >= 450) {
    await currentBatch.commit();
    console.log(`[Batch Progress] Committed ${batchOpCount} operations...`);
    currentBatch = db.batch();
    batchOpCount = 0;
  }
}

async function flushBatch() {
  if (batchOpCount > 0) {
    await currentBatch.commit();
    console.log(`[Batch Progress] Committed final ${batchOpCount} operations.`);
    batchOpCount = 0;
  }
}

// Clear Collections Helper
async function clearCollection(collectionPath: string) {
  console.log(`Clearing collection: ${collectionPath}...`);
  const snapshot = await db.collection(collectionPath).get();
  if (snapshot.empty) return;

  let batch = db.batch();
  let count = 0;
  for (const doc of snapshot.docs) {
    batch.delete(doc.ref);
    count++;
    if (count >= 400) {
      await batch.commit();
      batch = db.batch();
      count = 0;
    }
  }
  if (count > 0) {
    await batch.commit();
  }
  console.log(`Cleared collection: ${collectionPath}.`);
}

async function clearStudentSubcollections() {
  console.log("Clearing student subcollections (trust_history)...");
  const studentSnap = await db.collection("students").get();
  for (const studentDoc of studentSnap.docs) {
    const historySnap = await studentDoc.ref.collection("trust_history").get();
    let batch = db.batch();
    let count = 0;
    for (const histDoc of historySnap.docs) {
      batch.delete(histDoc.ref);
      count++;
      if (count >= 400) {
        await batch.commit();
        batch = db.batch();
        count = 0;
      }
    }
    if (count > 0) {
      await batch.commit();
    }
  }
}

async function main() {
  const start = Date.now();
  console.log("=== ASCENDID ENTERPRISE SEEDER STARTING ===");

  // 1. Clear Firestore collections to avoid duplication/orphan logs
  await clearStudentSubcollections();
  await clearCollection("students");
  await clearCollection("credentials");
  await clearCollection("achievements");
  await clearCollection("academic_records");
  await clearCollection("issuers");
  await clearCollection("opportunities");
  await clearCollection("fraud_reports");
  await clearCollection("recruiters");

  // 2. Initialize Seeded Factory
  const factory = new DataFactory(54321); // Set seed dynamically

  // 3. Generate Universities & Companies
  console.log("Generating modular configurations...");
  const universities = factory.generateUniversities();
  const companies = factory.generateCompanies();

  // 4. Generate Students and Assets using Self-Healing Validation Loop
  console.log("Generating 50 high-quality students and career timelines...");
  const studentsList: any[] = [];
  const projectsList: any[] = [];
  const achievementsList: any[] = [];
  const credentialsList: any[] = [];

  const allEmails = new Set<string>();
  const allUUIDs = new Set<string>();

  const targetStudentCount = 50;

  for (let i = 1; i <= targetStudentCount; i++) {
    let valid = false;
    let attempts = 0;
    let currentProfile: any = null;

    while (!valid && attempts < 10) {
      attempts++;
      currentProfile = factory.generateStudentProfile(i, universities, companies);

      // Validate timeline constraints and consistency
      const failures = ValidationEngine.validateStudentData(
        currentProfile.student,
        currentProfile.projects,
        currentProfile.achievements,
        currentProfile.credentials,
        universities,
        companies,
        allEmails,
        allUUIDs
      );

      // Global constraints check
      const isEmailDuplicate = allEmails.has(currentProfile.student.email);
      const isUUIDDuplicate = currentProfile.credentials.some((c: any) => allUUIDs.has(c.id));

      if (failures.length === 0 && !isEmailDuplicate && !isUUIDDuplicate) {
        // Mark as valid and lock sets
        allEmails.add(currentProfile.student.email);
        currentProfile.credentials.forEach((c: any) => allUUIDs.add(c.id));
        valid = true;
      } else {
        console.warn(
          `[Validation Failure] student-${i} (attempt ${attempts}) failed. Errors: ${failures
            .map((f) => f.message)
            .join(" | ")}. Re-generating record...`
        );
        // Remove tracking references and retry
        factory.removeTrackingEmail(currentProfile.student.email);
        currentProfile.credentials.forEach((c: any) => factory.removeTrackingUUID(c.id));
      }
    }

    if (valid && currentProfile) {
      studentsList.push(currentProfile.student);
      projectsList.push(...currentProfile.projects);
      achievementsList.push(...currentProfile.achievements);
      credentialsList.push(...currentProfile.credentials);
    } else {
      throw new Error(`[Orchestration Error] Failed to generate a valid student at index ${i} after 10 attempts.`);
    }
  }

  // Write all seeded credentials to the mock blockchain state file
  factory.writeMockBlockchainState(credentialsList);

  // 5. Generate Recruiters
  console.log("Generating recruiters...");
  const recruitersList = factory.generateRecruiters(companies);

  // 6. Generate Opportunities (Jobs, Internships, Fellowships, Hackathons)
  console.log("Generating Opportunities...");
  const opportunitiesList = factory.generateOpportunities(companies);

  // 7. Inject Fraud Cases (flagging anomalies and updating trust scores)
  console.log("Generating 100 anomaly fraud reports...");
  const fraudData = factory.generateFraudReports(credentialsList, studentsList);
  const fraudReportsList = fraudData.fraudReports;

  // 8. Upload documents to Firestore
  console.log("Uploading dataset to Firestore...");

  // A. Upload Issuers
  for (const uni of universities) {
    const docRef = db.collection("issuers").doc(uni.id);
    await setDocInBatch(docRef, { ...uni, type: "university", verified: true });
  }
  for (const comp of companies) {
    const docRef = db.collection("issuers").doc(comp.id);
    await setDocInBatch(docRef, { ...comp, type: "company", verified: true });
  }

  // Upload mock issuer for CBSE
  await setDocInBatch(db.collection("issuers").doc("issuer-cbse"), {
    id: "issuer-cbse",
    name: "Central Board of Secondary Education",
    shortName: "CBSE",
    type: "university",
    email: "registrar@cbse.gov.in",
    walletAddress: makeEthereumAddress(),
    verified: true,
    logo: "https://logo.clearbit.com/cbse.gov.in"
  });

  // B. Upload Students and Subcollections (trust_history)
  for (const student of studentsList) {
    const docRef = db.collection("students").doc(student.id);
    await setDocInBatch(docRef, student);

    // Upload trust score history (3 items)
    const historyRef = docRef.collection("trust_history");
    const dates = [
      new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      new Date().toISOString()
    ];
    for (let h = 0; h < 3; h++) {
      const histScore = Math.max(350, Math.min(850, student.trustScore - (2 - h) * 15));
      await setDocInBatch(historyRef.doc(`hist-${h}`), {
        score: histScore,
        timestamp: dates[h],
        explanation: h === 0 ? "Initial profile setup check." : h === 1 ? "CBSE academic records verified." : "Trust metrics re-evaluation.",
        factors: student.trustFactors
      });
    }

    // C. Upload academic records (CBSE 10 & 12 if connected)
    if (student.isDigiLockerConnected) {
      const records = [
        {
          studentId: student.id,
          type: "Class 10 Marksheet",
          board: "CBSE",
          percentage: "94.2%",
          score: "94.2%",
          year: "2020",
          verified: true,
          verifiedBy: "DigiLocker",
          source: "DigiLocker"
        },
        {
          studentId: student.id,
          type: "Class 12 Marksheet",
          board: "CBSE",
          percentage: "92.8%",
          score: "92.8%",
          year: "2022",
          verified: true,
          verifiedBy: "DigiLocker",
          source: "DigiLocker"
        }
      ];
      await setDocInBatch(db.collection("academic_records").doc(`${student.id}_cbse10`), records[0]);
      await setDocInBatch(db.collection("academic_records").doc(`${student.id}_cbse12`), records[1]);
    }
  }

  // D. Upload Achievements
  for (const ach of achievementsList) {
    const docRef = db.collection("achievements").doc(ach.id);
    await setDocInBatch(docRef, ach);
  }

  // E. Upload Credentials
  for (const cred of credentialsList) {
    const docRef = db.collection("credentials").doc(cred.id);
    await setDocInBatch(docRef, cred);
  }

  // F. Upload Opportunities
  for (const opp of opportunitiesList) {
    const docRef = db.collection("opportunities").doc(opp.id);
    await setDocInBatch(docRef, opp);
  }

  // G. Upload Recruiters
  for (const rec of recruitersList) {
    const docRef = db.collection("recruiters").doc(rec.id);
    await setDocInBatch(docRef, rec);
  }

  // H. Upload Fraud Reports
  for (const fraud of fraudReportsList) {
    const docRef = db.collection("fraud_reports").doc(fraud.id);
    await setDocInBatch(docRef, { ...fraud, updatedAt: new Date().toISOString() });
  }

  await flushBatch();

  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`\n=== SEED SUMMARY SUCCESS (${elapsed}s) ===`);
  console.log(`- Universities: ${universities.length}`);
  console.log(`- Companies: ${companies.length}`);
  console.log(`- Students (high-quality profiles): ${studentsList.length}`);
  console.log(`- Recruiters: ${recruitersList.length}`);
  console.log(`- Credentials (anchored W3C): ${credentialsList.length}`);
  console.log(`- Projects & Achievements: ${achievementsList.length}`);
  console.log(`- Opportunities (Jobs/Hacks): ${opportunitiesList.length}`);
  console.log(`- Fraud Reports Generated: ${fraudReportsList.length}`);
  console.log("=== SEEDING COMPLETED SUCCESSFULLY ===");
}

// Generate random wallet helper
function makeEthereumAddress() {
  const chars = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i++) {
    addr += chars[Math.floor(Math.random() * 16)];
  }
  return addr;
}

main().catch((err) => {
  console.error("Critical error in seed orchestration:", err);
  process.exit(1);
});
