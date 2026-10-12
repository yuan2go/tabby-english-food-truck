import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium, expect } from '@playwright/test';

const output = process.argv[2];
if (!output) throw Error('absolute evidence output required');
const base = process.argv[3] ?? 'http://127.0.0.1:4286';
mkdirSync(output, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 393, height: 665 },
  isMobile: true,
  hasTouch: true,
});
const p = await ctx.newPage();
const journal = [];
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(base);
const identity = await p
  .locator('[data-build-sha]')
  .getAttribute('data-build-sha')
  .catch(() => null);
const tap = async (name) => {
  await p.getByRole('button', { name, exact: true }).tap();
  journal.push({ action: name, at: new Date().toISOString() });
};
const state = () => p.evaluate(() => JSON.parse(localStorage.getItem('tabby.foodtruck.save.m2')));
const received = async (v) =>
  expect.poll(async () => (await state()).orders.find((o) => o.visitor === v)?.status).toBe('done');
const step = async (s) =>
  expect.poll(async () => (await state()).adventure.steps.includes(s)).toBe(true);
const sandwich = async (veggie = false) => {
  for (const part of veggie ? ['面包', '生菜', '番茄', '面包'] : ['面包', '芝士', '面包'])
    await tap(`组合板：${part}`);
  await tap(`拿起${veggie ? '蔬菜' : '芝士'}三明治`);
};
try {
  await tap('正在准备 · 晨光开门');
  for (const [friend, food, v] of [
    ['兔兔', '苹果', 'rabbit'],
    ['刺刺', '香蕉', 'hedgehog'],
  ]) {
    await tap(`先帮${friend}`);
    await tap(`拿起${food}`);
    await tap(`交给${friend}`);
    await received(v);
  }
  await tap('一起吃早餐');
  await tap('下一院活动');
  await tap('先帮兔兔');
  const iceStart = journal.length;
  await tap('冰淇淋：蛋筒');
  await tap('冰淇淋：香草球');
  await tap('拿起香草蛋筒');
  await tap('交给兔兔');
  const iceClicks = journal.length - iceStart;
  await received('rabbit');
  await tap('冰淇淋：空杯');
  await tap('冰淇淋：草莓球');
  await tap('拿起草莓冰淇淋杯');
  await tap('交给刺刺');
  await step('cool');
  await tap('比较两份甜点');
  await tap('品尝香草蛋筒');
  await p.screenshot({ path: `${output}/02-desserts.png` });
  await tap('一起开席');
  await tap('下一院活动');
  await tap('先帮兔兔');
  await sandwich();
  await tap('交给兔兔');
  await received('rabbit');
  await tap('检查野餐篮');
  await tap('先帮刺刺');
  await sandwich(true);
  await tap('交给刺刺');
  await received('hedgehog');
  await sandwich();
  await tap('把食品放进野餐篮');
  await expect
    .poll(async () => (await state()).adventure.foods.filter((f) => f.place === 'basket').length)
    .toBe(1);
  await tap('拿起苹果');
  await tap('把食品放进野餐篮');
  await step('pack');
  await tap('把篮子摆上桌');
  await tap('铺叶子桌布');
  await tap('一起开席');
  await tap('下一院活动');
  await tap('先帮兔兔');
  await tap('煎锅：生饼');
  await tap('启动煎台');
  await tap('果汁机：苹果');
  await tap('果汁机：空杯');
  await tap('启动果汁机');
  await tap('组合板：圆面包');
  await tap('组合板：芝士');
  await expect(p.getByRole('button', { name: '拿起熟饼', exact: true })).toBeVisible({
    timeout: 10000,
  });
  await tap('拿起熟饼');
  await tap('放到组合板');
  await tap('拿起芝士汉堡');
  await tap('交给兔兔');
  await received('rabbit');
  await tap('请兔兔带灯');
  await tap('先帮刺刺');
  await tap('拿起苹果汁');
  await tap('交给刺刺');
  await received('hedgehog');
  await tap('点亮暖灯');
  await p.screenshot({ path: `output/04-dinner.png`.replace('output', output) });
  await tap('一起开席');
  await tap('下一院活动');
  await tap('邀请兔兔');
  await tap('邀请刺刺');
  await sandwich();
  await tap('交给兔兔');
  await expect
    .poll(
      async () =>
        (await state()).adventure.experience.needs.find((n) => n.visitor === 'rabbit').fulfilled
          .length,
    )
    .toBe(1);
  await tap('冰淇淋：空杯');
  await tap('冰淇淋：草莓球');
  await tap('拿起草莓冰淇淋杯');
  await tap('交给刺刺');
  await expect
    .poll(
      async () =>
        (await state()).adventure.experience.needs.find((n) => n.visitor === 'hedgehog').fulfilled
          .length,
    )
    .toBe(1);
  await tap('品尝芝士三明治');
  await tap('保存到食谱');
  await tap('一起开席');
  const final = await state();
  expect(final.adventure.works[0].foods).toHaveLength(2);
  await p.screenshot({ path: `${output}/05-feast.png` });
  await tap('暂停');
  await tap('收摊回小院');
  await tap('自由开店');
  await expect(p.getByRole('region', { name: '同桌厨房', exact: true })).toBeVisible();
  await tap('暂停');
  await tap('停止接客，做作品');
  await tap('拿起苹果');
  await tap('放到作品区');
  await step('create');
  await tap('品尝苹果');
  await tap('保存到食谱');
  const free = await state();
  await tap('暂停');
  await tap('收摊回小院');
  await tap('迷你游戏');
  await p.getByRole('button', { name: /小院场景小游戏 ·/ }).tap();
  await p
    .getByRole('button', { name: /小院寻物/ })
    .first()
    .tap();
  await p.getByRole('button', { name: /帮大咪拿东西/ }).tap();
  await expect(p.locator('.scene-stage')).toBeVisible();
  writeFileSync(
    `${output}/journey.json`,
    JSON.stringify(
      {
        base,
        identity,
        viewport: { width: 393, height: 665 },
        input: 'trusted browser touchscreen taps',
        iceClicks,
        journal,
        chapter5: final.adventure,
        free: free.adventure,
        pageErrors: errors,
        notRun: ['real adult', 'child observation', 'physical device', 'manual audio review'],
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    JSON.stringify({ result: 'PASS', iceClicks, actions: journal.length, pageErrors: errors }),
  );
} catch (error) {
  await p.screenshot({ path: `${output}/failure.png` });
  writeFileSync(
    `${output}/failure.json`,
    JSON.stringify({ journal, error: String(error), state: await state() }, null, 2) + '\n',
  );
  throw error;
} finally {
  await ctx.close();
  await browser.close();
}
