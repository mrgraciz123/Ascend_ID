"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ShieldCheck, 
  Search, 
  MapPin, 
  GraduationCap, 
  ArrowUpRight, 
  Bookmark, 
  SlidersHorizontal,
  Info,
  Loader2, 
  TrendingUp, 
  AlertTriangle,
  Briefcase,
  GitBranch,
  Layers,
  Users,
  Calendar,
  X,
  Check,
  ChevronRight,
  ShieldAlert,
  ExternalLink,
  CheckCircle,
  Building2
} from "lucide-react";
import Link from "next/link";
import { StudentService } from "@/services/student";
import { TrustScoreService } from "@/services/trust-score";

// Complete mock seed data for dynamic analytics
const MOCK_CANDIDATES = [
  {
    id: "student-123",
    name: "Aarav Sharma",
    avatar: "https://i.pravatar.cc/150?u=aarav-sharma-123",
    university: "IIT Bombay",
    degree: "B.Tech in Computer Science",
    graduationYear: "2026",
    trustScore: 780,
    ficoClass: "Exceptional",
    riskLevel: "Low",
    riskScore: 10,
    jobFit: 94,
    skills: {
      verified: ["React", "TypeScript", "Node.js", "Python", "Algorithms"],
      unverified: ["Firebase", "Docker"],
      missing: ["Kubernetes", "AWS"]
    },
    factors: {
      issuerReputation: 95,
      credentialFreshness: 80,
      credentialImportance: 90,
      fraudProbability: 95,
      skillConsistency: 85,
      experienceGrowth: 85,
      peerValidation: 80,
      verificationConfidence: 90
    },
    timeline: [
      { year: "2022", title: "Class 12 Marksheet", issuer: "CBSE", type: "academic", status: "verified" },
      { year: "2024", title: "Google STEP Intern", issuer: "Google", type: "internship", status: "verified" },
      { year: "2025", title: "GDSC Lead", issuer: "Google Developers", type: "leadership", status: "verified" }
    ]
  },
  {
    id: "student-mock-expired",
    name: "Rohan Varma",
    avatar: "https://i.pravatar.cc/150?u=rohan-varma",
    university: "BITS Pilani",
    degree: "B.E. in Electronics & Communication",
    graduationYear: "2025",
    trustScore: 640,
    ficoClass: "Fair",
    riskLevel: "Medium",
    riskScore: 45,
    jobFit: 78,
    skills: {
      verified: ["React", "Python"],
      unverified: ["Machine Learning", "C++"],
      missing: ["TypeScript", "Node.js"]
    },
    factors: {
      issuerReputation: 70,
      credentialFreshness: 60,
      credentialImportance: 75,
      fraudProbability: 70,
      skillConsistency: 55,
      experienceGrowth: 60,
      peerValidation: 50,
      verificationConfidence: 65
    },
    timeline: [
      { year: "2021", title: "Degree Enrollment", issuer: "BITS", type: "academic", status: "verified" },
      { year: "2023", title: "ML Intern", issuer: "Self-Claimed", type: "internship", status: "unverified" },
      { year: "2024", title: "AWS Cloud Practitioner", issuer: "AWS (Expired)", type: "certificate", status: "expired" }
    ]
  },
  {
    id: "student-mock-fraud",
    name: "Karan Johar",
    avatar: "https://i.pravatar.cc/150?u=karan-johar",
    university: "Delhi University",
    degree: "B.Com in Business Admin",
    graduationYear: "2024",
    trustScore: 520,
    ficoClass: "Poor",
    riskLevel: "High",
    riskScore: 90,
    jobFit: 42,
    skills: {
      verified: ["Project Management"],
      unverified: ["React", "Node.js"],
      missing: ["TypeScript", "Python"]
    },
    factors: {
      issuerReputation: 45,
      credentialFreshness: 50,
      credentialImportance: 50,
      fraudProbability: 20,
      skillConsistency: 30,
      experienceGrowth: 40,
      peerValidation: 30,
      verificationConfidence: 35
    },
    timeline: [
      { year: "2022", title: "Enrolled B.Com", issuer: "DU", type: "academic", status: "verified" },
      { year: "2023", title: "Project Manager Cert", issuer: "PMP", type: "certificate", status: "verified" },
      { year: "2025", title: "React Dev", issuer: "Mismatched Signature", type: "certificate", status: "revoked" }
    ]
  }
];

