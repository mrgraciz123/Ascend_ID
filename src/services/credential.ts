import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  orderBy
} from "firebase/firestore";

export interface Credential {
  id: string; // UUID
  issuerId: string;
  issuerName: string;
  issuerType: "university" | "company" | "hackathon" | "certifier";
  studentName: string;
  studentEmail: string;
  studentId: string; // If student is registered, else empty string
  title: string;
  description: string;
  credentialType: "degree" | "diploma" | "experience" | "internship" | "achievement" | "certification" | "badge";
  issueDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD or "Never"
  verificationStatus: "issued" | "revoked";
  revocationReason?: string;
  revokedAt?: any;
  digitalSignature: string;
  blockchainHash: string;
  qrCodeUrl: string;
  w3cData?: any;
  metadataHash?: string;
  blockchain?: {
    chainId: number;
    contractAddress: string;
    transactionHash: string;
    blockNumber: number;
    issuerWallet: string;
    verificationStatus: string;
    anchoredAt: string;
  };
  auditTrail?: Array<{
    status: string;
    timestamp: string;
    transactionHash: string;
    details: string;
  }>;
  createdAt: any;
  updatedAt: any;
}

export class CredentialService {
  /**
   * Helper to generate a unique digital signature for a credential.
   */
  static generateSignature(payload: {
    id: string;
    issuerId: string;
    studentEmail: string;
    credentialType: string;
    title: string;
    issueDate: string;
  }): string {
    const rawData = `${payload.id}|${payload.issuerId}|${payload.studentEmail}|${payload.credentialType}|${payload.title}|${payload.issueDate}|ASCENDID_SECURE_SALT_2026`;
    
    // Simple custom hash function to generate a hex signature resembling a SHA-256 signature
    let hash1 = 0x811c9dc5;
    let hash2 = 0xcbf29ce4;
    for (let i = 0; i < rawData.length; i++) {
      const char = rawData.charCodeAt(i);
      hash1 = (hash1 ^ char) * 16777619;
      hash2 = (hash2 ^ char) * 16777619;
    }
    
    const hex1 = (hash1 >>> 0).toString(16).padStart(8, "0");
    const hex2 = (hash2 >>> 0).toString(16).padStart(8, "0");
    const mockSignature = `0x${hex1}6fb729d3810${hex2}bca48f21789cdaeeef729a8f4c28198f`;
    return mockSignature;
  }

  /**
   * Helper to generate a simulated Ethereum/Polygon blockchain hash.
   */
  static generateBlockchainHash(): string {
    const chars = "0123456789abcdef";
    let hash = "0x";
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * 16)];
    }
    return hash;
  }

  /**
   * Issues a brand new credential via server-side secure anchoring.
   */
  static async issueCredential(data: {
    issuerId: string;
    issuerName: string;
    issuerType: Credential["issuerType"];
    studentName: string;
    studentEmail: string;
    title: string;
    description: string;
    credentialType: Credential["credentialType"];
    issueDate: string;
    expiryDate: string;
    issuerWallet?: string;
    documentUrl?: string;
    documentFraudReport?: any;
  }): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const response = await fetch("/api/credentials/anchor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to anchor credential via API");
      }
      return { success: true, id: result.id };
    } catch (error: any) {
      console.error("Error in issueCredential:", error);
      return { success: false, error: error.message || "Failed to issue credential" };
    }
  }

  /**
   * Links any unlinked credentials to a student when they register or when verified.
   */
  static async linkStudentToCredential(studentId: string, studentEmail: string): Promise<void> {
    try {
      const q = query(
        collection(db, "credentials"),
        where("studentEmail", "==", studentEmail.toLowerCase()),
        where("studentId", "==", "")
      );
      const snapshot = await getDocs(q);
      for (const d of snapshot.docs) {
        await updateDoc(doc(db, "credentials", d.id), {
          studentId,
          updatedAt: serverTimestamp()
        });
      }
    } catch (e) {
      console.error("Failed to link student credentials:", e);
    }
  }

  /**
   * Updates basic metadata of an active credential.
   */
  static async updateCredential(
    id: string,
    data: {
      title: string;
      description: string;
      expiryDate: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const docRef = doc(db, "credentials", id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Credential not found");
      }

      const cred = docSnap.data() as Credential;
      if (cred.verificationStatus === "revoked") {
        throw new Error("Cannot edit a revoked credential");
      }

      // Re-sign with updated title/metadata
      const digitalSignature = this.generateSignature({
        id: cred.id,
        issuerId: cred.issuerId,
        studentEmail: cred.studentEmail,
        credentialType: cred.credentialType,
        title: data.title,
        issueDate: cred.issueDate
      });

      await updateDoc(docRef, {
        title: data.title,
        description: data.description,
        expiryDate: data.expiryDate || "Never",
        digitalSignature,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error: any) {
      console.error("Error in updateCredential:", error);
      return { success: false, error: error.message || "Failed to update credential" };
    }
  }

  /**
   * Revokes a credential by marking it revoked with a reason via secure server-side API.
   */
  static async revokeCredential(id: string, reason: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch("/api/credentials/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id, reason })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to revoke credential via API");
      }
      return { success: true };
    } catch (error: any) {
      console.error("Error in revokeCredential:", error);
      return { success: false, error: error.message || "Failed to revoke credential" };
    }
  }

  /**
   * Fetches credentials issued by a specific issuer.
   */
  static async getIssuerCredentials(issuerId: string): Promise<Credential[]> {
    try {
      const q = query(
        collection(db, "credentials"),
        where("issuerId", "==", issuerId)
      );
      const snapshot = await getDocs(q);
      const list: Credential[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Credential);
      });
      
      // Sort client-side by createdAt
      return list.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
    } catch (error) {
      console.error("Error in getIssuerCredentials:", error);
      return [];
    }
  }

  /**
   * Fetches credentials issued to a student by email.
   */
  static async getStudentCredentials(studentEmail: string): Promise<Credential[]> {
    try {
      const q = query(
        collection(db, "credentials"),
        where("studentEmail", "==", studentEmail.toLowerCase())
      );
      const snapshot = await getDocs(q);
      const list: Credential[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Credential);
      });
      return list.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
    } catch (error) {
      console.error("Error in getStudentCredentials:", error);
      return [];
    }
  }

  /**
   * Fetches a single credential by ID.
   */
  static async getCredentialById(id: string): Promise<Credential | null> {
    try {
      const docRef = doc(db, "credentials", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Credential;
      }
      return null;
    } catch (error) {
      console.error("Error in getCredentialById:", error);
      return null;
    }
  }
}
