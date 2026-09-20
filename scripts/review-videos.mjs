import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const root = 'docs/evidence/m1-upgrade';
const browser = await chromium.launch();
for (const name of ['guided-touch', 'service-touch', 'pad-serial']) {
  const bytes = await readFile(`${root}/${name}.webm`);
  const page = await browser.newPage({ viewport: { width: 800, height: 800 } });
  await page.setContent(
    '<html><body style="margin:0"><video muted style="display:block;width:384px"></video></body></html>',
  );
  const duration = await page.evaluate(
    async (src) => {
      const video = document.querySelector('video');
      video.src = src;
      await new Promise((resolve) => (video.onloadedmetadata = resolve));
      return video.duration;
    },
    `data:video/webm;base64,${bytes.toString('base64')}`,
  );
  if (!Number.isFinite(duration)) throw new Error('Video duration unavailable');
  const interval = 0.5,
    pages = [];
  let tiles = [],
    frameCount = 0;
  await mkdir(`${root}/review`, { recursive: true });
  const flush = async () => {
    const file = `${root}/review/${name}-${pages.length + 1}.jpg`;
    await sharp({
      create: {
        width: 768,
        height: Math.ceil(tiles.length / 2 / 4) * 352,
        channels: 3,
        background: '#173e32',
      },
    })
      .composite(tiles)
      .jpeg({ quality: 85 })
      .toFile(file);
    pages.push(file);
    tiles = [];
  };
  for (let time = 0.01; time < duration; time += interval) {
    await page.evaluate(
      async (time) => {
        const video = document.querySelector('video');
        await new Promise((resolve) => {
          video.onseeked = resolve;
          video.currentTime = time;
        });
      },
      Math.min(time, duration - 0.02),
    );
    const frame = await page.locator('video').screenshot();
    const input = await sharp(frame)
      .resize({ width: 192, height: 330, fit: 'contain', background: '#173e32' })
      .png()
      .toBuffer();
    const n = tiles.length / 2,
      left = (n % 4) * 192,
      top = Math.floor(n / 4) * 352;
    tiles.push(
      { input, left, top },
      {
        input: Buffer.from(
          `<svg width="192" height="22"><rect width="192" height="22" fill="#fff4dc"/><text x="8" y="16" font-size="14">${name} ${time.toFixed(1)}s</text></svg>`,
        ),
        left,
        top: top + 330,
      },
    );
    frameCount++;
    if (tiles.length === 32) await flush();
  }
  if (tiles.length) await flush();
  await writeFile(
    `${root}/${name}-review.json`,
    JSON.stringify(
      {
        durationSeconds: duration,
        intervalSeconds: interval,
        frames: frameCount,
        pages,
        method:
          'Full-duration sequential contact sheets at 0.5-second intervals. Video has no audio track; generation is not human listening or owner approval.',
      },
      null,
      2,
    ),
  );
  console.log(name, duration, frameCount, pages.length);
  await page.close();
}
await browser.close();
