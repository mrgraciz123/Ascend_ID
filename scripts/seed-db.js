/**
 * AscendID National Demo Dataset Seed Script
 * Generates interconnected data across 20 Universities, 15 Companies, 12 Hackathons,
 * 100 Students, 1200 Credentials (including 50 Fraudulent/Fake items),
 * 200 Projects, 80 Research Papers, 150 Internships, and 300 Certifications.
 */

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Load .env.local variables if available
const envPath = path.join(__dirname, "..", ".env.local");
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

// 1. Initialize Firebase Admin
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ascendid-web";

if (process.env.FIRESTORE_EMULATOR_HOST) {
  console.log(`Connecting to Firestore Emulator at ${process.env.FIRESTORE_EMULATOR_HOST} for Project: ${projectId}`);
  admin.initializeApp({ projectId });
} else {
  console.log(`Connecting to Live Firestore Project: ${projectId}`);
  try {
    // Attempt default initialization (using GOOGLE_APPLICATION_CREDENTIALS)
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: projectId
    });
  } catch (e) {
    console.log("No Service Account JSON found. Initializing with empty config (works if authenticated via gcloud CLI or GCP instance).");
    admin.initializeApp({ projectId });
  }
}

const db = admin.firestore();

// 2. Data Lists
const UNIVERSITIES = [
  { name: "Indian Institute of Technology Bombay", short: "IIT Bombay" },
  { name: "Indian Institute of Technology Delhi", short: "IIT Delhi" },
  { name: "Indian Institute of Technology Kharagpur", short: "IIT Kharagpur" },
  { name: "Indian Institute of Technology Madras", short: "IIT Madras" },
  { name: "Indian Institute of Technology Kanpur", short: "IIT Kanpur" },
  { name: "Birla Institute of Technology and Science, Pilani", short: "BITS Pilani" },
  { name: "Delhi Technological University", short: "DTU" },
  { name: "Netaji Subhas University of Technology", short: "NSUT" },
  { name: "National Institute of Technology Trichy", short: "NIT Trichy" },
  { name: "National Institute of Technology Surathkal", short: "NIT Surathkal" },
  { name: "International Institute of Information Technology Hyderabad", short: "IIIT Hyderabad" },
  { name: "International Institute of Information Technology Bangalore", short: "IIIT Bangalore" },
  { name: "Indian Institute of Science, Bangalore", short: "IISc Bangalore" },
  { name: "Delhi University", short: "DU" },
  { name: "Mumbai University", short: "MU" },
  { name: "Anna University, Chennai", short: "Anna Uni" },
  { name: "Jadavpur University, Kolkata", short: "Jadavpur Uni" },
  { name: "Vellore Institute of Technology", short: "VIT" },
  { name: "Manipal Institute of Technology", short: "Manipal" },
  { name: "SRM Institute of Science and Technology", short: "SRM" }
];

const COMPANIES = [
  { name: "Google India", domain: "google.com" },
  { name: "Microsoft India", domain: "microsoft.com" },
  { name: "Amazon India", domain: "amazon.in" },
  { name: "Stripe India", domain: "stripe.com" },
  { name: "Coinbase India", domain: "coinbase.com" },
  { name: "Tata Consultancy Services", domain: "tcs.com" },
  { name: "Infosys", domain: "infosys.com" },
  { name: "Wipro", domain: "wipro.com" },
  { name: "Zomato", domain: "zomato.com" },
  { name: "Swiggy", domain: "swiggy.in" },
  { name: "Paytm", domain: "paytm.com" },
  { name: "Ola Cabs", domain: "olacabs.com" },
  { name: "Cred", domain: "cred.club" },
  { name: "Razorpay", domain: "razorpay.com" },
  { name: "Flipkart", domain: "flipkart.com" }
];

const HACKATHONS = [
  "Smart India Hackathon",
  "ETHGlobal India",
  "AngelHack India",
  "Devfolio India Build",
  "Major League Hacking (MLH) India",
  "GDSC India Hackfest",
  "Microsoft Imagine Cup India",
  "Hacking Delhi",
  "Mumbai Web3 Hack",
  "Bangalore AI Summit Hackathon",
  "Techfest IIT Bombay Hack",
  "Shaastra IIT Madras Hack"
];

