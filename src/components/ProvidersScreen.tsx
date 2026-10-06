import React from "react";
import { 
  ChevronLeft, 
  Star, 
  Calendar, 
  Clock, 
  Phone, 
  ShieldCheck, 
  Check, 
  CheckCircle2, 
  Wrench, 
  Sparkles, 
  MessageSquare, 
  AlertCircle, 
  User, 
  ThumbsUp, 
  TrendingUp, 
  ArrowRight,
  UserCheck2,
  Trash2,
  Calculator,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Info
} from "lucide-react";
import { RecommendedProvider, ProAppointment, ProviderReview } from "../types";

interface ProvidersScreenProps {
  providers: RecommendedProvider[];
  appointments: ProAppointment[];
  onNavigateToScreen: (screenId: string) => void;
  onBookAppointment: (appointment: ProAppointment) => void;
  onUpdateAppointments: (updated: ProAppointment[]) => void;
  onUpdateProviders: (updated: RecommendedProvider[]) => void;
  hideFooter?: boolean;
}

export default function ProvidersScreen({
  providers,
  appointments,
  onNavigateToScreen,
  onBookAppointment,
  onUpdateAppointments,
  onUpdateProviders,
  hideFooter = false
}: ProvidersScreenProps) {
  const [activeTab, setActiveTab] = React.useState<"pros" | "appointments">("pros");
  const [selectedSpecialty, setSelectedSpecialty] = React.useState<string>("All");
  const [selectedPro, setSelectedPro] = React.useState<RecommendedProvider | null>(null);
  
  // Booking Form State
  const [bookingDate, setBookingDate] = React.useState("");
  const [bookingTime, setBookingTime] = React.useState("09:00 AM");
  const [issueDesc, setIssueDesc] = React.useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = React.useState(false);
  const [bookingSuccess, setBookingSuccess] = React.useState(false);

  // Rating Form State
  const [ratingAppointmentId, setRatingAppointmentId] = React.useState<string | null>(null);
  const [userRating, setUserRating] = React.useState<number>(5);
  const [userComment, setUserComment] = React.useState("");

  // Interactive Cost Calculator state and dataset
  const [isCalculatorExpanded, setIsCalculatorExpanded] = React.useState(false);
  const [calcTask, setCalcTask] = React.useState<string>("hvac_tune");
  const [calcHomeSize, setCalcHomeSize] = React.useState<number>(1.0); // 0.85 for Condo, 1.0 for Medium, 1.35 for Large
  const [calcUrgency, setCalcUrgency] = React.useState<number>(1.0); // 1.0 for standard, 1.25 for priority, 1.50 for emergency
  const [calcAge, setCalcAge] = React.useState<number>(1.0); // 0.95 for new, 1.0 for moderate, 1.15 for legacy

  const calculatorTasks = [
    {
      id: "hvac_tune",
      name: "HVAC Filter & Calibration Tune-up",
      category: "HVAC",
      baseMin: 120,
      baseMax: 180,
      baseHours: 1.5,
      materialCost: 35,
      savingYtd: 110,
      desc: "Cleans condenser coils, replaces pleated media filters, tests thermostat delay controls, and checks refrigerant level margins."
    },
    {
      id: "ac_wash",
      name: "AC Condenser Deep Chemical Cleansing",
      category: "HVAC",
      baseMin: 180,
      baseMax: 270,
      baseHours: 2.0,
      materialCost: 55,
      savingYtd: 145,
      desc: "Flushes blockaged algae sediments inside drains and treats heat exchange fins with pressurized acid-free compound foaming agents."
    },
    {
      id: "electrical_breaker",
      name: "Electrical Panel Breaker Calibration",
      category: "Electrical",
      baseMin: 220,
      baseMax: 380,
      baseHours: 2.5,
      materialCost: 80,
      savingYtd: 180,
      desc: "Executes micro-amp impedance sweeps on high-load terminals, monitors hot joints via infrared scan, and aligns smart controllers."
    },
    {
      id: "water_flush",
      name: "Water Heater Flushing & Anode Swap",
      category: "Plumbing",
      baseMin: 150,
      baseMax: 240,
      baseHours: 1.8,
      materialCost: 45,
      savingYtd: 130,
      desc: "Purges core calcium sediments from cylinder base and swaps corroded sacrificial anode rods to secure longevity benchmarks."
    },
    {
      id: "thermostat_setup",
      name: "Smart Thermostat Integration & Adaptation",
      category: "Electrical",
      baseMin: 90,
      baseMax: 150,
      baseHours: 1.2,
      materialCost: 20,
      savingYtd: 95,
      desc: "Adapts multi-stage heat pump control relays, integrates Wi-Fi sensor links, and deploys predictive precooling algorithms."
    },
    {
      id: "sump_test",
      name: "Sump Pump Backup Float & Current Test",
      category: "Plumbing",
      baseMin: 100,
      baseMax: 170,
      baseHours: 1.2,
      materialCost: 30,
      savingYtd: 85,
      desc: "Inspects secondary water level float triggers, cleans intake strainer debris, and verifies dry-cell emergency battery amperage."
    }
  ];

  const activeCalcTask = calculatorTasks.find(t => t.id === calcTask) || calculatorTasks[0];
  const multiplier = calcHomeSize * calcUrgency * calcAge;
  const calculatedMin = Math.round(activeCalcTask.baseMin * multiplier);
  const calculatedMax = Math.round(activeCalcTask.baseMax * multiplier);
  const calculatedLaborHours = parseFloat((activeCalcTask.baseHours * calcHomeSize).toFixed(1));
  const calculatedLabor = Math.round(((activeCalcTask.baseMin + activeCalcTask.baseMax) / 2) * 0.75 * multiplier);
  const calculatedMaterials = Math.round(activeCalcTask.materialCost * calcHomeSize);
  const projectedSavings = Math.round(activeCalcTask.savingYtd * multiplier);

  const handleApplyEstimateToBooking = () => {
    const matchingPro = providers.find(p => p.specialty.toLowerCase() === activeCalcTask.category.toLowerCase()) || providers[0];
    if (matchingPro) {
      setSelectedPro(matchingPro);
      setIssueDesc(`[Historical Cost Range Estimate: $${calculatedMin} - $${calculatedMax}]\nRequesting: ${activeCalcTask.name}\n\nSelected parameters:\n- Property Size multiplier: x${calcHomeSize}\n- Dispatch Urgency: x${calcUrgency}\n- System Age factor: x${calcAge}\n- Est. Labor Hours: ${calculatedLaborHours}h\n- Est. Materials: $${calculatedMaterials}\n\nTask Detail: ${activeCalcTask.desc}`);
      alert(`Successfully pre-filled booking description with projected range ($${calculatedMin} - $${calculatedMax})! Let's choose an appointment date.`);
    }
  };

  const specialties = ["All", "HVAC", "Plumbing", "Electrical", "Structure"];

  // Filter providers
  const filteredProviders = selectedSpecialty === "All"
    ? providers
    : providers.filter(p => p.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase()) || p.name.toLowerCase().includes(selectedSpecialty.toLowerCase()));

  // Handle book pro submit
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPro || !bookingDate || !issueDesc.trim()) return;

    setIsSubmittingBooking(true);

    const newApp: ProAppointment = {
      id: `app_${Date.now()}`,
      providerId: selectedPro.id,
      providerName: selectedPro.name,
      providerSpecialty: selectedPro.specialty,
      date: bookingDate,
      time: bookingTime,
      issueDescription: issueDesc,
      status: "Requested",
      progressUpdates: [
        {
          timestamp: new Date().toISOString(),
          status: "Requested",
          message: `Appointment request submitted for ${bookingDate} at ${bookingTime}.`
        }
      ]
    };

    setTimeout(() => {
      onBookAppointment(newApp);
      setIsSubmittingBooking(false);
      setBookingSuccess(true);
      
      // Reset form
      setBookingDate("");
      setBookingTime("09:00 AM");
      setIssueDesc("");

      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedPro(null);
        setActiveTab("appointments");
      }, 1500);
    }, 800);
  };

  // Helper to simulate provider step advances for testing follow-ups!
  const handleSimulateProgress = (appId: string) => {
    const updated = appointments.map(app => {
      if (app.id !== appId) return app;

      let nextStatus: ProAppointment["status"] = "Requested";
      let logMessage = "";

      if (app.status === "Requested") {
        nextStatus = "Scheduled";
        logMessage = `Provider verified credentials. Appointment confirmed for ${app.date} at ${app.time}.`;
      } else if (app.status === "Scheduled") {
        nextStatus = "In Progress";
        logMessage = "Pro arrived on site. Commenced physical diagnosis and telemetry calibrations.";
      } else if (app.status === "In Progress") {
        nextStatus = "Completed";
        logMessage = "Service and calibration successfully completed. System diagnostics reporting 99% health. Waiting for user rating.";
      } else {
        return app;
      }

      return {
        ...app,
        status: nextStatus,
        progressUpdates: [
          ...app.progressUpdates,
          {
            timestamp: new Date().toISOString(),
            status: nextStatus,
            message: logMessage
          }
        ]
      };
    });

    onUpdateAppointments(updated);
  };

  // Cancel/Delete Appointment
  const handleCancelAppointment = (appId: string) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      const updated = appointments.filter(app => app.id !== appId);
      onUpdateAppointments(updated);
    }
  };

  // Handle rating submission
  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingAppointmentId) return;

    const appointment = appointments.find(a => a.id === ratingAppointmentId);
    if (!appointment) return;

    // 1. Update appointment status to Rated
    const updatedAppointments = appointments.map(app => {
      if (app.id === ratingAppointmentId) {
        return {
          ...app,
          status: "Rated" as const,
          userRating,
          userComment,
          progressUpdates: [
            ...app.progressUpdates,
            {
              timestamp: new Date().toISOString(),
              status: "Rated",
              message: `User rated provider ${userRating} stars: "${userComment || "No comment"}"`
            }
          ]
        };
      }
      return app;
    });

    // 2. Add review to the provider and recalculate average rating
    const updatedProviders = providers.map(prov => {
      if (prov.id === appointment.providerId) {
        const newReview: ProviderReview = {
          id: `rev_${Date.now()}`,
          userName: "Homeowner (You)",
          rating: userRating,
          comment: userComment || "Excellent, prompt maintenance service!",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        };
        
        const nextReviews = [newReview, ...prov.reviews];
        const totalScore = nextReviews.reduce((sum, r) => sum + r.rating, 0);
        const newAverage = parseFloat((totalScore / nextReviews.length).toFixed(1));

        return {
          ...prov,
          reviews: nextReviews,
          rating: newAverage,
          completedJobs: prov.completedJobs + 1
        };
      }
      return prov;
    });

    onUpdateAppointments(updatedAppointments);
    onUpdateProviders(updatedProviders);

    // Reset rating form
    setRatingAppointmentId(null);
    setUserRating(5);
    setUserComment("");

    alert("Thank you! Your provider review has been posted successfully.");
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0A0A0A] text-white font-sans relative">
      
      {/* Header */}
      <div className="px-5 pt-4 pb-2 border-b border-slate-800/80 bg-[#0E131F]/45">
        <div className="flex items-center space-x-3 mb-3">
          <button 
            onClick={() => onNavigateToScreen("screen-profile")}
            className="p-1.5 bg-[#101820]/60 hover:bg-slate-800 border border-slate-800 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[9px] text-blue-400 font-mono tracking-widest uppercase">Certified HomePulse Network</span>
            <h2 className="text-base font-extrabold tracking-tight text-white font-display">Service Providers</h2>
          </div>
        </div>

        {/* Dynamic Dual Tab Switcher */}
        <div className="flex bg-[#101820]/80 p-1 rounded-xl border border-slate-800/60 mt-1">
          <button
            onClick={() => { setActiveTab("pros"); setSelectedPro(null); }}
            className={`flex-1 py-2 text-center text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "pros" 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10" 
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Recommended Pros
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            className={`flex-1 py-2 text-center text-[10px] font-bold rounded-lg transition-all relative cursor-pointer ${
              activeTab === "appointments" 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10" 
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            My Appointments
            {appointments.filter(a => a.status !== "Rated").length > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* Main Scrollable Workspace */}
      <div className="flex-1 overflow-y-auto px-5 py-4 pb-20 scrollbar-none">
        
        {activeTab === "pros" ? (
          <div>
            {!selectedPro ? (
              // List of Recommended Providers
              <div className="space-y-4">
                
                {/* Intro Explainer Banner */}
                <div className="p-3.5 bg-gradient-to-r from-blue-950/20 to-indigo-950/10 border border-blue-500/15 rounded-2xl flex items-start space-x-3">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-white uppercase tracking-wide">Pre-Vetted Contractor Network</h4>
                    <p className="text-[10px] text-zinc-400 leading-normal mt-0.5">
                      All operators carry valid licenses, high response score marks, and are certified for remote IoT integrations.
                    </p>
                  </div>
                </div>

                {/* Dynamic Cost Estimation Calculator */}
                <div className="bg-[#111625] border border-blue-500/20 rounded-2xl p-4 shadow-xl">
                  <div 
                    onClick={() => setIsCalculatorExpanded(!isCalculatorExpanded)}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                        <Calculator className="w-4 h-4 animate-pulse" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <span>Smart Cost Estimator</span>
                          <span className="bg-blue-500/10 text-[8px] font-mono text-blue-400 px-1.5 py-0.2 rounded uppercase border border-blue-500/20">Historical data</span>
                        </h4>
                        <p className="text-[9px] text-zinc-400 mt-0.5">
                          {isCalculatorExpanded ? "Configure maintenance parameters below" : "Calculate projected ranges for HVAC, plumbing, or electrical tasks"}
                        </p>
                      </div>
                    </div>
                    <div className="text-zinc-500 hover:text-zinc-300 transition-colors">
                      {isCalculatorExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {isCalculatorExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4 animate-fade-in text-left">
                      {/* Task Selector */}
                      <div>
                        <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                          Select Maintenance Task
                        </label>
                        <select
                          value={calcTask}
                          onChange={(e) => setCalcTask(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-slate-800 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:border-blue-500 focus:outline-none"
                        >
                          {calculatorTasks.map(task => (
                            <option key={task.id} value={task.id}>
                              {task.name} ({task.category})
                            </option>
                          ))}
                        </select>
                        <p className="text-[9px] text-zinc-400 mt-1 italic leading-normal pl-1 border-l border-blue-500/30">
                          "{activeCalcTask.desc}"
                        </p>
                      </div>

                      {/* Controls Grid */}
                      <div className="grid grid-cols-3 gap-2">
                        {/* Property Size */}
                        <div>
                          <label className="block text-[7.5px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                            Property Size
                          </label>
                          <select
                            value={calcHomeSize}
                            onChange={(e) => setCalcHomeSize(parseFloat(e.target.value))}
                            className="w-full bg-[#0A0A0A] border border-slate-800 rounded-lg px-2 py-1 text-[9px] text-white focus:border-blue-500 focus:outline-none"
                          >
                            <option value="0.85">Condo (&lt;1.5k sqft)</option>
                            <option value="1.0">Medium (1.5k-3k)</option>
                            <option value="1.35">Estate (3k+ sqft)</option>
                          </select>
                        </div>

                        {/* Dispatch Urgency */}
                        <div>
                          <label className="block text-[7.5px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                            Urgency
                          </label>
                          <select
                            value={calcUrgency}
                            onChange={(e) => setCalcUrgency(parseFloat(e.target.value))}
                            className="w-full bg-[#0A0A0A] border border-slate-800 rounded-lg px-2 py-1 text-[9px] text-white focus:border-blue-500 focus:outline-none"
                          >
                            <option value="1.0">Standard</option>
                            <option value="1.25">Priority (Next-Day)</option>
                            <option value="1.5">Emergency (24/7)</option>
                          </select>
                        </div>

                        {/* System Age */}
                        <div>
                          <label className="block text-[7.5px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                            System Age
                          </label>
                          <select
                            value={calcAge}
                            onChange={(e) => setCalcAge(parseFloat(e.target.value))}
                            className="w-full bg-[#0A0A0A] border border-slate-800 rounded-lg px-2 py-1 text-[9px] text-white focus:border-blue-500 focus:outline-none"
                          >
                            <option value="0.95">New (&lt;2 years)</option>
                            <option value="1.0">Moderate (2-8 years)</option>
                            <option value="1.15">Legacy (8+ years)</option>
                          </select>
                        </div>
                      </div>

                      {/* Display Cost Ranges Dashboard */}
                      <div className="bg-[#0A0A0A] border border-slate-900 rounded-xl p-3.5 flex flex-col space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Projected Cost Range</span>
                          <span className="text-[8px] text-blue-400 font-mono font-semibold flex items-center gap-0.5">
                            <TrendingUp className="w-2.5 h-2.5 text-blue-400" /> 
                            <span>Est. multiplier: x{multiplier.toFixed(2)}</span>
                          </span>
                        </div>

                        <div className="text-center py-1">
                          <span className="text-2xl font-extrabold tracking-tight font-display bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                            ${calculatedMin} - ${calculatedMax}
                          </span>
                          <span className="text-[10px] text-zinc-400 block mt-0.5 font-mono">
                            Based on local historical averages
                          </span>
                        </div>

                        {/* Financial and Labor Breakdown Grid */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 text-center">
                          <div>
                            <span className="text-[7.5px] text-zinc-500 block uppercase font-mono tracking-wider">Est. Labor</span>
                            <span className="text-[10px] font-bold text-zinc-200 mt-0.5 block">${calculatedLabor}</span>
                            <span className="text-[7px] text-zinc-500 block font-mono">{calculatedLaborHours} hours</span>
                          </div>
                          <div>
                            <span className="text-[7.5px] text-zinc-500 block uppercase font-mono tracking-wider">Est. Materials</span>
                            <span className="text-[10px] font-bold text-zinc-200 mt-0.5 block">${calculatedMaterials}</span>
                            <span className="text-[7px] text-zinc-500 block font-mono">OEM spec</span>
                          </div>
                          <div>
                            <span className="text-[7.5px] text-emerald-500 block uppercase font-mono tracking-wider">Risk ROI</span>
                            <span className="text-[10px] font-bold text-emerald-400 mt-0.5 block">${projectedSavings} YTD</span>
                            <span className="text-[7px] text-emerald-600 block font-mono">Prevent wear</span>
                          </div>
                        </div>
                      </div>

                      {/* Apply to Booking CTA button */}
                      <button
                        type="button"
                        onClick={handleApplyEstimateToBooking}
                        className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 text-white font-bold rounded-lg transition-all cursor-pointer text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-lg shadow-blue-500/10"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
                        <span>Pre-fill & Book with this Estimate</span>
                        <ArrowRight className="w-3.5 h-3.5 text-white ml-0.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Specialty Filter Chips */}
                <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {specialties.map(spec => (
                    <button
                      key={spec}
                      onClick={() => setSelectedSpecialty(spec)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border ${
                        selectedSpecialty === spec
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-[#101820]/50 border-slate-800/80 text-zinc-400 hover:border-slate-700 hover:text-zinc-200"
                      }`}
                    >
                      {spec === "All" ? "⚡ Show All" : spec}
                    </button>
                  ))}
                </div>

                {/* Pro Cards List */}
                <div className="space-y-3">
                  {filteredProviders.length > 0 ? (
                    filteredProviders.map(pro => (
                      <div
                        key={pro.id}
                        onClick={() => setSelectedPro(pro)}
                        className="bg-[#101820] border border-slate-800/80 rounded-2xl p-4 hover:border-slate-700 hover:bg-slate-900/40 transition-all cursor-pointer relative group flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            {/* Avatar */}
                            <img 
                              src={pro.avatar} 
                              alt={pro.name} 
                              className="w-10 h-10 rounded-xl object-cover border border-slate-800 shadow-md flex-shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <h3 className="text-xs font-extrabold text-white group-hover:text-blue-400 transition-colors">{pro.name}</h3>
                                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-mono px-1 py-0.2 rounded-md">Vetted</span>
                              </div>
                              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{pro.specialty}</p>
                            </div>
                          </div>

                          {/* Quick Rating badge */}
                          <div className="bg-[#0A0A0A] border border-slate-800 rounded-lg px-2 py-1 text-right flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-amber-400 flex items-center justify-end gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {pro.rating}
                            </span>
                            <span className="text-[8px] text-zinc-500 font-mono mt-0.5">{pro.completedJobs} jobs</span>
                          </div>
                        </div>

                        {/* Pro Quick Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/60 text-center">
                          <div className="p-1.5 bg-[#0A0A0A]/40 rounded-lg border border-slate-900/80">
                            <span className="text-[8px] text-zinc-500 block uppercase font-mono tracking-wider">Rate</span>
                            <span className="text-[10px] font-bold text-white mt-0.5 block">${pro.ratePerHour}/hr</span>
                          </div>
                          <div className="p-1.5 bg-[#0A0A0A]/40 rounded-lg border border-slate-900/80">
                            <span className="text-[8px] text-zinc-500 block uppercase font-mono tracking-wider">Response</span>
                            <span className="text-[10px] font-medium text-blue-400 mt-0.5 block">{pro.responseTime}</span>
                          </div>
                          <div className="p-1.5 bg-[#0A0A0A]/40 rounded-lg border border-slate-900/80">
                            <span className="text-[8px] text-zinc-500 block uppercase font-mono tracking-wider">Reviews</span>
                            <span className="text-[10px] font-medium text-emerald-400 mt-0.5 block">{pro.reviews.length} Feedbacks</span>
                          </div>
                        </div>

                        {/* Call to action teaser */}
                        <div className="mt-3.5 flex items-center justify-between text-[9px] font-mono text-zinc-500">
                          <span>Verified phone, dispatch, and chat</span>
                          <span className="text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                            Book Schedule <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-[#101820]/40 border border-slate-800 border-dashed rounded-2xl text-[11px] text-zinc-500">
                      No matching providers found. Try another specialty category.
                    </div>
                  )}
                </div>

              </div>
            ) : (
              // Individual Pro Detailed View with booking form
              <div className="space-y-4">
                
                {/* Back button to list */}
                <button
                  onClick={() => setSelectedPro(null)}
                  className="flex items-center space-x-1 text-[10px] text-zinc-400 hover:text-white font-mono bg-[#101820]/60 px-2.5 py-1.5 rounded-lg border border-slate-800/80 cursor-pointer mb-2"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to Providers List</span>
                </button>

                {/* Profile Banner */}
                <div className="bg-[#101820] border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
                  
                  <div className="flex items-start space-x-4">
                    <img 
                      src={selectedPro.avatar} 
                      alt={selectedPro.name} 
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-800/80 shadow-lg flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-extrabold text-white">{selectedPro.name}</h3>
                        <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-bold">Premium Partner</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-mono mt-1">{selectedPro.specialty}</p>
                      
                      <div className="flex items-center space-x-3 mt-2.5 text-[10px] font-mono text-zinc-400">
                        <span className="flex items-center text-amber-400 gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <strong>{selectedPro.rating}</strong>
                        </span>
                        <span>•</span>
                        <span>{selectedPro.completedJobs} Completed Jobs</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info Row */}
                  <div className="mt-4 pt-4 border-t border-slate-800/60 grid grid-cols-2 gap-3 text-[10px] font-mono">
                    <a 
                      href={`tel:${selectedPro.contactNumber}`} 
                      className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20 text-blue-400 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{selectedPro.contactNumber}</span>
                    </a>
                    <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-zinc-300">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{selectedPro.responseTime} reply</span>
                    </div>
                  </div>
                </div>

                {/* Booking form section */}
                <div className="bg-[#101820] border border-slate-800 rounded-2xl p-4 shadow-xl">
                  <h4 className="text-[11px] font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>Setup Appointment Session</span>
                  </h4>

                  {bookingSuccess ? (
                    <div className="p-6 text-center space-y-2">
                      <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                        <Check className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-white">Booking Request Sent!</p>
                      <p className="text-[9px] text-zinc-400">Your scheduling ticket was successfully recorded in the appointments logs.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleBookingSubmit} className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Date Input */}
                        <div>
                          <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">Appointment Date</label>
                          <input 
                            type="date"
                            required
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-slate-800 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        {/* Time Slots */}
                        <div>
                          <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">Preferred Slot</label>
                          <select
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-slate-800 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:border-blue-500 focus:outline-none"
                          >
                            <option value="09:00 AM">09:00 AM (Morning)</option>
                            <option value="11:30 AM">11:30 AM (Midday)</option>
                            <option value="02:30 PM">02:30 PM (Afternoon)</option>
                            <option value="04:00 PM">04:00 PM (Late Day)</option>
                          </select>
                        </div>
                      </div>

                      {/* Issue Description Area */}
                      <div>
                        <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">Issue Description & Notes</label>
                        <textarea
                          required
                          rows={2}
                          value={issueDesc}
                          onChange={(e) => setIssueDesc(e.target.value)}
                          placeholder="e.g., Annual preventive maintenance cleaning on electric heat pump condenser coils."
                          className="w-full bg-[#0A0A0A] border border-slate-800 rounded-lg p-2.5 text-[10px] text-white placeholder-zinc-600 focus:border-blue-500 focus:outline-none"
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingBooking}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 mt-1"
                      >
                        {isSubmittingBooking ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Broadcasting request...</span>
                          </>
                        ) : (
                          <>
                            <span>Request Booking Session</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>

                {/* Reviews List */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                    <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Client Testimonials ({selectedPro.reviews.length})</span>
                  </h4>
                  
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-none">
                    {selectedPro.reviews.map(rev => (
                      <div key={rev.id} className="p-3 bg-[#101820]/60 border border-slate-900 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-[9px] font-mono">
                          <span className="font-bold text-zinc-300">{rev.userName}</span>
                          <span className="text-zinc-500">{rev.date}</span>
                        </div>
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star 
                              key={idx} 
                              className={`w-2.5 h-2.5 ${idx < Math.round(rev.rating) ? "fill-amber-400 text-amber-400" : "text-zinc-700"}`} 
                            />
                          ))}
                        </div>
                        <p className="text-[10px] text-zinc-400 italic leading-normal">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        ) : (
          // Appointments tab workspace
          <div className="space-y-4">
            
            {/* Dynamic Active Appointment / Scheduled Count header */}
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Logged appointments list
              </h3>
              <span className="text-[9px] font-mono text-zinc-500 bg-[#101820] border border-slate-800 px-2 py-0.5 rounded-lg">
                Total: {appointments.length}
              </span>
            </div>

            {appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map(app => {
                  let statusBadgeStyle = "";
                  let statusLabel = "";

                  if (app.status === "Requested") {
                    statusBadgeStyle = "bg-blue-500/10 border-blue-500/20 text-blue-400";
                    statusLabel = "Awaiting Accept";
                  } else if (app.status === "Scheduled") {
                    statusBadgeStyle = "bg-amber-500/10 border-amber-500/20 text-amber-400";
                    statusLabel = "Pro Confirmed";
                  } else if (app.status === "In Progress") {
                    statusBadgeStyle = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-pulse";
                    statusLabel = "Operator On Site";
                  } else if (app.status === "Completed") {
                    statusBadgeStyle = "bg-emerald-500 text-white";
                    statusLabel = "Service Finalized - Rate Now";
                  } else {
                    statusBadgeStyle = "bg-zinc-800 border-zinc-700 text-zinc-400";
                    statusLabel = "Completed & Rated";
                  }

                  return (
                    <div 
                      key={app.id} 
                      className="bg-[#101820] border border-slate-800 rounded-2xl p-4 space-y-4"
                    >
                      
                      {/* Top Pro header info */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-extrabold text-white">{app.providerName}</h4>
                          <p className="text-[9px] text-zinc-400 font-mono mt-0.5">{app.providerSpecialty}</p>
                          
                          <div className="flex items-center space-x-2.5 mt-2 text-[9px] font-mono text-zinc-500">
                            <span className="flex items-center gap-1 text-zinc-400">
                              <Calendar className="w-3 h-3 text-zinc-500" />
                              {app.date}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-zinc-400">
                              <Clock className="w-3 h-3 text-zinc-500" />
                              {app.time}
                            </span>
                          </div>
                        </div>

                        {/* Status tag */}
                        <div className="text-right space-y-1.5">
                          <span className={`inline-block text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${statusBadgeStyle}`}>
                            {statusLabel}
                          </span>
                          
                          {/* Cancel or delete button */}
                          {app.status === "Requested" && (
                            <button
                              onClick={() => handleCancelAppointment(app.id)}
                              className="block ml-auto text-[8px] font-mono text-red-400 hover:text-red-300 underline cursor-pointer"
                            >
                              Cancel Session
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Diagnostic notes detail */}
                      <div className="p-3 bg-[#0A0A0A]/60 border border-slate-900 rounded-xl space-y-1">
                        <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider block">Target Issue Detail</span>
                        <p className="text-[10px] text-zinc-300 leading-normal">
                          "{app.issueDescription}"
                        </p>
                      </div>

                      {/* Interactive simulated workflow for the user to step progress */}
                      {app.status !== "Rated" && (
                        <div className="p-2.5 bg-blue-950/20 border border-blue-500/10 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-mono font-bold text-blue-400 uppercase tracking-wider">🛠️ Simulation Sandbox</span>
                            <span className="text-[7px] font-mono text-zinc-500">Fast-forward timeline for testing</span>
                          </div>
                          
                          {app.status === "Completed" ? (
                            <button
                              onClick={() => setRatingAppointmentId(app.id)}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Star className="w-3.5 h-3.5 fill-white text-white" />
                              <span>Submit Contractor Rating & Feedback</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSimulateProgress(app.id)}
                              className="w-full bg-[#101820] hover:bg-[#1C2632] text-zinc-300 hover:text-white border border-slate-800 text-[9px] py-1.5 rounded-lg transition-colors font-mono cursor-pointer"
                            >
                              {app.status === "Requested" && "Simulate Accept (Schedule) →"}
                              {app.status === "Scheduled" && "Simulate Arrival (Start Job) →"}
                              {app.status === "In Progress" && "Simulate Work Finalized (Complete Job) →"}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Rating details review block if already Rated */}
                      {app.status === "Rated" && (
                        <div className="p-3 bg-zinc-900/40 border border-slate-800/60 rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider">Your Rating Post</span>
                            <span className="flex items-center text-amber-400 gap-0.5">
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <Star 
                                  key={idx} 
                                  className={`w-2.5 h-2.5 ${idx < (app.userRating || 5) ? "fill-amber-400 text-amber-400" : "text-zinc-700"}`} 
                                />
                              ))}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 italic">
                            "{app.userComment || "No comments left."}"
                          </p>
                        </div>
                      )}

                      {/* Visual Stepper Follow-Up Logs */}
                      <div className="pt-2">
                        <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider block mb-2 px-1">Progress timeline follow-up</span>
                        
                        <div className="relative pl-3 space-y-3.5 before:absolute before:left-1 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-slate-800/80">
                          {app.progressUpdates.map((update, idx) => (
                            <div key={idx} className="relative flex items-start space-x-2.5">
                              {/* Dot status */}
                              <div className="absolute -left-3.5 mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full border border-[#0A0A0A]"></div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500">
                                  <span className="font-bold uppercase tracking-wide text-zinc-400">{update.status}</span>
                                  <span>{new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-[9.5px] text-zinc-400 leading-normal mt-0.5">
                                  {update.message}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#101820]/40 border border-slate-800 border-dashed rounded-2xl text-[11px] text-zinc-500 space-y-3">
                <p>You have no scheduled appointments currently.</p>
                <button
                  onClick={() => setActiveTab("pros")}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[9px] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Browse Recommended Pros
                </button>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Persistent Bottom Tab Navigation (Mockup Representation) */}
      {!hideFooter && (
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
          <button onClick={() => onNavigateToScreen("screen-profile")} className="flex flex-col items-center space-y-1 text-blue-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            <span className="text-[9px] font-bold uppercase tracking-wider">More</span>
          </button>
        </div>
      )}

      {/* Floating Rating Overlay Dialog */}
      {ratingAppointmentId && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex flex-col justify-end">
          <div className="bg-[#101820] border-t border-slate-800 rounded-t-3xl p-6 space-y-5 animate-in slide-in-from-bottom duration-300">
            <div className="text-center space-y-1">
              <span className="text-[9px] text-blue-400 font-mono tracking-widest uppercase block">Feedback Channel</span>
              <h3 className="text-sm font-extrabold text-white">Rate Maintenance Service</h3>
              <p className="text-[10px] text-zinc-400">
                Your feedback helps verify qualifications and refines recommendation weights.
              </p>
            </div>

            <form onSubmit={handleRatingSubmit} className="space-y-4">
              {/* Star Rating Selector */}
              <div className="flex flex-col items-center space-y-1.5">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Select Star Level</span>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setUserRating(starVal)}
                      className="text-amber-400 hover:scale-110 active:scale-95 transition-transform"
                    >
                      <Star 
                        className={`w-6 h-6 ${
                          starVal <= userRating 
                            ? "fill-amber-400 text-amber-400" 
                            : "text-zinc-700 hover:text-zinc-500"
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <span className="text-[10px] font-bold font-mono text-amber-400 mt-1">
                  {userRating === 5 && "⭐ Excellent - Outstanding Work"}
                  {userRating === 4 && "⭐ Good - Above Standard"}
                  {userRating === 3 && "⭐ Fair - Standard Service"}
                  {userRating === 2 && "⭐ Dissatisfied - Needs Improvement"}
                  {userRating === 1 && "⭐ Critical - Poor Performance"}
                </span>
              </div>

              {/* Text Review */}
              <div>
                <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">Your Written Review</label>
                <textarea
                  required
                  rows={3}
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Tell us what you liked (promptness, expert cleanup, detailed explanations, etc.)"
                  className="w-full bg-[#0A0A0A] border border-slate-800 rounded-xl p-2.5 text-[11px] text-white placeholder-zinc-600 focus:border-blue-500 focus:outline-none"
                ></textarea>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setRatingAppointmentId(null)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-zinc-400 hover:text-white font-bold text-[10px] py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-[10px] py-2 rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/10"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
