import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const nouns = [
  ['cup', '杯子', 'cups'],
  ['plate', '盘子', 'plates'],
  ['bowl', '碗', 'bowls'],
  ['spoon', '勺子', 'spoons'],
  ['fork', '叉子', 'forks'],
  ['knife', '餐刀', 'knives'],
  ['tray', '托盘', 'trays'],
  ['napkin', '餐巾', 'napkins'],
  ['pot', '锅', 'pots'],
  ['pan', '平底锅', 'pans'],
  ['lid', '锅盖', 'lids'],
  ['kettle', '水壶', 'kettles'],
  ['bottle', '瓶子', 'bottles'],
  ['glass', '玻璃杯', 'glasses'],
  ['jug', '倒水壶', 'jugs'],
  ['spatula', '锅铲', 'spatulas'],
  ['ladle', '汤勺', 'ladles'],
  ['whisk', '打蛋器', 'whisks'],
  ['cutting-board', '砧板', 'cutting boards'],
  ['apron', '围裙', 'aprons'],
  ['basket', '篮子', 'baskets'],
  ['box', '盒子', 'boxes'],
  ['bag', '袋子', 'bags'],
  ['table', '桌子', 'tables'],
  ['chair', '椅子', 'chairs'],
  ['bench', '长椅', 'benches'],
  ['door', '门', 'doors'],
  ['window', '窗户', 'windows'],
  ['shelf', '架子', 'shelves'],
  ['drawer', '抽屉', 'drawers'],
  ['lamp', '灯', 'lamps'],
  ['flower', '花', 'flowers'],
  ['tree', '树', 'trees'],
  ['leaf', '叶子', 'leaves'],
  ['seed', '种子', 'seeds'],
  ['watering-can', '浇水壶', 'watering cans'],
  ['ball', '球', 'balls'],
  ['book', '书', 'books'],
];
const colors = {
  red: '#c64d43',
  yellow: '#eac557',
  blue: '#6d9fba',
  green: '#6e9369',
  purple: '#9673a7',
  pink: '#dd9da6',
  brown: '#9b7454',
  black: '#494c47',
  white: '#f4f1e6',
};
const attributes = [
  ['red', '红色'],
  ['yellow', '黄色'],
  ['blue', '蓝色'],
  ['green', '绿色'],
  ['purple', '紫色'],
  ['pink', '粉色'],
  ['brown', '棕色'],
  ['black', '黑色'],
  ['white', '白色'],
  ['big', '大的'],
  ['small', '小的'],
  ['round', '圆的'],
  ['soft', '柔软的'],
];
const numbers = [
  ['one', '一'],
  ['two', '二'],
  ['three', '三'],
  ['four', '四'],
  ['five', '五'],
];
const actions = [
  ['take', '拿起', 'Take the ball.'],
  ['put', '放下', 'Put the cup on the table.'],
  ['open', '打开', 'Open the box.'],
  ['close', '关上', 'Close the box.'],
  ['pour', '倒水', 'Pour water into the cup.'],
  ['stir', '搅拌', 'Stir the water.'],
  ['wash', '清洗', 'Wash the bowl.'],
  ['cut', '切分', 'Cut the apple.'],
  ['carry', '搬运', 'Carry the basket.'],
  ['share', '分享', 'Share the apple.'],
];
const positions = [
  ['in', '在里面', 'Put the ball in the basket.'],
  ['on', '在上面', 'Put the cup on the table.'],
  ['under', '在下面', 'Put the ball under the table.'],
  ['beside', '在旁边', 'Put the chair beside the table.'],
];
const p = (d, fill = '#b58a59') => `<path d="${d}" fill="${fill}"/>`;
const r = (x, y, w, h, fill = '#b58a59', rx = 8) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
const e = (x, y, rx, ry, fill = '#d6b97c') =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
const line = (x, y, x2, y2) => `<path d="M${x} ${y}L${x2} ${y2}" fill="none"/>`;
const cup =
  p('M60 72H134L128 149Q96 168 66 149Z', '#e7cc93') +
  p('M134 87Q170 82 166 111Q162 132 132 128', 'none');
