import { fakerEN_IN as faker } from "@faker-js/faker";
import { 
  UniversityConfig, 
  CompanyConfig, 
  StudentPersona, 
  StudentProfile, 
  ProjectRecord, 
  AchievementRecord, 
  VerifiableCredential, 
  RecruiterProfile, 
  OpportunityRecord, 
  FraudReport 
} from "./types";
import { calculateMetadataHashServer } from "../../src/lib/normalization";

// Setup seeded Faker
export function setSeed(seed: number) {
  faker.seed(seed);
}

// Generates a mock Ethereum address
export function makeEthereumAddress(): string {
  const chars = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i++) {
    addr += chars[Math.floor(faker.number.float() * 16)];
  }
  return addr;
}

// Generates a mock signature
export function makeDigitalSignature(): string {
  const chars = "0123456789abcdef";
  let sig = "0x";
  for (let i = 0; i < 130; i++) {
    sig += chars[Math.floor(faker.number.float() * 16)];
  }
  return sig;
}

// Generates a mock blockchain transaction hash
export function makeTransactionHash(): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(faker.number.float() * 16)];
  }
  return hash;
}

// Static Master Configs (Modular structure - easy to expand)
export const UNIVERSITIES: Omit<UniversityConfig, "wallet" | "logo" | "reputation" | "placementRate" | "accreditation" | "domain">[] = [
  { id: "uni-iitb", name: "Indian Institute of Technology Bombay", shortName: "IIT Bombay" },
  { id: "uni-iitd", name: "Indian Institute of Technology Delhi", shortName: "IIT Delhi" },
  { id: "uni-iitkgp", name: "Indian Institute of Technology Kharagpur", shortName: "IIT Kharagpur" },
  { id: "uni-iitm", name: "Indian Institute of Technology Madras", shortName: "IIT Madras" },
  { id: "uni-iitk", name: "Indian Institute of Technology Kanpur", shortName: "IIT Kanpur" },
  { id: "uni-iitr", name: "Indian Institute of Technology Roorkee", shortName: "IIT Roorkee" },
  { id: "uni-iitg", name: "Indian Institute of Technology Guwahati", shortName: "IIT Guwahati" },
  { id: "uni-iitbhu", name: "Indian Institute of Technology BHU", shortName: "IIT BHU" },
  { id: "uni-nitt", name: "National Institute of Technology Trichy", shortName: "NIT Trichy" },
  { id: "uni-nits", name: "National Institute of Technology Surathkal", shortName: "NIT Surathkal" },
  { id: "uni-nitr", name: "National Institute of Technology Rourkela", shortName: "NIT Rourkela" },
  { id: "uni-nitw", name: "National Institute of Technology Warangal", shortName: "NIT Warangal" },
  { id: "uni-iiith", name: "International Institute of Information Technology Hyderabad", shortName: "IIIT Hyderabad" },
  { id: "uni-iiitb", name: "International Institute of Information Technology Bangalore", shortName: "IIIT Bangalore" },
  { id: "uni-bits", name: "Birla Institute of Technology and Science, Pilani", shortName: "BITS Pilani" },
  { id: "uni-vit", name: "Vellore Institute of Technology", shortName: "VIT" },
  { id: "uni-srm", name: "SRM Institute of Science and Technology", shortName: "SRM" },
  { id: "uni-dtu", name: "Delhi Technological University", shortName: "DTU" },
  { id: "uni-nsut", name: "Netaji Subhas University of Technology", shortName: "NSUT" },
  { id: "uni-srmcem", name: "Sri Ramswaroop Memorial College of Engineering and Management", shortName: "SRMCEM" },
  { id: "uni-iisc", name: "Indian Institute of Science Bangalore", shortName: "IISc Bangalore" },
  { id: "uni-anna", name: "Anna University, Chennai", shortName: "Anna University" },
  { id: "uni-jadavpur", name: "Jadavpur University, Kolkata", shortName: "Jadavpur University" },
  { id: "uni-mumbai", name: "Mumbai University", shortName: "Mumbai University" },
  { id: "uni-delhi", name: "Delhi University", shortName: "Delhi University" },
  { id: "uni-bhu", name: "Banaras Hindu University", shortName: "BHU" },
  { id: "uni-pune", name: "Savitribai Phule Pune University", shortName: "Pune University" },
  { id: "uni-calcutta", name: "Calcutta University", shortName: "Calcutta University" },
  { id: "uni-panjab", name: "Panjab University", shortName: "Panjab University" },
  { id: "uni-manipal", name: "Manipal Institute of Technology", shortName: "Manipal" }
];

