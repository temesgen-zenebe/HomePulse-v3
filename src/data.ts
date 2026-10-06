import { PropertyInfo, HomeSystem, MaintenanceTask, ActiveRisk, DocumentRecord, SavingsItem, RecommendedProvider, ProAppointment, ConsumableItem } from "./types";

export const initialProperty: PropertyInfo = {
  address: "1428 Woodside Lane, Seattle, WA",
  yearBuilt: 2012,
  squareFeet: 2450,
  propertyType: "Single Family Residential",
  climateZone: "Pacific Northwest (Zone 4)",
  hvacType: "Dual-Zone Electric Heat Pump",
  plumbingAge: "Newer PEX (Installed 2012)"
};

export const initialSystems: HomeSystem[] = [
  {
    id: "sys_1",
    name: "Roof",
    health: 88,
    status: "Good",
    category: "Structure",
    lastInspected: "May 2024",
    details: "Architectural shingles in good condition. Minor moss starting on the north slope.",
    warningThreshold: 75,
    reportingInterval: "Every 24 Hours"
  },
  {
    id: "sys_2",
    name: "HVAC",
    health: 78,
    status: "Fair",
    category: "Mechanical",
    lastInspected: "October 2024",
    details: "Compressor amperage normal. Outdoor coil has moderate dust. Recommended for cleaning.",
    warningThreshold: 80,
    reportingInterval: "Every 15 Minutes"
  },
  {
    id: "sys_3",
    name: "Plumbing",
    health: 85,
    status: "Good",
    category: "Plumbing",
    lastInspected: "January 2025",
    details: "Static pressure is 62 PSI. Water heater relief valve functional, minor scaling in faucets.",
    warningThreshold: 70,
    reportingInterval: "Every 1 Hour"
  },
  {
    id: "sys_4",
    name: "Electrical",
    health: 95,
    status: "Optimal",
    category: "Electrical",
    lastInspected: "March 2024",
    details: "150A panel. Fully labeled breakers, no signs of overheating. Arc-fault breakers operating.",
    warningThreshold: 85,
    reportingInterval: "Real-time Stream"
  },
  {
    id: "sys_5",
    name: "Foundation",
    health: 98,
    status: "Optimal",
    category: "Structure",
    lastInspected: "July 2024",
    details: "Poured concrete wall has zero active fissures. Perimeter drain is flowing efficiently.",
    warningThreshold: 60,
    reportingInterval: "Every 12 Hours"
  },
  {
    id: "sys_6",
    name: "Appliances",
    health: 82,
    status: "Good",
    category: "Mechanical",
    lastInspected: "November 2024",
    details: "Refrigerator coils clean. Dryer duct lint line cleared. Dishwasher float level verified.",
    warningThreshold: 70,
    reportingInterval: "Every 6 Hours"
  },
  {
    id: "sys_7",
    name: "Safety",
    health: 100,
    status: "Optimal",
    category: "Safety",
    lastInspected: "April 2025",
    details: "Smoke & CO detectors fully linked. Home security sensor battery statuses are healthy.",
    warningThreshold: 90,
    reportingInterval: "Real-time Stream"
  },
  {
    id: "sys_8",
    name: "Exterior",
    health: 72,
    status: "Fair",
    category: "Exterior",
    lastInspected: "August 2024",
    details: "Siding caulking has minor cracks near deck. Rain gutters require cleaning before spring rains.",
    warningThreshold: 65,
    reportingInterval: "Every 24 Hours"
  }
];

export const initialTasks: MaintenanceTask[] = [
  {
    id: "task_1",
    title: "HVAC Filter Replacement",
    due: "May 10, 2025",
    priority: "Medium",
    why: "Ensures high air flow, protects evaporator coils from freezing, and improves indoor breathing quality.",
    how: "Locate the ceiling return register, unlatch the tabs, remove the old 20x25x1 MERV 11 filter, and slide in a matching new filter with airflow arrows pointing up.",
    who: "DIY",
    where: "Main Hallway Ceiling Intake",
    completed: false,
    video: "https://assets.mixkit.co/videos/preview/mixkit-technician-working-on-an-air-conditioning-unit-43032-large.mp4"
  },
  {
    id: "task_2",
    title: "Gutter Clear & Downspout Cleanse",
    due: "May 15, 2025",
    priority: "High",
    why: "Prevents roof runoff from backing up beneath shingles, wetting fascia boards, and cascading onto the foundation soil.",
    how: "Use a heavy-duty ladder with stabilizer horns, scoop pine needles and debris out of the troughs, and flush the downspouts using a garden hose jet stream.",
    who: "DIY or Pro Recommended",
    where: "Exterior Roofline Perimeter",
    completed: false
  },
  {
    id: "task_3",
    title: "Water Heater Flush & Drain",
    due: "May 28, 2025",
    priority: "Medium",
    why: "Clears calcium sediment that forms thermal hot spots, lowers heating efficiency, and can corrode steel tanks.",
    how: "Turn off heating element breaker (or gas valve), connect a hose to the drain spigot at the bottom, open the hot water tap upstairs to relieve pressure, and drain the tank completely.",
    who: "DIY",
    where: "Basement Mechanical Closet",
    completed: false
  },
  {
    id: "task_4",
    title: "Smoke Detector Battery Test",
    due: "May 12, 2025",
    priority: "High",
    why: "Guarantees reliable life-safety sirens will trigger and backup batteries operate if main AC utility power fails.",
    how: "Press and hold the 'Test' button on each detector for 5 seconds until the loud alert sequence triggers. Replace any aging battery blocks.",
    who: "DIY",
    where: "All Bedrooms & Common Halls",
    completed: false
  }
];

