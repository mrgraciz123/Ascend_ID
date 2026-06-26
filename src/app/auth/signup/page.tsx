"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Loader2, UserCircle, Briefcase } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "recruiter" ? "recruiter" : (searchParams.get("role") === "issuer" ? "issuer" : "student");

  const { signup, loginWithGoogle } = useAuth();

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>, role: string) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const issuerType = (formData.get("issuerType") as string) || "";

    try {
      await signup(email, password, name, role, issuerType);
      if (role === "student") {
        router.push("/student/dashboard");
      } else if (role === "issuer") {
        router.push("/issuer/dashboard");
      } else {
        router.push("/recruiter/dashboard");
      }
    } catch (error) {
      console.error("Signup failed", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10">
      <div className="flex justify-center mb-8">
        <Link href="/" className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2 overflow-hidden">
            <img src="/assets/logo.png" alt="AscendID Logo" className="w-10 h-10 object-contain" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">AscendID</span>
        </Link>
      </div>

      <Tabs defaultValue={defaultRole} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4 bg-background/50 border">
          <TabsTrigger value="student" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <UserCircle className="w-4 h-4 mr-1 md:mr-2" /> Student
          </TabsTrigger>
          <TabsTrigger value="recruiter" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Briefcase className="w-4 h-4 mr-1 md:mr-2" /> Recruiter
          </TabsTrigger>
          <TabsTrigger value="issuer" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <ShieldCheck className="w-4 h-4 mr-1 md:mr-2" /> Issuer
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="student">
          <Card className="surface-panel ">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-white">Create your Passport</CardTitle>
              <CardDescription className="text-center">
                Start verifying your achievements today
              </CardDescription>
            </CardHeader>
            <form onSubmit={(e) => handleSignup(e, "student")}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name-student" className="text-muted-foreground">Full Name</Label>
                  <Input id="name-student" name="name" placeholder="Alex Rivera" required className="bg-background/50 focus-visible:ring-primary text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-student" className="text-muted-foreground">University Email</Label>
                  <Input id="email-student" name="email" type="email" placeholder="student@university.edu" required className="bg-background/50 focus-visible:ring-primary text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-student" className="text-muted-foreground">Password</Label>
                  <Input id="password-student" name="password" type="password" required className="bg-background/50 focus-visible:ring-primary text-white" />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Student Account"}
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
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="recruiter">
          <Card className="surface-panel ">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-white">Discover Talent</CardTitle>
              <CardDescription className="text-center">
                Find verified candidates instantly
              </CardDescription>
            </CardHeader>
            <form onSubmit={(e) => handleSignup(e, "recruiter")}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name-recruiter" className="text-muted-foreground">Company Name</Label>
                  <Input id="name-recruiter" name="name" placeholder="Acme Corp" required className="bg-background/50 focus-visible:ring-primary text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-recruiter" className="text-muted-foreground">Work Email</Label>
                  <Input id="email-recruiter" name="email" type="email" placeholder="recruiter@acmecorp.com" required className="bg-background/50 focus-visible:ring-primary text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-recruiter" className="text-muted-foreground">Password</Label>
                  <Input id="password-recruiter" name="password" type="password" required className="bg-background/50 focus-visible:ring-primary text-white" />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Recruiter Account"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="issuer">
          <Card className="surface-panel ">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-white">Institution Portal</CardTitle>
              <CardDescription className="text-center">
                Issue & verify credentials officially
              </CardDescription>
            </CardHeader>
            <form onSubmit={(e) => handleSignup(e, "issuer")}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name-issuer" className="text-muted-foreground">Institution Name</Label>
                  <Input id="name-issuer" name="name" placeholder="Stanford University" required className="bg-background/50 focus-visible:ring-primary text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issuer-type" className="text-muted-foreground">Institution Type</Label>
                  <select 
                    id="issuer-type" 
                    name="issuerType" 
                    required
                    className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus-visible:ring-primary"
                  >
                    <option className="bg-neutral-900 text-white" value="university">University</option>
                    <option className="bg-neutral-900 text-white" value="company">Company / Employer</option>
                    <option className="bg-neutral-900 text-white" value="hackathon">Hackathon Organizer</option>
                    <option className="bg-neutral-900 text-white" value="certifier">Certification Provider</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-issuer" className="text-muted-foreground">Official Email</Label>
                  <Input id="email-issuer" name="email" type="email" placeholder="admin@stanford.edu" required className="bg-background/50 focus-visible:ring-primary text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-issuer" className="text-muted-foreground">Password</Label>
                  <Input id="password-issuer" name="password" type="password" required className="bg-background/50 focus-visible:ring-primary text-white" />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Issuer Account"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-primary hover:underline">
          Log in
        </Link>
      </div>
    </div>
  );
}

export default function SignupPage() {
 return (
 <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
 <div className="absolute top-0 inset-x-0 h-full w-full overflow-hidden pointer-events-none z-0">
 <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] rounded-full blur-[100px]" />
 </div>

 <Suspense fallback={<div className="w-full max-w-md flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>}>
 <SignupForm />
 </Suspense>
 </div>
 );
}
