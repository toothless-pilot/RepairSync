import type {
  LandedCostInput,
  LandedCostResult,
} from "@repair-sync/types";

const CORE_CHARGE_KEYWORDS = [
  "reman",
  "remanufactured",
  "rebuilt",
  "alternator",
  "starter",
  "caliper",
  "rack and pinion",
  "power steering",
  "cv axle",
  "turbocharger",
];

/**
 * Extracts the lowest usable price from a raw string.
 *
 * Handles:
 *   "$1,200.00 (MSRP: $1,450)"   → 1200.00
 *   "$850 - Out of Stock"         → 850.00
 *   "From $320 to $480"           → 320.00
 *   "€ 220,50"                    → 220.50
 *   ""                            → null
 */
export function parsePrice(raw: string): number | null {
  if (!raw || raw.trim() === "") return null;

  const cleaned = raw
    .replace(/[€£¥]/g, "")
    .replace(/\s/g, "")
    .replace(/(\d)\.(\d{3}),/g, "$1$2.")
    .replace(/,(?=\d{3})/g, "");

  const matches = cleaned.match(/\$?([\d]+(?:\.\d{1,2})?)/g);
  if (!matches || matches.length === 0) return null;

  const values = matches
    .map((m) => parseFloat(m.replace("$", "")))
    .filter((v) => !isNaN(v) && v > 0);

  if (values.length === 0) return null;

  return Math.min(...values);
}

/**
 * Returns true if the raw stock string implies the part is available.
 */
export function checkStock(raw: string | undefined): boolean {
  if (!raw || raw.trim() === "") return false;
  const lower = raw.toLowerCase();

  const outOfStockSignals = [
    "out of stock",
    "unavailable",
    "discontinued",
    "backordered",
    "0 available",
    "not available",
    "call for availability",
    "no longer available",
  ];

  return !outOfStockSignals.some((signal) => lower.includes(signal));
}

/**
 * Computes the total landed cost including shipping and core charge.
 * Core charges are estimated at 20% of base price for remanufactured parts.
 */
export function calcLandedCost(input: LandedCostInput): LandedCostResult {
  const { base_price, raw_shipping, part_description = "" } = input;

  const shippingLower = raw_shipping.toLowerCase();
  const shipping = shippingLower.includes("free")
    ? 0
    : (parsePrice(raw_shipping) ?? 0);

  const isReman = CORE_CHARGE_KEYWORDS.some((kw) =>
    part_description.toLowerCase().includes(kw)
  );
  const core_charge = isReman
    ? Math.round(base_price * 0.2 * 100) / 100
    : 0;

  return {
    shipping,
    core_charge,
    total_landed: Math.round((base_price + shipping + core_charge) * 100) / 100,
  };
}

/**
 * Resolves interchange part numbers via the MOTOR API.
 * Returns alternate SKUs within ±2 model years.
 */
export async function resolveInterchange(
  partNumber: string,
  year: number
): Promise<string[]> {
  const MOTOR_API_KEY = process.env.MOTOR_API_KEY;
  if (!MOTOR_API_KEY) return [];

  try {
    const res = await fetch(
      `https://api.motor.com/interchange/v1?part=${encodeURIComponent(partNumber)}`,
      { headers: { Authorization: `Bearer ${MOTOR_API_KEY}` } }
    );
    if (!res.ok) return [];

    const data = await res.json() as {
      interchange_numbers: Array<{ part_number: string; year: number }>;
    };

    return (data.interchange_numbers ?? [])
      .filter((i) => Math.abs(i.year - year) <= 2)
      .map((i) => i.part_number);
  } catch {
    return [];
  }
}
