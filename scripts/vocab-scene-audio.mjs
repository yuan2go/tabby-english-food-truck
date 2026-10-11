import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { SCENE_LEVELS } from '../src/content/scene-levels.ts';

const manifest = JSON.parse(await readFile('art/manifest.json', 'utf8'));
const speech = JSON.parse(await readFile('src/content/speech.json', 'utf8'));
const records = [
  ...new Map(
    SCENE_LEVELS.flatMap((l) =>
      l.tasks.map((t) => [t.audio, { id: t.audio, text: t.instruction, kind: 'instruction' }]),
    ),
  ).values(),
];
for (const record of records) {
  const path = `public/audio/${record.id}.wav`;
  if (speech[record.id]?.text === record.text && manifest.assets.some((a) => a.path === path))
    continue;
  execFileSync('say', [
    '-v',
    'Samantha',
    '-r',
    '135',
    '-o',
    '/tmp/tabby-vocab-scene.aiff',
    record.text,
  ]);
  execFileSync('afconvert', [
    '-f',
    'WAVE',
    '-d',
    'LEI16@22050',
    '/tmp/tabby-vocab-scene.aiff',
    path,
  ]);
  const bytes = await readFile(path);
  speech[record.id] = {
    text: record.text,
    kind: record.kind,
    path: `audio/${record.id}.wav`,
    status: 'DEVELOPMENT_TTS_UNREVIEWED',
  };
  manifest.assets = manifest.assets.filter((a) => a.assetId !== `audio-${record.id}`);
  manifest.assets.push({
    assetId: `audio-${record.id}`,
    path,
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    runtime: true,
    source: 'macOS say / Samantha 135 wpm, static PCM 22050 Hz',
    review: 'PENDING_OWNER_AND_RIGHTS_REVIEW',
    license: 'Development use only; voice rights and listening review pending',
    derivation: 'scripts/vocab-scene-audio.mjs; exact task instruction',
    format: 'wav',
    audioStatus: 'DEVELOPMENT_TTS_UNREVIEWED',
  });
}
await writeFile('src/content/speech.json', JSON.stringify(speech, null, 2) + '\n');
await writeFile('art/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
await writeFile(
  'art/vocab-scene-audio.json',
  JSON.stringify(
    {
      source: 'macOS Samantha static development speech',
      humanListeningReview: 'NOT_RUN',
      rights: 'PENDING',
      records,
    },
    null,
    2,
  ) + '\n',
);
console.log(`${records.length} unique exact scene instructions, real WAV and hashes registered.`);
