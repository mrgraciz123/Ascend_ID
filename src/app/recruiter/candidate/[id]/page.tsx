"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldCheck, MapPin, GraduationCap, Calendar, Download, ExternalLink, ArrowLeft, Mail, Bookmark, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { StudentService } from "@/services/student";
import { AchievementService } from "@/services/achievement";
import { TrustScoreService } from "@/services/trust-score";

export default function CandidateProfile({ params }: { params: Promise<{ id: string }> }) {
 const resolvedParams = use(params);
 
 const [loading, setLoading] = useState(true);
 const [student, setStudent] = useState<any>(null);
 const [records, setRecords] = useState<any[]>([]);
 const [achievements, setAchievements] = useState<any[]>([]);
 const [trustScore, setTrustScore] = useState<any>(null);

 useEffect(() => {
 async function load() {
 // In a real app we'd fetch the student based on resolvedParams.id
 const id = "student-123";
 const [s, rec, ach, score] = await Promise.all([
 StudentService.getProfile(id),
 StudentService.getAcademicRecords(id),
 AchievementService.getAchievements(id),
 TrustScoreService.getScore(id)
 ]);
 setStudent(s);
 setRecords(rec);
 setAchievements(ach);
 setTrustScore(score);
 setLoading(false);
 }
 load();
 }, []);

 if (loading) {
 return (
 <div className="flex h-[60vh] items-center justify-center">
 <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
 </div>
 );
 }

 const verifiedAchievements = (achievements || []).filter((a: any) => a?.verified);

 return (
 <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
 <div className="flex items-center gap-4">
 <Link href="/recruiter/dashboard">
 <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
 <ArrowLeft className="w-5 h-5" />
 </Button>
 </Link>
 <div>
 <h1 className="text-xl font-bold text-white tracking-tight">Back to Search</h1>
 </div>
 </div>

 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <h1 className="text-3xl font-bold text-white tracking-tight">Candidate Profile</h1>
 </div>
 <div className="flex gap-2">
 <Button variant="outline" className=" text-white bg-background/50 hover:bg-white/5">
 <Bookmark className="w-4 h-4 mr-2" />
 Shortlist
 </Button>
 <Button className="bg-primary hover:bg-primary/90 text-white ">
 <Mail className="w-4 h-4 mr-2" />
 Contact Candidate
 </Button>
 </div>
 </div>

 <Card className="surface-panel ">
 
 <CardContent className="p-8">
 <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
 <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
 <AvatarImage src={student.avatar} alt={student.name} />
 <AvatarFallback className="text-4xl bg-secondary">{(student?.name || student?.fullName || student?.displayName || "ST").substring(0, 2).toUpperCase()}</AvatarFallback>
 </Avatar>
 
 <div className="flex-1 space-y-4">
 <div>
 <div className="flex items-center gap-3">
 <h2 className="text-3xl font-bold text-white">{student.name}</h2>
 <Badge className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 shadow-sm">
 <ShieldCheck className="w-3 h-3 mr-1" />
 Identity Verified
 </Badge>
 </div>
 <p className="text-xl text-primary mt-1">{student.major}</p>
 </div>
 
 <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
 <div className="flex items-center gap-1.5">
 <GraduationCap className="w-4 h-4" />
 <span>{student.university}</span>
 </div>
 <div className="flex items-center gap-1.5">
 <Calendar className="w-4 h-4" />
 <span>Class of {student.graduationYear}</span>
 </div>
 <div className="flex items-center gap-1.5">
 <MapPin className="w-4 h-4" />
 <span>India</span>
 </div>
 </div>

 <div className="flex flex-wrap gap-2 pt-2">
 {(student.skills || []).map((skill: string) => (
 <Badge key={skill} variant="secondary" className="bg-white/5 hover:bg-white/10 text-white border-white/10">
 {skill}
 </Badge>
 ))}
 </div>
 </div>

 <div className="w-full md:w-auto p-6 rounded-2xl border border-border bg-background flex flex-col items-center justify-center min-w-[200px] shadow-none">
  <ShieldCheck className="w-8 h-8 text-trust mb-2" />
  <span className="text-sm text-trust uppercase tracking-wider font-semibold">CIBIL Score for Talent</span>
  <span className="text-5xl font-black text-trust mt-1">{trustScore.total}</span>
  <span className="text-xs text-success mt-2 font-medium">Top 2% Nationally</span>
  </div>
 </div>
 </CardContent>
 </Card>

 <div className="grid gap-6 md:grid-cols-2">
 <Card className="surface-panel border-green-500/30 bg-green-500/5">
 <CardHeader className="pb-2">
 <CardTitle className="text-lg text-green-400 flex items-center gap-2">
 <CheckCircle2 className="w-5 h-5" />
 Trust Profile: Highly Reliable
 </CardTitle>
 </CardHeader>
 <CardContent>
 <p className="text-sm text-muted-foreground">This candidate has linked their government academic identity (DigiLocker). You can trust this candidate's foundational credentials with absolute cryptographic certainty.</p>
 </CardContent>
 </Card>

  <Card className="surface-panel border-amber-500/30 bg-amber-500/5">
  <CardHeader className="pb-2">
  <CardTitle className="text-lg text-amber-500 flex items-center gap-2">
  <ShieldCheck className="w-5 h-5" />
  Risk Indicators: Check Logs
  </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
  <p className="text-sm text-muted-foreground">Run layout tampering analyses, verify signature registers, check duplicate timelines, and audit expired W3C credentials.</p>
  <div className="pt-2 border-t border-amber-500/10">
  <Link href={`/recruiter/candidate/${student.id}/fraud`}>
  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black text-xs font-semibold h-9">
  Run AI Fraud Analysis <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
  </Button>
  </Link>
  </div>
  </CardContent>
  </Card>
 </div>

 <div className="space-y-4">
 <h3 className="text-xl font-bold text-white flex items-center gap-2">
 <ShieldCheck className="w-5 h-5 text-green-400" />
 Verified Academic Records
 </h3>
 <p className="text-sm text-muted-foreground mb-4">
 Fetched directly from government databases (DigiLocker). 100% authentic.
 </p>
 <div className="grid gap-4 md:grid-cols-2">
 {(records || []).map((record: any) => (
 <Card key={record.id} className="surface-panel hover: transition-colors">
 <CardContent className="p-6">
 <div className="flex justify-between items-start">
 <div>
 <h3 className="text-xl font-semibold text-white">{record.type}</h3>
 <p className="text-muted-foreground mt-1">{record.board} • {record.year}</p>
 </div>
 <Badge className="bg-green-500/10 text-green-400 border-green-500/20 shadow-sm">
 {record.score}
 </Badge>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>

 <div className="space-y-4">
 <h3 className="text-xl font-bold text-white flex items-center gap-2">
 <ShieldCheck className="w-5 h-5 text-primary" />
 Verified Experiences & Achievements
 </h3>
 <p className="text-sm text-muted-foreground mb-4">
 All records below have been cryptographically verified directly with the issuing institution.
 </p>

 {(verifiedAchievements || []).map((ach: any) => (
 <Card key={ach.id} className="surface-panel hover: transition-colors">
 <CardContent className="p-6">
 <div className="flex flex-col md:flex-row justify-between gap-4">
 <div className="flex-1 space-y-2">
 <div className="flex items-center gap-3">
 <h3 className="text-xl font-semibold text-white">{ach.title}</h3>
 <Badge className=" text-primary ">{ach.type}</Badge>
 </div>
 <p className="text-muted-foreground">{ach.issuer} • {new Date(ach.date).toLocaleDateString()}</p>
 <p className="text-white mt-4 bg-white/5 p-4 rounded-lg border border-white/10">
 {ach.impact}
 </p>
 </div>
 <div className="flex flex-col items-end gap-4 min-w-[150px]">
 <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full text-sm font-medium border border-green-500/20">
 <CheckCircle2 className="w-4 h-4" />
 Verified True
 </div>
 <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
 View Cryptographic Proof <ExternalLink className="w-4 h-4 ml-2" />
 </Button>
 </div>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 );
}
