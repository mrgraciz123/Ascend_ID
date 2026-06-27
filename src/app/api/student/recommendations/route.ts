import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// Predefined opportunity database across 6 categories
const OPPORTUNITIES_CATALOG = [
  // Jobs
  {
    id: "job-stripe-fullstack",
    title: "Senior Full-Stack Engineer",
    company: "Stripe",
    type: "Job",
    location: "Remote",
    requiredSkills: ["React", "TypeScript", "Node.js", "APIs"],
    requiredMajor: ["Computer Science", "Software Engineering", "Information Technology"],
    minTrustScore: 700,
    interests: ["Full-Stack Development", "Web Development", "APIs"],
    logo: "https://logo.clearbit.com/stripe.com",
    applyLink: "https://stripe.com/jobs",
    salary: "$140,000 - $180,000",
    description: "Build robust global billing pipelines and UI dashboard components. Requires strong verified skills in TypeScript/React."
  },
  {
    id: "job-openai-researcher",
    title: "AI Research Engineer",
    company: "OpenAI",
    type: "Job",
    location: "San Francisco, USA",
    requiredSkills: ["Python", "Machine Learning", "PyTorch", "Algorithms"],
    requiredMajor: ["Computer Science", "Artificial Intelligence", "Mathematics"],
    minTrustScore: 760,
    interests: ["AI/ML", "Research", "Deep Learning"],
    logo: "https://logo.clearbit.com/openai.com",
    applyLink: "https://openai.com/careers",
    salary: "$200,000 - $250,000",
    description: "Optimize large-scale training algorithms and align neural models. Strong emphasis on verified research credentials."
  },
  {
    id: "job-coinbase-web3",
    title: "Web3 Smart Contract Engineer",
    company: "Coinbase",
    type: "Job",
    location: "Remote",
    requiredSkills: ["Solidity", "Smart Contracts", "Ethereum", "TypeScript"],
    requiredMajor: ["Computer Science", "Software Engineering"],
    minTrustScore: 720,
    interests: ["Blockchain", "Web3", "Security"],
    logo: "https://logo.clearbit.com/coinbase.com",
    applyLink: "https://coinbase.com/careers",
    salary: "$130,000 - $165,000",
    description: "Write, review, and deploy production smart contracts. Strong emphasis on cryptographically signed certificates."
  },
  // Internships
  {
    id: "intern-vercel-frontend",
    title: "Frontend Engineering Intern",
    company: "Vercel",
    type: "Internship",
    location: "Remote",
    requiredSkills: ["React", "Next.js", "Tailwind CSS", "TypeScript"],
    requiredMajor: ["Computer Science", "Software Engineering", "Web Development"],
    minTrustScore: 600,
    interests: ["Frontend Development", "Web Development", "UI/UX"],
    logo: "https://logo.clearbit.com/vercel.com",
    applyLink: "https://vercel.com/careers",
    salary: "$35 - $50 / hour",
    description: "Collaborate with Next.js core team to construct responsive Web UI features and optimize bundle compilation performance."
  },
  {
    id: "intern-google-step",
    title: "STEP Intern (Summer 2027)",
    company: "Google",
    type: "Internship",
    location: "Bangalore, India",
    requiredSkills: ["C++", "Java", "Python", "Algorithms"],
    requiredMajor: ["Computer Science", "Electrical Engineering", "Software Engineering"],
    minTrustScore: 650,
    interests: ["Software Engineering", "Algorithms", "Data Structures"],
    logo: "https://logo.clearbit.com/google.com",
    applyLink: "https://buildyourcareer.withgoogle.com",
    salary: "Competitive stipend",
    description: "Work on real-world engineering problems in teams like Search, Maps, or Cloud. Open to first/second year undergraduates."
  },
  // Scholarships
  {
    id: "scholar-google-nextgen",
    title: "Google Next-Gen Tech Scholarship",
    company: "Google Developers",
    type: "Scholarship",
    location: "Global",
    requiredSkills: ["Algorithms", "Community Work", "Python"],
    requiredMajor: ["Computer Science", "STEM"],
    minTrustScore: 710,
    interests: ["Education", "Diversity", "Open Source"],
    logo: "https://logo.clearbit.com/google.com",
    applyLink: "https://buildyourcareer.withgoogle.com",
    salary: "$10,000 Merit Grant",
    description: "Empowering STEM students showing exceptional leadership, verified academic excellence, and high trust scores."
  },
  {
    id: "scholar-eth-fellowship",
    title: "Ethereum Foundation Research Fellowship",
    company: "Ethereum Foundation",
    type: "Scholarship",
    location: "Remote",
    requiredSkills: ["Cryptography", "Solidity", "Blockchain"],
    requiredMajor: ["Mathematics", "Computer Science"],
    minTrustScore: 730,
    interests: ["Blockchain", "Web3", "Research"],
    logo: "https://logo.clearbit.com/ethereum.org",
    applyLink: "https://ethereum.org/fellowship",
    salary: "$15,000 Research Grant",
    description: "Support for researchers exploring Layer-2 scalability, zero-knowledge proofs, and consensus mechanisms."
  },
  // Hackathons
  {
    id: "hack-ethglobal-blr",
    title: "ETHGlobal Bangalore 2027",
    company: "ETHGlobal",
    type: "Hackathon",
    location: "Bangalore, India",
    requiredSkills: ["Solidity", "React", "Smart Contracts", "Web3"],
    requiredMajor: ["Any major"],
    minTrustScore: 500,
    interests: ["Blockchain", "Web3", "Hackathons"],
    logo: "https://ui-avatars.com/api/?name=ETHGlobal&background=6366f1&color=fff",
    applyLink: "https://ethglobal.com",
    salary: "$50,000+ Prize Pool",
    description: "Build state-of-the-art Web3 projects, network with top builders, and win bounties from global sponsors."
  },
  {
    id: "hack-gemini-ai",
    title: "Gemini AI Global Hackathon",
    company: "Google",
    type: "Hackathon",
    location: "Remote",
    requiredSkills: ["Python", "APIs", "React", "AI/ML"],
    requiredMajor: ["Any major"],
    minTrustScore: 500,
    interests: ["AI/ML", "APIs", "Hackathons"],
    logo: "https://logo.clearbit.com/google.com",
    applyLink: "https://google.ai/hackathon",
    salary: "$100,000+ Sponsor Pool",
    description: "Push the boundaries of agentic AI workflows and LLMs using Gemini 2.5 Flash. Open to developers globally."
  },
  // Competitions
  {
    id: "comp-kaggle-grandmaster",
    title: "Kaggle Grandmaster Challenge",
    company: "Kaggle",
    type: "Competition",
    location: "Remote",
    requiredSkills: ["Python", "Machine Learning", "Data Science", "Algorithms"],
    requiredMajor: ["STEM", "Computer Science"],
    minTrustScore: 680,
    interests: ["AI/ML", "Data Science", "Competitions"],
    logo: "https://logo.clearbit.com/kaggle.com",
    applyLink: "https://kaggle.com",
    salary: "$25,000 Prize Pool",
    description: "Build predictive models on tabular and image data to beat the leaderboard and earn Grandmaster points."
  },
  {
    id: "comp-icpc-finals",
    title: "ICPC Regional Finals",
    company: "ICPC Foundation",
    type: "Competition",
    location: "Mumbai, India",
    requiredSkills: ["C++", "Java", "Algorithms", "Mathematics"],
    requiredMajor: ["Computer Science", "Mathematics"],
    minTrustScore: 700,
    interests: ["Algorithms", "Competitive Programming", "Competitions"],
    logo: "https://ui-avatars.com/api/?name=ICPC&background=f43f5e&color=fff",
    applyLink: "https://icpc.global",
    salary: "Global recognition",
    description: "The premier competitive programming championship. Requires solving complex algorithmic challenges under time pressure."
  },
  // Research Programs
  {
    id: "research-mit-alignment",
    title: "AI Alignment Fellowship",
    company: "MIT AI Lab",
    type: "Research Program",
    location: "Boston, USA",
    requiredSkills: ["Python", "Machine Learning", "Research", "Algorithms"],
    requiredMajor: ["Computer Science", "Artificial Intelligence", "Mathematics"],
    minTrustScore: 770,
    interests: ["AI/ML", "Research", "Safety"],
    logo: "https://logo.clearbit.com/mit.edu",
    applyLink: "https://mit.edu/research",
    salary: "$80,000 Fellowship stipend",
    description: "Conduct fundamental research on model interpretability, RLHF safety bounds, and agentic governance systems."
  },
  {
    id: "research-iisc-quantum",
    title: "Quantum Computing Lab Program",
    company: "IISc Bangalore",
    type: "Research Program",
    location: "Bangalore, India",
    requiredSkills: ["Python", "Algorithms", "Mathematics", "Quantum Computing"],
    requiredMajor: ["Physics", "Computer Science", "Mathematics"],
    minTrustScore: 720,
    interests: ["Research", "Quantum Mechanics", "Algorithms"],
    logo: "https://ui-avatars.com/api/?name=IISc&background=0284c7&color=fff",
    applyLink: "https://iisc.ac.in",
    salary: "Academic stipend",
    description: "Explore quantum walk algorithms and error correction codes on hardware and simulators at IISc's Quantum Lab."
  }
];

