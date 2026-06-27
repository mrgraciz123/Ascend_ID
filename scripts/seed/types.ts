export interface UniversityConfig {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  reputation: number; // 0 - 100
  placementRate: number; // percentage
  accreditation: string;
  domain: string;
}

export interface CompanyConfig {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  reputation: number; // 0 - 100
  domain: string;
  hiringRoles: string[];
  internships: string[];
  hiringCriteria: {
    minCGPA: number;
    minTrustScore: number;
    preferredSkills: string[];
  };
}

export interface StudentPersona {
  name: string;
  skills: string[];
  interests: string[];
  trustScoreRange: [number, number];
  cgpaRange: [number, number];
  projectDifficulty: "Easy" | "Medium" | "Hard";
  researchPaperCount: number;
  internshipCount: number;
  certificationCount: number;
  projectCount: number;
  techKeywords: string[];
}

export interface StudentProfile {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female";
  avatar: string;
  universityId: string;
  universityName: string;
  degree: string;
  major: string;
  semester: number;
  cgpa: number;
  graduationYear: string;
  github: string;
  linkedin: string;
  portfolio: string;
  location: string;
  skills: string[];
  interests: string[];
  persona: string;
  isDigiLockerConnected: boolean;
  profileCompletion: number;
  trustScore: number;
  trustFactors: {
    issuerReputation: number;
    credentialFreshness: number;
    credentialImportance: number;
    fraudProbability: number;
    skillConsistency: number;
    experienceGrowth: number;
    peerValidation: number;
    verificationConfidence: number;
    openSourceActivity: number;
    researchActivity: number;
    hackathonPerformance: number;
    internshipQuality: number;
  };
  trustLastUpdated: string;
}

export interface ProjectRecord {
  id: string;
  studentId: string;
  title: string;
  description: string;
  difficulty: string;
  skillsUsed: string[];
  githubUrl: string;
  completed: boolean;
  date: string;
}

export interface AchievementRecord {
  id: string;
  studentId: string;
  title: string;
  category: "Project" | "Research" | "Internship" | "Certification";
  issuer: string;
  impact: string;
  date: string;
  verified: boolean;
  proofUrl: string;
  blockchainHash?: string;
  createdAt: any;
}

export interface VerifiableCredential {
  id: string;
  issuerId: string;
  issuerName: string;
  issuerType: "university" | "company" | "hackathon";
  studentName: string;
  studentEmail: string;
  studentId: string;
  title: string;
  description: string;
  credentialType: "degree" | "diploma" | "experience" | "internship" | "achievement" | "certification" | "badge";
  issueDate: string;
  expiryDate: string;
  verificationStatus: "issued" | "revoked";
  digitalSignature: string;
  blockchainHash: string;
  metadataHash?: string;
  w3cData?: any;
  qrCodeUrl: string;
  revocationReason?: string;
  revokedAt?: string;
  blockchain: {
    chainId: number;
    contractAddress: string;
    transactionHash: string;
    blockNumber: number;
    issuerWallet: string;
    verificationStatus: string;
    anchoredAt: string;
  };
  auditTrail: {
    status: string;
    timestamp: string;
    transactionHash: string;
    details: string;
  }[];
  createdAt: any;
  updatedAt: any;
}

export interface RecruiterProfile {
  id: string;
  name: string;
  email: string;
  companyId: string;
  companyName: string;
  searchHistory: string[];
  verificationHistory: string[];
  savedCandidates: string[];
}

export interface OpportunityRecord {
  id: string;
  title: string;
  company: string;
  companyId: string;
  type: "Job" | "Internship" | "Fellowship" | "Hackathon";
  location: string;
  requiredSkills: string[];
  minCGPA: number;
  minTrustScore: number;
  experienceLevel: string;
  salary: string;
  description: string;
  tags: string[]; // Added to ensure opportunities always have tags array
  logo: string;
  applyLink: string;
}

export interface FraudReport {
  id: string;
  candidateId: string;
  candidateName: string;
  credentialId: string;
  fraudType: "edited_pdf" | "duplicate_certificate" | "revoked_credential" | "fake_issuer" | "expired_internship" | "metadata_mismatch";
  severity: "high" | "critical";
  description: string;
  detectedAt: string;
  evidence: {
    field: string;
    expected: string;
    actual: string;
  };
}
