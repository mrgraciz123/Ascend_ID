"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { Settings as SettingsIcon, Bell, Shield, Key } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RecruiterSettings() {
 const { currentUser, logout } = useAuth();
 const [loading, setLoading] = useState(false);
 const router = useRouter();

 const handleSignOut = async () => {
   try {
     setLoading(true);
     await logout();
     router.push("/auth/login");
   } catch (error) {
     console.error("Sign out failed:", error);
     alert("Failed to sign out. Please try again.");
   } finally {
     setLoading(false);
   }
 };

 return (
 <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
 <SettingsIcon className="w-8 h-8 text-primary" />
 Recruiter Settings
 </h1>
 <p className="text-muted-foreground mt-1">Manage your organization preferences and security.</p>
 </div>
 </div>

 <div className="grid gap-6">
 <Card className="surface-panel ">
 <CardHeader>
 <CardTitle className="text-lg text-white flex items-center gap-2">
 <Shield className="w-5 h-5 text-indigo-400" />
 Organization Details
 </CardTitle>
 <CardDescription>Update your email address and organization information.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="space-y-2">
 <Label htmlFor="email" className="text-muted-foreground">Work Email Address</Label>
 <Input 
 id="email" 
 disabled 
 value={currentUser?.email || ""} 
 className="bg-background/50 text-white" 
 />
 <p className="text-xs text-muted-foreground mt-1">Your email is managed by your authentication provider.</p>
 </div>
 </CardContent>
 </Card>

 <Card className="surface-panel ">
 <CardHeader>
 <CardTitle className="text-lg text-white flex items-center gap-2">
 <Bell className="w-5 h-5 text-amber-400" />
 Notifications
 </CardTitle>
 <CardDescription>Manage your candidate alert notifications.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30">
 <div>
 <p className="font-semibold text-white">Talent Alerts</p>
 <p className="text-xs text-muted-foreground">Receive emails when candidates matching your criteria join.</p>
 </div>
 <Button variant="outline" size="sm" className=" bg-background/50 text-white hover:bg-background/80">
 Enabled
 </Button>
 </div>
 </CardContent>
 </Card>

 <Card className="surface-panel border-red-500/20">
 <CardHeader>
 <CardTitle className="text-lg text-red-400 flex items-center gap-2">
 <Key className="w-5 h-5" />
 Session
 </CardTitle>
 <CardDescription>Manage your current session.</CardDescription>
 </CardHeader>
 <CardContent>
 <Button 
 variant="destructive" 
 disabled={loading}
 onClick={handleSignOut}
 className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
 >
 Sign Out
 </Button>
 </CardContent>
 </Card>
 </div>
 </div>
 );
}
