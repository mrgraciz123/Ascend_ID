"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Trophy, Sparkles, Building2, MapPin, FileText, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StudentService } from "@/services/student";
import { OpportunityService } from "@/services/opportunity";
import { AchievementService } from "@/services/achievement";
import { TrustScoreService } from "@/services/trust-score";
import { DigiLockerConnect } from "@/components/DigiLockerConnect";

import { useCallback } from "react";

export default function StudentDashboard() {
 const [loading, setLoading] = useState(true);
 const [student, setStudent] = useState<any>(null);
 const [records, setRecords] = useState<any[]>([]);
 const [achievements, setAchievements] = useState<any[]>([]);
 const [opportunities, setOpportunities] = useState<any[]>([]);
 const [trustScoreData, setTrustScoreData] = useState<any>(null);

 const { currentUser } = useAuth();

 const loadAuthenticatedData = useCallback(async () => {
 if (!currentUser) return;
 const uid = currentUser.uid;
 setLoading(true);
 const [rec, ach, opps, score] = await Promise.all([
 StudentService.getAcademicRecords(uid),
 AchievementService.getAchievements(uid),
 OpportunityService.getRecommendations(uid),
 TrustScoreService.getScore(uid)
 ]);
 setRecords(rec);
 setAchievements(ach);
 setOpportunities(opps);
 setTrustScoreData(score);
 setStudent((prev: any) => ({ ...(prev || {}), isDigiLockerConnected: true }));
 setLoading(false);
 }, [currentUser]);

 useEffect(() => {
 async function loadStudent() {
 if (!currentUser) return;
 const s = await StudentService.getProfile(currentUser.uid);
 setStudent(s);
 
 if (s?.isDigiLockerConnected) {
 await loadAuthenticatedData();
 } else {
 setLoading(false);
 }
 }
 if (currentUser) {
 loadStudent();
 }
 }, [currentUser, loadAuthenticatedData]);

 const handleDigiLockerComplete = () => {
 loadAuthenticatedData();
 };

 if (loading) {
 return (
 <div className="flex h-[60vh] items-center justify-center">
 <Loader2 className="w-8 h-8 text-primary animate-spin" />
 </div>
 );
 }

 if (!student?.isDigiLockerConnected) {
 return (
 <div className="max-w-2xl mx-auto mt-12 animate-in fade-in duration-500">
 <div className="text-center mb-8">
 <h1 className="text-3xl font-bold text-white tracking-tight">Welcome, {student?.name.split(" ")[0]}</h1>
 <p className="text-muted-foreground mt-2">Let's establish your verified academic identity.</p>
 </div>
 <DigiLockerConnect onComplete={handleDigiLockerComplete} />
 </div>
 );
 }

 return (
 <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
 <p className="text-muted-foreground mt-1">Welcome back, {student.name}. Here's your verified overview.</p>
 </div>
 <Link href="/student/passport">
 <Button className="bg-primary hover:bg-primary/90 text-white ">
 View Digital Passport <ArrowRight className="w-4 h-4 ml-2" />
 </Button>
 </Link>
 </div>

 <div className="grid gap-6 md:grid-cols-3">
 <Card className="surface-panel relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[40px] group-hover:bg-primary/20 transition-colors" />
 <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
 <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Potential Score</CardTitle>
 <ShieldCheck className="h-5 w-5 text-primary" />
 </CardHeader>
 <CardContent className="relative z-10">
 <div className="text-4xl font-bold text-white">{trustScoreData?.total}</div>
 <p className="text-sm text-green-400 mt-2 flex items-center font-medium">
 Top 5% of verified candidates
 </p>
 </CardContent>
 </Card>
 
 <Card className="surface-panel ">
 <CardHeader className="flex flex-row items-center justify-between pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Verified Proofs</CardTitle>
 <Trophy className="h-5 w-5 text-indigo-400" />
 </CardHeader>
 <CardContent>
 <div className="text-4xl font-bold text-white">{achievements.filter(a => a.verified).length}</div>
 <p className="text-sm text-muted-foreground mt-2">
 Across academics & internships
 </p>
 </CardContent>
 </Card>

 <Card className="surface-panel ">
 <CardHeader className="flex flex-row items-center justify-between pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">AI Matches</CardTitle>
 <Sparkles className="h-5 w-5 text-amber-400" />
 </CardHeader>
 <CardContent>
 <div className="text-4xl font-bold text-white">{opportunities.length}</div>
 <p className="text-sm text-muted-foreground mt-2">
 Based on verified skills
 </p>
 </CardContent>
 </Card>
 </div>

 <div className="grid gap-6 md:grid-cols-2">
 <Card className="surface-panel ">
 <CardHeader>
 <CardTitle className="text-lg text-white flex items-center gap-2">
 <FileText className="w-5 h-5 text-green-400" />
 Verified Academic Records
 </CardTitle>
 <CardDescription>Imported securely via DigiLocker</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 {records.map(record => (
 <div key={record.id as string} className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border/30">
 <div>
 <p className="font-semibold text-white">{record.type}</p>
 <p className="text-xs text-muted-foreground">{record.board} • {record.year}</p>
 </div>
 <div className="text-right">
 <p className="font-bold text-primary">{record.score}</p>
 <p className="text-[10px] text-green-400 flex items-center justify-end mt-1 uppercase tracking-widest font-semibold">
 <CheckCircle2 className="w-3 h-3 mr-1" /> {record.verifiedBy}
 </p>
 </div>
 </div>
 ))}
 </CardContent>
 </Card>

 <Card className="surface-panel ">
 <CardHeader>
 <CardTitle className="text-lg text-white">Top Opportunities</CardTitle>
 <CardDescription>AI recommendations based on your Trust Score</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 {opportunities.slice(0, 3).map(opp => (
 <div key={opp.id as string} className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover: transition-colors group cursor-pointer">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center p-1 shrink-0 overflow-hidden relative">
  <img
  src={opp.logo || "/default-company.png"}
  alt={opp.company || "Company"}
  className="object-contain w-full h-full"
  onError={(e) => { e.currentTarget.src = "/default-company.png"; }}
  />
 </div>
 <div>
 <p className="font-medium text-white group-hover:text-primary transition-colors">{opp.title}</p>
 <div className="flex items-center text-xs text-muted-foreground gap-2 mt-0.5">
 <span className="flex items-center"><Building2 className="w-3 h-3 mr-1" /> {opp.company}</span>
 </div>
 </div>
 </div>
 <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 ">
 {opp.matchScore}% Match
 </Badge>
 </div>
 ))}
 </CardContent>
 </Card>
 </div>
 </div>
 );
}
