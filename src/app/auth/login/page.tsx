"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { login, loginWithGoogle } = useAuth();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await login(email, password);
      
      // Wait for auth state to reflect and check Firestore user role
      const { auth } = await import("@/lib/firebase");
      // Add a small delay if auth.currentUser is not yet populated
      let uid = auth.currentUser?.uid;
      if (!uid) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        uid = auth.currentUser?.uid;
      }
      
      if (uid) {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const role = userDoc.data().role;
          if (role === "issuer") {
            router.push("/issuer/dashboard");
            return;
          } else if (role === "recruiter") {
            router.push("/recruiter/dashboard");
            return;
          }
        }
      }
      router.push("/student/dashboard");
    } catch (error) {
      console.error("Login failed", error);
      setIsLoading(false);
    }
  };

 return (
 <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
 <div className="absolute top-0 inset-x-0 h-full w-full overflow-hidden pointer-events-none z-0">
 <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full blur-[100px]" />
 </div>

 <div className="w-full max-w-md relative z-10">
 <div className="flex justify-center mb-8">
 <Link href="/" className="flex flex-col items-center gap-2">
 <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2 overflow-hidden">
 <img src="/assets/logo.png" alt="AscendID Logo" className="w-10 h-10 object-contain" />
 </div>
 <span className="text-2xl font-bold tracking-tight text-white">AscendID</span>
 </Link>
 </div>

 <Card className="surface-panel ">
 <CardHeader>
 <CardTitle className="text-2xl text-center text-white">Welcome back</CardTitle>
 <CardDescription className="text-center">
 Enter your credentials to access your account
 </CardDescription>
 </CardHeader>
 <form onSubmit={handleLogin}>
 <CardContent className="space-y-4">
 <div className="space-y-2">
 <Label htmlFor="email" className="text-muted-foreground">Email</Label>
 <Input id="email" name="email" type="email" placeholder="student@university.edu" required className="bg-background/50 focus-visible:ring-primary text-white" />
 </div>
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <Label htmlFor="password" className="text-muted-foreground">Password</Label>
 <Link href="#" className="text-sm text-primary hover:underline">Forgot password?</Link>
 </div>
 <Input id="password" name="password" type="password" required className="bg-background/50 focus-visible:ring-primary text-white" />
 </div>
 </CardContent>
 <CardFooter className="flex flex-col space-y-4">
 <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
 {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign in"}
 </Button>
 
 <div className="relative w-full">
 <div className="absolute inset-0 flex items-center">
 <span className="w-full border-t " />
 </div>
 <div className="relative flex justify-center text-xs uppercase">
 <span className="bg-background/50 px-2 text-muted-foreground">Or</span>
 </div>
 </div>
 
 <Button 
 type="button" 
 variant="outline" 
 className="w-full bg-background/50 text-white hover:bg-background/80"
 onClick={async () => {
 try {
 await loginWithGoogle();
 router.push("/student/dashboard");
 } catch (error) {
 console.error("Google login failed", error);
 }
 }}
 >
 Continue with Google
 </Button>

 <div className="text-center text-sm text-muted-foreground">
 Don't have an account?{" "}
 <Link href="/auth/signup" className="text-primary hover:underline">
 Sign up
 </Link>
 </div>
 </CardFooter>
 </form>
 </Card>
 </div>
 </div>
 );
}
