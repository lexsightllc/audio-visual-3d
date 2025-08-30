// Headless preview + screenshot + logs + checksums
import { chromium } from "playwright";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const ART = "artifacts";
const LOG = "logs";
for (const d of [ART, LOG]) if (!existsSync(d)) mkdirSync(d, { recursive: true });

const seed = process.env.VITE_SEED || "00000000";
const url  = process.env.PREVIEW_URL || "http://localhost:5173/";
const startedAt = new Date().toISOString();

// capture browser console to raw JSONL
const logPath = join(LOG, `run-${Date.now()}.jsonl`);
const log = (obj) => writeFileSync(logPath, JSON.stringify(obj) + "\n", { flag: "a" });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 800, height: 600 },
  deviceScaleFactor: 1
});
const page = await context.newPage();
page.on("console", (m) => log({ ts: new Date().toISOString(), type: m.type(), text: m.text() }));
page.on("pageerror", (e) => log({ ts: new Date().toISOString(), type: "pageerror", text: e.message, stack: e.stack }));

// inject seed in querystring; your app can also read import.meta.env.VITE_SEED
const target = `${url}?seed=${encodeURIComponent(seed)}`;
await page.goto(target);
await page.waitForFunction(() => window.__sceneStable === true, null, { timeout: 5000 });

const fingerprint = await page.evaluate(() => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl');
  const info = gl && gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = info && gl ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : null;
  return {
    userAgent: navigator.userAgent,
    devicePixelRatio: window.devicePixelRatio,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    webGLRenderer: renderer
  };
});
log({ ts: new Date().toISOString(), type: "context", seed, ...fingerprint });

// screenshot artifact
const shot = join(ART, `first-frame.png`);
await page.screenshot({ path: shot, fullPage: false });

// checksums for proof of replicability
function sha256(buf) { return createHash("sha256").update(buf).digest("hex"); }
const pngBuf = readFileSync(shot);
const checksums = [
  { file: "artifacts/first-frame.png", sha256: sha256(pngBuf) },
  { file: logPath, sha256: sha256(readFileSync(logPath)) }
];
writeFileSync(join(ART, "checksums.json"), JSON.stringify(checksums, null, 2));

await browser.close();

const commit = execSync("git rev-parse HEAD").toString().trim();
const dirty = execSync("git status --porcelain").toString().trim() !== "";

// minimal machine-readable report
writeFileSync("reports/run.json", JSON.stringify({
  startedAt,
  seed,
  url: target,
  commit,
  dirty,
  fingerprint,
  artifacts: checksums
}, null, 2));
