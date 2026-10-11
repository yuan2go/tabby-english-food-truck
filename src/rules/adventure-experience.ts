import { type AdventureState, EDIBLE, type WorldFood } from '../content/adventure';
import {
  drawerTools,
  emptyExperience,
  foodVisitor,
  needAccepts,
  returningNeed,
  TOOLS,
  visitorSeat,
  type WorldMoment,
} from '../content/adventure-experience';
import type { Command, GameState, Result } from './types';
export function hydrateExperience(a: AdventureState): void {
  a.experience ??= emptyExperience();
}
export function worldMoment(s: GameState, moment: Omit<WorldMoment, 'id' | 'at'>): void {
  const a = s.adventure;
  if (!a) return;
  hydrateExperience(a);
  if (!a.experience) return;
  a.experience.moments = [
    ...a.experience.moments,
    { ...moment, id: `${s.runId}:moment:${s.nextId++}`, at: s.gameTime },
  ].slice(-16);
}
export function experienceReady(a: AdventureState): boolean {
  const e = a.experience;
  if (!e || a.rewards.length) return true;
  return a.chapter === 0
    ? e.used.includes('water')
    : a.chapter === 1
      ? e.used.includes('compare')
      : a.chapter === 3
        ? e.used.includes('cooperate')
        : a.chapter === 4
          ? e.used.includes('share')
          : true;
}
export function experienceCommand(
  s: GameState,
  c: Extract<Command, { type: 'adventure' }>,
): { kind: Result['kind']; message: string } | null {
  const a = s.adventure;
  if (!a) return null;
  const result = (kind: Result['kind'], message: string) => ({ kind, message });
  hydrateExperience(a);
  const e = a.experience;
  if (!e) return null;
  const use = (id: (typeof e.used)[number]) => {
    if (!e.used.includes(id)) e.used.push(id);
  };
  if (c.action === 'take-tool') {
    const tool = TOOLS.find((t) => t === c.object);
    if (!tool || !drawerTools(a).includes(tool))
      return result('blocked', '先打开有这个物件的抽屉或食谱。');
    if (e.tools.includes(tool)) return result('duplicate', '这个物件已经取出了。');
    e.tools.push(tool);
    worldMoment(s, { kind: 'tool', foods: [], tool });
    return result('ok', '物件取出来了，点场景目标就能使用。');
  }
  if (c.action === 'water') {
    if (!a.steps.includes('plant') || !e.tools.includes('watering-can'))
      return result('blocked', '先种花并取出浇水壶。');
    if (e.used.includes('water')) return result('duplicate', '花已经喝过水了。');
    use('water');
    worldMoment(s, { kind: 'water', foods: [], seat: a.decor.flower, tool: 'watering-can' });
    return result('ok', '水流进花盆，花展开了，蝴蝶来到迎客的位置。');
  }
  if (c.action === 'compare') {
    const foods = a.foods.filter((f) => f.source === 'cool' || f.source.startsWith('guest-'));
    if (a.chapter !== 1 || new Set(foods.map((f) => f.product)).size < 2)
      return result('blocked', '做两种不同的实际甜点，再一起看看杯筒、球数和配料。');
    if (e.used.includes('compare')) return result('duplicate', '两种做法已经放在一起看过了。');
    use('compare');
    worldMoment(s, {
      kind: 'share',
      foods: foods.map(({ id, product }) => ({ id, product })),
      visitor: 'hedgehog',
    });
    return result('ok', '杯筒、球数或配料不同，两种甜点都可以分享。');
  }
  if (c.action === 'cooperate') {
    const visitor = c.visitor;
    const role = c.object;
    if (
      a.chapter !== 3 ||
      !visitor ||
      !['rabbit', 'hedgehog'].includes(visitor) ||
      (role !== 'cups' && role !== 'lantern') ||
      !a.steps.some((x) => x.startsWith('served:')) ||
      (role === 'lantern' && !e.tools.includes('lantern'))
    )
      return result('blocked', '先接好食品，找出灯，再选朋友和帮忙的物件。');
    if (e.helpers.some((h) => h.visitor === visitor))
      return result('duplicate', '这位朋友已经帮忙了。');
    e.helpers.push({ visitor, role });
    use('cooperate');
    worldMoment(s, {
      kind: 'cooperate',
      foods: [],
      visitor,
      ...(role === 'lantern' ? { tool: 'lantern' as const } : {}),
    });
    return result(
      'ok',
      role === 'lantern'
        ? '朋友把灯带到桌边，等你选择灯光。'
        : '朋友把杯子带到空餐位，让另一位安心备餐。',
    );
  }
  if (c.action === 'share') {
    const need = e.needs.find((n) => n.visitor === c.visitor);
    const food = a.foods.find((f) => f.id === c.item);
    if (!need || !food || food.place === 'basket')
      return result('blocked', '先邀请朋友，再选桌边真实的食品。');
    if (need.fulfilled.length || e.needs.some((n) => n.fulfilled.includes(food.id)))
      return result('duplicate', '这份分享已经留下了。');
    if (!needAccepts(need, food))
      return result('blocked', '朋友想要另一类食品。食品留着，重听或看图再选。');
    const seat = visitorSeat(need.visitor);
    if (a.foods.some((f) => f.id !== food.id && f.place === `table:${seat}`))
      return result('blocked', '这位朋友的餐位满了，先拿回桌边再安排。');
    food.place = `table:${seat}`;
    food.recipient = need.visitor;
    need.fulfilled.push(food.id);
    use('share');
    const place = `place:${seat}`;
    if (!a.steps.includes(place)) a.steps.push(place);
    worldMoment(s, {
      kind: 'share',
      foods: [{ id: food.id, product: food.product }],
      visitor: need.visitor,
      seat,
    });
    return result('ok', '你选的食品摆到朋友面前了，可以听回应、尝一口或再创作。');
  }
  return null;
}
export function addInvitationNeed(
  a: AdventureState,
  visitor: NonNullable<WorldFood['recipient']>,
): void {
  hydrateExperience(a);
  const e = a.experience;
  if (e && !e.needs.some((n) => n.visitor === visitor)) e.needs.push(returningNeed(e, visitor));
}
export function validExperience(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const e = value as NonNullable<AdventureState['experience']>;
  const list = (xs: unknown, max: number, allowed: readonly string[]): xs is string[] =>
    Array.isArray(xs) &&
    xs.length <= max &&
    new Set(xs).size === xs.length &&
    xs.every((x) => typeof x === 'string' && allowed.includes(x));
  const visitors = ['rabbit', 'hedgehog', 'elder'];
  return (
    e.version === 2 &&
    list(e.tools, 5, TOOLS) &&
    list(e.used, 4, ['water', 'compare', 'cooperate', 'share']) &&
    list(e.known, EDIBLE.length, EDIBLE) &&
    (e.picnic === null || ['rabbit', 'hedgehog'].includes(e.picnic)) &&
    Array.isArray(e.helpers) &&
    e.helpers.length <= 2 &&
    new Set(e.helpers.map((h) => h?.visitor)).size === e.helpers.length &&
    e.helpers.every(
      (h) => h && visitors.includes(h.visitor) && ['cups', 'lantern'].includes(h.role),
    ) &&
    Array.isArray(e.needs) &&
    e.needs.length <= 3 &&
    new Set(e.needs.map((n) => n?.visitor)).size === e.needs.length &&
    e.needs.every(
      (n) =>
        n &&
        visitors.includes(n.visitor) &&
        ['fruit', 'drink', 'cool', 'savory', 'any'].includes(n.kind) &&
        ['first', 'packing', 'table', 'treat'].includes(n.basis) &&
        Array.isArray(n.fulfilled) &&
        n.fulfilled.length <= 1 &&
        n.fulfilled.every((id) => typeof id === 'string' && /^food-\d+$/.test(id)),
    ) &&
    Array.isArray(e.moments) &&
    e.moments.length <= 16 &&
    new Set(e.moments.map((m) => m?.id)).size === e.moments.length &&
    e.moments.every(
      (m) =>
        m &&
        typeof m.id === 'string' &&
        m.id.length < 200 &&
        ['receive', 'place', 'taste', 'tool', 'water', 'cooperate', 'share', 'finish'].includes(
          m.kind,
        ) &&
        Number.isFinite(m.at) &&
        m.at >= 0 &&
        Array.isArray(m.foods) &&
        m.foods.length <= 12 &&
        m.foods.every((f) => f && /^food-\d+$/.test(f.id) && EDIBLE.includes(f.product)) &&
        (m.visitor === undefined || visitors.includes(m.visitor)) &&
        (m.seat === undefined || [0, 1, 2].includes(m.seat)) &&
        (m.tool === undefined || TOOLS.includes(m.tool)),
    )
  );
}
export { foodVisitor };
