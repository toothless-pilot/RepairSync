export type Severity = "minor" | "moderate" | "severe";

export interface LineItem {
  id: string;
  description: string;
  category: "parts" | "labor" | "paint" | "supplies" | "calibration";
  oemPartNumber?: string;
  laborHours?: number;
  aiPrice: number;
  sources: {
    tier: "oem" | "aftermarket" | "salvage";
    vendor: string;
    partNumber: string;
    price: number;
    shipping: number;
    coreCharge: number;
    totalLanded: number;
    inStock: boolean;
    url: string;
  }[];
}

// Base line items per part per severity.
// minor   = repair/buff only
// moderate = repair + refinish
// severe  = full replacement parts + labor + paint
const PRICING: Record<string, Record<Severity, LineItem[]>> = {
  "front-bumper": {
    minor: [
      { id: "fb-labor", description: "Front Bumper — PDR Repair", category: "labor", laborHours: 1, aiPrice: 90, sources: [] },
    ],
    moderate: [
      { id: "fb-labor", description: "Front Bumper R&I", category: "labor", laborHours: 1.5, aiPrice: 135, sources: [] },
      { id: "fb-paint", description: "Refinish Front Bumper", category: "paint", laborHours: 3, aiPrice: 270, sources: [] },
    ],
    severe: [
      { id: "fb-part", description: "Front Bumper Cover (CAPA Certified)", category: "parts", oemPartNumber: "86511-3X000", aiPrice: 93.79,
        sources: [
          { tier: "oem", vendor: "HyundaiPartsDeal", partNumber: "86511-3X000", price: 246.50, shipping: 0, coreCharge: 0, totalLanded: 246.50, inStock: true, url: "https://www.hyundaipartsdeal.com" },
          { tier: "aftermarket", vendor: "RockAuto", partNumber: "GMP-2400", price: 85.79, shipping: 8.00, coreCharge: 0, totalLanded: 93.79, inStock: true, url: "https://www.rockauto.com" },
        ],
      },
      { id: "fb-labor", description: "Bumper R&I (Front)", category: "labor", laborHours: 1.5, aiPrice: 135, sources: [] },
      { id: "fb-paint", description: "Refinish Front Bumper — Clearcoat/Match", category: "paint", laborHours: 3, aiPrice: 270, sources: [] },
    ],
  },
  "rear-bumper": {
    minor: [
      { id: "rb-labor", description: "Rear Bumper — PDR Repair", category: "labor", laborHours: 1, aiPrice: 90, sources: [] },
    ],
    moderate: [
      { id: "rb-labor", description: "Rear Bumper R&I", category: "labor", laborHours: 1.5, aiPrice: 135, sources: [] },
      { id: "rb-paint", description: "Refinish Rear Bumper", category: "paint", laborHours: 3, aiPrice: 270, sources: [] },
    ],
    severe: [
      { id: "rb-part", description: "Rear Bumper Cover", category: "parts", oemPartNumber: "86610-3X000", aiPrice: 112.49,
        sources: [
          { tier: "aftermarket", vendor: "RockAuto", partNumber: "NSF-2401", price: 98.49, shipping: 14.00, coreCharge: 0, totalLanded: 112.49, inStock: true, url: "https://www.rockauto.com" },
        ],
      },
      { id: "rb-labor", description: "Bumper R&I (Rear)", category: "labor", laborHours: 1.5, aiPrice: 135, sources: [] },
      { id: "rb-paint", description: "Refinish Rear Bumper", category: "paint", laborHours: 3, aiPrice: 270, sources: [] },
    ],
  },
  "front-door": {
    minor: [
      { id: "fd-labor", description: "Front Door — Dent Repair (PDR)", category: "labor", laborHours: 2, aiPrice: 180, sources: [] },
    ],
    moderate: [
      { id: "fd-labor", description: "Front Door Panel — Body Repair", category: "labor", laborHours: 4, aiPrice: 360, sources: [] },
      { id: "fd-paint", description: "Refinish Front Door", category: "paint", laborHours: 3.5, aiPrice: 315, sources: [] },
    ],
    severe: [
      { id: "fd-part", description: "Front Door Outer Panel", category: "parts", aiPrice: 245.00,
        sources: [
          { tier: "aftermarket", vendor: "LKQ", partNumber: "LKQ-FD-001", price: 210.00, shipping: 35.00, coreCharge: 0, totalLanded: 245.00, inStock: true, url: "https://www.lkqonline.com" },
        ],
      },
      { id: "fd-labor", description: "Front Door R&I + Alignment", category: "labor", laborHours: 5, aiPrice: 450, sources: [] },
      { id: "fd-paint", description: "Refinish Front Door", category: "paint", laborHours: 3.5, aiPrice: 315, sources: [] },
    ],
  },
  "rear-door": {
    minor: [
      { id: "rd-labor", description: "Rear Door — Dent Repair (PDR)", category: "labor", laborHours: 2, aiPrice: 180, sources: [] },
    ],
    moderate: [
      { id: "rd-labor", description: "Rear Door Panel — Body Repair", category: "labor", laborHours: 4, aiPrice: 360, sources: [] },
      { id: "rd-paint", description: "Refinish Rear Door", category: "paint", laborHours: 3.5, aiPrice: 315, sources: [] },
    ],
    severe: [
      { id: "rd-part", description: "Rear Door Outer Panel", category: "parts", aiPrice: 230.00,
        sources: [
          { tier: "aftermarket", vendor: "LKQ", partNumber: "LKQ-RD-001", price: 195.00, shipping: 35.00, coreCharge: 0, totalLanded: 230.00, inStock: true, url: "https://www.lkqonline.com" },
        ],
      },
      { id: "rd-labor", description: "Rear Door R&I + Alignment", category: "labor", laborHours: 5, aiPrice: 450, sources: [] },
      { id: "rd-paint", description: "Refinish Rear Door", category: "paint", laborHours: 3.5, aiPrice: 315, sources: [] },
    ],
  },
  "front-headlight": {
    minor: [
      { id: "hl-polish", description: "Headlight Lens Polish & Seal", category: "labor", laborHours: 0.5, aiPrice: 45, sources: [] },
    ],
    moderate: [
      { id: "hl-labor", description: "Headlight Assembly R&I", category: "labor", laborHours: 1, aiPrice: 90, sources: [] },
      { id: "hl-part", description: "Headlight Assembly (Aftermarket)", category: "parts", aiPrice: 89.99,
        sources: [
          { tier: "aftermarket", vendor: "RockAuto", partNumber: "TYC-20-9104", price: 76.99, shipping: 13.00, coreCharge: 0, totalLanded: 89.99, inStock: true, url: "https://www.rockauto.com" },
        ],
      },
    ],
    severe: [
      { id: "hl-part", description: "Headlight Assembly (OEM)", category: "parts", oemPartNumber: "92101-3X000", aiPrice: 189.99,
        sources: [
          { tier: "oem", vendor: "HyundaiPartsDeal", partNumber: "92101-3X000", price: 310.00, shipping: 0, coreCharge: 0, totalLanded: 310.00, inStock: true, url: "https://www.hyundaipartsdeal.com" },
          { tier: "aftermarket", vendor: "RockAuto", partNumber: "TYC-20-9104", price: 174.99, shipping: 15.00, coreCharge: 0, totalLanded: 189.99, inStock: true, url: "https://www.rockauto.com" },
        ],
      },
      { id: "hl-labor", description: "Headlight R&I + ADAS Aim", category: "labor", laborHours: 1.5, aiPrice: 135, sources: [] },
      { id: "hl-cal", description: "Headlight Calibration (ADAS)", category: "calibration", aiPrice: 120, sources: [] },
    ],
  },
  "rear-taillight": {
    minor: [
      { id: "tl-labor", description: "Taillight Lens — Buff & Seal", category: "labor", laborHours: 0.5, aiPrice: 45, sources: [] },
    ],
    moderate: [
      { id: "tl-part", description: "Taillight Assembly (Aftermarket)", category: "parts", aiPrice: 65.99,
        sources: [
          { tier: "aftermarket", vendor: "RockAuto", partNumber: "TYC-11-6379", price: 55.99, shipping: 10.00, coreCharge: 0, totalLanded: 65.99, inStock: true, url: "https://www.rockauto.com" },
        ],
      },
      { id: "tl-labor", description: "Taillight Assembly R&I", category: "labor", laborHours: 0.8, aiPrice: 72, sources: [] },
    ],
    severe: [
      { id: "tl-part", description: "Taillight Assembly (OEM)", category: "parts", oemPartNumber: "92401-3X000", aiPrice: 145.00,
        sources: [
          { tier: "oem", vendor: "HyundaiPartsDeal", partNumber: "92401-3X000", price: 245.00, shipping: 0, coreCharge: 0, totalLanded: 245.00, inStock: true, url: "https://www.hyundaipartsdeal.com" },
          { tier: "aftermarket", vendor: "RockAuto", partNumber: "TYC-11-6379", price: 130.00, shipping: 15.00, coreCharge: 0, totalLanded: 145.00, inStock: true, url: "https://www.rockauto.com" },
        ],
      },
      { id: "tl-labor", description: "Taillight R&I", category: "labor", laborHours: 0.8, aiPrice: 72, sources: [] },
    ],
  },
  "windshield": {
    minor: [
      { id: "ws-repair", description: "Windshield Chip Repair", category: "labor", laborHours: 0.5, aiPrice: 50, sources: [] },
    ],
    moderate: [
      { id: "ws-part", description: "Windshield Glass (Aftermarket OEE)", category: "parts", aiPrice: 185.00,
        sources: [
          { tier: "aftermarket", vendor: "Safelite", partNumber: "PGW-HY1004GTN", price: 165.00, shipping: 20.00, coreCharge: 0, totalLanded: 185.00, inStock: true, url: "https://www.safelite.com" },
        ],
      },
      { id: "ws-labor", description: "Windshield R&I + Urethane Seal", category: "labor", laborHours: 2, aiPrice: 180, sources: [] },
    ],
    severe: [
      { id: "ws-part", description: "Windshield (OEM with Rain Sensor)", category: "parts", oemPartNumber: "86110-3X000", aiPrice: 320.00,
        sources: [
          { tier: "oem", vendor: "HyundaiPartsDeal", partNumber: "86110-3X000", price: 520.00, shipping: 0, coreCharge: 0, totalLanded: 520.00, inStock: false, url: "https://www.hyundaipartsdeal.com" },
          { tier: "aftermarket", vendor: "Safelite", partNumber: "PGW-HY1004GTN", price: 299.00, shipping: 21.00, coreCharge: 0, totalLanded: 320.00, inStock: true, url: "https://www.safelite.com" },
        ],
      },
      { id: "ws-labor", description: "Windshield R&I + Camera Recal.", category: "labor", laborHours: 2.5, aiPrice: 225, sources: [] },
      { id: "ws-cal", description: "Camera/ADAS Recalibration", category: "calibration", aiPrice: 185, sources: [] },
    ],
  },
  "back-passenger-window": {
    minor: [
      { id: "bpw-labor", description: "Rear Window — Seal Reseat", category: "labor", laborHours: 0.5, aiPrice: 45, sources: [] },
    ],
    moderate: [
      { id: "bpw-part", description: "Rear Passenger Window Glass", category: "parts", aiPrice: 95.00,
        sources: [
          { tier: "aftermarket", vendor: "AutoGlass Now", partNumber: "AGN-HY3042", price: 80.00, shipping: 15.00, coreCharge: 0, totalLanded: 95.00, inStock: true, url: "https://www.autoglassnow.com" },
        ],
      },
      { id: "bpw-labor", description: "Rear Window R&I", category: "labor", laborHours: 1, aiPrice: 90, sources: [] },
    ],
    severe: [
      { id: "bpw-part", description: "Rear Passenger Window Glass + Regulator", category: "parts", aiPrice: 175.00,
        sources: [
          { tier: "aftermarket", vendor: "AutoGlass Now", partNumber: "AGN-HY3042R", price: 148.00, shipping: 27.00, coreCharge: 0, totalLanded: 175.00, inStock: true, url: "https://www.autoglassnow.com" },
        ],
      },
      { id: "bpw-labor", description: "Rear Window + Regulator R&I", category: "labor", laborHours: 2, aiPrice: 180, sources: [] },
    ],
  },
  "front-wheel": {
    minor: [
      { id: "fw-labor", description: "Front Wheel — Curb Rash Repair", category: "labor", laborHours: 1, aiPrice: 95, sources: [] },
    ],
    moderate: [
      { id: "fw-tire", description: "Front Tire Replacement", category: "parts", aiPrice: 140.00,
        sources: [
          { tier: "aftermarket", vendor: "Tire Rack", partNumber: "205/55R16", price: 112.00, shipping: 28.00, coreCharge: 0, totalLanded: 140.00, inStock: true, url: "https://www.tirerack.com" },
        ],
      },
      { id: "fw-labor", description: "Mount, Balance & Alignment Check", category: "labor", laborHours: 1, aiPrice: 90, sources: [] },
    ],
    severe: [
      { id: "fw-rim", description: "Front Wheel Rim (OEM 16\")", category: "parts", oemPartNumber: "52910-3X200", aiPrice: 195.00,
        sources: [
          { tier: "oem", vendor: "HyundaiPartsDeal", partNumber: "52910-3X200", price: 320.00, shipping: 0, coreCharge: 0, totalLanded: 320.00, inStock: true, url: "https://www.hyundaipartsdeal.com" },
          { tier: "aftermarket", vendor: "DiscountTire", partNumber: "DT-HY-16-001", price: 170.00, shipping: 25.00, coreCharge: 0, totalLanded: 195.00, inStock: true, url: "https://www.discounttire.com" },
        ],
      },
      { id: "fw-tire", description: "Front Tire", category: "parts", aiPrice: 140.00, sources: [
          { tier: "aftermarket", vendor: "Tire Rack", partNumber: "205/55R16", price: 112.00, shipping: 28.00, coreCharge: 0, totalLanded: 140.00, inStock: true, url: "https://www.tirerack.com" },
        ],
      },
      { id: "fw-labor", description: "R&I Wheel, Mount, Balance & 4-Wheel Alignment", category: "labor", laborHours: 2, aiPrice: 180, sources: [] },
    ],
  },
  "rear-wheel": {
    minor: [
      { id: "rw-labor", description: "Rear Wheel — Curb Rash Repair", category: "labor", laborHours: 1, aiPrice: 95, sources: [] },
    ],
    moderate: [
      { id: "rw-tire", description: "Rear Tire Replacement", category: "parts", aiPrice: 140.00,
        sources: [
          { tier: "aftermarket", vendor: "Tire Rack", partNumber: "205/55R16", price: 112.00, shipping: 28.00, coreCharge: 0, totalLanded: 140.00, inStock: true, url: "https://www.tirerack.com" },
        ],
      },
      { id: "rw-labor", description: "Mount, Balance & Alignment Check", category: "labor", laborHours: 1, aiPrice: 90, sources: [] },
    ],
    severe: [
      { id: "rw-rim", description: "Rear Wheel Rim (OEM 16\")", category: "parts", oemPartNumber: "52910-3X200", aiPrice: 195.00,
        sources: [
          { tier: "aftermarket", vendor: "DiscountTire", partNumber: "DT-HY-16-001", price: 170.00, shipping: 25.00, coreCharge: 0, totalLanded: 195.00, inStock: true, url: "https://www.discounttire.com" },
        ],
      },
      { id: "rw-tire", description: "Rear Tire", category: "parts", aiPrice: 140.00, sources: [
          { tier: "aftermarket", vendor: "Tire Rack", partNumber: "205/55R16", price: 112.00, shipping: 28.00, coreCharge: 0, totalLanded: 140.00, inStock: true, url: "https://www.tirerack.com" },
        ],
      },
      { id: "rw-labor", description: "R&I Wheel, Mount, Balance & 4-Wheel Alignment", category: "labor", laborHours: 2, aiPrice: 180, sources: [] },
    ],
  },
};

