// Headless preview + screenshot + logs + checksums
import { chromium } from "playwright";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ART = "artifacts";
const LOG = "logs";
for (const d of [ART, LOG]) if (!existsSync(d)) mkdirSync(d, { recursive: true });

const seed = process.env.VITE_SEED || "00000000";
const url  = process.env.PREVIEW_URL || "http://localhost:5173/";

// capture browser console to raw JSONL
const logPath = join(LOG, `run-${Date.now()}.jsonl`);
const log = (obj) => writeFileSync(logPath, JSON.stringify(obj) + "\n", { flag: "a" });

const browser = await chromium.launch();
const page = await browser.newPage();
page.on("console", (m) => log({ ts: new Date().toISOString(), type: m.type(), text: m.text() }));

// inject seed in querystring; your app can also read import.meta.env.VITE_SEED
const target = `${url}?seed=${encodeURIComponent(seed)}`;
await page.goto(target);
await page.waitForTimeout(2000); // let scene stabilize

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

// minimal machine-readable report
writeFileSync("reports/run.json", JSON.stringify({
  startedAt: new Date().toISOString(),
  seed,
  url: target,
  artifacts: checksums
}, null, 2));
