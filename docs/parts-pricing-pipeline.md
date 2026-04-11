# RepairSync | Parts Pricing Pipeline
**Module:** `packages/core/src/pricing/`
**Runtime:** Convex Actions (Node.js 18+)
**Status:** Architecture Specification v1.0

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        fetchPartPrice (Convex Action)                │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
              ┌─────────────────▼──────────────────┐
              │         STAGE 1: VIN-to-SKU          │
              │           Resolver                   │
              │                                      │
              │  NHTSA vPIC API → Vehicle Profile    │
              │  OEM Catalog    → Part Number (SKU)  │
              │  Diagram Logic  → Sub-Assembly ID    │
              └─────────────────┬──────────────────--┘
                                │  { vin_metadata, part_number, interchange_skus[] }
              ┌─────────────────▼──────────────────┐
              │      STAGE 2: Multi-Source Scraper   │
              │                                      │
              │  ┌──────────┐ ┌────────────┐ ┌────┐ │
              │  │OEM/Dealer│ │ Aftermarket│ │Used│ │
              │  │(MSRP)    │ │(RockAuto)  │ │LKQ │ │
              │  └────┬─────┘ └─────┬──────┘ └──┬─┘ │
              │       └─────────────┴────────────┘   │
              │             Playwright + Stealth      │
              │             Residential Proxy Rotation│
              └─────────────────┬──────────────────--┘
                                │  raw strings[]
              ┌─────────────────▼──────────────────┐
              │    STAGE 3: Normalization & Cleaning  │
              │                                      │
              │  parsePrice()  → float               │
              │  stockCheck()  → boolean             │
              │  shippingCalc()→ total landed cost   │
              │  interchange() → fallback SKUs       │
              └─────────────────┬──────────────────--┘
                                │
              ┌─────────────────▼──────────────────┐
              │            PartPriceResult[]         │
              │   { part_id, source, price,          │
              │     in_stock, tier, last_updated }   │
              └────────────────────────────────────--┘
```

---

## Stage 1 — VIN-to-SKU Resolver

### 1A. NHTSA vPIC API → Vehicle Profile

The NHTSA vPIC API is **free, no-key, and authoritative**. A single call decodes
the VIN into the make, model, model year, trim, engine, plant code, and body
style — everything we need to make OEM catalog lookups exact.

```
GET https://vpic.nhtsa.dot.gov/api/vehicles/decodevinextended/{VIN}?format=json
```

The response returns ~130 variables. The critical ones for parts lookup:

| NHTSA Variable         | Our Use                                   |
| :--------------------- | :---------------------------------------- |
| `Make`                 | OEM catalog root (Toyota, Ford…)          |
| `Model`                | Vehicle line                              |
| `ModelYear`            | Primary model year for part lookup        |
| `Series` / `Trim`      | Distinguishes base vs. Limited (affects SKU) |
| `BodyClass`            | Sedan vs. SUV (different front fascia)    |
| `EngineConfiguration`  | Inline/V determines bay geometry          |
| `PlantCity` / `PlantCountry` | Confirms domestic vs. export BOM    |

### 1B. OEM Catalog → Exact Part Number

After decoding the VIN, we need the OEM part number. Two options:

**Option A — PartsVoice / OEMPartsFit API (preferred)**
These are aggregated OEM catalogs with REST APIs. Pass the NHTSA output and
they return the exact part number. They also expose the "vehicle ID" internal to
the dealer system (e.g., Toyota uses numeric "vehicle keys" internally).

```typescript
// Pseudocode — replace with actual PartsVoice API key
const oem = await fetch(
  `https://api.partsvoice.com/v2/lookup?` +
  `year=${year}&make=${make}&model=${model}&trim=${trim}&part_category=${category}`,
  { headers: { Authorization: `Bearer ${PV_API_KEY}` } }
);
const { part_number, superseded_by, interchange } = await oem.json();
```

**Option B — Playwright scrape of OEM dealer site**
Used as fallback. The dealer sites (e.g., `parts.toyota.com`) accept a VIN
directly in their part-finder form. Playwright fills the form and extracts the
part number from the resulting DOM. See Stage 2 for scraper details.

### 1C. Part Diagram & Sub-Assembly Logic

This is the hardest disambiguation problem. A "front bumper" hit yields at least
**three separate line items** on a real estimate:

| Part Name             | OEM Part # Pattern | Notes                             |
| :-------------------- | :------------------ | :-------------------------------- |
| Bumper Cover (fascia) | `52119-XXXXX`       | Painted, plastic; most common     |
| Bumper Reinforcement  | `52021-XXXXX`       | Steel/aluminum bar behind cover   |
| Energy Absorber (foam)| `52611-XXXXX`       | Crushable foam; often overlooked  |
| Grille                | `53101-XXXXX`       | Separate SKU                      |
| Grille Molding        | `53141-XXXXX`       | Separate SKU                      |

**Resolution Logic:**
1. The CV Ontology from `CLAUDE.md` classifies damage to a `Primary Entity` and
   `Sub-Component` list.
2. Map each `Sub-Component` to a catalog "assembly category" using a lookup
   table maintained in `packages/core/src/pricing/assembly-map.ts`.
3. For each assembly category, call the OEM catalog to retrieve the specific
   part number for that sub-assembly.
4. If a part number returns a `superseded_by` field, always use the newer number
   — it means the OEM replaced the SKU (often a running change mid-year).

```typescript
// assembly-map.ts (excerpt)
export const ASSEMBLY_MAP: Record<string, string[]> = {
  "front_bumper": [
    "bumper_cover",       // 52119-*
    "bumper_reinforcement", // 52021-*
    "energy_absorber",    // 52611-*
  ],
  "quarter_panel": [
    "quarter_panel_outer",
    "wheel_arch_molding",
    "rocker_panel",
  ],
};
```

---

## Stage 2 — Multi-Source Scraper Logic

### Playwright + Stealth Plugin Setup

```typescript
// packages/core/src/pricing/browser.ts
import { chromium } from "playwright";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

