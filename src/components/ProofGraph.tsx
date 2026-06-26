"use client";

import React, { useState, useMemo, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  Node,
  Edge,
  NodeProps,
  MarkerType
} from "reactflow";
import "reactflow/dist/style.css";
import { 
  GraduationCap, 
  Briefcase, 
  Award, 
  BookOpen, 
  GitBranch, 
  Code, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Database,
  Building,
  User,
  ShieldCheck,
  Calendar,
  X,
  FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// ---------------------------------------------------------
// Custom Stylized Graph Node
// ---------------------------------------------------------
const CustomGraphNode = ({ data }: NodeProps) => {
  const { type, title, issuer, status, isDigiLocker } = data;

  // Icon selector based on category
  const getIcon = () => {
    switch (type) {
      case "Degree":
      case "Academic":
        return <GraduationCap className="w-5 h-5 text-indigo-400" />;
      case "Internship":
      case "Experience":
        return <Briefcase className="w-5 h-5 text-emerald-400" />;
      case "Hackathon":
        return <Award className="w-5 h-5 text-amber-400" />;
      case "Research":
        return <BookOpen className="w-5 h-5 text-sky-400" />;
      case "Open Source":
        return <GitBranch className="w-5 h-5 text-purple-400" />;
      case "Certification":
        return <Award className="w-5 h-5 text-pink-400" />;
      case "Recommendation":
        return <FileText className="w-5 h-5 text-teal-400" />;
      default:
        return <Code className="w-5 h-5 text-primary" />;
    }
  };

  const getStatusColor = () => {
    if (status === "revoked") return "border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]";
    if (status === "verified" || status === "issued" || isDigiLocker) {
      return "border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]";
    }
    return "border-amber-500/40 shadow-[0_0_15px_rgba(234,179,8,0.15)]";
  };

  return (
    <div className={`p-4 rounded-xl bg-neutral-950/80 border backdrop-blur-md w-60 text-left transition-all hover:scale-102 ${getStatusColor()}`}>
      {/* Source & Target handles for tree routing */}
      <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-primary/50 border-white/20" />
      
      <div className="flex items-start justify-between gap-3">
        <div className="p-2 bg-neutral-900 border border-white/5 rounded-lg shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">
            {type}
          </span>
          <h4 className="text-xs font-bold text-white truncate leading-normal mt-0.5" title={title}>
            {title}
          </h4>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
            {issuer}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-2.5 mt-2.5">
        <span className="text-[8px] text-white/40 font-mono">
          {isDigiLocker ? "DIGILOCKER" : status === "revoked" ? "REVOKED" : status === "verified" || status === "issued" ? "VERIFIED" : "PENDING"}
        </span>
        {status === "revoked" ? (
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        ) : status === "verified" || status === "issued" || isDigiLocker ? (
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-primary/50 border-white/20" />
    </div>
  );
};

// ---------------------------------------------------------
// Main Proof Graph Component
// ---------------------------------------------------------
interface ProofGraphProps {
  records: any[];
  achievements: any[];
  instCredentials: any[];
}

export default function ProofGraph({ records, achievements, instCredentials }: ProofGraphProps) {
  const [selectedNodeData, setSelectedNodeData] = useState<any | null>(null);

  const nodeTypes = useMemo(() => ({ custom: CustomGraphNode }), []);

  // Map input credentials into Graph Nodes & Edges
  const { nodes, edges } = useMemo(() => {
    const rawNodes: Node[] = [];
    const rawEdges: Edge[] = [];

    // 1. Prepare raw items
    const items: any[] = [];

    // DigiLocker records
    records.forEach((r) => {
      items.push({
        id: r.id || `rec_${r.type}`,
        type: "Academic",
        title: r.type || "Marksheet",
        issuer: r.verifiedBy || "DigiLocker",
        status: "verified",
        date: r.year || "2022",
        description: `Board percentage: ${r.percentage || 'N/A'}. Verified via DigiLocker.`,
        isDigiLocker: true,
        blockchain: null,
        docs: []
      });
    });

    // Self-claimed achievements
    achievements.forEach((a) => {
      items.push({
        id: a.id,
        type: a.category || a.type || "Project",
        title: a.title,
        issuer: a.issuer,
        status: a.verified ? "verified" : "pending",
        date: a.date || "N/A",
        description: a.impact || "",
        isDigiLocker: false,
        blockchain: null,
        docs: a.proofUrl ? [a.proofUrl] : []
      });
    });

    // Institutional credentials (W3C block-verified)
    instCredentials.forEach((c) => {
      items.push({
        id: c.id,
        type: c.credentialType === "degree" ? "Degree" : (c.credentialType === "internship" ? "Internship" : c.credentialType),
        title: c.title,
        issuer: c.issuerName,
        status: c.verificationStatus || "issued",
        date: c.issueDate,
        expiryDate: c.expiryDate,
        description: c.description,
        isDigiLocker: false,
        blockchain: c.blockchain,
        docs: c.w3cData ? [c.qrCodeUrl] : []
      });
    });

    // 2. Classify items into hierarchical layers
    const layer1 = items.filter(i => i.type === "Academic" || i.type === "Degree");
    const layer2 = items.filter(i => i.type === "Certification" || i.type === "Recommendation");
    const layer3 = items.filter(i => i.type === "Hackathon" || i.type === "Research" || i.type === "Open Source");
    const layer4 = items.filter(i => i.type === "Internship" || i.type === "Experience" || i.type === "Project" || i.type === "Projects");

    // 3. Layout positioning math
    const colWidth = 280;
    const rowHeight = 220;

    const buildNodesInLayer = (layerItems: any[], layerIdx: number) => {
      const layerOffset = (layerItems.length - 1) * colWidth / 2;
      layerItems.forEach((item, itemIdx) => {
        rawNodes.push({
          id: item.id,
          type: "custom",
          data: item,
          position: {
            x: 400 + (itemIdx * colWidth) - layerOffset,
            y: 50 + (layerIdx * rowHeight)
          }
        });
      });
    };

    buildNodesInLayer(layer1, 0);
    buildNodesInLayer(layer2, 1);
    buildNodesInLayer(layer3, 2);
    buildNodesInLayer(layer4, 3);

    // 4. Construct edges (Logical relationships between levels)
    // Connect Layer 1 to Layer 2
    layer1.forEach((n1) => {
      layer2.forEach((n2) => {
        rawEdges.push({
          id: `e-${n1.id}-${n2.id}`,
          source: n1.id,
          target: n2.id,
          animated: n1.status === "verified" || n1.isDigiLocker,
          style: { stroke: "#6366f1", strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" }
        });
      });
    });

    // Connect Layer 2 to Layer 3
    layer2.forEach((n2) => {
      layer3.forEach((n3) => {
        rawEdges.push({
          id: `e-${n2.id}-${n3.id}`,
          source: n2.id,
          target: n3.id,
          animated: n2.status === "verified",
          style: { stroke: "#ec4899", strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#ec4899" }
        });
      });
    });

    // Connect Layer 3 to Layer 4
    layer3.forEach((n3) => {
      layer4.forEach((n4) => {
        rawEdges.push({
          id: `e-${n3.id}-${n4.id}`,
          source: n3.id,
          target: n4.id,
          animated: n3.status === "verified",
          style: { stroke: "#3b82f6", strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" }
        });
      });
    });

    // Fallback logic: if no middle layers, link Layer 1 directly to Layer 4
    if (layer2.length === 0 && layer3.length === 0) {
      layer1.forEach((n1) => {
        layer4.forEach((n4) => {
          rawEdges.push({
            id: `e-${n1.id}-${n4.id}`,
            source: n1.id,
            target: n4.id,
            animated: true,
            style: { stroke: "#10b981", strokeWidth: 1.5 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" }
          });
        });
      });
    }

    return { nodes: rawNodes, edges: rawEdges };
  }, [records, achievements, instCredentials]);

  // Click handler for nodes
  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNodeData(node.data);
  }, []);

  return (
    <div className="w-full h-[650px] bg-neutral-950 border border-white/5 rounded-2xl overflow-hidden relative flex">
      {/* Canvas Area */}
      <div className="flex-1 h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          minZoom={0.2}
          maxZoom={1.5}
        >
          <Background color="rgba(255,255,255,0.05)" gap={16} size={1} />
          <Controls className="bg-neutral-900 border border-white/10 text-white rounded-lg p-1" />
          <MiniMap 
            nodeColor={() => "rgba(99,102,241,0.2)"} 
            maskColor="rgba(0,0,0,0.6)" 
            className="bg-neutral-900 border border-white/10 rounded-lg hidden sm:block" 
          />
        </ReactFlow>
      </div>

      {/* Floating Glassmorphic Details Sidebar */}
      {selectedNodeData && (
        <div className="absolute top-4 right-4 bottom-4 w-80 bg-neutral-950/80 border border-white/10 rounded-xl backdrop-blur-lg p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 z-20">
          <div className="space-y-6 overflow-y-auto pr-1">
            {/* Header Title */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <Badge className="bg-primary/20 text-primary border-primary/30 uppercase text-[9px] tracking-wider mb-1.5">
                  {selectedNodeData.type} Node
                </Badge>
                <h3 className="text-lg font-bold text-white leading-snug">{selectedNodeData.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedNodeData(null)}
                className="text-muted-foreground hover:text-white p-1 hover:bg-white/5 rounded-lg shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <span className="text-white/40 text-[9px] uppercase font-bold tracking-wider">Details</span>
              <p className="text-xs text-muted-foreground leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                {selectedNodeData.description || "No description provided."}
              </p>
            </div>

            {/* Verification Stats */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/45 flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> Issuer</span>
                <span className="text-white font-medium">{selectedNodeData.issuer}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-white/45 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date</span>
                <span className="text-white font-medium">{selectedNodeData.date}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-white/45 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Status</span>
                {selectedNodeData.status === "revoked" ? (
                  <Badge className="bg-rose-500/15 border-rose-500/30 text-rose-400 text-[10px]">Revoked</Badge>
                ) : selectedNodeData.status === "verified" || selectedNodeData.status === "issued" || selectedNodeData.isDigiLocker ? (
                  <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 text-[10px]">Verified</Badge>
                ) : (
                  <Badge className="bg-amber-500/15 border-amber-500/30 text-amber-400 text-[10px]">In Review</Badge>
                )}
              </div>
            </div>

            {/* Blockchain Record info */}
            {selectedNodeData.blockchain ? (
              <div className="border-t border-white/5 pt-4 space-y-2">
                <span className="text-white/40 text-[9px] uppercase font-bold tracking-wider block flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-400" /> Ledger Record
                </span>
                <div className="text-[10px] space-y-1 bg-neutral-900 border border-white/5 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-white/40">Anchor Ledger</span>
                    <span className="text-white truncate">Base Sepolia</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-white/40">Tx Hash</span>
                    <span className="text-white truncate max-w-[120px] font-mono select-all" title={selectedNodeData.blockchain.transactionHash}>
                      {selectedNodeData.blockchain.transactionHash}
                    </span>
                  </div>
                </div>
              </div>
            ) : selectedNodeData.isDigiLocker ? (
              <div className="border-t border-white/5 pt-4 space-y-2">
                <span className="text-white/40 text-[9px] uppercase font-bold tracking-wider block flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> DigiLocker Verified
                </span>
                <p className="text-[10px] text-muted-foreground leading-normal">
                  Anchored directly to the CBSE academic ledger. Verification credentials are cryptographically stamped.
                </p>
              </div>
            ) : null}

            {/* Supporting Documents links */}
            {selectedNodeData.docs && selectedNodeData.docs.length > 0 && (
              <div className="border-t border-white/5 pt-4 space-y-2">
                <span className="text-white/40 text-[9px] uppercase font-bold tracking-wider block">Supporting Proof</span>
                <div className="space-y-1.5">
                  {selectedNodeData.docs.map((docUrl: string, idx: number) => (
                    <a 
                      key={idx} 
                      href={docUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-primary hover:underline flex items-center gap-1.5 w-fit"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Proof Document #{idx + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action button */}
          {selectedNodeData.blockchain && (
            <div className="pt-4 border-t border-white/5">
              <Link href={`/verify/${selectedNodeData.id}`} target="_blank" className="w-full">
                <button className="w-full py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5">
                  Inspect Cryptographic Ledger <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
