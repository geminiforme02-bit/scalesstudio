// Screenshot a page (optionally after scrolling) for visual QA.
// Usage:
//   node screenshot.mjs <url> [label] [scrollPct] [width] [height]
// Examples:
//   node screenshot.mjs http://localhost:3000 home-hero
//   node screenshot.mjs http://localhost:3000 home-mid 0.4
//   node screenshot.mjs http://localhost:3000/booking.html booking 0 1440 900
import puppeteer from "puppeteer";
import { mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";

const url = process.argv[2] || "http://localhost:3000";
const label = process.argv[3] || "";
const scrollPct = parseFloat(process.argv[4] || "0");
const width = parseInt(process.argv[5] || "1440", 10);
const height = parseInt(process.argv[6] || "900", 10);

const OUT = "temporary screenshots";
await mkdir(OUT, { recursive: true });

function nextName() {
  return readdir(OUT).then((files) => {
    const nums = files
      .map((f) => /^screenshot-(\d+)/.exec(f))
      .filter(Boolean)
      .map((m) => parseInt(m[1], 10));
    const n = (nums.length ? Math.max(...nums) : 0) + 1;
    return join(OUT, `screenshot-${n}${label ? "-" + label : ""}.png`);
  });
}

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--force-color-profile=srgb"],
});
const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

// allow fonts + loader + intro animations to settle
await new Promise((r) => setTimeout(r, 2600));

if (scrollPct > 0) {
  await page.evaluate((pct) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, max * pct);
  }, scrollPct);
  await new Promise((r) => setTimeout(r, 1800));
}

const out = await nextName();
await page.screenshot({ path: out, fullPage: false });
console.log("Saved", out);
await browser.close();
