import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const records = [
  { id: 'request-cup-vanilla', text: 'In a cup, please.', kind: 'request' },
  { id: 'request-cone-vanilla', text: 'In a cone, please.', kind: 'request' },
  { id: 'word-vanilla-cup', text: 'vanilla ice cream', kind: 'word' },
  { id: 'request-vanilla-cup', text: 'Vanilla ice cream, please.', kind: 'request' },
  { id: 'request-strawberry-cup', text: 'Strawberry ice cream, please.', kind: 'request' },
  {
    id: 'menu-ice-flavor',
    text: 'One scoop in a cup. Choose vanilla or strawberry.',
    kind: 'instruction',
  },
  {
    id: 'menu-ice-container',
    text: 'One scoop of vanilla. Choose a cup or a cone.',
    kind: 'instruction',
  },
];
const speech = JSON.parse(await readFile('src/content/speech.json', 'utf8'));
const dir = await mkdtemp(join(tmpdir(), 'tabby-growth-'));
try {
  for (const r of records) {
    const path = `audio/${r.id}.wav`;
    execFileSync('say', ['-v', 'Samantha', '-r', '140', '-o', join(dir, 'speech.aiff'), r.text]);
    execFileSync('afconvert', [
      '-f',
      'WAVE',
      '-d',
      'LEI16@22050',
      join(dir, 'speech.aiff'),
      `public/${path}`,
    ]);
    speech[r.id] = { ...r, path, status: 'DEVELOPMENT_TTS_UNREVIEWED' };
  }
  await writeFile('src/content/speech.json', JSON.stringify(speech, null, 2) + '\n');
  await writeFile(
    'art/m22-growth-audio.json',
    JSON.stringify(
      {
        source: 'macOS say / Samantha 140 wpm, PCM 22050 Hz',
        humanListeningReview: 'NOT_RUN',
        rights: 'PENDING',
        records,
      },
      null,
      2,
    ) + '\n',
  );
} finally {
  await rm(dir, { recursive: true, force: true });
}
