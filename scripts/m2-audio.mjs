import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';

const catalog = await readFile('src/content/catalog.ts', 'utf8');
const texts = {};
for (const m of catalog.matchAll(/text:\s*'([^']+)'[\s\S]*?audio:\s*'([^']+)'/g))
  texts[m[2]] = m[1];
const names = {
  bread: 'bread',
  cheese: 'cheese',
  lettuce: 'lettuce',
  tomato: 'tomato',
  bun: 'bun',
  patty: 'patty',
  'cooked-patty': 'cooked patty',
  cone: 'cone',
  cup: 'cup',
  vanilla: 'vanilla',
  strawberry: 'strawberry',
  sandwich: 'sandwich',
  burger: 'burger',
  'ice-cream': 'ice cream',
  'vanilla-cone': 'vanilla ice cream',
  'strawberry-cup': 'strawberry ice cream',
  'double-cream': 'two scoops of ice cream',
  'banana-cream': 'ice cream with banana',
  'banana-juice': 'banana juice',
  'salad-sandwich': 'lettuce and tomato sandwich',
  'cheese-burger': 'cheeseburger',
};
for (const [id, text] of Object.entries(names)) texts[`word-${id}`] = text;
Object.assign(texts, {
  'menu-story': 'Story time. Help Dami open the food truck.',
  'menu-endless': 'Welcome! Let us serve our friends.',
  'menu-mini': 'Find food friends. Listen and play.',
  'menu-training': 'Watch Dami. Then you try.',
  'prologue-0': 'This little key is yours, Dami.',
  'prologue-1': 'Here is our old recipe book.',
  'prologue-2': 'Make something nice for our friends.',
  'chapter-juice': 'Good morning! Apple juice or banana juice?',
  'chapter-ice': 'It is a warm afternoon. Let us make ice cream.',
  'chapter-sandwich': 'A picnic! Bread and cheese make a sandwich.',
  'chapter-burger': 'First cook the patty. Then make a burger.',
  'chapter-picnic': 'All our friends are here. Thank you, Dami!',
  'mini-match': 'Listen to the word. Tap the sound, then find its picture.',
  'mini-spell': 'Look at the food. Listen. Tap the letters. You can take them back.',
});
const records = [];
for (const [id, text] of Object.entries(texts)) {
  execFileSync('say', ['-v', 'Samantha', '-r', '140', '-o', '/tmp/tabby-m2-speech.aiff', text]);
  execFileSync('afconvert', [
    '-f',
    'WAVE',
    '-d',
    'LEI16@22050',
    '/tmp/tabby-m2-speech.aiff',
    `public/audio/${id}.wav`,
  ]);
  records.push({
    id,
    text,
    voice: 'macOS Samantha',
    rate: 140,
    path: `public/audio/${id}.wav`,
    status: 'DEVELOPMENT_TTS_UNREVIEWED',
  });
}
await writeFile(
  'art/m2-audio.json',
  `${JSON.stringify({ humanListeningReview: 'NOT_RUN', records }, null, 2)}\n`,
);
console.log(records.length);