const PART_NAMES: Record<string, string> = {
  "front-bumper":          "front bumper cover",
  "rear-bumper":           "rear bumper cover",
  "front-door":            "front door panel",
  "rear-door":             "rear door panel",
  "front-headlight":       "front headlight assembly",
  "rear-taillight":        "rear taillight assembly",
  "windshield":            "windshield",
  "back-passenger-window": "rear passenger window",
  "front-wheel":           "front wheel/tire",
  "rear-wheel":            "rear wheel/tire",
};

const SEVERITY_DESC: Record<Severity, string> = {
  minor:    "shows minor cosmetic damage and is a candidate for PDR or refinishing",
  moderate: "shows moderate damage requiring repair and refinishing",
  severe:   "has sustained significant damage and requires full replacement",
};

const RECOMMENDATION: Record<Severity, string> = {
  minor:    "Cosmetic repair is recommended. No structural compromise detected.",
  moderate: "Panel repair and refinishing recommended. Verify adjacent components for hidden damage.",
  severe:   "Full component replacement required. Inspect mounting points and adjacent structure before repair.",
};

export function buildSummary(
  damageNotes: Record<string, { severity: Severity | null; notes: string }>
): string {
  const damaged = Object.entries(damageNotes).filter(([, v]) => v.severity);
  if (damaged.length === 0) return "";

  const lines: string[] = [];

  for (const [partId, { severity, notes }] of damaged) {
    const name = PART_NAMES[partId] ?? partId.replace(/-/g, " ");
    let line = `The ${name} ${SEVERITY_DESC[severity!]}.`;
    if (notes) line += ` Note: ${notes}.`;
    lines.push(line);
  }

  // Overall recommendation based on worst severity
  const severityRank: Record<Severity, number> = { minor: 1, moderate: 2, severe: 3 };
  const worst = damaged.reduce<Severity>((acc, [, { severity }]) => {
    return severityRank[severity!] > severityRank[acc] ? severity! : acc;
  }, "minor");

  lines.push(RECOMMENDATION[worst]);

  return lines.join(" ");
}

export function buildLineItems(
  damageNotes: Record<string, { severity: Severity | null; notes: string }>
): LineItem[] {
  const items: LineItem[] = [];

  for (const [partId, { severity }] of Object.entries(damageNotes)) {
    if (!severity) continue;
    const partPricing = PRICING[partId];
    if (!partPricing) continue;
    const lines = partPricing[severity];
    // Namespace IDs to avoid duplicates across parts
    items.push(...lines.map((l, i) => ({ ...l, id: `${partId}-${l.id}-${i}` })));
  }

  return items;
}
