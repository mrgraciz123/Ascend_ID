import { 
  UniversityConfig, 
  CompanyConfig, 
  StudentProfile, 
  ProjectRecord, 
  AchievementRecord, 
  VerifiableCredential 
} from "./types";

export interface ValidationFailure {
  id: string; // The ID of the student / record
  type: "email" | "uuid" | "broken_ref" | "impossible_date" | "inconsistent_career" | "invalid_issuer" | "invalid_blockchain";
  message: string;
}

export class ValidationEngine {
  // Validates a single student's complete career timeline and assets
  public static validateStudentData(
    student: StudentProfile,
    projects: ProjectRecord[],
    achievements: AchievementRecord[],
    credentials: VerifiableCredential[],
    universities: UniversityConfig[],
    companies: CompanyConfig[],
    allStudentEmails: Set<string>,
    allCredentialUUIDs: Set<string>
  ): ValidationFailure[] {
    const failures: ValidationFailure[] = [];
    const startYear = parseInt(student.graduationYear) - (student.degree.startsWith("M") || student.degree === "MCA" ? 2 : 4);

    // 1. Email check (must be unique)
    if (!student.email.includes("@")) {
      failures.push({
        id: student.id,
        type: "email",
        message: `Invalid email format: ${student.email}`
      });
    }

    // 2. Broken References
    const uniExists = universities.some(u => u.id === student.universityId);
    if (!uniExists) {
      failures.push({
        id: student.id,
        type: "broken_ref",
        message: `Student universityId "${student.universityId}" does not exist in universities list.`
      });
    }

    // 3. Impossible dates / Inconsistent Careers
    if (parseInt(student.graduationYear) <= startYear) {
      failures.push({
        id: student.id,
        type: "impossible_date",
        message: `Impossible education duration: start ${startYear} >= grad ${student.graduationYear}.`
      });
    }

    // Check credential specific constraints
    const studentCreds = credentials.filter(c => c.studentId === student.id);
    studentCreds.forEach(c => {
      // Reference checks
      if (c.studentName !== student.name) {
        failures.push({
          id: student.id,
          type: "broken_ref",
          message: `Credential studentName "${c.studentName}" does not match profile student.name "${student.name}"`
        });
      }

      // Check dates
      const issueYear = parseInt(c.issueDate.split("-")[0]);
      if (isNaN(issueYear)) {
        failures.push({
          id: student.id,
          type: "impossible_date",
          message: `Malformed issueDate: ${c.issueDate}`
        });
        return;
      }

      if (c.title.includes("Class 10") && issueYear >= startYear) {
        failures.push({
          id: student.id,
          type: "impossible_date",
          message: `Class 10 completed during or after entering college: ${c.issueDate} vs ${startYear}`
        });
      }

      if (c.title.includes("Class 12") && issueYear > startYear) {
        failures.push({
          id: student.id,
          type: "impossible_date",
          message: `Class 12 completed after entering college: ${c.issueDate} vs ${startYear}`
        });
      }

      if (c.credentialType === "internship") {
        if (issueYear < startYear || issueYear > parseInt(student.graduationYear)) {
          failures.push({
            id: student.id,
            type: "inconsistent_career",
            message: `Internship issue year (${issueYear}) falls outside of enrollment years (${startYear} - ${student.graduationYear})`
          });
        }
      }

      // Check issuer relationships
      if (c.issuerType === "company") {
        const companyExists = companies.some(co => co.id === c.issuerId) || c.issuerId.startsWith("issuer-");
        if (!companyExists) {
          failures.push({
            id: student.id,
            type: "invalid_issuer",
            message: `Issuer ID "${c.issuerId}" does not exist as a company.`
          });
        }
      } else if (c.issuerType === "university") {
        const uniExists = universities.some(u => u.id === c.issuerId) || c.issuerId === "issuer-cbse";
        if (!uniExists) {
          failures.push({
            id: student.id,
            type: "invalid_issuer",
            message: `Issuer ID "${c.issuerId}" does not exist as a university.`
          });
        }
      }

      // Invalid blockchain references
      if (c.blockchain.chainId !== 84532) {
        failures.push({
          id: student.id,
          type: "invalid_blockchain",
          message: `Incorrect blockchain chainId: expected 84532, got ${c.blockchain.chainId}`
        });
      }

      if (c.blockchain.contractAddress !== "0xe7a5d3f2b8f88cf5d506ab1a87e502cfaee88732") {
        failures.push({
          id: student.id,
          type: "invalid_blockchain",
          message: `Incorrect smart contract address: got ${c.blockchain.contractAddress}`
        });
      }

      if (!c.blockchain.transactionHash.startsWith("0x")) {
        failures.push({
          id: student.id,
          type: "invalid_blockchain",
          message: `Invalid transaction hash format: ${c.blockchain.transactionHash}`
        });
      }
    });

    // Check project consistency with profile skills
    projects.forEach(p => {
      const allSkillsIncluded = p.skillsUsed.every(sk => student.skills.includes(sk));
      if (!allSkillsIncluded) {
        failures.push({
          id: student.id,
          type: "inconsistent_career",
          message: `Project "${p.title}" uses skills [${p.skillsUsed.join(", ")}] not listed on student profile [${student.skills.slice(0, 5).join(", ")}...]`
        });
      }
    });

    return failures;
  }
}
