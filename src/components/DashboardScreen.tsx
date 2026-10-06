import React from "react";
import { Bell, ChevronRight, CheckSquare, Square, Calendar, ShieldCheck, Sparkles, Wrench, TrendingUp, Layers, ShoppingBag, Trophy, Flame } from "lucide-react";
import { MaintenanceTask, HomeSystem, RecommendedProvider, ProAppointment, ConsumableItem } from "../types";
import BottomNavBar from "./BottomNavBar";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import EnergyEfficiencyWidget from "./EnergyEfficiencyWidget";
import QuickContactWidget from "./QuickContactWidget";
import WeatherSimulationWidget from "./WeatherSimulationWidget";
import IoTBridgeWidget from "./IoTBridgeWidget";
import { animate } from "motion/react";

interface DashboardScreenProps {
  tasks: MaintenanceTask[];
  systems: HomeSystem[];
  providers: RecommendedProvider[];
  consumables?: ConsumableItem[];
  onToggleTask: (taskId: string) => void;
  onNavigateToScreen: (screenId: string) => void;
  setSystems: React.Dispatch<React.SetStateAction<HomeSystem[]>>;
  onAddAppointment: (appt: ProAppointment) => void;
  addToast: (title: string, description: string, type: "task" | "risk" | "info" | "success") => void;
  onAddTask: (task: MaintenanceTask) => void;
  enabledFeatures?: Record<string, boolean>;
}

