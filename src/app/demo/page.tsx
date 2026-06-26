"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  CheckCircle, 
  AlertTriangle, 
  Building2, 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  ExternalLink, 
  Lock, 
  Search, 
  Clock, 
  Sparkles, 
  Terminal, 
  ArrowUpRight, 
  FileText, 
  ChevronRight,
  TrendingUp,
  Cpu,
  CheckCircle2
} from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";

// 9 simulation stages definition
const STAGES = [
  { id: 1, title: "University Issues Degree", subtitle: "IIT Bombay anchors credential", color: "text-indigo-400" },
  { id: 2, title: "Student Receives Alert", subtitle: "Push notification dispatched", color: "text-amber-400" },
  { id: 3, title: "Cryptographic Audit", subtitle: "Signature & context check", color: "text-sky-400" },
  { id: 4, title: "Blockchain Update", subtitle: "Base Sepolia verification block", color: "text-emerald-400" },
  { id: 5, title: "Trust Engine Calculation", subtitle: "Trust score recalculates live", color: "text-fuchsia-400" },
  { id: 6, title: "Recruiter Query Match", subtitle: "AI ranks candidate pool", color: "text-indigo-400" },
  { id: 7, title: "Verification Checkpoint", subtitle: "Zero-tampering audit success", color: "text-emerald-400" },
  { id: 8, title: "Candidate Shortlisted", subtitle: "ATS status updated in pipeline", color: "text-teal-400" },
  { id: 9, title: "Student Receives Offer", subtitle: "Google India placement offer", color: "text-pink-400" }
];