export async function POST(request: Request) {
  let studentId = "";
  try {
    const body = await request.json();
    studentId = body?.studentId;
  } catch (error: any) {
    console.error("[Recommendations API] Failed to parse JSON request body:", error);
    return NextResponse.json({
      success: false,
      error: "Invalid request payload or malformed JSON",
      location: "recommendations:parse_request",
      details: error.message || "Failed to parse body"
    }, { status: 400 });
  }

  if (!studentId) {
    console.error("[Recommendations API] studentId is missing in request body");
    return NextResponse.json({
      success: false,
      error: "studentId is required",
      location: "recommendations:validate_request",
      details: "The request body did not contain a valid studentId."
    }, { status: 400 });
  }

  // 1. Fetch student data directly from Firestore
  let studentData: any = {};
  try {
    const studentRef = adminDb.collection("students").doc(studentId);
    const studentSnap = await studentRef.get();
    if (studentSnap.exists) {
      studentData = studentSnap.data() || {};
      console.log(`[Recommendations API] Successfully retrieved profile for student ID "${studentId}".`);
    } else {
      console.warn(`[Recommendations API] Student profile not found for ID "${studentId}". Falling back to default values.`);
    }
  } catch (error: any) {
    console.error(`[Recommendations API] Error fetching student document for ID "${studentId}":`, error);
  }

  // 2. Fetch academic records to count verified records
  let verifiedAcademicsCount = 0;
  try {
    const recordSnap = await adminDb.collection("academic_records").where("studentId", "==", studentId).get();
    recordSnap.forEach((d) => {
      if (d.data()?.verified) {
        verifiedAcademicsCount++;
      }
    });
    console.log(`[Recommendations API] Fetched academic records for student "${studentId}". Verified count: ${verifiedAcademicsCount}`);
  } catch (error: any) {
    console.error(`[Recommendations API] Error fetching academic records for student "${studentId}":`, error);
  }

  // 3. Fetch achievements
  let verifiedAchievementsCount = 0;
  try {
    const achSnap = await adminDb.collection("achievements").where("studentId", "==", studentId).get();
    achSnap.forEach((d) => {
      if (d.data()?.verified) {
        verifiedAchievementsCount++;
      }
    });
    console.log(`[Recommendations API] Fetched achievements for student "${studentId}". Verified count: ${verifiedAchievementsCount}`);
  } catch (error: any) {
    console.error(`[Recommendations API] Error fetching achievements for student "${studentId}":`, error);
  }

  // 4. Construct normalized student profile details
  const studentProfile = {
    name: studentData.fullName || studentData.name || "Anonymous Student",
    degree: studentData.degree || studentData.major || "Computer Science",
    major: studentData.degree || studentData.major || "Computer Science",
    institution: studentData.institution || studentData.university || "IIT Bombay",
    graduationYear: studentData.graduationYear || "2026",
    trustScore: typeof studentData.trustScore === "number" ? studentData.trustScore : 680,
    skills: Array.isArray(studentData.skills) ? studentData.skills : [],
    location: studentData.location || "Remote",
    interests: Array.isArray(studentData.interests) ? studentData.interests : ["Full-Stack Development"],
    projects: Array.isArray(studentData.projects) ? studentData.projects : [],
    verifiedAcademicsCount,
    verifiedAchievementsCount
  };

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `
You are the AI engine for AscendID, a blockchain-based trust network for talent. Your job is to match a student's profile to a list of premium opportunities (Jobs, Scholarships, Hackathons, Competitions, Internships, Research Programs).

Here is the student's profile metadata:
- Name: ${studentProfile.name}
- Education Major/Degree: ${studentProfile.major}
- University: ${studentProfile.institution}
- Graduation Year: ${studentProfile.graduationYear}
- Trust Score (ranges 350-850, higher is more trustworthy): ${studentProfile.trustScore}
- Verified Skills: ${JSON.stringify(studentProfile.skills)}
- Location Preference/Actual: ${studentProfile.location}
- Declared Interests: ${JSON.stringify(studentProfile.interests)}
- Custom Projects: ${JSON.stringify(studentProfile.projects)}
- Verified DigiLocker Academic Records: ${studentProfile.verifiedAcademicsCount}
- Verified Professional Achievements: ${studentProfile.verifiedAchievementsCount}

Here is the master catalog of opportunities:
${JSON.stringify(OPPORTUNITIES_CATALOG, null, 2)}

Evaluate EVERY opportunity in the catalog. For each, calculate:
1. "matchScore" (0 to 100): An overall percentage matching the candidate's skills, interests, projects, location, and education. If their Trust Score is higher, it increases confidence. Add a significant boost (+10% to +15%) if their skills/achievements are cryptographically verified.
2. A detailed scoring breakdown across 6 metrics (assign each an integer 0-100 representing how well the student fits):
   - "trustScoreMatch": How well their trust score meets/exceeds the required threshold.
   - "skillsMatch": Overlap of verified skills with required tags.
   - "projectsMatch": Relevance of their custom projects/achievements to the role.
   - "locationMatch": Location compatibility (Remote gets 100%, otherwise city matches).
   - "educationMatch": Compatibility of major/university.
   - "interestsMatch": Alignment of student's declared interests with opportunity focus.
   - "verificationBoost": Weight of verified credentials (boosting confidence).
3. "matchReason": A personalized explanation (2-3 sentences) detailing WHY they matched, calling out specific skills, interests, education, their trust score, and the boost from verified documents.

Respond ONLY with a valid JSON array in this exact format (no markdown blocks, no leading/trailing text):
[
  {
    "id": "opportunity-id",
    "title": "Opportunity Title",
    "company": "Company Name",
    "type": "Job|Internship|Scholarship|Hackathon|Competition|Research Program",
    "location": "Opportunity Location",
    "matchScore": 88,
    "matchReason": "Personalized description explaining why...",
    "logo": "logo-url",
    "applyLink": "apply-url",
    "salary": "salary-or-stipend",
    "description": "Short details",
    "tags": ["React", "TypeScript"],
    "detailsBreakdown": {
      "trustScoreMatch": 90,
      "skillsMatch": 80,
      "projectsMatch": 70,
      "locationMatch": 100,
      "educationMatch": 85,
      "interestsMatch": 90,
      "verificationBoost": 15
    }
  },
  ...
]
`;

      console.log(`[Recommendations API] Sending request to Gemini API for student ID "${studentId}".`);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });

      if (response.ok) {
        const resData = await response.json();
        const responseText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) {
          let cleanText = responseText.trim();
          if (cleanText.startsWith("```json")) {
            cleanText = cleanText.substring(7);
          } else if (cleanText.startsWith("```")) {
            cleanText = cleanText.substring(3);
          }
          if (cleanText.endsWith("```")) {
            cleanText = cleanText.substring(0, cleanText.length - 3);
          }
          cleanText = cleanText.trim();

          const parsedRecommendations = JSON.parse(cleanText);
          if (Array.isArray(parsedRecommendations)) {
            console.log(`[Recommendations API] Successfully retrieved and parsed AI recommendations for student ID "${studentId}".`);
            return NextResponse.json({ success: true, data: parsedRecommendations });
          } else {
            console.warn("[Recommendations API] Gemini response did not parse as a JSON array. Falling back to local algorithm.");
          }
        } else {
          console.warn("[Recommendations API] Gemini response candidates structure was empty. Falling back to local algorithm.");
        }
      } else {
        const errorText = await response.text();
        console.error(`[Recommendations API] Gemini API request failed with status ${response.status}: ${errorText}. Falling back to local algorithm.`);
      }
    } catch (geminiError: any) {
      console.error("[Recommendations API] Gemini API call or response parsing failed. Falling back to local algorithm. Details:", geminiError);
    }
  } else {
    console.log("[Recommendations API] GEMINI_API_KEY is not defined. Falling back to local matchmaking algorithm.");
  }

  // --- DETERMINISTIC LOCAL FALLBACK MATCHING ALGORITHM ---
  try {
    const studentLoc = typeof studentProfile.location === "string" ? studentProfile.location : "Remote";
    const studentMajor = typeof studentProfile.major === "string" ? studentProfile.major : "Computer Science";

    const recommendations = OPPORTUNITIES_CATALOG.map((opp) => {
      // 1. Trust Score Match (0 to 100)
      const oppMinTrust = typeof opp.minTrustScore === "number" ? opp.minTrustScore : 500;
      const trustDiff = studentProfile.trustScore - oppMinTrust;
      let trustScoreMatch = 50;
      if (trustDiff >= 50) trustScoreMatch = 95;
      else if (trustDiff >= 0) trustScoreMatch = 80 + Math.round((trustDiff / 50) * 15);
      else trustScoreMatch = Math.max(10, 50 + Math.round((trustDiff / oppMinTrust) * 40));

      // 2. Skills Match (0 to 100)
      const studentSkillsLower = studentProfile.skills
        .filter((s: any) => typeof s === "string")
        .map((s: string) => s.toLowerCase());
      
      const oppSkills = Array.isArray(opp.requiredSkills) ? opp.requiredSkills : [];
      const matchedSkills = oppSkills.filter((s: string) =>
        studentSkillsLower.includes(s.toLowerCase())
      );
      const skillsMatch = oppSkills.length > 0
        ? Math.round((matchedSkills.length / oppSkills.length) * 100)
        : 80;

      // 3. Projects Match (0 to 100)
      let projectsMatch = 30; // base value
      if (studentProfile.projects.length > 0) {
        const matchingProjects = studentProfile.projects.filter((p: any) => {
          if (!p || typeof p !== "object") return false;
          const pTitle = typeof p.title === "string" ? p.title : "";
          const pDesc = typeof p.description === "string" ? p.description : "";
          const pTags = Array.isArray(p.tags) ? p.tags.filter((t: any) => typeof t === "string") : [];
          const projectText = `${pTitle} ${pDesc} ${pTags.join(" ")}`.toLowerCase();
          
          const oppInterests = Array.isArray(opp.interests) ? opp.interests : [];
          return oppSkills.some((s: string) => projectText.includes(s.toLowerCase())) ||
                 oppInterests.some((i: string) => projectText.includes(i.toLowerCase()));
        });
        projectsMatch = Math.min(100, 40 + (matchingProjects.length * 20));
      } else if (studentProfile.verifiedAchievementsCount > 0) {
        projectsMatch = Math.min(100, 30 + (studentProfile.verifiedAchievementsCount * 15));
      }

      // 4. Location Match (0 to 100)
      let locationMatch = 0;
      const studentLocLower = studentLoc.toLowerCase();
      const oppLoc = typeof opp.location === "string" ? opp.location : "Remote";
      const oppLocLower = oppLoc.toLowerCase();

      if (oppLocLower === "remote" || studentLocLower === "remote") {
        locationMatch = 100;
      } else {
        if (oppLocLower.includes(studentLocLower) || studentLocLower.includes(oppLocLower)) {
          locationMatch = 100;
        } else if (studentLocLower.includes("india") && oppLocLower.includes("india")) {
          locationMatch = 70; // Country overlap
        } else {
          locationMatch = 30; // relocated match potential
        }
      }

      // 5. Education Match (0 to 100)
      let educationMatch = 50; // base major match
      const studentMajorLower = studentMajor.toLowerCase();
      const oppMajors = Array.isArray(opp.requiredMajor) ? opp.requiredMajor : [];
      const isMajorMatched = oppMajors.some((m: string) =>
        m.toLowerCase() === "any major" ||
        studentMajorLower.includes(m.toLowerCase()) ||
        m.toLowerCase().includes(studentMajorLower)
      );
      if (isMajorMatched) {
        educationMatch = 90;
      } else {
        educationMatch = 40;
      }

      // 6. Interests Match (0 to 100)
      const studentInterestsLower = studentProfile.interests
        .filter((i: any) => typeof i === "string")
        .map((i: string) => i.toLowerCase());
      
      const oppInterests = Array.isArray(opp.interests) ? opp.interests : [];
      const matchedInterests = oppInterests.filter((i: string) =>
        studentInterestsLower.some((si: string) => si.includes(i.toLowerCase()) || i.toLowerCase().includes(si))
      );
      const interestsMatch = oppInterests.length > 0
        ? Math.round((matchedInterests.length / oppInterests.length) * 100)
        : 80;

      // 7. Verification Boost (0 to 20)
      const verificationBoost = Math.min(
        20,
        (studentProfile.verifiedAcademicsCount * 5) + (studentProfile.verifiedAchievementsCount * 5)
      );

      // Weighted dynamic match score calculations
      // Weights: Skills(25%), Trust Score(20%), Interests(15%), Projects(15%), Location(15%), Education(10%) + Verification Boost
      let rawScore =
        (skillsMatch * 0.25) +
        (trustScoreMatch * 0.20) +
        (interestsMatch * 0.15) +
        (projectsMatch * 0.15) +
        (locationMatch * 0.15) +
        (educationMatch * 0.10);

      const finalMatchScore = Math.max(10, Math.min(99, Math.round((isNaN(rawScore) ? 70 : rawScore) + (isNaN(verificationBoost) ? 0 : verificationBoost))));

      // Generate explainable match narrative why they matched
      let reason = `Based on your profile details: your Trust Score of ${studentProfile.trustScore} exceeds standard requirements. `;
      if (matchedSkills.length > 0) {
        reason += `You match requirements with verified skills like ${matchedSkills.slice(0, 3).join(", ")}. `;
      } else {
        reason += `Matches your educational domain in ${studentProfile.major}. `;
      }
      if (locationMatch === 100) {
        reason += `Fits your location preference (${studentProfile.location}). `;
      }
      if (verificationBoost > 0) {
        reason += `Your score received a boost from cryptographically verified credentials on Base Sepolia.`;
      } else {
        reason += `Add verified digital credentials to unlock high-trust boosts.`;
      }

      return {
        id: opp.id,
        title: opp.title,
        company: opp.company,
        type: opp.type,
        location: opp.location,
        matchScore: finalMatchScore,
        matchReason: reason,
        logo: opp.logo,
        applyLink: opp.applyLink,
        salary: opp.salary,
        description: opp.description,
        tags: opp.requiredSkills || [],
        detailsBreakdown: {
          trustScoreMatch,
          skillsMatch,
          projectsMatch,
          locationMatch,
          educationMatch,
          interestsMatch,
          verificationBoost
        }
      };
    });

    // Sort by Match Score descending
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    console.log(`[Recommendations API] Returning ${recommendations.length} heuristic fallback matches for student ID "${studentId}".`);
    return NextResponse.json({ success: true, data: recommendations });
  } catch (error: any) {
    console.error("[Recommendations API] Critical matchmaking logic error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to generate recommendations",
      location: "recommendations:matchmaking_algorithm",
      details: error.message || "Internal algorithm error"
    }, { status: 500 });
  }
}
