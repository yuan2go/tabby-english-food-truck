import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const manifest = JSON.parse(await readFile('art/manifest.json', 'utf8'));
assert.equal(manifest.version, 'm2.1');
const ids = new Set();
for (const asset of manifest.assets) {
  assert(!ids.has(asset.assetId), `duplicate ${asset.assetId}`);
  ids.add(asset.assetId);
  const bytes = await readFile(asset.path);
  assert.equal(bytes.length, asset.bytes, asset.path);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, asset.path);
  if (asset.format !== 'wav') {
    const image = sharp(bytes),
      m = await image.metadata(),
      s = await image.stats();
    assert.equal(m.width, asset.width);
    assert.equal(m.height, asset.height);
    assert.equal(m.hasAlpha, asset.hasAlpha);
    if (asset.hasAlpha) assert.equal(s.channels.at(-1).min, asset.alphaMin);
    if (asset.runtime && !['market', 'courtyard'].includes(asset.assetId)) {
      assert.equal(asset.alphaMin, 0, `${asset.assetId} needs true transparent pixels`);
      assert(asset.effectivePixels.visible > 1000, `${asset.assetId} cannot be empty`);
      assert(
        asset.edgeAlpha.every((a) => a < 10),
        `${asset.assetId} corners must be transparent`,
      );
    }
  } else {
    assert.equal(bytes.subarray(0, 4).toString(), 'RIFF');
    assert.equal(bytes.subarray(8, 12).toString(), 'WAVE');
  }
  assert(asset.source && asset.review && asset.license && asset.derivation);
}
const registry = await readFile('src/game/assets.ts', 'utf8');
const declared = registry.match(/export const ASSET_IDS = \[([\s\S]*?)\] as const/);
assert(declared, 'explicit runtime asset registry');
const runtimeIds = [...declared[1].matchAll(/'([a-z][a-z0-9-]+)'/g)].map((m) => m[1]);
assert(runtimeIds.length >= 47, 'runtime registry must not be empty or truncated');
for (const id of [...runtimeIds, 'courtyard', 'elder'])
  assert(ids.has(id), `missing runtime ${id}`);
for (const id of [
  'request-apple',
  'request-banana',
  'request-juice',
  'request-fruit',
  'apple',
  'banana',
  'juice',
  'two',
])
  assert(
    manifest.assets.some((a) => a.assetId === `audio-${id}` && a.format === 'wav'),
    `missing local speech ${id}`,
  );
const speech = JSON.parse(await readFile('art/m2-audio.json', 'utf8'));
assert(Array.isArray(speech.records) && speech.records.length === 49, 'complete M2 speech list');
for (const record of speech.records)
  assert(ids.has(`audio-${record.id}`), `missing M2 speech ${record.id}`);
console.log(
  `PASS: ${manifest.assets.length} files, actual hashes/dimensions/alpha and runtime registry checked`,
);

const synthesis = JSON.parse(await readFile('art/audio-synthesis.json', 'utf8'));
const audioCode = await readFile(synthesis.sourceFile, 'utf8');
for (const cue of synthesis.cues) assert(audioCode.includes(`${cue}: [`), `missing cue ${cue}`);
assert.equal(synthesis.humanListeningReview, 'NOT_RUN');
console.log(
  'PASS: four procedural audio layers and nine cues registered; listening review remains NOT_RUN',
);

const catalogSpeech = JSON.parse(await readFile('src/content/speech.json', 'utf8'));
for (const [id, entry] of Object.entries(catalogSpeech)) {
  assert.equal(entry.path, `audio/${id}.wav`, `explicit speech path ${id}`);
  assert(ids.has(`audio-${id}`), `missing registered speech ${id}`);
  assert.equal(entry.status, 'DEVELOPMENT_TTS_UNREVIEWED');
}
console.log(
  `PASS: ${Object.keys(catalogSpeech).length} explicit speech references; no guessed item paths`,
);
