"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileUp, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  FileImage, 
  Calendar, 
  ExternalLink,
  Trash2,
  Clock,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ProofDocumentService, ProofDocument } from "@/services/proof-document";

interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

export default function ProofVaultPage() {
  const { currentUser, loading: authLoading } = useAuth();
  
  // List state
  const [documents, setDocuments] = useState<ProofDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Form state
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("Certificate");
  const [issuer, setIssuer] = useState("");
  const [impact, setImpact] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Upload/UI status states
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "failed">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "success" });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents from Firestore
  const fetchDocuments = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoadingDocs(true);
      const docs = await ProofDocumentService.getProofDocuments(currentUser.uid);
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to load proof documents:", error);
    } finally {
      setLoadingDocs(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!authLoading && currentUser) {
      fetchDocuments();
    }
  }, [currentUser, authLoading, fetchDocuments]);

  // Helper: Show custom toast notification
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // Helper: Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // File Picker change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    validateAndSelectFile(file);
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    validateAndSelectFile(file);
  };

  // Validate file size and type
  const validateAndSelectFile = (file: File) => {
    setErrorMessage("");
    setUploadStatus("idle");

    // Diagnostic log
    console.log("FILE SELECTED", file);

    // Max size: 10 MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMessage("File is too large. Maximum size allowed is 10MB.");
      setUploadStatus("failed");
      showToast("File size exceeds 10MB limit", "error");
      return;
    }

    // Accepted types: PDF, PNG, JPG, JPEG
    const allowedExtensions = ["pdf", "png", "jpg", "jpeg"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const allowedMimeTypes = ["application/pdf", "image/png", "image/jpeg"];

    if (!allowedMimeTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || "")) {
      setErrorMessage("Invalid type. Only PDF, PNG, JPG, and JPEG files are accepted.");
      setUploadStatus("failed");
      showToast("Invalid file format selected", "error");
      return;
    }

    setSelectedFile(file);
  };

  const clearSelectedFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Form submission / Upload handler
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Diagnostic log
    console.log("UPLOAD CLICKED");

    if (!currentUser) {
      showToast("You must be logged in to upload documents", "error");
      return;
    }

    if (!selectedFile) {
      setErrorMessage("Please select a document to upload.");
      setUploadStatus("failed");
      showToast("No document selected", "error");
      return;
    }

    try {
      setUploadStatus("uploading");
      setErrorMessage("");

      const result = await ProofDocumentService.uploadProofDocument(currentUser.uid, {
        file: selectedFile,
        title,
        documentType,
        issuer,
        impact,
      });

      if (result.success) {
        setUploadStatus("success");
        showToast("Document securely stored in Proof Vault", "success");
        
        // Reset form fields
        setTitle("");
        setDocumentType("Certificate");
        setIssuer("");
        setImpact("");
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Fetch updated documents list immediately
        await fetchDocuments();
      } else {
        setUploadStatus("failed");
        setErrorMessage(result.error || "Failed to secure document in vault.");
        showToast("Upload Failed", "error");
      }
    } catch (error) {
      console.error("Upload handler crash:", error);
      setUploadStatus("failed");
      setErrorMessage("A network or configuration error occurred. Please try again.");
      showToast("Network failure occurred", "error");
    }
  };

  // Helper: Format Firestore uploadedAt timestamp
  const formatUploadDate = (uploadedAt: any) => {
    if (!uploadedAt) return "Uploading...";
    const date = uploadedAt.toDate ? uploadedAt.toDate() : new Date(uploadedAt);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (authLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Proof Vault</h1>
        <p className="text-muted-foreground mt-1">Securely host and cryptographically anchor your professional achievements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="surface-panel md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl text-white">New Vault Entry</CardTitle>
            <CardDescription>Submit a certificate, project proof, or experience document.</CardDescription>
          </CardHeader>
          <form onSubmit={handleUpload}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-muted-foreground">Achievement Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. AWS Certified Solutions Architect" 
                  required 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background/50 text-white" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-muted-foreground">Type</Label>
                  <select 
                    id="type" 
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border bg-background/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Certificate">Certificate</option>
                    <option value="Internship">Internship</option>
                    <option value="Project">Project</option>
                    <option value="Hackathon">Hackathon</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issuer" className="text-muted-foreground">Issuer / Organization</Label>
                  <Input 
                    id="issuer" 
                    placeholder="e.g. Amazon Web Services" 
                    required 
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    className="bg-background/50 text-white" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="impact" className="text-muted-foreground">Impact / Description</Label>
                <textarea 
                  id="impact" 
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border bg-background/50 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50" 
                  placeholder="Briefly describe what you accomplished..." 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Document Proof File</Label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf,.png,.jpg,.jpeg" 
                  className="hidden" 
                />
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-muted/50 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-background/30 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  {selectedFile ? (
                    <div className="flex flex-col items-center w-full">
                      {selectedFile.type === "application/pdf" ? (
                        <FileText className="w-10 h-10 text-primary mb-3" />
                      ) : (
                        <FileImage className="w-10 h-10 text-primary mb-3" />
                      )}
                      <p className="text-sm text-white font-medium break-all max-w-md">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatFileSize(selectedFile.size)}</p>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearSelectedFile}
                        className="mt-3 text-destructive hover:bg-destructive/10 h-8 gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" /> Change File
                      </Button>
                    </div>
                  ) : (
                    <>
                      <FileUp className="w-8 h-8 text-muted-foreground mb-3" />
                      <p className="text-sm text-white font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG, or JPEG (max. 10MB)</p>
                    </>
                  )}
                </div>
              </div>

              {/* Error messages block */}
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base font-semibold" 
                disabled={uploadStatus === "uploading" || !selectedFile}
              >
                {uploadStatus === "uploading" ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Uploading...</>
                ) : uploadStatus === "success" ? (
                  <><CheckCircle2 className="mr-2 h-5 w-5" /> Upload Success</>
                ) : uploadStatus === "failed" ? (
                  <><AlertCircle className="mr-2 h-5 w-5" /> Upload Failed</>
                ) : (
                  <><Upload className="mr-2 h-5 w-5" /> Submit to Vault</>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="surface-panel">
            <CardHeader>
              <CardTitle className="text-lg text-white">How Verification Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 border border-primary/30">1</div>
                <p className="leading-relaxed">Upload your official achievement certificate, project artifact, or hackathon victory file.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 border border-primary/30">2</div>
                <p className="leading-relaxed">AscendID verifies the document authenticity via cryptographic anchoring and issuer validation.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 border border-primary/30">3</div>
                <p className="leading-relaxed">Once verified, your trust level increases and it gets embedded in your Talent Passport.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Uploaded Documents Section */}
      <div className="space-y-6 pt-4 border-t border-white/5">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Secured Vault Documents</h2>
          <p className="text-muted-foreground mt-1">Your encrypted proof history and verification state.</p>
        </div>

        {loadingDocs ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16 border rounded-2xl border-white/5 bg-background/20 space-y-3">
            <FileText className="w-12 h-12 text-muted-foreground/45 mx-auto" />
            <h3 className="text-lg font-medium text-white">No documents secured yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">Upload certificates, projects, or credentials to build your cryptographic talent record.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documents.map((doc) => (
              <Card key={doc.id} className="surface-panel overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg text-white font-semibold leading-tight line-clamp-1">
                        {doc.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                        <span className="font-medium text-white/70">{doc.documentType}</span>
                        <span>•</span>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatUploadDate(doc.uploadedAt)}</span>
                      </CardDescription>
                    </div>
                    {doc.verified ? (
                      <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-semibold gap-1.5 shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/15 border-amber-500/30 text-amber-400 font-semibold gap-1.5 shrink-0">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground pb-4 flex-grow">
                  {doc.issuer && (
                    <div>
                      <span className="text-xs font-semibold text-white/50 block uppercase tracking-wider">Issuer</span>
                      <span className="text-white font-medium">{doc.issuer}</span>
                    </div>
                  )}
                  {doc.impact && (
                    <div>
                      <span className="text-xs font-semibold text-white/50 block uppercase tracking-wider">Description</span>
                      <p className="line-clamp-2 mt-0.5 leading-relaxed">{doc.impact}</p>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground truncate bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                    <span className="font-semibold text-white/70">File: </span>
                    <span>{doc.fileName || "proof-file"}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 border-t border-white/5 bg-white/5">
                  <a 
                    href={doc.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full"
                  >
                    <Button variant="ghost" className="w-full text-white/80 hover:text-white hover:bg-white/10 gap-2 h-9 text-sm font-medium">
                      View Document <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Global state notification toast */}
      {toast.show && (
        <div 
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === "success" 
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200" 
              : "bg-rose-950/90 border-rose-500/40 text-rose-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-sm font-medium pr-2">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
