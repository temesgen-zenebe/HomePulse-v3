import React from "react";
import { User, ChevronRight, Settings, Users, BellRing, CreditCard, HelpCircle, ShieldAlert, Edit, Save, Home, ChevronLeft, Plus, Trash2, Check, ShieldCheck, HelpCircle as HelpIcon, AlertCircle, Sliders, FolderOpen, FileText, Wrench, LogOut, Layers, TrendingUp, RotateCcw, Bell } from "lucide-react";
import { PropertyInfo, RecommendedProvider, ProAppointment } from "../types";
import BottomNavBar from "./BottomNavBar";
import ProvidersScreen from "./ProvidersScreen";

interface ProfileScreenProps {
  property: PropertyInfo;
  onUpdateProperty: (updated: PropertyInfo) => void;
  onNavigateToScreen: (screenId: string) => void;
  providers: RecommendedProvider[];
  appointments: ProAppointment[];
  onBookAppointment: (appointment: ProAppointment) => void;
  onUpdateAppointments: (updated: ProAppointment[]) => void;
  onUpdateProviders: (updated: RecommendedProvider[]) => void;
  onTriggerSimulatedNotification?: () => void;
  onResetData?: () => void;
}

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  phone: string;
}

interface Appliance {
  id: string;
  name: string;
  brand: string;
  model: string;
  installedYear: number;
}