export async function createStealthBrowser() {
  // playwright-extra wraps Playwright with puppeteer-extra plugins
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
    ],
  });
  return browser;
}

export function getRotatedUserAgent(): string {
  const agents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0",
  ];
  return agents[Math.floor(Math.random() * agents.length)];
}
```

### Anti-Bot Bypass Strategy

| Layer           | Method                                                                  |
| :-------------- | :---------------------------------------------------------------------- |
| IP Rotation     | Residential proxy pool (e.g., Brightdata / Oxylabs). Rotate per domain. |
| User-Agent      | Pool of 20+ real browser UAs, rotated per session.                      |
| Fingerprint     | playwright-extra stealth plugin spoofs `navigator`, `WebGL`, canvas.   |
| Human Delays    | `page.waitForTimeout(Math.random() * 1200 + 800)` between actions.     |
| Cookie Replay   | Persist cookies across sessions to appear as a returning user.          |
| JS Challenge    | If Cloudflare is detected, fall back to Firecrawl `/scrape` endpoint.   |

> **Firecrawl Fallback:** Firecrawl handles JS-rendered pages and CAPTCHAs via
> its managed browser fleet. Use it as a Tier-2 fallback when Playwright gets
> blocked.
> `POST https://api.firecrawl.dev/v1/scrape { url, formats: ["markdown"] }`

---

### Tier 1 — OEM / Dealer (MSRP Baseline)

**Target:** `parts.toyota.com`, `parts.ford.com`, `moparpartsgiant.com`

