import React from "react";
import { 
  Wifi, 
  ToggleLeft, 
  ToggleRight, 
  RefreshCw, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Zap, 
  Thermometer, 
  Droplet, 
  Cpu, 
  Database, 
  Plus, 
  Radio, 
  Clock, 
  Gauge, 
  Settings, 
  FileText,
  Hammer
} from "lucide-react";
import { HomeSystem } from "../types";

interface IoTDevice {
  id: string;
  name: string;
  type: string;
  systemId: string; // sys_1 to sys_8
  systemName: string;
  connected: boolean;
  status: "nominal" | "warning" | "offline";
  currentReading: string;
  metrics: Record<string, string | number>;
  anomalyText: string;
  healthyText: string;
}

interface IoTBridgeWidgetProps {
  systems: HomeSystem[];
  setSystems: React.Dispatch<React.SetStateAction<HomeSystem[]>>;
  addToast: (title: string, description: string, type: "task" | "risk" | "info" | "success") => void;
}

export default function IoTBridgeWidget({
  systems,
  setSystems,
  addToast
}: IoTBridgeWidgetProps) {
  // Initial list of pre-configured IoT devices
  const [devices, setDevices] = React.useState<IoTDevice[]>([
    {
      id: "iot_1",
      name: "Smart Thermostat",
      type: "Thermostat Control",
      systemId: "sys_2",
      systemName: "Heating & Cooling",
      connected: true,
      status: "nominal",
      currentReading: "71°F • Airflow Good",
      metrics: {
        temperature: "71°F",
        airPressure: "Normal",
        fanSpeed: "Low",
        filterClogged: "No",
        airPurity: "Excellent"
      },
      anomalyText: "Airflow is blocked. Clean your air filter to prevent system stress.",
      healthyText: "Airflow is excellent. The filter is clean and working normally."
    },
    {
      id: "iot_2",
      name: "Main Water Shut-off & Leak Detector",
      type: "Water Flow Monitor",
      systemId: "sys_3",
      systemName: "Plumbing",
      connected: true,
      status: "nominal",
      currentReading: "Normal Pressure • No Leaks",
      metrics: {
        pressure: "Normal",
        waterFlow: "0.0 Gallons/Min",
        pipeVibration: "None",
        humidityLevel: "Normal (12%)",
        shutoffValve: "Open"
      },
      anomalyText: "A small water drip was detected. Check your pipes for tiny leaks.",
      healthyText: "Water pressure holds steady. No water leaks found anywhere."
    },
    {
      id: "iot_3",
      name: "Electric Power Monitor",
      type: "Power Safety Tracker",
      systemId: "sys_4",
      systemName: "Electrical",
      connected: false,
      status: "offline",
      currentReading: "Offline • Unlinked",
      metrics: {
        powerUse: "0.00 kW",
        voltage: "0.0 V",
        panelTemp: "Normal",
        sparkRisk: "None",
        vampireLoad: "0.00 kW"
      },
      anomalyText: "Power spikes detected in main electrical panel. High risk of electrical sparks.",
      healthyText: "Electrical waves are smooth. All breaker loads and temperatures are healthy."
    },
    {
      id: "iot_4",
      name: "Smoke & Carbon Monoxide Listener",
      type: "Smoke Alarm Monitor",
      systemId: "sys_7",
      systemName: "Safety",
      connected: true,
      status: "nominal",
      currentReading: "94% Battery • Sensors Clean",
      metrics: {
        battery: "94%",
        sensorCleanliness: "98% Clean",
        coLevel: "0 ppm (Safe)",
        lastTest: "Today 04:00 AM",
        alarmSpeaker: "Working"
      },
      anomalyText: "Dust detected on the alarm sensor. Clean it to make sure it can hear alarms clearly.",
      healthyText: "Smoke sensor path is clear. Battery is healthy and fully powered."
    },
    {
      id: "iot_5",
      name: "Foundation Crack Sensor",
      type: "Wall & Foundation Sensor",
      systemId: "sys_5",
      systemName: "Foundation",
      connected: false,
      status: "offline",
      currentReading: "Offline • Unlinked",
      metrics: {
        crackSize: "0.00 mm",
        tensionLoad: "0.0 kN",
        expansionRate: "None",
        wallAngle: "Straight",
        foundationShift: "None"
      },
      anomalyText: "A tiny movement of 0.25mm was detected in the foundation crack. Keep an eye on it.",
      healthyText: "No movement detected in foundation cracks. Wall and load balance is stable."
    }
  ]);

  // Telemetry real-time event logging feed
  const [eventLogs, setEventLogs] = React.useState<string[]>([
    "Smart Home Hub: Connected successfully and listening for device updates.",
    "Smart Home Hub: Setting up secure wireless channel for household monitors.",
    "Smart Thermostat: Connected and checking temperature and fan levels.",
    "Water Pipe Sensor: Check completed. Normal water pressure holding steady.",
    "Smoke Alarm Listener: Alarm listener check completed. Microphone is active and ready."
  ]);

  const [isPollingGlobal, setIsPollingGlobal] = React.useState<boolean>(false);
  const [logSearchQuery, setLogSearchQuery] = React.useState<string>("");

  // Custom device creator inputs
  const [isAddingCustom, setIsAddingCustom] = React.useState<boolean>(false);
  const [customName, setCustomName] = React.useState<string>("");
  const [customSystemId, setCustomSystemId] = React.useState<string>("sys_1");
  const [customType, setCustomType] = React.useState<string>("Smart Sensor Node");

  const activeConnectedCount = devices.filter(d => d.connected).length;

  // Add event log helper
  const addLog = (message: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setEventLogs(prev => [`[${timeStr}] ${message}`, ...prev].slice(0, 50));
  };

  // Toggle Connection State
  const handleToggleConnection = (deviceId: string) => {
    setDevices(prev => prev.map(d => {
      if (d.id === deviceId) {
        const nextConnected = !d.connected;
        if (nextConnected) {
          addLog(`${d.name} successfully linked. Establishing handshakes...`);
          addToast(
            "IoT Device Paired",
            `${d.name} is now streaming live telemetry to the HomePulse core.`,
            "success"
          );
          
          // Set to healthy baseline immediately
          setTimeout(() => {
            setSystems(sysList => sysList.map(s => {
              if (s.id === d.systemId) {
                return {
                  ...s,
                  health: Math.min(100, s.health + 5),
                  details: `Connected to ${d.name}. ${d.healthyText}`,
                  lastInspected: `Just Now (via IoT ${d.name})`
                };
              }
              return s;
            }));
            addLog(`${d.name}: Handshake established. Sent telemetry baseline frame to HomePulse.`);
          }, 800);

          return {
            ...d,
            connected: true,
            status: "nominal",
            currentReading: d.id === "iot_3" ? "0.84 kW • 121.2V" : "0.04 mm • Stable"
          };
        } else {
          addLog(`WARNING: ${d.name} disconnected by user choice. Telemetry link lost.`);
          addToast(
            "IoT Device Unlinked",
            `${d.name} connection terminated. Manual health reports restored.`,
            "info"
          );

          // Restore system reporting back to non-IoT status
          setSystems(sysList => sysList.map(s => {
            if (s.id === d.systemId) {
              return {
                ...s,
                details: `${s.details.split(". Connected to")[0]}. IoT stream offline.`
              };
            }
            return s;
          }));

          return {
            ...d,
            connected: false,
            status: "offline",
            currentReading: "Offline • Unlinked"
          };
        }
      }
      return d;
    }));
  };

  // Simulate an anomaly on a specific device to lower Home System health
  const handleSimulateAnomaly = (deviceId: string) => {
    const d = devices.find(x => x.id === deviceId);
    if (!d || !d.connected) return;

    addLog(`CRITICAL TELEMETRY FAULT: ${d.name} registered out-of-bounds metrics!`);
    
    // 1. Update local device metric view
    setDevices(prev => prev.map(dev => {
      if (dev.id === deviceId) {
        return {
          ...dev,
          status: "warning",
          currentReading: deviceId === "iot_1" ? "Blocked • 0.76 in.wc" : 
                          deviceId === "iot_2" ? "Leak Detected • 42 PSI" :
                          deviceId === "iot_3" ? "Arc Risk • 128.6 V" :
                          deviceId === "iot_4" ? "Chamber Clog • Error" : "Fissure Drift • Warning"
        };
      }
      return dev;
    }));

    // 2. Reduce the actual HomeSystem state health in the dashboard
    setSystems(prevSystems => prevSystems.map(s => {
      if (s.id === d.systemId) {
        const nextHealth = Math.max(30, s.health - 25);
        return {
          ...s,
          health: nextHealth,
          status: nextHealth < 50 ? "Critical" : "Fair",
          details: `ALERT: ${d.name} reports: ${d.anomalyText}`,
          lastInspected: `Just Now (via IoT Live Telemetry)`
        };
      }
      return s;
    }));

    addToast(
      `IoT Alert: ${d.systemName} Node Anomaly`,
      `Smart sensors on "${d.name}" detected abnormal fluctuations. Immediate inspection advised.`,
      "risk"
    );
  };

  // Calibrate and resolve anomaly on device, restoring system health
  const handleCalibrateDevice = (deviceId: string) => {
    const d = devices.find(x => x.id === deviceId);
    if (!d || !d.connected) return;

    addLog(`Calibration command dispatched to ${d.name}. Re-adjusting sensor offsets...`);

    setTimeout(() => {
      // 1. Reset device status
      setDevices(prev => prev.map(dev => {
        if (dev.id === deviceId) {
          return {
            ...dev,
            status: "nominal",
            currentReading: deviceId === "iot_1" ? "71°F • Airflow 94%" : 
                            deviceId === "iot_2" ? "56 PSI • Flow 0.0 GPM" :
                            deviceId === "iot_3" ? "0.82 kW • 120.4V" :
                            deviceId === "iot_4" ? "Chamber Clean • 100%" : "0.04 mm • Calibrated"
          };
        }
        return dev;
      }));

      // 2. Restore HomeSystem health to high value
      setSystems(prevSystems => prevSystems.map(s => {
        if (s.id === d.systemId) {
          return {
            ...s,
            health: 96,
            status: "Optimal",
            details: `IoT System online. Telemetry is fully steady-state. ${d.healthyText}`,
            lastInspected: `Just Now (Calibrated via IoT Bridge)`
          };
        }
        return s;
      }));

      addLog(`${d.name}: Self-calibration successful. All telemetry flags returned to nominal.`);
      addToast(
        "IoT Calibration Successful",
        `${d.name} system diagnostics successfully resolved. System health restored to 96%.`,
        "success"
      );
    }, 700);
  };

  // Global Polling / Telemetry Sweep
  const handleTriggerGlobalPoll = () => {
    if (activeConnectedCount === 0) {
      addToast(
        "No Active IoT Streams",
        "Please connect at least one smart device to pull environmental telemetry.",
        "info"
      );
      return;
    }

    setIsPollingGlobal(true);
    addLog("Gateway: Triggered manual telemetry sweep across all active Thread & Zigbee nodes.");

    setTimeout(() => {
      setIsPollingGlobal(false);
      addLog(`Gateway: Telemetry sweep completed. Synced ${activeConnectedCount} active smart sensors.`);

      // Update all connected devices to nominal & restore systems slightly
      setDevices(prev => prev.map(d => {
        if (d.connected) {
          return { ...d, status: "nominal" };
        }
        return d;
      }));

      setSystems(prevSystems => prevSystems.map(s => {
        const correspondingDevice = devices.find(d => d.systemId === s.id && d.connected);
        if (correspondingDevice) {
          const newHealth = Math.min(100, Math.max(s.health, 92)); // Boost to safe level on sync
          return {
            ...s,
            health: newHealth,
            status: newHealth > 85 ? "Optimal" : "Good",
            details: `Synchronised with smart gateway. Real-time diagnostic stream holds normal.`,
            lastInspected: `Just Now (Automatic IoT Sync)`
          };
        }
        return s;
      }));

      addToast(
        "IoT Sweep Synced Successfully",
        `Refreshed database telemetry with ${activeConnectedCount} active sensor streams. Home health scores recalculated.`,
        "success"
      );
    }, 1500);
  };

  // Add custom device
  const handleAddCustomDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const matchedSystem = systems.find(s => s.id === customSystemId);
    const systemName = matchedSystem ? matchedSystem.name : "Unknown";

    const newDev: IoTDevice = {
      id: `iot_custom_${Date.now()}`,
      name: customName,
      type: customType,
      systemId: customSystemId,
      systemName: systemName,
      connected: true,
      status: "nominal",
      currentReading: "Connected • Initialising",
      metrics: {
        signal: "-58 dBm",
        protocol: "Zigbee 3.0",
        firmware: "v2.0.4-p1"
      },
      anomalyText: `Sensor signals registered rapid fluctuations in target ${systemName} metrics.`,
      healthyText: `Signals are stable. Connected client monitors and validates standard operation parameters.`
    };

    setDevices(prev => [...prev, newDev]);
    addLog(`Gateway: Linked new custom node: ${customName} (${customType}) bound to system ${systemName}.`);
    
    // Set system status
    setSystems(prev => prev.map(s => {
      if (s.id === customSystemId) {
        return {
          ...s,
          details: `Connected to smart sensor ${customName}. Operational status holds standard.`,
          lastInspected: "Just Now (Linked IoT Node)"
        };
      }
      return s;
    }));

    addToast(
      "Custom IoT Node Synced",
      `Successfully integrated custom device "${customName}" into the HomePulse bridge.`,
      "success"
    );

    // Reset inputs
    setCustomName("");
    setIsAddingCustom(false);
  };

  // Filter event logs based on search
  const filteredLogs = eventLogs.filter(log => 
    log.toLowerCase().includes(logSearchQuery.toLowerCase())
  );

  return (
    <div id="iot-bridge-widget" className="bg-[#101820] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden mb-6">
      {/* Visual background ambient radar signal ring */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full border border-blue-500/10 flex items-center justify-center animate-ping-slow pointer-events-none">
        <div className="w-12 h-12 bg-blue-500/10 rounded-full border border-blue-500/20"></div>
      </div>

      {/* Title & Gateway Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-4 mb-4 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-sky-500 text-white rounded-xl shadow-md shadow-blue-900/25">
            <Radio className="w-4.5 h-4.5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-wide">Smart Home Center</h3>
            <p className="text-[10px] text-zinc-500 font-mono">Monitor and manage your connected home devices</p>
          </div>
        </div>

        {/* Bridge Status Telemetry Indicator badge */}
        <div className="flex items-center space-x-2 bg-[#0A0A0A] border border-slate-800 px-3 py-1 rounded-full text-[10px] font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-zinc-400 font-bold">HUB ONLINE</span>
          <span className="text-zinc-600">|</span>
          <span className="text-blue-400 font-extrabold">{activeConnectedCount}/{devices.length} CONNECTED DEVICES</span>
        </div>
      </div>

      {/* Main Grid: Devices Column and Logs Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Hand: Connected / Disconnected Devices */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Connected Devices</span>
            <button
              onClick={() => setIsAddingCustom(!isAddingCustom)}
              className="text-[9.5px] font-extrabold text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1 uppercase tracking-wider focus:outline-none"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingCustom ? "Hide Panel" : "Connect New Device"}</span>
            </button>
          </div>

          {/* Add custom device dropdown modal */}
          {isAddingCustom && (
            <form onSubmit={handleAddCustomDevice} className="bg-[#0A0A0A] border border-slate-800 rounded-xl p-3.5 space-y-3 animate-fade-in">
              <p className="text-[10.5px] font-bold text-white">Connect a Smart Device</p>
              
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[8px] uppercase tracking-wider text-zinc-500 mb-1 font-bold">Device Name</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Nest Thermostat, Water Leak Sensor"
                    className="w-full bg-[#101820] border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-blue-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[8px] uppercase tracking-wider text-zinc-500 mb-1 font-bold">Linked Home System</label>
                  <select
                    value={customSystemId}
                    onChange={(e) => setCustomSystemId(e.target.value)}
                    className="w-full bg-[#101820] border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-blue-500"
                  >
                    {systems.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[8px] uppercase tracking-wider text-zinc-500 mb-1 font-bold">Device Type</label>
                  <input
                    type="text"
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    placeholder="e.g. Temperature Monitor, Leak Alarm"
                    className="w-full bg-[#101820] border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-lg border border-blue-500/20 transition-all"
                  >
                    Connect Device
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Device Rows */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {devices.map((device) => {
              const matchedSys = systems.find(s => s.id === device.systemId);
              const sysHealth = matchedSys ? matchedSys.health : 0;

              return (
                <div 
                  key={device.id} 
                  className={`bg-[#0A0A0A] border rounded-xl p-3.5 transition-all duration-300 relative overflow-hidden group ${
                    device.connected 
                      ? "border-slate-800/80 hover:border-slate-700" 
                      : "border-slate-900/50 opacity-60 hover:opacity-80"
                  }`}
                >
                  {/* Small ambient signal light on the left edge */}
                  <div className={`absolute top-0 left-0 w-1 h-full ${
                    !device.connected ? "bg-zinc-700" :
                    device.status === "warning" ? "bg-red-500 animate-pulse" : "bg-emerald-500"
                  }`}></div>

                  <div className="flex items-start justify-between min-w-0">
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center space-x-2">
                        <p className="text-[11px] font-extrabold text-white truncate">{device.name}</p>
                        <span className="text-[7.5px] font-mono px-1.5 py-0.2 bg-[#101820] text-zinc-400 border border-slate-800 rounded uppercase">
                          {device.type}
                        </span>
                      </div>
                      <p className="text-[9.5px] font-mono text-zinc-400 mt-1 flex items-center space-x-1.5">
                        <span className="text-zinc-500">Binds to:</span> 
                        <span className="font-extrabold text-blue-400 uppercase tracking-wide">{device.systemName}</span>
                        {device.connected && (
                          <>
                            <span className="text-zinc-700">•</span>
                            <span className="text-zinc-500">Live:</span>
                            <span className={`font-bold ${device.status === 'warning' ? 'text-red-400' : 'text-emerald-400'}`}>
                              {device.currentReading}
                            </span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Toggle connection switch */}
                    <button
                      onClick={() => handleToggleConnection(device.id)}
                      className="focus:outline-none flex-shrink-0"
                      title={device.connected ? "Disconnect Node" : "Connect Node"}
                    >
                      {device.connected ? (
                        <ToggleRight className="w-8 h-8 text-blue-500 transition-colors" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-zinc-700 hover:text-zinc-600 transition-colors" />
                      )}
                    </button>
                  </div>

                  {/* Connected Telemetry Diagnostics & Actions Area */}
                  {device.connected && (
                    <div className="mt-3 pt-3 border-t border-slate-900/80 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-[#101820]/30 p-2.5 rounded-lg">
                      {/* Metric capsules */}
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(device.metrics).slice(0, 3).map(([key, val]) => (
                          <div key={key} className="bg-[#0A0A0A] border border-slate-900 rounded px-2 py-0.5 text-[8.5px] font-mono text-zinc-400">
                            <span className="text-zinc-600 capitalize">{key}: </span>
                            <span className="font-extrabold text-white">{val}</span>
                          </div>
                        ))}
                      </div>

                      {/* Simulator actions */}
                      <div className="flex items-center space-x-1.5 justify-end">
                        {device.status === "warning" ? (
                          <button
                            onClick={() => handleCalibrateDevice(device.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[8.5px] font-extrabold uppercase tracking-wider px-2 py-1 rounded border border-emerald-500/20 transition-all flex items-center space-x-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Reset Sensor</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSimulateAnomaly(device.id)}
                            className="bg-red-950/40 hover:bg-red-900/30 text-red-400 text-[8.5px] font-extrabold uppercase tracking-wider px-2 py-1 rounded border border-red-500/15 hover:border-red-500/20 transition-all flex items-center space-x-1"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            <span>Simulate Issue</span>
                          </button>
                        )}
                        <span className="text-[8.5px] font-mono font-bold bg-[#0A0A0A] border border-slate-800 px-1.5 py-0.5 rounded text-zinc-500">
                          System Health: <span className={`${sysHealth < 80 ? "text-amber-400" : "text-emerald-400"}`}>{sysHealth}%</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Hand: Log search & Telemetry Log feed */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3.5 bg-[#0A0A0A] border border-slate-800/80 rounded-xl p-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Live Device Status Feed</span>
              <div className="flex items-center space-x-1">
                <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-ping"></span>
                <span className="text-[8.5px] font-mono text-zinc-500 uppercase font-bold">Connected</span>
              </div>
            </div>

            {/* Log filter bar */}
            <input
              type="text"
              value={logSearchQuery}
              onChange={(e) => setLogSearchQuery(e.target.value)}
              placeholder="Search status updates..."
              className="w-full bg-[#101820] border border-slate-900 rounded-lg px-2.5 py-1 text-[10px] text-white focus:outline-none focus:border-slate-700 font-mono"
            />
          </div>

          {/* Scrolling Event log panel */}
          <div className="flex-1 bg-[#101820]/40 border border-slate-900 rounded-lg p-3 min-h-[180px] max-h-[220px] overflow-y-auto font-mono text-[9px] text-zinc-300 space-y-2 select-text">
            {filteredLogs.length === 0 ? (
              <p className="text-zinc-600 text-center py-10 italic">No matching updates found.</p>
            ) : (
              filteredLogs.map((log, index) => {
                let textClass = "text-zinc-400";
                if (log.includes("CRITICAL") || log.includes("WARNING")) {
                  textClass = "text-rose-400 font-semibold bg-red-950/15 py-0.5 px-1 rounded border border-red-500/10";
                } else if (log.includes("successfully") || log.includes("nominal") || log.includes("Handshake") || log.includes("completed")) {
                  textClass = "text-emerald-400";
                } else if (log.includes("Gateway:") || log.includes("Hub:")) {
                  textClass = "text-blue-300";
                }
                return (
                  <p key={index} className={`leading-relaxed whitespace-pre-wrap ${textClass}`}>
                    {log}
                  </p>
                );
              })
            )}
          </div>

          {/* Master trigger diagnostic scan */}
          <button
            onClick={handleTriggerGlobalPoll}
            disabled={isPollingGlobal}
            className="w-full bg-[#1E293B] hover:bg-[#334155] disabled:opacity-50 text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-lg border border-slate-700 transition-all flex items-center justify-center space-x-1.5 shadow-lg relative overflow-hidden"
          >
            {isPollingGlobal ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                <span className="text-zinc-300 font-mono">Checking devices...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Check All Devices Now</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer warning text */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[8.5px] font-mono text-zinc-500">
        <span className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-zinc-500" />
          <span>Device Hub Connection: Active & Secure</span>
        </span>
        <span>Connection Security: Fully Encrypted</span>
      </div>
    </div>
  );
}
