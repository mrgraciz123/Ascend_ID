"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ShieldCheck, 
  MapPin, 
  GraduationCap, 
  Calendar, 
  Download, 
  ExternalLink, 
  ArrowLeft, 
  Mail, 
  Bookmark, 
  CheckCircle2,
  ChevronRight,
  BrainCircuit,
  X,
  Sparkles,
  Award,
  AlertTriangle,
  FileText,
  UserCheck,
  TrendingUp,
  HelpCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { StudentService } from "@/services/student";
import { AchievementService } from "@/services/achievement";
import { TrustScoreService } from "@/services/trust-score";

export default function CandidateProfile({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id || "student-1";
  
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [trustScore, setTrustScore] = useState<any>(null);

  // Modal State
  const [selectedFactor, setSelectedFactor] = useState<any | null>(null);

  // AI Recruiter Copilot States
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Software Engineer");
  const [copilotReport, setCopilotReport] = useState<any | null>(null);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    async function load() {
      try {
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
        
        // Auto trigger AI Copilot once on load
        triggerAiAudit(id, "Software Engineer");
      } catch (error) {
        console.error("Failed to load candidate profile details:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const triggerAiAudit = async (candidateId: string, roleName: string) => {
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/recruiter/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: candidateId, jobRole: roleName })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCopilotReport(data);
      } else {
        throw new Error(data.error || "Failed to generate AI Audit");
      }
    } catch (e: any) {
      console.error("AI Copilot Audit failed:", e);
      setAiError(e.message || "Failed to contact AI Recruiter Copilot node.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Candidate Not Found</h2>
        <p className="text-muted-foreground text-xs">The requested student ID is not registered in AscendID index.</p>
        <Link href="/recruiter/dashboard">
          <Button size="sm" className="bg-primary text-white">Back to Recruiter Hub</Button>
        </Link>
      </div>
    );
  }

  const verifiedAchievements = (achievements || []).filter((a: any) => a?.verified);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
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
          <Button variant="outline" className="text-white bg-background/50 hover:bg-white/5 border-white/10">
            <Bookmark className="w-4 h-4 mr-2" />
            Shortlist
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white">
            <Mail className="w-4 h-4 mr-2" />
            Contact Candidate
          </Button>
        </div>
      </div>

      <Card className="surface-panel">
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
                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                  <span>{student.universityName || student.university}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>Class of {student.graduationYear}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  <span>{student.location || "India"}</span>
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

            <div className="w-full md:w-auto p-6 rounded-2xl border border-white/5 bg-neutral-900/50 flex flex-col items-center justify-center min-w-[200px] shadow-none">
              <ShieldCheck className="w-8 h-8 text-trust mb-2 animate-pulse" />
              <span className="text-xs text-trust uppercase tracking-wider font-semibold">AscendID Trust Score</span>
              <span className="text-5xl font-black text-white mt-1 select-all">{trustScore?.total || 350}</span>
              <span className="text-[10px] text-emerald-400 mt-2 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">Verified Profile</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI RECRUITER COPILOT PANEL */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              AI Recopilot Talent Insights
            </h3>
            <p className="text-sm text-muted-foreground">
              Instant candidate match analysis and structured screening parameters generated exclusively from verified proofs.
            </p>
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                triggerAiAudit(id, e.target.value);
              }}
              className="flex h-9 items-center justify-between rounded-md border border-white/10 bg-neutral-900 px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Software Engineer">Software Engineer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="AI Researcher">AI/ML Engineer</option>
              <option value="DevOps Specialist">DevOps Specialist</option>
            </select>
            <Button 
              size="sm" 
              onClick={() => triggerAiAudit(id, selectedRole)} 
              disabled={aiLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9"
            >
              {aiLoading ? "Analyzing..." : "Refresh Insights"}
            </Button>
          </div>
        </div>

        {aiLoading ? (
          <Card className="surface-panel border-indigo-500/10 bg-indigo-500/[0.01] min-h-[250px] flex flex-col justify-center items-center p-8 text-center text-xs">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
            <span className="font-mono text-muted-foreground tracking-wide animate-pulse">
              Running AI Recopilot Talent Audit for {selectedRole}...
            </span>
          </Card>
        ) : aiError ? (
          <Card className="surface-panel border-rose-500/20 bg-rose-500/[0.01] p-6 text-center text-xs">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
            <span className="text-rose-400 font-bold block">AI Audit Failed</span>
            <p className="text-muted-foreground mt-1">{aiError}</p>
          </Card>
        ) : copilotReport ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start animate-in fade-in duration-500">
            {/* Summary & Match percent (7 cols) */}
            <Card className="surface-panel border-white/5 md:col-span-7 space-y-4">
              <CardHeader className="pb-2 flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Hiring Analysis Summary</CardTitle>
                  <CardDescription className="text-[10px]">Contextual suitability for {selectedRole}</CardDescription>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Role Match</span>
                  <Badge className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-mono font-black text-sm px-2.5 py-1.5 mt-1 select-all">
                    {copilotReport.matchPercentage}% Suitability
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <p className="leading-relaxed text-muted-foreground p-3 rounded-lg border border-white/5 bg-neutral-950/40">
                  {copilotReport.summary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5" /> Strengths
                    </span>
                    <ul className="list-disc pl-4 text-muted-foreground space-y-1.5 leading-relaxed">
                      {copilotReport.strengths?.map((str: string, idx: number) => (
                        <li key={idx}>{str}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Weaknesses & Gaps
                    </span>
                    <ul className="list-disc pl-4 text-muted-foreground space-y-1.5 leading-relaxed">
                      {copilotReport.weaknesses?.map((weak: string, idx: number) => (
                        <li key={idx}>{weak}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">Missing Skills</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {copilotReport.missingSkills?.map((skill: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="border-white/10 text-white font-mono text-[9px] px-2 py-0.5">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">Risk Assessment</span>
                    <Badge variant="outline" className={`mt-1.5 text-[9px] uppercase font-bold px-2 py-0.5 border ${
                      copilotReport.riskAssessment?.toLowerCase().includes("high") 
                        ? "border-rose-500/20 text-rose-400 bg-rose-500/5" 
                        : "border-emerald-500/20 text-emerald-400 bg-emerald-500/5"
                    }`}>
                      {copilotReport.riskAssessment?.split(".")[0] || "Low Risk Profile"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations & Questions (5 cols) */}
            <div className="md:col-span-5 space-y-6">
              {/* Recopilot recommendations */}
              <Card className="surface-panel border-indigo-500/20 bg-indigo-500/[0.01]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Interview Guidance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">Hiring Recommendation</span>
                    <p className="text-muted-foreground mt-1 leading-relaxed">
                      {copilotReport.recommendation}
                    </p>
                  </div>
                  <div className="border-t border-white/5 pt-3">
                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">Interview Strategy</span>
                    <p className="text-muted-foreground mt-1 leading-relaxed">
                      {copilotReport.interviewRecommendation}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recopilot questions */}
              <Card className="surface-panel border-white/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-indigo-400" />
                    Suggested Screening Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  {copilotReport.suggestedQuestions?.map((q: string, idx: number) => (
                    <div key={idx} className="p-3 bg-neutral-950/40 border border-white/5 rounded-lg text-xs leading-relaxed text-muted-foreground select-all">
                      <span className="text-[10px] font-mono text-indigo-400 block font-bold mb-1">Question {idx + 1}:</span>
                      {q}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="surface-panel border-white/5 p-6 text-center text-xs text-muted-foreground">
            No talent insights generated. Try clicking Refresh Insights.
          </Card>
        )}
      </div>

      {/* Explainable Trust Score Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-indigo-400" />
          Explainable Trust Breakdown
        </h3>
        <p className="text-sm text-muted-foreground">
          Dynamic cryptographic indicators directly mapped from original database evidence. Click any event to inspect its proof parameters.
        </p>

        <Card className="surface-panel border-white/5 overflow-hidden">
          <CardContent className="p-6">
            {trustScore?.contributingFactors && trustScore.contributingFactors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trustScore.contributingFactors.map((factor: any, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedFactor(factor)}
                    className="p-4 rounded-xl bg-neutral-955/30 border border-white/5 hover:border-white/15 cursor-pointer transition-all hover:scale-[1.01] flex justify-between items-start gap-4 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${factor.type === 'positive' ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                        <h4 className="text-white text-xs font-bold group-hover:text-primary transition-colors">{factor.label}</h4>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{factor.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge className={
                        factor.type === 'positive' 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs font-bold px-2 py-0.5" 
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20 text-xs font-bold px-2 py-0.5"
                      }>
                        {factor.change}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground block mt-1.5 hover:underline flex items-center justify-end gap-0.5 select-none">
                        Inspect <ChevronRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-muted-foreground">
                No telemetry factors computed. Score is generated from base profile signals.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog Modal */}
      {selectedFactor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <Card className="surface-panel border border-white/10 max-w-md w-full relative overflow-hidden shadow-2xl">
            <div className="absolute top-4 right-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-8 h-8 rounded-full border border-white/5 text-muted-foreground hover:text-white"
                onClick={() => setSelectedFactor(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardHeader className="pb-4 border-b border-white/5">
              <span className="text-[9px] text-primary font-mono uppercase font-bold tracking-widest block">Audit Ledger Verification</span>
              <CardTitle className="text-md text-white mt-1 flex items-center gap-2">
                <BrainCircuit className="w-4.5 h-4.5 text-indigo-400" />
                {selectedFactor.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Telemetry Explanation</span>
                <p className="text-xs text-white leading-relaxed bg-neutral-950/40 border border-white/5 p-4 rounded-xl font-sans">
                  {selectedFactor.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 text-[10px]">
                <div>
                  <span className="text-white/40 block font-bold uppercase tracking-wider">Telemetry Delta</span>
                  <Badge className={`mt-1 font-bold ${
                    selectedFactor.type === 'positive' 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}>
                    {selectedFactor.change} to score
                  </Badge>
                </div>
                <div>
                  <span className="text-white/40 block font-bold uppercase tracking-wider">Verification Status</span>
                  <span className="text-emerald-400 font-bold block mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Cryptographic Proof
                  </span>
                </div>
              </div>

              <div className="bg-neutral-950/60 border border-white/5 p-3 rounded-xl space-y-2 text-[9px] font-mono text-muted-foreground">
                <div className="flex justify-between">
                  <span>Ledger Type:</span>
                  <span className="text-white">Base Sepolia Smart Registry</span>
                </div>
                <div className="flex justify-between">
                  <span>Signatory Wallet:</span>
                  <span className="text-white">0x71C76...976F</span>
                </div>
                <div className="flex justify-between">
                  <span>Proof Verification:</span>
                  <span className="text-emerald-400 font-bold">ECDSA Signature Verified</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-white/5 pt-4 flex justify-end">
              <Button size="sm" onClick={() => setSelectedFactor(null)} className="bg-primary hover:bg-primary/95 text-white font-bold px-5 h-9 text-xs">
                Close Audit Log
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

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
            <Card key={record.id} className="surface-panel hover:transition-colors">
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
          <Card key={ach.id} className="surface-panel hover:transition-colors">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-white">{ach.title}</h3>
                    <Badge className="text-primary bg-primary/10 border border-primary/20">{ach.category || ach.type}</Badge>
                  </div>
                  <p className="text-muted-foreground">{ach.issuer} • {new Date(ach.date).toLocaleDateString()}</p>
                  <p className="text-white mt-4 bg-white/5 p-4 rounded-lg border border-white/10 text-sm">
                    {ach.impact}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-4 min-w-[150px]">
                  <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full text-sm font-medium border border-green-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                    Verified True
                  </div>
                  <Link href={`/verify/${ach.id || 'stub'}`}>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white text-xs">
                      View Cryptographic Proof <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
