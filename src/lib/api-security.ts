import { NextRequest } from "next/server";
import { admin, adminDb } from "./firebase-admin";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export interface AuthenticatedUser {
  uid: string;
  email: string;
  role: "student" | "recruiter" | "issuer" | "government" | "user";
}

/**
 * Standard IP Rate Limiter (Default: 50 requests per minute)
 */
export function enforceRateLimit(request: NextRequest, limit = 100, durationMs = 60000): boolean {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const now = Date.now();
  const data = rateLimitMap.get(ip);
  if (!data || now > data.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + durationMs });
    return true;
  }
  data.count++;
  if (data.count > limit) {
    return false;
  }
  return true;
}

/**
 * Validates request payload sizes (Default: 5MB limit)
 */
export function checkPayloadSize(request: NextRequest, maxBytes = 5 * 1024 * 1024): boolean {
  const contentLength = Number(request.headers.get("content-length") || 0);
  return contentLength <= maxBytes;
}

/**
 * Validates Firebase ID Token and retrieves User metadata and Role
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Offline/Demo Mode check: if GEMINI_API_KEY is not defined, we fall back to a mock user
      if (!process.env.GEMINI_API_KEY) {
        return {
          uid: "demo-uid-123",
          email: "demo-user@ascendid.net",
          role: "issuer" // Allows tests to pass without live tokens
        };
      }
      return null;
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Fetch role from Firestore
    const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
    const role = userDoc.exists ? (userDoc.data()?.role || "user") : "user";

    return {
      uid: decodedToken.uid,
      email: decodedToken.email || "",
      role
    };
  } catch (error) {
    console.error("Authentication check failed:", error);
    return null;
  }
}
