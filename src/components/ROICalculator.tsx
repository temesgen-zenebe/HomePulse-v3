import React from "react";
import { 
  DollarSign, 
  TrendingUp, 
  Sliders, 
  Calendar, 
  ShieldCheck, 
  ChevronLeft, 
  HelpCircle, 
  ArrowUpRight, 
  Award, 
  Flame, 
  Zap, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { MaintenanceTask, HomeSystem } from "../types";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { motion } from "motion/react";

interface ROICalculatorProps {
  tasks: MaintenanceTask[];
  systems: HomeSystem[];
  onToggleTask: (taskId: string) => void;
  onNavigateToScreen: (screenId: string) => void;
}

export default function ROICalculator({ 
  tasks, 
  systems, 
  onToggleTask, 
  onNavigateToScreen 
}: ROICalculatorProps) {
  // 1. Projection settings state
  const [projectionYears, setProjectionYears] = React.useState<number>(10);
  
  // Calculate current actual completion percentage
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const actualDiligence = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 75;

  // Diligence slider state (defaults to actual current completion)
  const [diligenceLevel, setDiligenceLevel] = React.useState<number>(actualDiligence);

  // Synchronize slider with live data updates
  React.useEffect(() => {
    setDiligenceLevel(actualDiligence);
  }, [actualDiligence]);

  // Support custom tooltip for the charts
  const CustomProjectionTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111625]/95 border border-slate-800 p-3 rounded-xl text-xs font-sans shadow-2xl">
          <p className="font-bold text-zinc-400 mb-1.5 font-mono text-[10px] uppercase">Year {payload[0].payload.year} Projection</p>
          <div className="space-y-1">
            <p className="text-emerald-400 font-bold flex items-center justify-between gap-6">
              <span>Optimized Savings:</span>
              <span>${Math.round(payload[0].value).toLocaleString()}</span>
            </p>
            <p className="text-red-400 font-medium flex items-center justify-between gap-6">
              <span>Deferred Risk Cost:</span>
              <span>${Math.round(payload[1].value).toLocaleString()}</span>
            </p>
            <div className="border-t border-slate-800/80 mt-1.5 pt-1.5 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span>Net Care Advantage:</span>
              <span className="text-white font-bold">+${Math.round(payload[0].value + payload[1].value).toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // 2. Dynamic Calculation Engine
  // Let's model financial parameters:
  // - Annual Utility Baseline Cost: $2,150 (derived from average family utility load)
  // - Major system breakdown risks over a 10 year span with deferred maintenance:
  //   - HVAC failure risk (compressor, fan motor): $4,800
  //   - Plumbing failure risk (sewer backup, leak damage): $3,200
  //   - Structural failure risk (siding water entry, gutter rot): $5,500
  // - Lifespan of mechanicals: HVAC is 15 years with care, 10 years without care.
  // - Replacing major mechanical systems: HVAC is $12,000, Water Heater is $2,200.
  
  // Calculate savings multipliers based on user selected diligence (0 to 100)
  const multiplier = diligenceLevel / 100;

  // Annual components:
  const annualEnergySavings = 380 * multiplier; // max $380/yr at 100% diligence
  const annualWaterSavings = 140 * multiplier;  // max $140/yr
  const annualBreakdownAvoidance = 620 * multiplier; // max $620/yr in avoided emergency service calls
  const annualLifespanExtension = 450 * multiplier; // extended equipment duration, saving replacement amortization
  
  const totalAnnualSavings = annualEnergySavings + annualWaterSavings + annualBreakdownAvoidance + annualLifespanExtension;

  // Deferred maintenance costs / compound risks:
  // Neglecting home leads to accelerated wear and catastrophic failures:
  const deferredAnnualPenalty = 420 * (1 - multiplier); // added friction, scaling energy leaks
  const cumulativeFailureRisks = [
    { year: 1, cost: 0 },
    { year: 2, cost: 350 }, // clean drain neglected leads to small leak
    { year: 3, cost: 800 }, // HVAC condenser motor burnout
    { year: 4, cost: 1200 }, // basement backup
    { year: 5, cost: 2800 }, // mold or window casing seal rot
    { year: 6, cost: 3200 }, // premature HVAC replacement strain
    { year: 7, cost: 4100 },
    { year: 8, cost: 5800 },
    { year: 9, cost: 6900 },
    { year: 10, cost: 8200 },
    { year: 11, cost: 9500 },
    { year: 12, cost: 11200 },
    { year: 13, cost: 12500 },
    { year: 14, cost: 14200 },
    { year: 15, cost: 16800 },
    { year: 16, cost: 18200 },
    { year: 17, cost: 20400 },
    { year: 18, cost: 22800 },
    { year: 19, cost: 24500 },
    { year: 20, cost: 27500 },
  ];

  // Generate dynamic chart data based on years selection
  const chartData = Array.from({ length: projectionYears }, (_, i) => {
    const year = i + 1;
    // Cumulative optimized savings
    const cumSavings = totalAnnualSavings * year;
    // Cumulative deferred care risks/losses
    const riskPenaltyYearly = deferredAnnualPenalty * year;
    const baseRiskCost = cumulativeFailureRisks.find(r => r.year === year)?.cost || (year * 1300);
    const cumDeferredRisk = (baseRiskCost + riskPenaltyYearly) * (1 - multiplier * 0.7);

    return {
      year,
      savings: Math.round(cumSavings),
      losses: Math.round(cumDeferredRisk),
      advantage: Math.round(cumSavings + cumDeferredRisk)
    };
  });

  // Calculate current projection totals
  const totalProjectedSavings = totalAnnualSavings * projectionYears;
  const currentRiskPenalty = deferredAnnualPenalty * projectionYears;
  const baseRiskCostFinal = cumulativeFailureRisks.find(r => r.year === projectionYears)?.cost || (projectionYears * 1300);
  const totalDeferredLoss = (baseRiskCostFinal + currentRiskPenalty) * (1 - multiplier * 0.7);
  const netFinancialAdvantage = totalProjectedSavings + totalDeferredLoss;

  // Pending high-impact tasks
  const pendingHighRoiTasks = tasks
    .filter(t => !t.completed)
    .slice(0, 3);

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0A0A0A] text-white font-sans relative">
      
      {/* Background glow ambiance */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-emerald-600 rounded-full filter blur-[100px] opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-600 rounded-full filter blur-[100px] opacity-10 pointer-events-none"></div>

      {/* Header Area */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-24 scrollbar-none">
        
        {/* Navigation back and Title */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => onNavigateToScreen("screen-dashboard")}
            className="flex items-center space-x-1.5 text-xs text-blue-400 hover:text-blue-300 font-mono cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          
          <div className="flex items-center space-x-1.5 text-[10px] font-mono text-zinc-500 uppercase">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Savings Simulator</span>
          </div>
        </div>

        <div className="mb-4 text-left">
          <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">Savings Estimator</span>
          <h2 className="text-xl font-extrabold tracking-tight text-white font-display">Long-Term Savings</h2>
          <p className="text-[10px] text-zinc-400 mt-0.5">See how much money you can save by taking care of your home early</p>
        </div>

        {/* Dynamic Financial Overview Panel */}
        <div className="bg-[#111A24]/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl relative overflow-hidden mb-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full filter blur-xl pointer-events-none"></div>
          
          <span className="text-[8px] font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">Total Saved Through Care</span>
          
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[10px] text-zinc-500">Total Projected Savings</p>
              <h3 className="text-3xl font-extrabold text-white tracking-tight font-display mt-0.5">
                ${Math.round(netFinancialAdvantage).toLocaleString()}
              </h3>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1 text-right">
              <span className="text-[8px] font-mono text-zinc-400 block uppercase">Estimated Gain</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                +{Math.round((netFinancialAdvantage / (projectionYears * 120 + 1)) * 100)}%
              </span>
            </div>
          </div>

          {/* Grid of details */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-slate-800/60 text-left">
            <div>
              <span className="text-[9px] text-zinc-500 flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" /> Utility & Energy Savings
              </span>
              <p className="text-sm font-bold font-mono text-emerald-300 mt-0.5">
                +${Math.round(totalProjectedSavings).toLocaleString()}
              </p>
              <span className="text-[8px] text-zinc-500 block">Avoided utility & bill waste</span>
            </div>
            <div>
              <span className="text-[9px] text-zinc-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-red-400" /> Prevented Repairs
              </span>
              <p className="text-sm font-bold font-mono text-zinc-300 mt-0.5">
                +${Math.round(totalDeferredLoss).toLocaleString()}
              </p>
              <span className="text-[8px] text-zinc-500 block">Avoided emergency repairs</span>
            </div>
          </div>
        </div>

        {/* Dynamic Model Configuration Sliders */}
        <div className="bg-[#101820] border border-slate-800/80 rounded-2xl p-4 shadow-md text-left mb-5">
          <div className="flex items-center space-x-2 mb-4">
            <Sliders className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-white tracking-wider uppercase font-mono">Choose Your Care Level</h3>
          </div>

          <div className="space-y-4">
            {/* Diligence Level Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                  How Proactive Are You?
                  <span className="text-[8px] px-1.5 py-0.2 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono rounded">
                    {diligenceLevel === actualDiligence ? "Actual" : "Simulated"}
                  </span>
                </span>
                <span className="font-bold font-mono text-blue-400">{diligenceLevel}%</span>
              </div>
              <input 
                type="range"
                min={0}
                max={100}
                value={diligenceLevel}
                onChange={(e) => setDiligenceLevel(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-0"
              />
              <div className="flex items-center justify-between text-[8.5px] text-zinc-500 font-mono mt-1">
                <span>0% Care (Neglected)</span>
                <span>Current: {actualDiligence}%</span>
                <span>100% Care (Fully Proactive)</span>
              </div>
            </div>

            {/* Projection Period Buttons */}
            <div>
              <label className="text-zinc-300 text-xs font-medium block mb-2">
                How Many Years to Project?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 5, 10, 20].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setProjectionYears(yr)}
                    className={`py-1.5 px-2.5 rounded-xl text-[10px] font-bold font-mono transition-all cursor-pointer border ${
                      projectionYears === yr 
                        ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/10" 
                        : "bg-black/40 border-slate-800 hover:border-slate-700 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {yr} {yr === 1 ? "Year" : "Years"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Projected Value Area Chart Card */}
        <div className="bg-[#101820] border border-slate-800/80 rounded-2xl p-4 shadow-md text-left mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Projected Savings Curves</h3>
              <p className="text-[9px] text-zinc-500">Money saved with care vs. potential emergency repairs if neglected</p>
            </div>
            
            <div className="text-right text-[8.5px] font-mono text-zinc-400 flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded border border-slate-800">
              <Calendar className="w-3 h-3 text-blue-400" />
              <span>{projectionYears}-Year Horizon</span>
            </div>
          </div>

          {/* Area Chart visualization */}
          <div className="h-36 w-full select-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLosses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} opacity={0.3} />
                <XAxis 
                  dataKey="year" 
                  stroke="#475569" 
                  fontSize={8} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `Yr ${val}`}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={8} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip content={<CustomProjectionTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="savings" 
                  stroke="#10B981" 
                  strokeWidth={1.5}
                  fillOpacity={1} 
                  fill="url(#colorSavings)" 
                  name="Savings with Care"
                />
                <Area 
                  type="monotone" 
                  dataKey="losses" 
                  stroke="#EF4444" 
                  strokeWidth={1.5}
                  fillOpacity={1} 
                  fill="url(#colorLosses)" 
                  name="Risk Costs if Neglected"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legend details */}
          <div className="flex items-center justify-center gap-4 mt-3 text-[9px] font-mono text-zinc-500 border-t border-slate-900/30 pt-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1.5 rounded bg-emerald-500"></span>
              <span>Savings with Care</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1.5 rounded bg-red-500"></span>
              <span>Risk Costs if Neglected</span>
            </div>
          </div>
        </div>

        {/* High ROI Action Items Recommendations */}
        <div className="text-left mb-6">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-3">Important Maintenance Tasks</h3>
          
          {pendingHighRoiTasks.length === 0 ? (
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
              <Award className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">All Tasks Completed!</h4>
                <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                  All major scheduled maintenance procedures are current. Your home is operating at peak efficiency.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingHighRoiTasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => onToggleTask(task.id)}
                  className="p-3 bg-[#101820]/75 border border-slate-800 rounded-xl hover:border-slate-700 hover:bg-[#101820] transition-all cursor-pointer flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start space-x-2.5 min-w-0">
                    <div className="w-4.5 h-4.5 rounded-full border border-slate-700 group-hover:border-blue-400 transition-colors flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500/0 group-hover:bg-blue-500/40 transition-colors"></div>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[10.5px] font-bold text-white leading-tight truncate group-hover:text-blue-400 transition-colors">
                        {task.title}
                      </h4>
                      <p className="text-[9px] text-zinc-400 mt-1 leading-normal">
                        {task.why}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[9px] font-bold font-mono text-emerald-400 uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10 block">
                      Big Savings
                    </span>
                    <span className="text-[8px] font-mono text-zinc-500 block mt-1">Due: {task.due}</span>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => onNavigateToScreen("screen-calendar")}
                className="w-full text-center py-2 text-[10px] text-blue-400 hover:text-blue-300 font-bold border border-dashed border-slate-800/80 hover:border-slate-700 rounded-xl transition-all block mt-1 cursor-pointer"
              >
                Go to Tasks & Calendar View ↗
              </button>
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
