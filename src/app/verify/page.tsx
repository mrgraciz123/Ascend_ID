"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  QrCode, 
  Search, 
  Camera, 
  UploadCloud, 
  Loader2, 
  Check, 
  ShieldAlert, 
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info
} from "lucide-react";
import Link from "next/link";

export default function QRScannerPortal() {
  const router = useRouter();
  const [credentialId, setCredentialId] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("Idle");
  const [dragActive, setDragActive] = useState(false);
  const [simulatedScanList, setSimulatedScanList] = useState<any[]>([]);
  const videoRef = useRef<HTMLDivElement>(null);

  // We load a few sample IDs from our mock database so recruiters can test easily
  useEffect(() => {
    setSimulatedScanList([
      { name: "Aarav Sharma (Verified B.Tech)", id: "cred-uuid-valid-1", type: "success" },
      { name: "Rohan Varma (Expired AWS Cloud)", id: "cred-uuid-fraud-21", type: "warning" },
      { name: "Karan Johar (Revoked React Certificate)", id: "cred-uuid-fraud-1", type: "error" },
      { name: "Test Student (Mismatched Signature)", id: "cred-uuid-fraud-36", type: "error" }
    ]);
  }, []);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const id = credentialId.trim();
    if (id) {
      router.push(`/verify/${id}`);
    }
  };

  // Simulates a webcam feed scan with animated scanning line
  const startCameraScan = () => {
    setIsScanning(true);
    setScanStatus("Initializing camera feed...");
    setTimeout(() => {
      setScanStatus("Analyzing QR pattern...");
      setTimeout(() => {
        // Pick a random mock ID for scanning simulation
        const randomMock = simulatedScanList[Math.floor(Math.random() * simulatedScanList.length)];
        setScanStatus(`Decoded: ${randomMock.id}`);
        setTimeout(() => {
          setIsScanning(false);
          router.push(`/verify/${randomMock.id}`);
        }, 1000);
      }, 2000);
    }, 1500);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    // Simulate reading QR code from dropped file
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setScanStatus("Processing uploaded QR image...");
      setIsScanning(true);
      setTimeout(() => {
        const randomMock = simulatedScanList[0]; // Aarav Sharma valid cert
        setScanStatus(`Decoded: ${randomMock.id}`);
        setTimeout(() => {
          setIsScanning(false);
          router.push(`/verify/${randomMock.id}`);
        }, 1000);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col justify-between py-12 px-4">
      {/* Glow items */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl w-full mx-auto space-y-8 relative z-10 flex-grow">
        {/* Header */}
        <div className="flex flex-col items-center justify-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <img src="/assets/logo.png" alt="AscendID Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold tracking-tight text-white">AscendID</span>
          </Link>
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-mono font-bold">QR Verification Portal</span>
        </div>

        {/* Scanner Panel */}
        <Card className="surface-panel border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[20px] pointer-events-none" />
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-indigo-400" />
              Scan & Verify Credential
            </CardTitle>
            <CardDescription className="text-xs">Verify the authenticity of digital certificates on Base Sepolia instantly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Webcam scanning area */}
            {isScanning ? (
              <div 
                ref={videoRef}
                className="relative h-60 bg-neutral-950 border border-indigo-500/30 rounded-xl overflow-hidden flex flex-col items-center justify-center space-y-3"
              >
                {/* Glowing Laser Scan Line */}
                <div className="absolute left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] animate-[bounce_2s_infinite]" />
                
                {/* Scanner Target Guide Grid */}
                <div className="w-32 h-32 border-2 border-dashed border-indigo-500/50 rounded-lg flex items-center justify-center">
                  <Camera className="w-8 h-8 text-indigo-500/40 animate-pulse" />
                </div>
                
                <p className="text-xs font-mono text-indigo-300 animate-pulse">{scanStatus}</p>
                
                <Button 
                  size="sm"
                  variant="destructive"
                  onClick={() => setIsScanning(false)}
                  className="absolute bottom-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs"
                >
                  Cancel Scan
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Simulated Webcam scan trigger */}
                <div 
                  onClick={startCameraScan}
                  className="border border-dashed border-white/10 hover:border-indigo-500/30 bg-neutral-900/30 hover:bg-neutral-900/60 p-6 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer group transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Camera className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-xs font-bold text-white">Scan via Camera</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Use your device webcam to capture QR code</p>
                  </div>
                </div>

                {/* Drag and Drop File Upload */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border border-dashed p-6 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                    dragActive 
                      ? "border-indigo-500 bg-indigo-500/5" 
                      : "border-white/10 hover:border-indigo-500/30 bg-neutral-900/30 hover:bg-neutral-900/60"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <UploadCloud className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-xs font-bold text-white">Upload QR Image</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Drag & drop or select an image file</p>
                  </div>
                </div>

              </div>
            )}

            {/* Manual input ID */}
            <form onSubmit={handleVerify} className="space-y-2 border-t border-white/5 pt-6">
              <Label htmlFor="id-input" className="text-xs font-semibold text-white/80 uppercase tracking-wider block">Manual Key Verification</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="id-input"
                    placeholder="Enter Credential UUID (e.g. cred-uuid-valid-1)"
                    value={credentialId}
                    onChange={(e) => setCredentialId(e.target.value)}
                    className="bg-background/50 text-white pl-9 text-xs h-10 border-white/10"
                  />
                </div>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white text-xs h-10 px-6 font-bold flex items-center gap-1">
                  Verify Key <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </form>

            {/* Quick Demo Test Section */}
            <div className="border-t border-white/5 pt-4 space-y-3">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                Quick Test Credentials (National Dataset)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {simulatedScanList.map((mock) => {
                  let badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                  if (mock.type === "warning") badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                  if (mock.type === "error") badgeStyle = "bg-rose-500/10 text-rose-400 border-rose-500/20";
                  
                  return (
                    <div 
                      key={mock.id}
                      onClick={() => router.push(`/verify/${mock.id}`)}
                      className="bg-white/[0.01] border border-white/5 hover:border-white/10 p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="truncate pr-2">
                        <span className="text-[11px] text-white block truncate">{mock.name}</span>
                        <code className="text-[9px] text-muted-foreground block truncate mt-0.5">{mock.id}</code>
                      </div>
                      <Badge className={`text-[9px] shrink-0 font-bold px-1.5 py-0 hover:none ${badgeStyle}`}>
                        {mock.type === "success" ? "Valid" : mock.type === "warning" ? "Expired" : "Fraud Alert"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

          </CardContent>
        </Card>
      </div>

      <div className="text-center text-xs text-muted-foreground/60 mt-12">
        © {new Date().getFullYear()} AscendID Ledger Verifier Node. Powered by Base Sepolia.
      </div>
    </div>
  );
}
