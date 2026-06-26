"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  Loader2, 
  Building2, 
  Calendar, 
  Star, 
  Users, 
  Layers, 
  Award, 
  BookOpen, 
  GitBranch, 
  Briefcase, 
  Info,
  ChevronRight,
  TrendingDown
} from "lucide-react";
import { TrustScoreService } from "@/services/trust-score";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface TrustFactorMeta {
  label: string;
  value: number;
  weight: string;
  icon: any;
  color: string;
  description: string;
  action: string;
}

export default function TrustEnginePage() {
  const [loading, setLoading] = useState(true);
  const [scoreData, setScoreData] = useState<any | null>(null);
  const [hoveredFactor, setHoveredFactor] = useState<string | null>(null);

  const { currentUser } = useAuth();

  useEffect(() => {
    async function load() {
      if (!currentUser) return;
      const data = await TrustScoreService.getScore(currentUser.uid);
      setScoreData(data);
      setLoading(false);
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

  const total = scoreData?.total || 350;
  const explanation = scoreData?.explanation || "";
  const factors = scoreData?.factors || {};
  const history = scoreData?.history || [];

  // Determine FICO classification
  const getFicoClass = (score: number) => {
    if (score >= 800) return { label: "Exceptional", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    if (score >= 740) return { label: "Very Good", color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" };
    if (score >= 670) return { label: "Good", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" };
    if (score >= 580) return { label: "Fair", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    return { label: "Poor", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" };
  };

  const statusMeta = getFicoClass(total);

  // Map 12 factors for easy loop rendering
  const factorList: TrustFactorMeta[] = [
    {
      label: "Issuer Reputation",
      value: factors.issuerReputation || 50,
      weight: "10%",
      icon: Building2,
      color: "text-indigo-400",
      description: "Evaluates the standing & type of institutions issuing your credentials. Blockchain-anchored or DigiLocker issuers boost reputation.",
      action: "Anchor more credentials from top-tier institutional partners to push this above 80."
    },
    {
      label: "Credential Freshness",
      value: factors.credentialFreshness || 50,
      weight: "5%",
      icon: Calendar,
      color: "text-green-400",
      description: "Measures recency of achievements. Scoring decreases gradually as achievements age to prioritize active capabilities.",
      action: "Regularly update your passport with recent certifications and project milestones."
    },
    {
      label: "Credential Importance",
      value: factors.credentialImportance || 50,
      weight: "8%",
      icon: Layers,
      color: "text-blue-400",
      description: "Evaluates academic degrees and longer internships over simple one-day badges, prioritizing high-effort milestones.",
      action: "Add verified Degrees, research milestones, or structured long-term Internships."
    },
    {
      label: "Fraud Probability",
      value: factors.fraudProbability || 90,
      weight: "10%",
      icon: ShieldCheck,
      color: "text-emerald-400",
      description: "Checks ratio of unverified self-claimed items against verified credentials. Having multiple unverified items increases risk.",
      action: "Submit documents or links for self-claimed records to trigger reviewer verification."
    },
    {
      label: "Skill Consistency",
      value: factors.skillConsistency || 50,
      weight: "8%",
      icon: Star,
      color: "text-amber-400",
      description: "Analyzes skills across different verified nodes. Consistency scores higher if a skill is backed by multiple independent credentials.",
      action: "Earn credentials in overlapping technologies (e.g. both React project and React certificate)."
    },
    {
      label: "Experience Growth",
      value: factors.experienceGrowth || 50,
      weight: "7%",
      icon: TrendingUp,
      color: "text-purple-400",
      description: "Analyzes chronological career timeline span and progress levels from academic entries to leadership roles.",
      action: "Verify progression items chronologically (e.g. from degree, to internship, to work experiences)."
    },
    {
      label: "Peer Validation",
      value: factors.peerValidation || 30,
      weight: "8%",
      icon: Users,
      color: "text-teal-400",
      description: "Tracks peer-to-peer or mentor endorsements and letters of recommendation anchored cryptographically.",
      action: "Request verified mentors or hackathon teammates to submit recommendations to your email."
    },
    {
      label: "Verification Confidence",
      value: factors.verificationConfidence || 50,
      weight: "12%",
      icon: ShieldCheck,
      color: "text-cyan-400",
      description: "Calculates the cryptographic strength of verification logs (Base Sepolia blockchain anchoring and DigiLocker integrations rank highest).",
      action: "Ensure your issuers anchor certificates directly to Base Sepolia ledger for maximum confidence."
    },
    {
      label: "Open Source Activity",
      value: factors.openSourceActivity || 30,
      weight: "8%",
      icon: GitBranch,
      color: "text-pink-400",
      description: "Evaluates contributions to community code repositories, open source projects, and repository code structures.",
      action: "Link verified GitHub repositories and tag achievements under the 'Open Source' category."
    },
    {
      label: "Research Activity",
      value: factors.researchActivity || 30,
      weight: "8%",
      icon: BookOpen,
      color: "text-sky-400",
      description: "Scores verified academic research publications, technical case studies, and university publications.",
      action: "Upload links to your research articles or technical case studies to earn verification points."
    },
    {
      label: "Hackathon Performance",
      value: factors.hackathonPerformance || 40,
      weight: "8%",
      icon: Award,
      color: "text-rose-400",
      description: "Evaluates hackathon participation, finalist rankings, and wins verified by event organizers.",
      action: "Submit hackathon win credentials to be cryptographically verified by organizers."
    },
    {
      label: "Internship Quality",
      value: factors.internshipQuality || 45,
      weight: "8%",
      icon: Briefcase,
      color: "text-fuchsia-400",
      description: "Measures quality of internships based on tenure length, verified references, and company reputation.",
      action: "Request your internship managers to issue secure verifiable credentials for your work terms."
    }
  ];

  // Dynamic recommendations generated based on lowest factor values
  const getImprovements = () => {
    const list: any[] = [];
    if ((factors.peerValidation || 0) < 60) {
      list.push({
        title: "Request a Recommendation",
        points: "+25",
        desc: "You have limited peer validation. A recommendation from a verified mentor or supervisor adds immediate proof."
      });
    }
    if ((factors.verificationConfidence || 0) < 80) {
      list.push({
        title: "Anchor Credentials to Blockchain",
        points: "+20",
        desc: "Request pending issuers to anchor credentials to Base Sepolia to upgrade confidence from off-chain to on-chain."
      });
    }
    if ((factors.openSourceActivity || 0) < 50) {
      list.push({
        title: "Verify Open Source Contributions",
        points: "+15",
        desc: "Link your Github developer credentials to back your skills with real commits."
      });
    }
    if ((factors.fraudProbability || 0) < 95) {
      list.push({
        title: "Add Document Proofs for Self-Claims",
        points: "+15",
        desc: "Adding PDF proof links to your unverified achievements reduces the unverified claims penalty."
      });
    }
    return list.slice(0, 2); // Show top 2 recommendations
  };

  const improvements = getImprovements();

  // SVG Gauge Calculations
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  // Map 300-850 range to 0-100 percentage
  const scorePercent = Math.max(0, Math.min(100, ((total - 300) / 550) * 100));
  const strokeOffset = circumference - (scorePercent / 100) * circumference;

  // Custom SVG History Sparkline Line Math
  const getSvgPath = () => {
    if (history.length < 2) return "";
    const width = 600;
    const height = 180;
    const padding = 20;

    const xPoints = history.map((_: any, i: number) => {
      return padding + (i / (history.length - 1)) * (width - 2 * padding);
    });

    const yPoints = history.map((h: any) => {
      const s = h.score || 350;
      const percent = (s - 300) / 550;
      return height - padding - percent * (height - 2 * padding);
    });

    let path = `M ${xPoints[0]} ${yPoints[0]}`;
    for (let i = 1; i < history.length; i++) {
      // Smooth cubic bezier curves
      const cpX1 = xPoints[i - 1] + (xPoints[i] - xPoints[i - 1]) / 2;
      const cpY1 = yPoints[i - 1];
      const cpX2 = xPoints[i - 1] + (xPoints[i] - xPoints[i - 1]) / 2;
      const cpY2 = yPoints[i];
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${xPoints[i]} ${yPoints[i]}`;
    }
    return path;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            Dynamic Trust Engine
          </h1>
          <p className="text-muted-foreground mt-1">Real-time cryptographic credit metrics verifying your capabilities.</p>
        </div>
        <div className="border border-white/5 bg-neutral-950/60 p-4 rounded-xl text-xs text-muted-foreground max-w-sm backdrop-blur-md">
          <p><strong className="text-white">Explainable Identity:</strong> This engine dynamically translates verified cryptographic proofs, peer assertions, and active timeline consistency into a transparent credit score.</p>
        </div>
      </div>

      {/* Main Score and Sparkline Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Radial FICO Gauge */}
        <Card className="surface-panel flex flex-col items-center justify-center p-8 relative overflow-hidden h-[340px]">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* SVG Circle Gauge */}
            <svg className="w-full h-full transform -rotate-90">
              {/* Underlay Track */}
              <circle
                cx="88"
                cy="88"
                r={radius}
                className="stroke-neutral-800"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Colored Arc overlay */}
              <circle
                cx="88"
                cy="88"
                r={radius}
                className="stroke-primary transition-all duration-1000 ease-out"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
              />
            </svg>
            
            {/* Inner Content */}
            <div className="absolute flex flex-col items-center text-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Trust Score</span>
              <span className="text-5xl font-black text-white mt-1 select-all">{total}</span>
              <Badge className={`mt-2 ${statusMeta.bg} ${statusMeta.border} ${statusMeta.color} hover:none text-[9px] uppercase font-bold tracking-wider px-2 py-0.5`}>
                {statusMeta.label}
              </Badge>
            </div>
          </div>
          
          <p className="text-[11px] text-muted-foreground mt-4 text-center px-4 leading-normal">
            {explanation}
          </p>
        </Card>

        {/* SVG Sparkline Timeline Chart */}
        <Card className="surface-panel col-span-1 md:col-span-2 p-6 flex flex-col justify-between h-[340px]">
          <div>
            <CardTitle className="text-lg text-white">Trust History Timeline</CardTitle>
            <CardDescription className="text-xs">Dynamic tracking log of your cryptographic score updates.</CardDescription>
          </div>

          {/* SVG Line Graph Area */}
          <div className="w-full h-44 bg-neutral-950/40 border border-white/5 rounded-xl p-2 relative overflow-hidden flex items-end">
            {history.length >= 2 ? (
              <svg viewBox="0 0 600 180" className="w-full h-full overflow-visible">
                <defs>
                  {/* Neon Glow gradient */}
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  {/* Fill Area gradient */}
                  <linearGradient id="fillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                
                {/* Horizontal Guide gridlines */}
                <line x1="10" y1="20" x2="590" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="10" y1="90" x2="590" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="10" y1="160" x2="590" y2="160" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                {/* Smooth Curve path */}
                <path
                  d={getSvgPath()}
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="3.5"
                  className="transition-all duration-500"
                />

                {/* Interaction Node Dots */}
                {history.map((h: any, i: number) => {
                  const width = 600;
                  const height = 180;
                  const padding = 20;
                  const x = padding + (i / (history.length - 1)) * (width - 2 * padding);
                  const percent = (h.score - 300) / 550;
                  const y = height - padding - percent * (height - 2 * padding);

                  return (
                    <g key={h.id} className="group/dot cursor-pointer">
                      <circle
                        cx={x}
                        cy={y}
                        r="5"
                        className="fill-neutral-950 stroke-emerald-400 stroke-2 transition-all duration-200 group-hover/dot:r-7"
                      />
                      <title>{`Score: ${h.score}\nDate: ${new Date(h.timestamp).toLocaleDateString()}\nInfo: ${h.explanation}`}</title>
                    </g>
                  );
                })}
              </svg>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                Insufficient history logging points to draw timeline.
              </div>
            )}
          </div>

          {/* Sparkline Bottom Legend */}
          <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t border-white/5 pt-3">
            <span>Poor (300)</span>
            <span>Fair (580)</span>
            <span>Good (670)</span>
            <span>Very Good (740)</span>
            <span>Exceptional (850)</span>
          </div>
        </Card>
      </div>

      {/* Trust Factors Section Heading */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          Explainable Trust Breakdown
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Click or hover over any of the 12 dynamic factors to inspect its logic and improvement actions.</p>
      </div>

      {/* Grid of the 12 Factors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {factorList.map((f: TrustFactorMeta) => {
          const FactorIcon = f.icon;
          
          // Determine color and status badge based on factor score
          let levelStr = "Needs Work";
          let badgeColor = "bg-rose-500/10 border-rose-500/20 text-rose-400";
          if (f.value >= 85) {
            levelStr = "Optimal";
            badgeColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
          } else if (f.value >= 70) {
            levelStr = "Strong";
            badgeColor = "bg-teal-500/10 border-teal-500/20 text-teal-400";
          } else if (f.value >= 50) {
            levelStr = "Moderate";
            badgeColor = "bg-amber-500/10 border-amber-500/20 text-amber-400";
          }

          const isHovered = hoveredFactor === f.label;

          return (
            <Card 
              key={f.label} 
              className={`surface-panel transition-all duration-300 relative overflow-hidden cursor-pointer ${isHovered ? 'scale-[1.03] border-white/20 shadow-xl' : 'hover:border-white/10'}`}
              onMouseEnter={() => setHoveredFactor(f.label)}
              onMouseLeave={() => setHoveredFactor(null)}
            >
              {/* Radial gradient background on hover */}
              {isHovered && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.015),_transparent)] pointer-events-none" />
              )}
              
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-neutral-900 border border-white/5 rounded-xl">
                    <FactorIcon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground font-mono block">Weight: {f.weight}</span>
                    <span className="text-2xl font-black text-white mt-0.5 block">{f.value}<span className="text-xs text-muted-foreground">/100</span></span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {f.label}
                  </h3>
                  <Badge className={`mt-1.5 hover:none border text-[9px] uppercase tracking-widest font-mono font-bold ${badgeColor}`}>
                    {levelStr}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed h-[60px] overflow-y-auto pr-1 select-none">
                  {f.description}
                </p>

                {/* Hover Reveal Action Area */}
                <div className="pt-3 border-t border-white/5 text-[10px] space-y-1">
                  <span className="text-white/40 block font-bold uppercase tracking-wider">Improvement Action:</span>
                  <p className="text-white/80 leading-normal">{f.action}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Suggestions Row */}
      {improvements.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Key Indicators summary */}
          <Card className="surface-panel">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Trust Verification Signals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-neutral-950/40 border border-white/5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white text-xs font-bold">Government-Backed Integrity</h4>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-normal">
                    DigiLocker synchronization establishes proof of academic records and core legal name identity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-neutral-950/40 border border-white/5">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white text-xs font-bold">Cryptographic Multi-Signature</h4>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-normal">
                    On-chain anchored credentials prevent modification or fraud, boosting your confidence factor.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Action items */}
          <Card className="surface-panel border-amber-500/10 bg-amber-500/[0.01]">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-amber-500 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                Optimized Boost Pathway
              </CardTitle>
              <CardDescription className="text-amber-500/60 text-xs">Action items to raise your Trust Score above 800 (Exceptional).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {improvements.map((imp, idx) => (
                <div key={idx} className="group p-4 rounded-xl bg-neutral-950/40 border border-white/5 hover:border-amber-500/20 transition-all flex justify-between items-center gap-4">
                  <div className="space-y-1">
                    <h4 className="text-white text-xs font-bold group-hover:text-amber-400 transition-colors">{imp.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-normal">{imp.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs font-bold px-2.5 py-1">
                      {imp.points} pts
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}
