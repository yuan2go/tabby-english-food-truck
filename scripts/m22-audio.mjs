import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const speech = JSON.parse(await readFile('src/content/speech.json', 'utf8'));
const foods = JSON.parse(await readFile('src/content/foods.json', 'utf8'));
const records = foods.flatMap((f) => [
  { id: f.audio, text: f.text, kind: 'word' },
  { id: f.contextAudio, text: f.context, kind: 'request' },
]);
for (const [id, text] of Object.entries({
  'basket-fruit': 'Fruit basket.',
  'basket-vegetable': 'Vegetable basket.',
  'basket-staple': 'Kitchen basket.',
  'basket-flavor': 'Sweet flavors.',
  'basket-ready': 'Food and drinks.',
  'basket-welcome': 'Touch a food. Listen, then find a friend.',
  'basket-next': 'Another basket.',
  'grow-banana': 'Banana. A banana, please.',
  'grow-juice': 'Apple juice. Put a cup in the machine. Choose an apple. Make juice.',
  'grow-banana-juice': 'Banana juice. Choose a banana. Make juice.',
}))
  records.push({ id, text, kind: 'instruction' });
const dir = await mkdtemp(join(tmpdir(), 'tabby-m22-'));
try {
  for (const r of records) {
    speech[r.id] = {
      text: r.text,
      kind: r.kind,
      path: `audio/${r.id}.wav`,
      status: 'DEVELOPMENT_TTS_UNREVIEWED',
    };
    execFileSync('say', ['-v', 'Samantha', '-r', '140', '-o', join(dir, 'speech.aiff'), r.text]);
    execFileSync('afconvert', [
      '-f',
      'WAVE',
      '-d',
      'LEI16@22050',
      join(dir, 'speech.aiff'),
      `public/audio/${r.id}.wav`,
    ]);
  }
  await writeFile('src/content/speech.json', JSON.stringify(speech, null, 2) + '\n');
  await writeFile(
    'art/m22-audio.json',
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
  console.log(`Generated ${records.length} individual registered clips`);
} finally {
  await rm(dir, { recursive: true, force: true });
}