// Generate 30 days of data ending at current health
function generate30DayTrend(currentHealth: number, systemId: string) {
  const points = [];
  for (let i = 29; i >= 0; i--) {
    const dayNum = 30 - i;
    points.push({
      day: dayNum,
      label: dayNum === 30 ? "Today" : `Day ${dayNum}`,
      health: 0
    });
  }

  let temp = currentHealth;
  for (let i = 29; i >= 0; i--) {
    points[i].health = Math.min(100, Math.max(35, Math.round(temp)));
    
    // Deterministic walk backwards
    const seed = Math.sin(i * 1.5 + (systemId === "overall" ? 7 : systemId.charCodeAt(0)));
    const step = seed * 3.5; // between -3.5 and 3.5
    const wear = -0.2; // simulate gradual slight drop as we go forward (i.e. increase as we go backward)
    temp = temp - step - wear;
  }
  return points;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = payload[0].value;
    
    let colorClass = "text-red-400";
    if (value >= 90) colorClass = "text-emerald-400";
    else if (value >= 75) colorClass = "text-yellow-400";

    return (
      <div className="bg-[#0A0A0A] border border-slate-800/80 p-2.5 rounded-xl text-[10.5px] font-mono shadow-xl">
        <p className="text-zinc-500 font-bold uppercase tracking-wider mb-0.5">
          {data.label}
        </p>
        <p className="text-white font-medium">
          Health: <span className={`font-bold ${colorClass}`}>{value}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardScreen({
  tasks,
  systems,
  providers,
  consumables = [],
  onToggleTask,
  onNavigateToScreen,
  setSystems,
  onAddAppointment,
  addToast,
  onAddTask,
  enabledFeatures
}: DashboardScreenProps) {
  const [selectedTrendId, setSelectedTrendId] = React.useState<string>("overall");
  const [animatedScore, setAnimatedScore] = React.useState(0);
  const [selectedBadgeId, setSelectedBadgeId] = React.useState<string | null>(null);

  // Dynamic Gamification Engine
  const completedCount = tasks.filter(t => t.completed).length;
  const healthySystemsCount = systems.filter(s => s.health >= 85).length;
  
  // Base XP: 150 XP per completed task + 200 XP per healthy system node
  const totalXp = (completedCount * 150) + (healthySystemsCount * 200);
  
  // Level threshold: 500 XP per level
  const currentLevel = Math.floor(totalXp / 500) + 1;
  const xpInCurrentLevel = totalXp % 500;
  const xpNeededForNext = 500;
  const xpPercent = Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForNext) * 100));

  // Care streak (dynamic based on completed tasks to reward engagement)
  const careStreak = 7 + completedCount;

  // Level Titles
  const getLevelTitle = (lvl: number) => {
    if (lvl === 1) return "Novice Homeowner";
    if (lvl === 2) return "Proactive Guard";
    if (lvl === 3) return "Vigilant Steward";
    if (lvl === 4) return "Master Preserver";
    return "Sovereign Sanctuary Guardian";
  };

  const badges = [
    {
      id: "preservation",
      name: "Home Shield",
      desc: "Complete 2+ safety maintenance tasks to shield your asset.",
      requirement: "Need 2 completed tasks",
      icon: "🛡️",
      unlocked: completedCount >= 2,
    },
    {
      id: "water",
      name: "Water Warden",
      desc: "Maintain your high-risk Plumbing system at 90%+ health.",
      requirement: "Keep plumbing health >= 90%",
      icon: "💧",
      unlocked: (systems.find(s => s.name.toLowerCase() === "plumbing")?.health ?? 0) >= 90,
    },
    {
      id: "thermal",
      name: "Thermal Champ",
      desc: "Keep HVAC heating & cooling compression calibrated at 90%+ health.",
      requirement: "Keep HVAC health >= 90%",
      icon: "🔥",
      unlocked: (systems.find(s => s.name.toLowerCase() === "hvac")?.health ?? 0) >= 90,
    },
    {
      id: "vault",
      name: "Vault Master",
      desc: "Securely store structural floor plans and service invoices in the property vault.",
      requirement: "Always active (Initial pre-populated)",
      icon: "📂",
      unlocked: true,
    }
  ];

  // Determine current baseline health
  const getSelectedHealth = () => {
    if (selectedTrendId === "overall") {
      const activeSystems = systems || [];
      if (activeSystems.length === 0) return 85;
      return Math.round(activeSystems.reduce((sum, s) => sum + s.health, 0) / activeSystems.length);
    }
    const system = (systems || []).find(s => s.id === selectedTrendId);
    return system ? system.health : 85;
  };

  const currentBaselineHealth = getSelectedHealth();
  const trendData = React.useMemo(() => {
    return generate30DayTrend(currentBaselineHealth, selectedTrendId);
  }, [currentBaselineHealth, selectedTrendId]);

  // Calculate dynamic health score
  // Default is 84 when no tasks completed. Let's do: 84 + (16 * ratio of completed tasks)
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const score = totalTasksCount > 0 
    ? Math.min(100, Math.floor(84 + (16 * (completedTasksCount / totalTasksCount))))
    : 84;

  const lowConsumablesCount = consumables.filter(c => c.currentLevel <= 25).length;

  React.useEffect(() => {
    const controls = animate(0, score, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (value) => {
        setAnimatedScore(Math.floor(value));
      }
    });
    return () => controls.stop();
  }, [score]);

  const statusText = animatedScore >= 95 ? "Optimal" : animatedScore >= 80 ? "Good" : "Fair";
  const statusColor = animatedScore >= 90 ? "text-emerald-400" : animatedScore >= 80 ? "text-emerald-500" : "text-amber-500";
  const strokeColor = animatedScore >= 90 ? "#10B981" : animatedScore >= 80 ? "#22C55E" : "#F59E0B";

  const radialData = [
    {
      name: "Score",
      value: animatedScore,
      fill: strokeColor
    }
  ];

  // Circular progress math
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0A0A0A] text-white font-sans relative">
      
      {/* Scrollable Main Area */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-20 scrollbar-none">
        
        {/* Top Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">My Property</span>
            <h2 className="text-xl font-extrabold tracking-tight text-white font-display">My Home</h2>
          </div>
          
          {/* Notification Icon with red badge */}
          <div className="relative p-2 bg-[#101820] border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
            <Bell className="w-4.5 h-4.5 text-zinc-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#101820]"></span>
          </div>
        </div>

        {/* 10-Word Slogan Pinpoint Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-[#101820] border border-blue-500/15 text-center relative overflow-hidden shadow-lg">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-blue-500/30"></div>
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 animate-pulse" />
            <p className="text-xs font-semibold text-zinc-200 tracking-wide leading-relaxed">
              Protect your home investment with proactive, intelligent, and simple maintenance.
            </p>
          </div>
        </div>

        {/* Main Card: Home Health Score circular ring */}
        <div className="bg-[#101820] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden mb-6 group hover:border-[#2563EB]/40 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB]/5 rounded-full filter blur-[35px] pointer-events-none"></div>

          <div className="flex items-center justify-between">
            {/* Left Score Meta */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> System Health
              </span>
              <p className="text-2xl font-extrabold tracking-tight text-white font-display">Home Health</p>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-zinc-500">Status:</span>
                <span className={`text-xs font-bold uppercase tracking-wider ${statusColor}`}>
                  {statusText}
                </span>
              </div>
            </div>

            {/* Recharts Radial Bar Chart */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="75%"
                  outerRadius="100%"
                  barSize={8}
                  data={radialData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />
                  <RadialBar
                    background={{ fill: "#1E293B" }}
                    dataKey="value"
                    cornerRadius={4}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              {/* Inner score label */}
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-extrabold text-white leading-none tracking-tight">{animatedScore}</span>
                <span className="text-[9px] text-zinc-500 font-mono mt-0.5">/ 100</span>
              </div>
            </div>
          </div>

          {/* Savings Hook */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Estimated repairs prevented:</span>
            <span className="text-emerald-400 font-bold">$1,245 saved</span>
          </div>
        </div>

        {/* Interactive Property Preservation & Safety Checkpoints Banner */}
        <div 
          onClick={() => onNavigateToScreen("screen-checkpoints")}
          className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-950/25 to-[#101820]/80 border border-blue-500/20 hover:border-blue-400/45 cursor-pointer transition-all shadow-xl flex items-center justify-between group text-left relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full filter blur-xl pointer-events-none"></div>
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/15 group-hover:scale-105 transition-transform flex-shrink-0">
              <ShieldCheck className="w-4.5 h-4.5 text-blue-400 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-xs font-extrabold text-white group-hover:text-blue-400 transition-colors">Property Value Audits</p>
                <span className="text-[8px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/10 px-1 py-0.1 rounded uppercase">12 Checkpoints</span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed truncate">
                Verify vital structural, electrical & safety nodes to reduce liability
              </p>
            </div>
          </div>
          <ChevronRight className="w-4.5 h-4.5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
        </div>

        {/* Upcoming Tasks Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white tracking-wide">Upcoming Tasks</h3>
            <button 
              onClick={() => onNavigateToScreen("screen-calendar")}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center"
            >
              <span>View Calendar</span>
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          {/* Interactive Task Cards */}
          <div className="space-y-2.5">
            {tasks.map((task) => {
              const priorityColors = 
                task.priority === "High" 
                  ? "bg-red-500/10 border-red-500/20 text-red-400" 
                  : task.priority === "Medium"
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  : "bg-blue-500/10 border-blue-500/20 text-blue-400";

              return (
                <div
                  key={task.id}
                  className={`bg-[#101820] border ${task.completed ? "border-emerald-500/30 opacity-70" : "border-slate-800/80 hover:border-slate-700"} rounded-xl p-3.5 flex items-start justify-between gap-3 shadow-md transition-all group/task cursor-pointer`}
                  onClick={() => onToggleTask(task.id)}
                >
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    {/* Toggle Checkbox */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTask(task.id);
                      }}
                      className="mt-0.5 text-zinc-500 hover:text-blue-500 transition-colors focus:outline-none"
                    >
                      {task.completed ? (
                        <CheckSquare className="w-4.5 h-4.5 text-emerald-500" />
                      ) : (
                        <Square className="w-4.5 h-4.5 text-slate-600 group-hover/task:text-blue-400" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <p className={`text-xs font-semibold ${task.completed ? "line-through text-zinc-500" : "text-white"} leading-tight truncate`}>
                        {task.title}
                      </p>
                      
                      {/* Sub-details (due date) */}
                      <div className="flex items-center space-x-2 text-[10px] text-zinc-500 mt-1.5 font-mono">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        <span>Due: {task.due}</span>
                      </div>
                    </div>
                  </div>

                  {/* Priority Badge */}
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${priorityColors} flex-shrink-0`}>
                    {task.priority}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Predictive Lifespan Insights AI Forecast Banner */}
        <div 
          onClick={() => onNavigateToScreen("screen-predictive")}
          className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-rose-950/25 to-[#101820]/80 border border-rose-500/25 hover:border-rose-400/45 cursor-pointer transition-all shadow-xl flex items-center justify-between group text-left relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 rounded-full filter blur-xl pointer-events-none"></div>
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/15 group-hover:scale-105 transition-transform flex-shrink-0">
              <TrendingUp className="w-4.5 h-4.5 text-rose-400 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-xs font-extrabold text-white group-hover:text-rose-400 transition-colors">Predictive Health Insights</p>
                <span className="text-[8px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/10 px-1 py-0.1 rounded uppercase">AI Lifespan Forecast</span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed truncate">
                Model thermodynamic decay & stress loads on key equipment
              </p>
            </div>
          </div>
          <ChevronRight className="w-4.5 h-4.5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
        </div>

        {/* 5. 30-Day Health Trends Mini Bar Chart Card */}
        <div id="trend-analysis-card" className="bg-[#101820] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">30-Day Health Trends</h3>
                <p className="text-[10px] text-zinc-500">Historical telemetry tracking</p>
              </div>
            </div>
            
            <select
              id="trend-system-select"
              value={selectedTrendId}
              onChange={(e) => setSelectedTrendId(e.target.value)}
              className="bg-[#0A0A0A] border border-slate-800 text-[10.5px] text-zinc-300 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
            >
              <option value="overall">Overall Property</option>
              {systems.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="h-32 w-full relative select-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} opacity={0.3} />
                <XAxis 
                  dataKey="day" 
                  stroke="#475569" 
                  fontSize={8} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => val % 5 === 0 ? `D${val}` : ""}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={8} 
                  tickLine={false} 
                  axisLine={false}
                  domain={[0, 100]}
                  ticks={[0, 50, 100]}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="health" barSize={5} radius={[2, 2, 0, 0]}>
                  {trendData.map((entry, index) => {
                    let barColor = "#EF4444"; // Red
                    if (entry.health >= 90) barColor = "#10B981"; // Emerald
                    else if (entry.health >= 75) barColor = "#F59E0B"; // Amber
                    
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={barColor} 
                        opacity={entry.day === 30 ? 1 : 0.75}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-zinc-500">
            <span>Latest calibration value:</span>
            <span className="font-bold text-zinc-300">{currentBaselineHealth}% Health</span>
          </div>
        </div>

        {/* 6. Ask HomePulse AI Assistant */}
        <div 
          onClick={() => onNavigateToScreen("screen-assistant")}
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-900/25 to-indigo-900/15 border border-blue-500/20 hover:border-blue-500/40 cursor-pointer transition-colors shadow-lg flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Ask HomePulse AI Assistant</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">Diagnose appliances or heating/cooling leaks</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </div>

        {/* 7. Energy Efficiency Tracker */}
        <EnergyEfficiencyWidget 
          tasks={tasks}
          systems={systems}
          onToggleTask={onToggleTask}
        />

        {/* 8. Quick Dispatch Contact */}
        <QuickContactWidget
          systems={systems}
          providers={providers}
          onNavigateToScreen={onNavigateToScreen}
          setSystems={setSystems}
          onAddAppointment={onAddAppointment}
          addToast={addToast}
        />

        {/* 9. Pre-Vetted Local Contractors */}
        <div 
          onClick={() => onNavigateToScreen("screen-providers")}
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-950/25 to-teal-950/15 border border-emerald-500/20 hover:border-emerald-500/40 cursor-pointer transition-all shadow-lg flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">Pre-Vetted Local Contractors</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">Book certified pros & live track maintenance progress</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Prioritized Bottom Sections */}
        <div className="mt-8 mb-4 border-t border-slate-800/80 pt-6">
          <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase block mb-1">Stewardship & Smart Home</span>
        </div>

        {/* Dynamic Stewardship Level & Achievements Card (Gamification) */}
        <div className="bg-[#101820] border border-slate-800/90 rounded-2xl p-4 shadow-lg relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full filter blur-[20px] pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/10">
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="text-[9px] text-zinc-400 font-mono tracking-wider uppercase font-bold">Stewardship Rank</span>
                <h3 className="text-xs font-extrabold text-white leading-tight">Level {currentLevel}: {getLevelTitle(currentLevel)}</h3>
              </div>
            </div>

            {/* Streak Counter */}
            <div className="flex items-center space-x-1 bg-amber-500/10 border border-amber-500/15 px-2.5 py-1 rounded-full text-amber-400 font-bold text-[10px]">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              <span>{careStreak}-Day Streak</span>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center justify-between text-[9px] font-mono">
              <span className="text-zinc-500">EXPERIENCE POINTS (XP)</span>
              <span className="text-zinc-300 font-bold">{xpInCurrentLevel} / {xpNeededForNext} XP</span>
            </div>
            <div className="w-full bg-zinc-900 rounded-full h-2 border border-slate-800/80 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${xpPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Achievements Sub-Section */}
          <div>
            <p className="text-[9px] font-mono font-bold text-zinc-500 uppercase mb-2 tracking-wider">Property Stewardship Badges</p>
            <div className="grid grid-cols-4 gap-2">
              {badges.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBadgeId(selectedBadgeId === b.id ? null : b.id)}
                  className={`relative p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    b.unlocked 
                      ? selectedBadgeId === b.id 
                        ? "bg-amber-950/20 border-amber-400/80 scale-[1.03] text-amber-300"
                        : "bg-[#101820] border-slate-800 hover:border-amber-500/40 text-zinc-300" 
                      : selectedBadgeId === b.id
                        ? "bg-zinc-900 border-zinc-700 scale-[1.03] opacity-50"
                        : "bg-zinc-950 border-slate-900/60 opacity-30"
                  }`}
                  title={b.name}
                >
                  <span className={`text-lg mb-1 filter ${b.unlocked ? "" : "grayscale"}`}>{b.icon}</span>
                  <span className="text-[9px] font-bold text-center leading-none truncate w-full">{b.name}</span>
                  
                  {/* Status Pip */}
                  <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${b.unlocked ? "bg-amber-400" : "bg-zinc-600"}`}></span>
                </button>
              ))}
            </div>

            {/* Badge Explanation Panel */}
            <div className="mt-2.5 min-h-[44px]">
              {selectedBadgeId ? (() => {
                const badge = badges.find(b => b.id === selectedBadgeId);
                if (!badge) return null;
                return (
                  <div className="bg-black/40 border border-slate-800/70 rounded-xl p-2.5 text-left text-[10px] animate-fadeIn">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-white flex items-center gap-1">
                        <span>{badge.icon}</span> {badge.name}
                      </span>
                      <span className={`font-mono text-[8px] px-1.5 py-0.2 rounded font-bold ${badge.unlocked ? "bg-amber-500/10 text-amber-400 border border-amber-500/10" : "bg-zinc-800 text-zinc-500"}`}>
                        {badge.unlocked ? "UNLOCKED (+150 XP)" : "LOCKED"}
                      </span>
                    </div>
                    <p className="text-zinc-400 leading-normal">{badge.desc}</p>
                    <p className="text-zinc-500 font-mono text-[8px] mt-1 font-semibold">Requirement: {badge.requirement}</p>
                  </div>
                );
              })() : (
                <div className="border border-dashed border-slate-800/40 rounded-xl p-2.5 text-center flex items-center justify-center text-[9.5px] text-zinc-500">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-zinc-600 animate-pulse" />
                  <span>Tap a badge to view unlock details & rewards</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Floor Plan */}
        {enabledFeatures?.["interactive-floor-plan"] && (
          <div 
            onClick={() => onNavigateToScreen("screen-floorplan")}
            className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/25 to-[#101820]/80 border border-indigo-500/25 hover:border-indigo-400/45 cursor-pointer transition-all shadow-xl flex items-center justify-between group text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full filter blur-xl pointer-events-none"></div>
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/15 group-hover:scale-105 transition-transform flex-shrink-0">
                <Layers className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-xs font-extrabold text-white group-hover:text-indigo-400 transition-colors">Interactive Floor Plan</p>
                  <span className="text-[8px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 px-1 py-0.1 rounded uppercase">Live Telemetry Map</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed truncate">
                  Audit room health profiles & toggle localized maintenance actions
                </p>
              </div>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
          </div>
        )}

        {/* IoT Core Bridge Integration Hub */}
        {enabledFeatures?.["iot-telemetry-bridge"] && (
          <IoTBridgeWidget 
            systems={systems}
            setSystems={setSystems}
            addToast={addToast}
          />
        )}

      </div>

      <BottomNavBar activeTab="home" onNavigateToScreen={onNavigateToScreen} />

    </div>
  );
}
