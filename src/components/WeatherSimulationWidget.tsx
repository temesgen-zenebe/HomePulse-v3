import React from "react";
import { 
  Sun, 
  CloudRain, 
  Cloud, 
  Droplets, 
  Thermometer, 
  Wind, 
  Sparkles, 
  AlertTriangle, 
  Check, 
  Plus, 
  RefreshCw, 
  Snowflake, 
  Compass, 
  ShieldAlert
} from "lucide-react";
import { MaintenanceTask, PriorityLevel } from "../types";

// Standard pre-defined climates/regions for the weather simulator API
interface ClimateScenario {
  id: string;
  name: string;
  location: string;
  temp: number; // in Fahrenheit
  humidity: number; // in %
  windSpeed: number; // in mph
  uvIndex: number;
  condition: "Sunny" | "Rainy" | "Freezing" | "Cloudy";
  description: string;
  riskTitle: string;
  riskLevel: PriorityLevel;
  riskDesc: string;
  suggestedTasks: {
    id: string;
    title: string;
    priority: PriorityLevel;
    why: string;
    how: string;
    where: string;
    who: string;
  }[];
}

const CLIMATE_SCENARIOS: ClimateScenario[] = [
  {
    id: "freeze",
    name: "Sub-Zero Alpine Freeze",
    location: "Minneapolis, MN",
    temp: 12,
    humidity: 45,
    windSpeed: 18,
    uvIndex: 1,
    condition: "Freezing",
    description: "Polar vortex dipping south, bringing extreme low temperatures and bone-chilling drafts.",
    riskTitle: "Pipe Freezing & Draft Ingress",
    riskLevel: "High",
    riskDesc: "Copper supply lines in exterior-facing wall cavities are at high risk of bursting as water freezes and expands, causing immediate flooding upon thaw.",
    suggestedTasks: [
      {
        id: "task_weather_freeze_1",
        title: "Isolate Exterior Faucets & Hose Bibbs",
        priority: "High",
        why: "Prevents static water columns from freezing inside exterior-facing piping, fracturing copper joins.",
        how: "Shut off interior isolation valves dedicated to outdoor spigots, then open exterior taps to drain remaining hydraulic pressure.",
        where: "Basement/Utility Room & Exterior Siding",
        who: "Self-Guided (DIY)"
      },
      {
        id: "task_weather_freeze_2",
        title: "Seal Window Frame Voids & Draft Drafts",
        priority: "Medium",
        why: "Stops sub-zero drafts from pulling heat away from interior mechanical pipes.",
        how: "Apply temporary weatherstripping tape or draft draft stoppers around windows and basement sill plates.",
        where: "Sill plates, Basement & North windows",
        who: "Self-Guided (DIY)"
      }
    ]
  },
  {
    id: "humidity",
    name: "Tropical High Humidity Spike",
    location: "Miami, FL",
    temp: 89,
    humidity: 86,
    windSpeed: 12,
    uvIndex: 9,
    condition: "Cloudy",
    description: "Intense maritime airflow saturated with moisture, driving high indoor vapor pressures.",
    riskTitle: "Mold Proliferation & Condensation",
    riskLevel: "High",
    riskDesc: "Elevated ambient vapor pressure exceeds safety parameters, creating surface dew points on sub-grade plasterboard and driving rapid mold spore germination.",
    suggestedTasks: [
      {
        id: "task_weather_humid_1",
        title: "Clear Dehumidifier Basin & Verify Drain Port",
        priority: "High",
        why: "Ensures continuous humidity extraction without auto-shutoff due to a filled condensate reservoir.",
        how: "Slide out basement dehumidifier reservoir, scrub off bacterial biofilm, verify the continuous gravity tube is free of algae blocks.",
        where: "Basement Utility Corner",
        who: "Self-Guided (DIY)"
      },
      {
        id: "task_weather_humid_2",
        title: "Calibrate HVAC Fan to 'Continuous Circle'",
        priority: "Medium",
        why: "Continuous airflow prevents localized thermal stratification and microclimate condensation zones.",
        how: "Access thermostat interface, override standard 'Auto' setting to 'On' or 'Circulate' to cycle air through filtration units.",
        where: "Thermostat Interface",
        who: "Self-Guided (DIY)"
      }
    ]
  },
  {
    id: "gale",
    name: "Coastal Storm & Stormwater Surge",
    location: "Portland, OR",
    temp: 52,
    humidity: 92,
    windSpeed: 38,
    uvIndex: 2,
    condition: "Rainy",
    description: "Deep barometric low driving heavy sheets of rain and potential structural runoff hazards.",
    riskTitle: "Stormwater Inundation & Gutter Failure",
    riskLevel: "High",
    riskDesc: "High storm volume can overwhelm sump pump check-valves and cause gutters to spill backwards directly into the building envelope's foundation footing.",
    suggestedTasks: [
      {
        id: "task_weather_storm_1",
        title: "Dry-Test Sump Pump Check Valve & Battery Power",
        priority: "High",
        why: "Guarantees foundation drainage during severe downpours, protecting basement storage and drywall.",
        how: "Pour two buckets of tap water into the sump pit to verify float-switch lift. Unplug mains power to confirm backup DC battery takes load.",
        where: "Sump Pump Pit",
        who: "Self-Guided (DIY)"
      },
      {
        id: "task_weather_storm_2",
        title: "Clear Stormwater Runoff Grates & Outfalls",
        priority: "Medium",
        why: "Keeps heavy roof water from ponding and causing hydrostatic pressure spikes against basement foundation block.",
        how: "Clear leaves, twigs, and pine-needle mulch away from low-point exterior storm grates and downspout splash blocks.",
        where: "Exterior Foundation Perimeter",
        who: "Self-Guided (DIY)"
      }
    ]
  },
  {
    id: "solar",
    name: "Severe Solar Radiation & Heatwave",
    location: "Phoenix, AZ",
    temp: 112,
    humidity: 14,
    windSpeed: 8,
    uvIndex: 11,
    condition: "Sunny",
    description: "Blistering solar heatwave exerting heavy thermal expansion stress on exterior roofing & compressors.",
    riskTitle: "Compressor Decay & Flooring Bleaching",
    riskLevel: "Medium",
    riskDesc: "Extreme outdoor ambient temperatures create high heat-sink loads on the AC condenser, while direct UV rays accelerate fading of oak timber floors.",
    suggestedTasks: [
      {
        id: "task_weather_solar_1",
        title: "Lower South-Facing Solar Roller Shades",
        priority: "Medium",
        why: "Shields precious wooden paneling and expensive furniture coatings from UV degradation and photothermal decay.",
        how: "Fully draw the thick solar UV block-out screens on all South and South-West facing glazing panels during peak sun.",
        where: "Living Room & South Wing",
        who: "Self-Guided (DIY)"
      },
      {
        id: "task_weather_solar_2",
        title: "Deploy HVAC Off-Peak Pre-Cooling",
        priority: "High",
        why: "Reduces peak-hour thermal stress on the AC compressor, keeping the refrigerant cycle within optimal limits.",
        how: "Program smart thermostat to pre-cool the living quarters to 71°F from 6:00 AM to 11:00 AM, then drift to 78°F during top heat hours.",
        where: "HVAC Thermostat Control",
        who: "Self-Guided (DIY)"
      }
    ]
  },
  {
    id: "normal",
    name: "Temperate Spring Baseline",
    location: "Seattle, WA",
    temp: 68,
    humidity: 50,
    windSpeed: 6,
    uvIndex: 4,
    condition: "Sunny",
    description: "Standard ambient spring environment. Systems are operating well within baseline parameters.",
    riskTitle: "None Detected",
    riskLevel: "Low",
    riskDesc: "No active environmental or microclimatic risk flags. Maintain standard scheduled inspections.",
    suggestedTasks: []
  }
];

