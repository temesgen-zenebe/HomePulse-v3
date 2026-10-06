import React from "react";
import { MapPin, Calendar, Compass, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { PropertyInfo } from "../types";
import { motion } from "motion/react";

interface LocationCollectionScreenProps {
  onNavigateToScreen: (screenId: string) => void;
  onSaveLocation: (data: { address: string; zipCode: string; houseAge: number }) => void;
  initialAddress?: string;
  initialYearBuilt?: number;
}

export default function LocationCollectionScreen({
  onNavigateToScreen,
  onSaveLocation,
  initialAddress = "",
  initialYearBuilt = 2012
}: LocationCollectionScreenProps) {
  // Derive initial house age from yearBuilt based on current year 2026
  const defaultAge = 2026 - initialYearBuilt;
  
  const [address, setAddress] = React.useState(initialAddress || "1428 Woodside Lane, Seattle, WA");
  const [zipCode, setZipCode] = React.useState("98112");
  const [houseAge, setHouseAge] = React.useState<string>(String(defaultAge));
  const [error, setError] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!address.trim()) {
      setError("Please enter a valid street address.");
      return;
    }
    if (!zipCode.trim() || zipCode.length < 5) {
      setError("Please enter a 5-digit ZIP code.");
      return;
    }
    const ageNum = parseInt(houseAge, 10);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 200) {
      setError("Please enter a valid house age (0 to 200 years).");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onSaveLocation({
        address: `${address.trim()}${address.toLowerCase().includes("seattle") ? "" : ", Seattle, WA"}`,
        zipCode: zipCode.trim(),
        houseAge: ageNum
      });
      onNavigateToScreen("screen-onboarding");
    }, 1000);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 bg-[#0A0A0A] relative text-white font-sans overflow-y-auto scrollbar-none">
      
      {/* Background glow ambiance */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-52 h-52 bg-emerald-600 rounded-full filter blur-[80px] opacity-10 pointer-events-none"></div>

      {/* Header / Step Progress */}
      <div>
        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mb-2">
          <span className="uppercase text-emerald-400 font-semibold tracking-wide flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Location Setup
          </span>
          <span>Step 3 of 5</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-5">
          <div className="h-full w-3/5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
        </div>

        <h2 className="text-lg font-bold tracking-tight text-white leading-snug font-display">
          Establish Home Node<br />& Climate Context
        </h2>
        <p className="text-[10px] text-zinc-500 mt-1">
          Provide your property details to customize climate algorithms and telemetry thresholds.
        </p>
      </div>

      {/* Interactive Form Box */}
      <div className="my-6 bg-[#111A24]/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl"></div>
        
        <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest mb-4">Location Specs</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-400">
              {error}
            </div>
          )}

          {/* Address input */}
          <div>
            <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wide block mb-1">Street Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 1428 Woodside Lane"
                className="w-full bg-[#070C12] border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-[11px] text-white focus:outline-none focus:border-emerald-500 font-sans transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Zip Code input */}
            <div>
              <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wide block mb-1">ZIP Code</label>
              <div className="relative">
                <Compass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  maxLength={5}
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="98112"
                  className="w-full bg-[#070C12] border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-[11px] text-white focus:outline-none focus:border-emerald-500 font-sans transition-colors"
                  required
                />
              </div>
            </div>

            {/* House Age input */}
            <div>
              <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wide block mb-1">House Age (Years)</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={houseAge}
                  onChange={(e) => setHouseAge(e.target.value)}
                  placeholder="14"
                  className="w-full bg-[#070C12] border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-[11px] text-white focus:outline-none focus:border-emerald-500 font-sans transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Prompting Details */}
          <div className="bg-[#090D16] rounded-xl p-3 border border-slate-800/80 flex items-start space-x-2.5">
            <HelpCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-[9px] text-zinc-400 leading-normal">
              Based on a house age of <strong className="text-white">{houseAge || "0"} years</strong>, we'll calibrate your expected envelope heat loss coefficient and HVAC warning cycles.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 border border-emerald-400/20 shadow-lg cursor-pointer"
          >
            <span>{isSaving ? "Calibrating Sensors..." : "Confirm & Analyze Property"}</span>
            {!isSaving && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>

      {/* Trust Specs Footer */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-center space-x-2 text-[9px] text-zinc-500 font-mono bg-[#101820]/40 border border-slate-800/50 rounded-full py-1 px-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>REAL-TIME CLIMATE RE-CALIBRATION</span>
        </div>
      </div>

    </div>
  );
}
