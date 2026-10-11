import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const lines = {
  occupied: '这个餐位已经有食品了。先点图里的这一份，把它拿回桌边，再重新摆餐。',
  fresh: '这份已经品尝过了。留在作品里，再做一份新的食品分享。',
  clear: '先把喜欢的作品放进食谱，再收拾桌面，就能继续创作。',
  welcome: '点一位朋友，自己决定先帮谁。',
  kitchen: '听朋友要什么。做好食品，拿起盘，再点这位朋友。',
  free: '继续搭配、摆放、分享。喜欢的作品放进食谱，也可以收摊。',
  wait: '朋友正在接餐。食品留在原处，慢慢来。',
  drawer: '朋友找到了抽屉。一起打开看看。',
  seed: '取出花苗，选一个花盆的位置。',
  plant: '把花苗种在你喜欢的位置。',
  'watering-can': '从抽屉拿出小水壶。',
  water: '给花喝水。花展开了，蝴蝶也来了。',
  cool: '再做一杯不同的甜点，带到树荫下。',
  recipe: '翻开旧食谱，看看两份真实甜点。',
  compare: '一份用杯，一份用筒。球数和配料也能不同。尝尝自己的做法。',
  taste: '选一份，让朋友尝一口，看看回应。',
  bunting: '挂起彩旗，找到阴凉的分享处。',
  basket: '打开篮子，看看里面和空的位置。',
  pack: '一份三明治，一份水果。放在同一个盘里，带进篮子。',
  unpack: '把装好的篮子放到桌上，打开一起分享。',
  mat: '取出两张餐垫，给朋友找到自己的位置。',
  place: '选一份食品，再点空餐位。每位朋友都能有一份。',
  cloth: '铺上喜欢的桌布，朋友可以围坐了。',
  lantern: '找出灯串。让朋友帮忙带到桌边。',
  cooperate: '朋友可以带灯或带杯。你可以继续准备另一份。',
  light: '把灯点亮。两种灯光都能照亮朋友。',
  invite: '点朋友的邀请牌，听听今天新的分享需要。',
  create: '自己搭配，做好拼盘，带到桌边。',
  share: '听朋友的分享需要。选好食品，再点朋友的分享牌。',
  save: '把实际作品放进食谱。下次能翻看，也可以继续修改。',
  finish: '准备好了。大家一起开席。想玩还能继续做，想休息就收摊。',
  use: '朋友把物件带到桌边。',
};
const english = {
  'need-fruit': 'Some fruit to share, please.',
  'need-drink': 'A drink to share, please.',
  'need-cool': 'Something cool, please.',
  'need-savory': 'A sandwich or a burger to share, please.',
  'need-any': 'I would like to try your creation, please.',
  sip: 'Sip! A refreshing drink. Thank you!',
  cold: 'Cool and creamy! Thank you!',
  bite: 'Mmm! I can taste your food. Thank you!',
};
const speech = JSON.parse(await readFile('src/content/speech.json', 'utf8'));
const dir = await mkdtemp(join(tmpdir(), 'tabby-experience-audio-'));
const records = [];
const selected = new Set(process.argv.slice(2));
let generated = 0;
try {
  for (const [key, text] of Object.entries({ ...lines, ...english })) {
    const id = `world-${key}`,
      voice = key in english ? 'Samantha' : 'Tingting',
      rate = key in english ? 140 : 180;
    const entry = {
      id,
      text,
      kind: key.startsWith('need-') ? 'open-request' : 'scene',
      path: `audio/${id}.wav`,
      status: 'DEVELOPMENT_TTS_UNREVIEWED',
    };
    if (!selected.size || selected.has(key)) {
      generated++;
      execFileSync('say', ['-v', voice, '-r', String(rate), '-o', join(dir, 'speech.aiff'), text]);
      execFileSync('afconvert', [
        '-f',
        'WAVE',
        '-d',
        'LEI16@22050',
        join(dir, 'speech.aiff'),
        `public/${entry.path}`,
      ]);
    }
    speech[id] = entry;
    records.push({ ...entry, voice, rate });
  }
  await writeFile('src/content/speech.json', `${JSON.stringify(speech, null, 2)}\n`);
  await writeFile(
    'art/adventure-experience-audio.json',
    `${JSON.stringify({ package: 'WP-ADVENTURE-EXPERIENCE-02', source: 'macOS say, Tingting and Samantha, PCM16 22050Hz; exact generation script scripts/adventure-experience-audio.mjs', humanListeningReview: 'NOT_RUN', rights: 'PENDING', records }, null, 2)}\n`,
  );
  console.log(`Generated ${generated} registered development clips`);
} finally {
  await rm(dir, { recursive: true, force: true });
}
