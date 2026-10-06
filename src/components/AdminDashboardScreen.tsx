import React from "react";
import { 
  Users, 
  DollarSign, 
  LifeBuoy, 
  Briefcase, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  PlusCircle, 
  TrendingUp, 
  Download, 
  Sliders, 
  ChevronRight, 
  Trash2, 
  Check, 
  X, 
  Search, 
  Filter, 
  ShieldAlert, 
  RefreshCw, 
  Lock, 
  Mail, 
  UserPlus, 
  Settings, 
  CornerDownRight, 
  FileText,
  Server,
  Coins,
  FileSpreadsheet,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { StakeholderUser } from "./StakeholderScreen";
import { RecommendedProvider, ProAppointment } from "../types";

interface AdminDashboardScreenProps {
  currentUser: StakeholderUser;
  onNavigateToScreen: (screenId: string) => void;
  onLogout: () => void;
  providers: RecommendedProvider[];
  onUpdateProviders: (updated: RecommendedProvider[]) => void;
  appointments: ProAppointment[];
  onUpdateAppointments: (updated: ProAppointment[]) => void;
  addToast: (title: string, description: string, type: "task" | "risk" | "info" | "success") => void;
  onUpdateCurrentUser?: (updated: StakeholderUser) => void;
}

// Support ticket interface
interface SupportTicket {
  id: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: "Billing" | "System Connection" | "Contractor" | "General";
  priority: "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Resolved";
  createdAt: string;
  messages: { sender: "user" | "admin"; text: string; time: string }[];
}

export default function AdminDashboardScreen({
  currentUser,
  onNavigateToScreen,
  onLogout,
  providers,
  onUpdateProviders,
  appointments,
  onUpdateAppointments,
  addToast,
  onUpdateCurrentUser
}: AdminDashboardScreenProps) {
  // Navigation inside admin dashboard
  const [activeAdminTab, setActiveAdminTab] = React.useState<"overview" | "users" | "income" | "providers" | "tickets" | "tasks" | "admins">("overview");

  // Administrators Management state
  const [adminsList, setAdminsList] = React.useState([
    { id: "adm_1", name: currentUser.name || "Master Admin Vance", email: currentUser.email || "admin@homepulse.io", password: "admin", lastActive: "Just Now", status: "Active" },
    { id: "adm_2", name: "Support Admin Connor", email: "sarah@cyberdyne.net", password: "admin", lastActive: "2 hours ago", status: "Active" },
    { id: "adm_3", name: "Arthur Pendragon Support", email: "arthur@royalhome.co.uk", password: "admin", lastActive: "1 day ago", status: "Suspended" }
  ]);

  // Editing Admin state
  const [editingAdminId, setEditingAdminId] = React.useState<string | null>(null);
  const [editAdminName, setEditAdminName] = React.useState("");
  const [editAdminEmail, setEditAdminEmail] = React.useState("");
  const [editAdminPassword, setEditAdminPassword] = React.useState("");
  const [editAdminStatus, setEditAdminStatus] = React.useState("Active");

  // Creating Admin state
  const [isCreatingAdmin, setIsCreatingAdmin] = React.useState(false);
  const [newAdminName, setNewAdminName] = React.useState("");
  const [newAdminEmail, setNewAdminEmail] = React.useState("");
  const [newAdminPassword, setNewAdminPassword] = React.useState("");

  // Logged-in admin account credentials editing states
  const [currentAdminName, setCurrentAdminName] = React.useState(currentUser.name || "");
  const [currentAdminEmail, setCurrentAdminEmail] = React.useState(currentUser.email || "");
  const [currentAdminPassword, setCurrentAdminPassword] = React.useState("");

  // Mock initial users list for app management
  const [adminUsers, setAdminUsers] = React.useState([
    { id: "usr_1", name: "Marcus Vance", email: "temf2006@gmail.com", role: "homeowner", tier: "Basic", status: "Active", dateJoined: "2026-01-10", totalSpend: 280 },
    { id: "usr_2", name: "Jane Doe", email: "jane.doe@example.com", role: "homeowner", tier: "Free", status: "Active", dateJoined: "2026-03-24", totalSpend: 0 },
    { id: "usr_3", name: "Arthur Pendragon", email: "arthur@royalhome.co.uk", role: "homeowner", tier: "Enterprise", status: "Active", dateJoined: "2026-05-15", totalSpend: 740 },
    { id: "usr_4", name: "Sarah Connor", email: "sarah@cyberdyne.net", role: "homeowner", tier: "Pro", status: "Active", dateJoined: "2026-06-02", totalSpend: 114 },
    { id: "usr_5", name: "John Connor", email: "john@techcom.org", role: "homeowner", tier: "Pro", status: "Suspended", dateJoined: "2026-06-12", totalSpend: 38 },
    { id: "usr_pro_1", name: "Seattle Air & Heating", email: "service@seattleair.com", role: "provider", tier: "Free", status: "Active", dateJoined: "2025-11-01", totalSpend: 0 },
    { id: "usr_pro_2", name: "Apex Leak Solvers", email: "leakproof@gmail.com", role: "provider", tier: "Free", status: "Active", dateJoined: "2026-02-18", totalSpend: 0 },
    { id: "usr_pro_3", name: "Sparky Electric LLC", email: "sparky@electrician.com", role: "provider", tier: "Free", status: "Pending", dateJoined: "2026-06-29", totalSpend: 0 }
  ]);

  // Support Tickets database state
  const [tickets, setTickets] = React.useState<SupportTicket[]>([
    {
      id: "TCK-402",
      userName: "Marcus Vance",
      userEmail: "temf2006@gmail.com",
      subject: "Air Filter sync issue - says 0% remaining but I just replaced it",
      category: "System Connection",
      priority: "High",
      status: "Open",
      createdAt: "2026-07-06 09:15",
      messages: [
        { sender: "user", text: "Hi, I just replaced my physical MERV-11 filter last night and tapped calibrate. The system level is still indicating 0% capacity and blinking red. Please verify sensor sync status.", time: "09:15" }
      ]
    },
    {
      id: "TCK-403",
      userName: "Jane Doe",
      userEmail: "jane.doe@example.com",
      subject: "Google Login throws warning in development sandbox",
      category: "General",
      priority: "Medium",
      status: "In Progress",
      createdAt: "2026-07-06 14:30",
      messages: [
        { sender: "user", text: "When authenticating via Google OAuth, the console warning indicates third-party cookie restrictions in the container sandbox. Can this be resolved?", time: "14:30" },
        { sender: "admin", text: "Thanks for reporting. We have noted this. In standard production domains, these iframe sandbox cookie restrictions are bypassed automatically.", time: "15:05" }
      ]
    },
    {
      id: "TCK-401",
      userName: "Arthur Pendragon",
      userEmail: "arthur@royalhome.co.uk",
      subject: "Requesting custom contractor for attic ventilation upgrade",
      category: "Contractor",
      priority: "Low",
      status: "Resolved",
      createdAt: "2026-07-05 11:10",
      messages: [
        { sender: "user", text: "Looking for a certified contractor who can execute an attic ridge ventilation upgrade. None listed in my local zip code catalog.", time: "11:10" },
        { sender: "admin", text: "We have manually matched and assigned Seattle Air & Heating to your profile. They are qualified for active solar ridge ventilation upgrades and will contact you shortly.", time: "13:20" },
        { sender: "user", text: "Brilliant! Thank you for the fast response.", time: "13:45" }
      ]
    },
    {
      id: "TCK-404",
      userName: "Seattle Air & Heating",
      userEmail: "service@seattleair.com",
      subject: "Provider commission rate billing adjustment query",
      category: "Billing",
      priority: "Medium",
      status: "Open",
      createdAt: "2026-07-07 10:05",
      messages: [
        { sender: "user", text: "Hello, our team noticed the standard booking commission changed from 15% to 18%. Can you verify when this billing schedule update took effect?", time: "10:05" }
      ]
    }
  ]);

  // Pricing plans revenue metrics
  const [platformCommissionRate, setPlatformCommissionRate] = React.useState<number>(18);
  const [pricingTiers, setPricingTiers] = React.useState([
    { name: "SaaS Basic Care (Free)", users: 4, monthlyPrice: 0 },
    { name: "HomePulse Pro", users: 18, monthlyPrice: 19 },
    { name: "Enterprise Shield", users: 7, monthlyPrice: 49 }
  ]);

  // Income stream models: Subscriptions, commissions (from provider bookings), marketplace sales
  const incomeStreams = [
    { name: "SaaS Subscriptions", amount: 18 * 19 + 7 * 49, color: "#3B82F6", percent: 55 },
    { name: "Provider Commissions", amount: 1420, color: "#10B981", percent: 30 },
    { name: "Supply Store Purchases", amount: 680, color: "#8B5CF6", percent: 15 }
  ];

  const totalIncome = incomeStreams.reduce((acc, curr) => acc + curr.amount, 0);

  // Search & Filter state variables
  const [userSearchText, setUserSearchText] = React.useState("");
  const [userRoleFilter, setUserRoleFilter] = React.useState<string>("all");
  const [providerSearchText, setProviderSearchText] = React.useState("");

  // Create User Form State
  const [isCreatingUser, setIsCreatingUser] = React.useState(false);
  const [newUserName, setNewUserName] = React.useState("");
  const [newUserEmail, setNewUserEmail] = React.useState("");
  const [newUserRole, setNewUserRole] = React.useState("homeowner");
  const [newUserTier, setNewUserTier] = React.useState("Basic");

  // Create Provider Form State
  const [isCreatingProvider, setIsCreatingProvider] = React.useState(false);
  const [newProName, setNewProName] = React.useState("");
  const [newProSpecialty, setNewProSpecialty] = React.useState("HVAC");
  const [newProRate, setNewProRate] = React.useState(120);
  const [newProPhone, setNewProPhone] = React.useState("");

  // Support interaction state
  const [selectedTicketId, setSelectedTicketId] = React.useState<string | null>(null);
  const [adminTicketReply, setAdminTicketReply] = React.useState("");

  // Audit Logs database
  const [auditLogs, setAuditLogs] = React.useState([
    { id: "LOG_01", timestamp: "2026-07-07 15:42:10", action: "System Backup", operator: "System cron", status: "Success", details: "Daily firestore.blueprint.json snap recovery generated." },
    { id: "LOG_02", timestamp: "2026-07-07 14:15:00", action: "User Upgraded", operator: "Master Admin Vance", status: "Success", details: "Upgraded 'sarah@cyberdyne.net' to Pro SaaS tier." },
    { id: "LOG_03", timestamp: "2026-07-07 11:24:50", action: "SLA Adjusted", operator: "Master Admin Vance", status: "Updated", details: "Adjusted primary partner commission schedule to 18%." },
    { id: "LOG_04", timestamp: "2026-07-07 09:12:05", action: "User Suspended", operator: "Security service", status: "Warning", details: "Suspended John Connor due to suspicious device replication queries." }
  ]);

  // DB Backup simulation triggers
  const [isBackingUp, setIsBackingUp] = React.useState(false);

  // Users CRUD helper handlers
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    const newUser = {
      id: `usr_${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      tier: newUserTier,
      status: "Active",
      dateJoined: new Date().toISOString().split('T')[0],
      totalSpend: newUserTier === "Enterprise" ? 49 : newUserTier === "Pro" ? 19 : 0
    };

    setAdminUsers(prev => [newUser, ...prev]);
    setIsCreatingUser(false);
    setNewUserName("");
    setNewUserEmail("");
    
    // Add dynamic audit log
    const newLog = {
      id: `LOG_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action: "User Created",
      operator: "Master Admin Vance",
      status: "Success",
      details: `Created new ${newUserRole} account for '${newUserEmail}' at ${newUserTier} tier.`
    };
    setAuditLogs(prev => [newLog, ...prev]);

    addToast("User Created Successfully", `Account for ${newUser.name} is now active.`, "success");
  };

  const handleToggleUserStatus = (userId: string) => {
    setAdminUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === "Active" ? "Suspended" : "Active";
        addToast(
          nextStatus === "Active" ? "Account Re-activated" : "Account Suspended",
          `User status has been altered successfully.`,
          nextStatus === "Active" ? "success" : "info"
        );
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleUpgradeUserTier = (userId: string, nextTier: string) => {
    setAdminUsers(prev => prev.map(u => {
      if (u.id === userId) {
        addToast("SaaS Tier Upgraded", `${u.name} upgraded to ${nextTier} plan.`, "success");
        return { ...u, tier: nextTier };
      }
      return u;
    }));
  };

  const handleDeleteUser = (userId: string) => {
    const targetUser = adminUsers.find(u => u.id === userId);
    if (!targetUser) return;
    if (confirm(`Are you sure you want to permanently delete user ${targetUser.name}?`)) {
      setAdminUsers(prev => prev.filter(u => u.id !== userId));
      addToast("User Deleted", `Permanently wiped record for ${targetUser.name}`, "info");
      
      const newLog = {
        id: `LOG_${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        action: "User Deleted",
        operator: "Master Admin Vance",
        status: "Deleted",
        details: `Deleted account associated with email '${targetUser.email}'.`
      };
      setAuditLogs(prev => [newLog, ...prev]);
    }
  };

  // Support Desk Handlers
  const handleSendTicketReply = (ticketId: string) => {
    if (!adminTicketReply.trim()) return;

    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: "In Progress" as const,
          messages: [
            ...t.messages,
            {
              sender: "admin",
              text: adminTicketReply,
              time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
            }
          ]
        };
      }
      return t;
    }));

    setAdminTicketReply("");
    addToast("Reply Sent", "Your response has been dispatched to the client portal.", "success");
  };

  const handleUpdateTicketStatus = (ticketId: string, status: "Open" | "In Progress" | "Resolved") => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        addToast("Ticket Status Updated", `Ticket ${ticketId} marked as ${status}.`, "info");
        return { ...t, status };
      }
      return t;
    }));
  };

  // Provider / Contractor CRUD Helper Handlers
  const handleCreateProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProName || !newProPhone) return;

    const newProvider: RecommendedProvider = {
      id: `prov_${Date.now()}`,
      name: newProName,
      specialty: newProSpecialty,
      rating: 4.8,
      completedJobs: 0,
      ratePerHour: newProRate,
      responseTime: "Immediate",
      contactNumber: newProPhone,
      avatar: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=120&h=120&q=80",
      reviews: []
    };

    onUpdateProviders([newProvider, ...providers]);
    setIsCreatingProvider(false);
    setNewProName("");
    setNewProPhone("");

    // Create a shadow User account so provider can authenticate
    const proUser = {
      id: `usr_pro_${Date.now()}`,
      name: newProName,
      email: `${newProName.toLowerCase().replace(/\s+/g, '')}@providers.homepulse.io`,
      role: "provider",
      tier: "Free",
      status: "Active",
      dateJoined: new Date().toISOString().split('T')[0],
      totalSpend: 0
    };
    setAdminUsers(prev => [...prev, proUser]);

    const newLog = {
      id: `LOG_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action: "Contractor Registered",
      operator: "Master Admin Vance",
      status: "Success",
      details: `Registered new service provider partner: '${newProName}' specializing in ${newProSpecialty}.`
    };
    setAuditLogs(prev => [newLog, ...prev]);

    addToast("Provider SLA Activated", `${newProName} added as partner contractor.`, "success");
  };

  // Simulated backup
  const handleTriggerBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      addToast(
        "Durable Backup Success",
        "Encrypted database snapshots successfully stored in cold-vault storage.",
        "success"
      );
      
      const newLog = {
        id: `LOG_${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        action: "Manual Backup",
        operator: "Master Admin Vance",
        status: "Success",
        details: `Created on-demand snapshots containing ${adminUsers.length} users, ${tickets.length} tickets, and ${providers.length} provider SLAs.`
      };
      setAuditLogs(prev => [newLog, ...prev]);
    }, 1500);
  };

  // Filtered lists
  const filteredUsers = adminUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(userSearchText.toLowerCase()) || 
                        u.email.toLowerCase().includes(userSearchText.toLowerCase());
    const matchRole = userRoleFilter === "all" || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  const filteredProviders = providers.filter(p => {
    return p.name.toLowerCase().includes(providerSearchText.toLowerCase()) ||
           p.specialty.toLowerCase().includes(providerSearchText.toLowerCase());
  });

  // Calculate current open tickets
  const openTicketsCount = tickets.filter(t => t.status !== "Resolved").length;

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0A0A0A] text-white font-sans relative select-none">
      
      {/* Top Admin Header Bar */}
      <div className="px-5 py-3.5 bg-[#111827] border-b border-slate-800 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center border border-red-500/30">
            <ShieldAlert className="w-4.5 h-4.5 text-white animate-pulse" />
          </div>
          <div className="text-left">
            <h1 className="text-xs font-black tracking-tight text-white uppercase">App Admin Console</h1>
            <p className="text-[8.5px] font-mono text-red-400">SESSION: SECURE MASTER DEPLOY</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[8px] font-mono font-bold bg-zinc-950 px-2 py-1 rounded text-zinc-400 border border-slate-800">
            {currentUser.name}
          </span>
          <button 
            onClick={onLogout}
            className="p-1 px-2.5 bg-red-950/40 hover:bg-red-950 text-red-400 rounded-lg border border-red-500/20 text-[9px] font-mono font-bold cursor-pointer transition-colors"
          >
            LOGOUT
          </button>
        </div>
      </div>

      {/* Main Admin Screen Scroll Space */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 text-left">
        
        {/* TAB 1: OVERVIEW & REPORTS */}
        {activeAdminTab === "overview" && (
          <div className="space-y-4 animate-fadeIn">
            {/* KPI grid cards */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-[#111A24]/60 border border-slate-800 p-3 rounded-2xl">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[8.5px] uppercase font-mono">Gross Total Income</span>
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-black text-white mt-1 font-mono">${totalIncome.toLocaleString()}</h3>
                <span className="text-[7.5px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +24.5% OVER PREVIOUS MONTH
                </span>
              </div>

              <div className="bg-[#111A24]/60 border border-slate-800 p-3 rounded-2xl">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[8.5px] uppercase font-mono">Total Active Accounts</span>
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <h3 className="text-lg font-black text-white mt-1 font-mono">{adminUsers.length}</h3>
                <span className="text-[7.5px] text-blue-400 font-mono mt-0.5 block">
                  3 PROVIDERS / 5 HOMEOWNERS
                </span>
              </div>

              <div className="bg-[#111A24]/60 border border-slate-800 p-3 rounded-2xl">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[8.5px] uppercase font-mono">Customer Support Desk</span>
                  <LifeBuoy className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <h3 className="text-lg font-black text-white mt-1 font-mono">{openTicketsCount} <span className="text-[10px] text-zinc-500 font-normal">Active</span></h3>
                <span className="text-[7.5px] text-amber-400 font-mono mt-0.5 block">
                  1 TICKET PENDING DEV REPLY
                </span>
              </div>

              <div className="bg-[#111A24]/60 border border-slate-800 p-3 rounded-2xl">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[8.5px] uppercase font-mono">SLA Contractor Network</span>
                  <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <h3 className="text-lg font-black text-white mt-1 font-mono">{providers.length}</h3>
                <span className="text-[7.5px] text-emerald-400 font-mono mt-0.5 block flex items-center gap-0.5">
                  <Check className="w-3 h-3" />
                  100% REGULATORY INSURANCE MATCH
                </span>
              </div>
            </div>

            {/* Income Streams Graphical Representation */}
            <div className="bg-[#111A24]/60 border border-slate-800 p-4 rounded-2xl space-y-3.5">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Dynamic Revenue Streams Breakdown</h4>
                  <p className="text-[8px] text-zinc-400">YTD generated income allocation</p>
                </div>
                <Coins className="w-4 h-4 text-zinc-500" />
              </div>

              {/* Custom SVG Graphical Donut/Chart presentation */}
              <div className="flex items-center justify-around bg-black/40 p-4 rounded-xl border border-slate-800/50">
                {/* SVG Radial Arc Chart */}
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1f2937" strokeWidth="3" />
                  
                  {/* Stream 1 (Subscriptions) - 55% */}
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="15.915" 
                    fill="none" 
                    stroke="#3B82F6" 
                    strokeWidth="3.2" 
                    strokeDasharray="55 45" 
                    strokeDashoffset="0" 
                  />

                  {/* Stream 2 (Commissions) - 30% */}
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="15.915" 
                    fill="none" 
                    stroke="#10B981" 
                    strokeWidth="3.2" 
                    strokeDasharray="30 70" 
                    strokeDashoffset="-55" 
                  />

                  {/* Stream 3 (Marketplace Store) - 15% */}
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="15.915" 
                    fill="none" 
                    stroke="#8B5CF6" 
                    strokeWidth="3.2" 
                    strokeDasharray="15 85" 
                    strokeDashoffset="-85" 
                  />
                </svg>

                {/* Legend list with actual amounts */}
                <div className="space-y-1.5 flex-1 pl-4">
                  {incomeStreams.map((stream, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[10px] font-mono">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stream.color }}></span>
                        <span className="text-zinc-400 truncate max-w-[100px]">{stream.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-bold">${stream.amount}</span>
                        <span className="text-zinc-500 text-[8px] ml-1">({stream.percent}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Platform Subscriptions Growth Chart */}
            <div className="bg-[#111A24]/60 border border-slate-800 p-4 rounded-2xl space-y-3.5">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Historical Account Growth Audit</h4>
                <p className="text-[8px] text-zinc-400">Quarterly subscription onboarding tracker</p>
              </div>

              {/* Custom Line Curve SVG Visual presentation */}
              <div className="bg-black/30 border border-slate-800/40 p-3 rounded-xl relative">
                <svg viewBox="0 0 300 90" className="w-full h-auto">
                  {/* Grid Lines */}
                  <line x1="10" y1="10" x2="290" y2="10" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="10" y1="45" x2="290" y2="45" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="10" y1="80" x2="290" y2="80" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />

                  {/* Trend Area Fill */}
                  <path 
                    d="M 10 75 Q 70 65 130 50 T 250 25 L 290 15 L 290 80 L 10 80 Z" 
                    fill="url(#blue-gradient)" 
                    opacity="0.12" 
                  />

                  {/* Trend Line */}
                  <path 
                    d="M 10 75 Q 70 65 130 50 T 250 25 L 290 15" 
                    fill="none" 
                    stroke="#3B82F6" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                  />

                  {/* Checkpoints */}
                  <circle cx="10" cy="75" r="3" fill="#3B82F6" stroke="#0a0a0a" strokeWidth="1" />
                  <circle cx="90" cy="62" r="3" fill="#3B82F6" stroke="#0a0a0a" strokeWidth="1" />
                  <circle cx="170" cy="40" r="3" fill="#3B82F6" stroke="#0a0a0a" strokeWidth="1" />
                  <circle cx="250" cy="25" r="3" fill="#3B82F6" stroke="#0a0a0a" strokeWidth="1" />
                  <circle cx="290" cy="15" r="3.5" fill="#EF4444" stroke="#0a0a0a" strokeWidth="1" className="animate-pulse" />

                  {/* Text Markers */}
                  <text x="10" y="88" fill="#64748b" fontSize="6.5" fontStyle="mono">Jan '26</text>
                  <text x="90" y="88" fill="#64748b" fontSize="6.5" fontStyle="mono">Mar '26</text>
                  <text x="170" y="88" fill="#64748b" fontSize="6.5" fontStyle="mono">May '26</text>
                  <text x="250" y="88" fill="#64748b" fontSize="6.5" fontStyle="mono">Jul '26</text>
                  
                  <defs>
                    <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute top-2.5 right-2.5 bg-zinc-950/80 border border-slate-800/80 px-2 py-0.5 rounded text-[7.5px] font-mono text-emerald-400">
                  HEALTH COEFFICIENT: 96% ACCURATE
                </div>
              </div>
            </div>

            {/* Quick Action Tasks Shortcut Panel */}
            <div className="bg-[#111A24]/60 border border-slate-800 p-4 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Fast Admin Commands</h4>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <button 
                  onClick={handleTriggerBackup}
                  disabled={isBackingUp}
                  className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-slate-800 rounded-xl text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isBackingUp ? "animate-spin" : ""}`} />
                  <span>{isBackingUp ? "Saving Backups..." : "Backup Databases"}</span>
                </button>
                <button 
                  onClick={() => setActiveAdminTab("tickets")}
                  className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-slate-800 rounded-xl text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LifeBuoy className="w-3.5 h-3.5 text-purple-400" />
                  <span>Inspect tickets</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE ALL USERS */}
        {activeAdminTab === "users" && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* Control Header & Filters */}
            <div className="flex flex-col gap-2 bg-[#111A24]/40 p-3.5 rounded-2xl border border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={userSearchText}
                  onChange={(e) => setUserSearchText(e.target.value)}
                  className="w-full bg-zinc-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-zinc-400">
                  <Filter className="w-3.5 h-3.5 text-blue-400" />
                  <span>Role:</span>
                  <select 
                    value={userRoleFilter} 
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="bg-zinc-900 border border-slate-800 rounded px-1.5 py-0.5 text-[9.5px] text-zinc-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="all">All Roles</option>
                    <option value="homeowner">Homeowners</option>
                    <option value="provider">Contractor/Provider</option>
                    <option value="admin">Administrators</option>
                  </select>
                </div>

                <button
                  onClick={() => setIsCreatingUser(!isCreatingUser)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-wider py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create User</span>
                </button>
              </div>
            </div>

            {/* Create User Form Drawer/Modal Inline */}
            <AnimatePresence>
              {isCreatingUser && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateUser}
                  className="bg-[#111A24]/90 border border-blue-500/30 rounded-2xl p-4 space-y-3 shadow-lg text-left overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4" /> Register New Account
                    </h5>
                    <button 
                      type="button" 
                      onClick={() => setIsCreatingUser(false)} 
                      className="p-1 text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[8.5px] font-mono font-bold text-zinc-400 uppercase tracking-wide block mb-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Sarah Connor"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="w-full bg-zinc-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[8.5px] font-mono font-bold text-zinc-400 uppercase tracking-wide block mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="e.g. sarah@cyberdyne.net"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="w-full bg-zinc-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[8.5px] font-mono font-bold text-zinc-400 uppercase tracking-wide block mb-1">Role Type</label>
                        <select
                          value={newUserRole}
                          onChange={(e) => setNewUserRole(e.target.value)}
                          className="w-full bg-zinc-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="homeowner">Homeowner</option>
                          <option value="provider">Contractor Pro</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[8.5px] font-mono font-bold text-zinc-400 uppercase tracking-wide block mb-1">Initial Plan Tier</label>
                        <select
                          value={newUserTier}
                          onChange={(e) => setNewUserTier(e.target.value)}
                          className="w-full bg-zinc-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="Free">Free</option>
                          <option value="Basic">Basic</option>
                          <option value="Pro">Pro Premium</option>
                          <option value="Enterprise">Enterprise</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-colors uppercase tracking-wider"
                  >
                    Activate Account
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Users dynamic table list */}
            <div className="bg-[#111A24]/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-3 bg-zinc-900 border-b border-slate-800 flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Active Accounts Directory</span>
                <span className="text-[8px] font-mono text-zinc-500 bg-black/40 px-2 py-0.5 rounded border border-slate-800/60">
                  Showing {filteredUsers.length} of {adminUsers.length} records
                </span>
              </div>

              <div className="divide-y divide-slate-800/60">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 text-xs font-mono">
                    No accounts match the active filter criteria.
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div key={user.id} className="p-3.5 flex flex-col gap-2 hover:bg-[#101824]/30 transition-colors">
                      {/* Name and primary info */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-white">{user.name}</h4>
                            <span className={`text-[7px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              user.role === 'admin' 
                                ? 'bg-red-500/15 text-red-400 border border-red-500/20' 
                                : user.role === 'provider' 
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' 
                                : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                            }`}>
                              {user.role}
                            </span>
                            <span className={`text-[7px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              user.tier === 'Enterprise' 
                                ? 'bg-purple-500/20 text-purple-300' 
                                : user.tier === 'Pro' 
                                ? 'bg-indigo-500/20 text-indigo-300' 
                                : 'bg-zinc-800 text-zinc-400'
                            }`}>
                              {user.tier}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-zinc-600" />
                            {user.email}
                          </span>
                        </div>

                        {/* Status badge */}
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></span>
                          <span className="text-[9px] font-mono uppercase font-bold text-zinc-400">{user.status}</span>
                        </div>
                      </div>

                      {/* Spend details & Action menu row */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/40 text-[9.5px] font-mono">
                        <span className="text-zinc-500">
                          YTD LTV spend: <strong className="text-emerald-400">${user.totalSpend}</strong>
                        </span>

                        <div className="flex items-center space-x-1.5">
                          {/* Upgrade tier options */}
                          {user.role === "homeowner" && user.tier !== "Enterprise" && (
                            <button
                              onClick={() => handleUpgradeUserTier(user.id, user.tier === "Free" ? "Basic" : user.tier === "Basic" ? "Pro" : "Enterprise")}
                              className="px-1.5 py-0.5 bg-blue-950/60 hover:bg-blue-900 text-blue-400 hover:text-blue-300 border border-blue-500/20 rounded text-[8.5px] cursor-pointer"
                              title="Upgrade to next tier plan"
                            >
                              Upgrade Plan
                            </button>
                          )}

                          {/* Toggle Active/Suspend */}
                          {user.id !== "usr_admin" && (
                            <button
                              onClick={() => handleToggleUserStatus(user.id)}
                              className={`px-1.5 py-0.5 rounded text-[8.5px] border cursor-pointer ${
                                user.status === 'Active' 
                                  ? 'bg-amber-950/40 border-amber-500/25 text-amber-400 hover:bg-amber-900' 
                                  : 'bg-emerald-950/40 border-emerald-500/25 text-emerald-400 hover:bg-emerald-900'
                              }`}
                            >
                              {user.status === 'Active' ? 'Suspend' : 'Activate'}
                            </button>
                          )}

                          {/* Delete Account */}
                          {user.id !== "usr_admin" && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1 bg-red-950/40 hover:bg-red-900 text-red-400 rounded hover:text-red-300 cursor-pointer border border-red-500/20"
                              title="Delete account record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INCOME STREAMS & BILLING */}
        {activeAdminTab === "income" && (
          <div className="space-y-4 animate-fadeIn text-left">
            {/* Total platform revenues stats */}
            <div className="bg-[#111A24]/60 border border-slate-800 p-4 rounded-2xl relative space-y-3">
              <span className="text-[8px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                BILLING FREQUENCY: DAILY SYNC
              </span>
              <h2 className="text-xl font-extrabold tracking-tight text-white font-display">SaaS Income Audit</h2>
              <p className="text-[10.5px] text-zinc-400 leading-relaxed">
                App generates revenue from multiple integrated channels: direct client subscription plan plans, contractor lead generation commissions, and the smart consumable replenishment marketplace.
              </p>

              {/* Commission Adjuster Slider */}
              <div className="mt-4 p-3.5 bg-zinc-950 rounded-xl space-y-2 border border-slate-800/80">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-zinc-400">Default Contractor commission:</span>
                  <strong className="text-amber-400">{platformCommissionRate}%</strong>
                </div>
                <input 
                  type="range"
                  min="5"
                  max="35"
                  value={platformCommissionRate}
                  onChange={(e) => {
                    setPlatformCommissionRate(parseInt(e.target.value));
                    addToast("Commission Rate Updated", `Partner contractor booking referral fee altered to ${e.target.value}%.`, "success");
                  }}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="text-[8px] text-zinc-500 leading-snug">
                  *Referral fee applied on technician emergency dispatch calls. Increasing fees expands platform profits but may restrict contractor supply liquidity.
                </div>
              </div>
            </div>

            {/* Income Streams detailed list */}
            <div className="bg-[#111A24]/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-3 bg-zinc-900 border-b border-slate-800 flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Active Revenue Streams Matrix</span>
                <span className="text-[8.5px] font-mono font-bold text-emerald-400">Total: ${totalIncome} YTD</span>
              </div>

              <div className="divide-y divide-slate-800/60 text-[10.5px]">
                {incomeStreams.map((stream, idx) => (
                  <div key={idx} className="p-3.5 flex flex-col gap-2 hover:bg-zinc-900/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stream.color }} />
                        <strong className="text-white uppercase font-sans tracking-wide">{stream.name}</strong>
                      </div>
                      <span className="font-mono text-zinc-500 font-bold bg-black/40 border border-slate-800/60 px-1.5 py-0.5 rounded text-[8.5px]">
                        {stream.percent}% Share
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[9.5px] font-mono pt-1">
                      <div className="flex flex-col gap-0.5 bg-black/30 p-2 rounded border border-slate-800/40">
                        <span className="text-zinc-500 text-[8px] uppercase">Calculated Yield</span>
                        <strong className="text-white text-xs">${stream.amount} USD</strong>
                      </div>
                      <div className="flex flex-col gap-0.5 bg-black/30 p-2 rounded border border-slate-800/40">
                        <span className="text-zinc-500 text-[8px] uppercase">Audited Status</span>
                        <strong className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Compliant
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invoice Logs */}
            <div className="bg-[#111A24]/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-3 bg-zinc-900 border-b border-slate-800 flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Recent Platform Invoices</span>
                <span className="text-[8px] font-mono text-zinc-500 bg-black/40 px-2 py-0.5 rounded border border-slate-800/60">
                  REAL-TIME CLEARING HOUSE
                </span>
              </div>

              <div className="divide-y divide-slate-800/60 font-mono text-[9.5px]">
                <div className="p-3 flex items-start justify-between bg-[#101824]/20 hover:bg-[#101824]/30">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-white">INV-2026-904</strong>
                      <span className="text-[7.5px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded">Unpaid</span>
                    </div>
                    <span className="text-zinc-400 mt-1 block">Recipient: Seattle Air & Heating</span>
                    <span className="text-zinc-500 text-[8px] mt-0.5 block">SLA dispatch fee commission breakdown</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold block">$150.00</span>
                    <span className="text-[8px] text-zinc-500">COMMISSION: ${platformCommissionRate}%</span>
                  </div>
                </div>

                <div className="p-3 flex items-start justify-between hover:bg-[#101824]/30">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-white">INV-2026-903</strong>
                      <span className="text-[7.5px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">Cleared</span>
                    </div>
                    <span className="text-zinc-400 mt-1 block">Recipient: Marcus Vance</span>
                    <span className="text-zinc-500 text-[8px] mt-0.5 block">Consumable replenishment order clearance</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold block">$38.45</span>
                    <span className="text-[8px] text-zinc-500">STRIPE ID: ch_924a</span>
                  </div>
                </div>

                <div className="p-3 flex items-start justify-between hover:bg-[#101824]/30">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-white">INV-2026-902</strong>
                      <span className="text-[7.5px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">Cleared</span>
                    </div>
                    <span className="text-zinc-400 mt-1 block">Recipient: Arthur Pendragon</span>
                    <span className="text-zinc-500 text-[8px] mt-0.5 block">SaaS Enterprise recurring fee plan</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold block">$49.00</span>
                    <span className="text-[8px] text-zinc-500">CARD LAST4: 8890</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CONTRACTORS & PROVIDER MANAGEMENT */}
        {activeAdminTab === "providers" && (
          <div className="space-y-4 animate-fadeIn text-left">
            {/* Search Filter and Quick Actions */}
            <div className="flex flex-col gap-2 bg-[#111A24]/40 p-3.5 rounded-2xl border border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter specialty (HVAC, electrical, plumbing)..."
                  value={providerSearchText}
                  onChange={(e) => setProviderSearchText(e.target.value)}
                  className="w-full bg-zinc-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[9px] font-mono text-zinc-500">
                  *Contractor dispatch priority SLA activated
                </span>

                <button
                  onClick={() => setIsCreatingProvider(!isCreatingProvider)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-wider py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Partner Contractor</span>
                </button>
              </div>
            </div>

            {/* Inline register partner contractor form */}
            <AnimatePresence>
              {isCreatingProvider && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateProvider}
                  className="bg-[#111A24]/90 border border-blue-500/30 rounded-2xl p-4 space-y-3 shadow-lg overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" /> Register New SLA Contractor
                    </h5>
                    <button 
                      type="button" 
                      onClick={() => setIsCreatingProvider(false)} 
                      className="p-1 text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[8.5px] font-mono font-bold text-zinc-400 uppercase tracking-wide block mb-1">Company / Contractor Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Sparky Electric LLC"
                        value={newProName}
                        onChange={(e) => setNewProName(e.target.value)}
                        className="w-full bg-zinc-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[8.5px] font-mono font-bold text-zinc-400 uppercase tracking-wide block mb-1">Primary Specialty</label>
                        <select
                          value={newProSpecialty}
                          onChange={(e) => setNewProSpecialty(e.target.value)}
                          className="w-full bg-zinc-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="HVAC">HVAC Mechanical</option>
                          <option value="Plumbing">Plumbing Diagnostics</option>
                          <option value="Electrical">Electrical Circuitry</option>
                          <option value="Safety">Life Safety Systems</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[8.5px] font-mono font-bold text-zinc-400 uppercase tracking-wide block mb-1">Hourly Service Rate ($)</label>
                        <input
                          type="number"
                          value={newProRate}
                          onChange={(e) => setNewProRate(parseInt(e.target.value) || 100)}
                          className="w-full bg-zinc-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[8.5px] font-mono font-bold text-zinc-400 uppercase tracking-wide block mb-1">Contact Dispatch Number</label>
                      <input
                        type="text"
                        placeholder="e.g. (206) 555-0149"
                        value={newProPhone}
                        onChange={(e) => setNewProPhone(e.target.value)}
                        className="w-full bg-zinc-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-colors uppercase tracking-wider"
                  >
                    Activate Contractor SLA
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Contractors List Matrix */}
            <div className="bg-[#111A24]/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-3 bg-zinc-900 border-b border-slate-800 flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Pre-Vetted Contractor Catalog</span>
                <span className="text-[8px] font-mono text-zinc-500 bg-black/40 px-2 py-0.5 rounded border border-slate-800/60">
                  {filteredProviders.length} active SLAs
                </span>
              </div>

              <div className="divide-y divide-slate-800/60">
                {filteredProviders.map((provider) => (
                  <div key={provider.id} className="p-3.5 flex flex-col gap-2 hover:bg-[#101824]/30 transition-all">
                    {/* Primary contractor details */}
                    <div className="flex items-start gap-3">
                      <img 
                        src={provider.avatar} 
                        alt={provider.name} 
                        className="w-10 h-10 rounded-xl object-cover border border-slate-800 flex-shrink-0" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-white truncate">{provider.name}</h4>
                          <span className="text-[8px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/25 px-1.5 py-0.5 rounded">
                            {provider.specialty}
                          </span>
                        </div>
                        <p className="text-[9px] text-zinc-400 font-mono mt-0.5 flex items-center gap-1">
                          Rate: <span className="text-white font-bold">${provider.ratePerHour}/hr</span>
                          <span className="text-zinc-600">•</span>
                          Rating: <span className="text-amber-400 font-bold">{provider.rating}★</span>
                          <span className="text-zinc-600">•</span>
                          Completed: <span className="text-zinc-300 font-bold">{provider.completedJobs} jobs</span>
                        </p>
                      </div>
                    </div>

                    {/* SLA Details & Interactive toggles */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/40 text-[9.5px] font-mono">
                      <span className="text-zinc-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        SLA compliance: <strong className="text-emerald-400">Compliant</strong>
                      </span>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => {
                            const newRate = prompt(`Enter new hourly rate for ${provider.name}:`, provider.ratePerHour.toString());
                            if (newRate && parseInt(newRate)) {
                              onUpdateProviders(providers.map(p => p.id === provider.id ? { ...p, ratePerHour: parseInt(newRate) } : p));
                              addToast("Rate Modified", `${provider.name} billing updated to $${newRate}/hr.`, "success");
                            }
                          }}
                          className="px-2 py-0.5 bg-zinc-900 border border-slate-800 rounded hover:text-white hover:bg-zinc-800 cursor-pointer"
                        >
                          Modify Rate
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Remove contractor ${provider.name} from vetted marketplace catalog?`)) {
                              onUpdateProviders(providers.filter(p => p.id !== provider.id));
                              addToast("Contractor SLA Expired", `${provider.name} has been taken offline.`, "info");
                            }
                          }}
                          className="p-1 bg-red-950/40 hover:bg-red-900 text-red-400 border border-red-500/20 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CUSTOMER SUPPORT DESK */}
        {activeAdminTab === "tickets" && (
          <div className="space-y-4 animate-fadeIn text-left">
            
            {/* If no ticket is expanded, show list */}
            {!selectedTicketId ? (
              <div className="bg-[#111A24]/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-3 bg-zinc-900 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Support tickets logs</span>
                  <span className="text-[8px] font-mono text-zinc-500 bg-black/40 px-2 py-0.5 rounded border border-slate-800/60">
                    {tickets.filter(t => t.status !== "Resolved").length} open threads
                  </span>
                </div>

                <div className="divide-y divide-slate-800/60">
                  {tickets.map((ticket) => (
                    <div 
                      key={ticket.id} 
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className="p-3.5 flex flex-col gap-2 hover:bg-[#101824]/30 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9.5px] font-mono font-bold text-zinc-400">{ticket.id}</span>
                            <span className={`text-[7px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              ticket.priority === 'High' 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' 
                                : ticket.priority === 'Medium' 
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                                : 'bg-zinc-800 text-zinc-400'
                            }`}>
                              {ticket.priority} priority
                            </span>
                            <span className={`text-[7px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              ticket.status === 'Open' 
                                ? 'bg-blue-500/10 text-blue-400' 
                                : ticket.status === 'In Progress' 
                                ? 'bg-amber-500/10 text-amber-400' 
                                : 'bg-emerald-500/10 text-emerald-400'
                            }`}>
                              {ticket.status}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white mt-1 leading-snug line-clamp-1">{ticket.subject}</h4>
                          <span className="text-[8.5px] text-zinc-500 mt-1 block">
                            Requested by: <strong className="text-zinc-300 font-normal">{ticket.userName}</strong> • {ticket.createdAt}
                          </span>
                        </div>
                        <ChevronRight className="w-4.5 h-4.5 text-zinc-600 flex-shrink-0 self-center" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Expanded support thread chat portal */
              (() => {
                const targetTicket = tickets.find(t => t.id === selectedTicketId);
                if (!targetTicket) return null;

                return (
                  <div className="bg-[#111A24]/90 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[600px] shadow-2xl relative">
                    
                    {/* Support Desk Header */}
                    <div className="p-3 bg-zinc-900 border-b border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedTicketId(null)}
                        className="p-1 px-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[9.5px] font-mono cursor-pointer"
                      >
                        ← Back to Desk List
                      </button>

                      <div className="text-right">
                        <span className="text-[9px] font-mono font-bold text-zinc-500">{targetTicket.id}</span>
                        <div className="flex items-center space-x-1 mt-0.5 justify-end">
                          <span className={`text-[6.5px] font-mono font-bold px-1 rounded ${targetTicket.priority === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-400'}`}>
                            {targetTicket.priority}
                          </span>
                          <span className={`text-[6.5px] font-mono font-bold px-1 rounded ${targetTicket.status === 'Open' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {targetTicket.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ticket Subject Card */}
                    <div className="p-3.5 bg-black/35 border-b border-slate-800/60 space-y-1">
                      <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block">Topic: {targetTicket.category}</span>
                      <h3 className="text-xs font-bold text-white leading-normal">{targetTicket.subject}</h3>
                      <p className="text-[9px] text-zinc-400">
                        Initiated by <strong>{targetTicket.userName}</strong> ({targetTicket.userEmail}) on {targetTicket.createdAt}
                      </p>
                    </div>

                    {/* Support thread list */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                      {targetTicket.messages.map((msg, idx) => (
                        <div 
                          key={idx} 
                          className={`flex flex-col max-w-[85%] ${msg.sender === "admin" ? "ml-auto items-end" : "mr-auto items-start"}`}
                        >
                          <span className="text-[7.5px] font-mono text-zinc-500 mb-1">
                            {msg.sender === "admin" ? "Master Admin Support" : targetTicket.userName} • {msg.time}
                          </span>
                          <div className={`p-3 rounded-2xl text-[11px] leading-relaxed ${
                            msg.sender === 'admin' 
                              ? 'bg-blue-600 text-white rounded-tr-none' 
                              : 'bg-zinc-800 text-zinc-300 rounded-tl-none'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Support Actions & Reply Form Footer */}
                    <div className="p-3 bg-zinc-900 border-t border-slate-800 space-y-2.5">
                      
                      {/* Ticket quick status change */}
                      <div className="flex items-center justify-between text-[9px] font-mono border-b border-slate-800 pb-2">
                        <span className="text-zinc-500">Update compliance status:</span>
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => handleUpdateTicketStatus(targetTicket.id, "Open")}
                            className={`px-1.5 py-0.5 rounded text-[8.5px] ${targetTicket.status === 'Open' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                          >
                            Open
                          </button>
                          <button
                            onClick={() => handleUpdateTicketStatus(targetTicket.id, "In Progress")}
                            className={`px-1.5 py-0.5 rounded text-[8.5px] ${targetTicket.status === 'In Progress' ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                          >
                            In Progress
                          </button>
                          <button
                            onClick={() => handleUpdateTicketStatus(targetTicket.id, "Resolved")}
                            className={`px-1.5 py-0.5 rounded text-[8.5px] ${targetTicket.status === 'Resolved' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                          >
                            Resolved
                          </button>
                        </div>
                      </div>

                      {/* Message Input text field */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Compose reply as App Administrator..."
                          value={adminTicketReply}
                          onChange={(e) => setAdminTicketReply(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendTicketReply(targetTicket.id);
                          }}
                          className="flex-1 bg-zinc-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={() => handleSendTicketReply(targetTicket.id)}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 rounded-xl cursor-pointer"
                        >
                          Send
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* TAB 6: CONFIG & AUDIT LOGS */}
        {activeAdminTab === "tasks" && (
          <div className="space-y-4 animate-fadeIn text-left">
            {/* System Status Metrics */}
            <div className="bg-[#111A24]/60 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-lg">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-zinc-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Telemetry Platform Diagnostics</h4>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                <div className="p-2.5 bg-black/45 border border-slate-800 rounded-xl flex flex-col">
                  <span className="text-zinc-500">DATABASE PLATFORM</span>
                  <strong className="text-white mt-1">FIRESTORE BLUEPRINT (LOCAL EMULATOR)</strong>
                </div>
                <div className="p-2.5 bg-black/45 border border-slate-800 rounded-xl flex flex-col">
                  <span className="text-zinc-500">API GATEWAY INGRESS</span>
                  <strong className="text-emerald-400 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    ACTIVE COLD-RUN PORT 3000
                  </strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/50 flex justify-between items-center">
                <span className="text-[10px] text-zinc-400 font-mono">Config Schema Version: <strong className="text-white">v3.42-durable</strong></span>
                <button
                  onClick={handleTriggerBackup}
                  className="px-2.5 py-1 bg-zinc-900 border border-slate-800 hover:bg-zinc-800 text-[9.5px] rounded text-zinc-300 hover:text-white font-mono cursor-pointer transition-colors"
                >
                  On-Demand Snapshot
                </button>
              </div>
            </div>

            {/* Audit Logs Lists */}
            <div className="bg-[#111A24]/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-left">
              <div className="p-3 bg-zinc-900 border-b border-slate-800 flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Global Security Audit Trail</span>
                <span className="text-[7.5px] font-mono text-zinc-500 bg-black/40 px-2 py-0.5 rounded border border-slate-800/60">
                  REAL-TIME EMITTING FEEDS
                </span>
              </div>

              <div className="divide-y divide-slate-800/60 font-mono text-[9px]">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 flex flex-col gap-1.5 hover:bg-[#101824]/20 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 text-[8.5px]">{log.timestamp}</span>
                      <span className={`text-[7.5px] px-1.5 py-0.5 rounded font-bold ${
                        log.status === 'Success' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : log.status === 'Updated' 
                          ? 'bg-blue-500/10 text-blue-400' 
                          : log.status === 'Deleted'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-amber-500/10 text-amber-400 animate-pulse'
                      }`}>
                        {log.action}
                      </span>
                    </div>
                    <p className="text-zinc-300 leading-snug">{log.details}</p>
                    <div className="flex items-center justify-between text-zinc-500 text-[8px] border-t border-slate-800/30 pt-1">
                      <span>Operator: <strong>{log.operator}</strong></span>
                      <span>ID: {log.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ADMIN ACCOUNT MANAGEMENT */}
        {activeAdminTab === "admins" && (
          <div className="space-y-4 animate-fadeIn text-left pb-12">
            
            {/* Header Description */}
            <div className="bg-[#111A24]/60 border border-slate-800 p-4 rounded-2xl relative space-y-2">
              <span className="text-[8px] font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/25">
                SECURITY: HIGH CRITICAL ACCESS
              </span>
              <h2 className="text-xl font-extrabold tracking-tight text-white font-display">Administrative Registry</h2>
              <p className="text-[10.5px] text-zinc-400 leading-relaxed">
                Configure administrative credentials, grant security clearance, and audits for platform operations. Multiple concurrent administrative accounts are permitted.
              </p>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingAdmin(!isCreatingAdmin);
                    setEditingAdminId(null);
                  }}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] uppercase tracking-wider py-1.5 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isCreatingAdmin ? "Close Panel" : "Register Admin"}</span>
                </button>
              </div>
            </div>

            {/* CURRENT ADMIN PROFILE CARD */}
            <div className="bg-[#111A24]/90 border border-blue-500/30 p-4 rounded-2xl space-y-3.5 shadow-lg relative">
              <div className="absolute top-0 right-0 w-16 h-16 rounded-full filter blur-lg opacity-10 bg-blue-500/10"></div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" /> Your Active Session Profile
                </h3>
                <span className="text-[7.5px] font-mono font-bold bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                  MASTER CLEARANCE
                </span>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                // Find matching admin in roster and update
                setAdminsList(prev => prev.map(adm => {
                  if (adm.email.toLowerCase() === currentUser.email?.toLowerCase() || adm.id === "usr_admin") {
                    return {
                      ...adm,
                      name: currentAdminName,
                      email: currentAdminEmail,
                      password: currentAdminPassword || adm.password
                    };
                  }
                  return adm;
                }));
                // Update global currentUser context
                if (onUpdateCurrentUser) {
                  onUpdateCurrentUser({
                    ...currentUser,
                    name: currentAdminName,
                    email: currentAdminEmail
                  });
                }
                addToast("Identity Updated", "Your administrator profile has been updated successfully.", "success");
              }} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-wide block mb-1">Display Name</label>
                    <input
                      type="text"
                      value={currentAdminName}
                      onChange={(e) => setCurrentAdminName(e.target.value)}
                      className="w-full bg-zinc-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-wide block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={currentAdminEmail}
                      onChange={(e) => setCurrentAdminEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-wide block mb-1">Update Security Password</label>
                  <input
                    type="password"
                    placeholder="•••••••• (Enter new password to modify)"
                    value={currentAdminPassword}
                    onChange={(e) => setCurrentAdminPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg cursor-pointer transition-colors"
                  >
                    Save My Credentials
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="py-2 px-3 bg-red-950/40 hover:bg-red-950 text-red-400 font-bold text-[10px] uppercase tracking-wider rounded-lg border border-red-500/20 cursor-pointer transition-colors flex items-center justify-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Create Admin Form */}
            <AnimatePresence>
              {isCreatingAdmin && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newAdminName || !newAdminEmail || !newAdminPassword) return;
                    
                    const newAdmin = {
                      id: `adm_${Date.now()}`,
                      name: newAdminName,
                      email: newAdminEmail,
                      password: newAdminPassword,
                      lastActive: "Never",
                      status: "Active"
                    };

                    setAdminsList(prev => [...prev, newAdmin]);
                    setIsCreatingAdmin(false);
                    setNewAdminName("");
                    setNewAdminEmail("");
                    setNewAdminPassword("");

                    // Audit Log
                    const newLog = {
                      id: `LOG_${Date.now()}`,
                      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                      action: "Admin Created",
                      operator: currentUser.name,
                      status: "Success",
                      details: `Created administrative profile for '${newAdminEmail}'.`
                    };
                    setAuditLogs(prev => [newLog, ...prev]);
                    addToast("Admin Registered", `Account for ${newAdminName} created successfully.`, "success");
                  }}
                  className="bg-[#111A24]/90 border border-red-500/30 rounded-2xl p-4 space-y-3 shadow-lg text-left overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" /> Register Admin Profile
                    </h5>
                    <button 
                      type="button" 
                      onClick={() => setIsCreatingAdmin(false)} 
                      className="p-1 text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[8.5px] font-mono font-bold text-zinc-400 uppercase tracking-wide block mb-1">Display Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Inspector Vance"
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        className="w-full bg-zinc-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[8.5px] font-mono font-bold text-zinc-400 uppercase tracking-wide block mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="e.g. help@homepulse.io"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        className="w-full bg-zinc-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[8.5px] font-mono font-bold text-zinc-400 uppercase tracking-wide block mb-1">Administrative Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        className="w-full bg-zinc-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-colors uppercase tracking-wider"
                  >
                    Authorize Administrator
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Edit Admin Form */}
            <AnimatePresence>
              {editingAdminId && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!editAdminName || !editAdminEmail) return;

                    setAdminsList(prev => prev.map(adm => {
                      if (adm.id === editingAdminId) {
                        // If we are editing the current logged in user, notify App.tsx
                        if (adm.email.toLowerCase() === currentUser.email?.toLowerCase()) {
                          if (onUpdateCurrentUser) {
                            onUpdateCurrentUser({
                              ...currentUser,
                              name: editAdminName,
                              email: editAdminEmail
                            });
                          }
                        }
                        return {
                          ...adm,
                          name: editAdminName,
                          email: editAdminEmail,
                          password: editAdminPassword || adm.password,
                          status: editAdminStatus
                        };
                      }
                      return adm;
                    }));

                    // Add dynamic audit log
                    const newLog = {
                      id: `LOG_${Date.now()}`,
                      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                      action: "Admin Updated",
                      operator: currentUser.name,
                      status: "Success",
                      details: `Updated credentials/profile details for administrative account '${editAdminEmail}'.`
                    };
                    setAuditLogs(prev => [newLog, ...prev]);

                    addToast("Profile Altered", `Administrator profile updated safely.`, "success");
                    setEditingAdminId(null);
                  }}
                  className="bg-[#111A24]/90 border border-amber-500/30 rounded-2xl p-4 space-y-3 shadow-lg text-left overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Settings className="w-4 h-4" /> Edit Admin Credentials
                    </h5>
                    <button 
                      type="button" 
                      onClick={() => setEditingAdminId(null)} 
                      className="p-1 text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[8.5px] font-mono font-bold text-zinc-400 uppercase tracking-wide block mb-1">Display Name</label>
                      <input
                        type="text"
                        value={editAdminName}
                        onChange={(e) => setEditAdminName(e.target.value)}
                        className="w-full bg-zinc-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[8.5px] font-mono font-bold text-zinc-400 uppercase tracking-wide block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={editAdminEmail}
                        onChange={(e) => setEditAdminEmail(e.target.value)}
                        className="w-full bg-zinc-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[8.5px] font-mono font-bold text-zinc-400 uppercase tracking-wide block mb-1">New Password (leave blank to keep current)</label>
                      <input
                        type="text"
                        placeholder="Keep existing password"
                        value={editAdminPassword}
                        onChange={(e) => setEditAdminPassword(e.target.value)}
                        className="w-full bg-zinc-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[8.5px] font-mono font-bold text-zinc-400 uppercase tracking-wide block mb-1">Account Status</label>
                      <select
                        value={editAdminStatus}
                        onChange={(e) => setEditAdminStatus(e.target.value)}
                        className="w-full bg-zinc-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="Active">Active Clearance</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingAdminId(null)}
                      className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold text-xs py-2.5 rounded-xl transition-colors uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2.5 rounded-xl transition-colors uppercase tracking-wider"
                    >
                      Save Security Profile
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Admin Directory List */}
            <div className="bg-[#111A24]/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-3 bg-zinc-900 border-b border-slate-800 flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Administrative Roster</span>
                <span className="text-[8px] font-mono text-zinc-500 bg-black/40 px-2 py-0.5 rounded border border-slate-800/60">
                  {adminsList.length} Administrators Active
                </span>
              </div>

              <div className="divide-y divide-slate-800/60">
                {adminsList.map((admin) => (
                  <div key={admin.id} className="p-3.5 flex flex-col gap-2 hover:bg-[#101824]/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-white">{admin.name}</h4>
                          <span className="text-[6.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 uppercase">
                            Admin
                          </span>
                          {admin.email.toLowerCase() === currentUser.email?.toLowerCase() && (
                            <span className="text-[6.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                              Current You
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-zinc-600" />
                          {admin.email}
                        </span>
                        <span className="text-[8px] font-mono text-zinc-600 block mt-1">
                          Pass Phrase: <span className="text-zinc-500 select-all font-bold">{admin.password}</span>
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-[7px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          admin.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                        }`}>
                          {admin.status}
                        </span>
                        <span className="text-[8px] font-mono text-zinc-500">
                          Active: {admin.lastActive}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1.5 border-t border-slate-800/30 font-mono">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAdminId(admin.id);
                          setEditAdminName(admin.name);
                          setEditAdminEmail(admin.email);
                          setEditAdminPassword("");
                          setEditAdminStatus(admin.status);
                          setIsCreatingAdmin(false);
                        }}
                        className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-slate-800 text-zinc-300 hover:text-white rounded text-[8.5px] font-mono cursor-pointer flex items-center gap-1 transition-colors"
                      >
                        <Settings className="w-3 h-3 text-amber-500" />
                        <span>Modify Credentials</span>
                      </button>

                      {admin.email.toLowerCase() !== currentUser.email?.toLowerCase() && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Revoke administrative access for ${admin.name}?`)) {
                              setAdminsList(prev => prev.filter(a => a.id !== admin.id));
                              
                              const newLog = {
                                id: `LOG_${Date.now()}`,
                                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                action: "Access Revoked",
                                operator: currentUser.name,
                                status: "Deleted",
                                details: `Revoked clearance & deleted administrative account '${admin.email}'.`
                              };
                              setAuditLogs(prev => [newLog, ...prev]);
                              addToast("Access Revoked", `Administrative access for ${admin.name} has been cancelled.`, "info");
                            }
                          }}
                          className="px-2 py-1 bg-red-950/20 hover:bg-red-950 text-red-400 hover:text-red-300 border border-red-500/10 rounded text-[8.5px] font-mono cursor-pointer flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Revoke Access</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Administrative Sign Out Console Action */}
            <div className="bg-[#1C1215] border border-red-900/30 p-4 rounded-2xl mt-4">
              <h4 className="text-xs font-black uppercase text-red-400 tracking-wider">Administrative Disconnect</h4>
              <p className="text-[9.5px] text-zinc-400 mt-1 leading-normal">
                Disconnect current console session. Disconnecting signs your account out and returns to standard login. All cached logs and access configurations remain stored securely in Firestore Blueprints.
              </p>
              
              <button
                type="button"
                onClick={onLogout}
                className="w-full mt-4 py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-[10.5px] uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 border border-red-500/30 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Disconnect Administrative Session</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* FOOTER NAVIGATION MENU */}
      <div className="bg-[#0B0F15]/95 backdrop-blur-md border-t border-slate-800 px-3 py-2.5 flex items-center justify-around w-full shadow-[0_-8px_24px_rgba(0,0,0,0.6)] z-20">
        <button
          type="button"
          onClick={() => { setActiveAdminTab("overview"); setSelectedTicketId(null); }}
          className={`flex-1 py-1.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
            activeAdminTab === "overview" 
              ? "bg-[#2563EB]/15 text-blue-400 font-extrabold scale-105" 
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Activity className="w-4.5 h-4.5 mb-1" />
          <span className="text-[7.5px] uppercase font-black tracking-widest">Overview</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveAdminTab("users"); setSelectedTicketId(null); }}
          className={`flex-1 py-1.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
            activeAdminTab === "users" 
              ? "bg-[#2563EB]/15 text-blue-400 font-extrabold scale-105" 
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Users className="w-4.5 h-4.5 mb-1" />
          <span className="text-[7.5px] uppercase font-black tracking-widest">Users</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveAdminTab("income"); setSelectedTicketId(null); }}
          className={`flex-1 py-1.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
            activeAdminTab === "income" 
              ? "bg-[#2563EB]/15 text-blue-400 font-extrabold scale-105" 
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <DollarSign className="w-4.5 h-4.5 mb-1" />
          <span className="text-[7.5px] uppercase font-black tracking-widest text-center">Income Streams</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveAdminTab("admins"); setSelectedTicketId(null); }}
          className={`flex-1 py-1.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
            activeAdminTab === "admins" 
              ? "bg-red-600/15 text-red-400 font-extrabold scale-105" 
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Sliders className="w-4.5 h-4.5 mb-1" />
          <span className="text-[7.5px] uppercase font-black tracking-widest text-center">Admin Account</span>
        </button>
      </div>

    </div>
  );
}
