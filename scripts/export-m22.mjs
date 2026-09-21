import { createHash } from 'node:crypto';
import { access, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const foods = JSON.parse(await readFile('src/content/foods.json', 'utf8'));
const records = [],
  missing = [];
for (const f of foods.filter((f) => f.image.startsWith('food-'))) {
  const source = `art/source/${f.image}.png`,
    output = `public/assets/${f.image}.webp`;
  try {
    await access(source);
  } catch {
    missing.push(f.id);
    continue;
  }
  const m = await sharp(source).metadata();
  if (!m.hasAlpha || (m.width ?? 0) < 900 || (m.height ?? 0) < 900)
    throw Error(`Source quality ${source}`);
  await sharp(source)
    .trim({ threshold: 8 })
    .resize(464, 464, { fit: 'inside', withoutEnlargement: true })
    .extend({
      top: 24,
      bottom: 24,
      left: 24,
      right: 24,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(output);
  const bytes = await readFile(source);
  records.push({
    concept: f.id,
    source,
    output,
    width: m.width,
    height: m.height,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    derivation: 'Independent original, alpha crop and downscale only; no upscaling or mirroring',
    review: 'PENDING_OWNER_RIGHTS_TEACHING_REVIEW',
  });
}
await writeFile(
  'art/m22-production.json',
  JSON.stringify(
    {
      tool: 'OpenAI built-in imagegen',
      style:
        'Independent layered cut-paper food sprites, upper-left soft light, transparent alpha, no text or logos',
      character: 'Frozen character files unchanged',
      records,
      missing,
    },
    null,
    2,
  ) + '\n',
);
console.log(`Exported ${records.length} independent foods; missing ${missing.join(',') || 'none'}`);
if (missing.length && !process.argv.includes('--partial')) process.exitCode = 1;
