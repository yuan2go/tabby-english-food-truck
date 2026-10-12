import { mkdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { expect, type Page } from '@playwright/test';
import { REQUESTS } from '../src/content/catalog';
import { type Product, RAW, RECIPES } from '../src/content/recipes';
import type { GameState } from '../src/rules/types';
export const state = (p: Page): Promise<GameState> =>
  p.evaluate(() => JSON.parse(localStorage.getItem('tabby.foodtruck.save.m2') ?? '{}'));
export async function hot(p: Page, id: string, dy = 0) {
  const b = await p.locator(`[data-hotspot="${id}"]`).boundingBox();
  if (!b) throw Error(id);
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 + dy };
}
export async function tap(p: Page, id: string, dy = 0) {
  const q = await hot(p, id, dy);
  await p.touchscreen.tap(q.x, q.y);
}
export async function lesson(p: Page) {
  await expect(p.locator('.loading-page')).toHaveCount(0);
}
export async function startStory(p: Page) {
  await p.goto('/');
  await p.getByRole('button', { name: '正在准备 · 早餐派对', exact: true }).click();
}
export async function startEndless(p: Page, less = true) {
  await p.goto('/');
  await p.locator('.yard-endless .entry-main').click();
  if (less) {
    await p.getByRole('button', { name: '暂停', exact: true }).click();
    await p.getByRole('button', { name: '调整开店设置', exact: true }).click();
    await p.getByRole('button', { name: '少些帮助，听一听' }).click();
    await p.getByRole('button', { name: '两位一起招呼' }).click();
    await p.getByRole('button', { name: '开门 / 继续营业' }).click();
  }
  await lesson(p);
}
export async function choosePrep(p: Page, name: string) {
  const label = name.includes('盘')
    ? '放到制作承放区'
    : name === '果汁机'
      ? '放入果汁机水果口'
      : name === '冰淇淋台'
        ? '放到冰淇淋台'
        : name === '煎台'
          ? '放到煎台'
          : '放到组合板';
  await p.getByRole('button', { name: label, exact: true }).click();
}
export async function selectDevice(p: Page, device: string) {
  const name =
    device === 'burger'
      ? '煎锅'
      : device === 'burger-board' || device === 'sandwich'
        ? '组合板'
        : device === 'juice'
          ? '果汁机'
          : device === 'ice'
            ? '冰淇淋'
            : null;
  if (name) await expect(p.getByRole('region', { name, exact: true })).toBeVisible();
}
export async function supply(p: Page, product: Product) {
  if (!(await p.locator(`[data-hotspot="supply-${product}"]`).isVisible())) {
    await p.getByRole('button', { name: '查看更多食物篮', exact: true }).click();
    for (let page = 0; page < 4; page++) {
      await p.getByRole('button', { name: `查看第${page + 1}篮食物`, exact: true }).click();
      if (await p.locator(`[data-hotspot="supply-${product}"]`).isVisible()) break;
    }
  }
  await p.locator(`[data-hotspot="supply-${product}"]`).click();
  return (
    (await state(p)).items
      .filter((i) => i.product === product && i.location.startsWith('hand:'))
      .at(-1)?.id ?? null
  );
}
export async function make(
  p: Page,
  product: Product,
  restore?: Set<string>,
): Promise<string | null> {
  if (RAW.includes(product)) return supply(p, product);
  const recipe = RECIPES.find((r) => r.output === product);
  if (!recipe) {
    return supply(p, product);
  }
  const inputs =
    recipe.family === 'sandwich'
      ? ['bread' as Product, ...recipe.inputs.filter((x) => x !== 'bread'), 'bread' as Product]
      : recipe.inputs;
  for (const input of inputs) {
    if (!RAW.includes(input)) {
      const id = await make(p, input, restore);
      if (!id) throw Error(`no actual ${input}`);
      await p.getByRole('button', { name: '放到组合板', exact: true }).click();
    } else {
      const name =
        recipe.station === 'machine'
          ? '果汁机'
          : recipe.station === 'ice'
            ? '冰淇淋'
            : recipe.station === 'grill'
              ? '煎锅'
              : '组合板';
      const labels = (await import('../src/content/catalog')).PRODUCT_NAMES;
      await p.getByRole('button', { name: `${name}：${labels[input]}`, exact: true }).click();
    }
  }
  if (recipe.station === 'machine' || recipe.station === 'grill') {
    await p
      .locator(`[data-hotspot="${recipe.station === 'machine' ? 'start' : 'start-station-grill'}"]`)
      .click();
    const before = await state(p);
    expect(
      recipe.station === 'machine' ? before.machine.status : before.stations.grill.status,
    ).toBe('processing');
  } else expect((await state(p)).stations[recipe.station].status).toBe('ready');
  if (restore?.has(recipe.station)) {
    restore.delete(recipe.station);
    await p.getByRole('button', { name: '暂停', exact: true }).click();
    const frozen = await state(p);
    await p.reload();
    await p.locator('.yard-story .entry-main').click();
    expect((await state(p)).runId).toBe(frozen.runId);
    for (const item of frozen.items.filter(
      (i) =>
        !i.location.startsWith(
          recipe.station === 'machine' ? 'machine:' : `station:${recipe.station}:`,
        ),
    ))
      expect((await state(p)).items.find((i) => i.id === item.id)).toEqual(item);
  }
  await expect
    .poll(
      async () =>
        (await state(p)).items.some(
          (i) =>
            i.product === product &&
            (recipe.station === 'machine'
              ? i.location === 'machine:cup'
              : i.location.startsWith(`station:${recipe.station}:`)),
        ),
      { timeout: 15000 },
    )
    .toBe(true);
  const item = (await state(p)).items.find(
    (i) =>
      i.product === product &&
      (recipe.station === 'machine'
        ? i.location === 'machine:cup'
        : i.location.startsWith(`station:${recipe.station}:`)),
  );
  if (!item) throw Error(product);
  await p.locator(`[data-hotspot="item-${item.id}"]`).click();
  expect((await state(p)).items.find((i) => i.id === item.id)?.location).toMatch(/^hand:/);
  return item.id;
}
export async function handOver(p: Page, seat?: 0 | 1, _tray: 0 | 1 = 0) {
  const order = (await state(p)).orders.find(
    (o) => o.status === 'waiting' && (seat === undefined || o.seat === seat),
  );
  if (!order) throw Error('waiting');
  await p
    .locator(`[data-actor="${order.visitor ?? (order.seat === 0 ? 'rabbit' : 'hedgehog')}"]`)
    .click();
}
export async function serve(p: Page, restore?: Set<string>) {
  const order = (await state(p)).orders.find((o) => o.status === 'waiting');
  if (!order) throw Error('waiting');
  const ids: string[] = [];
  for (const product of REQUESTS[order.request].products) {
    const id = await make(p, product, restore);
    if (!id) throw Error(product);
    ids.push(id);
    await choosePrep(p, '盘');
  }
  for (const id of ids) await p.locator(`[data-hotspot="item-${id}"]`).click();
  await handOver(p, order.seat);
  await expect
    .poll(async () => (await state(p)).orders.find((o) => o.id === order.id)?.status ?? 'done', {
      timeout: 18000,
    })
    .toBe('done');
}
export async function drag(p: Page, from: string, to: string) {
  const a = await hot(p, from),
    b = await hot(p, to);
  const c = await p.context().newCDPSession(p);
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...a, id: 1 }] });
  for (let n = 1; n <= 10; n++)
    await c.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: a.x + ((b.x - a.x) * n) / 10, y: a.y + ((b.y - a.y) * n) / 10, id: 1 }],
    });
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await c.detach();
}

