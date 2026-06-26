"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
 onAuthStateChanged, 
 signInWithEmailAndPassword, 
 createUserWithEmailAndPassword, 
 signInWithPopup,
 GoogleAuthProvider,
 signOut, 
 User 
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string, role?: string, issuerType?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
 return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
 const [currentUser, setCurrentUser] = useState<User | null>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const unsubscribe = onAuthStateChanged(auth, (user) => {
 setCurrentUser(user);
 setLoading(false);
 });

 return unsubscribe;
 }, []);

  const signup = async (email: string, password: string, fullName: string, role = "student", issuerType = "") => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: fullName,
      photoURL: user.photoURL || "",
      role: role,
      createdAt: serverTimestamp()
    });

    if (role === "student") {
      await setDoc(doc(db, "students", user.uid), {
        uid: user.uid,
        fullName: fullName,
        institution: "Pending Setup",
        degree: "Pending Setup",
        graduationYear: new Date().getFullYear().toString(),
        profileCompletion: 20
      });
      // Link any previously issued credentials
      try {
        const { CredentialService } = await import("@/services/credential");
        await CredentialService.linkStudentToCredential(user.uid, email);
      } catch (e) {
        console.error("Failed to link student credentials on signup:", e);
      }
    } else if (role === "issuer") {
      await setDoc(doc(db, "issuers", user.uid), {
        uid: user.uid,
        name: fullName,
        email: email,
        issuerType: issuerType,
        website: "",
        logo: "",
        verified: true,
        createdAt: serverTimestamp()
      });
    }
  };

 const loginWithGoogle = async () => {
 const provider = new GoogleAuthProvider();
 const userCredential = await signInWithPopup(auth, provider);
 const user = userCredential.user;

 const userDoc = await getDoc(doc(db, "users", user.uid));
 
 // Only create records if it's their first time
 if (!userDoc.exists()) {
 await setDoc(doc(db, "users", user.uid), {
 uid: user.uid,
 email: user.email,
 displayName: user.displayName || "Google User",
 photoURL: user.photoURL || "",
 role: "student",
 createdAt: serverTimestamp()
 });

 await setDoc(doc(db, "students", user.uid), {
 uid: user.uid,
 fullName: user.displayName || "Google User",
 institution: "Pending Setup",
 degree: "Pending Setup",
 graduationYear: new Date().getFullYear().toString(),
 profileCompletion: 20
 });
 }
 };

 const login = async (email: string, password: string) => {
 await signInWithEmailAndPassword(auth, email, password);
 };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("AuthContext: signOut failed:", error);
      throw error; // Re-throw so callers can handle it
    }
  };

 const value = {
 currentUser,
 loading,
 login,
 signup,
 loginWithGoogle,
 logout
 };

 return (
 <AuthContext.Provider value={value}>
 {!loading && children}
 </AuthContext.Provider>
 );
}
