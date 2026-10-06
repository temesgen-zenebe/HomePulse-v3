import React from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Circle,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Loader2,
  GripVertical,
  Star,
  RefreshCw,
  Clock,
  Activity,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Film,
  X,
  Shield,
  Coins,
  TrendingUp,
  Info,
  Check,
  Flame,
  Droplets,
  Filter,
  Hammer
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MaintenanceTask, HomeSystem, PriorityLevel } from "../types";
import BottomNavBar from "./BottomNavBar";
import CalendarDetailScreen from "./CalendarDetailScreen";

interface CalendarScreenProps {
  tasks: MaintenanceTask[];
  systems: HomeSystem[];
  onToggleTask: (taskId: string) => void;
  onNavigateToScreen: (screenId: string) => void;
  onUpdateTasks: (tasks: MaintenanceTask[]) => void;
}

export default function CalendarScreen({ 
  tasks, 
  systems, 
  onToggleTask, 
  onNavigateToScreen,
  onUpdateTasks 
}: CalendarScreenProps) {
  const [selectedDay, setSelectedDay] = React.useState<number | null>(10);
  const [isOptimizing, setIsOptimizing] = React.useState(false);
  const [aiOverview, setAiOverview] = React.useState<string | null>(null);
  const [aiReasonings, setAiReasonings] = React.useState<Record<string, string>>({});
  const [lastOptimizedAt, setLastOptimizedAt] = React.useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  // --- PREVENTIVE CALENDAR SEQUENCE DETAILED VIEW STATES ---
  const [activeDetailTask, setActiveDetailTask] = React.useState<MaintenanceTask | null>(null);
  const [activeDetailTaskIndex, setActiveDetailTaskIndex] = React.useState<number | null>(null);

  const handleOpenSequenceDetail = (task: MaintenanceTask, index: number) => {
    setActiveDetailTask(task);
    setActiveDetailTaskIndex(index);
  };

  const handleCloseSequenceDetail = () => {
    setActiveDetailTask(null);
    setActiveDetailTaskIndex(null);
  };

  // May 2025 starts on a Thursday (4 vacant cells)
  const daysInMonth = 31;
  const startOffset = 4; // vacant boxes

  // Map task due dates to calendar days dynamically
  const taskDays = React.useMemo(() => {
    return tasks.reduce((acc: Record<number, MaintenanceTask>, task) => {
      const match = task.due.match(/May\s+(\d+)/i);
      if (match) {
        const dayNum = parseInt(match[1]);
        acc[dayNum] = task;
      }
      return acc;
    }, {});
  }, [tasks]);

  const renderDays = () => {
    const cells = [];
    
    // Empty cells for alignment
    for (let i = 0; i < startOffset; i++) {
      cells.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    // Days 1 to 31
    for (let day = 1; day <= daysInMonth; day++) {
      const task = taskDays[day];
      const isSelected = day === selectedDay;
      
      let dayStyle = "text-zinc-400 hover:text-white hover:bg-white/5";
      let indicator = null;

      if (task) {
        if (task.completed) {
          dayStyle = isSelected 
            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50" 
            : "text-emerald-400 border border-emerald-500/10 hover:bg-emerald-500/10";
          indicator = <div className="absolute bottom-1 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>;
        } else {
          // Priority colors
          if (task.priority === "High") {
            dayStyle = isSelected 
              ? "bg-red-500/20 text-red-400 border border-red-500/50 font-bold" 
              : "text-red-400 border border-red-500/15 hover:bg-red-500/10 font-semibold";
            indicator = <div className="absolute bottom-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>;
          } else if (task.priority === "Medium") {
            dayStyle = isSelected 
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/50 font-bold" 
              : "text-amber-400 border border-amber-500/15 hover:bg-amber-500/10 font-semibold";
            indicator = <div className="absolute bottom-1 w-1.5 h-1.5 bg-amber-500 rounded-full"></div>;
          } else {
            dayStyle = isSelected 
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/50 font-bold" 
              : "text-blue-400 border border-blue-500/15 hover:bg-blue-500/10 font-semibold";
            indicator = <div className="absolute bottom-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>;
          }
        }
      } else if (isSelected) {
        dayStyle = "bg-zinc-850 text-white font-bold rounded-lg border border-zinc-700 shadow-md";
      }

      cells.push(
        <button
          key={`day-${day}`}
          id={`calendar-day-${day}`}
          onClick={() => setSelectedDay(day)}
          className={`w-8 h-8 rounded-lg text-[10px] flex flex-col items-center justify-center relative transition-all ${dayStyle}`}
        >
          <span>{day}</span>
          {indicator}
        </button>
      );
    }

    return cells;
  };

  const activeTask = selectedDay ? taskDays[selectedDay] : null;

  // Reordering helper to keep due dates in sync with priorities list index sequence
  const updateDatesBySequence = (updatedList: MaintenanceTask[]) => {
    const defaultDates = [10, 12, 15, 28, 5, 18, 20, 22, 25];
    const adjusted = updatedList.map((t, idx) => {
      const day = defaultDates[idx] || (3 + idx * 3);
      return {
        ...t,
        due: `May ${day}, 2025`
      };
    });
    onUpdateTasks(adjusted);
  };

  // Drag-and-drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const updated = [...tasks];
    const [removed] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, removed);
    
    updateDatesBySequence(updated);
    setDraggedIndex(null);
  };

  // Click-to-move arrows for absolute safety and convenience
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...tasks];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    updateDatesBySequence(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === tasks.length - 1) return;
    const updated = [...tasks];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    updateDatesBySequence(updated);
  };

  // Inline dropdown changes
  const handlePriorityChange = (taskId: string, priority: "High" | "Medium" | "Low") => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, priority } : t);
    onUpdateTasks(updated);
  };

  const handleAiReorder = async () => {
    setIsOptimizing(true);
    setAiOverview(null);
    try {
      const response = await fetch("/api/reorder-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks, systems })
      });
      
      if (!response.ok) {
        throw new Error(`Server returned HTTP status ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server did not return a JSON response");
      }

      const data = await response.json();
      
      if (data.orderedTaskIds && Array.isArray(data.orderedTaskIds)) {
        const taskMap = new Map(tasks.map(t => [t.id, t]));
        const reorderedList: MaintenanceTask[] = [];
        
        data.orderedTaskIds.forEach((id: string) => {
          const task = taskMap.get(id);
          if (task) {
            reorderedList.push(task);
            taskMap.delete(id);
          }
        });
        
        taskMap.forEach(task => {
          reorderedList.push(task);
        });

        // Set sequence dates
        const defaultDates = [10, 12, 15, 28, 5, 18, 20, 22, 25];
        const adjusted = reorderedList.map((t, idx) => {
          const day = defaultDates[idx] || (3 + idx * 3);
          return {
            ...t,
            due: `May ${day}, 2025`
          };
        });

        onUpdateTasks(adjusted);
        setAiReasonings(data.reasonings || {});
        setAiOverview(data.overview);
        setLastOptimizedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        
        // Auto select first reordered task day
        const match = adjusted[0]?.due.match(/May\s+(\d+)/i);
        if (match) {
          setSelectedDay(parseInt(match[1]));
        }
      }
    } catch (error) {
      console.warn("API reordering failed, falling back to client-side rule-engine optimization.", error);
      
      const scoredTasks = tasks.map((task: MaintenanceTask) => {
        let score = 0;
        let systemName = "General";
        
        if (task.completed) {
          score = -1000;
        } else {
          if (task.priority === "High") score += 50;
          else if (task.priority === "Medium") score += 30;
          else score += 10;

          const titleLower = (task.title || "").toLowerCase();
          const whyLower = (task.why || "").toLowerCase();
          
          const matchingSystem = systems.find((sys: HomeSystem) => {
            const sysName = (sys.name || "").toLowerCase();
            const sysCat = (sys.category || "").toLowerCase();
            return titleLower.includes(sysName) || 
                   whyLower.includes(sysName) || 
                   titleLower.includes(sysCat) || 
                   whyLower.includes(sysCat);
          });

          if (matchingSystem) {
            systemName = matchingSystem.name;
            const systemRisk = 100 - (matchingSystem.health || 80);
            score += systemRisk * 1.8;
          }
        }
        return { id: task.id, score, title: task.title, systemName };
      });

      const sortedTasks = [...scoredTasks].sort((a: any, b: any) => b.score - a.score);
      const orderedTaskIds = sortedTasks.map((t: any) => t.id);
      
      const fallbackReasonings = sortedTasks.reduce((acc: Record<string, string>, t: any) => {
        if (t.score === -1000) {
          acc[t.id] = `"${t.title}" is already complete. Placed at lower priority.`;
        } else {
          acc[t.id] = `Scheduled based on ${t.systemName} health and preset priority weight of ${t.score.toFixed(0)} points.`;
        }
        return acc;
      }, {});

      const taskMap = new Map(tasks.map(t => [t.id, t]));
      const reorderedList: MaintenanceTask[] = [];
      
      orderedTaskIds.forEach((id: string) => {
        const task = taskMap.get(id);
        if (task) {
          reorderedList.push(task);
          taskMap.delete(id);
        }
      });
      
      taskMap.forEach(task => {
        reorderedList.push(task);
      });

      const defaultDates = [10, 12, 15, 28, 5, 18, 20, 22, 25];
      const adjusted = reorderedList.map((t, idx) => {
        const day = defaultDates[idx] || (3 + idx * 3);
        return {
          ...t,
          due: `May ${day}, 2025`
        };
      });

      onUpdateTasks(adjusted);
      setAiReasonings(fallbackReasonings);
      setAiOverview("Prioritized maintenance workflow based on local system urgency and risk vectors.");
      setLastOptimizedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      
      const match = adjusted[0]?.due.match(/May\s+(\d+)/i);
      if (match) {
        setSelectedDay(parseInt(match[1]));
      }
    } finally {
      setIsOptimizing(false);
    }
  };

  // Get system health status details
  const getSystemHealthForTask = (task: MaintenanceTask) => {
    const titleLower = task.title.toLowerCase();
    const whyLower = task.why.toLowerCase();
    const match = systems.find(sys => {
      const sysName = sys.name.toLowerCase();
      const sysCat = sys.category.toLowerCase();
      return titleLower.includes(sysName) || 
             whyLower.includes(sysName) || 
             titleLower.includes(sysCat) || 
             whyLower.includes(sysCat);
    });
    return match ? { name: match.name, health: match.health } : null;
  };

  const getSubStepsForTask = (taskId: string) => {
    switch (taskId) {
      case "task_1":
        return [
          "Turn off the HVAC power at the thermostat/circuit breaker",
          "Locate return register grille (ceiling intake or wall register)",
          "Unfasten frame latch knobs and swing open outer intake door",
          "Remove old dirty 20x25x1 MERV 11 fiberglass filter carefully",
          "Insert pristine replacement filter with flow arrow pointing in",
          "Seal intake frame latch, secure latch handles, restore power"
        ];
      case "task_2":
        return [
          "Set up the rugged extension ladder on level turf with stabilizer pads",
          "Equip protective safety goggles and double-layered work gloves",
          "Manually clear thick leaf debris, twigs, and clay silt from gutters",
          "Siphon and flush gutter troughs with a garden hose jet nozzle",
          "Inspect downspout curves for active blockages or drainage clogs",
          "Install downspout mesh screens to deflect forthcoming rain runoff"
        ];
      case "task_3":
        return [
          "Cut electric breaker power to tank elements (or rotate gas valve to Pilot)",
          "Connect thick garden hose thread to base drainage brass spigot valve",
          "Deploy outdoor end of hose to safe soil garden or cellar floor sump",
          "Shut off the cold water intake supply valve on top of heater",
          "Open an interior hot water plumbing faucet upstairs to vent internal pressure",
          "Open water heater drain valve fully to discharge sediment"
        ];
      case "task_4":
        return [
          "Secure an A-frame step-ladder to reach ceiling-mounted casing safely",
          "Press and hold detector 'Test' button to verify horn alerts sound",
          "Unlatch detector lid, disconnect snap-plug terminal connector",
          "Slide out aging backup 9-Volt battery block from housing slot",
          "Install a new high-end lithium 9V battery block securely",
          "Attach snap-plug terminal, snap shut cover, and perform alarm re-test"
        ];
      default:
        return [
          "Inspect target mechanical system zone for loose screws or wear",
          "Wear protective gloves and select correct hand tools before starting",
          "Power off main electrical connections or lock out relevant switches",
          "Remove dust and clear debris from moving components or vents",
          "Align, tighten, or replace components according to manufacturer guide",
          "Restore power, run simulation check, and confirm green status indicator"
        ];
    }
  };

  const taskVideoDatabase: Record<string, string> = {
    "task_1": "https://assets.mixkit.co/videos/preview/mixkit-technician-working-on-an-air-conditioning-unit-43032-large.mp4",
    "task_2": "https://assets.mixkit.co/videos/preview/mixkit-rain-water-flowing-from-the-roof-gutter-42023-large.mp4",
    "task_3": "https://assets.mixkit.co/videos/preview/mixkit-plumber-working-with-pipes-43034-large.mp4",
    "task_4": "https://assets.mixkit.co/videos/preview/mixkit-glowing-red-fire-alarm-siren-light-41804-large.mp4"
  };

  if (activeDetailTask) {
    return (
      <CalendarDetailScreen
        task={activeDetailTask}
        taskIndex={activeDetailTaskIndex ?? 0}
        tasks={tasks}
        onToggleTask={onToggleTask}
        onNavigateToScreen={onNavigateToScreen}
        onClose={handleCloseSequenceDetail}
        systems={systems}
      />
    );
  }

  return (
    <div id="calendar-screen-container" className="w-full h-full flex flex-col justify-between bg-[#0A0A0A] text-white font-sans relative">
      
      {/* Dynamic Content */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-24 scrollbar-none space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Maintenance Calendar</span>
            <h2 className="text-xl font-extrabold tracking-tight text-white font-display">Schedule Care</h2>
          </div>
          <Calendar className="w-5 h-5 text-zinc-400" />
        </div>

        {/* Gemini AI Optimization Tool Section */}
        <div id="ai-reorder-card" className="bg-[#111625] border border-blue-500/20 rounded-2xl p-4 shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              </div>
              <div className="text-left">
                <h4 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>Gemini Care Prioritizer</span>
                  <span className="bg-blue-500/20 text-[8px] font-mono text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">Active</span>
                </h4>
                <p className="text-[9.5px] text-zinc-400 mt-0.5 leading-relaxed">
                  Automatically aligns tasks based on system wear thresholds and life-safety urgency indexes.
                </p>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {aiOverview && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3.5 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-left overflow-hidden"
              >
                <div className="flex items-center gap-1.5 text-blue-400 text-[10px] font-mono font-bold mb-1">
                  <Star className="w-3.5 h-3.5 fill-blue-400/20 text-blue-400" />
                  <span>AI Scheduling Intelligence</span>
                </div>
                <p className="text-[10px] text-zinc-300 leading-normal">
                  {aiOverview}
                </p>
                {lastOptimizedAt && (
                  <span className="text-[8px] text-zinc-500 font-mono block mt-1.5">
                    Optimized today at {lastOptimizedAt}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-4">
            <button
              id="ai-reorder-button"
              onClick={handleAiReorder}
              disabled={isOptimizing}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 active:scale-98 text-white font-bold rounded-lg transition-all cursor-pointer text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                  <span>Calculating wear matrices...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-blue-300 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>Optimize Task Sequence with Gemini</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Calendar View Area */}
        <div id="calendar-view-card" className="bg-[#101820] border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xs font-bold text-white font-display flex items-center gap-1.5">
              <span>May 2025</span>
              <span className="text-[9px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">Active</span>
            </h3>
            <div className="flex space-x-1.5">
              <button disabled className="p-1.5 bg-[#0A0A0A]/60 border border-slate-800/80 rounded-lg text-zinc-600 cursor-not-allowed">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button disabled className="p-1.5 bg-[#0A0A0A]/60 border border-slate-800/80 rounded-lg text-zinc-600 cursor-not-allowed">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-[9px] font-mono font-semibold text-zinc-500 text-center uppercase mb-2">
            <div>Su</div>
            <div>Mo</div>
            <div>Tu</div>
            <div>We</div>
            <div>Th</div>
            <div>Fr</div>
            <div>Sa</div>
          </div>

          {/* Day box cells */}
          <div className="grid grid-cols-7 gap-1 text-center justify-items-center">
            {renderDays()}
          </div>
        </div>

        {/* Selected Date Upkeep details */}
        <div id="selected-day-details">
          <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2.5 text-left pl-1">
            {selectedDay ? `Schedule for May ${selectedDay}` : "Select a highlighted date"}
          </h4>

          {activeTask ? (
            <div 
              id={`active-task-detail-${activeTask.id}`}
              onClick={() => onNavigateToScreen("screen-taskdetail")}
              className={`bg-[#101820] border ${activeTask.completed ? "border-emerald-500/30" : "border-slate-800"} rounded-xl p-4 shadow-lg cursor-pointer hover:border-slate-700 transition-colors relative group text-left`}
            >
              <div className="absolute top-2.5 right-2.5 text-[8px] font-mono text-zinc-500 group-hover:text-blue-400 flex items-center gap-0.5 transition-colors">
                <span>View Details</span>
                <ChevronRight className="w-2.5 h-2.5" />
              </div>

              <div className="flex items-start space-x-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleTask(activeTask.id);
                  }}
                  className="mt-0.5 text-zinc-400 hover:text-emerald-500 focus:outline-none"
                >
                  {activeTask.completed ? (
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                  ) : (
                    <AlertCircle className={`w-4.5 h-4.5 ${activeTask.priority === "High" ? "text-red-500" : activeTask.priority === "Medium" ? "text-amber-500" : "text-blue-500"}`} />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <h5 className={`text-xs font-bold leading-tight ${activeTask.completed ? "line-through text-zinc-500" : "text-white"}`}>
                    {activeTask.title}
                  </h5>
                  <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {activeTask.why}
                  </p>
                  
                  {/* Task Sub-metadata */}
                  <div className="flex items-center space-x-3 text-[9px] font-mono text-zinc-500 mt-2.5 pt-2 border-t border-slate-800/60">
                    <span>Priority: <strong className={activeTask.priority === "High" ? "text-red-400" : activeTask.priority === "Medium" ? "text-amber-400" : "text-blue-400"}>{activeTask.priority}</strong></span>
                    <span>Role: <strong>{activeTask.who}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#101820]/40 border border-slate-800 border-dashed rounded-xl p-6 text-center text-[11px] text-zinc-500">
              No tasks scheduled for May {selectedDay || "this date"}. Tap any colored date in the grid above to load its preventive upkeeps.
            </div>
          )}
        </div>

        {/* Dynamic Drag and Drop Sorting sequence list */}
        <div id="preventive-sequence-section" className="pt-2 text-left">
          <div className="flex items-center justify-between mb-3 pl-1">
            <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Preventive Calendar Sequence
            </h4>
            <span className="text-[8px] font-mono text-zinc-500 flex items-center gap-1">
              <GripVertical className="w-3 h-3 text-zinc-500" />
              <span>Drag or use arrows to reschedule</span>
            </span>
          </div>

          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {tasks.map((task, index) => {
                const sysHealth = getSystemHealthForTask(task);
                const hasReasoning = !!aiReasonings[task.id];
                
                return (
                  <motion.div
                    key={task.id}
                    id={`task-sequence-item-${task.id}`}
                    layoutId={`task-card-${task.id}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`bg-[#101820] border ${task.completed ? "border-zinc-800/50 opacity-60" : "border-slate-800/80"} hover:border-slate-700/80 rounded-xl p-3 shadow-md flex items-center gap-3 transition-all cursor-grab active:cursor-grabbing relative ${draggedIndex === index ? "border-blue-500/60 bg-blue-950/20" : ""}`}
                  >
                    {/* Index Sequence number */}
                    <div className="flex flex-col items-center justify-center text-[10px] font-mono text-zinc-500 pr-1 border-r border-slate-800/60 select-none">
                      <span className="text-zinc-400 font-extrabold text-[11px]">#{index + 1}</span>
                      <GripVertical className="w-3 h-3 text-zinc-600 mt-1" />
                    </div>

                    {/* Completion indicator check status */}
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="flex-shrink-0 text-zinc-500 hover:text-emerald-400 cursor-pointer focus:outline-none"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                      ) : (
                        <Circle className="w-4.5 h-4.5" />
                      )}
                    </button>

                    {/* Task Title & Health Details */}
                    <div 
                      onClick={() => handleOpenSequenceDetail(task, index)}
                      className="flex-1 min-w-0 text-left cursor-pointer group/title"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold truncate block group-hover/title:text-blue-400 transition-colors ${task.completed ? "line-through text-zinc-500" : "text-white"}`}>
                          {task.title}
                        </span>
                        <span className="text-[8.5px] font-mono text-zinc-500 flex-shrink-0 ml-1 group-hover/title:text-blue-300 transition-colors flex items-center gap-0.5">
                          <span>{task.due}</span>
                          <ChevronRight className="w-2.5 h-2.5" />
                        </span>
                      </div>

                      {/* Associated system health status bar if matched */}
                      {sysHealth && !task.completed && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[8px] font-mono text-zinc-500 uppercase">
                            {sysHealth.name}:
                          </span>
                          <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden max-w-[60px]">
                            <div 
                              className={`h-full rounded-full ${sysHealth.health < 80 ? "bg-red-500" : sysHealth.health < 90 ? "bg-amber-500" : "bg-emerald-500"}`} 
                              style={{ width: `${sysHealth.health}%` }}
                            />
                          </div>
                          <span className={`text-[8.5px] font-mono font-bold ${sysHealth.health < 80 ? "text-red-400" : sysHealth.health < 90 ? "text-amber-400" : "text-emerald-400"}`}>
                            {sysHealth.health}%
                          </span>
                        </div>
                      )}

                      {/* AI Reasoning line if optimized */}
                      {hasReasoning && !task.completed && (
                        <p className="text-[8.5px] text-blue-400 italic mt-1 leading-normal pl-1.5 border-l border-blue-500/20">
                          "{aiReasonings[task.id]}"
                        </p>
                      )}
                    </div>

                    {/* Priority Selector & Quick Sorting Arrows controls */}
                    <div className="flex items-center gap-2 flex-shrink-0 pl-1 border-l border-slate-800/40 select-none">
                      {/* Priority level picker */}
                      <select
                        id={`priority-picker-${task.id}`}
                        value={task.priority}
                        onChange={(e) => handlePriorityChange(task.id, e.target.value as PriorityLevel)}
                        className={`bg-[#0A0A0A] border border-slate-800/80 rounded-md px-1 py-0.5 text-[8.5px] font-mono font-semibold focus:outline-none focus:border-blue-500 cursor-pointer ${task.priority === "High" ? "text-red-400" : task.priority === "Medium" ? "text-amber-400" : "text-blue-400"}`}
                      >
                        <option value="High" className="text-red-400 bg-[#0A0A0A]">High</option>
                        <option value="Medium" className="text-amber-400 bg-[#0A0A0A]">Medium</option>
                        <option value="Low" className="text-blue-400 bg-[#0A0A0A]">Low</option>
                      </select>

                      {/* Arrow adjusters */}
                      <div className="flex flex-col gap-0.5">
                        <button
                          id={`move-up-task-${task.id}`}
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-0.5 bg-[#0A0A0A]/60 hover:bg-slate-800 border border-slate-800/80 rounded disabled:opacity-30 disabled:hover:bg-[#0A0A0A]/60 cursor-pointer focus:outline-none"
                        >
                          <ArrowUp className="w-2.5 h-2.5 text-zinc-400" />
                        </button>
                        <button
                          id={`move-down-task-${task.id}`}
                          onClick={() => handleMoveDown(index)}
                          disabled={index === tasks.length - 1}
                          className="p-0.5 bg-[#0A0A0A]/60 hover:bg-slate-800 border border-slate-800/80 rounded disabled:opacity-30 disabled:hover:bg-[#0A0A0A]/60 cursor-pointer focus:outline-none"
                        >
                          <ArrowDown className="w-2.5 h-2.5 text-zinc-400" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

      </div>

      <BottomNavBar activeTab="tasks" onNavigateToScreen={onNavigateToScreen} />

    </div>
  );
}
