import React from "react";
import { 
  Activity, 
  Calendar, 
  Bell, 
  Sliders, 
  CheckSquare, 
  Sparkles, 
  AlertTriangle, 
  FileCheck2, 
  Clock, 
  TrendingUp, 
  Wrench,
  Lock,
  CheckCircle2,
  XCircle,
  Play,
  ArrowRight,
  ShieldCheck,
  Flame,
  Info,
  ShoppingBag,
  Thermometer,
  Cpu,
  Layers
} from "lucide-react";
import BottomNavBar from "./BottomNavBar";

interface FeatureModule {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  guideline: string;
  detail: string;
  screenId: string;
  category: "Core Diagnostics" | "Automation & Assistant" | "Risk & Safety" | "Vault & History";
}

interface FeaturesHubScreenProps {
  onNavigateToScreen: (screenId: string) => void;
  enabledFeatures: Record<string, boolean>;
  onToggleFeature: (featureId: string) => void;
  addToast: (title: string, description: string, type: "task" | "risk" | "info" | "success") => void;
}

export default function FeaturesHubScreen({
  onNavigateToScreen,
  enabledFeatures,
  onToggleFeature,
  addToast
}: FeaturesHubScreenProps) {
  const [activeFilter, setActiveFilter] = React.useState<"All" | "Core Diagnostics" | "Automation & Assistant" | "Risk & Safety" | "Vault & History">("All");
  const [selectedFeatureId, setSelectedFeatureId] = React.useState<string | null>(null);

  const features: FeatureModule[] = [
    {
      id: "home-health-dashboard",
      title: "Home Health Dashboard",
      icon: Activity,
      guideline: "Displays overall Home Health Score, system health status, and highlights urgent issues.",
      detail: "Leverages multi-variable diagnostic logic that aggregates appliance lifespan metrics, air-quality, and scheduled checkpoints into a high-fidelity dynamic score.",
      screenId: "screen-dashboard",
      category: "Core Diagnostics"
    },
    {
      id: "smart-maintenance-scheduler",
      title: "Smart Maintenance Scheduler",
      icon: Calendar,
      guideline: "Automatically generates personalized maintenance plans, creates recurring maintenance schedules, and tracks upcoming and overdue tasks.",
      detail: "Tailors recurrent task protocols based on your home's unique geographic weather load and built-year calibration indices.",
      screenId: "screen-calendar",
      category: "Core Diagnostics"
    },
    {
      id: "intelligent-reminders",
      title: "Intelligent Reminders",
      icon: Bell,
      guideline: "Push notifications, email reminders, seasonal alerts, and warranty expiration reminders.",
      detail: "Fires proactive system alerts to protect equipment against thermal friction and high-risk weather scenarios before costly failures materialize.",
      screenId: "screen-calendar", // Handled inside calendar or dashboard alerts
      category: "Automation & Assistant"
    },
    {
      id: "home-systems-monitoring",
      title: "Home Systems Monitoring",
      icon: Sliders,
      guideline: "Real-time health status of Roof, HVAC, Plumbing, Electrical, Foundation, Exterior, Appliances, and Safety Systems.",
      detail: "Simulates localized continuous telematic scanning. Highlights mechanical decay models and custom reporting intervals.",
      screenId: "screen-systems",
      category: "Core Diagnostics"
    },
    {
      id: "maintenance-task-management",
      title: "Maintenance Task Management",
      icon: CheckSquare,
      guideline: "Detailed task context specifying: What, When, Why, How, Who, and Where.",
      detail: "Provides step-by-step DIY guidance, tools required, material cost estimates, liability risk reduction protocols, and professional dispatch parameters.",
      screenId: "screen-calendar",
      category: "Core Diagnostics"
    },
    {
      id: "ai-home-assistant",
      title: "AI Home Assistant",
      icon: Sparkles,
      guideline: "Diagnoses common issues, recommends DIY fixes, suggests preventive actions, determines urgency, and recommends professionals when needed.",
      detail: "Integrated with local reasoning model to act as a virtual property engineer, diagnosing complex HVAC compressor friction or plumbing flow anomalies.",
      screenId: "screen-assistant",
      category: "Automation & Assistant"
    },
    {
      id: "risk-prevention-center",
      title: "Risk Prevention Center",
      icon: AlertTriangle,
      guideline: "Weather-related alerts, freeze warnings, heatwave preparation, storm preparation, water leak prevention, and fire safety reminders.",
      detail: "Actively cross-references atmospheric trends to dynamically recommend precautionary actions and emergency shutoff procedures.",
      screenId: "screen-risks",
      category: "Risk & Safety"
    },
    {
      id: "home-documents-vault",
      title: "Home Documents Vault",
      icon: FileCheck2,
      guideline: "Centralized storage for Warranties, Manuals, Receipts, Inspection reports, Photos, and Insurance documents.",
      detail: "Organizes critical property metadata with interactive filters, expiration alerts, and direct upload capability.",
      screenId: "screen-documents",
      category: "Vault & History"
    },
    {
      id: "maintenance-history",
      title: "Maintenance History",
      icon: Clock,
      guideline: "Complete service records, repair history, costs, contractor information, and before/after photos.",
      detail: "Keeps an immutable digital log of all completed safety checkpoints and mechanical refurbishments to preserve real estate equity.",
      screenId: "screen-calendar", // Viewable under Completed tab in Calendar
      category: "Vault & History"
    },
    {
      id: "savings-tracker",
      title: "Savings Tracker",
      icon: TrendingUp,
      guideline: "Tracks prevented repair costs, maintenance expenses, utility savings, and home value protection.",
      detail: "Computes financial ROI metrics based on early detection formulas, illustrating saved technician emergency premiums.",
      screenId: "screen-savings",
      category: "Vault & History"
    },
    {
      id: "contractor-marketplace",
      title: "Contractor Marketplace",
      icon: Wrench,
      guideline: "Find trusted professionals, schedule appointments, compare providers, and track completed services.",
      detail: "Direct live connection to pre-vetted certified HVAC, electrical, plumbing, and safety experts with guaranteed priority dispatch agreements.",
      screenId: "screen-providers",
      category: "Risk & Safety"
    },
    {
      id: "consumable-supply-matrix",
      title: "Consumable Supply Matrix",
      icon: ShoppingBag,
      guideline: "Tracks vital property consumable levels including water filters, water softener salt, humidifier pads, and life safety batteries with direct instant procurement routing.",
      detail: "Dynamically monitors depletion cycles using predictive decay intervals, alerting before safety barriers or filtration systems drop below critical thresholds.",
      screenId: "screen-consumables",
      category: "Core Diagnostics"
    },
    {
      id: "climate-weather-api-hub",
      title: "Climate & Weather API Hub",
      icon: Thermometer,
      guideline: "Simulates local weather extremes (deep freezes, heatwaves, heavy downpours) to test home resilience and auto-inject precautionary tasks.",
      detail: "Provides sandbox weather scenario dials that trigger immediate reactive safety protocols for plumbing insulation, drainage checks, and electrical grid preparation.",
      screenId: "screen-dashboard",
      category: "Risk & Safety"
    },
    {
      id: "interactive-floor-plan",
      title: "Interactive Floor Plan",
      icon: Layers,
      guideline: "Audit room health profiles, view spatial system maps, and toggle localized maintenance actions.",
      detail: "Interactive layout schematic mapping room temperature profiles, humidity levels, air-quality indexes, and plumbing shutoff points.",
      screenId: "screen-floorplan",
      category: "Core Diagnostics"
    },
    {
      id: "iot-telemetry-bridge",
      title: "IoT Telemetry Bridge",
      icon: Cpu,
      guideline: "Real-time bridge connecting smart thermostats, water leak sensors, and smoke alarms.",
      detail: "Establishes secure telemetry streams, reporting physical sensor variables directly to the core diagnostics engine.",
      screenId: "screen-dashboard",
      category: "Automation & Assistant"
    }
  ];

  const filteredFeatures = activeFilter === "All" 
    ? features 
    : features.filter(f => f.category === activeFilter);

  const handleToggle = (id: string, name: string) => {
    onToggleFeature(id);
    const currentlyActive = enabledFeatures[id];
    if (!currentlyActive) {
      addToast(
        "Module Enabled ⚡",
        `"${name}" has been successfully activated. You can now access all its integrated tools.`,
        "success"
      );
    } else {
      addToast(
        "Module Suspended",
        `"${name}" has been deactivated.`,
        "info"
      );
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0A0A0A] text-white font-sans relative">
      
      {/* Scrollable Content Container */}
      <div className="flex-grow overflow-y-auto px-5 pt-4 pb-20 scrollbar-none">
        
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">HomePulse Suite</span>
            <h2 className="text-xl font-extrabold tracking-tight text-white font-display">Modules Switchboard</h2>
          </div>
          <div className="p-2 bg-[#101820] border border-slate-800 rounded-xl">
            <Sliders className="w-4.5 h-4.5 text-blue-500 animate-pulse" />
          </div>
        </div>

        {/* Informative Pitch Card */}
        <div className="bg-[#101820] border border-slate-800/90 rounded-2xl p-4 shadow-lg mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full filter blur-[20px] pointer-events-none"></div>
          <div className="flex gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/15 h-fit">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-1">Centralized Capability Switchboard</h4>
              <p className="text-[10.5px] text-zinc-400 leading-relaxed">
                Activate or suspend specialized functional modules as needed. Toggle a button to start using any intelligence engine instantly on your dashboard or navigation.
              </p>
            </div>
          </div>
        </div>

        {/* Category Filters Carousel */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none">
          {(["All", "Core Diagnostics", "Automation & Assistant", "Risk & Safety", "Vault & History"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === cat 
                  ? "bg-blue-600/10 border-blue-500 text-blue-400 font-extrabold" 
                  : "bg-zinc-950 border-slate-900 text-zinc-400 hover:border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Features List */}
        <div className="space-y-3">
          {filteredFeatures.map((f) => {
            const isEnabled = !!enabledFeatures[f.id];
            const IconComponent = f.icon;
            const isSelected = selectedFeatureId === f.id;

            return (
              <div 
                key={f.id}
                className={`border rounded-2xl transition-all overflow-hidden ${
                  isEnabled 
                    ? "bg-[#101820] border-slate-800/80 hover:border-blue-500/30" 
                    : "bg-zinc-950/40 border-slate-900/60 hover:border-slate-800/50"
                }`}
              >
                {/* Main Header Row */}
                <div 
                  onClick={() => setSelectedFeatureId(isSelected ? null : f.id)}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className={`p-2.5 rounded-xl border flex-shrink-0 transition-all ${
                      isEnabled 
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/15" 
                        : "bg-zinc-900 text-zinc-500 border-slate-800/40"
                    }`}>
                      <IconComponent className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 text-left">
                      <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">{f.category}</span>
                      <h3 className="text-xs font-extrabold text-white leading-tight">{f.title}</h3>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    {/* Enable / Disable Button Action */}
                    <button
                      onClick={() => handleToggle(f.id, f.title)}
                      className={`text-[9.5px] font-extrabold px-3 py-1.5 rounded-xl border cursor-pointer transition-all ${
                        isEnabled
                          ? "bg-rose-500/10 border-rose-500/25 text-rose-400 hover:bg-rose-500/20"
                          : "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-900/10 hover:bg-blue-500"
                      }`}
                    >
                      {isEnabled ? (
                        <span className="flex items-center space-x-1 font-bold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Disable</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 font-bold">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Enable</span>
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isSelected && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-800/40 bg-black/20 text-left animate-fadeIn">
                    <div className="space-y-2 text-[10.5px]">
                      <div>
                        <span className="text-[8.5px] font-mono font-bold text-blue-400 uppercase tracking-wider block mb-0.5">Core Function</span>
                        <p className="text-zinc-300 leading-relaxed font-semibold">{f.guideline}</p>
                      </div>
                      <div>
                        <span className="text-[8.5px] font-mono font-bold text-amber-400 uppercase tracking-wider block mb-0.5">Telemetry Details</span>
                        <p className="text-zinc-400 leading-relaxed">{f.detail}</p>
                      </div>
                    </div>

                    {/* Start Using / Open Feature directly */}
                    {isEnabled && (
                      <div className="mt-3.5 pt-3.5 border-t border-slate-800/50 flex justify-end">
                        <button
                          onClick={() => onNavigateToScreen(f.screenId)}
                          className="flex items-center space-x-1 text-[10.5px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <span>Open Workspace</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Bottom Navigation */}
      <BottomNavBar activeTab="features" onNavigateToScreen={onNavigateToScreen} />

    </div>
  );
}
