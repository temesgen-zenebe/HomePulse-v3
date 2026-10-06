import React from "react";
import { Lock, Sparkles, CheckCircle2, ChevronRight, ArrowLeft } from "lucide-react";

interface FeatureLockedPlaceholderProps {
  title: string;
  description: string;
  detail: string;
  featureId: string;
  onActivate: (featureId: string) => void;
  onNavigateBack: () => void;
  onNavigateToHub: () => void;
}

export default function FeatureLockedPlaceholder({
  title,
  description,
  detail,
  featureId,
  onActivate,
  onNavigateBack,
  onNavigateToHub
}: FeatureLockedPlaceholderProps) {
  const [isActivating, setIsActivating] = React.useState(false);

  const handleActivate = () => {
    setIsActivating(true);
    setTimeout(() => {
      onActivate(featureId);
      setIsActivating(false);
    }, 900);
  };

  return (
    <div className="w-full h-full min-h-[500px] flex flex-col justify-between bg-[#0A0A0A] text-white p-6 font-sans relative">
      
      {/* Top Header/Back Row */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onNavigateBack}
          className="flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/10 px-2 py-0.5 rounded uppercase">
          Locked Module
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-auto max-w-xs mx-auto space-y-5">
        <div className="p-4 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/15 relative">
          <Lock className="w-8 h-8 text-amber-400 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0A0A0A]"></span>
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-extrabold text-white tracking-tight">{title}</h3>
          <p className="text-[11.5px] text-zinc-400 leading-relaxed font-semibold">
            {description}
          </p>
        </div>

        <div className="p-3 bg-zinc-900/60 border border-slate-800/60 rounded-xl text-left text-[10px] text-zinc-400 leading-relaxed">
          <span className="text-[8.5px] font-mono font-bold text-amber-400 uppercase block mb-1">Feature Scope:</span>
          {detail}
        </div>

        {/* Action Button */}
        <button
          onClick={handleActivate}
          disabled={isActivating}
          className={`w-full py-3 rounded-xl border font-extrabold text-xs cursor-pointer transition-all flex items-center justify-center space-x-2 shadow-lg ${
            isActivating
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-blue-600 border-blue-500 text-white hover:bg-blue-500 shadow-blue-900/10"
          }`}
        >
          {isActivating ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
              <span>Activating Module...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Enable Feature to Start Using</span>
            </>
          )}
        </button>
      </div>

      {/* Footer Nav Link */}
      <div className="mt-8 pt-4 border-t border-slate-900 flex justify-center">
        <button
          onClick={onNavigateToHub}
          className="flex items-center space-x-1 text-[10.5px] text-zinc-500 hover:text-blue-400 transition-colors cursor-pointer"
        >
          <span>Configure inside Modules Switchboard</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
