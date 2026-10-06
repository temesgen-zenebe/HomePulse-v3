import React from "react";
import { 
  ArrowLeft, Search, Plus, Filter, AlertTriangle, CheckCircle, 
  ShoppingBag, RefreshCw, Trash2, CalendarRange, Sparkles, 
  Info, Tag, Activity, Clock, ShieldCheck, DollarSign,
  ToggleLeft, ToggleRight, Truck, Wrench, Settings, AlertOctagon, HelpCircle
} from "lucide-react";
import { ConsumableItem, ProAppointment } from "../types";

export interface PurchaseRequest {
  id: string;
  itemName: string;
  partNumber: string;
  cost: number;
  status: "Pending Approval" | "Ordered" | "Shipped" | "Delivered";
  date: string;
  reorderLink: string;
}

interface ConsumableInventoryScreenProps {
  consumables: ConsumableItem[];
  setConsumables: React.Dispatch<React.SetStateAction<ConsumableItem[]>>;
  appointments: ProAppointment[];
  setAppointments: React.Dispatch<React.SetStateAction<ProAppointment[]>>;
  onNavigateToScreen: (screenId: string) => void;
  addToast: (title: string, description: string, type: "task" | "risk" | "info" | "success") => void;
}

export default function ConsumableInventoryScreen({
  consumables,
  setConsumables,
  appointments,
  setAppointments,
  onNavigateToScreen,
  addToast
}: ConsumableInventoryScreenProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  
  // Auto-Replenish Tracker states
  const [purchaseRequests, setPurchaseRequests] = React.useState<PurchaseRequest[]>([
    {
      id: "pr_1",
      itemName: "HVAC MERV 13 Pleated Air Filter",
      partNumber: "M13-20251-1",
      cost: 24.99,
      status: "Ordered",
      date: new Date().toISOString().split("T")[0],
      reorderLink: "https://www.amazon.com/s?k=merv+13+20x25x1+filter"
    }
  ]);

  // Create New Consumable Form State
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newCategory, setNewCategory] = React.useState("HVAC");
  const [newLevel, setNewLevel] = React.useState(100);
  const [newLifespan, setNewLifespan] = React.useState(90);
  const [newPartNumber, setNewPartNumber] = React.useState("");
  const [newCost, setNewCost] = React.useState("");
  const [newReorderLink, setNewReorderLink] = React.useState("");
  const [newAutoReplenish, setNewAutoReplenish] = React.useState(false);
  const [newReplenishType, setNewReplenishType] = React.useState<"appointment" | "purchase">("purchase");

  // Order modal simulation
  const [orderingItem, setOrderingItem] = React.useState<ConsumableItem | null>(null);
  const [shippingMethod, setShippingMethod] = React.useState("standard");
  const [isOrdering, setIsOrdering] = React.useState(false);

  // Time-simulation options
  const [decaySpeed, setDecaySpeed] = React.useState<number>(0); // manual or auto

  // Helper mapping category to provider details
  const matchProviderForCategory = (category: string) => {
    switch (category.toUpperCase()) {
      case "HVAC":
        return { id: "prov_1", name: "Dave Miller", specialty: "HVAC & Climate Control Specialist" };
      case "PLUMBING":
        return { id: "prov_2", name: "Elena Rostova", specialty: "Master Plumber & Pipe Diagnostics" };
      case "ELECTRICAL":
        return { id: "prov_3", name: "Marcus Vance", specialty: "Residential Electrical Systems Master" };
      default:
        return { id: "prov_4", name: "Sarah Jenkins", specialty: "Exterior Structure & Roofing Pro" };
    }
  };

  // Callback to trigger actual autonomous replacement
  const triggerAutoReplenish = React.useCallback((item: ConsumableItem) => {
    if (item.replenishType === "appointment") {
      const prov = matchProviderForCategory(item.category);
      const newAppt: ProAppointment = {
        id: `appt_auto_${Date.now()}`,
        providerId: prov.id,
        providerName: prov.name,
        providerSpecialty: prov.specialty,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0], // tomorrow
        time: "10:00 AM",
        issueDescription: `AUTONOMOUS DISPATCH: Replacement service requested for depleted consumable part: "${item.name}" (SKU #${item.partNumber || 'GEN-PT'}). Operating level crossed 25% threshold.`,
        status: "Requested",
        progressUpdates: [
          { timestamp: new Date().toISOString(), status: "Requested", message: "Automated dispatch request triggered by HomePulse IoT sensor." }
        ]
      };
      setAppointments(prev => {
        // Avoid adding duplicate pending requests
        if (prev.some(a => a.issueDescription.includes(item.name) && a.status === "Requested")) {
          return prev;
        }
        return [newAppt, ...prev];
      });

      addToast(
        "Auto-Replenish: Service Request Created",
        `Created a service appointment request with ${prov.name} for "${item.name}".`,
        "success"
      );
    } else {
      const newPR: PurchaseRequest = {
        id: `pr_${Date.now()}`,
        itemName: item.name,
        partNumber: item.partNumber || "GEN-PT",
        cost: item.cost,
        status: "Pending Approval",
        date: new Date().toISOString().split("T")[0],
        reorderLink: item.reorderLink
      };
      setPurchaseRequests(prev => [newPR, ...prev]);

      addToast(
        "Auto-Replenish: Purchase Requested",
        `Automatically drafted purchase request for "${item.name}" ($${item.cost}).`,
        "success"
      );
    }
  }, [setAppointments, addToast]);

  // Auto-decay simulation ticks
  React.useEffect(() => {
    if (decaySpeed === 0) return;

    const interval = setInterval(() => {
      setConsumables(prev => {
        let alertTriggered = false;
        const updated = prev.map(item => {
          // Reduce level based on speed and daily rate
          const decayAmount = item.dailyUsageRate * (decaySpeed / 10);
          const rawNextLevel = item.currentLevel - decayAmount;
          const nextLevel = Math.max(0, Math.round(rawNextLevel * 10) / 10);
          
          let nextStatus: "Good" | "Low" | "Empty" = "Good";
          if (nextLevel === 0) {
            nextStatus = "Empty";
          } else if (nextLevel <= 25) {
            nextStatus = "Low";
          }

          // Trigger dynamic reminder when crossing below 25% threshold
          if (nextLevel <= 25 && item.currentLevel > 25 && !item.alertActive) {
            alertTriggered = true;
          }

          // Compute remaining days
          const daysRemaining = Math.max(0, Math.round(nextLevel / item.dailyUsageRate));

          return {
            ...item,
            currentLevel: nextLevel,
            status: nextStatus,
            daysRemaining,
            alertActive: nextLevel <= 25 ? true : item.alertActive
          };
        });

        if (alertTriggered) {
          // Delay toast slightly to avoid React state update overlaps
          setTimeout(() => {
            addToast(
              "Supply Alert (Low)",
              `Your consumable component is running low (< 25%). Order a replacement soon.`,
              "risk"
            );
          }, 50);
        }

        return updated;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [decaySpeed, setConsumables, addToast]);

  // Reactive listener to trigger Auto-Replenishments on low threshold
  React.useEffect(() => {
    const itemsToReplenish = consumables.filter(
      item => item.currentLevel <= 25 && item.autoReplenish && !item.replenishTriggered
    );

    if (itemsToReplenish.length === 0) return;

    // 1. Mark as triggered in consumables state to prevent duplicate runs
    setConsumables(prev =>
      prev.map(c => {
        const match = itemsToReplenish.find(it => it.id === c.id);
        if (match) {
          return { ...c, replenishTriggered: true };
        }
        return c;
      })
    );

    // 2. Fire the asynchronous replenishment actions (appointments or purchase requests)
    itemsToReplenish.forEach(item => {
      triggerAutoReplenish(item);
    });
  }, [consumables, setConsumables, triggerAutoReplenish]);

  // Handle manual replacement (resets level to 100)
  const handleReplaceItem = (itemId: string) => {
    const item = consumables.find(c => c.id === itemId);
    if (!item) return;

    setConsumables(prev => 
      prev.map(c => {
        if (c.id === itemId) {
          return {
            ...c,
            currentLevel: 100,
            status: "Good",
            daysRemaining: c.lifespanDays,
            installDate: new Date().toISOString().split("T")[0],
            alertActive: false,
            replenishTriggered: false
          };
        }
        return c;
      })
    );

    addToast(
      "Component Replaced",
      `"${item.name}" inventory reset to 100%. Next replacement logged for ${item.lifespanDays} days.`,
      "success"
    );
  };

  // Simulate Order Success
  const handleConfirmOrder = () => {
    if (!orderingItem) return;
    setIsOrdering(true);

    // Simulate 1.5s network lag
    setTimeout(() => {
      setConsumables(prev => 
        prev.map(c => {
          if (c.id === orderingItem.id) {
            return {
              ...c,
              // Keep old level but mark that an order has been dispatched
              // and auto-replacing simulates shipment arrival
              currentLevel: 100,
              status: "Good",
              daysRemaining: c.lifespanDays,
              installDate: new Date().toISOString().split("T")[0],
              alertActive: false,
              replenishTriggered: false
            };
          }
          return c;
        })
      );

      addToast(
        "Order Dispatched",
        `Order confirmed for ${orderingItem.name}. Components arrived and auto-installed!`,
        "success"
      );

      setIsOrdering(false);
      setOrderingItem(null);
    }, 1200);
  };

  // Handle Adding a New Consumable
  const handleAddNewConsumable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const parsedLifespan = Number(newLifespan) || 90;
    const parsedCost = Number(newCost) || 15.00;
    const dailyRate = Math.round((100 / parsedLifespan) * 100) / 100;
    const currentLvl = Number(newLevel) || 100;
    const daysRem = Math.round(currentLvl / dailyRate);

    let calculatedStatus: "Good" | "Low" | "Empty" = "Good";
    if (currentLvl === 0) {
      calculatedStatus = "Empty";
    } else if (currentLvl <= 25) {
      calculatedStatus = "Low";
    }

    const newItem: ConsumableItem = {
      id: `con_${Date.now()}`,
      name: newName,
      category: newCategory,
      currentLevel: currentLvl,
      unit: "% Capacity Left",
      installDate: new Date().toISOString().split("T")[0],
      lifespanDays: parsedLifespan,
      dailyUsageRate: dailyRate,
      daysRemaining: daysRem,
      status: calculatedStatus,
      reorderLink: newReorderLink.trim() || `https://www.amazon.com/s?k=${encodeURIComponent(newName)}`,
      partNumber: newPartNumber.trim() || "GEN-PAR-101",
      cost: parsedCost,
      alertActive: currentLvl <= 25,
      autoReplenish: newAutoReplenish,
      replenishType: newReplenishType,
      replenishTriggered: false
    };

    setConsumables(prev => [newItem, ...prev]);
    addToast(
      "Consumable Registered",
      `"${newName}" has been enrolled in the predictive tracking index${newAutoReplenish ? " with Auto-Replenish active" : ""}.`,
      "success"
    );

    // Reset Form
    setNewName("");
    setNewCategory("HVAC");
    setNewLevel(100);
    setNewLifespan(90);
    setNewPartNumber("");
    setNewCost("");
    setNewReorderLink("");
    setNewAutoReplenish(false);
    setNewReplenishType("purchase");
    setShowAddForm(false);
  };

  // Delete consumable item
  const handleDeleteConsumable = (itemId: string, itemName: string) => {
    setConsumables(prev => prev.filter(c => c.id !== itemId));
    addToast(
      "Item Deregistered",
      `"${itemName}" was removed from the inventory matrix.`,
      "info"
    );
  };

  // Filter lists
  const filteredConsumables = consumables.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.partNumber && item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate high-level stats
  const lowStockCount = consumables.filter(c => c.status === "Low" || c.currentLevel <= 25).length;
  const goodStockCount = consumables.filter(c => c.status === "Good" && c.currentLevel > 25).length;
  const totalValue = consumables.reduce((sum, c) => sum + (c.cost || 0), 0).toFixed(2);

  // Categories list
  const categories = ["all", ...Array.from(new Set(consumables.map(c => c.category)))];

  return (
    <div id="consumable-inventory-screen" className="w-full h-full bg-[#0A0A0A] text-white flex flex-col relative">
      
      {/* Dynamic Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-[#101820]/40 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => onNavigateToScreen("screen-dashboard")}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-extrabold tracking-wider uppercase text-zinc-400">Inventory Matrix</h2>
            <h1 className="text-base font-extrabold text-white">Consumable Supply</h1>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-extrabold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-blue-500/10 hover:scale-[1.02]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Supply</span>
        </button>
      </div>

      {/* Main Content Body */}
      <div className="flex-grow overflow-y-auto px-5 py-4 pb-24 scrollbar-none space-y-5">
        
        {/* STATS ROW BENTO CARDS */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-[#101820] border border-slate-800 rounded-xl p-3 text-center relative overflow-hidden">
            <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase block tracking-wider">Alert Active</span>
            <span className={`text-lg font-black block mt-1 ${lowStockCount > 0 ? "text-amber-400 animate-pulse" : "text-zinc-400"}`}>
              {lowStockCount}
            </span>
            <span className="text-[8.5px] text-zinc-400 font-medium block mt-0.5">Low Supplies</span>
          </div>

          <div className="bg-[#101820] border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase block tracking-wider">Operational</span>
            <span className="text-lg font-black block text-emerald-400 mt-1">
              {goodStockCount}
            </span>
            <span className="text-[8.5px] text-zinc-400 font-medium block mt-0.5">Optimal items</span>
          </div>

          <div className="bg-[#101820] border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase block tracking-wider">Replenish Value</span>
            <span className="text-lg font-black block text-blue-400 mt-1">
              ${totalValue}
            </span>
            <span className="text-[8.5px] text-zinc-400 font-medium block mt-0.5">Cycle Budget</span>
          </div>
        </div>

        {/* TIME SIMULATOR CONTROLLER */}
        <div className="bg-[#0D151D] border border-blue-500/15 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full filter blur-xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Usage Time Warp Simulator</h3>
            </div>
            {decaySpeed > 0 && (
              <span className="text-[8px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/25 px-1.5 py-0.2 rounded uppercase animate-pulse">
                Simulating {decaySpeed}x Decay
              </span>
            )}
          </div>
          
          <p className="text-[10px] text-zinc-400 leading-relaxed mb-3">
            Accelerate the passage of time on equipment sensors to watch your filters and softeners decay dynamically and trigger order reminders!
          </p>

          <div className="flex items-center justify-between gap-2.5">
            <div className="grid grid-cols-4 gap-1.5 flex-grow">
              {[0, 2, 5, 10].map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    setDecaySpeed(speed);
                    if (speed > 0) {
                      addToast(
                        "Simulation Accelerated",
                        `Continuous system component wear rate is now running at ${speed}x speed.`,
                        "info"
                      );
                    } else {
                      addToast("Simulation Paused", "Consumables returned to normal time scaling.", "info");
                    }
                  }}
                  className={`text-[9.5px] font-mono font-extrabold py-1 px-2 rounded-lg border transition-all ${
                    decaySpeed === speed
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-[#0A0A0A] text-zinc-400 border-slate-800 hover:text-white"
                  }`}
                >
                  {speed === 0 ? "Pause ⏸" : `${speed}x ⚡`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ACTIVE REMINDERS ALERTS BANNER FOR LOW ITEMS */}
        {lowStockCount > 0 && (
          <div className="bg-gradient-to-r from-amber-950/40 to-yellow-950/10 border border-amber-500/20 rounded-2xl p-4 flex items-start space-x-3 animate-fade-in">
            <div className="p-2 bg-amber-500/15 text-amber-400 rounded-xl border border-amber-500/20 mt-0.5 flex-shrink-0">
              <AlertTriangle className="w-4.5 h-4.5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">Automated Ordering Reminder</h3>
              <p className="text-[10px] text-zinc-300 mt-1 leading-relaxed">
                We've auto-matched pre-vetted retail options for <span className="font-extrabold text-white">{lowStockCount} items</span> below 25% threshold to guarantee seamless airflow & water balance.
              </p>
            </div>
          </div>
        )}

        {/* DYNAMIC FORM: ADD NEW ITEM */}
        {showAddForm && (
          <form onSubmit={handleAddNewConsumable} className="bg-[#101820] border border-blue-500/20 rounded-2xl p-4 space-y-3.5 animate-fade-in relative">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] font-mono font-extrabold uppercase text-white tracking-wider">Enroll New Component</span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)} 
                className="text-xs text-zinc-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Component / Supply Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 20x25x1 MERV 11 Air Filter"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-slate-800 text-xs text-zinc-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    System Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-slate-800 text-xs text-zinc-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="HVAC">HVAC</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Safety">Safety</option>
                    <option value="Exterior">Exterior</option>
                    <option value="Electrical">Electrical</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Initial Level (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newLevel}
                    onChange={(e) => setNewLevel(Math.min(100, Number(e.target.value)))}
                    className="w-full bg-[#0A0A0A] border border-slate-800 text-xs text-zinc-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Useful Lifespan (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newLifespan}
                    onChange={(e) => setNewLifespan(Number(e.target.value))}
                    className="w-full bg-[#0A0A0A] border border-slate-800 text-xs text-zinc-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Unit Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="24.99"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-slate-800 text-xs text-zinc-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    SKU / Part Number
                  </label>
                  <input
                    type="text"
                    placeholder="M11-2025-X"
                    value={newPartNumber}
                    onChange={(e) => setNewPartNumber(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-slate-800 text-xs text-zinc-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Custom Amazon / Depot URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://amazon.com/..."
                    value={newReorderLink}
                    onChange={(e) => setNewReorderLink(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-slate-800 text-xs text-zinc-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Auto-Replenish Switcher */}
              <div className="bg-[#0A0A0A] border border-slate-800/80 rounded-xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-3.5 h-3.5 text-blue-400" />
                    <div>
                      <span className="text-[10px] font-extrabold text-white block">Auto-Replenish Trigger</span>
                      <span className="text-[8.5px] text-zinc-500 block">Dispatch service or order part at 25% level</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewAutoReplenish(!newAutoReplenish)}
                    className="focus:outline-none transition-colors"
                  >
                    {newAutoReplenish ? (
                      <ToggleRight className="w-9 h-9 text-blue-500 cursor-pointer" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-zinc-600 cursor-pointer" />
                    )}
                  </button>
                </div>

                {newAutoReplenish && (
                  <div className="pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-2 animate-fade-in">
                    <button
                      type="button"
                      onClick={() => setNewReplenishType("purchase")}
                      className={`text-[9.5px] font-bold py-1.5 px-2 rounded-lg border transition-all flex items-center justify-center gap-1 ${
                        newReplenishType === "purchase"
                          ? "bg-blue-600/10 text-blue-400 border-blue-500/30"
                          : "bg-transparent text-zinc-500 border-slate-800 hover:text-zinc-300"
                      }`}
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Draft Purchase Order</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewReplenishType("appointment")}
                      className={`text-[9.5px] font-bold py-1.5 px-2 rounded-lg border transition-all flex items-center justify-center gap-1 ${
                        newReplenishType === "appointment"
                          ? "bg-blue-600/10 text-blue-400 border-blue-500/30"
                          : "bg-transparent text-zinc-500 border-slate-800 hover:text-zinc-300"
                      }`}
                    >
                      <Wrench className="w-3 h-3" />
                      <span>Book Service Appointment</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs py-2.5 rounded-lg transition-all shadow-md shadow-blue-500/10"
            >
              Enforce Smart Tracking ✓
            </button>
          </form>
        )}

        {/* SEARCH AND FILTERS */}
        <div className="bg-[#101820] border border-slate-800 rounded-2xl p-4 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search component inventory or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-slate-700 font-medium"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
            <div className="flex items-center text-zinc-500 flex-shrink-0 text-[10px] uppercase font-mono tracking-wider space-x-1 pr-1.5 border-r border-slate-800">
              <Filter className="w-3 h-3" />
              <span>Filter:</span>
            </div>

            <div className="flex items-center space-x-1.5 flex-nowrap">
              {/* Category Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#0A0A0A] border border-slate-800 text-[10px] text-zinc-300 font-medium rounded-lg py-1 px-1.5 focus:outline-none focus:border-slate-700 cursor-pointer"
              >
                <option value="all">Category (All)</option>
                <option value="HVAC">HVAC</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Safety">Safety</option>
              </select>

              {/* Status Select */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-[#0A0A0A] border border-slate-800 text-[10px] text-zinc-300 font-medium rounded-lg py-1 px-1.5 focus:outline-none focus:border-slate-700 cursor-pointer"
              >
                <option value="all">Status (All)</option>
                <option value="Good">Good</option>
                <option value="Low">Low</option>
                <option value="Empty">Empty</option>
              </select>
            </div>
          </div>
        </div>

        {/* INVENTORY LIST */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
              Enrolled Supply Index ({filteredConsumables.length})
            </span>
            {searchTerm || selectedCategory !== "all" || selectedStatus !== "all" ? (
              <button 
                onClick={() => { setSearchTerm(""); setSelectedCategory("all"); setSelectedStatus("all"); }}
                className="text-[9.5px] font-mono text-blue-400 hover:text-white"
              >
                Clear Filters
              </button>
            ) : null}
          </div>

          {filteredConsumables.length === 0 ? (
            <div className="bg-[#101820] border border-slate-800 rounded-2xl p-6 text-center">
              <p className="text-xs text-zinc-500">No consumable parts match your search filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredConsumables.map((item) => {
                const isCritical = item.currentLevel <= 25;
                return (
                  <div 
                    key={item.id}
                    id={`consumable-item-${item.id}`}
                    className={`bg-[#101820] border rounded-2xl p-4 transition-colors relative overflow-hidden ${
                      isCritical ? "border-amber-500/25 hover:border-amber-500/40" : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {/* Status Top Line Indicator */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500/50 to-indigo-600/30"></div>
                    {isCritical && (
                      <div className="absolute right-0 top-0 w-16 h-16 bg-amber-500/5 rounded-full filter blur-md pointer-events-none"></div>
                    )}

                    {/* Metadata Header */}
                    <div className="flex items-start justify-between mb-3.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[8px] font-mono font-bold bg-[#0A0A0A] text-zinc-400 border border-slate-800 px-1.5 py-0.2 rounded uppercase">
                            {item.category}
                          </span>
                          {item.partNumber && (
                            <span className="text-[8.5px] font-mono text-zinc-500">
                              SKU: {item.partNumber}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs font-extrabold text-white mt-1 leading-snug truncate">
                          {item.name}
                        </h3>
                      </div>

                      {/* Action buttons */}
                      <button
                        onClick={() => handleDeleteConsumable(item.id, item.name)}
                        className="text-zinc-600 hover:text-red-400 p-1 rounded hover:bg-slate-800 transition-all flex-shrink-0"
                        title="Remove tracking registry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Gauge meter display */}
                    <div className="space-y-2 mb-3.5">
                      <div className="flex justify-between items-center text-[10px] font-mono font-medium">
                        <span className="text-zinc-500 uppercase">Operating Level</span>
                        <span className={`font-black ${isCritical ? "text-amber-400" : "text-emerald-400"}`}>
                          {item.currentLevel}%
                        </span>
                      </div>
                      
                      {/* Meter bar */}
                      <div className="w-full h-2 bg-[#0A0A0A] rounded-full overflow-hidden border border-slate-900">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCritical ? "bg-gradient-to-r from-amber-500 to-yellow-400" : "bg-gradient-to-r from-emerald-500 to-teal-400"
                          }`}
                          style={{ width: `${item.currentLevel}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                        <span className="flex items-center gap-1">
                          <CalendarRange className="w-3.5 h-3.5 text-zinc-500" />
                          Installed: {item.installDate}
                        </span>
                        
                        <span className="flex items-center gap-1 font-bold text-zinc-300">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          ~{item.daysRemaining} days remaining
                        </span>
                      </div>
                    </div>

                    {/* Auto Replenish Configuration */}
                    <div className="bg-[#0A0A0A] border border-slate-900/60 rounded-xl p-2.5 my-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <Settings className="w-3.5 h-3.5 text-zinc-500" />
                          <span className="text-[10px] font-extrabold text-zinc-300">Auto-Replenish Switch</span>
                        </div>
                        <button
                          onClick={() => {
                            setConsumables(prev => prev.map(c => {
                              if (c.id === item.id) {
                                const nextVal = !c.autoReplenish;
                                return {
                                  ...c,
                                  autoReplenish: nextVal,
                                  replenishType: c.replenishType || "purchase"
                                };
                              }
                              return c;
                            }));
                            addToast(
                              `Auto-Replenish ${!item.autoReplenish ? 'Enabled' : 'Disabled'}`,
                              `Autonomous dispatch toggled for "${item.name}".`,
                              "info"
                            );
                          }}
                          className="focus:outline-none"
                        >
                          {item.autoReplenish ? (
                            <ToggleRight className="w-7 h-7 text-blue-500 cursor-pointer" />
                          ) : (
                            <ToggleLeft className="w-7 h-7 text-zinc-700 cursor-pointer" />
                          )}
                        </button>
                      </div>

                      {item.autoReplenish && (
                        <div className="pt-2 border-t border-slate-900/60 flex items-center justify-between text-[9px] text-zinc-400">
                          <span>Dispatch Strategy:</span>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => {
                                setConsumables(prev => prev.map(c => 
                                  c.id === item.id ? { ...c, replenishType: "purchase" } : c
                                ));
                              }}
                              className={`px-2 py-1 rounded border transition-all flex items-center gap-1 font-bold ${
                                item.replenishType === "purchase"
                                  ? "bg-blue-600/10 border-blue-500/30 text-blue-400"
                                  : "bg-transparent border-slate-800 text-zinc-500 hover:text-zinc-300"
                              }`}
                            >
                              <ShoppingBag className="w-2.5 h-2.5" />
                              <span>Order Part</span>
                            </button>
                            <button
                              onClick={() => {
                                setConsumables(prev => prev.map(c => 
                                  c.id === item.id ? { ...c, replenishType: "appointment" } : c
                                ));
                              }}
                              className={`px-2 py-1 rounded border transition-all flex items-center gap-1 font-bold ${
                                item.replenishType === "appointment"
                                  ? "bg-blue-600/10 border-blue-500/30 text-blue-400"
                                  : "bg-transparent border-slate-800 text-zinc-500 hover:text-zinc-300"
                              }`}
                            >
                              <Wrench className="w-2.5 h-2.5" />
                              <span>Dispatch Pro</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Display Status of active auto replens */}
                      {item.autoReplenish && item.replenishTriggered && item.currentLevel <= 25 && (
                        <div className="bg-blue-950/15 border border-blue-500/20 rounded-lg p-2 flex items-center gap-1.5 text-[9px] text-blue-400 font-bold animate-pulse">
                          {item.replenishType === "appointment" ? (
                            <>
                              <Wrench className="w-3.5 h-3.5 text-blue-400" />
                              <span>Auto-Dispatch: Pro Service Requested 🔧</span>
                            </>
                          ) : (
                            <>
                              <Truck className="w-3.5 h-3.5 text-blue-400" />
                              <span>Auto-Dispatch: Purchase Order Drafted 🛒</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Panel */}
                    <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-slate-800/60 mt-2.5">
                      <div className="flex items-center space-x-1.5 text-[10.5px] font-bold text-zinc-300">
                        <DollarSign className="w-3.5 h-3.5 text-zinc-500" />
                        <span>${item.cost}</span>
                        <span className="text-[9px] text-zinc-500 font-mono font-normal">/ unit</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Quick Replace Trigger */}
                        <button
                          onClick={() => handleReplaceItem(item.id)}
                          className="bg-[#0A0A0A] hover:bg-slate-900 border border-slate-800 text-zinc-300 hover:text-white font-extrabold text-[10px] py-1.5 px-2.5 rounded-lg flex items-center space-x-1 transition-colors"
                          title="Simulate replacing the part with a new one"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Simulate Fresh Install</span>
                        </button>

                        {/* Reorder Button */}
                        <button
                          onClick={() => setOrderingItem(item)}
                          className={`font-black text-[10px] py-1.5 px-3 rounded-lg flex items-center space-x-1 transition-all ${
                            isCritical 
                              ? "bg-amber-500 hover:bg-amber-400 text-[#101820]" 
                              : "bg-blue-600 hover:bg-blue-500 text-white"
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Insta-Order</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AUTONOMOUS REPLENISHMENT LEDGER (SERVICE & ORDERS HISTORY) */}
        <div className="bg-[#101820] border border-slate-800 rounded-2xl p-4 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Autonomous Supply Hub</h3>
            </div>
            <span className="text-[9.5px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-bold">
              {purchaseRequests.length} Orders Active
            </span>
          </div>

          <p className="text-[10px] text-zinc-400 leading-relaxed">
            Track and manage purchase orders automatically compiled by HomePulse when supplies cross critical 25% levels.
          </p>

          <div className="space-y-2.5">
            {purchaseRequests.map((req) => (
              <div 
                key={req.id} 
                className="bg-[#0A0A0A] border border-slate-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold text-white">{req.itemName}</span>
                    <span className="text-[8.5px] font-mono text-zinc-500">SKU: {req.partNumber}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[9px] text-zinc-400 font-mono">
                    <span>Draft Date: {req.date}</span>
                    <span>Cost: ${req.cost}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2">
                  <span className={`text-[8.5px] font-mono font-bold px-2 py-0.5 rounded border ${
                    req.status === "Pending Approval" 
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}>
                    {req.status}
                  </span>

                  {req.status === "Pending Approval" && (
                    <button
                      type="button"
                      onClick={() => {
                        // 1. Mark purchase request as Ordered
                        setPurchaseRequests(prev => prev.map(p => p.id === req.id ? { ...p, status: "Ordered" } : p));
                        // 2. Refill level back to 100% in consumables!
                        setConsumables(prev => prev.map(c => {
                          if (c.name === req.itemName) {
                            return {
                              ...c,
                              currentLevel: 100,
                              status: "Good",
                              daysRemaining: c.lifespanDays,
                              installDate: new Date().toISOString().split("T")[0],
                              alertActive: false,
                              replenishTriggered: false
                            };
                          }
                          return c;
                        }));
                        addToast(
                          "Purchase Order Dispatched",
                          `Autonomous dispatch approved for "${req.itemName}". Level reset to 100%.`,
                          "success"
                        );
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[9px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span>Approve Order</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {purchaseRequests.length === 0 && (
              <div className="text-center py-4 text-[10px] text-zinc-500 border border-dashed border-slate-800 rounded-xl">
                No autonomous purchase requests currently drafted.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* DYNAMIC CONFIRM ORDER DISPATCH SIMULATED MODAL */}
      {orderingItem && (
        <div className="fixed inset-0 bg-[#000000]/90 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-md">
          <div className="bg-[#121A21] border border-blue-500/25 rounded-2xl p-5 max-w-sm w-full shadow-2xl relative">
            <div className="flex items-center space-x-2.5 mb-4 pb-2 border-b border-slate-800">
              <div className="p-1.5 bg-blue-500/15 text-blue-400 rounded-lg">
                <ShoppingBag className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Confirm Replacement Order</h4>
                <p className="text-[9.5px] text-zinc-500">Autonomous supply chain dispatcher</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="bg-[#0A0A0A] p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-[11px] font-bold text-white">{orderingItem.name}</h5>
                    <p className="text-[9px] text-zinc-400 mt-0.5">Part: {orderingItem.partNumber || "GEN-PT"}</p>
                  </div>
                  <span className="text-[11px] font-extrabold text-blue-400 font-mono">${orderingItem.cost}</span>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Shipping Option
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div 
                    onClick={() => setShippingMethod("standard")}
                    className={`p-2.5 rounded-lg border text-center cursor-pointer transition-colors ${
                      shippingMethod === "standard" 
                        ? "bg-blue-500/10 border-blue-500 text-white" 
                        : "bg-[#0A0A0A] border-slate-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <p className="text-[10px] font-bold">Drone Delivery</p>
                    <p className="text-[8px] text-zinc-500 mt-0.5">Free • 2-3 Days</p>
                  </div>
                  <div 
                    onClick={() => setShippingMethod("express")}
                    className={`p-2.5 rounded-lg border text-center cursor-pointer transition-colors ${
                      shippingMethod === "express" 
                        ? "bg-blue-500/10 border-blue-500 text-white" 
                        : "bg-[#0A0A0A] border-slate-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <p className="text-[10px] font-bold">Priority Same-Day</p>
                    <p className="text-[8px] text-zinc-500 mt-0.5">+$4.99 • Within 4 hrs</p>
                  </div>
                </div>
              </div>

              <div className="text-[9.5px] text-zinc-400 bg-blue-500/5 p-2 rounded border border-blue-500/10">
                💡 <span className="font-extrabold text-zinc-300">Smart Automation Note:</span> Confirming this order will simulate payment settlement and trigger auto-delivery, fully restoring inventory life.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-5">
              <button
                onClick={() => setOrderingItem(null)}
                disabled={isOrdering}
                className="bg-slate-800 hover:bg-slate-700 text-zinc-300 font-bold text-[10.5px] py-2 rounded-lg transition-colors border border-slate-700 disabled:opacity-50"
              >
                Close
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={isOrdering}
                className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10.5px] py-2 rounded-lg transition-colors flex items-center justify-center space-x-1 shadow-lg shadow-blue-500/15 disabled:opacity-50"
              >
                {isOrdering ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Placing...</span>
                  </>
                ) : (
                  <span>Place Order</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
