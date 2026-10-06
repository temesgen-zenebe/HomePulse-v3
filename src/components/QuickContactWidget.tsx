import React from "react";
import { Phone, PhoneCall, AlertTriangle, CheckCircle, Calendar, Sparkles, Clock, User, Wrench, ShieldAlert, ShieldCheck, X, Volume2, VolumeX, PhoneOff } from "lucide-react";
import { HomeSystem, RecommendedProvider, ProAppointment } from "../types";

interface QuickContactWidgetProps {
  systems: HomeSystem[];
  providers: RecommendedProvider[];
  onNavigateToScreen: (screenId: string) => void;
  setSystems: React.Dispatch<React.SetStateAction<HomeSystem[]>>;
  onAddAppointment: (appt: ProAppointment) => void;
  addToast: (title: string, description: string, type: "task" | "risk" | "info" | "success") => void;
}

export default function QuickContactWidget({
  systems,
  providers,
  onNavigateToScreen,
  setSystems,
  onAddAppointment,
  addToast
}: QuickContactWidgetProps) {
  const [selectedSystemToDegrade, setSelectedSystemToDegrade] = React.useState<string>(systems[1]?.id || "");
  
  // Call simulation state
  const [activeCall, setActiveCall] = React.useState<{
    provider: RecommendedProvider;
    systemName: string;
    seconds: number;
    muted: boolean;
    status: "connecting" | "active" | "completed";
  } | null>(null);

  // Booking modal state
  const [bookingSystem, setBookingSystem] = React.useState<HomeSystem | null>(null);
  const [bookingProvider, setBookingProvider] = React.useState<RecommendedProvider | null>(null);
  const [issueDescription, setIssueDescription] = React.useState("");
  const [bookingDate, setBookingDate] = React.useState("2026-07-04");
  const [bookingTime, setBookingTime] = React.useState("10:00 AM");

  // Filter critical systems (health < 60 or status === "Critical")
  const criticalSystems = systems.filter(s => s.status === "Critical" || s.health < 60);

  // Match system to provider helper
  const getProviderForSystem = (system: HomeSystem): RecommendedProvider => {
    const category = system.category.toLowerCase();
    const name = system.name.toLowerCase();
    
    let matched = providers.find(p => {
      const spec = p.specialty.toLowerCase();
      if (category === "plumbing" && (spec.includes("plumb") || spec.includes("pipe"))) return true;
      if (category === "mechanical" && (spec.includes("hvac") || spec.includes("climate") || spec.includes("appliance"))) return true;
      if (category === "electrical" && (spec.includes("electr") || spec.includes("power"))) return true;
      if ((category === "structure" || category === "exterior") && (spec.includes("roof") || spec.includes("structure") || spec.includes("exterior"))) return true;
      return false;
    });

    if (!matched) {
      if (name.includes("hvac") || name.includes("heat") || name.includes("air") || name.includes("cool")) {
        matched = providers.find(p => p.id === "prov_1");
      } else if (name.includes("pipe") || name.includes("leak") || name.includes("water") || name.includes("plumb") || name.includes("faucet")) {
        matched = providers.find(p => p.id === "prov_2");
      } else if (name.includes("wire") || name.includes("electr") || name.includes("panel") || name.includes("breaker")) {
        matched = providers.find(p => p.id === "prov_3");
      } else if (name.includes("roof") || name.includes("foundation") || name.includes("structure") || name.includes("siding") || name.includes("moss") || name.includes("gutter")) {
        matched = providers.find(p => p.id === "prov_4");
      }
    }

    return matched || providers[0];
  };

  // Simulate active call duration incrementer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeCall && activeCall.status !== "completed") {
      interval = setInterval(() => {
        setActiveCall(prev => {
          if (!prev) return null;
          const nextSec = prev.seconds + 1;
          
          // Auto answer after 2 seconds
          let nextStatus = prev.status;
          if (prev.status === "connecting" && nextSec >= 2) {
            nextStatus = "active";
            addToast(
              "Call Connected",
              `Connected with ${prev.provider.name} dispatch center.`,
              "success"
            );
          }

          return {
            ...prev,
            seconds: nextSec,
            status: nextStatus
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCall, addToast]);

  // Degradation handler (to simulate Critical status)
  const handleDegradeSystem = (systemId: string) => {
    const sys = systems.find(s => s.id === systemId);
    if (!sys) return;

    setSystems(prev => 
      prev.map(s => {
        if (s.id === systemId) {
          return {
            ...s,
            health: 35, // Below 60 is Critical
            status: "Critical" as const,
            details: `CRITICAL LOAD EVENT: Detected sudden drop in performance and system threshold tolerances on ${new Date().toLocaleDateString()}. Immediate dispatch recommended.`
          };
        }
        return s;
      })
    );

    addToast(
      "Telemetry Risk Event",
      `System "${sys.name}" health dropped to 35% (Critical). Pre-vetted dispatcher active.`,
      "risk"
    );
  };

  // Restoration handler (Restore a critical system)
  const handleRestoreSystem = (systemId: string) => {
    const sys = systems.find(s => s.id === systemId);
    if (!sys) return;

    setSystems(prev => 
      prev.map(s => {
        if (s.id === systemId) {
          return {
            ...s,
            health: 95,
            status: "Optimal" as const,
            details: `Restored to safe operating standards. Calibration matches normal baseline values.`
          };
        }
        return s;
      })
    );

    addToast(
      "System Recovered",
      `"${sys.name}" calibration restored to 95% (Optimal).`,
      "success"
    );
  };

  // Place Call Simulation
  const handleInitiateCall = (provider: RecommendedProvider, systemName: string) => {
    setActiveCall({
      provider,
      systemName,
      seconds: 0,
      muted: false,
      status: "connecting"
    });
  };

  // Close Call
  const handleHangUp = () => {
    if (activeCall) {
      addToast(
        "Call Ended",
        `Dispatch call to ${activeCall.provider.name} closed. Duration: ${formatTime(activeCall.seconds)}.`,
        "info"
      );
    }
    setActiveCall(null);
  };

  // Helper to format call time (MM:SS)
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Open booking screen
  const handleOpenBooking = (system: HomeSystem, provider: RecommendedProvider) => {
    setBookingSystem(system);
    setBookingProvider(provider);
    setIssueDescription(`Urgent emergency diagnostic and repair call for ${system.name} system. Currently reporting Critical 35% telemetry health status.`);
  };

  // Submit emergency booking
  const handleConfirmBooking = () => {
    if (!bookingSystem || !bookingProvider) return;

    const newAppt: ProAppointment = {
      id: `emergency_appt_${Date.now()}`,
      providerId: bookingProvider.id,
      providerName: bookingProvider.name,
      providerSpecialty: bookingProvider.specialty,
      date: bookingDate,
      time: bookingTime,
      issueDescription: issueDescription,
      status: "Scheduled",
      progressUpdates: [
        {
          timestamp: new Date().toISOString(),
          status: "Scheduled",
          message: `Emergency dispatch request accepted. ${bookingProvider.name} is scheduled for dynamic onsite service.`
        }
      ]
    };

    onAddAppointment(newAppt);

    // Auto degrade to good/optimal or service the system once booked to simulate the dispatcher dispatching? 
    // Or let the user do it. Let's keep it clean: notify them and close.
    setBookingSystem(null);
    setBookingProvider(null);
    setIssueDescription("");
  };

  return (
    <div id="quick-contact-dispatcher-widget" className="bg-[#101820] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden mb-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
      
      {/* Widget Title Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${criticalSystems.length > 0 ? "bg-red-500/15 text-red-400 animate-pulse border border-red-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/10"}`}>
            {criticalSystems.length > 0 ? <ShieldAlert className="w-4 h-4" /> : <PhoneCall className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-extrabold text-white tracking-wide">Quick Dispatch Contact</h3>
              {criticalSystems.length > 0 && (
                <span className="text-[8px] font-mono font-extrabold bg-red-500/20 text-red-400 border border-red-500/20 px-1.5 py-0.2 rounded-full animate-pulse uppercase">
                  Alert Active
                </span>
              )}
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5">Pre-vetted emergency priority system matching</p>
          </div>
        </div>
      </div>

      {/* RENDER CRITICAL STATE (ALERT) */}
      {criticalSystems.length > 0 ? (
        <div className="space-y-4">
          <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
            The telemetry feed has flagged <span className="text-red-400 font-extrabold">{criticalSystems.length} {criticalSystems.length === 1 ? "system" : "systems"}</span> with a critical decay status. Pre-vetted master-tier contractors have been auto-prioritized below:
          </p>

          <div className="space-y-3">
            {criticalSystems.map(system => {
              const matchedProvider = getProviderForSystem(system);
              return (
                <div 
                  key={system.id} 
                  className="bg-[#0A0A0A] border border-red-500/20 rounded-xl p-3.5 relative overflow-hidden hover:border-red-500/40 transition-colors"
                >
                  {/* Subtle red left indicator line */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>

                  <div className="flex items-start justify-between mb-2.5">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                        <h4 className="text-[11px] font-extrabold text-white uppercase tracking-wider">
                          {system.name} system failure
                        </h4>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                        Current Health: <span className="text-red-400 font-extrabold">{system.health}%</span> • status: {system.status}
                      </p>
                    </div>

                    <button 
                      onClick={() => handleRestoreSystem(system.id)}
                      className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded hover:bg-emerald-500/20 transition-all"
                      title="Restore system telemetry baseline to nominal"
                    >
                      Quick Service ✓
                    </button>
                  </div>

                  {/* Contractor recommendation card */}
                  <div className="bg-[#121A21] border border-slate-800 rounded-lg p-3 flex items-start gap-3">
                    <img 
                      src={matchedProvider.avatar} 
                      alt={matchedProvider.name} 
                      className="w-10 h-10 rounded-full object-cover border border-slate-700 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[11px] font-bold text-white truncate">{matchedProvider.name}</h5>
                        <div className="flex items-center space-x-1 text-amber-400 text-[10px] font-bold">
                          <span>★</span>
                          <span>{matchedProvider.rating}</span>
                        </div>
                      </div>
                      <p className="text-[9px] text-blue-400 font-medium truncate">{matchedProvider.specialty}</p>
                      
                      <div className="flex items-center space-x-2.5 text-[9px] text-zinc-400 mt-1.5 font-mono">
                        <span className="bg-slate-800 px-1.5 py-0.2 rounded text-zinc-300">
                          {matchedProvider.responseTime} dispatch
                        </span>
                        <span>•</span>
                        <span className="text-zinc-300 font-semibold">${matchedProvider.ratePerHour}/hr standard</span>
                      </div>

                      {/* Call and Book Trigger actions */}
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <button
                          onClick={() => handleInitiateCall(matchedProvider, system.name)}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] py-1.5 px-2 rounded flex items-center justify-center space-x-1 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Simulate Call</span>
                        </button>
                        <button
                          onClick={() => handleOpenBooking(system, matchedProvider)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] py-1.5 px-2 rounded flex items-center justify-center space-x-1 transition-colors"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Insta-Book</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* RENDER NOMINAL STATE (HEALTHY) */
        <div className="space-y-4">
          <div className="bg-[#0A0A0A] border border-emerald-500/10 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/20 mb-2">
              <ShieldCheck className="w-5.5 h-5.5 animate-pulse" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">All Systems Nominal</h4>
            <p className="text-[10px] text-zinc-500 mt-1 max-w-xs leading-relaxed">
              No active critical health alerts detected. Telemetry channels report safe operating baseline parameters.
            </p>
          </div>

          {/* SYSTEM FAILURE SIMULATOR */}
          <div className="bg-[#0A0A0A] border border-slate-800 p-3 rounded-xl">
            <div className="flex items-center space-x-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">
                Emergency Simulation Tester
              </span>
            </div>
            <p className="text-[9.5px] text-zinc-400 leading-relaxed mb-3">
              Manually trigger a critical state on any system to observe the prioritized contact dispatcher in action.
            </p>
            
            <div className="flex items-center gap-2">
              <select
                id="simulator-system-select"
                value={selectedSystemToDegrade}
                onChange={(e) => setSelectedSystemToDegrade(e.target.value)}
                className="flex-1 bg-[#121A21] border border-slate-800 text-[10.5px] text-zinc-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
              >
                {systems.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.status} - {s.health}%)
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleDegradeSystem(selectedSystemToDegrade)}
                className="bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 hover:border-red-500/50 text-[10.5px] font-extrabold px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
              >
                Inject Failure ⚠️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE INTERACTIVE CALLING OVERLAY MODAL */}
      {activeCall && (
        <div className="fixed inset-0 bg-[#000000]/90 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-md">
          <div className="bg-[#121A21] border border-blue-500/30 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
            {/* Status indicator */}
            <div className="absolute top-3 left-3 flex items-center space-x-1 bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping"></span>
              <span>Encrypted Link</span>
            </div>

            <button 
              onClick={handleHangUp}
              className="absolute top-3 right-3 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Provider Portrait */}
            <div className="relative w-24 h-24 mx-auto mt-4 mb-4">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping pointer-events-none opacity-45"></div>
              <img 
                src={activeCall.provider.avatar} 
                alt={activeCall.provider.name} 
                className="w-24 h-24 rounded-full object-cover border-2 border-blue-500 relative z-10"
                referrerPolicy="no-referrer"
              />
            </div>

            <h4 className="text-base font-extrabold text-white">{activeCall.provider.name}</h4>
            <p className="text-xs text-blue-400 font-medium font-mono mt-0.5">{activeCall.provider.specialty}</p>
            <p className="text-[10px] text-zinc-400 mt-2 italic bg-[#0A0A0A] py-1 px-3 rounded inline-block border border-slate-800">
              Emergency Dispatch for: <span className="text-red-400 font-extrabold">{activeCall.systemName}</span>
            </p>

            <div className="my-6">
              {activeCall.status === "connecting" ? (
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500 font-mono animate-pulse">Dialing secure telemetry proxy...</p>
                  <p className="text-sm text-zinc-300 font-bold font-mono">{activeCall.provider.contactNumber}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-[11px] text-emerald-400 font-mono uppercase tracking-widest font-extrabold">Live Call Connected</p>
                  <p className="text-3xl text-white font-extrabold font-mono tracking-wider">{formatTime(activeCall.seconds)}</p>
                  <p className="text-[10px] text-zinc-500 max-w-xs mx-auto mt-2 leading-relaxed">
                    Live proxy bridge active. Speak into your microphone to discuss the {activeCall.systemName} emergency failure.
                  </p>
                </div>
              )}
            </div>

            {/* In-Call controls */}
            <div className="flex justify-center space-x-4 mb-2">
              <button
                onClick={() => setActiveCall(prev => prev ? { ...prev, muted: !prev.muted } : null)}
                className={`p-3.5 rounded-full border ${activeCall.muted ? "bg-amber-500/20 border-amber-500/30 text-amber-400" : "bg-[#0A0A0A] border-slate-800 text-zinc-400 hover:text-white hover:bg-slate-900"} transition-all`}
              >
                {activeCall.muted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
              </button>
              
              <button
                onClick={handleHangUp}
                className="p-3.5 bg-red-600 hover:bg-red-500 text-white rounded-full border border-red-500/20 shadow-lg hover:shadow-red-500/10 transition-all transform hover:scale-105"
              >
                <PhoneOff className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE EMERGENCY INSTA-BOOKING MODAL */}
      {bookingSystem && bookingProvider && (
        <div className="fixed inset-0 bg-[#000000]/85 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-md">
          <div className="bg-[#121A21] border border-emerald-500/20 rounded-2xl p-5 max-w-sm w-full shadow-2xl relative">
            <button 
              onClick={() => { setBookingSystem(null); setBookingProvider(null); }}
              className="absolute top-3.5 right-3.5 text-zinc-500 hover:text-white transition-colors focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2.5 mb-4 pb-2 border-b border-slate-800">
              <div className="p-1.5 bg-emerald-500/15 text-emerald-400 rounded">
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Confirm Emergency Dispatch</h4>
                <p className="text-[9.5px] text-zinc-500">Same-day premium contractor routing</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Contractor Details
                </label>
                <div className="bg-[#0A0A0A] p-2.5 rounded-lg border border-slate-800 flex items-center space-x-2">
                  <img src={bookingProvider.avatar} alt={bookingProvider.name} className="w-8 h-8 rounded-full object-cover border border-slate-700" referrerPolicy="no-referrer" />
                  <div>
                    <p className="text-[10px] font-bold text-white">{bookingProvider.name}</p>
                    <p className="text-[9px] text-zinc-400">{bookingProvider.specialty}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-slate-800 text-[10.5px] text-zinc-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                    ETA Window
                  </label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-slate-800 text-[10.5px] text-zinc-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="10:00 AM">10:00 AM - 12:00 PM</option>
                    <option value="02:30 PM">02:30 PM - 04:30 PM</option>
                    <option value="05:00 PM">05:00 PM - 07:00 PM (Emergency Window)</option>
                    <option value="Urgent ASAP">Urgent ASAP (Within 45 Mins)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Telemetry Issue Log
                </label>
                <textarea
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0A0A0A] border border-slate-800 text-[10px] text-zinc-300 rounded-md p-2 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-5">
              <button
                onClick={() => { setBookingSystem(null); setBookingProvider(null); }}
                className="bg-slate-800 hover:bg-slate-700 text-zinc-300 font-bold text-[10.5px] py-2 rounded-lg transition-colors border border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10.5px] py-2 rounded-lg transition-colors shadow-lg shadow-emerald-500/10"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
