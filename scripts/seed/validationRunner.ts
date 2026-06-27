// validationRunner.ts
// Executes seeder validation and prints a concise report.
import { DataFactory } from './DataFactory';
import { OpportunityRecord, StudentProfile, ProjectRecord, AchievementRecord, VerifiableCredential } from './types';

async function main() {
  const factory = new DataFactory();
  const universities = factory.generateUniversities();
  const companies = factory.generateCompanies();
  const opportunities = factory.generateOpportunities(companies);

  const studentCount = 20; // number of students to generate for validation
  const allStudents: StudentProfile[] = [];
  const allProjects: ProjectRecord[] = [];
  const allAchievements: AchievementRecord[] = [];
  const allCredentials: VerifiableCredential[] = [];

  const emailSet = new Set<string>();
  const uuidSet = new Set<string>();

  for (let i = 0; i < studentCount; i++) {
    const { student, projects, achievements, credentials } = factory.generateStudentProfile(i, universities, companies);
    allStudents.push(student);
    allProjects.push(...projects);
    allAchievements.push(...achievements);
    allCredentials.push(...credentials);
    emailSet.add(student.email);
    uuidSet.add(student.id);
  }

  const missingFields: string[] = [];
  const checkRequired = (obj: any, fields: string[], name: string) => {
    fields.forEach(f => {
      if (!(f in obj)) missingFields.push(`${name}.${f}`);
    });
  };
  const checkArray = (obj: any, field: string, name: string) => {
    if (!Array.isArray(obj[field])) missingFields.push(`${name}.${field} (not array)`);
  };

  // Universities validation
  universities.forEach(u => checkRequired(u, ['id','name','shortName','logo','reputation','placementRate','accreditation','domain'], 'University'));

  // Companies validation
  companies.forEach(c => {
    checkRequired(c, ['id','name','shortName','domain','logo','reputation','hiringRoles','internships','hiringCriteria'], 'Company');
    checkArray(c, 'hiringRoles', 'Company');
    checkArray(c, 'internships', 'Company');
    if (c.hiringCriteria && typeof c.hiringCriteria === 'object') {
      checkArray(c.hiringCriteria, 'preferredSkills', 'Company.hiringCriteria');
    } else {
      missingFields.push('Company.hiringCriteria');
    }
  });

  // Students validation
  allStudents.forEach(s => {
    checkRequired(s, ['id','name','email','phone','degree','major','cgpa','location','github','linkedin','portfolio','avatar','isDigiLockerConnected','profileCompletion','timeline'], 'Student');
    checkArray(s, 'timeline', 'Student');
  });

  // Projects validation
  allProjects.forEach(p => {
    checkRequired(p, ['id','studentId','title','description','difficulty','skillsUsed','githubUrl','completed','date'], 'Project');
    checkArray(p, 'skillsUsed', 'Project');
  });

  // Achievements validation
  allAchievements.forEach(a => {
    checkRequired(a, ['id','studentId','title','category','issuer','impact','date','verified','proofUrl','createdAt'], 'Achievement');
  });

  // Credentials validation
  allCredentials.forEach(c => {
    checkRequired(c, ['id','studentName','studentEmail','studentId','issuerId','issuerName','issuerType','title','description','credentialType','issueDate','expiryDate','verificationStatus','digitalSignature','blockchainHash','metadataHash','qrCodeUrl','w3cData','blockchain','auditTrail','createdAt','updatedAt'], 'Credential');
    if (!c.blockchain || typeof c.blockchain !== 'object') {
      missingFields.push(`Credential ${c.id} missing blockchain`);
    } else {
      checkRequired(c.blockchain, ['chainId','contractAddress','transactionHash','blockNumber','issuerWallet','verificationStatus','anchoredAt'], `Credential(${c.id}).blockchain`);
    }
  });

  // Uniqueness checks
  if (emailSet.size !== allStudents.length) console.warn('Duplicate student emails detected');
  if (uuidSet.size !== allStudents.length) console.warn('Duplicate student UUIDs detected');

  // Foreign key checks
  const studentIds = new Set(allStudents.map(s => s.id));
  const companyIds = new Set(companies.map(c => c.id));
  allProjects.forEach(p => { if (!studentIds.has(p.studentId)) console.warn(`Project ${p.id} references unknown student ${p.studentId}`); });
  allAchievements.forEach(a => { if (!studentIds.has(a.studentId)) console.warn(`Achievement ${a.id} references unknown student ${a.studentId}`); });
  allCredentials.forEach(c => {
    if (!studentIds.has(c.studentId)) console.warn(`Credential ${c.id} references unknown student ${c.studentId}`);
    const issuerExists = companyIds.has(c.issuerId) || universities.some(u => u.id === c.issuerId);
    if (!issuerExists) console.warn(`Credential ${c.id} references unknown issuer ${c.issuerId}`);
  });
  opportunities.forEach(o => {
    if (!companyIds.has((o as any).companyId)) console.warn(`Opportunity ${o.id} references unknown company ${(o as any).companyId}`);
  });

  // Date sanity checks
  const dateItems = [...allProjects, ...allAchievements as any[]];
  dateItems.forEach(item => {
    if (isNaN(Date.parse(item.date))) console.warn(`${item.id} has invalid date ${item.date}`);
  });

  // Summary report
  const report = {
    universitiesCount: universities.length,
    companiesCount: companies.length,
    studentsCount: allStudents.length,
    recruitersCount: 0,
    projectsCount: allProjects.length,
    achievementsCount: allAchievements.length,
    credentialsCount: allCredentials.length,
    opportunitiesCount: opportunities.length,
    fraudReportsCount: 0
  };
  console.log('---SEEDER VALIDATION REPORT START---');
  console.log(JSON.stringify(report, null, 2));
  console.log('Missing / Invalid fields:', missingFields.length ? missingFields : 'None');
  console.log('---SEEDER VALIDATION REPORT END---');
}

main().catch(err => console.error('Validation runner error', err));
