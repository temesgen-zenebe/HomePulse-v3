import React from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Circle,
  Sparkles,
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
  Hammer,
  Eye,
  Settings,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MaintenanceTask, HomeSystem } from "../types";
import BottomNavBar from "./BottomNavBar";

interface CalendarDetailScreenProps {
  task: MaintenanceTask;
  taskIndex: number;
  tasks: MaintenanceTask[];
  onToggleTask: (taskId: string) => void;
  onNavigateToScreen: (screenId: string) => void;
  onClose: () => void;
  systems?: HomeSystem[];
}

export default function CalendarDetailScreen({
  task,
  taskIndex,
  tasks,
  onToggleTask,
  onNavigateToScreen,
  onClose,
  systems = []
}: CalendarDetailScreenProps) {
  // --- STATE FOR DETAILED VIDEO/IMAGE PLAYBACK ---
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(120); // mock duration of 2 mins
  const [progress, setProgress] = React.useState(0);
  const [playbackRate, setPlaybackRate] = React.useState(1.0);
  const [loop, setLoop] = React.useState(false);
  const [activeStepIndex, setActiveStepIndex] = React.useState<number>(0);
  const [selectedMonth, setSelectedMonth] = React.useState<number>(6);
  const [showSchematicLabel, setShowSchematicLabel] = React.useState(true);

  // --- LOCAL SUBSTEP CHECKLIST STATE ---
  const [checkedSubSteps, setCheckedSubSteps] = React.useState<boolean[]>([]);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // Load steps dynamically
  const getSubStepsForTask = (taskId: string) => {
    switch (taskId) {
      case "task_1":
        return [
          "Turn off the HVAC power at the thermostat and outer circuit breaker.",
          "Locate return register grille (ceiling intake or wall register).",
          "Unfasten frame latch knobs and swing open outer intake door.",
          "Remove old dirty 20x25x1 MERV 11 filter carefully to avoid spreading dust.",
          "Insert pristine replacement filter with air flow arrow pointing inwards.",
          "Seal intake frame latch, secure latch handles, and restore HVAC power."
        ];
      case "task_2":
        return [
          "Set up a rugged extension ladder on level turf with stabilizer pads.",
          "Equip protective safety goggles and double-layered heavy work gloves.",
          "Manually clear thick leaf debris, twigs, and clay silt from gutters.",
          "Siphon and flush gutter troughs with a garden hose jet nozzle.",
          "Inspect downspout curves for active blockages or drainage clogs.",
          "Install aluminum downspout mesh screens to deflect forthcoming rain runoff."
        ];
      case "task_3":
        return [
          "Cut electric breaker power to tank elements (or rotate gas valve to Pilot).",
          "Connect a heavy-duty garden hose thread to the base drainage brass spigot valve.",
          "Deploy outdoor end of hose to a safe soil drainage spot or cellar floor sump.",
          "Shut off the cold water intake supply ball valve on top of the heater tank.",
          "Open an interior hot water plumbing faucet upstairs to vent internal pressure.",
          "Open water heater drain valve fully to discharge sediment and scale build-up."
        ];
      case "task_4":
        return [
          "Secure an A-frame step-ladder to reach ceiling-mounted casing safely.",
          "Press and hold the detector 'Test' button to verify horn alerts sound.",
          "Unlatch detector lid and disconnect snap-plug terminal connector.",
          "Slide out aging backup 9-Volt battery block from housing slot.",
          "Install a new premium long-life lithium 9V battery block securely.",
          "Attach snap-plug terminal, snap shut cover, and perform a full alarm re-test."
        ];
      default:
        return [
          "Locate target system zone and inspect for loose bolts, frame stress, or fluid leaks.",
          "Put on heavy-duty protective gloves and assemble necessary manual hand tools.",
          "Cut off main electrical connections, gas loops, or active water valves safely.",
          "Remove dirt coatings and vacuum debris layers from slots, grilles, or vents.",
          "Align, tighten, or replace worn mechanical components following spec manual.",
          "Restore electrical loops, run system baseline checks, and verify green status."
        ];
    }
  };

  const substeps = getSubStepsForTask(task.id);

  // Initialize checklist state when task changes
  React.useEffect(() => {
    setCheckedSubSteps(Array(substeps.length).fill(false));
    setIsPlaying(false);
    setCurrentTime(0);
    setProgress(0);
    setActiveStepIndex(0);
  }, [task.id]);

  // Video source selector
  const taskVideoDatabase: Record<string, string> = {
    "task_1": "https://assets.mixkit.co/videos/preview/mixkit-technician-working-on-an-air-conditioning-unit-43032-large.mp4",
    "task_2": "https://assets.mixkit.co/videos/preview/mixkit-rain-water-flowing-from-the-roof-gutter-42023-large.mp4",
    "task_3": "https://assets.mixkit.co/videos/preview/mixkit-plumber-working-with-pipes-43034-large.mp4",
    "task_4": "https://assets.mixkit.co/videos/preview/mixkit-glowing-red-fire-alarm-siren-light-41804-large.mp4"
  };

  const taskVideo = taskVideoDatabase[task.id] || "https://assets.mixkit.co/videos/preview/mixkit-technician-working-on-an-air-conditioning-unit-43032-large.mp4";

  // --- PLAYBACK CONTROLS ---
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn("Playback prevented:", err);
      });
    }
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    videoRef.current.muted = nextMute;
    setIsMuted(nextMute);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 120;
    setCurrentTime(cur);
    setDuration(dur);
    if (dur > 0) {
      setProgress((cur / dur) * 100);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current || !duration) return;
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    const newTime = (newProgress / 100) * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSpeedChange = () => {
    if (!videoRef.current) return;
    let nextRate = 1.0;
    if (playbackRate === 1.0) nextRate = 1.5;
    else if (playbackRate === 1.5) nextRate = 2.0;
    else if (playbackRate === 2.0) nextRate = 0.5;
    else nextRate = 1.0;
    videoRef.current.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const handleLoopToggle = () => {
    if (!videoRef.current) return;
    const nextLoop = !loop;
    videoRef.current.loop = nextLoop;
    setLoop(nextLoop);
  };

  const formatTime = (timeInSecs: number) => {
    const mins = Math.floor(timeInSecs / 60);
    const secs = Math.floor(timeInSecs % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleToggleSubStep = (stepIdx: number) => {
    const updated = [...checkedSubSteps];
    updated[stepIdx] = !updated[stepIdx];
    setCheckedSubSteps(updated);

    // Auto update active timeline cursor
    setActiveStepIndex(stepIdx);

    // If all sub-steps are checked, automatically toggle the main task to complete!
    const allCompleted = updated.every(Boolean);
    if (allCompleted && !task.completed) {
      onToggleTask(task.id);
    }
  };

  const completedCount = checkedSubSteps.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / substeps.length) * 100) || 0;

  // Find linked system health if exists
  const getLinkedSystem = () => {
    const titleLower = task.title.toLowerCase();
    return systems.find(sys => titleLower.includes(sys.name.toLowerCase()));
  };

  const linkedSystem = getLinkedSystem();

  return (
    <div id="sequence-detail-viewport" className="w-full h-full flex flex-col justify-between bg-[#0A0A0A] text-white font-sans relative">
      
      {/* 1. STICKY TOP NAVIGATION HEADER */}
      <div className="px-5 pt-4 pb-3.5 border-b border-slate-900 bg-[#0E131F]/40 backdrop-blur-md flex items-center justify-between z-10">
        <button 
          onClick={onClose}
          className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-850 border border-slate-850 rounded-xl text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer text-[10px] font-extrabold uppercase tracking-wide"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-blue-400" />
          <span>Back to Calendar</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded uppercase">
            Step Sequencer
          </span>
          <span className="text-[8px] font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/15 px-2 py-0.5 rounded">
            Sequence #{taskIndex + 1}
          </span>
        </div>
      </div>

      {/* 2. MAIN SCROLLABLE CONTENT BODY */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-24 scrollbar-none space-y-5 text-left">
        
        {/* Core Task Title Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#101827] to-[#0A0D14] border border-slate-800/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full filter blur-xl pointer-events-none"></div>
          
          <div className="flex items-center space-x-2">
            <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
              task.priority === "High" ? "bg-red-500/10 text-red-400 border border-red-500/15" :
              task.priority === "Medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/15" :
              "bg-blue-500/10 text-blue-400 border border-blue-500/15"
            }`}>
              {task.priority} Priority
            </span>
            {task.completed && (
              <span className="text-[8px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-1.5 py-0.5 rounded uppercase">
                Completed
              </span>
            )}
          </div>

          <h2 className="text-base font-black tracking-tight text-white mt-2 font-display">{task.title}</h2>
          <p className="text-[10.5px] text-zinc-400 mt-1 leading-relaxed font-sans">{task.why}</p>

          <div className="grid grid-cols-2 gap-2 text-[9px] font-mono mt-3.5 pt-3.5 border-t border-slate-900/60 text-zinc-400">
            <div>
              <span className="text-zinc-500 block uppercase text-[8px] tracking-wider">Operator Profile</span>
              <strong className="text-zinc-200 mt-0.5 block">{task.who || "Homeowner (DIY)"}</strong>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase text-[8px] tracking-wider">Target Location</span>
              <strong className="text-zinc-200 mt-0.5 block truncate">{task.where}</strong>
            </div>
          </div>
        </div>

        {/* 3. INTERACTIVE VISUAL TIMELINE PATHWAY */}
        <div className="bg-[#101820]/60 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Visual Progression Pathway</h4>
            </div>
            <span className="text-[8.5px] font-mono text-zinc-500">
              Step {activeStepIndex + 1} of {substeps.length}
            </span>
          </div>

          {/* Timeline Node Chain */}
          <div className="flex items-center justify-between relative px-2 py-3 bg-[#0A0A0A]/40 rounded-xl border border-slate-900">
            {/* Background connecting bar */}
            <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-zinc-800 -translate-y-1/2 z-0"></div>
            {/* Active filled progress line */}
            <div 
              className="absolute top-1/2 left-6 h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `calc(${progressPercent}% - 12px)` }}
            ></div>

            {substeps.map((_, idx) => {
              const isChecked = checkedSubSteps[idx];
              const isActive = idx === activeStepIndex;
              
              let nodeStyle = "border-zinc-800 bg-zinc-950 text-zinc-500";
              if (isChecked) {
                nodeStyle = "border-emerald-500 bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.2)]";
              } else if (isActive) {
                nodeStyle = "border-blue-500 bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)] scale-110";
              }

              return (
                <button
                  key={idx}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`w-5.5 h-5.5 rounded-full border-1.5 flex items-center justify-center font-mono text-[9px] font-bold z-10 transition-all cursor-pointer ${nodeStyle}`}
                >
                  {isChecked ? <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" /> : idx + 1}
                </button>
              );
            })}
          </div>

          {/* Active step description detail display */}
          <div className="mt-3 p-3 bg-[#0A0A0A]/85 border border-slate-900 rounded-xl">
            <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 mb-1.5">
              <span>ACTIVE PIPELINE STATEMENT</span>
              <span className={`font-bold ${checkedSubSteps[activeStepIndex] ? "text-emerald-400" : "text-blue-400"}`}>
                {checkedSubSteps[activeStepIndex] ? "STEP COMPLETE" : "IN PROGRESS"}
              </span>
            </div>
            <p className="text-[10.5px] text-zinc-200 leading-relaxed font-sans font-medium">
              <span className="font-mono text-blue-400 font-bold mr-1">Step {activeStepIndex + 1}:</span>
              {substeps[activeStepIndex]}
            </p>
            
            {/* Quick interactive checklist toggle within timeline */}
            <div className="mt-3 flex items-center justify-between border-t border-slate-900/80 pt-2.5">
              <span className="text-[9px] text-zinc-400">Mark current step as complete:</span>
              <button
                onClick={() => handleToggleSubStep(activeStepIndex)}
                className={`text-[9.5px] font-mono font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer border ${
                  checkedSubSteps[activeStepIndex]
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                    : "bg-blue-600 border-blue-500 text-white hover:bg-blue-500 shadow-md shadow-blue-500/10"
                }`}
              >
                {checkedSubSteps[activeStepIndex] ? "✓ Completed" : "Mark Done"}
              </button>
            </div>
          </div>
        </div>

        {/* 4. EMBEDDED HIGH-DEFINITION VIDEO TUTORIAL */}
        <div className="bg-[#101820] border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                <Film className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Video Walkthrough Guide</h4>
                <p className="text-[8.5px] text-zinc-400">Step-by-step physical demonstration stream</p>
              </div>
            </div>
            <span className="text-[8px] font-mono text-zinc-500 px-1.5 py-0.2 bg-[#0A0A0A] rounded border border-slate-900">
              HD 1080P
            </span>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-slate-800 group shadow-md">
            <video
              ref={videoRef}
              src={taskVideo}
              onTimeUpdate={handleTimeUpdate}
              onClick={handlePlayPause}
              className="w-full h-full object-cover cursor-pointer"
              loop={loop}
              playsInline
              preload="metadata"
            />

            {/* Custom Telemetry Overlay Labels */}
            <div className="absolute top-2.5 left-2.5 z-10 flex flex-col pointer-events-none select-none">
              <span className="text-[7.5px] font-mono font-bold bg-black/75 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded backdrop-blur-sm tracking-widest flex items-center gap-1 shadow-md">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
                LIVE TUTORIAL RE-FEED
              </span>
              <span className="text-[6.5px] font-mono text-zinc-500 mt-1 tracking-wider bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs self-start">
                {playbackRate.toFixed(1)}x / {loop ? "LOOP ACTIVE" : "PLAY ONCE"}
              </span>
            </div>

            {/* Play overlay button shown when paused */}
            {!isPlaying && (
              <div 
                onClick={handlePlayPause}
                className="absolute inset-0 bg-black/35 flex items-center justify-center cursor-pointer group-hover:bg-black/45 transition-colors"
              >
                <div className="p-4 bg-blue-600/90 text-white rounded-full shadow-2xl scale-100 group-hover:scale-105 transition-transform">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
              </div>
            )}

            {/* Custom Player Controls Bar */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-2.5 flex flex-col justify-end opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
              {/* Seeking Slidebar */}
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progress}
                onChange={handleProgressChange}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-2"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={handlePlayPause}
                    className="p-1 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer transition-colors"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  </button>

                  <button
                    onClick={handleMuteToggle}
                    className="p-1 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer transition-colors"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>

                  <span className="text-[8px] font-mono text-zinc-300">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Subtitle / Speed options */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSpeedChange}
                    className="px-2 py-0.5 bg-white/10 hover:bg-white/20 text-white text-[7.5px] font-mono rounded font-extrabold cursor-pointer transition-colors"
                  >
                    {playbackRate.toFixed(1)}x Speed
                  </button>
                  <button
                    onClick={handleLoopToggle}
                    className={`px-2 py-0.5 text-[7.5px] font-mono rounded font-extrabold cursor-pointer transition-colors ${
                      loop ? "bg-blue-600 text-white" : "bg-white/10 text-zinc-300 hover:bg-white/20"
                    }`}
                  >
                    {loop ? "Auto-Loop" : "Single"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. DYNAMIC INTERACTIVE BLUEPRINT SCHEMATIC */}
        <div className="bg-[#101820] border border-slate-800 rounded-2xl p-4 shadow-lg text-left">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Dynamic Blueprint Schematic</h4>
                <p className="text-[8.5px] text-zinc-400">Interactive hardware installation details</p>
              </div>
            </div>
            <button 
              onClick={() => setShowSchematicLabel(!showSchematicLabel)}
              className="py-1 px-2 text-[8px] font-mono font-bold bg-[#0A0A0A] hover:bg-zinc-900 text-zinc-400 rounded border border-slate-900"
            >
              {showSchematicLabel ? "Hide Annotations" : "Show Annotations"}
            </button>
          </div>

          <div className="w-full bg-[#0A0A0A] border border-slate-900 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden select-none aspect-[16/9] min-h-[160px]">
            {task.id === "task_1" && (
              <svg viewBox="0 0 200 120" className="w-full max-w-[220px] h-auto text-blue-400">
                <rect x="20" y="20" width="160" height="80" rx="4" fill="none" stroke="#334155" strokeWidth="2" />
                <line x1="20" y1="40" x2="180" y2="40" stroke="#1e293b" strokeWidth="1" />
                <line x1="20" y1="60" x2="180" y2="60" stroke="#1e293b" strokeWidth="1" />
                <line x1="20" y1="80" x2="180" y2="80" stroke="#1e293b" strokeWidth="1" />
                <line x1="50" y1="20" x2="50" y2="100" stroke="#1e293b" strokeWidth="1" />
                <line x1="80" y1="20" x2="80" y2="100" stroke="#1e293b" strokeWidth="1" />
                <line x1="110" y1="20" x2="110" y2="100" stroke="#1e293b" strokeWidth="1" />
                <line x1="140" y1="20" x2="140" y2="100" stroke="#1e293b" strokeWidth="1" />
                
                <rect x="40" y="30" width="120" height="60" rx="2" fill="#2563eb" fillOpacity="0.1" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" />
                
                {showSchematicLabel && (
                  <g>
                    <text x="100" y="64" textAnchor="middle" fill="#60a5fa" fontSize="8" fontWeight="black" letterSpacing="1">MERV-11 COMPARTMENT</text>
                    <path d="M50 110 L50 102 M100 110 L100 102 M150 110 L150 102" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#arrow)" />
                    <text x="100" y="112" textAnchor="middle" fill="#475569" fontSize="6" fontFamily="monospace">AIRFLOW INLET PRESSURE DIRECTION</text>
                  </g>
                )}
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                  </marker>
                </defs>
              </svg>
            )}

            {task.id === "task_2" && (
              <svg viewBox="0 0 200 120" className="w-full max-w-[220px] h-auto text-emerald-400">
                <path d="M10 90 L80 30 L190 30" fill="none" stroke="#334155" strokeWidth="3" />
                <rect x="75" y="27" width="110" height="8" rx="1" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
                <path d="M175 35 L175 100 L190 105" fill="none" stroke="#10b981" strokeWidth="2.5" />
                
                <circle cx="100" cy="31" r="2.5" fill="#f59e0b" />
                <circle cx="120" cy="31" r="2" fill="#d97706" />
                <circle cx="140" cy="31" r="3" fill="#b45309" />
                
                {showSchematicLabel && (
                  <g>
                    <text x="120" y="18" textAnchor="middle" fill="#a7f3d0" fontSize="8" fontWeight="bold">GUTTER DEBRIS TROUGH</text>
                    <text x="175" y="114" textAnchor="middle" fill="#10b981" fontSize="7" fontWeight="bold">DOWNSPOUT RUNOFF</text>
                    <path d="M 120 19 L 120 26" stroke="#10b981" strokeWidth="0.5" strokeDasharray="2 2" />
                  </g>
                )}
              </svg>
            )}

            {task.id === "task_3" && (
              <svg viewBox="0 0 200 120" className="w-full max-w-[220px] h-auto text-amber-400">
                <rect x="65" y="15" width="70" height="90" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="2.5" />
                
                <path d="M80 5 L80 15" stroke="#3b82f6" strokeWidth="2" />
                <path d="M120 5 L120 15" stroke="#ef4444" strokeWidth="2" />
                
                <path d="M85 45 Q100 50 115 45 T115 75" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2 2" />
                <rect x="75" y="85" width="50" height="15" rx="2" fill="#ef4444" fillOpacity="0.1" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
                
                {showSchematicLabel && (
                  <g>
                    <text x="100" y="94" textAnchor="middle" fill="#fbbf24" fontSize="7" fontWeight="bold">CALCIUM SEDIMENT</text>
                    <text x="100" y="52" textAnchor="middle" fill="#64748b" fontSize="6">HEATING ELEMENTS</text>
                    <text x="150" y="45" textAnchor="left" fill="#fca5a5" fontSize="6">HOT OUTLET</text>
                    <text x="45" y="45" textAnchor="right" fill="#93c5fd" fontSize="6">COLD INLET</text>
                  </g>
                )}
              </svg>
            )}

            {task.id === "task_4" && (
              <svg viewBox="0 0 200 120" className="w-full max-w-[220px] h-auto text-red-400">
                <circle cx="100" cy="60" r="45" fill="#1e293b" stroke="#334155" strokeWidth="2.5" />
                <circle cx="100" cy="60" r="32" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
                <circle cx="100" cy="60" r="14" fill="#0f172a" stroke="#ef4444" strokeWidth="1" />
                <path d="M90 60 L110 60 M100 50 L100 70" stroke="#ef4444" strokeWidth="1" />
                <circle cx="75" cy="45" r="3" fill="#10b981" />
                
                {showSchematicLabel && (
                  <g>
                    <text x="100" y="24" textAnchor="middle" fill="#fca5a5" fontSize="8" fontWeight="bold">DETECTOR CORE APPARATUS</text>
                    <text x="75" y="38" textAnchor="middle" fill="#10b981" fontSize="6">SYS LED</text>
                    <rect x="110" y="72" width="12" height="6" rx="1" fill="#ef4444" stroke="#fca5a5" strokeWidth="0.5" />
                    <text x="116" y="88" textAnchor="middle" fill="#94a3b8" fontSize="6">TEST SW</text>
                  </g>
                )}
              </svg>
            )}

            {!["task_1", "task_2", "task_3", "task_4"].includes(task.id) && (
              <svg viewBox="0 0 200 120" className="w-full max-w-[220px] h-auto text-blue-400">
                <rect x="40" y="20" width="120" height="80" rx="8" fill="none" stroke="#334155" strokeWidth="2" />
                <circle cx="100" cy="60" r="20" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
                <path d="M90 60 L110 60 M100 50 L100 70" stroke="#3b82f6" strokeWidth="1.5" />
                
                {showSchematicLabel && (
                  <g>
                    <text x="100" y="112" textAnchor="middle" fill="#60a5fa" fontSize="8" fontWeight="bold">SCHEMATIC LOAD DIAGRAM</text>
                    <text x="100" y="64" textAnchor="middle" fill="#a1a1aa" fontSize="6">CORE INTEGRITY NODE</text>
                  </g>
                )}
              </svg>
            )}

            <div className="absolute bottom-2.5 right-2.5 bg-black/70 px-2 py-0.5 rounded text-[8px] font-mono text-zinc-500 border border-slate-900">
              LOCATION: {task.where}
            </div>
          </div>
        </div>

        {/* 6. SYSTEM STRESSORS & PROACTIVE HEALTH DEGRADATION MODEL */}
        <div className="bg-[#101820] border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Predictive Degradation Curve</h4>
                <p className="text-[8.5px] text-zinc-400">Proactive maintenance vs deferred care impact</p>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/15">
              Simulation
            </span>
          </div>

          <div className="w-full bg-[#0A0A0A] border border-slate-900 rounded-xl p-3.5">
            <svg viewBox="0 0 300 110" className="w-full h-auto">
              {/* Reference Grid lines */}
              <line x1="30" y1="10" x2="290" y2="10" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
              <line x1="30" y1="50" x2="290" y2="50" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
              <line x1="30" y1="90" x2="290" y2="90" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />

              <text x="22" y="13" fill="#64748b" fontSize="7" textAnchor="end" fontFamily="monospace">100%</text>
              <text x="22" y="53" fill="#64748b" fontSize="7" textAnchor="end" fontFamily="monospace">50%</text>
              <text x="22" y="93" fill="#64748b" fontSize="7" textAnchor="end" fontFamily="monospace">0%</text>

              {/* Proactive curve: Green Line */}
              <path 
                d="M 30 15 L 60 15 L 90 16 L 120 15 L 150 17 L 180 16 L 210 15 L 240 16 L 270 15 L 290 16"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
              />

              {/* Deferred curve: Red Line */}
              <path 
                d="M 30 15 L 60 19 L 90 26 L 120 35 L 150 48 L 180 61 L 210 73 L 240 85 L 270 91 L 290 95"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
              />

              {/* Selector line placement marker */}
              <line 
                x1={30 + ((selectedMonth - 1) / 11) * 260} 
                y1="10" 
                x2={30 + ((selectedMonth - 1) / 11) * 260} 
                y2="90" 
                stroke="#3b82f6" 
                strokeWidth="1.2" 
                strokeDasharray="3 3" 
              />
              
              <circle cx={30 + ((selectedMonth - 1) / 11) * 260} cy="15" r="4.5" fill="#10b981" stroke="#0a0a0a" strokeWidth="1.5" />
              <circle cx={30 + ((selectedMonth - 1) / 11) * 260} cy={15 + ((selectedMonth - 1) / 11) * 79} r="4.5" fill="#ef4444" stroke="#0a0a0a" strokeWidth="1.5" />

              <text x="30" y="103" fill="#64748b" fontSize="7" textAnchor="middle" fontFamily="monospace">Month 1</text>
              <text x="95" y="103" fill="#64748b" fontSize="7" textAnchor="middle" fontFamily="monospace">M4</text>
              <text x="160" y="103" fill="#64748b" fontSize="7" textAnchor="middle" fontFamily="monospace">M7</text>
              <text x="225" y="103" fill="#64748b" fontSize="7" textAnchor="middle" fontFamily="monospace">M10</text>
              <text x="290" y="103" fill="#64748b" fontSize="7" textAnchor="middle" fontFamily="monospace">Month 12</text>
            </svg>

            {/* Slider to change month */}
            <div className="mt-3.5 space-y-2">
              <div className="flex justify-between items-center text-[9px] font-mono">
                <span className="text-zinc-500">PROJECTION HORIZON CALIBRATION:</span>
                <span className="text-blue-400 font-bold">{selectedMonth} MONTHS</span>
              </div>
              <input 
                type="range"
                min="1"
                max="12"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Results Analysis */}
          {(() => {
            const proactiveHealth = 98 - Math.round(selectedMonth * 0.35);
            const deferredHealth = 98 - Math.round(selectedMonth * 4.6);
            const savedMultiplier = task.priority === "High" ? 45 : task.priority === "Medium" ? 25 : 15;
            const cumulativeSaved = selectedMonth * savedMultiplier;
            
            return (
              <div className="mt-3.5 p-3.5 bg-zinc-950/80 rounded-xl space-y-2.5 text-[10px] font-sans border border-slate-950">
                <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                  <span className="text-zinc-500 font-mono">UPKEEP ROUTE CORRELATION</span>
                  <strong className="text-emerald-400 font-mono font-extrabold text-[11px]">{proactiveHealth}% HEALTH</strong>
                </div>
                <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                  <span className="text-zinc-500 font-mono">DEFERRED TIMELINE IMPACT</span>
                  <strong className="text-red-400 font-mono font-extrabold text-[11px]">{deferredHealth}% HEALTH</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-mono">SAVINGS YTD PROTECTION DELTA</span>
                  <strong className="text-blue-400 font-mono font-extrabold text-[11px]">${cumulativeSaved} USD PREVENTED</strong>
                </div>
                <p className="text-[9px] text-zinc-400 border-t border-slate-900 pt-2 leading-relaxed">
                  {selectedMonth <= 3 && "✓ Stage 1: Minor deposits active. Wear rates correspond perfectly to nominal specification baselines."}
                  {selectedMonth > 3 && selectedMonth <= 7 && "⚠️ Stage 2: Performance decreases by 10-15%. Accelerated friction degrades mechanical seals or electrical circuits."}
                  {selectedMonth > 7 && "🛑 Stage 3: Extreme high risk window. Secondary subsystem components begin taking overflow load, inviting critical fail loops."}
                </p>
              </div>
            );
          })()}
        </div>

        {/* 7. DIY VS PRO SERVICE COST MATRIX */}
        <div className="bg-[#101820] border border-slate-800 rounded-2xl p-4 shadow-lg text-left">
          <div className="flex items-center space-x-2 mb-3.5">
            <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <Coins className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">DIY vs Professional Service Matrix</h4>
              <p className="text-[8.5px] text-zinc-400">Financial savings details & credential parameters</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-900 bg-zinc-950">
            <table className="w-full text-left border-collapse text-[10px]">
              <thead>
                <tr className="bg-zinc-900 border-b border-slate-850 font-semibold text-zinc-400 text-[8.5px] uppercase tracking-wider">
                  <th className="p-2.5">Care Metric</th>
                  <th className="p-2.5 text-emerald-400">Proactive DIY</th>
                  <th className="p-2.5 text-blue-400">Certified Pro</th>
                  <th className="p-2.5 text-right">Delta Saved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 font-mono text-zinc-300">
                <tr>
                  <td className="p-2.5 font-sans font-semibold text-zinc-400">Direct Cost</td>
                  <td className="p-2.5 text-emerald-400">$35 - $65</td>
                  <td className="p-2.5">$180 - $320</td>
                  <td className="p-2.5 text-right font-bold text-emerald-400">+$250</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-semibold text-zinc-400">Labor Time</td>
                  <td className="p-2.5">1.0h - 2.5h</td>
                  <td className="p-2.5">0.5h (Sync)</td>
                  <td className="p-2.5 text-right text-zinc-500">Effort Premium</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-semibold text-zinc-400">Hazards</td>
                  <td className="p-2.5 text-blue-400">Low / Medium</td>
                  <td className="p-2.5 text-emerald-400">Guaranteed Zero</td>
                  <td className="p-2.5 text-right text-zinc-500">Liability Hand-off</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-semibold text-zinc-400">Warranty Protection</td>
                  <td className="p-2.5">Standard Parts Only</td>
                  <td className="p-2.5 text-emerald-400">Full Bonded Certified</td>
                  <td className="p-2.5 text-right text-zinc-500">Warranty Lock</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex items-start gap-1.5 mt-2.5 pl-1 text-[8.5px] text-zinc-500">
            <Info className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <span>Proactive self-care offers extreme cash savings, but complex tasks must preserve professional warranty boundaries.</span>
          </div>
        </div>

        {/* 8. MANUAL STEP CHECKLIST */}
        <div className="bg-[#101820] border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sequence Manual Checklist</h4>
                <p className="text-[8.5px] text-zinc-400">Check off steps sequentially to automatically log task</p>
              </div>
            </div>
            <span className="text-[9.5px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              {progressPercent}% Complete
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="space-y-2">
            {substeps.map((step, stepIdx) => (
              <div 
                key={stepIdx}
                onClick={() => handleToggleSubStep(stepIdx)}
                className={`p-3 rounded-xl border flex items-start gap-3 transition-colors cursor-pointer text-left ${
                  checkedSubSteps[stepIdx]
                    ? "bg-emerald-950/10 border-emerald-500/30 text-zinc-400"
                    : "bg-[#0A0A0A] border-slate-800 hover:border-slate-700 text-white"
                }`}
              >
                <div className={`mt-0.5 w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                  checkedSubSteps[stepIdx]
                    ? "bg-emerald-600 border-emerald-500 text-white"
                    : "border-slate-600 bg-zinc-950"
                }`}>
                  {checkedSubSteps[stepIdx] && <Check className="w-3 h-3 text-white stroke-[3.5]" />}
                </div>
                <div className="flex-grow min-w-0 text-[10.5px]">
                  <span className="font-mono font-bold text-zinc-500 mr-1.5">Step {stepIdx + 1}:</span>
                  <span className={checkedSubSteps[stepIdx] ? "line-through text-zinc-400" : ""}>{step}</span>
                </div>
              </div>
            ))}
          </div>

          {progressPercent === 100 && (
            <div className="mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center flex flex-col items-center justify-center gap-1 animate-bounce">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h5 className="text-[11px] font-bold text-white uppercase tracking-wider">Sequence Complete!</h5>
              <p className="text-[9px] text-zinc-400">All steps checked. This task has been automatically logged and marked completed on your calendar dashboard.</p>
            </div>
          )}
        </div>

        {/* Linked system state notice */}
        {linkedSystem && (
          <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-start space-x-2.5 text-blue-400 text-left">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" />
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider">Linked Telemetry Node Details</p>
              <p className="text-[9.5px] text-zinc-400 leading-normal">
                This sequence is connected directly to the <strong className="text-zinc-300">{linkedSystem.name}</strong> hardware node. Current health stands at <strong className="text-zinc-300">{linkedSystem.health}% ({linkedSystem.status})</strong>. Successful completion stabilizes fatigue wear.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* 9. FIXED BOTTOM NAV BUTTON BAR */}
      <BottomNavBar activeTab="tasks" onNavigateToScreen={onNavigateToScreen} />

    </div>
  );
}
