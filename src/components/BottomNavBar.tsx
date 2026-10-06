import React from "react";
import { Home, Sliders, Calendar, Sparkles, CreditCard, User, Boxes } from "lucide-react";

interface BottomNavBarProps {
  activeTab: "home" | "systems" | "tasks" | "chat" | "plans" | "account" | "features";
  onNavigateToScreen: (screenId: string) => void;
}

export default function BottomNavBar({ activeTab, onNavigateToScreen }: BottomNavBarProps) {
  return (
    <div className="absolute bottom-0 inset-x-0 h-16 bg-[#101820]/95 backdrop-blur-md border-t border-slate-800/80 flex items-center justify-around px-2.5 z-30 select-none">
      <button 
        onClick={() => onNavigateToScreen("screen-dashboard")} 
        className={`flex flex-col items-center space-y-1 transition-colors focus:outline-none ${activeTab === "home" ? "text-blue-500" : "text-zinc-500 hover:text-zinc-300"}`}
      >
        <Home className="w-5 h-5" strokeWidth={activeTab === "home" ? 2.5 : 2} />
        <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
      </button>

      <button 
        onClick={() => onNavigateToScreen("screen-systems")} 
        className={`flex flex-col items-center space-y-1 transition-colors focus:outline-none ${activeTab === "systems" ? "text-blue-500" : "text-zinc-500 hover:text-zinc-300"}`}
      >
        <Sliders className="w-5 h-5" strokeWidth={activeTab === "systems" ? 2.5 : 2} />
        <span className="text-[9px] font-bold uppercase tracking-wider">Systems</span>
      </button>

      <button 
        onClick={() => onNavigateToScreen("screen-calendar")} 
        className={`flex flex-col items-center space-y-1 transition-colors focus:outline-none ${activeTab === "tasks" ? "text-blue-500" : "text-zinc-500 hover:text-zinc-300"}`}
      >
        <Calendar className="w-5 h-5" strokeWidth={activeTab === "tasks" ? 2.5 : 2} />
        <span className="text-[9px] font-bold uppercase tracking-wider">Tasks</span>
      </button>

      <button 
        onClick={() => onNavigateToScreen("screen-assistant")} 
        className={`flex flex-col items-center space-y-1 transition-colors focus:outline-none ${activeTab === "chat" ? "text-blue-500" : "text-zinc-500 hover:text-zinc-300"}`}
      >
        <Sparkles className="w-5 h-5" strokeWidth={activeTab === "chat" ? 2.5 : 2} />
        <span className="text-[9px] font-bold uppercase tracking-wider">AI Chat</span>
      </button>

      <button 
        onClick={() => onNavigateToScreen("screen-features-hub")} 
        className={`flex flex-col items-center space-y-1 transition-colors focus:outline-none ${activeTab === "features" ? "text-blue-500" : "text-zinc-500 hover:text-zinc-300"}`}
      >
        <Boxes className="w-5 h-5" strokeWidth={activeTab === "features" ? 2.5 : 2} />
        <span className="text-[9px] font-bold uppercase tracking-wider">Modules</span>
      </button>

      <button 
        onClick={() => onNavigateToScreen("screen-account")} 
        className={`flex flex-col items-center space-y-1 transition-colors focus:outline-none ${activeTab === "account" ? "text-blue-500" : "text-zinc-500 hover:text-zinc-300"}`}
      >
        <User className="w-5 h-5" strokeWidth={activeTab === "account" ? 2.5 : 2} />
        <span className="text-[9px] font-bold uppercase tracking-wider">Account</span>
      </button>
    </div>
  );
}