const INDIAN_FIRST_NAMES = [
  "Aarav", "Rohan", "Karan", "Aditya", "Arjun", "Vivaan", "Vihaan", "Kabir", "Sai", "Ishaan",
  "Ananya", "Diya", "Sneha", "Riya", "Aaradhya", "Myra", "Saisha", "Kiara", "Pooja", "Neha",
  "Abhay", "Abhinav", "Priya", "Divya", "Rahul", "Siddharth", "Amit", "Manoj", "Sanjay", "Vivek",
  "Pranav", "Nikhil", "Deepak", "Rakesh", "Vikram", "Sunil", "Rajesh", "Aishwarya", "Shruti", "Tanvi",
  "Harsh", "Gaurav", "Yash", "Ayush", "Dev", "Alok", "Sameer", "Aditi", "Kriti", "Meera"
];

const INDIAN_LAST_NAMES = [
  "Sharma", "Varma", "Johar", "Patel", "Gupta", "Rao", "Nair", "Joshi", "Singh", "Kumar",
  "Sen", "Iyer", "Reddy", "Mehta", "Chatterjee", "Das", "Banerjee", "Mishra", "Choudhury", "Bhatt",
  "Shah", "Naidu", "Pillai", "Trivedi", "Deshmukh", "Kulkarni", "Saxena", "Soni", "Pandey", "Dubey"
];

const SKILLS = [
  "React", "TypeScript", "Node.js", "Python", "Solidity", "Rust", "Java", "C++", 
  "Docker", "Kubernetes", "AWS", "Machine Learning", "PyTorch", "SQL", "NoSQL"
];

const INTERESTS = [
  "Full-Stack Development", "AI/ML", "Web3", "Blockchain", "Cloud Computing", "Data Science", "Cybersecurity"
];

const PROJECT_TITLES = [
  "DeFi Liquidity Aggregator", "Agentic AI Customer Bot", "Decentralized Health Records",
  "Real-Time Analytics Dashboard", "P2P Energy Trading Grid", "Zero-Knowledge KYC Verification",
  "Autonomous Drone Navigation", "ML Fraud Detector", "Cloud Scalability Optimizer",
  "Supply Chain Ledger", "Interactive Data Visualizer", "Secure Chat Application"
];

const RESEARCH_TITLES = [
  "Optimizing Consensus Latency in L2 Blockchains",
  "Fine-Tuning LLMs for Low-Resource Indic Languages",
  "Zero-Knowledge Proofs for Privacy-Preserving Voting Systems",
  "An Analysis of Quantum Cryptographic Resiliency",
  "Reinforcement Learning for Traffic Grid Coordination",
  "Predictive Models for Early Cardiac Anomaly Detection"
];

// Helper to generate a random item from array
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to generate unique items from array
const pickMultipleRandom = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Generates a random Ethereum address
const makeEthereumAddress = () => {
  const chars = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i++) {
    addr += chars[Math.floor(Math.random() * 16)];
  }
  return addr;
};

// Generates a mock signature
const makeDigitalSignature = () => {
  const chars = "0123456789abcdef";
  let sig = "0x";
  for (let i = 0; i < 130; i++) {
    sig += chars[Math.floor(Math.random() * 16)];
  }
  return sig;
};

// Generates a mock blockchain transaction hash
const makeTransactionHash = () => {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * 16)];
  }
  return hash;
};

