import { Page } from "playwright";
import type { RawPriceResult } from "@repair-sync/types";
import { humanDelay } from "../browser";

const OEM_URLS: Record<string, (partNumber: string) => string> = {
  toyota: (p) => `https://parts.toyota.com/search?partNumber=${encodeURIComponent(p)}`,
  ford: (p) => `https://parts.ford.com/en/parts-search.html#part=${encodeURIComponent(p)}`,
  honda: (p) => `https://parts.honda.com/p/${encodeURIComponent(p)}`,
  chevrolet: (p) => `https://www.gmotors.com/searchresult?partNumber=${encodeURIComponent(p)}`,
  bmw: (p) => `https://www.bmwusa.com/parts/partSearch?partNumber=${encodeURIComponent(p)}`,
};

export async function scrapeOEMPrice(
  page: Page,
  partNumber: string,
  make: string
): Promise<RawPriceResult> {
  const urlFactory = OEM_URLS[make.toLowerCase()];
  if (!urlFactory) {
    return { raw_price: "", raw_stock: "", source: `${make} OEM`, tier: "oem" };
  }

  await page.goto(urlFactory(partNumber), {
    waitUntil: "networkidle",
    timeout: 30_000,
  });

  await humanDelay();

  const priceText = await page
    .locator(
      '[data-testid="part-price"], .part-price, .price-display, ' +
      '.price__value, [class*="partPrice"], [class*="price"]'
    )
    .first()
    .innerText()
    .catch(() => "");

  const stockText = await page
    .locator(
      '[data-testid="stock-status"], .availability, ' +
      '[class*="availability"], [class*="stock"]'
    )
    .first()
    .innerText()
    .catch(() => "in stock");

  return {
    raw_price: priceText.trim(),
    raw_stock: stockText.trim(),
    source: `${make.charAt(0).toUpperCase() + make.slice(1)} OEM`,
    tier: "oem",
  };
}
