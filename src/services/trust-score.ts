import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, query, orderBy } from "firebase/firestore";

export class TrustScoreService {
  static async getScore(studentId: string) {
    try {
      // 1. Try to invoke API route for dynamic calculation
      let apiData: any = null;
      try {
        const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
        const response = await fetch(`${baseUrl}/api/student/trust-score`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ studentId })
        });
        if (response.ok) {
          const res = await response.json();
          if (res.success) {
            apiData = res;
          }
        }
      } catch (e) {
        console.warn("TrustScoreService: Could not reach Trust Engine API, falling back to direct Firestore fetch:", e);
      }

      // 2. Fetch directly from Firestore profile document
      const profileRef = doc(db, "students", studentId);
      const profileSnap = await getDoc(profileRef);
      
      let total = 350; // Default base starting score
      let factors: Record<string, number> = {
        issuerReputation: 50,
        credentialFreshness: 50,
        credentialImportance: 50,
        fraudProbability: 90,
        skillConsistency: 50,
        experienceGrowth: 50,
        peerValidation: 30,
        verificationConfidence: 50,
        openSourceActivity: 30,
        researchActivity: 30,
        hackathonPerformance: 40,
        internshipQuality: 45
      };
      let lastUpdated = new Date().toISOString();
      let explanation = "Verify your credentials to build Trust Score telemetry.";

      if (apiData) {
        total = apiData.total;
        factors = apiData.factors;
        explanation = apiData.explanation;
        lastUpdated = apiData.lastUpdated;
      } else if (profileSnap.exists()) {
        const data = profileSnap.data();
        if (typeof data.trustScore === "number") total = data.trustScore;
        if (data.trustFactors) factors = { ...factors, ...data.trustFactors };
        if (data.trustLastUpdated) lastUpdated = data.trustLastUpdated;
      }

      // 3. Fetch historical logs from subcollection
      const historyList: any[] = [];
      try {
        const historyRef = collection(db, "students", studentId, "trust_history");
        const historySnap = await getDocs(historyRef);
        historySnap.forEach((docSnap) => {
          const h = docSnap.data();
          historyList.push({
            id: docSnap.id,
            score: h.score || 350,
            timestamp: h.timestamp || "",
            explanation: h.explanation || "",
            factors: h.factors || factors
          });
        });
      } catch (e) {
        console.error("Failed to fetch trust history logs:", e);
      }

      // Sort history chronologically
      historyList.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      // If history is empty, inject a default initial starting point so the line chart isn't empty
      if (historyList.length === 0) {
        historyList.push({
          id: "init",
          score: 350,
          timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          explanation: "Initial account creation.",
          factors
        });
        historyList.push({
          id: "curr",
          score: total,
          timestamp: lastUpdated,
          explanation: "Current recalculated telemetry.",
          factors
        });
      }

      // 4. Return formatted data maintaining backward compatibility
      return {
        total,
        explanation,
        factors,
        lastUpdated,
        history: historyList,
        breakdown: {
          projects: Math.round((factors.openSourceActivity || 0) * 0.25),
          internships: Math.round((factors.internshipQuality || 0) * 0.25),
          certificates: Math.round((factors.issuerReputation || 0) * 0.20),
          hackathons: Math.round((factors.hackathonPerformance || 0) * 0.15),
          recommendations: Math.round((factors.peerValidation || 0) * 0.10),
          profile: 5
        }
      };

    } catch (error) {
      console.error("Error in TrustScoreService.getScore:", error);
      return {
        total: 350,
        explanation: "Verification pipeline connection unavailable.",
        factors: {
          issuerReputation: 30,
          credentialFreshness: 30,
          credentialImportance: 30,
          fraudProbability: 90,
          skillConsistency: 30,
          experienceGrowth: 30,
          peerValidation: 30,
          verificationConfidence: 30,
          openSourceActivity: 30,
          researchActivity: 30,
          hackathonPerformance: 30,
          internshipQuality: 30
        },
        lastUpdated: new Date().toISOString(),
        history: [],
        breakdown: { projects: 0, internships: 0, certificates: 0, hackathons: 0, recommendations: 0, profile: 0 }
      };
    }
  }
}
