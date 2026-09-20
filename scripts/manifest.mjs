import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const entries = [];
for (const folder of ['art/source', 'public/assets', 'public/audio'])
  for (const name of (await readdir(folder)).sort()) {
    if (!/\.(png|webp|wav)$/.test(name)) continue;
    const path = `${folder}/${name}`,
      bytes = await readFile(path),
      id = name.replace(/\.[^.]+$/, '');
    const base = {
      assetId:
        folder === 'art/source' ? `source-${id}` : folder === 'public/audio' ? `audio-${id}` : id,
      path,
      bytes: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      source:
        folder === 'public/audio'
          ? 'macOS say / Samantha, development synthesis'
          : 'OpenAI built-in imagegen, original generation 2026-09-20',
      review: 'PENDING_OWNER_AND_RIGHTS_REVIEW',
      runtime: folder.startsWith('public'),
      derivation:
        folder === 'public/assets'
          ? 'scripts/export-assets.mjs; mechanical crop/resize/WebP from art/source'
          : 'original production output',
    };
    if (name.endsWith('.wav')) {
      entries.push({
        ...base,
        format: 'wav',
        audioStatus: 'DEVELOPMENT_TTS_UNREVIEWED',
        license:
          'Development use only; public distribution requires voice rights and listening review',
      });
      continue;
    }
    const image = sharp(bytes),
      metadata = await image.metadata(),
      stats = await image.stats();
    const alpha = metadata.hasAlpha ? stats.channels.at(-1) : null;
    entries.push({
      ...base,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      hasAlpha: metadata.hasAlpha,
      alphaMin: alpha?.min ?? 255,
      alphaMax: alpha?.max ?? 255,
      license:
        'AI-generated candidate; no third-party character or old-project assets; owner review pending',
    });
  }
await writeFile(
  'art/manifest.json',
  `${JSON.stringify({ version: 'm1.1', assets: entries }, null, 2)}\n`,
);
console.log(`Registered ${entries.length} actual files`);