export const COMPANIES: Omit<CompanyConfig, "logo" | "reputation" | "hiringRoles" | "internships" | "hiringCriteria">[] = [
  { id: "co-google", name: "Google India", shortName: "Google", domain: "google.com" },
  { id: "co-msft", name: "Microsoft India", shortName: "Microsoft", domain: "microsoft.com" },
  { id: "co-amzn", name: "Amazon India", shortName: "Amazon", domain: "amazon.in" },
  { id: "co-adobe", name: "Adobe India", shortName: "Adobe", domain: "adobe.com" },
  { id: "co-atlassian", name: "Atlassian India", shortName: "Atlassian", domain: "atlassian.com" },
  { id: "co-flipkart", name: "Flipkart", shortName: "Flipkart", domain: "flipkart.com" },
  { id: "co-phonepe", name: "PhonePe", shortName: "PhonePe", domain: "phonepe.com" },
  { id: "co-razorpay", name: "Razorpay", shortName: "Razorpay", domain: "razorpay.com" },
  { id: "co-paytm", name: "Paytm", shortName: "Paytm", domain: "paytm.com" },
  { id: "co-swiggy", name: "Swiggy", shortName: "Swiggy", domain: "swiggy.in" },
  { id: "co-zomato", name: "Zomato", shortName: "Zomato", domain: "zomato.com" },
  { id: "co-ola", name: "Ola Cabs", shortName: "Ola", domain: "olacabs.com" },
  { id: "co-cred", name: "Cred", shortName: "Cred", domain: "cred.club" },
  { id: "co-infosys", name: "Infosys", shortName: "Infosys", domain: "infosys.com" },
  { id: "co-tcs", name: "Tata Consultancy Services", shortName: "TCS", domain: "tcs.com" },
  { id: "co-wipro", name: "Wipro", shortName: "Wipro", domain: "wipro.com" },
  { id: "co-accenture", name: "Accenture", shortName: "Accenture", domain: "accenture.com" },
  { id: "co-cognizant", name: "Cognizant", shortName: "Cognizant", domain: "cognizant.com" },
  { id: "co-hcl", name: "HCL Technologies", shortName: "HCL", domain: "hcltech.com" },
  { id: "co-techm", name: "Tech Mahindra", shortName: "TechM", domain: "techmahindra.com" },
  { id: "co-lnt", name: "L&T Infotech", shortName: "LTI", domain: "lntinfotech.com" },
  { id: "co-capgemini", name: "Capgemini", shortName: "Capgemini", domain: "capgemini.com" },
  { id: "co-ibm", name: "IBM India", shortName: "IBM", domain: "ibm.com" },
  { id: "co-oracle", name: "Oracle India", shortName: "Oracle", domain: "oracle.com" },
  { id: "co-salesforce", name: "Salesforce India", shortName: "Salesforce", domain: "salesforce.com" },
  { id: "co-servicenow", name: "ServiceNow India", shortName: "ServiceNow", domain: "servicenow.com" },
  { id: "co-netflix", name: "Netflix India", shortName: "Netflix", domain: "netflix.com" },
  { id: "co-uber", name: "Uber India", shortName: "Uber", domain: "uber.com" },
  { id: "co-meta", name: "Meta India", shortName: "Meta", domain: "meta.com" },
  { id: "co-apple", name: "Apple India", shortName: "Apple", domain: "apple.com" },
  { id: "co-nvidia", name: "NVIDIA India", shortName: "NVIDIA", domain: "nvidia.com" },
  { id: "co-intel", name: "Intel India", shortName: "Intel", domain: "intel.com" },
  { id: "co-amd", name: "AMD India", shortName: "AMD", domain: "amd.com" },
  { id: "co-cisco", name: "Cisco India", shortName: "Cisco", domain: "cisco.com" },
  { id: "co-qualcomm", name: "Qualcomm India", shortName: "Qualcomm", domain: "qualcomm.com" },
  { id: "co-stripe", name: "Stripe India", shortName: "Stripe", domain: "stripe.com" },
  { id: "co-coinbase", name: "Coinbase India", shortName: "Coinbase", domain: "coinbase.com" },
  { id: "co-polygon", name: "Polygon Labs", shortName: "Polygon", domain: "polygon.technology" },
  { id: "co-binance", name: "Binance India", shortName: "Binance", domain: "binance.com" },
  { id: "co-ethereum", name: "Ethereum Foundation India", shortName: "EF", domain: "ethereum.org" },
  { id: "co-deloitte", name: "Deloitte India", shortName: "Deloitte", domain: "deloitte.com" },
  { id: "co-ey", name: "EY India", shortName: "EY", domain: "ey.com" },
  { id: "co-pwc", name: "PwC India", shortName: "PwC", domain: "pwc.in" },
  { id: "co-kpmg", name: "KPMG India", shortName: "KPMG", domain: "kpmg.com" },
  { id: "co-mckinsey", name: "McKinsey India", shortName: "McKinsey", domain: "mckinsey.com" },
  { id: "co-bcg", name: "BCG India", shortName: "BCG", domain: "bcg.com" },
  { id: "co-bain", name: "Bain & Company India", shortName: "Bain", domain: "bain.com" },
  { id: "co-jpmc", name: "JPMorgan Chase India", shortName: "JPMC", domain: "jpmorganchase.com" },
  { id: "co-goldman", name: "Goldman Sachs India", shortName: "Goldman", domain: "goldmansachs.com" },
  { id: "co-morgan", name: "Morgan Stanley India", shortName: "Morgan Stanley", domain: "morganstanley.com" }
];