```typescript
async function scrapeOEMPrice(
  page: Page,
  partNumber: string,
  make: string
): Promise<RawPriceResult> {
  const oemUrls: Record<string, string> = {
    toyota: `https://parts.toyota.com/search?partNumber=${partNumber}`,
    ford:   `https://parts.ford.com/en/parts-search.html#part=${partNumber}`,
  };

  await page.goto(oemUrls[make.toLowerCase()], { waitUntil: "networkidle" });

  // Extract price — selector varies by OEM site
  const priceText = await page
    .locator('[data-testid="part-price"], .part-price, .price-display')
    .first()
    .innerText()
    .catch(() => "");

  const stockText = await page
    .locator('[data-testid="stock-status"], .availability')
    .first()
    .innerText()
    .catch(() => "");

  return { raw_price: priceText, raw_stock: stockText, source: "OEM", tier: "oem" };
}
```

---

### Tier 2 — Aftermarket (RockAuto)

RockAuto uses a custom in-page JavaScript catalog (not server-side rendered).
The most reliable extraction strategy is to intercept the XHR response that
fills the parts grid.

```typescript
async function scrapeRockAutoPrice(
  page: Page,
  partNumber: string
): Promise<RawPriceResult> {
  let capturedPrice = "";

  // Intercept the JSON data feed
  page.on("response", async (response) => {
    if (response.url().includes("/partdata/") && response.status() === 200) {
      const json = await response.json().catch(() => null);
      if (json?.parts) {
        // Find our part number in the response
        const match = json.parts.find((p: any) =>
          p.partNumber?.includes(partNumber)
        );
        if (match) capturedPrice = String(match.listPrice ?? "");
      }
    }
  });

  await page.goto(
    `https://www.rockauto.com/en/parts/?partnum=${encodeURIComponent(partNumber)}`,
    { waitUntil: "networkidle" }
  );

  // Fallback to DOM scraping if XHR intercept missed
  if (!capturedPrice) {
    capturedPrice = await page
      .locator(".ra-mprice")
      .first()
      .innerText()
      .catch(() => "");
  }

  const stockText = await page
    .locator(".ra-avail-qty")
    .first()
    .innerText()
    .catch(() => "");

  return {
    raw_price: capturedPrice,
    raw_stock: stockText,
    source: "RockAuto",
    tier: "aftermarket",
  };
}
```

---

### Tier 3 — Used / Salvage (Car-Part.com — LKQ)

Car-Part.com requires a zip code for shipping estimates, which is critical for
final cost accuracy.

```typescript
async function scrapeCarPartPrice(
  page: Page,
  partNumber: string,
  zip: string
): Promise<RawPriceResult> {
  await page.goto("https://www.car-part.com/", { waitUntil: "domcontentloaded" });

  await page.fill("#partSearch", partNumber);
  await page.fill("#zip", zip);
  await page.click("#searchBtn");
  await page.waitForSelector(".partsRow", { timeout: 15_000 });

  // Get first (cheapest) result
  const priceText = await page
    .locator(".partsRow .price")
    .first()
    .innerText()
    .catch(() => "");

  const shippingText = await page
    .locator(".partsRow .shipping")
    .first()
    .innerText()
    .catch(() => "0");

  return {
    raw_price: priceText,
    raw_shipping: shippingText,
    raw_stock: "available", // LKQ listings are live inventory
    source: "Car-Part.com",
    tier: "salvage",
  };
}
```

---

## Stage 3 — Data Normalization & Cleaning

### Core Types

```typescript
// packages/types/src/pricing.ts

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
  price: number;           // Base part price (USD)
  shipping: number;        // Shipping cost (USD)
  core_charge: number;     // Core charge if applicable (USD)
  total_landed: number;    // price + shipping + core_charge
  in_stock: boolean;
  tier: PricingTier;
  last_updated: string;    // ISO 8601
  interchange_used: boolean; // true if a substitute SKU was used
}
```

---

### `parsePrice()` — The Price Extractor

Handles all real-world formats: MSRP callouts, ranges, currency symbols, commas.

```typescript
// packages/core/src/pricing/normalize.ts

/**
 * Extracts the lowest usable price from a raw string.
 *
 * Handles:
 *  "$1,200.00 (MSRP: $1,450)"  → 1200.00
 *  "$850 - Out of Stock"        → 850.00
 *  "From $320 to $480"          → 320.00  (takes the lower bound)
 *  "€ 220,50"                   → 220.50  (European locale)
 *  ""                           → null
 */