export default function RecruiterDashboard() {
  const [activeTab, setActiveTab] = useState<"search" | "heatmap" | "compare" | "analytics">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("Frontend Engineer");
  
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [candidates, setCandidates] = useState<any[]>(MOCK_CANDIDATES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there are active candidates in Firestore, else use seeded mocks
    async function load() {
      try {
        const testStudent = await StudentService.getProfile("student-123");
        const score = await TrustScoreService.getScore("student-123");
        
        // Update Aarav Sharma (student-123) with live Firestore data if populated
        if (testStudent && testStudent.name !== "Anonymous Student") {
          const updatedMocks = MOCK_CANDIDATES.map(c => {
            if (c.id === "student-123") {
              return {
                ...c,
                name: testStudent.name,
                avatar: testStudent.avatar,
                university: testStudent.institution,
                trustScore: score.total,
                ficoClass: score.total >= 740 ? "Very Good" : (score.total >= 670 ? "Good" : "Fair"),
                skills: {
                  verified: testStudent.skills.slice(0, 4),
                  unverified: testStudent.skills.slice(4),
                  missing: ["Kubernetes", "AWS"]
                }
              };
            }
            return c;
          });
          setCandidates(updatedMocks);
        }
      } catch (e) {
        console.warn("Could not load Firestore candidate summary, defaulting to seed data:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleCompareSelect = (id: string) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter(x => x !== id));
    } else {
      if (compareIds.length < 2) {
        setCompareIds([...compareIds, id]);
      } else {
        // Replace oldest
        setCompareIds([compareIds[1], id]);
      }
    }
  };

  const clearComparisons = () => {
    setCompareIds([]);
  };

  // Filter candidates based on search
  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.skills.verified.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sorting: Rank by Trust Score desc
  const rankedCandidates = [...filteredCandidates].sort((a, b) => b.trustScore - a.trustScore);

  // Compare candidates values
  const comp1 = compareIds[0] ? candidates.find(c => c.id === compareIds[0]) : null;
  const comp2 = compareIds[1] ? candidates.find(c => c.id === compareIds[1]) : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Recruiter Suite</h1>
          <p className="text-muted-foreground mt-1">Verify talent, trace credential histories, and detect portfolio risks.</p>
        </div>

        {/* Global tab selector */}
        <div className="flex gap-1.5 bg-background/50 border p-1 rounded-xl shrink-0 select-none">
          <Button 
            variant={activeTab === "search" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setActiveTab("search")}
            className="text-xs h-8 text-white hover:bg-white/5"
          >
            AI Search & Rank
          </Button>
          <Button 
            variant={activeTab === "heatmap" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setActiveTab("heatmap")}
            className="text-xs h-8 text-white hover:bg-white/5"
          >
            Trust Heatmap & Timelines
          </Button>
          <Button 
            variant={activeTab === "analytics" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setActiveTab("analytics")}
            className="text-xs h-8 text-white hover:bg-white/5"
          >
            Talent Analytics & Trends
          </Button>
          <Button 
            variant={activeTab === "compare" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setActiveTab("compare")}
            className="text-xs h-8 text-white hover:bg-white/5"
            disabled={compareIds.length < 2}
          >
            Compare View ({compareIds.length}/2)
          </Button>
        </div>
      </div>

      {/* Floating comparison badge notification */}
      {compareIds.length > 0 && activeTab !== "compare" && (
        <div className="fixed bottom-6 right-6 z-40 bg-neutral-950/90 border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-md flex items-center justify-between gap-6 animate-in slide-in-from-bottom duration-300">
          <div className="text-xs text-muted-foreground">
            <strong className="text-white">{compareIds.length} candidate{compareIds.length > 1 ? "s" : ""}</strong> selected for side-by-side audit.
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={clearComparisons} className="text-xs h-8 text-red-400 hover:bg-red-500/10">
              Clear
            </Button>
            <Button 
              size="sm" 
              onClick={() => setActiveTab("compare")} 
              disabled={compareIds.length < 2}
              className="text-xs h-8 bg-primary hover:bg-primary/95 text-white"
            >
              Launch Comparison <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* TAB 1: AI SEARCH & RANK */}
      {activeTab === "search" && (
        <div className="space-y-6">
          
          {/* Search bar controls */}
          <Card className="surface-panel p-4 md:p-6">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Query candidate skills, institutions, or trust score filters..." 
                  className="pl-10 h-12 bg-background/50 text-white focus-visible:ring-primary text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex items-center bg-background/50 border rounded-lg px-3 gap-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Role Fit:</span>
                  <select 
                    className="bg-transparent border-0 text-xs font-bold text-white outline-none cursor-pointer"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="Frontend Engineer" className="bg-neutral-950 text-white">Frontend Engineer</option>
                    <option value="ML Engineer" className="bg-neutral-950 text-white">ML Engineer</option>
                    <option value="DevOps Lead" className="bg-neutral-950 text-white">DevOps Lead</option>
                  </select>
                </div>
                <Button type="submit" className="h-12 bg-primary hover:bg-primary/90 text-white px-8 text-xs font-bold">
                  AI Shortlist
                </Button>
              </div>
            </form>
          </Card>

          {/* Search results candidates ranked by AI Fit */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>AI candidate ranking sorted by Trust Score</span>
              <span>Showing {rankedCandidates.length} matched profiles</span>
            </div>

            {rankedCandidates.map((candidate) => {
              const isSelected = compareIds.includes(candidate.id);
              
              // SVG Risk circle percentage calculations
              const riskPercent = candidate.riskScore;
              const r = 24;
              const circ = 2 * Math.PI * r;
              const offset = circ - (riskPercent / 100) * circ;

              return (
                <Card 
                  key={candidate.id} 
                  className={`surface-panel hover:border-white/10 transition-all ${candidate.riskLevel === "High" ? "border-rose-500/20" : ""}`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      
                      {/* Left Block: Profile Info + Selector */}
                      <div className="shrink-0 flex items-start gap-4">
                        <div className="flex items-center justify-center pt-2">
                          <input 
                            type="checkbox"
                            className="w-4.5 h-4.5 rounded accent-primary bg-neutral-900 border-white/10 cursor-pointer"
                            checked={isSelected}
                            onChange={() => handleCompareSelect(candidate.id)}
                          />
                        </div>
                        <Avatar className="w-16 h-16 border border-white/10 shadow-lg">
                          <AvatarImage src={candidate.avatar} alt={candidate.name} />
                          <AvatarFallback className="bg-secondary text-white text-lg">
                            {candidate.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h3 className="text-lg font-bold text-white leading-none">{candidate.name}</h3>
                            {candidate.riskLevel === "High" && (
                              <Badge className="bg-rose-500/10 border-rose-500/20 text-rose-400 text-[9px] font-bold uppercase tracking-wider gap-0.5 animate-pulse">
                                <ShieldAlert className="w-3 h-3" /> Risk Flagged
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-primary font-medium mt-1.5">{candidate.degree}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                            <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> {candidate.university}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> India</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle Block: Skills Check list (Skill Gap Analysis) */}
                      <div className="flex-1 space-y-3 lg:border-l lg:border-r lg:border-white/5 lg:px-6">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block mb-2">Verified Capability</span>
                          <div className="flex flex-wrap gap-1.5">
                            {candidate.skills.verified.map((s: string) => (
                              <Badge key={s} className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-mono text-[9px] hover:none">
                                <Check className="w-2.5 h-2.5 mr-0.5" /> {s}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {candidate.skills.unverified.length > 0 && (
                          <div>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block mb-2">Self-Claimed (Unverified)</span>
                            <div className="flex flex-wrap gap-1.5">
                              {candidate.skills.unverified.map((s: string) => (
                                <Badge key={s} className="bg-amber-500/10 border-amber-500/20 text-amber-400 font-mono text-[9px] hover:none">
                                  <AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> {s}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block mb-2">Gap for {selectedRole}</span>
                          <div className="flex flex-wrap gap-1.5">
                            {candidate.skills.missing.map((s: string) => (
                              <Badge key={s} className="bg-rose-500/10 border-rose-500/20 text-rose-400 font-mono text-[9px] hover:none">
                                <X className="w-2.5 h-2.5 mr-0.5" /> {s}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Block: Scores and telemetry */}
                      <div className="shrink-0 flex items-center justify-between lg:justify-end gap-8 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/5">
                        
                        {/* Trust Score */}
                        <div className="text-center">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Trust Score</span>
                          <div className="text-3xl font-black text-trust mt-1">{candidate.trustScore}</div>
                          <span className="text-[9px] text-muted-foreground block font-mono">{candidate.ficoClass}</span>
                        </div>

                        {/* Job Fit rating */}
                        <div className="text-center">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Job Fit</span>
                          <div className="text-3xl font-black text-sky-400 mt-1">{candidate.jobFit}%</div>
                          <span className="text-[9px] text-muted-foreground block">{selectedRole}</span>
                        </div>

                        {/* Risk Meter circle */}
                        <div className="relative w-14 h-14 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="28" cy="28" r={r} className="stroke-neutral-800" strokeWidth="5" fill="transparent" />
                            <circle 
                              cx="28" 
                              cy="28" 
                              r={r} 
                              className={`transition-all duration-1000 ${candidate.riskLevel === "High" ? "stroke-rose-500" : candidate.riskLevel === "Medium" ? "stroke-amber-500" : "stroke-emerald-500"}`} 
                              strokeWidth="5" 
                              fill="transparent" 
                              strokeDasharray={circ} 
                              strokeDashoffset={offset} 
                              strokeLinecap="round" 
                            />
                          </svg>
                          <div className="absolute text-[10px] font-bold text-white font-mono">{candidate.riskScore}%</div>
                        </div>

                        {/* CTA button */}
                        <div className="flex flex-col gap-2">
                          <Link href={`/recruiter/candidate/${candidate.id}`}>
                            <Button size="sm" className="bg-primary hover:bg-primary/95 text-white w-28 text-[11px] h-8">
                              View Passport <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </Link>
                          <Link href={`/recruiter/candidate/${candidate.id}/fraud`}>
                            <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5 text-white w-28 text-[11px] h-8">
                              Fraud Report
                            </Button>
                          </Link>
                        </div>

                      </div>

                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 2: TRUST HEATMAP & TIMELINE */}
      {activeTab === "heatmap" && (
        <div className="space-y-8">
          
          {/* Trust Factors Heatmap */}
          <Card className="surface-panel p-6">
            <CardHeader className="px-0 pt-0 pb-4">
              <CardTitle className="text-lg text-white">Trust Factor Heatmap</CardTitle>
              <CardDescription className="text-xs">Comparative matrix of candidates across key trust factors (rated 0-100).</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 overflow-x-auto">
              <div className="min-w-[650px] space-y-3">
                
                {/* Headers */}
                <div className="grid grid-cols-6 gap-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <div className="text-left pl-4">Candidate</div>
                  <div>Reputation</div>
                  <div>Freshness</div>
                  <div>Importance</div>
                  <div>Consistency</div>
                  <div>Confidence</div>
                </div>

                {/* Candidate Rows */}
                {candidates.map(candidate => {
                  const getHeatGlow = (val: number) => {
                    if (val >= 85) return "bg-emerald-500/25 border-emerald-500/40 text-emerald-400";
                    if (val >= 70) return "bg-teal-500/20 border-teal-500/35 text-teal-400";
                    if (val >= 50) return "bg-amber-500/15 border-amber-500/30 text-amber-400";
                    return "bg-rose-500/15 border-rose-500/30 text-rose-400";
                  };

                  return (
                    <div key={candidate.id} className="grid grid-cols-6 gap-3 items-center bg-white/[0.01] border border-white/5 p-3.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                      <div className="text-left font-bold text-white flex items-center gap-2 pl-2 truncate">
                        <Avatar className="w-6 h-6 border border-white/10 shrink-0">
                          <AvatarImage src={candidate.avatar} />
                          <AvatarFallback className="text-[10px] bg-secondary">{candidate.name.substring(0,2)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs truncate">{candidate.name}</span>
                      </div>
                      <div className={`py-1.5 rounded-lg border text-center font-mono font-bold text-xs ${getHeatGlow(candidate.factors.issuerReputation)}`}>
                        {candidate.factors.issuerReputation}
                      </div>
                      <div className={`py-1.5 rounded-lg border text-center font-mono font-bold text-xs ${getHeatGlow(candidate.factors.credentialFreshness)}`}>
                        {candidate.factors.credentialFreshness}
                      </div>
                      <div className={`py-1.5 rounded-lg border text-center font-mono font-bold text-xs ${getHeatGlow(candidate.factors.credentialImportance)}`}>
                        {candidate.factors.credentialImportance}
                      </div>
                      <div className={`py-1.5 rounded-lg border text-center font-mono font-bold text-xs ${getHeatGlow(candidate.factors.skillConsistency)}`}>
                        {candidate.factors.skillConsistency}
                      </div>
                      <div className={`py-1.5 rounded-lg border text-center font-mono font-bold text-xs ${getHeatGlow(candidate.factors.verificationConfidence)}`}>
                        {candidate.factors.verificationConfidence}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Unified Verification Timelines */}
          <Card className="surface-panel p-6">
            <CardHeader className="px-0 pt-0 pb-6">
              <CardTitle className="text-lg text-white font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                Unified Verification Timeline
              </CardTitle>
              <CardDescription className="text-xs">Chronological timeline of cryptographically verified milestones across candidates.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 space-y-6">
              <div className="relative pl-6 border-l border-white/5 space-y-8 ml-4">
                
                {/* Compile all timeline points chronologically */}
                {candidates.flatMap((c: any) => c.timeline.map((t: any) => ({ ...t, candidate: c.name }))).sort((a: any, b: any) => b.year.localeCompare(a.year)).map((t: any, idx: number) => {
                  let badgeStyle = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
                  if (t.status === "unverified") badgeStyle = "bg-amber-500/10 border-amber-500/20 text-amber-400";
                  if (t.status === "expired" || t.status === "revoked") badgeStyle = "bg-rose-500/10 border-rose-500/20 text-rose-400";

                  return (
                    <div key={idx} className="relative">
                      {/* Left timeline dot indicator */}
                      <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-neutral-950 border-2 border-primary shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 bg-neutral-950/40 border border-white/5 p-4 rounded-xl hover:border-white/10 transition-colors">
                        <div>
                          <span className="text-[10px] font-bold text-primary font-mono">{t.year}</span>
                          <h4 className="text-xs font-bold text-white mt-0.5">{t.title}</h4>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Issued by {t.issuer} for {t.candidate}</p>
                        </div>
                        <Badge className={`text-[9px] uppercase tracking-wider font-bold ${badgeStyle} hover:none`}>
                          {t.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}

              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* TAB 3: CANDIDATE COMPARISON VIEW */}
      {activeTab === "compare" && comp1 && comp2 && (
        <div className="space-y-6">
          <Card className="surface-panel p-6">
            <CardHeader className="px-0 pt-0 pb-4">
              <CardTitle className="text-lg text-white">Side-by-Side Audit</CardTitle>
              <CardDescription className="text-xs">Direct trust comparison and skill gap validation.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/5">
              
              {/* Candidate 1 */}
              <div className="space-y-6 pb-6 md:pb-0">
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14 border border-white/10 shadow-lg">
                    <AvatarImage src={comp1.avatar} />
                    <AvatarFallback className="text-lg bg-secondary">{comp1.name.substring(0,2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-md font-bold text-white">{comp1.name}</h3>
                    <p className="text-xs text-primary font-medium">{comp1.degree}</p>
                  </div>
                </div>

                {/* Score and Fit comparisons */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-neutral-950/50 border border-white/5 p-3 rounded-lg text-center">
                    <span className="text-[9px] uppercase text-muted-foreground font-bold tracking-wider">Trust Score</span>
                    <div className="text-xl font-black text-trust mt-1">{comp1.trustScore}</div>
                  </div>
                  <div className="bg-neutral-950/50 border border-white/5 p-3 rounded-lg text-center">
                    <span className="text-[9px] uppercase text-muted-foreground font-bold tracking-wider">Job Fit</span>
                    <div className="text-xl font-black text-sky-400 mt-1">{comp1.jobFit}%</div>
                  </div>
                  <div className="bg-neutral-950/50 border border-white/5 p-3 rounded-lg text-center">
                    <span className="text-[9px] uppercase text-muted-foreground font-bold tracking-wider">Fraud Risk</span>
                    <div className={`text-xs font-bold mt-2 ${comp1.riskLevel === "High" ? "text-rose-400" : comp1.riskLevel === "Medium" ? "text-amber-400" : "text-emerald-400"}`}>
                      {comp1.riskLevel} ({comp1.riskScore}%)
                    </div>
                  </div>
                </div>

                {/* Skills analysis */}
                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest block mb-1">Verified Capability</span>
                    <div className="flex flex-wrap gap-1.5">
                      {comp1.skills.verified.map((s: string) => (
                        <Badge key={s} className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-mono text-[9px]">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest block mb-1">Self-Claimed / Expired</span>
                    <div className="flex flex-wrap gap-1.5">
                      {comp1.skills.unverified.map((s: string) => (
                        <Badge key={s} className="bg-amber-500/10 border-amber-500/20 text-amber-400 font-mono text-[9px]">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest block mb-1">Missing required skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {comp1.skills.missing.map((s: string) => (
                        <Badge key={s} className="bg-rose-500/10 border-rose-500/20 text-rose-400 font-mono text-[9px]">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Factors Details list */}
                <div className="space-y-2 border-t border-white/5 pt-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/40">Issuer Reputation:</span>
                    <span className="text-white font-mono font-bold">{comp1.factors.issuerReputation}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Credential Freshness:</span>
                    <span className="text-white font-mono font-bold">{comp1.factors.credentialFreshness}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Verification Confidence:</span>
                    <span className="text-white font-mono font-bold">{comp1.factors.verificationConfidence}/100</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href={`/recruiter/candidate/${comp1.id}/fraud`}>
                    <Button size="sm" variant="outline" className="w-full border-white/10 hover:bg-white/5 text-white">
                      Inspect {comp1.name}'s Fraud Report <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Candidate 2 */}
              <div className="space-y-6 pt-6 md:pt-0 md:pl-8">
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14 border border-white/10 shadow-lg">
                    <AvatarImage src={comp2.avatar} />
                    <AvatarFallback className="text-lg bg-secondary">{comp2.name.substring(0,2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-md font-bold text-white">{comp2.name}</h3>
                    <p className="text-xs text-primary font-medium">{comp2.degree}</p>
                  </div>
                </div>

                {/* Score and Fit comparisons */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-neutral-950/50 border border-white/5 p-3 rounded-lg text-center">
                    <span className="text-[9px] uppercase text-muted-foreground font-bold tracking-wider">Trust Score</span>
                    <div className="text-xl font-black text-trust mt-1">{comp2.trustScore}</div>
                  </div>
                  <div className="bg-neutral-950/50 border border-white/5 p-3 rounded-lg text-center">
                    <span className="text-[9px] uppercase text-muted-foreground font-bold tracking-wider">Job Fit</span>
                    <div className="text-xl font-black text-sky-400 mt-1">{comp2.jobFit}%</div>
                  </div>
                  <div className="bg-neutral-950/50 border border-white/5 p-3 rounded-lg text-center">
                    <span className="text-[9px] uppercase text-muted-foreground font-bold tracking-wider">Fraud Risk</span>
                    <div className={`text-xs font-bold mt-2 ${comp2.riskLevel === "High" ? "text-rose-400" : comp2.riskLevel === "Medium" ? "text-amber-400" : "text-emerald-400"}`}>
                      {comp2.riskLevel} ({comp2.riskScore}%)
                    </div>
                  </div>
                </div>

                {/* Skills analysis */}
                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest block mb-1">Verified Capability</span>
                    <div className="flex flex-wrap gap-1.5">
                      {comp2.skills.verified.map((s: string) => (
                        <Badge key={s} className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-mono text-[9px]">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest block mb-1">Self-Claimed / Expired</span>
                    <div className="flex flex-wrap gap-1.5">
                      {comp2.skills.unverified.map((s: string) => (
                        <Badge key={s} className="bg-amber-500/10 border-amber-500/20 text-amber-400 font-mono text-[9px]">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest block mb-1">Missing required skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {comp2.skills.missing.map((s: string) => (
                        <Badge key={s} className="bg-rose-500/10 border-rose-500/20 text-rose-400 font-mono text-[9px]">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Factors Details list */}
                <div className="space-y-2 border-t border-white/5 pt-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/40">Issuer Reputation:</span>
                    <span className="text-white font-mono font-bold">{comp2.factors.issuerReputation}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Credential Freshness:</span>
                    <span className="text-white font-mono font-bold">{comp2.factors.credentialFreshness}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Verification Confidence:</span>
                    <span className="text-white font-mono font-bold">{comp2.factors.verificationConfidence}/100</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href={`/recruiter/candidate/${comp2.id}/fraud`}>
                    <Button size="sm" variant="outline" className="w-full border-white/10 hover:bg-white/5 text-white">
                      Inspect {comp2.name}'s Fraud Report <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: TALENT ANALYTICS & TRENDS */}
      {activeTab === "analytics" && (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="surface-panel border border-white/5 bg-background/30">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">Verification Rate</span>
                  <span className="text-3xl font-black text-emerald-400 block">91.2%</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="surface-panel border border-white/5 bg-background/30">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">Blocked Forgeries</span>
                  <span className="text-3xl font-black text-rose-400 block">14 Scans</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
              </CardContent>
            </Card>

            <Card className="surface-panel border border-white/5 bg-background/30">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">Placed Talent Index</span>
                  <span className="text-3xl font-black text-white block">72% Rate</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Users className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="surface-panel border border-white/5 bg-background/30">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">Top Sourced School</span>
                  <span className="text-xl font-black text-white block truncate max-w-[150px]">IIT Bombay</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Building2 className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hiring trends line chart */}
            <Card className="surface-panel border border-white/5">
              <CardHeader>
                <CardTitle className="text-lg text-white">Sourcing & Pipeline Velocity</CardTitle>
                <CardDescription>Monthly growth of processed candidates vs successful hires.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="relative h-44 bg-neutral-950/40 border border-white/5 rounded-xl p-4 overflow-hidden flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 460 120">
                    <defs>
                      <filter id="glow-teal-rec" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#0d9488" floodOpacity="0.8" />
                      </filter>
                      <filter id="glow-indigo-rec" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#6366f1" floodOpacity="0.8" />
                      </filter>
                    </defs>

                    {/* Pipelines line */}
                    <path d="M 20,90 L 108,82 L 196,75 L 284,60 L 372,42 L 440,25" fill="none" stroke="#6366f1" strokeWidth="3" filter="url(#glow-indigo-rec)" />
                    {/* Hires line */}
                    <path d="M 20,110 L 108,102 L 196,90 L 284,80 L 372,60 L 440,48" fill="none" stroke="#0d9488" strokeWidth="3" filter="url(#glow-teal-rec)" />

                    <circle cx="20" cy="90" r="3" fill="#6366f1" /><circle cx="108" cy="82" r="3" fill="#6366f1" />
                    <circle cx="196" cy="75" r="3" fill="#6366f1" /><circle cx="284" cy="60" r="3" fill="#6366f1" />
                    <circle cx="372" cy="42" r="3" fill="#6366f1" /><circle cx="440" cy="25" r="3" fill="#6366f1" />

                    <circle cx="20" cy="110" r="3" fill="#0d9488" /><circle cx="108" cy="102" r="3" fill="#0d9488" />
                    <circle cx="196" cy="90" r="3" fill="#0d9488" /><circle cx="284" cy="80" r="3" fill="#0d9488" />
                    <circle cx="372" cy="60" r="3" fill="#0d9488" /><circle cx="440" cy="48" r="3" fill="#0d9488" />
                  </svg>
                </div>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-indigo-500 rounded" /> Active Pipeline</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-teal-500 rounded" /> Hirings Clicked</span>
                  </div>
                  <div className="flex gap-3">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sourced Skill distribution */}
            <Card className="surface-panel border border-white/5">
              <CardHeader>
                <CardTitle className="text-lg text-white">Sourced Talent Skills</CardTitle>
                <CardDescription>Verified competencies found across candidate resumes.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {[
                  { skill: "React / Frontend Dev", count: 45, pct: 90, color: "bg-indigo-500" },
                  { skill: "Python / ML / AI", count: 32, pct: 64, color: "bg-sky-500" },
                  { skill: "TypeScript / APIs", count: 28, pct: 56, color: "bg-teal-500" },
                  { skill: "Solidity / Cryptography", count: 15, pct: 30, color: "bg-purple-500" }
                ].map((sk) => (
                  <div key={sk.skill} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-white font-mono">{sk.skill}</span>
                      <span className="text-muted-foreground">{sk.count} candidates ({sk.pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-900 border border-white/5 rounded-full overflow-hidden">
                      <div style={{ width: `${sk.pct}%` }} className={`h-full rounded-full ${sk.color}`} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Institutional Rank mapping */}
          <Card className="surface-panel border border-white/5">
            <CardHeader>
              <CardTitle className="text-lg text-white">Talent Sourcing Registry Leaderboard</CardTitle>
              <CardDescription>Top whitelisted universities ranked by average candidate trust scores.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest bg-white/[0.01]">
                  <tr>
                    <th className="p-4 pl-6">Rank</th>
                    <th className="p-4">Institution Name</th>
                    <th className="p-4 text-center">Avg Candidate Trust</th>
                    <th className="p-4 text-center">Placement Success</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/95">
                  {[
                    { rank: 1, name: "IIT Bombay", score: 785, placement: 94 },
                    { rank: 2, name: "IIT Delhi", score: 778, placement: 92 },
                    { rank: 3, name: "BITS Pilani", score: 755, placement: 89 },
                    { rank: 4, name: "IIIT Hyderabad", score: 742, placement: 91 }
                  ].map((row) => (
                    <tr key={row.rank} className="hover:bg-white/[0.01]">
                      <td className="p-4 pl-6 font-mono text-indigo-400">#0{row.rank}</td>
                      <td className="p-4 font-bold">{row.name}</td>
                      <td className="p-4 text-center font-mono font-bold">{row.score} FICO</td>
                      <td className="p-4 text-center font-mono text-emerald-400 font-semibold">{row.placement}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

        </div>
      )}

    </div>
  );
}