export const PERSONAS: StudentPersona[] = [
  {
    name: "Tier 1 AI Research Student",
    skills: ["Python", "Machine Learning", "PyTorch", "TensorFlow", "Algorithms", "Research", "C++", "SQL"],
    interests: ["AI/ML", "Research", "Deep Learning"],
    trustScoreRange: [780, 850],
    cgpaRange: [9.2, 10.0],
    projectDifficulty: "Hard",
    researchPaperCount: 2,
    internshipCount: 1,
    certificationCount: 1,
    projectCount: 3,
    techKeywords: ["Neural Networks", "Transformer Models", "RLHF", "NLP", "CUDA"]
  },
  {
    name: "Tier 1 Software Engineer",
    skills: ["Java", "C++", "Python", "Algorithms", "Data Structures", "System Design", "SQL", "Docker"],
    interests: ["Software Engineering", "Algorithms", "Data Structures"],
    trustScoreRange: [750, 830],
    cgpaRange: [8.5, 9.5],
    projectDifficulty: "Hard",
    researchPaperCount: 0,
    internshipCount: 2,
    certificationCount: 1,
    projectCount: 3,
    techKeywords: ["Distributed Systems", "RPC", "Concurrency", "Indexing", "Optimizers"]
  },
  {
    name: "Tier 2 Full Stack Developer",
    skills: ["React", "Next.js", "Node.js", "Express", "TypeScript", "SQL", "Docker", "Tailwind CSS"],
    interests: ["Full-Stack Development", "Web Development", "UI/UX"],
    trustScoreRange: [650, 750],
    cgpaRange: [7.5, 8.8],
    projectDifficulty: "Medium",
    researchPaperCount: 0,
    internshipCount: 1,
    certificationCount: 2,
    projectCount: 4,
    techKeywords: ["Web Sockets", "Redis Cache", "Authentication", "Tailwind UI", "GraphQL"]
  },
  {
    name: "Cyber Security Specialist",
    skills: ["Python", "Linux", "Penetration Testing", "Cryptography", "Docker", "OWASP", "Rust", "Networks"],
    interests: ["Cybersecurity", "Security", "Cryptography"],
    trustScoreRange: [680, 760],
    cgpaRange: [7.2, 8.5],
    projectDifficulty: "Medium",
    researchPaperCount: 0,
    internshipCount: 1,
    certificationCount: 2,
    projectCount: 3,
    techKeywords: ["Vulnerability Scan", "Firewall Rules", "Zero Trust", "OAuth2", "Encryption"]
  },
  {
    name: "Open Source Contributor",
    skills: ["Git", "Rust", "Python", "Go", "Docker", "Kubernetes", "C++", "TypeScript"],
    interests: ["Open Source", "Linux", "Cloud Computing"],
    trustScoreRange: [700, 800],
    cgpaRange: [7.0, 8.5],
    projectDifficulty: "Hard",
    researchPaperCount: 0,
    internshipCount: 1,
    certificationCount: 1,
    projectCount: 4,
    techKeywords: ["CLI Tools", "Pull Requests", "Compiler Flags", "Kubernetes Operator", "WebAssembly"]
  },
  {
    name: "Research Oriented Student",
    skills: ["Mathematics", "Python", "R", "LaTeX", "Algorithms", "Data Analysis", "SQL"],
    interests: ["Research", "Mathematics", "Data Science"],
    trustScoreRange: [760, 840],
    cgpaRange: [9.0, 10.0],
    projectDifficulty: "Medium",
    researchPaperCount: 3,
    internshipCount: 1,
    certificationCount: 1,
    projectCount: 2,
    techKeywords: ["Statistical Modeling", "Stochastic Analysis", "Data Visualization", "Jupyter", "Matrix Factorization"]
  },
  {
    name: "Hackathon Enthusiast",
    skills: ["React", "Node.js", "Python", "Flask", "Solidity", "Figma", "APIs", "TypeScript"],
    interests: ["Hackathons", "Web3", "UI/UX"],
    trustScoreRange: [660, 740],
    cgpaRange: [7.0, 8.2],
    projectDifficulty: "Medium",
    researchPaperCount: 0,
    internshipCount: 1,
    certificationCount: 1,
    projectCount: 5,
    techKeywords: ["MVP Dashboard", "OAuth Integrations", "Smart Contracts", "Figma Design", "Realtime Map"]
  },
  {
    name: "Startup Founder",
    skills: ["React", "Node.js", "SQL", "Git", "Figma", "APIs", "Tailwind CSS"],
    interests: ["Startups", "UI/UX", "Full-Stack Development"],
    trustScoreRange: [640, 720],
    cgpaRange: [6.8, 8.0],
    projectDifficulty: "Medium",
    researchPaperCount: 0,
    internshipCount: 1,
    certificationCount: 1,
    projectCount: 4,
    techKeywords: ["Stripe Checkout", "Firebase Telemetry", "User Onboarding", "CRM Integration", "Landing Page"]
  },
  {
    name: "Data Analyst / Data Scientist",
    skills: ["Python", "SQL", "Pandas", "NumPy", "Tableau", "Machine Learning", "R", "Statistics"],
    interests: ["Data Science", "Analytics", "Machine Learning"],
    trustScoreRange: [680, 760],
    cgpaRange: [8.0, 9.0],
    projectDifficulty: "Medium",
    researchPaperCount: 0,
    internshipCount: 1,
    certificationCount: 2,
    projectCount: 3,
    techKeywords: ["ETL Pipelines", "Pandas Aggregations", "Linear Regression", "Tableau Reports", "Feature Engineering"]
  },
  {
    name: "Web3 / Blockchain Developer",
    skills: ["Solidity", "Rust", "Ethereum", "Smart Contracts", "TypeScript", "React", "Cryptography", "SQL"],
    interests: ["Blockchain", "Web3", "Cryptography"],
    trustScoreRange: [700, 790],
    cgpaRange: [7.5, 8.8],
    projectDifficulty: "Hard",
    researchPaperCount: 0,
    internshipCount: 1,
    certificationCount: 1,
    projectCount: 3,
    techKeywords: ["ERC20 Token", "Hardhat Scripts", "Ethers.js", "IPFS Storage", "DAO Governance"]
  }
];

export const HACKATHONS = [
  "Smart India Hackathon",
  "ETHGlobal Bangalore",
  "AngelHack India",
  "Devfolio BuildFest",
  "MLH India Genesis",
  "GDSC Hackfest",
  "Imagine Cup National Finals",
  "Kaggle Data Summit Hack",
  "Mumbai Web3 Summit",
  "IISc Quantum Hackathon",
  "Techfest IIT Bombay Hack",
  "Shaastra IIT Madras Hack"
];

// -------------------------------------------------------------
// CORE DATA FACTORY CLASS
// -------------------------------------------------------------
export class DataFactory {
  private seed: number;
  private emailsSet = new Set<string>();
  private uuidsSet = new Set<string>();

  constructor(seed = 12345) {
    this.seed = seed;
    faker.seed(seed);
  }

  // Generates or checks uniqueness of email
  private getUniqueEmail(prefix: string, domain: string): string {
    let email = `${prefix}@${domain}`;
    let counter = 1;
    while (this.emailsSet.has(email)) {
      email = `${prefix}${counter}@${domain}`;
      counter++;
    }
    this.emailsSet.add(email);
    return email;
  }

  // Generates or checks uniqueness of UUID
  private getUniqueUUID(prefix: string): string {
    let uuid = `${prefix}-${faker.string.uuid()}`;
    while (this.uuidsSet.has(uuid)) {
      uuid = `${prefix}-${faker.string.uuid()}`;
    }
    this.uuidsSet.add(uuid);
    return uuid;
  }

  // Clear tracking sets (useful when regenerating individual records)
  public clearTracking() {
    this.emailsSet.clear();
    this.uuidsSet.clear();
  }

  public removeTrackingEmail(email: string) {
    this.emailsSet.delete(email);
  }

  public removeTrackingUUID(uuid: string) {
    this.uuidsSet.delete(uuid);
  }

