import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const outputs = [];
async function crop(source, id, box, max = 480) {
  let image = sharp(`art/source/${source}.png`);
  if (box) image = image.extract(box);
  const extracted = await image.toBuffer();
  const trimmed = await sharp(extracted).trim({ threshold: 8 }).toBuffer();
  const meta = await sharp(trimmed).metadata();
  await sharp(trimmed)
    .resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true })
    .extend({ top: 6, bottom: 6, left: 6, right: 6, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90 })
    .toFile(`public/assets/${id}.webp`);
  outputs.push({
    source: `art/source/${source}.png`,
    id,
    box,
    width: meta.width,
    height: meta.height,
    method: 'mechanical crop and downscale only',
  });
}
await sharp('art/source/courtyard.png')
  .flatten({ background: '#b5caa3' })
  .webp({ quality: 90 })
  .toFile('public/assets/courtyard.webp');
await crop('elder', 'elder', null, 720);
const food = [
  'bread',
  'cheese',
  'lettuce',
  'tomato',
  'bun',
  'patty',
  'cooked-patty',
  'cone',
  'vanilla',
  'strawberry',
  'sandwich',
  'burger',
];
for (const [i, id] of food.entries())
  await crop(
    'm2-foods',
    id,
    {
      left: (i % 4) * 384,
      top: i < 4 ? 0 : i < 8 ? 341 : 650,
      width: 384,
      height: i < 4 ? 341 : i < 8 ? 305 : 374,
    },
    384,
  );
for (const [i, id] of ['ice-station', 'board-station', 'grill-station'].entries())
  await crop('m2-stations', id, { left: i * 512, top: 0, width: 512, height: 1024 }, 600);
const meta = await sharp('art/source/cat-walk.png').metadata();
const cell = Math.floor(meta.width / 2);
for (let i = 0; i < 4; i++)
  await crop(
    'cat-walk',
    `cat-step-${i}`,
    { left: (i % 2) * cell, top: Math.floor(i / 2) * cell, width: cell, height: cell },
    600,
  );
await writeFile('art/m2-exports.json', `${JSON.stringify(outputs, null, 2)}\n`);
console.log(outputs);
const iceMeta = await sharp('art/source/ice-products.png').metadata();
const iceCell = Math.floor(iceMeta.width / 2);
for (const [i, id] of ['vanilla-cone', 'strawberry-cup', 'double-cream', 'banana-cream'].entries())
  await crop(
    'ice-products',
    id,
    { left: (i % 2) * iceCell, top: Math.floor(i / 2) * iceCell, width: iceCell, height: iceCell },
    480,
  );
await writeFile('art/m2-exports.json', `${JSON.stringify(outputs, null, 2)}\n`);
for (const [id, left, width] of [
  ['banana-juice', 0, 470],
  ['salad-sandwich', 470, 570],
  ['cheese-burger', 1040, 496],
])
  await crop('food-variants', id, { left, top: 0, width, height: 1024 }, 480);
await writeFile('art/m2-exports.json', `${JSON.stringify(outputs, null, 2)}\n`);
const outputMeta = await sharp('art/source/recipe-outputs.png').metadata();
for (const [i, id] of ['sandwich', 'burger'].entries()) {
  const previous = outputs.findIndex((o) => o.id === id);
  if (previous >= 0) outputs.splice(previous, 1);
  await crop(
    'recipe-outputs',
    id,
    {
      left: i * Math.floor(outputMeta.width / 2),
      top: 0,
      width: Math.floor(outputMeta.width / 2),
      height: outputMeta.height,
    },
    480,
  );
}
await writeFile('art/m2-exports.json', `${JSON.stringify(outputs, null, 2)}\n`);
