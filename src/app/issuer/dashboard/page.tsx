"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { CredentialService, Credential } from "@/services/credential";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, ShieldCheck, AlertCircle, FileText, ArrowUpRight, Plus, Eye, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function IssuerDashboard() {
  const { currentUser } = useAuth();
  const [issuerProfile, setIssuerProfile] = useState<any>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    if (!currentUser) return;
    try {
      const profileDoc = await getDoc(doc(db, "issuers", currentUser.uid));
      if (profileDoc.exists()) {
        setIssuerProfile(profileDoc.data());
      }
      
      const list = await CredentialService.getIssuerCredentials(currentUser.uid);
      setCredentials(list);
    } catch (error) {
      console.error("Dashboard failed to load:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const totalIssued = credentials.length;
  const activeCount = credentials.filter(c => c.verificationStatus !== "revoked" && (c.expiryDate === "Never" || new Date(c.expiryDate) >= new Date())).length;
  const revokedCount = credentials.filter(c => c.verificationStatus === "revoked").length;
  const expiredCount = credentials.filter(c => c.verificationStatus !== "revoked" && c.expiryDate !== "Never" && new Date(c.expiryDate) < new Date()).length;

  const formatIssuerType = (type: string) => {
    switch (type) {
      case "university": return "University";
      case "company": return "Company / Employer";
      case "hackathon": return "Hackathon Organizer";
      case "certifier": return "Certification Provider";
      default: return type;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Console Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage and anchor official student credentials.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-background/50 text-white" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/issuer/issue">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Issue New
            </Button>
          </Link>
        </div>
      </div>

      {/* Institution Card */}
      <Card className="surface-panel overflow-hidden border border-white/5 relative shadow-xl">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] blur-[100px] rounded-full pointer-events-none bg-primary/5 -translate-y-1/2 translate-x-1/3" />
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold text-white leading-tight">{issuerProfile?.name || currentUser?.displayName || "Institution Name"}</h2>
                <Badge className="bg-primary/15 border-primary/30 text-primary gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Issuer
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span>{issuerProfile?.email || currentUser?.email}</span>
                <span>•</span>
                <span className="capitalize">{formatIssuerType(issuerProfile?.issuerType || "Institution")}</span>
              </p>
            </div>
            <div className="text-sm bg-neutral-900 border border-white/5 px-4 py-2.5 rounded-xl">
              <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Issuer ID</span>
              <span className="font-mono text-white font-medium select-all">{currentUser?.uid}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="surface-panel border border-white/5">
          <CardContent className="p-6">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">Total Issued</span>
            <span className="text-4xl font-bold text-white block mt-1">{totalIssued}</span>
          </CardContent>
        </Card>

        <Card className="surface-panel border border-white/5">
          <CardContent className="p-6">
            <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider block">Active Valid</span>
            <span className="text-4xl font-bold text-white block mt-1">{activeCount}</span>
          </CardContent>
        </Card>

        <Card className="surface-panel border border-white/5">
          <CardContent className="p-6">
            <span className="text-rose-400 text-xs font-semibold uppercase tracking-wider block">Revoked</span>
            <span className="text-4xl font-bold text-white block mt-1">{revokedCount}</span>
          </CardContent>
        </Card>

        <Card className="surface-panel border border-white/5">
          <CardContent className="p-6">
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider block">Expired</span>
            <span className="text-4xl font-bold text-white block mt-1">{expiredCount}</span>
          </CardContent>
        </Card>
      </div>

      {/* Main split section: logs and analytics summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent logs */}
        <Card className="surface-panel border border-white/5 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg text-white">Recent Credentials</CardTitle>
              <CardDescription>Recently issued digital records.</CardDescription>
            </div>
            <Link href="/issuer/credentials">
              <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                View All <ArrowUpRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {credentials.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-t border-white/5">
                <Award className="w-8 h-8 mx-auto mb-2 text-white/20" />
                <p className="text-sm">No credentials issued yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-t border-b border-white/5 bg-white/5 text-muted-foreground font-semibold">
                      <th className="p-4">Student</th>
                      <th className="p-4">Title / Type</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Issued</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {credentials.slice(0, 5).map((cred) => {
                      const isCredRevoked = cred.verificationStatus === "revoked";
                      const isCredExpired = cred.expiryDate !== "Never" && new Date(cred.expiryDate) < new Date();
                      
                      return (
                        <tr key={cred.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <p className="font-semibold text-white">{cred.studentName}</p>
                            <p className="text-xs text-muted-foreground">{cred.studentEmail}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-medium text-white">{cred.title}</p>
                            <Badge variant="outline" className="text-[10px] capitalize mt-0.5 border-white/10 text-white/50">{cred.credentialType}</Badge>
                          </td>
                          <td className="p-4">
                            {isCredRevoked ? (
                              <Badge className="bg-rose-500/10 border-rose-500/20 text-rose-400">Revoked</Badge>
                            ) : isCredExpired ? (
                              <Badge className="bg-amber-500/10 border-amber-500/20 text-amber-400">Expired</Badge>
                            ) : (
                              <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400">Valid</Badge>
                            )}
                          </td>
                          <td className="p-4 text-muted-foreground text-xs">{cred.issueDate}</td>
                          <td className="p-4 text-right">
                            <Link href={`/verify/${cred.id}`} target="_blank">
                              <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/20 hover:text-primary">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Tips and guide */}
        <div className="space-y-6">
          <Card className="surface-panel border border-white/5">
            <CardHeader>
              <CardTitle className="text-base text-white">Verification Engine</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <p className="leading-relaxed">
                When you issue credentials in AscendID, they are instantly verified using dual cryptographic validation:
              </p>
              <div className="space-y-3">
                <div className="flex gap-2.5">
                  <div className="w-5 h-5 rounded bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs text-primary">1</div>
                  <p className="text-xs">
                    <strong className="text-white">Digital Signatures</strong>: Signed using your unique institutional key for absolute authenticity proof.
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <div className="w-5 h-5 rounded bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs text-primary">2</div>
                  <p className="text-xs">
                    <strong className="text-white">Ledger Anchoring</strong>: Anchor hash placeholder representing blockchain block immutability.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
