import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const entries = [];
for (const folder of ['art/reference', 'art/source', 'public/assets', 'public/audio']) {
  for (const name of (await readdir(folder)).sort()) {
    if (!/\.(png|webp|wav)$/.test(name)) continue;
    const path = `${folder}/${name}`,
      bytes = await readFile(path),
      id = name.replace(/\.[^.]+$/, '');
    const reference = folder === 'art/reference',
      sound = folder === 'public/audio',
      cat = id.startsWith('cat-');
    const runtime = folder.startsWith('public');
    const base = {
      assetId: reference
        ? `reference-${id}`
        : folder === 'art/source'
          ? `source-${id}`
          : sound
            ? `audio-${id}`
            : id,
      path,
      bytes: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      runtime,
      source: reference
        ? 'User upload, explicitly selected for this project, actual PNG bytes received 2026-09-20; original JPEG not transferred'
        : sound
          ? 'macOS say / Samantha, development synthesis'
          : cat
            ? 'OpenAI built-in imagegen, derived from approved received reference; 2026-09-20'
            : 'OpenAI built-in imagegen, original generation for this repository',
      review: reference
        ? 'IDENTITY_REFERENCE_SELECTED_DERIVATIVES_UNREVIEWED'
        : 'PENDING_OWNER_AND_RIGHTS_REVIEW',
      derivation: reference
        ? 'Byte-for-byte copy, RGB no Alpha; never loaded by game'
        : runtime && !sound
          ? cat
            ? 'scripts/export-character.mjs: alpha bounding crop and downscale only; 1254px individual originals'
            : id === 'tray'
              ? 'scripts/export-assets.mjs: independent 1536x1024 tray-hd original, downscale only'
              : 'scripts/export-assets.mjs; crop/downscale original source'
          : 'original production output',
      license: reference
        ? 'User authorized use as this project character production reference; no assertion about derivative approval'
        : sound
          ? 'Development use only; voice rights and listening review pending'
          : 'AI-generated candidate; rights and owner visual review pending',
    };
    if (sound) {
      entries.push({ ...base, format: 'wav', audioStatus: 'DEVELOPMENT_TTS_UNREVIEWED' });
      continue;
    }
    const image = sharp(bytes),
      m = await image.metadata(),
      stats = await image.stats();
    const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let left = info.width,
      top = info.height,
      right = 0,
      bottom = 0,
      visible = 0;
    for (let y = 0; y < info.height; y++)
      for (let x = 0; x < info.width; x++)
        if (data[(y * info.width + x) * 4 + 3] > 8) {
          left = Math.min(left, x);
          right = Math.max(right, x);
          top = Math.min(top, y);
          bottom = Math.max(bottom, y);
          visible++;
        }
    entries.push({
      ...base,
      width: m.width,
      height: m.height,
      format: m.format,
      hasAlpha: m.hasAlpha,
      alphaMin: m.hasAlpha ? stats.channels.at(-1).min : 255,
      alphaMax: m.hasAlpha ? stats.channels.at(-1).max : 255,
      effectivePixels: { left, top, width: right - left + 1, height: bottom - top + 1, visible },
      edgeAlpha: [
        data[3],
        data[(info.width - 1) * 4 + 3],
        data[(info.height - 1) * info.width * 4 + 3],
        data[data.length - 1],
      ],
    });
  }
}
await writeFile(
  'art/manifest.json',
  `${JSON.stringify({ version: 'm1.2', assets: entries }, null, 2)}\n`,
);
console.log(
  `Registered ${entries.length} files, including reference and individual production poses`,
);
