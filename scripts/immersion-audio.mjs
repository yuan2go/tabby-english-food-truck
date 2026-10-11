import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { dialogueProducts, orderLine } from '../src/content/request-language.ts';

const definitions =
  (await readFile('src/content/catalog.ts', 'utf8')) +
  (await readFile('src/content/food-orders.ts', 'utf8'));
const requests = [...definitions.matchAll(/products: \[([^\]]+)\]/g)].map((m) =>
  [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]),
);
const data = JSON.parse(await readFile('src/content/dialogue-lines.json', 'utf8'));
const corpus = [
  ...requests.map((p) => ({ ...orderLine(p), role: 'guest', trigger: 'order', products: p })),
  ...Object.entries(data).map(([id, d]) => ({ ...d, audio: `imm-${id}` })),
  ...Object.entries(dialogueProducts).flatMap(([id, p]) => [
    {
      text: `I made ${p.one}.`,
      audio: `imm-made-${id}`,
      role: 'dami',
      trigger: 'work',
      products: [id],
    },
    {
      text: `I remember your ${p.name}.`,
      audio: `imm-remember-${id}`,
      role: 'guest',
      trigger: 'revisit',
      products: [id],
    },
  ]),
];
const records = [...new Map(corpus.map((l) => [l.audio, l])).values()];
const speech = JSON.parse(await readFile('src/content/speech.json', 'utf8'));
const manifest = JSON.parse(await readFile('art/manifest.json', 'utf8'));
const dir = await mkdtemp(join(tmpdir(), 'tabby-immersion-'));
try {
  for (const r of records) {
    const path = `public/audio/${r.audio}.wav`;
    const existing = speech[r.audio];
    if (!existing || existing.text !== r.text) {
      execFileSync('say', ['-v', 'Samantha', '-r', '140', '-o', join(dir, 'line.aiff'), r.text]);
      execFileSync('afconvert', ['-f', 'WAVE', '-d', 'LEI16@22050', join(dir, 'line.aiff'), path]);
    }
    speech[r.audio] = {
      text: r.text,
      kind: r.trigger,
      path: `audio/${r.audio}.wav`,
      status: 'DEVELOPMENT_TTS_UNREVIEWED',
    };
    const bytes = await readFile(path);
    const assetId = `audio-${r.audio}`;
    const entry = {
      assetId,
      path,
      bytes: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      runtime: true,
      source: 'macOS say / Samantha 140 wpm, offline whole-sentence PCM 22050 Hz',
      review: 'PENDING_OWNER_AND_RIGHTS_REVIEW',
      derivation: 'scripts/immersion-audio.mjs; semantic corpus; art/immersion-audio.json',
      license: 'Development use only; voice rights and listening review pending',
      format: 'wav',
      audioStatus: 'DEVELOPMENT_TTS_UNREVIEWED',
    };
    const index = manifest.assets.findIndex((a) => a.assetId === assetId);
    if (index < 0) manifest.assets.push(entry);
    else manifest.assets[index] = entry;
  }
  await writeFile('src/content/speech.json', JSON.stringify(speech, null, 2) + '\n');
  await writeFile('art/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
  await writeFile(
    'art/immersion-audio.json',
    JSON.stringify(
      {
        source: 'macOS say / Samantha 140 wpm, offline PCM 22050 Hz',
        humanListeningReview: 'NOT_RUN',
        rights: 'PENDING',
        records,
      },
      null,
      2,
    ) + '\n',
  );
  execFileSync(
    'node_modules/.bin/biome',
    [
      'format',
      '--write',
      'src/content/speech.json',
      'art/manifest.json',
      'art/immersion-audio.json',
    ],
    { stdio: 'ignore' },
  );
  console.log(
    `Registered ${records.length} complete sentence clips; human listening NOT_RUN, rights PENDING`,
  );
} finally {
  await rm(dir, { recursive: true, force: true });
}