export const initialRisks: ActiveRisk[] = [
  {
    id: "risk_1",
    title: "High Risk Heatwave Incoming",
    level: "High",
    description: "Regional thermal warning issued. Peak outdoor temperature is projected to breach 104°F tomorrow.",
    precaution: "Set thermostat to pre-cool down to 70°F during early morning hours. Close all South and West blinds by 9:00 AM. Clear the air conditioning condensation drain pipe to prevent overflow, and limit heavy appliance use from 2:00 PM to 8:00 PM."
  },
  {
    id: "risk_2",
    title: "HVAC Overuse Danger",
    level: "Medium",
    description: "Prolonged thermal cycles can cause compressor overheating or circuit trips under high electrical grid loads.",
    precaution: "Ensure return air vents are unobstructed. Avoid setting cooling setpoints below 76°F during peak outdoor hours, and run ceiling fans counterclockwise to augment airflow."
  },
  {
    id: "risk_3",
    title: "Low Humidity Exposure",
    level: "Low",
    description: "Dry indoor atmosphere drops below 28%, introducing static and drying out premium oak structural panels.",
    precaution: "Engage your central bypass humidifier or place portable vaporizers in high-traffic wooden flooring zones."
  }
];

export const initialDocuments: DocumentRecord[] = [
  {
    id: "doc_1",
    name: "HVAC Warranty Certificate.pdf",
    type: "warranty",
    date: "Jun 15, 2023",
    size: "1.2 MB"
  },
  {
    id: "doc_2",
    name: "Water Heater Install Receipt.pdf",
    type: "receipt",
    date: "Nov 04, 2022",
    size: "640 KB"
  },
  {
    id: "doc_3",
    name: "Roof Professional Assessment.pdf",
    type: "report",
    date: "May 18, 2024",
    size: "3.4 MB"
  },
  {
    id: "doc_4",
    name: "Electrical Service Panel Image.jpg",
    type: "photo",
    date: "Mar 22, 2024",
    size: "2.1 MB"
  },
  {
    id: "doc_5",
    name: "Gutter Maintenance Invoice.pdf",
    type: "receipt",
    date: "Nov 10, 2024",
    size: "380 KB"
  }
];

export const initialSavings: SavingsItem[] = [
  {
    id: "save_1",
    category: "HVAC",
    amount: 450,
    description: "Intercepted dual capacitor failure and restricted filter airflow, avoiding blower motor replacement."
  },
  {
    id: "save_2",
    category: "Plumbing",
    amount: 350,
    description: "Flushed sediment from high-temp heater, lowering thermal strain and preventing bottom weld corrosion."
  },
  {
    id: "save_3",
    category: "Roof",
    amount: 280,
    description: "Sealed leaking soil stack collar, preventing roof substrate decay and attic plywood water damage."
  },
  {
    id: "save_4",
    category: "Electrical",
    amount: 165,
    description: "Fixed loose ground wire inside subpanel, avoiding chronic arc fault tripping and circuit overloads."
  }
];

export const initialProviders: RecommendedProvider[] = [
  {
    id: "prov_1",
    name: "Dave Miller",
    specialty: "HVAC & Climate Control Specialist",
    rating: 4.9,
    completedJobs: 142,
    ratePerHour: 95,
    responseTime: "under 15 mins",
    contactNumber: "+1 (206) 555-0143",
    avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=120&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    reviews: [
      { id: "rev_1_1", userName: "Arthur Pendragon", rating: 5, comment: "Dave was incredible. He detected the slow leak in our HVAC coil that other technicians completely missed. Highly recommended!", date: "Jun 12, 2026" },
      { id: "rev_1_2", userName: "Clara Oswald", rating: 4.8, comment: "Very polite, wore boot covers inside the house, and finished the service early.", date: "May 20, 2026" }
    ]
  },
  {
    id: "prov_2",
    name: "Elena Rostova",
    specialty: "Master Plumber & Pipe Diagnostics",
    rating: 4.8,
    completedJobs: 98,
    ratePerHour: 110,
    responseTime: "under 30 mins",
    contactNumber: "+1 (206) 555-0189",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    reviews: [
      { id: "rev_2_1", userName: "Bruce Wayne", rating: 5, comment: "She flushed our commercial-grade water heaters in record time. Super professional equipment.", date: "Feb 14, 2026" }
    ]
  },
  {
    id: "prov_3",
    name: "Marcus Vance",
    specialty: "Residential Electrical Systems Master",
    rating: 4.7,
    completedJobs: 165,
    ratePerHour: 105,
    responseTime: "under 1 hour",
    contactNumber: "+1 (206) 555-0211",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    reviews: [
      { id: "rev_3_1", userName: "Gwen Stacy", rating: 4, comment: "Fixed some flickering issues in the bedroom. Great service overall.", date: "Apr 05, 2026" }
    ]
  },
  {
    id: "prov_4",
    name: "Sarah Jenkins",
    specialty: "Exterior Structure & Roofing Pro",
    rating: 4.9,
    completedJobs: 210,
    ratePerHour: 85,
    responseTime: "under 45 mins",
    contactNumber: "+1 (206) 555-0304",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    reviews: [
      { id: "rev_4_1", userName: "Peter Parker", rating: 5, comment: "Excellent gutter cleaning job. She also double-checked the shingles for wind damage.", date: "Mar 10, 2026" }
    ]
  }
];

