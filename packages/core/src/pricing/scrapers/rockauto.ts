import { Page } from "playwright";
import type { RawPriceResult } from "@repair-sync/types";
import { humanDelay } from "../browser";

interface RockAutoPartEntry {
  partNumber?: string;
  listPrice?: number;
  quantity?: number;
}

export async function scrapeRockAutoPrice(
  page: Page,
  partNumber: string
): Promise<RawPriceResult> {
  let capturedPrice = "";
  let capturedQty = "";

  // Intercept the JSON data feed RockAuto loads dynamically
  page.on("response", async (response) => {
    const url = response.url();
    if (
      (url.includes("/partdata/") || url.includes("/catalog/")) &&
      response.status() === 200
    ) {
      try {
        const json = await response.json() as { parts?: RockAutoPartEntry[] };
        if (json?.parts) {
          const match = json.parts.find((p) =>
            p.partNumber?.replace(/[-\s]/g, "").toUpperCase() ===
            partNumber.replace(/[-\s]/g, "").toUpperCase()
          );
          if (match) {
            capturedPrice = String(match.listPrice ?? "");
            capturedQty = String(match.quantity ?? "1");
          }
        }
      } catch {
        // JSON parse failed — will fall back to DOM
      }
    }
  });

  await page.goto(
    `https://www.rockauto.com/en/parts/?partnum=${encodeURIComponent(partNumber)}`,
    { waitUntil: "networkidle", timeout: 30_000 }
  );

  await humanDelay();

  // DOM fallback
  if (!capturedPrice) {
    capturedPrice = await page
      .locator(".ra-mprice, [class*='price-value'], .listing-price")
      .first()
      .innerText()
      .catch(() => "");
  }

  const stockText =
    capturedQty && parseInt(capturedQty, 10) > 0
      ? "in stock"
      : await page
          .locator(".ra-avail-qty, [class*='availability']")
          .first()
          .innerText()
          .catch(() => "");

  return {
    raw_price: capturedPrice.trim(),
    raw_stock: stockText.trim(),
    source: "RockAuto",
    tier: "aftermarket",
  };
}
