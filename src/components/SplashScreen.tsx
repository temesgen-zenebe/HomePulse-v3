import React from "react";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

interface SplashScreenProps {
  onGetStarted: () => void;
}

export default function SplashScreen({ onGetStarted }: SplashScreenProps) {
  return (
    <div className="w-full h-full flex flex-col justify-between p-6 bg-gradient-to-b from-[#0A0A0A] via-[#101820] to-[#0A0A0A] relative text-white font-sans">
      
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#2563EB] rounded-full filter blur-[70px] opacity-15 pointer-events-none"></div>

      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mt-6">
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)] mb-4">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17h6" />
          </svg>
          <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#101820] animate-ping"></div>
          <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#101820]"></div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white font-display">HomePulse</h1>
        <p className="text-xs text-zinc-400 mt-1 max-w-[200px]">
          Your home’s health.<br />Always in your control.
        </p>
      </div>

      {/* Custom High-Fidelity SVG Modern House at Night */}
      <div className="relative w-full h-44 my-2 flex items-center justify-center">
        <div className="absolute inset-0 bg-blue-500/5 rounded-2xl border border-slate-800/60 overflow-hidden">
          {/* Star particles */}
          <div className="absolute top-4 left-6 w-1 h-1 bg-white rounded-full opacity-60"></div>
          <div className="absolute top-10 right-16 w-1 h-1 bg-white rounded-full opacity-40"></div>
          <div className="absolute top-6 right-8 w-1 h-1 bg-white rounded-full opacity-80 animate-pulse"></div>
          <div className="absolute top-14 left-20 w-1 h-1 bg-white rounded-full opacity-50"></div>
          <div className="absolute top-28 left-8 w-1 h-1 bg-white rounded-full opacity-30"></div>

          {/* Glowing Moon */}
          <div className="absolute top-4 right-6 w-8 h-8 bg-zinc-200 rounded-full filter blur-[1px] opacity-40 shadow-[0_0_10px_rgba(255,255,255,0.2)]"></div>

          {/* Luxury Modern House Vector Silhouette with CSS Lighting */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-32 flex items-end justify-center">
            {/* Background trees */}
            <div className="absolute bottom-0 left-2 w-10 h-16 bg-neutral-900 rounded-t-full opacity-40"></div>
            <div className="absolute bottom-0 right-2 w-12 h-20 bg-neutral-900 rounded-t-full opacity-40"></div>

            {/* Main House Chassis Left Wing */}
            <div className="absolute bottom-0 left-8 w-18 h-20 bg-[#101820] border-t border-r border-slate-700/80 rounded-tl-lg shadow-2xl z-10">
              {/* Floor 1 Glowing Glass Window */}
              <div className="absolute bottom-2 left-2 w-14 h-6 bg-amber-400/25 border border-amber-300/40 rounded shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center justify-center">
                <div className="w-0.5 h-full bg-amber-300/30"></div>
              </div>
              {/* Floor 2 Glowing Glass Window */}
              <div className="absolute top-2 left-2 w-14 h-6 bg-blue-400/20 border border-blue-300/40 rounded shadow-[0_0_15px_rgba(37,99,235,0.15)] flex items-center justify-center">
                <div className="w-0.5 h-full bg-blue-300/20"></div>
              </div>
            </div>

            {/* Main House Chassis Right Wing (Overlapping Cantilever) */}
            <div className="absolute bottom-0 right-6 w-20 h-24 bg-[#1E293B]/90 border-t border-l border-slate-600 rounded-tr-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] z-20">
              {/* Balcony Railing */}
              <div className="absolute top-10 left-1 w-18 h-3 border-t border-zinc-500 opacity-60"></div>
              
              {/* Big Upper Windows */}
              <div className="absolute top-3 left-3 w-14 h-6 bg-amber-400/30 border border-amber-300/50 rounded shadow-[0_0_20px_rgba(245,158,11,0.25)] flex justify-between px-2">
                <div className="w-0.5 h-full bg-amber-300/30"></div>
                <div className="w-0.5 h-full bg-amber-300/30"></div>
              </div>

              {/* Lower Entry Garage / Glass door */}
              <div className="absolute bottom-0 left-3 w-14 h-11 bg-zinc-900 border-t border-l border-r border-zinc-700 rounded-t flex items-end justify-center">
                <div className="w-10 h-10 bg-amber-400/10 border-t border-l border-r border-amber-300/30 rounded-t flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full shadow-[0_0_4px_rgba(234,179,8,1)] animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Warm uplight spotlight cones */}
            <div className="absolute bottom-0 left-4 w-6 h-12 bg-gradient-to-t from-yellow-500/20 to-transparent clip-path-cone pointer-events-none transform -rotate-12"></div>
            <div className="absolute bottom-0 right-1 w-8 h-16 bg-gradient-to-t from-yellow-500/15 to-transparent clip-path-cone pointer-events-none transform rotate-12"></div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mb-6 space-y-3">
        {/* Value badges */}
        <div className="flex items-center justify-center space-x-2 text-[10px] text-zinc-400 font-mono bg-[#101820] border border-slate-800/80 rounded-full py-1.5 px-3">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span>PREVENTIVE HEALTH ALGORITHM ACTIVE</span>
        </div>

        {/* Primary Action */}
        <button
          onClick={onGetStarted}
          className="w-full bg-[#2563EB] hover:bg-blue-600 active:scale-95 text-white font-medium text-xs py-3.5 px-4 rounded-xl shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all duration-200 flex items-center justify-center space-x-2 border border-blue-400/20"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Secondary Action */}
        <button
          onClick={onGetStarted}
          className="w-full bg-[#101820]/80 hover:bg-[#1E293B] text-zinc-300 hover:text-white font-medium text-xs py-3.5 px-4 rounded-xl border border-slate-800 hover:border-slate-700 active:scale-95 transition-all duration-200"
        >
          Sign In
        </button>
      </div>

    </div>
  );
}
