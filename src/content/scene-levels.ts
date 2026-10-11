export type SceneKind = 'hunt' | 'memory' | 'sort' | 'design' | 'theatre';
export type ScenePlace =
  | 'bank'
  | 'hand'
  | 'basket'
  | 'table'
  | 'shelf'
  | 'garden'
  | 'kitchen'
  | 'on'
  | 'under'
  | 'in'
  | 'beside'
  | 'box'
  | 'sink'
  | 'board'
  | 'patio'
  | 'guest';
export interface SceneObject {
  id: string;
  word: string;
  place: ScenePlace;
  state: string;
  color?: string;
  size?: 'big' | 'small';
}
export interface SceneTask {
  instruction: string;
  audio: string;
  words: string[];
  objects: readonly SceneObject[];
  targets?: readonly string[];
  missing?: readonly string[];
  legal?: Readonly<Record<string, readonly ScenePlace[]>>;
  arrangement?: readonly {
    word?: string;
    id?: string;
    place: ScenePlace;
    count: number;
    color?: string;
    size?: string;
    reference?: string;
  }[];
  goal?: { object: string; state?: string; place?: ScenePlace };
}
export interface SceneLevel {
  id: string;
  kind: SceneKind;
  stage: 'entry' | 'variation' | 'revisit';
  title: string;
  scene: string;
  tasks: readonly SceneTask[];
}
const obj = (
  word: string,
  place: ScenePlace = 'bank',
  state = 'whole',
  id = word,
  color?: string,
  size?: 'big' | 'small',
): SceneObject => ({
  id,
  word,
  place,
  state,
  ...(color ? { color } : {}),
  ...(size ? { size } : {}),
});
const t = (
  instruction: string,
  _audio: string,
  words: string[],
  objects: SceneObject[],
  rest: Omit<SceneTask, 'instruction' | 'audio' | 'words' | 'objects'>,
): SceneTask => ({
  instruction,
  audio: `vocab-task-${[...instruction].reduce((n, c) => Math.imul(n ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261).toString(16)}`,
  words,
  objects,
  ...rest,
});
const hunt = (word: string, others: string[], audio: string, place: ScenePlace = 'garden') =>
  t(
    `Bring me a ${word.replaceAll('-', ' ')}, please.`,
    audio,
    [word],
    [obj(word, place), ...others.map((w) => obj(w, place === 'garden' ? 'shelf' : 'garden'))],
    { targets: [word] },
  );
const memory = (
  words: string[],
  missing: string[],
  instruction = 'Look carefully. What is missing?',
) =>
  t(
    instruction,
    'scene-memory',
    words,
    [
      ...words.map((w) => obj(w, 'table')),
      ...['spoon', 'book', 'apple', 'ball']
        .filter((w) => !words.includes(w))
        .slice(0, 2)
        .map((w) => obj(w, 'bank')),
    ],
    { missing },
  );
const sort = (words: string[], legal: Record<string, ScenePlace[]>, audio: string) =>
  t(
    audio === 'sort-round'
      ? 'Put round things together. Put other shapes on the shelf.'
      : audio === 'scene-sort'
        ? 'Put things in the kitchen or garden. Some things can go in either place. Put books on the shelf.'
        : 'Put kitchen tools on the shelf, plants in the garden, and food in the basket.',
    audio,
    words,
    words.map((w) => obj(w)),
    { legal },
  );
