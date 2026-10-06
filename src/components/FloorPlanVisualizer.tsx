import React from "react";
import { 
  Home, 
  ChevronLeft, 
  Sparkles, 
  Gauge, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Settings, 
  Wrench, 
  Plus, 
  Layers, 
  CheckSquare, 
  Square, 
  Zap, 
  ChefHat, 
  Flame, 
  Droplets, 
  Search,
  Eye,
  Activity,
  User,
  Compass
} from "lucide-react";
import { MaintenanceTask, HomeSystem, SavingsItem } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface RoomData {
  id: string;
  name: string;
  level: "Upper" | "Main" | "Lower & Exterior";
  sqft: string;
  description: string;
  systemIds: string[]; // Associated HomeSystem IDs
  icon: React.ComponentType<any>;
}

const ROOMS_CONFIG: RoomData[] = [
  {
    id: "room_attic",
    name: "Attic & Roof Crown",
    level: "Upper",
    sqft: "950 sq ft",
    description: "Thermal ceiling envelope, roof shingles, rafters, and secondary duct insulation barriers.",
    systemIds: ["sys_1", "sys_2"],
    icon: Home
  },
  {
    id: "room_master",
    name: "Master Suite & Bath",
    level: "Upper",
    sqft: "420 sq ft",
    description: "Wet-wall supply connections, master sub-circuits, compression plumbing valves, and safety sensors.",
    systemIds: ["sys_3", "sys_4", "sys_7"],
    icon: User
  },
  {
    id: "room_kitchen",
    name: "Gourmet Kitchen",
    level: "Main",
    sqft: "340 sq ft",
    description: "High-power appliances, kitchen sink plumbing, water lines, disposal valves, and wet-zone GFCI outlets.",
    systemIds: ["sys_3", "sys_6"],
    icon: ChefHat
  },
  {
    id: "room_living",
    name: "Living & Entry Hall",
    level: "Main",
    sqft: "680 sq ft",
    description: "Primary electric heat pump thermostat, structural foundation support walls, and window draft seals.",
    systemIds: ["sys_2", "sys_5", "sys_7"],
    icon: Compass
  },
  {
    id: "room_basement",
    name: "Basement & Utility Hub",
    level: "Lower & Exterior",
    sqft: "510 sq ft",
    description: "Main electrical distribution panel, central water heater, water meters, sump pump pit, and foundation footing.",
    systemIds: ["sys_3", "sys_4", "sys_5"],
    icon: Zap
  },
  {
    id: "room_exterior",
    name: "Exterior Perimeter",
    level: "Lower & Exterior",
    sqft: "N/A",
    description: "Siding protective caulk, gutter rain paths, exterior dryer exhausts, and deck footings.",
    systemIds: ["sys_8"],
    icon: Activity
  }
];

interface FloorPlanVisualizerProps {
  tasks: MaintenanceTask[];
  systems: HomeSystem[];
  onToggleTask: (id: string) => void;
  onNavigateToScreen: (screenId: string) => void;
  onUpdateSystemHealth: (systemId: string, healthChange: number) => void;
  onAddTask: (task: MaintenanceTask) => void;
}