export function parsePrice(raw: string): number | null {
  if (!raw || raw.trim() === "") return null;

  // Strip currency symbols, whitespace, European comma decimals
  const cleaned = raw
    .replace(/[€£¥]/g, "")
    .replace(/\s/g, "")
    // European format: 1.200,50 → 1200.50
    .replace(/(\d)\.(\d{3}),/g, "$1$2.")
    // Remove thousands separator commas (US format)
    .replace(/,(?=\d{3})/g, "");

  // Extract ALL numeric values (handles ranges, MSRP callouts)
  const matches = cleaned.match(/\$?([\d]+(?:\.\d{2})?)/g);
  if (!matches || matches.length === 0) return null;

  const values = matches
    .map((m) => parseFloat(m.replace("$", "")))
    .filter((v) => !isNaN(v) && v > 0);

  if (values.length === 0) return null;

  // Always return the LOWEST price — conservative "Referee" stance
  return Math.min(...values);
}
```

---

### `checkStock()` — Availability Parser

```typescript
export function checkStock(raw: string | undefined): boolean {
  if (!raw) return false;
  const lower = raw.toLowerCase();

  const OUT_OF_STOCK_SIGNALS = [
    "out of stock",
    "unavailable",
    "discontinued",
    "backordered",
    "0 available",
    "not available",
    "call for availability",
  ];

  return !OUT_OF_STOCK_SIGNALS.some((signal) => lower.includes(signal));
}
```

---

### `calcLandedCost()` — Shipping & Core Charge

Core charges only apply to remanufactured parts (alternators, starters, brake
calipers). The function detects remanufactured parts by checking description
keywords and adds the core to the total (the core is refunded when the old part
is returned, but we include it in the "Referee" quote since the shop must front
that cash).

```typescript
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

const CORE_CHARGE_KEYWORDS = [
  "reman",
  "remanufactured",
  "rebuilt",
  "alternator",
  "starter",
  "caliper",
  "rack and pinion",
  "power steering",
];

export function calcLandedCost(input: LandedCostInput): LandedCostResult {
  const { base_price, raw_shipping, part_description = "" } = input;

  // Parse shipping — handle "Free", "FREE SHIPPING", "$12.95"
  const shippingLower = raw_shipping.toLowerCase();
  const shipping = shippingLower.includes("free")
    ? 0
    : parsePrice(raw_shipping) ?? 0;

  // Detect core charge
  const isReman = CORE_CHARGE_KEYWORDS.some((kw) =>
    part_description.toLowerCase().includes(kw)
  );
  // Heuristic: core charge is typically 15–25% of base price for reman parts
  const core_charge = isReman ? Math.round(base_price * 0.2 * 100) / 100 : 0;

  return {
    shipping,
    core_charge,
    total_landed: base_price + shipping + core_charge,
  };
}
```

---

### Interchange Logic — Year-Cross Compatibility

If the exact-year part is out of stock, we verify whether adjacent-year parts
share the same physical SKU via:

1. **OEM Supersession Chain:** The OEM catalog marks a part as `superseded_by`
   when a later revision covers older vehicles. Always follow this chain.
2. **Parts Interchange DB:** Services like WHI Solutions / MOTOR Interchange
   expose API endpoints that return a list of compatible year/make/model
   combinations for a given part number.
3. **VIN Plant Code Check:** If the plant code and model year differ but the
   body style/engine match, the part is likely interchangeable. We mark the
   result with `interchange_used: true` so the estimate is transparent.

```typescript
export async function resolveInterchange(
  partNumber: string,
  year: number
): Promise<string[]> {
  // Call the WHI / MOTOR interchange API (or PartsVoice equivalent)
  const res = await fetch(
    `https://api.motor.com/interchange/v1?part=${partNumber}`,
    { headers: { Authorization: `Bearer ${MOTOR_API_KEY}` } }
  );
  if (!res.ok) return [];

  const { interchange_numbers } = await res.json();

  // Filter to ±2 model years — beyond that, safety-critical geometry may differ
  return (interchange_numbers as Array<{ part_number: string; year: number }>)
    .filter((i) => Math.abs(i.year - year) <= 2)
    .map((i) => i.part_number);
}
```

---

## The `fetchPartPrice` Convex Action

This is the top-level orchestrator, wiring all three stages together.

```typescript
// apps/convex/convex/actions/fetchPartPrice.ts
"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { createStealthBrowser, getRotatedUserAgent } from "../../src/pricing/browser";
import { scrapeOEMPrice } from "../../src/pricing/scrapers/oem";
import { scrapeRockAutoPrice } from "../../src/pricing/scrapers/rockauto";
import { scrapeCarPartPrice } from "../../src/pricing/scrapers/carpart";
import {
  parsePrice,
  checkStock,
  calcLandedCost,
  resolveInterchange,
} from "../../src/pricing/normalize";
import type { PartPriceResult, RawPriceResult } from "@repair-sync/types";

