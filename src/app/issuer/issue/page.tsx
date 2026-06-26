"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { CredentialService } from "@/services/credential";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Award, ShieldCheck, AlertCircle, CheckCircle, Loader2, ArrowLeft, QrCode, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function IssueCredentialPage() {
  const { currentUser } = useAuth();
  const [issuerProfile, setIssuerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [issuedId, setIssuedId] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Form Fields
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [credentialType, setCredentialType] = useState<any>("degree");
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [expiryDate, setExpiryDate] = useState("");
  const [isNeverExpired, setIsNeverExpired] = useState(true);
  const [issuerWallet, setIssuerWallet] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!currentUser) return;
      const profileSnap = await getDoc(doc(db, "issuers", currentUser.uid));
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        setIssuerProfile(data);
        if (data.walletAddress) {
          setIssuerWallet(data.walletAddress);
        }
        
        // Auto select a smart credential type based on issuer type
        if (data.issuerType === "university") {
          setCredentialType("degree");
        } else if (data.issuerType === "company") {
          setCredentialType("internship");
        } else if (data.issuerType === "hackathon") {
          setCredentialType("achievement");
        } else if (data.issuerType === "certifier") {
          setCredentialType("certification");
        }
      }
    }
    loadProfile();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !issuerProfile) return;

    setLoading(true);
    setErrorMsg("");

    const result = await CredentialService.issueCredential({
      issuerId: currentUser.uid,
      issuerName: issuerProfile.name,
      issuerType: issuerProfile.issuerType,
      studentName,
      studentEmail,
      title,
      description,
      credentialType,
      issueDate,
      expiryDate: isNeverExpired ? "Never" : expiryDate,
      issuerWallet
    });

    if (result.success && result.id) {
      setSuccess(true);
      setIssuedId(result.id);
      
      // Reset form
      setStudentName("");
      setStudentEmail("");
      setTitle("");
      setDescription("");
      setExpiryDate("");
      setIsNeverExpired(true);
    } else {
      setErrorMsg(result.error || "An unknown error occurred while issuing credential.");
    }
    setLoading(false);
  };

  const copyVerificationLink = () => {
    const origin = window.location.origin;
    const link = `${origin}/verify/${issuedId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto pb-12">
      {/* Back button */}
      <div>
        <Link href="/issuer/dashboard" className="text-sm text-muted-foreground hover:text-white flex items-center gap-1.5 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      {!success ? (
        <Card className="surface-panel border border-white/5 relative">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Issue Digital Credential</CardTitle>
            <CardDescription>
              Create a cryptographically signed achievement certificate for a student.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Error Alert */}
              {errorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Student Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentName" className="text-muted-foreground">Full Name</Label>
                    <Input
                      id="studentName"
                      placeholder="e.g. Sarah Connor"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="bg-background/50 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentEmail" className="text-muted-foreground">Email Address</Label>
                    <Input
                      id="studentEmail"
                      type="email"
                      placeholder="student@university.edu"
                      required
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="bg-background/50 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Blockchain Settings */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">Blockchain Verification configuration</h3>
                <div className="space-y-2">
                  <Label htmlFor="issuerWallet" className="text-muted-foreground">Authorized Signatory Wallet Address</Label>
                  <Input
                    id="issuerWallet"
                    placeholder="e.g. 0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
                    required
                    value={issuerWallet}
                    onChange={(e) => setIssuerWallet(e.target.value)}
                    className="bg-background/50 text-white font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground/60">This wallet will register the transaction on Base Sepolia Ledger.</p>
                </div>
              </div>

              {/* Credential Details */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">Credential Metadata</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-muted-foreground">Credential Type</Label>
                    <select
                      id="type"
                      value={credentialType}
                      onChange={(e) => setCredentialType(e.target.value as any)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option className="bg-neutral-900 text-white" value="degree">Graduation Degree</option>
                      <option className="bg-neutral-900 text-white" value="diploma">Diploma</option>
                      <option className="bg-neutral-900 text-white" value="experience">Experience Letter</option>
                      <option className="bg-neutral-900 text-white" value="internship">Internship Certificate</option>
                      <option className="bg-neutral-900 text-white" value="achievement">Hackathon Winner</option>
                      <option className="bg-neutral-900 text-white" value="certification">Course Certification</option>
                      <option className="bg-neutral-900 text-white" value="badge">Merit Badge</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-muted-foreground">Certificate Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Master of Science in AI"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-background/50 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-muted-foreground">Description & Context</Label>
                  <textarea
                    id="description"
                    placeholder="Specify the syllabus, grades, responsibilities, or criteria for earning this award..."
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border bg-background/50 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>

              {/* Validity Dates */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">Validity Period</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="issueDate" className="text-muted-foreground">Issue Date</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      required
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="bg-background/50 text-white select-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="expiryDate" className="text-muted-foreground">Expiry Date</Label>
                      <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => setIsNeverExpired(!isNeverExpired)}>
                        <input
                          type="checkbox"
                          id="never-expires"
                          checked={isNeverExpired}
                          onChange={() => {}} // handled by div click
                          className="rounded border-white/10 bg-neutral-900 text-primary accent-primary w-3.5 h-3.5"
                        />
                        <label htmlFor="never-expires" className="text-xs text-muted-foreground cursor-pointer">Never Expires</label>
                      </div>
                    </div>
                    <Input
                      id="expiryDate"
                      type="date"
                      disabled={isNeverExpired}
                      required={!isNeverExpired}
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="bg-background/50 text-white disabled:opacity-50 select-none"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Verify and Anchor"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <Card className="surface-panel border border-white/5 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500" />
          
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-2xl text-white">Credential Anchored Successfully</CardTitle>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                The record has been verified and registered on AscendID. A unique verification link and QR code have been created.
              </p>
            </div>

            {/* Link Sharing Panel */}
            <div className="bg-neutral-900 border border-white/5 p-4 rounded-xl space-y-4 max-w-md mx-auto">
              <div className="w-40 h-40 bg-white p-2 rounded-lg mx-auto flex items-center justify-center shadow-lg">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${window.location.origin}/verify/${issuedId}`)}`} 
                  alt="Verification QR Code" 
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-1 text-xs">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Credential ID</span>
                <code className="text-white bg-white/5 px-2 py-1 rounded block truncate font-mono select-all">{issuedId}</code>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-background/50 text-white" onClick={copyVerificationLink}>
                  {copied ? <Check className="w-4 h-4 mr-2 text-emerald-400" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copied!" : "Copy Verification Link"}
                </Button>
                <Link href={`/verify/${issuedId}`} target="_blank" className="flex-1">
                  <Button className="w-full bg-primary text-white">
                    Inspect Ledger
                  </Button>
                </Link>
              </div>
            </div>

            <div className="pt-4 flex gap-3 justify-center">
              <Button variant="ghost" className="text-muted-foreground hover:text-white" onClick={() => setSuccess(false)}>
                Issue Another
              </Button>
              <Link href="/issuer/dashboard">
                <Button className="bg-neutral-800 hover:bg-neutral-700 text-white">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
