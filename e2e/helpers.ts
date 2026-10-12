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
  await p.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  await p.getByRole('button', { name: '先帮兔兔', exact: true }).click();
}
export async function startEndless(p: Page, less = true) {
  await p.goto('/');
  await p.locator('.yard-endless .entry-main').click();
  if (less) {
    await p.getByRole('button', { name: '少些帮助，听一听' }).click();
    await p.getByRole('button', { name: '两位一起招呼' }).click();
  }
  await p.getByRole('button', { name: '开门 / 继续营业' }).click();
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
const equipment = {
  juice: '果汁机',
  ice: '冰淇淋台',
  sandwich: '夹层板',
  burger: '煎台',
  ready: '食品篮',
};
export async function selectDevice(p: Page, device: string) {
  if ((await p.locator('.preparation-scene').getAttribute('data-device')) === device) return;
  const label =
    device === 'burger-board' ? '汉堡组合板' : equipment[device as keyof typeof equipment];
  for (let turns = 0; turns < 8; turns++) {
    const desired = p.getByRole('button', { name: `看看${label}`, exact: true });
    if (await desired.isVisible()) {
      await desired.click();
      return;
    }
    await p.locator('.equipment-rack button').last().click();
  }
  throw Error(`physical device ${device} not reachable`);
}
export async function supply(p: Page, product: Product) {
  if (!(await p.locator(`[data-hotspot="supply-${product}"]`).isVisible())) {
    const family =
      product === 'apple' || product === 'banana' || product === 'cup'
        ? 'juice'
        : product === 'cone' || product === 'vanilla' || product === 'strawberry'
          ? 'ice'
          : product === 'bun' || product === 'patty'
            ? 'burger'
            : product === 'bread' ||
                product === 'cheese' ||
                product === 'lettuce' ||
                product === 'tomato'
              ? 'sandwich'
              : 'ready';
    await selectDevice(p, family);
    if (family === 'ready')
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
  const show = () =>
    selectDevice(
      p,
      recipe.station === 'board' && recipe.family === 'burger' ? 'burger-board' : recipe.family,
    );
  for (const input of recipe.inputs) {
    let id: string | null;
    if (RAW.includes(input)) id = await supply(p, input);
    else id = await make(p, input, restore);
    if (!id) throw Error(`no actual ${input}`);
    await show();
    const current = (await state(p)).items.find((i) => i.id === id);
    if (!current?.location.startsWith('hand:'))
      await p.locator(`[data-hotspot="item-${id}"]`).click();
    await p
      .getByRole('button', {
        name:
          recipe.station === 'machine'
            ? input === 'cup'
              ? '放到果汁机杯座'
              : '放入果汁机水果口'
            : recipe.station === 'ice'
              ? '放到冰淇淋台'
              : recipe.station === 'grill'
                ? '放到煎台'
                : '放到组合板',
        exact: true,
      })
      .click();
  }
  await show();
  await p
    .locator(
      `[data-hotspot="${recipe.station === 'machine' ? 'start' : `start-station-${recipe.station}`}" ]`,
    )
    .click();
  const before = await state(p);
  expect(
    recipe.station === 'machine' ? before.machine.status : before.stations[recipe.station].status,
  ).toBe('processing');
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
  await show();
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