export const initialAppointments: ProAppointment[] = [
  {
    id: "app_1",
    providerId: "prov_1",
    providerName: "Dave Miller",
    providerSpecialty: "HVAC & Climate Control Specialist",
    date: "2026-06-28",
    time: "10:00 AM",
    issueDescription: "Air Conditioner tune-up and high pressure calibration ahead of the summer heatwave.",
    status: "Completed",
    progressUpdates: [
      { timestamp: "2026-06-28T10:00:00.000Z", status: "In Progress", message: "Dave has arrived and began the dual zone electric heat pump diagnostic checks." },
      { timestamp: "2026-06-28T11:30:00.000Z", status: "Completed", message: "Service successfully completed. Compressor cleansed, pressure is fully stabilized at optimal levels." }
    ]
  },
  {
    id: "app_2",
    providerId: "prov_2",
    providerName: "Elena Rostova",
    providerSpecialty: "Master Plumber & Pipe Diagnostics",
    date: "2026-07-03",
    time: "02:30 PM",
    issueDescription: "Slight plumbing rattle in the master bath pipes whenever the hot water is running.",
    status: "Scheduled",
    progressUpdates: [
      { timestamp: "2026-07-01T09:00:00.000Z", status: "Scheduled", message: "Appointment request accepted and scheduled for July 3 at 2:30 PM." }
    ]
  }
];

export const initialConsumables: ConsumableItem[] = [
  {
    id: "con_1",
    name: "HVAC MERV 13 Pleated Air Filter",
    category: "HVAC",
    currentLevel: 18,
    unit: "% Life Left",
    installDate: "2026-04-10",
    lifespanDays: 90,
    dailyUsageRate: 1.11,
    daysRemaining: 16,
    status: "Low",
    reorderLink: "https://www.amazon.com/s?k=merv+13+20x25x1+filter",
    partNumber: "M13-20251-1",
    cost: 24.99,
    alertActive: true,
    autoReplenish: true,
    replenishType: "purchase",
    replenishTriggered: false
  },
  {
    id: "con_2",
    name: "Water Softener Pellets (40lb Bag)",
    category: "Plumbing",
    currentLevel: 8,
    unit: "% Capacity Left",
    installDate: "2026-03-05",
    lifespanDays: 120,
    dailyUsageRate: 0.83,
    daysRemaining: 10,
    status: "Low",
    reorderLink: "https://www.homedepot.com/s/water%20softener%20salt",
    partNumber: "SALT-40LB-XT",
    cost: 18.50,
    alertActive: true,
    autoReplenish: true,
    replenishType: "appointment",
    replenishTriggered: false
  },
  {
    id: "con_3",
    name: "Refrigerator Water & Ice Filter",
    category: "Kitchen",
    currentLevel: 75,
    unit: "% Life Left",
    installDate: "2026-05-18",
    lifespanDays: 180,
    dailyUsageRate: 0.55,
    daysRemaining: 135,
    status: "Good",
    reorderLink: "https://www.amazon.com/s?k=refrigerator+water+filter+mwf",
    partNumber: "MWF-REF-GEN",
    cost: 39.99,
    alertActive: false,
    autoReplenish: false,
    replenishType: "purchase",
    replenishTriggered: false
  },
  {
    id: "con_4",
    name: "Smoke Detector 9V Alkaline Batteries",
    category: "Safety",
    currentLevel: 92,
    unit: "% Charge Left",
    installDate: "2026-06-01",
    lifespanDays: 365,
    dailyUsageRate: 0.27,
    daysRemaining: 335,
    status: "Good",
    reorderLink: "https://www.amazon.com/s?k=9v+batteries+duracell",
    partNumber: "9V-DUR-12",
    cost: 12.99,
    alertActive: false
  },
  {
    id: "con_5",
    name: "Whole-House Humidifier Vapor Pad",
    category: "HVAC",
    currentLevel: 45,
    unit: "% Efficiency",
    installDate: "2026-04-20",
    lifespanDays: 150,
    dailyUsageRate: 0.67,
    daysRemaining: 68,
    status: "Good",
    reorderLink: "https://www.homedepot.com/s/humidifier%20pad%2035",
    partNumber: "HUM-PAD-35",
    cost: 21.50,
    alertActive: false
  }
];


