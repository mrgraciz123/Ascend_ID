"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2,
  Clock,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#0B1020] text-white font-sans overflow-hidden">
      
      {/* HEADER */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#0B1020]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-white flex items-center justify-center rounded-sm">
              <span className="text-[10px] font-bold text-black leading-none">A</span>
            </div>
            <span className="text-sm font-medium tracking-wide font-heading">
              AscendID
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/demo">
              <span className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1.5 mr-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Demo
              </span>
            </Link>
            <Link href="/auth/login">
              <span className="text-xs font-medium text-white/60 hover:text-white transition-colors cursor-pointer">Log In</span>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-white text-black hover:bg-white/90 font-medium h-8 px-4 text-xs rounded-full shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all hover:scale-105">
                Join the Network
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full flex flex-col items-center">
        
        {/* ACT 1: THE EMOTIONAL HERO */}
        <section className="relative w-full min-h-[100vh] flex flex-col lg:flex-row items-center justify-between px-6 pt-24 max-w-7xl mx-auto">
          {/* Background Ambient Glow */}
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 z-10 pt-12 lg:pt-0"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-medium tracking-tighter leading-[1.05] mb-8">
              Potential is everywhere.<br />
              <span className="text-white/40 italic font-serif">Proof is not.</span>
            </h1>
            <p className="text-lg text-white/60 max-w-xl leading-relaxed mb-12 font-light">
              Every year, millions of achievements disappear into messy PDFs and unverified resumes. 
              AscendID is the identity layer for talent—a single, cryptographically sealed passport that recruiters trust instantly.
            </p>
            <Link href="/auth/signup">
              <Button className="h-14 px-8 bg-white hover:bg-gray-200 text-black font-medium rounded-full transition-transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                Establish Your Identity
              </Button>
            </Link>
          </motion.div>

          {/* THE DIGITAL PASSPORT (APPLE WALLET STYLE) */}
          <motion.div 
            initial={{ opacity: 0, rotateY: 30, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, rotateY: -5, x: 0, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
            className="flex-1 w-full max-w-md perspective-1000 mt-20 lg:mt-0 z-10"
          >
            <div className="relative w-full aspect-[1/1.5] rounded-[2.5rem] bg-gradient-to-b from-[#1A2235] to-[#0A0E17] border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden animate-float flex flex-col p-8 backdrop-blur-2xl">
              {/* Glass Reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" />
              
              <div className="flex justify-between items-start mb-12 relative z-10">
                <div className="w-16 h-16 rounded-full border-2 border-white/20 overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=aditya" alt="Aditya" className="w-full h-full object-cover grayscale" />
                </div>
                <div className="px-3 py-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-md flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Identity Active</span>
                </div>
              </div>

              <div className="relative z-10 mb-auto">
                <h2 className="text-3xl font-heading font-medium tracking-tight mb-1">Aditya Sharma</h2>
                <p className="text-xs font-mono text-white/40 mb-8">UID: ASC-8472-9X</p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-md">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Academics Verified</div>
                      <div className="text-[10px] text-white/40 font-mono">DigiLocker API Signature</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-md">
                    <Briefcase className="w-5 h-5 text-success" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Internships Verified</div>
                      <div className="text-[10px] text-white/40 font-mono">Employer Cryptographic Sign</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="relative z-10 pt-6 border-t border-white/10 flex justify-between items-end">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">National Trust Score</div>
                  <div className="text-4xl font-heading font-medium">844</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-[10px] font-bold">in</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ACT 2: THE CINEMATIC TRANSFORMATION */}
        <section className="w-full min-h-screen flex flex-col items-center justify-center py-32 border-t border-white/5 relative">
          <div className="text-center max-w-3xl px-6 mb-24 z-10">
            <h2 className="text-4xl md:text-6xl font-heading font-medium tracking-tighter mb-6">
              The death of the resume.
            </h2>
            <p className="text-lg md:text-xl text-white/50 font-light">
              Stop proving who you are over and over again. We collapse the chaos of scattered documents into a single, immutable identity layer.
            </p>
          </div>

          <div className="relative w-full max-w-5xl h-[400px] flex items-center justify-center px-6">
            {/* The Chaos (Before) */}
            <motion.div 
              initial={{ opacity: 1, scale: 1 }}
              whileInView={{ opacity: 0, scale: 0.8 }}
              viewport={{ margin: "-200px" }}
              transition={{ duration: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative w-full h-full max-w-2xl">
                <span className="absolute top-10 left-10 text-2xl font-serif text-white/30 -rotate-12 blur-[1px]">PDF Marksheets</span>
                <span className="absolute top-1/4 right-20 text-xl font-mono text-white/20 rotate-6">Google Drive Links</span>
                <span className="absolute bottom-1/4 left-20 text-3xl font-heading text-white/40 -rotate-6">Emails</span>
                <span className="absolute bottom-10 right-1/3 text-lg font-sans text-white/20 rotate-12 blur-[2px]">Screenshots</span>
                <span className="absolute top-1/2 left-1/3 text-4xl font-serif text-white/10 rotate-45">Unverified Claims</span>
              </div>
            </motion.div>

            {/* The Order (After) */}
            <motion.div 
              initial={{ opacity: 0, scale: 1.2, filter: "blur(20px)" }}
              whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              viewport={{ margin: "-200px" }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="absolute z-10 flex flex-col items-center"
            >
              <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center backdrop-blur-xl border border-primary/30 mb-6 shadow-[0_0_100px_rgba(79,70,229,0.4)]">
                <ShieldCheck className="w-12 h-12 text-primary" />
              </div>
              <div className="text-2xl font-medium tracking-wide">One trusted profile.</div>
            </motion.div>
          </div>
        </section>

        {/* ACT 3: THE RECRUITER MOMENT */}
        <section className="w-full py-32 bg-white flex flex-col items-center justify-center px-6 text-black">
          <div className="max-w-4xl w-full text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-heading font-medium tracking-tighter mb-6">
              Time is money.
            </h2>
            <p className="text-lg md:text-xl text-black/60 font-light max-w-2xl mx-auto">
              For enterprise recruiters, manual background verification (BGV) is a massive liability. AscendID shrinks a 14-day process into a 2-hour hiring sprint.
            </p>
          </div>

          <div className="w-full max-w-4xl space-y-16">
            {/* Traditional Hiring */}
            <div className="w-full">
              <div className="text-xs font-bold uppercase tracking-widest text-black/40 mb-6">Traditional Hiring Flow</div>
              <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                <div className="flex-1 h-12 bg-black/5 rounded flex items-center justify-center text-sm font-medium border border-black/10">Resume Screen</div>
                <ArrowRight className="w-4 h-4 text-black/20 hidden md:block" />
                <div className="flex-1 h-12 bg-black/5 rounded flex items-center justify-center text-sm font-medium border border-black/10">Background Check</div>
                <ArrowRight className="w-4 h-4 text-black/20 hidden md:block" />
                <div className="flex-1 h-12 bg-black/5 rounded flex items-center justify-center text-sm font-medium border border-black/10">Verification</div>
                <ArrowRight className="w-4 h-4 text-black/20 hidden md:block" />
                <div className="flex-[0.5] h-12 bg-black text-white rounded flex items-center justify-center text-sm font-bold">Interview</div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-black/50 justify-end font-mono text-sm">
                <Clock className="w-4 h-4" /> 14 Days
              </div>
            </div>

            {/* AscendID Hiring */}
            <div className="w-full">
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-6">AscendID Flow</div>
              <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                <div className="flex-[2] h-16 bg-primary/10 rounded flex items-center justify-center text-primary font-bold border border-primary/20 shadow-[0_0_30px_rgba(79,70,229,0.15)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[marquee_2s_infinite]" />
                  AscendID Identity Verified
                </div>
                <ArrowRight className="w-4 h-4 text-primary hidden md:block" />
                <div className="flex-1 h-16 bg-black text-white rounded flex items-center justify-center text-sm font-bold shadow-xl">
                  Interview
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-primary justify-end font-mono text-sm font-bold">
                <Clock className="w-4 h-4" /> 2 Hours
              </div>
            </div>
          </div>
        </section>

        {/* ACT 4: REAL PEOPLE */}
        <section className="w-full py-32 border-t border-white/5 relative flex flex-col items-center">
          <div className="text-center max-w-3xl px-6 mb-24 z-10">
            <h2 className="text-4xl md:text-5xl font-heading font-medium tracking-tighter mb-6">
              Built for the ambitious.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl w-full px-6 relative z-10">
            {/* Student Profile */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-start gap-6 hover:bg-white/10 transition-colors">
              <div className="w-20 h-20 rounded-full overflow-hidden">
                <img src="https://i.pravatar.cc/150?u=priya" alt="Student" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-2xl font-medium mb-2">Priya Menon</h3>
                <p className="text-white/50 leading-relaxed font-light">
                  "I was tired of uploading my marksheets 50 times for 50 different applications. 
                  Now I just share my AscendID profile, and recruiters know it's cryptographically backed by DigiLocker."
                </p>
              </div>
              <div className="mt-auto flex items-center gap-2 text-xs font-mono text-success bg-success/10 px-3 py-1.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Identity Verified
              </div>
            </div>

            {/* Recruiter Profile */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-start gap-6 hover:bg-white/10 transition-colors md:mt-12">
              <div className="w-20 h-20 rounded-full overflow-hidden">
                <img src="https://i.pravatar.cc/150?u=rohit" alt="Recruiter" className="w-full h-full object-cover grayscale" />
              </div>
              <div>
                <h3 className="text-2xl font-medium mb-2">Rohit Das</h3>
                <p className="text-white/50 leading-relaxed font-light">
                  "As a hiring manager at a Series B startup, I don't have a massive BGV team. 
                  AscendID guarantees that the candidates I interview actually have the degrees and experience they claim."
                </p>
              </div>
              <div className="mt-auto flex items-center gap-2 text-xs font-mono text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                <Briefcase className="w-3.5 h-3.5" /> Enterprise Partner
              </div>
            </div>
          </div>
        </section>

        {/* ACT 5: THE ECOSYSTEM NODE */}
        <section className="w-full h-[80vh] flex flex-col items-center justify-center relative overflow-hidden bg-[#0B1020] border-t border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-[#0B1020] to-[#0B1020]" />
          
          <div className="z-10 text-center max-w-2xl px-6">
            <div className="w-16 h-16 mx-auto bg-white text-black rounded-full flex items-center justify-center text-2xl font-bold shadow-[0_0_50px_rgba(255,255,255,0.3)] mb-8">
              A
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-medium tracking-tighter mb-8">
              Join the infrastructure.
            </h2>
            <Link href="/auth/signup">
              <Button className="h-14 px-8 bg-primary hover:bg-primary/90 text-white font-bold rounded-full transition-transform hover:scale-105 shadow-[0_0_40px_rgba(79,70,229,0.4)]">
                Create Your Identity
              </Button>
            </Link>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="py-8 border-t border-white/5 relative z-10 bg-[#0B1020]">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">AscendID Protocol</span>
          </div>
          <div className="flex gap-6 text-[10px] font-bold tracking-widest uppercase text-white/40">
            <Link href="#" className="hover:text-white transition-colors">Manifesto</Link>
            <Link href="#" className="hover:text-white transition-colors">Security</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
