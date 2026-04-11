export type AssessmentStatus = "pending" | "processing" | "complete" | "failed";
export type SeverityLevel = "cosmetic" | "minor" | "major" | "critical";

export interface DamageZone {
  zone: string;
  severity: SeverityLevel;
  notes: string;
}

export type LineItemCategory = "parts" | "labor" | "paint" | "supplies" | "calibration";

export interface PriceSource {
  tier: "oem" | "aftermarket" | "salvage";
  vendor: string;
  partNumber: string;
  price: number;
  shipping: number;
  coreCharge: number;
  totalLanded: number;
  inStock: boolean;
  url: string;
}

export interface LineItem {
  id: string;
  description: string;
  category: LineItemCategory;
  /** RepairSync's recommended fair market price */
  aiPrice: number;
  /** OEM part number resolved from VIN */
  oemPartNumber?: string;
  /** Multi-source price breakdown — the algo picks the best available */
  sources: PriceSource[];
  /** Labor hours (for labor/paint/calibration line items) */
  laborHours?: number;
}

export interface Assessment {
  _id: string;
  /** Vehicle Identification Number */
  vin: string;
  status: AssessmentStatus;
  overallSeverity: SeverityLevel;
  vehicleDescription: string;
  summary: string;
  damageZones: DamageZone[];
  repairPriority: string;
  imageUrl: string;
  lineItems: LineItem[];
  _creationTime: number;
}
