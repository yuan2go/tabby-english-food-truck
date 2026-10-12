import fs from 'node:fs/promises';
import sharp from 'sharp';

const names = [
  'cat-greet',
  'cat-carry',
  'cat-place',
  'cat-celebrate',
  'cat-reach',
  'guest-0-0',
  'guest-0-1',
  'guest-0-2',
  'guest-1-0',
  'guest-1-1',
  'guest-1-2',
  'elder',
];
const bounds = {};
for (const id of names) {
  const { data, info } = await sharp(`public/assets/${id}.webp`)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let left = info.width,
    top = info.height,
    right = 0,
    bottom = 0;
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++)
      if (data[(y * info.width + x) * 4 + 3] > 16) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
  bounds[id] = {
    x: left,
    y: top,
    width: right - left + 1,
    height: bottom - top + 1,
    sourceWidth: info.width,
    sourceHeight: info.height,
  };
}
await fs.writeFile('src/game/together-actors.json', JSON.stringify(bounds, null, 2) + '\n');
console.log(`Measured ${names.length} existing actor alpha silhouettes; source images unchanged.`);
