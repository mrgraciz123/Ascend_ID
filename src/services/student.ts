import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, setDoc, serverTimestamp } from "firebase/firestore";

export class StudentService {

  // Single source of truth for all candidate data normalization.
  // All recruiter and student views must use this to avoid Firestore field mismatch crashes.
  static normalizeCandidate(data: any, fallbackId = "") {
    return {
      id: data?.uid || data?.id || fallbackId,
      name: data?.fullName || data?.displayName || data?.name || "Anonymous Student",
      avatar: data?.photoURL || data?.avatar || "/default-avatar.png",
      institution: data?.institution || data?.university || "Unknown Institution",
      university: data?.institution || data?.university || "Unknown Institution",
      degree: data?.degree || data?.major || "Not Provided",
      major: data?.degree || data?.major || "Not Provided",
      graduationYear: data?.graduationYear || new Date().getFullYear().toString(),
      trustScore: data?.trustScore || 0,
      skills: Array.isArray(data?.skills) ? data.skills : [],
      achievements: Array.isArray(data?.achievements) ? data.achievements : [],
      academicRecords: Array.isArray(data?.academicRecords) ? data.academicRecords : [],
      isDigiLockerConnected: data?.isDigiLockerConnected || false,
      profileCompletion: data?.profileCompletion || 20,
      location: data?.location || "Remote",
      interests: Array.isArray(data?.interests) ? data.interests : ["Full-Stack Development"],
      projects: Array.isArray(data?.projects) ? data.projects : []
    };
  }

  static async updateProfilerData(studentId: string, data: { location: string; interests: string[]; projects: any[] }) {
    try {
      const docRef = doc(db, "students", studentId);
      await setDoc(docRef, {
        location: data.location,
        interests: data.interests,
        projects: data.projects,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error("Error in updateProfilerData:", error);
      return { success: false, error };
    }
  }

  static async getProfile(studentId: string) {
    try {
      const docRef = doc(db, "students", studentId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return StudentService.normalizeCandidate({ ...docSnap.data() }, studentId);
      }
      // No document found — return fully safe defaults
      console.warn(`StudentService: No profile found for id="${studentId}". Returning defaults.`);
      return StudentService.normalizeCandidate({}, studentId);
    } catch (error) {
      console.error("StudentService.getProfile error:", error);
      return StudentService.normalizeCandidate({}, studentId);
    }
  }

 static async getAcademicRecords(studentId: string) {
 try {
 const q = query(collection(db, "academic_records"), where("studentId", "==", studentId));
 const querySnapshot = await getDocs(q);
 
 const records: any[] = [];
 querySnapshot.forEach((doc) => {
 records.push({ id: doc.id, ...doc.data() });
 });
 return records;
 } catch (error) {
 console.error("Error fetching academic records:", error);
 return [];
 }
 }

 static async connectDigiLocker(studentId: string) {
 try {
    // Create CBSE Class 10 Record
    await setDoc(doc(db, "academic_records", `${studentId}_cbse10`), {
      studentId,
      type: "Class 10 Marksheet",
      board: "CBSE",
      percentage: "96.4%",
      year: "2020",
      score: "96.4%", // For UI compatibility
      verified: true,
      verifiedBy: "DigiLocker",
      source: "DigiLocker"
    });

    // Create CBSE Class 12 Record
    await setDoc(doc(db, "academic_records", `${studentId}_cbse12`), {
      studentId,
      type: "Class 12 Marksheet",
      board: "CBSE",
      percentage: "95.8%",
      year: "2022",
      score: "95.8%", // For UI compatibility
      verified: true,
      verifiedBy: "DigiLocker",
      source: "DigiLocker"
    });

    // Create Transfer Certificate
    await setDoc(doc(db, "academic_records", `${studentId}_transfer`), {
      studentId,
      type: "Transfer Certificate",
      board: "Delhi Public School",
      percentage: "N/A",
      year: "2022",
      score: "N/A", // For UI compatibility
      verified: true,
      verifiedBy: "DigiLocker",
      source: "DigiLocker"
    });

 // Update student profile to mark DigiLocker connected
 await setDoc(doc(db, "students", studentId), {
 isDigiLockerConnected: true,
 profileCompletion: 40 // Increase profile completion
 }, { merge: true });

 return { success: true };
 } catch (error) {
 console.error("Error simulating DigiLocker connection:", error);
 return { success: false, error };
 }
 }
}
