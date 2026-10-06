import React from "react";
import { 
  TrendingUp, 
  ChevronLeft, 
  Sparkles, 
  ShieldAlert, 
  Clock, 
  Calendar, 
  Wrench, 
  Thermometer, 
  Zap, 
  Droplets, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Compass
} from "lucide-react";
import { HomeSystem, MaintenanceTask } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from "recharts";

interface PredictiveInsightsProps {
  systems: HomeSystem[];
  tasks: MaintenanceTask[];
  onNavigateToScreen: (screenId: string) => void;
  onUpdateSystemHealth: (systemId: string, healthChange: number) => void;
  onAddTask: (task: MaintenanceTask) => void;
}

// Typical system lifespans and estimated costs for calculation & education
const LIFE_DATA_MAPPING: Record<string, {
  fullLifespanYears: number;
  estReplacementCost: number;
  preventativeMitigationCost: number;
  degradationRatePerYear: number; // base percent health loss per year
}> = {
  // Roof / Structure
  sys_1: { fullLifespanYears: 25, estReplacementCost: 12500, preventativeMitigationCost: 450, degradationRatePerYear: 4.5 },
  // HVAC
  sys_2: { fullLifespanYears: 15, estReplacementCost: 8500, preventativeMitigationCost: 180, degradationRatePerYear: 6.8 },
  // Plumbing
  sys_3: { fullLifespanYears: 20, estReplacementCost: 6000, preventativeMitigationCost: 220, degradationRatePerYear: 5.0 },
  // Electrical
  sys_4: { fullLifespanYears: 40, estReplacementCost: 4500, preventativeMitigationCost: 300, degradationRatePerYear: 2.5 },
  // Water Heater / HVAC (Basement Mechanical)
  sys_5: { fullLifespanYears: 12, estReplacementCost: 2200, preventativeMitigationCost: 150, degradationRatePerYear: 8.5 },
  // Major Appliances
  sys_6: { fullLifespanYears: 10, estReplacementCost: 3500, preventativeMitigationCost: 120, degradationRatePerYear: 10.0 },
  // Safety Detectors
  sys_7: { fullLifespanYears: 7, estReplacementCost: 350, preventativeMitigationCost: 40, degradationRatePerYear: 14.2 },
  // Landscaping & Exterior Envelope
  sys_8: { fullLifespanYears: 15, estReplacementCost: 5000, preventativeMitigationCost: 350, degradationRatePerYear: 6.0 }
};

