import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const speech = JSON.parse(await readFile('src/content/speech.json', 'utf8'));
const ids = [
  'name-juice',
  'name-cheese-sandwich',
  'name-one',
  'name-two',
  'name-and',
  'try-apple',
  'try-banana',
  'try-juice',
  'try-vanilla',
  'try-strawberry',
  'try-cup',
  'try-cone',
  'try-bread',
  'try-cheese',
  'try-lettuce',
  'try-tomato',
  'try-bun',
  'try-patty',
  'try-cooked-patty',
  'try-sandwich',
  'try-burger',
  'try-ice-cream',
  'try-one',
  'try-two',
  'try-and',
  'menu-cup',
  'menu-cream',
  'mini-match',
];
const dir = await mkdtemp(join(tmpdir(), 'tabby-m21-'));
try {
  for (const id of ids) {
    execFileSync('say', [
      '-v',
      'Samantha',
      '-r',
      '140',
      '-o',
      join(dir, 'speech.aiff'),
      speech[id].text,
    ]);
    execFileSync('afconvert', [
      '-f',
      'WAVE',
      '-d',
      'LEI16@22050',
      join(dir, 'speech.aiff'),
      `public/${speech[id].path}`,
    ]);
  }
  await writeFile(
    'art/m21-audio.json',
    JSON.stringify(
      {
        humanListeningReview: 'NOT_RUN',
        rights: 'PENDING',
        source: 'macOS say / Samantha, 140 wpm, PCM 22050Hz',
        records: ids.map((id) => ({ id, ...speech[id] })),
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`Generated ${ids.length} registered development clips`);
} finally {
  await rm(dir, { recursive: true, force: true });
}