const design = (
  instruction: string,
  _audio: string,
  words: string[],
  objects: SceneObject[],
  arrangement: NonNullable<SceneTask['arrangement']>,
) => t(instruction, _audio, words, objects, { arrangement });
const theatre = (
  instruction: string,
  _audio: string,
  words: string[],
  objects: SceneObject[],
  goal: NonNullable<SceneTask['goal']>,
) => t(instruction, _audio, words, objects, { goal });
const playroom = [
  obj('box', 'on', 'closed'),
  obj('ball', 'box'),
  obj('basket', 'on', 'open'),
  obj('book', 'on'),
];
const tea = [
  obj('cup', 'bank', 'empty'),
  obj('jug', 'bank', 'filled'),
  obj('spoon'),
  obj('bowl', 'bank', 'dirty'),
];
const picnic = [
  obj('apple', 'bank', 'whole'),
  obj('knife'),
  obj('basket', 'on', 'open'),
  obj('napkin'),
];
export const SCENE_LEVELS: readonly SceneLevel[] = [
  {
    id: 'hunt-0',
    kind: 'hunt',
    stage: 'entry',
    title: '小院寻物 · 帮大咪拿东西',
    scene: '清楚可见的物件在花园和木架上，拿起后交给篮子。',
    tasks: [
      hunt('cup', ['spoon', 'flower'], 'bring-cup'),
      hunt('spoon', ['cup', 'book'], 'bring-spoon'),
      hunt('flower', ['leaf', 'ball'], 'bring-flower'),
    ],
  },
  {
    id: 'hunt-1',
    kind: 'hunt',
    stage: 'variation',
    title: '小院寻物 · 换个地方找',
    scene: '柜台和花园两处一起找。物件位置改变，名字相同。',
    tasks: [
      hunt('book', ['box', 'bag'], 'bring-book', 'shelf'),
      hunt('flower', ['tree', 'leaf'], 'bring-flower', 'shelf'),
      t(
        'Find the red cup.',
        'context-red',
        ['red', 'cup'],
        [
          obj('cup', 'garden', 'whole', 'red-cup', 'red'),
          obj('cup', 'shelf', 'whole', 'blue-cup', 'blue'),
          obj('plate', 'shelf'),
        ],
        { targets: ['red-cup'] },
      ),
    ],
  },
  {
    id: 'hunt-2',
    kind: 'hunt',
    stage: 'revisit',
    title: '小院寻物 · 朋友的两份心意',
    scene: '一次带一件，凑齐两件再交付；不是比手快。',
    tasks: [
      t(
        'Bring me a cup and a spoon, please.',
        'scene-hunt',
        ['cup', 'spoon'],
        [obj('cup', 'shelf'), obj('spoon', 'garden'), obj('bowl', 'shelf')],
        { targets: ['cup', 'spoon'] },
      ),
      hunt('book', ['leaf', 'ball'], 'bring-book'),
      hunt('flower', ['cup', 'spoon'], 'bring-flower'),
    ],
  },
  {
    id: 'memory-0',
    kind: 'memory',
    stage: 'entry',
    title: '餐桌少了什么 · 看看两件',
    scene: '你决定什么时候盖上桌布，也可以再看。',
    tasks: [
      memory(['cup', 'plate'], ['cup']),
      memory(['spoon', 'bowl'], ['bowl']),
      memory(['flower', 'book'], ['flower']),
    ],
  },
  {
    id: 'memory-1',
    kind: 'memory',
    stage: 'variation',
    title: '餐桌少了什么 · 两处空位',
    scene: '看三件东西，补回一个或两个空位；位置不是答案。',
    tasks: [
      memory(['cup', 'spoon', 'napkin'], ['cup', 'napkin']),
      memory(['apple', 'banana', 'plate'], ['banana']),
      memory(['ball', 'book', 'flower'], ['book', 'flower']),
    ],
  },
  {
    id: 'memory-2',
    kind: 'memory',
    stage: 'revisit',
    title: '餐桌少了什么 · 野餐再相见',
    scene: '已见过的物件回到餐桌，比较这一轮真实变化。',
    tasks: [
      memory(['basket', 'bottle', 'glass', 'napkin'], ['glass']),
      memory(['spoon', 'fork', 'bowl', 'plate'], ['fork', 'plate']),
      memory(['leaf', 'seed', 'flower', 'watering-can'], ['seed']),
    ],
  },
  {
    id: 'sort-0',
    kind: 'sort',
    stage: 'entry',
    title: '小仓库整理 · 厨房与花园',
    scene: '木架收厨房工具，绿篮收花园物件，食物收野餐篮。',
    tasks: [
      sort(
        ['cup', 'spoon', 'flower'],
        { cup: ['shelf'], spoon: ['shelf'], flower: ['garden'] },
        'sort-tools',
      ),
      sort(
        ['apple', 'plate', 'leaf'],
        { apple: ['basket'], plate: ['shelf'], leaf: ['garden'] },
        'sort-food',
      ),
      sort(
        ['bowl', 'fork', 'seed'],
        { bowl: ['shelf'], fork: ['shelf'], seed: ['garden'] },
        'sort-garden',
      ),
    ],
  },
  {
    id: 'sort-1',
    kind: 'sort',
    stage: 'variation',
    title: '小仓库整理 · 一物多用',
    scene: '篮子可以去厨房，也可以去花园，两种合理摆法都接受。',
    tasks: [
      sort(
        ['basket', 'jug', 'watering-can'],
        { basket: ['garden', 'kitchen'], jug: ['kitchen', 'garden'], 'watering-can': ['garden'] },
        'scene-sort',
      ),
      sort(
        ['bag', 'napkin', 'leaf'],
        { bag: ['garden', 'kitchen'], napkin: ['kitchen'], leaf: ['garden'] },
        'scene-sort',
      ),
      sort(
        ['box', 'bottle', 'book'],
        { box: ['garden', 'kitchen'], bottle: ['garden', 'kitchen'], book: ['shelf'] },
        'scene-sort',
      ),
    ],
  },
  {
    id: 'sort-2',
    kind: 'sort',
    stage: 'revisit',
    title: '小仓库整理 · 看颜色和形状',
    scene: '这一轮按属性收，不按以前的位置。可反复拿回。',
    tasks: [
      t(
        'Put blue things together. Put other colors in the other basket.',
        'sort-color',
        ['blue', 'red', 'cup', 'bowl'],
        [
          obj('cup', 'bank', 'whole', 'blue-cup', 'blue'),
          obj('bowl', 'bank', 'whole', 'blue-bowl', 'blue'),
          obj('cup', 'bank', 'whole', 'red-cup', 'red'),
        ],
        { legal: { 'blue-cup': ['garden'], 'blue-bowl': ['garden'], 'red-cup': ['kitchen'] } },
      ),
      sort(
        ['plate', 'ball', 'book'],
        { plate: ['garden'], ball: ['garden'], book: ['shelf'] },
        'sort-round',
      ),
      sort(
        ['spoon', 'fork', 'flower'],
        { spoon: ['shelf'], fork: ['shelf'], flower: ['garden'] },
        'sort-tools',
      ),
    ],
  },
  {
    id: 'design-0',
    kind: 'design',
    stage: 'entry',
    title: '餐桌设计师 · 上下里面旁边',
    scene: '真正把物件放到桌上、桌下、篮内或桌边。也可以自由摆。',
    tasks: [
      design(
        'Put the cup on the table.',
        'on-cup',
        ['cup', 'on', 'table'],
        [obj('cup'), obj('ball')],
        [{ id: 'cup', place: 'on', count: 1 }],
      ),
      design(
        'Put the ball in the basket.',
        'in-ball',
        ['ball', 'in', 'basket'],
        [obj('ball'), obj('cup')],
        [{ id: 'ball', place: 'in', count: 1 }],
      ),
      design(
        'Put the ball under the table.',
        'under-ball',
        ['ball', 'under', 'table'],
        [obj('ball'), obj('cup')],
        [{ id: 'ball', place: 'under', count: 1 }],
      ),
      design(
        'Put the chair beside the table.',
        'beside-chair',
        ['chair', 'beside', 'table'],
        [obj('chair'), obj('lamp')],
        [{ id: 'chair', place: 'beside', count: 1 }],
      ),
    ],
  },
  {
    id: 'design-1',
    kind: 'design',
    stage: 'variation',
    title: '餐桌设计师 · 几位朋友',
    scene: '按实际份数摆杯子。物件可以拿回，不按摆放顺序评分。',
    tasks: [1, 2, 3, 4, 5].map((count) =>
      design(
        `Put ${['one', 'two', 'three', 'four', 'five'][count - 1]} ${count === 1 ? 'cup' : 'cups'} on the table.`,
        ['one-plate', 'two-cups', 'three-cups', 'four-cups', 'five-cups'][count - 1] ?? 'two-cups',
        ['cup', ['one', 'two', 'three', 'four', 'five'][count - 1] ?? 'one', 'on'],
        Array.from({ length: 5 }, (_, i) => obj('cup', 'bank', 'whole', `cup-${i}`)),
        [{ word: 'cup', place: 'on', count }],
      ),
    ),
  },
  {
    id: 'design-2',
    kind: 'design',
    stage: 'revisit',
    title: '餐桌设计师 · 花色与大小',
    scene: '观察属性再摆。每次只改变颜色、大小或位置中的一个。',
    tasks: [
      design(
        'Put the red cup on the table.',
        'red-cup',
        ['red', 'cup', 'on'],
        [
          obj('cup', 'bank', 'whole', 'red-cup', 'red'),
          obj('cup', 'bank', 'whole', 'blue-cup', 'blue'),
        ],
        [{ word: 'cup', place: 'on', count: 1, color: 'red' }],
      ),
      design(
        'Put the big bowl on the table.',
        'big-bowl',
        ['big', 'small', 'bowl'],
        [
          obj('bowl', 'bank', 'whole', 'big-bowl', undefined, 'big'),
          obj('bowl', 'bank', 'whole', 'small-bowl', undefined, 'small'),
        ],
        [{ word: 'bowl', place: 'on', count: 1, size: 'big' }],
      ),
      design(
        'Put the white cup beside the plate.',
        'white-cup',
        ['white', 'cup', 'beside', 'plate'],
        [
          obj('cup', 'bank', 'whole', 'white-cup', 'white'),
          obj('cup', 'bank', 'whole', 'black-cup', 'black'),
          obj('plate', 'on'),
        ],
        [{ word: 'cup', place: 'beside', count: 1, color: 'white', reference: 'plate' }],
      ),
      design(
        'Put the soft napkin beside the plate.',
        'soft-napkin',
        ['soft', 'napkin', 'beside'],
        [obj('napkin'), obj('book'), obj('plate', 'on')],
        [{ id: 'napkin', place: 'beside', count: 1, reference: 'plate' }],
      ),
    ],
  },
  {
    id: 'theatre-0',
    kind: 'theatre',
    stage: 'entry',
    title: '大咪动作小剧场 · 盒子里的球',
    scene: '盒子关着时拿不到球。打开、拿出、放好，再关上，物件真的改变。',
    tasks: [
      theatre('Open the box.', 'open-box', ['open', 'box'], playroom, {
        object: 'box',
        state: 'open',
      }),
      theatre('Take the ball.', 'take-ball', ['take', 'ball'], playroom, {
        object: 'ball',
        place: 'hand',
      }),
      theatre('Put the ball in the basket.', 'put-ball', ['put', 'in', 'basket'], playroom, {
        object: 'ball',
        place: 'in',
      }),
      theatre('Close the box.', 'close-box', ['close', 'box'], playroom, {
        object: 'box',
        state: 'closed',
      }),
    ],
  },
  {
    id: 'theatre-1',
    kind: 'theatre',
    stage: 'variation',
    title: '大咪动作小剧场 · 朋友的水杯',
    scene: '先摆杯，再拿壶倒水，换勺搅拌；清洗脏碗。顺序由物件前置决定。',
    tasks: [
      theatre('Put the cup on the table.', 'on-cup', ['put', 'cup', 'on'], tea, {
        object: 'cup',
        place: 'on',
      }),
      theatre('Pour water into the cup.', 'pour-cup', ['pour', 'jug', 'cup'], tea, {
        object: 'cup',
        state: 'filled',
      }),
      theatre('Stir the water.', 'stir-cup', ['stir', 'spoon'], tea, {
        object: 'cup',
        state: 'stirred',
      }),
      theatre('Wash the bowl.', 'wash-bowl', ['wash', 'bowl'], tea, {
        object: 'bowl',
        state: 'clean',
      }),
    ],
  },
  {
    id: 'theatre-2',
    kind: 'theatre',
    stage: 'revisit',
    title: '大咪动作小剧场 · 带去分享',
    scene: '苹果要放砧板，拿餐刀切好，再带篮子到院里分享；未切分不能分享。',
    tasks: [
      theatre('Cut the apple.', 'cut-apple', ['cut', 'apple', 'knife'], picnic, {
        object: 'apple',
        state: 'cut',
      }),
      theatre('Carry the basket.', 'carry-basket', ['carry', 'basket'], picnic, {
        object: 'basket',
        place: 'patio',
      }),
      theatre('Share the apple.', 'share-apple', ['share', 'apple'], picnic, {
        object: 'apple',
        place: 'guest',
      }),
    ],
  },
];
export const sceneLevel = (id: string) => SCENE_LEVELS.find((l) => l.id === id);
export const SCENE_NAMES: Record<SceneKind, string> = {
  hunt: '小院寻物',
  memory: '餐桌少了什么',
  sort: '小仓库整理',
  design: '餐桌设计师',
  theatre: '大咪动作小剧场',
};
