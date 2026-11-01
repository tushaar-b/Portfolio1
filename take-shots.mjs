import { mkdir } from 'node:fs/promises';
import { chromium } from './scripts/playwright-runtime.mjs';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1470, height: 769 } });
await page.goto('http://localhost:5174/?debug=1');
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => !!window.__scrollStoryQA);
await page.waitForTimeout(1000);

await mkdir('output/test-shots', { recursive: true });

// Check scroll points:
// Pin duration is based on scroll. Let's see what scroll offsets correspond to lid, tiles, dive, headline
const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
console.log('Max scroll:', max);

// Let's seek master timeline directly or via scroll
// In debug mode, window.__scrollStoryQA exists
const masterDuration = await page.evaluate(() => {
  const a = document.querySelector('#about').__aboutMotion;
  return a.master.duration();
});
console.log('Master duration:', masterDuration);

const times = [
  { name: '00-hero', t: 0 },
  { name: '01-lid-lifted', t: 0.75 },
  { name: '02-tiles-canopy', t: 1.3 },
  { name: '03-dive', t: 1.7 },
  { name: '04-portal', t: 2.1 },
  { name: '05-headline', t: 2.7 },
];

for (const { name, t } of times) {
  await page.evaluate((time) => {
    const a = document.querySelector('#about').__aboutMotion;
    a.master.time(time);
  }, t);
  await page.waitForTimeout(150);
  await page.screenshot({ path: `output/test-shots/${name}.png` });
  console.log(`Captured ${name}.png at time ${t}`);
}

await browser.close();
