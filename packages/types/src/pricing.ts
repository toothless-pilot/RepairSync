export type PricingTier = "oem" | "aftermarket" | "salvage";

export interface RawPriceResult {
  raw_price: string;
  raw_stock?: string;
  raw_shipping?: string;
  source: string;
  tier: PricingTier;
}

export interface PartPriceResult {
  part_id: string;
  source: string;
  price: number;
  shipping: number;
  core_charge: number;
  total_landed: number;
  in_stock: boolean;
  tier: PricingTier;
  last_updated: string;
  interchange_used: boolean;
}

export interface VehicleProfile {
  make: string;
  model: string;
  year: number;
  trim: string;
  body_class: string;
  engine: string;
}

export interface OEMCatalogResult {
  part_number: string;
  superseded_by: string | null;
  description: string;
  interchange_numbers: Array<{ part_number: string; year: number }>;
}

export interface LandedCostInput {
  base_price: number;
  raw_shipping: string;
  part_description?: string;
}

export interface LandedCostResult {
  shipping: number;
  core_charge: number;
  total_landed: number;
}
