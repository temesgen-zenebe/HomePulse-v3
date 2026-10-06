import React from "react";
import { 
  User, 
  Shield, 
  ShieldCheck, 
  Key, 
  Lock, 
  CreditCard, 
  ChevronRight, 
  Plus, 
  Check, 
  Star, 
  Settings, 
  DollarSign, 
  Activity, 
  Users, 
  Send, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  RefreshCw, 
  Layers,
  Sparkles,
  UserCheck,
  Building,
  ArrowRight,
  TrendingUp,
  Receipt,
  X,
  Compass,
  Ban,
  Sliders,
  Percent,
  Wallet,
  Search,
  CheckSquare,
  Square,
  TrendingDown,
  Briefcase,
  PlusCircle,
  Download,
  Eye,
  Settings2,
  FileSpreadsheet,
  Trash2
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
import { PropertyInfo, RecommendedProvider, ProAppointment, DocumentRecord } from "../types";

// Dynamic active user interface
export interface StakeholderUser {
  id: string;
  name: string;
  email: string;
  role: "homeowner" | "provider" | "admin";
  tier: "Free" | "Basic" | "Pro" | "Enterprise";
  providerCategory?: string;
  serviceRate?: number;
  earnings?: number;
  companyName?: string;
  approved?: boolean;
}

interface StakeholderScreenProps {
  property: PropertyInfo;
  onUpdateProperty: (updated: PropertyInfo) => void;
  onNavigateToScreen: (screenId: string) => void;
  providers: RecommendedProvider[];
  appointments: ProAppointment[];
  onBookAppointment: (appointment: ProAppointment) => void;
  onUpdateAppointments: (updated: ProAppointment[]) => void;
  onUpdateProviders: (updated: RecommendedProvider[]) => void;
  onAddDocument: (doc: DocumentRecord) => void;
  currentUser: StakeholderUser;
  onUpdateCurrentUser: (user: StakeholderUser) => void;
}

export default function StakeholderScreen({
  property,
  onUpdateProperty,
  onNavigateToScreen,
  providers,
  appointments,
  onBookAppointment,
  onUpdateAppointments,
  onUpdateProviders,
  onAddDocument,
  currentUser,
  onUpdateCurrentUser
}: StakeholderScreenProps) {
  // Navigation internal tab
  const [activeTab, setActiveTab] = React.useState<"profile" | "pricing" | "admin" | "provider">("profile");
  
  // Authentication Forms State
  const [authMode, setAuthMode] = React.useState<"login" | "register">("login");
  const [emailInput, setEmailInput] = React.useState("");
  const [passwordInput, setPasswordInput] = React.useState("");
  const [nameInput, setNameInput] = React.useState("");
  const [roleSelection, setRoleSelection] = React.useState<"homeowner" | "provider" | "admin">("homeowner");
  
  // Provider Registration extra fields
  const [specialtySelection, setSpecialtySelection] = React.useState("HVAC");
  const [companyNameInput, setCompanyNameInput] = React.useState("");
  const [hourlyRateInput, setHourlyRateInput] = React.useState(125);
  const [adminSecretCode, setAdminSecretCode] = React.useState("");

  // Payment State
  const [selectedPlan, setSelectedPlan] = React.useState<{ name: string; price: number } | null>(null);
  const [checkoutStep, setCheckoutStep] = React.useState<"idle" | "form" | "processing" | "receipt">("idle");
  const [cardNumber, setCardNumber] = React.useState("");
  const [cardExpiry, setCardExpiry] = React.useState("");
  const [cardCvc, setCardCvc] = React.useState("");
  const [cardName, setCardName] = React.useState("");
  const [paymentStatusMessage, setPaymentStatusMessage] = React.useState("");

  // Simulated Pricing Tiers (can be updated in real-time by App Admins!)
  const [pricingPlans, setPricingPlans] = React.useState([
    {
      id: "plan-free",
      name: "SaaS Basic Care",
      price: 0,
      period: "forever",
      badge: "Free",
      features: [
        "Self-service system logs",
        "Standard local weather risk metrics",
        "Up to 3 appliances tracking limit",
        "Standard dispatcher dispatch route"
      ]
    },
    {
      id: "plan-pro",
      name: "HomePulse Pro",
      price: 19,
      period: "month",
      badge: "Popular Premium",
      features: [
        "Priority dispatch (Certified Pros in 4hrs)",
        "Automated water sensor shutoff triggers",
        "Proactive HVAC anomaly alerts",
        "Unlimited appliance warranty logs",
        "Monthly PDF ROI audit statements"
      ]
    },
    {
      id: "plan-enterprise",
      name: "Enterprise Shield",
      price: 49,
      period: "month",
      badge: "Ultimate Protection",
      features: [
        "Continuous live optical diagnostics",
        "Guaranteed 2hr contractor dispatch",
        "Multi-family member sync keys",
        "$5,000 protection guarantee policy",
        "Premium technical direct engineer hotlines"
      ]
    }
  ]);

  // Master Simulated Database for Payment, Revenue, Users, and Providers Management
  const [usersList, setUsersList] = React.useState([
    { id: "usr_1", name: "Marcus Vance", email: "temf2006@gmail.com", role: "homeowner", tier: "Basic", status: "Active", country: "United States", verified: true, dateJoined: "2026-01-10" },
    { id: "usr_2", name: "Jane Doe", email: "jane.doe@example.com", role: "homeowner", tier: "Free", status: "Active", country: "United States", verified: true, dateJoined: "2026-03-24" },
    { id: "usr_3", name: "Arthur Pendragon", email: "arthur@royalhome.co.uk", role: "homeowner", tier: "Enterprise", status: "Active", country: "United Kingdom", verified: true, dateJoined: "2026-05-15" },
    { id: "usr_pro_1", name: "Seattle Air & Heating", email: "service@seattleair.com", role: "provider", tier: "Free", status: "Active", country: "United States", verified: true, dateJoined: "2025-11-01" },
    { id: "usr_pro_2", name: "Apex Leak Solvers", email: "leakproof@gmail.com", role: "provider", tier: "Free", status: "Active", country: "United States", verified: true, dateJoined: "2026-02-18" },
    { id: "usr_pro_3", name: "Sparky Electric LLC", email: "sparky@electrician.com", role: "provider", tier: "Free", status: "Pending", country: "United States", verified: false, dateJoined: "2026-06-29" },
    { id: "usr_admin", name: "Master Admin Vance", email: "admin@homepulse.io", role: "admin", tier: "Enterprise", status: "Active", country: "United States", verified: true, dateJoined: "2025-01-01" }
  ]);

  const [creditCards, setCreditCards] = React.useState([
    { id: "card_1", brand: "Visa", last4: "4242", expiry: "12/28", holder: "Marcus Vance", isDefault: true },
    { id: "card_2", brand: "Mastercard", last4: "8890", expiry: "06/29", holder: "Marcus Vance", isDefault: false }
  ]);

  const [invoicesList, setInvoicesList] = React.useState([
    { id: "inv_101", customerId: "usr_1", customerName: "Marcus Vance", providerId: "usr_pro_1", providerName: "Seattle Air & Heating", description: "Seasonal HVAC Compressor Tune-up & Pleated Filter Refresh", amount: 150, platformFee: 22.50, status: "Unpaid", date: "2026-06-25", serviceCategory: "HVAC" },
    { id: "inv_102", customerId: "usr_1", customerName: "Marcus Vance", providerId: "usr_pro_2", providerName: "Apex Leak Solvers", description: "Water Softener Salt Replenishment & Valve Calibration", amount: 120, platformFee: 18.00, status: "Paid", date: "2026-06-10", serviceCategory: "Plumbing" },
    { id: "inv_103", customerId: "usr_2", customerName: "Jane Doe", providerId: "usr_pro_1", providerName: "Seattle Air & Heating", description: "Emergency AC Fan Motor Replacement", amount: 280, platformFee: 42.00, status: "Unpaid", date: "2026-07-01", serviceCategory: "HVAC" }
  ]);

  const [transactions, setTransactions] = React.useState([
    { id: "tx_1001", userEmail: "jane.doe@example.com", userName: "Jane Doe", type: "Subscription", description: "HomePulse Pro Subscription", amount: 19.00, platformCut: 19.00, timestamp: "2026-06-24 08:30" },
    { id: "tx_1002", userEmail: "arthur@royalhome.co.uk", userName: "Arthur Pendragon", type: "Subscription", description: "Enterprise Shield Subscription", amount: 49.00, platformCut: 49.00, timestamp: "2026-06-28 14:15" },
    { id: "tx_1003", userEmail: "temf2006@gmail.com", userName: "Marcus Vance", type: "Commission", description: "Apex Leak Solvers Repair Call Commission", amount: 120.00, platformCut: 18.00, timestamp: "2026-06-10 11:45" }
  ]);

  const [commissionRate, setCommissionRate] = React.useState<number>(15);

  // Search and Filter States for Admin Dashboards
  const [userSearch, setUserSearch] = React.useState("");
  const [userRoleFilter, setUserRoleFilter] = React.useState<"all" | "homeowner" | "provider" | "admin">("all");
  const [providerSearch, setProviderSearch] = React.useState("");
  const [providerInsuranceFilter, setProviderInsuranceFilter] = React.useState<"all" | "insured" | "pending">("all");

  // Credit Card Creation Fields
  const [newCardBrand, setNewCardBrand] = React.useState("Visa");
  const [newCardNumber, setNewCardNumber] = React.useState("");
  const [newCardExpiry, setNewCardExpiry] = React.useState("");
  const [newCardCvc, setNewCardCvc] = React.useState("");
  const [newCardHolder, setNewCardHolder] = React.useState("");
  const [cardModalOpen, setCardModalOpen] = React.useState(false);

  // Provider Invoice Creation Fields
  const [invoiceClientSelect, setInvoiceClientSelect] = React.useState("usr_1");
  const [invoiceDescInput, setInvoiceDescInput] = React.useState("");
  const [invoiceAmountInput, setInvoiceAmountInput] = React.useState("150");
  const [invoiceCategorySelect, setInvoiceCategorySelect] = React.useState("HVAC");
  const [invoiceCreateSuccess, setInvoiceCreateSuccess] = React.useState(false);

  // Auth/Switch handler
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authMode === "login") {
      // Direct login simulation
      if (emailInput.toLowerCase().includes("admin") || roleSelection === "admin") {
        const adminUser: StakeholderUser = {
          id: "usr_admin",
          name: nameInput || "Master Admin Vance",
          email: emailInput || "admin@homepulse.io",
          role: "admin",
          tier: "Enterprise"
        };
        onUpdateCurrentUser(adminUser);
        
        // Ensure in usersList
        setUsersList(prev => {
          if (!prev.find(u => u.id === adminUser.id)) {
            return [...prev, { ...adminUser, status: "Active", country: "United States", verified: true, dateJoined: new Date().toISOString().split('T')[0] }];
          }
          return prev;
        });
        setActiveTab("admin");
      } else if (roleSelection === "provider") {
        const proId = `usr_pro_${Date.now()}`;
        const proUser: StakeholderUser = {
          id: proId,
          name: nameInput || companyNameInput || "Seattle Air & Heating",
          email: emailInput || "service@seattleair.com",
          role: "provider",
          tier: "Free",
          providerCategory: specialtySelection,
          serviceRate: hourlyRateInput,
          earnings: 0,
          companyName: companyNameInput || "Seattle Mechanical",
          approved: true // Auto-certified for login convenience
        };
        onUpdateCurrentUser(proUser);
        
        // Ensure in usersList
        setUsersList(prev => {
          if (!prev.find(u => u.email.toLowerCase() === proUser.email.toLowerCase())) {
            return [...prev, { ...proUser, status: "Active", country: "United States", verified: true, dateJoined: new Date().toISOString().split('T')[0] }];
          }
          return prev;
        });
        setActiveTab("provider");
      } else {
        const homeId = `usr_home_${Date.now()}`;
        const homeUser: StakeholderUser = {
          id: homeId,
          name: nameInput || "Marcus Vance",
          email: emailInput || "temf2006@gmail.com",
          role: "homeowner",
          tier: "Free"
        };
        onUpdateCurrentUser(homeUser);
        
        // Ensure in usersList
        setUsersList(prev => {
          if (!prev.find(u => u.email.toLowerCase() === homeUser.email.toLowerCase())) {
            return [...prev, { ...homeUser, status: "Active", country: "United States", verified: true, dateJoined: new Date().toISOString().split('T')[0] }];
          }
          return prev;
        });
        setActiveTab("profile");
      }
    } else {
      // Register simulation
      if (roleSelection === "admin") {
        if (adminSecretCode !== "ADMIN123") {
          alert("Unauthorized Admin Secret. Enter ADMIN123 to verify developer role authority.");
          return;
        }
        const adminUser: StakeholderUser = {
          id: "usr_admin",
          name: nameInput || "System Admin",
          email: emailInput,
          role: "admin",
          tier: "Enterprise"
        };
        onUpdateCurrentUser(adminUser);
        
        setUsersList(prev => {
          if (!prev.find(u => u.email.toLowerCase() === adminUser.email.toLowerCase())) {
            return [...prev, { ...adminUser, status: "Active", country: "United States", verified: true, dateJoined: new Date().toISOString().split('T')[0] }];
          }
          return prev;
        });
        setActiveTab("admin");
      } else if (roleSelection === "provider") {
        // Add new provider to list of recommended providers
        const newPro: RecommendedProvider = {
          id: `pro_registered_${Date.now()}`,
          name: nameInput || companyNameInput || "Pro Mechanic Specialists",
          specialty: specialtySelection,
          rating: 4.8,
          completedJobs: 1,
          ratePerHour: Number(hourlyRateInput) || 120,
          responseTime: "under 15 mins",
          contactNumber: "(206) 555-8822",
          avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=120&q=80",
          reviews: [
            {
              id: `rev_1`,
              userName: "Marcus Vance",
              rating: 5,
              comment: "Highly specialized, fast service and very professional setup.",
              date: "2026-06-30"
            }
          ]
        };

        // Add to providers array
        onUpdateProviders([newPro, ...providers]);

        const proUser: StakeholderUser = {
          id: `usr_pro_${Date.now()}`,
          name: nameInput || companyNameInput || "Certified Pro Tech",
          email: emailInput,
          role: "provider",
          tier: "Free",
          providerCategory: specialtySelection,
          serviceRate: hourlyRateInput,
          earnings: 0,
          companyName: companyNameInput || "Pro Mechanic Specialists",
          approved: false // Needs Admin Verification
        };
        onUpdateCurrentUser(proUser);

        setUsersList(prev => [...prev, { ...proUser, status: "Active", country: "United States", verified: false, dateJoined: new Date().toISOString().split('T')[0] }]);
        setActiveTab("provider");
      } else {
        const homeUser: StakeholderUser = {
          id: `usr_home_${Date.now()}`,
          name: nameInput || "New Homeowner",
          email: emailInput,
          role: "homeowner",
          tier: "Free"
        };
        onUpdateCurrentUser(homeUser);

        setUsersList(prev => [...prev, { ...homeUser, status: "Active", country: "United States", verified: true, dateJoined: new Date().toISOString().split('T')[0] }]);
        setActiveTab("profile");
      }
    }

    // Reset inputs
    setEmailInput("");
    setPasswordInput("");
    setAdminSecretCode("");
  };

  // Payment Checkout handler
  const handleStartCheckout = (plan: typeof pricingPlans[0]) => {
    setSelectedPlan({ name: plan.name, price: plan.price });
    setCardName(currentUser.name);
    setCheckoutStep("form");
  };

  const handleProcessCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep("processing");
    setPaymentStatusMessage("Initializing 256-bit Stripe Secure Handshake...");

    setTimeout(() => {
      setPaymentStatusMessage("Verifying Credit Balance & Card Credentials...");
    }, 1200);

    setTimeout(() => {
      setPaymentStatusMessage("Securing Authorized SaaS Token Vault Key...");
    }, 2400);

    setTimeout(() => {
      // Complete checkout and generate high-fidelity document invoice!
      const invoiceId = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
      const newInvoice: DocumentRecord = {
        id: `invoice_doc_${Date.now()}`,
        name: `SaaS Premium Invoice ${invoiceId}`,
        type: "receipt",
        date: new Date().toLocaleDateString("en-US"),
        size: "42 KB"
      };

      // Add invoice to homeowner property vault
      onAddDocument(newInvoice);

      // Determine upgraded tier
      let nextTier: "Free" | "Basic" | "Pro" | "Enterprise" = "Pro";
      if (selectedPlan?.name.toLowerCase().includes("enterprise")) {
        nextTier = "Enterprise";
      }

      // Add subscription payment transaction
      const newTx = {
        id: `tx_${Date.now()}`,
        userEmail: currentUser.email,
        userName: currentUser.name,
        type: "Subscription",
        description: `${selectedPlan?.name || "Premium"} Plan Upgrade`,
        amount: selectedPlan?.price || 19,
        platformCut: selectedPlan?.price || 19,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setTransactions(prev => [newTx, ...prev]);

      // Update in simulated usersList too
      setUsersList(prev => prev.map(u => {
        if (u.email.toLowerCase() === currentUser.email.toLowerCase() || u.id === currentUser.id) {
          return { ...u, tier: nextTier };
        }
        return u;
      }));

      onUpdateCurrentUser({
        ...currentUser,
        tier: nextTier
      });

      setCheckoutStep("receipt");
    }, 3600);
  };

  // Admin Tweak: update plan prices
  const handleUpdatePlanPrice = (planId: string, nextPrice: number) => {
    setPricingPlans(prev => prev.map(p => {
      if (p.id === planId) {
        return { ...p, price: nextPrice };
      }
      return p;
    }));
  };

  // Admin Action: approve service provider registration
  const handleApproveProvider = (proName: string) => {
    if (currentUser.role === "admin") {
      // If we are currently logged in provider is ourselves, update state
      onUpdateCurrentUser({
        ...currentUser,
        approved: true
      });
      alert(`Certified service credentials for "${proName}" has been officially approved!`);
    }
  };

  // Provider Action: Service/Complete repair appointment
  const handleCompleteRepairByProvider = (apptId: string) => {
    const updated = appointments.map(app => {
      if (app.id === apptId) {
        return { ...app, status: "Completed" as any };
      }
      return app;
    });
    onUpdateAppointments(updated);
    
    // Add earnings to provider
    onUpdateCurrentUser({
      ...currentUser,
      earnings: (currentUser.earnings || 0) + 150
    });
  };

  return (
    <div className="w-full min-h-full bg-[#0A0A0A] text-white flex flex-col relative pb-24 text-left">
      
      {/* Upper Navigation Back Header */}
      <div className="p-4 bg-[#101820] border-b border-slate-800/80 flex items-center justify-between sticky top-0 z-30">
        <button 
          onClick={() => onNavigateToScreen("screen-dashboard")}
          className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono"
        >
          <Compass className="w-4 h-4 text-blue-400 animate-spin-slow" />
          <span>Dashboard</span>
        </button>
        <span className="text-[11px] font-bold text-zinc-400 font-mono tracking-widest uppercase">
          Auth & Stakeholder Center
        </span>
        <div className="w-6"></div>
      </div>

      {/* Main Interactive Screen Content */}
      <div className="p-5 space-y-5">
        
        {/* Dynamic active session user indicator panel */}
        <div className="p-4 bg-gradient-to-br from-[#101820] to-[#0D1525] border border-slate-800/80 rounded-2xl shadow-lg flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="relative">
              <div className="p-3 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-xl">
                {currentUser.role === "admin" ? (
                  <ShieldCheck className="w-5 h-5 text-red-400" />
                ) : currentUser.role === "provider" ? (
                  <Building className="w-5 h-5 text-amber-400" />
                ) : (
                  <User className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#101820]"></span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-400 font-mono">
                  Active Stakeholder Node
                </h4>
                <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                  currentUser.role === "admin" 
                    ? "bg-red-500/10 border border-red-500/20 text-red-400" 
                    : currentUser.role === "provider"
                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                    : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                }`}>
                  {currentUser.role}
                </span>
              </div>
              <p className="text-sm font-black text-white truncate mt-0.5 font-display">{currentUser.name}</p>
              <p className="text-[10px] text-zinc-500 truncate leading-none font-mono">{currentUser.email}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[8px] font-mono text-zinc-500 uppercase block">Active SaaS Tier</span>
            <span className="text-xs font-black text-amber-400 flex items-center gap-1 justify-end font-display">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {currentUser.tier}
            </span>
          </div>
        </div>

        {/* Stakeholder Center segmented control menu */}
        <div className="flex bg-[#101820]/60 p-1 border border-slate-800/80 rounded-xl text-[10px] font-semibold text-zinc-400">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === "profile" ? "bg-[#2563EB] text-white font-bold shadow-md" : "hover:text-zinc-200"
            }`}
          >
            Account / Auth
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === "pricing" ? "bg-[#2563EB] text-white font-bold shadow-md" : "hover:text-zinc-200"
            }`}
          >
            SaaS Pricing & Pay
          </button>
          {currentUser.role === "provider" && (
            <button
              onClick={() => setActiveTab("provider")}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                activeTab === "provider" ? "bg-[#2563EB] text-white font-bold shadow-md" : "hover:text-zinc-200"
              }`}
            >
              Service Pro Console
            </button>
          )}
          {currentUser.role === "admin" && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                activeTab === "admin" ? "bg-[#2563EB] text-white font-bold shadow-md" : "hover:text-zinc-200"
              }`}
            >
              Admin Control
            </button>
          )}
        </div>

        {/* TAB 1: AUTHENTICATION GATE & ACCOUNT EDITING */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            
            {/* Account Profile Details Update Form */}
            <div className="p-4 bg-[#101820] border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  Update Account & Profile Details
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[8.5px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Display Name / Company Name
                  </label>
                  <input
                    type="text"
                    value={currentUser.name}
                    onChange={(e) => onUpdateCurrentUser({ ...currentUser, name: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8.5px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Registered Contact Email
                  </label>
                  <input
                    type="email"
                    value={currentUser.email}
                    onChange={(e) => onUpdateCurrentUser({ ...currentUser, email: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                {currentUser.role === "provider" && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[8.5px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                        Service Rate ($/hr)
                      </label>
                      <input
                        type="number"
                        value={currentUser.serviceRate || 125}
                        onChange={(e) => onUpdateCurrentUser({ ...currentUser, serviceRate: Number(e.target.value) })}
                        className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[8.5px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                        Provider specialty
                      </label>
                      <select
                        value={currentUser.providerCategory || "HVAC"}
                        onChange={(e) => onUpdateCurrentUser({ ...currentUser, providerCategory: e.target.value })}
                        className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="HVAC">HVAC Maintenance</option>
                        <option value="Plumbing">Plumbing Services</option>
                        <option value="Electrical">Electrical Grid</option>
                        <option value="Roofing">Roofing & Exterior</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Your active profile modifications are saved in-memory and simulated locally.</span>
                </div>
              </div>
            </div>

            {/* Auth Sign-In / Register Simulator Gate */}
            <div className="p-4 bg-[#111522] border border-blue-500/10 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4 text-blue-400 animate-pulse" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    {authMode === "login" ? "Stakeholder Login Gate" : "Register New Stakeholder"}
                  </h3>
                </div>
                <button
                  onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                  className="text-[9.5px] font-mono font-bold text-blue-400 hover:underline cursor-pointer"
                >
                  {authMode === "login" ? "Create Account ↗" : "Sign In instead"}
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-3">
                <div className="grid grid-cols-3 gap-2 p-1 bg-[#0A0A0A] rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setRoleSelection("homeowner")}
                    className={`py-1.5 rounded-lg text-center font-mono text-[9px] font-extrabold uppercase transition-colors cursor-pointer ${
                      roleSelection === "homeowner" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-zinc-500"
                    }`}
                  >
                    Homeowner
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleSelection("provider")}
                    className={`py-1.5 rounded-lg text-center font-mono text-[9px] font-extrabold uppercase transition-colors cursor-pointer ${
                      roleSelection === "provider" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "text-zinc-500"
                    }`}
                  >
                    Provider
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleSelection("admin")}
                    className={`py-1.5 rounded-lg text-center font-mono text-[9px] font-extrabold uppercase transition-colors cursor-pointer ${
                      roleSelection === "admin" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-zinc-500"
                    }`}
                  >
                    Platform Admin
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. resident@homepulse.io"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Arthur Pendragon"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">
                      Secure Password (Simulated)
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>

                  {/* Provider Extra Fields */}
                  {roleSelection === "provider" && (
                    <div className="p-3 bg-[#0A0A0A]/60 border border-slate-800/80 rounded-xl space-y-2.5">
                      <span className="text-[8px] font-mono text-amber-400 uppercase tracking-widest font-black">
                        PRO REPAIR COMPLIANCE DATA
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[7.5px] font-mono text-zinc-500 uppercase">Specialty Category</label>
                          <select
                            value={specialtySelection}
                            onChange={(e) => setSpecialtySelection(e.target.value)}
                            className="w-full bg-zinc-900 border border-slate-800 text-[10px] text-white rounded px-2 py-1 focus:outline-none"
                          >
                            <option value="HVAC">HVAC Services</option>
                            <option value="Plumbing">Plumbing Services</option>
                            <option value="Electrical">Electrical Grid</option>
                            <option value="Other">Other Mechanical</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[7.5px] font-mono text-zinc-500 uppercase">Hourly Rate ($/hr)</label>
                          <input
                            type="number"
                            value={hourlyRateInput}
                            onChange={(e) => setHourlyRateInput(Number(e.target.value))}
                            className="w-full bg-zinc-900 border border-slate-800 text-[10px] text-white rounded px-2 py-1 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[7.5px] font-mono text-zinc-500 uppercase">Company / LLC Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Seattle Air & Heating LLC"
                          value={companyNameInput}
                          onChange={(e) => setCompanyNameInput(e.target.value)}
                          className="w-full bg-zinc-900 border border-slate-800 text-[10px] text-white rounded px-2 py-1 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Admin authorization secret */}
                  {roleSelection === "admin" && (
                    <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                      <label className="block text-[8px] font-mono text-red-400 uppercase tracking-widest font-black mb-1">
                        Master Developer Access Key
                      </label>
                      <input
                        type="password"
                        placeholder="Enter: ADMIN123"
                        value={adminSecretCode}
                        onChange={(e) => setAdminSecretCode(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-red-500/20 focus:border-red-500 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 shadow-md mt-1 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>
                    {authMode === "login" 
                      ? `Authenticate as ${roleSelection.toUpperCase()}` 
                      : `Deploy & Register ${roleSelection.toUpperCase()} Profile`}
                  </span>
                </button>
              </form>
            </div>

          </div>
        )}

        {/* TAB 2: PRICING PLANS & INTEGRATED STRIPE CHECKOUT PAYMENT */}
        {activeTab === "pricing" && (
          <div className="space-y-5">
            
            {/* SaaS Platform Presentation Header */}
            <div className="text-center space-y-1 py-1">
              <span className="text-[9px] font-mono text-amber-400 uppercase font-black tracking-widest block">
                Enterprise SaaS Models
              </span>
              <h3 className="text-lg font-black font-display text-white">
                Proactive HomePulse Protection Plans
              </h3>
              <p className="text-[10px] text-zinc-400 max-w-sm mx-auto leading-normal">
                Authorize proactive diagnostics and direct certified contractors automatically to keep appliance and HVAC warranty structures optimal.
              </p>
            </div>

            {/* Simulated Checkout Overlay Modal */}
            {checkoutStep !== "idle" && selectedPlan && (
              <div className="p-4 bg-[#111625] border border-blue-500/30 rounded-2xl shadow-2xl space-y-4 animate-fade-in relative">
                
                {/* Close Button */}
                <button
                  onClick={() => setCheckoutStep("idle")}
                  className="absolute top-3.5 right-3.5 p-1 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                    <CreditCard className="w-4 h-4 text-blue-400 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">Stripe Integrated Checkout</h4>
                    <p className="text-[9px] text-zinc-400">Secure transaction sandbox</p>
                  </div>
                </div>

                {checkoutStep === "form" && (
                  <form onSubmit={handleProcessCheckout} className="space-y-3.5 text-left">
                    <div className="bg-[#0A0A0A] p-2.5 border border-slate-800 rounded-xl flex items-center justify-between text-[10.5px]">
                      <div>
                        <span className="text-zinc-500 text-[8px] uppercase font-mono block">Selected Subscription</span>
                        <span className="text-white font-bold">{selectedPlan.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-zinc-500 text-[8px] uppercase font-mono block">Recurring Fee</span>
                        <span className="text-amber-400 font-extrabold">${selectedPlan.price} / month</span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                          Cardholder Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                          Credit Card Number
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="4242 •••• •••• 4242"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                            Expiration Date
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="MM / YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                            Card Verification CVC
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="123"
                            maxLength={3}
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Lock className="w-3.5 h-3.5 text-white" />
                      <span>Authorize Secure Payment of ${selectedPlan.price}.00</span>
                    </button>
                  </form>
                )}

                {checkoutStep === "processing" && (
                  <div className="p-8 text-center space-y-4">
                    <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                    <p className="text-[11px] font-mono font-bold text-blue-400 animate-pulse">
                      {paymentStatusMessage}
                    </p>
                    <p className="text-[9px] text-zinc-500">
                      Do not refresh or exit the frame while we coordinate with Stripe Payment Orchestration servers.
                    </p>
                  </div>
                )}

                {checkoutStep === "receipt" && (
                  <div className="p-4 text-center space-y-4 animate-scale-up">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">SaaS Payment Confirmed!</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Your Homeowner account has been upgraded successfully.</p>
                    </div>

                    <div className="bg-[#0A0A0A]/80 border border-slate-900 rounded-xl p-3 text-left font-mono text-[9px] text-zinc-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Invoice Status:</span>
                        <span className="text-emerald-400 font-bold uppercase">Paid & Covered</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transaction Token:</span>
                        <span className="text-white">tx_stripe_98a3b8d91c2</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vault Log Ledger:</span>
                        <span className="text-zinc-500">Auto-uploaded to Documents Vault ✓</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setCheckoutStep("idle")}
                      className="w-full bg-zinc-900 hover:bg-zinc-800 border border-slate-800 text-white font-bold text-xs py-2 rounded-xl transition-all cursor-pointer"
                    >
                      Return to Premium Console
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* Pricing Model Tiers Stack */}
            <div className="grid grid-cols-1 gap-4">
              {pricingPlans.map((plan) => {
                const isActive = currentUser.tier.toLowerCase() === plan.badge.toLowerCase() || 
                                 (plan.id === "plan-free" && currentUser.tier === "Free") ||
                                 (plan.id === "plan-pro" && currentUser.tier === "Pro") ||
                                 (plan.id === "plan-enterprise" && currentUser.tier === "Enterprise");

                return (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-2xl border transition-all text-left space-y-3 relative overflow-hidden ${
                      isActive 
                        ? "bg-[#111A2E] border-blue-500/40 shadow-xl shadow-blue-500/5" 
                        : "bg-[#101820]/80 border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-0 right-0 bg-blue-500 text-white font-mono text-[7px] font-extrabold uppercase px-2 py-0.5 rounded-bl">
                        Active Coverage Plan
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
                          {plan.badge} Plan
                        </span>
                        <h4 className="text-sm font-black text-white font-display mt-0.5">{plan.name}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-white font-display">${plan.price}</span>
                        <span className="text-[9px] text-zinc-500 block font-mono">/ {plan.period}</span>
                      </div>
                    </div>

                    <ul className="space-y-1.5 border-t border-slate-900/60 pt-3">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start text-[10px] text-zinc-300">
                          <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mr-1.5 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-2">
                      {isActive ? (
                        <div className="w-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-[10px] py-2 rounded-xl text-center flex items-center justify-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                          <span>Active Node Authorized</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartCheckout(plan)}
                          className="w-full bg-slate-900 hover:bg-[#2563EB] hover:text-white text-zinc-300 font-bold text-[10px] py-2 rounded-xl border border-slate-800 transition-all cursor-pointer text-center"
                        >
                          {plan.price === 0 ? "Activate Free Mode" : `Subscribe for $${plan.price}/mo`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Simulated Payment Wallet & Card Manager */}
            <div className="p-4 bg-[#101820] border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    Integrated Payment Wallet & Saved Cards
                  </h3>
                </div>
                <button
                  onClick={() => setCardModalOpen(!cardModalOpen)}
                  className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 hover:border-blue-500/30 text-blue-400 font-mono font-bold text-[9px] px-2.5 py-1 rounded transition-all cursor-pointer uppercase flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>{cardModalOpen ? "Close Form" : "Add Card"}</span>
                </button>
              </div>

              {cardModalOpen && (
                <div className="p-3 bg-zinc-950 border border-slate-800 rounded-xl space-y-3 text-left animate-fade-in">
                  <p className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-wider">Simulate New Credit Card Tokenization</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <label className="block text-[7.5px] font-mono text-zinc-500 uppercase mb-1">Card Brand / Network</label>
                      <select
                        value={newCardBrand}
                        onChange={(e) => setNewCardBrand(e.target.value)}
                        className="w-full bg-[#101820] border border-slate-800 text-white rounded px-2 py-1.5 focus:outline-none"
                      >
                        <option value="Visa">Visa Premium Credit</option>
                        <option value="Mastercard">Mastercard Gold</option>
                        <option value="Amex">American Express Platinum</option>
                        <option value="Discover">Discover Cashback</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[7.5px] font-mono text-zinc-500 uppercase mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="Marcus Vance"
                        value={newCardHolder}
                        onChange={(e) => setNewCardHolder(e.target.value)}
                        className="w-full bg-[#101820] border border-slate-800 text-white rounded px-2 py-1 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="col-span-1.5">
                      <label className="block text-[7.5px] font-mono text-zinc-500 uppercase mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="4242 8890 1102 3345"
                        value={newCardNumber}
                        onChange={(e) => setNewCardNumber(e.target.value)}
                        className="w-full bg-[#101820] border border-slate-800 text-white rounded px-2 py-1 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[7.5px] font-mono text-zinc-500 uppercase mb-1">Expiry</label>
                      <input
                        type="text"
                        placeholder="11/29"
                        value={newCardExpiry}
                        onChange={(e) => setNewCardExpiry(e.target.value)}
                        className="w-full bg-[#101820] border border-slate-800 text-white rounded px-2 py-1 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[7.5px] font-mono text-zinc-500 uppercase mb-1">CVC</label>
                      <input
                        type="text"
                        placeholder="707"
                        maxLength={3}
                        value={newCardCvc}
                        onChange={(e) => setNewCardCvc(e.target.value)}
                        className="w-full bg-[#101820] border border-slate-800 text-white rounded px-2 py-1 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newCardNumber || !newCardExpiry) {
                        alert("Please fill in card details to tokenize.");
                        return;
                      }
                      const last4 = newCardNumber.trim().slice(-4) || "1007";
                      const newCard = {
                        id: `card_${Date.now()}`,
                        brand: newCardBrand,
                        last4,
                        expiry: newCardExpiry,
                        holder: newCardHolder || currentUser.name,
                        isDefault: creditCards.length === 0
                      };
                      setCreditCards([...creditCards, newCard]);
                      setCardModalOpen(false);
                      setNewCardNumber("");
                      setNewCardExpiry("");
                      setNewCardCvc("");
                      setNewCardHolder("");
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-[9px] py-1.5 rounded transition-colors uppercase cursor-pointer"
                  >
                    Securely Link Simulated Card via Stripe Elements
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {creditCards.map((card) => (
                  <div 
                    key={card.id} 
                    className={`p-3 rounded-xl border flex items-center justify-between relative overflow-hidden ${
                      card.isDefault 
                        ? "bg-gradient-to-br from-slate-900 to-[#1e293b] border-blue-500/30" 
                        : "bg-zinc-950 border-slate-900"
                    }`}
                  >
                    <div className="flex items-center space-x-3 text-left">
                      <div className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg text-zinc-300">
                        <CreditCard className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <p className="text-[11px] font-mono font-black text-white">{card.brand} •••• {card.last4}</p>
                          {card.isDefault && (
                            <span className="text-[7px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1 py-0.1 rounded uppercase">Default</span>
                          )}
                        </div>
                        <p className="text-[9px] text-zinc-500 font-mono">Expires {card.expiry} • {card.holder}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!card.isDefault && (
                        <button
                          onClick={() => setCreditCards(prev => prev.map(c => ({ ...c, isDefault: c.id === card.id })))}
                          className="p-1 text-zinc-500 hover:text-white hover:bg-slate-800/60 rounded cursor-pointer"
                          title="Set as Default Card"
                        >
                          <Check className="w-3.5 h-3.5 text-zinc-500" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (card.isDefault && creditCards.length > 1) {
                            alert("Set another card as default before removing this card.");
                            return;
                          }
                          setCreditCards(prev => prev.filter(c => c.id !== card.id));
                        }}
                        className="p-1 text-zinc-500 hover:text-red-400 hover:bg-slate-800/60 rounded cursor-pointer"
                        title="Delete card"
                      >
                        <Trash2 className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    </div>
                  </div>
                ))}
                {creditCards.length === 0 && (
                  <p className="text-[10px] text-zinc-500 col-span-2 text-center py-4 border border-dashed border-slate-800 rounded-xl font-mono">No credit cards on file. Link a simulated card above.</p>
                )}
              </div>
            </div>

            {/* Outstanding Repair Bills & Contractor Invoices */}
            <div className="p-4 bg-[#101820] border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    Outstanding Contractor Bills & Invoices
                  </h3>
                </div>
                <span className="text-[8px] font-mono font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded uppercase">
                  {invoicesList.filter(inv => inv.status === "Unpaid").length} Unpaid
                </span>
              </div>

              <div className="space-y-3">
                {invoicesList.map((inv) => {
                  const defaultCard = creditCards.find(c => c.isDefault) || creditCards[0];
                  
                  return (
                    <div 
                      key={inv.id} 
                      className={`p-3 rounded-xl border text-left space-y-2.5 transition-all ${
                        inv.status === "Unpaid" 
                          ? "bg-zinc-950/60 border-slate-800 hover:border-amber-500/20" 
                          : "bg-zinc-950/20 border-slate-900 opacity-75"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[7.5px] font-mono bg-slate-900 border border-slate-800 text-zinc-400 px-1 py-0.1 rounded uppercase font-bold">
                              {inv.serviceCategory} SERVICE
                            </span>
                            <span className="text-[8px] font-mono text-zinc-500">ID: {inv.id}</span>
                          </div>
                          <h4 className="text-[11.5px] font-bold text-white mt-1">{inv.description}</h4>
                          <p className="text-[9px] text-zinc-500 mt-0.5">Issued by <span className="text-zinc-300 font-bold">{inv.providerName}</span> on {inv.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-white font-mono">${inv.amount}.00</p>
                          <span className={`text-[7.5px] font-mono font-black uppercase px-1.5 py-0.5 rounded block mt-1 text-center ${
                            inv.status === "Paid" 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {inv.status}
                          </span>
                        </div>
                      </div>

                      {inv.status === "Unpaid" && (
                        <div className="pt-2 border-t border-slate-900/60 flex items-center justify-between gap-4">
                          <div className="flex items-center space-x-1.5 min-w-0">
                            <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
                            {defaultCard ? (
                              <span className="text-[9px] font-mono text-zinc-400 truncate">Charge to {defaultCard.brand} (•••• {defaultCard.last4})</span>
                            ) : (
                              <span className="text-[9px] font-mono text-red-400">Please link a card to clear bill</span>
                            )}
                          </div>
                          <button
                            disabled={!defaultCard}
                            onClick={() => {
                              // Simulate payment
                              const feeAmount = Number((inv.amount * (commissionRate / 100)).toFixed(2));
                              
                              // Create Transaction Record
                              const newTx = {
                                id: `tx_${Date.now()}`,
                                userEmail: currentUser.email,
                                userName: currentUser.name,
                                type: "Commission",
                                description: `${inv.providerName} Service Repair Commission (${commissionRate}%)`,
                                amount: inv.amount,
                                platformCut: feeAmount,
                                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
                              };

                              setTransactions(prev => [newTx, ...prev]);

                              // Update invoice status
                              setInvoicesList(prev => prev.map(i => {
                                if (i.id === inv.id) {
                                  return { ...i, status: "Paid", platformFee: feeAmount };
                                }
                                return i;
                              }));

                              // Generate invoice PDF record in documents vault
                              const invDoc: DocumentRecord = {
                                id: `inv_receipt_${Date.now()}`,
                                name: `Paid Receipt for ${inv.providerName} (${inv.id})`,
                                type: "receipt",
                                date: new Date().toLocaleDateString("en-US"),
                                size: "38 KB"
                              };
                              onAddDocument(invDoc);

                              alert(`Stripe transaction approved! $${inv.amount}.00 cleared with saved card. Receipt uploaded to Property Vault.`);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-white text-[9.5px] font-mono font-bold uppercase transition-all flex items-center gap-1 shrink-0 ${
                              defaultCard 
                                ? "bg-emerald-600 hover:bg-emerald-500 cursor-pointer" 
                                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Authorize Payment</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {invoicesList.length === 0 && (
                  <p className="text-[10px] text-zinc-500 text-center py-4 border border-dashed border-slate-800 rounded-xl font-mono">No bills recorded for this address.</p>
                )}
              </div>
            </div>

            {/* My SaaS Payment Activity Ledger */}
            <div className="p-4 bg-[#101820] border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-zinc-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  My Billing & Transaction Logs
                </h3>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {transactions
                  .filter(tx => tx.userEmail.toLowerCase() === currentUser.email.toLowerCase())
                  .map((tx) => (
                    <div 
                      key={tx.id} 
                      className="p-2 bg-zinc-950/60 rounded-xl flex items-center justify-between text-[10px] border border-slate-900 text-left"
                    >
                      <div className="space-y-0.5">
                        <span className={`text-[7px] font-mono font-black uppercase px-1 py-0.1 rounded ${
                          tx.type === "Subscription" ? "bg-blue-500/10 text-blue-400 border border-blue-500/10" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                        }`}>
                          {tx.type}
                        </span>
                        <p className="text-white font-bold">{tx.description}</p>
                        <p className="text-[8px] text-zinc-500 font-mono">{tx.timestamp}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-black text-white">${tx.amount.toFixed(2)}</p>
                        <span className="text-[8.5px] font-mono text-zinc-500 block uppercase font-bold">✓ SECURE</span>
                      </div>
                    </div>
                  ))}
                {transactions.filter(tx => tx.userEmail.toLowerCase() === currentUser.email.toLowerCase()).length === 0 && (
                  <p className="text-[10px] text-zinc-500 text-center py-3 font-mono">No billing activity logged yet.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: PLATFORM MASTER ADMIN DASHBOARD (AUTHORIZED ONLY) */}
        {activeTab === "admin" && (
          <div className="space-y-4">
            
            {currentUser.role !== "admin" ? (
              <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl text-center space-y-3.5">
                <Shield className="w-12 h-12 text-red-500/40 mx-auto animate-pulse" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-red-400 font-mono">
                    Unauthorized Authorization Blocked
                  </h4>
                  <p className="text-[10px] text-zinc-500 leading-normal max-w-sm mx-auto mt-1">
                    Your active stakeholder level is <span className="font-bold text-white uppercase">{currentUser.role}</span>. You do not possess the digital signatures required to adjust pricing structures, alter user subscriptions, or audit revenue ledgers.
                  </p>
                </div>
                <div className="pt-1.5">
                  <button
                    onClick={() => {
                      onUpdateCurrentUser({
                        id: "usr_admin",
                        name: "Master Admin Vance",
                        email: "admin@homepulse.io",
                        role: "admin",
                        tier: "Enterprise"
                      });
                      setActiveTab("admin");
                    }}
                    className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-[10px] px-4 py-2 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Elevate to System Administrator</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                
                {/* Admin Platform Statistics */}
                <div className="p-4 bg-[#101820] border border-slate-800 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-white">
                        SaaS Revenue & Take-Rate Cockpit
                      </h3>
                    </div>
                    <div className="flex items-center space-x-1 bg-zinc-950 px-2 py-1 rounded border border-slate-800">
                      <span className="text-[8px] font-mono text-zinc-400 uppercase">Platform Take-Rate:</span>
                      <span className="text-[9px] font-mono font-bold text-emerald-400">{commissionRate}%</span>
                    </div>
                  </div>

                  {/* Calculations based on real transactions ledger */}
                  {(() => {
                    const totalSaaSSubscriptions = transactions
                      .filter(tx => tx.type === "Subscription")
                      .reduce((sum, tx) => sum + tx.amount, 0);
                    
                    const totalCommissionsEarned = transactions
                      .filter(tx => tx.type === "Commission")
                      .reduce((sum, tx) => sum + tx.platformCut, 0);

                    const totalRevenue = totalSaaSSubscriptions + totalCommissionsEarned;

                    return (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
                        <div className="bg-[#0A0A0A] p-3 border border-slate-900 rounded-xl">
                          <span className="text-zinc-500 text-[8px] uppercase font-mono block">Aggregate Earnings YTD</span>
                          <span className="text-base font-black text-white font-display mt-0.5 block">
                            ${totalRevenue.toFixed(2)}
                          </span>
                          <span className="text-[7px] font-mono text-emerald-500 block mt-0.5">100% Simulated Live Flow</span>
                        </div>
                        <div className="bg-[#0A0A0A] p-3 border border-slate-900 rounded-xl">
                          <span className="text-zinc-500 text-[8px] uppercase font-mono block">Recurring SaaS Income</span>
                          <span className="text-base font-black text-blue-400 font-display mt-0.5 block">
                            ${totalSaaSSubscriptions.toFixed(2)}
                          </span>
                          <span className="text-[7px] font-mono text-zinc-500 block mt-0.5">SaaS Pro / Enterprise Upgrades</span>
                        </div>
                        <div className="bg-[#0A0A0A] p-3 border border-slate-900 rounded-xl">
                          <span className="text-zinc-500 text-[8px] uppercase font-mono block">Contractor Commissions</span>
                          <span className="text-base font-black text-emerald-400 font-display mt-0.5 block">
                            ${totalCommissionsEarned.toFixed(2)}
                          </span>
                          <span className="text-[7px] font-mono text-zinc-500 block mt-0.5">From {transactions.filter(t => t.type === "Commission").length} repair ticket fees</span>
                        </div>
                        <div className="bg-[#0A0A0A] p-3 border border-slate-900 rounded-xl">
                          <span className="text-zinc-500 text-[8px] uppercase font-mono block">Active Nodes</span>
                          <span className="text-base font-black text-amber-400 font-display mt-0.5 block">
                            {usersList.length} Accounts
                          </span>
                          <span className="text-[7px] font-mono text-zinc-500 block mt-0.5">Registered Stakeholders</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Pricing Tiers & Commission Rate Slider */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-900/60">
                    <div>
                      <div className="flex justify-between text-[9px] mb-1 font-mono text-zinc-400">
                        <span>Platform Commission Rate</span>
                        <span className="text-emerald-400 font-bold">{commissionRate}% cut</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        step="1"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer h-1 bg-[#0A0A0A] rounded-lg border border-slate-900"
                      />
                      <span className="text-[7.5px] text-zinc-500 font-mono mt-1 block">Applies to all subsequent repair invoice payments.</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-[9px] mb-1 font-mono text-zinc-400">
                        <span>HomePulse Pro Price</span>
                        <span className="text-blue-400 font-bold">${pricingPlans[1].price} / mo</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="40"
                        step="1"
                        value={pricingPlans[1].price}
                        onChange={(e) => handleUpdatePlanPrice("plan-pro", Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer h-1 bg-[#0A0A0A] rounded-lg border border-slate-900"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[9px] mb-1 font-mono text-zinc-400">
                        <span>Enterprise Shield Price</span>
                        <span className="text-indigo-400 font-bold">${pricingPlans[2].price} / mo</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="150"
                        step="5"
                        value={pricingPlans[2].price}
                        onChange={(e) => handleUpdatePlanPrice("plan-enterprise", Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer h-1 bg-[#0A0A0A] rounded-lg border border-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Simulated Revenue Analytics Chart */}
                <div className="p-4 bg-[#101820] border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-white">
                        Monthly Revenue Velocity & Forecast Matrix
                      </h3>
                    </div>
                    <span className="text-[8px] font-mono text-zinc-400 uppercase">Interactive Visualization</span>
                  </div>

                  {/* Recharts Area Chart */}
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={[
                          { month: "Jan", Subscription: 350, Commission: 120, Total: 470 },
                          { month: "Feb", Subscription: 480, Commission: 180, Total: 660 },
                          { month: "Mar", Subscription: 590, Commission: 210, Total: 800 },
                          { month: "Apr", Subscription: 720, Commission: 290, Total: 1010 },
                          { month: "May", Subscription: 910, Commission: 440, Total: 1350 },
                          { month: "Jun", Subscription: 1150, Commission: 680, Total: 1830 },
                          { month: "Jul", Subscription: 1480, Commission: 920, Total: 2400 }
                        ]}
                        margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorSaaS" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                        <XAxis dataKey="month" stroke="#6B7280" fontSize={9} />
                        <YAxis stroke="#6B7280" fontSize={9} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#0C0F17", border: "1px solid #374151", borderRadius: "12px", color: "#fff" }} 
                          labelStyle={{ fontWeight: "bold", fontSize: "10px", color: "#9CA3AF" }}
                        />
                        <Area type="monotone" dataKey="Total" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" name="Total Revenue" />
                        <Area type="monotone" dataKey="Subscription" stroke="#3B82F6" strokeWidth={1.5} fillOpacity={1} fill="url(#colorSaaS)" name="SaaS Upgrades" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Dynamic User Management Directory */}
                <div className="p-4 bg-[#101820] border border-slate-800 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-white text-left">
                        Master User Directory & Credentials Manager
                      </h3>
                    </div>
                    
                    {/* Filters & Search */}
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2 top-2" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg pl-7 pr-2.5 py-1 text-[10px] text-white focus:outline-none w-32 font-mono"
                        />
                      </div>
                      <select
                        value={userRoleFilter}
                        onChange={(e: any) => setUserRoleFilter(e.target.value)}
                        className="bg-[#0A0A0A] border border-slate-800 text-zinc-400 text-[10px] rounded px-2 py-1 focus:outline-none"
                      >
                        <option value="all">All Roles</option>
                        <option value="homeowner">Homeowner</option>
                        <option value="provider">Providers</option>
                        <option value="admin">Admins</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-900 rounded-xl">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-zinc-950 text-zinc-400 font-mono text-[8px] uppercase tracking-wider border-b border-slate-800">
                          <th className="p-2.5 font-bold">User / Profile</th>
                          <th className="p-2.5 font-bold">Role</th>
                          <th className="p-2.5 font-bold">SaaS Coverage</th>
                          <th className="p-2.5 font-bold">Node Status</th>
                          <th className="p-2.5 font-bold text-center">Operational Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 bg-zinc-950/40">
                        {usersList
                          .filter(u => {
                            const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
                            const matchRole = userRoleFilter === "all" || u.role === userRoleFilter;
                            return matchSearch && matchRole;
                          })
                          .map((u) => (
                            <tr key={u.id} className="hover:bg-slate-900/30 transition-colors">
                              <td className="p-2.5">
                                <p className="font-bold text-white">{u.name}</p>
                                <p className="text-[9px] text-zinc-500 font-mono">{u.email}</p>
                              </td>
                              <td className="p-2.5">
                                <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded font-black ${
                                  u.role === "admin" 
                                    ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                                    : u.role === "provider"
                                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="p-2.5">
                                <select
                                  value={u.tier}
                                  onChange={(e) => {
                                    const nextTier = e.target.value as any;
                                    setUsersList(prev => prev.map(usr => {
                                      if (usr.id === u.id) return { ...usr, tier: nextTier };
                                      return usr;
                                    }));
                                    if (currentUser.id === u.id) {
                                      onUpdateCurrentUser({ ...currentUser, tier: nextTier });
                                    }
                                  }}
                                  className="bg-[#0A0A0A] border border-slate-900 text-zinc-300 text-[10px] rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                                >
                                  <option value="Free">SaaS Free</option>
                                  <option value="Basic">SaaS Basic</option>
                                  <option value="Pro">SaaS Pro</option>
                                  <option value="Enterprise">Enterprise</option>
                                </select>
                              </td>
                              <td className="p-2.5">
                                <button
                                  onClick={() => {
                                    setUsersList(prev => prev.map(usr => {
                                      if (usr.id === u.id) {
                                        return { ...usr, status: usr.status === "Active" ? "Suspended" : "Active" };
                                      }
                                      return usr;
                                    }));
                                  }}
                                  className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded transition-all cursor-pointer ${
                                    u.status === "Active"
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20"
                                      : "bg-rose-500/10 text-rose-400 border border-rose-500/25 hover:bg-rose-500/20"
                                  }`}
                                >
                                  {u.status}
                                </button>
                              </td>
                              <td className="p-2.5 text-center flex items-center justify-center space-x-1.5">
                                <button
                                  onClick={() => {
                                    setUsersList(prev => prev.map(usr => {
                                      if (usr.id === u.id) return { ...usr, verified: !usr.verified };
                                      return usr;
                                    }));
                                    alert(`${u.name} verification toggled!`);
                                  }}
                                  className={`p-1 rounded hover:bg-slate-800 text-xs transition-all cursor-pointer ${
                                    u.verified ? "text-emerald-400" : "text-zinc-500"
                                  }`}
                                  title="Toggle ID/License Verification"
                                >
                                  <CheckSquare className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (u.id === currentUser.id) {
                                      alert("Cannot delete the active administrator account node.");
                                      return;
                                    }
                                    if (confirm(`Are you sure you want to remove ${u.name}?`)) {
                                      setUsersList(prev => prev.filter(usr => usr.id !== u.id));
                                    }
                                  }}
                                  className="p-1 rounded hover:bg-red-500/15 text-zinc-500 hover:text-red-400 text-xs transition-all cursor-pointer"
                                  title="Erase Account"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Service Provider Verification Authorization Table */}
                <div className="p-4 bg-[#101820] border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-white text-left">
                        Certified Service Provider Registry
                      </h3>
                    </div>
                    
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2 top-2" />
                      <input
                        type="text"
                        placeholder="Search providers..."
                        value={providerSearch}
                        onChange={(e) => setProviderSearch(e.target.value)}
                        className="bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg pl-7 pr-2.5 py-1 text-[10px] text-white focus:outline-none w-32 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {usersList
                      .filter(u => u.role === "provider" && u.name.toLowerCase().includes(providerSearch.toLowerCase()))
                      .map((pro) => (
                        <div 
                          key={pro.id} 
                          className="p-3 bg-[#0A0A0A] border border-slate-900 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-3"
                        >
                          <div className="text-left space-y-1">
                            <div className="flex items-center space-x-1.5">
                              <p className="font-bold text-white">{pro.name}</p>
                              <span className="text-[7.5px] font-mono bg-zinc-900 text-amber-400 border border-amber-500/20 px-1 py-0.1 rounded font-bold uppercase">
                                {pro.tier} Pro Tiers
                              </span>
                            </div>
                            <p className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-widest">
                              Category specialty: <span className="text-zinc-300 font-bold">{pro.providerCategory || "HVAC"}</span>
                            </p>
                            <div className="flex items-center space-x-2 pt-0.5 text-[9.5px]">
                              <span className="text-zinc-500">Service Hourly Rate:</span>
                              <input
                                type="number"
                                value={pro.serviceRate || 120}
                                onChange={(e) => {
                                  const rate = Number(e.target.value);
                                  setUsersList(prev => prev.map(usr => {
                                    if (usr.id === pro.id) return { ...usr, serviceRate: rate };
                                    return usr;
                                  }));
                                }}
                                className="bg-zinc-950 border border-slate-800 text-white font-mono text-[9px] w-12 text-center rounded focus:outline-none py-0.5"
                              />
                              <span className="text-zinc-500">/ hr</span>
                            </div>
                          </div>
                          
                          {/* Dynamic Approval */}
                          <div className="flex items-center space-x-2 shrink-0">
                            {pro.verified ? (
                              <span className="text-[8px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase">
                                Certified & Insured ✓
                              </span>
                            ) : (
                              <span className="text-[8px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase">
                                Pending Verification
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setUsersList(prev => prev.map(usr => {
                                  if (usr.id === pro.id) {
                                    return { ...usr, verified: !usr.verified };
                                  }
                                  return usr;
                                }));
                                alert(`Simulated KYC/Licensing verification status toggled for ${pro.name}.`);
                              }}
                              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[8.5px] px-2 py-1 rounded border border-emerald-500/20 transition-all cursor-pointer uppercase"
                            >
                              {pro.verified ? "De-authorize" : "Verify & Approve"}
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Simulated Ledger Feed */}
                <div className="p-4 bg-[#101820] border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">
                      Global Platform Billing & Transaction Ledger
                    </h3>
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {transactions.map((tx) => (
                      <div 
                        key={tx.id} 
                        className="p-2 bg-zinc-950/60 rounded-xl flex items-center justify-between text-[10px] border border-slate-900 text-left"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5">
                            <span className={`text-[7px] font-mono font-black uppercase px-1 py-0.1 rounded ${
                              tx.type === "Subscription" ? "bg-blue-500/10 text-blue-400 border border-blue-500/10" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                            }`}>
                              {tx.type}
                            </span>
                            <span className="text-[8px] font-mono text-zinc-500">{tx.timestamp}</span>
                          </div>
                          <p className="text-white font-bold">{tx.description}</p>
                          <p className="text-[8.5px] text-zinc-400">Payer: <span className="font-bold">{tx.userName}</span> ({tx.userEmail})</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-black text-white">${tx.amount.toFixed(2)}</p>
                          <p className="text-[8px] font-mono text-emerald-400">Platform Cut: +${tx.platformCut.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* TAB 4: SERVICE PROVIDER PORTAL DASHBOARD (REPAIR WORKFLOW) */}
        {activeTab === "provider" && (
          <div className="space-y-4">
            
            {currentUser.role !== "provider" ? (
              <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-center space-y-3.5">
                <Building className="w-12 h-12 text-amber-500/40 mx-auto animate-pulse" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono">
                    Service Provider Authorization Blocked
                  </h4>
                  <p className="text-[10px] text-zinc-500 leading-normal max-w-sm mx-auto mt-1">
                    Your active stakeholder level is <span className="font-bold text-white uppercase">{currentUser.role}</span>. You do not possess the service credentials required to view homeowner repair calls, accept mechanic dispatch requests, or log hourly LLC earnings.
                  </p>
                </div>
                <div className="pt-1.5">
                  <button
                    onClick={() => {
                      setRoleSelection("provider");
                      setActiveTab("profile");
                    }}
                    className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-[10px] px-4 py-2 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>Login as Certified Local Provider</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Provider LLC Earnings & Status Panel */}
                <div className="p-4 bg-gradient-to-br from-[#1B120B] to-[#0A0A0A] border border-amber-500/15 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono text-amber-500 uppercase font-black tracking-widest block">
                      Contractor Node Dashboard
                    </span>
                    <h4 className="text-xs text-zinc-400">Total Simulated LLC Earnings YTD</h4>
                    <p className="text-2xl font-black text-amber-400 font-display">${currentUser.earnings || 0}.00</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-mono text-zinc-500 uppercase block">Hourly Base Rate</span>
                    <span className="text-xs font-bold text-white font-mono">${currentUser.serviceRate || 125}/hr</span>
                    <span className="text-[7px] font-mono text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded uppercase block mt-1.5">
                      {currentUser.approved ? "Certified ✓" : "Reviewing Docs"}
                    </span>
                  </div>
                </div>

                {/* Assigned Mechanical Appointments Queue */}
                <div className="p-4 bg-[#101820] border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-white">
                        Active Dispatch Service Appointments
                      </h3>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500 font-extrabold bg-[#0A0A0A] border border-slate-800 px-2 py-0.5 rounded">
                      {appointments.filter(a => a.status !== "Completed").length} Pending
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {appointments.map((appt) => (
                      <div
                        key={appt.id}
                        className="p-3 bg-[#0A0A0A] border border-slate-800 rounded-xl space-y-3.5 text-left"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                              Category: {appt.providerSpecialty} Repair Call
                            </span>
                            <h5 className="text-[11px] font-bold text-white mt-0.5 leading-tight">
                              {appt.providerName} Scheduled Request
                            </h5>
                            <p className="text-[9px] font-mono text-zinc-500 mt-1">
                              Appointment Target: {appt.date} at {appt.time}
                            </p>
                          </div>

                          <div>
                            <span className={`text-[8px] font-mono font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              appt.status === "Completed" 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}>
                              {appt.status}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Status flow controller for the active provider */}
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-900/60">
                          {appt.status !== "Completed" ? (
                            <button
                              onClick={() => handleCompleteRepairByProvider(appt.id)}
                              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-mono font-bold text-[9px] py-1.5 rounded-lg transition-all cursor-pointer uppercase flex items-center justify-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5 text-white" />
                              <span>Conclude Service & Collect $150</span>
                            </button>
                          ) : (
                            <div className="w-full text-center text-zinc-500 font-mono text-[9px] py-1 bg-slate-900 rounded border border-slate-800">
                              ✓ Job Cleared & Paid via HomePulse Escrow
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {appointments.length === 0 && (
                      <div className="bg-[#101820]/40 border border-slate-800 border-dashed rounded-xl p-6 text-center text-[10px] text-zinc-500">
                        No assigned customer repair dispatch calls logged.
                      </div>
                    )}
                  </div>
                </div>

                {/* Real-time Client Invoicing Form */}
                <div className="p-4 bg-[#101820] border border-slate-800 rounded-2xl space-y-4 text-left">
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">
                      Create Real-Time Client Service Invoice
                    </h3>
                  </div>

                  <p className="text-[9.5px] text-zinc-400 leading-normal">
                    Issue a secure, itemized bill to any homeowner registered on the platform. The platform take-rate commission ({commissionRate}%) is automatically calculated.
                  </p>

                  {invoiceCreateSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center space-x-2 text-emerald-400 text-[10.5px] font-mono animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>Invoice successfully generated and sent to homeowner!</span>
                    </div>
                  )}

                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-2 gap-3 text-[10px]">
                      <div>
                        <label className="block text-[7.5px] font-mono text-zinc-500 uppercase mb-1">Target Client Profile</label>
                        <select
                          value={invoiceClientSelect}
                          onChange={(e) => setInvoiceClientSelect(e.target.value)}
                          className="w-full bg-zinc-950 border border-slate-800 text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                        >
                          {usersList
                            .filter(u => u.role === "homeowner")
                            .map(u => (
                              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                            ))
                          }
                        </select>
                      </div>

                      <div>
                        <label className="block text-[7.5px] font-mono text-zinc-500 uppercase mb-1">Service Category</label>
                        <select
                          value={invoiceCategorySelect}
                          onChange={(e) => setInvoiceCategorySelect(e.target.value)}
                          className="w-full bg-zinc-950 border border-slate-800 text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                        >
                          <option value="HVAC">HVAC Compressor / Air Flow</option>
                          <option value="Plumbing">Water / Leak Plumbing</option>
                          <option value="Electrical">Power / Smart Grid Electrical</option>
                          <option value="Appliances">Kitchen & Appliance Diagnostics</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 text-[10px]">
                      <div className="col-span-3">
                        <label className="block text-[7.5px] font-mono text-zinc-500 uppercase mb-1">Work Description & Itemization</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Cleared condensate line, replaced air intake filters..."
                          value={invoiceDescInput}
                          onChange={(e) => setInvoiceDescInput(e.target.value)}
                          className="w-full bg-zinc-950 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[7.5px] font-mono text-zinc-500 uppercase mb-1">Total Bill ($)</label>
                        <input
                          type="number"
                          required
                          placeholder="150"
                          value={invoiceAmountInput}
                          onChange={(e) => setInvoiceAmountInput(e.target.value)}
                          className="w-full bg-zinc-950 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!invoiceDescInput || !invoiceAmountInput) {
                          alert("Please fill out invoice details.");
                          return;
                        }
                        
                        const clientUser = usersList.find(u => u.id === invoiceClientSelect);
                        const clientName = clientUser ? clientUser.name : "Registered Homeowner";
                        const amount = Number(invoiceAmountInput) || 150;
                        const fee = Number((amount * (commissionRate / 100)).toFixed(2));

                        const newInvoice = {
                          id: `inv_${Math.floor(100 + Math.random() * 900)}`,
                          customerId: invoiceClientSelect,
                          customerName: clientName,
                          providerId: currentUser.id,
                          providerName: currentUser.name || "Certified Local Specialist",
                          description: invoiceDescInput,
                          amount,
                          platformFee: fee,
                          status: "Unpaid",
                          date: new Date().toLocaleDateString("en-US"),
                          serviceCategory: invoiceCategorySelect
                        };

                        setInvoicesList(prev => [newInvoice, ...prev]);
                        setInvoiceDescInput("");
                        setInvoiceCreateSuccess(true);

                        // Clear success toast
                        setTimeout(() => {
                          setInvoiceCreateSuccess(false);
                        }, 4000);
                      }}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-mono font-bold text-[9.5px] py-2 rounded-xl uppercase transition-all flex items-center justify-center space-x-1.5 shadow-md cursor-pointer mt-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Transmit Secure Invoicing Ledger</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
