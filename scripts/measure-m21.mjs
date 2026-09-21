import { writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4186';
const label = process.argv[2] || 'current';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 393, height: 665 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});
const page = await context.newPage();
await page.addInitScript(() => {
  const m = { frames: [], long: [], inputs: [], running: false, last: 0 };
  window.m21measure = m;
  new PerformanceObserver((list) => {
    if (m.running) for (const x of list.getEntries()) m.long.push(x.duration);
  }).observe({ type: 'longtask', buffered: true });
  document.addEventListener(
    'pointerup',
    () => {
      if (m.running) {
        const at = performance.now();
        requestAnimationFrame(() =>
          requestAnimationFrame(() => m.inputs.push(performance.now() - at)),
        );
      }
    },
    true,
  );
  const frame = (now) => {
    if (m.running && m.last) m.frames.push(now - m.last);
    m.last = m.running ? now : 0;
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
});
await page.goto(base, { waitUntil: 'networkidle' });
const identity = await page.locator('main').evaluate((n) => ({ ...n.dataset }));
const cold = await page.evaluate(() =>
  performance.getEntriesByType('resource').reduce((n, r) => n + r.transferSize, 0),
);
await page.reload({ waitUntil: 'networkidle' });
const warm = await page.evaluate(() =>
  performance.getEntriesByType('resource').reduce((n, r) => n + r.transferSize, 0),
);
await page.locator('.yard-story .entry-main').tap();
await page.getByRole('button', { name: '跳过序章' }).tap();
await page.getByRole('button', { name: '晨光果汁', exact: true }).tap();
const skipOpening = page.getByRole('button', { name: '跳过开场' });
if (await skipOpening.count()) await skipOpening.tap();
await page.getByRole('button', { name: '我来试试', exact: true }).waitFor();
await page.getByRole('button', { name: '我来试试', exact: true }).tap();
const cdp = process.env.CPU_PROFILE ? await context.newCDPSession(page) : null;
await cdp?.send('Profiler.enable');
await cdp?.send('Profiler.start');
await page.evaluate(() => (window.m21measure.running = true));
await page.locator('.prep-selector').getByRole('button', { name: '● 1号盘', exact: true }).tap();
const tap = async (id) => {
  const b = await page.locator(`[data-hotspot="${id}"]`).boundingBox();
  await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2);
};
await tap('supply-apple');
await page.getByRole('button', { name: '送给客人 ↗', exact: true }).tap();
await page.getByRole('dialog', { name: '场景小教学' }).waitFor({ timeout: 20000 });
await page.getByRole('button', { name: '我来试试', exact: true }).tap();
await page.locator('.prep-selector').getByRole('button', { name: '果汁机', exact: true }).tap();
await tap('supply-apple');
await tap('supply-cup');
await tap('start');
await page.waitForFunction(
  () =>
    document.querySelector('[data-hotspot="start"]') &&
    document.querySelector('main').dataset.audioState.includes('machine'),
);
await page.waitForTimeout(6000); // Sampling duration only; never schedules gameplay/audio.
await page.evaluate(() => (window.m21measure.running = false));
const profile = cdp ? (await cdp.send('Profiler.stop')).profile : null;
await cdp?.detach();
const metrics = await page.evaluate(() => ({
  ...window.m21measure,
  canvas: {
    width: document.querySelector('canvas').width,
    height: document.querySelector('canvas').height,
  },
  resources: performance
    .getEntriesByType('resource')
    .map((r) => ({ name: r.name, bytes: r.transferSize, duration: r.duration })),
}));
const percentile = (xs, q) =>
  [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor(xs.length * q))] ?? null;
const result = {
  label,
  identity,
  viewport: { width: 393, height: 665, dpr: 3 },
  recording: false,
  coldTransfer: cold,
  warmTransfer: warm,
  frames: {
    n: metrics.frames.length,
    p50: percentile(metrics.frames, 0.5),
    p95: percentile(metrics.frames, 0.95),
    max: Math.max(...metrics.frames),
  },
  inputToSecondRaf: { n: metrics.inputs.length, p95: percentile(metrics.inputs, 0.95) },
  longTasks: metrics.long,
  cpu: profile
    ? {
        durationMs: (profile.endTime - profile.startTime) / 1000,
        samples: profile.samples.length,
        top: profile.nodes
          .filter((n) => n.hitCount)
          .sort((a, b) => b.hitCount - a.hitCount)
          .slice(0, 18)
          .map((n) => ({
            function: n.callFrame.functionName,
            url: n.callFrame.url,
            line: n.callFrame.lineNumber,
            hits: n.hitCount,
          })),
      }
    : null,
  raw: metrics,
};
await writeFile(
  `${process.env.EVIDENCE_DIR ?? 'docs/evidence/m21'}/performance-${label}.json`,
  JSON.stringify(result, null, 2),
);
console.log(
  JSON.stringify({
    ...result,
    raw: undefined,
    identity: { sha: identity.buildSha, dirty: identity.buildDirty },
  }),
);
await browser.close();