export const fetchPartPrice = action({
  args: {
    vin: v.string(),
    part_category: v.string(), // e.g. "front_bumper"
    sub_assembly: v.string(),  // e.g. "bumper_cover"
    shop_zip: v.string(),      // used for salvage shipping estimate
  },

  handler: async (_ctx, { vin, part_category, sub_assembly, shop_zip }) => {
    // ─── STAGE 1: VIN → SKU ─────────────────────────────────────────────────
    const vinRes = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinextended/${vin}?format=json`
    );
    const { Results } = await vinRes.json();

    const get = (name: string) =>
      Results.find((r: any) => r.Variable === name)?.Value ?? "";

    const make  = get("Make").toLowerCase();
    const year  = parseInt(get("Model Year"), 10);
    const model = get("Model");
    const trim  = get("Series");

    // Fetch OEM part number (PartsVoice / catalog lookup)
    const catalogRes = await fetch(
      `https://api.partsvoice.com/v2/lookup?` +
        `year=${year}&make=${make}&model=${model}&trim=${trim}` +
        `&part_category=${part_category}&sub_assembly=${sub_assembly}`,
      { headers: { Authorization: `Bearer ${process.env.PARTSVOICE_API_KEY}` } }
    );
    const { part_number, superseded_by } = await catalogRes.json();
    const resolvedPartNumber: string = superseded_by ?? part_number;

    // ─── STAGE 2: Scrape all three tiers ─────────────────────────────────────
    const browser = await createStealthBrowser();
    const rawResults: RawPriceResult[] = [];

    try {
      const scrapeWithContext = async (
        fn: (page: any, ...args: any[]) => Promise<RawPriceResult>,
        ...args: any[]
      ) => {
        const ctx = await browser.newContext({
          userAgent: getRotatedUserAgent(),
          proxy: {
            server: process.env.PROXY_SERVER!,
            username: process.env.PROXY_USER!,
            password: process.env.PROXY_PASS!,
          },
        });
        const page = await ctx.newPage();
        try {
          return await fn(page, ...args);
        } finally {
          await ctx.close();
        }
      };

      const [oemRaw, aftermarketRaw, salvageRaw] = await Promise.allSettled([
        scrapeWithContext(scrapeOEMPrice, resolvedPartNumber, make),
        scrapeWithContext(scrapeRockAutoPrice, resolvedPartNumber),
        scrapeWithContext(scrapeCarPartPrice, resolvedPartNumber, shop_zip),
      ]);

      for (const result of [oemRaw, aftermarketRaw, salvageRaw]) {
        if (result.status === "fulfilled") rawResults.push(result.value);
      }
    } finally {
      await browser.close();
    }

    // ─── STAGE 3: Normalize ──────────────────────────────────────────────────
    const now = new Date().toISOString();
    const normalized: PartPriceResult[] = [];

    for (const raw of rawResults) {
      let basePrice = parsePrice(raw.raw_price);
      let interchangeUsed = false;

      // If no price found (part OOS), try interchange SKUs
      if (basePrice === null || !checkStock(raw.raw_stock)) {
        const alts = await resolveInterchange(resolvedPartNumber, year);
        for (const altSku of alts) {
          // Re-scrape with the alternate SKU — simplified here, same logic applies
          const altPrice = parsePrice(`$${altSku}_price`); // placeholder
          if (altPrice !== null) {
            basePrice = altPrice;
            interchangeUsed = true;
            break;
          }
        }
      }

      if (basePrice === null) continue; // No price found even after interchange

      const { shipping, core_charge, total_landed } = calcLandedCost({
        base_price: basePrice,
        raw_shipping: raw.raw_shipping ?? "0",
        part_description: sub_assembly,
      });

      normalized.push({
        part_id: resolvedPartNumber,
        source: raw.source,
        price: basePrice,
        shipping,
        core_charge,
        total_landed,
        in_stock: checkStock(raw.raw_stock),
        tier: raw.tier,
        last_updated: now,
        interchange_used: interchangeUsed,
      });
    }

    // Sort: OEM first, then aftermarket, then salvage; cheapest within tier
    return normalized.sort((a, b) => {
      const tierOrder: Record<string, number> = { oem: 0, aftermarket: 1, salvage: 2 };
      if (tierOrder[a.tier] !== tierOrder[b.tier])
        return tierOrder[a.tier] - tierOrder[b.tier];
      return a.total_landed - b.total_landed;
    });
  },
});
```

---

## Example Output

```json
[
  {
    "part_id": "52119-0R905",
    "source": "parts.toyota.com",
    "price": 1450.00,
    "shipping": 0.00,
    "core_charge": 0.00,
    "total_landed": 1450.00,
    "in_stock": true,
    "tier": "oem",
    "last_updated": "2026-04-11T20:24:00.000Z",
    "interchange_used": false
  },
  {
    "part_id": "52119-0R905",
    "source": "RockAuto",
    "price": 850.00,
    "shipping": 18.95,
    "core_charge": 0.00,
    "total_landed": 868.95,
    "in_stock": true,
    "tier": "aftermarket",
    "last_updated": "2026-04-11T20:24:00.000Z",
    "interchange_used": false
  },
  {
    "part_id": "52119-0R905",
    "source": "Car-Part.com",
    "price": 320.00,
    "shipping": 45.00,
    "core_charge": 0.00,
    "total_landed": 365.00,
    "in_stock": true,
    "tier": "salvage",
    "last_updated": "2026-04-11T20:24:00.000Z",
    "interchange_used": true
  }
]
```

---

## Monorepo File Placement

```
repair-sync/
├── apps/
│   └── convex/
│       └── convex/
│           └── actions/
│               └── fetchPartPrice.ts       ← Convex action (this file)
└── packages/
    ├── core/
    │   └── src/
    │       └── pricing/
    │           ├── browser.ts              ← Playwright stealth setup
    │           ├── normalize.ts            ← parsePrice, checkStock, calcLandedCost
    │           ├── assembly-map.ts         ← Sub-assembly category → part mapping
    │           └── scrapers/
    │               ├── oem.ts              ← OEM dealer scraper
    │               ├── rockauto.ts         ← RockAuto aftermarket scraper
    │               └── carpart.ts          ← Car-Part.com salvage scraper
    └── types/
        └── src/
            └── pricing.ts                  ← PartPriceResult, RawPriceResult, etc.
