import { writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
await page.addInitScript(() => {
  const samples = [];
  const frames = [];
  let last = 0;
  Object.defineProperty(window, 'tabbyMeasurements', { value: { samples, frames } });
  document.addEventListener(
    'pointerup',
    () => {
      const started = performance.now();
      requestAnimationFrame(() =>
        requestAnimationFrame(() => samples.push(performance.now() - started)),
      );
    },
    true,
  );
  const frame = (t) => {
    if (last) frames.push(t - last);
    last = t;
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
});
const started = Date.now();
await page.goto('http://127.0.0.1:4180');
await page.getByRole('button', { name: '开摊啦', exact: true }).waitFor();
const homeReady = Date.now() - started;
await page.getByRole('button', { name: '开摊啦', exact: true }).click();
await page.getByRole('button', { name: '明白了，继续' }).click();
await page.getByRole('button', { name: '明白了，继续' }).click();
await page.getByRole('button', { name: '开始接待' }).click();
async function click(id, dy = 0) {
  const box = await page.locator(`[data-hotspot="${id}"]`).boundingBox();
  if (!box) throw new Error(id);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2 + dy);
}
await page.evaluate(() => {
  window.tabbyMeasurements.samples.length = 0;
  window.tabbyMeasurements.frames.length = 0;
});
await click('supply-apple');
await click('machine-apple');
await click('supply-cup');
await click('machine-cup');
await click('start');
for (let i = 0; i < 3; i++) {
  await click(i % 2 ? 'supply-banana' : 'supply-apple');
  await click('tray-1', 22);
}
await click('tray-1', 22);
await click('guest-0');
await page.getByRole('button', { name: '暂停', exact: true }).click();
await page.getByRole('button', { name: '继续营业', exact: true }).click();
await page.waitForTimeout(300);
const data = await page.evaluate(() => ({
  measurements: window.tabbyMeasurements,
  resources: performance.getEntriesByType('resource').map((e) => ({
    name: e.name.split('/').pop(),
    transferSize: e.transferSize,
    encodedBodySize: e.encodedBodySize,
    duration: e.duration,
  })),
  navigation: performance
    .getEntriesByType('navigation')
    .map((e) => ({ duration: e.duration, domContentLoaded: e.domContentLoadedEventEnd })),
  userAgent: navigator.userAgent,
}));
const percentile = (a, p) =>
  [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.ceil(a.length * p) - 1)];
const report = {
  capturedAt: new Date().toISOString(),
  environment:
    'macOS arm64, Chromium Playwright, local production preview HTTP, fresh browser context, no network or CPU throttle',
  viewport: { width: 390, height: 844 },
  homeReadyWallMs: homeReady,
  inputToSecondAnimationFrame: {
    samples: data.measurements.samples.length,
    p50: percentile(data.measurements.samples, 0.5),
    p95: percentile(data.measurements.samples, 0.95),
    max: Math.max(...data.measurements.samples),
    limitation:
      'Pointer-up to second requestAnimationFrame proxy; not direct display latency or Event Timing INP',
  },
  activeOperationFrames: {
    samples: data.measurements.frames.length,
    p95Ms: percentile(data.measurements.frames, 0.95),
    maxMs: Math.max(...data.measurements.frames),
  },
  transferBytes: data.resources.reduce((n, e) => n + e.transferSize, 0),
  ...data,
};
await writeFile('docs/evidence/performance.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ...report, measurements: undefined, resources: undefined }, null, 2));
await browser.close();
