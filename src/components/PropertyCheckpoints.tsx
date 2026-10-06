import React from "react";
import { 
  ShieldCheck, 
  CheckSquare, 
  Square, 
  AlertTriangle, 
  TrendingUp, 
  ChevronLeft, 
  Plus, 
  Wrench, 
  Flame, 
  Droplets, 
  Zap, 
  Sparkles, 
  ShieldAlert, 
  Gauge, 
  CheckCircle2, 
  Award, 
  Settings, 
  Home, 
  CornerDownRight 
} from "lucide-react";
import { MaintenanceTask, HomeSystem, SavingsItem } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface CheckpointItem {
  id: string;
  title: string;
  description: string;
  why: string;
  systemId: string; // targets specific home system node
  category: "Plumbing" | "Electrical" | "Safety" | "Envelope";
  dangerLevel: "High" | "Medium" | "Low";
  impactScore: number; // health points or ROI savings
}

interface PropertyCheckpointsProps {
  tasks: MaintenanceTask[];
  systems: HomeSystem[];
  onNavigateToScreen: (screenId: string) => void;
  onAddTask: (task: MaintenanceTask) => void;
  onUpdateSystemHealth: (systemId: string, healthChange: number) => void;
  onAddSavings: (item: SavingsItem) => void;
}

// 12 High-Value Property Preservation Checkpoints
const CHECKPOINT_CATALOG: CheckpointItem[] = [
  {
    id: "cp_1",
    title: "Braided Stainless Washing Machine Hoses",
    description: "Verify that standard black rubber washer supply lines are upgraded to burst-proof braided stainless steel steel lines.",
    why: "Washing machine supply hose rupture is a top-3 cause of catastrophic interior residential water damage, averaging $15,000 in repair expenses.",
    systemId: "sys_3", // Plumbing
    category: "Plumbing",
    dangerLevel: "High",
    impactScore: 125
  },
  {
    id: "cp_2",
    title: "Main Water Shutoff Valve Ease-of-Use",
    description: "Locate your primary perimeter street water shutoff valve and test turning it to ensure it operates smoothly without freezing.",
    why: "If a main pipe breaches inside the drywall, a seized gate valve prevents quick flow isolation, compounding flood destruction by 10x.",
    systemId: "sys_3", // Plumbing
    category: "Plumbing",
    dangerLevel: "High",
    impactScore: 150
  },
  {
    id: "cp_3",
    title: "Sump Pump Float Switch Clearance",
    description: "Inspect the sump pit, pour water to check pump trigger float level activation, and dry-test your backup battery connections.",
    why: "Heavy rains cause rapid basement flood events if the float switch gets pinned or if the mechanical impeller is frozen.",
    systemId: "sys_3", // Plumbing
    category: "Plumbing",
    dangerLevel: "High",
    impactScore: 180
  },
  {
    id: "cp_4",
    title: "Carbon Monoxide Detector Manufacture Date",
    description: "Press test buttons on all CO sensors and check the stamp on the back of each body to confirm it is less than 7 years old.",
    why: "CO electrochemical sensor cells fail and lose sensitivity after 7 years, even if their test alarm battery sounds functional.",
    systemId: "sys_7", // Safety
    category: "Safety",
    dangerLevel: "High",
    impactScore: 110
  },
  {
    id: "cp_5",
    title: "Fire Extinguisher Charge Pressure",
    description: "Examine all wall-mounted extinguishers to confirm the pressure dial needle sits fully inside the green zone and the security pin is intact.",
    why: "Slow valve leakage ruins dry chemical expellant pressure over time, rendering the cylinder useless when a grease flare fires up.",
    systemId: "sys_7", // Safety
    category: "Safety",
    dangerLevel: "Medium",
    impactScore: 90
  },
  {
    id: "cp_6",
    title: "Dryer Vent Exhaust Duct Lint Clearance",
    description: "Disconnect the rear dryer bellows and clean any heavy felted lint accumulation from the exterior flap wall exhaust duct.",
    why: "Restricted thermal venting causes extreme core temperatures that can ignite lint fibers, driving 15,000 residential structural fires annually.",
    systemId: "sys_6", // Appliances
    category: "Safety",
    dangerLevel: "High",
    impactScore: 140
  },
  {
    id: "cp_7",
    title: "Attic Insulation R-Value Depth Check",
    description: "Measure loose fill insulation thickness in your attic. Ensure it measures at least 13-15 inches deep for standard R-38 protection.",
    why: "Inadequate ceiling insulation permits massive convective heat leakage, driving down heating cycle efficiency and causing ice dams.",
    systemId: "sys_2", // HVAC
    category: "Envelope",
    dangerLevel: "Medium",
    impactScore: 210
  },
  {
    id: "cp_8",
    title: "Exterior Entry Weatherstripping Integrity",
    description: "Inspect peripheral door jamb door sweeps and compression seals. Ensure zero exterior daylight is visible when latched.",
    why: "A single 1/8-inch gap under an entryway door leaks as much conditioned air volume as a 2.4-inch drill hole in the exterior framing.",
    systemId: "sys_8", // Exterior
    category: "Envelope",
    dangerLevel: "Low",
    impactScore: 80
  },
  {
    id: "cp_9",
    title: "Window Frame Structural Perimeter Caulk",
    description: "Assess external flashing trim joints and vinyl perimeter seals. Seal any dry rotted gaps with pure exterior grade polyurethane.",
    why: "Moisture water ingress around window headers decays framing wood studs, triggering hidden mold colonization and drywall degradation.",
    systemId: "sys_1", // Roof/Structure
    category: "Envelope",
    dangerLevel: "Medium",
    impactScore: 130
  },
  {
    id: "cp_10",
    title: "Warm-to-the-Touch Circuit Breakers check",
    description: "Under active heavy load (air conditioner or oven running), cautiously scan the surface of panel breakers to check for anomalous heat.",
    why: "Loose wiring terminals or overloaded busbars cause excessive resistance heat, presenting silent electrical ignition risks.",
    systemId: "sys_4", // Electrical
    category: "Electrical",
    dangerLevel: "High",
    impactScore: 160
  },
  {
    id: "cp_11",
    title: "GFCI Outlet Trip & Reset Response",
    description: "Plug a digital circuit tester into wet-zone outlets (kitchen, baths) and press the test button to ensure quick, clean trip reaction times.",
    why: "Sticky GFCI solenoid latches fail to break current flow during active ground fault spikes, putting occupants at risk of electrocution.",
    systemId: "sys_4", // Electrical
    category: "Electrical",
    dangerLevel: "High",
    impactScore: 120
  },
  {
    id: "cp_12",
    title: "Whole-House Service Surge Protection",
    description: "Confirm a heavy-duty Type 1 or Type 2 surge protector device is wired directly into your main electrical distribution panel.",
    why: "Voltage transient spikes from lightning or grid switching instantly degrade smart thermostats, heat pump boards, and major appliance computers.",
    systemId: "sys_4", // Electrical
    category: "Electrical",
    dangerLevel: "Medium",
    impactScore: 240
  }
];

