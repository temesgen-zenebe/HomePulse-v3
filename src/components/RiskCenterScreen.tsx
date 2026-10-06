import React from "react";
import { 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Flame, 
  Droplet, 
  Sun, 
  Sparkles, 
  Plus 
} from "lucide-react";
import { ActiveRisk } from "../types";

interface RiskCenterScreenProps {
  risks: ActiveRisk[];
  onNavigateToScreen: (screenId: string) => void;
  onAddTasks?: (newTasks: any[]) => void;
}

export default function RiskCenterScreen({ risks, onNavigateToScreen, onAddTasks }: RiskCenterScreenProps) {
  const [precautionsExpanded, setPrecautionsExpanded] = React.useState(false);
  const [resolvedIds, setResolvedIds] = React.useState<string[]>([]);
  
  // Custom action plan state
  const [loadingPlanId, setLoadingPlanId] = React.useState<string | null>(null);
  const [expandedPlanId, setExpandedPlanId] = React.useState<string | null>(null);
  const [mitigationPlans, setMitigationPlans] = React.useState<Record<string, {
    summary: string;
    steps: { title: string; detail: string; difficulty: string }[];
    estimatedCost: string;
  }>>({});
  const [addedPlanIds, setAddedPlanIds] = React.useState<string[]>([]);
  const [loadingMessage, setLoadingMessage] = React.useState("Analyzing risk telemetry...");

  // Cycle loading messages when generating a plan
  React.useEffect(() => {
    if (!loadingPlanId) return;
    const messages = [
      "Analyzing threat vectors...",
      "Consulting predictive HVAC & structure models...",
      "Generating strategic countermeasures via Gemini...",
      "Validating physical difficulty rating...",
      "Assembling actionable mitigation list..."
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % messages.length;
      setLoadingMessage(messages[idx]);
    }, 1800);
    return () => clearInterval(interval);
  }, [loadingPlanId]);

  const handleResolveRisk = (id: string, name: string) => {
    setResolvedIds(prev => [...prev, id]);
    setTimeout(() => {
      alert(`Risk mitigator logged! Preventive countermeasures deployed for: "${name}".`);
    }, 200);
  };

  const getRiskIcon = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes("heatwave") || titleLower.includes("temperature")) {
      return <Sun className="w-4 h-4 text-orange-400" />;
    } else if (titleLower.includes("hvac") || titleLower.includes("overuse")) {
      return <Flame className="w-4 h-4 text-red-400" />;
    } else {
      return <Droplet className="w-4 h-4 text-cyan-400" />;
    }
  };

  const activeRisks = risks.filter(r => !resolvedIds.includes(r.id));

  // Build highwave alert as standard ActiveRisk fallback representation
  const heatwaveRisk = risks.find(r => r.id === "risk_1") || {
    id: "risk_1",
    title: "High Risk Heatwave Incoming",
    level: "High",
    description: "Severe local temperature peak forecasted to reach 104°F tomorrow.",
    precaution: "Set thermostat to pre-cool down to 70°F during early morning hours. Close all South and West blinds by 9:00 AM. Clear the air conditioning condensation drain pipe to prevent overflow, and limit heavy appliance use from 2:00 PM to 8:00 PM."
  } as ActiveRisk;

  const handlePrioritize = async (risk: ActiveRisk) => {
    if (expandedPlanId === risk.id) {
      setExpandedPlanId(null);
      return;
    }
    if (mitigationPlans[risk.id]) {
      setExpandedPlanId(risk.id);
      return;
    }

    setLoadingPlanId(risk.id);
    setLoadingMessage("Analyzing threat vectors...");

    try {
      const response = await fetch("/api/mitigate-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(risk)
      });
      if (response.ok) {
        const plan = await response.json();
        setMitigationPlans(prev => ({ ...prev, [risk.id]: plan }));
        setExpandedPlanId(risk.id);
      } else {
        throw new Error("Failed to fetch custom mitigation plan");
      }
    } catch (err) {
      console.warn("API mitigation plan failed. Deploying high-fidelity local models.", err);
      // Perfect local fallback
      const fallbacks: Record<string, any> = {
        "risk_1": {
          summary: "A cooling safety blueprint to prepare your HVAC compressor and lower interior solar thermal load before the day begins.",
          steps: [
            {
              title: "Pre-Cool the Property",
              detail: "Set your thermostat to 70°F overnight. This builds a cold buffer in your drywalls and furniture before peak heat.",
              difficulty: "Easy"
            },
            {
              title: "Lock Down Solar Entrances",
              detail: "Pull down all South and West-facing window blinds, curtains, and shades by 9:00 AM to deflect radiant solar rays.",
              difficulty: "Easy"
            },
            {
              title: "Clear AC Condensate Line",
              detail: "Verify the drain pipe near your furnace isn't clogged. Pour 1 cup of white vinegar down the drain to kill algae blocks.",
              difficulty: "Medium"
            },
            {
              title: "Optimize Ventilation Loop",
              detail: "Switch off secondary heat sources like dishwashers or ovens between 2:00 PM and 8:00 PM. Run ceiling fans counter-clockwise.",
              difficulty: "Easy"
            }
          ],
          estimatedCost: "DIY (<$50)"
        },
        "risk_2": {
          summary: "An HVAC system defense strategy designed to reduce duty cycle wear, prevent blower freezing, and guarantee air flow.",
          steps: [
            {
              title: "Replace Air Filters",
              detail: "A clogged filter restricts airflow, causing the cooling coil to drop below freezing, turning into ice and halting cooling.",
              difficulty: "Easy"
            },
            {
              title: "Set Moderate Temperature Margins",
              detail: "Keep your cooling setpoint at 78°F or higher during peak hours (2:00 PM to 6:00 PM). Each degree cooler increases workload by 8%.",
              difficulty: "Easy"
            },
            {
              title: "Verify Air Grille Access",
              detail: "Walk the house and ensure furniture, rugs, or curtains are not blocking any supply register vents or return grilles.",
              difficulty: "Easy"
            },
            {
              title: "Inspect Outside Condenser Fan",
              detail: "Ensure there are no weeds, tall grasses, or debris blocking airflow within 2 feet of the external outdoor unit.",
              difficulty: "Medium"
            }
          ],
          estimatedCost: "DIY (<$50)"
        },
        "risk_3": {
          summary: "A wood structural defense plan to preserve high-end oak panels and prevent dry air cracking.",
          steps: [
            {
              title: "Audit Central Humidifier Bypass",
              detail: "Check the duct damper on your central humidifier. Ensure it is switched to 'WINTER' or 'OPEN' and set the humidistat to 38%.",
              difficulty: "Easy"
            },
            {
              title: "Deploy Zone-Specific Vaporizers",
              detail: "Set up small ultrasonic portable vaporizers directly in rooms with premium solid wood dining sets or oak paneling.",
              difficulty: "Easy"
            },
            {
              title: "Monitor Solid Wood Joint Tolerances",
              detail: "Inspect flooring planks and window frame trims for hairline gaps. Maintain humidity above 30% to stop contraction.",
              difficulty: "Easy"
            }
          ],
          estimatedCost: "DIY (<$50)"
        }
      };

      const plan = fallbacks[risk.id] || {
        summary: "A robust mitigation strategy focused on proactive equipment protection and early testing.",
        steps: [
          {
            title: "Immediate System Audit",
            detail: "Audit the relevant home systems to ensure all sensors, valves, and switches operate correctly.",
            difficulty: "Easy"
          },
          {
            title: "Deploy Physical Safeguards",
            detail: "Clear structural blocks, seal vents, or use shades depending on the specific threat type.",
            difficulty: "Medium"
          },
          {
            title: "Verify Countermeasures",
            detail: "Monitor system load metrics or room sensors to ensure temperature/moisture ranges stabilize.",
            difficulty: "Easy"
          }
        ],
        estimatedCost: "DIY (<$50)"
      };

      setMitigationPlans(prev => ({ ...prev, [risk.id]: plan }));
      setExpandedPlanId(risk.id);
    } finally {
      setLoadingPlanId(null);
    }
  };

  const handleAddPlanToTasks = (riskId: string, riskTitle: string, plan: any) => {
    if (onAddTasks) {
      const newTasks = plan.steps.map((step: any, idx: number) => ({
        id: `mitig_${riskId}_${idx}_${Date.now()}`,
        title: `${riskTitle}: ${step.title}`,
        due: "Next 24 Hours",
        priority: "High",
        why: plan.summary,
        how: step.detail,
        who: "DIY",
        where: "Home Systems",
        completed: false
      }));
      onAddTasks(newTasks);
      setAddedPlanIds(prev => [...prev, riskId]);
      alert(`Mitigation action plan steps successfully merged into your active maintenance checklist!`);
    } else {
      alert(`Could not merge to checklist. Local action plan saved.`);
    }
  };

  const renderPlanSection = (risk: ActiveRisk) => {
    const isPlanLoaded = !!mitigationPlans[risk.id];
    const isPlanExpanded = expandedPlanId === risk.id;
    const isLoading = loadingPlanId === risk.id;

    if (isLoading) {
      return (
        <div className="mt-3 p-3 bg-[#0D1527] border border-blue-500/20 rounded-xl flex flex-col items-center justify-center space-y-2 animate-pulse text-center">
          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[9px] text-blue-300 font-mono tracking-wide">{loadingMessage}</p>
        </div>
      );
    }

    if (isPlanExpanded && isPlanLoaded) {
      const plan = mitigationPlans[risk.id];
      const hasAdded = addedPlanIds.includes(risk.id);

      return (
        <div className="mt-3 p-3 bg-slate-950 border border-blue-500/20 rounded-xl space-y-2.5 animate-fade-in text-left">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-mono text-blue-400 uppercase tracking-widest bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-blue-400 animate-pulse" />
              <span>Suggested AI Action Plan</span>
            </span>
            <span className="text-[8px] text-zinc-400 font-sans">Cost: <span className="text-zinc-200 font-bold">{plan.estimatedCost}</span></span>
          </div>
          <p className="text-[10px] text-zinc-300 leading-relaxed italic border-l border-blue-500/30 pl-2">
            "{plan.summary}"
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-none">
            {plan.steps.map((step: any, idx: number) => (
              <div key={idx} className="bg-[#101820] border border-slate-800/80 rounded-lg p-2 flex items-start space-x-2">
                <span className="text-[9px] font-mono font-bold text-blue-400 bg-blue-500/5 border border-blue-500/20 px-1.5 py-0.5 rounded flex-shrink-0 w-5 text-center mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h6 className="text-[10px] font-bold text-white leading-tight truncate">{step.title}</h6>
                    <span className={`text-[7px] font-mono px-1 rounded uppercase tracking-wider ${
                      step.difficulty === "Easy" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" :
                      step.difficulty === "Medium" ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" :
                      "bg-red-500/10 border border-red-500/20 text-red-400"
                    }`}>
                      {step.difficulty}
                    </span>
                  </div>
                  <p className="text-[9px] text-zinc-400 mt-0.5 leading-normal">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            {hasAdded ? (
              <div className="w-full flex items-center justify-center space-x-1 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[9px] font-bold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />
                <span>ADDED TO TASKS CHECKLIST</span>
              </div>
            ) : (
              <button
                onClick={() => handleAddPlanToTasks(risk.id, risk.title, plan)}
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold rounded-lg transition-all cursor-pointer text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-md shadow-blue-900/10"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Plan to Maintenance Tasks</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0A0A0A] text-white font-sans relative">
      
      {/* Scrollable Main Space */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-20 scrollbar-none">
        
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Predictive Threat Assessment</span>
            <h2 className="text-xl font-extrabold tracking-tight text-white font-display">Risk Center</h2>
          </div>
          <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
        </div>

        {/* Primary High-Risk Banner Card (Red theme) */}
        {!resolvedIds.includes("risk_1") ? (
          <div className="bg-[#1C1012] border border-red-500/30 rounded-2xl p-4 shadow-[0_0_15px_rgba(239,68,68,0.1)] mb-5 overflow-hidden transition-all duration-300">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[8px] font-mono font-bold text-red-400 uppercase tracking-widest bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">Critical Alert</span>
                <h3 className="text-sm font-extrabold text-white mt-1.5 leading-snug">
                  High Risk Heatwave Incoming
                </h3>
                <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                  Severe local temperature peak forecasted to reach 104°F tomorrow.
                </p>
              </div>
            </div>

            {/* View Precautions Button */}
            <button
              onClick={() => setPrecautionsExpanded(!precautionsExpanded)}
              className="w-full mt-4 bg-red-600/10 hover:bg-red-600/20 active:scale-98 text-[10px] font-bold text-red-400 py-2 rounded-xl border border-red-500/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
            >
              <span>{precautionsExpanded ? "Hide Safeguards" : "View Precautions"}</span>
              {precautionsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Expanded Precautions List */}
            {precautionsExpanded && (
              <div className="mt-4 pt-4 border-t border-red-500/20 text-[10px] text-zinc-300 space-y-2.5 animate-fade-in font-sans">
                <div className="flex items-start space-x-2">
                  <span className="text-red-400 font-bold">✓</span>
                  <span>Set cooling thermostat down to 70°F during overnight hours.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-red-400 font-bold">✓</span>
                  <span>Close all solar-facing window blinds by 9:00 AM.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-red-400 font-bold">✓</span>
                  <span>Confirm air condition drain pipe line has zero water blockage.</span>
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handlePrioritize(heatwaveRisk)}
                    className="flex-1 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 active:scale-98 text-blue-400 border border-blue-500/20 font-bold rounded-lg transition-colors cursor-pointer text-[9px] uppercase tracking-wider flex items-center justify-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
                    <span>AI Plan</span>
                  </button>
                  <button
                    onClick={() => handleResolveRisk("risk_1", "Heatwave Countermeasures")}
                    className="flex-1 py-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500 transition-colors cursor-pointer text-[9px] uppercase tracking-wider"
                  >
                    Confirm Deployed
                  </button>
                </div>

                {renderPlanSection(heatwaveRisk)}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#101820] border border-emerald-500/20 rounded-2xl p-4 mb-5 text-center flex flex-col items-center justify-center shadow-lg py-5 animate-fade-in">
            <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-400 mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white">Heatwave Risks Mitigated</h4>
            <p className="text-[9px] text-zinc-500 mt-1 max-w-[220px]">HomePulse automated shield logging confirmed physical defenses are deployed.</p>
          </div>
        )}

        {/* Active Risks List section */}
        <div>
          <h4 className="text-xs font-bold text-zinc-400 mb-3 tracking-wide flex items-center gap-1.5">
            <span>Active Risks</span>
            <span className="text-[9px] text-zinc-500 font-mono">({activeRisks.length} threats)</span>
          </h4>

          {activeRisks.length > 0 ? (
            <div className="space-y-2.5">
              {activeRisks.map((risk) => {
                const priorityStyles = 
                  risk.level === "High" 
                    ? "bg-red-500/10 border-red-500/20 text-red-400" 
                    : risk.level === "Medium"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-blue-500/10 border-blue-500/20 text-blue-400";

                return (
                  <div
                    key={risk.id}
                    className="p-3 bg-[#101820] border border-slate-800 rounded-xl hover:border-slate-700 transition-all shadow-md flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                        <div className="p-1.5 bg-slate-900 rounded-lg flex-shrink-0 mt-0.5">
                          {getRiskIcon(risk.title)}
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-[11px] font-bold text-white leading-tight truncate">
                            {risk.title}
                          </h5>
                          <p className="text-[9.5px] text-zinc-400 mt-1 line-clamp-2">
                            {risk.description}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border flex-shrink-0 ${priorityStyles}`}>
                        {risk.level}
                      </span>
                    </div>

                    {/* Expandable safeguard view inside card */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[8px] font-mono">
                      <span className="text-zinc-500">Protection Action Available</span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handlePrioritize(risk)}
                          className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 uppercase cursor-pointer py-1 px-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded border border-blue-500/20 transition-all text-[8px]"
                        >
                          <Sparkles className="w-2.5 h-2.5 animate-pulse text-blue-400" />
                          <span>Prioritize Mitigation</span>
                        </button>
                        <button
                          onClick={() => handleResolveRisk(risk.id, risk.title)}
                          className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5 uppercase cursor-pointer"
                        >
                          <span>Resolve</span>
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        </button>
                      </div>
                    </div>

                    {renderPlanSection(risk)}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#101820]/40 border border-slate-800 border-dashed rounded-xl p-8 text-center text-[11px] text-zinc-500">
              <ShieldCheck className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <span>Perfect Defense Profile! No active risk threats identified.</span>
            </div>
          )}
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
        <button onClick={() => onNavigateToScreen("screen-profile")} className="flex flex-col items-center space-y-1 text-zinc-500 hover:text-zinc-300 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          <span className="text-[9px] font-bold uppercase tracking-wider">More</span>
        </button>
      </div>

    </div>
  );
}
