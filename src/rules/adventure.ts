import {
  ADVENTURES,
  type AdventureState,
  COOL_CHOICES,
  EDIBLE,
  emptyAdventure,
  FAMILIES,
  type Visitor,
  type WorldFood,
  workSignature,
} from '../content/adventure';
import { PRODUCT_NAMES } from '../content/catalog';
import { queueActor, trayAnchor } from './actions';
import {
  addInvitationNeed,
  experienceCommand,
  experienceReady,
  foodVisitor,
  hydrateExperience,
  validExperience,
  worldMoment,
} from './adventure-experience';
import { admitAdventure } from './sessions';
import type { Command, GameState, Item, Result } from './types';

export function startAdventure(
  s: GameState,
  chapter: number,
  kind: AdventureState['kind'] = 'chapter',
): boolean {
  const config = ADVENTURES[chapter];
  if (!config || s.adventure || s.items.length || s.actor.current || s.helper) return false;
  s.adventure = emptyAdventure(chapter, kind);
  hydrateExperience(s.adventure);
  if (kind === 'shop') return true;
  s.session.activity = 'story';
  s.session.chapter = chapter;
  delete s.session.levelId;
  delete s.session.storyChoice;
  s.session.family = config.family;
  s.session.unlocked = [...FAMILIES.slice(0, Math.min(chapter + 1, 4))];
  s.mode = 'service';
  s.orders = config.orders.map((o, index) => ({
    id: `guest-${index}`,
    request: o.request,
    visitor: o.visitor,
    seat: index as 0 | 1,
    status: s.session.concurrency === 2 ? 'waiting' : 'queued',
    remaining: 0,
    heard: false,
    revisit: Boolean(s.history[o.request]?.length),
    support: s.session.support === 'demonstration' ? ['guided'] : [],
  }));
  return true;
}
export function adventureReady(a: AdventureState): boolean {
  const has = (step: string) => a.steps.includes(step);
  if (a.kind === 'shop' || !experienceReady(a)) return false;
  const twoSeats =
    !!a.rewards.length ||
    ([0, 1] as const).every((seat) => a.foods.some((f) => f.place === `table:${seat}`));
  switch (a.chapter) {
    case 0:
      return has('served:rabbit') && has('served:hedgehog') && has('plant');
    case 1:
      return has('served:rabbit') && has('cool') && has('taste') && has('bunting');
    case 2:
      return (
        has('served:rabbit') &&
        has('served:hedgehog') &&
        has('cloth') &&
        (a.branch === 'rabbit'
          ? has('unpack')
          : a.branch === 'hedgehog' && has('place:0') && has('place:1') && twoSeats)
      );
    case 3:
      return (
        has('served:rabbit') &&
        has('served:hedgehog') &&
        has('light') &&
        has('place:0') &&
        has('place:1') &&
        twoSeats
      );
    case 4:
      return (
        a.invitations.includes('rabbit') &&
        a.invitations.includes('hedgehog') &&
        has('create') &&
        (!!a.rewards.length || a.foods.some((f) => f.source.startsWith('create:') && f.tasted)) &&
        has('taste') &&
        has('save-work') &&
        ['place:0', 'place:1', 'place:2'].some(has)
      );
    default:
      return false;
  }
}
const step = (a: AdventureState, id: string) => {
  if (!a.steps.includes(id)) a.steps.push(id);
};
/** Called exactly at the domain receive phase, after removal from the kitchen. */
export function receiveAdventure(
  s: GameState,
  items: readonly Item[],
  source: string,
  visitor?: Visitor,
  batch?: string,
): void {
  if (!s.adventure || !items.length) return;
  s.adventure = structuredClone(s.adventure);
  const a = s.adventure;
  if (a.foods.some((f) => f.source === source) && source !== 'create') return;
  for (const item of items)
    if (!a.foods.some((f) => f.id === item.id))
      a.foods.push({
        id: item.id,
        product: item.product,
        source: source === 'create' ? `create:${batch ?? 'batch'}` : source,
        place:
          source === 'pack'
            ? 'basket'
            : source === 'create'
              ? 'work'
              : `guest-${visitor ?? 'hedgehog'}`,
        tasted: false,
      });
  hydrateExperience(a);
  if (a.experience)
    a.experience.known = [
      ...new Set([...a.experience.known, ...items.map((item) => item.product)]),
    ];
  worldMoment(s, {
    kind: 'receive',
    foods: items.map(({ id, product }) => ({ id, product })),
    destination:
      source === 'pack' ? 'basket' : source === 'create' || source === 'cool' ? 'work' : 'table',
    ...(visitor ? { visitor } : {}),
  });
  if (visitor) {
    step(a, `served:${visitor}`);
    if (a.chapter === 2 && a.branch === null && (visitor === 'rabbit' || visitor === 'hedgehog'))
      a.branch = visitor;
  } else step(a, source);
}
export function canReceiveAdventure(s: GameState, count: number): boolean {
  const pending = [s.actor.current, ...s.actor.queue].reduce(
    (n, j) => n + (j?.kind === 'delivery' ? j.itemIds.length : 0),
    0,
  );
  return !s.adventure || s.adventure.foods.length + pending + count <= 12;
}
export function adventureCommand(
  s: GameState,
  c: Extract<Command, { type: 'adventure' }>,
): { kind: Result['kind']; message: string } {
  const a = s.adventure;
  const result = (kind: Result['kind'], message: string) => ({ kind, message });
  if (!a) return result('blocked', '先从小院选择活动。');
  const has = (id: string) => a.steps.includes(id);
  const chapter = a.chapter;
  const complete = a.rewards.length > 0 || a.kind === 'shop';
  const experienceResult = experienceCommand(s, c);
  if (experienceResult) return experienceResult;
  if (c.action === 'welcome') {
    return admitAdventure(s, c.visitor)
      ? result('ok', '朋友来到柜台，请听听需要。')
      : result('blocked', '先服务已接的朋友，或选择双客接待。');
  }
  if (c.action === 'explore') {
    const object = c.object;
    if (!object || !['basket', 'drawer', 'recipe'].includes(object))
      return result('blocked', '这个物件暂时没有线索。');
    if (
      object === 'drawer' &&
      (chapter === 0 || chapter === 3) &&
      !complete &&
      !has('served:rabbit') &&
      !has('served:hedgehog')
    )
      return result('blocked', '先给一位朋友送好食品，再一起打开抽屉。');
    if (
      chapter === 2 &&
      ((object === 'basket' && a.branch !== 'rabbit') ||
        (object === 'drawer' && a.branch !== 'hedgehog'))
    )
      return result('blocked', '先给朋友送好第一份，再一起检查。');
    if (!a.explored.includes(object)) a.explored.push(object);
    return result(
      'ok',
      object === 'basket'
        ? '篮子里还需要一份三明治和一份水果。'
        : object === 'drawer'
          ? chapter === 0
            ? '找到花苗了。选一个位置种下吧。'
            : chapter === 3
              ? '找到灯串了。摆好两份食物，选灯光一起开灯。'
              : '抽屉里找到两个餐位。给两位朋友各摆一份。'
          : '旧食谱记着：可以换口味、品尝，也能把自己的拼盘保存到末页。',
    );
  }
  if (c.action === 'pack' || c.action === 'cool' || c.action === 'create') {
    if (c.tray !== 0 && c.tray !== 1) return result('blocked', '先选一只成品盘。');
    if (
      c.action === 'pack' &&
      (chapter !== 2 || a.branch !== 'rabbit' || !a.explored.includes('basket'))
    )
      return result('blocked', '先检查兔兔的篮子。');
    if (c.action === 'cool' && chapter !== 1) return result('blocked', '这个活动没有甜点委托。');
    if (c.action === 'create' && !complete && chapter !== 4)
      return result('blocked', '先完成共同活动，再做自己的作品。');
    if (
      c.action !== 'create' &&
      (has(c.action) ||
        [s.actor.current, ...s.actor.queue].some((j) => j?.worldTarget === c.action))
    )
      return result('blocked', '这一份已经送出。');
    if (
      s.trays[c.tray].remaining ||
      s.helper?.tray === c.tray ||
      Object.values(s.routing).some((t) => t && 'tray' in t && t.tray === c.tray) ||
      s.actor.queue.length >= 3
    )
      return result('blocked', '这只盘还在工作，等好或换一只盘。');
    const items = s.items.filter((i) => i.location.startsWith(`tray:${c.tray}:`));
    if (!items.length || (c.action === 'pack' && items.length < 2))
      return result('incomplete', '盘里还没准备齐，食物留在原处。');
    const products = items.map((i) => i.product);
    const valid =
      c.action === 'pack'
        ? products.length === 2 &&
          products.some((p) => ['sandwich', 'salad-sandwich'].includes(p)) &&
          products.some((p) => p === 'apple' || p === 'banana')
        : c.action === 'cool'
          ? products.length === 1 && COOL_CHOICES.includes(products[0] as WorldFood['product'])
          : products.length <= 3 && products.every((p) => EDIBLE.includes(p));
    if (!valid)
      return result(
        'blocked',
        c.action === 'pack'
          ? '篮子需要一份三明治和一份苹果或香蕉，食物留在盘里。'
          : c.action === 'cool'
            ? '可选一杯香草、草莓、双球或香蕉冰淇淋。其他食物留在盘里。'
            : '先把可吃的食品做好，最多放三份。',
      );
    if (!canReceiveAdventure(s, items.length))
      return result('blocked', '活动桌满了。保存作品后收拾桌面再做。');
    const duration = queueActor(
      s,
      'delivery',
      `world-${s.nextId++}`,
      [
        { point: trayAnchor(c.tray, s.mode), pose: 'reach', hold: 220, event: 'lift' },
        { point: { x: 0.5, y: 0.34 }, pose: 'place', hold: 360, event: 'receive' },
        { point: trayAnchor(c.tray, s.mode), pose: 'place', hold: 220, event: 'return' },
      ],
      items.map((i) => i.id),
      c.tray,
    );
    const job = s.actor.queue.at(-1) ?? s.actor.current;
    if (job) job.worldTarget = c.action;
    for (const i of items)
      i.location = `delivery:${c.tray}:${i.location.split(':')[2]}` as Item['location'];
    s.trays[c.tray].remaining = duration;
    return result(
      'ok',
      c.action === 'pack'
        ? '大咪正把整盘装进野餐篮。'
        : c.action === 'cool'
          ? '大咪把你选的口味带到树荫下。'
          : '大咪正把你的作品带到活动桌。',
    );
  }
  if (c.action === 'place') {
    if (c.seat !== 0 && c.seat !== 1 && c.seat !== 2) return result('blocked', '选一个可见餐位。');
    if (!complete && chapter === 2 && (a.branch !== 'hedgehog' || !a.explored.includes('drawer')))
      return result('blocked', '先打开刺刺的摆餐抽屉。');
    if (!complete && chapter === 3 && !a.explored.includes('drawer'))
      return result('blocked', '先打开灯串抽屉。');
    const food = a.foods.find((f) => f.id === c.item);
    if (!food || food.place === 'basket') return result('blocked', '先把食物真正送到活动桌。');
    if (a.foods.some((f) => f.id !== food.id && f.place === `table:${c.seat}`))
      return result('blocked', '这个餐位有食物了，换一个位置。');
    if (
      a.chapter === 2 &&
      a.branch === 'hedgehog' &&
      !complete &&
      !a.experience?.tools.includes('mat')
    )
      return result('blocked', '先从抽屉取出餐垫，找到摆餐的位置。');
    food.place = `table:${c.seat}`;
    food.recipient = c.seat === 0 ? 'rabbit' : c.seat === 1 ? 'hedgehog' : 'elder';
    worldMoment(s, {
      kind: 'place',
      foods: [{ id: food.id, product: food.product }],
      seat: c.seat,
      visitor: foodVisitor(food),
    });
    step(a, `place:${c.seat}`);
    return result('ok', `食物摆在${c.seat + 1}号餐位。`);
  }
  if (c.action === 'pickup') {
    const food = a.foods.find((f) => f.id === c.item);
    if (!food || !food.place.startsWith('table:')) return result('blocked', '先选桌上的一份食品。');
    food.place = 'work';
    return result('ok', `${PRODUCT_NAMES[food.product]}拿回桌边了，可以重新选餐位。`);
  }
  if (c.action === 'taste') {
    if (c.visitor !== undefined && !['rabbit', 'hedgehog', 'elder'].includes(c.visitor))
      return result('blocked', '请选择场景里的朋友。');
    const food = a.foods.find((f) => f.id === c.item);
    if (!food || food.place === 'basket') return result('blocked', '先把一份食物带到桌边。');
    if (food.tasted) return result('duplicate', '这份已经尝过。');
    food.tasted = true;
    food.tastedBy = food.recipient ?? c.visitor ?? foodVisitor(food);
    worldMoment(s, {
      kind: 'taste',
      foods: [{ id: food.id, product: food.product }],
      visitor: food.tastedBy,
      ...(food.place.startsWith('table:')
        ? { seat: Number(food.place.slice(-1)) as 0 | 1 | 2 }
        : {}),
    });
    step(a, 'taste');
    return result(
      'ok',
      `朋友尝到了你选的${PRODUCT_NAMES[food.product]}，这个味道留在今天的食谱里。`,
    );
  }
  if (c.action === 'save-work') {
    const source = a.foods.filter((f) => f.source.startsWith('create:')).at(-1)?.source;
    const foods = a.foods.filter((f) => f.source === source);
    if (!foods.length) return result('blocked', '先把自己的拼盘送到桌边。');
    const signature = workSignature(foods);
    if (a.works.some((w) => w.signature === signature))
      return result('duplicate', '这个作品已经留在食谱里。');
    a.works = [
      ...a.works,
      { id: `${s.runId}:work:${s.nextId++}`, foods: structuredClone(foods), signature },
    ].slice(-8);
    step(a, 'save-work');
    return result('ok', '食谱保存了实际食物、位置和品尝记忆。');
  }
  if (c.action === 'clear-table') {
    if (!complete && a.chapter !== 4) return result('blocked', '先把今天的共同活动完成。');
    if (!c.confirmed) return result('confirm', '收拾后食品不会回到营业库存。先保存想留下的作品。');
    const removed = new Set(
      a.foods.filter((f) => complete || f.source.startsWith('create:')).map((f) => f.id),
    );
    a.foods = a.foods.filter((f) => !removed.has(f.id));
    if (a.experience) {
      for (const need of a.experience.needs)
        need.fulfilled = need.fulfilled.filter((id) => !removed.has(id));
      if (!complete && !a.experience.needs.some((n) => n.fulfilled.length))
        a.experience.used = a.experience.used.filter((x) => x !== 'share');
    }
    return result('ok', '桌面收拾好了，食谱作品保留，可以继续创作。');
  }
  if (c.action === 'invite') {
    if (!['rabbit', 'hedgehog', 'elder'].includes(c.visitor ?? ''))
      return result('blocked', '选一位熟悉的朋友。');
    if (chapter !== 4 && !complete) return result('blocked', '先完成活动再邀请回访。');
    if (!a.invitations.includes(c.visitor as Visitor)) a.invitations.push(c.visitor as Visitor);
    addInvitationNeed(a, c.visitor as Visitor);
    return result('ok', '朋友带着之前的小院记忆来赴约，也有新的分享需要。');
  }
  if (c.action === 'plant') {
    if (
      (chapter !== 0 && !complete) ||
      (!a.explored.includes('drawer') && !complete) ||
      ![0, 1, 2].includes(Number(c.seat))
    )
      return result('blocked', '先在抽屉找花苗，再选花的位置。');
    if (!complete && !a.experience?.tools.includes('seed'))
      return result('blocked', '先把花苗从抽屉取出来。');
    a.decor.flower = c.seat as 0 | 1 | 2;
    step(a, 'plant');
    return result('ok', '迎客花种好了，它让早餐桌有了新的位置。');
  }
  if (c.action === 'bunting') {
    if (
      (chapter !== 1 && !complete) ||
      (!complete && (!has('cool') || !has('taste'))) ||
      (!a.explored.includes('recipe') && !complete) ||
      !['warm', 'cool'].includes(c.value ?? '')
    )
      return result('blocked', '先翻旧食谱，再选彩旗颜色。');
    // The first flag installation opens the shaded sharing table. Recolouring is presentation.
    if (chapter === 1 && !has('bunting')) {
      const desserts = a.foods.filter((f) => f.source === 'cool' || f.source.startsWith('guest-'));
      desserts.slice(0, 2).forEach((f, seat) => {
        f.place = `table:${seat as 0 | 1}`;
        f.recipient = seat === 0 ? 'rabbit' : 'hedgehog';
      });
      worldMoment(s, {
        kind: 'place',
        destination: 'table',
        foods: desserts.map((f) => ({
          id: f.id,
          product: f.product,
          visitor: f.recipient ?? foodVisitor(f),
        })),
      });
    }
    a.decor.bunting = c.value as 'warm' | 'cool';
    step(a, 'bunting');
    return result('ok', '彩旗挂好了，朋友可以在这里分享甜点。');
  }
  if (c.action === 'unpack') {
    if (chapter !== 2 || a.branch !== 'rabbit' || !has('pack'))
      return result('blocked', '先把野餐篮补齐。');
    const foods = a.foods.filter((f) => f.place === 'basket');
    if (!foods.length) return result('duplicate', '篮子已经放到桌上了。');
    foods.forEach((f, i) => {
      f.place = `table:${i as 0 | 1}`;
      f.recipient = i === 0 ? 'rabbit' : 'hedgehog';
    });
    worldMoment(s, {
      kind: 'place',
      destination: 'table',
      foods: foods.map((f) => ({
        id: f.id,
        product: f.product,
        visitor: f.recipient ?? foodVisitor(f),
      })),
    });
    step(a, 'unpack');
    return result('ok', '篮子打开了，实际打包的两份食品摆到桌边。');
  }
  if (c.action === 'cloth') {
    if ((chapter !== 2 && !complete) || !['leaf', 'sun'].includes(c.value ?? ''))
      return result('blocked', '选一张野餐桌布。');
    if (!complete && !(a.branch === 'rabbit' ? has('unpack') : has('place:0') && has('place:1')))
      return result('blocked', '先把两份食物摆好，再铺桌布。');
    a.decor.cloth = c.value as 'leaf' | 'sun';
    step(a, 'cloth');
    return result('ok', '桌布铺好了，大家有了可以围坐的野餐桌。');
  }
  if (c.action === 'light') {
    if (
      (chapter !== 3 && !complete) ||
      (!a.explored.includes('drawer') && !complete) ||
      !['warm', 'moon'].includes(c.value ?? '')
    )
      return result('blocked', '先找到灯串，再选择灯光。');
    if (!complete && !a.experience?.tools.includes('lantern'))
      return result('blocked', '先取出灯，让朋友帮忙带到桌边。');
    a.decor.light = c.value as 'warm' | 'moon';
    step(a, 'light');
    return result('ok', '灯亮了，晚餐桌等着朋友围坐。');
  }
  if (c.action === 'finish') {
    if (!adventureReady(a)) return result('blocked', '大家还没准备好，继续看看场景里能做什么。');
    const reward = ADVENTURES[chapter]?.reward;
    if (!reward) return result('blocked', '今天是自由开店。');
    if (a.rewards.includes(reward)) return result('duplicate', '这页活动已经记下了。');
    a.rewards.push(reward);
    if (a.chapter === 2 && a.experience) a.experience.picnic = a.branch;
    for (const food of a.foods) {
      if (!food.tasted && food.place !== 'basket') {
        food.tasted = true;
        food.tastedBy = food.recipient ?? foodVisitor(food);
      }
    }
    worldMoment(s, {
      kind: 'finish',
      foods: a.foods
        .filter((f) => f.place !== 'basket')
        .map((food) => ({
          id: food.id,
          product: food.product,
          visitor: food.tastedBy ?? foodVisitor(food),
        })),
      destination: 'table',
    });
    return result('ok', '大家一起开席！可以继续做作品、布置，或自然收摊。');
  }
  return result('blocked', '这个动作还没开放。');
}