export function evidencePath(original: string) {
  const dir = join(
    process.env.EVIDENCE_DIR ?? 'docs/evidence/simplified-play-2026-10-12/browser',
    'screenshots',
  );
  mkdirSync(dir, { recursive: true });
  return join(dir, basename(original));
}
/** Normal UI only: real preparation, explicit recipients and the running game clock. */
export async function finishChapter(
  p: Page,
  chapter: number,
  first: 'rabbit' | 'hedgehog' = 'rabbit',
  restore?: Set<string>,
) {
  await expect.poll(async () => (await state(p)).session.chapter).toBe(chapter);
  while ((await state(p)).orders.some((o) => o.status !== 'done')) {
    await expect
      .poll(async () => (await state(p)).orders.some((o) => o.status === 'waiting'), {
        timeout: 15000,
      })
      .toBe(true);
    const s = await state(p);
    const o =
      s.orders.find((o) => o.status === 'waiting' && o.visitor === first) ??
      s.orders.find((o) => o.status === 'waiting');
    if (!o) throw Error('waiting guest');
    for (const product of REQUESTS[o.request].products) await make(p, product, restore);
    await p.locator(`[data-actor="${o.visitor}"]`).click();
    await expect
      .poll(async () => (await state(p)).orders.find((x) => x.id === o.id)?.status, {
        timeout: 18000,
      })
      .toBe('done');
  }
  if (chapter === 1) {
    await expect.poll(async () => (await state(p)).adventure?.flow?.wave).toBe(2);
    await make(p, 'strawberry-cup');
    await p.getByRole('button', { name: '交给刺刺', exact: true }).click();
  }
  if (chapter === 2 && first === 'rabbit') {
    await make(p, 'sandwich');
    await p.getByRole('button', { name: '把食品放进野餐篮', exact: true }).click();
    await expect
      .poll(
        async () => (await state(p)).adventure?.foods.filter((f) => f.place === 'basket').length,
      )
      .toBe(1);
    await supply(p, 'banana');
    await p.getByRole('button', { name: '把食品放进野餐篮', exact: true }).click();
  }
  if (chapter < 4)
    await expect
      .poll(async () => (await state(p)).session.chapter, { timeout: 15000 })
      .toBe(chapter + 1);
  else {
    for (const [visitor, product] of [
      ['rabbit', first === 'rabbit' ? 'sandwich' : 'juice'],
      ['hedgehog', 'strawberry-cup'],
    ] as const) {
      await make(p, product);
      await p.locator(`[data-actor="${visitor}"]`).click();
      await expect
        .poll(
          async () =>
            (await state(p)).adventure?.experience?.needs.find((n) => n.visitor === visitor)
              ?.fulfilled.length,
          { timeout: 18000 },
        )
        .toBe(1);
      await expect
        .poll(async () => (await state(p)).actor.current?.kind === 'delivery')
        .toBe(false);
    }
    await expect
      .poll(async () => (await state(p)).adventure?.flow?.phase, { timeout: 15000 })
      .toBe('complete');
  }
}