export default function FloorPlanVisualizer({
  tasks,
  systems,
  onToggleTask,
  onNavigateToScreen,
  onUpdateSystemHealth,
  onAddTask
}: FloorPlanVisualizerProps) {
  const [selectedRoomId, setSelectedRoomId] = React.useState<string>("room_basement");
  const [activeFloorFilter, setActiveFloorFilter] = React.useState<"All" | "Upper" | "Main" | "Lower & Exterior">("All");
  
  // Real-time diagnostic scanning simulation state
  const [isScanning, setIsScanning] = React.useState(false);
  const [scanProgress, setScanProgress] = React.useState(0);
  const [scanLogs, setScanLogs] = React.useState<string[]>([]);
  
  // Custom quick task form state
  const [showAddTaskForm, setShowAddTaskForm] = React.useState(false);
  const [newTaskTitle, setNewTaskTitle] = React.useState("");
  const [newTaskPriority, setNewTaskPriority] = React.useState<"High" | "Medium" | "Low">("Medium");

  // Local notification toasts
  const [localToast, setLocalToast] = React.useState<string | null>(null);

  const triggerLocalToast = (msg: string) => {
    setLocalToast(msg);
    setTimeout(() => setLocalToast(null), 4000);
  };

  const selectedRoom = ROOMS_CONFIG.find(r => r.id === selectedRoomId) || ROOMS_CONFIG[4];

  // Helper: calculate average health of a room based on its associated systems
  const getRoomHealth = (room: RoomData) => {
    const associated = systems.filter(s => room.systemIds.includes(s.id));
    if (associated.length === 0) return 100;
    const totalHealth = associated.reduce((sum, s) => sum + s.health, 0);
    return Math.round(totalHealth / associated.length);
  };

  const getHealthColor = (health: number) => {
    if (health >= 90) return { border: "border-emerald-500/40", bg: "bg-emerald-500/10", text: "text-emerald-400", pulse: "bg-emerald-500/30" };
    if (health >= 75) return { border: "border-cyan-500/40", bg: "bg-cyan-500/10", text: "text-cyan-400", pulse: "bg-cyan-500/20" };
    if (health >= 60) return { border: "border-amber-500/45", bg: "bg-amber-500/10", text: "text-amber-400", pulse: "bg-amber-500/40" };
    return { border: "border-red-500/50", bg: "bg-red-500/15", text: "text-red-400", pulse: "bg-red-500/50" };
  };

  // Helper to filter tasks associated with a room
  const getRoomTasks = (room: RoomData) => {
    // Standard matches either direct task location (by room name keywords) OR system name
    const roomSystemsNames = systems
      .filter(s => room.systemIds.includes(s.id))
      .map(s => s.name.toLowerCase());

    return tasks.filter(task => {
      const taskWhere = task.where.toLowerCase();
      const taskTitle = task.title.toLowerCase();
      const taskHow = task.how.toLowerCase();

      // Check if location string hints at this room name
      const roomKeywords = room.name.toLowerCase().split(" ");
      const matchKeyword = roomKeywords.some(kw => kw.length > 3 && (taskWhere.includes(kw) || taskTitle.includes(kw) || taskHow.includes(kw)));
      
      // Or if the task describes one of the systems in this room
      const matchSystem = roomSystemsNames.some(sysName => taskTitle.includes(sysName) || taskHow.includes(sysName));

      return matchKeyword || matchSystem;
    });
  };

  // Simulating an active diagnostic sensor sweep
  const handleTriggerSelfScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    setScanLogs(["Initializing spatial telemetry nodes...", "Deploying local diagnostic sweep..."]);

    const logsList = [
      "Connecting to main electrical panel diagnostics...",
      "Calibrating heat pump convective pressure...",
      "Probing water pressure lines and valve shutoffs...",
      "Verifying smoke & electrochemical safety detectors...",
      "Scanning exterior cladding insulation boundaries...",
      "Synthesizing spatial diagnostics report..."
    ];

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setScanProgress(currentProgress);

      // Append logs dynamically
      if (currentProgress === 20) setScanLogs(p => [...p, logsList[0]]);
      if (currentProgress === 40) setScanLogs(p => [...p, logsList[1]]);
      if (currentProgress === 60) setScanLogs(p => [...p, logsList[2], logsList[3]]);
      if (currentProgress === 80) setScanLogs(p => [...p, logsList[4]]);
      if (currentProgress === 95) setScanLogs(p => [...p, logsList[5]]);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        
        // Boost health of all systems in this room
        selectedRoom.systemIds.forEach(sysId => {
          onUpdateSystemHealth(sysId, 8); // boost health of associated systems
        });

        triggerLocalToast(`Scan Completed! Associated systems calibrated. Health boosted up to +8%.`);
      }
    }, 150);
  };

  const handleCreateRoomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: MaintenanceTask = {
      id: `task_room_${Date.now()}`,
      title: newTaskTitle,
      due: "June 10, 2025",
      priority: newTaskPriority,
      why: `Sourced from floor-plan visualizer inspection in "${selectedRoom.name}".`,
      how: `Inspect active components located inside the ${selectedRoom.name}. Resolve immediate warnings.`,
      who: "Owner Self-stewardship",
      where: selectedRoom.name,
      completed: false
    };

    onAddTask(newTask);
    setNewTaskTitle("");
    setShowAddTaskForm(false);
    triggerLocalToast(`Custom task added to ${selectedRoom.name}!`);
  };

  // Group rooms by floor levels
  const filteredRooms = ROOMS_CONFIG.filter(r => {
    if (activeFloorFilter === "All") return true;
    return r.level === activeFloorFilter;
  });

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0A0A0A] text-white font-sans relative">
      
      {/* Background ambient radial glow effect */}
      <div className="absolute top-1/4 left-1/4 w-36 h-36 bg-blue-500/10 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-36 h-36 bg-indigo-500/10 rounded-full filter blur-[100px] pointer-events-none"></div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-24 scrollbar-none">
        
        {/* Navigation back and header */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => onNavigateToScreen("screen-dashboard")}
            className="flex items-center space-x-1.5 text-xs text-blue-400 hover:text-blue-300 font-mono cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          
          <div className="flex items-center space-x-1.5 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Spatial Visualizer</span>
          </div>
        </div>

        {/* Local Toast Feed */}
        <AnimatePresence>
          {localToast && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-4 p-3 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-300 text-[10.5px] text-left flex items-center space-x-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 animate-pulse" />
              <span>{localToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Titles */}
        <div className="mb-4 text-left">
          <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">System Mapping</span>
          <h2 className="text-xl font-extrabold tracking-tight text-white font-display">Interactive Floor Plan</h2>
          <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
            Tap highlighted nodes or rooms to filter pending maintenance schedules and isolate system statuses locally.
          </p>
        </div>

        {/* Floor Level Filter Bar */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-2.5 mb-3.5 border-b border-slate-900 scrollbar-none">
          {[
            { id: "All", label: "Whole House" },
            { id: "Upper", label: "Upper Floor" },
            { id: "Main", label: "Main Floor" },
            { id: "Lower & Exterior", label: "Basement / Yard" }
          ].map((fl) => (
            <button
              key={fl.id}
              onClick={() => setActiveFloorFilter(fl.id as any)}
              className={`py-1 px-3 rounded-full text-[10.5px] font-bold font-mono border whitespace-nowrap transition-all cursor-pointer ${
                activeFloorFilter === fl.id 
                  ? "bg-blue-600/15 border-blue-500 text-blue-400" 
                  : "bg-black/45 border-slate-800/80 hover:border-slate-700 text-zinc-400 hover:text-white"
              }`}
            >
              {fl.label}
            </button>
          ))}
        </div>

        {/* Floor Plan Architectural Grid Map */}
        <div className="bg-[#101820]/65 border border-slate-800/80 rounded-2xl p-4 mb-5 shadow-xl">
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-widest">Architectural Live Grid</span>
            <span className="text-[8.5px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              Pulse Telemetry Live
            </span>
          </div>

          {/* Grid Blueprint representation of the home */}
          <div className="grid grid-cols-2 gap-3 mb-2">
            {filteredRooms.map((room) => {
              const hScore = getRoomHealth(room);
              const isSelected = room.id === selectedRoomId;
              const hStyles = getHealthColor(hScore);
              const RoomIcon = room.icon;

              return (
                <button
                  key={room.id}
                  onClick={() => {
                    setSelectedRoomId(room.id);
                    setShowAddTaskForm(false);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                    isSelected 
                      ? "bg-blue-950/20 border-blue-500 shadow-blue-500/5 shadow-md" 
                      : "bg-[#090F14] border-slate-900/90 hover:border-slate-800"
                  }`}
                >
                  {/* Subtle health status glow border inside the cell */}
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${hScore >= 90 ? "bg-emerald-500" : hScore >= 75 ? "bg-cyan-500" : hScore >= 60 ? "bg-amber-500" : "bg-red-500"}`}></div>

                  <div className="flex items-center justify-between mb-1 ml-1.5">
                    <RoomIcon className={`w-4 h-4 ${isSelected ? "text-blue-400" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                    <span className={`text-[9px] font-mono font-bold px-1 py-0.5 rounded ${hStyles.bg} ${hStyles.text}`}>
                      {hScore}% Health
                    </span>
                  </div>

                  <div className="ml-1.5 mt-1.5">
                    <p className="text-[10.5px] font-bold text-white tracking-wide truncate group-hover:text-blue-400 transition-colors">
                      {room.name}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[8px] font-mono text-zinc-500">{room.sqft}</span>
                      <span className="text-[8px] font-mono text-zinc-500 uppercase">{room.level}</span>
                    </div>
                  </div>

                  {/* Pulsing indicator if room has issues */}
                  {hScore < 80 && (
                    <div className="absolute top-2 right-2 flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hStyles.pulse}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${hScore >= 60 ? "bg-amber-500" : "bg-red-500"}`}></span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-[8.5px] text-zinc-500 text-center mt-2.5 font-mono">
            *Tap a room module to view its full spatial diagnostics HUD below.
          </p>
        </div>

        {/* Selected Room Active Detail HUD */}
        <div className="bg-[#101820]/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl text-left relative overflow-hidden">
          
          {/* Header inside selected HUD */}
          <div className="flex items-start justify-between mb-3.5 pb-3 border-b border-slate-900">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[8.5px] font-mono font-bold text-blue-400 uppercase tracking-wide bg-blue-500/10 px-1.5 py-0.2 rounded">
                  {selectedRoom.level} LEVEL
                </span>
                <span className="text-[8.5px] font-mono text-zinc-500">{selectedRoom.sqft}</span>
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight mt-1">{selectedRoom.name}</h3>
              <p className="text-[9.5px] text-zinc-400 mt-1 leading-normal">{selectedRoom.description}</p>
            </div>
            
            {/* Health Meter Widget */}
            <div className="text-right flex flex-col items-end">
              <span className="text-[8px] font-mono text-zinc-500 uppercase">Avg Room Health</span>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className={`text-xl font-extrabold tracking-tight ${getHealthColor(getRoomHealth(selectedRoom)).text}`}>
                  {getRoomHealth(selectedRoom)}%
                </span>
              </div>
            </div>
          </div>

          {/* Diagnostic Active Scanner Panel */}
          <div className="mb-4">
            {isScanning ? (
              <div className="bg-black/55 border border-blue-500/30 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9.5px] font-mono text-blue-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 animate-spin" />
                    Scanning Room Telemetry Nodes...
                  </span>
                  <span className="text-[9.5px] font-mono text-white font-bold">{scanProgress}%</span>
                </div>
                
                {/* Scan Progress Bar */}
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden mb-2.5">
                  <div className="h-full bg-blue-500 transition-all duration-150" style={{ width: `${scanProgress}%` }}></div>
                </div>

                {/* Displaying raw sweep logs */}
                <div className="space-y-1 max-h-16 overflow-y-auto font-mono text-[8px] text-zinc-500 scrollbar-none">
                  {scanLogs.map((log, index) => (
                    <div key={index} className="flex items-start gap-1">
                      <span className="text-blue-500 font-bold">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={handleTriggerSelfScan}
                className="w-full py-2 px-3 bg-blue-600/10 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 hover:text-white font-mono font-bold text-[10px] rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Simulate Room Telemetry Sweep</span>
              </button>
            )}
          </div>

          {/* Associated Telemetry Systems list in Room */}
          <div className="mb-4.5">
            <h4 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-zinc-500" />
              Systems Located in Room
            </h4>
            
            <div className="space-y-2">
              {systems
                .filter(s => selectedRoom.systemIds.includes(s.id))
                .map((sys) => {
                  const sStyles = getHealthColor(sys.health);
                  return (
                    <div 
                      key={sys.id}
                      onClick={() => onNavigateToScreen("screen-systems")}
                      className="p-2 rounded-xl bg-black/45 border border-slate-900 hover:border-slate-800 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-2 h-2 rounded-full ${sys.health >= 90 ? "bg-emerald-500" : sys.health >= 75 ? "bg-cyan-500" : sys.health >= 60 ? "bg-amber-500" : "bg-red-500"}`}></div>
                        <div>
                          <p className="text-[10px] font-bold text-white group-hover:text-blue-400 transition-colors">{sys.name}</p>
                          <p className="text-[8.5px] text-zinc-500 leading-none mt-0.5">Last Check: {sys.lastInspected}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <div className="text-right">
                          <p className={`text-[10.5px] font-bold font-mono ${sStyles.text}`}>{sys.health}%</p>
                          <p className="text-[7.5px] text-zinc-500 uppercase font-mono">{sys.status}</p>
                        </div>
                        <ChevronLeft className="w-3.5 h-3.5 text-zinc-600 rotate-180 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>

          {/* Associated Pending Maintenance Tasks in Room */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-zinc-500" />
                Pending Room Actions
              </h4>
              
              <button
                onClick={() => setShowAddTaskForm(!showAddTaskForm)}
                className="text-[9px] font-mono text-blue-400 hover:text-white flex items-center space-x-1 border border-blue-500/10 px-1.5 py-0.2 rounded hover:bg-blue-500/10 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Quick Add Task</span>
              </button>
            </div>

            {/* Quick add task inline Form */}
            <AnimatePresence>
              {showAddTaskForm && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateRoomTask}
                  className="mb-3.5 p-3 rounded-xl bg-slate-950 border border-blue-500/15 text-left overflow-hidden space-y-2.5"
                >
                  <p className="text-[9px] font-mono text-zinc-500 uppercase">New task inside: {selectedRoom.name}</p>
                  
                  <div>
                    <input 
                      type="text" 
                      placeholder="e.g. Clean kitchen faucet aerators"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full bg-[#101820] border border-slate-800 focus:border-blue-500 rounded px-2 py-1 text-[10px] text-white placeholder-zinc-500"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[8px] font-mono text-zinc-400">Priority:</span>
                      {(["High", "Medium", "Low"] as const).map((pr) => (
                        <button
                          type="button"
                          key={pr}
                          onClick={() => setNewTaskPriority(pr)}
                          className={`px-1.5 py-0.5 text-[8.5px] font-mono font-bold rounded border ${
                            newTaskPriority === pr 
                              ? "bg-blue-500/20 border-blue-500 text-blue-400" 
                              : "bg-black/45 border-slate-900 text-zinc-500"
                          }`}
                        >
                          {pr}
                        </button>
                      ))}
                    </div>

                    <div className="flex space-x-1.5">
                      <button 
                        type="button" 
                        onClick={() => setShowAddTaskForm(false)} 
                        className="px-2 py-0.5 text-[8.5px] font-mono text-zinc-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-2.5 py-0.5 bg-blue-600 text-white font-bold text-[8.5px] rounded-lg"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* List room-specific tasks */}
            <div className="space-y-2">
              {getRoomTasks(selectedRoom).length === 0 ? (
                <div className="p-3 text-center rounded-xl bg-slate-950/35 border border-dashed border-slate-900 text-[9px] text-zinc-500 leading-normal">
                  All systems in this room are running optimally. No actions pending.
                </div>
              ) : (
                getRoomTasks(selectedRoom).map((task) => (
                  <div 
                    key={task.id}
                    onClick={() => onToggleTask(task.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      task.completed 
                        ? "bg-emerald-950/5 border-emerald-500/10 opacity-60" 
                        : "bg-black/45 border-slate-900 hover:border-slate-800"
                    }`}
                  >
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTask(task.id);
                      }}
                      className="mt-0.5 text-zinc-500 hover:text-blue-400 transition-colors"
                    >
                      {task.completed ? (
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-700" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] font-bold ${task.completed ? "line-through text-zinc-500" : "text-white"} leading-tight truncate`}>
                        {task.title}
                      </p>
                      <p className="text-[8.5px] text-zinc-500 mt-0.5 truncate leading-none">Due: {task.due} &bull; {task.priority} Priority</p>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

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
        <button onClick={() => onNavigateToScreen("screen-profile")} className="flex flex-col items-center space-y-1 text-[#22D3EE] font-medium transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          <span className="text-[9px] font-bold uppercase tracking-wider">More</span>
        </button>
      </div>

    </div>
  );
}
