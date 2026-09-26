import { writeFile } from 'node:fs/promises';
import { expect, type Locator, type Page, test } from '@playwright/test';

test.use({
  viewport: { width: 393, height: 665 },
  deviceScaleFactor: 3,
  hasTouch: true,
  isMobile: true,
});

type Step = { station: string; inputs: string[]; output: string };
const cost = {
  navigation: 0,
  teaching: 0,
  help: 0,
  correction: 0,
  preparation: 0,
  waiting: 0,
  delivery: 0,
};

async function touch(page: Page, target: Locator, kind: keyof typeof cost) {
  const box = await target.boundingBox();
  if (!box) throw Error(`Missing visible target: ${await target.getAttribute('aria-label')}`);
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  cost[kind]++;
}

async function click(target: Locator, kind: keyof typeof cost) {
  await target.tap();
  cost[kind]++;
}

async function dismissTeaching(page: Page) {
  const opening = page.getByRole('button', { name: '跳过开场' });
  if (await opening.count()) await click(opening, 'teaching');
  const lesson = page.getByRole('button', { name: '我来试试' });
  if (await lesson.count()) await click(lesson, 'teaching');
}

async function pictureRequest(page: Page, seat: 0 | 1): Promise<string[]> {
  await touch(
    page,
    page.locator(`[data-hotspot^="guest-"][aria-label^="客人${seat === 0 ? 'A' : 'B'}"]`),
    'help',
  );
  await touch(page, page.locator('[data-hotspot="note"]'), 'help');
  await click(page.getByRole('button', { name: '看看客人想要什么' }), 'help');
  const picture = page.locator('.request-picture');
  await expect(picture).toBeVisible();
  const products = await picture
    .locator('img')
    .evaluateAll((images) => images.map((image) => image.getAttribute('alt') ?? ''));
  await click(page.getByRole('button', { name: '收起文字帮助' }), 'help');
  return products;
}

async function readVisibleRecipe(page: Page, expected: string): Promise<Step[]> {
  await touch(page, page.locator('[data-hotspot="note"]'), 'help');
  await click(page.getByRole('button', { name: '看食谱与示范' }), 'help');
  const recipeButton = page.getByRole('button', { name: '看看怎么做' });
  if (await recipeButton.count()) await click(recipeButton, 'help');
  await expect(page.locator('.lesson-process')).toBeVisible();
  const stepButtons = page.locator('.lesson-stepper button');
  const count = Math.max(1, await stepButtons.count());
  const steps: Step[] = [];
  for (let index = 0; index < count; index++) {
    if (count > 1) await click(stepButtons.nth(index), 'help');
    const station = (await page.locator('.lesson-process').innerText()).split('→')[0]?.trim() ?? '';
    const images = await page
      .locator('.lesson-ingredients img')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('alt') ?? ''));
    const output = images.at(-1) ?? '';
    steps.push({ station, inputs: images.slice(0, -1), output });
  }
  expect(steps.at(-1)?.output).toBe(expected);
  await click(page.getByRole('button', { name: '我来试试' }), 'help');
  return steps;
}

async function chooseFamily(page: Page, step: Step) {
  const name = step.station.includes('果汁机')
    ? '果汁'
    : step.station.includes('冰淇淋台')
      ? '冰淇淋'
      : step.station.includes('煎台') || step.inputs.includes('圆面包')
        ? '汉堡'
        : '三明治';
  const switcher = page.getByRole('button', { name: '选择食谱', exact: true });
  if (!(await switcher.count())) return;
  await click(switcher, 'preparation');
  await click(
    page.getByRole('group', { name: '选择食谱工作台' }).getByRole('button', { name, exact: true }),
    'preparation',
  );
}

async function prepareStep(page: Page, step: Step, tray: 0 | 1, previousOutput: string | null) {
  await chooseFamily(page, step);
  await touch(page, page.locator(`[data-hotspot="tray-${tray}"]`), 'preparation');
  const machine = step.station.includes('果汁机');
  const station = machine
    ? 'machine-apple'
    : step.station.includes('冰淇淋台')
      ? 'station-ice'
      : step.station.includes('煎台')
        ? 'station-grill'
        : 'station-board';
  await touch(page, page.locator(`[data-hotspot="${station}"]`), 'preparation');
  for (const input of step.inputs) {
    // The juice cup is a real instance placed by the machine-selection rule.
    if ((machine && input === '空杯') || input === previousOutput) continue;
    await touch(page, page.locator(`[aria-label="拿${input}"]`), 'preparation');
  }
  const start = machine ? 'start' : `start-station-${station.slice(8)}`;
  await touch(page, page.locator(`[data-hotspot="${start}"]`), 'preparation');
  cost.waiting++;
  await expect
    .poll(
      async () =>
        page
          .locator('[data-hotspot^="item-"]')
          .evaluateAll(
            (nodes, output) =>
              nodes.some((node) =>
                (node.getAttribute('aria-label') ?? '').startsWith(`${output}，`),
              ),
            step.output,
          ),
      { timeout: 15000 },
    )
    .toBe(true);
}

