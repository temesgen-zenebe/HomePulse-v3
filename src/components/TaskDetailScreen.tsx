import React from "react";
import { 
  CheckCircle2, 
  ChevronRight, 
  Info, 
  Calendar, 
  ShieldAlert, 
  HelpCircle, 
  User, 
  MapPin, 
  Sparkles, 
  Wrench,
  Check,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Film,
  Trash2,
  Link2,
  Loader2,
  X,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Calculator,
  Hammer,
  Scale,
  Clock,
  DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MaintenanceTask } from "../types";

interface TaskDetailScreenProps {
  tasks: MaintenanceTask[];
  onToggleTask: (taskId: string) => void;
  onNavigateToScreen: (screenId: string) => void;
  onUpdateTasks?: (tasks: MaintenanceTask[]) => void;
}

export default function TaskDetailScreen({ 
  tasks, 
  onToggleTask, 
  onNavigateToScreen,
  onUpdateTasks 
}: TaskDetailScreenProps) {
  const [selectedTaskId, setSelectedTaskId] = React.useState<string>("task_1");
  const [proBooked, setProBooked] = React.useState(false);

  // DIY vs Pro Estimate Calculator State
  const [diyMaterials, setDiyMaterials] = React.useState(25);
  const [diyTime, setDiyTime] = React.useState(0.5); // Hours
  const [diyDifficulty, setDiyDifficulty] = React.useState(1.0); // 1.0 to 2.5 multiplier
  const [hourlyValuation, setHourlyValuation] = React.useState(35); // Value of personal time ($/hr)
  const [proLaborHours, setProLaborHours] = React.useState(1.0);
  const [proHourlyRate, setProHourlyRate] = React.useState(95);
  const [proMaterials, setProMaterials] = React.useState(35);
  const [proCallout, setProCallout] = React.useState(75);
  const [safetyRisk, setSafetyRisk] = React.useState<"Low" | "Medium" | "High">("Low");
  const [calculatorTab, setCalculatorTab] = React.useState<"diy" | "pro" | "compare">("compare");

  // Video states
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generationStep, setGenerationStep] = React.useState("");
  const [isAttaching, setIsAttaching] = React.useState(false);
  const [customUrl, setCustomUrl] = React.useState("");

  const activeTask = tasks.find(t => t.id === selectedTaskId) || tasks[0];

  const aiVideoDatabase: Record<string, string> = {
    "task_1": "https://assets.mixkit.co/videos/preview/mixkit-technician-working-on-an-air-conditioning-unit-43032-large.mp4",
    "task_2": "https://assets.mixkit.co/videos/preview/mixkit-rain-water-flowing-from-the-roof-gutter-42023-large.mp4",
    "task_3": "https://assets.mixkit.co/videos/preview/mixkit-plumber-working-with-pipes-43034-large.mp4",
    "task_4": "https://assets.mixkit.co/videos/preview/mixkit-glowing-red-fire-alarm-siren-light-41804-large.mp4"
  };

  // Task cost defaults generator
  const getTaskDefaults = (taskId: string, title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes("filter") || titleLower.includes("hvac") || taskId === "task_1") {
      return {
        diyMaterials: 25,
        diyTime: 0.5,
        diyDifficulty: 1.0,
        proLaborHours: 1.0,
        proHourlyRate: 95,
        proMaterials: 30,
        proCallout: 75,
        safetyRisk: "Low" as const
      };
    } else if (titleLower.includes("gutter") || titleLower.includes("roof") || titleLower.includes("downspout") || taskId === "task_2") {
      return {
        diyMaterials: 40,
        diyTime: 2.0,
        diyDifficulty: 1.8, // Ladder risk
        proLaborHours: 2.0,
        proHourlyRate: 110,
        proMaterials: 45,
        proCallout: 85,
        safetyRisk: "High" as const
      };
    } else if (titleLower.includes("water") || titleLower.includes("flush") || titleLower.includes("drain") || titleLower.includes("plumb") || taskId === "task_3") {
      return {
        diyMaterials: 45,
        diyTime: 1.5,
        diyDifficulty: 1.3,
        proLaborHours: 1.5,
        proHourlyRate: 115,
        proMaterials: 35,
        proCallout: 80,
        safetyRisk: "Medium" as const
      };
    } else if (titleLower.includes("alarm") || titleLower.includes("smoke") || titleLower.includes("battery") || taskId === "task_4") {
      return {
        diyMaterials: 15,
        diyTime: 0.3,
        diyDifficulty: 1.0,
        proLaborHours: 0.75,
        proHourlyRate: 85,
        proMaterials: 15,
        proCallout: 60,
        safetyRisk: "Low" as const
      };
    } else {
      return {
        diyMaterials: 30,
        diyTime: 1.0,
        diyDifficulty: 1.2,
        proLaborHours: 1.5,
        proHourlyRate: 100,
        proMaterials: 40,
        proCallout: 75,
        safetyRisk: "Medium" as const
      };
    }
  };

  // When activeTask changes, reset the video player state and cost calculator
  React.useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setProgress(0);
    if (videoRef.current) {
      videoRef.current.load();
    }

    const defaults = getTaskDefaults(activeTask.id, activeTask.title);
    setDiyMaterials(defaults.diyMaterials);
    setDiyTime(defaults.diyTime);
    setDiyDifficulty(defaults.diyDifficulty);
    setProLaborHours(defaults.proLaborHours);
    setProHourlyRate(defaults.proHourlyRate);
    setProMaterials(defaults.proMaterials);
    setProCallout(defaults.proCallout);
    setSafetyRisk(defaults.safetyRisk);
  }, [activeTask.id]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn("Play blocked", err);
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
    const dur = videoRef.current.duration || 0;
    setCurrentTime(cur);
    setDuration(dur);
    if (dur > 0) {
      setProgress((cur / dur) * 100);
    }
  };

  const handleDurationChange = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current || !duration) return;
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    const newTime = (newProgress / 100) * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (timeInSecs: number) => {
    const mins = Math.floor(timeInSecs / 60);
    const secs = Math.floor(timeInSecs % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const startAiGeneration = () => {
    setIsGenerating(true);
    const steps = [
      "Analyzing physical blueprints & hardware layout...",
      "Sourcing manufacturer specification manuals...",
      "Synthesizing 3D spatial step annotations...",
      "Compiling telemetry narration & custom overlays...",
      "Finalizing high-fidelity walkthrough rendering..."
    ];

    let currentStepIdx = 0;
    setGenerationStep(steps[currentStepIdx]);

    const interval = setInterval(() => {
      currentStepIdx++;
      if (currentStepIdx < steps.length) {
        setGenerationStep(steps[currentStepIdx]);
      } else {
        clearInterval(interval);
        
        // Pick video
        let selectedVideo = aiVideoDatabase[activeTask.id];
        if (!selectedVideo) {
          // Fallback based on text search
          const titleLower = activeTask.title.toLowerCase();
          if (titleLower.includes("filter") || titleLower.includes("hvac")) {
            selectedVideo = aiVideoDatabase["task_1"];
          } else if (titleLower.includes("gutter") || titleLower.includes("roof") || titleLower.includes("downspout")) {
            selectedVideo = aiVideoDatabase["task_2"];
          } else if (titleLower.includes("water") || titleLower.includes("flush") || titleLower.includes("drain") || titleLower.includes("plumb")) {
            selectedVideo = aiVideoDatabase["task_3"];
          } else {
            selectedVideo = aiVideoDatabase["task_4"]; // general safety
          }
        }

        // Update task state in parent list
        if (onUpdateTasks) {
          const updated = tasks.map(t => t.id === activeTask.id ? { ...t, video: selectedVideo } : t);
          onUpdateTasks(updated);
        }
        
        setIsGenerating(false);
      }
    }, 1100);
  };

  const handleAttachCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    if (onUpdateTasks) {
      const updated = tasks.map(t => t.id === activeTask.id ? { ...t, video: customUrl.trim() } : t);
      onUpdateTasks(updated);
    }

    setCustomUrl("");
    setIsAttaching(false);
  };

  const handleRemoveVideo = () => {
    if (onUpdateTasks) {
      const updated = tasks.map(t => t.id === activeTask.id ? { ...t, video: undefined } : t);
      onUpdateTasks(updated);
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setProgress(0);
  };

  const handleProBook = () => {
    setProBooked(true);
    setTimeout(() => {
      setProBooked(false);
      alert(`HomePulse Pro dispatcher dispatched! A certified technician will contact you to schedule: "${activeTask.title}" within 2 hours.`);
    }, 400);
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case "WHAT":
        return <Info className="w-4 h-4 text-blue-400" />;
      case "WHEN":
        return <Calendar className="w-4 h-4 text-emerald-400" />;
      case "WHY":
        return <ShieldAlert className="w-4 h-4 text-amber-400" />;
      case "HOW":
        return <HelpCircle className="w-4 h-4 text-purple-400" />;
      case "WHO":
        return <User className="w-4 h-4 text-cyan-400" />;
      case "WHERE":
        return <MapPin className="w-4 h-4 text-pink-400" />;
      default:
        return <Wrench className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0A0A0A] text-white font-sans relative">
      
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-36 scrollbar-none">
        
        {/* Screen Header */}
        <div className="mb-4 text-left">
          <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Telemetry Details</span>
          <h2 className="text-xl font-extrabold tracking-tight text-white font-display">Task Guide</h2>
        </div>

        {/* Task Pill Selector */}
        <div className="flex space-x-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
          {tasks.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTaskId(t.id)}
              className={`text-[9px] font-bold px-3 py-1.5 rounded-full border flex-shrink-0 transition-all ${
                t.id === selectedTaskId
                  ? "bg-[#2563EB]/10 border-[#2563EB] text-blue-400 font-extrabold shadow-[0_0_8px_rgba(37,99,235,0.1)]"
                  : "bg-[#101820] border-slate-800 text-zinc-400 hover:border-slate-700"
              }`}
            >
              {t.title.split(" ")[0]}.. {t.completed ? "✓" : ""}
            </button>
          ))}
        </div>

        {/* Task Header Information */}
        <div className="bg-[#101820] border border-slate-800 rounded-2xl p-4 shadow-lg mb-5 relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full filter blur-xl"></div>
          
          <div className="flex items-center justify-between">
            <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
              activeTask.priority === "High" 
                ? "bg-red-500/10 border-red-500/20 text-red-400" 
                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
            }`}>
              {activeTask.priority} Priority
            </span>

            <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
              activeTask.completed 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-blue-500/10 border-blue-500/20 text-blue-400"
            }`}>
              {activeTask.completed ? "Completed" : "Active Upkeep"}
            </span>
          </div>

          <h3 className="text-sm font-extrabold text-white mt-2 leading-snug">
            {activeTask.title}
          </h3>
          <p className="text-[10px] text-zinc-400 mt-1">
            Predictive upkeep timeline managed by HomePulse Engine
          </p>
        </div>

        {/* Structured Sections (WHAT, WHEN, WHY, HOW, WHO, WHERE) */}
        <div className="space-y-3.5 mb-5 text-left">
          {[
            { tag: "WHAT", label: "Task Core", value: activeTask.title },
            { tag: "WHEN", label: "Target Date", value: activeTask.due },
            { tag: "WHY", label: "Strategic Purpose", value: activeTask.why },
            { tag: "HOW", label: "DIY Step-by-Step Instructions", value: activeTask.how },
            { tag: "WHO", label: "Operator Profile", value: activeTask.who },
            { tag: "WHERE", label: "Property Zone Location", value: activeTask.where }
          ].map((sec) => (
            <div key={sec.tag} className="flex items-start space-x-3 bg-[#101820]/40 p-3 rounded-xl border border-slate-800/80">
              <div className="p-2 bg-[#101820] border border-slate-800 rounded-lg flex-shrink-0 mt-0.5 shadow-md">
                {getSectionIcon(sec.tag)}
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">{sec.tag}</span>
                  <span className="text-[9px] text-zinc-400 font-semibold">• {sec.label}</span>
                </div>
                <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                  {sec.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Video Documentation Section */}
        <div id="video-documentation-section" className="bg-[#101820] border border-slate-800 rounded-2xl p-4 shadow-lg text-left mt-5 mb-3">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                <Film className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Video Documentation</h4>
                <p className="text-[9px] text-zinc-400">AI-generated visual guides & task walkthroughs</p>
              </div>
            </div>

            {activeTask.video && (
              <button
                onClick={handleRemoveVideo}
                className="text-[9px] text-zinc-500 hover:text-red-400 font-bold transition-colors flex items-center gap-1 p-1 bg-zinc-900 border border-slate-800/80 rounded"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove</span>
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {isGenerating ? (
              // Generator Loader state
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center p-8 bg-[#0A0A0A]/80 border border-dashed border-blue-500/25 rounded-xl text-center space-y-4"
              >
                <div className="relative">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                  <Sparkles className="w-4 h-4 text-indigo-400 absolute -top-1 -right-1 animate-ping" />
                </div>
                <div className="space-y-1 max-w-[240px]">
                  <h5 className="text-[10.5px] font-bold text-white uppercase tracking-wider">Synthesizing Walkthrough</h5>
                  <p className="text-[9.5px] text-zinc-400 italic leading-snug animate-pulse">
                    "{generationStep}"
                  </p>
                </div>
              </motion.div>
            ) : activeTask.video ? (
              // Video Player state
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-slate-800 group shadow-md">
                  
                  {/* Real HTML Video element */}
                  <video
                    ref={videoRef}
                    src={activeTask.video}
                    onTimeUpdate={handleTimeUpdate}
                    onDurationChange={handleDurationChange}
                    onClick={handlePlayPause}
                    className="w-full h-full object-cover"
                    loop
                    playsInline
                    preload="metadata"
                  />

                  {/* Telemetry Overlays */}
                  <div className="absolute top-2 left-2 z-10 flex flex-col pointer-events-none select-none">
                    <span className="text-[7.5px] font-mono font-bold bg-black/60 text-emerald-400 border border-emerald-500/20 px-1 py-0.5 rounded backdrop-blur-sm tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                      LIVE WALKTHROUGH FEED
                    </span>
                    <span className="text-[6.5px] font-mono text-zinc-500 mt-1 tracking-wider bg-black/40 px-1 py-0.5 rounded w-max">
                      FPS: 60 / REF_3D_GRID
                    </span>
                  </div>

                  {/* Custom Player Controls Bar */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-2.5 flex flex-col justify-end opacity-100 group-hover:opacity-100 transition-opacity duration-300">
                    
                    {/* Time slider */}
                    <div className="flex items-center space-x-2 mb-1.5">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.1"
                        value={progress}
                        onChange={handleProgressChange}
                        className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={handlePlayPause}
                          className="p-1 bg-white/10 hover:bg-white/20 text-white rounded transition-colors cursor-pointer"
                        >
                          {isPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-white text-white" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-white text-white" />
                          )}
                        </button>

                        <button
                          onClick={handleMuteToggle}
                          className="p-1 bg-white/10 hover:bg-white/20 text-white rounded transition-colors cursor-pointer"
                        >
                          {isMuted ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <span className="text-[8px] font-mono text-zinc-300 select-none">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      <span className="text-[7.5px] font-mono text-blue-400 bg-blue-500/15 border border-blue-500/25 px-1.5 py-0.5 rounded">
                        1080P HEVC
                      </span>
                    </div>

                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-zinc-500 text-[8.5px] font-mono">
                    <AlertCircle className="w-3 h-3 text-blue-400" />
                    <span>Watch exact physical walkthrough vectors.</span>
                  </div>
                  
                  {activeTask.video.startsWith("https://assets.mixkit.co") && (
                    <span className="text-[8px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/10">
                      Gemini Synthesized
                    </span>
                  )}
                </div>
              </motion.div>
            ) : (
              // Empty documentation placeholder
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3.5"
              >
                <div className="bg-[#0A0A0A]/40 border border-slate-800 border-dashed rounded-xl p-5 text-center flex flex-col items-center justify-center">
                  <Film className="w-6 h-6 text-zinc-600 mb-2" />
                  <h5 className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-widest">No Walkthrough Synced</h5>
                  <p className="text-[9px] text-zinc-500 max-w-[220px] mt-1 leading-snug">
                    Generate an AI video walk-through or attach a custom maintenance guide link.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={startAiGeneration}
                    className="py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-blue-500/10"
                  >
                    <Sparkles className="w-3 h-3 text-blue-300" />
                    <span>Generate AI Video</span>
                  </button>

                  <button
                    onClick={() => setIsAttaching(!isAttaching)}
                    className="py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-slate-800/80 text-zinc-300 font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Link2 className="w-3 h-3 text-zinc-400" />
                    <span>{isAttaching ? "Cancel Link" : "Attach URL"}</span>
                  </button>
                </div>

                <AnimatePresence>
                  {isAttaching && (
                    <motion.form 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleAttachCustomUrl}
                      className="p-3 bg-[#0A0A0A] border border-slate-800/80 rounded-xl space-y-2 mt-2 overflow-hidden text-left"
                    >
                      <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                        Custom Walkthrough URL (MP4 / Web Video)
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="url"
                          required
                          placeholder="https://example.com/walkthrough.mp4"
                          value={customUrl}
                          onChange={(e) => setCustomUrl(e.target.value)}
                          className="flex-1 bg-zinc-950 border border-slate-800 focus:border-blue-500 rounded px-2 py-1 text-[10px] text-white focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[9px] uppercase rounded transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* DIY vs Professional Repair Cost Estimator */}
        <div className="bg-[#101820] border border-slate-800 rounded-2xl p-4 shadow-lg text-left mt-5 mb-5">
          <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-800/80">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                <Calculator className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">DIY vs. Pro Cost Estimator</h4>
                <p className="text-[9px] text-zinc-400">Calculate economic savings and risk thresholds</p>
              </div>
            </div>
            <div className="flex bg-[#0A0A0A] p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setCalculatorTab("compare")}
                className={`px-2 py-1 text-[8px] font-bold uppercase rounded-md transition-all ${
                  calculatorTab === "compare" 
                    ? "bg-indigo-600 text-white shadow-sm" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Compare
              </button>
              <button
                type="button"
                onClick={() => setCalculatorTab("diy")}
                className={`px-2 py-1 text-[8px] font-bold uppercase rounded-md transition-all ${
                  calculatorTab === "diy" 
                    ? "bg-indigo-600 text-white shadow-sm" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                DIY Params
              </button>
              <button
                type="button"
                onClick={() => setCalculatorTab("pro")}
                className={`px-2 py-1 text-[8px] font-bold uppercase rounded-md transition-all ${
                  calculatorTab === "pro" 
                    ? "bg-indigo-600 text-white shadow-sm" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Pro Params
              </button>
            </div>
          </div>

          {/* DYNAMIC CALCULATIONS */}
          {(() => {
            // Out of pocket financial costs
            const totalDiyFinancial = diyMaterials;
            const totalProFinancial = (proLaborHours * proHourlyRate) + proMaterials + proCallout;
            
            // Value of personal time with difficulty multiplier (risk / tools premium)
            const opportunityCost = diyTime * hourlyValuation * diyDifficulty;
            const fullDiyEconomicCost = totalDiyFinancial + opportunityCost;
            
            const financialSavings = Math.max(0, totalProFinancial - totalDiyFinancial);
            const netEconomicSavings = Math.max(0, totalProFinancial - fullDiyEconomicCost);

            // recommendation engine
            let recommendationTitle = "";
            let recommendationDesc = "";
            let recommendationBadge = "";
            let recommendationColor = ""; // text and background styles

            if (safetyRisk === "High") {
              recommendationTitle = "Professional Service Strongly Recommended";
              recommendationDesc = "Working at heights or with complex systems poses safety risk. The specialized pro is safer and guarantees the result.";
              recommendationBadge = "High Risk Level";
              recommendationColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
            } else if (financialSavings <= 0) {
              recommendationTitle = "Professional Work Advised";
              recommendationDesc = "DIY material costs exceed professional bundled rate. It is more cost-effective to schedule a certified technician.";
              recommendationBadge = "No Savings Margin";
              recommendationColor = "text-red-400 bg-red-500/10 border-red-500/20";
            } else if (netEconomicSavings <= 10 && safetyRisk === "Medium") {
              recommendationTitle = "Marginal DIY Advantage";
              recommendationDesc = "You save cash out-of-pocket, but when factoring in hours of personal effort and complexity, scheduling a Pro offers excellent value.";
              recommendationBadge = "Time-vs-Value Blend";
              recommendationColor = "text-blue-400 bg-blue-500/10 border-blue-500/20";
            } else if (financialSavings > 120 && safetyRisk === "Low") {
              recommendationTitle = "Strong DIY Candidate";
              recommendationDesc = "Low complexity with high financial yield. Follow the step-by-step interactive directions to maximize budget savings.";
              recommendationBadge = "Optimal DIY Choice";
              recommendationColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
            } else {
              recommendationTitle = "DIY Recommended (Moderate Effort)";
              recommendationDesc = "Good savings potential. Make sure you possess basic tools before proceeding, or book a Pro if you prefer professional security.";
              recommendationBadge = "Standard DIY";
              recommendationColor = "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
            }

            return (
              <div className="space-y-4">
                {/* 1. VIEW TAB: DIY PARAMS */}
                {calculatorTab === "diy" && (
                  <div className="space-y-3.5 bg-[#0A0A0A]/60 p-3 rounded-xl border border-slate-900">
                    <span className="text-[8px] font-mono font-bold text-indigo-400 uppercase tracking-widest block mb-1">DIY Parameter Controls</span>
                    
                    {/* Input: DIY Materials */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-zinc-400 flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-zinc-500" /> Materials & Parts Cost
                        </span>
                        <span className="text-white font-mono font-bold">${diyMaterials}</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="250"
                        step="5"
                        value={diyMaterials}
                        onChange={(e) => setDiyMaterials(parseInt(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    {/* Input: DIY Time */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-500" /> Estimated Labor Time
                        </span>
                        <span className="text-white font-mono font-bold">{diyTime} hr{diyTime !== 1 ? "s" : ""}</span>
                      </div>
                      <input
                        type="range"
                        min="0.25"
                        max="8"
                        step="0.25"
                        value={diyTime}
                        onChange={(e) => setDiyTime(parseFloat(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    {/* Input: Personal Time valuation */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-zinc-400 flex items-center gap-1">
                          <User className="w-3 h-3 text-zinc-500" /> Hourly Value of Your Time
                        </span>
                        <span className="text-white font-mono font-bold">${hourlyValuation}/hr</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="150"
                        step="5"
                        value={hourlyValuation}
                        onChange={(e) => setHourlyValuation(parseInt(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    {/* Input: Difficulty Multiplier */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-zinc-400 flex items-center gap-1">
                          <Hammer className="w-3 h-3 text-zinc-500" /> Complexity Multiplier
                        </span>
                        <span className="text-white font-mono font-bold">{diyDifficulty}x</span>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="2.5"
                        step="0.1"
                        value={diyDifficulty}
                        onChange={(e) => setDiyDifficulty(parseFloat(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <span className="text-[7px] text-zinc-500 block">Compensates for extra tool purchases, safety hazards or risk factors.</span>
                    </div>
                  </div>
                )}

                {/* 2. VIEW TAB: PRO PARAMS */}
                {calculatorTab === "pro" && (
                  <div className="space-y-3.5 bg-[#0A0A0A]/60 p-3 rounded-xl border border-slate-900">
                    <span className="text-[8px] font-mono font-bold text-indigo-400 uppercase tracking-widest block mb-1">Professional Parameter Controls</span>
                    
                    {/* Input: Pro Labor Hours */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-500" /> Professional Labor Hours
                        </span>
                        <span className="text-white font-mono font-bold">{proLaborHours} hr{proLaborHours !== 1 ? "s" : ""}</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="6"
                        step="0.25"
                        value={proLaborHours}
                        onChange={(e) => setProLaborHours(parseFloat(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    {/* Input: Pro Hourly Rate */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-zinc-400 flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-zinc-500" /> Contractor Hourly Rate
                        </span>
                        <span className="text-white font-mono font-bold">${proHourlyRate}/hr</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="200"
                        step="5"
                        value={proHourlyRate}
                        onChange={(e) => setProHourlyRate(parseInt(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    {/* Input: Pro Materials & Markups */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-zinc-400 flex items-center gap-1">
                          <Wrench className="w-3 h-3 text-zinc-500" /> Pro Materials & Parts
                        </span>
                        <span className="text-white font-mono font-bold">${proMaterials}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        step="5"
                        value={proMaterials}
                        onChange={(e) => setProMaterials(parseInt(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    {/* Input: Pro Call-out Fee */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-zinc-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-500" /> Contractor Flat Call-out Fee
                        </span>
                        <span className="text-white font-mono font-bold">${proCallout}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="150"
                        step="5"
                        value={proCallout}
                        onChange={(e) => setProCallout(parseInt(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {/* 3. COMPARE VIEW & SIDE-BY-SIDE SUMMARY */}
                <div className="grid grid-cols-2 gap-3">
                  {/* DIY card */}
                  <div className="bg-[#0A0A0A]/40 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                          <Hammer className="w-3 h-3" /> DIY MODEL
                        </span>
                        <span className="text-[7px] font-mono text-zinc-500">Low Risk</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px]">
                          <span className="text-zinc-400">Out of Pocket:</span>
                          <span className="text-white font-mono font-bold">${totalDiyFinancial}</span>
                        </div>
                        <div className="flex justify-between text-[8px]">
                          <span className="text-zinc-400">Time Opportunity:</span>
                          <span className="text-zinc-500 font-mono">${opportunityCost.toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-800/80 pt-2 mt-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[7px] text-zinc-500 font-mono">TOTAL ECO:</span>
                        <span className="text-xs font-black text-white font-mono">${fullDiyEconomicCost.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* PRO card */}
                  <div className="bg-[#0A0A0A]/40 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-bold text-blue-400 flex items-center gap-1">
                          <Wrench className="w-3 h-3" /> CONTRACTOR
                        </span>
                        <span className={`text-[7px] font-mono px-1 rounded ${
                          safetyRisk === "High" ? "bg-red-500/10 text-red-400" : safetyRisk === "Medium" ? "bg-amber-500/10 text-amber-400" : "bg-zinc-850 text-zinc-500"
                        }`}>{safetyRisk} Risk</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px]">
                          <span className="text-zinc-400">Labor ({proLaborHours}h):</span>
                          <span className="text-white font-mono">${(proLaborHours * proHourlyRate).toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between text-[8px]">
                          <span className="text-zinc-400">Parts & Markup:</span>
                          <span className="text-white font-mono">${proMaterials}</span>
                        </div>
                        <div className="flex justify-between text-[8px]">
                          <span className="text-zinc-400">Call-out fee:</span>
                          <span className="text-white font-mono">${proCallout}</span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-800/80 pt-2 mt-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[7px] text-zinc-500 font-mono">TOTAL COST:</span>
                        <span className="text-xs font-black text-blue-400 font-mono">${totalProFinancial.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* VISUAL SAVINGS SPLIT (BAR CHART REPRESENTATION) */}
                <div className="space-y-2 bg-[#0A0A0A]/50 p-3 rounded-xl border border-slate-800/80 text-center">
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="text-zinc-400">Out-of-Pocket Savings:</span>
                    <span className="text-emerald-400 font-black">${financialSavings.toFixed(0)} saved</span>
                  </div>

                  {/* Relative bar chart */}
                  <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${Math.max(8, Math.min(92, (totalDiyFinancial / (totalDiyFinancial + totalProFinancial)) * 100))}%` }}
                    />
                    <div 
                      className="bg-blue-500 h-full transition-all duration-500 flex-1"
                    />
                  </div>
                  <div className="flex justify-between text-[7px] font-mono text-zinc-500">
                    <span>DIY Parts (${totalDiyFinancial})</span>
                    <span>Pro Total (${totalProFinancial})</span>
                  </div>
                </div>

                {/* RECOMMENDATION DECISION BANNER */}
                <div className={`p-3 rounded-xl border flex gap-2.5 ${recommendationColor}`}>
                  <Scale className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide">{recommendationTitle}</span>
                      <span className="text-[7px] font-mono font-bold bg-white/10 px-1 rounded uppercase">{recommendationBadge}</span>
                    </div>
                    <p className="text-[9.5px] leading-relaxed opacity-90">
                      {recommendationDesc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

      </div>

      {/* Persistent Bottom Tab Actions */}
      <div className="absolute bottom-16 inset-x-0 h-14 bg-[#0A0A0A] border-t border-slate-900 flex items-center justify-between px-5 gap-3 z-30 select-none">
        
        {/* Toggle Complete Button (Green) */}
        <button
          onClick={() => onToggleTask(activeTask.id)}
          className={`flex-1 text-[11px] font-bold py-2.5 rounded-xl border flex items-center justify-center space-x-1.5 transition-all active:scale-95 cursor-pointer ${
            activeTask.completed
              ? "bg-zinc-900 border-emerald-500/20 text-emerald-400"
              : "bg-emerald-600 hover:bg-emerald-500 border-emerald-500/20 text-white shadow-lg shadow-emerald-500/10"
          }`}
        >
          {activeTask.completed ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Mark Active Again</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Complete</span>
            </>
          )}
        </button>

        {/* Schedule Pro Button (Blue) */}
        <button
          onClick={handleProBook}
          className="flex-1 bg-blue-600 hover:bg-blue-500 border border-blue-500/20 text-white text-[11px] font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 shadow-lg shadow-blue-500/10 transition-all active:scale-95 cursor-pointer"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Schedule Pro</span>
        </button>
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
        <button className="flex flex-col items-center space-y-1 text-blue-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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

    </div>
  );
}