export default function PropertyCheckpoints({
  tasks,
  systems,
  onNavigateToScreen,
  onAddTask,
  onUpdateSystemHealth,
  onAddSavings
}: PropertyCheckpointsProps) {
  
  // Track checkpoint statuses: "secure" | "needs-work" | null (not audited)
  const [statuses, setStatuses] = React.useState<Record<string, "secure" | "needs-work" | null>>(() => {
    // Read from localStorage to persist user checkpoint audits
    try {
      const stored = localStorage.getItem("homepulse_checkpoints_v3");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Could not read checkpoints cache", e);
    }
    return {
      cp_1: null,
      cp_2: null,
      cp_3: null,
      cp_4: null,
      cp_5: null,
      cp_6: null,
      cp_7: null,
      cp_8: null,
      cp_9: null,
      cp_10: null,
      cp_11: null,
      cp_12: null
    };
  });

  // Track active sub-category filter
  const [activeTab, setActiveTab] = React.useState<"all" | "Plumbing" | "Electrical" | "Safety" | "Envelope">("all");
  
  // Local notification banner state
  const [notif, setNotif] = React.useState<{ text: string; type: "success" | "warn" | "info" } | null>(null);

  // Persistence write helper
  const updateStatuses = (newStatuses: Record<string, "secure" | "needs-work" | null>) => {
    setStatuses(newStatuses);
    try {
      localStorage.setItem("homepulse_checkpoints_v3", JSON.stringify(newStatuses));
    } catch (e) {
      console.warn("Failed to write checkpoints cache", e);
    }
  };

  // Helper trigger notifications
  const showLocalNotif = (text: string, type: "success" | "warn" | "info") => {
    setNotif({ text, type });
    setTimeout(() => {
      setNotif(null);
    }, 4500);
  };

  // 1. Mark Checkpoint as Secure
  const handleMarkSecure = (cp: CheckpointItem) => {
    const current = statuses[cp.id];
    if (current === "secure") return; // already done

    const nextStatuses = { ...statuses, [cp.id]: "secure" as const };
    updateStatuses(nextStatuses);

    // Boost health of the targeted home system
    onUpdateSystemHealth(cp.systemId, 6); // Boost system health by 6%

    // Calculate a dynamic ROI cash savings bonus
    const savingsAmount = Math.round(cp.impactScore * 0.7);
    const bonusSavings: SavingsItem = {
      id: `save_cp_${cp.id}_${Date.now()}`,
      category: cp.title,
      amount: savingsAmount,
      description: `Verified preservation checkpoint: "${cp.title}". Prevented emergency remediation and deferred breakdown losses.`
    };
    onAddSavings(bonusSavings);

    showLocalNotif(`Checkpoint verified! Relevant system health boosted & saved $${savingsAmount} in simulated liabilities.`, "success");
  };

  // 2. Mark Checkpoint as Needs Attention
  const handleMarkNeedsWork = (cp: CheckpointItem) => {
    const current = statuses[cp.id];
    if (current === "needs-work") return;

    const nextStatuses = { ...statuses, [cp.id]: "needs-work" as const };
    updateStatuses(nextStatuses);

    // Decrease health slightly (adds realism)
    onUpdateSystemHealth(cp.systemId, -4);

    // Construct a beautiful, fully customized maintenance task
    const newTask: MaintenanceTask = {
      id: `task_cp_${cp.id}_${Date.now()}`,
      title: `Resolve: ${cp.title}`,
      due: "May 25, 2025",
      priority: cp.dangerLevel,
      why: cp.why,
      how: cp.description,
      who: "DIY or Professional Recommended",
      where: "Inspected Zone Location",
      completed: false
    };

    onAddTask(newTask);
    showLocalNotif(`Checkpoint flagged. Actionable maintenance task generated in your scheduling queue!`, "warn");
  };

  // 3. Reset a checkpoint
  const handleResetCheckpoint = (cp: CheckpointItem) => {
    const current = statuses[cp.id];
    if (!current) return;

    const nextStatuses = { ...statuses, [cp.id]: null };
    updateStatuses(nextStatuses);

    // Restore standard calibration health
    if (current === "secure") {
      onUpdateSystemHealth(cp.systemId, -6);
    } else if (current === "needs-work") {
      onUpdateSystemHealth(cp.systemId, 4);
    }

    showLocalNotif(`Checkpoint reset. System telemetry normalized.`, "info");
  };

  // Calculate audit statistics
  const totalCheckpoints = CHECKPOINT_CATALOG.length;
  const verifiedCount = Object.values(statuses).filter(s => s === "secure").length;
  const needsWorkCount = Object.values(statuses).filter(s => s === "needs-work").length;
  const completionPercentage = totalCheckpoints > 0 ? Math.round((verifiedCount / totalCheckpoints) * 100) : 0;

  // Steward Level designation text
  const getStewardLevel = (pct: number) => {
    if (pct === 100) return "Master of Home Sovereignty";
    if (pct >= 75) return "Vigilant Property Guardian";
    if (pct >= 50) return "Proactive Home Steward";
    if (pct >= 25) return "Initiated Asset Caretaker";
    return "Stewardship Apprentice";
  };

  const filteredCatalog = CHECKPOINT_CATALOG.filter(cp => {
    if (activeTab === "all") return true;
    return cp.category === activeTab;
  });

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0A0A0A] text-white font-sans relative">
      
      {/* Absolute Glows */}
      <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-blue-500 rounded-full filter blur-[110px] opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/3 w-32 h-32 bg-indigo-500 rounded-full filter blur-[110px] opacity-10 pointer-events-none"></div>

      {/* Main scroll container */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-24 scrollbar-none">
        
        {/* Navigation back */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => onNavigateToScreen("screen-dashboard")}
            className="flex items-center space-x-1.5 text-xs text-blue-400 hover:text-blue-300 font-mono cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          
          <div className="flex items-center space-x-1.5 text-[10px] font-mono text-zinc-500 uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Value Guard</span>
          </div>
        </div>

        {/* Local dynamic notification pop */}
        <AnimatePresence>
          {notif && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`mb-4 p-3 rounded-xl border text-[10.5px] leading-relaxed text-left flex items-start gap-2 shadow-lg ${
                notif.type === "success" 
                  ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-300"
                  : notif.type === "warn"
                  ? "bg-amber-500/15 border-amber-500/25 text-amber-300"
                  : "bg-blue-500/15 border-blue-500/25 text-blue-300"
              }`}
            >
              <Sparkles className="w-4.5 h-4.5 flex-shrink-0 mt-0.5 animate-pulse" />
              <span>{notif.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section header */}
        <div className="mb-5 text-left">
          <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">Stewardship Core</span>
          <h2 className="text-xl font-extrabold tracking-tight text-white font-display">Property Checkpoints</h2>
          <p className="text-[10px] text-zinc-400 mt-0.5">Audit high-value checkpoints to prevent disaster liability & grow equity.</p>
        </div>

        {/* Stats card */}
        <div className="bg-[#101820]/80 border border-slate-800/80 rounded-2xl p-4 shadow-xl mb-5 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full filter blur-xl pointer-events-none"></div>
          
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-[8px] font-mono block text-zinc-500 uppercase">Audit completeness</span>
              <span className="text-2xl font-extrabold text-white tracking-tight">{completionPercentage}%</span>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-mono block text-zinc-500 uppercase">Verification Level</span>
              <span className="text-xs font-bold text-blue-400 font-mono">{getStewardLevel(completionPercentage)}</span>
            </div>
          </div>

          {/* Combined Progress Bar */}
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden flex mb-2.5">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
            <div className="h-full bg-red-500/80 transition-all duration-500" style={{ width: `${(needsWorkCount / totalCheckpoints) * 100}%` }}></div>
          </div>

          <div className="flex items-center gap-4 text-[9px] font-mono text-zinc-500">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-emerald-500"></span>
              <span>{verifiedCount} Verified</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-red-500"></span>
              <span>{needsWorkCount} Needs Attention</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-slate-700"></span>
              <span>{totalCheckpoints - verifiedCount - needsWorkCount} Remaining</span>
            </div>
          </div>
        </div>

        {/* Horizontal Navigation tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-3.5 scrollbar-none mb-3.5 border-b border-slate-900">
          {[
            { id: "all", label: "All Nodes" },
            { id: "Plumbing", label: "Plumbing" },
            { id: "Electrical", label: "Electrical" },
            { id: "Safety", label: "Safety" },
            { id: "Envelope", label: "Envelope" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-1 px-3 rounded-full text-[10px] font-bold font-mono border whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? "bg-blue-600/15 border-blue-500 text-blue-400" 
                  : "bg-black/35 border-slate-800 hover:border-slate-700 text-zinc-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Checkpoint list cards */}
        <div className="space-y-3.5 text-left">
          {filteredCatalog.map((cp) => {
            const status = statuses[cp.id];
            
            // Icon according to category
            const renderCategoryIcon = () => {
              if (cp.category === "Plumbing") return <Droplets className="w-3.5 h-3.5 text-blue-400" />;
              if (cp.category === "Electrical") return <Zap className="w-3.5 h-3.5 text-amber-400" />;
              if (cp.category === "Safety") return <Flame className="w-3.5 h-3.5 text-red-400" />;
              return <Home className="w-3.5 h-3.5 text-indigo-400" />;
            };

            return (
              <div 
                key={cp.id}
                className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
                  status === "secure"
                    ? "bg-emerald-950/15 border-emerald-500/20 shadow-emerald-950/10 shadow-lg"
                    : status === "needs-work"
                    ? "bg-red-950/15 border-red-500/25 shadow-red-950/10 shadow-lg"
                    : "bg-[#101820] border-slate-800/80 hover:border-slate-700"
                }`}
              >
                {/* Badge Row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5 bg-black/45 px-2 py-0.5 rounded border border-slate-800/80">
                    {renderCategoryIcon()}
                    <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-wide">{cp.category}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-[8.5px] font-mono text-zinc-500">Liability impact:</span>
                    <span className="text-[9px] font-bold font-mono text-blue-400">+${cp.impactScore}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xs font-bold text-white tracking-wide leading-snug">
                  {cp.title}
                </h3>
                
                {/* Audit instructions */}
                <p className="text-[10px] text-zinc-300 mt-1.5 leading-relaxed font-sans">
                  {cp.description}
                </p>

                {/* Why it is crucial accordion style */}
                <div className="mt-2.5 p-2 rounded-xl bg-black/30 border border-slate-900/50 flex items-start gap-2">
                  <CornerDownRight className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[9px] text-zinc-400 leading-normal font-sans">
                    <strong className="text-zinc-300">Liability:</strong> {cp.why}
                  </p>
                </div>

                {/* Status indicator pill if verified */}
                {status && (
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {status === "secure" ? (
                        <span className="text-[9px] font-bold font-mono text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Secure & Logged
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold font-mono text-red-400 uppercase bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 animate-pulse" /> Task Triggered
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleResetCheckpoint(cp)}
                      className="text-[9px] font-mono text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
                    >
                      Reset Audit
                    </button>
                  </div>
                )}

                {/* Action buttons if not audited yet */}
                {!status && (
                  <div className="mt-3.5 grid grid-cols-2 gap-2 border-t border-slate-900/40 pt-3">
                    <button
                      onClick={() => handleMarkSecure(cp)}
                      className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-md cursor-pointer hover:scale-[1.02]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified (Secure)</span>
                    </button>
                    
                    <button
                      onClick={() => handleMarkNeedsWork(cp)}
                      className="py-1.5 px-2 bg-[#1C1615] border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 font-bold text-[10px] rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Needs Attention</span>
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>

      {/* Persistent Bottom Tab Navigation (Mockup Representation) */}
      <div className="absolute bottom-0 inset-x-0 h-16 bg-[#101820]/95 backdrop-blur-md border-t border-slate-800/80 flex items-center justify-around px-3 z-30 select-none">
        <button onClick={() => onNavigateToScreen("screen-dashboard")} className="flex flex-col items-center space-y-1 text-zinc-500 hover:text-zinc-300 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
        </button>
        <button onClick={() => onNavigateToScreen("screen-systems")} className="flex flex-col items-center space-y-1 text-zinc-500 hover:text-zinc-300 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
          </svg>
          <span className="text-[9px] font-bold uppercase tracking-wider">Systems</span>
        </button>
        <button onClick={() => onNavigateToScreen("screen-calendar")} className="flex flex-col items-center space-y-1 text-zinc-500 hover:text-zinc-300 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <span className="text-[9px] font-bold uppercase tracking-wider">Tasks</span>
        </button>
        <button onClick={() => onNavigateToScreen("screen-assistant")} className="flex flex-col items-center space-y-1 text-zinc-500 hover:text-zinc-300 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-[9px] font-bold uppercase tracking-wider">AI Chat</span>
        </button>
        <button onClick={() => onNavigateToScreen("screen-profile")} className="flex flex-col items-center space-y-1 text-[#22D3EE] font-medium transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          <span className="text-[9px] font-bold uppercase tracking-wider">More</span>
        </button>
      </div>

    </div>
  );
}
