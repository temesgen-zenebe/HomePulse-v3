import React from "react";
import { 
  ShieldCheck, 
  Clock, 
  Activity, 
  Wrench, 
  Sparkles, 
  HeartPulse, 
  Settings,
  HelpCircle,
  FileCheck2,
  Trash2,
  RotateCcw,
  AlertTriangle,
  X,
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Types
import { PropertyInfo, HomeSystem, MaintenanceTask, ActiveRisk, DocumentRecord, SavingsItem, RecommendedProvider, ProAppointment, ConsumableItem } from "./types";

// Static Initial Data
import { 
  initialProperty, 
  initialSystems, 
  initialTasks, 
  initialRisks, 
  initialDocuments, 
  initialSavings,
  initialProviders,
  initialAppointments,
  initialConsumables
} from "./data";

// Firestore Database & Authentication Integration
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./lib/firebase";


// Sub-components
import SplashScreen from "./components/SplashScreen";
import AIOnboardingScreen from "./components/AIOnboardingScreen";
import DashboardScreen from "./components/DashboardScreen";
import SystemsScreen from "./components/SystemsScreen";
import CalendarScreen from "./components/CalendarScreen";
import TaskDetailScreen from "./components/TaskDetailScreen";
import AIAssistantScreen from "./components/AIAssistantScreen";
import RiskCenterScreen from "./components/RiskCenterScreen";
import DocumentsScreen from "./components/DocumentsScreen";
import SavingsScreen from "./components/SavingsScreen";
import ProfileScreen from "./components/ProfileScreen";
import ProvidersScreen from "./components/ProvidersScreen";
import FeaturesHubScreen from "./components/FeaturesHubScreen";
import FeatureLockedPlaceholder from "./components/FeatureLockedPlaceholder";
import StakeholderScreen, { StakeholderUser } from "./components/StakeholderScreen";
import AdminDashboardScreen from "./components/AdminDashboardScreen";
import ProviderDashboardScreen from "./components/ProviderDashboardScreen";
import LoginScreen from "./components/LoginScreen";
import GoogleLoginScreen from "./components/GoogleLoginScreen";
import LogoutScreen from "./components/LogoutScreen";
import LocationCollectionScreen from "./components/LocationCollectionScreen";
import ROICalculator from "./components/ROICalculator";
import PropertyCheckpoints from "./components/PropertyCheckpoints";
import FloorPlanVisualizer from "./components/FloorPlanVisualizer";
import PredictiveInsights from "./components/PredictiveInsights";
import ConsumableInventoryScreen from "./components/ConsumableInventoryScreen";
import PricingPlansScreen from "./components/PricingPlansScreen";
import UserAccountScreen from "./components/UserAccountScreen";

interface Toast {
  id: string;
  title: string;
  description: string;
  type: "task" | "risk" | "info" | "success";
  time?: string;
}

export default function App() {
  // SaaS Shared States
  const [property, setProperty] = React.useState<PropertyInfo>(initialProperty);
  const [systems, setSystems] = React.useState<HomeSystem[]>(initialSystems);
  const [tasks, setTasks] = React.useState<MaintenanceTask[]>(initialTasks);
  const [risks, setRisks] = React.useState<ActiveRisk[]>(initialRisks);
  const [documents, setDocuments] = React.useState<DocumentRecord[]>(initialDocuments);
  const [savings, setSavings] = React.useState<SavingsItem[]>(initialSavings);
  const [providers, setProviders] = React.useState<RecommendedProvider[]>(initialProviders);
  const [appointments, setAppointments] = React.useState<ProAppointment[]>(initialAppointments);
  const [consumables, setConsumables] = React.useState<ConsumableItem[]>(initialConsumables);

  // Zero-Knowledge Client-Side Protection: local vault key
  const [vaultPassword, setVaultPassword] = React.useState<string | null>(() => {
    return localStorage.getItem("homepulse_vault_password") || null;
  });
  const [vaultLocked, setVaultLocked] = React.useState<boolean>(true);


  // Features Switchboard States - tracks active/enabled modules from guidelines
  const [enabledFeatures, setEnabledFeatures] = React.useState<Record<string, boolean>>({
    "home-health-dashboard": true,
    "smart-maintenance-scheduler": true,
    "home-systems-monitoring": true,
    "maintenance-task-management": true,
    "intelligent-reminders": false,
    "ai-home-assistant": false,
    "risk-prevention-center": false,
    "home-documents-vault": false,
    "maintenance-history": false,
    "savings-tracker": false,
    "contractor-marketplace": false,
    "consumable-supply-matrix": false,
    "climate-weather-api-hub": false,
    "interactive-floor-plan": false,
    "iot-telemetry-bridge": false
  });

  const handleToggleFeature = React.useCallback((featureId: string) => {
    setEnabledFeatures(prev => ({
      ...prev,
      [featureId]: !prev[featureId]
    }));
  }, []);

  // Authenticated Stakeholder session
  const [currentUser, setCurrentUser] = React.useState<StakeholderUser>({
    id: "usr_1",
    name: "Marcus Vance",
    email: "temf2006@gmail.com",
    role: "homeowner",
    tier: "Basic",
    approved: true
  });

  // Toast notifications state
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  // Memoized toast adder function
  const addToast = React.useCallback((title: string, description: string, type: "task" | "risk" | "info" | "success") => {
    const newToast: Toast = {
      id: `toast_${Date.now()}_${Math.random()}`,
      title,
      description,
      type,
      time: "Just Now"
    };
    setToasts(prev => [newToast, ...prev].slice(0, 3)); // Keep at most 3 toasts
    
    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 6000);
  }, []);

  // Active screen state for the single interactive view
  const [activeScreen, setActiveScreen] = React.useState<string>("screen-splash");

  // Environmental context
  const [hasGeminiKey, setHasGeminiKey] = React.useState(false);

  // Check on load if Gemini Key is set (simulated or real from env via placeholder check)
  React.useEffect(() => {
    // If running in development, we can check if the API is configured on the backend
    fetch("/api/health")
      .then(r => r.json())
      .then(data => {
        // Simple ping to see if server is active
        console.log("[HomePulse Back-End Ping] Status:", data.status);
      })
      .catch(err => console.warn("Backend server not reached, operating in client-only fallback mode.", err));
  }, []);

  // Firestore Synchronizer Effect: Loads and syncs all tables when signed in
  React.useEffect(() => {
    if (!currentUser?.id) return;
    const userId = currentUser.id;

    const syncCollection = async <T extends { id: string }>(
      collectionName: string,
      initialData: T[],
      setter: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
      try {
        const colRef = collection(db, "users", userId, collectionName);
        const qSnapshot = await getDocs(colRef);
        
        if (qSnapshot.empty) {
          // No user data exists in firestore yet, seed starter data
          console.log(`[Firestore Setup] Seeding starter data for users/${userId}/${collectionName}`);
          for (const item of initialData) {
            await setDoc(doc(db, "users", userId, collectionName, item.id), item);
          }
          setter(initialData);
        } else {
          // Populate from cloud database
          console.log(`[Firestore Setup] Loading live cloud data for users/${userId}/${collectionName}`);
          const items: T[] = [];
          qSnapshot.forEach(d => {
            items.push(d.data() as T);
          });
          setter(items);
        }
      } catch (err) {
        console.warn(`[Firestore Setup] Operating in offline mode. Sync failed for ${collectionName}:`, err);
      }
    };

    syncCollection("systems", initialSystems, setSystems);
    syncCollection("tasks", initialTasks, setTasks);
    syncCollection("documents", initialDocuments, setDocuments);
    syncCollection("savings", initialSavings, setSavings);
    syncCollection("consumables", initialConsumables, setConsumables);
    syncCollection("appointments", initialAppointments, setAppointments);

  }, [currentUser?.id]);


  // Push notification simulator auto triggers
  React.useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Trigger 1: High Risk Alert after 6.5 seconds
    timers.push(setTimeout(() => {
      addToast(
        "Risk Alert: Severe Heatwave Incoming",
        "Forecast indicates peak 104°F tomorrow. Set pre-cooling schedules to protect compressor cycles.",
        "risk"
      );
    }, 6500));

    // Trigger 2: Maintenance Task Overdue after 19 seconds
    timers.push(setTimeout(() => {
      addToast(
        "Urgent Maintenance Overdue",
        "HVAC System Air Filter replacement is overdue. Restricted air loop increases energy usage by 18%.",
        "task"
      );
    }, 19000));

    // Trigger 3: Risk Center Update after 36 seconds
    timers.push(setTimeout(() => {
      addToast(
        "Dry Air Risk Detected",
        "Living Room humidity at 26%. Protect premium timber and oak cabinetry.",
        "risk"
      );
    }, 36000));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [addToast]);

  // Push notification manual simulation trigger
  const handleTriggerSimulatedNotification = () => {
    const randomNotifications: { title: string; description: string; type: "task" | "risk" | "info" | "success" }[] = [
      {
        title: "Risk Alert: Critical Freeze Danger",
        description: "Sub-zero overnight forecast detected. Exterior water line isolation recommended.",
        type: "risk"
      },
      {
        title: "Risk Alert: Basewell Humidity Spike",
        description: "Humidity exceeded 74% in Basement Zone. Dehumidifier drain-pan clearance required.",
        type: "risk"
      },
      {
        title: "Sump Pump Care Due",
        description: "Dry-test backup power batteries to prevent storm overflow during tomorrow's heavy showers.",
        type: "task"
      },
      {
        title: "System Calibration Complete",
        description: "A/C Condensate Line has been chemically cleansed. Airflow friction decreased by 14%.",
        type: "info"
      },
      {
        title: "Smart Thermostat Synced",
        description: "HomePulse pre-cooling schedule deployed. High-risk peak-hour wear mitigated.",
        type: "success"
      },
      {
        title: "Risk Alert: Extreme Solar Radiation",
        description: "UV index peak at 11 tomorrow. Lower South-facing solar roller shades to preserve interior floor panels.",
        type: "risk"
      }
    ];

    const pick = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
    addToast(pick.title, pick.description, pick.type);
  };

  // Helper to save item to Firestore
  const saveToFirestore = async (collectionName: string, docId: string, data: any) => {
    if (!currentUser?.id) return;
    try {
      await setDoc(doc(db, "users", currentUser.id, collectionName, docId), data, { merge: true });
    } catch (err) {
      console.warn(`[Firestore Sync] Failed to write to users/${currentUser.id}/${collectionName}/${docId}:`, err);
    }
  };

  // Sync: Toggle task completed status
  const handleToggleTask = (taskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (target) {
      const nextCompleted = !target.completed;
      if (nextCompleted) {
        addToast(
          "Task Logged & Completed",
          `"${target.title}" is marked as complete. Safe baseline score boosted!`,
          "success"
        );
      } else {
        addToast(
          "Task Re-opened",
          `"${target.title}" marked as pending. Check details for precautions.`,
          "info"
        );
      }

      // Persist to Firestore
      saveToFirestore("tasks", taskId, {
        completed: nextCompleted,
        completedAt: nextCompleted ? new Date().toISOString() : null
      });
    }

    setTasks(prev => 
      prev.map(t => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined
          };
        }
        return t;
      })
    );
  };

  // Sync: Service a mechanical system (restore health to 98%+)
  const handleServiceSystem = (systemId: string) => {
    const targetSystem = systems.find(s => s.id === systemId);
    if (targetSystem) {
      addToast(
        "System Serviced & Calibrated",
        `"${targetSystem.name}" telemetry node stabilized. System health restored to 98%.`,
        "success"
      );

      // Persist to Firestore
      const updatedSystemData = {
        health: 98,
        status: "Optimal",
        lastInspected: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        details: `Fully serviced on ${new Date().toLocaleDateString()}. Coils cleansed, pressure calibrated, and mechanical tolerances verified.`
      };
      saveToFirestore("systems", systemId, updatedSystemData);
    }

    setSystems(prev => 
      prev.map(s => {
        if (s.id === systemId) {
          return {
            ...s,
            health: 98,
            status: "Optimal",
            lastInspected: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
            details: `Fully serviced on ${new Date().toLocaleDateString()}. Coils cleansed, pressure calibrated, and mechanical tolerances verified.`
          };
        }
        return s;
      })
    );

    // Also trigger some cash savings YTD!
    if (targetSystem) {
      const addedSavings: SavingsItem = {
        id: `save_serv_${Date.now()}`,
        category: targetSystem.name,
        amount: Math.floor(Math.random() * 150) + 120,
        description: `Serviced and stabilized ${targetSystem.name} telemetry node, bypassing expensive local technician emergency fees.`
      };
      setSavings(prev => [addedSavings, ...prev]);

      // Persist to Firestore
      saveToFirestore("savings", addedSavings.id, addedSavings);
    }
  };

  // Sync: Add dynamic uploaded document
  const handleAddDocument = (docItem: DocumentRecord) => {
    addToast(
      "Document Securely Uploaded",
      `"${docItem.name}" of size ${docItem.size} has been saved in the property vault.`,
      "success"
    );
    setDocuments(prev => [docItem, ...prev]);

    // Persist to Firestore
    saveToFirestore("documents", docItem.id, docItem);
  };

  // Sync: Add dynamic savings item
  const handleAddSavings = (item: SavingsItem) => {
    addToast(
      "ROI Saving Logged",
      `Saved ${item.amount} under ${item.category}.`,
      "success"
    );
    setSavings(prev => [item, ...prev]);

    // Persist to Firestore
    saveToFirestore("savings", item.id, item);
  };


  // Sync: Update Specific System Health score based on checkpoint actions
  const handleUpdateSystemHealth = (systemId: string, healthChange: number) => {
    setSystems(prev => 
      prev.map(s => {
        if (s.id === systemId) {
          const rawHealth = s.health + healthChange;
          const nextHealth = Math.max(0, Math.min(100, rawHealth));
          
          let nextStatus: "Optimal" | "Good" | "Fair" | "Critical" = "Good";
          if (nextHealth >= 90) nextStatus = "Optimal";
          else if (nextHealth >= 75) nextStatus = "Good";
          else if (nextHealth >= 60) nextStatus = "Fair";
          else nextStatus = "Critical";

          return {
            ...s,
            health: nextHealth,
            status: nextStatus
          };
        }
        return s;
      })
    );
  };

  // Sync: Add dynamic task to schedule (avoid duplicates)
  const handleAddTask = (task: MaintenanceTask) => {
    setTasks(prev => {
      // Avoid duplicate trigger IDs if they exist
      if (prev.some(t => t.id === task.id || t.title === task.title)) return prev;
      // Persist to Firestore
      saveToFirestore("tasks", task.id, task);
      return [task, ...prev];
    });
  };

  // Sync: Reset all data to factory demo records
  const handleResetData = async () => {
    setProperty(initialProperty);
    setSystems(initialSystems);
    setTasks(initialTasks);
    setRisks(initialRisks);
    setDocuments(initialDocuments);
    setSavings(initialSavings);
    setProviders(initialProviders);
    setAppointments(initialAppointments);
    setConsumables(initialConsumables);

    if (currentUser?.id) {
      const userId = currentUser.id;
      addToast("Factory Reset Initiated", "Synchronizing cloud data to factory baseline configuration...", "info");
      try {
        // Overwrite Firestore collections with original initial data structures
        for (const s of initialSystems) await setDoc(doc(db, "users", userId, "systems", s.id), s);
        for (const t of initialTasks) await setDoc(doc(db, "users", userId, "tasks", t.id), t);
        for (const d of initialDocuments) await setDoc(doc(db, "users", userId, "documents", d.id), d);
        for (const sv of initialSavings) await setDoc(doc(db, "users", userId, "savings", sv.id), sv);
        for (const c of initialConsumables) await setDoc(doc(db, "users", userId, "consumables", c.id), c);
        for (const a of initialAppointments) await setDoc(doc(db, "users", userId, "appointments", a.id), a);
      } catch (err) {
        console.warn("Failed to overwrite firestore records on reset:", err);
      }
    }

    alert("HomePulse v3 SaaS demo records refreshed & synchronized on Firestore successfully!");
  };


  // Navigation helper to switch the single active device viewport
  const handleNavigateToScreen = (screenId: string) => {
    if (screenId === "screen-admin" && currentUser.role !== "admin") {
      addToast("Unauthorized Access", "The requested administrative node requires active Admin credentials.", "risk");
      setActiveScreen("screen-login");
      return;
    }
    if (screenId === "screen-provider-dashboard" && currentUser.role !== "provider") {
      addToast("Unauthorized Access", "The requested service console requires a verified Provider certification.", "risk");
      setActiveScreen("screen-login");
      return;
    }
    setActiveScreen(screenId);
  };

  const getScreenTitle = (screenId: string) => {
    switch (screenId) {
      case "screen-splash": return "Splash Welcome";
      case "screen-login": return "Account Sign In";
      case "screen-admin": return "App Admin Dashboard";
      case "screen-provider-dashboard": return "Service Pro Dashboard";
      case "screen-google-login": return "Google Identity Access";
      case "screen-location-collection": return "Property Calibration";
      case "screen-onboarding": return "AI Onboarding Plan";
      case "screen-dashboard": return "Main Dashboard";
      case "screen-systems": return "Telemetry Systems";
      case "screen-calendar": return "Calendar Care";
      case "screen-taskdetail": return "Task Details";
      case "screen-assistant": return "AI Assistant Chat";
      case "screen-risks": return "Threat Risks";
      case "screen-documents": return "Property Vault";
      case "screen-savings": return "ROI Savings";
      case "screen-roi-calculator": return "Savings ROI Simulator";
      case "screen-checkpoints": return "Stewardship Checkpoints";
      case "screen-floorplan": return "Interactive Floor Plan";
      case "screen-predictive": return "Predictive Health Insights";
      case "screen-consumables": return "Consumable Inventory";
      case "screen-profile": return "Owner Profile";
      case "screen-features-hub": return "Modules Switchboard";
      case "screen-pricing": return "SaaS Pricing & Plans";
      case "screen-account": return "User Account Management";
      case "screen-stakeholders": return "Auth & SaaS Portal";
      case "screen-logout": return "Session Terminated";
      default: return "HomePulse Care";
    }
  };

  // Calculate dynamic overall health score from current states
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const score = totalTasksCount > 0 
    ? Math.min(100, Math.floor(84 + (16 * (completedTasksCount / totalTasksCount))))
    : 84;

  return (
    <div className="min-h-screen w-full bg-[#030712] text-white flex flex-col justify-center items-center font-sans selection:bg-blue-600 selection:text-white relative p-0 md:p-4">
      
      {/* Centered Clean App Viewport (Responsive Actual View) */}
      <div className="w-full max-w-md md:max-w-xl h-screen md:h-[860px] bg-[#0A0A0A] md:rounded-2xl md:border md:border-slate-800/60 md:shadow-[0_0_50px_rgba(0,0,0,0.6)] flex flex-col relative overflow-hidden">
        
        {/* Floating Simulated Push Notifications */}
        <div className="absolute top-4 inset-x-4 z-50 pointer-events-none flex flex-col gap-2">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -40, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 350, damping: 26 }}
                className="pointer-events-auto w-full bg-zinc-900/95 border border-slate-800/80 rounded-2xl p-3 shadow-2xl shadow-black/80 flex items-start gap-3 relative overflow-hidden select-none"
              >
                {/* Visual Type Indicator Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {toast.type === "risk" && (
                    <div className="p-1.5 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 animate-pulse">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  )}
                  {toast.type === "task" && (
                    <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                      <Clock className="w-4 h-4" />
                    </div>
                  )}
                  {toast.type === "success" && (
                    <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  )}
                  {toast.type === "info" && (
                    <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                      <Bell className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Toast Content details */}
                <div className="flex-grow min-w-0 pr-4 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-white leading-tight truncate flex items-center gap-1">
                      {toast.type === "risk" && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>}
                      {toast.title}
                    </span>
                    <span className="text-[8px] font-mono text-zinc-500 flex-shrink-0 ml-1">
                      Just Now
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-300 mt-1 leading-relaxed">
                    {toast.description}
                  </p>
                </div>

                {/* Quick Close button */}
                <button
                  onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                  className="absolute top-2.5 right-2.5 p-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Dynamic App Content Space */}
        <div className="flex-1 w-full bg-[#0A0A0A] overflow-y-auto relative scrollbar-none">
          {(() => {
            switch (activeScreen) {
              case "screen-splash":
                return (
                  <SplashScreen 
                    onGetStarted={() => handleNavigateToScreen("screen-login")} 
                  />
                );
              case "screen-login":
                return (
                  <LoginScreen 
                    onNavigateToScreen={handleNavigateToScreen}
                    onLoginSuccess={(user) => {
                      setCurrentUser(user);
                      addToast("Identity Verified", `Logged in as ${user.name}`, "success");
                    }}
                  />
                );
              case "screen-admin":
                return (
                  <AdminDashboardScreen
                    currentUser={currentUser}
                    onNavigateToScreen={handleNavigateToScreen}
                    onLogout={() => {
                      handleNavigateToScreen("screen-login");
                      addToast("Admin Logged Out", "Administrative session ended safely.", "info");
                    }}
                    providers={providers}
                    onUpdateProviders={setProviders}
                    appointments={appointments}
                    onUpdateAppointments={setAppointments}
                    addToast={addToast}
                    onUpdateCurrentUser={setCurrentUser}
                  />
                );
              case "screen-provider-dashboard":
                return (
                  <ProviderDashboardScreen
                    currentUser={currentUser}
                    onNavigateToScreen={handleNavigateToScreen}
                    onLogout={() => {
                      handleNavigateToScreen("screen-login");
                      addToast("Provider Logged Out", "Service session ended safely.", "info");
                    }}
                    providers={providers}
                    onUpdateProviders={setProviders}
                    appointments={appointments}
                    onUpdateAppointments={setAppointments}
                    addToast={addToast}
                    onUpdateCurrentUser={setCurrentUser}
                  />
                );
              case "screen-google-login":
                return (
                  <GoogleLoginScreen 
                    onNavigateToScreen={handleNavigateToScreen}
                    onLoginSuccess={(user) => {
                      setCurrentUser(user);
                      addToast("Google Sign In", `Authenticated as ${user.name}`, "success");
                    }}
                    userEmail={currentUser?.email || "temf2006@gmail.com"}
                  />
                );
              case "screen-location-collection":
                return (
                  <LocationCollectionScreen 
                    onNavigateToScreen={handleNavigateToScreen}
                    onSaveLocation={(data) => {
                      setProperty(prev => ({
                        ...prev,
                        address: data.address,
                        yearBuilt: 2026 - data.houseAge
                      }));
                      addToast("Location Configured", `Calibrated sensors for ${data.address}`, "success");
                    }}
                    initialAddress={property.address}
                    initialYearBuilt={property.yearBuilt}
                  />
                );
              case "screen-logout":
                return (
                  <LogoutScreen 
                    onNavigateToScreen={handleNavigateToScreen}
                    onClearSession={() => {
                      setCurrentUser({
                        id: "",
                        name: "",
                        email: "",
                        role: "",
                        tier: "",
                        approved: false
                      });
                      addToast("Session Closed", "Logged out safely.", "info");
                    }}
                  />
                );
              case "screen-onboarding":
                return (
                  <AIOnboardingScreen 
                    propertyAddress={property.address}
                    onProceedToDashboard={() => handleNavigateToScreen("screen-dashboard")}
                  />
                );
              case "screen-dashboard":
                return (
                  <DashboardScreen 
                    tasks={tasks}
                    systems={systems}
                    providers={providers}
                    consumables={consumables}
                    onToggleTask={handleToggleTask}
                    onNavigateToScreen={handleNavigateToScreen}
                    setSystems={setSystems}
                    onAddAppointment={(appt) => {
                      setAppointments(prev => [appt, ...prev]);
                      addToast(
                        "Emergency Dispatch Booked",
                        `Successfully booked emergency dispatch with ${appt.providerName}.`,
                        "success"
                      );
                    }}
                    addToast={addToast}
                    onAddTask={handleAddTask}
                    enabledFeatures={enabledFeatures}
                  />
                );
              case "screen-systems":
                if (!enabledFeatures["home-systems-monitoring"]) {
                  return (
                    <FeatureLockedPlaceholder
                      title="Home Systems Monitoring"
                      description="Real-time health status of Roof, HVAC, Plumbing, Electrical, Foundation, Exterior, Appliances, and Safety Systems."
                      detail="Simulates localized continuous telematic scanning. Highlights mechanical decay models and custom reporting intervals."
                      featureId="home-systems-monitoring"
                      onActivate={handleToggleFeature}
                      onNavigateBack={() => handleNavigateToScreen("screen-dashboard")}
                      onNavigateToHub={() => handleNavigateToScreen("screen-features-hub")}
                    />
                  );
                }
                return (
                  <SystemsScreen 
                    systems={systems}
                    onServiceSystem={handleServiceSystem}
                    onNavigateToScreen={handleNavigateToScreen}
                    onUpdateSystems={setSystems}
                    tasks={tasks}
                    onUpdateTasks={setTasks}
                    documents={documents}
                    onUpdateDocuments={setDocuments}
                    consumables={consumables}
                    onUpdateConsumables={setConsumables}
                    savings={savings}
                    onUpdateSavings={setSavings}
                    vaultLocked={vaultLocked}
                  />
                );
              case "screen-calendar":
                if (!enabledFeatures["smart-maintenance-scheduler"]) {
                  return (
                    <FeatureLockedPlaceholder
                      title="Smart Maintenance Scheduler"
                      description="Automatically generates personalized maintenance plans, creates recurring maintenance schedules, and tracks upcoming and overdue tasks."
                      detail="Tailors recurrent task protocols based on your home's unique geographic weather load and built-year calibration indices."
                      featureId="smart-maintenance-scheduler"
                      onActivate={handleToggleFeature}
                      onNavigateBack={() => handleNavigateToScreen("screen-dashboard")}
                      onNavigateToHub={() => handleNavigateToScreen("screen-features-hub")}
                    />
                  );
                }
                return (
                  <CalendarScreen 
                    tasks={tasks}
                    systems={systems}
                    onToggleTask={handleToggleTask}
                    onNavigateToScreen={handleNavigateToScreen}
                    onUpdateTasks={setTasks}
                  />
                );
              case "screen-taskdetail":
                return (
                  <TaskDetailScreen 
                    tasks={tasks}
                    onToggleTask={handleToggleTask}
                    onNavigateToScreen={handleNavigateToScreen}
                    onUpdateTasks={setTasks}
                  />
                );
              case "screen-features-hub":
                return (
                  <FeaturesHubScreen 
                    onNavigateToScreen={handleNavigateToScreen}
                    enabledFeatures={enabledFeatures}
                    onToggleFeature={handleToggleFeature}
                    addToast={addToast}
                  />
                );
              case "screen-assistant":
                if (!enabledFeatures["ai-home-assistant"]) {
                  return (
                    <FeatureLockedPlaceholder
                      title="AI Home Assistant"
                      description="Diagnoses common issues, recommends DIY fixes, suggests preventive actions, determines urgency, and recommends professionals when needed."
                      detail="Integrated with local reasoning model to act as a virtual property engineer, diagnosing complex HVAC compressor friction or plumbing flow anomalies."
                      featureId="ai-home-assistant"
                      onActivate={handleToggleFeature}
                      onNavigateBack={() => handleNavigateToScreen("screen-dashboard")}
                      onNavigateToHub={() => handleNavigateToScreen("screen-features-hub")}
                    />
                  );
                }
                return (
                  <AIAssistantScreen 
                    onNavigateToScreen={handleNavigateToScreen}
                  />
                );
              case "screen-risks":
                if (!enabledFeatures["risk-prevention-center"]) {
                  return (
                    <FeatureLockedPlaceholder
                      title="Risk Prevention Center"
                      description="Weather-related alerts, freeze warnings, heatwave preparation, storm preparation, water leak prevention, and fire safety reminders."
                      detail="Actively cross-references atmospheric trends to dynamically recommend precautionary actions and emergency shutoff procedures."
                      featureId="risk-prevention-center"
                      onActivate={handleToggleFeature}
                      onNavigateBack={() => handleNavigateToScreen("screen-dashboard")}
                      onNavigateToHub={() => handleNavigateToScreen("screen-features-hub")}
                    />
                  );
                }
                return (
                  <RiskCenterScreen 
                    risks={risks}
                    onNavigateToScreen={handleNavigateToScreen}
                    onAddTasks={(newTasks) => setTasks(prev => [...newTasks, ...prev])}
                  />
                );
              case "screen-documents":
                if (!enabledFeatures["home-documents-vault"]) {
                  return (
                    <FeatureLockedPlaceholder
                      title="Home Documents Vault"
                      description="Centralized storage for Warranties, Manuals, Receipts, Inspection reports, Photos, and Insurance documents."
                      detail="Organizes critical property metadata with interactive filters, expiration alerts, and direct upload capability."
                      featureId="home-documents-vault"
                      onActivate={handleToggleFeature}
                      onNavigateBack={() => handleNavigateToScreen("screen-dashboard")}
                      onNavigateToHub={() => handleNavigateToScreen("screen-features-hub")}
                    />
                  );
                }
                return (
                  <DocumentsScreen 
                    documents={documents}
                    onAddDocument={handleAddDocument}
                    onNavigateToScreen={handleNavigateToScreen}
                    vaultPassword={vaultPassword}
                    vaultLocked={vaultLocked}
                    onSetVaultPassword={(pw) => {
                      setVaultPassword(pw);
                      if (pw) {
                        localStorage.setItem("homepulse_vault_password", pw);
                      } else {
                        localStorage.removeItem("homepulse_vault_password");
                      }
                    }}
                    onSetVaultLocked={setVaultLocked}
                  />
                );
              case "screen-savings":
                if (!enabledFeatures["savings-tracker"]) {
                  return (
                    <FeatureLockedPlaceholder
                      title="Savings Tracker"
                      description="Tracks prevented repair costs, maintenance expenses, utility savings, and home value protection."
                      detail="Computes financial ROI metrics based on early detection formulas, illustrating saved technician emergency premiums."
                      featureId="savings-tracker"
                      onActivate={handleToggleFeature}
                      onNavigateBack={() => handleNavigateToScreen("screen-dashboard")}
                      onNavigateToHub={() => handleNavigateToScreen("screen-features-hub")}
                    />
                  );
                }
                return (
                  <SavingsScreen 
                    savings={savings}
                    onAddSavings={handleAddSavings}
                    onNavigateToScreen={handleNavigateToScreen}
                  />
                );
              case "screen-roi-calculator":
                return (
                  <ROICalculator 
                    tasks={tasks}
                    systems={systems}
                    onToggleTask={handleToggleTask}
                    onNavigateToScreen={handleNavigateToScreen}
                  />
                );
              case "screen-checkpoints":
                return (
                  <PropertyCheckpoints 
                    tasks={tasks}
                    systems={systems}
                    onNavigateToScreen={handleNavigateToScreen}
                    onAddTask={handleAddTask}
                    onUpdateSystemHealth={handleUpdateSystemHealth}
                    onAddSavings={handleAddSavings}
                  />
                );
              case "screen-floorplan":
                if (!enabledFeatures["interactive-floor-plan"]) {
                  return (
                    <FeatureLockedPlaceholder
                      title="Interactive Floor Plan"
                      description="Audit room health profiles, view spatial system maps, and toggle localized maintenance actions."
                      detail="Interactive layout schematic mapping room temperature profiles, humidity levels, air-quality indexes, and plumbing shutoff points."
                      featureId="interactive-floor-plan"
                      onActivate={handleToggleFeature}
                      onNavigateBack={() => handleNavigateToScreen("screen-dashboard")}
                      onNavigateToHub={() => handleNavigateToScreen("screen-features-hub")}
                    />
                  );
                }
                return (
                  <FloorPlanVisualizer 
                    tasks={tasks}
                    systems={systems}
                    onToggleTask={handleToggleTask}
                    onNavigateToScreen={handleNavigateToScreen}
                    onUpdateSystemHealth={handleUpdateSystemHealth}
                    onAddTask={handleAddTask}
                  />
                );
              case "screen-predictive":
                return (
                  <PredictiveInsights 
                    systems={systems}
                    tasks={tasks}
                    onNavigateToScreen={handleNavigateToScreen}
                    onUpdateSystemHealth={handleUpdateSystemHealth}
                    onAddTask={handleAddTask}
                  />
                );
              case "screen-consumables":
                if (!enabledFeatures["consumable-supply-matrix"]) {
                  return (
                    <FeatureLockedPlaceholder
                      title="Consumable Supply Matrix"
                      description="Tracks air filters, water softener salt, humidifier pads & life safety batteries."
                      detail="Water filters and softener salt are running low. Tap to insta-order replacements."
                      featureId="consumable-supply-matrix"
                      onActivate={handleToggleFeature}
                      onNavigateBack={() => handleNavigateToScreen("screen-dashboard")}
                      onNavigateToHub={() => handleNavigateToScreen("screen-features-hub")}
                    />
                  );
                }
                return (
                  <ConsumableInventoryScreen 
                    consumables={consumables}
                    setConsumables={setConsumables}
                    appointments={appointments}
                    setAppointments={setAppointments}
                    onNavigateToScreen={handleNavigateToScreen}
                    addToast={addToast}
                  />
                );
              case "screen-profile":
                return (
                  <ProfileScreen 
                    property={property}
                    onUpdateProperty={setProperty}
                    onNavigateToScreen={handleNavigateToScreen}
                    providers={providers}
                    appointments={appointments}
                    onBookAppointment={(newApp) => setAppointments(prev => [newApp, ...prev])}
                    onUpdateAppointments={setAppointments}
                    onUpdateProviders={setProviders}
                    onTriggerSimulatedNotification={handleTriggerSimulatedNotification}
                    onResetData={handleResetData}
                  />
                );
              case "screen-pricing":
                return (
                  <PricingPlansScreen
                    currentUser={currentUser}
                    onUpdateCurrentUser={setCurrentUser}
                    onNavigateToScreen={handleNavigateToScreen}
                    addToast={addToast}
                  />
                );
              case "screen-account":
                return (
                  <UserAccountScreen
                    currentUser={currentUser}
                    onUpdateCurrentUser={setCurrentUser}
                    onNavigateToScreen={handleNavigateToScreen}
                  />
                );
              case "screen-stakeholders":
                return (
                  <StakeholderScreen
                    property={property}
                    onUpdateProperty={setProperty}
                    onNavigateToScreen={handleNavigateToScreen}
                    providers={providers}
                    appointments={appointments}
                    onBookAppointment={(newApp) => setAppointments(prev => [newApp, ...prev])}
                    onUpdateAppointments={setAppointments}
                    onUpdateProviders={setProviders}
                    onAddDocument={handleAddDocument}
                    currentUser={currentUser}
                    onUpdateCurrentUser={setCurrentUser}
                  />
                );
              case "screen-providers":
                if (!enabledFeatures["contractor-marketplace"]) {
                  return (
                    <FeatureLockedPlaceholder
                      title="Contractor Marketplace"
                      description="Find trusted professionals, schedule appointments, compare providers, and track completed services."
                      detail="Direct live connection to pre-vetted certified HVAC, electrical, plumbing, and safety experts with guaranteed priority dispatch agreements."
                      featureId="contractor-marketplace"
                      onActivate={handleToggleFeature}
                      onNavigateBack={() => handleNavigateToScreen("screen-dashboard")}
                      onNavigateToHub={() => handleNavigateToScreen("screen-features-hub")}
                    />
                  );
                }
                return (
                  <ProvidersScreen 
                    providers={providers}
                    appointments={appointments}
                    onNavigateToScreen={handleNavigateToScreen}
                    onBookAppointment={(newApp) => setAppointments(prev => [newApp, ...prev])}
                    onUpdateAppointments={setAppointments}
                    onUpdateProviders={setProviders}
                  />
                );
              default:
                return (
                  <SplashScreen 
                    onGetStarted={() => handleNavigateToScreen("screen-login")} 
                  />
                );
            }
          })()}
        </div>
      </div>

    </div>
  );
}