const bowl =
  e(110, 85, 75, 18, '#ece0c4') +
  p('M35 85Q40 165 110 163Q180 165 185 85Z', '#88a6a2') +
  e(110, 85, 75, 18, '#f4e7cd');
const pot =
  r(50, 83, 120, 82, '#798f87', 14) +
  r(26, 96, 24, 22, '#ad8c60') +
  r(170, 96, 24, 22, '#ad8c60') +
  e(110, 83, 60, 12, '#e6cfaa');
const table =
  p('M32 90L156 72L194 94L68 118Z', '#d5b57f') +
  p('M49 111L51 182H67L69 115M165 105L170 178H184L181 101', '#886744');
const shapes = {
  cup,
  plate:
    e(110, 110, 83, 58, '#e7d8b6') +
    e(110, 110, 63, 40, '#f6ebd3') +
    e(110, 110, 48, 28, '#eddcba'),
  bowl,
  spoon: e(110, 63, 24, 34, '#d9c6a1') + p('M102 96L98 183Q110 195 122 183L118 96Z', '#ad8153'),
  fork: p(
    'M86 35V87Q88 102 103 104L99 183Q110 198 121 183L117 104Q134 102 134 87V35H126V77H117V35H106V77H97V35Z',
    '#bbc1b7',
  ),
  knife: p('M91 39Q135 40 129 114L108 126V185H88V119Z', '#bdc1b6') + r(88, 121, 23, 65, '#aa7650'),
  tray:
    r(27, 61, 166, 105, '#c99e69', 25) +
    r(42, 75, 136, 77, '#e4c28a', 20) +
    r(30, 103, 15, 24, '#896944') +
    r(175, 103, 15, 24, '#896944'),
  napkin:
    p('M35 64L162 41L185 171L61 183Z', '#e6dbc5') +
    p('M35 64L153 145L61 183Z', '#bca88a') +
    line(67, 64, 164, 153),
  pot,
  pan:
    e(118, 119, 65, 45, '#666f63') +
    e(118, 116, 51, 32, '#929987') +
    p('M67 105L24 66L15 76L63 129Z', '#ac8050'),
  lid:
    e(110, 123, 83, 24, '#899e91') +
    p('M40 118Q50 77 110 76Q168 77 181 118Z', '#b3c1ae') +
    r(91, 60, 38, 19, '#9a7652'),
  kettle:
    p('M54 78Q26 30 102 25Q168 29 166 85', 'none') +
    p('M53 80Q38 151 79 164H141Q184 142 157 79Z', '#94a99a') +
    p('M155 108L193 61L200 76L168 141Z', '#b3c5ad') +
    e(105, 78, 55, 12, '#d1c5a7'),
  bottle:
    r(84, 29, 52, 28, '#ae8d64') +
    p('M86 57L63 90V173Q110 198 157 173V90L134 57Z', '#91b4b0') +
    r(76, 106, 68, 48, '#e5d6b1'),
  glass:
    p('M65 47H157L146 177Q110 188 76 177Z', '#c5dbd5') +
    p('M76 109H147L142 169Q110 179 80 169Z', '#92b7c4') +
    e(111, 48, 46, 10, '#e7eee2'),
  jug:
    p('M60 49L43 33H143L139 162Q103 184 67 162Z', '#d7bb86') +
    p('M143 65Q196 58 192 112Q186 140 141 127', 'none') +
    e(99, 49, 37, 8, '#f0d6a5'),
  spatula:
    p('M76 29H145L151 82L120 112L125 184H98L103 112L70 82Z', '#b3976f') +
    line(88, 43, 91, 82) +
    line(110, 43, 110, 82) +
    line(133, 43, 130, 82),
  ladle:
    p('M101 34H119V129H102Z', '#b7beb0') +
    e(108, 150, 42, 32, '#8da293') +
    e(108, 146, 33, 21, '#cad2bf'),
  whisk:
    r(98, 126, 26, 64, '#a4815c') +
    e(111, 78, 38, 56, 'none') +
    e(111, 78, 22, 56, 'none') +
    e(111, 78, 7, 56, 'none'),
  'cutting-board':
    r(35, 65, 151, 120, '#d0ad76', 22) +
    r(88, 24, 46, 60, '#d0ad76', 14) +
    e(111, 44, 8, 8, '#f3e7d2') +
    line(63, 96, 161, 96) +
    line(63, 136, 161, 136),
  apron:
    p('M79 57Q111 24 143 57L150 94L174 187Q110 206 46 187L72 93Z', '#71947b') +
    p('M82 60V27Q111 4 140 27V60', 'none') +
    r(80, 122, 65, 38, '#b7c5a0'),
  basket:
    p('M58 96Q40 26 110 24Q180 26 165 96', 'none') +
    p('M29 87H191L171 177Q111 195 48 177Z', '#c79c63') +
    line(46, 113, 177, 113) +
    line(50, 141, 174, 141) +
    line(78, 90, 82, 180) +
    line(115, 90, 115, 181) +
    line(153, 90, 145, 180),
  box:
    r(34, 82, 155, 95, '#cba26a') +
    p('M32 80L100 43L189 80L115 108Z', '#e5c58e') +
    line(115, 108, 115, 179),
  bag: p('M51 69H169L179 177Q110 197 40 177Z', '#c4a17b') + p('M78 70V42Q110 15 142 42V70', 'none'),
  table,
  chair:
    r(56, 27, 91, 79, '#c69a67') +
    p('M55 110H160L178 135H70Z', '#e4c091') +
    line(64, 132, 61, 185) +
    line(160, 132, 165, 185) +
    line(59, 86, 62, 117) +
    line(144, 86, 148, 119),
  bench:
    r(23, 64, 174, 22, '#c69a67') +
    r(23, 93, 174, 20, '#c69a67') +
    p('M22 126H198V148H22Z', '#d9b883') +
    line(44, 143, 42, 185) +
    line(175, 143, 178, 185),
  door:
    r(48, 17, 130, 185, '#896c4c') +
    r(58, 25, 110, 176, '#baa47c') +
    r(75, 44, 76, 67, '#d6c4a0') +
    r(76, 124, 74, 56, '#d6c4a0') +
    e(146, 120, 6, 6, '#debd59'),
  window:
    r(31, 30, 158, 159, '#b79565') +
    r(43, 42, 134, 135, '#b0c9c4') +
    line(109, 41, 109, 179) +
    line(42, 109, 178, 109) +
    p('M36 37L31 162L66 135L76 36M179 37L189 163L152 135L142 37', '#e8d9b5'),
  shelf:
    r(24, 40, 17, 161, '#a38059') +
    r(179, 40, 17, 161, '#a38059') +
    r(28, 50, 163, 17, '#cea56c') +
    r(28, 113, 163, 17, '#cea56c') +
    r(28, 182, 163, 17, '#cea56c'),
  drawer:
    r(36, 50, 147, 135, '#a48259') +
    r(45, 60, 128, 51, '#d3b680') +
    r(45, 121, 128, 54, '#d3b680') +
    r(93, 78, 36, 12, '#8c724e') +
    r(93, 139, 36, 12, '#8c724e'),
  lamp:
    p('M75 32H145L181 114H37Z', '#dec28a') +
    r(104, 112, 14, 59, '#a88855') +
    e(111, 176, 43, 12, '#bd9c61'),
  flower:
    p('M110 94L110 187', 'none') +
    p('M111 145Q53 108 68 157Q83 179 111 165M111 126Q159 95 163 137Q144 164 111 148', '#6e9870') +
    [0, 1, 2, 3, 4]
      .map((i) => `<g transform="rotate(${i * 72} 110 73)">${e(110, 43, 21, 29, '#dbab9b')}</g>`)
      .join('') +
    e(110, 73, 20, 20, '#e3c354'),
  tree:
    r(100, 97, 22, 97, '#9e7955') +
    e(110, 77, 67, 59, '#75966f') +
    e(68, 103, 40, 31, '#83a077') +
    e(151, 104, 42, 31, '#6a8c67'),
  leaf:
    p('M46 175Q38 46 171 27Q194 153 46 175Z', '#819d68') +
    line(46, 175, 162, 39) +
    line(85, 129, 60, 93) +
    line(102, 111, 148, 129) +
    line(121, 92, 100, 58),
  seed: e(110, 113, 48, 70, '#a6875b') + p('M110 59Q83 113 110 167', 'none'),
  'watering-can':
    r(55, 83, 106, 84, '#7e9d86') +
    p('M159 112L192 71L207 83L170 155Z', '#a5ba97') +
    p('M56 98Q17 49 63 35Q102 25 114 83', 'none') +
    e(112, 83, 51, 12, '#b5c7a7'),
  ball:
    e(110, 110, 77, 77, '#d5ba7e') +
    p('M57 51Q142 87 164 168', 'none') +
    p('M53 166Q82 77 169 53', 'none'),
  book:
    p('M110 49Q67 23 24 47V174Q67 151 110 178Q153 151 196 174V47Q152 23 110 49Z', '#d5c298') +
    line(110, 49, 110, 178) +
    line(41, 74, 90, 74) +
    line(41, 104, 90, 104) +
    line(133, 74, 179, 74) +
    line(133, 104, 179, 104),
};
await mkdir('art/vocab-source', { recursive: true });
const manifest = JSON.parse(await readFile('art/manifest.json', 'utf8'));
const newAssets = [];
for (const [id] of nouns) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" width="320" height="320"><title>${id.replaceAll('-', ' ')}</title><defs><filter id="paper"><feTurbulence type="fractalNoise" baseFrequency=".4" numOctaves="2" seed="19" result="noise"/><feColorMatrix in="noise" type="saturate" values="0" result="n"/><feComposite in="n" in2="SourceGraphic" operator="in" result="t"/><feBlend in="SourceGraphic" in2="t" mode="soft-light"/></filter></defs><g filter="url(#paper)" stroke="#6f654f" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">${shapes[id]}</g></svg>`;
  const source = `art/vocab-source/${id}.svg`,
    output = `public/assets/vocab-${id}.webp`;
  await writeFile(source, svg);
  const bytes = await sharp(Buffer.from(svg)).webp({ quality: 90 }).toBuffer();
  await writeFile(output, bytes);
  const image = sharp(bytes),
    m = await image.metadata(),
    stats = await image.stats();
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let visible = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] > 8) visible++;
  for (const [path, b, assetId, runtime] of [
    [source, Buffer.from(svg), `vocab-source-${id}`, false],
    [output, bytes, `vocab-${id}`, true],
  ]) {
    const a = {
      assetId,
      path,
      bytes: b.length,
      sha256: createHash('sha256').update(b).digest('hex'),
      runtime,
      source: 'Codex original paper-cut vector artwork; scripts/vocab-resources.mjs',
      review: 'PENDING_OWNER_AND_RIGHTS_REVIEW',
      license: 'Original project artwork, no third-party templates; owner review pending',
      derivation: runtime
        ? 'Original SVG rendered at 320px with sharp, no mirroring'
        : 'Original vector source with paper texture; no text baked in',
      format: runtime ? 'webp' : 'svg',
      ...(runtime
        ? {
            width: m.width,
            height: m.height,
            hasAlpha: m.hasAlpha,
            alphaMin: stats.channels.at(-1).min,
            alphaMax: 255,
            effectivePixels: { visible },
            edgeAlpha: [
              data[3],
              data[(info.width - 1) * 4 + 3],
              data[(info.height - 1) * info.width * 4 + 3],
              data[data.length - 1],
            ],
          }
        : {}),
    };
    newAssets.push(a);
  }
}
const extra = [
  ...nouns.map(([id, chinese, plural], i) => ({
    id,
    text: id.replaceAll('-', ' '),
    chinese,
    plural,
    group: i < 20 ? 'utensil' : 'yard',
    visual: 'object',
    context: `Bring me ${id === 'apron' ? 'an' : 'a'} ${id.replaceAll('-', ' ')}, please.`,
    image: `vocab-${id}`,
  })),
  ...attributes.map(([id, chinese]) => ({
    id,
    text: id,
    chinese,
    plural: null,
    group: 'attribute',
    visual: 'attribute',
    context:
      id in colors
        ? `Find the ${id} cup.`
        : id === 'round'
          ? 'Find the round plate.'
          : id === 'soft'
            ? 'Find the soft napkin.'
            : `Find the ${id} bowl.`,
    image: id === 'round' ? 'vocab-plate' : id === 'soft' ? 'vocab-napkin' : 'vocab-cup',
  })),
  ...numbers.map(([id, chinese], i) => ({
    id,
    text: id,
    chinese,
    plural: null,
    group: 'number',
    visual: 'number',
    context: `Put ${id} ${i === 0 ? 'cup' : 'cups'} on the table.`,
    image: 'vocab-cup',
  })),
  ...actions.map(([id, chinese, context]) => ({
    id,
    text: id,
    chinese,
    plural: null,
    group: 'action',
    visual: 'action',
    context,
    image: 'vocab-box',
  })),
  ...positions.map(([id, chinese, context]) => ({
    id,
    text: id,
    chinese,
    plural: null,
    group: 'position',
    visual: 'position',
    context,
    image: 'vocab-table',
  })),
].map((w, i) => ({
  ...w,
  audio: `vocab-name-${w.id}`,
  contextAudio: `vocab-context-${w.id}`,
  difficulty: ['action', 'position'].includes(w.group) ? 2 : 1,
  prerequisites: [
    'meaning-first',
    ...(['action', 'position'].includes(w.group) ? ['object-interaction'] : []),
  ],
  batch: `vocab-${Math.floor(i / 4)}`,
  entry: 'mini/theme',
  review: 'PENDING_TEACHING_AND_LISTENING_REVIEW',
}));
await writeFile('src/content/vocabulary-extra.json', JSON.stringify(extra, null, 2) + '\n');
const instructions = [
  ['scene-welcome', 'Touch an object. Touch a place. You can listen again.'],
  ['scene-hunt', 'Find it in the yard. Bring it to the basket.'],
  ['scene-memory', 'Look carefully. Cover the table. What is missing? You can look again.'],
  ['scene-sort', 'Put things where they belong. Some things can go in more than one place.'],
  ['scene-design', 'Make a table for our friends. You can make your own table too.'],
  ['scene-theatre', 'Help Dami. Move the things and see what happens.'],
  ['scene-cover', 'Ready? Cover the table.'],
  ['scene-relook', 'Look again. Take your time.'],
  ['scene-help', 'Watch the picture. Then try it yourself.'],
  ['scene-check', 'Ready? Show Dami.'],
  ['scene-next', 'Another little adventure.'],
  ['scene-pause', 'Take a break. Your things will wait.'],
  ['bring-cup', 'Bring me a cup, please.'],
  ['bring-spoon', 'Bring me a spoon, please.'],
  ['bring-flower', 'Bring me a flower, please.'],
  ['bring-book', 'Bring me a book, please.'],
  ['on-cup', 'Put the cup on the table.'],
  ['in-ball', 'Put the ball in the basket.'],
  ['under-ball', 'Put the ball under the table.'],
  ['beside-chair', 'Put the chair beside the table.'],
  ['open-box', 'Open the box.'],
  ['take-ball', 'Take the ball.'],
  ['put-ball', 'Put the ball in the basket.'],
  ['close-box', 'Close the box.'],
  ['pour-cup', 'Pour water into the cup.'],
  ['stir-cup', 'Stir the water.'],
  ['wash-bowl', 'Wash the bowl.'],
  ['cut-apple', 'Cut the apple.'],
  ['carry-basket', 'Carry the basket.'],
  ['share-apple', 'Share the apple.'],
  ['red-cup', 'Put the red cup on the table.'],
  ['two-cups', 'Put two cups on the table.'],
  ['big-bowl', 'Put the big bowl on the table.'],
  ['soft-napkin', 'Put the soft napkin beside the plate.'],
  ['sort-tools', 'Put the kitchen tools on the shelf.'],
  ['sort-garden', 'Put the garden things in the basket.'],
  ['sort-color', 'Put the blue things together.'],
  ['sort-round', 'Put the round things together.'],
  ['sort-food', 'Put the food in the basket.'],
  ['one-plate', 'Put one plate on the table.'],
  ['three-cups', 'Put three cups on the table.'],
  ['four-cups', 'Put four cups on the table.'],
  ['five-cups', 'Put five cups on the table.'],
  ['white-cup', 'Put the white cup beside the plate.'],
  ['small-bowl', 'Put the small bowl under the table.'],
  ['lamp-on', 'Put the lamp on the table.'],
].map(([id, text]) => ({ id: `vocab-${id}`, text, kind: 'instruction' }));
await writeFile('src/content/mini-instructions.json', JSON.stringify(instructions, null, 2) + '\n');
const speech = JSON.parse(await readFile('src/content/speech.json', 'utf8'));
const records = [
  ...extra.flatMap((w) => [
    { id: w.audio, text: w.text, kind: 'word' },
    { id: w.contextAudio, text: w.context, kind: 'request' },
  ]),
  ...instructions,
];
const temp = '/tmp/tabby-vocab-speech.aiff';
for (const record of records) {
  const path = `public/audio/${record.id}.wav`;
  execFileSync('say', ['-v', 'Samantha', '-r', '135', '-o', temp, record.text]);
  execFileSync('afconvert', ['-f', 'WAVE', '-d', 'LEI16@22050', temp, path]);
  speech[record.id] = {
    text: record.text,
    kind: record.kind,
    path: `audio/${record.id}.wav`,
    status: 'DEVELOPMENT_TTS_UNREVIEWED',
  };
  const bytes = await readFile(path);
  newAssets.push({
    assetId: `audio-${record.id}`,
    path,
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    runtime: true,
    source: 'macOS say / Samantha 135 wpm, static PCM 22050 Hz',
    review: 'PENDING_OWNER_AND_RIGHTS_REVIEW',
    license: 'Development use only; voice rights and listening review pending',
    derivation: 'scripts/vocab-resources.mjs; explicit text recorded in art/vocab-production.json',
    format: 'wav',
    audioStatus: 'DEVELOPMENT_TTS_UNREVIEWED',
  });
}
manifest.assets = manifest.assets
  .filter((a) => !newAssets.some((n) => n.assetId === a.assetId))
  .concat(newAssets);
await writeFile('src/content/speech.json', JSON.stringify(speech, null, 2) + '\n');
await writeFile('art/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
await writeFile(
  'art/vocab-production.json',
  JSON.stringify(
    {
      source: 'Original vector art and offline macOS Samantha development synthesis',
      humanListeningReview: 'NOT_RUN',
      rights: 'PENDING',
      records,
      assets: newAssets.map((a) => a.assetId),
    },
    null,
    2,
  ) + '\n',
);
console.log(
  `${extra.length} new concepts; ${nouns.length} original object images; ${records.length} real WAV clips registered.`,
);
