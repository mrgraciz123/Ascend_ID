"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Sparkles, 
  Building2, 
  ExternalLink, 
  Bookmark, 
  Search, 
  Loader2, 
  MapPin, 
  GraduationCap, 
  X, 
  Plus, 
  Check, 
  Award, 
  ShieldCheck, 
  Heart, 
  Trash2, 
  Layers, 
  SlidersHorizontal,
  Briefcase
} from "lucide-react";
import { OpportunityService } from "@/services/opportunity";
import { StudentService } from "@/services/student";
import { useAuth } from "@/context/AuthContext";

export default function OpportunitiesPage() {
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);

  // Profiler edit states
  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjTags, setNewProjTags] = useState("");
  const [showAddProject, setShowAddProject] = useState(false);

  // Filter & details states
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedOpp, setSelectedOpp] = useState<any | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { currentUser } = useAuth();

  useEffect(() => {
    async function load() {
      if (!currentUser) return;
      try {
        const [profile, opps] = await Promise.all([
          StudentService.getProfile(currentUser.uid),
          OpportunityService.getRecommendations(currentUser.uid)
        ]);
        
        setStudent(profile);
        setLocation(profile.location || "Remote");
        setInterests(profile.interests || ["Full-Stack Development"]);
        setProjects(profile.projects || []);
        setOpportunities(opps);
      } catch (e) {
        console.error("Error loading opportunities page details:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser]);

  const handleUpdateProfiler = async () => {
    if (!currentUser) return;
    setIsGenerating(true);
    try {
      const saveRes = await StudentService.updateProfilerData(currentUser.uid, {
        location,
        interests,
        projects
      });

      if (saveRes.success) {
        const newMatches = await OpportunityService.generateAIMatches(currentUser.uid);
        setOpportunities(newMatches);
        
        // Refresh local student state
        const freshProfile = await StudentService.getProfile(currentUser.uid);
        setStudent(freshProfile);
      }
    } catch (e) {
      console.error("Failed to update student profiler:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newInterest.trim();
    if (val && !interests.includes(val)) {
      setInterests([...interests, val]);
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests(interests.filter(i => i !== interestToRemove));
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newProjTitle.trim();
    if (!title) return;

    const tags = newProjTags
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const projectObj = {
      title,
      description: newProjDesc.trim(),
      tags,
      verified: false
    };

    setProjects([...projects, projectObj]);
    setNewProjTitle("");
    setNewProjDesc("");
    setNewProjTags("");
    setShowAddProject(false);
  };

  const handleRemoveProject = (indexToRemove: number) => {
    setProjects(projects.filter((_, idx) => idx !== indexToRemove));
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Filter recommendations based on selected category tab
  const filteredOpps = opportunities.filter(opp => {
    if (selectedCategory === "All") return true;
    return opp.type.toLowerCase() === selectedCategory.toLowerCase();
  });

  const categories = [
    { name: "All Opportunities", filter: "All" },
    { name: "Jobs", filter: "Job" },
    { name: "Internships", filter: "Internship" },
    { name: "Scholarships", filter: "Scholarship" },
    { name: "Hackathons", filter: "Hackathon" },
    { name: "Competitions", filter: "Competition" },
    { name: "Research Programs", filter: "Research Program" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto relative">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-indigo-400" />
            AI Opportunity Engine
          </h1>
          <p className="text-muted-foreground mt-1">Smart matches evaluated using verified skills, digital credentials, and trust scores.</p>
        </div>
        <Button 
          onClick={handleUpdateProfiler} 
          disabled={isGenerating}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 font-bold text-xs py-5 px-6 rounded-xl shrink-0"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Recalculating Matches...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Recalculate AI Matches
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT SIDEBAR: AI Profiler parameters */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="surface-panel border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-[20px] pointer-events-none" />
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4.5 h-4.5 text-indigo-400" />
                AI Match Profiler
              </CardTitle>
              <CardDescription className="text-xs">Adjust your match parameters to query tailored opportunities.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Trust Score Telemetry */}
              <div className="bg-neutral-900/50 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Active Trust Score</span>
                  <div className="text-2xl font-black text-white mt-0.5">{student?.trustScore || 350}</div>
                </div>
                <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-semibold text-[10px] px-2 py-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> High Trust
                </Badge>
              </div>

              {/* Location Preferene */}
              <div className="space-y-2">
                <Label htmlFor="location-input" className="text-xs font-semibold text-white/80 uppercase tracking-wider">Location</Label>
                <Input 
                  id="location-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote, Bangalore, India"
                  className="bg-background/50 text-white text-xs h-10 border-white/10"
                />
              </div>

              {/* Declared Interests */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-white/80 uppercase tracking-wider block">Interests</Label>
                
                {/* Interest tag list */}
                <div className="flex flex-wrap gap-1.5 min-h-6">
                  {interests.map((interest) => (
                    <Badge key={interest} className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400 text-[10px] py-0.5 px-2 flex items-center gap-1 font-mono hover:none">
                      {interest}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveInterest(interest)}
                        className="text-indigo-400 hover:text-indigo-200 transition-colors shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {interests.length === 0 && (
                    <span className="text-[11px] text-muted-foreground italic">No interests added.</span>
                  )}
                </div>

                {/* Add interest form */}
                <form onSubmit={handleAddInterest} className="flex gap-2">
                  <Input 
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Add interest (e.g. Web3)"
                    className="bg-background/50 text-white text-xs h-9 border-white/10 flex-1"
                  />
                  <Button type="submit" size="sm" className="bg-white/5 border border-white/10 text-white hover:bg-white/10 h-9 shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </div>

              {/* Custom Projects list */}
              <div className="space-y-3 border-t border-white/5 pt-4">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold text-white/80 uppercase tracking-wider">Custom Projects</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowAddProject(!showAddProject)}
                    className="text-xs h-8 text-indigo-400 hover:bg-white/5 px-2"
                  >
                    {showAddProject ? "Cancel" : "Add Project"}
                  </Button>
                </div>

                {showAddProject && (
                  <form onSubmit={handleAddProject} className="bg-neutral-950/60 border border-white/5 p-3.5 rounded-xl space-y-3 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground uppercase">Project Title</Label>
                      <Input 
                        value={newProjTitle}
                        onChange={(e) => setNewProjTitle(e.target.value)}
                        placeholder="e.g. DeFi Vault"
                        required
                        className="bg-background/50 text-white text-xs h-8 border-white/5"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground uppercase">Description</Label>
                      <textarea
                        value={newProjDesc}
                        onChange={(e) => setNewProjDesc(e.target.value)}
                        placeholder="Short summary..."
                        rows={2}
                        className="w-full rounded-md border border-white/5 bg-background/50 p-2 text-xs text-white placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground uppercase">Tech Tags (comma separated)</Label>
                      <Input 
                        value={newProjTags}
                        onChange={(e) => setNewProjTags(e.target.value)}
                        placeholder="e.g. Solidity, React"
                        className="bg-background/50 text-white text-xs h-8 border-white/5"
                      />
                    </div>
                    <Button type="submit" size="sm" className="w-full bg-primary hover:bg-primary/90 text-white text-xs h-8 font-bold">
                      Add to Profiler
                    </Button>
                  </form>
                )}

                {/* Projects lists */}
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {projects.map((proj, idx) => (
                    <div key={idx} className="bg-neutral-900/40 border border-white/5 p-3 rounded-lg flex justify-between items-start gap-2 hover:bg-neutral-900/60 transition-colors">
                      <div className="space-y-1 min-w-0">
                        <h5 className="text-xs font-bold text-white truncate">{proj.title}</h5>
                        {proj.description && (
                          <p className="text-[10px] text-muted-foreground line-clamp-1">{proj.description}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {(proj.tags || []).map((t: string) => (
                            <Badge key={t} className="bg-white/5 text-white/70 border-white/5 text-[9px] py-0 px-1 font-mono hover:none">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveProject(idx)}
                        className="text-muted-foreground hover:text-red-400 h-7 w-7 hover:bg-red-500/10 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <p className="text-[11px] text-muted-foreground italic text-center py-2">No custom projects added. Add projects to improve alignment.</p>
                  )}
                </div>

              </div>

              {/* Verified badges indicator */}
              <div className="border-t border-white/5 pt-4 space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block">Verification Telemetry</span>
                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>DigiLocker Academics:</span>
                    <span className="font-mono text-emerald-400 font-bold">{student?.verifiedAcademicsCount || 0} Records</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sepolia Certificates:</span>
                    <span className="font-mono text-emerald-400 font-bold">{student?.verifiedAchievementsCount || 0} Issued</span>
                  </div>
                </div>
              </div>

              {/* Update CTA */}
              <Button 
                onClick={handleUpdateProfiler}
                disabled={isGenerating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 mt-2"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Save & Update Profiler
              </Button>

            </CardContent>
          </Card>
        </div>

        {/* RIGHT SECTION: Recommendations Feed */}
        <div className="lg:col-span-8 space-y-6 relative min-h-[400px]">
          
          {/* Categories Tab Selector */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin select-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.filter;
              return (
                <Button
                  key={cat.filter}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => setSelectedCategory(cat.filter)}
                  className={`text-xs h-9 px-4 shrink-0 rounded-xl transition-all ${
                    isActive 
                      ? "bg-indigo-600 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-600/15" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {cat.name}
                </Button>
              );
            })}
          </div>

          {isGenerating && (
            <div className="absolute inset-0 z-20 bg-background/55 backdrop-blur-sm flex items-center justify-center rounded-2xl border border-white/5">
              <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30 relative">
                  <div className="absolute inset-0 rounded-full border border-indigo-500 animate-ping opacity-25" />
                  <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                </div>
                <p className="text-indigo-300 font-medium text-sm animate-pulse">Evaluating profile matching scores...</p>
              </div>
            </div>
          )}

          {/* Opportunity Cards List */}
          <div className="space-y-4">
            {filteredOpps.map((opp) => (
              <Card 
                key={opp.id} 
                className="surface-panel border-white/5 hover:border-white/10 transition-all duration-300 group shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    
                    {/* Left Block: Logo & Match Score */}
                    <div className="shrink-0 flex flex-col items-center gap-3">
                      <Avatar className="w-14 h-14 border border-white/10 shadow-lg group-hover:scale-105 transition-transform bg-white/5 p-1 relative flex items-center justify-center rounded-xl">
                        <AvatarImage src={opp.logo} alt={opp.company} className="object-contain" />
                        <AvatarFallback className="bg-secondary text-white text-lg rounded-xl">
                          {opp.company.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Badge className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400 font-bold px-2 py-0.5 text-xs shadow-sm">
                        {opp.matchScore}% Match
                      </Badge>
                    </div>

                    {/* Middle Block: Info details */}
                    <div className="flex-1 space-y-3.5">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors leading-tight">{opp.title}</h3>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white shrink-0 -mt-1 -mr-2">
                            <Bookmark className="w-4.5 h-4.5" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 font-semibold text-white/80"><Building2 className="w-3.5 h-3.5" /> {opp.company}</span>
                          <span>•</span>
                          <Badge variant="outline" className="border-white/10 text-white/70 text-[9px] py-0 px-2 uppercase font-mono tracking-wider">{opp.type}</Badge>
                          <span>•</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {opp.location}</span>
                        </div>
                      </div>

                      {/* AI Explain Narrative Box */}
                      <div className="border border-indigo-500/10 bg-indigo-500/5 rounded-xl p-3.5 text-xs text-muted-foreground flex gap-3 shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-400/5 rounded-full blur-[10px] pointer-events-none" />
                        <Sparkles className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                          <strong className="text-white">Why you match:</strong> {opp.matchReason}
                        </p>
                      </div>

                      {/* Displaying salary or stipend */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1.5">
                          {opp.tags.map((tag: string) => (
                            <Badge key={tag} className="bg-white/5 hover:bg-white/10 text-white/80 border-white/5 text-[9px] font-mono px-2 py-0.5">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <span className="text-xs font-mono font-bold text-white/90 bg-neutral-900/50 border border-white/5 px-2.5 py-1 rounded-md shrink-0">
                          {opp.salary || "Competitive"}
                        </span>
                      </div>
                    </div>

                    {/* Right Block: CTA actions */}
                    <div className="shrink-0 flex md:flex-col justify-end gap-3 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                      <Button 
                        onClick={() => {
                          setSelectedOpp(opp);
                          setDrawerOpen(true);
                        }}
                        className="bg-primary hover:bg-primary/95 text-white font-bold text-xs h-9 w-full md:w-32 shadow-md"
                      >
                        Analyze Alignment
                      </Button>
                      <a href={opp.applyLink || "#"} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
                        <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white font-bold text-xs h-9 w-full md:w-32 flex items-center justify-center gap-1.5">
                          Apply Now <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                    </div>

                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredOpps.length === 0 && (
              <div className="text-center py-16 text-muted-foreground border border-dashed border-white/10 rounded-2xl bg-neutral-950/20">
                <Briefcase className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30 animate-pulse" />
                <h4 className="font-bold text-white">No matches found in this category</h4>
                <p className="text-xs max-w-xs mx-auto mt-1">Try relaxing your AI Profiler filters or adding more skills, interests, or project history.</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* DYNAMIC MATCH BREAKDOWN DRAWER */}
      {drawerOpen && selectedOpp && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-300">
          
          {/* Overlay background black shadow */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-lg bg-neutral-950/95 border-l border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
              
              {/* Drawer Header */}
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border border-white/10 shadow-md bg-white/5 p-1 relative flex items-center justify-center rounded-xl shrink-0">
                      <AvatarImage src={selectedOpp.logo} alt={selectedOpp.company} className="object-contain" />
                      <AvatarFallback className="bg-secondary text-white text-md rounded-xl">
                        {selectedOpp.company.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-sm font-bold text-muted-foreground leading-none">{selectedOpp.company}</h4>
                      <h3 className="text-lg font-black text-white mt-1.5 leading-tight">{selectedOpp.title}</h3>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setDrawerOpen(false)}
                    className="text-muted-foreground hover:text-white hover:bg-white/5 rounded-full w-8 h-8"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="border-t border-white/5 pt-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Match Compatibility</h4>
                    <span className="text-2xl font-black text-indigo-400">{selectedOpp.matchScore}%</span>
                  </div>

                  {/* Horizontal visual progress bars for each vector */}
                  <div className="space-y-4">
                    
                    {/* Vector 1: Trust Score */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-white/80 font-medium">Trust Score Match</span>
                        <span className="font-mono text-muted-foreground">{selectedOpp.detailsBreakdown?.trustScoreMatch || 50}%</span>
                      </div>
                      <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-all duration-1000"
                          style={{ width: `${selectedOpp.detailsBreakdown?.trustScoreMatch || 50}%` }}
                        />
                      </div>
                    </div>

                    {/* Vector 2: Skills */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-white/80 font-medium">Skills Compatibility</span>
                        <span className="font-mono text-muted-foreground">{selectedOpp.detailsBreakdown?.skillsMatch || 50}%</span>
                      </div>
                      <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-1000"
                          style={{ width: `${selectedOpp.detailsBreakdown?.skillsMatch || 50}%` }}
                        />
                      </div>
                    </div>

                    {/* Vector 3: Projects */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-white/80 font-medium">Projects & Experience Relevance</span>
                        <span className="font-mono text-muted-foreground">{selectedOpp.detailsBreakdown?.projectsMatch || 50}%</span>
                      </div>
                      <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)] transition-all duration-1000"
                          style={{ width: `${selectedOpp.detailsBreakdown?.projectsMatch || 50}%` }}
                        />
                      </div>
                    </div>

                    {/* Vector 4: Location */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-white/80 font-medium">Location Compatibility</span>
                        <span className="font-mono text-muted-foreground">{selectedOpp.detailsBreakdown?.locationMatch || 50}%</span>
                      </div>
                      <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-1000"
                          style={{ width: `${selectedOpp.detailsBreakdown?.locationMatch || 50}%` }}
                        />
                      </div>
                    </div>

                    {/* Vector 5: Education */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-white/80 font-medium">Academic / Major Fit</span>
                        <span className="font-mono text-muted-foreground">{selectedOpp.detailsBreakdown?.educationMatch || 50}%</span>
                      </div>
                      <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all duration-1000"
                          style={{ width: `${selectedOpp.detailsBreakdown?.educationMatch || 50}%` }}
                        />
                      </div>
                    </div>

                    {/* Vector 6: Interests */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-white/80 font-medium">Declared Interests Alignment</span>
                        <span className="font-mono text-muted-foreground">{selectedOpp.detailsBreakdown?.interestsMatch || 50}%</span>
                      </div>
                      <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)] transition-all duration-1000"
                          style={{ width: `${selectedOpp.detailsBreakdown?.interestsMatch || 50}%` }}
                        />
                      </div>
                    </div>

                    {/* Vector 7: Verification Status Boost */}
                    <div className="space-y-1.5 border-t border-white/5 pt-3">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          Cryptographic Verification Boost
                        </span>
                        <span className="font-mono text-emerald-400 font-bold">+{selectedOpp.detailsBreakdown?.verificationBoost || 0}%</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Extra match confidence points earned for having verified academic marks and experiences.</p>
                    </div>

                  </div>
                </div>

                {/* Deep Analysis Text Box */}
                <div className="space-y-2 border-t border-white/5 pt-6">
                  <h4 className="text-xs uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    AI Reasoning
                  </h4>
                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl text-xs text-muted-foreground leading-relaxed">
                    {selectedOpp.matchReason}
                    <p className="mt-2.5">
                      <strong className="text-white">Requirements check:</strong> Required skills are <span className="text-indigo-400 font-mono">{selectedOpp.tags.join(", ")}</span>. Target majors: <span className="text-white font-mono">Computer Science or STEM equivalent</span>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Drawer footer */}
              <div className="border-t border-white/5 pt-6 flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 border-white/10 hover:bg-white/5 text-white text-xs h-10 font-bold"
                >
                  Close Analysis
                </Button>
                <a href={selectedOpp.applyLink || "#"} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white text-xs h-10 font-bold flex items-center justify-center gap-1.5 shadow-md">
                    Apply Now <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
