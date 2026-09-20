import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const browser = await chromium.launch();
for (const name of ['phone-interleaved', 'pad-serial']) {
  const bytes = await readFile(`docs/evidence/${name}.webm`);
  const page = await browser.newPage({ viewport: { width: 800, height: 800 } });
  await page.setContent(
    '<html><body style="margin:0"><video muted style="display:block;width:320px"></video></body></html>',
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
  const images = [];
  const interval = 0.5;
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
    const image = await sharp(frame)
      .resize({ width: 160, height: 347, fit: 'contain', background: '#173e32' })
      .png()
      .toBuffer();
    images.push({
      input: image,
      left: (images.length % 8) * 160,
      top: Math.floor(images.length / 8) * 365,
    });
    const label = Buffer.from(
      `<svg width="160" height="18"><rect width="160" height="18" fill="#fff4dc"/><text x="8" y="13" font-size="12">${time.toFixed(1)}s</text></svg>`,
    );
    images.push({ input: label, left: (((images.length - 1) / 2) % 8) * 160, top: 0 });
  }
  // Reindex paired frame/label entries into a regular contact sheet.
  const composites = [];
  for (let index = 0; index < images.length / 2; index++) {
    const left = (index % 8) * 160,
      top = Math.floor(index / 8) * 365;
    composites.push(
      { ...images[index * 2], left, top },
      { ...images[index * 2 + 1], left, top: top + 347 },
    );
  }
  await sharp({
    create: {
      width: 1280,
      height: Math.ceil(images.length / 2 / 8) * 365,
      channels: 3,
      background: '#173e32',
    },
  })
    .composite(composites)
    .png()
    .toFile(`docs/evidence/${name}-review.png`);
  await writeFile(
    `docs/evidence/${name}-review.json`,
    JSON.stringify(
      {
        durationSeconds: duration,
        intervalSeconds: interval,
        frames: images.length / 2,
        method:
          'Full-duration sequential video frame inspection at 0.5 second intervals; video has no audio track',
      },
      null,
      2,
    ),
  );
  console.log(name, duration, images.length / 2);
  await page.close();
}
await browser.close();
