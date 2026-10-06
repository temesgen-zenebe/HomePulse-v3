import React from "react";
import { 
  Building, 
  DollarSign, 
  Activity, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  Briefcase, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Send, 
  Sliders, 
  Wrench, 
  MapPin, 
  Phone, 
  AlertTriangle,
  User,
  Plus,
  Coins,
  MessageSquare,
  Award,
  ThumbsUp
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Legend 
} from "recharts";
import { StakeholderUser } from "./StakeholderScreen";
import { RecommendedProvider, ProAppointment } from "../types";
import { motion } from "motion/react";

interface ProviderDashboardScreenProps {
  currentUser: StakeholderUser;
  onNavigateToScreen: (screenId: string) => void;
  onLogout: () => void;
  appointments: ProAppointment[];
  onUpdateAppointments: (updated: ProAppointment[]) => void;
  providers: RecommendedProvider[];
  onUpdateProviders: (updated: RecommendedProvider[]) => void;
  addToast: (title: string, description: string, type: "task" | "risk" | "info" | "success") => void;
  onUpdateCurrentUser: (updated: StakeholderUser) => void;
}

export default function ProviderDashboardScreen({
  currentUser,
  onNavigateToScreen,
  onLogout,
  appointments,
  onUpdateAppointments,
  providers,
  onUpdateProviders,
  addToast,
  onUpdateCurrentUser
}: ProviderDashboardScreenProps) {
  const [activeTab, setActiveTab] = React.useState<"overview" | "appointments" | "billing" | "profile">("overview");

  // Local state for invoice creation
  const [invoiceClient, setInvoiceClient] = React.useState("usr_1");
  const [invoiceDesc, setInvoiceDesc] = React.useState("");
  const [invoiceLabor, setInvoiceLabor] = React.useState(150);
  const [invoiceMaterials, setInvoiceMaterials] = React.useState(50);
  const [invoiceSuccess, setInvoiceSuccess] = React.useState(false);

  // Edit profile state
  const [editName, setEditName] = React.useState(currentUser.name);
  const [editCompany, setEditCompany] = React.useState(currentUser.companyName || "Seattle Mechanical Partners");
  const [editSpecialty, setEditSpecialty] = React.useState(currentUser.providerCategory || "HVAC");
  const [editRate, setEditRate] = React.useState(currentUser.serviceRate || 125);

  // Progress log states indexed by appointment ID
  const [followUpTexts, setFollowUpTexts] = React.useState<Record<string, string>>({});
  const [followUpStatuses, setFollowUpStatuses] = React.useState<Record<string, string>>({});

  // Simulated earnings history data for graphical charts
  const weeklyEarningsData = [
    { day: "Mon", earnings: 150, jobs: 1 },
    { day: "Tue", earnings: 300, jobs: 2 },
    { day: "Wed", earnings: 150, jobs: 1 },
    { day: "Thu", earnings: 450, jobs: 3 },
    { day: "Fri", earnings: 300, jobs: 2 },
    { day: "Sat", earnings: 600, jobs: 4 },
    { day: "Sun", earnings: 150, jobs: 1 },
  ];

  const specialtyDistribution = [
    { category: "HVAC Repair", share: 45 },
    { category: "Electrical Work", share: 25 },
    { category: "Plumbing fixes", share: 20 },
    { category: "Other services", share: 10 },
  ];

  // Dynamic matching of current provider to seeded pre-vetted provider database list
  const matchedPro = providers.find(
    p => p.id === currentUser.id ||
         p.name.toLowerCase() === currentUser.name.toLowerCase() ||
         (currentUser.companyName && p.name.toLowerCase() === currentUser.companyName.toLowerCase()) ||
         (currentUser.providerCategory && p.specialty.toLowerCase().includes(currentUser.providerCategory.toLowerCase()))
  );

  // Fallback reviews to give realistic data if they register a custom user
  const reviewsList = matchedPro ? matchedPro.reviews : [
    { id: "rev_p_1", userName: "Arthur Pendragon", rating: 5, comment: "Dave was super helpful and prompt. Fixed our high pressure line calibration in record time.", date: "Jun 28, 2026" },
    { id: "rev_p_2", userName: "Marcus Vance", rating: 4, comment: "Quality service. Aligned with the smart thermostat sensors perfectly.", date: "Jul 01, 2026" }
  ];

  const averageRating = matchedPro ? matchedPro.rating : 4.85;

  // Calculated totals based on matched results
  const providerAppointments = appointments.filter(a => {
    if (matchedPro && a.providerId === matchedPro.id) return true;
    if (a.providerName.toLowerCase() === currentUser.name.toLowerCase()) return true;
    if (currentUser.companyName && a.providerName.toLowerCase() === currentUser.companyName.toLowerCase()) return true;
    if (currentUser.providerCategory && a.providerSpecialty.toLowerCase().includes(currentUser.providerCategory.toLowerCase())) return true;
    return false;
  });

  // Let's gather completed / rated appointments for this provider that have ratings
  const ratedAppointments = providerAppointments.filter(a => a.status === "Rated" && a.userRating);
  
  // Calculate average rating dynamically if we have new ratings, otherwise fallback to the averageRating
  const dynamicAvgRating = ratedAppointments.length > 0 
    ? (ratedAppointments.reduce((sum, a) => sum + (a.userRating || 5), 0) + (averageRating * 3)) / (ratedAppointments.length + 3)
    : averageRating;

  // Service quality dimension analysis based on the current rating
  const strengthData = [
    { subject: "Work Quality", score: Math.min(5, Number((dynamicAvgRating * 1.01).toFixed(2))), fullMark: 5 },
    { subject: "Punctuality", score: Math.min(5, Number((dynamicAvgRating * 0.96).toFixed(2))), fullMark: 5 },
    { subject: "Communication", score: Math.min(5, Number((dynamicAvgRating * 0.98).toFixed(2))), fullMark: 5 },
    { subject: "Value & Price", score: Math.min(5, Number((dynamicAvgRating * 0.92).toFixed(2))), fullMark: 5 },
    { subject: "Safety Checks", score: Math.min(5, Number((dynamicAvgRating * 1.02).toFixed(2))), fullMark: 5 },
  ];
  
  const pendingCount = providerAppointments.filter(a => a.status !== "Completed" && a.status !== "Rated").length;
  const completedCount = providerAppointments.filter(a => a.status === "Completed" || a.status === "Rated").length;
  const totalEarnings = (currentUser.earnings || 0) + (completedCount * 150);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCurrentUser({
      ...currentUser,
      name: editName,
      companyName: editCompany,
      providerCategory: editSpecialty,
      serviceRate: Number(editRate)
    });
    addToast("Profile Updated", "Provider credentials and rate schedule updated.", "success");
  };

  const handleStatusChange = (apptId: string, nextStatus: "Requested" | "In Progress" | "Completed") => {
    const updated = appointments.map(appt => {
      if (appt.id === apptId) {
        const newUpdate = {
          timestamp: new Date().toISOString(),
          status: nextStatus,
          message: nextStatus === "In Progress" 
            ? "Service truck is dispatched and on route." 
            : "Service successfully completed. Compressor cleansed and diagnostic checks cleared."
        };
        return { 
          ...appt, 
          status: nextStatus,
          progressUpdates: [...(appt.progressUpdates || []), newUpdate]
        };
      }
      return appt;
    });
    onUpdateAppointments(updated);
    
    if (nextStatus === "Completed") {
      onUpdateCurrentUser({
        ...currentUser,
        earnings: (currentUser.earnings || 0) + 150
      });
      addToast(
        "Job Concluded",
        "Assigned service cleared successfully. Escrow funds released.",
        "success"
      );
    } else if (nextStatus === "In Progress") {
      addToast("Dispatch Accepted", "Service truck is routed to homeowner location.", "info");
    }
  };

  const handleAddProgressUpdate = (apptId: string) => {
    const logMessage = followUpTexts[apptId] || "";
    const nextStatus = followUpStatuses[apptId] || "Keep";

    if (!logMessage.trim()) {
      addToast("Message Required", "Please type a progress follow-up comment.", "info");
      return;
    }

    const updated = appointments.map(appt => {
      if (appt.id === apptId) {
        const statusToApply = nextStatus === "Keep" ? appt.status : (nextStatus as any);
        const newUpdate = {
          timestamp: new Date().toISOString(),
          status: statusToApply,
          message: logMessage.trim()
        };
        return {
          ...appt,
          status: statusToApply,
          progressUpdates: [...(appt.progressUpdates || []), newUpdate]
        };
      }
      return appt;
    });

    onUpdateAppointments(updated);

    if (nextStatus === "Completed") {
      onUpdateCurrentUser({
        ...currentUser,
        earnings: (currentUser.earnings || 0) + 150
      });
      addToast(
        "Job Concluded",
        "Assigned service cleared successfully. Escrow funds released.",
        "success"
      );
    } else {
      addToast("Timeline Dispatched", "New progress log dispatched to homeowner's portal.", "success");
    }

    // Reset forms
    setFollowUpTexts(prev => ({ ...prev, [apptId]: "" }));
    setFollowUpStatuses(prev => ({ ...prev, [apptId]: "Keep" }));
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceDesc) return;

    setInvoiceSuccess(true);
    addToast(
      "Invoice Dispatched",
      `Sent bill of $${Number(invoiceLabor) + Number(invoiceMaterials)} to homeowner portal.`,
      "success"
    );

    setTimeout(() => {
      setInvoiceSuccess(false);
      setInvoiceDesc("");
      setInvoiceMaterials(0);
    }, 3000);
  };

  return (
    <div className="w-full h-full bg-[#0A0A0A] text-white flex flex-col relative select-none">
      
      {/* Upper Provider Header */}
      <div className="px-5 py-3.5 bg-[#1B130E] border-b border-amber-500/20 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center border border-amber-500/30">
            <Building className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-xs font-black tracking-tight text-white uppercase">Provider Dashboard</h1>
            <p className="text-[8.5px] font-mono text-amber-400">Verified Partner</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigateToScreen("screen-dashboard")}
            className="p-1 px-2.5 bg-zinc-900 hover:bg-zinc-800 border border-slate-800 text-zinc-300 hover:text-white rounded-lg text-[9px] font-mono font-bold cursor-pointer transition-colors"
          >
            Home View
          </button>
          <button 
            onClick={onLogout}
            className="p-1 px-2.5 bg-amber-950/40 hover:bg-amber-950 text-amber-400 rounded-lg border border-amber-500/20 text-[9px] font-mono font-bold cursor-pointer transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Container Scroll Space */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 text-left">
        
        {/* Dynamic Partner Status Banner */}
        <div className="p-4 bg-gradient-to-br from-[#1C140F] to-[#0D0B09] border border-amber-500/15 rounded-2xl shadow-lg flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <Wrench className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0 text-left">
              <span className="text-[8.5px] font-mono font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase">
                {currentUser.approved ? "Verified Pro ✓" : "Verifying Account"}
              </span>
              <p className="text-sm font-black text-white truncate mt-1 font-display">
                {currentUser.companyName || currentUser.name}
              </p>
              <p className="text-[9.5px] text-zinc-500 truncate leading-none font-mono">
                Service Area: {currentUser.providerCategory || "Heating & Cooling"}
              </p>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="text-[8px] font-mono text-zinc-500 uppercase block">Hourly Service Rate</span>
            <span className="text-xs font-black text-amber-400 font-mono">
              ${currentUser.serviceRate || 125}/hr
            </span>
          </div>
        </div>

        {/* Tab menu */}
        <div className="flex bg-zinc-900/60 p-1 border border-slate-800 rounded-xl text-[10px] font-semibold text-zinc-400">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === "overview" ? "bg-amber-600 text-white font-bold shadow-md" : "hover:text-zinc-200"
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === "appointments" ? "bg-amber-600 text-white font-bold shadow-md" : "hover:text-zinc-200"
            }`}
          >
            Job Requests ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab("billing")}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === "billing" ? "bg-amber-600 text-white font-bold shadow-md" : "hover:text-zinc-200"
            }`}
          >
            Send a Bill
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === "profile" ? "bg-amber-600 text-white font-bold shadow-md" : "hover:text-zinc-200"
            }`}
          >
            Settings
          </button>
        </div>

        {/* Tab 1: OVERVIEW & PERFORMANCE */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* KPI grid cards */}
            <div className="grid grid-cols-2 gap-2.5">
              <motion.div 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="bg-[#15100B]/60 border border-amber-500/10 p-3 rounded-2xl text-left"
              >
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[8.5px] uppercase font-mono">Estimated Earnings</span>
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <h3 className="text-lg font-black text-white mt-1 font-mono">${totalEarnings.toLocaleString()}</h3>
                <span className="text-[7px] text-emerald-400 font-mono flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +18.3% weekly growth
                </span>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-[#15100B]/60 border border-amber-500/10 p-3 rounded-2xl text-left"
              >
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[8.5px] uppercase font-mono">Customer Rating</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
                <h3 className="text-lg font-black text-white mt-1 font-mono">{averageRating.toFixed(2)} / 5.0</h3>
                <span className="text-[7px] text-amber-400 font-mono mt-0.5 block">
                  Based on {reviewsList.length} reviews
                </span>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="bg-[#15100B]/60 border border-amber-500/10 p-3 rounded-2xl text-left"
              >
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[8.5px] uppercase font-mono">Completed Jobs</span>
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <h3 className="text-lg font-black text-white mt-1 font-mono">{completedCount + 3} Jobs</h3>
                <span className="text-[7px] text-blue-400 font-mono mt-0.5 block">
                  3 past jobs + {completedCount} new
                </span>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-[#15100B]/60 border border-amber-500/10 p-3 rounded-2xl text-left"
              >
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[8.5px] uppercase font-mono">Response Time</span>
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <h3 className="text-lg font-black text-white mt-1 font-mono">11 mins</h3>
                <span className="text-[7px] text-emerald-400 font-mono mt-0.5 block">
                  ✓ Faster than target time
                </span>
              </motion.div>
            </div>

            {/* Recharts Weekly Earnings Curve Chart */}
            <div className="bg-zinc-950 border border-slate-800 p-4 rounded-2xl space-y-3.5 text-left">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Weekly Earnings</h4>
                  <p className="text-[8px] text-zinc-400">Your daily earnings breakdown</p>
                </div>
                <Coins className="w-4 h-4 text-amber-500" />
              </div>

              <div className="h-40 w-full text-xs font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyEarningsData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D97706" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#D97706" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="day" stroke="#4b5563" fontSize={9} />
                    <YAxis stroke="#4b5563" fontSize={9} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '10px' }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="earnings" stroke="#D97706" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEarnings)" name="Earnings ($)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recharts Bar Chart: Job counts per day */}
            <div className="bg-zinc-950 border border-slate-800 p-4 rounded-2xl space-y-3.5 text-left">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Jobs Completed</h4>
                  <p className="text-[8px] text-zinc-400">Total jobs completed each day of the week</p>
                </div>
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>

              <div className="h-32 w-full text-xs font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyEarningsData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="day" stroke="#4b5563" fontSize={9} />
                    <YAxis stroke="#4b5563" fontSize={9} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '10px' }}
                    />
                    <Bar dataKey="jobs" fill="#10B981" radius={[4, 4, 0, 0]} name="Completed Jobs" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Service Quality Performance Breakdown Card */}
            <div className="bg-zinc-950 border border-slate-800 p-4 rounded-2xl space-y-4 text-left">
              <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Service Quality & Strengths</span>
                  </h4>
                  <p className="text-[8px] text-zinc-400">Homeowner feedback metrics analyzed by dimension</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-xl text-[8px] font-mono uppercase font-black tracking-wider">
                  Top Strength: {(strengthData.find(d => d.score === Math.max(...strengthData.map(s => s.score)))?.subject || "Work Quality")}
                </div>
              </div>

              {/* Grid: Bar Chart and Star Rating Breakdown side-by-side on md/lg and stacked on small devices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Bar Chart */}
                <div className="bg-[#0C0C0C]/50 border border-slate-900 p-3 rounded-xl space-y-2">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider font-bold block">
                    Rating Score Breakdown (out of 5.0)
                  </span>
                  <div className="h-40 w-full text-xs font-mono">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={strengthData} 
                        layout="vertical"
                        margin={{ top: 5, right: 15, left: -20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                        <XAxis type="number" domain={[0, 5]} stroke="#4b5563" fontSize={8} />
                        <YAxis dataKey="subject" type="category" stroke="#4b5563" fontSize={8} width={80} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '10px' }}
                          formatter={(value: any) => [`${value} / 5.0`, 'Score']}
                        />
                        <Bar dataKey="score" fill="#F59E0B" radius={[0, 4, 4, 0]} name="Score" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Star Rating breakdown & feedback */}
                <div className="bg-[#0C0C0C]/50 border border-slate-900 p-3 rounded-xl flex flex-col justify-between space-y-2.5">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider font-bold block">
                    Strength Highlights & Assessment
                  </span>

                  <div className="space-y-2 flex-1">
                    {strengthData.map((dim, idx) => {
                      const isTopStrength = dim.score === Math.max(...strengthData.map(d => d.score));
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[9.5px] font-bold text-zinc-300 flex items-center gap-1">
                              {dim.subject}
                              {isTopStrength && (
                                <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[7px] font-mono px-1 rounded uppercase font-bold">
                                  Top
                                </span>
                              )}
                            </span>
                            <span className="text-[9px] font-mono font-bold text-white">{dim.score.toFixed(2)} / 5.0</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            {/* Custom star indicator */}
                            <div className="flex items-center space-x-0.5">
                              {Array.from({ length: 5 }).map((_, sIdx) => {
                                const starDiff = dim.score - sIdx;
                                const isFilled = starDiff >= 0.8;
                                const isHalf = starDiff > 0.2 && starDiff < 0.8;
                                return (
                                  <Star 
                                    key={sIdx} 
                                    className={`w-3 h-3 ${
                                      isFilled 
                                        ? "fill-amber-400 text-amber-400" 
                                        : isHalf 
                                        ? "fill-amber-400/50 text-amber-400/80" 
                                        : "text-zinc-800"
                                    }`} 
                                  />
                                );
                              })}
                            </div>
                            <span className="text-[8px] font-mono text-zinc-500">
                              {dim.score >= 4.8 ? "Outstanding" : dim.score >= 4.5 ? "Excellent" : "Satisfactory"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex items-start gap-1.5 bg-amber-500/10 p-2 rounded-lg border border-amber-500/10">
                    <ThumbsUp className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[8px] font-mono font-black text-amber-400 uppercase tracking-wide block">
                        Actionable Strength Insights
                      </span>
                      <p className="text-[9px] text-zinc-300 leading-normal">
                        Your highest dimension is <strong className="text-white">{(strengthData.find(d => d.score === Math.max(...strengthData.map(s => s.score)))?.subject || "Work Quality")}</strong>. Homeowners highly value your workmanship and thorough inspections. Response times are well-optimized. Keep providing physical feedback updates via the en route logs to elevate Communication even further.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Customer Review & Comments ledger */}
            <div className="bg-zinc-950 border border-slate-800 p-4 rounded-2xl space-y-4 text-left">
              <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                    <span>Customer Ratings & Comments</span>
                  </h4>
                  <p className="text-[8.5px] text-zinc-400">Directly measured homeowner performance feedbacks</p>
                </div>
                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-xl">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-black font-mono">{averageRating.toFixed(2)}</span>
                </div>
              </div>

              {/* Rating distribution matrix */}
              <div className="grid grid-cols-5 gap-1.5 text-center bg-[#0C0C0C]/50 p-2.5 border border-slate-900 rounded-xl">
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = reviewsList.filter(r => Math.round(r.rating) === stars).length;
                  const pct = reviewsList.length > 0 ? (count / reviewsList.length) * 100 : 0;
                  return (
                    <div key={stars} className="flex flex-col items-center">
                      <span className="text-[7.5px] font-mono text-zinc-500 uppercase">{stars} ★</span>
                      <div className="w-full bg-zinc-800 h-1.5 rounded mt-1 overflow-hidden">
                        <div className="bg-amber-500 h-full rounded" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="text-[8px] font-mono font-bold text-zinc-400 mt-0.5">{count}</span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {reviewsList.length === 0 ? (
                  <div className="p-6 text-center text-zinc-500 border border-dashed border-slate-800 rounded-xl text-[10px] font-mono">
                    No customer comments logged yet.
                  </div>
                ) : (
                  reviewsList.map((rev, idx) => (
                    <div key={rev.id || idx} className="p-3 bg-[#121212] border border-slate-900 rounded-xl space-y-1.5 hover:border-slate-800 transition-all">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[9px] font-mono font-bold text-amber-400">
                            {rev.userName.charAt(0)}
                          </div>
                          <span className="text-[10px] font-bold text-white">{rev.userName}</span>
                        </div>
                        <span className="text-[8px] font-mono text-zinc-500">{rev.date}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }).map((_, sIdx) => (
                          <Star 
                            key={sIdx} 
                            className={`w-2.5 h-2.5 ${
                              sIdx < Math.round(rev.rating) ? "fill-amber-400 text-amber-400" : "text-zinc-800"
                            }`} 
                          />
                        ))}
                        <span className="text-[9px] font-mono text-amber-400 font-bold ml-1">{rev.rating} / 5</span>
                      </div>

                      <p className="text-[10px] text-zinc-400 leading-normal italic pl-1 border-l border-amber-500/20">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: DISPATCH APPOINTMENTS QUEUE */}
        {activeTab === "appointments" && (
          <div className="space-y-3.5 animate-fade-in text-left">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Incoming Requests</h3>
                <p className="text-[8.5px] text-zinc-500">Real-time job requests from registered homeowners</p>
              </div>
              <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
                {pendingCount} REQUESTS PENDING
              </span>
            </div>

            <div className="space-y-3">
              {providerAppointments.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 border border-dashed border-slate-800 rounded-2xl font-mono text-[10px]">
                  No incoming job requests yet.
                </div>
              ) : (
                providerAppointments.map((appt) => (
                  <div key={appt.id} className="p-4 bg-zinc-900 border border-slate-800 rounded-2xl space-y-3 text-left hover:border-amber-500/20 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[8px] font-mono text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 font-bold uppercase">
                          {appt.providerSpecialty}
                        </span>
                        <h4 className="text-xs font-black text-white mt-1.5 leading-tight">{appt.providerName} Service Details</h4>
                        <p className="text-[9.5px] font-mono text-zinc-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                          <span>Homeowner Location</span>
                        </p>
                        <p className="text-[9.5px] font-mono text-zinc-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                          <span>Scheduled: {appt.date} at {appt.time}</span>
                        </p>
                      </div>

                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                        appt.status === "Completed" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : appt.status === "Rated"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : appt.status === "In Progress"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {appt.status}
                      </span>
                    </div>

                    {/* Homeowner Issue Description block */}
                    <div className="p-2.5 bg-zinc-950 border border-slate-800 rounded-xl space-y-1">
                      <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider font-bold">
                        Homeowner Reported Issue
                      </span>
                      <p className="text-[10px] text-zinc-300 leading-normal">
                        {appt.issueDescription || "No issue description provided."}
                      </p>
                    </div>

                    {/* Progress log timeline inside card */}
                    {appt.progressUpdates && appt.progressUpdates.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider block font-bold">
                          Progress Timeline & Follow-up Log
                        </span>
                        
                        <div className="relative pl-3 space-y-2 before:absolute before:left-1 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-slate-800 max-h-36 overflow-y-auto pr-1">
                          {appt.progressUpdates.map((update, idx) => (
                            <div key={idx} className="relative flex items-start space-x-2">
                              <div className="absolute -left-[14px] mt-1 w-1.5 h-1.5 bg-amber-500 rounded-full border border-[#0A0A0A]"></div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500">
                                  <span className="font-bold uppercase tracking-wide text-amber-400">{update.status}</span>
                                  <span>{new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-[9px] text-zinc-300 leading-normal mt-0.5">
                                  {update.message}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add progress update dispatcher form */}
                    {appt.status !== "Completed" && appt.status !== "Rated" && (
                      <div className="bg-[#0A0A0A]/60 border border-slate-800 p-2.5 rounded-xl space-y-2 mt-2">
                        <span className="text-[8.5px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                          Dispatch Custom Follow-Up Progress Log
                        </span>
                        
                        <div className="grid grid-cols-2 gap-2 text-[9px]">
                          <div>
                            <label className="block text-[7.5px] font-mono text-zinc-500 uppercase mb-1">Set New Status</label>
                            <select
                              value={followUpStatuses[appt.id] || "Keep"}
                              onChange={(e) => setFollowUpStatuses(prev => ({ ...prev, [appt.id]: e.target.value }))}
                              className="w-full bg-[#121212] border border-slate-800 rounded px-1.5 py-1 text-white text-[9px] focus:outline-none focus:border-amber-500 cursor-pointer"
                            >
                              <option value="Keep">Keep Current ({appt.status})</option>
                              <option value="Scheduled">Scheduled (Confirmed)</option>
                              <option value="In Progress">In Progress (Active)</option>
                              <option value="Completed">Completed (Finalized)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[7.5px] font-mono text-zinc-500 uppercase mb-1">Quick Presets</label>
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  setFollowUpTexts(prev => ({ ...prev, [appt.id]: e.target.value }));
                                  e.target.value = ""; // Reset
                                }
                              }}
                              className="w-full bg-[#121212] border border-slate-800 rounded px-1.5 py-1 text-white text-[9px] focus:outline-none cursor-pointer"
                            >
                              <option value="">-- Choose preset --</option>
                              <option value="Technician is dispatched and on route to homeowner location.">Service truck en route</option>
                              <option value="Initial diagnostic checks completed. Commencing physical calibrations.">Diagnostics complete</option>
                              <option value="Replacement fan assembly ordered from regional warehouse. ETA next business day.">Parts ordered</option>
                              <option value="All calibrations completed and diagnostics cleared. Home longevity checks passed.">Service finalized</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[7.5px] font-mono text-zinc-500 uppercase mb-1">Custom Progress Message</label>
                          <textarea
                            rows={1}
                            value={followUpTexts[appt.id] || ""}
                            onChange={(e) => setFollowUpTexts(prev => ({ ...prev, [appt.id]: e.target.value }))}
                            placeholder="Type current work logs or follow-up notes..."
                            className="w-full bg-[#121212] border border-slate-800 rounded p-1.5 text-[9.5px] text-white focus:outline-none focus:border-amber-500 placeholder-zinc-600"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddProgressUpdate(appt.id)}
                          className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-[8.5px] rounded uppercase tracking-wider transition-colors cursor-pointer text-center"
                        >
                          Send Log & Update Owner
                        </button>
                      </div>
                    )}

                    {/* User Rating & Feedback for Completed/Rated appointments */}
                    {(appt.status === "Rated" || appt.userRating) && (
                      <div className="bg-amber-500/5 border border-amber-500/15 p-3 rounded-xl space-y-1.5 text-left mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[8.5px] text-amber-400 font-mono font-bold uppercase tracking-wider">
                            Homeowner Performance Assessment
                          </span>
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-[10px] font-mono font-bold text-white">{appt.userRating} / 5</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-zinc-300 italic leading-normal pl-2 border-l border-amber-500/30">
                          "{appt.userComment || "No comment provided."}"
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t border-slate-800/60">
                      {appt.status === "Requested" && (
                        <>
                          <button
                            onClick={() => handleStatusChange(appt.id, "In Progress")}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-[9px] py-1.5 rounded-lg uppercase tracking-wider text-center cursor-pointer transition-colors"
                          >
                            Accept Request
                          </button>
                          <button
                            onClick={() => handleStatusChange(appt.id, "Completed")}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-[9px] py-1.5 rounded-lg uppercase tracking-wider text-center cursor-pointer transition-colors"
                          >
                            Mark Completed
                          </button>
                        </>
                      )}
                      {appt.status === "In Progress" && (
                        <button
                          onClick={() => handleStatusChange(appt.id, "Completed")}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-[9px] py-1.5 rounded-lg uppercase tracking-wider text-center cursor-pointer transition-colors"
                        >
                          Complete Job & Request Payment ($150)
                        </button>
                      )}
                      {(appt.status === "Completed" || appt.status === "Rated") && (
                        <div className="w-full text-center text-[9px] font-mono text-zinc-500 bg-zinc-950 py-1.5 rounded-lg border border-slate-800">
                          ✓ Job completed and payment requested.
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: CLIENT BILLING & INVOICING TOOL */}
        {activeTab === "billing" && (
          <div className="p-4 bg-zinc-950 border border-slate-800 rounded-2xl space-y-4 animate-fade-in text-left">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Send a Bill</h3>
            </div>

            <p className="text-[9.5px] text-zinc-400 leading-normal">
              Bill homeowners for your services. A standard 18% platform fee will be deducted from your total payout.
            </p>

            {invoiceSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono rounded-xl flex items-center space-x-2 animate-pulse">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Bill sent successfully to the homeowner!</span>
              </div>
            )}

            <form onSubmit={handleCreateInvoice} className="space-y-3 pt-1 text-xs">
              <div>
                <label className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Select Homeowner</label>
                <select
                  value={invoiceClient}
                  onChange={(e) => setInvoiceClient(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                >
                  <option value="usr_1">Marcus Vance (temf2006@gmail.com)</option>
                  <option value="usr_2">Jane Doe (jane.doe@example.com)</option>
                  <option value="usr_3">Arthur Pendragon (arthur@royalhome.co.uk)</option>
                </select>
              </div>

              <div>
                <label className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Itemized Description of Service</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cleared HVAC condenser line clog and refilled refrigerant R-410A"
                  value={invoiceDesc}
                  onChange={(e) => setInvoiceDesc(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Labor Cost ($)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={invoiceLabor}
                    onChange={(e) => setInvoiceLabor(Number(e.target.value))}
                    className="w-full bg-[#0A0A0A] border border-slate-800 rounded-lg p-2 text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Material Costs ($)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={invoiceMaterials}
                    onChange={(e) => setInvoiceMaterials(Number(e.target.value))}
                    className="w-full bg-[#0A0A0A] border border-slate-800 rounded-lg p-2 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Financial calculations review */}
              <div className="bg-[#0A0A0A] p-3 border border-slate-900 rounded-xl space-y-1.5 font-mono text-[10px] text-zinc-400">
                <div className="flex justify-between">
                  <span>Total Bill:</span>
                  <strong className="text-white">${invoiceLabor + invoiceMaterials}.00</strong>
                </div>
                <div className="flex justify-between text-red-400/80">
                  <span>Platform Fee (18%):</span>
                  <span>-${((invoiceLabor + invoiceMaterials) * 0.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-900 pt-1.5 text-xs text-emerald-400 font-bold">
                  <span>Your Payout:</span>
                  <span>${((invoiceLabor + invoiceMaterials) * 0.82).toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-mono font-bold text-[10px] py-2.5 rounded-xl transition-all shadow-md uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-white" />
                <span>Send Bill</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: SETTINGS & SPECIALTY EDITING */}
        {activeTab === "profile" && (
          <div className="p-4 bg-zinc-950 border border-slate-800 rounded-2xl space-y-4 animate-fade-in text-left">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Update Business Settings</h3>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Business or Company Name</label>
                <input
                  type="text"
                  required
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Service Area</label>
                  <select
                    value={editSpecialty}
                    onChange={(e) => setEditSpecialty(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                  >
                    <option value="HVAC">Heating & Cooling</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Appliances">Appliances</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Hourly Service Rate ($)</label>
                  <input
                    type="number"
                    min="40"
                    max="500"
                    required
                    value={editRate}
                    onChange={(e) => setEditRate(Number(e.target.value))}
                    className="w-full bg-[#0A0A0A] border border-slate-800 rounded-lg p-2 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-[10px] py-2.5 rounded-xl transition-all shadow-md uppercase tracking-wider cursor-pointer"
              >
                Save Settings
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
