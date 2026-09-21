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
  const opening = p.getByRole('button', { name: '跳过开场' });
  if (await opening.count()) {
    try {
      await opening.tap({ timeout: 700 });
    } catch {
      await expect(opening).toHaveCount(0);
    }
  }
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
  const opening = p.getByRole('button', { name: '跳过开场' });
  if (await opening.count()) {
    try {
      await opening.tap({ timeout: 700 });
    } catch {
      await expect(opening).toHaveCount(0);
    }
  }
  await expect(p.getByRole('dialog', { name: '场景小教学' })).toBeVisible();
  await p.waitForTimeout(500);
  await lesson(p);
}
export async function startEndless(p: Page, less = true) {
  await p.goto('/');
  await p.locator('.yard-endless .entry-main').tap();
  if (less) {
    await p.getByRole('button', { name: '少些帮助，听一听' }).tap();
    await p.getByRole('button', { name: '两位一起招呼' }).tap();
  }
  await p.getByRole('button', { name: '开始 / 继续' }).tap();
  await lesson(p);
}
export async function choosePrep(p: Page, name: string) {
  await tap(
    p,
    name.includes('盘')
      ? name.includes('2')
        ? 'tray-1'
        : 'tray-0'
      : name === '果汁机'
        ? 'machine-apple'
        : name === '冰淇淋台'
          ? 'station-ice'
          : name === '煎台'
            ? 'station-grill'
            : 'station-board',
  );
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
  const family = {
    juice: '果汁',
    ice: '冰淇淋',
    sandwich: '三明治',
    burger: '汉堡',
    ready: '水果与预制点心',
  }[recipe.family];
  if ((await state(p)).session.family !== recipe.family) {
    await p.getByRole('button', { name: '选择食谱', exact: true }).tap();
    await p
      .getByRole('group', { name: '选择食谱工作台' })
      .getByRole('button', { name: family, exact: true })
      .tap();
  }
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
    if (RAW.includes(input)) {
      if (
        input !== 'cup' ||
        !(await state(p)).items.some(
          (i) => i.location === 'machine:cup' && recipe.station === 'machine',
        )
      )
        await tap(p, `supply-${input}`);
    } else {
      const id = await make(p, input, restore);
      if (!id) throw Error(input);
      if (
        !(await state(p)).items
          .find((i) => i.id === id)
          ?.location.startsWith(`station:${recipe.station}:`)
      ) {
        await tap(p, `item-${id}`);
        await choosePrep(p, prep);
      } else await choosePrep(p, prep);
    }
  }
  if (recipe.station === 'board') {
    // Inspect settled ingredient slots, not an ingredient crossing the counter in transit.
    await p.waitForTimeout(260);
    for (const item of (await state(p)).items.filter((i) =>
      i.location.startsWith('station:board:'),
    )) {
      await tap(p, `item-${item.id}`);
      await expect(p.locator(`[data-hotspot="item-${item.id}"]`)).toHaveAttribute(
        'aria-pressed',
        'true',
      );
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
    if (recipe.station === 'grill') await p.setViewportSize({ width: 768, height: 1024 });
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
      async () =>
        (await state(p)).items.some(
          (i) =>
            i.product === product &&
            (recipe.station === 'grill'
              ? i.location.startsWith('station:board:')
              : i.location.startsWith('tray:')),
        ),
      { timeout: 15000 },
    )
    .toBe(true);
  const item = (await state(p)).items.find(
    (i) =>
      i.product === product &&
      (recipe.station === 'grill'
        ? i.location.startsWith('station:board:')
        : i.location.startsWith('tray:')),
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
      if (!(await state(p)).items.find((i) => i.id === id)?.location.startsWith('tray:0:')) {
        await tap(p, `item-${id}`);
        await choosePrep(p, '● 1号盘');
      }
    }
  }
  // Explicit target chosen without a UI correctness gate. Tests read state; never inject it.
  const label =
    s.orders.filter((o) => o.status === 'waiting').length === 1
      ? '送餐 ↗'
      : order.seat === 0
        ? '送给左边客人 ↗'
        : '送给右边客人 ↗';
  if (s.orders.filter((o) => o.status === 'waiting').length > 1)
    await p.getByRole('button', { name: '送餐 ↗', exact: true }).tap();
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