/** Shared by snapshot/profile validation; a save may not forge completion. */
export function validAdventure(v: unknown): v is AdventureState {
  if (!v || typeof v !== 'object') return false;
  const a = v as AdventureState;
  const list = (v: unknown, max: number): v is string[] =>
    Array.isArray(v) &&
    v.length <= max &&
    v.every((x) => typeof x === 'string' && x.length > 0 && x.length < 160) &&
    new Set(v).size === v.length;
  const food = (f: WorldFood) =>
    f &&
    /^food-\d+$/.test(f.id) &&
    EDIBLE.includes(f.product) &&
    typeof f.source === 'string' &&
    f.source.length < 100 &&
    [
      'guest-rabbit',
      'guest-hedgehog',
      'guest-elder',
      'basket',
      'work',
      'table:0',
      'table:1',
      'table:2',
    ].includes(f.place) &&
    typeof f.tasted === 'boolean' &&
    (f.tastedBy === undefined ||
      (f.tasted && ['rabbit', 'hedgehog', 'elder'].includes(f.tastedBy))) &&
    (f.recipient === undefined || ['rabbit', 'hedgehog', 'elder'].includes(f.recipient));
  return (
    (a.experience === undefined || validExperience(a.experience)) &&
    Number.isInteger(a.chapter) &&
    a.chapter >= 0 &&
    a.chapter < 5 &&
    ['chapter', 'shop'].includes(a.kind) &&
    (a.branch === null || a.branch === 'rabbit' || a.branch === 'hedgehog') &&
    list(a.explored, 3) &&
    a.explored.every((x) => ['basket', 'drawer', 'recipe'].includes(x)) &&
    list(a.steps, 24) &&
    a.steps.every((x) =>
      [
        'served:rabbit',
        'served:hedgehog',
        'served:elder',
        'plant',
        'cool',
        'pack',
        'unpack',
        'place:0',
        'place:1',
        'place:2',
        'taste',
        'bunting',
        'cloth',
        'light',
        'create',
        'save-work',
      ].includes(x),
    ) &&
    list(a.rewards, 1) &&
    a.rewards.every((r) => r === ADVENTURES[a.chapter]?.reward) &&
    (!a.rewards.length || adventureReady(a)) &&
    Array.isArray(a.foods) &&
    a.foods.length <= 12 &&
    a.foods.every(food) &&
    new Set(a.foods.map((f) => f.id)).size === a.foods.length &&
    Array.isArray(a.works) &&
    a.works.length <= 8 &&
    a.works.every(
      (w) =>
        w &&
        typeof w.id === 'string' &&
        w.id.length < 160 &&
        Array.isArray(w.foods) &&
        w.foods.length > 0 &&
        w.foods.length <= 3 &&
        w.foods.every(food) &&
        w.signature === workSignature(w.foods),
    ) &&
    !!a.decor &&
    [0, 1, 2].includes(a.decor.flower) &&
    ['warm', 'cool'].includes(a.decor.bunting) &&
    ['leaf', 'sun'].includes(a.decor.cloth) &&
    ['warm', 'moon'].includes(a.decor.light) &&
    list(a.invitations, 3) &&
    a.invitations.every((x) => ['rabbit', 'hedgehog', 'elder'].includes(x))
  );
}

