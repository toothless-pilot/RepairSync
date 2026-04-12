"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import {
  createStealthBrowser,
  createStealthContext,
} from "../../../packages/core/src/pricing/browser";
import { scrapeOEMPrice } from "../../../packages/core/src/pricing/scrapers/oem";
import { scrapeRockAutoPrice } from "../../../packages/core/src/pricing/scrapers/rockauto";
import { scrapeCarPartPrice } from "../../../packages/core/src/pricing/scrapers/carpart";
import {
  parsePrice,
  checkStock,
  calcLandedCost,
  resolveInterchange,
} from "../../../packages/core/src/pricing/normalize";
import type { PartPriceResult, RawPriceResult, VehicleProfile } from "@repair-sync/types";

const TIER_ORDER: Record<string, number> = {
  oem: 0,
  aftermarket: 1,
  salvage: 2,
};

async function decodeVIN(vin: string): Promise<VehicleProfile> {
  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinextended/${vin}?format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NHTSA API error: ${res.status}`);

  const { Results } = await res.json() as { Results: Array<{ Variable: string; Value: string }> };
  const get = (name: string) =>
    Results.find((r) => r.Variable === name)?.Value?.trim() ?? "";

  return {
    make: get("Make").toLowerCase(),
    model: get("Model"),
    year: parseInt(get("Model Year"), 10),
    trim: get("Series"),
    body_class: get("Body Class"),
    engine: get("Engine Configuration"),
  };
}

async function resolvePartNumber(
  vehicle: VehicleProfile,
  part_category: string,
  sub_assembly: string
): Promise<{ part_number: string; superseded_by: string | null }> {
  const PV_KEY = process.env.PARTSVOICE_API_KEY;
  if (!PV_KEY) {
    throw new Error("PARTSVOICE_API_KEY is not set");
  }

  const params = new URLSearchParams({
    year: String(vehicle.year),
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim,
    part_category,
    sub_assembly,
  });

  const res = await fetch(
    `https://api.partsvoice.com/v2/lookup?${params.toString()}`,
    { headers: { Authorization: `Bearer ${PV_KEY}` } }
  );

  if (!res.ok) throw new Error(`PartsVoice API error: ${res.status}`);

  return res.json() as Promise<{ part_number: string; superseded_by: string | null }>;
}

export const fetchPartPrice = action({
  args: {
    vin: v.string(),
    part_category: v.string(),
    sub_assembly: v.string(),
    shop_zip: v.string(),
  },

  handler: async (
    _ctx,
    { vin, part_category, sub_assembly, shop_zip }
  ): Promise<PartPriceResult[]> => {
    // ── Stage 1: VIN → SKU ────────────────────────────────────────────────────
    const vehicle = await decodeVIN(vin);

    const { part_number, superseded_by } = await resolvePartNumber(
      vehicle,
      part_category,
      sub_assembly
    );

    const resolvedSKU = superseded_by ?? part_number;

    // ── Stage 2: Multi-source scrape ──────────────────────────────────────────
    const browser = await createStealthBrowser();
    const rawResults: RawPriceResult[] = [];

    try {
      async function runScraper<T extends unknown[]>(
        fn: (page: import("playwright").Page, ...args: T) => Promise<RawPriceResult>,
        ...args: T
      ): Promise<RawPriceResult | null> {
        const ctx = await createStealthContext(browser);
        const page = await ctx.newPage();
        try {
          return await fn(page, ...args);
        } catch (err) {
          console.error(`Scraper [${fn.name}] failed:`, err);
          return null;
        } finally {
          await ctx.close();
        }
      }

      const [oemRes, aftermarketRes, salvageRes] = await Promise.allSettled([
        runScraper(scrapeOEMPrice, resolvedSKU, vehicle.make),
        runScraper(scrapeRockAutoPrice, resolvedSKU),
        runScraper(scrapeCarPartPrice, resolvedSKU, shop_zip),
      ]);

      for (const result of [oemRes, aftermarketRes, salvageRes]) {
        if (result.status === "fulfilled" && result.value) {
          rawResults.push(result.value);
        }
      }
    } finally {
      await browser.close();
    }

    // ── Stage 3: Normalize ───────────────────────────────────────────────────
    const now = new Date().toISOString();
    const normalized: PartPriceResult[] = [];

    for (const raw of rawResults) {
      let basePrice = parsePrice(raw.raw_price);
      let interchangeUsed = false;

      // If part is out of stock or has no price, try interchange SKUs
      if (basePrice === null || !checkStock(raw.raw_stock)) {
        const altSKUs = await resolveInterchange(resolvedSKU, vehicle.year);

        for (const altSKU of altSKUs) {
          // Re-run the same scraper source with the alternate SKU
          const browser2 = await createStealthBrowser();
          try {
            const ctx2 = await createStealthContext(browser2);
            const page2 = await ctx2.newPage();
            let altRaw: RawPriceResult | null = null;

            try {
              if (raw.tier === "oem") {
                altRaw = await scrapeOEMPrice(page2, altSKU, vehicle.make);
              } else if (raw.tier === "aftermarket") {
                altRaw = await scrapeRockAutoPrice(page2, altSKU);
              } else {
                altRaw = await scrapeCarPartPrice(page2, altSKU, shop_zip);
              }
            } finally {
              await ctx2.close();
            }

            const altPrice = parsePrice(altRaw?.raw_price ?? "");
            if (altPrice !== null && checkStock(altRaw?.raw_stock)) {
              basePrice = altPrice;
              interchangeUsed = true;
              break;
            }
          } finally {
            await browser2.close();
          }
        }
      }

      if (basePrice === null) continue;

      const { shipping, core_charge, total_landed } = calcLandedCost({
        base_price: basePrice,
        raw_shipping: raw.raw_shipping ?? "0",
        part_description: sub_assembly,
      });

      normalized.push({
        part_id: resolvedSKU,
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

    // Sort by tier, then by total landed cost within tier
    return normalized.sort((a, b) => {
      const tierDiff = (TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9);
      if (tierDiff !== 0) return tierDiff;
      return a.total_landed - b.total_landed;
    });
  },
});
