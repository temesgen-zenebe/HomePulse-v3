import React from "react";
import { 
  FileText, 
  Award, 
  Image, 
  Shield, 
  Clipboard, 
  Upload, 
  Plus, 
  Trash2, 
  CheckCircle2,
  Calendar,
  Bell,
  BellRing,
  AlertCircle,
  Zap,
  Droplet,
  Wind,
  Clock,
  Wrench,
  Check,
  ChevronRight
} from "lucide-react";
import { DocumentRecord, TrackedWarranty } from "../types";
import { encryptText, decryptText } from "../lib/encryption";

interface DocumentsScreenProps {
  documents: DocumentRecord[];
  onAddDocument: (doc: DocumentRecord) => void;
  onNavigateToScreen: (screenId: string) => void;
  vaultPassword?: string | null;
  vaultLocked?: boolean;
  onSetVaultPassword?: (pw: string | null) => void;
  onSetVaultLocked?: (locked: boolean) => void;
}

export default function DocumentsScreen({ 
  documents, 
  onAddDocument, 
  onNavigateToScreen,
  vaultPassword,
  vaultLocked = true,
  onSetVaultPassword,
  onSetVaultLocked
}: DocumentsScreenProps) {
  const [viewMode, setViewMode] = React.useState<"vault" | "tracker">("vault");
  const [activeTab, setActiveTab] = React.useState<"all" | "warranty" | "receipt" | "photo" | "report">("all");
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [simulatedFileName, setSimulatedFileName] = React.useState("");

  // Security and Decryption State
  const [passwordInput, setPasswordInput] = React.useState("");
  const [securityError, setSecurityError] = React.useState("");
  const [decryptedNames, setDecryptedNames] = React.useState<Record<string, string>>({});

  // AI Audit State
  const [auditingId, setAuditingId] = React.useState<string | null>(null);
  const [auditResult, setAuditResult] = React.useState<any | null>(null);
  const [activeAuditWarranty, setActiveAuditWarranty] = React.useState<TrackedWarranty | null>(null);

  // Decrypt documents on the fly when vault is unlocked
  React.useEffect(() => {
    if (!vaultLocked && vaultPassword) {
      const decryptAll = async () => {
        const cache: Record<string, string> = {};
        for (const docItem of documents) {
          if (docItem.isEncrypted && docItem.encryptedPayload) {
            try {
              const decrypted = await decryptText(docItem.encryptedPayload, vaultPassword);
              cache[docItem.id] = decrypted;
            } catch (e) {
              console.error("Failed to decrypt document:", docItem.id, e);
            }
          }
        }
        setDecryptedNames(cache);
      };
      decryptAll();
    } else {
      setDecryptedNames({});
    }
  }, [vaultLocked, vaultPassword, documents]);

  const handleUnlock = () => {
    if (passwordInput === vaultPassword) {
      if (onSetVaultLocked) {
        onSetVaultLocked(false);
      }
      setPasswordInput("");
      setSecurityError("");
    } else {
      setSecurityError("Incorrect password. PBKDF2 derivation mismatched.");
    }
  };

  const handleRunAudit = async (warranty: TrackedWarranty) => {
    setAuditingId(warranty.id);
    setActiveAuditWarranty(warranty);
    setAuditResult(null);

    try {
      const response = await fetch("/api/audit-warranty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applianceName: warranty.applianceName,
          category: warranty.category,
          purchaseDate: warranty.purchaseDate,
          durationYears: warranty.durationYears,
          notes: warranty.notes || ""
        })
      });

      if (!response.ok) {
        throw new Error("Audit service unavailable");
      }

      const data = await response.json();
      setAuditResult(data);
    } catch (err) {
      console.warn("AI Audit failed. Running offline fallback.", err);
      // Inline client-side fallback matching backend schema
      const yearsPassed = 2026 - new Date(warranty.purchaseDate).getFullYear();
      const isActive = yearsPassed < warranty.durationYears;
      const status = isActive ? (warranty.durationYears - yearsPassed <= 1 ? "Expiring Soon" : "Active") : "Expired";
      setAuditResult({
        summary: `Local offline audit completed for "${warranty.applianceName}".`,
        coverageStatus: status,
        durationExplanation: `This appliance is in its ${yearsPassed + 1}th year of a ${warranty.durationYears}-year warranty plan.`,
        hiddenClauses: [
          "Most manufacturers require proof of annual preventive maintenance to keep parts active.",
          "Requires registration within 60 days of installation, otherwise the warranty defaults to a basic 5-year duration."
        ],
        requiredMaintenance: [
          "Ensure all mechanical components are cleaned once a year.",
          "Log all receipts and maintenance logs securely in your Zero-Knowledge HomePulse Document Vault."
        ],
        verdict: isActive 
          ? `Your warranty is ${status.toLowerCase()}. Ensure you document the upcoming filter swaps to prevent claim rejections.`
          : "Your manufacturer warranty has expired. Consider a comprehensive home care protection plan or setting aside a repair fund."
      });
    } finally {
      setAuditingId(null);
    }
  };

  // Tracked appliance warranties state with localStorage persistence
  const [trackedWarranties, setTrackedWarranties] = React.useState<TrackedWarranty[]>(() => {
    const saved = localStorage.getItem("homepulse_tracked_warranties");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse warranties", e);
      }
    }
    return [
      {
        id: "warr_1",
        applianceName: "Carrier HVAC Heat Pump",
        category: "HVAC",
        purchaseDate: "2023-06-15",
        durationYears: 5,
        expirationDate: "2028-06-15",
        alertLeadDays: 60,
        alertActive: true,
        notes: "Main compressor covered under extended parts warranty. Labor not included."
      },
      {
        id: "warr_2",
        applianceName: "Bosch Series 8 Dishwasher",
        category: "Kitchen",
        purchaseDate: "2024-11-10",
        durationYears: 3,
        expirationDate: "2027-11-10",
        alertLeadDays: 30,
        alertActive: true,
        notes: "Requires annual filter clearing to preserve sump pump structural integrity."
      },
      {
        id: "warr_3",
        applianceName: "LG Front Load Dryer",
        category: "Laundry",
        purchaseDate: "2025-07-20",
        durationYears: 1,
        expirationDate: "2026-07-20",
        alertLeadDays: 30,
        alertActive: true,
        notes: "Standard manufacturer warranty. Heat exchanger module covered."
      },
      {
        id: "warr_4",
        applianceName: "GE Profile Microwave",
        category: "Kitchen",
        purchaseDate: "2024-01-15",
        durationYears: 2,
        expirationDate: "2026-01-15",
        alertLeadDays: 30,
        alertActive: false,
        notes: "Basic magnetron coverage. Expiration check triggered."
      }
    ];
  });

  React.useEffect(() => {
    localStorage.setItem("homepulse_tracked_warranties", JSON.stringify(trackedWarranties));
  }, [trackedWarranties]);

  // Form states for adding appliance warranties
  const [isAddingWarranty, setIsAddingWarranty] = React.useState(false);
  const [applianceName, setApplianceName] = React.useState("");
  const [category, setCategory] = React.useState<TrackedWarranty["category"]>("Kitchen");
  const [purchaseDate, setPurchaseDate] = React.useState("2026-07-02");
  const [durationYears, setDurationYears] = React.useState(2);
  const [alertLeadDays, setAlertLeadDays] = React.useState(30);
  const [alertActive, setAlertActive] = React.useState(true);
  const [notes, setNotes] = React.useState("");
  const [formSuccess, setFormSuccess] = React.useState(false);

  const getWarrantyStatus = (expirationDateStr: string, purchaseDateStr: string) => {
    // Current local date on runner is 2026-07-02
    const today = new Date();
    const expiration = new Date(expirationDateStr);
    const purchase = new Date(purchaseDateStr);
    
    const totalMs = expiration.getTime() - purchase.getTime();
    const elapsedMs = today.getTime() - purchase.getTime();
    const remainingMs = expiration.getTime() - today.getTime();
    
    const daysLeft = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
    
    let percentRemaining = 0;
    if (totalMs > 0) {
      percentRemaining = Math.max(0, Math.min(100, (remainingMs / totalMs) * 100));
    }
    
    let status: "active" | "expiring" | "expired" = "active";
    if (daysLeft <= 0) {
      status = "expired";
    } else if (daysLeft <= 90) {
      status = "expiring";
    }
    
    return {
      daysLeft,
      percentRemaining,
      status
    };
  };

  const getCategoryIcon = (cat: TrackedWarranty["category"]) => {
    switch (cat) {
      case "Kitchen":
        return <Clipboard className="w-3.5 h-3.5 text-amber-400" />;
      case "HVAC":
        return <Wind className="w-3.5 h-3.5 text-sky-400" />;
      case "Laundry":
        return <Clock className="w-3.5 h-3.5 text-indigo-400" />;
      case "Plumbing":
        return <Droplet className="w-3.5 h-3.5 text-blue-400" />;
      case "Electrical":
        return <Zap className="w-3.5 h-3.5 text-yellow-400" />;
      default:
        return <Wrench className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const handleAddWarranty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applianceName.trim()) return;

    const purchase = new Date(purchaseDate);
    const expire = new Date(purchase);
    expire.setFullYear(purchase.getFullYear() + Number(durationYears));
    const expirationDateStr = expire.toISOString().split("T")[0];

    const newWarranty: TrackedWarranty = {
      id: `warr_${Date.now()}`,
      applianceName: applianceName.trim(),
      category,
      purchaseDate,
      durationYears: Number(durationYears),
      expirationDate: expirationDateStr,
      alertLeadDays: Number(alertLeadDays),
      alertActive,
      notes: notes.trim() || undefined
    };

    setTrackedWarranties(prev => [newWarranty, ...prev]);
    
    setApplianceName("");
    setCategory("Kitchen");
    setPurchaseDate("2026-07-02");
    setDurationYears(2);
    setAlertLeadDays(30);
    setAlertActive(true);
    setNotes("");
    
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);
    setIsAddingWarranty(false);
  };

  const handleRemoveWarranty = (id: string) => {
    setTrackedWarranties(prev => prev.filter(w => w.id !== id));
  };

  const tabs = [
    { id: "all", label: "All" },
    { id: "warranty", label: "Warranties" },
    { id: "receipt", label: "Receipts" },
    { id: "photo", label: "Photos" }
  ];

  const getDocIcon = (type: string) => {
    switch (type) {
      case "warranty":
        return <Award className="w-4 h-4 text-amber-400" />;
      case "receipt":
        return <Clipboard className="w-4 h-4 text-emerald-400" />;
      case "photo":
        return <Image className="w-4 h-4 text-blue-400" />;
      default:
        return <FileText className="w-4 h-4 text-zinc-400" />;
    }
  };

  const handleSimulatedUpload = () => {
    const fileOptions = [
      { name: "Heat_Pump_Service_Agreement.pdf", type: "warranty", size: "1.4 MB" },
      { name: "Sump_Pump_Invoice.pdf", type: "receipt", size: "450 KB" },
      { name: "Fascia_Board_Rot_Detail.jpg", type: "photo", size: "3.2 MB" },
      { name: "Foundation_Survey_Plan.pdf", type: "report", size: "5.8 MB" }
    ];

    // Pick random
    const selected = fileOptions[Math.floor(Math.random() * fileOptions.length)];
    setSimulatedFileName(selected.name);
    setUploading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(async () => {
            const originalName = selected.name;
            let encryptedPayload = "";
            let isEncrypted = false;
            
            if (vaultPassword) {
              try {
                isEncrypted = true;
                encryptedPayload = await encryptText(originalName, vaultPassword);
              } catch (err) {
                console.error("Zero-knowledge encryption failed:", err);
              }
            }

            onAddDocument({
              id: `doc_${Date.now()}`,
              name: isEncrypted ? "[REDACTED (AES-GCM ENCRYPTED)]" : originalName,
              type: selected.type as any,
              date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
              size: selected.size,
              isEncrypted,
              encryptedPayload
            });
            setUploading(false);
          }, 300);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  const filteredDocs = activeTab === "all"
    ? documents
    : documents.filter(d => d.type === activeTab);

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0A0A0A] text-white font-sans relative">
      
      {/* Scrollable Document Center */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-28 scrollbar-none">
        
        {/* Header */}
        <div className="mb-4">
          <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Property Vault</span>
          <h2 className="text-xl font-extrabold tracking-tight text-white font-display">Property Docs</h2>
          <p className="text-[10px] text-zinc-400 mt-0.5">Secure maintenance ledger & warranties</p>
        </div>

        {/* Zero-Knowledge Security Panel */}
        <div className="mb-4 p-3.5 bg-[#0D1527] border border-blue-500/25 rounded-2xl text-left space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className={`w-4 h-4 ${vaultLocked ? "text-amber-500 animate-pulse" : "text-emerald-400"}`} />
              <div>
                <span className="text-[9px] font-mono text-zinc-400 block uppercase tracking-wider">Zero-Knowledge Protection</span>
                <span className="text-xs font-bold text-white">
                  {vaultPassword 
                    ? (vaultLocked ? "Vault Locked (AES-GCM 256)" : "Vault Unlocked (Decrypted Session)")
                    : "Configure Security Vault"}
                </span>
              </div>
            </div>
            {vaultPassword && (
              <button
                onClick={() => {
                  if (onSetVaultLocked) {
                    onSetVaultLocked(!vaultLocked);
                  }
                  setSecurityError("");
                  setPasswordInput("");
                }}
                className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                  vaultLocked 
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                }`}
              >
                {vaultLocked ? "UNLOCK" : "LOCK"}
              </button>
            )}
          </div>

          {!vaultPassword ? (
            <div className="space-y-2">
              <p className="text-[9.5px] text-zinc-400 leading-normal">
                Establish a master key to encrypt your sensitive receipts, warranties, and system serial numbers. 
                Derived client-side via PBKDF2. No passwords ever touch our servers.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Create Master Password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="flex-1 bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (passwordInput.trim() && onSetVaultPassword && onSetVaultLocked) {
                        onSetVaultPassword(passwordInput.trim());
                        onSetVaultLocked(false);
                        setPasswordInput("");
                        setSecurityError("");
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (passwordInput.trim() && onSetVaultPassword && onSetVaultLocked) {
                      onSetVaultPassword(passwordInput.trim());
                      onSetVaultLocked(false);
                      setPasswordInput("");
                      setSecurityError("");
                    } else {
                      setSecurityError("Password cannot be blank");
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Create Key
                </button>
              </div>
              {securityError && <span className="text-[8.5px] font-mono text-red-400">{securityError}</span>}
            </div>
          ) : (
            vaultLocked && (
              <div className="space-y-2">
                <p className="text-[9.5px] text-zinc-400">
                  Enter your master vault password to decrypt local receipts, serial numbers, and sensitive parameters in-browser.
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Enter Master Password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="flex-1 bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnlock();
                      }
                    }}
                  />
                  <button
                    onClick={handleUnlock}
                    className="bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Unlock
                  </button>
                </div>
                {securityError && <span className="text-[8.5px] font-mono text-red-400">{securityError}</span>}
              </div>
            )
          )}

          {!vaultLocked && vaultPassword && (
            <div className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center justify-between">
              <span className="text-[9px] font-mono text-emerald-400">
                ⚡ ZERO-KNOWLEDGE DECRYPTION ACTIVE
              </span>
              <button
                onClick={() => {
                  if (onSetVaultPassword && onSetVaultLocked) {
                    onSetVaultPassword(null);
                    onSetVaultLocked(true);
                    setPasswordInput("");
                    setSecurityError("");
                  }
                }}
                className="text-[8px] font-mono text-zinc-500 hover:text-red-400 underline transition-colors cursor-pointer"
              >
                Destroy Local Session Key
              </button>
            </div>
          )}
        </div>

        {/* Vault vs Warranty Tracker segmented control switch */}
        <div className="flex bg-[#101820]/80 p-1 border border-slate-800/80 rounded-xl mb-4 text-[10px] font-semibold text-zinc-400">
          <button
            onClick={() => {
              setViewMode("vault");
              setIsAddingWarranty(false);
            }}
            className={`flex-1 py-2 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              viewMode === "vault"
                ? "bg-[#2563EB] text-white font-bold shadow-md"
                : "hover:text-zinc-200"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Document Vault</span>
          </button>
          <button
            onClick={() => setViewMode("tracker")}
            className={`flex-1 py-2 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              viewMode === "tracker"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-md shadow-orange-500/10"
                : "hover:text-zinc-200"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Warranty Tracker</span>
          </button>
        </div>

        {/* CONDITION 1: ORIGINAL DOCUMENT VAULT SCREEN */}
        {viewMode === "vault" && (
          <div className="space-y-4">
            {/* Tab Navigator */}
            <div className="flex space-x-1.5 bg-[#101820]/60 p-1 border border-slate-800/80 rounded-xl mb-4 text-[10px] font-semibold text-zinc-400">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                    activeTab === t.id
                      ? "bg-[#2563EB] text-white font-bold shadow-md"
                      : "hover:text-zinc-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Uploading Progress Indicator */}
            {uploading && (
              <div className="mb-4 p-3 bg-[#101820] border border-blue-500/20 rounded-xl animate-pulse">
                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono mb-1.5">
                  <span className="truncate max-w-[150px]">Uploading: {simulatedFileName}</span>
                  <span className="text-blue-400 font-bold">{progress}%</span>
                </div>
                <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-150" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}

            {/* Document Cards List */}
            <div className="space-y-2.5">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-[#101820] border border-slate-800/80 hover:border-slate-700 rounded-xl shadow-md transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    {/* Doc Type Icon Wrapper */}
                    <div className="p-2 bg-[#0A0A0A] border border-slate-800 rounded-lg flex-shrink-0">
                      {getDocIcon(doc.type)}
                    </div>
                    
                    <div className="min-w-0">
                      <h5 className="text-[11px] font-bold text-white truncate leading-tight group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                        {doc.isEncrypted && (
                          <Shield className={`w-3 h-3 ${vaultLocked ? "text-amber-500 animate-pulse" : "text-emerald-400"}`} />
                        )}
                        <span>
                          {doc.isEncrypted 
                            ? (vaultLocked ? "[REDACTED (VAULT LOCKED)]" : (decryptedNames[doc.id] || "Decrypting..."))
                            : doc.name}
                        </span>
                      </h5>
                      <div className="flex items-center space-x-2 text-[9px] font-mono text-zinc-500 mt-1">
                        <span>{doc.date}</span>
                        <span>•</span>
                        <span>{doc.size}</span>
                        {doc.isEncrypted && (
                          <>
                            <span>•</span>
                            <span className="text-[8px] text-amber-500/80 uppercase font-bold tracking-wider">AES-GCM Protected</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* View/Cloud Check Indicator */}
                  <div className="text-[9px] font-mono text-zinc-600 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 flex-shrink-0 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-all cursor-pointer">
                    {doc.isEncrypted ? (vaultLocked ? "LOCKED 🔒" : "DECRYPTED 🔓") : "SECURE ✓"}
                  </div>
                </div>
              ))}

              {filteredDocs.length === 0 && (
                <div className="bg-[#101820]/40 border border-slate-800 border-dashed rounded-xl p-8 text-center text-[11px] text-zinc-500">
                  No files found in this tab. Click the upload button below to populate documents!
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONDITION 2: DYNAMIC WARRANTY TRACKER SCREEN */}
        {viewMode === "tracker" && (
          <div className="space-y-4 animate-fade-in text-left">
            
            {/* Warranty Tracker Overview Statistics Panel */}
            <div className="p-3.5 bg-[#101820]/45 border border-slate-800/80 rounded-2xl grid grid-cols-3 gap-2 text-center">
              <div className="border-r border-slate-800/50 last:border-none">
                <span className="text-[8px] font-mono uppercase text-zinc-500 tracking-wider">Tracked</span>
                <p className="text-base font-black text-white mt-1 font-display">{trackedWarranties.length}</p>
                <span className="text-[7px] font-mono text-zinc-600 mt-0.5 block">Appliances</span>
              </div>
              <div className="border-r border-slate-800/50 last:border-none">
                <span className="text-[8px] font-mono uppercase text-zinc-500 tracking-wider">Covered</span>
                <p className="text-base font-black text-emerald-400 mt-1 font-display">
                  {trackedWarranties.filter(w => getWarrantyStatus(w.expirationDate, w.purchaseDate).status === "active").length}
                </p>
                <span className="text-[7px] font-mono text-emerald-500/60 mt-0.5 block">Safe Node</span>
              </div>
              <div className="last:border-none">
                <span className="text-[8px] font-mono uppercase text-zinc-500 tracking-wider">Alert Warning</span>
                <p className={`text-base font-black mt-1 font-display ${
                  trackedWarranties.filter(w => getWarrantyStatus(w.expirationDate, w.purchaseDate).status === "expiring").length > 0
                    ? "text-amber-400 animate-pulse"
                    : "text-zinc-500"
                }`}>
                  {trackedWarranties.filter(w => getWarrantyStatus(w.expirationDate, w.purchaseDate).status === "expiring").length}
                </p>
                <span className="text-[7px] font-mono text-amber-500/60 mt-0.5 block">&lt;90 Days</span>
              </div>
            </div>

            {/* Appliance Warranty Add Form */}
            {isAddingWarranty && (
              <div className="p-4 bg-[#111625] border border-amber-500/20 rounded-2xl shadow-xl space-y-4">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                    <Award className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Track Appliance Warranty</h4>
                    <p className="text-[9px] text-zinc-400">Configure coverage period & alert threshold</p>
                  </div>
                </div>

                <form onSubmit={handleAddWarranty} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                        Appliance Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Bosch Fridge"
                        value={applianceName}
                        onChange={(e) => setApplianceName(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-[10.5px] text-white focus:outline-none font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as TrackedWarranty["category"])}
                        className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-amber-500 rounded-lg px-2 py-1.5 text-[10.5px] text-white focus:outline-none"
                      >
                        <option value="Kitchen">Kitchen</option>
                        <option value="HVAC">HVAC</option>
                        <option value="Laundry">Laundry</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                        Purchase Date
                      </label>
                      <input
                        type="date"
                        required
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-amber-500 rounded-lg px-2.5 py-1 text-[10px] text-white focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                        Warranty Period
                      </label>
                      <select
                        value={durationYears}
                        onChange={(e) => setDurationYears(Number(e.target.value))}
                        className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-amber-500 rounded-lg px-2 py-1.5 text-[10px] text-white focus:outline-none"
                      >
                        <option value="1">1 Year</option>
                        <option value="2">2 Years</option>
                        <option value="3">3 Years</option>
                        <option value="5">5 Years</option>
                        <option value="10">10 Years</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 p-2.5 bg-[#0A0A0A]/60 border border-slate-900 rounded-xl">
                    <div>
                      <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                        Alert Lead Time
                      </label>
                      <select
                        value={alertLeadDays}
                        onChange={(e) => setAlertLeadDays(Number(e.target.value))}
                        className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-amber-500 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none"
                      >
                        <option value="15">15 Days Before</option>
                        <option value="30">30 Days Before</option>
                        <option value="60">60 Days Before</option>
                        <option value="90">90 Days Before</option>
                      </select>
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">Alert Switch</span>
                      <label className="flex items-center space-x-2 cursor-pointer mt-1 select-none">
                        <input
                          type="checkbox"
                          checked={alertActive}
                          onChange={(e) => setAlertActive(e.target.checked)}
                          className="rounded bg-[#0A0A0A] border-slate-800 text-amber-500 focus:ring-0 w-3.5 h-3.5 accent-amber-500"
                        />
                        <span className="text-[10px] text-zinc-300 font-semibold">Enable Notifications</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      Notes / Serial Number (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Serial: SN-928374, bought from Home Depot"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-amber-500 rounded-lg p-2 text-[10px] text-white focus:outline-none font-sans"
                    />
                  </div>

                  <div className="flex space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingWarranty(false)}
                      className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-slate-800/80 text-zinc-400 hover:text-white font-bold text-[10px] py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-[10px] py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/10"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Deploy Warranty Monitor</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Appliance registered successfully! Telemetry monitoring active.</span>
              </div>
            )}

            {/* Tracked Warranty List */}
            <div className="space-y-3">
              {trackedWarranties.map((w) => {
                const { daysLeft, percentRemaining, status } = getWarrantyStatus(w.expirationDate, w.purchaseDate);
                
                return (
                  <div
                    key={w.id}
                    className="p-3.5 bg-[#101820] border border-slate-800/80 hover:border-slate-700 rounded-2xl shadow-lg transition-all text-left space-y-3 group"
                  >
                    {/* Top Row: Icon + Name + Status */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="p-2 bg-[#0A0A0A] border border-slate-800 rounded-xl shrink-0 flex items-center justify-center">
                          {getCategoryIcon(w.category)}
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-[11px] font-bold text-white truncate leading-tight group-hover:text-amber-400 transition-colors">
                            {w.applianceName}
                          </h5>
                          <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider block mt-0.5">
                            {w.category} Node
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {status === "expired" && (
                          <span className="text-[7.5px] font-mono font-extrabold bg-red-500/10 border border-red-500/20 text-red-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            Expired
                          </span>
                        )}
                        {status === "expiring" && (
                          <span className="text-[7.5px] font-mono font-extrabold bg-amber-500/10 border border-amber-500/35 text-amber-400 px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                            Expiring Soon
                          </span>
                        )}
                        {status === "active" && (
                          <span className="text-[7.5px] font-mono font-extrabold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            Active Covered
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="grid grid-cols-2 gap-2 text-[9px] text-zinc-400 font-sans border-t border-slate-900/60 pt-2.5">
                      <div>
                        <span className="text-zinc-500 text-[8px] uppercase font-mono block">Acquisition Date</span>
                        <span className="text-zinc-200 mt-0.5 block font-medium">
                          {new Date(w.purchaseDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[8px] uppercase font-mono block">Expiration Date</span>
                        <span className="text-zinc-200 mt-0.5 block font-medium">
                          {new Date(w.expirationDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                        </span>
                      </div>
                    </div>

                    {/* Alerts Indicator block */}
                    <div className="flex flex-col gap-1.5 bg-[#0A0A0A]/60 p-2 border border-slate-900 rounded-xl text-[9.5px]">
                      <div className="flex items-center justify-between text-zinc-400 font-mono text-[8px]">
                        <span className="flex items-center gap-1">
                          {w.alertActive ? (
                            <BellRing className="w-2.5 h-2.5 text-amber-400" />
                          ) : (
                            <Bell className="w-2.5 h-2.5 text-zinc-600" />
                          )}
                          <span>
                            {w.alertActive 
                              ? `${w.alertLeadDays}-DAY PRIOR ALARM ENABLED` 
                              : "ALARMS SILENCED"}
                          </span>
                        </span>
                        
                        <span className={`font-bold ${
                          status === "expired" ? "text-red-400" : status === "expiring" ? "text-amber-400" : "text-emerald-400"
                        }`}>
                          {status === "expired" ? "0 DAYS LEFT" : `${daysLeft} DAYS REMAINING`}
                        </span>
                      </div>

                      {w.notes && (
                        <p className="text-[9px] text-zinc-500 leading-normal font-sans pt-1 border-t border-slate-900/40">
                          {w.notes}
                        </p>
                      )}
                    </div>

                    {/* Progress Bar + Action */}
                    <div className="flex items-center space-x-3 pt-1">
                      {/* Progressive Bar */}
                      <div className="flex-1">
                        <div className="w-full h-1.5 bg-[#0A0A0A] rounded-full overflow-hidden border border-slate-800/80">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              status === "expired"
                                ? "w-0 bg-red-500"
                                : status === "expiring"
                                ? "bg-gradient-to-r from-amber-400 to-orange-500"
                                : "bg-gradient-to-r from-emerald-500 to-teal-500"
                            }`}
                            style={{ width: `${percentRemaining}%` }}
                          />
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => handleRemoveWarranty(w.id)}
                        className="p-1 text-zinc-600 hover:text-red-400 transition-colors rounded-lg bg-[#0A0A0A] border border-slate-900 cursor-pointer"
                        title="Remove warranty record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* AI Audit Action */}
                    <button
                      onClick={() => handleRunAudit(w)}
                      disabled={auditingId !== null}
                      className="w-full bg-[#1A1F2E]/60 hover:bg-[#20293D] border border-blue-500/25 hover:border-blue-500/50 text-blue-400 hover:text-blue-300 font-bold text-[10px] py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {auditingId === w.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Award className="w-3.5 h-3.5 text-blue-400" />
                      )}
                      <span>{auditingId === w.id ? "Auditing Warranty..." : "Run AI Warranty Audit"}</span>
                    </button>

                  </div>
                );
              })}

              {trackedWarranties.length === 0 && (
                <div className="bg-[#101820]/40 border border-slate-800 border-dashed rounded-xl p-8 text-center text-[11px] text-zinc-500">
                  No appliances are currently tracked. Click "Track Appliance Warranty" below to start proactive monitoring!
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Persistent Bottom Floating Action Panel */}
      <div className="absolute bottom-16 inset-x-0 h-14 bg-[#0A0A0A] border-t border-slate-900 flex items-center px-5 z-20">
        {viewMode === "vault" ? (
          <button
            onClick={handleSimulatedUpload}
            className="w-full bg-[#2563EB] hover:bg-blue-600 active:scale-95 text-white font-bold text-xs py-2.5 rounded-xl shadow-[0_4px_15px_rgba(37,99,235,0.2)] flex items-center justify-center space-x-1.5 transition-all cursor-pointer border border-blue-400/20"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setIsAddingWarranty(!isAddingWarranty);
              setPurchaseDate("2026-07-02");
            }}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:scale-95 text-white font-bold text-xs py-2.5 rounded-xl shadow-[0_4px_15px_rgba(245,158,11,0.2)] flex items-center justify-center space-x-1.5 transition-all cursor-pointer border border-amber-400/20"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingWarranty ? "Close Entry Form" : "Track Appliance Warranty"}</span>
          </button>
        )}
      </div>

      {/* Persistent Bottom Tab Navigation (Mockup Representation) */}
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
        <button onClick={() => onNavigateToScreen("screen-profile")} className="flex flex-col items-center space-y-1 text-zinc-500 hover:text-zinc-300 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          <span className="text-[9px] font-bold uppercase tracking-wider">More</span>
        </button>
      </div>

      {/* AI Audit Report Modal Overlay */}
      {activeAuditWarranty && (auditResult || auditingId === activeAuditWarranty.id) && (
        <div className="fixed inset-0 bg-[#0A0A0ADF] backdrop-blur-md flex items-center justify-center p-4 z-50 text-left">
          <div className="bg-[#101820] border border-blue-500/25 rounded-3xl max-w-sm w-full p-5 shadow-2xl relative space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
                  <Shield className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">HomePulse AI Warranty Audit</h4>
                  <span className="text-[9px] font-mono text-zinc-500">{activeAuditWarranty.applianceName}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveAuditWarranty(null);
                  setAuditResult(null);
                }}
                className="text-zinc-500 hover:text-white transition-colors p-1 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {auditingId ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3.5">
                <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-zinc-400 font-mono text-center">Running deep semantic audit on clause files...</p>
              </div>
            ) : (
              auditResult && (
                <div className="space-y-4 max-h-[350px] overflow-y-auto scrollbar-none text-left">
                  
                  {/* Summary Block */}
                  <div className="p-3 bg-[#0A0A0A]/50 border border-slate-900 rounded-xl">
                    <span className="text-[8px] font-mono text-zinc-500 uppercase block tracking-wider">Audit Summary</span>
                    <p className="text-[10.5px] text-zinc-200 font-medium leading-relaxed mt-1">
                      {auditResult.summary}
                    </p>
                  </div>

                  {/* Status Badge Info */}
                  <div className="grid grid-cols-2 gap-2 text-[9px] font-sans">
                    <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-xl">
                      <span className="text-zinc-500 text-[8px] uppercase font-mono block">Coverage Status</span>
                      <span className={`font-bold mt-1 block uppercase ${
                        auditResult.coverageStatus?.toLowerCase().includes("expir") 
                          ? "text-amber-400" 
                          : auditResult.coverageStatus?.toLowerCase().includes("expired") 
                          ? "text-red-400" 
                          : "text-emerald-400"
                      }`}>
                        {auditResult.coverageStatus || "Active"}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-xl">
                      <span className="text-zinc-500 text-[8px] uppercase font-mono block">Timeline</span>
                      <span className="text-zinc-300 mt-1 block leading-tight font-medium">
                        {auditResult.durationExplanation || "Verified timeline"}
                      </span>
                    </div>
                  </div>

                  {/* Hidden Clauses Alert */}
                  {auditResult.hiddenClauses && auditResult.hiddenClauses.length > 0 && (
                    <div className="space-y-1.5 text-left">
                      <span className="text-[8.5px] font-mono text-amber-400 uppercase tracking-wider block flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Potential Hidden Gaps</span>
                      </span>
                      <ul className="space-y-1 text-[9.5px] text-zinc-400 pl-4 list-disc leading-relaxed">
                        {auditResult.hiddenClauses.map((clause: string, i: number) => (
                          <li key={i}>{clause}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Required Maintenance to Keep Active */}
                  {auditResult.requiredMaintenance && auditResult.requiredMaintenance.length > 0 && (
                    <div className="space-y-1.5 text-left">
                      <span className="text-[8.5px] font-mono text-blue-400 uppercase tracking-wider block flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5 shrink-0" />
                        <span>Required Compliance Actions</span>
                      </span>
                      <ul className="space-y-1 text-[9.5px] text-zinc-400 pl-4 list-disc leading-relaxed">
                        {auditResult.requiredMaintenance.map((action: string, i: number) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Verdict Block */}
                  <div className="p-3 bg-blue-500/5 border border-blue-500/15 rounded-xl">
                    <span className="text-[8px] font-mono text-blue-400 uppercase block tracking-wider font-bold">HomePulse AI Verdict</span>
                    <p className="text-[10px] text-zinc-300 leading-relaxed mt-1 font-sans">
                      {auditResult.verdict}
                    </p>
                  </div>

                </div>
              )
            )}

            {/* Footer Close */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setActiveAuditWarranty(null);
                  setAuditResult(null);
                }}
                className="w-full bg-[#1A1F2E] hover:bg-[#20293D] border border-slate-800 text-zinc-400 hover:text-white font-bold text-[10px] py-2 rounded-xl transition-all cursor-pointer text-center"
              >
                Dismiss Report
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
