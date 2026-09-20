import { readdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const records = [];
for (const name of (await readdir('art/source')).filter(
  (n) => n.startsWith('cat-') && n.endsWith('.png'),
)) {
  const source = `art/source/${name}`,
    output = `public/assets/${name.replace('.png', '.webp')}`;
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let left = info.width,
    top = info.height,
    right = 0,
    bottom = 0,
    visible = 0;
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 8) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
        visible++;
      }
    }
  if (!visible) throw new Error(`Empty ${name}`);
  const crop = {
    left: Math.max(0, left - 5),
    top: Math.max(0, top - 5),
    width: Math.min(info.width - 1, right + 5) - Math.max(0, left - 5) + 1,
    height: Math.min(info.height - 1, bottom + 5) - Math.max(0, top - 5) + 1,
  };
  await sharp(source)
    .extract(crop)
    .resize({ height: 640, width: 640, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(output);
  records.push({
    source,
    output,
    native: { width: info.width, height: info.height },
    effectivePixels: { left, top, width: right - left + 1, height: bottom - top + 1, visible },
    crop,
    export: await sharp(output).metadata(),
  });
}
await writeFile('art/character-exports.json', `${JSON.stringify(records, null, 2)}\n`);
console.log(
  records.map((r) => ({
    path: r.output,
    native: r.native,
    effective: r.effectivePixels,
    output: [r.export.width, r.export.height],
  })),
);
