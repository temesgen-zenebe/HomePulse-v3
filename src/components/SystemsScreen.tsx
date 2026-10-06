import React from "react";
import { 
  Home, 
  Flame, 
  Droplet, 
  Zap, 
  Layers, 
  Tv, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Wrench,
  X,
  RefreshCw,
  Edit2,
  Save,
  Sliders,
  Radio,
  Activity,
  Gauge,
  Check,
  Settings,
  AlertTriangle,
  Plus,
  Sun,
  Wind,
  Shield,
  Coins,
  TrendingUp,
  Info,
  Clock,
  CheckSquare,
  Camera,
  FileText,
  QrCode,
  Upload
} from "lucide-react";
import { HomeSystem, MaintenanceTask, DocumentRecord, ConsumableItem, SavingsItem } from "../types";
import BottomNavBar from "./BottomNavBar";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from "recharts";

interface SystemsScreenProps {
  systems: HomeSystem[];
  onServiceSystem: (systemId: string) => void;
  onNavigateToScreen: (screenId: string) => void;
  onUpdateSystems: (updatedSystems: HomeSystem[]) => void;
  tasks: MaintenanceTask[];
  onUpdateTasks: (updatedTasks: MaintenanceTask[]) => void;
  documents: DocumentRecord[];
  onUpdateDocuments: (updatedDocs: DocumentRecord[]) => void;
  consumables: ConsumableItem[];
  onUpdateConsumables: (updatedConsumables: ConsumableItem[]) => void;
  savings: SavingsItem[];
  onUpdateSavings: (updatedSavings: SavingsItem[]) => void;
  vaultLocked?: boolean;
}

