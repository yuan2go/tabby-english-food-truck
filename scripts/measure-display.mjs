import { writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const entries = [];
for (const [name, url, source] of [
  [
    'baseline',
    'http://127.0.0.1:5184',
    '0b904284131eb425118c0a1baa7a8d0663201c8e (git archive, unmodified source)',
  ],
  ['after', process.argv[2] ?? 'http://127.0.0.1:4173', 'read from runtime build metadata'],
]) {
  const context = await browser.newContext({
    viewport: { width: 393, height: 665 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    const samples = new Map(),
      original = CanvasRenderingContext2D.prototype.fillText;
    Object.defineProperty(window, 'textMeasurements', { value: samples });
    CanvasRenderingContext2D.prototype.fillText = function (...args) {
      samples.set(args[0], {
        text: args[0],
        font: this.font,
        width: this.canvas.width,
        height: this.canvas.height,
        transformScale: this.getTransform().a,
      });
      return original.apply(this, args);
    };
  });
  const response = await page.goto(url);
  if (name === 'after') await page.getByRole('button', { name: '小小餐车营业中' }).tap();
  await page.getByRole('button', { name: '开摊啦', exact: true }).tap();
  if (name === 'baseline') {
    await page.getByRole('button', { name: '明白了，继续' }).tap();
    await page.getByRole('button', { name: '明白了，继续' }).tap();
    await page.getByRole('button', { name: '开始接待' }).tap();
  } else await page.getByRole('button', { name: '我来试试' }).tap();
  await page.waitForTimeout(400);
  const data = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    return {
      viewport: {
        width: innerWidth,
        height: innerHeight,
        dpr: devicePixelRatio,
        visualScale: visualViewport.scale,
      },
      canvas: {
        width: canvas.width,
        height: canvas.height,
        cssWidth: canvas.getBoundingClientRect().width,
        cssHeight: canvas.getBoundingClientRect().height,
        transform: getComputedStyle(canvas).transform,
        world: {
          width: canvas.dataset.worldWidth ?? 'not exposed',
          height: canvas.dataset.worldHeight ?? 'not exposed',
        },
      },
      textTextures: [...window.textMeasurements.values()].filter(
        (s) => s.text.includes('1号盘') || s.text.includes('榨汁'),
      ),
      build: { ...document.querySelector('main').dataset, audioState: undefined },
      scripts: [...document.scripts].map((s) => s.src).filter(Boolean),
      minSemanticHit: Math.min(
        ...[...document.querySelectorAll('[data-hotspot]')].map((e) =>
          Math.min(e.getBoundingClientRect().width, e.getBoundingClientRect().height),
        ),
      ),
      scroll: {
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
      },
    };
  });
  entries.push({ name, url, source, status: response.status(), data });
  await page.screenshot({ path: `docs/evidence/m1-upgrade/${name}-comparison-393x665-dpr3.png` });
  await context.close();
}
await writeFile(
  'docs/evidence/m1-upgrade/display-measurements.json',
  JSON.stringify(entries, null, 2),
);
console.log(JSON.stringify(entries, null, 2));
await browser.close();
