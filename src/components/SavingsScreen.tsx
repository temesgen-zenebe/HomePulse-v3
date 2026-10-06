import React from "react";
import { TrendingUp, ShieldCheck, ChevronRight, DollarSign, PlusCircle, Award, Leaf } from "lucide-react";
import { SavingsItem } from "../types";

interface SavingsScreenProps {
  savings: SavingsItem[];
  onAddSavings: (item: SavingsItem) => void;
  onNavigateToScreen: (screenId: string) => void;
}

export default function SavingsScreen({ savings, onAddSavings, onNavigateToScreen }: SavingsScreenProps) {
  // Calculate dynamic sum
  const totalSavings = savings.reduce((sum, item) => sum + item.amount, 0);

  const handleSimulateNewAction = () => {
    const savingsPool = [
      { category: "Plumbing", amount: 180, description: "Cleared main line sewer roots before drain backup flooded basement washroom." },
      { category: "HVAC", amount: 220, description: "Corrected restricted outdoor condenser fan flow, preventing motor coil burn-out." },
      { category: "Safety", amount: 120, description: "Detected slow CO leak during automated alarm diagnostics audit." },
      { category: "Structure", amount: 310, description: "Anchored foundation weep hole flow vents before rainstorm soil saturation." }
    ];

    const item = savingsPool[Math.floor(Math.random() * savingsPool.length)];
    onAddSavings({
      id: `save_${Date.now()}`,
      category: item.category,
      amount: item.amount,
      description: item.description
    });
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0A0A0A] text-white font-sans relative">
      
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-24 scrollbar-none">
        
        {/* Header */}
        <div className="mb-4">
          <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Home Care Savings</span>
          <h2 className="text-xl font-extrabold tracking-tight text-white font-display">My Savings</h2>
          <p className="text-[10px] text-zinc-400 mt-0.5">Preventive cost savings calculated live</p>
        </div>

        {/* Primary Savings Card (Green) */}
        <div className="bg-[#0D241C] border border-emerald-500/20 rounded-2xl p-5 shadow-[0_0_15px_rgba(34,197,94,0.08)] mb-5 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-[35px] pointer-events-none"></div>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                <Leaf className="w-4 h-4 animate-pulse" />
              </div>
              <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest">Year-to-Date Net Savings</span>
            </div>
            
            <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/10 uppercase tracking-widest">
              Live Tally
            </span>
          </div>

          <p className="text-[10px] text-zinc-400 font-sans">Money Saved This Year</p>
          <div className="flex items-baseline space-x-1.5 mt-1.5">
            <h3 className="text-3xl font-extrabold tracking-tight text-white font-display">
              ${totalSavings.toLocaleString()}
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-bold">YTD</span>
          </div>

          <p className="text-[9.5px] text-zinc-400 mt-3 leading-relaxed border-t border-emerald-500/10 pt-2.5">
            Based on average local diagnostic service call, repair, and parts costs avoided.
          </p>
        </div>

        {/* Savings Projection Banner */}
        <div 
          onClick={() => onNavigateToScreen("screen-roi-calculator")}
          className="mb-5 p-4 rounded-2xl bg-[#111A24]/60 border border-blue-500/25 hover:border-blue-500/40 cursor-pointer transition-all shadow-lg flex items-center justify-between group text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4 text-blue-400 animate-pulse" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-white group-hover:text-blue-400 transition-colors">See Your 10-Year Savings Projection</p>
              <p className="text-[9px] text-zinc-400 mt-0.5 leading-normal">Find out how much money you can save with proactive home care and better energy efficiency</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Savings Breakdown section */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Savings Breakdown</h4>
            <button
              onClick={handleSimulateNewAction}
              className="text-[9.5px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Preventive Action</span>
            </button>
          </div>

          {/* Breakdown Items List */}
          <div className="space-y-2.5">
            {savings.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-[#101820] border border-slate-800/80 rounded-xl hover:border-slate-700 transition-colors shadow-md group flex items-start justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-1.5 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span className="text-[9.5px] text-zinc-500">• Avoided failure</span>
                  </div>
                  <p className="text-[10px] text-zinc-300 mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-xs font-bold font-mono text-emerald-400">
                    +${item.amount}
                  </span>
                  <span className="text-[8px] text-zinc-600 font-mono mt-0.5">SAVED</span>
                </div>
              </div>
            ))}
          </div>
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