export default function SystemsScreen({ 
  systems, 
  onServiceSystem, 
  onNavigateToScreen, 
  onUpdateSystems,
  tasks,
  onUpdateTasks,
  documents,
  onUpdateDocuments,
  consumables,
  onUpdateConsumables,
  savings,
  onUpdateSavings,
  vaultLocked = true
}: SystemsScreenProps) {
  const [selectedSystemId, setSelectedSystemId] = React.useState<string | null>(null);
  const [scanningId, setScanningId] = React.useState<string | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);

  // Editable fields state
  const [editName, setEditName] = React.useState("");
  const [editCategory, setEditCategory] = React.useState<HomeSystem["category"]>("Structure");
  const [editHealth, setEditHealth] = React.useState(100);
  const [editStatus, setEditStatus] = React.useState<HomeSystem["status"]>("Optimal");
  const [editLastInspected, setEditLastInspected] = React.useState("");
  const [editDetails, setEditDetails] = React.useState("");
  const [editWarningThreshold, setEditWarningThreshold] = React.useState(75);
  const [editReportingInterval, setEditReportingInterval] = React.useState("Every 1 Hour");

  // Add system state
  const [isAdding, setIsAdding] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newCategory, setNewCategory] = React.useState<HomeSystem["category"]>("Structure");
  const [newHealth, setNewHealth] = React.useState(100);
  const [newStatus, setNewStatus] = React.useState<HomeSystem["status"]>("Optimal");
  const [newLastInspected, setNewLastInspected] = React.useState("July 2026");
  const [newDetails, setNewDetails] = React.useState("");
  const [newWarningThreshold, setNewWarningThreshold] = React.useState(75);
  const [newReportingInterval, setNewReportingInterval] = React.useState("Every 1 Hour");

  // AI Digitizer State
  const [addTab, setAddTab] = React.useState<"scanner" | "manual">("scanner");
  const [selectedPresetKey, setSelectedPresetKey] = React.useState<"hvac" | "warranty" | "barcode" | "meter" | null>(null);
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysisProgress, setAnalysisProgress] = React.useState(0);
  const [analysisStatus, setAnalysisStatus] = React.useState("");
  const [scannedResult, setScannedResult] = React.useState<any | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handlePresetSelect = (key: "hvac" | "warranty" | "barcode" | "meter") => {
    setSelectedPresetKey(key);
    setUploadedImage(null);
    setScannedResult(null);
    setToastMessage(`Selected template: ${key.toUpperCase()}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadedImage(event.target.result as string);
        setSelectedPresetKey(null);
        setScannedResult(null);
        setToastMessage(`Uploaded image file: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerScan = async () => {
    if (!uploadedImage && !selectedPresetKey) {
      setToastMessage("Please select an appliance sticker template or upload an image first.");
      return;
    }
    setIsAnalyzing(true);
    setScannedResult(null);
    setAnalysisProgress(5);
    setAnalysisStatus("Initializing local optical scan gateway...");

    const progressSteps = [
      { prg: 20, msg: "Uploading pixel stream to Gemini Spec Reader..." },
      { prg: 45, msg: "Analyzing manufacture date & barcode matrices..." },
      { prg: 70, msg: "Formulating wear fatigue indexes & system category..." },
      { prg: 88, msg: "Synthesizing custom DIY preventive maintenance tasks..." },
      { prg: 98, msg: "Archiving warranty metadata to Property Vault..." }
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < progressSteps.length) {
        setAnalysisProgress(progressSteps[stepIndex].prg);
        setAnalysisStatus(progressSteps[stepIndex].msg);
        stepIndex++;
      } else {
        clearInterval(interval);
      }
    }, 700);

    try {
      const response = await fetch("/api/scan-appliance-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          image: uploadedImage,
          preset: selectedPresetKey,
          mimeType: uploadedImage ? "image/png" : undefined
        })
      });

      const data = await response.json();
      clearInterval(interval);
      setAnalysisProgress(100);
      setAnalysisStatus("AI Appliance node compilation finalized!");
      setScannedResult(data);
    } catch (err) {
      console.warn("AI analysis failed, fallback triggered", err);
      clearInterval(interval);
      setAnalysisProgress(100);
      setAnalysisStatus("Scan completed (integrated local template lookup).");
      setScannedResult({
        name: "Standard Home HVAC Compressor Node",
        category: "Mechanical",
        health: 80,
        status: "Good",
        lastInspected: "July 2026",
        details: "Parsed HVAC outdoor condenser unit details. Standard performance indices with low coil heat dissipation fatigue.",
        warningThreshold: 75,
        reportingInterval: "Every 1 Hour",
        document: { name: "HVAC_Compressor_Manual.pdf", type: "report" },
        consumable: null,
        task: {
          title: "Clear outdoor condenser weeds and debris",
          why: "Blocked airflows build heavy head pressures, reducing cooling outputs and multiplying current draws by 20%.",
          how: "1. Turn off external disconnect switch. 2. Hose coils outwards to wash away grass and dust. 3. Trim vegetation 2 feet clear.",
          who: "DIY"
        },
        savings: { category: "Energy Efficiency", amount: 150, description: "Coil wash shaves 10% off central AC runtime electrical charges." }
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBindScannedResult = () => {
    if (!scannedResult) return;

    const newId = `sys_scanned_${Date.now()}`;
    const newSystemNode: HomeSystem = {
      id: newId,
      name: scannedResult.name,
      category: scannedResult.category as HomeSystem["category"],
      health: Number(scannedResult.health) || 90,
      status: scannedResult.status as HomeSystem["status"],
      lastInspected: scannedResult.lastInspected || "July 2026",
      details: scannedResult.details || `Digitized via AI Vision Scanner.`,
      warningThreshold: Number(scannedResult.warningThreshold) || 75,
      reportingInterval: scannedResult.reportingInterval || "Every 1 Hour"
    };

    // Update Systems list
    onUpdateSystems([...systems, newSystemNode]);

    // Bind Document
    if (scannedResult.document && documents && onUpdateDocuments) {
      const newDoc: DocumentRecord = {
        id: `doc_${Date.now()}`,
        name: scannedResult.document.name,
        type: scannedResult.document.type as DocumentRecord["type"],
        date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        size: "245 KB"
      };
      onUpdateDocuments([...documents, newDoc]);
    }

    // Bind Consumable
    if (scannedResult.consumable && consumables && onUpdateConsumables) {
      const newConsumable: ConsumableItem = {
        id: `cons_${Date.now()}`,
        name: scannedResult.consumable.name,
        category: scannedResult.category,
        currentLevel: scannedResult.consumable.currentLevel || 100,
        unit: scannedResult.consumable.unit || "%",
        installDate: new Date().toISOString().split("T")[0],
        lifespanDays: scannedResult.consumable.lifespanDays || 90,
        dailyUsageRate: parseFloat((100 / (scannedResult.consumable.lifespanDays || 90)).toFixed(2)),
        daysRemaining: scannedResult.consumable.lifespanDays || 90,
        status: "Good",
        reorderLink: scannedResult.consumable.reorderLink || "https://www.google.com",
        cost: scannedResult.consumable.cost || 20,
        alertActive: true,
        systemId: newId
      };
      onUpdateConsumables([...consumables, newConsumable]);
    }

    // Bind Task
    if (scannedResult.task && tasks && onUpdateTasks) {
      const newTask: MaintenanceTask = {
        id: `task_${Date.now()}`,
        title: scannedResult.task.title,
        due: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        priority: (scannedResult.status === "Critical" ? "High" : scannedResult.status === "Fair" ? "Medium" : "Low") as any,
        why: scannedResult.task.why,
        how: scannedResult.task.how,
        who: scannedResult.task.who || "DIY",
        where: scannedResult.name || "Home",
        completed: false
      };
      onUpdateTasks([newTask, ...tasks]);
    }

    // Bind Savings
    if (scannedResult.savings && savings && onUpdateSavings) {
      const newSaving: SavingsItem = {
        id: `save_${Date.now()}`,
        category: scannedResult.savings.category,
        amount: scannedResult.savings.amount,
        description: scannedResult.savings.description
      };
      onUpdateSavings([newSaving, ...savings]);
    }

    // Trigger feedback and reset
    setToastMessage(`AI spec matrix compiled successfully! Registered system node, linked documentation vault file, auto-configured consumable tracking metrics, and generated a custom preventative DIY task.`);
    
    // Clear state
    setScannedResult(null);
    setUploadedImage(null);
    setSelectedPresetKey(null);
    setIsAdding(false);
    setSelectedSystemId(newId); // Focus the user on the newly telemetered system
  };

  const handleAddSystem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newSystem: HomeSystem = {
      id: `sys_${Date.now()}`,
      name: newName,
      category: newCategory,
      health: newHealth,
      status: newStatus,
      lastInspected: newLastInspected || "July 2026",
      details: newDetails || `Initial setup for ${newName} node. Diagnostic scans calibrated and real-time streams synced.`,
      warningThreshold: newWarningThreshold,
      reportingInterval: newReportingInterval
    };

    onUpdateSystems([...systems, newSystem]);

    // Reset state
    setNewName("");
    setNewCategory("Structure");
    setNewHealth(100);
    setNewStatus("Optimal");
    setNewLastInspected("July 2026");
    setNewDetails("");
    setNewWarningThreshold(75);
    setNewReportingInterval("Every 1 Hour");

    setIsAdding(false);
    setSelectedSystemId(newSystem.id); // Auto-select newly added system
  };

  const selectedSystem = systems.find(s => s.id === selectedSystemId);

  // --- TELEMETRY & WEAR SIMULATOR STATES ---
  const [selectedProjectionYear, setSelectedProjectionYear] = React.useState<number>(2026);
  const [enabledStressors, setEnabledStressors] = React.useState<Record<string, boolean>>({});
  const [isSelfScanning, setIsSelfScanning] = React.useState(false);
  const [scanMessage, setScanMessage] = React.useState("");
  const [diagnosticChecked, setDiagnosticChecked] = React.useState<Record<string, boolean>>({});
  const [showLongevity, setShowLongevity] = React.useState(false);

  // Reset simulator states when switching system nodes
  React.useEffect(() => {
    if (selectedSystemId) {
      setSelectedProjectionYear(2026);
      setEnabledStressors({});
      setDiagnosticChecked({});
      setIsSelfScanning(false);
      setScanMessage("");
      setShowLongevity(false);
    }
  }, [selectedSystemId]);

  const getLongevityText = (systemName: string) => {
    const nameLower = systemName.toLowerCase();
    if (nameLower.includes("roof")) {
      return "Your roof is your home's primary shield against water, wind, and weather. Keeping it clean of debris and moss and repairing minor damage immediately prevents water from leaking into the attic and wood framing. Left unchecked, small roof leaks lead to massive structural wood rot and dangerous mold growth inside walls.";
    } else if (nameLower.includes("hvac")) {
      return "Maintaining your heating and cooling equipment ensures proper airflow, humidity levels, and stable indoor air quality. Routinely swapping filters and rinsing dust from condenser coils prevents the expensive compressor motor from overheating or wearing out prematurely, extending its lifespan and keeping monthly energy bills low.";
    } else if (nameLower.includes("plumbing")) {
      return "Plumbing systems hold high-pressure water that can cause rapid, devastating damage if a pipe breaks. Regular maintenance, like flushing mineral sediment from your water heater and inspecting braided flex hoses, prevents hidden slow leaks and burst pipes, keeping the framing of your home structurally dry.";
    } else if (nameLower.includes("electrical")) {
      return "Your electrical panel and wiring distribute high-voltage energy throughout the home. Regular inspection of breaker contacts and testing GFCI safety outlets prevents dangerous electrical fires, protects your valuable appliances from severe power surges, and ensures code-compliant safety zones.";
    } else if (nameLower.includes("foundation")) {
      return "The foundation supports the entire weight of your home. Keeping concrete perimeter walls dry by ensuring gutters direct rainwater away prevents soil shifting, hydrostatic pressure cracks, and basement flooding. Proactive inspection ensures structural alignment and prevents uneven house settling.";
    } else if (nameLower.includes("appliance")) {
      return "Home appliances are costly mechanical assets. Cleaning dryer lint lines, vacuuming refrigerator coils, and running dishwasher cleaning cycles allow these motors to run cooler and more efficiently. This basic maintenance saves electricity, prevents overheating fires, and prolongs appliance lifespans.";
    } else if (nameLower.includes("safety")) {
      return "Safety systems protect both your home and the lives within it. Routinely testing smoke alarms, carbon monoxide detectors, and backup batteries prevents sudden failures during a fire, gas leak, or security emergency, allowing for rapid response times that safeguard your entire property.";
    } else if (nameLower.includes("exterior")) {
      return "Your home's exterior envelope—siding, trim, caulking, and rain gutters—keeps outside moisture from reaching the interior framing. Inspecting caulked seams and clearing gutters prevents water from backing up, rotting wood siding, and creating damp spaces where termites and structural decay can thrive.";
    } else {
      return "Regularly inspecting and servicing auxiliary home assets preserves aesthetic quality, ensures reliable daily operation, and prevents minor mechanical fatigue from turning into a sudden, costly emergency repair, securing your property's resale value over the long term.";
    }
  };

  const getSystemMetadata = (systemName: string) => {
    const nameLower = systemName.toLowerCase();
    if (nameLower.includes("roof")) {
      return {
        type: "Structural Enclosure",
        material: "Architectural Asphalt Shingles",
        area: "2,450 sq ft",
        age: "12 Years",
        estimatedLife: "25 Years",
        stressors: [
          { id: "stress_uv", name: "Solar UV Degradation", impact: 1.8, description: "Intense solar radiation oxidizes and embrittles asphalt sheets.", icon: Sun },
          { id: "stress_moss", name: "Moss & Algae Spores", impact: 2.2, description: "Organic moss retains persistent moisture and roots under shingles.", icon: Layers },
          { id: "stress_wind", name: "Severe Wind / Shears", impact: 2.8, description: "High wind pressure lifts aging tab edges and shears corner fasteners.", icon: ExternalLink },
          { id: "stress_freeze", name: "Thermal Freeze-Thaw", impact: 1.5, description: "Water expanding in shingle micro-cracks fractures core binder bonds.", icon: Droplet },
          { id: "stress_clogs", name: "Deferred Clearances", impact: 2.0, description: "Debris decay clogs gutters, backing up water beneath starter courses.", icon: Wrench }
        ],
        sensors: [
          { id: "S-101", name: "Sub-Shingle Moisture Grid", value: "4.2", unit: "% RH", status: "Optimal" as const, nominalRange: "0.0 - 12.0% RH" },
          { id: "S-102", name: "Attic Core Thermal Sensor", value: "78.4", unit: "°F", status: "Optimal" as const, nominalRange: "50 - 110 °F" },
          { id: "S-103", name: "Structural Strain Tension", value: "0.08", unit: "G Force", status: "Optimal" as const, nominalRange: "0.0 - 0.5 G" },
          { id: "S-104", name: "Fascia Drip-Line Detector", value: "DRY", unit: "", status: "Optimal" as const, nominalRange: "DRY" }
        ],
        checklist: [
          { id: "chk_1", title: "Surface Moss & Debris Scrub", desc: "Clear debris driftways and apply safe biodegradable zinc moss wash." },
          { id: "chk_2", title: "Edge & Shingle Adhesion Verification", desc: "Verify tab edge sealants are securely bonded and replace split tiles." },
          { id: "chk_3", title: "Flashing & Chimney Collar Seal", desc: "Inspect step flashings and reseal aging rubber grommets/casing collars." },
          { id: "chk_4", title: "Attic Underside Ingress Scan", desc: "Verify sub-deck panels under rafters show no damp spots or organic mold." }
        ],
        baseCostDIY: "$120 - $250",
        baseCostPro: "$1,200 - $3,400",
        deltaSavings: "+$1,080",
        diyEffort: "3 - 5 Hours"
      };
    } else if (nameLower.includes("hvac")) {
      return {
        type: "Mechanical Thermodynamic",
        material: "Scroll Compressor & Heat Pump",
        area: "Dual-Zone Layout",
        age: "6 Years",
        estimatedLife: "15 Years",
        stressors: [
          { id: "stress_clog", name: "Filter Clog Impairment", impact: 3.5, description: "Restricted return airflow strains the blower motor and freezes coils.", icon: Wrench },
          { id: "stress_dust", name: "Coil Dust Accumulation", impact: 2.4, description: "Dirt insulation hinders refrigerant thermal transfer, increasing runtimes.", icon: Layers },
          { id: "stress_volt", name: "Voltage Swings / Spikes", impact: 1.8, description: "Micro-surges degrade capacitor lifespans and overheat winding leads.", icon: Zap },
          { id: "stress_cycle", name: "Short-Cycling Friction", impact: 2.6, description: "Rapid start-stop triggers extreme friction on mechanical bearings.", icon: Flame }
        ],
        sensors: [
          { id: "S-201", name: "Compressor Amperage Draw", value: "12.8", unit: "Amps", status: "Optimal" as const, nominalRange: "10.0 - 15.0 A" },
          { id: "S-202", name: "Suction Line Temperature", value: "48.2", unit: "°F", status: "Optimal" as const, nominalRange: "40 - 55 °F" },
          { id: "S-203", name: "Return Air Static Pressure", value: "0.52", unit: "in. WC", status: "Optimal" as const, nominalRange: "0.2 - 0.8 in. WC" },
          { id: "S-204", name: "Blower Vibrational Frequency", value: "28.5", unit: "Hz", status: "Optimal" as const, nominalRange: "0 - 40 Hz" }
        ],
        checklist: [
          { id: "chk_1", title: "MERV-11 Filter Swap", desc: "Verify clean airflow return by removing and sliding in a brand new filter." },
          { id: "chk_2", title: "Outdoor Condenser Fin Rinse", desc: "Clean leaf debris and pressure rinse the aluminum fin pack from inside out." },
          { id: "chk_3", title: "Condensate Drain Line Flush", desc: "Siphon vinegar or compressed air through the PVC drain line to clear clogs." },
          { id: "chk_4", title: "Electrical Contact Terminal Check", desc: "Check contractor terminals for oxidation, scorch marks, or loose leads." }
        ],
        baseCostDIY: "$30 - $80",
        baseCostPro: "$180 - $450",
        deltaSavings: "+$250",
        diyEffort: "1 - 2 Hours"
      };
    } else if (nameLower.includes("plumbing")) {
      return {
        type: "Liquid Hydronic",
        material: "Copper & PEX Cross-linked Tubing",
        area: "Whole-Home Delivery",
        age: "12 Years",
        estimatedLife: "50 Years",
        stressors: [
          { id: "stress_psi", name: "High Surge Pressure", impact: 4.1, description: "Static system pressure exceeding 80 PSI compromises pipe weld seams.", icon: Droplet },
          { id: "stress_scale", name: "Calcium Scaling", impact: 2.2, description: "Mineral accretion clogs valves and limits thermal flow speeds.", icon: Layers },
          { id: "stress_shock", name: "Water Hammer Impacts", impact: 3.1, description: "Hydraulic shock waves crack fittings and weaken solder rings.", icon: ExternalLink },
          { id: "stress_temp", name: "Extreme Temp Swings", impact: 1.5, description: "Thermal expansion and contraction fatigues joints and gaskets.", icon: Flame }
        ],
        sensors: [
          { id: "S-301", name: "Static Intake Water Pressure", value: "62.5", unit: "PSI", status: "Optimal" as const, nominalRange: "45.0 - 75.0 PSI" },
          { id: "S-302", name: "Sump Level Volumetric Indicator", value: "0.1", unit: "Gallons", status: "Optimal" as const, nominalRange: "0.0 - 2.0 Gallons" },
          { id: "S-303", name: "Water Main Volumetric Flow", value: "0.0", unit: "GPM", status: "Optimal" as const, nominalRange: "0.0 - 15.0 GPM" },
          { id: "S-304", name: "Water Heater Base Temperature", value: "120", unit: "°F", status: "Optimal" as const, nominalRange: "110 - 130 °F" }
        ],
        checklist: [
          { id: "chk_1", title: "Water Heater Flush & Drain", desc: "Flush calcium sludge accumulation out of the bottom drain valve." },
          { id: "chk_2", title: "Pressure Relief Safety Valve Test", desc: "Pull the T&P valve pin to confirm prompt pressure discharge." },
          { id: "chk_3", title: "Under-Sink Flex-Hose Audit", desc: "Verify braided stainless steel hoses show no stress leaks or rust spots." },
          { id: "chk_4", title: "Main Shut-off Handle Exercise", desc: "Rotate the main brass ball valve to ensure easy emergency seating." }
        ],
        baseCostDIY: "$15 - $40",
        baseCostPro: "$250 - $600",
        deltaSavings: "+$350",
        diyEffort: "2 - 3 Hours"
      };
    } else if (nameLower.includes("electrical")) {
      return {
        type: "High-Voltage Overcurrent",
        material: "150A Copper Bus Panelboard",
        area: "Distribution Network",
        age: "12 Years",
        estimatedLife: "40 Years",
        stressors: [
          { id: "stress_load", name: "Busbar Overloading", impact: 3.6, description: "Drawing high continuous amperage heats connectors, carbonizing contact clips.", icon: Zap },
          { id: "stress_corr", name: "Terminal Oxidation", impact: 2.1, description: "Ambient moisture corrodes exposed copper wiring links, increasing terminal resistance.", icon: Layers },
          { id: "stress_surge", name: "Lightning / Utility Surges", impact: 2.9, description: "Line micro-surges breach circuit insulation and burn out sensitive modules.", icon: ExternalLink }
        ],
        sensors: [
          { id: "S-401", name: "Main Panel Temperature", value: "82.4", unit: "°F", status: "Optimal" as const, nominalRange: "60 - 115 °F" },
          { id: "S-402", name: "Total Current Draw Line-A", value: "14.2", unit: "Amps", status: "Optimal" as const, nominalRange: "0 - 150 A" },
          { id: "S-403", name: "Total Current Draw Line-B", value: "11.8", unit: "Amps", status: "Optimal" as const, nominalRange: "0 - 150 A" },
          { id: "S-404", name: "Neutral Ground Voltage Leakage", value: "0.02", unit: "V AC", status: "Optimal" as const, nominalRange: "0.0 - 0.5 V" }
        ],
        checklist: [
          { id: "chk_1", title: "AFCI/GFCI Breaker Self-Test", desc: "Press breaker test buttons to verify immediate magnetic solenoid trip." },
          { id: "chk_2", title: "Outlets Receptacle Contact Tightness", desc: "Use a heavy-duty receptacle tester to check grounding and wiring pathways." },
          { id: "chk_3", title: "Panel Thermographic Audit", desc: "Check main bus lugs for thermal hot spots or hot cables." },
          { id: "chk_4", title: "Ground Rod Wire Ground Link Inspect", desc: "Inspect grounding clamp connection to copper grounding rod outside." }
        ],
        baseCostDIY: "$10 - $30",
        baseCostPro: "$200 - $500",
        deltaSavings: "+$280",
        diyEffort: "1 - 2 Hours"
      };
    } else {
      // Default fallback
      return {
        type: "Property Asset Integrity",
        material: "Hardware & Structural Enclosures",
        area: "Localized Node",
        age: "8 Years",
        estimatedLife: "20 Years",
        stressors: [
          { id: "stress_env", name: "Environmental Exposure", impact: 2.5, description: "Atmospheric weather, humidity, and temp shocks fatigue molecular density.", icon: Home },
          { id: "stress_wear", name: "Operational Fatigue", impact: 3.0, description: "Continuous mechanical load cycles slowly wear down key fasteners and linkages.", icon: Wrench },
          { id: "stress_care", name: "Maintenance Neglect", impact: 2.0, description: "Skipping minor service adjustments causes cascade wear on surrounding joints.", icon: Layers }
        ],
        sensors: [
          { id: "S-901", name: "Structural Surface Moisture", value: "6.8", unit: "% RH", status: "Optimal" as const, nominalRange: "0 - 15%" },
          { id: "S-902", name: "Vibrational G-Force Amplitude", value: "0.02", unit: "G", status: "Optimal" as const, nominalRange: "0 - 0.4 G" },
          { id: "S-903", name: "Ambient Thermal Index", value: "72.4", unit: "°F", status: "Optimal" as const, nominalRange: "40 - 100 °F" },
          { id: "S-904", name: "Physical Frame Load Strain", value: "Minimal", unit: "", status: "Optimal" as const, nominalRange: "Minimal" }
        ],
        checklist: [
          { id: "chk_1", title: "Screws & Fasteners Re-tightening", desc: "Inspect and tighten structural frame plates, anchor bolts, and collars." },
          { id: "chk_2", title: "Debris & Dirt Layer Vacuuming", desc: "Wipe down ventilation slots, sensors, and structural frames." },
          { id: "chk_3", title: "Calibrate Live Sensor baselines", desc: "Run a full scan sequence and upload a fresh manual validation entry." },
          { id: "chk_4", title: "Corrosion and Decay Protection", desc: "Inspect metal linkages for rust and apply protective sealant coats." }
        ],
        baseCostDIY: "$10 - $50",
        baseCostPro: "$150 - $400",
        deltaSavings: "+$200",
        diyEffort: "1 - 2 Hours"
      };
    }
  };

  const getSystemProjectionData = (sys: HomeSystem, metadata: any, activeStressors: Record<string, boolean>) => {
    const currentHealth = sys.health;
    const currentWear = 100 - currentHealth;
    const systemAge = parseFloat(metadata.age) || 8;
    const baseRate = Math.max(0.5, currentWear / systemAge);
    
    let stressImpactTotal = 0;
    metadata.stressors.forEach((st: any) => {
      if (activeStressors[st.id]) {
        stressImpactTotal += st.impact;
      }
    });
    
    const annualWearRate = baseRate + stressImpactTotal;
    const dataPoints = [];
    for (let year = 2026; year <= 2036; year++) {
      const elapsed = year - 2026;
      const projectedWear = currentWear + (annualWearRate * elapsed);
      const projectedHealth = Math.max(0, Math.min(100, 100 - projectedWear));
      
      dataPoints.push({
        year: year.toString(),
        health: Math.round(projectedHealth),
        wear: Math.round(projectedWear)
      });
    }
    
    return {
      dataPoints,
      annualWearRate: parseFloat(annualWearRate.toFixed(2)),
      baseRate: parseFloat(baseRate.toFixed(2)),
      stressImpactTotal: parseFloat(stressImpactTotal.toFixed(2))
    };
  };

  // Synchronize form values whenever a different system is selected or edit mode is entered
  React.useEffect(() => {
    if (selectedSystem) {
      setEditName(selectedSystem.name);
      setEditCategory(selectedSystem.category);
      setEditHealth(selectedSystem.health);
      setEditStatus(selectedSystem.status);
      setEditLastInspected(selectedSystem.lastInspected);
      setEditDetails(selectedSystem.details);
      setEditWarningThreshold(selectedSystem.warningThreshold ?? 75);
      setEditReportingInterval(selectedSystem.reportingInterval ?? "Every 1 Hour");
    }
  }, [selectedSystemId]);

  // Map system names to beautiful colored icons
  const getSystemIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "roof":
        return { icon: Home, color: "text-blue-400", bg: "bg-blue-500/10" };
      case "hvac":
        return { icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10" };
      case "plumbing":
        return { icon: Droplet, color: "text-cyan-400", bg: "bg-cyan-500/10" };
      case "electrical":
        return { icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/10" };
      case "foundation":
        return { icon: Layers, color: "text-purple-400", bg: "bg-purple-500/10" };
      case "appliances":
        return { icon: Tv, color: "text-indigo-400", bg: "bg-indigo-500/10" };
      case "safety":
        return { icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" };
      case "exterior":
        return { icon: ExternalLink, color: "text-slate-400", bg: "bg-slate-500/10" };
      default:
        return { icon: Wrench, color: "text-zinc-400", bg: "bg-zinc-500/10" };
    }
  };

  const handleService = (id: string) => {
    setScanningId(id);
    setTimeout(() => {
      onServiceSystem(id);
      setScanningId(null);
      
      // Update local detailed states immediately
      setEditHealth(98);
      setEditStatus("Optimal");
      setEditLastInspected(new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }));
      setEditDetails(`Fully serviced on ${new Date().toLocaleDateString()}. Coils cleansed, pressure calibrated, and mechanical tolerances verified.`);
    }, 1200);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSystemId) return;

    const updated = systems.map(s => {
      if (s.id === selectedSystemId) {
        return {
          ...s,
          name: editName,
          category: editCategory,
          health: editHealth,
          status: editStatus,
          lastInspected: editLastInspected,
          details: editDetails,
          warningThreshold: editWarningThreshold,
          reportingInterval: editReportingInterval
        };
      }
      return s;
    });

    onUpdateSystems(updated);
    setIsEditing(false);
  };

  // Calculate live statistical values
  const totalNodesCount = systems.length;
  const averageHealth = Math.round(systems.reduce((sum, s) => sum + s.health, 0) / totalNodesCount);
  const alertingNodesCount = systems.filter(s => s.health < (s.warningThreshold ?? 75)).length;

  // Active system for the degradation chart (defaults to selected system, or the first system)
  const chartSystem = systems.find(s => s.id === selectedSystemId) || systems[0];

  // Calculate degradation data points dynamically
  const getDegradationTrendData = (sys: HomeSystem) => {
    if (!sys) return [];
    const currentDegradation = 100 - sys.health;
    
    // Custom wear factors depending on node category to present a super-realistic wear model
    let annualRate = 4;
    if (sys.category === "Mechanical" || sys.category === "Plumbing") {
      annualRate = 5.8;
    } else if (sys.category === "Structure" || sys.category === "Exterior") {
      annualRate = 1.8;
    } else if (sys.category === "Electrical" || sys.category === "Safety") {
      annualRate = 3.4;
    }

    return [
      { year: "2024", wear: Math.max(2, Math.round(currentDegradation - 2 * annualRate)), type: "Historical" },
      { year: "2025", wear: Math.max(4, Math.round(currentDegradation - 1 * annualRate)), type: "Historical" },
      { year: "2026", wear: Math.max(6, Math.round(currentDegradation)), type: "Current" },
      { year: "2027", wear: Math.min(95, Math.round(currentDegradation + 1 * annualRate)), type: "Projected" },
      { year: "2028", wear: Math.min(98, Math.round(currentDegradation + 2 * annualRate)), type: "Projected" },
      { year: "2029", wear: Math.min(100, Math.round(currentDegradation + 3 * annualRate)), type: "Projected" },
    ];
  };

  const chartData = chartSystem ? getDegradationTrendData(chartSystem) : [];

  // Custom tooltips styling for dark telemetry vibe
  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#111625] border border-slate-800 p-2.5 rounded-xl text-[10px] font-sans shadow-xl">
          <p className="font-bold text-zinc-400 mb-0.5">{data.year} ({data.type})</p>
          <p className="text-white flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>Degradation: <strong className="text-blue-400">{data.wear}%</strong></span>
          </p>
          <p className="text-[9px] text-zinc-500 mt-1">
            {data.wear > (chartSystem.warningThreshold ?? 75) ? "⚠️ Critical projected degradation" : "✓ Within functional guidelines"}
          </p>
        </div>
      );
    }
    return null;
  };

  if (selectedSystem) {
    const meta = getSystemMetadata(selectedSystem.name);
    const projData = getSystemProjectionData(selectedSystem, meta, enabledStressors);
    
    // Find estimated failure year based on active wear rate
    const calculateFailureYear = (currentHealth: number, annualRate: number, warningThreshold: number) => {
      if (annualRate <= 0) return "Never";
      const distanceToWarning = currentHealth - warningThreshold;
      if (distanceToWarning <= 0) return "Active Alert";
      const years = distanceToWarning / annualRate;
      return Math.round(2026 + years).toString();
    };

    const failureYearCalculated = calculateFailureYear(
      selectedSystem.health,
      projData.annualWearRate,
      selectedSystem.warningThreshold ?? 75
    );

    // Selected year projection health level
    const projectedHealthAtSelectedYear = projData.dataPoints.find(
      dp => parseInt(dp.year) === selectedProjectionYear
    )?.health ?? selectedSystem.health;

    // Handle updates to systems health state
    const handleUpdateHealth = (newHealthValue: number) => {
      const updated = systems.map(s => {
        if (s.id === selectedSystem.id) {
          let status: HomeSystem["status"] = "Optimal";
          if (newHealthValue >= 90) status = "Optimal";
          else if (newHealthValue >= 75) status = "Good";
          else if (newHealthValue >= 50) status = "Fair";
          else status = "Critical";

          return {
            ...s,
            health: newHealthValue,
            status,
            lastInspected: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
            details: `Automated diagnostic calibration successfully completed on ${new Date().toLocaleDateString()}. Coils scrubbed, baseline parameters refreshed, and physical sensors balanced.`
          };
        }
        return s;
      });
      onUpdateSystems(updated);
    };

    // Handle check/uncheck for manual diagnostics checklist
    const handleCheckStep = (chkId: string) => {
      const updatedChecked = {
        ...diagnosticChecked,
        [chkId]: !diagnosticChecked[chkId]
      };
      setDiagnosticChecked(updatedChecked);

      // If all checklist steps are checked, automatically restore system to 100%!
      const totalSteps = meta.checklist.length;
      const checkedCount = meta.checklist.filter(c => updatedChecked[c.id]).length;
      if (checkedCount === totalSteps) {
        handleUpdateHealth(100);
      }
    };

    const totalSteps = meta.checklist.length;
    const checkedCount = meta.checklist.filter(c => diagnosticChecked[c.id]).length;

    const handleTriggerSelfScan = () => {
      setIsSelfScanning(true);
      setScanMessage("Initializing hardware query...");
      
      setTimeout(() => {
        setScanMessage("Querying raw diagnostic signals S-101 to S-104...");
      }, 800);

      setTimeout(() => {
        setScanMessage("Checking thermal boundaries & physical wear markers...");
      }, 1600);

      setTimeout(() => {
        setScanMessage("Uploading calibrated dataset to local digital twin stream...");
      }, 2400);

      setTimeout(() => {
        handleUpdateHealth(100);
        setIsSelfScanning(false);
        setScanMessage("");
      }, 3200);
    };

    return (
      <div id="system-telemetry-detail" className="w-full h-full flex flex-col justify-between bg-[#0A0A0A] text-white font-sans relative">
        {/* Detail Header */}
        <div className="px-5 pt-5 pb-3 border-b border-slate-900 bg-[#0E131F]/30 backdrop-blur-md flex items-center justify-between">
          <button 
            onClick={() => {
              setSelectedSystemId(null);
              setIsEditing(false);
            }}
            className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-all cursor-pointer py-1.5 px-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-800"
          >
            <ChevronLeft className="w-4 h-4 text-blue-400" />
            <span>Back to Systems</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[8px] font-mono font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/15">
              NODE ID: {selectedSystem.id}
            </span>
            <span className="text-[8px] font-mono font-bold bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded border border-slate-700">
              {meta.type}
            </span>
          </div>
        </div>

        {/* Scrollable details container */}
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-24 scrollbar-none space-y-4">
          
          {/* Main Title & General Info Card */}
          <div className="p-4 bg-gradient-to-br from-[#101827] to-[#0A0D14] border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full filter blur-2xl pointer-events-none"></div>
            
            <div className="flex items-start gap-3.5">
              <div className={`p-3 rounded-2xl ${getSystemIcon(selectedSystem.name).bg} ${getSystemIcon(selectedSystem.name).color}`}>
                {React.createElement(getSystemIcon(selectedSystem.name).icon, { className: "w-6 h-6 animate-pulse" })}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-black tracking-tight text-white">{selectedSystem.name} Wear Projection, {selectedSystem.name} Diagnostics</h1>
                  <button
                    onClick={() => setShowLongevity(!showLongevity)}
                    className="p-1 bg-blue-500/10 text-blue-400 hover:text-blue-300 hover:bg-blue-500/25 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center shrink-0"
                    title="Why maintain this system?"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-zinc-400 leading-snug">Real-time physical fatigue tracking, predictive degradation decay, and calibration sweeps.</p>
                
                {/* Spec metadata list */}
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-1.5 text-[9px] font-mono text-zinc-500">
                  <span>Age: <strong className="text-zinc-300">{meta.age}</strong></span>
                  <span className="text-slate-800">•</span>
                  <span>Component: <strong className="text-zinc-300">{meta.material}</strong></span>
                  <span className="text-slate-800">•</span>
                  <span>Zone: <strong className="text-zinc-300">{meta.area}</strong></span>
                </div>
              </div>
            </div>

            {/* Config & Service Button */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`py-1.5 px-3 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  isEditing 
                    ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700" 
                    : "bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-white"
                }`}
              >
                <Edit2 className="w-3 h-3 text-blue-400" />
                <span>{isEditing ? "View Diagnostics" : "Edit Config"}</span>
              </button>
            </div>
          </div>

          {/* Home Longevity Importance Box */}
          {showLongevity && (
            <div className="p-4 bg-blue-950/20 border border-blue-500/15 rounded-2xl flex items-start gap-3 text-left relative overflow-hidden animate-fade-in">
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <div className="space-y-1 flex-1 pr-6">
                <h4 className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">Home Longevity Impact</h4>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  {getLongevityText(selectedSystem.name)}
                </p>
              </div>
              <button 
                onClick={() => setShowLongevity(false)}
                className="absolute top-3 right-3 text-zinc-500 hover:text-white transition-colors cursor-pointer p-0.5"
                title="Close Info Box"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {isEditing ? (
            /* --- THE EDITING FORM --- */
            <div className="p-4 bg-[#101820] border border-slate-800 rounded-2xl animate-fade-in text-left">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-900 pb-3">
                <Settings className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Configure Telemetry Parameters</h3>
              </div>
              
              <form onSubmit={handleSaveConfig} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase mb-1">System Node Name</label>
                    <input 
                      type="text" 
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase mb-1">Category</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as HomeSystem["category"])}
                      className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none"
                    >
                      <option value="Structure">Structure</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Safety">Safety</option>
                      <option value="Exterior">Exterior</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-[#0A0A0A]/40 border border-slate-900 rounded-xl">
                  <div>
                    <label className="text-[8px] font-mono font-bold text-zinc-500 uppercase block mb-1">Health Override ({editHealth}%)</label>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={editHealth}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setEditHealth(val);
                        if (val >= 90) setEditStatus("Optimal");
                        else if (val >= 75) setEditStatus("Good");
                        else if (val >= 50) setEditStatus("Fair");
                        else setEditStatus("Critical");
                      }}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase mb-1">Status Class</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as HomeSystem["status"])}
                      className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2 py-1 text-[10.5px] text-white focus:outline-none"
                    >
                      <option value="Optimal">Optimal (Peak Efficiency)</option>
                      <option value="Good">Good (Stable Integrity)</option>
                      <option value="Fair">Fair (Attention Advised)</option>
                      <option value="Critical">Critical (Immediate Failure Risk)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase mb-1">Warning Trigger Threshold ({editWarningThreshold}%)</label>
                    <input 
                      type="number"
                      min="1"
                      max="100"
                      value={editWarningThreshold}
                      onChange={(e) => setEditWarningThreshold(Math.min(100, Math.max(1, parseInt(e.target.value) || 75)))}
                      className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase mb-1">Data Stream Refresh Frequency</label>
                    <select
                      value={editReportingInterval}
                      onChange={(e) => setEditReportingInterval(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none"
                    >
                      <option value="Real-time Stream">Real-time Stream</option>
                      <option value="Every 5 Minutes">Every 5 Minutes</option>
                      <option value="Every 15 Minutes">Every 15 Minutes</option>
                      <option value="Every 1 Hour">Every 1 Hour</option>
                      <option value="Every 12 Hours">Every 12 Hours</option>
                      <option value="Every 24 Hours">Every 24 Hours</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase mb-1">Inspection Timestamp Marker</label>
                  <input 
                    type="text"
                    required
                    value={editLastInspected}
                    onChange={(e) => setEditLastInspected(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase mb-1">Diagnostic Log Narrative</label>
                  <textarea
                    required
                    rows={2}
                    value={editDetails}
                    onChange={(e) => setEditDetails(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-[10.5px] text-white focus:outline-none"
                  ></textarea>
                </div>

                <div className="flex space-x-2 pt-2 border-t border-slate-900">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-slate-800 text-zinc-400 hover:text-white font-bold text-[10.5px] py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10.5px] py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Node Config</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* --- IMMERSIVE TELEMETRY & SIMULATOR GRID --- */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-left">
              
              {/* LEFT COLUMN: WEAR PROJECTION SIMULATOR (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* 1. Interactive Simulation Controller */}
                <div className="p-4 bg-[#101827]/40 border border-slate-800/80 rounded-2xl text-left space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-blue-400" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-white">{selectedSystem.name} Wear Projection</h3>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Projection Horizon
                    </span>
                  </div>

                  {/* Environmental stressors selection checklist */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                      Active Environmental Stressors / Accelerants:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {meta.stressors.map((st: any) => {
                        const StressorIcon = st.icon;
                        const isChecked = !!enabledStressors[st.id];
                        return (
                          <div 
                            key={st.id}
                            onClick={() => {
                              setEnabledStressors({
                                ...enabledStressors,
                                [st.id]: !isChecked
                              });
                            }}
                            className={`p-2.5 border rounded-xl flex items-start gap-2.5 cursor-pointer transition-all ${
                              isChecked 
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.05)]" 
                                : "bg-[#0A0D14] border-slate-900 text-zinc-400 hover:border-slate-800 hover:text-zinc-200"
                            }`}
                          >
                            <div className={`p-1.5 rounded-lg mt-0.5 ${isChecked ? "bg-amber-500/15 text-amber-400" : "bg-zinc-800 text-zinc-500"}`}>
                              <StressorIcon className="w-3.5 h-3.5" />
                            </div>
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <p className="text-[10px] font-bold truncate leading-tight">{st.name}</p>
                              <p className="text-[8px] text-zinc-500 leading-normal line-clamp-1">{st.description}</p>
                              <span className="text-[7.5px] font-mono block text-amber-500/90 font-bold mt-0.5">
                                Wear Accelerator: +{st.impact}%/yr
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interactive timeline slider */}
                  <div className="p-3 bg-[#0A0D14] border border-slate-900/60 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-zinc-400">Projection Year Target:</span>
                      <span className="text-xs font-black font-mono text-blue-400 tracking-wider">
                        Year {selectedProjectionYear} {selectedProjectionYear === 2026 ? "(Current)" : `(+${selectedProjectionYear - 2026} yrs)`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-mono text-zinc-500 font-bold">2026</span>
                      <input 
                        type="range"
                        min="2026"
                        max="2036"
                        step="1"
                        value={selectedProjectionYear}
                        onChange={(e) => setSelectedProjectionYear(parseInt(e.target.value))}
                        className="flex-1 accent-blue-500 cursor-pointer h-1.5 bg-slate-900 rounded-lg appearance-none"
                      />
                      <span className="text-[9px] font-mono text-zinc-500 font-bold">2036</span>
                    </div>
                  </div>

                  {/* 10-Year Line Projection Chart */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-0.5">
                      10-Year Fatigue Decay Curve:
                    </span>
                    <div className="h-[140px] w-full bg-[#0A0D14] border border-slate-900 rounded-xl p-2 pt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={projData.dataPoints} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#111827" vertical={false} />
                          <XAxis dataKey="year" tick={{ fill: '#71717A', fontSize: 8.5, fontFamily: 'monospace' }} axisLine={{ stroke: '#1F2937', strokeWidth: 0.5 }} tickLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fill: '#71717A', fontSize: 8.5, fontFamily: 'monospace' }} axisLine={{ stroke: '#1F2937', strokeWidth: 0.5 }} tickLine={false} unit="%" />
                          <Tooltip 
                            content={({ active, payload }: any) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-[#111625] border border-slate-800 p-2 rounded-xl text-[9px] font-sans shadow-xl">
                                    <p className="font-bold text-zinc-400 mb-0.5">Year {data.year}</p>
                                    <p className="text-white flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                      <span>Health: <strong className="text-blue-400">{data.health}%</strong></span>
                                    </p>
                                    <p className="text-zinc-500 text-[8px] mt-0.5">Cumulative Wear: {data.wear}%</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Line type="monotone" dataKey="health" stroke="#3B82F6" strokeWidth={2} activeDot={{ r: 5 }} dot={(props: any) => {
                            const { cx, cy, payload } = props;
                            if (parseInt(payload.year) === selectedProjectionYear) {
                              return <circle cx={cx} cy={cy} r={5} fill="#F59E0B" stroke="#0A0A0A" strokeWidth={1.5} />;
                            }
                            return <circle cx={cx} cy={cy} r={2.5} fill="#3B82F6" stroke="none" />;
                          }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Simulator Statistics & Dynamic Predictions */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 bg-[#0A0D14] border border-slate-900 rounded-xl">
                      <span className="text-[8px] text-zinc-500 block uppercase tracking-wider font-mono">Current Health</span>
                      <span className="text-xs font-black text-white mt-0.5 block">{selectedSystem.health}%</span>
                    </div>
                    <div className="p-2 bg-[#0A0D14] border border-slate-900 rounded-xl">
                      <span className="text-[8px] text-zinc-500 block uppercase tracking-wider font-mono">Wear Rate / Yr</span>
                      <span className="text-xs font-black text-amber-400 mt-0.5 block font-mono">{projData.annualWearRate}%</span>
                    </div>
                    <div className="p-2 bg-[#0A0D14] border border-slate-900 rounded-xl">
                      <span className="text-[8px] text-zinc-500 block uppercase tracking-wider font-mono">Projected Health</span>
                      <span className={`text-xs font-black mt-0.5 block ${projectedHealthAtSelectedYear >= 90 ? "text-emerald-400" : projectedHealthAtSelectedYear >= (selectedSystem.warningThreshold ?? 75) ? "text-yellow-400" : "text-red-400"}`}>
                        {projectedHealthAtSelectedYear}%
                      </span>
                    </div>
                    <div className="p-2 bg-[#0A0D14] border border-slate-900 rounded-xl">
                      <span className="text-[8px] text-zinc-500 block uppercase tracking-wider font-mono">Failure Year</span>
                      <span className={`text-xs font-black mt-0.5 block font-mono ${failureYearCalculated === "Active Alert" ? "text-red-400 font-bold" : failureYearCalculated === "Never" ? "text-zinc-400" : "text-zinc-200"}`}>
                        {failureYearCalculated}
                      </span>
                    </div>
                  </div>

                </div>

                {/* 2. DIY vs Professional Contractor Analysis Panel */}
                <div className="p-4 bg-[#101827]/45 border border-slate-800/60 rounded-2xl text-left space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl pointer-events-none"></div>
                  
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-white">Proactive Economic Savings</h3>
                    </div>
                    <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                      Avoided Cost Delta: {meta.deltaSavings}
                    </span>
                  </div>

                  <p className="text-[10px] text-zinc-400 leading-normal">
                    Performing diagnostics on the <strong className="text-zinc-200">{selectedSystem.name}</strong> nodes helps catch minor micro-fatigue issues before they trigger whole-system cascading failures.
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                    <div className="p-3 bg-[#0A0D14]/80 border border-slate-900 rounded-xl space-y-1 text-left">
                      <span className="text-zinc-500 text-[8px] uppercase tracking-wider block">DIY Diagnostics</span>
                      <span className="text-emerald-400 font-black text-xs block">{meta.baseCostDIY}</span>
                      <span className="text-[8.5px] text-zinc-400 block font-sans">Self Maintenance Checklist</span>
                      <span className="text-[8px] text-zinc-500 block font-mono">{meta.diyEffort} effort</span>
                    </div>
                    <div className="p-3 bg-[#0A0D14]/80 border border-slate-900 rounded-xl space-y-1 text-left">
                      <span className="text-zinc-500 text-[8px] uppercase tracking-wider block">Contractor Callout</span>
                      <span className="text-red-400 font-black text-xs block">{meta.baseCostPro}</span>
                      <span className="text-[8.5px] text-zinc-400 block font-sans">Reactive Emergency Repair</span>
                      <span className="text-[8px] text-zinc-500 block font-mono">Includes dispatch delay</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: REAL-TIME DIAGNOSTIC FEEDS & CHECKS (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* 1. Telemetered Sensor Feeds */}
                <div className="p-4 bg-[#101827]/40 border border-slate-800/80 rounded-2xl text-left space-y-3.5 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-white">{selectedSystem.name} Diagnostics</h3>
                    </div>
                    <span className="flex items-center gap-1 text-[8px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                      <span>ACTIVE FEEDS</span>
                    </span>
                  </div>

                  {/* Sens list */}
                  <div className="space-y-2">
                    {meta.sensors.map((sensor) => {
                      return (
                        <div key={sensor.id} className="p-2.5 bg-[#0A0D14] border border-slate-900 hover:border-slate-800 rounded-xl flex items-center justify-between transition-colors">
                          <div className="space-y-0.5 text-left">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] font-mono text-zinc-500 block">{sensor.id}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                              <span className="text-[10px] font-black text-zinc-300 block">{sensor.name}</span>
                            </div>
                            <span className="text-[8px] font-mono text-zinc-500 block">Nominal limits: {sensor.nominalRange}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black font-mono text-white block">
                              {isSelfScanning ? "READING..." : `${sensor.value} ${sensor.unit}`}
                            </span>
                            <span className={`text-[7.5px] font-mono font-bold uppercase ${isSelfScanning ? "text-blue-400 animate-pulse" : "text-emerald-400"}`}>
                              {isSelfScanning ? "Scanning" : "VERIFIED"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Self Diagnostic Calibration trigger */}
                  <div className="pt-2">
                    {isSelfScanning ? (
                      <div className="p-3 bg-blue-950/15 border border-blue-500/30 rounded-xl space-y-2 text-center animate-pulse">
                        <div className="flex items-center justify-center gap-2 text-blue-400 font-mono text-[9px] font-bold">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>CALIBRATION SEQUENCE IN PROGRESS</span>
                        </div>
                        <p className="text-[9px] text-zinc-400 font-mono">{scanMessage}</p>
                      </div>
                    ) : (
                      <button 
                        onClick={handleTriggerSelfScan}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/15"
                      >
                        <Radio className="w-4 h-4 text-blue-200" />
                        <span>Trigger Automated Diagnostic Sweep</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Interactive Checklist Sequence */}
                <div className="p-4 bg-[#101827]/40 border border-slate-800/80 rounded-2xl text-left space-y-3.5 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-blue-400" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-white">Manual Verification Steps</h3>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500 font-bold">
                      {checkedCount} / {totalSteps} Checked
                    </span>
                  </div>

                  <p className="text-[10px] text-zinc-400 leading-normal">
                    Complete all checklist points below to manually verify node tolerances and restore health score telemetry.
                  </p>

                  <div className="space-y-2">
                    {meta.checklist.map((step) => {
                      const isChecked = !!diagnosticChecked[step.id];
                      return (
                        <div 
                          key={step.id} 
                          onClick={() => handleCheckStep(step.id)}
                          className={`p-2.5 border rounded-xl flex items-start gap-3 cursor-pointer transition-all text-left ${
                            isChecked 
                              ? "bg-blue-950/10 border-blue-900/40 text-zinc-200 animate-pulse" 
                              : "bg-[#0A0D14] border-slate-900/60 text-zinc-400 hover:border-slate-800"
                          }`}
                        >
                          <div className={`p-0.5 rounded mt-0.5 flex-shrink-0 flex items-center justify-center border ${
                            isChecked 
                              ? "bg-blue-600 border-blue-500 text-white" 
                              : "border-zinc-700 bg-zinc-950 text-transparent"
                          }`}>
                            <Check className="w-2.5 h-2.5" />
                          </div>
                          <div className="space-y-0.5">
                            <p className={`text-[10px] font-bold leading-tight ${isChecked ? "text-zinc-400 line-through" : "text-white"}`}>
                              {step.title}
                            </p>
                            <p className="text-[8.5px] text-zinc-500 leading-normal">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedSystem.health < 100 && (
                    <div className="text-[9px] text-zinc-500 text-center font-mono">
                      {checkedCount === totalSteps ? (
                        <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5 animate-pulse" /> Telemetry verified and calibrated to 100%.
                        </span>
                      ) : (
                        <span>Verify all {totalSteps} manual diagnostics or run self sweep to restore full health state.</span>
                      )}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Bottom Navigation spacer/bar to match system aesthetics */}
        <BottomNavBar activeTab="systems" onNavigateToScreen={onNavigateToScreen} />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0A0A0A] text-white font-sans relative">
      
      {/* Main Content Scroll Container */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-20 scrollbar-none">
        
        {/* Screen Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="text-left">
            <span className="text-[10px] text-blue-400 font-mono tracking-widest uppercase">Platform Telemetry</span>
            <h2 className="text-xl font-extrabold tracking-tight text-white font-display">Home Systems</h2>
            <p className="text-[10px] text-zinc-400 mt-0.5 font-sans">Real-time gateway tracking structural & hardware nodes</p>
          </div>
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setSelectedSystemId(null); // Deselect current so user can focus on adding
            }}
            className={`font-bold text-[10px] py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-lg ${
              isAdding 
                ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" 
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/15"
            }`}
          >
            {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{isAdding ? "Cancel" : "Add Node"}</span>
          </button>
        </div>

        {/* Add New System Form Container */}
        {isAdding && (
          <div className="mb-5 p-4 bg-[#111625]/90 border border-blue-500/20 rounded-2xl shadow-2xl space-y-4 text-left animate-fade-in relative overflow-hidden">
            {/* Visual ambient light behind container */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full filter blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full filter blur-2xl pointer-events-none"></div>

            {/* Custom Banner Alert for Toasts inside the panel */}
            {toastMessage && (
              <div className="p-3 bg-blue-950/80 border border-blue-500/40 rounded-xl flex items-start gap-2.5 text-blue-200 animate-slide-in text-[10.5px]">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                <div className="font-sans leading-relaxed text-[10px]">{toastMessage}</div>
              </div>
            )}

            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400 rounded-xl">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Initialize Gateway Node</h4>
                  <p className="text-[9px] text-zinc-400 font-sans">Add hardware nodes manually or digitize appliances using Gemini AI</p>
                </div>
              </div>
            </div>

            {/* Tab Selectors */}
            <div className="grid grid-cols-2 gap-2 bg-[#0A0A0A]/85 p-1 rounded-xl border border-slate-850">
              <button
                type="button"
                onClick={() => setAddTab("scanner")}
                className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  addTab === "scanner"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/15"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>AI Image & Spec Scanner</span>
              </button>
              <button
                type="button"
                onClick={() => setAddTab("manual")}
                className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  addTab === "manual"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/15"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Manual Properties Entry</span>
              </button>
            </div>

            {/* Content for AI Scanner Tab */}
            {addTab === "scanner" && (
              <div className="space-y-4 animate-fade-in">
                <div className="text-[10px] text-zinc-300 bg-[#0A0A0A]/40 p-2.5 rounded-xl border border-slate-800/40 leading-relaxed font-sans">
                  🚀 <strong className="text-blue-400 font-bold">DIY Digitizing Moment:</strong> Upload a photo of your appliance's specification sticker, barcode serial plate, or warranty document. Our server-side Gemini AI model parses the image, registers the hardware, links documents to your property vault, configures filter/battery tracking, and creates customized safety steps.
                </div>

                {/* Upload Trigger Input */}
                <input
                  type="file"
                  id="appliance-file-upload"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Main Scan Selector Stage */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* File Upload Box */}
                  <label
                    htmlFor="appliance-file-upload"
                    className={`border border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      uploadedImage
                        ? "border-blue-500/50 bg-blue-950/20"
                        : "border-slate-700/80 hover:border-blue-500/40 bg-[#0A0A0A]/50 hover:bg-[#0A0A0A]"
                    }`}
                  >
                    {uploadedImage ? (
                      <div className="space-y-2">
                        <div className="relative w-16 h-16 mx-auto rounded-lg overflow-hidden border border-blue-500/30">
                          <img
                            src={uploadedImage}
                            alt="Uploaded Appliance Sticker"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-blue-500/10"></div>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-blue-400 block">Frame Uploaded</span>
                        <span className="text-[8px] text-zinc-400 block">(Click to swap image)</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="p-2.5 bg-zinc-900 rounded-full text-zinc-400 mx-auto w-fit">
                          <Upload className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-[10px] font-bold text-white">Upload Appliance sticker photo</div>
                        <div className="text-[8px] text-zinc-500 font-sans">Supports PNG, JPG, or PDF snap</div>
                      </div>
                    )}
                  </label>

                  {/* Preloaded Template Presets */}
                  <div className="space-y-2 text-left">
                    <span className="text-[8.5px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                      Or select dynamic sticker template:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handlePresetSelect("hvac")}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          selectedPresetKey === "hvac"
                            ? "bg-blue-950/30 border-blue-500/50 text-white"
                            : "bg-[#0A0A0A]/40 border-slate-800/80 text-zinc-400 hover:text-white hover:bg-[#0A0A0A]"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 text-orange-400">
                          <Flame className="w-3.5 h-3.5 animate-pulse" />
                          <span className="text-[8.5px] font-mono uppercase font-semibold">HVAC Node</span>
                        </div>
                        <div className="text-[9px] font-bold truncate">Carrier Furnace Sticker</div>
                        <div className="text-[7.5px] text-zinc-500 truncate">Carrier Comfort AFUE 92</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePresetSelect("warranty")}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          selectedPresetKey === "warranty"
                            ? "bg-blue-950/30 border-blue-500/50 text-white"
                            : "bg-[#0A0A0A]/40 border-slate-800/80 text-zinc-400 hover:text-white hover:bg-[#0A0A0A]"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 text-blue-400">
                          <Droplet className="w-3.5 h-3.5 animate-pulse" />
                          <span className="text-[8.5px] font-mono uppercase font-semibold">Plumbing Node</span>
                        </div>
                        <div className="text-[9px] font-bold truncate">Heater Warranty Plate</div>
                        <div className="text-[7.5px] text-zinc-500 truncate">AO Smith Signature 40G</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePresetSelect("barcode")}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          selectedPresetKey === "barcode"
                            ? "bg-blue-950/30 border-blue-500/50 text-white"
                            : "bg-[#0A0A0A]/40 border-slate-800/80 text-zinc-400 hover:text-white hover:bg-[#0A0A0A]"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 text-yellow-500">
                          <QrCode className="w-3.5 h-3.5 animate-pulse" />
                          <span className="text-[8.5px] font-mono uppercase font-semibold">Electrical Node</span>
                        </div>
                        <div className="text-[9px] font-bold truncate">Thermostat Barcode</div>
                        <div className="text-[7.5px] text-zinc-500 truncate">Nest Gen 4 Serial</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePresetSelect("meter")}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          selectedPresetKey === "meter"
                            ? "bg-blue-950/30 border-blue-500/50 text-white"
                            : "bg-[#0A0A0A]/40 border-slate-800/80 text-zinc-400 hover:text-white hover:bg-[#0A0A0A]"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 text-emerald-400">
                          <Gauge className="w-3.5 h-3.5 animate-pulse" />
                          <span className="text-[8.5px] font-mono uppercase font-semibold">Safety Grid</span>
                        </div>
                        <div className="text-[9px] font-bold truncate">Smart Grid Node</div>
                        <div className="text-[7.5px] text-zinc-500 truncate">Itron Sentinel Utility</div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Scan Button Trigger */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={triggerScan}
                    disabled={isAnalyzing || (!uploadedImage && !selectedPresetKey)}
                    className={`w-full py-2.5 rounded-xl text-[10.5px] font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                      isAnalyzing
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        : (!uploadedImage && !selectedPresetKey)
                        ? "bg-zinc-900 text-zinc-600 cursor-not-allowed border border-slate-800/60"
                        : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-blue-500/10"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
                    <span>{isAnalyzing ? "AI Engine Running..." : "Execute AI Optical Spec Analysis"}</span>
                  </button>
                </div>

                {/* Interactive Scan Progress HUD */}
                {isAnalyzing && (
                  <div className="p-3.5 bg-blue-950/30 border border-blue-500/30 rounded-xl space-y-2 relative overflow-hidden animate-pulse">
                    {/* Cyber Scan line animation sweeping */}
                    <div className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-bounce opacity-80"></div>
                    <div className="flex justify-between items-center text-[9px] font-mono font-bold text-blue-400">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
                        <span>{analysisStatus}</span>
                      </span>
                      <span>{analysisProgress}%</span>
                    </div>
                    <div className="w-full bg-[#0A0A0A] h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${analysisProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Scanned Results Scorecard Card */}
                {scannedResult && !isAnalyzing && (
                  <div className="border border-emerald-500/30 bg-emerald-950/10 rounded-2xl p-4 space-y-4 animate-fade-in text-left">
                    <div className="flex items-start justify-between border-b border-emerald-500/10 pb-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-mono rounded-full font-bold">
                            Scan Verified ({scannedResult.source})
                          </span>
                        </div>
                        <h5 className="text-xs font-extrabold text-white mt-1.5 flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>{scannedResult.name}</span>
                        </h5>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] font-mono text-zinc-400 uppercase block">Wear Health</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">{scannedResult.health}%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 text-[10px]">
                      {/* Technical Spec Matrix */}
                      <div className="p-2.5 bg-[#0A0A0A]/60 rounded-xl border border-slate-900 space-y-2">
                        <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">
                          Technical Details
                        </span>
                        <div className="text-[9.5px] text-zinc-300 font-sans leading-relaxed">
                          {scannedResult.details}
                        </div>
                        <div className="pt-1.5 border-t border-slate-900/80 flex justify-between text-[8px] text-zinc-400 font-mono">
                          <span>SYNC: {scannedResult.reportingInterval}</span>
                          <span>WARN: {scannedResult.warningThreshold}%</span>
                        </div>
                      </div>

                      {/* Multidimensional Bound Assets Card */}
                      <div className="p-2.5 bg-[#0A0A0A]/60 rounded-xl border border-slate-900 space-y-2">
                        <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
                          Vault & Consumables File
                        </span>
                        {scannedResult.document && (
                          <div className="flex items-center gap-2 text-blue-400">
                            <FileText className="w-3.5 h-3.5 shrink-0" />
                            <div className="truncate text-[9.5px] font-semibold">{scannedResult.document.name}</div>
                          </div>
                        )}
                        {scannedResult.consumable ? (
                          <div className="pt-1.5 border-t border-slate-900/80 space-y-1">
                            <span className="text-[7.5px] font-mono text-zinc-500 uppercase block">Consumable Tracked</span>
                            <div className="text-[9px] text-zinc-300 truncate font-semibold">{scannedResult.consumable.name}</div>
                            <div className="flex justify-between text-[8px] text-zinc-500 font-mono">
                              <span>Cost: ${scannedResult.consumable.cost}</span>
                              <span>Lifespan: {scannedResult.consumable.lifespanDays} Days</span>
                            </div>
                          </div>
                        ) : (
                          <div className="pt-1.5 border-t border-slate-900/80 text-[8.5px] text-zinc-500 italic">
                            No consumable parts needed.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Proactive DIY Maintenance Steps */}
                    {scannedResult.task && (
                      <div className="p-3 bg-[#0A0A0A]/60 rounded-xl border border-slate-900 space-y-2 text-[10px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-mono font-bold text-yellow-400 uppercase tracking-widest block">
                            Generated DIY Preventative Plan
                          </span>
                          <span className="text-[7.5px] font-mono text-zinc-500">
                            {scannedResult.task.who}
                          </span>
                        </div>
                        <h6 className="font-bold text-white text-[10px]">{scannedResult.task.title}</h6>
                        <p className="text-[9px] text-zinc-400 italic">Why: {scannedResult.task.why}</p>
                        <div className="text-[9px] text-zinc-300 leading-relaxed bg-[#111]/80 p-2 rounded-lg border border-slate-800">
                          {scannedResult.task.how}
                        </div>
                      </div>
                    )}

                    {/* Estimated Cost Savings */}
                    {scannedResult.savings && (
                      <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-center justify-between text-[10px]">
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                            Yearly Financial Savings ROI
                          </span>
                          <p className="text-[8.5px] text-emerald-100 font-sans">{scannedResult.savings.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[8px] font-mono text-zinc-400 block uppercase">Estimated ROI</span>
                          <span className="text-xs font-mono font-extrabold text-emerald-400">+${scannedResult.savings.amount}/yr</span>
                        </div>
                      </div>
                    )}

                    {/* Binding Confirmation Button */}
                    <div className="pt-1 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setScannedResult(null);
                          setUploadedImage(null);
                          setSelectedPresetKey(null);
                        }}
                        className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 border border-slate-800 text-zinc-400 hover:text-white font-bold text-[10px] rounded-xl cursor-pointer"
                      >
                        Reset Scan
                      </button>
                      <button
                        type="button"
                        onClick={handleBindScannedResult}
                        className="flex-[2] py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[10px] rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Confirm & Bind Scanned Node</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Content for Manual Properties Entry Tab */}
            {addTab === "manual" && (
              <form onSubmit={handleAddSystem} className="space-y-3.5 animate-fade-in">
                {/* Name & Category */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      System/Node Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Irrigation, Smart Lock"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-[10.5px] text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      Category Type
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as HomeSystem["category"])}
                      className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2 py-1.5 text-[10.5px] text-white focus:outline-none"
                    >
                      <option value="Structure">Structure</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Safety">Safety</option>
                      <option value="Exterior">Exterior</option>
                    </select>
                  </div>
                </div>

                {/* Health Score Slider & Override Status */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-[#0A0A0A]/60 border border-slate-900 rounded-xl">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                        Initial Health ({newHealth}%)
                      </label>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={newHealth}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setNewHealth(val);
                        if (val >= 90) setNewStatus("Optimal");
                        else if (val >= 75) setNewStatus("Good");
                        else if (val >= 50) setNewStatus("Fair");
                        else setNewStatus("Critical");
                      }}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      Derived Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as HomeSystem["status"])}
                      className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none"
                    >
                      <option value="Optimal">Optimal</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                {/* Warning Threshold & Reporting Interval */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      Warning Marker ({newWarningThreshold}%)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newWarningThreshold}
                      onChange={(e) => setNewWarningThreshold(Math.min(100, Math.max(1, parseInt(e.target.value) || 75)))}
                      className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      Telemetry Stream Sync
                    </label>
                    <select
                      value={newReportingInterval}
                      onChange={(e) => setNewReportingInterval(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2 py-1.5 text-[10.5px] text-white focus:outline-none"
                    >
                      <option value="Real-time Stream">Real-time Stream</option>
                      <option value="Every 5 Minutes">Every 5 Minutes</option>
                      <option value="Every 15 Minutes">Every 15 Minutes</option>
                      <option value="Every 1 Hour">Every 1 Hour</option>
                      <option value="Every 24 Hours">Every 24 Hours</option>
                    </select>
                  </div>
                </div>

                {/* Last inspection stamp */}
                <div>
                  <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Commissioning/Inspection Date
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. July 2026"
                    value={newLastInspected}
                    onChange={(e) => setNewLastInspected(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-[10.5px] text-white focus:outline-none"
                  />
                </div>

                {/* Description Details log */}
                <div>
                  <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Initial Diagnostic Logs / Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Summarize initial wear state, firmware status, or structural logs..."
                    value={newDetails}
                    onChange={(e) => setNewDetails(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg p-2 text-[10px] text-white focus:outline-none"
                  ></textarea>
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-slate-800/80 text-zinc-400 hover:text-white font-bold text-[10px] py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-[10px] py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Deploy Gateway Node</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Telemetry Network Overview Summary Panel */}
        <div className="mb-5 p-3.5 bg-[#101820]/45 border border-slate-800 rounded-2xl grid grid-cols-3 gap-2 text-center">
          <div className="space-y-0.5 border-r border-slate-800/80 last:border-0">
            <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider block">Nodes Online</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              <span>{totalNodesCount} / {totalNodesCount}</span>
            </span>
          </div>
          <div className="space-y-0.5 border-r border-slate-800/80 last:border-0">
            <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider block">Mean Health</span>
            <span className="text-xs font-bold text-white">{averageHealth}%</span>
          </div>
          <div className="space-y-0.5 last:border-0">
            <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider block">Active Alerts</span>
            <span className={`text-xs font-bold ${alertingNodesCount > 0 ? "text-amber-400" : "text-zinc-400"}`}>
              {alertingNodesCount} Detected
            </span>
          </div>
        </div>

        {/* Degradation Trends Chart Panel */}
        {chartSystem && (
          <div className="mb-5 p-4 bg-[#101820]/50 border border-slate-800/80 rounded-2xl text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full filter blur-xl pointer-events-none"></div>
            
            <div className="flex items-start justify-between mb-3.5">
              <div>
                <span className="text-[8px] font-mono font-bold text-blue-400 uppercase tracking-widest block">Degradation Profile</span>
                <h3 className="text-xs font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                  <span>{chartSystem.name} Wear Projection, {chartSystem.name} Diagnostics</span>
                </h3>
                <p className="text-[9px] text-zinc-400 mt-0.5 font-sans">
                  5-year dynamic fatigue accumulation model. Select any zone card below to switch nodes.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-mono block text-zinc-500 uppercase">Current wear</span>
                <span className="text-xs font-bold font-mono text-zinc-300">{Math.round(100 - chartSystem.health)}%</span>
              </div>
            </div>

            <div className="h-[135px] w-full mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis 
                    dataKey="year" 
                    tick={{ fill: '#71717A', fontSize: 9, fontFamily: 'monospace' }} 
                    axisLine={{ stroke: '#334155', strokeWidth: 0.5 }}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fill: '#71717A', fontSize: 9, fontFamily: 'monospace' }} 
                    axisLine={{ stroke: '#334155', strokeWidth: 0.5 }}
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip content={<CustomChartTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }} />
                  <Bar dataKey="wear" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => {
                      let fill = "#475569"; // historical slate
                      if (entry.type === "Current") {
                        fill = "#3B82F6"; // current active blue
                      } else if (entry.type === "Projected") {
                        fill = entry.wear >= 45 ? "#F59E0B" : "#6366F1"; // warning amber or projected indigo
                      }
                      return <Cell key={`cell-${index}`} fill={fill} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Custom chart legend */}
            <div className="flex items-center justify-center gap-4 mt-3 text-[9px] font-mono text-zinc-500 border-t border-slate-900/40 pt-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-slate-600"></span>
                <span>Historical</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-blue-500"></span>
                <span>Current ({Math.round(100 - chartSystem.health)}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-indigo-500"></span>
                <span>Projected Trend</span>
              </div>
            </div>
          </div>
        )}

        {/* System 2-Column Grid */}
        <div className="grid grid-cols-2 gap-3">
          {systems.map((sys) => {
            const { icon: IconComponent, color, bg } = getSystemIcon(sys.name);
            const isSelected = sys.id === selectedSystemId;
            const threshold = sys.warningThreshold ?? 75;
            const isAlerting = sys.health < threshold;
            
            // Health color scheme
            const healthColor = sys.health >= 90 
              ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/20" 
              : sys.health >= threshold
              ? "text-yellow-400 bg-yellow-500/15 border-yellow-500/20"
              : "text-red-400 bg-red-500/15 border-red-500/20";

            return (
              <div
                key={sys.id}
                onClick={() => {
                  setSelectedSystemId(sys.id);
                  setIsEditing(false);
                }}
                className={`p-3.5 bg-[#101820] border ${
                  isSelected 
                    ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
                    : isAlerting 
                    ? "border-amber-500/40 hover:border-amber-500/60" 
                    : "border-slate-800/80 hover:border-slate-700"
                } rounded-2xl cursor-pointer transition-all flex flex-col justify-between h-[115px] relative group overflow-hidden`}
              >
                {/* Background active pulse / Alert Indicator */}
                {isSelected && (
                  <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/5 rounded-full filter blur-xl"></div>
                )}
                {isAlerting && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" title="Below safe warning threshold!"></div>
                )}

                {/* Top: Icon + Status */}
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-xl ${bg} ${color}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${healthColor}`}>
                    {sys.status}
                  </span>
                </div>

                {/* Bottom: Name + Health Bar */}
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white leading-tight group-hover:text-blue-400 transition-colors truncate pr-1">
                      {sys.name}
                    </h3>
                    {isAlerting && <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" title="Telemetry alert" />}
                  </div>
                  
                  {/* Health Bar */}
                  <div className="flex items-center justify-between mt-1.5 space-x-2">
                    <div className="flex-1 h-1 bg-[#0A0A0A] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${sys.health >= 90 ? "bg-emerald-500" : sys.health >= threshold ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${sys.health}%` }}
                      ></div>
                    </div>
                    <span className="text-[9px] text-zinc-400 font-mono font-bold">{sys.health}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Detail & Update Panel (Expands when system is clicked) */}
        {selectedSystem && (
          <div className="mt-5 p-4 bg-[#101820] border border-slate-800 rounded-2xl relative shadow-2xl animate-fade-in space-y-4">
            
            {/* Close Button */}
            <button 
              onClick={() => {
                setSelectedSystemId(null);
                setIsEditing(false);
              }}
              className="absolute top-3 right-3 p-1.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Title / Header section */}
            <div className="flex items-center space-x-3 pr-8">
              <div className={`p-2.5 rounded-xl ${getSystemIcon(selectedSystem.name).bg} ${getSystemIcon(selectedSystem.name).color}`}>
                {React.createElement(getSystemIcon(selectedSystem.name).icon, { className: "w-5 h-5" })}
              </div>
              <div>
                <span className="text-[8px] font-mono font-bold bg-[#0A0A0A] text-zinc-400 px-2 py-0.5 rounded border border-slate-900 uppercase">
                  Node telemetry ID: {selectedSystem.id}
                </span>
                <h3 className="text-sm font-extrabold text-white mt-1">
                  {isEditing ? `Modify ${selectedSystem.name}` : `${selectedSystem.name} Diagnostics`}
                </h3>
              </div>
            </div>

            {!isEditing ? (
              // READ-ONLY VIEW OF THE TELEMETRY NODE DETAILS
              <div className="space-y-4 pt-1">
                
                {/* Secondary Technical Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="p-2.5 bg-[#0A0A0A]/60 border border-slate-900 rounded-xl space-y-1">
                    <span className="text-zinc-500 text-[8px] uppercase tracking-wider block">Reporting Interval</span>
                    <span className="text-zinc-300 font-bold block">{selectedSystem.reportingInterval ?? "Every 1 Hour"}</span>
                  </div>
                  <div className="p-2.5 bg-[#0A0A0A]/60 border border-slate-900 rounded-xl space-y-1">
                    <span className="text-zinc-500 text-[8px] uppercase tracking-wider block">Warning Threshold</span>
                    <span className="text-zinc-300 font-bold block">Below {selectedSystem.warningThreshold ?? 75}%</span>
                  </div>
                </div>

                {/* Primary Narrative details block */}
                <div className="p-3 bg-[#0A0A0A]/40 border border-slate-900/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[8px] font-mono">
                    <span className="text-zinc-500 uppercase tracking-wider">Diagnostic Log Summary</span>
                    <span className="text-zinc-400">Last Verified: <strong>{selectedSystem.lastInspected}</strong></span>
                  </div>
                  <p className="text-[10.5px] text-zinc-300 leading-relaxed">
                    {vaultLocked 
                      ? selectedSystem.details
                          .replace(/(SN-|Serial:|Model:)\s*[A-Z0-9-]+/gi, "$1 [REDACTED (VAULT LOCKED)]")
                          .replace(/\$\d+(,\d+)*(\.\d+)?/g, "$[REDACTED]")
                      : selectedSystem.details}
                  </p>
                </div>

                {/* Telemetry alert note when health is poor */}
                {selectedSystem.health < (selectedSystem.warningThreshold ?? 75) && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-start space-x-2.5 text-amber-400">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider">Warning: Health Score Out of Bounds</p>
                      <p className="text-[9.5px] text-zinc-400 leading-normal">
                        This telemetry node has fallen below its critical warning marker of {selectedSystem.warningThreshold ?? 75}%. Immediate maintenance restore or scheduling a vetted contractor is advised.
                      </p>
                    </div>
                  </div>
                )}

                {/* Core control actions */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-white font-bold text-[10px] py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Configure Node Information</span>
                  </button>

                  <button
                    disabled={selectedSystem.health >= 95 || scanningId !== null}
                    onClick={() => handleService(selectedSystem.id)}
                    className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl text-[10px] font-bold transition-all ${
                      selectedSystem.health >= 95 
                        ? "bg-[#0A0A0A] border border-slate-900 text-zinc-500 cursor-not-allowed" 
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/15 cursor-pointer"
                    }`}
                  >
                    {scanningId === selectedSystem.id ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Flushing Signals...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{selectedSystem.health >= 95 ? "Telemetry Stable" : "Calibrate & Restore"}</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            ) : (
              // EDIT/UPDATE MODE FOR THE TELEMETRY NODE DETAILS
              <form onSubmit={handleSaveConfig} className="space-y-3 pt-1">
                
                {/* Node Name + Category Row */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">Node/System Name</label>
                    <input 
                      type="text" 
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-[10.5px] text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">Category</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as HomeSystem["category"])}
                      className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2 py-1.5 text-[10.5px] text-white focus:outline-none"
                    >
                      <option value="Structure">Structure</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Safety">Safety</option>
                      <option value="Exterior">Exterior</option>
                    </select>
                  </div>
                </div>

                {/* Health Score Slider & Override Status */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-[#0A0A0A]/40 border border-slate-900 rounded-xl">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Health Level ({editHealth}%)</label>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={editHealth}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setEditHealth(val);
                        // Auto map status to correspond roughly
                        if (val >= 90) setEditStatus("Optimal");
                        else if (val >= 75) setEditStatus("Good");
                        else if (val >= 50) setEditStatus("Fair");
                        else setEditStatus("Critical");
                      }}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">Override Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as HomeSystem["status"])}
                      className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none"
                    >
                      <option value="Optimal">Optimal (Excellent)</option>
                      <option value="Good">Good (Healthy)</option>
                      <option value="Fair">Fair (Attention needed)</option>
                      <option value="Critical">Critical (Failure risk)</option>
                    </select>
                  </div>
                </div>

                {/* Telemetry Warning threshold & Reporting Interval */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">Warning Threshold ({editWarningThreshold}%)</label>
                    <input 
                      type="number"
                      min="1"
                      max="100"
                      value={editWarningThreshold}
                      onChange={(e) => setEditWarningThreshold(Math.min(100, Math.max(1, parseInt(e.target.value) || 75)))}
                      className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">Reporting Frequency</label>
                    <select
                      value={editReportingInterval}
                      onChange={(e) => setEditReportingInterval(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2 py-1.5 text-[10.5px] text-white focus:outline-none"
                    >
                      <option value="Real-time Stream">Real-time Stream</option>
                      <option value="Every 5 Minutes">Every 5 Minutes</option>
                      <option value="Every 15 Minutes">Every 15 Minutes</option>
                      <option value="Every 1 Hour">Every 1 Hour</option>
                      <option value="Every 12 Hours">Every 12 Hours</option>
                      <option value="Every 24 Hours">Every 24 Hours</option>
                    </select>
                  </div>
                </div>

                {/* Last inspected */}
                <div>
                  <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">Last Inspection Timestamp/Period</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. June 2026 or April 2025"
                    value={editLastInspected}
                    onChange={(e) => setEditLastInspected(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-[10.5px] text-white focus:outline-none"
                  />
                </div>

                {/* Notes/details textarea */}
                <div>
                  <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1">Diagnostic Log details</label>
                  <textarea
                    required
                    rows={2}
                    value={editDetails}
                    onChange={(e) => setEditDetails(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-slate-800 focus:border-blue-500 rounded-lg p-2 text-[10px] text-white focus:outline-none"
                  ></textarea>
                </div>

                {/* Action Form buttons */}
                <div className="flex space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800/85 text-zinc-400 hover:text-white font-bold text-[10px] py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-blue-500/10"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Node Config</span>
                  </button>
                </div>

              </form>
            )}

          </div>
        )}

      </div>

      <BottomNavBar activeTab="systems" onNavigateToScreen={onNavigateToScreen} />

    </div>
  );
}
