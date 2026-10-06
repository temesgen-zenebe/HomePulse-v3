export interface PropertyInfo {
  address: string;
  yearBuilt: number;
  squareFeet: number;
  propertyType: string;
  climateZone: string;
  hvacType: string;
  plumbingAge: string;
}

export type PriorityLevel = "High" | "Medium" | "Low";

export interface MaintenanceTask {
  id: string;
  title: string;
  due: string;
  priority: PriorityLevel;
  why: string;
  how: string;
  who: string;
  where: string;
  completed: boolean;
  completedAt?: string;
  video?: string;
}

export interface HomeSystem {
  id: string;
  name: string;
  health: number;
  status: "Optimal" | "Good" | "Fair" | "Critical";
  category: "Structure" | "Mechanical" | "Plumbing" | "Electrical" | "Safety" | "Exterior";
  lastInspected: string;
  details: string;
  warningThreshold?: number;
  reportingInterval?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export interface ActiveRisk {
  id: string;
  title: string;
  level: PriorityLevel;
  description: string;
  precaution: string;
}

export interface DocumentRecord {
  id: string;
  name: string;
  type: "all" | "warranty" | "receipt" | "photo" | "report";
  date: string;
  size: string;
  isEncrypted?: boolean;
  encryptedPayload?: string;
}

export interface TrackedWarranty {
  id: string;
  applianceName: string;
  category: "Kitchen" | "HVAC" | "Laundry" | "Plumbing" | "Electrical" | "Other";
  purchaseDate: string; // YYYY-MM-DD
  durationYears: number;
  expirationDate: string; // YYYY-MM-DD
  alertLeadDays: number; // e.g. 30, 60, 90
  alertActive: boolean;
  notes?: string;
}

export interface SavingsItem {
  id: string;
  category: string;
  amount: number;
  description: string;
}

export interface ProviderReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface RecommendedProvider {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  completedJobs: number;
  ratePerHour: number;
  responseTime: string;
  contactNumber: string;
  avatar: string;
  reviews: ProviderReview[];
}

export interface ProAppointment {
  id: string;
  providerId: string;
  providerName: string;
  providerSpecialty: string;
  date: string;
  time: string;
  issueDescription: string;
  status: "Requested" | "Scheduled" | "In Progress" | "Completed" | "Rated";
  userRating?: number;
  userComment?: string;
  progressUpdates: { timestamp: string; status: string; message: string }[];
}

export interface ConsumableItem {
  id: string;
  name: string;
  systemId?: string;
  category: string;
  currentLevel: number; // percentage (0 to 100)
  unit: string; // e.g. "%", "Capacity", "Remaining"
  installDate: string; // YYYY-MM-DD
  lifespanDays: number;
  dailyUsageRate: number; // rate at which level decreases per day
  daysRemaining: number;
  status: "Good" | "Low" | "Empty";
  reorderLink: string;
  partNumber?: string;
  cost: number;
  alertActive: boolean;
  autoReplenish?: boolean;
  replenishType?: "appointment" | "purchase";
  replenishTriggered?: boolean;
}