export function openCommission(a: AdventureState | null): {
  action: 'pack' | 'cool' | 'create';
  label: string;
  choices: readonly WorldFood['product'][];
} | null {
  if (!a) return null;
  if (a.kind === 'shop' || a.rewards.length || a.chapter === 4)
    return { action: 'create', label: '带作品到活动桌', choices: EDIBLE };
  if (a.chapter === 1 && !a.steps.includes('cool'))
    return { action: 'cool', label: '送去树荫分享', choices: COOL_CHOICES };
  if (
    a.chapter === 2 &&
    a.branch === 'rabbit' &&
    a.explored.includes('basket') &&
    !a.steps.includes('pack')
  )
    return {
      action: 'pack',
      label: '装进野餐篮',
      choices: ['sandwich', 'salad-sandwich', 'apple', 'banana'],
    };
  return null;
}
export function activityHint(a: AdventureState): string {
  if (a.kind === 'shop') return '选择喜欢的菜单，服务朋友，也可以自由做作品。';
  if (a.rewards.length) return '活动已经开席。继续制作、布置，或收摊回小院。';
  if (a.chapter === 2)
    return a.branch === null
      ? '两位朋友都在等。先成功送给谁，就一起做谁的准备。'
      : a.branch === 'rabbit'
        ? '兔兔先收到啦：检查篮子，补齐三明治与水果，再摆上桌。'
        : '刺刺先收到啦：打开抽屉，给两位朋友各摆一份。';
  return ADVENTURES[a.chapter]?.goal ?? '';
}