// Seeding implementation
async function seed() {
  console.log("Starting Seeding Process...");

  // Setup Batch Helpers
  let currentBatch = db.batch();
  let batchOpCount = 0;

  async function setDocInBatch(docRef, data) {
    currentBatch.set(docRef, data);
    batchOpCount++;
    if (batchOpCount >= 450) {
      await currentBatch.commit();
      console.log(`[Batch Progress] Committed ${batchOpCount} documents...`);
      currentBatch = db.batch();
      batchOpCount = 0;
    }
  }

  async function flushBatch() {
    if (batchOpCount > 0) {
      await currentBatch.commit();
      console.log(`[Batch Progress] Committed final ${batchOpCount} documents.`);
      batchOpCount = 0;
    }
  }

  // --- 1. GENERATE ISSUERS (Universities, Companies, Hackathons) ---
  console.log("Generating Issuers...");
  const issuersMap = []; // Store created issuers to link later

  // 20 Universities
  for (let i = 0; i < UNIVERSITIES.length; i++) {
    const uni = UNIVERSITIES[i];
    const issuerId = `issuer-uni-${i + 1}`;
    const wallet = makeEthereumAddress();
    const data = {
      id: issuerId,
      name: uni.name,
      shortName: uni.short,
      type: "university",
      email: `registrar@${uni.short.toLowerCase().replace(" ", "")}.edu.in`,
      walletAddress: wallet,
      verified: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await setDocInBatch(db.collection("issuers").doc(issuerId), data);
    issuersMap.push({ id: issuerId, name: uni.name, type: "university", wallet });
  }

  // 15 Companies
  for (let i = 0; i < COMPANIES.length; i++) {
    const comp = COMPANIES[i];
    const issuerId = `issuer-co-${i + 1}`;
    const wallet = makeEthereumAddress();
    const data = {
      id: issuerId,
      name: comp.name,
      shortName: comp.name.split(" ")[0],
      type: "company",
      email: `hr@${comp.domain}`,
      walletAddress: wallet,
      verified: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await setDocInBatch(db.collection("issuers").doc(issuerId), data);
    issuersMap.push({ id: issuerId, name: comp.name, type: "company", wallet });
  }

  // 12 Hackathon Organizers
  for (let i = 0; i < HACKATHONS.length; i++) {
    const name = HACKATHONS[i];
    const issuerId = `issuer-hack-${i + 1}`;
    const wallet = makeEthereumAddress();
    const data = {
      id: issuerId,
      name: name,
      shortName: name.split(" ")[0],
      type: "hackathon",
      email: `organizer@${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.org`,
      walletAddress: wallet,
      verified: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await setDocInBatch(db.collection("issuers").doc(issuerId), data);
    issuersMap.push({ id: issuerId, name: name, type: "hackathon", wallet });
  }

  // --- 2. GENERATE 100 STUDENTS ---
  console.log("Generating 100 Students...");
  const studentsList = [];
  const startYears = [2020, 2021, 2022, 2023];

  for (let i = 1; i <= 100; i++) {
    const studentId = `student-${i}`;
    const firstName = pickRandom(INDIAN_FIRST_NAMES);
    const lastName = pickRandom(INDIAN_LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;
    const uni = pickRandom(UNIVERSITIES);
    const degree = pickRandom(["B.Tech", "B.E.", "M.Tech"]);
    const major = pickRandom(["Computer Science and Engineering", "Information Technology", "Electronics and Communication"]);
    
    const startYear = pickRandom(startYears);
    const gradYear = (startYear + 4).toString();

    // Student projects (2-3 projects)
    const stdProjects = [];
    const projCount = Math.floor(Math.random() * 2) + 2; // 2 or 3
    for (let p = 0; p < projCount; p++) {
      stdProjects.push({
        title: `${pickRandom(PROJECT_TITLES)} v${p + 1}`,
        description: `Constructed a decentralized protocol for verification using blockchain databases and client nodes.`,
        tags: pickMultipleRandom(SKILLS, 3),
        verified: Math.random() > 0.4
      });
    }

    const isConnected = Math.random() > 0.3; // 70% connected DigiLocker
    const score = 400 + Math.floor(Math.random() * 400); // 400 to 800

    const studentProfile = {
      id: studentId,
      uid: studentId,
      name: fullName,
      fullName: fullName,
      avatar: `https://i.pravatar.cc/150?u=student-${i}`,
      institution: uni.name,
      university: uni.name,
      degree: degree,
      major: major,
      graduationYear: gradYear,
      trustScore: score,
      isDigiLockerConnected: isConnected,
      profileCompletion: isConnected ? 90 : 60,
      skills: pickMultipleRandom(SKILLS, Math.floor(Math.random() * 4) + 5), // 5-8 skills
      location: pickRandom(["Remote", "Bangalore, India", "Mumbai, India", "Delhi, India", "Hyderabad, India", "Pune, India"]),
      interests: pickMultipleRandom(INTERESTS, 2),
      projects: stdProjects,
      trustFactors: {
        issuerReputation: Math.floor(Math.random() * 40) + 50,
        credentialFreshness: Math.floor(Math.random() * 40) + 50,
        credentialImportance: Math.floor(Math.random() * 40) + 50,
        fraudProbability: Math.floor(Math.random() * 20) + 75, // 75-95 high is safe
        skillConsistency: Math.floor(Math.random() * 40) + 50,
        experienceGrowth: Math.floor(Math.random() * 40) + 50,
        peerValidation: Math.floor(Math.random() * 50) + 30,
        verificationConfidence: Math.floor(Math.random() * 40) + 50,
        openSourceActivity: Math.floor(Math.random() * 50) + 30,
        researchActivity: Math.floor(Math.random() * 50) + 30,
        hackathonPerformance: Math.floor(Math.random() * 50) + 40,
        internshipQuality: Math.floor(Math.random() * 40) + 50
      },
      trustLastUpdated: new Date().toISOString()
    };

    await setDocInBatch(db.collection("students").doc(studentId), studentProfile);
    studentsList.push(studentProfile);

    // Seed trust score history (3 items per student)
    const historyRef = db.collection("students").doc(studentId).collection("trust_history");
    const dates = [
      new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      new Date().toISOString()
    ];
    for (let h = 0; h < 3; h++) {
      const histScore = Math.max(350, Math.min(850, score - (2 - h) * Math.floor(Math.random() * 25)));
      await setDocInBatch(historyRef.doc(`hist-${h}`), {
        score: histScore,
        timestamp: dates[h],
        explanation: h === 0 ? "Initial profile telemetry check." : h === 1 ? "DigiLocker sync completed." : "On-chain credentials verified.",
        factors: studentProfile.trustFactors
      });
    }

    // DigiLocker automatic academic records (Class 10, Class 12) if connected
    if (isConnected) {
      const records = [
        {
          studentId,
          type: "Class 10 Marksheet",
          board: "CBSE",
          percentage: `${85 + Math.floor(Math.random() * 12)}%`,
          score: `${85 + Math.floor(Math.random() * 12)}%`,
          year: (startYear - 2).toString(),
          verified: true,
          verifiedBy: "DigiLocker",
          source: "DigiLocker"
        },
        {
          studentId,
          type: "Class 12 Marksheet",
          board: "CBSE",
          percentage: `${82 + Math.floor(Math.random() * 15)}%`,
          score: `${82 + Math.floor(Math.random() * 15)}%`,
          year: startYear.toString(),
          verified: true,
          verifiedBy: "DigiLocker",
          source: "DigiLocker"
        }
      ];
      for (let r = 0; r < records.length; r++) {
        await setDocInBatch(db.collection("academic_records").doc(`${studentId}_rec_${r}`), records[r]);
      }
    }
  }

  // Flush batches to make sure all students & history are loaded before starting credentials
  await flushBatch();

  // --- 3. GENERATE ACHIEVEMENTS/EXPERIENCE ---
  // Generate 200 Projects, 80 Research Papers, 150 Internships, 300 Certifications
  console.log("Generating Student Achievements (Projects, Research Papers, Internships, Certifications)...");
  
  // 200 Projects
  for (let i = 0; i < 200; i++) {
    const student = pickRandom(studentsList);
    const title = `${pickRandom(PROJECT_TITLES)} Web App`;
    const data = {
      studentId: student.id,
      title,
      category: "Project",
      issuer: student.institution,
      impact: "Designed and built an open-source tool, gaining wide adoption.",
      date: `2024-${String(Math.floor(Math.random() * 11) + 1).padStart(2, "0")}-12`,
      verified: Math.random() > 0.4,
      proofUrl: "https://github.com/demo/project",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await setDocInBatch(db.collection("achievements").doc(`ach-proj-${i + 1}`), data);
  }

  // 80 Research Papers
  for (let i = 0; i < 80; i++) {
    const student = pickRandom(studentsList);
    const title = pickRandom(RESEARCH_TITLES);
    const data = {
      studentId: student.id,
      title,
      category: "Research",
      issuer: student.institution,
      impact: "Published in IEEE National Conference on Intelligent Systems.",
      date: `2025-${String(Math.floor(Math.random() * 11) + 1).padStart(2, "0")}-05`,
      verified: Math.random() > 0.3,
      proofUrl: "https://cloudinary.com/demo/research-paper.pdf",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await setDocInBatch(db.collection("achievements").doc(`ach-research-${i + 1}`), data);
  }

  // 150 Internships
  for (let i = 0; i < 150; i++) {
    const student = pickRandom(studentsList);
    const company = pickRandom(COMPANIES);
    const data = {
      studentId: student.id,
      title: "Software Engineering Intern",
      category: "Internship",
      issuer: company.name,
      impact: "Developed backend API services, optimizing database latency by 20%.",
      date: `2025-${String(Math.floor(Math.random() * 6) + 5).padStart(2, "0")}-30`,
      verified: Math.random() > 0.2, // 80% verified
      proofUrl: "https://cloudinary.com/demo/intern-certificate.pdf",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await setDocInBatch(db.collection("achievements").doc(`ach-intern-${i + 1}`), data);
  }

  // 300 Certifications
  for (let i = 0; i < 300; i++) {
    const student = pickRandom(studentsList);
    const issuer = pickRandom(["AWS", "Google Cloud", "Microsoft", "MongoDB", "RedHat"]);
    const title = `${issuer} Certified Cloud Architect`;
    const data = {
      studentId: student.id,
      title,
      category: "Certification",
      issuer,
      impact: "Gained core validation in distributed cloud architectures.",
      date: `2025-11-${String(Math.floor(Math.random() * 25) + 1).padStart(2, "0")}`,
      verified: Math.random() > 0.3,
      proofUrl: "https://cloudinary.com/demo/cert.pdf",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await setDocInBatch(db.collection("achievements").doc(`ach-cert-${i + 1}`), data);
  }

  await flushBatch();

  // --- 4. GENERATE 1200 CREDENTIALS & 50 FAKE CREDENTIALS ---
  console.log("Generating 1200 Connected W3C Cryptographic Credentials...");
  
  // Total target: 1200 valid + 50 fake/fraud = 1250 total credentials
  // Distribute credentials across students
  const validCount = 1200;
  const fakeCount = 50;
  
  const universityIssuers = issuersMap.filter(x => x.type === "university");
  const companyIssuers = issuersMap.filter(x => x.type === "company");
  const hackathonIssuers = issuersMap.filter(x => x.type === "hackathon");

  // Valid credentials generation
  for (let i = 1; i <= validCount; i++) {
    const student = pickRandom(studentsList);
    
    // Pick a random issuer and matching type
    const issuerTypeSelect = pickRandom(["university", "company", "hackathon"]);
    let issuer = null;
    let title = "";
    let description = "";
    let credentialType = "";

    if (issuerTypeSelect === "university") {
      issuer = pickRandom(universityIssuers);
      title = `${student.degree} Graduation Degree Certificate`;
      description = `Having completed the prescribed course of study in ${student.major} and passed the examinations.`;
      credentialType = "degree";
    } else if (issuerTypeSelect === "company") {
      issuer = pickRandom(companyIssuers);
      title = "Software Engineering Experience Reference";
      description = "Successfully worked on microservice integrations, web UI refactoring, and automated pipeline builds.";
      credentialType = "internship";
    } else {
      issuer = pickRandom(hackathonIssuers);
      title = `${issuer.name} Finisher Badge`;
      description = "Built and presented a working software prototype during the intensive tech sprints.";
      credentialType = "achievement";
    }

    const issueDate = `2024-${String(Math.floor(Math.random() * 8) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 25) + 1).padStart(2, "0")}`;
    const id = `cred-uuid-valid-${i}`;
    const digitalSignature = makeDigitalSignature();
    const blockchainHash = makeTransactionHash();

    const cred = {
      id,
      issuerId: issuer.id,
      issuerName: issuer.name,
      issuerType: issuerTypeSelect,
      studentName: student.name,
      studentEmail: student.email,
      studentId: student.id,
      title,
      description,
      credentialType,
      issueDate,
      expiryDate: "Never",
      verificationStatus: "issued",
      digitalSignature,
      blockchainHash,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=http://localhost:3000/verify/${id}`,
      blockchain: {
        chainId: 84532, // Base Sepolia ChainId
        contractAddress: "0xe7a5d3f2b8f88cf5d506ab1a87e502cfaee88732",
        transactionHash: blockchainHash,
        blockNumber: 1200000 + i,
        issuerWallet: issuer.wallet,
        verificationStatus: "verified",
        anchoredAt: new Date(new Date(issueDate).getTime() + 60000).toISOString() // 1 minute after issuance
      },
      auditTrail: [
        {
          status: "issued",
          timestamp: new Date(issueDate).toISOString(),
          transactionHash: blockchainHash,
          details: `Credential created and anchored by ${issuer.name} on Base Sepolia.`
        }
      ],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await setDocInBatch(db.collection("credentials").doc(id), cred);
  }

  // --- 5. GENERATE 50 FAKE CREDENTIALS ---
  console.log("Generating 50 Fake/Fraudulent Credentials...");
  
  // We distribute these 50 fake credentials specifically to students 80 to 99,
  // making them appear highly suspicious on recruiter dashboards.
  const badStudents = studentsList.slice(79, 99);

  for (let i = 1; i <= fakeCount; i++) {
    const student = pickRandom(badStudents);
    const issuerTypeSelect = pickRandom(["university", "company"]);
    let issuer = null;
    let title = "";
    let description = "";
    let credentialType = "";

    if (issuerTypeSelect === "university") {
      issuer = pickRandom(universityIssuers);
      title = `${student.degree} Degree Certificate (Manipulated)`;
      description = `Degree course completion in ${student.major}.`;
      credentialType = "degree";
    } else {
      issuer = pickRandom(companyIssuers);
      title = "Experience Certificate (Revoked)";
      description = "Internship experience in software development.";
      credentialType = "internship";
    }

    const issueDate = `2023-04-12`;
    const id = `cred-uuid-fraud-${i}`;
    
    // Types of Fraud:
    // 1-20: Revoked Status
    // 21-35: Expired Certificate
    // 36-50: Signature Mismatch Anomaly
    let verificationStatus = "issued";
    let expiryDate = "Never";
    let digitalSignature = makeDigitalSignature();
    let blockchainHash = makeTransactionHash();
    let revocationReason = "";
    let auditTrailDetails = "";

    if (i <= 20) {
      verificationStatus = "revoked";
      revocationReason = "Credential revoked: Signature mismatch and plagiarism flagged.";
      auditTrailDetails = `Credential revoked by ${issuer.name} due to verification audit failure.`;
    } else if (i <= 35) {
      expiryDate = "2024-12-31"; // Expired in the past
      auditTrailDetails = `Credential expired on ${expiryDate}.`;
    } else {
      // Signature mismatch: Set signature to a dummy broken key
      digitalSignature = "0xdeadbeef_mismatched_sig_verification_will_fail_17820000000000000000";
      auditTrailDetails = `Warning: signature mismatch detected during ledger trace.`;
    }

    const cred = {
      id,
      issuerId: issuer.id,
      issuerName: issuer.name,
      issuerType: issuerTypeSelect,
      studentName: student.name,
      studentEmail: student.email,
      studentId: student.id,
      title,
      description,
      credentialType,
      issueDate,
      expiryDate,
      verificationStatus,
      digitalSignature,
      blockchainHash,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=http://localhost:3000/verify/${id}`,
      blockchain: {
        chainId: 84532,
        contractAddress: "0xe7a5d3f2b8f88cf5d506ab1a87e502cfaee88732",
        transactionHash: blockchainHash,
        blockNumber: 1100000 + i,
        issuerWallet: issuer.wallet,
        verificationStatus: verificationStatus === "revoked" ? "revoked" : "verified",
        anchoredAt: new Date(new Date(issueDate).getTime() + 60000).toISOString()
      },
      auditTrail: [
        {
          status: "issued",
          timestamp: new Date(issueDate).toISOString(),
          transactionHash: blockchainHash,
          details: `Credential created and anchored by ${issuer.name} on Base Sepolia.`
        }
      ],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (verificationStatus === "revoked") {
      cred.revocationReason = revocationReason;
      cred.revokedAt = new Date().toISOString();
      cred.auditTrail.push({
        status: "revoked",
        timestamp: new Date().toISOString(),
        transactionHash: makeTransactionHash(),
        details: auditTrailDetails
      });
      
      // Update bad student's trust score downward due to fraudulent activity
      student.trustScore = Math.max(350, student.trustScore - 120);
      student.trustFactors.fraudProbability = Math.max(10, student.trustFactors.fraudProbability - 45);
      student.trustFactors.issuerReputation = Math.max(10, student.trustFactors.issuerReputation - 20);
    } else if (i > 35) {
      // signature mismatch decreases trust score heavily
      student.trustScore = Math.max(350, student.trustScore - 90);
      student.trustFactors.verificationConfidence = Math.max(10, student.trustFactors.verificationConfidence - 40);
      student.trustFactors.fraudProbability = Math.max(10, student.trustFactors.fraudProbability - 35);
    }

    // Save changes to student score in batch
    await setDocInBatch(db.collection("students").doc(student.id), student);
    await setDocInBatch(db.collection("credentials").doc(id), cred);
  }

  await flushBatch();

  console.log("Database successfully seeded!");
  console.log(`Summary of Seeding:`);
  console.log(`- Issuers: ${issuersMap.length}`);
  console.log(`- Students: 100`);
  console.log(`- Academic Records: Connected for DigiLocker users`);
  console.log(`- Achievements: Projects, Research, Internships, Certifications`);
  console.log(`- Valid W3C Credentials: ${validCount}`);
  console.log(`- Fraudulent W3C Credentials: ${fakeCount}`);
  console.log("Everything successfully interconnected!");
}

// Execute Seeding
seed()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error during seeding process:", err);
    process.exit(1);
  });