export default function DemoSimulatorPage() {
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 means idle/not started
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(3500); // Step duration in ms
  const [logs, setLogs] = useState<{ time: string; text: string; type: "info" | "success" | "warning" | "blockchain" }[]>([]);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [anchoredId, setAnchoredId] = useState<string>("");
  const [blockchainHash, setBlockchainHash] = useState<string>("");
  
  // Simulated UI states
  const [studentScore, setStudentScore] = useState<number>(710);
  const [recruiterSearch, setRecruiterSearch] = useState<string>("");
  const [atsColumn, setAtsColumn] = useState<"applied" | "screening" | "shortlisted">("applied");
  const [typingState, setTypingState] = useState<string>("");
  
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initial logger function
  const addLog = (text: string, type: "info" | "success" | "warning" | "blockchain" = "info") => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    setLogs(prev => [...prev, { time: timeStr, text, type }]);
  };

  // Scroll to bottom of terminal
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Seed or verify Aarav Sharma (student-123) in Firestore at start
  const ensureAaravSharmaExists = async () => {
    setIsSeeding(true);
    addLog("[KERNEL] Handshaking database environment...", "info");
    try {
      // 1. Create candidate user document
      const userRef = doc(db, "users", "student-123");
      await setDoc(userRef, {
        uid: "student-123",
        email: "aarav.sharma@example.com",
        displayName: "Aarav Sharma",
        photoURL: "https://i.pravatar.cc/150?u=aarav-sharma-123",
        role: "student",
        createdAt: serverTimestamp()
      }, { merge: true });

      // 2. Create student profile document with base trust score
      const studentRef = doc(db, "students", "student-123");
      await setDoc(studentRef, {
        uid: "student-123",
        fullName: "Aarav Sharma",
        email: "aarav.sharma@example.com",
        studentEmail: "aarav.sharma@example.com",
        institution: "IIT Bombay",
        university: "IIT Bombay",
        degree: "B.Tech in Computer Science & Engineering",
        major: "Computer Science and Engineering",
        graduationYear: "2026",
        avatar: "https://i.pravatar.cc/150?u=aarav-sharma-123",
        skills: ["React", "TypeScript", "Node.js", "Python", "Algorithms", "Firebase", "Docker"],
        profileCompletion: 95,
        isDigiLockerConnected: true,
        location: "Mumbai, India",
        interests: ["Full-Stack Development", "Blockchain", "Cloud Computing"],
        projects: [
          { name: "AscendID Protocol", description: "Decentralized trust layer for talent credentials on Base Sepolia blockchain.", tech: "Solidity, Next.js, Viem" }
        ],
        trustScore: 710,
        trustFactors: {
          issuerReputation: 85,
          credentialFreshness: 75,
          credentialImportance: 80,
          fraudProbability: 95,
          skillConsistency: 80,
          experienceGrowth: 75,
          peerValidation: 70,
          verificationConfidence: 80,
          openSourceActivity: 60,
          researchActivity: 50,
          hackathonPerformance: 70,
          internshipQuality: 75
        }
      }, { merge: true });

      addLog("[FIRESTORE] Synchronized Aarav Sharma's candidate profile (student-123). Base Trust Score: 710 FICO.", "success");
    } catch (e: any) {
      addLog(`[WARNING] Firestore setup fallback active: ${e.message || e}`, "warning");
    } finally {
      setIsSeeding(false);
    }
  };

  // Run the state transitions
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setTimeout(() => {
        if (currentStep < 9) {
          setCurrentStep(prev => prev + 1);
        } else {
          setIsPlaying(false);
          addLog("[KERNEL] Presentation simulation complete. All nodes synchronized.", "success");
        }
      }, speed);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, speed]);

  // Execute actual step events
  useEffect(() => {
    if (currentStep === 0) return;
    
    addLog(`[STAGE ${currentStep}] Transitioning to: ${STAGES[currentStep - 1].title}...`, "info");

    switch (currentStep) {
      case 1:
        // Stage 1: University issues degree
        triggerIssuerAPI();
        break;
      case 2:
        // Stage 2: Notification received
        addLog("[PASSPORT] Dispatching real-time WebSocket push notification to student dashboard.", "info");
        addLog("[ALERT] User Device Event: Notification 'New Verified Credential from IIT Bombay' received.", "success");
        break;
      case 3:
        // Stage 3: Verification Check
        addLog("[AUDITOR] Auditing signature block proof...", "info");
        addLog(`[AUDITOR] DID Key Check: resolving did:ascendid:iit-bombay-123... [OK]`, "success");
        addLog(`[AUDITOR] Signature Decrypted: matching SHA-256 integrity hash... [OK]`, "success");
        break;
      case 4:
        // Stage 4: Ledger Confirmation
        addLog(`[BLOCKCHAIN] Mining confirmation on Base Sepolia. Block height: #14,923,412.`, "blockchain");
        addLog(`[BLOCKCHAIN] Tx receipt indexed: ${blockchainHash || "0x7d39ae92f80c651ad506ab1a87e502cfaee88732"}`, "blockchain");
        break;
      case 5:
        // Stage 5: Trust score recalculated
        triggerTrustEngineAPI();
        break;
      case 6:
        // Stage 6: Recruiter search typing
        setRecruiterSearch("");
        simulateRecruiterTyping("Aarav Sharma");
        break;
      case 7:
        // Stage 7: Recruiter audits checkpoint
        addLog("[RECRUITER] Opening public verify page. Requesting DID signature audit.", "info");
        addLog("[VERIFIER] Verification Score: 100% (Cryptographic Proof Intact)", "success");
        break;
      case 8:
        // Stage 8: Candidate Shortlisted in ATS
        addLog("[RECRUITER] Action: Shortlist candidate Aarav Sharma for Google India Software Engineer.", "info");
        setAtsColumn("shortlisted");
        addLog("[FIRESTORE] Saved ATS candidate state: student-123 -> Shortlisted", "success");
        break;
      case 9:
        // Stage 9: Offer popup
        addLog("[PASSPORT] Pushing Placement Offer modal to Aarav Sharma's passport dashboard.", "success");
        addLog("[OFFER] Google India Software Engineer role accepted. Match rate: 94%.", "success");
        break;
    }
  }, [currentStep]);

  // Live trigger for Stage 1: API anchoring call
  const triggerIssuerAPI = async () => {
    setApiLoading(true);
    addLog("[API] POST /api/credentials/anchor: Initiating verifiable credential creation...", "info");
    
    try {
      const response = await fetch("/api/credentials/anchor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issuerId: "iit-bombay-123",
          issuerName: "IIT Bombay",
          issuerType: "university",
          studentName: "Aarav Sharma",
          studentEmail: "aarav.sharma@example.com",
          title: "Bachelor of Technology in Computer Science & Engineering",
          description: "Completed with Honors, CGPA: 9.42/10. Specialization in Cryptography and Distributed Systems.",
          credentialType: "degree",
          issueDate: new Date().toISOString().split("T")[0],
          expiryDate: "Never",
          issuerWallet: "0x4B3819d4C18d1847291a20A2091a20A2091"
        })
      });
      const result = await response.json();
      if (result.success) {
        setAnchoredId(result.id);
        setBlockchainHash(result.transactionHash);
        addLog(`[FIRESTORE] Saved W3C record. Document UUID: ${result.id}`, "success");
        addLog(`[LEDGER] anchored on Base Sepolia. Hash: ${result.transactionHash.slice(0, 20)}...`, "blockchain");
      } else {
        throw new Error(result.error || "Failed to anchor");
      }
    } catch (e: any) {
      // Graceful fallback for offline / developer environments
      const fallbackHash = "0x" + Math.random().toString(16).slice(2, 10) + "7d39ae92f80c651ad506ab1a87e502cfaee88732";
      setBlockchainHash(fallbackHash);
      setAnchoredId("mock-cred-uuid-123");
      addLog("[WARNING] Live Blockchain provider failed/offline. Falling back to local ledger simulator.", "warning");
      addLog(`[MOCK LEDGER] Anchored hash 0x7a83d... on block #14,923,412. Tx: ${fallbackHash.slice(0, 16)}...`, "blockchain");
    } finally {
      setApiLoading(false);
    }
  };

  // Live trigger for Stage 5: Recalculate Trust Score API
  const triggerTrustEngineAPI = async () => {
    addLog("[API] POST /api/student/trust-score: Requesting Trust Engine evaluation...", "info");
    try {
      const response = await fetch("/api/student/trust-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: "student-123" })
      });
      const result = await response.json();
      if (result.success) {
        setStudentScore(result.total);
        addLog(`[TRUST ENGINE] Recalculated index: ${result.total} FICO score.`, "success");
        addLog(`[TRUST ENGINE] Analysis: ${result.explanation}`, "info");
      } else {
        throw new Error("Calculation failed");
      }
    } catch {
      // Simulate trust bump from 710 to 785
      let current = 710;
      const interval = setInterval(() => {
        current += 5;
        if (current >= 785) {
          setStudentScore(785);
          clearInterval(interval);
        } else {
          setStudentScore(current);
        }
      }, 50);
      addLog("[WARNING] Offline/Mock fallback: recalculating trust dial. Bumped +75 due to IIT Bombay degree.", "warning");
      addLog("[TRUST ENGINE] Trust Score updated to 785 (Exceptional). Saved to registry.", "success");
    }
  };

  // Helper typing simulation
  const simulateRecruiterTyping = (text: string) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setRecruiterSearch(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
        addLog("[RECRUITER] Search matched Aarav Sharma. Index position #1 (Exceptional Trust score)", "success");
      }
    }, 100);
  };

  // Controller Actions
  const handleStartStop = () => {
    if (!isPlaying && currentStep === 0) {
      // First boot
      ensureAaravSharmaExists().then(() => {
        setCurrentStep(1);
        setIsPlaying(true);
      });
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPlaying(false);
    setCurrentStep(0);
    setLogs([]);
    setStudentScore(710);
    setRecruiterSearch("");
    setAtsColumn("applied");
    addLog("[KERNEL] Simulation reset. Ready.", "info");
  };

  const handleSkipToStep = (step: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentStep(step);
    setIsPlaying(true);
  };

  return (
    <div className="relative min-h-screen bg-[#0B1020] text-white font-sans flex flex-col p-6 overflow-hidden">
      {/* Background Decorative Mesh */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 z-10 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/" className="w-5 h-5 bg-white flex items-center justify-center rounded-sm">
              <span className="text-[10px] font-bold text-black leading-none">A</span>
            </Link>
            <span className="text-sm font-medium tracking-wide uppercase font-heading">
              AscendID Presentation Simulator
            </span>
            <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 text-[10px]">
              HACKATHON MODE
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">One-click live presentation simulation. Auto-runs W3C credential cycles, Base Sepolia blockchain state mapping, and recruiter shortlisting.</p>
        </div>

        {/* CONTROLLER MODULE */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Play/Pause */}
          <Button 
            onClick={handleStartStop} 
            disabled={isSeeding}
            className={`font-semibold h-9 px-4 rounded-md text-xs shadow-md transition-all flex items-center gap-2 ${
              isPlaying ? "bg-amber-500 text-black hover:bg-amber-400" : "bg-white text-black hover:bg-white/90"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> {currentStep === 0 ? "Start Auto-Simulation" : "Resume"}
              </>
            )}
          </Button>

          {/* Reset */}
          <Button 
            onClick={handleReset}
            className="bg-neutral-900 border border-white/10 hover:bg-neutral-800 text-white h-9 px-3 rounded-md text-xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>

          {/* Speed Selector */}
          <div className="flex items-center bg-neutral-900 border border-white/10 rounded-md h-9 px-2">
            <span className="text-[10px] text-muted-foreground mr-1.5 uppercase font-bold">Speed:</span>
            <select 
              value={speed} 
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="bg-transparent text-xs text-white border-none outline-none cursor-pointer focus:ring-0"
            >
              <option value={5000} className="bg-[#0F1629]">Slow (5s)</option>
              <option value={3500} className="bg-[#0F1629]">Normal (3.5s)</option>
              <option value={1500} className="bg-[#0F1629]">Fast (1.5s)</option>
            </select>
          </div>
        </div>
      </header>

      {/* STEPPERS TIMELINE TRACKER */}
      <div className="w-full bg-neutral-950/40 border border-white/5 rounded-xl p-4 mb-6 z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
        {STAGES.map((s) => {
          const isActive = currentStep === s.id;
          const isCompleted = currentStep > s.id;
          return (
            <div 
              key={s.id} 
              onClick={() => handleSkipToStep(s.id)}
              className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between h-20 ${
                isActive 
                  ? "bg-indigo-500/10 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                  : isCompleted 
                    ? "bg-emerald-500/5 border-emerald-500/20 opacity-80"
                    : "bg-neutral-900/40 border-white/5 opacity-50 hover:opacity-85"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-bold ${isActive ? "text-indigo-400" : isCompleted ? "text-emerald-400" : "text-muted-foreground"}`}>
                  STAGE 0{s.id}
                </span>
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : isActive ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                ) : null}
              </div>
              <div>
                <p className="text-[11px] font-black text-white leading-tight truncate">{s.title}</p>
                <p className="text-[9px] text-muted-foreground leading-none mt-0.5 truncate">{s.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CORE WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 z-10 min-h-0">
        
        {/* LEFT WORKSPACE: KERNEL CONSOLE OUTPUT */}
        <div className="lg:col-span-4 flex flex-col min-h-[300px] lg:min-h-0">
          <Card className="flex-1 bg-neutral-950/80 border border-white/5 rounded-xl overflow-hidden flex flex-col shadow-2xl font-mono">
            <CardHeader className="py-3 px-4 border-b border-white/5 bg-neutral-950/40 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <CardTitle className="text-xs uppercase tracking-wider text-white">Live Operations Kernel Log</CardTitle>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-1.5 py-0">
                STABLE
              </Badge>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-y-auto text-[11px] space-y-2 leading-relaxed h-[350px] lg:h-[450px]">
              {logs.length === 0 ? (
                <div className="flex flex-col h-full items-center justify-center text-muted-foreground text-center p-6 select-none font-sans">
                  <Cpu className="w-10 h-10 text-neutral-800 mb-3 animate-pulse" />
                  <p className="text-xs">Console is offline. Click &ldquo;Start Auto-Simulation&rdquo; above to mount the pipeline.</p>
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 border-b border-white/[0.02] pb-1.5">
                    <span className="text-muted-foreground">[{log.time}]</span>
                    <span className={
                      log.type === "success" ? "text-emerald-400 font-semibold" : 
                      log.type === "warning" ? "text-amber-400" : 
                      log.type === "blockchain" ? "text-cyan-400 font-bold" : "text-white/80"
                    }>
                      {log.text}
                    </span>
                  </div>
                ))
              )}
              <div ref={consoleEndRef} />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT WORKSPACE: LIVE SCREEN WORKSPACE */}
        <div className="lg:col-span-8 flex flex-col">
          <Card className="flex-1 bg-gradient-to-b from-[#0F1629]/50 to-[#070B14]/80 border border-white/5 rounded-xl shadow-2xl relative overflow-hidden flex flex-col p-6">
            
            <AnimatePresence mode="wait">
              
              {/* IDLE / NOT STARTED STATE */}
              {currentStep === 0 && (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col h-full items-center justify-center text-center p-8 max-w-lg mx-auto space-y-6 my-auto"
                >
                  <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.15)] animate-bounce">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">AscendID Presentation Simulator</h2>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      Click the button below to initiate a fully automated, synchronized showcase demonstrating university certificate anchoring, blockchain node logging, trust dial metrics, recruiter sourcing index, and final shortlisting.
                    </p>
                  </div>
                  <Button 
                    onClick={handleStartStop}
                    className="bg-white text-black hover:bg-neutral-100 font-bold h-12 px-8 rounded-full shadow-[0_0_35px_rgba(255,255,255,0.15)] transition-all hover:scale-105"
                  >
                    Launch Auto-Presentation
                  </Button>
                </motion.div>
              )}

              {/* STEP 1: UNIVERSITY PORTAL */}
              {currentStep === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="flex flex-col h-full space-y-6 animate-in fade-in duration-300"
                >
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-5 h-5 text-indigo-400" />
                      <span className="text-sm font-black text-white">IIT Bombay — Academic Registry Portal</span>
                    </div>
                    <Badge className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400">ISSUER PORTAL ACTIVE</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    <div className="space-y-4 bg-neutral-950/30 border border-white/5 rounded-xl p-5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Issuance Parameters</h3>
                      
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="text-muted-foreground block mb-1">Student Full Name</label>
                          <Input value="Aarav Sharma" disabled className="bg-neutral-950/60 border-white/5 text-white text-xs h-8" />
                        </div>
                        <div>
                          <label className="text-muted-foreground block mb-1">Recipient Email</label>
                          <Input value="aarav.sharma@example.com" disabled className="bg-neutral-950/60 border-white/5 text-white text-xs h-8" />
                        </div>
                        <div>
                          <label className="text-muted-foreground block mb-1">Academic Degree</label>
                          <Input value="Bachelor of Technology in Computer Science" disabled className="bg-neutral-950/60 border-white/5 text-white text-xs h-8" />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-6 bg-neutral-950/30 border border-white/5 rounded-xl space-y-4 text-center">
                      <div className="w-16 h-16 rounded-full border border-indigo-500/25 flex items-center justify-center bg-indigo-500/5 relative">
                        {apiLoading ? (
                          <div className="absolute inset-0 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                        ) : (
                          <FileText className="w-8 h-8 text-indigo-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Cryptographic Certificate Processing</h4>
                        <p className="text-[10px] text-muted-foreground mt-1">Generating SHA-256 hash and server-side private key signature.</p>
                      </div>
                      <Button className="w-full bg-indigo-500 text-white font-bold h-9 text-xs rounded-md shadow-lg pointer-events-none">
                        {apiLoading ? "Anchoring on Base Sepolia Ledger..." : "Issued Successfully"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: STUDENT PASSPORT NOTIFICATION */}
              {currentStep === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex flex-col h-full items-center justify-center"
                >
                  {/* Glassmorphic Mobile App Frame */}
                  <div className="w-72 h-[380px] bg-neutral-950/90 border border-white/10 rounded-[2.5rem] p-4 flex flex-col relative overflow-hidden shadow-2xl">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-neutral-950 rounded-full border border-white/10 flex items-center justify-center z-20">
                      <div className="w-2 h-2 rounded-full bg-neutral-900" />
                    </div>

                    {/* Sliding Notification Alert */}
                    <motion.div 
                      initial={{ y: -60, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 100 }}
                      className="absolute top-10 inset-x-3 bg-neutral-900/95 border border-white/10 p-3 rounded-2xl backdrop-blur-xl flex gap-2.5 shadow-xl z-30"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[10px] font-black text-white flex justify-between items-center">
                          AscendID Wallet
                          <span className="text-[8px] text-muted-foreground font-normal">Just now</span>
                        </h4>
                        <p className="text-[9px] text-white/90 leading-tight mt-0.5">IIT Bombay issued your B.Tech Degree. Tap to add.</p>
                      </div>
                    </motion.div>

                    {/* Wallet App Header */}
                    <div className="mt-8 flex justify-between items-center px-2">
                      <h3 className="text-xs font-black text-white">Digital Passport</h3>
                      <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-[8px] px-1.5 py-0">SECURE</Badge>
                    </div>

                    {/* Passport Card Stack list */}
                    <div className="mt-4 flex-1 space-y-3 overflow-y-auto px-1">
                      <div className="p-3 bg-neutral-900 border border-white/5 rounded-xl opacity-40">
                        <p className="text-[8px] font-mono text-muted-foreground">CERTIFICATE</p>
                        <p className="text-[10px] font-bold text-white mt-1">AWS Cloud Practitioner</p>
                      </div>
                      <div className="p-3 bg-neutral-900 border border-white/5 rounded-xl opacity-40">
                        <p className="text-[8px] font-mono text-muted-foreground">INTERNSHIP</p>
                        <p className="text-[10px] font-bold text-white mt-1">Zomato Soft Intern</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: CRYPTOGRAPHIC VERIFICATION CHECK */}
              {currentStep === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, rotateY: 90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: -90 }}
                  className="flex flex-col h-full space-y-6"
                >
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-indigo-400" />
                      <span className="text-sm font-black text-white">W3C Credential Verification Console</span>
                    </div>
                    <Badge className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400">SIGNATURE VERIFIED</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    <div className="bg-neutral-950/40 border border-white/5 p-4 rounded-xl flex flex-col justify-between">
                      <div>
                        <Badge className="bg-amber-500/10 border-amber-500/20 text-amber-400 font-mono text-[9px] mb-2">W3C VERIFIABLE CREDENTIAL</Badge>
                        <h3 className="text-sm font-bold text-white">B.Tech Degree Certificate</h3>
                        <p className="text-[10px] text-muted-foreground mt-1">Issued to: Aarav Sharma</p>
                      </div>

                      <div className="border-t border-white/5 pt-3 mt-4 text-[10px] space-y-1.5 font-mono text-muted-foreground">
                        <p>context: [&quot;credentials/v1&quot;, &quot;schema.org&quot;]</p>
                        <p>issuer: did:ascendid:iit-bombay-123</p>
                        <p className="truncate">proofMethod: JsonWebSignature2020</p>
                      </div>
                    </div>

                    <div className="bg-neutral-950/40 border border-white/5 p-4 rounded-xl flex flex-col justify-center space-y-4">
                      <h4 className="text-xs font-bold text-white">Cryptographic Registry Rules</h4>
                      
                      <div className="space-y-2.5 text-[11px]">
                        <div className="flex items-center justify-between bg-[#0B1020]/80 p-2 rounded border border-white/5">
                          <span className="text-muted-foreground">1. Registry Identity Check</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> SECURE</span>
                        </div>
                        <div className="flex items-center justify-between bg-[#0B1020]/80 p-2 rounded border border-white/5">
                          <span className="text-muted-foreground">2. Cryptographic Proof Verification</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> VERIFIED</span>
                        </div>
                        <div className="flex items-center justify-between bg-[#0B1020]/80 p-2 rounded border border-white/5">
                          <span className="text-muted-foreground">3. Hash Integrity Alignment</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> MATCHED</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: BLOCKCHAIN LEDGER UPDATED */}
              {currentStep === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col h-full space-y-6"
                >
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2.5">
                      <Cpu className="w-5 h-5 text-indigo-400" />
                      <span className="text-sm font-black text-white">Base Sepolia Block Explorer Interface</span>
                    </div>
                    <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400">LEDGER ANCHORED</Badge>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 flex-1">
                    {/* Node Visualizer */}
                    <div className="flex-1 bg-neutral-950/40 border border-white/5 p-4 rounded-xl flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05),transparent)] pointer-events-none" />
                      
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center text-xs opacity-60">
                          Block N-1
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        
                        <motion.div 
                          initial={{ scale: 0.8, boxShadow: "0 0 0px rgba(16,185,129,0)" }}
                          animate={{ scale: 1.1, boxShadow: "0 0 25px rgba(16,185,129,0.3)" }}
                          className="w-16 h-16 rounded-2xl bg-emerald-500/10 border-2 border-emerald-400 flex flex-col items-center justify-center text-xs text-emerald-400 font-bold"
                        >
                          <CheckCircle className="w-5 h-5 mb-1" />
                          Mined
                        </motion.div>
                        
                        <ChevronRight className="w-4 h-4 text-muted-foreground animate-pulse" />
                        <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center text-xs opacity-30 animate-pulse">
                          Node
                        </div>
                      </div>
                    </div>

                    {/* Block Info Card */}
                    <div className="w-full md:w-80 bg-neutral-950/40 border border-white/5 p-4 rounded-xl font-mono text-[10px] space-y-2 flex flex-col justify-center">
                      <div className="border-b border-white/5 pb-2 mb-2">
                        <span className="text-muted-foreground">Transaction Receipt</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contract:</span>
                        <span className="text-white">0xe7a5d3...ee88732</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tx Hash:</span>
                        <span className="text-indigo-400 truncate max-w-[120px]" title={blockchainHash || "0x7d39ae92f80c651ad506ab1a87e502cfaee88732"}>
                          {blockchainHash ? blockchainHash.slice(0, 14) + "..." : "0x7d39ae92f80..."}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Block:</span>
                        <span className="text-emerald-400 font-bold">14,923,412</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1"><Lock className="w-3 h-3" /> Anchored</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: TRUST ENGINE CALCULATION */}
              {currentStep === 5 && (
                <motion.div 
                  key="step5"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex flex-col h-full space-y-6"
                >
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2.5">
                      <TrendingUp className="w-5 h-5 text-indigo-400" />
                      <span className="text-sm font-black text-white">Trust Engine Telemetry Dashboard</span>
                    </div>
                    <Badge className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400">TELEMETRY UPDATED</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1">
                    
                    {/* Score Dial */}
                    <div className="md:col-span-5 bg-neutral-950/40 border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent)] pointer-events-none" />
                      
                      <div className="relative w-36 h-36 flex flex-col items-center justify-center">
                        {/* Dynamic glow text */}
                        <span className="text-5xl font-black text-white tracking-tight animate-pulse">{studentScore}</span>
                        <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase mt-1">FICO Trust Index</span>
                        <Badge className="mt-2 bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold text-[9px] px-2 py-0.5">
                          EXCEPTIONAL
                        </Badge>
                      </div>
                    </div>

                    {/* Sparkline and details */}
                    <div className="md:col-span-7 bg-neutral-950/40 border border-white/5 p-4 rounded-xl flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white mb-2">Score Progress Tracker (30 Days)</h4>
                        
                        {/* Custom SVG Line Chart */}
                        <div className="relative h-20 bg-neutral-950/50 rounded-lg p-2 overflow-hidden flex items-end">
                          <svg className="absolute inset-0 w-full h-full p-2" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            {/* Area */}
                            <path d="M 0 25 L 20 22 L 40 23 L 60 21 L 80 12 L 100 3 L 100 30 L 0 30 Z" fill="url(#sparkline-grad)" />
                            {/* Line */}
                            <path d="M 0 25 L 20 22 L 40 23 L 60 21 L 80 12 L 100 3" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                          <div className="w-full flex justify-between text-[8px] text-muted-foreground z-10">
                            <span>May 26 (710)</span>
                            <span className="text-emerald-400 font-bold">Jun 26 ({studentScore})</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-white/5 pt-3 mt-3">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Issuer Reputation: 95/100</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Verification Confidence: 90/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 6: RECRUITER SEARCH */}
              {currentStep === 6 && (
                <motion.div 
                  key="step6"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="flex flex-col h-full space-y-6"
                >
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2.5">
                      <Search className="w-5 h-5 text-indigo-400" />
                      <span className="text-sm font-black text-white">Recruiter AI Talent Sourcing Terminal</span>
                    </div>
                    <Badge className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400">MATCH RETRIEVED</Badge>
                  </div>

                  <div className="space-y-4 flex-1 flex flex-col">
                    {/* Search bar simulation */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                      <Input 
                        value={recruiterSearch} 
                        readOnly 
                        className="pl-9 bg-neutral-950/60 border-white/10 text-white text-xs h-9" 
                      />
                    </div>

                    {/* Candidate Results List */}
                    <div className="flex-1 bg-neutral-950/20 border border-white/5 rounded-xl overflow-hidden flex flex-col justify-center">
                      <AnimatePresence>
                        {recruiterSearch.length > 5 && (
                          <motion.div 
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-lg flex items-center justify-between mx-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full border border-indigo-500/20 overflow-hidden">
                                <img src="https://i.pravatar.cc/150?u=aarav-sharma-123" alt="Aarav" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-white">Aarav Sharma</h4>
                                <p className="text-[10px] text-muted-foreground mt-0.5">IIT Bombay • Computer Science and Engineering</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-right">
                              <div>
                                <span className="text-[9px] text-muted-foreground uppercase block font-bold">FICO Trust</span>
                                <span className="text-xs text-emerald-400 font-black">785</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-muted-foreground uppercase block font-bold">Job Fit</span>
                                <span className="text-xs text-white font-black">94%</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 7: VERIFICATION CHECKPOINT */}
              {currentStep === 7 && (
                <motion.div 
                  key="step7"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex flex-col h-full space-y-6"
                >
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-indigo-400" />
                      <span className="text-sm font-black text-white">Recruiter Verification Checkpoint Audit</span>
                    </div>
                    <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400">AUDIT PASS (100%)</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 items-center">
                    
                    {/* Big Check Badge */}
                    <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl text-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-pulse">
                        <ShieldCheck className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Zero Tampering Detected</h4>
                        <p className="text-[9px] text-muted-foreground mt-0.5">W3C envelope aligned and matched on-chain hash.</p>
                      </div>
                    </div>

                    {/* Check logs details */}
                    <div className="md:col-span-7 space-y-2.5 font-mono text-[10px] text-muted-foreground bg-neutral-950/30 border border-white/5 p-4 rounded-xl">
                      <div className="flex items-center justify-between text-white border-b border-white/5 pb-1.5 mb-2">
                        <span>Auditing Security Vectors</span>
                        <span className="text-emerald-400">100% Trust</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Ledger hash consistency:</span>
                        <span className="text-emerald-400">MATCHED</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Issuer authorized status:</span>
                        <span className="text-emerald-400">CONFIRMED</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Revocation directory query:</span>
                        <span className="text-emerald-400">SECURE</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Signature verification check:</span>
                        <span className="text-emerald-400">SECURE</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 8: CANDIDATE SHORTLISTED IN ATS */}
              {currentStep === 8 && (
                <motion.div 
                  key="step8"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col h-full space-y-6"
                >
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2.5">
                      <Users className="w-5 h-5 text-indigo-400" />
                      <span className="text-sm font-black text-white">Recruiter Candidate Shortlist Pipeline</span>
                    </div>
                    <Badge className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400">STATUS SHORTLISTED</Badge>
                  </div>

                  {/* ATS Board */}
                  <div className="grid grid-cols-3 gap-4 flex-1">
                    
                    {/* Applied column */}
                    <div className="bg-neutral-950/40 border border-white/5 rounded-xl p-3 flex flex-col space-y-2 opacity-60">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Applied</span>
                      <div className="h-full border-2 border-dashed border-white/[0.03] rounded-lg" />
                    </div>

                    {/* Screening column */}
                    <div className="bg-neutral-950/40 border border-white/5 rounded-xl p-3 flex flex-col space-y-2 opacity-60">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Screening</span>
                      <div className="h-full border-2 border-dashed border-white/[0.03] rounded-lg" />
                    </div>

                    {/* Shortlisted column */}
                    <div className="bg-neutral-950/40 border border-white/5 rounded-xl p-3 flex flex-col space-y-2 relative overflow-hidden">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider block">Shortlisted</span>
                      
                      <motion.div 
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="p-3 bg-indigo-500/10 border border-indigo-400/30 rounded-lg flex flex-col space-y-2 shadow-lg font-sans"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full overflow-hidden">
                            <img src="https://i.pravatar.cc/150?u=aarav-sharma-123" alt="Aarav" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-white leading-tight">Aarav Sharma</p>
                            <p className="text-[8px] text-indigo-400 font-bold mt-0.5">Trust Rank #1</p>
                          </div>
                        </div>
                      </motion.div>

                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.05),transparent)] pointer-events-none" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 9: PLACEMENT OFFER POPUP */}
              {currentStep === 9 && (
                <motion.div 
                  key="step9"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex flex-col h-full items-center justify-center relative"
                >
                  {/* Visual confetti particles */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.05),transparent)] pointer-events-none" />
                  
                  {/* Offer Glass Container */}
                  <motion.div 
                    initial={{ scale: 0.9, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 120 }}
                    className="max-w-md w-full bg-gradient-to-b from-[#1C1625]/90 to-[#0F0E14]/95 border border-pink-500/30 p-6 rounded-2xl text-center space-y-5 shadow-2xl relative font-sans"
                  >
                    <div className="w-16 h-16 rounded-full bg-pink-500/10 border-2 border-pink-400 flex items-center justify-center text-pink-400 mx-auto shadow-[0_0_20px_rgba(236,72,153,0.25)] animate-bounce">
                      <Sparkles className="w-8 h-8" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-white">Google India Placement Offer</h3>
                      <p className="text-xs text-pink-400 font-bold">PLACEMENT SECURED</p>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed px-2">
                      Congratulations Aarav Sharma! Your verified digital credentials, 785 exceptional trust score rating, and internship history at Zomato aligned with Google&apos;s automated hiring whitelist.
                    </p>

                    <div className="border-t border-white/5 pt-4 flex gap-3">
                      <Button 
                        onClick={handleReset}
                        className="flex-1 bg-neutral-900 border border-white/10 hover:bg-neutral-800 text-white font-bold h-10 text-xs rounded-md"
                      >
                        Run Presentation Again
                      </Button>
                      <Link href="/student/dashboard" className="flex-1">
                        <Button className="w-full bg-white text-black hover:bg-neutral-100 font-bold h-10 text-xs rounded-md">
                          Go to Dashboard
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                </motion.div>
              )}

            </AnimatePresence>

          </Card>
        </div>

      </div>

      {/* FOOTER CONTROLS INDICATORS */}
      <footer className="mt-6 flex justify-between items-center text-[10px] text-muted-foreground border-t border-white/5 pt-4 z-10 font-mono">
        <span>Status: {isPlaying ? "SIMULATION ACTIVE" : "PAUSED"}</span>
        <span>Network Target: Base Sepolia Testnet Node (0x84532)</span>
      </footer>
    </div>
  );
}
