import { expect, type Page } from '@playwright/test';
import { REQUESTS } from '../src/content/catalog';
import { CHAPTERS } from '../src/content/chapters';
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
  await p.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  const button = p.getByRole('button', { name: '我来试试', exact: true });
  if (await button.count()) await button.tap();
  await expect(p.locator('.loading-page')).toHaveCount(0);
}
export async function startStory(p: Page) {
  await p.goto('/');
  await p.locator('.yard-story .entry-main').tap();
  await p.getByRole('button', { name: '跳过序章' }).tap();
  await p.getByRole('button', { name: '晨光果汁', exact: true }).tap();
  await expect(p.getByRole('dialog', { name: '场景小教学' })).toBeVisible();
  await p.waitForTimeout(500);
  await lesson(p);
}
export async function startEndless(p: Page, less = true) {
  await p.goto('/');
  await p.locator('.yard-endless .entry-main').tap();
  if (less) await p.getByRole('button', { name: '少些帮助，听一听' }).tap();
  await p.getByRole('button', { name: '开始 / 继续' }).tap();
  await lesson(p);
}
export async function choosePrep(p: Page, name: string) {
  await p.locator('.prep-selector').getByRole('button', { name, exact: true }).tap();
}
export async function make(
  p: Page,
  product: Product,
  restore?: Set<string>,
): Promise<string | null> {
  if (RAW.includes(product)) {
    await tap(p, `supply-${product}`);
    return null;
  }
  const recipe = RECIPES.find((r) => r.output === product);
  if (!recipe) throw Error(product);
  const family = { juice: '果汁', ice: '冰淇淋', sandwich: '三明治', burger: '汉堡' }[
    recipe.family
  ];
  await p.locator('.family-tabs').getByRole('button', { name: family, exact: true }).tap();
  await expect(p.locator('.loading-page')).toHaveCount(0);
  const prep =
    recipe.station === 'machine'
      ? '果汁机'
      : recipe.station === 'ice'
        ? '冰淇淋台'
        : recipe.station === 'grill'
          ? '煎台'
          : '组合板';
  await choosePrep(p, prep);
  for (const input of recipe.inputs) {
    if (RAW.includes(input)) await tap(p, `supply-${input}`);
    else {
      const id = await make(p, input, restore);
      if (!id) throw Error(input);
      await tap(p, `item-${id}`);
      await choosePrep(p, prep);
    }
  }
  await tap(p, recipe.station === 'machine' ? 'start' : `start-station-${recipe.station}`);
  if (restore?.has(recipe.station)) {
    restore.delete(recipe.station);
    await p.getByRole('button', { name: '暂停', exact: true }).tap();
    const before = await state(p);
    const chapter = CHAPTERS[before.session.chapter];
    if (!chapter) throw Error('chapter');
    expect(
      recipe.station === 'machine' ? before.machine.status : before.stations[recipe.station].status,
    ).toBe('processing');
    await p.reload();
    await p.locator('.yard-story .entry-main').tap();
    await p.getByRole('button', { name: chapter.title, exact: true }).tap();
    await lesson(p);
    const after = await state(p);
    expect(after.runId).toBe(before.runId);
    expect(after.items.map((i) => i.id)).toEqual(before.items.map((i) => i.id));
    // Restart measurement after navigation; no gameplay state is injected.
    await p.evaluate(() => {
      const m = Reflect.get(window, 'm2measure');
      if (m) {
        m.running = true;
        m.last = 0;
      }
    });
  }

  await expect
    .poll(
      async () => {
        const s = await state(p);
        return recipe.station === 'machine' ? s.machine.status : s.stations[recipe.station].status;
      },
      { timeout: 15000 },
    )
    .toBe('ready');
  const s = await state(p),
    item = s.items.find(
      (i) =>
        i.product === product &&
        (recipe.station === 'machine'
          ? i.location === 'machine:cup'
          : i.location.startsWith(`station:${recipe.station}:`)),
    );
  if (!item) throw Error(product);
  return item.id;
}
export async function serve(p: Page, restore?: Set<string>) {
  await lesson(p);
  const s = await state(p),
    order = s.orders.find((o) => o.status === 'waiting');
  if (!order) throw Error('waiting');
  for (const product of REQUESTS[order.request].products) {
    if (RAW.includes(product)) {
      await choosePrep(p, '● 1号盘');
      await make(p, product);
    } else {
      const id = await make(p, product, restore);
      await tap(p, `item-${id}`);
      await choosePrep(p, '● 1号盘');
    }
  }
  // Explicit target chosen without a UI correctness gate. Tests read state; never inject it.
  const label =
    s.orders.filter((o) => o.status === 'waiting').length === 1
      ? '送给客人 ↗'
      : order.seat === 0
        ? '送给左边客人 ↗'
        : '送给右边客人 ↗';
  await p.getByRole('button', { name: label, exact: true }).tap();
  await expect
    .poll(
      async () => {
        const next = await state(p);
        return next.orders.find((o) => o.id === order.id)?.status ?? 'done';
      },
      { timeout: 18000 },
    )
    .toBe('done');
}
export async function drag(p: Page, from: string, to: string) {
  const a = await hot(p, from, from.startsWith('tray') ? 25 : 0),
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