async function makeVisible(page: Page, product: string, tray: 0 | 1) {
  await touch(page, page.locator(`[data-hotspot="tray-${tray}"]`), 'preparation');
  const raw = page.locator(`[aria-label="拿${product}"]`);
  if (await raw.count()) {
    await touch(page, raw, 'preparation');
    return;
  }
  const steps = await readVisibleRecipe(page, product);
  let previous: string | null = null;
  for (const step of steps) {
    await prepareStep(page, step, tray, previous);
    previous = step.output;
  }
}

async function served(page: Page): Promise<[number, number]> {
  const text = await page.locator('.service-count').innerText();
  const match = text.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) throw Error(`No visible story count: ${text}`);
  return [Number(match[1]), Number(match[2])];
}

test('visible picture and recipe walk completes four cooking families and mixed late service', async ({
  page,
}, info) => {
  test.setTimeout(600000);
  await page.goto('/');
  await click(page.locator('.yard-story .entry-main'), 'navigation');
  await click(page.getByRole('button', { name: '跳过序章' }), 'teaching');
  await click(page.getByRole('button', { name: '晨光果汁', exact: true }), 'navigation');
  for (let chapter = 0; chapter < 5; chapter++) {
    await dismissTeaching(page);
    const [, total] = await served(page);
    for (let n = 0; n < total; n++) {
      await expect
        .poll(async () => page.locator('[data-hotspot^="guest-"][aria-label^="客人"]').count(), {
          timeout: 18000,
        })
        .toBeGreaterThan(0);
      await dismissTeaching(page);
      const [before] = await served(page);
      const left = page.locator('[data-hotspot^="guest-"][aria-label^="客人A"]');
      const right = page.locator('[data-hotspot^="guest-"][aria-label^="客人B"]');
      const seat: 0 | 1 = n % 2 === 1 && (await right.count()) ? 1 : (await left.count()) ? 0 : 1;
      const products = await pictureRequest(page, seat);
      const tray: 0 | 1 =
        seat === 1 && (await page.locator('[data-hotspot="tray-1"]').count()) ? 1 : 0;
      if (chapter === 0 && n === 0) {
        await page.screenshot({ path: info.outputPath('opening-393x665.png') });
        await touch(page, page.locator('[aria-label="拿香蕉"]'), 'preparation');
        await click(page.locator('.delivery-actions .primary'), 'correction');
        await expect.poll(async () => (await served(page))[0]).toBe(before);
        const misplaced = page.locator('[data-hotspot^="item-"][aria-label^="香蕉，"]');
        await expect(misplaced).toBeAttached();
        await touch(page, misplaced, 'correction');
        await click(page.getByRole('button', { name: '↩ 放回这份' }), 'correction');
      }
      for (const product of products) await makeVisible(page, product, tray);
      if (chapter === 0 && n === 1)
        await page.screenshot({ path: info.outputPath('juice-393x665.png') });
      if (chapter === 1 && n === 2)
        await page.screenshot({ path: info.outputPath('ice-393x665.png') });
      if (chapter === 2 && n === 1)
        await page.screenshot({ path: info.outputPath('sandwich-393x665.png') });
      if (chapter === 3 && n === 0)
        await page.screenshot({ path: info.outputPath('burger-393x665.png') });
      await click(page.locator('.delivery-actions .primary'), 'delivery');
      await expect.poll(async () => (await served(page))[0], { timeout: 18000 }).toBe(before + 1);
    }
    await expect(page.locator('.ending')).toBeVisible();
    if (chapter === 2) await click(page.getByRole('button', { name: '👥 两位一起' }), 'navigation');
    if (chapter < 4) await click(page.getByRole('button', { name: '翻开下一页' }), 'navigation');
  }
  await expect(page.getByRole('heading', { name: '小院里的朋友，都到齐啦！' })).toBeVisible();
  await writeFile(
    info.outputPath('visible-cost.json'),
    JSON.stringify(
      {
        method: 'VISIBLE_IMAGES_AND_FORMAL_HELP',
        hiddenAnswers: false,
        injectedState: false,
        audioHumanListening: 'NOT_RUN',
        viewport: '393x665 DPR3',
        ...cost,
      },
      null,
      2,
    ),
  );
});
