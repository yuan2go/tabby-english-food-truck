import { FOOD_GROUPS, NEED_AUDIO, needAccepts, visitorSeat } from '../content/adventure-experience';
import { REQUESTS } from '../content/catalog';
import type { Product } from '../content/recipes';
import { adventureReady, openCommission } from './adventure';
import type { Command, GameState } from './types';
export interface ActivityGuidance {
  id: string;
  from: string;
  to: string;
  audio: string;
  label: string;
  target: string;
  products: readonly Product[];
  select?: string;
}
export type ActivityCommand = Omit<Extract<Command, { type: 'adventure' }>, 'type'>;
/** Explain a rejected action from the same live inventory; this projection never accepts it. */
export function activityObstacle(s: GameState, c: ActivityCommand): ActivityGuidance {
  const a = s.adventure;
  if (!a) return activityGuidance(s);
  const food = a.foods.find((f) => f.id === c.item);
  const need = a.experience?.needs.find((n) => n.visitor === c.visitor);
  const guide = (
    id: string,
    from: string,
    to: string,
    label: string,
    target: string,
    products: readonly Product[] = [],
    select?: string,
  ): ActivityGuidance => ({
    id,
    from,
    to,
    label,
    target,
    products,
    ...(select ? { select } : {}),
    audio: `world-${id}`,
  });
  if (food?.place === 'basket')
    return guide('unpack', 'basket', 'table', '食品还在篮子里，先打开摆上桌。', 'unpack');
  if (c.action === 'share' && food?.tasted)
    return guide(
      'fresh',
      'taste',
      'kitchen',
      '这份已尝过，留在作品里，再做一份新的分享。',
      'kitchen',
      [food.product],
    );
  if (c.action === 'share' && food && need && !needAccepts(need, food))
    return {
      ...guide(
        'choice',
        'ear',
        'friend',
        '食品留在原处。听朋友需要，再选这一类的食品。',
        'share',
        FOOD_GROUPS[need.kind].slice(0, 2),
      ),
      audio: NEED_AUDIO[need.kind],
    };
  if (c.action === 'place' || c.action === 'share') {
    // Match rule precedence: the drawer must be available before placement.
    if (c.action === 'place' && !a.rewards.length && a.chapter === 2 && a.branch !== 'hedgehog')
      return activityGuidance(s);
    if (
      c.action === 'place' &&
      !a.rewards.length &&
      ((a.chapter === 2 && a.branch === 'hedgehog' && !a.explored.includes('drawer')) ||
        (a.chapter === 3 && !a.explored.includes('drawer')))
    )
      return guide('drawer', 'drawer', 'mat', '先打开抽屉，取出摆餐的物件。', 'drawer');
    const seat = c.action === 'share' && need ? visitorSeat(need.visitor) : c.seat;
    const occupied = a.foods.find((f) => f.id !== c.item && f.place === `table:${seat}`);
    if (food && occupied)
      return guide(
        'occupied',
        'table',
        'carry',
        '餐位已经有这份食品。先选它，拿回桌边，再重新摆餐。',
        'pickup',
        [occupied.product],
        occupied.id,
      );
    if (
      c.action === 'place' &&
      a.chapter === 2 &&
      a.branch === 'hedgehog' &&
      !a.rewards.length &&
      !a.experience?.tools.includes('mat')
    )
      return guide('mat', 'drawer', 'mat', '先取出餐垫，食品就有摆放的位置。', 'mat');
  }
  if (c.action === 'share' && !need)
    return guide('invite', 'friend', 'table', '先邀请一位朋友，听听分享需要。', 'invite');
  if (
    ['place', 'taste', 'share', 'save-work'].includes(c.action) &&
    !food &&
    c.action !== 'save-work'
  )
    return guide('create', 'kitchen', 'carry', '先制作，再把真实食品带到桌边。', 'kitchen');
  return activityGuidance(s);
}
/** A read-only projection of the rule world, including the safe route out of blockers. */
export function activityGuidance(s: GameState): ActivityGuidance {
  const a = s.adventure;
  const guide = (
    id: string,
    from: string,
    to: string,
    label: string,
    target = to,
    products: readonly Product[] = [],
  ): ActivityGuidance => ({ id, from, to, label, target, products, audio: `world-${id}` });
  if (!a) return guide('kitchen', 'ear', 'kitchen', '听一听朋友需要什么，再动手。');
  const e = a.experience;
  const has = (step: string) => a.steps.includes(step);
  const used = (step: NonNullable<typeof e>['used'][number]) => e?.used.includes(step);
  const tools = (tool: NonNullable<typeof e>['tools'][number]) => e?.tools.includes(tool);
  const waiting = s.orders.find((o) => o.status === 'waiting');
  const serve = () =>
    guide(
      'kitchen',
      'ear',
      'kitchen',
      '听请求，做食物，再交给这位朋友。',
      'kitchen',
      s.session.support === 'less' ? [] : waiting ? REQUESTS[waiting.request].products : [],
    );
  if (a.foods.length >= 12)
    return guide('clear', 'recipe', 'clear', '保存作品，收拾桌面，再继续创作。', 'clear-table');
  if (a.rewards.length || a.kind === 'shop')
    return guide(
      'free',
      'kitchen',
      'recipe',
      '继续搭配、分享或修改，喜欢的作品留在食谱。',
      'kitchen',
    );
  if (
    !waiting &&
    [s.actor.current, ...s.actor.queue].some(
      (job) => job?.kind === 'delivery' && job.itemIds.length > 0,
    )
  )
    return guide('wait', 'carry', 'friend', '朋友正在接餐，盘里和篮里的食品都会保留。', 'friend');
  if (
    s.orders.some((o) => o.status === 'queued') &&
    !s.orders.some((o) => o.status === 'waiting' || o.status === 'leaving')
  )
    return guide('welcome', 'friend', 'counter', '点一位朋友，自己决定先帮谁。', 'welcome');
  if (a.chapter === 0) {
    if (waiting) return serve();
    if (adventureReady(a))
      return guide(
        'finish',
        'friend',
        'taste',
        '早餐接好了，一起吃吧；种花可以稍后探索。',
        'finish',
      );
    return guide('welcome', 'friend', 'counter', '点另一位朋友，听听早餐需要。', 'welcome');
  }
  if (a.chapter === 1) {
    if (waiting) return serve();
    if (openCommission(a)?.action === 'cool')
      return guide(
        'cool',
        'kitchen',
        'shade',
        '再做一杯不同的甜点，带到树荫下。',
        'kitchen',
        openCommission(a)?.choices,
      );
    if (!a.explored.includes('recipe'))
      return guide('recipe', 'recipe', 'compare', '翻开旧食谱，看看两份真实甜点。', 'recipe');
    if (!used('compare'))
      return guide(
        'compare',
        'cup',
        'cone',
        '把两份放在一起，看看有什么不同。',
        'compare',
        a.foods.map((f) => f.product),
      );
    if (!has('taste')) return guide('taste', 'spoon', 'friend', '选一份，让朋友尝一口。', 'taste');
    if (!has('bunting'))
      return guide('bunting', 'bunting', 'shade', '挂起彩旗，把甜点送到阴凉的分享处。', 'bunting');
  }
  if (a.chapter === 2) {
    if (!a.branch) return serve();
    if (a.branch === 'rabbit') {
      if (!a.explored.includes('basket'))
        return guide('basket', 'basket', 'missing', '打开篮子，看看里面和空的位置。', 'basket');
      if (!has('pack'))
        return guide(
          'pack',
          'kitchen',
          'basket',
          '一份三明治和一份水果，装入同一盘带来。',
          'kitchen',
          openCommission(a)?.choices,
        );
      if (!has('unpack'))
        return guide('unpack', 'basket', 'table', '把装好的篮子带到桌上打开。', 'unpack');
    } else {
      if (!a.explored.includes('drawer'))
        return guide('mat', 'drawer', 'mat', '取出餐垫，给朋友找到各自的位置。', 'drawer');
      if (!tools('mat'))
        return guide('mat', 'drawer', 'mat', '拿出两张餐垫，食物就有位置了。', 'mat');
      if (![0, 1].every((seat) => a.foods.some((f) => f.place === `table:${seat}`))) {
        if (a.foods.some((f) => f.place.startsWith('guest-') || f.place === 'work'))
          return guide('place', 'carry', 'table', '选食品，再点空餐位，每位朋友一份。', 'place');
        return serve();
      }
    }
    if (waiting) return serve();
    if (!has('cloth'))
      return guide('cloth', 'cloth', 'table', '选一张桌布，大家围坐分享。', 'cloth');
  }
  if (a.chapter === 3) {
    if (!has('served:rabbit') && !has('served:hedgehog')) return serve();
    if (!a.explored.includes('drawer'))
      return guide('lantern', 'drawer', 'lantern', '另一份正在做时，找出餐桌灯。', 'drawer');
    if (!tools('lantern'))
      return guide('lantern', 'drawer', 'lantern', '拿出灯串，邀请朋友帮忙搬过来。', 'lantern');
    if (!used('cooperate'))
      return guide(
        'cooperate',
        'friend',
        'lantern',
        '选朋友带灯或带杯，你可以继续备餐。',
        'cooperate',
      );
    if (waiting) return serve();
    if (![0, 1].every((seat) => a.foods.some((f) => f.place === `table:${seat}`)))
      return guide('place', 'carry', 'table', '安排食品和朋友的座位。', 'place');
    if (!has('light'))
      return guide('light', 'lantern', 'table', '把灯点亮，看看两种灯光。', 'light');
  }
  if (a.chapter === 4) {
    if (!a.invitations.includes('rabbit') || !a.invitations.includes('hedgehog'))
      return guide('invite', 'friend', 'table', '点朋友的邀请牌，听听今天的新需要。', 'invite');
    if (!a.foods.some((f) => f.source.startsWith('create:')))
      return guide('create', 'kitchen', 'table', '自己搭配，做好拼盘带到桌边。', 'kitchen');
    if (!used('share'))
      return guide(
        'share',
        'ear',
        'friend',
        '听朋友的分享需要，选食品，再点朋友的分享牌。',
        'share',
      );
    if (!a.foods.some((f) => f.source.startsWith('create:') && f.tasted))
      return guide('taste', 'spoon', 'friend', '让朋友尝你的选择，看看回应。', 'taste');
    if (!has('save-work'))
      return guide('save', 'table', 'recipe', '把实际作品放进食谱，下次能翻看。', 'save-work');
  }
  return adventureReady(a)
    ? guide('finish', 'table', 'friends', '准备好了，点餐桌一起开席。', 'finish')
    : serve();
}
