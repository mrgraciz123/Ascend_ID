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
import { 
  Award, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  ArrowLeft, 
  QrCode, 
  Copy, 
  Check,
  UploadCloud,
  FileText,
  ShieldAlert,
  BrainCircuit,
  Maximize2
} from "lucide-react";
import Link from "next/link";

export default function IssueCredentialPage() {
  const { currentUser } = useAuth();
  const [issuerProfile, setIssuerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [issuedId, setIssuedId] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Upload and AI state
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [documentFraudReport, setDocumentFraudReport] = useState<any>(null);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus("Uploading document to secure CDN...");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      setUploadStatus("Running AI OCR Metadata Extraction & Fraud Audit...");
      const response = await fetch("/api/credentials/extract-metadata", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to process certificate document");
      }

      setDocumentUrl(data.documentUrl);
      setDocumentFraudReport(data.fraudAnalysis);

      // Populate Form Fields from AI OCR extraction
      const meta = data.extractedMetadata;
      if (meta.studentName) setStudentName(meta.studentName);
      if (meta.studentEmail) setStudentEmail(meta.studentEmail);
      if (meta.title) setTitle(meta.title);
      if (meta.description) setDescription(meta.description);
      if (meta.credentialType) setCredentialType(meta.credentialType);
      if (meta.issueDate) setIssueDate(meta.issueDate);
      if (meta.expiryDate) {
        if (meta.expiryDate.toLowerCase() === "never") {
          setIsNeverExpired(true);
          setExpiryDate("");
        } else {
          setIsNeverExpired(false);
          setExpiryDate(meta.expiryDate);
        }
      }
      setUploadStatus("");
    } catch (err: any) {
      console.error("AI document upload error:", err);
      setErrorMsg(err.message || "Failed to analyze document file.");
    } finally {
      setUploading(false);
    }
  };

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
      issuerWallet,
      documentUrl,
      documentFraudReport
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
      setDocumentUrl("");
      setDocumentFraudReport(null);
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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-12">
      {/* Back button */}
      <div>
        <Link href="/issuer/dashboard" className="text-sm text-muted-foreground hover:text-white flex items-center gap-1.5 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      {!success ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form (8 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="surface-panel border border-white/5 relative">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Issue Digital Credential</CardTitle>
                <CardDescription>
                  Upload a certificate document or enter the metadata to cryptographically anchor it.
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

                  {/* Document Upload Area */}
                  <div className="space-y-3">
                    <Label className="text-muted-foreground">Original Document Upload (PDF, PNG, JPG)</Label>
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-6 bg-neutral-900/40 hover:bg-neutral-900/60 hover:border-primary/50 transition-all text-center relative flex flex-col items-center justify-center min-h-[140px]">
                      {uploading ? (
                        <div className="space-y-3 flex flex-col items-center justify-center">
                          <Loader2 className="w-8 h-8 text-primary animate-spin" />
                          <span className="text-xs text-muted-foreground font-mono animate-pulse">{uploadStatus}</span>
                        </div>
                      ) : documentUrl ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-semibold text-white">Document Uploaded Successfully</span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">Url: {documentUrl.substring(0, 30)}...</span>
                          <label className="text-[10px] text-primary hover:underline cursor-pointer mt-1">
                            Replace File
                            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} className="hidden" />
                          </label>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center gap-2.5">
                          <UploadCloud className="w-8 h-8 text-white/40" />
                          <div>
                            <span className="text-xs font-bold text-white block">Drop certificate file or browse</span>
                            <span className="text-[10px] text-muted-foreground mt-0.5 block">Supports PDF, PNG, JPG up to 10MB</span>
                          </div>
                          <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="space-y-4 pt-4 border-t border-white/5">
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
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">Blockchain Verification</h3>
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
                      <p className="text-[10px] text-muted-foreground/60">This wallet will anchor the cryptographic transaction on the ledger.</p>
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
                          <div className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              id="isNeverExpired"
                              checked={isNeverExpired}
                              onChange={(e) => setIsNeverExpired(e.target.checked)}
                              className="w-3.5 h-3.5 accent-primary rounded cursor-pointer"
                            />
                            <label htmlFor="isNeverExpired" className="text-[10px] text-muted-foreground cursor-pointer">No Expiry</label>
                          </div>
                        </div>
                        <Input
                          id="expiryDate"
                          type="date"
                          disabled={isNeverExpired}
                          required={!isNeverExpired}
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="bg-background/50 text-white disabled:opacity-40"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <Link href="/issuer/dashboard">
                    <Button type="button" variant="outline" className="border-white/10 text-white hover:bg-white/5 h-11 px-6 text-xs">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={loading || uploading}
                    className="bg-primary hover:bg-primary/95 text-white h-11 px-8 text-xs font-bold shadow-lg shadow-primary/20"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Anchoring on Base...
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4 mr-2" /> Issue Credential
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* AI Audit Sidebar Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {documentFraudReport ? (
              <Card className="surface-panel border-white/5 overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-md text-white flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-indigo-400" />
                    AI Document Analysis
                  </CardTitle>
                  <CardDescription className="text-xs">
                    OCR extraction confidence and structural fraud diagnostics.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Overall Risk Level */}
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    documentFraudReport.overallRisk === "High" 
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-400" 
                      : documentFraudReport.overallRisk === "Medium"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  }`}>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 block">Document Risk Level</span>
                      <span className="text-md font-bold uppercase">{documentFraudReport.overallRisk} Risk</span>
                    </div>
                    <div className="w-8 h-8 rounded-full border flex items-center justify-center shrink-0">
                      {documentFraudReport.overallRisk === "High" ? (
                        <ShieldAlert className="w-5 h-5 animate-pulse" />
                      ) : (
                        <ShieldCheck className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  {/* AI Indicators List */}
                  <div className="space-y-3 border-t border-white/5 pt-4">
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>OCR Confidence:</span>
                        <span className="font-mono font-bold text-white">{documentFraudReport.ocrConfidence}%</span>
                      </div>
                      <div className="w-full bg-neutral-900 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: `${documentFraudReport.ocrConfidence}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Altered Text probability:</span>
                        <span className="font-mono font-bold text-white">{documentFraudReport.alteredText}%</span>
                      </div>
                      <div className="w-full bg-neutral-900 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${documentFraudReport.alteredText}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Logo Consistency:</span>
                        <span className="font-mono font-bold text-white">{documentFraudReport.logoConsistency}%</span>
                      </div>
                      <div className="w-full bg-neutral-900 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${documentFraudReport.logoConsistency}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Layout Anomalies:</span>
                        <span className="font-mono font-bold text-white">{documentFraudReport.layoutAnomalies}%</span>
                      </div>
                      <div className="w-full bg-neutral-900 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${documentFraudReport.layoutAnomalies}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* AI Explanation and Anomalies */}
                  <div className="space-y-3 border-t border-white/5 pt-4 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">AI Audit Explanation</span>
                      <p className="text-muted-foreground mt-1 leading-relaxed bg-neutral-950/40 border border-white/5 p-3 rounded-lg font-sans">
                        {documentFraudReport.explanation}
                      </p>
                    </div>

                    {documentFraudReport.highlightedAnomalies?.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Flagged Anomalies</span>
                        <ul className="list-disc pl-4 text-rose-400 mt-1 space-y-1">
                          {documentFraudReport.highlightedAnomalies.map((anom: string, idx: number) => (
                            <li key={idx}>{anom}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="surface-panel border-white/5 border-dashed relative min-h-[300px] flex flex-col justify-center items-center p-6 text-center text-muted-foreground text-xs">
                <BrainCircuit className="w-8 h-8 text-white/20 mb-3" />
                <span>Upload a document to invoke AI OCR metadata extraction and visual fraud diagnostics analysis here automatically.</span>
              </Card>
            )}

            {/* Document Preview Card if available */}
            {documentUrl && (
              <Card className="surface-panel border-white/5 overflow-hidden">
                <CardHeader className="pb-3 flex flex-row justify-between items-center">
                  <div>
                    <CardTitle className="text-sm text-white">Document Source Preview</CardTitle>
                    <CardDescription className="text-[10px]">Cloudinary CDN Secure Asset</CardDescription>
                  </div>
                  <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="w-8 h-8 border-white/10 hover:bg-white/5">
                      <Maximize2 className="w-3.5 h-3.5 text-white" />
                    </Button>
                  </a>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {documentUrl.toLowerCase().endsWith(".pdf") ? (
                    <div className="w-full aspect-[1/1.3] bg-neutral-950 border border-white/10 rounded-xl flex items-center justify-center text-[10px] text-muted-foreground flex-col gap-2">
                      <FileText className="w-8 h-8 text-primary" />
                      <span>PDF Document Embedded</span>
                      <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Open PDF in New Tab
                      </a>
                    </div>
                  ) : (
                    <img 
                      src={documentUrl} 
                      alt="Certificate Preview" 
                      className="w-full rounded-xl border border-white/10 object-contain max-h-[400px] bg-neutral-950 shadow-inner"
                    />
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        /* Success Screen */
        <Card className="surface-panel border border-emerald-500/20 max-w-xl mx-auto text-center p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
            <CheckCircle className="w-10 h-10 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Credential Anchored Successfully</h1>
            <p className="text-muted-foreground text-sm">
              The digital credential has been registered on the Base Sepolia ledger.
            </p>
          </div>

          <div className="bg-neutral-950/60 border border-white/5 p-4 rounded-xl text-left space-y-3 font-mono text-xs text-muted-foreground">
            <div className="flex justify-between gap-4">
              <span className="shrink-0 text-white/40">Credential UUID:</span>
              <span className="text-white truncate select-all">{issuedId}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="shrink-0 text-white/40">Verification Link:</span>
              <span className="text-primary hover:underline truncate select-all">{`${window.location.origin}/verify/${issuedId}`}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5 text-white" onClick={copyVerificationLink}>
              {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? "Verification Link Copied!" : "Copy Verifier URL"}
            </Button>
            <Button size="sm" onClick={() => setSuccess(false)} className="bg-primary hover:bg-primary/95 text-white">
              Issue Another Certificate
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