export default function PredictiveInsights({
  systems,
  tasks,
  onNavigateToScreen,
  onUpdateSystemHealth,
  onAddTask
}: PredictiveInsightsProps) {
  const [selectedSystemId, setSelectedSystemId] = React.useState<string>("sys_2"); // HVAC is default
  // Environmental Stress Level: accelerates degradation rates
  const [stressMultiplier, setStressMultiplier] = React.useState<number>(1.0);
  const [stressName, setStressName] = React.useState<"Nominal" | "Elevated Heat" | "Severe Freeze" | "Heavy Usage">("Nominal");

  // Dynamic success notice
  const [localNotif, setLocalNotif] = React.useState<string | null>(null);

  const showNotif = (msg: string) => {
    setLocalNotif(msg);
    setTimeout(() => setLocalNotif(null), 3500);
  };

  const selectedSystem = systems.find(s => s.id === selectedSystemId) || systems[0] || {
    id: "sys_2",
    name: "Central HVAC Heat Pump",
    health: 85,
    status: "Good",
    category: "Mechanical",
    lastInspected: "Oct 12, 2024",
    details: "Compressor run frequency normal"
  };

  const costInfo = LIFE_DATA_MAPPING[selectedSystem.id] || {
    fullLifespanYears: 15,
    estReplacementCost: 6000,
    preventativeMitigationCost: 200,
    degradationRatePerYear: 6.5
  };

  // Base computations
  // Acceleration based on stress multiplier:
  const activeDegradationRate = costInfo.degradationRatePerYear * stressMultiplier;
  
  // Calculate potential failure date:
  // Let's assume a system is deemed 'Critical' or 'Failed' when health reaches 40% or below.
  const healthToLoseBeforeFailure = Math.max(0, selectedSystem.health - 40);
  const yearsUntilFailure = activeDegradationRate > 0 
    ? parseFloat((healthToLoseBeforeFailure / activeDegradationRate).toFixed(1))
    : 10;

  // Compute a projected date based on current time (July 2026)
  const getProjectedFailureDate = (years: number) => {
    const totalMonths = Math.round(years * 12);
    const date = new Date(2026, 6, 3); // Start at current time metadata: July 3, 2026
    date.setMonth(date.getMonth() + totalMonths);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const projectedFailureDateString = yearsUntilFailure <= 0 
    ? "Immediate Service Required" 
    : getProjectedFailureDate(yearsUntilFailure);

  // Generate 12-month future health trend values for charting
  const generateTrendData = () => {
    const data = [];
    let currentTempHealth = selectedSystem.health;
    
    // We chart the next 24 months, in steps of 2 months
    for (let month = 0; month <= 24; month += 2) {
      const yearFraction = month / 12;
      const healthLoss = activeDegradationRate * yearFraction;
      const projectedHealth = Math.max(0, Math.round(selectedSystem.health - healthLoss));
      
      data.push({
        month: `M+${month}`,
        label: month === 0 ? "Current" : `${month} mos`,
        "System Health": projectedHealth,
        "Critical Threshold": 40
      });
    }
    return data;
  };

  const chartData = generateTrendData();

  // Handle Simulate Maintenance Service
  const handleSimulateMaintenance = () => {
    // Boost health by 15%
    onUpdateSystemHealth(selectedSystem.id, 15);
    
    // Create an audit task representing the completed maintenance
    const newTask: MaintenanceTask = {
      id: `task_prev_${selectedSystem.id}_${Date.now()}`,
      title: `Preventative Maintenance Recalibration: ${selectedSystem.name}`,
      due: "Completed Today",
      priority: "Medium",
      why: "Triggered proactively via Predictive Lifespan Simulator dashboard.",
      how: `Service and tune-up performed to reverse natural physical wear. Gaskets lubricated, heat exchangers vacuumed, electrical contacts cleaned.`,
      who: "Certified System Specialist",
      where: selectedSystem.name,
      completed: true,
      completedAt: new Date().toLocaleDateString("en-US")
    };

    onAddTask(newTask);
    showNotif(`Success! Dynamic tune-up simulated. ${selectedSystem.name} health boosted by 15% and lifecycle extended!`);
  };

  // Stress presets
  const applyStressPreset = (multiplier: number, name: typeof stressName) => {
    setStressMultiplier(multiplier);
    setStressName(name);
    showNotif(`Environmental model set to "${name}" (x${multiplier} wear factor).`);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0A0A0A] text-white font-sans relative">
      {/* Background Neon Accent Glows */}
      <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-indigo-500 rounded-full filter blur-[110px] opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-1/3 left-1/3 w-32 h-32 bg-rose-500 rounded-full filter blur-[110px] opacity-10 pointer-events-none"></div>

      {/* Primary Scroll Container */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-24 scrollbar-none">
        
        {/* Navigation back header */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => onNavigateToScreen("screen-dashboard")}
            className="flex items-center space-x-1.5 text-xs text-blue-400 hover:text-blue-300 font-mono cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          
          <div className="flex items-center space-x-1.5 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Predictive Engine</span>
          </div>
        </div>

        {/* Local success notice banner */}
        <AnimatePresence>
          {localNotif && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-4 p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/25 text-indigo-300 text-[10.5px] leading-relaxed text-left flex items-start gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <span>{localNotif}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Core Screen Title */}
        <div className="mb-5 text-left">
          <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">Lifespan AI Forecasting</span>
          <h2 className="text-xl font-extrabold tracking-tight text-white font-display">Predictive Health Insights</h2>
          <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
            Modeling natural thermodynamic degradation, environmental stressors, and preventative maintenance yields.
          </p>
        </div>

        {/* Selected System Selector (Horizontal Carousel) */}
        <div className="mb-4">
          <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-widest block text-left mb-2">
            Select Node for Lifecycle Forecasting
          </span>
          
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {systems.map((sys) => {
              const isSelected = sys.id === selectedSystemId;
              return (
                <button
                  key={sys.id}
                  onClick={() => setSelectedSystemId(sys.id)}
                  className={`py-1.5 px-3 rounded-full text-[10px] font-mono font-bold border whitespace-nowrap transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-indigo-600/15 border-indigo-500 text-indigo-400" 
                      : "bg-black/45 border-slate-900/90 hover:border-slate-850 text-zinc-400 hover:text-white"
                  }`}
                >
                  {sys.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Diagnostic Forecast Card Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Current Health status card */}
          <div className="bg-[#101820]/75 border border-slate-800/80 rounded-2xl p-4 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full filter blur-lg pointer-events-none"></div>
            <span className="text-[8px] font-mono text-zinc-500 uppercase block mb-1">Current Health Meter</span>
            <span className={`text-2xl font-extrabold tracking-tight block ${
              selectedSystem.health >= 90 ? "text-emerald-400" : selectedSystem.health >= 75 ? "text-cyan-400" : selectedSystem.health >= 60 ? "text-amber-400" : "text-red-400"
            }`}>
              {selectedSystem.health}%
            </span>
            <span className="text-[9px] font-mono text-zinc-400 mt-1 block">Status: {selectedSystem.status}</span>
          </div>

          {/* Predicted Failure Date Card */}
          <div className="bg-[#101820]/75 border border-slate-800/80 rounded-2xl p-4 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full filter blur-lg pointer-events-none"></div>
            <span className="text-[8px] font-mono text-zinc-500 uppercase block mb-1">Estimated Failure Risk</span>
            <span className="text-sm font-extrabold text-rose-400 tracking-tight block truncate mt-1">
              {projectedFailureDateString}
            </span>
            <span className="text-[8.5px] font-mono text-zinc-400 block mt-1.5">
              {yearsUntilFailure <= 0 ? "Failure threshold reached" : `~${yearsUntilFailure} years remaining`}
            </span>
          </div>
        </div>

        {/* Environmental Stress Chamber Simulator controls */}
        <div className="bg-[#101820]/60 border border-slate-800/80 rounded-2xl p-4 mb-5 text-left">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span className="text-[9.5px] font-mono font-bold text-zinc-300 uppercase tracking-wider">
                Stress Chamber Simulator
              </span>
            </div>
            <span className="text-[9.5px] font-mono text-indigo-400 font-bold uppercase bg-indigo-500/10 px-1.5 py-0.1 rounded border border-indigo-500/10">
              Wear Coeff: x{stressMultiplier.toFixed(1)}
            </span>
          </div>

          <p className="text-[9.5px] text-zinc-400 leading-normal mb-3.5">
            Evaluate how varying local climate conditions and mechanical load stress affect physical erosion speeds.
          </p>

          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { label: "Nominal", rate: 1.0, activeName: "Nominal" },
              { label: "Extreme Heat", rate: 1.5, activeName: "Elevated Heat" },
              { label: "Severe Freeze", rate: 1.8, activeName: "Severe Freeze" },
              { label: "Heavy Load", rate: 1.4, activeName: "Heavy Usage" }
            ].map((p) => {
              const isActive = stressName === p.activeName;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyStressPreset(p.rate, p.activeName as any)}
                  className={`py-2 px-1 rounded-xl text-[9px] font-mono font-bold border transition-all cursor-pointer ${
                    isActive 
                      ? "bg-indigo-600/15 border-indigo-500 text-indigo-400" 
                      : "bg-black/35 border-slate-900 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 text-[8px] font-mono text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            <span>Simulated Wear Rate: {(activeDegradationRate).toFixed(1)}% health erosion annually.</span>
          </div>
        </div>

        {/* Interactive Lifespan Degradation Recharts Forecast Curve */}
        <div className="bg-[#101820]/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl mb-5 text-left">
          
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-widest block">24-Month Degradation Curve</span>
              <h4 className="text-xs font-bold text-white tracking-wide mt-0.5">{selectedSystem.name} Health Forecast</h4>
            </div>
            
            <span className="text-[8px] font-mono text-zinc-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-900 uppercase">
              Projections Model v1
            </span>
          </div>

          <div className="w-full h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#161e29" />
                <XAxis 
                  dataKey="label" 
                  stroke="#4b5563" 
                  fontSize={8.5}
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#4b5563" 
                  fontSize={8.5}
                  domain={[0, 100]}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#101820", border: "1px solid #1e293b", borderRadius: "12px" }}
                  labelStyle={{ fontSize: "9px", fontFamily: "monospace", color: "#94a3b8" }}
                  itemStyle={{ fontSize: "10px", color: "#fff" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="System Health" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorHealth)" 
                />
                <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Critical Threshold', fill: '#f87171', fontSize: 8, position: 'top' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[9px] text-zinc-500 text-center mt-2 leading-relaxed">
            *Forecast models physical erosion based on continuous load. Proactive intervention restores the decay rate.
          </p>
        </div>

        {/* Preventative Action vs Emergency Liability Breakdown */}
        <div className="bg-[#101820]/75 border border-slate-800/80 rounded-2xl p-4 mb-5 text-left relative overflow-hidden">
          
          <h4 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-zinc-500" />
            Financial Liability Arbitrage
          </h4>

          <div className="grid grid-cols-2 gap-4 mb-4 border-b border-slate-900 pb-3.5">
            <div>
              <span className="text-[8.5px] font-mono text-zinc-500 uppercase block">Emergency Replacement</span>
              <span className="text-base font-extrabold text-red-400 mt-0.5 block font-mono">
                ${costInfo.estReplacementCost.toLocaleString()}
              </span>
              <p className="text-[8.5px] text-zinc-400 leading-normal mt-1">
                Typical cost after complete physical core failure. Often requires expediting fees and repair contractor markup.
              </p>
            </div>
            
            <div>
              <span className="text-[8.5px] font-mono text-zinc-500 uppercase block">Preventative Action</span>
              <span className="text-base font-extrabold text-emerald-400 mt-0.5 block font-mono">
                ${costInfo.preventativeMitigationCost.toLocaleString()}
              </span>
              <p className="text-[8.5px] text-zinc-400 leading-normal mt-1">
                Average cost of cleanings, fluid flushes, filter refreshes, and thermal tuning to prevent sudden failure.
              </p>
            </div>
          </div>

          <div className="bg-emerald-950/15 border border-emerald-500/15 p-3 rounded-xl flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-white">Save ${(costInfo.estReplacementCost - costInfo.preventativeMitigationCost).toLocaleString()} in Liabilities</p>
              <p className="text-[8.5px] text-emerald-300/80 mt-0.5 leading-normal">
                By investing in a preventative tune-up today, you defer thousands in emergency capital expenditure, growing real net asset equity value.
              </p>
            </div>
          </div>
        </div>

        {/* Proactive Action Control Panel */}
        <div className="bg-gradient-to-r from-indigo-950/20 to-[#101820]/90 border border-indigo-500/20 rounded-2xl p-4 text-left shadow-xl">
          <div className="flex items-center space-x-2 mb-2">
            <Wrench className="w-4.5 h-4.5 text-indigo-400" />
            <h4 className="text-xs font-bold text-white">Perform Proactive Maintenance</h4>
          </div>
          <p className="text-[9.5px] text-zinc-400 leading-relaxed mb-3.5">
            Simulate an immediate preventative service tune-up right now. This will boost current telemetry health and delay the estimated failure risk window significantly.
          </p>

          <button
            onClick={handleSimulateMaintenance}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-[10.5px] rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer hover:scale-[1.01] shadow-lg shadow-indigo-950/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
            <span>Simulate Preventative Tune-Up (+15% Health)</span>
          </button>
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
