import React from "react";
import { LogOut, ArrowLeft, RefreshCw, KeyRound, ShieldAlert } from "lucide-react";

interface LogoutScreenProps {
  onNavigateToScreen: (screenId: string) => void;
  onClearSession: () => void;
}

export default function LogoutScreen({ onNavigateToScreen, onClearSession }: LogoutScreenProps) {
  // Clear any persistent state or demo session details on load
  React.useEffect(() => {
    onClearSession();
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 bg-gradient-to-b from-[#070B13] via-[#0A0E1A] to-[#03060C] relative text-white font-sans text-center">
      
      {/* Glow Ambience */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-40 h-40 bg-zinc-700 rounded-full filter blur-[60px] opacity-10 pointer-events-none"></div>

      {/* Top spacer */}
      <div></div>

      {/* Logout Main Graphic & Text */}
      <div className="my-auto space-y-6 flex flex-col items-center">
        <div className="relative w-16 h-16 rounded-2xl bg-zinc-900 border border-slate-800 flex items-center justify-center shadow-lg">
          <LogOut className="w-8 h-8 text-zinc-400" />
          <div className="absolute -top-1 -right-1 p-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
            <ShieldAlert className="w-3 h-3" />
          </div>
        </div>

        <div className="space-y-2 max-w-[280px]">
          <h2 className="text-lg font-bold text-white tracking-tight font-display">Successfully Signed Out</h2>
          <p className="text-[10.5px] text-zinc-400 leading-normal">
            Your telemetry stream session is closed and cache has been flushed. Your home is still guarded by autonomous pre-cooling schedules.
          </p>
        </div>

        {/* Informational telemetry health safety badge */}
        <div className="bg-[#111A24]/40 border border-slate-800/80 rounded-xl p-3 flex items-center space-x-2 text-left max-w-[310px]">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping flex-shrink-0"></span>
          <p className="text-[9.5px] font-mono text-zinc-400 leading-normal">
            <strong>System Pulse:</strong> Background algorithms remain online. Telemetry sync interval is on standard 1-hour standby.
          </p>
        </div>
      </div>

      {/* Action Buttons to Login again */}
      <div className="space-y-2.5 mb-4">
        <button
          onClick={() => onNavigateToScreen("screen-login")}
          className="w-full bg-[#1F2937] hover:bg-[#374151] border border-slate-700 hover:border-slate-600 active:scale-95 text-white font-bold text-xs py-3.5 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md"
        >
          <KeyRound className="w-4 h-4 text-blue-400" />
          <span>Login Again</span>
        </button>

        <button
          onClick={() => onNavigateToScreen("screen-splash")}
          className="w-full bg-[#0A0A0A] hover:bg-[#111] text-zinc-400 hover:text-white text-xs py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Return to Welcome Screen</span>
        </button>
      </div>

    </div>
  );
}
