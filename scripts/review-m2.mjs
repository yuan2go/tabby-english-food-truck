import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const root = process.env.EVIDENCE_DIR ?? 'docs/evidence/m2';
const names = process.argv.slice(2);
const browser = await chromium.launch();
await mkdir(`${root}/review`, { recursive: true });
try {
  for (const name of names) {
    const bytes = await readFile(`${root}/${name}.webm`);
    const page = await browser.newPage();
    await page.setContent('<video muted></video><canvas></canvas>');
    const duration = await page.evaluate(
      async (src) => {
        const v = document.querySelector('video');
        v.src = src;
        await new Promise((r) => {
          v.onloadedmetadata = r;
        });
        return v.duration;
      },
      `data:video/webm;base64,${bytes.toString('base64')}`,
    );
    if (!Number.isFinite(duration)) throw Error('duration');
    const step = name === 'actor-continuity' ? 0.1 : name === 'helper-overlap' ? 0.25 : 1;
    const pages = [];
    let tiles = [],
      count = 0;
    const flush = async () => {
      const path = `${root}/review/${name}-${pages.length + 1}.jpg`;
      await sharp({
        create: {
          width: 768,
          height: Math.ceil(tiles.length / 2 / 4) * 350,
          channels: 3,
          background: '#183f33',
        },
      })
        .composite(tiles)
        .jpeg({ quality: 86 })
        .toFile(path);
      pages.push(path);
      tiles = [];
    };
    for (let t = 0.01; t < duration - 0.05; t += step) {
      const encoded = await page.evaluate(async (time) => {
        const v = document.querySelector('video'),
          c = document.querySelector('canvas');
        await new Promise((r) => {
          v.onseeked = r;
          v.currentTime = time;
        });
        c.width = v.videoWidth;
        c.height = v.videoHeight;
        c.getContext('2d').drawImage(v, 0, 0);
        return c.toDataURL('image/png').split(',')[1];
      }, t);
      const input = await sharp(Buffer.from(encoded, 'base64'))
        .trim({ background: '#808080', threshold: 2 })
        .resize({ width: 192, height: 326, fit: 'contain', background: '#183f33' })
        .png()
        .toBuffer();
      const index = tiles.length / 2,
        left = (index % 4) * 192,
        top = Math.floor(index / 4) * 350;
      tiles.push(
        { input, left, top },
        {
          input: Buffer.from(
            `<svg width="192" height="24"><rect width="192" height="24" fill="#fff1ce"/><text x="6" y="17" font-size="13">${name} ${t.toFixed(1)}s</text></svg>`,
          ),
          left,
          top: top + 326,
        },
      );
      count++;
      if (tiles.length === 32) await flush();
    }
    if (tiles.length) await flush();
    await writeFile(
      `${root}/review/${name}.json`,
      JSON.stringify(
        {
          duration,
          interval: step,
          frames: count,
          pages,
          method:
            'Sequential contact sheets sampled from the actual continuous HTTP interaction video. No video audio track, physical device or owner acceptance is implied.',
        },
        null,
        2,
      ),
    );
    console.log(name, duration, count, pages.length);
    await page.close();
  }
} finally {
  await browser.close();
}
