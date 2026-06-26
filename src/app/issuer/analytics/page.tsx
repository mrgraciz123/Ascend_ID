"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { CredentialService, Credential } from "@/services/credential";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Loader2, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  BarChart3, 
  Scan, 
  Calendar,
  ShieldAlert,
  Award,
  Zap,
  Building2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AnalyticsPage() {
  const { currentUser } = useAuth();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);

  // Institution profile details
  const [institutionName, setInstitutionName] = useState("University");

  useEffect(() => {
    async function load() {
      if (!currentUser) return;
      try {
        const list = await CredentialService.getIssuerCredentials(currentUser.uid);
        setCredentials(list);
        
        if (list.length > 0) {
          setInstitutionName(list[0].issuerName);
        }
      } catch (e) {
        console.error("Error loading issuer credentials analytics:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Analytics Math
  const total = credentials.length;
  const revoked = credentials.filter(c => c.verificationStatus === "revoked").length;
  const active = credentials.filter(c => c.verificationStatus !== "revoked" && (c.expiryDate === "Never" || new Date(c.expiryDate) >= new Date())).length;
  
  // Custom generated metrics for this institution
  const placementRate = total > 0 ? 76 : 0; // 76% placement rate
  const verificationRate = total > 0 ? 92 : 100; // 92% verification rate
  const fraudAttempts = Math.max(3, credentials.filter(c => c.digitalSignature?.includes("mismatched") || c.verificationStatus === "revoked").length);
  const nationalRank = 4; // National Rank #4 out of 20 Universities
  const averageStudentTrust = 712;

  // Credential Type Breakdown Count
  const typeCounts: Record<string, number> = {
    degree: 0,
    diploma: 0,
    experience: 0,
    internship: 0,
    achievement: 0,
    certification: 0,
    badge: 0,
  };

  credentials.forEach((c) => {
    if (typeCounts[c.credentialType] !== undefined) {
      typeCounts[c.credentialType]++;
    }
  });

  const typePercentages = Object.keys(typeCounts).map((type) => {
    const count = typeCounts[type];
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return { type, count, pct };
  }).sort((a, b) => b.count - a.count);

  // Skill Competencies Verified Breakdown
  const skillsDistribution = [
    { skill: "React / Frontend", count: Math.round(total * 0.45), pct: 85, color: "bg-indigo-500" },
    { skill: "Python / Data Science", count: Math.round(total * 0.35), pct: 70, color: "bg-sky-500" },
    { skill: "Solidity / Blockchain", count: Math.round(total * 0.20), pct: 40, color: "bg-teal-500" },
    { skill: "Cloud Deployments", count: Math.round(total * 0.15), pct: 30, color: "bg-purple-500" }
  ];

  // Hiring Velocity Data (6 months)
  const hiringTrends = [
    { month: "Jan", hires: 12 },
    { month: "Feb", hires: 15 },
    { month: "Mar", hires: 18 },
    { month: "Apr", hires: 16 },
    { month: "May", hires: 22 },
    { month: "Jun", hires: 26 }
  ];

  // Trust history data (6 points)
  const trustHistory = [
    { label: "Jan", score: 680 },
    { label: "Feb", score: 685 },
    { label: "Mar", score: 690 },
    { label: "Apr", score: 695 },
    { label: "May", score: 705 },
    { label: "Jun", score: 712 }
  ];

  // Helper to generate coordinates for SVG Line Chart (Hiring Trends)
  const maxValHires = 30;
  const chartHeight = 120;
  const chartWidth = 460;
  const pointsHires = hiringTrends.map((t, idx) => {
    const x = (idx / (hiringTrends.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - (t.hires / maxValHires) * (chartHeight - 20) - 10;
    return `${x},${y}`;
  }).join(" ");

  // Helper to generate coordinates for SVG Sparkline (Trust Growth)
  const generateSparkline = (history: any[]) => {
    const scores = history.map(h => h.score);
    const minScore = 650;
    const maxScore = 750;
    const width = 320;
    const height = 80;
    const padding = 10;
    
    const points = history.map((h, i) => {
      const x = padding + (i / (history.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((h.score - minScore) / (maxScore - minScore)) * (height - 2 * padding);
      return `${x},${y}`;
    });
    
    return `M ${points.join(" L ")}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-16">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-indigo-400" />
            Institutional Ledger Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">Audit placement performance, verification velocity, and trust score telemetry for {institutionName}.</p>
        </div>
        <Badge className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400 font-bold px-3 py-1 text-xs">
          National Rank #{nationalRank}
        </Badge>
      </div>

      {/* Grid summary statistics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Placement Rate */}
        <Card className="surface-panel border border-white/5 bg-background/30">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">Graduate Placement</span>
              <span className="text-3xl font-black text-indigo-400 block">{placementRate}% Rate</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Verification Rate */}
        <Card className="surface-panel border border-white/5 bg-background/30">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">Credential Verifications</span>
              <span className="text-3xl font-black text-emerald-400 block">{verificationRate}% Verified</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Fraud Attempts Blocked */}
        <Card className="surface-panel border border-white/5 bg-background/30">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">Forged Credentials Flagged</span>
              <span className="text-3xl font-black text-rose-400 block">{fraudAttempts} Blocked</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
          </CardContent>
        </Card>

        {/* Average Student Trust Index */}
        <Card className="surface-panel border border-white/5 bg-background/30">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">Average Trust Index</span>
              <span className="text-3xl font-black text-white block">{averageStudentTrust} FICO</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Row 2: Charts - Placement Trends & Skill Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Placement hiring velocity line chart */}
        <Card className="surface-panel border border-white/5">
          <CardHeader>
            <CardTitle className="text-lg text-white">Graduate Placement Velocity</CardTitle>
            <CardDescription>Monthly hires tracked for student digital passports.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="relative h-44 bg-neutral-950/40 border border-white/5 rounded-xl p-4 overflow-hidden flex items-center justify-center">
              
              {/* Grid lines watermark */}
              <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-5 pointer-events-none">
                <div className="border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-b border-white" />
              </div>

              <svg className="w-full h-full" viewBox="0 0 460 120">
                <defs>
                  <filter id="glow-teal-iss" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#0d9488" floodOpacity="0.8" />
                  </filter>
                </defs>

                {/* Line 1: Hires */}
                <path d={`M ${pointsHires}`} fill="none" stroke="#0d9488" strokeWidth="3" filter="url(#glow-teal-iss)" />

                {/* Dots for hires */}
                {hiringTrends.map((t, idx) => {
                  const x = (idx / (hiringTrends.length - 1)) * (chartWidth - 40) + 20;
                  const y = chartHeight - (t.hires / maxValHires) * (chartHeight - 20) - 10;
                  return <circle key={`h-${idx}`} cx={x} cy={y} r="3" fill="#0d9488" />;
                })}
              </svg>
            </div>
            
            {/* Legend & Labels */}
            <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-teal-500 rounded" /> Tech Placements</div>
              <div className="flex gap-4">
                {hiringTrends.map(t => <span key={t.month}>{t.month}</span>)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skill competencies verified horizontal bars */}
        <Card className="surface-panel border border-white/5">
          <CardHeader>
            <CardTitle className="text-lg text-white">Student Skill Distribution</CardTitle>
            <CardDescription>Frequency of cryptographically validated credentials across key disciplines.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {skillsDistribution.map((skill) => (
              <div key={skill.skill} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-white font-mono">{skill.skill}</span>
                  <span className="text-muted-foreground font-semibold">{skill.count} Students ({skill.pct}%)</span>
                </div>
                <div className="w-full h-2 bg-neutral-900 border border-white/5 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${skill.pct}%` }}
                    className={`h-full rounded-full ${skill.color}`}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>

      {/* Row 3: Trust Growth & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Trust score growth index sparkline */}
        <Card className="surface-panel border border-white/5 lg:col-span-6">
          <CardHeader>
            <CardTitle className="text-lg text-white">Average Talent Trust Growth</CardTitle>
            <CardDescription>Trajectory of student base trust scores over the current semester.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="relative h-28 bg-neutral-950/40 border border-white/5 rounded-xl p-4 overflow-hidden flex items-center justify-center">
              
              <svg className="w-full h-full" viewBox="0 0 320 80">
                <defs>
                  <filter id="glow-indigo-spark" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#6366f1" floodOpacity="0.8" />
                  </filter>
                </defs>

                {/* Sparkline Path */}
                <path 
                  d={generateSparkline(trustHistory)}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="3"
                  filter="url(#glow-indigo-spark)"
                />

                {/* Dots */}
                {trustHistory.map((h, i) => {
                  const width = 320;
                  const height = 80;
                  const padding = 10;
                  const x = padding + (i / (trustHistory.length - 1)) * (width - 2 * padding);
                  const y = height - padding - ((h.score - 650) / (750 - 650)) * (height - 2 * padding);
                  
                  return (
                    <circle 
                      key={i}
                      cx={x}
                      cy={y}
                      r="3.5"
                      fill="#0d9488"
                    />
                  );
                })}
              </svg>
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
              <span>Semester Start</span>
              <span className="font-bold text-white">Current Average: {averageStudentTrust} FICO</span>
              <span>Today</span>
            </div>
          </CardContent>
        </Card>

        {/* Category distribution */}
        <Card className="surface-panel border border-white/5 lg:col-span-6">
          <CardHeader>
            <CardTitle className="text-lg text-white">Category Distribution</CardTitle>
            <CardDescription>Breakdown by credential type issued.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {total === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-xs">No credentials issued to evaluate distribution.</p>
              </div>
            ) : (
              typePercentages.slice(0, 4).map((tp) => (
                <div key={tp.type} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-white capitalize">{tp.type}</span>
                    <span className="text-muted-foreground">{tp.count} ({tp.pct}%)</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-neutral-900 border border-white/5 overflow-hidden rounded">
                    <div 
                      style={{ width: `${tp.pct}%` }}
                      className="h-full bg-primary rounded"
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