  // --- 1. BUILD UNIVERSITIES ---
  public generateUniversities(): UniversityConfig[] {
    return UNIVERSITIES.map((u, index) => {
      const reputation = 60 + Math.floor((30 - index) * 1.3); // Rank based rep 60-99
      const placementRate = 70 + Math.floor((30 - index) * 0.9); // Rank based placement 70-97
      const accreditation = reputation > 85 ? "NAAC A++ (IoE)" : reputation > 75 ? "NAAC A+ (NBA)" : "NAAC A";
      const shortLower = u.shortName.toLowerCase().replace(/\s+/g, "");
      const domain = `${shortLower}.edu.in`;
      return {
        ...u,
        logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.shortName)}&background=1e1b4b&color=a5b4fc&bold=true`,
        reputation,
        placementRate,
        accreditation,
        domain
      };
    });
  }

  // --- 2. BUILD COMPANIES ---
  public generateCompanies(): CompanyConfig[] {
    return COMPANIES.map((c, index) => {
      const reputation = 55 + Math.floor((50 - index) * 0.88); // 55-99
      // Build company specific hiring criteria
      const minCGPA = reputation > 85 ? 8.2 : reputation > 70 ? 7.5 : 6.5;
      const minTrustScore = reputation > 85 ? 730 : reputation > 70 ? 650 : 550;
      
      const hiringRoles = [
        "Software Engineer", "Systems Architect", "Frontend Developer",
        "Backend Developer", "DevOps Engineer", "Machine Learning Engineer",
        "Security Architect", "Data Scientist", "Full-Stack Dev", "Product Manager"
      ];
      
      const preferredSkills = faker.helpers.shuffle([
        "Python", "Java", "React", "Node.js", "Docker", "Algorithms",
        "System Design", "TypeScript", "SQL", "Solidity", "Kubernetes"
      ]).slice(0, 3);

      return {
        ...c,
        logo: `https://logo.clearbit.com/${c.domain}`,
        reputation,
        hiringRoles: faker.helpers.shuffle(hiringRoles).slice(0, 4),
        internships: ["SWE Intern", "Product Intern", "Security Intern", "Data Intern"],
        hiringCriteria: {
          minCGPA,
          minTrustScore,
          preferredSkills
        }
      };
    });
  }

  private createVerifiableCredential(params: {
    id: string;
    issuerId: string;
    issuerName: string;
    issuerType: "university" | "company";
    studentName: string;
    studentEmail: string;
    studentId: string;
    title: string;
    description: string;
    credentialType: "degree" | "diploma" | "experience" | "internship" | "achievement" | "certification" | "badge";
    issueDate: string;
    expiryDate: string;
    blockNumber: number;
    issuerWallet: string;
    anchoredAt: string;
  }): VerifiableCredential {
    const normalizationPayload = {
      studentName: params.studentName,
      studentEmail: params.studentEmail.toLowerCase(),
      issuerId: params.issuerId,
      issuerName: params.issuerName,
      title: params.title,
      credentialType: params.credentialType,
      issueDate: params.issueDate,
      expiryDate: params.expiryDate
    };
    
    const metaHash = calculateMetadataHashServer(normalizationPayload);
    const signature = `mock_jws_sig_${metaHash}`;

    // Build the W3C VC body
    const w3cCredential: any = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://schema.org"
      ],
      "id": `urn:uuid:${params.id}`,
      "type": ["VerifiableCredential", `${params.credentialType.charAt(0).toUpperCase() + params.credentialType.slice(1)}Credential`],
      "issuer": {
        "id": `did:ascendid:${params.issuerId}`,
        "name": params.issuerName,
        "walletAddress": params.issuerWallet,
        "type": params.issuerType
      },
      "issuanceDate": new Date(params.issueDate).toISOString(),
      "expirationDate": params.expiryDate === "Never" ? "Never" : new Date(params.expiryDate).toISOString(),
      "credentialSubject": {
        "id": params.studentId ? `did:ascendid:${params.studentId}` : `mailto:${params.studentEmail.toLowerCase()}`,
        "name": params.studentName,
        "email": params.studentEmail.toLowerCase(),
        "achievement": {
          "title": params.title,
          "description": params.description,
          "type": params.credentialType
        }
      },
      "proof": {
        "type": "JsonWebSignature2020",
        "created": new Date().toISOString(),
        "proofPurpose": "assertionMethod",
        "verificationMethod": `did:ascendid:${params.issuerId}#key-1`,
        "jws": signature
      }
    };

    return {
      id: params.id,
      studentName: params.studentName,
      studentEmail: params.studentEmail.toLowerCase(),
      studentId: params.studentId,
      issuerId: params.issuerId,
      issuerName: params.issuerName,
      issuerType: params.issuerType,
      title: params.title,
      description: params.description,
      credentialType: params.credentialType,
      issueDate: params.issueDate,
      expiryDate: params.expiryDate,
      verificationStatus: "issued",
      digitalSignature: signature,
      blockchainHash: metaHash,
      metadataHash: metaHash,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=http://localhost:3000/verify/${params.id}`,
      w3cData: w3cCredential,
      blockchain: {
        chainId: 84532,
        contractAddress: "0xe7a5d3f2b8f88cf5d506ab1a87e502cfaee88732",
        transactionHash: metaHash,
        blockNumber: params.blockNumber,
        issuerWallet: params.issuerWallet,
        verificationStatus: "anchored",
        anchoredAt: params.anchoredAt
      },
      auditTrail: [
        {
          status: "issued",
          timestamp: new Date(params.issueDate).toISOString(),
          transactionHash: metaHash,
          details: `Credential hash ${metaHash} anchored to registry by issuer wallet ${params.issuerWallet}.`
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  public writeMockBlockchainState(credentials: VerifiableCredential[]) {
    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(process.cwd(), "src", "lib", "mock_blockchain_state.json");
    
    let state: Record<string, any> = {};
    if (fs.existsSync(filePath)) {
      try {
        state = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } catch (e) {
        state = {};
      }
    }

    credentials.forEach(c => {
      state[c.id] = {
        hash: c.blockchainHash,
        isRevoked: c.verificationStatus === "revoked",
        revocationReason: c.revocationReason || "",
        issuerWallet: c.blockchain?.issuerWallet || "0x0000000000000000000000000000000000000000",
        blockTimestamp: Math.floor(new Date(c.blockchain?.anchoredAt || c.issueDate).getTime() / 1000)
      };
    });

    fs.writeFileSync(filePath, JSON.stringify(state, null, 2), "utf-8");
    console.log(`[Mock Blockchain] Anchored ${credentials.length} credentials in mock ledger file.`);
  }

  // --- 3. GENERATE CAREER TIMELINES & PROFILE FOR INDIVIDUAL STUDENT ---
  // Implements step 3, 4, 5, 9 (generates single logical profile to support self-healing regeneration)
  public generateStudentProfile(
    index: number,
    universities: UniversityConfig[],
    companies: CompanyConfig[]
  ): {
    student: StudentProfile;
    projects: ProjectRecord[];
    achievements: AchievementRecord[];
    credentials: VerifiableCredential[];
  } {
    const studentId = `student-${index}`;
    const persona = faker.helpers.arrayElement(PERSONAS);
    
    const gender = faker.helpers.arrayElement(["male", "female"]) as "male" | "female";
    const firstName = gender === "male" 
      ? faker.person.firstName("male") 
      : faker.person.firstName("female");
    const lastName = faker.person.lastName();
    const fullName = `${firstName} ${lastName}`;

    const university = faker.helpers.arrayElement(universities);
    const emailPrefix = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
    const email = this.getUniqueEmail(emailPrefix, university.domain);
    const phone = `+91 ${faker.string.numeric(10)}`;

    const degree = faker.helpers.arrayElement(["B.Tech", "B.E.", "M.Tech", "MCA"]);
    const major = faker.helpers.arrayElement([
      "Computer Science & Engineering", 
      "Information Technology", 
      "Electronics & Communication Engineering",
      "Artificial Intelligence & Machine Learning"
    ]);

    const startYear = faker.helpers.arrayElement([2021, 2022, 2023]);
    const gradYear = (startYear + (degree.startsWith("M") || degree === "MCA" ? 2 : 4)).toString();
    // compute current semester based on current local year 2026
    const yearsElapsed = 2026 - startYear;
    const currentSemester = Math.max(1, Math.min(8, yearsElapsed * 2 + 1));

    const cgpa = Number(faker.number.float({ min: persona.cgpaRange[0], max: persona.cgpaRange[1] }).toFixed(2));
    const location = faker.helpers.arrayElement([
      "Bangalore, India", "Hyderabad, India", "Mumbai, India", "Pune, India", "Chennai, India", "Noida, India", "Remote"
    ]);

    const github = `https://github.com/${firstName.toLowerCase()}-${faker.string.alphanumeric(4)}`;
    const linkedin = `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`;
    const portfolio = `https://${firstName.toLowerCase()}.dev`;

    const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fullName)}`;

    const isDigiLockerConnected = faker.helpers.maybe(() => true, { probability: 0.8 }) || false;
    const profileCompletion = isDigiLockerConnected ? 95 : 65;

    // --- TIMELINE DETERMINISTIC RECORD GENERATION ---
    const projects: ProjectRecord[] = [];
    const achievements: AchievementRecord[] = [];
    const credentials: VerifiableCredential[] = [];

    // Base Career Timeline Years
    const year1 = startYear + 1;
    const year2 = startYear + 2;
    const year3 = startYear + 3;

    // A. Academic records (CBSE Class 10 & 12 Verifiable Credentials via DigiLocker)
    if (isDigiLockerConnected) {
      const class10Id = this.getUniqueUUID("cred-cbse10");
      const c10Cred = this.createVerifiableCredential({
        id: class10Id,
        issuerId: "issuer-cbse",
        issuerName: "Central Board of Secondary Education",
        issuerType: "university",
        studentName: fullName,
        studentEmail: email,
        studentId,
        title: "Class 10 Matriculation Marksheet",
        description: "Certification of secondary academic achievements.",
        credentialType: "degree",
        issueDate: `${startYear - 4}-05-28`,
        expiryDate: "Never",
        blockNumber: 950000 + index,
        issuerWallet: "0x0000000000000000000000000000000000000000",
        anchoredAt: new Date(`${startYear - 4}-05-28T12:00:00Z`).toISOString()
      });
      credentials.push(c10Cred);

      const class12Id = this.getUniqueUUID("cred-cbse12");
      const c12Cred = this.createVerifiableCredential({
        id: class12Id,
        issuerId: "issuer-cbse",
        issuerName: "Central Board of Secondary Education",
        issuerType: "university",
        studentName: fullName,
        studentEmail: email,
        studentId,
        title: "Class 12 Senior Secondary Marksheet",
        description: "Certification of senior secondary school completion.",
        credentialType: "degree",
        issueDate: `${startYear - 2}-05-25`,
        expiryDate: "Never",
        blockNumber: 1050000 + index,
        issuerWallet: "0x0000000000000000000000000000000000000000",
        anchoredAt: new Date(`${startYear - 2}-05-25T12:00:00Z`).toISOString()
      });
      credentials.push(c12Cred);
    }

    // B. Projects (Logically consistent with persona skills)
    for (let p = 0; p < persona.projectCount; p++) {
      const projId = `proj-${studentId}-${p}`;
      const keyword = persona.techKeywords[p % persona.techKeywords.length];
      const title = `${keyword} Engine Core`;
      const description = `Built a robust implementation focusing on ${keyword} processes using standard schemas.`;
      
      const projDate = `${year1 + Math.floor(p/2)}-${String((p*3)%12 + 1).padStart(2, "0")}-15`;
      const skillsUsed = faker.helpers.shuffle(persona.skills).slice(0, 3);

      projects.push({
        id: projId,
        studentId,
        title,
        description,
        difficulty: persona.projectDifficulty,
        skillsUsed,
        githubUrl: `${github}/${title.toLowerCase().replace(/\s+/g, "-")}`,
        completed: true,
        date: projDate
      });

      // 50% of projects are verified as achievements
      if (p % 2 === 0) {
        achievements.push({
          id: `ach-proj-${studentId}-${p}`,
          studentId,
          title,
          category: "Project",
          issuer: university.shortName,
          impact: `Validated by faculty. Project successfully published on ${github}.`,
          date: projDate,
          verified: true,
          proofUrl: `${github}/${title.toLowerCase().replace(/\s+/g, "-")}`,
          createdAt: new Date().toISOString()
        });
      }
    }

    // C. Internships (Logically consistent with persona skills and corporate configurations)
    let verifiedInternshipsCount = 0;
    for (let i = 0; i < persona.internshipCount; i++) {
      const comp = faker.helpers.arrayElement(companies);
      const internDate = `${year2 + i}-08-10`;
      const title = `${persona.skills[0]} Engineering Intern`;
      const data = {
        id: `ach-intern-${studentId}-${i}`,
        studentId,
        title,
        category: "Internship" as const,
        issuer: comp.name,
        impact: `Coordinated microservice operations. Boosted platform latency metrics using ${persona.skills[1]}.`,
        date: internDate,
        verified: true,
        proofUrl: "https://cloudinary.com/ascendid/internship-verify.pdf",
        createdAt: new Date().toISOString()
      };
      achievements.push(data);
      verifiedInternshipsCount++;
      // Create a Verifiable Credential for this Internship
      const credId = this.getUniqueUUID("cred-intern");
      const internCred = this.createVerifiableCredential({
        id: credId,
        issuerId: comp.id,
        issuerName: comp.name,
        issuerType: "company",
        studentName: fullName,
        studentEmail: email,
        studentId,
        title: `${comp.name} Internship Experience Reference`,
        description: `Successfully completed a software engineering internship role in the development group.`,
        credentialType: "internship",
        issueDate: internDate,
        expiryDate: "Never",
        blockNumber: 1300000 + index + i,
        issuerWallet: makeEthereumAddress(),
        anchoredAt: new Date(new Date(internDate).getTime() + 86400 * 1000).toISOString()
      });
      credentials.push(internCred);
    }

    // D. Certifications (Linked to core skills)
    for (let c = 0; c < persona.certificationCount; c++) {
      const provider = faker.helpers.arrayElement(["AWS", "Google Cloud", "RedHat", "MongoDB", "CNCF"]);
      const certTitle = `${provider} Certified ${persona.skills[c % persona.skills.length]} Specialist`;
      const certDate = `${year3}-${String((c * 4) % 12 + 1).padStart(2, "0")}-10`;
      
      achievements.push({
        id: `ach-cert-${studentId}-${c}`,
        studentId,
        title: certTitle,
        category: "Certification",
        issuer: provider,
        impact: `Demonstrated expertise in ${persona.skills[c % persona.skills.length]} configurations.`,
        date: certDate,
        verified: true,
        proofUrl: "https://cloudinary.com/ascendid/certification.pdf",
        createdAt: new Date().toISOString()
      });

      // Create a Verifiable Credential for this Certification
      const credId = this.getUniqueUUID("cred-cert");
      const certCred = this.createVerifiableCredential({
        id: credId,
        issuerId: `issuer-${provider.toLowerCase()}`,
        issuerName: provider,
        issuerType: "company",
        studentName: fullName,
        studentEmail: email,
        studentId,
        title: certTitle,
        description: `Passed all evaluations demonstrating professional capability in standard operations.`,
        credentialType: "achievement",
        issueDate: certDate,
        expiryDate: `${year3 + 3}-12-31`,
        blockNumber: 1400000 + index + c,
        issuerWallet: makeEthereumAddress(),
        anchoredAt: new Date(new Date(certDate).getTime() + 86400 * 1000).toISOString()
      });
      credentials.push(certCred);
    }
    let researchPapersCount = 0;
    for (let r = 0; r < persona.researchPaperCount; r++) {
      const topic = persona.techKeywords[r % persona.techKeywords.length];
      const paperTitle = `An Evaluation of ${topic} Methods in Modern Infrastructures`;
      const paperDate = `${year3}-09-18`;
      
      achievements.push({
        id: `ach-paper-${studentId}-${r}`,
        studentId,
        title: paperTitle,
        category: "Research",
        issuer: university.shortName,
        impact: `Co-authored paper, published in IEEE national tech conference.`,
        date: paperDate,
        verified: true,
        proofUrl: "https://cloudinary.com/ascendid/research.pdf",
        createdAt: new Date().toISOString()
      });
      researchPapersCount++;
    }

    // --- 5. COMPUTE TRUST SCORE DYNAMICALLY FROM EVIDENCE (Step 5 Improvement) ---
    const verifiedAcademicsCount = isDigiLockerConnected ? 2 : 0;
    const verifiedAchievementsCount = achievements.filter(a => a.verified).length;
    
    // Computing breakdown factors based on actual counts
    const factorIssuer = 50 + Math.floor(university.reputation * 0.45); // up to 95
    const factorFreshness = 85 - (2026 - startYear) * 5; // newer is fresher
    const factorImportance = 50 + verifiedAcademicsCount * 15 + verifiedAchievementsCount * 5;
    const factorFraud = 95; // base is safe
    const factorConsistency = 60 + Math.min(35, persona.skills.length * 4);
    const factorGrowth = 50 + (verifiedInternshipsCount * 20);
    const factorPeer = 40 + (projects.length * 10);
    const factorConfidence = isDigiLockerConnected ? 95 : 60;
    const factorOpenSource = persona.interests.includes("Open Source") ? 90 : 50;
    const factorResearch = 40 + (researchPapersCount * 18);
    const factorHackathon = 50 + (persona.interests.includes("Hackathons") ? 35 : 10);
    const factorInternship = 50 + (verifiedInternshipsCount * 22);

    // Sum dynamic weighted scores
    // Weights: Credentials verification (30%), University reputation (20%), Internship quality (20%), Projects (15%), Hackathons/Research (15%)
    const scoreVal = 350 + Math.round(
      (factorConfidence * 0.3) +
      (factorIssuer * 0.2) +
      (factorInternship * 0.2) +
      (factorGrowth * 0.15) +
      (factorResearch * 0.07) +
      (factorHackathon * 0.08)
    ) * 5; // multiplier to stretch range

    const trustScore = Math.max(350, Math.min(850, scoreVal));

    const trustFactors = {
      issuerReputation: factorIssuer,
      credentialFreshness: factorFreshness,
      credentialImportance: factorImportance,
      fraudProbability: factorFraud,
      skillConsistency: factorConsistency,
      experienceGrowth: factorGrowth,
      peerValidation: factorPeer,
      verificationConfidence: factorConfidence,
      openSourceActivity: factorOpenSource,
      researchActivity: factorResearch,
      hackathonPerformance: factorHackathon,
      internshipQuality: factorInternship
    };

    const student: StudentProfile = {
      id: studentId,
      uid: studentId,
      name: fullName,
      email,
      phone,
      gender,
      avatar,
      universityId: university.id,
      universityName: university.name,
      degree,
      major,
      semester: currentSemester,
      cgpa,
      graduationYear: gradYear,
      github,
      linkedin,
      portfolio,
      location,
      skills: persona.skills,
      interests: persona.interests,
      persona: persona.name,
      isDigiLockerConnected,
      profileCompletion,
      trustScore,
      trustFactors,
      trustLastUpdated: new Date().toISOString()
    };

    if (parseInt(gradYear) <= 2026) {
      const degreeId = this.getUniqueUUID("cred-degree");
      const degreeCred = this.createVerifiableCredential({
        id: degreeId,
        issuerId: university.id,
        issuerName: university.name,
        issuerType: "university",
        studentName: fullName,
        studentEmail: email,
        studentId,
        title: `${degree} in ${major}`,
        description: `Having successfully completed the prescribed course of study and passed the examinations has been admitted to the degree of ${degree}.`,
        credentialType: "degree",
        issueDate: `${gradYear}-06-15`,
        expiryDate: "Never",
        blockNumber: 1500000 + index,
        issuerWallet: makeEthereumAddress(),
        anchoredAt: new Date(`${gradYear}-06-15T12:00:00Z`).toISOString()
      });
      credentials.push(degreeCred);
    }

    return {
      student,
      projects,
      achievements,
      credentials
    };
  }

  // --- 4. GENERATE RECRUITERS (Step 6 Improvement) ---
  public generateRecruiters(companies: CompanyConfig[]): RecruiterProfile[] {
    const recruiters: RecruiterProfile[] = [];
    // 300 Recruiters
    for (let r = 1; r <= 300; r++) {
      const comp = companies[r % companies.length];
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const name = `${firstName} ${lastName}`;
      const email = this.getUniqueEmail(`${firstName.toLowerCase()}.${lastName.toLowerCase()}`, comp.domain);
      
      recruiters.push({
        id: `recruiter-${r}`,
        name,
        email,
        companyId: comp.id,
        companyName: comp.name,
        searchHistory: [
          `Skills: ${comp.hiringCriteria.preferredSkills.join(", ")} | Min CGPA: ${comp.hiringCriteria.minCGPA}`,
          `Trust Score > ${comp.hiringCriteria.minTrustScore}`
        ],
        verificationHistory: [
          `cred-uuid-valid-${r * 3}`, `cred-uuid-valid-${r * 7}`
        ],
        savedCandidates: [
          `student-${(r * 2) % 50 + 1}`, `student-${(r * 3) % 50 + 1}`
        ]
      });
    }
    return recruiters;
  }

  // --- 5. GENERATE OPPORTUNITIES matching criteria (Step 6 Improvement) ---
  public generateOpportunities(companies: CompanyConfig[]): OpportunityRecord[] {
    const opportunities: OpportunityRecord[] = [];
    
    // Opportunities target: 250 Jobs, 150 Internships, 50 Fellowships, 100 Hackathons = 550 total
    const totalJobs = 250;
    const totalInterns = 150;
    const totalFellows = 50;
    const totalHacks = 100;

    // Jobs
    for (let j = 1; j <= totalJobs; j++) {
      const comp = companies[j % companies.length];
      const role = comp.hiringRoles[j % comp.hiringRoles.length];
      opportunities.push({
        id: `opp-job-${j}`,
        title: `Associate ${role}`,
        company: comp.name,
        companyId: comp.id,
        type: "Job",
        location: faker.helpers.arrayElement(["Bangalore", "Hyderabad", "Remote"]),
        requiredSkills: comp.hiringCriteria.preferredSkills,
        minCGPA: comp.hiringCriteria.minCGPA,
        minTrustScore: comp.hiringCriteria.minTrustScore,
        experienceLevel: "Entry-Level",
        salary: `₹${12 + (j % 15)} LPA`,
        description: `Opportunity for young engineers to build scalable services. Fits preferred tech: ${comp.hiringCriteria.preferredSkills.join(", ")}.`,
        tags: comp.hiringCriteria.preferredSkills,
        logo: comp.logo,
        applyLink: `https://careers.${comp.domain}/jobs/job-${j}`
      });
    }

    // Internships
    for (let i = 1; i <= totalInterns; i++) {
      const comp = companies[i % companies.length];
      const role = comp.internships[i % comp.internships.length];
      opportunities.push({
        id: `opp-intern-${i}`,
        title: role,
        company: comp.name,
        companyId: comp.id,
        type: "Internship",
        location: faker.helpers.arrayElement(["Bangalore", "Noida", "Remote"]),
        requiredSkills: comp.hiringCriteria.preferredSkills,
        minCGPA: comp.hiringCriteria.minCGPA,
        minTrustScore: comp.hiringCriteria.minTrustScore,
        experienceLevel: "Intern",
        salary: `₹${25 + (i % 30)}k / month`,
        description: `12-week summer internship program for undergraduate students. Build skills: ${comp.hiringCriteria.preferredSkills.join(", ")}.`,
        tags: comp.hiringCriteria.preferredSkills,
        logo: comp.logo,
        applyLink: `https://careers.${comp.domain}/intern/intern-${i}`
      });
    }

    // Fellowships
    for (let f = 1; f <= totalFellows; f++) {
      const comp = companies[f % companies.length];
      opportunities.push({
        id: `opp-fellow-${f}`,
        title: `${comp.name} Tech Research Fellowship`,
        company: comp.name,
        companyId: comp.id,
        type: "Fellowship",
        location: "Remote",
        requiredSkills: ["Research", "Python", "Algorithms"],
        tags: ["Research", "Python", "Algorithms"],
        minCGPA: Math.max(8.0, comp.hiringCriteria.minCGPA),
        minTrustScore: Math.max(700, comp.hiringCriteria.minTrustScore),
        experienceLevel: "Fellow",
        salary: `₹${45 + (f % 20)}k / month`,
        description: `Research fellowship focused on AI development paradigms. Coordinated by our technical teams.`,
        logo: comp.logo,
        applyLink: `https://research.${comp.domain}/fellows`
      });
    }

    // Hackathons
    for (let h = 1; h <= totalHacks; h++) {
      const hostName = HACKATHONS[h % HACKATHONS.length];
      opportunities.push({
        id: `opp-hack-${h}`,
        title: `${hostName} 2026`,
        company: hostName,
        companyId: `issuer-hack-${(h % 12) + 1}`,
        type: "Hackathon",
        location: faker.helpers.arrayElement(["New Delhi", "Mumbai", "Bangalore", "Remote"]),
        requiredSkills: ["TypeScript", "Solidity", "Figma"],
        tags: ["TypeScript", "Solidity", "Figma"],
        minCGPA: 0,
        minTrustScore: 350,
        experienceLevel: "Any Builder",
        salary: `₹${1 + (h % 5)} Lakh Prize Pool`,
        description: `Collaborate and build futuristic decentralized applications over a weekend sprint.`,
        logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(hostName)}&background=312e81&color=c7d2fe&bold=true`,
        applyLink: `https://devfolio.co/hacks/hack-${h}`
      });
    }

    return opportunities;
  }

  // --- 6. GENERATE FRAUD REPORTS (Step 8 Anomaly generation) ---
  public generateFraudReports(
    credentialsList: VerifiableCredential[],
    studentsList: StudentProfile[]
  ): { fraudReports: FraudReport[]; updatedStudents: StudentProfile[]; updatedCredentials: VerifiableCredential[] } {
    const fraudReports: FraudReport[] = [];
    const updatedStudents = [...studentsList];
    const updatedCredentials = [...credentialsList];

    // Pick 100 credentials to flag as fraudulent.
    // To keep it logical, we target students with indices 40-49 (under the 50 limit)
    // or select random credentials from students to inject anomalies.
    const eligibleCreds = updatedCredentials.filter(c => c.id.includes("valid"));
    const selectedCreds = faker.helpers.shuffle(eligibleCreds).slice(0, 100);

    const fraudTypes: FraudReport["fraudType"][] = [
      "edited_pdf", "duplicate_certificate", "revoked_credential",
      "fake_issuer", "expired_internship", "metadata_mismatch"
    ];

    selectedCreds.forEach((cred, fIndex) => {
      const type = fraudTypes[fIndex % fraudTypes.length];
      const student = updatedStudents.find(s => s.id === cred.studentId);
      if (!student) return;

      let expected = "valid";
      let actual = "invalid";
      let description = "";

      // Apply changes to the credential/student to create the validation mismatch
      if (type === "edited_pdf") {
        description = "Verification check failed: PDF metadata hash does not match blockchain transaction state.";
        expected = cred.blockchainHash;
        actual = makeTransactionHash(); // mismatch
        cred.digitalSignature = "0xbroken_signature_signature_mismatch";
      } else if (type === "duplicate_certificate") {
        description = "Security alert: Duplicate UUID reference detected across multiple student email profiles.";
        expected = student.email;
        actual = `alternative_user_${fIndex}@otherdomain.com`;
      } else if (type === "revoked_credential") {
        description = "Plagiarism alert: Issuer marked credential as revoked due to integrity audit failure.";
        cred.verificationStatus = "revoked";
        cred.revocationReason = "Integrity check failed: Plagiarism detected in research thesis.";
        cred.revokedAt = new Date().toISOString();
        cred.blockchain.verificationStatus = "revoked";
        cred.auditTrail.push({
          status: "revoked",
          timestamp: new Date().toISOString(),
          transactionHash: makeTransactionHash(),
          details: "Revocation anchored on Base Sepolia by issuer authority."
        });
      } else if (type === "fake_issuer") {
        description = "Unauthorized issuer signature: Key verification failed against registered Base contract registrar.";
        expected = cred.blockchain.issuerWallet;
        actual = makeEthereumAddress();
        cred.blockchain.issuerWallet = actual;
      } else if (type === "expired_internship") {
        description = "Validation failure: Expiry mismatch. Candidate claimed internship timeline past verified date.";
        cred.expiryDate = "2024-12-31"; // expired in the past
      } else {
        description = "Metadata telemetry mismatch: Mismatched education values. Profile major does not align with academic records.";
        expected = student.major;
        actual = "Mechanical Engineering";
      }

      fraudReports.push({
        id: `fraud-rep-${fIndex + 1}`,
        candidateId: student.id,
        candidateName: student.name,
        credentialId: cred.id,
        fraudType: type,
        severity: type === "fake_issuer" || type === "revoked_credential" ? "critical" : "high",
        description,
        detectedAt: new Date().toISOString(),
        evidence: {
          field: type === "metadata_mismatch" ? "major" : "hash",
          expected,
          actual
        }
      });

      // Deduct trust score heavily for fraudulent records
      const deduction = type === "fake_issuer" || type === "revoked_credential" ? 120 : 70;
      student.trustScore = Math.max(350, student.trustScore - deduction);
      student.trustFactors.fraudProbability = Math.max(10, student.trustFactors.fraudProbability - 40);
      student.trustFactors.verificationConfidence = Math.max(10, student.trustFactors.verificationConfidence - 35);
    });

    return {
      fraudReports,
      updatedStudents,
      updatedCredentials
    };
  }
}
