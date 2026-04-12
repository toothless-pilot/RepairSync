import { chromium, Browser, BrowserContext } from "playwright";

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
];

export function getRotatedUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export async function createStealthBrowser(): Promise<Browser> {
  return chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
    ],
  });
}

export async function createStealthContext(
  browser: Browser
): Promise<BrowserContext> {
  const proxyEnabled =
    process.env.PROXY_SERVER &&
    process.env.PROXY_USER &&
    process.env.PROXY_PASS;

  const ctx = await browser.newContext({
    userAgent: getRotatedUserAgent(),
    viewport: { width: 1366, height: 768 },
    locale: "en-US",
    timezoneId: "America/Chicago",
    ...(proxyEnabled && {
      proxy: {
        server: process.env.PROXY_SERVER!,
        username: process.env.PROXY_USER!,
        password: process.env.PROXY_PASS!,
      },
    }),
    extraHTTPHeaders: {
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
    },
  });

  // Spoof navigator.webdriver = false
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3, 4, 5],
    });
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });
  });

  return ctx;
}

export async function humanDelay(
  minMs = 600,
  maxMs = 1400
): Promise<void> {
  const ms = Math.floor(Math.random() * (maxMs - minMs) + minMs);
  await new Promise((r) => setTimeout(r, ms));
}
