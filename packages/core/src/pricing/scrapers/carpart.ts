import { Page } from "playwright";
import type { RawPriceResult } from "@repair-sync/types";
import { humanDelay } from "../browser";

export async function scrapeCarPartPrice(
  page: Page,
  partNumber: string,
  zip: string
): Promise<RawPriceResult> {
  await page.goto("https://www.car-part.com/", {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });

  await humanDelay();

  // Fill the search form
  const partInput = page
    .locator('#partSearch, input[name="part"], input[placeholder*="part"]')
    .first();
  await partInput.fill(partNumber);

  const zipInput = page
    .locator('#zip, input[name="zip"], input[placeholder*="zip"]')
    .first();
  await zipInput.fill(zip);

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle", timeout: 20_000 }),
    page
      .locator('#searchBtn, button[type="submit"], input[type="submit"]')
      .first()
      .click(),
  ]);

  await page
    .waitForSelector(".partsRow, .part-result, [class*='part-row']", {
      timeout: 15_000,
    })
    .catch(() => null);

  await humanDelay(400, 800);

  // Grab cheapest listing (first row)
  const priceText = await page
    .locator(".partsRow .price, .part-result .price, [class*='part-row'] [class*='price']")
    .first()
    .innerText()
    .catch(() => "");

  const shippingText = await page
    .locator(
      ".partsRow .shipping, .part-result .shipping, [class*='shipping']"
    )
    .first()
    .innerText()
    .catch(() => "0");

  // LKQ listings are live inventory — if we got a price, it's available
  const inStockText = priceText ? "in stock" : "out of stock";

  return {
    raw_price: priceText.trim(),
    raw_stock: inStockText,
    raw_shipping: shippingText.trim(),
    source: "Car-Part.com",
    tier: "salvage",
  };
}