interface WeatherSimulationWidgetProps {
  tasks: MaintenanceTask[];
  onAddTask: (task: MaintenanceTask) => void;
  addToast: (title: string, description: string, type: "task" | "risk" | "info" | "success") => void;
}

export default function WeatherSimulationWidget({
  tasks,
  onAddTask,
  addToast
}: WeatherSimulationWidgetProps) {
  const [selectedScenarioId, setSelectedScenarioId] = React.useState<string>("normal");
  const [isFetchingSim, setIsFetchingSim] = React.useState<boolean>(false);
  const [apiLatency, setApiLatency] = React.useState<number | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = React.useState<string>("Never Synced");

  const activeScenario = CLIMATE_SCENARIOS.find(s => s.id === selectedScenarioId) || CLIMATE_SCENARIOS[4];

  // Weather simulation refresh simulation handler
  const handleFetchSimulatedWeather = (scenarioId: string) => {
    setIsFetchingSim(true);
    setApiLatency(null);
    const startTime = performance.now();

    setTimeout(() => {
      setSelectedScenarioId(scenarioId);
      setIsFetchingSim(false);
      const latencyMs = Math.round(performance.now() - startTime);
      setApiLatency(latencyMs);
      
      const scenario = CLIMATE_SCENARIOS.find(s => s.id === scenarioId) || CLIMATE_SCENARIOS[4];
      setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      // Send a feedback toast
      addToast(
        `Weather Feed Synchronized`,
        `Fetched local climate telemetry for ${scenario.location}. System registered ${scenario.temp}°F, ${scenario.humidity}% RH.`,
        "info"
      );

      // If extreme, send risk toast too!
      if (scenario.id !== "normal") {
        setTimeout(() => {
          addToast(
            `Climate Risk Alert: ${scenario.riskTitle}`,
            `Risk level: ${scenario.riskLevel}. Suggested preventative tasks unlocked on your dashboard.`,
            "risk"
          );
        }, 1000);
      }
    }, 1200); // Simulated network call latency
  };

  // Check if a task is already in the main task list
  const isTaskAdded = (taskTitle: string) => {
    return tasks.some(t => t.title.toLowerCase() === taskTitle.toLowerCase());
  };

  const handleTriggerPreventiveTasks = () => {
    let tasksTriggeredCount = 0;

    activeScenario.suggestedTasks.forEach(task => {
      if (!isTaskAdded(task.title)) {
        // Construct standard MaintenanceTask
        const newTask: MaintenanceTask = {
          id: task.id,
          title: task.title,
          due: "Within 24 Hours",
          priority: task.priority,
          why: task.why,
          how: task.how,
          where: task.where,
          who: task.who,
          completed: false
        };
        onAddTask(newTask);
        tasksTriggeredCount++;
      }
    });

    if (tasksTriggeredCount > 0) {
      addToast(
        "Preventive Actions Deployed",
        `Injected ${tasksTriggeredCount} critical climate-risk mitigation tasks into your local schedule.`,
        "success"
      );
    } else {
      addToast(
        "Already Prepared",
        "All suggested mitigation tasks for this climate scenario are already in your schedule.",
        "info"
      );
    }
  };

  // Quick weather icons selector based on condition
  const renderWeatherIcon = (condition: string, temp: number) => {
    const iconClass = "w-10 h-10 transition-transform duration-500 ease-out hover:scale-110";
    if (condition === "Freezing" || temp < 32) {
      return <Snowflake className={`${iconClass} text-sky-400`} />;
    }
    switch (condition) {
      case "Sunny":
        return <Sun className={`${iconClass} text-amber-400 animate-spin-slow`} />;
      case "Rainy":
        return <CloudRain className={`${iconClass} text-blue-400`} />;
      case "Cloudy":
      default:
        return <Cloud className={`${iconClass} text-slate-400`} />;
    }
  };

  return (
    <div id="weather-sim-widget" className="bg-[#101820] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden mb-6">
      {/* Background atmosphere glow based on scenario */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full filter blur-[40px] pointer-events-none transition-all duration-700 opacity-20 ${
        activeScenario.id === "freeze" ? "bg-sky-500" :
        activeScenario.id === "humidity" ? "bg-teal-500" :
        activeScenario.id === "gale" ? "bg-blue-600" :
        activeScenario.id === "solar" ? "bg-amber-500" : "bg-blue-500/10"
      }`}></div>

      {/* Header and API controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
            <Compass className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Climate & Weather API Hub</h3>
            <p className="text-[10px] text-zinc-500 font-mono">Simulating live meteorological telemetry</p>
          </div>
        </div>

        {/* Climate Scenario API Selector */}
        <select
          id="weather-scenario-select"
          value={selectedScenarioId}
          onChange={(e) => handleFetchSimulatedWeather(e.target.value)}
          disabled={isFetchingSim}
          className="bg-[#0A0A0A] border border-slate-800 text-[10.5px] text-zinc-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500 cursor-pointer font-medium disabled:opacity-50"
        >
          <option value="normal">Normal: Seattle (Baseline)</option>
          <option value="freeze">Freeze: Minneapolis (Alpine)</option>
          <option value="humidity">Humidity: Miami (Subtropical)</option>
          <option value="gale">Storm: Portland (Rainy Gale)</option>
          <option value="solar">Solar: Phoenix (Desert Heat)</option>
        </select>
      </div>

      {/* Telemetry Display Station */}
      <div className="bg-[#0A0A0A] border border-slate-900 rounded-xl p-4 flex items-center justify-between relative">
        {isFetchingSim ? (
          <div className="absolute inset-0 bg-[#0A0A0A]/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center space-y-2 z-10">
            <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
            <span className="text-[10px] text-zinc-400 font-mono">Pinging Weather API feed...</span>
          </div>
        ) : null}

        {/* Left Side: Temperature and Big Icon */}
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-[#101820] border border-slate-800 rounded-2xl flex items-center justify-center">
            {renderWeatherIcon(activeScenario.condition, activeScenario.temp)}
          </div>
          <div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-white tracking-tight">{activeScenario.temp}°F</span>
              <span className="text-xs text-zinc-500 font-medium">({Math.round((activeScenario.temp - 32) * 5/9)}°C)</span>
            </div>
            <p className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
              <span>{activeScenario.condition}</span>
              <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
              <span className="text-zinc-500 font-normal">{activeScenario.location}</span>
            </p>
          </div>
        </div>

        {/* Right Side: Micro-readings Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10.5px] font-mono text-zinc-400 border-l border-slate-800/80 pl-4">
          <div className="flex items-center space-x-1.5">
            <Droplets className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[8px] text-zinc-600 uppercase font-bold leading-none">Humid</p>
              <p className="font-semibold text-white">{activeScenario.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <Wind className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[8px] text-zinc-600 uppercase font-bold leading-none">Wind</p>
              <p className="font-semibold text-white">{activeScenario.windSpeed} mph</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <Thermometer className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[8px] text-zinc-600 uppercase font-bold leading-none">UV Index</p>
              <p className="font-semibold text-white">{activeScenario.uvIndex}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[8px] text-zinc-600 uppercase font-bold leading-none">Status</p>
              <p className="font-semibold text-emerald-400 uppercase text-[9px]">Live Feed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Latency and Sync logs */}
      <div className="mt-2.5 flex items-center justify-between text-[8px] text-zinc-500 font-mono px-1">
        <span>API Latency: {apiLatency ? `${apiLatency}ms` : "62ms (cached)"}</span>
        <span>Last Synced: {lastSyncedTime}</span>
      </div>

      {/* Climate Risk Warnings & Action Center */}
      {activeScenario.id !== "normal" ? (
        <div className="mt-4 p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full filter blur-md pointer-events-none"></div>

          <div className="flex items-start space-x-2.5">
            <div className="p-1 bg-red-500/10 text-red-400 rounded-lg flex-shrink-0 mt-0.5 border border-red-500/10">
              <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-extrabold text-white">Climate Risk: {activeScenario.riskTitle}</span>
                <span className="text-[7.5px] font-bold uppercase tracking-wider bg-red-500/25 text-red-400 px-1 py-0.1 rounded border border-red-500/20">
                  {activeScenario.riskLevel} Risk
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                {activeScenario.riskDesc}
              </p>

              {/* Preventative Tasks List */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Recommended Preventative Measures:</p>
                {activeScenario.suggestedTasks.map((task) => {
                  const added = isTaskAdded(task.title);
                  return (
                    <div key={task.id} className="flex items-center justify-between bg-[#0A0A0A]/40 border border-slate-900 rounded-lg px-2.5 py-1.5 text-[10px]">
                      <div className="min-w-0 pr-2">
                        <p className={`font-semibold ${added ? "text-zinc-500 line-through" : "text-white"} truncate`}>
                          {task.title}
                        </p>
                        <p className="text-[9px] text-zinc-500 truncate mt-0.5">
                          {task.why}
                        </p>
                      </div>
                      {added ? (
                        <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-1 flex-shrink-0">
                          <Check className="w-3 h-3 text-emerald-400" /> Loaded
                        </span>
                      ) : (
                        <span className="text-[8px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/10 px-1.5 py-0.5 rounded flex items-center gap-1 flex-shrink-0">
                          <Plus className="w-3 h-3 text-blue-400" /> Pending
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Master Button to deploy preventive tasks */}
              <button
                onClick={handleTriggerPreventiveTasks}
                className="mt-3 w-full bg-[#E11D48] hover:bg-rose-500 text-white text-[10.5px] font-bold uppercase tracking-wider py-2 rounded-lg border border-rose-500/20 hover:border-rose-400/30 transition-all flex items-center justify-center space-x-1.5 shadow-lg shadow-rose-950/10"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Deploy Preventive Measures ({activeScenario.suggestedTasks.filter(t => !isTaskAdded(t.title)).length} Pending)</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/15 border border-emerald-500/10 text-center relative overflow-hidden">
          <div className="flex items-center justify-center space-x-2 text-emerald-400">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Climate Telemetry Stable</span>
          </div>
          <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
            Your microclimate conditions present no acute danger to active systems. Proceed with standard scheduled maintenance.
          </p>
        </div>
      )}
    </div>
  );
}
