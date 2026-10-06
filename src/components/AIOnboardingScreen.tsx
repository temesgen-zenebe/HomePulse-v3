import React from "react";
import { Sparkles, Shield, Droplet, Zap, Wrench, RefreshCw, CheckCircle2 } from "lucide-react";

interface AIOnboardingScreenProps {
  propertyAddress: string;
  onProceedToDashboard: () => void;
}

export default function AIOnboardingScreen({ propertyAddress, onProceedToDashboard }: AIOnboardingScreenProps) {
  const [steps, setSteps] = React.useState([
    { label: "Analyzing systems", checked: true, delay: 600 },
    { label: "Checking climate data", checked: true, delay: 1400 },
    { label: "Building maintenance plan", checked: false, delay: 2200 },
    { label: "Calculating health score", checked: false, delay: 3200 }
  ]);

  const [scanState, setScanState] = React.useState<"idle" | "scanning" | "completed">("scanning");

  React.useEffect(() => {
    if (scanState !== "scanning") return;

    // Reset
    setSteps([
      { label: "Analyzing systems", checked: false, delay: 600 },
      { label: "Checking climate data", checked: false, delay: 1400 },
      { label: "Building maintenance plan", checked: false, delay: 2200 },
      { label: "Calculating health score", checked: false, delay: 3200 }
    ]);

    const timers = steps.map((s, idx) => {
      return setTimeout(() => {
        setSteps(prev => {
          const next = [...prev];
          next[idx] = { ...next[idx], checked: true };
          return next;
        });
        if (idx === steps.length - 1) {
          setScanState("completed");
        }
      }, s.delay);
    });

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [scanState]);

  const triggerRescan = () => {
    setScanState("scanning");
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 bg-[#0A0A0A] relative text-white font-sans">
      
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#2563EB]/5 rounded-full filter blur-[80px] pointer-events-none"></div>

      {/* Header & Progress */}
      <div>
        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mb-2">
          <span className="uppercase text-blue-400 font-semibold tracking-wide flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Property Analysis
          </span>
          <span>Step 4 of 5</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-5">
          <div className="h-full w-4/5 bg-[#2563EB] rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)] animate-pulse"></div>
        </div>

        <h2 className="text-lg font-bold tracking-tight text-white leading-snug font-display">
          Let’s build your<br />Home Health Plan.
        </h2>
        <p className="text-[10px] text-zinc-500 mt-1 truncate">
          Configuring for {propertyAddress || "Your Property"}
        </p>
      </div>

      {/* Center 3D Modern House vector with floating icons around it */}
      <div className="relative w-full h-56 flex items-center justify-center my-2">
        
        {/* Orbital Rings representing AI deep scan */}
        <div className={`absolute w-44 h-44 rounded-full border border-dashed border-blue-500/20 flex items-center justify-center ${scanState === "scanning" ? "animate-spin" : ""}`}>
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(37,99,235,1)]"></div>
          <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(37,99,235,1)]"></div>
        </div>

        <div className={`absolute w-36 h-36 rounded-full border border-blue-500/10 flex items-center justify-center ${scanState === "scanning" ? "animate-spin-reverse" : ""}`}>
          <div className="absolute left-0 top-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
          <div className="absolute right-0 top-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
        </div>

        {/* Core House Silhouette with scanner laser overlay */}
        <div className="relative w-28 h-28 bg-[#101820] border border-slate-700/80 rounded-2xl flex items-center justify-center shadow-xl z-20 group">
          
          {/* Glowing Smart House Vector inside */}
          <svg className="w-16 h-16 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>

          {/* Core scan sweep lines */}
          {scanState === "scanning" && (
            <div className="absolute inset-x-0 h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,1)] animate-scanner z-30"></div>
          )}

          {/* Tiny glowing window dots */}
          <div className="absolute bottom-5 left-10 w-2 h-2 bg-amber-400 rounded-sm shadow-[0_0_6px_rgba(245,158,11,1)] animate-pulse"></div>
          <div className="absolute bottom-5 right-10 w-2 h-2 bg-amber-400 rounded-sm shadow-[0_0_6px_rgba(245,158,11,1)] animate-pulse"></div>
        </div>

        {/* Floating System Badges around house */}
        <div className="absolute top-2 left-6 bg-[#101820] border border-slate-700/80 p-2 rounded-xl flex items-center justify-center shadow-lg hover:border-blue-500/50 transition-colors animate-float-slow z-20">
          <Wrench className="w-3.5 h-3.5 text-blue-400" />
        </div>

        <div className="absolute top-4 right-6 bg-[#101820] border border-slate-700/80 p-2 rounded-xl flex items-center justify-center shadow-lg hover:border-blue-500/50 transition-colors animate-float-medium z-20">
          <Droplet className="w-3.5 h-3.5 text-cyan-400" />
        </div>

        <div className="absolute bottom-4 left-4 bg-[#101820] border border-slate-700/80 p-2 rounded-xl flex items-center justify-center shadow-lg hover:border-blue-500/50 transition-colors animate-float-fast z-20">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
        </div>

        <div className="absolute bottom-6 right-6 bg-[#101820] border border-slate-700/80 p-2 rounded-xl flex items-center justify-center shadow-lg hover:border-blue-500/50 transition-colors animate-float-slow z-20">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
        </div>

      </div>

      {/* Checklist items below */}
      <div className="bg-[#101820] border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-white tracking-wide">
            {scanState === "scanning" ? "Analyzing Property Health..." : "Analysis Complete!"}
          </p>
          {scanState === "scanning" ? (
            <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          )}
        </div>

        <div className="space-y-2 pt-1 border-t border-slate-800/80 text-xs">
          {steps.map((st) => (
            <div key={st.label} className="flex items-center space-x-2.5">
              {st.checked ? (
                <span className="text-emerald-500 font-bold">✓</span>
              ) : (
                <span className="text-zinc-600 font-mono">○</span>
              )}
              <span className={st.checked ? "text-zinc-300" : "text-zinc-500"}>
                {st.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Onboarding Bottom Controls */}
      <div className="mb-4">
        {scanState === "completed" ? (
          <button
            onClick={onProceedToDashboard}
            className="w-full bg-[#2563EB] hover:bg-blue-600 active:scale-95 text-white font-semibold text-xs py-3 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all duration-200"
          >
            Reveal My Health Score
          </button>
        ) : (
          <button
            disabled
            className="w-full bg-slate-900 text-zinc-600 border border-slate-800 font-semibold text-xs py-3 rounded-xl cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-3 h-3 animate-spin text-zinc-600" />
            <span>Analyzing home systems...</span>
          </button>
        )}

        {/* Rescan utility */}
        {scanState === "completed" && (
          <button
            onClick={triggerRescan}
            className="w-full mt-2 text-zinc-500 hover:text-zinc-300 text-[10px] font-mono flex items-center justify-center gap-1"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            <span>Re-run Diagnostic Scan</span>
          </button>
        )}
      </div>

    </div>
  );
}
