import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";

export interface ProofDocument {
  id: string;
  studentId: string;
  title: string;
  documentType: string;
  fileUrl: string;
  fileName: string;
  uploadedAt: any;
  verified: boolean;
  issuer?: string;
  impact?: string;
}

export class ProofDocumentService {
  /**
   * Securely uploads a proof file to Cloudinary and saves metadata to Firestore.
   */
  static async uploadProofDocument(
    studentId: string,
    data: { file: File; title: string; documentType: string; issuer?: string; impact?: string }
  ): Promise<{ success: boolean; id?: string; fileUrl?: string; error?: string }> {
    try {
      if (!data.file) {
        throw new Error("No file provided");
      }

      // 1. Upload file via Next.js API Route (Cloudinary)
      const formData = new FormData();
      formData.append("file", data.file);

      // DIAGNOSTIC LOG
      console.log("CALLING API");

      const response = await fetch("/api/upload-document", {
        method: "POST",
        body: formData,
      });

      const uploadData = await response.json();

      // DIAGNOSTIC LOG
      console.log("API RESPONSE", uploadData);

      if (!response.ok || !uploadData.success) {
        throw new Error(uploadData.error || "Cloudinary upload failed");
      }

      const fileUrl = uploadData.url;
      const fileName = data.file.name;

      // 2. Save document metadata in Firestore proof_documents collection
      const docRef = doc(collection(db, "proof_documents"));
      
      const payload = {
        id: docRef.id,
        studentId,
        title: data.title,
        documentType: data.documentType,
        fileUrl,
        fileName,
        uploadedAt: serverTimestamp(),
        verified: false,
        issuer: data.issuer || "",
        impact: data.impact || "",
      };

      await setDoc(docRef, payload);

      // DIAGNOSTIC LOG
      console.log("FIRESTORE SAVE SUCCESS");

      return { success: true, id: docRef.id, fileUrl };
    } catch (error: any) {
      console.error("Error in uploadProofDocument:", error);
      return { success: false, error: error.message || "Failed to upload document" };
    }
  }

  /**
   * Fetches all proof documents for a specific student.
   * Fetches matching documents and sorts them client-side by uploadedAt to avoid index issues.
   */
  static async getProofDocuments(studentId: string): Promise<ProofDocument[]> {
    try {
      const q = query(
        collection(db, "proof_documents"),
        where("studentId", "==", studentId)
      );
      const querySnapshot = await getDocs(q);

      const documents: ProofDocument[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        documents.push({
          id: doc.id,
          studentId: data.studentId || studentId,
          title: data.title || "Untitled Document",
          documentType: data.documentType || "Certificate",
          fileUrl: data.fileUrl || "",
          fileName: data.fileName || "",
          uploadedAt: data.uploadedAt || null,
          verified: data.verified || false,
          issuer: data.issuer || "",
          impact: data.impact || "",
        });
      });

      // Sort client-side: descending by uploadedAt timestamp seconds
      documents.sort((a, b) => {
        const timeA = a.uploadedAt?.seconds || 0;
        const timeB = b.uploadedAt?.seconds || 0;
        return timeB - timeA;
      });

      return documents;
    } catch (error) {
      console.error("Error fetching proof documents:", error);
      return [];
    }
  }
}