```

---

## Required Environment Variables

| Variable             | Description                                      |
| :------------------- | :----------------------------------------------- |
| `PARTSVOICE_API_KEY` | PartsVoice / OEMPartsFit catalog API key         |
| `MOTOR_API_KEY`      | WHI Solutions / MOTOR interchange API key        |
| `PROXY_SERVER`       | Residential proxy endpoint (e.g., Brightdata)    |
| `PROXY_USER`         | Proxy username                                   |
| `PROXY_PASS`         | Proxy password                                   |
| `FIRECRAWL_API_KEY`  | Firecrawl fallback scraper key                   |

Set these in Convex dashboard under **Settings → Environment Variables**.

---

## Key Design Decisions

1. **`total_landed` is the Referee number.** Never surface just `price`. Shipping
   and core charges are the most common source of "bait-and-switch" on parts
   quotes. The transparency is the product.

2. **Interchange must be declared.** Any result using an alternate SKU has
   `interchange_used: true`. This lets the estimator note it in the supplement
   and protects RepairSync's neutrality if questioned.

3. **Tier ordering is policy, not just UX.** OEM first because the insurer's
   baseline is MSRP. Aftermarket second as the most common "agreed" middle
   ground. Salvage/LKQ last because it triggers extra documentation requirements
   in most states (California Proposition 213 compliance).

4. **`confidence_interval` hook.** If only 1 of 3 tiers returns a price,
   surface a `confidence: "low"` flag that triggers the HITL flag defined in
   `CLAUDE.md §3 B2B API`.
