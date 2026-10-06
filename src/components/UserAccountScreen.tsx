import React from "react";
import { User, Users, Shield, ShieldCheck, Key, Lock, CreditCard, ChevronRight, Plus, Check, Star, Settings, DollarSign, Activity, Send, AlertTriangle, Trash2, CheckSquare, Search, PlusCircle, CheckCircle2, Sliders, LogOut } from "lucide-react";
import { StakeholderUser } from "./StakeholderScreen";
import BottomNavBar from "./BottomNavBar";

interface UserAccountScreenProps {
  currentUser: StakeholderUser;
  onUpdateCurrentUser: (user: StakeholderUser) => void;
  onNavigateToScreen: (screenId: string) => void;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: "homeowner" | "provider" | "admin";
  tier: "Free" | "Basic" | "Pro" | "Enterprise";
  status: "Active" | "Suspended";
  verified: boolean;
  dateJoined: string;
}

export default function UserAccountScreen({
  currentUser,
  onUpdateCurrentUser,
  onNavigateToScreen,
}: UserAccountScreenProps) {
  // Shared global users state (initially synced with Stakeholder screen's DB)
  const [usersList, setUsersList] = React.useState<SystemUser[]>([
    { id: "usr_1", name: "Marcus Vance", email: "temf2006@gmail.com", role: "homeowner", tier: "Basic", status: "Active", verified: true, dateJoined: "2026-01-10" },
    { id: "usr_2", name: "Jane Doe", email: "jane.doe@example.com", role: "homeowner", tier: "Free", status: "Active", verified: true, dateJoined: "2026-03-24" },
    { id: "usr_3", name: "Arthur Pendragon", email: "arthur@royalhome.co.uk", role: "homeowner", tier: "Enterprise", status: "Active", verified: true, dateJoined: "2026-05-15" },
    { id: "usr_pro_1", name: "Seattle Air & Heating", email: "service@seattleair.com", role: "provider", tier: "Pro", status: "Active", verified: true, dateJoined: "2025-11-01" },
    { id: "usr_pro_2", name: "Apex Leak Solvers", email: "leakproof@gmail.com", role: "provider", tier: "Free", status: "Active", verified: true, dateJoined: "2026-02-18" },
    { id: "usr_pro_3", name: "Sparky Electric LLC", email: "sparky@electrician.com", role: "provider", tier: "Free", status: "Suspended", verified: false, dateJoined: "2026-06-29" },
    { id: "usr_admin", name: "Master Admin Vance", email: "admin@homepulse.io", role: "admin", tier: "Enterprise", status: "Active", verified: true, dateJoined: "2025-01-01" }
  ]);

  // Sync state if currentUser changes
  React.useEffect(() => {
    setUsersList(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
          tier: currentUser.tier,
        };
      }
      return u;
    }));
  }, [currentUser]);

  // Form profile edits
  const [profileName, setProfileName] = React.useState(currentUser.name || "Marcus Vance");
  const [profileEmail, setProfileEmail] = React.useState(currentUser.email || "temf2006@gmail.com");
  const [profilePassword, setProfilePassword] = React.useState("••••••••••••");
  const [showPasswordSuccess, setShowPasswordSuccess] = React.useState(false);
  const [showProfileSuccess, setShowProfileSuccess] = React.useState(false);

  // Credit cards list
  const [creditCards, setCreditCards] = React.useState([
    { id: "card_1", brand: "Visa", last4: "4242", expiry: "12/28", holder: "Marcus Vance", isDefault: true },
    { id: "card_2", brand: "Mastercard", last4: "8890", expiry: "06/29", holder: "Marcus Vance", isDefault: false }
  ]);

  // Card addition form
  const [newCardNumber, setNewCardNumber] = React.useState("");
  const [newCardExpiry, setNewCardExpiry] = React.useState("");
  const [newCardCvc, setNewCardCvc] = React.useState("");
  const [newCardHolder, setNewCardHolder] = React.useState("");
  const [newCardBrand, setNewCardBrand] = React.useState("Visa");
  const [showCardSuccess, setShowCardSuccess] = React.useState(false);

  // User list searches and additions
  const [userSearch, setUserSearch] = React.useState("");
  const [userRoleFilter, setUserRoleFilter] = React.useState<"all" | "homeowner" | "provider" | "admin">("all");
  
  // Adding direct user state
  const [addUserName, setAddUserName] = React.useState("");
  const [addUserEmail, setAddUserEmail] = React.useState("");
  const [addUserRole, setAddUserRole] = React.useState<"homeowner" | "provider" | "admin">("homeowner");
  const [addUserTier, setAddUserTier] = React.useState<"Free" | "Basic" | "Pro" | "Enterprise">("Basic");
  const [showAddUserSuccess, setShowAddUserSuccess] = React.useState(false);

  // Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCurrentUser({
      ...currentUser,
      name: profileName,
      email: profileEmail,
    });
    setShowProfileSuccess(true);
    setTimeout(() => setShowProfileSuccess(false), 3000);
  };

  // Password Simulation Reset
  const handleSimulatePasswordReset = () => {
    setShowPasswordSuccess(true);
    setTimeout(() => setShowPasswordSuccess(false), 4000);
  };

  // Card addition
  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber || !newCardExpiry || !newCardHolder) {
      alert("Please fill in card details.");
      return;
    }
    const nextCard = {
      id: `card_${Date.now()}`,
      brand: newCardBrand,
      last4: newCardNumber.slice(-4) || "9012",
      expiry: newCardExpiry,
      holder: newCardHolder,
      isDefault: false
    };
    setCreditCards(prev => [...prev, nextCard]);
    setNewCardNumber("");
    setNewCardExpiry("");
    setNewCardCvc("");
    setNewCardHolder("");
    setShowCardSuccess(true);
    setTimeout(() => setShowCardSuccess(false), 3000);
  };

  // Add system user
  const handleAddSystemUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUserName || !addUserEmail) {
      alert("Please fill in user details.");
      return;
    }
    const newUser: SystemUser = {
      id: `usr_gen_${Date.now()}`,
      name: addUserName,
      email: addUserEmail,
      role: addUserRole,
      tier: addUserTier,
      status: "Active",
      verified: true,
      dateJoined: new Date().toISOString().split('T')[0]
    };
    setUsersList(prev => [...prev, newUser]);
    setAddUserName("");
    setAddUserEmail("");
    setAddUserRole("homeowner");
    setAddUserTier("Basic");
    setShowAddUserSuccess(true);
    setTimeout(() => setShowAddUserSuccess(false), 3000);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0A0A0A] text-white font-sans relative">
      {/* Scrollable Main Area */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-20 scrollbar-none">
        
        {/* Screen Header */}
        <div className="mb-5 text-left">
          <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase block">Identity & Access Panel</span>
          <h2 className="text-xl font-extrabold tracking-tight text-white font-display mt-0.5 font-display">Account Management</h2>
          <p className="text-[11px] text-zinc-400 mt-1 leading-normal">
            Configure profile settings, register authorized device tokens, update saved payment cards, and manage the list of registered stakeholders.
          </p>
        </div>

        {/* Profile Card Summary */}
        <div className="p-4 bg-[#101820] border border-slate-800 rounded-2xl flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3.5 text-left">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm border-2 border-blue-500/30">
              {currentUser.name ? currentUser.name.split(" ").map(n => n[0]).join("") : "U"}
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{currentUser.name}</span>
                <span className="text-[8px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.2 rounded font-black uppercase tracking-wider">
                  {currentUser.role}
                </span>
              </h3>
              <p className="text-[10px] font-mono text-zinc-400 mt-0.5">{currentUser.email}</p>
              <span className="text-[8.5px] text-zinc-500 font-mono block mt-1">SaaS Coverage: <span className="font-bold text-emerald-400">{currentUser.tier} Tier</span></span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onNavigateToScreen("screen-pricing")}
              className="bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-[9px] px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-600/15 shrink-0"
              title="Upgrade Plan"
            >
              Upgrade
            </button>
            <button
              onClick={() => onNavigateToScreen("screen-logout")}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-mono font-bold text-[9px] px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shrink-0"
              title="Logout session"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* 1. Edit Profile Form */}
        <div className="p-4 bg-[#101820] border border-slate-800 rounded-2xl space-y-4 mb-6">
          <div className="flex items-center space-x-2 text-left">
            <User className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Edit Profile Details</h3>
          </div>

          {showProfileSuccess && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-[10.5px] font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Profile metrics saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-3.5 text-left">
            <div className="grid grid-cols-2 gap-3 text-[10px]">
              <div>
                <label className="block text-[7.5px] font-mono text-zinc-500 uppercase mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[7.5px] font-mono text-zinc-500 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-white focus:outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-[9.5px] py-2 rounded-xl uppercase transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
            >
              <span>Commit Profile Changes</span>
            </button>
          </form>

          {/* Password Reset Section */}
          <div className="pt-3 border-t border-slate-900/60 text-left space-y-3">
            <div className="flex items-center space-x-2">
              <Key className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider">Credentials & API Access</span>
            </div>

            {showPasswordSuccess && (
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2 text-blue-400 text-[10px] font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Simulated password recovery link transmitted to inbox!</span>
              </div>
            )}

            <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-xl border border-slate-900">
              <div className="font-mono text-[9px] text-zinc-500">
                Password Status: <span className="text-zinc-300">Default Secure Key</span>
              </div>
              <button
                type="button"
                onClick={handleSimulatePasswordReset}
                className="text-[9px] font-mono font-bold uppercase text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>

        {/* 2. Billing & Saved Cards */}
        <div className="p-4 bg-[#101820] border border-slate-800 rounded-2xl space-y-4 mb-6">
          <div className="flex items-center justify-between text-left">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Payment methods</h3>
            </div>
            <span className="text-[8px] font-mono bg-zinc-950 px-2 py-0.5 rounded border border-slate-900 text-zinc-400 uppercase">Sandbox Mode</span>
          </div>

          {showCardSuccess && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-[10px] font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Card token registered in vault!</span>
            </div>
          )}

          {/* Cards List */}
          <div className="space-y-2">
            {creditCards.map((card) => (
              <div key={card.id} className="p-3 bg-zinc-950/60 border border-slate-900 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-3 text-left">
                  <div className="p-1.5 bg-[#101820] border border-slate-800 rounded text-zinc-300 font-mono text-[9px] font-black">
                    {card.brand}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white">•••• •••• •••• {card.last4}</p>
                    <p className="text-[8.5px] text-zinc-500 font-mono">Holder: {card.holder} | Exp: {card.expiry}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {card.isDefault && (
                    <span className="text-[7.5px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 uppercase px-1.5 py-0.2 rounded">
                      Default
                    </span>
                  )}
                  <button
                    onClick={() => setCreditCards(prev => prev.filter(c => c.id !== card.id))}
                    className="p-1 rounded hover:bg-rose-500/15 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                    title="Erase Card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Fast Card Add form */}
          <form onSubmit={handleAddCard} className="pt-3 border-t border-slate-900/60 space-y-3 text-left">
            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block">Add New Account Card Node</span>
            
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <label className="block text-[7.5px] font-mono text-zinc-500 uppercase mb-1">Card Holder</label>
                <input
                  type="text"
                  required
                  placeholder="Marcus Vance"
                  value={newCardHolder}
                  onChange={(e) => setNewCardHolder(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-slate-800 rounded px-2.5 py-1 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[7.5px] font-mono text-zinc-500 uppercase mb-1">Card Brand</label>
                <select
                  value={newCardBrand}
                  onChange={(e) => setNewCardBrand(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-slate-800 rounded px-2.5 py-1 text-zinc-400 focus:outline-none"
                >
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="Amex">American Express</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div className="col-span-2">
                <label className="block text-[7.5px] font-mono text-zinc-500 uppercase mb-1">Card Number (16 digits)</label>
                <input
                  type="text"
                  required
                  placeholder="4242 4242 4242 4242"
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-slate-800 rounded px-2.5 py-1 text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[7.5px] font-mono text-zinc-500 uppercase mb-1">Expiry (MM/YY)</label>
                <input
                  type="text"
                  required
                  placeholder="12/28"
                  value={newCardExpiry}
                  onChange={(e) => setNewCardExpiry(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-slate-800 rounded px-2.5 py-1 text-white focus:outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800/85 text-zinc-300 hover:text-white font-mono text-[9px] py-2 rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
            >
              Vault Payment Node
            </button>
          </form>
        </div>

        {/* 3. Universal User Accounts Directory */}
        {currentUser.role !== "homeowner" && (
          <div className="p-4 bg-[#101820] border border-slate-800 rounded-2xl space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="flex items-center space-x-2 text-left">
                <Users className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Global User Directory</h3>
              </div>

              {/* Quick Filter */}
              <div className="flex items-center space-x-1.5 shrink-0">
                <select
                  value={userRoleFilter}
                  onChange={(e: any) => setUserRoleFilter(e.target.value)}
                  className="bg-zinc-950 border border-slate-800 text-zinc-400 text-[9px] rounded px-1.5 py-0.5 focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="homeowner">Homeowner</option>
                  <option value="provider">Providers</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>

            <p className="text-[9.5px] text-zinc-400 leading-normal text-left">
              Real-time visual catalog of all home stakeholders, admins, and certified technician nodes registered in our private service grid.
            </p>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="bg-zinc-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-8 pr-2.5 py-1.5 text-[10px] text-white focus:outline-none w-full font-mono"
              />
            </div>

            {/* Directory list of user cards */}
            <div className="space-y-2.5">
              {usersList
                .filter(u => {
                  const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
                  const matchRole = userRoleFilter === "all" || u.role === userRoleFilter;
                  return matchSearch && matchRole;
                })
                .map((usr) => (
                  <div key={usr.id} className="p-3 bg-zinc-950/60 border border-slate-900 rounded-xl flex flex-col gap-2.5 text-left">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{usr.name}</span>
                          <span className={`text-[7px] font-mono uppercase px-1 py-0.2 rounded font-black border ${
                            usr.role === "admin"
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : usr.role === "provider"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }`}>
                            {usr.role}
                          </span>
                        </h4>
                        <p className="text-[9px] font-mono text-zinc-500 mt-0.5">{usr.email}</p>
                      </div>

                      <span className="text-[8.5px] font-mono text-zinc-500">
                        Joined {usr.dateJoined}
                      </span>
                    </div>

                    {/* Actions inside card */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-900/40 text-[9px] font-mono">
                      
                      {/* Role switcher */}
                      <div>
                        <label className="block text-[7px] text-zinc-500 uppercase mb-0.5">Role Node</label>
                        <select
                          value={usr.role}
                          onChange={(e) => {
                            const nextRole = e.target.value as any;
                            setUsersList(prev => prev.map(u => {
                              if (u.id === usr.id) return { ...u, role: nextRole };
                              return u;
                              }));
                            if (currentUser.id === usr.id) {
                              onUpdateCurrentUser({ ...currentUser, role: nextRole });
                            }
                          }}
                          className="w-full bg-[#101820] border border-slate-800 text-zinc-300 rounded px-1.5 py-0.5 focus:outline-none"
                        >
                          <option value="homeowner">Homeowner</option>
                          <option value="provider">Provider</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      {/* SaaS Tier */}
                      <div>
                        <label className="block text-[7px] text-zinc-500 uppercase mb-0.5">Coverage Tier</label>
                        <select
                          value={usr.tier}
                          onChange={(e) => {
                            const nextTier = e.target.value as any;
                            setUsersList(prev => prev.map(u => {
                              if (u.id === usr.id) return { ...u, tier: nextTier };
                              return u;
                            }));
                            if (currentUser.id === usr.id) {
                              onUpdateCurrentUser({ ...currentUser, tier: nextTier });
                            }
                          }}
                          className="w-full bg-[#101820] border border-slate-800 text-zinc-300 rounded px-1.5 py-0.5 focus:outline-none"
                        >
                          <option value="Free">Free</option>
                          <option value="Basic">Basic</option>
                          <option value="Pro">Pro</option>
                          <option value="Enterprise">Enterprise</option>
                        </select>
                      </div>

                      {/* KYC Verification & Delete */}
                      <div className="flex items-end justify-between space-x-1">
                        <button
                          onClick={() => {
                            setUsersList(prev => prev.map(u => {
                              if (u.id === usr.id) return { ...u, verified: !u.verified };
                              return u;
                            }));
                          }}
                          className={`flex-1 text-center py-0.5 rounded border transition-all text-[8px] font-black uppercase ${
                            usr.verified
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                          title="Toggle verification"
                        >
                          {usr.verified ? "Verified ✓" : "Verify KYC"}
                        </button>

                        {usr.id !== currentUser.id && (
                          <button
                            onClick={() => {
                              if (confirm(`Remove stakeholder ${usr.name}?`)) {
                                setUsersList(prev => prev.filter(u => u.id !== usr.id));
                              }
                            }}
                            className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/15"
                            title="Erase User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                ))}
            </div>

            {/* Create New User Form inside Account module */}
            <div className="pt-4 border-t border-slate-900/60 text-left">
              <span className="text-[9px] font-bold text-zinc-400 font-mono uppercase tracking-wider block mb-3">Register New System Stakeholder Account</span>
              
              {showAddUserSuccess && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-[10px] font-mono mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Stakeholder profile successfully registered!</span>
                </div>
              )}

              <form onSubmit={handleAddSystemUserSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <label className="block text-[7.5px] font-mono text-zinc-500 uppercase mb-1">Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Timothy Cox"
                      value={addUserName}
                      onChange={(e) => setAddUserName(e.target.value)}
                      className="w-full bg-zinc-950 border border-slate-800 rounded px-2.5 py-1 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[7.5px] font-mono text-zinc-500 uppercase mb-1">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. timothy@gmail.com"
                      value={addUserEmail}
                      onChange={(e) => setAddUserEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-slate-800 rounded px-2.5 py-1 text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <label className="block text-[7.5px] font-mono text-zinc-500 uppercase mb-1">Role Type</label>
                    <select
                      value={addUserRole}
                      onChange={(e: any) => setAddUserRole(e.target.value)}
                      className="w-full bg-zinc-950 border border-slate-800 rounded px-2 py-1 text-zinc-400 focus:outline-none"
                    >
                      <option value="homeowner">Homeowner</option>
                      <option value="provider">Service Provider</option>
                      <option value="admin">System Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[7.5px] font-mono text-zinc-500 uppercase mb-1">Subscription Plan</label>
                    <select
                      value={addUserTier}
                      onChange={(e: any) => setAddUserTier(e.target.value)}
                      className="w-full bg-zinc-950 border border-slate-800 rounded px-2 py-1 text-zinc-400 focus:outline-none"
                    >
                      <option value="Free">Free</option>
                      <option value="Basic">Basic</option>
                      <option value="Pro">Pro</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800/85 text-zinc-300 hover:text-white font-mono text-[9px] py-2 rounded-lg uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span>Instantiate Account Node</span>
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

      <BottomNavBar activeTab="account" onNavigateToScreen={onNavigateToScreen} />
    </div>
  );
}
