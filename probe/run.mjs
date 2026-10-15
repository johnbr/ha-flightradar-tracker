// Runs probe/engine-probe.ts inside a live Home Assistant page and prints its
// frame statistics. Nothing is deployed: the bundle is injected into one
// headless page, which is closed afterwards.
//
//   npm run build:probe
//   npm i --no-save playwright-core        # or point PLAYWRIGHT at an install
//   HA_TOKEN=<long-lived token> CHROME=<chromium binary> node probe/run.mjs
//
// Env:
//   HA_URL      default http://127.0.0.1:8123
//   HA_TOKEN    a long-lived access token (required)
//   CHROME      a Chromium executable (required)
//   PROFILE     persistent profile dir, default ~/.cache/fmc-probe-profile.
//               PERSISTENT ON PURPOSE: browser_mod registers every fresh
//               profile as a new browser with ~15 entities, so a throwaway
//               profile per run leaves a trail of dead browsers behind.
//   PAGE        HA path to load, default /profile/general
//   COUNTS      aircraft counts to run, default 0,16,50
//   ENGINES     default maplibre,leaflet
//   SHOTS       directory for one screenshot per run (optional)
//   PLAYWRIGHT  module specifier or path for playwright-core

import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const base = process.env.HA_URL ?? "http://127.0.0.1:8123";
const token = process.env.HA_TOKEN;
const chrome = process.env.CHROME;
if (!token || !chrome) {
  console.error("HA_TOKEN and CHROME are required; see the header of this file.");
  process.exit(2);
}
const spec = process.env.PLAYWRIGHT ?? "playwright-core";
const { chromium } = await import(spec.startsWith("/") ? pathToFileURL(spec).href : spec);

const bundle = readFileSync(new URL("../.probe/engine-probe.js", import.meta.url), "utf8");
const counts = (process.env.COUNTS ?? "0,16,50").split(",").map(Number);
const engines = (process.env.ENGINES ?? "maplibre,leaflet").split(",");

const context = await chromium.launchPersistentContext(process.env.PROFILE ?? join(homedir(), ".cache/fmc-probe-profile"), {
  executablePath: chrome,
  headless: true,
  viewport: { width: 1280, height: 800 },
  // WebGL for MapLibre, rendered in software.
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
try {
  const page = context.pages()[0] ?? (await context.newPage());
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") console.error(`[page ${msg.type()}] ${msg.text()}`);
  });
  await page.goto(`${base}/auth/authorize`);
  await page.evaluate(
    ([tok, url]) =>
      localStorage.setItem(
        "hassTokens",
        JSON.stringify({
          access_token: tok,
          token_type: "Bearer",
          expires_in: 1e9,
          hassUrl: url,
          clientId: `${url}/`,
          expires: Date.now() + 1e12,
          refresh_token: "",
        })
      ),
    [token, base]
  );
  await page.goto(`${base}${process.env.PAGE ?? "/profile/general"}`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.querySelector("home-assistant")?.hass?.config, null, { timeout: 30_000 });
  await page.waitForFunction(() => typeof window.loadCardHelpers === "function", null, { timeout: 30_000 });
  await page.addScriptTag({ content: bundle });

  const results = [];
  for (const engine of engines) {
    for (const count of counts) {
      const result = await page.evaluate((opts) => window.__fmcProbe.run(opts), { engine, count });
      if (process.env.SHOTS) await page.screenshot({ path: join(process.env.SHOTS, `${engine}-${count}.png`) });
      await page.evaluate(() => window.__fmcProbe.cleanup());
      results.push({ asked: engine, ...result });
      console.error(`done: ${engine} x${count} -> ${result.engine}`);
    }
  }
  console.log(JSON.stringify(results, null, 2));
} finally {
  await context.close();
}
