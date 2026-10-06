import React from "react";
import { Zap, ShieldCheck, Flame, Cpu, TrendingDown, RefreshCw, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { MaintenanceTask, HomeSystem } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface EnergyEfficiencyWidgetProps {
  tasks: MaintenanceTask[];
  systems: HomeSystem[];
  onToggleTask: (taskId: string) => void;
}

export default function EnergyEfficiencyWidget({ tasks, systems, onToggleTask }: EnergyEfficiencyWidgetProps) {
  // Telemetry status variables derived from live system data
  const hvacNode = systems.find(s => s.name === "HVAC") || { health: 78 };
  const applianceNode = systems.find(s => s.name === "Appliances") || { health: 82 };
  
  // HVAC Filter task completion status
  const filterTask = tasks.find(t => t.id === "task_1") || { completed: false };
  // Water Heater Flush task completion status
  const flushTask = tasks.find(t => t.id === "task_3") || { completed: false };

  // Local-only fast optimization toggle switches for additional tuning
  const [smartSchedule, setSmartSchedule] = React.useState(true);
  const [coilCleansed, setCoilCleansed] = React.useState(false);
  const [ecoSetpoint, setEcoSetpoint] = React.useState(true);

  // Trigger telemetry re-calibration animation state
  const [calibrating, setCalibrating] = React.useState(false);
  const [frictionFactor, setFrictionFactor] = React.useState(1.18);

  // Sync friction factor based on filter task completion
  React.useEffect(() => {
    if (filterTask.completed) {
      setFrictionFactor(1.00); // optimal airflow friction
    } else {
      setFrictionFactor(1.18); // 18% restricted air flow penalty
    }
  }, [filterTask.completed]);

  const handleRecalibrate = () => {
    setCalibrating(true);
    setTimeout(() => {
      setCalibrating(false);
    }, 1000);
  };

  // Base values for single family home 2450 sqft (Zone 4 heat pump)
  const baseMonthlyKwh = 1120; // kWh base load
  const baseRatePerKwh = 0.16; // $0.16/kWh
  const nominalBill = baseMonthlyKwh * baseRatePerKwh; // ~$179.20

  // Calculation of active savings based on completed HVAC / appliance tasks & switches
  let savingsHvacFilter = filterTask.completed ? 19.50 : 0.00;
  let savingsWaterHeater = flushTask.completed ? 12.80 : 0.00;
  let savingsSmartSchedule = smartSchedule ? 15.40 : 0.00;
  let savingsCoilsCleansed = coilCleansed ? 21.00 : 0.00;
  let savingsEcoSetpoint = ecoSetpoint ? 14.20 : 0.00;

  // Penalize base load if system health of mechanical elements drops below 90%
  const hvacWearPenalty = hvacNode.health < 90 ? (90 - hvacNode.health) * 0.45 : 0;
  const applianceWearPenalty = applianceNode.health < 90 ? (90 - applianceNode.health) * 0.30 : 0;
  const totalWearPenalty = hvacWearPenalty + applianceWearPenalty;

  // Net Estimated Monthly Savings
  const totalSavings = savingsHvacFilter + savingsWaterHeater + savingsSmartSchedule + savingsCoilsCleansed + savingsEcoSetpoint;
  
  // Calculated optimized bill
  const currentEstBill = Math.max(85, nominalBill + totalWearPenalty - totalSavings);
  const beforeOptimizedBill = nominalBill + totalWearPenalty;
  
  const savedPercentage = Math.round((totalSavings / beforeOptimizedBill) * 100) || 0;

  return (
    <div className="bg-[#101820] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden mb-6">
      <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full filter blur-[40px] pointer-events-none"></div>

      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-xl relative">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
              <span>Energy Efficiency Tracker</span>
            </h3>
            <p className="text-[10px] text-zinc-500">Telemetry-based monthly utility estimates</p>
          </div>
        </div>

        {/* Sync/Recalibrate Button */}
        <button
          onClick={handleRecalibrate}
          disabled={calibrating}
          className="p-1.5 bg-[#1C2431] border border-slate-800 hover:border-slate-700 hover:text-emerald-400 text-zinc-400 rounded-lg transition-colors cursor-pointer"
          title="Recalibrate sensors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${calibrating ? "animate-spin text-emerald-400" : ""}`} />
        </button>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-3.5 mb-4">
        {/* Savings Display Card */}
        <div className="bg-black/40 border border-slate-800/80 rounded-xl p-3 text-left relative overflow-hidden">
          <span className="text-[8.5px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">Est. Monthly Savings</span>
          <div className="flex items-baseline space-x-1 mt-1.5">
            <span className="text-xl font-extrabold text-white font-display">${totalSavings.toFixed(2)}</span>
            <span className="text-[9px] font-mono text-emerald-400">/mo</span>
          </div>
          <div className="flex items-center space-x-1.5 mt-2 text-[9px] text-zinc-500">
            <TrendingDown className="w-3 h-3 text-emerald-400" />
            <span>Saved approx. <strong className="text-zinc-300">{savedPercentage}%</strong> off bill</span>
          </div>
        </div>

        {/* Dynamic Billing Comparison CSS Bars */}
        <div className="bg-black/40 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex justify-between text-[8px] font-mono text-zinc-500 uppercase font-bold">
            <span>Before</span>
            <span>Optimized</span>
          </div>
          
          <div className="flex items-end space-x-3.5 h-9 pt-1 relative">
            {/* Before Bar */}
            <div className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-zinc-800/80 rounded-t" 
                style={{ height: "100%" }}
              ></div>
              <span className="text-[8.5px] font-mono text-zinc-500 mt-1">${beforeOptimizedBill.toFixed(0)}</span>
            </div>

            {/* Optimized Bar */}
            <div className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t transition-all duration-500" 
                style={{ height: `${(currentEstBill / beforeOptimizedBill) * 100}%` }}
              ></div>
              <span className="text-[8.5px] font-mono text-emerald-400 font-bold mt-1">${currentEstBill.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Sensor Feeds Section */}
      <div className="bg-[#121A26]/85 border border-slate-800/60 rounded-xl p-3 mb-4 space-y-2">
        <div className="flex items-center justify-between text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider pb-1.5 border-b border-slate-800/40">
          <span>Active Sensor Stream</span>
          <span className="text-emerald-400 animate-pulse">● Connected</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-left">
          <div>
            <span className="text-[8.5px] text-zinc-500 block">HVAC Airflow friction:</span>
            <span className={`text-[10px] font-mono font-bold ${filterTask.completed ? "text-emerald-400" : "text-amber-500 animate-pulse"}`}>
              {frictionFactor.toFixed(2)}x {filterTask.completed ? "(Optimal)" : "(Restricted)"}
            </span>
          </div>
          <div>
            <span className="text-[8.5px] text-zinc-500 block">Water Heater Thermal Transfer:</span>
            <span className={`text-[10px] font-mono font-bold ${flushTask.completed ? "text-emerald-400" : "text-amber-500 animate-pulse"}`}>
              {flushTask.completed ? "98% (Optimal)" : "86% (Sediment Scaled)"}
            </span>
          </div>
        </div>
      </div>

      {/* Checklist / Interactive Optimization Toggles */}
      <div className="space-y-2 text-left">
        <h4 className="text-[10px] font-mono font-extrabold text-zinc-400 uppercase tracking-widest mb-1.5">Optimization Actions</h4>
        
        <div className="space-y-1.5 text-xs">
          {/* Action 1 (Linked directly to primary HVAC Filter task) */}
          <div 
            onClick={() => onToggleTask("task_1")}
            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${filterTask.completed ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300" : "bg-[#0A0A0A]/85 border-slate-800 hover:border-slate-700 text-zinc-300"}`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              {filterTask.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0"></div>
              )}
              <div className="min-w-0">
                <p className="text-[10.5px] font-bold truncate">Replace HVAC Filter</p>
                <p className="text-[8.5px] text-zinc-500">Reduces friction penalty & improves airflow index</p>
              </div>
            </div>
            <span className="text-[9.5px] font-mono font-bold text-emerald-400">+$19.50/mo</span>
          </div>

          {/* Action 2 (Linked directly to primary Water Heater Flush task) */}
          <div 
            onClick={() => onToggleTask("task_3")}
            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${flushTask.completed ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300" : "bg-[#0A0A0A]/85 border-slate-800 hover:border-slate-700 text-zinc-300"}`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              {flushTask.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0"></div>
              )}
              <div className="min-w-0">
                <p className="text-[10.5px] font-bold truncate">Flush Water Heater Tank</p>
                <p className="text-[8.5px] text-zinc-500">Expels scaling to restore peak thermal transfer</p>
              </div>
            </div>
            <span className="text-[9.5px] font-mono font-bold text-emerald-400">+$12.80/mo</span>
          </div>

          {/* Action 3 (Smart Schedule Switch) */}
          <div 
            onClick={() => setSmartSchedule(prev => !prev)}
            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${smartSchedule ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300" : "bg-[#0A0A0A]/85 border-slate-800 hover:border-slate-700 text-zinc-300"}`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              {smartSchedule ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0"></div>
              )}
              <div className="min-w-0">
                <p className="text-[10.5px] font-bold truncate">Enable AI Thermostat Pre-Cooling</p>
                <p className="text-[8.5px] text-zinc-500">Avoids cooling grid peaks in hot hours</p>
              </div>
            </div>
            <span className="text-[9.5px] font-mono font-bold text-emerald-400">+$15.40/mo</span>
          </div>

          {/* Action 4 (Coils cleansed) */}
          <div 
            onClick={() => setCoilCleansed(prev => !prev)}
            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${coilCleansed ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300" : "bg-[#0A0A0A]/85 border-slate-800 hover:border-slate-700 text-zinc-300"}`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              {coilCleansed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0"></div>
              )}
              <div className="min-w-0">
                <p className="text-[10.5px] font-bold truncate">Clean Refrigerator Coils</p>
                <p className="text-[8.5px] text-zinc-500">Cleanses condenser line dust from mechanical systems</p>
              </div>
            </div>
            <span className="text-[9.5px] font-mono font-bold text-emerald-400">+$21.00/mo</span>
          </div>

          {/* Action 5 (Eco setpoint) */}
          <div 
            onClick={() => setEcoSetpoint(prev => !prev)}
            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${ecoSetpoint ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300" : "bg-[#0A0A0A]/85 border-slate-800 hover:border-slate-700 text-zinc-300"}`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              {ecoSetpoint ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0"></div>
              )}
              <div className="min-w-0">
                <p className="text-[10.5px] font-bold truncate">Configure Thermostat Eco Band</p>
                <p className="text-[8.5px] text-zinc-500">Locks thermostat to 74°F-78°F target ranges</p>
              </div>
            </div>
            <span className="text-[9.5px] font-mono font-bold text-emerald-400">+$14.20/mo</span>
          </div>
        </div>
      </div>

    </div>
  );
}