export default function ProfileScreen({ 
  property, 
  onUpdateProperty, 
  onNavigateToScreen,
  providers = [],
  appointments = [],
  onBookAppointment = () => {},
  onUpdateAppointments = () => {},
  onUpdateProviders = () => {},
  onTriggerSimulatedNotification,
  onResetData
}: ProfileScreenProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [address, setAddress] = React.useState(property.address);
  const [yearBuilt, setYearBuilt] = React.useState(property.yearBuilt.toString());
  const [squareFeet, setSquareFeet] = React.useState(property.squareFeet.toString());

  // Sub-view selector
  const [activeSubView, setActiveSubView] = React.useState<string | null>(null);

  // Home Details Stateful Data
  const [appliances, setAppliances] = React.useState<Appliance[]>([
    { id: "1", name: "HVAC System", brand: "Carrier", model: "Infinity 26", installedYear: 2021 },
    { id: "2", name: "Water Heater", brand: "Rheem", model: "Performance Platinum", installedYear: 2019 },
    { id: "3", name: "Sump Pump", brand: "Zoeller", model: "M53 Mighty-Mate", installedYear: 2023 },
    { id: "4", name: "Smart Main Shutoff", brand: "Moen", model: "Flo Smart Water Monitor", installedYear: 2024 }
  ]);
  const [newAppliance, setNewAppliance] = React.useState({ name: "", brand: "", model: "", installedYear: "2026" });

  // Family Members Stateful Data
  const [familyMembers, setFamilyMembers] = React.useState<FamilyMember[]>([
    { id: "1", name: "Sarah Vance", role: "Co-Owner", phone: "(206) 555-0143" },
    { id: "2", name: "Alex Vance", role: "Resident / Child", phone: "(206) 555-0182" },
    { id: "3", name: "Beacon Plumbing", role: "Dedicated Local Pro plumber", phone: "(206) 555-9000" }
  ]);
  const [newMember, setNewMember] = React.useState({ name: "", role: "Resident", phone: "" });

  // Notifications toggles
  const [notifications, setNotifications] = React.useState({
    criticalAlerts: true,
    weeklyReport: true,
    hvacReminders: true,
    freezeWarnings: true,
    leakSensing: true
  });

  // App settings state
  const [appSettings, setAppSettings] = React.useState({
    tempUnit: "Fahrenheit",
    telemetryLogging: true,
    automaticDispatch: false,
    smartAutomation: true
  });

  // Support State
  const [liveChatSupport, setLiveChatSupport] = React.useState<string[]>([]);
  const [supportMessage, setSupportMessage] = React.useState("");

  const menuItems = [
    { 
      label: "Home Details", 
      desc: "Appliances, plumbing models, & HVAC", 
      icon: Home, 
      view: "home-details", 
      shortcutScreen: "screen-systems", 
      shortcutLabel: "Systems ↗" 
    },
    { 
      label: "Family Members", 
      desc: "Shared emergency & maintenance access", 
      icon: Users, 
      view: "family-members",
      shortcutScreen: "screen-profile",
      shortcutLabel: "Profile ↗"
    },
    { 
      label: "Notifications", 
      desc: "Risk alerts, email summary schedules", 
      icon: BellRing, 
      view: "notifications",
      shortcutScreen: "screen-profile",
      shortcutLabel: "Profile ↗"
    },
    { 
      label: "App Settings", 
      desc: "Toggle diagnostic details & unit systems", 
      icon: Settings, 
      view: "app-settings",
      shortcutScreen: "screen-profile",
      shortcutLabel: "Profile ↗"
    },
    { 
      label: "Payment History", 
      desc: "Past transaction invoices & statements", 
      icon: CreditCard, 
      view: "payment-history", 
      shortcutScreen: "screen-documents", 
      shortcutLabel: "Vault ↗" 
    },
    { 
      label: "Service Providers", 
      desc: "Hire pre-vetted contractors & check progress", 
      icon: Wrench, 
      view: "service-providers", 
      shortcutScreen: "screen-providers", 
      shortcutLabel: "Hire Pro ↗" 
    },
    { 
      label: "Help & Technical Support", 
      desc: "FAQ guides, local pro dispatch chat", 
      icon: HelpCircle, 
      view: "help-support", 
      shortcutScreen: "screen-systems", 
      shortcutLabel: "Systems ↗" 
    },
    { 
      label: "ROI Savings Simulator", 
      desc: "Project long-term financial & energy dividends", 
      icon: Sliders, 
      view: "roi-calculator-trigger", 
      shortcutScreen: "screen-roi-calculator", 
      shortcutLabel: "Project ROI ↗" 
    },
    { 
      label: "Value Guard Audits", 
      desc: "12 structural, mechanical & safety checkpoints", 
      icon: ShieldCheck, 
      view: "checkpoints-trigger", 
      shortcutScreen: "screen-checkpoints", 
      shortcutLabel: "Verify Checkpoints ↗" 
    },
    { 
      label: "Interactive Floor Plan", 
      desc: "Visual telemetry room blueprint & localized tasks", 
      icon: Layers, 
      view: "floorplan-trigger", 
      shortcutScreen: "screen-floorplan", 
      shortcutLabel: "View Floor Plan ↗" 
    },
    { 
      label: "Predictive Lifespans", 
      desc: "AI decay modeling, wear simulation & risk timelines", 
      icon: TrendingUp, 
      view: "predictive-trigger", 
      shortcutScreen: "screen-predictive", 
      shortcutLabel: "View Lifespan AI ↗" 
    },
    { 
      label: "Sign Out", 
      desc: "Close telemetry stream session safely", 
      icon: LogOut, 
      view: "logout-trigger", 
      shortcutScreen: "screen-logout", 
      shortcutLabel: "Sign Out ↗" 
    }
  ];

  const handleSave = () => {
    onUpdateProperty({
      ...property,
      address,
      yearBuilt: parseInt(yearBuilt) || 2015,
      squareFeet: parseInt(squareFeet) || 2000
    });
    setIsEditing(false);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.phone) return;
    setFamilyMembers([
      ...familyMembers,
      {
        id: Date.now().toString(),
        name: newMember.name,
        role: newMember.role,
        phone: newMember.phone
      }
    ]);
    setNewMember({ name: "", role: "Resident", phone: "" });
  };

  const handleRemoveMember = (id: string) => {
    setFamilyMembers(familyMembers.filter(m => m.id !== id));
  };

  const handleAddAppliance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppliance.name || !newAppliance.brand) return;
    setAppliances([
      ...appliances,
      {
        id: Date.now().toString(),
        name: newAppliance.name,
        brand: newAppliance.brand,
        model: newAppliance.model || "Unknown Model",
        installedYear: parseInt(newAppliance.installedYear) || 2026
      }
    ]);
    setNewAppliance({ name: "", brand: "", model: "", installedYear: "2026" });
  };

  const handleRemoveAppliance = (id: string) => {
    setAppliances(appliances.filter(a => a.id !== id));
  };

  const handleSendSupportMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    const userMsg = supportMessage;
    setLiveChatSupport(prev => [...prev, `User: ${userMsg}`]);
    setSupportMessage("");

    // Simulate instant supportive tech reply
    setTimeout(() => {
      let reply = "I've logged your query with Seattle West District support. A live HomePulse specialist will reach out to you within 3 minutes.";
      if (userMsg.toLowerCase().includes("leak") || userMsg.toLowerCase().includes("water")) {
        reply = "⚠️ CRITICAL SYSTEM: Flo Smart shutoff is active. If this is an active leak, water flow can be shut off from the Telemetry Systems screen immediately.";
      } else if (userMsg.toLowerCase().includes("hvac") || userMsg.toLowerCase().includes("heat")) {
        reply = "❄️ HVAC DISPATCH: A professional HVAC dispatch ticket has been drafted. Confirm in ROI Savings or reply DISPATCH to authorize immediately.";
      }
      setLiveChatSupport(prev => [...prev, `HomePulse Support: ${reply}`]);
    }, 1000);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0A0A0A] text-white font-sans relative">
      
      {/* Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-20 scrollbar-none">
        
        {/* If a sub-view is active, render it instead of the main profile menu */}
        {activeSubView ? (
          <div>
            {/* Sub-view Header */}
            {activeSubView !== "service-providers" && (
              <button 
                onClick={() => setActiveSubView(null)}
                className="flex items-center space-x-1.5 text-xs text-blue-400 hover:text-blue-300 font-mono mb-4 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Owner Profile</span>
              </button>
            )}

            {/* HOME DETAILS SUB-VIEW */}
            {activeSubView === "home-details" && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">System Specs</span>
                  <h3 className="text-lg font-extrabold text-white">Home Details & Mechanicals</h3>
                  <p className="text-[10px] text-zinc-400">Listed appliances and active monitoring adapters</p>
                </div>

                <div className="space-y-2.5">
                  {appliances.map((app) => (
                    <div key={app.id} className="p-3 bg-[#101820]/80 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-bold text-white">{app.name}</span>
                          <span className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-1.5 py-0.2 rounded font-mono">
                            Est. {app.installedYear}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{app.brand} — {app.model}</p>
                      </div>
                      <button 
                        onClick={() => handleRemoveAppliance(app.id)}
                        className="p-1.5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Remove Appliance"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Appliance Form */}
                <form onSubmit={handleAddAppliance} className="bg-[#101820]/40 border border-slate-800/80 p-3.5 rounded-xl space-y-2.5 mt-4">
                  <h4 className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Add Home Appliance / Utility</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Appliance Name (e.g. Dishwasher)" 
                      value={newAppliance.name}
                      onChange={(e) => setNewAppliance({ ...newAppliance, name: e.target.value })}
                      className="bg-black border border-slate-800 p-1.5 text-[10px] text-white rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <input 
                      type="text" 
                      placeholder="Brand (e.g. Bosch)" 
                      value={newAppliance.brand}
                      onChange={(e) => setNewAppliance({ ...newAppliance, brand: e.target.value })}
                      className="bg-black border border-slate-800 p-1.5 text-[10px] text-white rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Model No." 
                      value={newAppliance.model}
                      onChange={(e) => setNewAppliance({ ...newAppliance, model: e.target.value })}
                      className="bg-black border border-slate-800 p-1.5 text-[10px] text-white rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <input 
                      type="number" 
                      placeholder="Year Installed" 
                      value={newAppliance.installedYear}
                      onChange={(e) => setNewAppliance({ ...newAppliance, installedYear: e.target.value })}
                      className="bg-black border border-slate-800 p-1.5 text-[10px] text-white rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Register New Utility Specs</span>
                  </button>
                </form>

                {/* Systems Navigation Action */}
                <div className="p-3 bg-blue-950/20 border border-blue-500/10 rounded-xl space-y-2 mt-4">
                  <div className="flex items-center space-x-2 text-blue-400">
                    <Sliders className="w-4 h-4" />
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase">Active Live Sensors</span>
                  </div>
                  <p className="text-[9px] text-zinc-300 leading-normal">
                    To view real-time diagnostics, water temperature flow rates, and HVAC system pressure values, open the full live telemetry panel.
                  </p>
                  <button
                    onClick={() => onNavigateToScreen("screen-systems")}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-[10px] py-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-blue-500/10"
                  >
                    <span>Open Telemetry Systems Screen ↗</span>
                  </button>
                </div>
              </div>
            )}

            {/* FAMILY MEMBERS SUB-VIEW */}
            {activeSubView === "family-members" && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Emergency Access</span>
                  <h3 className="text-lg font-extrabold text-white">Family & Co-Owners</h3>
                  <p className="text-[10px] text-zinc-400">Manage who receives diagnostic hazard and dispatch notifications</p>
                </div>

                <div className="space-y-2">
                  {familyMembers.map((member) => (
                    <div key={member.id} className="p-3 bg-[#101820]/80 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[11px] font-bold text-white">{member.name}</span>
                          <span className="text-[8.5px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1 py-0.2 rounded uppercase tracking-wider font-mono">
                            {member.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-1 font-mono">{member.phone}</p>
                      </div>
                      <button 
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1.5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddMember} className="bg-[#101820]/40 border border-slate-800/80 p-3.5 rounded-xl space-y-2.5 mt-4">
                  <h4 className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Authorize New Member</h4>
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      className="w-full bg-black border border-slate-800 p-1.5 text-[10px] text-white rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select 
                        value={newMember.role}
                        onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                        className="bg-black border border-slate-800 p-1.5 text-[10px] text-white rounded-lg focus:outline-none focus:border-blue-500"
                      >
                        <option value="Resident">Resident</option>
                        <option value="Co-Owner">Co-Owner</option>
                        <option value="Technician">Technician</option>
                        <option value="Emergency Contact">Emergency Contact</option>
                      </select>
                      <input 
                        type="text" 
                        placeholder="Phone (e.g. 206-555-0143)" 
                        value={newMember.phone}
                        onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                        className="bg-black border border-slate-800 p-1.5 text-[10px] text-white rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Grant System Notifications Access</span>
                  </button>
                </form>
              </div>
            )}

            {/* NOTIFICATIONS SUB-VIEW */}
            {activeSubView === "notifications" && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Alert Routing</span>
                  <h3 className="text-lg font-extrabold text-white">Notification Options</h3>
                  <p className="text-[10px] text-zinc-400">Configure real-time automated warnings</p>
                </div>

                <div className="bg-[#101820]/40 border border-slate-800/80 rounded-xl p-3 space-y-4">
                  {[
                    { key: "criticalAlerts", label: "Critical Water Leak Emergency Calls", desc: "Automated robocalls if Flo shutoff senses abnormal continuous flow rates." },
                    { key: "weeklyReport", label: "Weekly ROI Savings Email Digest", desc: "Estimated preventative savings and utility budget updates." },
                    { key: "hvacReminders", label: "HVAC Filter / Maintenance Prompts", desc: "Receive notifications based on actual telemetry blower static load." },
                    { key: "freezeWarnings", label: "Freeze/Cold Weather Threat Alarms", desc: "Immediate warning if pipes enter freezing risk parameters." },
                    { key: "leakSensing", label: "Smart Dampness Detection", desc: "Log active warnings if humidity levels spike in under-sink sensors." }
                  ].map((pref) => {
                    const isChecked = notifications[pref.key as keyof typeof notifications];
                    return (
                      <div key={pref.key} className="flex items-start justify-between gap-4 pb-3 border-b border-slate-800/55 last:border-b-0 last:pb-0">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-white">{pref.label}</p>
                          <p className="text-[9px] text-zinc-400 mt-0.5 leading-relaxed">{pref.desc}</p>
                        </div>
                        <button
                          onClick={() => setNotifications({ ...notifications, [pref.key]: !isChecked })}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex-shrink-0 ${isChecked ? "bg-blue-600" : "bg-zinc-800"}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isChecked ? "translate-x-4" : "translate-x-0"}`}></div>
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-blue-950/20 border border-blue-500/10 rounded-xl flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[9px] text-zinc-300 leading-normal">
                    Notifications are routed via low-latency SMS to Seattle District dispatch servers. This bypasses typical carrier data throttles to ensure protection in outages.
                  </p>
                </div>
              </div>
            )}

            {/* APP SETTINGS SUB-VIEW */}
            {activeSubView === "app-settings" && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Device Engine</span>
                  <h3 className="text-lg font-extrabold text-white">App Settings</h3>
                  <p className="text-[10px] text-zinc-400">Toggle local caching & debug systems</p>
                </div>

                <div className="bg-[#101820]/40 border border-slate-800/80 rounded-xl p-3.5 space-y-4">
                  <div>
                    <label className="text-[9.5px] font-mono font-bold text-zinc-500 uppercase block mb-1.5">Measurement Metric</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {["Fahrenheit", "Celsius"].map((unit) => (
                        <button
                          key={unit}
                          onClick={() => setAppSettings({ ...appSettings, tempUnit: unit })}
                          className={`text-[10px] py-1.5 rounded-lg border font-mono font-semibold cursor-pointer transition-all ${appSettings.tempUnit === unit ? "bg-blue-600/15 border-blue-500 text-white" : "bg-black border-slate-800 text-zinc-400"}`}
                        >
                          {unit === "Fahrenheit" ? "°F (Fahrenheit)" : "°C (Celsius)"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-4 pt-2 border-t border-slate-800/55">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-white">Telemetry Logs HUD</p>
                      <p className="text-[9px] text-zinc-400 mt-0.5">Show active pipe PSI pressure metrics directly in dashboards.</p>
                    </div>
                    <button
                      onClick={() => setAppSettings({ ...appSettings, telemetryLogging: !appSettings.telemetryLogging })}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex-shrink-0 ${appSettings.telemetryLogging ? "bg-blue-600" : "bg-zinc-800"}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${appSettings.telemetryLogging ? "translate-x-4" : "translate-x-0"}`}></div>
                    </button>
                  </div>

                  <div className="flex items-start justify-between gap-4 pt-3 border-t border-slate-800/55">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-white">Automatic Pro Dispatch</p>
                      <p className="text-[9px] text-zinc-400 mt-0.5">Automatically trigger local plumber service calls if smart valve closes.</p>
                    </div>
                    <button
                      onClick={() => setAppSettings({ ...appSettings, automaticDispatch: !appSettings.automaticDispatch })}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex-shrink-0 ${appSettings.automaticDispatch ? "bg-blue-600" : "bg-zinc-800"}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${appSettings.automaticDispatch ? "translate-x-4" : "translate-x-0"}`}></div>
                    </button>
                  </div>

                  <div className="flex items-start justify-between gap-4 pt-3 border-t border-slate-800/55">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-white">Smart Mode Auto-Adapts</p>
                      <p className="text-[9px] text-zinc-400 mt-0.5">Allow HomePulse v3 to self-regulate water heater temperature based on ambient room threat level indices.</p>
                    </div>
                    <button
                      onClick={() => setAppSettings({ ...appSettings, smartAutomation: !appSettings.smartAutomation })}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex-shrink-0 ${appSettings.smartAutomation ? "bg-blue-600" : "bg-zinc-800"}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${appSettings.smartAutomation ? "translate-x-4" : "translate-x-0"}`}></div>
                    </button>
                  </div>
                </div>

                {/* Developer & Demo Control Hub */}
                <div className="bg-blue-950/10 border border-blue-500/25 rounded-2xl p-4 space-y-3 mt-4">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4 text-blue-400" />
                    <h4 className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">Demo Control Hub</h4>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Trigger test push notifications (critical warnings, overdues) or restore all original property data records instantly.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1.5">
                    <button
                      type="button"
                      onClick={onTriggerSimulatedNotification}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-600/10 hover:scale-[1.01]"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Trigger Push Alert</span>
                    </button>
                    <button
                      type="button"
                      onClick={onResetData}
                      className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-extrabold text-[10px] py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-800 hover:border-slate-700 hover:scale-[1.01]"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Reset Demo Records</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PAYMENT HISTORY SUB-VIEW */}
            {activeSubView === "payment-history" && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Accounting Ledger</span>
                  <h3 className="text-lg font-extrabold text-white">Payment & Invoices</h3>
                  <p className="text-[10px] text-zinc-400">Past property protection invoices under current Seattle SaaS plan</p>
                </div>

                <div className="space-y-2">
                  {[
                    { id: "INV-2026-06", date: "June 28, 2026", amount: "$19.99", service: "HomePulse v3 Premium Support Tier", status: "Paid" },
                    { id: "INV-2026-05", date: "May 28, 2026", amount: "$19.99", service: "HomePulse v3 Premium Support Tier", status: "Paid" },
                    { id: "INV-2026-04", date: "April 28, 2026", amount: "$19.99", service: "HomePulse v3 Premium Support Tier", status: "Paid" },
                    { id: "INV-2026-03", date: "March 28, 2026", amount: "$19.99", service: "HomePulse v3 Premium Support Tier", status: "Paid" },
                    { id: "INV-2026-DISP", date: "Feb 14, 2026", amount: "$149.00", service: "Direct Local Plumber Dispatch Fee", status: "Reimbursed (SaaS Benefit)" }
                  ].map((invoice) => (
                    <div key={invoice.id} className="p-3 bg-[#101820]/80 border border-slate-800 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-zinc-500">{invoice.id} • {invoice.date}</span>
                        <span className={`text-[8.5px] px-1.5 py-0.2 rounded font-bold font-mono ${invoice.status.includes("Reimbursed") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                          {invoice.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-bold text-zinc-200">{invoice.service}</span>
                        <span className="text-xs font-mono font-bold text-white">{invoice.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-[#101820]/40 border border-slate-800 rounded-xl text-center space-y-2">
                  <p className="text-[9px] text-zinc-500">Need corporate invoice reports or direct bank drafting schedules?</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveSubView("help-support")} 
                      className="flex-1 text-[10px] bg-slate-800 text-zinc-300 hover:bg-slate-700 font-bold font-mono py-1.5 rounded-lg cursor-pointer transition-colors"
                    >
                      Contact Support
                    </button>
                    <button 
                      onClick={() => onNavigateToScreen("screen-documents")} 
                      className="flex-1 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono py-1.5 rounded-lg cursor-pointer transition-colors"
                    >
                      Open Vault ↗
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* HELP & SUPPORT SUB-VIEW */}
            {activeSubView === "help-support" && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Local Pro Assistance</span>
                  <h3 className="text-lg font-extrabold text-white">Help & Technical Support</h3>
                  <p className="text-[10px] text-zinc-400">Ask troubleshooting questions or request a local dispatch</p>
                </div>

                {/* FAQ section */}
                <div className="bg-[#101820]/40 border border-slate-800 rounded-xl p-3 space-y-2">
                  <h4 className="text-[9px] font-mono font-bold text-zinc-400 uppercase mb-1">Frequently Asked Questions</h4>
                  {[
                    { q: "What should I do during a pipe freeze alarm?", a: "Go to Telemetry Systems, adjust thermal targets, check if automatic smart dispatch is active, and let faucets drip slowly." },
                    { q: "How is my ROI preventative savings tracked?", a: "By measuring mitigated risks against standard local plumber callout averages in Washington state ($149/hr)." }
                  ].map((faq, index) => (
                    <details key={index} className="group pb-2 border-b border-slate-800/60 last:border-0 last:pb-0">
                      <summary className="text-[10.5px] font-bold text-zinc-300 hover:text-white cursor-pointer list-none flex items-center justify-between">
                        <span>{faq.q}</span>
                        <span className="text-[11px] text-zinc-500 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <p className="text-[9.5px] text-zinc-400 mt-1 leading-relaxed pl-1">
                        {faq.a}
                      </p>
                    </details>
                  ))}
                </div>

                {/* Technical dispatch chat */}
                <div className="bg-black border border-slate-800 rounded-xl p-3 flex flex-col space-y-2 h-[220px] relative">
                  <div className="text-[9px] font-mono text-zinc-500 uppercase pb-1 border-b border-slate-800 flex justify-between items-center">
                    <span>Live Support Dispatch Chat</span>
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 scrollbar-none text-[9.5px] pr-1">
                    <p className="text-zinc-500 italic">Connected to HomePulse Smart Assistant Bot. Type your issue below...</p>
                    {liveChatSupport.map((msg, i) => (
                      <div key={i} className={`p-2 rounded-lg ${msg.startsWith("User") ? "bg-blue-600/10 border border-blue-500/15 text-blue-200 self-end ml-4" : "bg-[#101820] border border-slate-800 text-zinc-300 mr-4"}`}>
                        <strong>{msg.split(": ")[0]}:</strong> {msg.split(": ").slice(1).join(": ")}
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendSupportMessage} className="flex gap-1.5 pt-2 border-t border-slate-800">
                    <input 
                      type="text" 
                      placeholder="Ask support (e.g. leaking sink, hvac issue)" 
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      className="flex-1 bg-black border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] text-white focus:outline-none focus:border-blue-500"
                    />
                    <button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[9.5px] px-3 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Send
                    </button>
                  </form>
                </div>

                {/* Technical Quick Links */}
                <div className="grid grid-cols-2 gap-2 text-center pt-2">
                  <button
                    onClick={() => onNavigateToScreen("screen-systems")}
                    className="p-2 bg-[#101820]/60 border border-slate-800 hover:border-slate-700 rounded-lg text-[9px] text-zinc-300 hover:text-white transition-all cursor-pointer font-mono"
                  >
                    📊 Check Telemetry Nodes
                  </button>
                  <button
                    onClick={() => onNavigateToScreen("screen-documents")}
                    className="p-2 bg-[#101820]/60 border border-slate-800 hover:border-slate-700 rounded-lg text-[9px] text-zinc-300 hover:text-white transition-all cursor-pointer font-mono"
                  >
                    📁 Access Property Vault
                  </button>
                </div>
              </div>
            )}

            {/* SERVICE PROVIDERS SUB-VIEW */}
            {activeSubView === "service-providers" && (
              <ProvidersScreen
                providers={providers}
                appointments={appointments}
                onNavigateToScreen={(screenId) => {
                  if (screenId === "screen-profile") {
                    setActiveSubView(null);
                  } else {
                    onNavigateToScreen(screenId);
                  }
                }}
                onBookAppointment={onBookAppointment}
                onUpdateAppointments={onUpdateAppointments}
                onUpdateProviders={onUpdateProviders}
                hideFooter={true}
              />
            )}
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-4">
              <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Property Configuration</span>
              <h2 className="text-xl font-extrabold tracking-tight text-white font-display">Profile & Home</h2>
              <p className="text-[10px] text-zinc-400 mt-0.5">Manage owner profiles & mechanical specs</p>
            </div>

            {/* Property Card */}
            <div className="bg-[#101820] border border-slate-800 rounded-2xl p-4 shadow-lg mb-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#2563EB]/5 rounded-full filter blur-xl"></div>

              {!isEditing ? (
                <div className="flex items-start space-x-3.5">
                  {/* House Vector Thumbnail */}
                  <div className="w-12 h-12 bg-blue-950/40 border border-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 relative">
                    <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                  </div>

                  {/* Specs Text */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate leading-tight">
                      {property.address}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9.5px] font-mono text-zinc-400 mt-2">
                      <div>
                        <span className="text-zinc-600 block">Built:</span>
                        <strong className="text-zinc-300 font-semibold">{property.yearBuilt}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-600 block">Property Size:</span>
                        <strong className="text-zinc-300 font-semibold">{property.squareFeet.toLocaleString()} sqft</strong>
                      </div>
                    </div>

                    {/* Edit Button */}
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-3 text-[9px] font-mono font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Update Property Profile</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Property Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-slate-800 rounded-lg p-1.5 text-[11px] text-white focus:outline-none focus:border-blue-500 mt-1 font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Year Built</label>
                      <input
                        type="number"
                        value={yearBuilt}
                        onChange={(e) => setYearBuilt(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-slate-800 rounded-lg p-1.5 text-[11px] text-white focus:outline-none focus:border-blue-500 mt-1 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Square Feet</label>
                      <input
                        type="number"
                        value={squareFeet}
                        onChange={(e) => setSquareFeet(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-slate-800 rounded-lg p-1.5 text-[11px] text-white focus:outline-none focus:border-blue-500 mt-1 font-mono"
                      />
                    </div>
                  </div>

                  {/* Save / Cancel buttons */}
                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-blue-600 text-white font-bold text-[10px] py-1.5 rounded-lg hover:bg-blue-500 transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save Specifications</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-slate-800 text-zinc-300 font-bold text-[10px] py-1.5 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Stakeholder Auth, Roles & Billing Portal Banner */}
            <div 
              onClick={() => onNavigateToScreen("screen-stakeholders")}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-blue-600/10 to-indigo-600/15 border border-blue-500/30 hover:border-blue-500/50 cursor-pointer transition-all shadow-lg flex items-center justify-between mb-4 group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#111A2E] border border-blue-500/20 text-blue-400 rounded-xl relative group-hover:border-blue-400/40">
                  <ShieldCheck className="w-4 h-4 text-blue-400 animate-pulse" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white group-hover:text-blue-400 transition-colors">
                    Stakeholder Authorization & SaaS Portal
                  </p>
                  <p className="text-[9px] text-zinc-400 mt-0.5">
                    Sign in as Resident, Certified Pro, or Admin & configure pricing plans
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>

            {/* Menu Items List */}
            <div className="space-y-1.5">
              {menuItems.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (item.view === "logout-trigger") {
                        onNavigateToScreen("screen-logout");
                      } else if (item.view === "roi-calculator-trigger") {
                        onNavigateToScreen("screen-roi-calculator");
                      } else if (item.view === "checkpoints-trigger") {
                        onNavigateToScreen("screen-checkpoints");
                      } else if (item.view === "floorplan-trigger") {
                        onNavigateToScreen("screen-floorplan");
                      } else if (item.view === "predictive-trigger") {
                        onNavigateToScreen("screen-predictive");
                      } else {
                        setActiveSubView(item.view);
                      }
                    }}
                    className="p-3 bg-[#101820]/60 border border-slate-800/80 hover:bg-[#101820] hover:border-slate-700 rounded-xl flex items-center justify-between gap-3 shadow-sm transition-all cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="p-2 bg-[#101820] border border-slate-800 rounded-lg text-zinc-400 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-all flex-shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-[11px] font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">
                          {item.label}
                        </h5>
                        <p className="text-[9px] text-zinc-500 truncate mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {item.shortcutScreen && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToScreen(item.shortcutScreen);
                          }}
                          className="px-2 py-1 text-[8px] font-mono font-extrabold tracking-wider bg-blue-500/10 hover:bg-blue-600 hover:text-white border border-blue-500/20 hover:border-blue-500 text-blue-400 rounded-lg cursor-pointer transition-all uppercase select-none"
                          title={`Navigate to ${item.shortcutLabel}`}
                        >
                          {item.shortcutLabel}
                        </button>
                      )}
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      <BottomNavBar activeTab="account" onNavigateToScreen={onNavigateToScreen} />

    </div>
  );
}
