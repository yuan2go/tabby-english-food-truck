import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

// Render the exact procedural loop body used by ForegroundAudio, without a
// second sound design implementation. This is an audible review export only.
const source = await readFile('src/platform/audio.ts', 'utf8');
const start = source.indexOf('    const seconds = kind ===');
const end = source.indexOf('    this.buffers.set(kind, buffer);', start);
if (start < 0 || end < 0) throw Error('Audio loop source boundary changed');
const render = new Function('context', 'kind', `${source.slice(start, end)}\nreturn buffer;`);
const rate = 22050;
const context = {
  sampleRate: rate,
  createBuffer: (_channels, length) => {
    const samples = new Float32Array(length);
    return { getChannelData: () => samples };
  },
};
const folder = 'docs/evidence/m2/audio';
await mkdir(folder, { recursive: true });
const records = [];
for (const kind of ['music', 'ambience', 'machine', 'ice', 'board', 'grill']) {
  const raw = render(context, kind).getChannelData(0);
  const gain = kind === 'ambience' ? 0.045 : 0.09;
  const repeats = raw.length === rate ? 3 : 1;
  const wav = Buffer.alloc(44 + raw.length * repeats * 2);
  wav.write('RIFF', 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(rate, 24);
  wav.writeUInt32LE(rate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(wav.length - 44, 40);
  for (let i = 0; i < raw.length * repeats; i++)
    wav.writeInt16LE(
      Math.round(Math.max(-1, Math.min(1, raw[i % raw.length] * gain)) * 32767),
      44 + i * 2,
    );
  const path = `${folder}/${kind}.wav`;
  await writeFile(path, wav);
  records.push({
    kind,
    path,
    gain,
    seconds: (raw.length * repeats) / rate,
    sha256: createHash('sha256').update(wav).digest('hex'),
  });
}
await writeFile(
  `${folder}/samples.json`,
  JSON.stringify(
    {
      source: 'src/platform/audio.ts',
      sourceSha256: createHash('sha256').update(source).digest('hex'),
      method:
        'Exact loop synthesis body rendered at 22050Hz and normal no-voice bus gain. Individual stems, not a live mixed recording.',
      humanListeningReview: 'NOT_RUN',
      records,
    },
    null,
    2,
  ),
);
const clips = [
  ['序章交接', '../../../../public/audio/prologue-0.wav'],
  ['苹果请求', '../../../../public/audio/request-apple.wav'],
  ['两球冰淇淋', '../../../../public/audio/request-double-cream.wav'],
  ['三明治请求', '../../../../public/audio/request-sandwich.wav'],
  ['汉堡请求', '../../../../public/audio/request-cheese-burger.wav'],
  ...records.map((r) => [r.kind, `${r.kind}.wav`]),
];
await writeFile(
  `${folder}/index.html`,
  `<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>M2 声音待审样本</title><style>body{max-width:720px;margin:32px auto;padding:20px;background:#f5ecd5;color:#204c3d;font-family:system-ui}article{margin:24px 0}audio{width:100%}</style><h1>M2 可听样本</h1><p>开发 Samantha 语音和实际过程声算法导出；未做人类听审与权利签审。下面是分轨样本，不是录像音轨或完整现场混音。</p>${clips.map(([name, path]) => `<article><h2>${name}</h2><audio controls preload="none" src="${path}"></audio></article>`).join('')}</html>`,
);
console.log(
  `Exported ${records.length} audible procedural stems and five speech references; listening review NOT_RUN.`,
);
