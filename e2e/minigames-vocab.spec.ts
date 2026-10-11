import { expect, type Page, test } from '@playwright/test';
import { wordById } from '../src/content/learning';
import { state as worldState } from './helpers';

test.setTimeout(180000);
const enter = async (page: Page) => {
  await page.goto('/');
  await page.getByRole('button', { name: '迷你游戏', exact: true }).click();
  await page.getByRole('button', { name: /小院场景小游戏 ·/ }).click();
};
const choose = async (page: Page, kind: string, title: string) => {
  await page
    .getByRole('button', { name: new RegExp(kind) })
    .first()
    .click();
  await page.getByRole('button', { name: new RegExp(title) }).click();
  await page.getByRole('button', { name: '先认识今天的物件' }).click();
  await page.getByRole('button', { name: '我来动手' }).click();
};
const meaning = async (page: Page) => {
  if (await page.getByRole('button', { name: '我来动手' }).isVisible())
    await page.getByRole('button', { name: '我来动手' }).click();
};
const take = async (page: Page, name: string) => {
  await page.getByRole('button', { name: `拿起${name}`, exact: true }).click();
};
const place = async (page: Page, name: string) => {
  await page.getByRole('button', { name: `放到${name}`, exact: true }).click();
};
const check = async (page: Page) => {
  await page.getByRole('button', { name: '给大咪看看' }).click();
  await expect(page.getByRole('button', { name: '下一段活动' })).toBeVisible();
  await page.getByRole('button', { name: '下一段活动' }).click();
};
const images = async (page: Page) => {
  await expect
    .poll(() =>
      page
        .locator('.scene-game img, .scene-lobby img')
        .evaluateAll((imgs) =>
          imgs.every(
            (i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
};

test('desktop hunt, actual two-item delivery, recovery and no broken artwork', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page);
  await choose(page, '小院寻物', '朋友的两份心意');
  await images(page);
  await take(page, '杯子');
  await page.getByRole('button', { name: '交付找到的物件' }).click();
  await expect(page.getByRole('button', { name: '下一段活动' })).toHaveCount(0);
  await take(page, '勺子');
  await page.getByRole('button', { name: '交付找到的物件' }).click();
  await page.getByRole('button', { name: '下一段活动' }).click();
  await meaning(page);
  await take(page, '书');
  await page.getByRole('button', { name: '暂停小游戏' }).click();
  await expect(page.getByRole('dialog', { name: '小游戏已暂停' })).toBeVisible();
  await page.getByRole('button', { name: '继续玩' }).click();
  await page.reload();
  await page.getByRole('button', { name: '迷你游戏', exact: true }).click();
  await page.getByRole('button', { name: /小院场景小游戏 ·/ }).click();
  await page.getByRole('button', { name: /朋友的两份心意/ }).click();
  await expect(page.getByRole('group', { name: '大咪手里的物件' })).toContainText('放回');
  if (await page.getByRole('dialog', { name: '小游戏已暂停' }).isVisible())
    await page.getByRole('button', { name: '继续玩', exact: true }).click();
  await page.getByRole('button', { name: '交付找到的物件' }).click();
  await page.getByRole('button', { name: '下一段活动' }).click();
  await meaning(page);
  await take(page, '花');
  await page.getByRole('button', { name: '交付找到的物件' }).click();
  await page.screenshot({ path: 'docs/evidence/minigames-vocab/hunt-desktop.png' });
  await page.getByRole('button', { name: '下一段活动' }).click();
  await expect(page.getByText('这次小院活动完成了')).toBeVisible();
});

test('phone memory supports relook and classifies a wrong replacement separately', async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 665 });
  await enter(page);
  await choose(page, '餐桌少了什么', '看看两件');
  await images(page);
  await page.getByRole('button', { name: '看好了，盖上再找' }).click();
  await page.getByRole('button', { name: '揭开餐桌看看' }).click();
  await take(page, '勺子');
  await page.getByRole('button', { name: '补回餐桌' }).click();
  await page.getByRole('button', { name: '给大咪看看' }).click();
  await expect(page.locator('.scene-feedback')).toContainText('再看');
  await page.getByRole('button', { name: '再看一眼' }).click();
  await page.getByRole('button', { name: '看好了，盖上再找' }).click();
  await page.getByRole('button', { name: '揭开餐桌看看' }).click();
  for (const word of ['杯子', '碗', '花']) {
    await take(page, word);
    await page.getByRole('button', { name: '补回餐桌' }).click();
    await check(page);
    if (word !== '花') {
      await meaning(page);
      await page.getByRole('button', { name: '看好了，盖上再找' }).click();
      await page.getByRole('button', { name: '揭开餐桌看看' }).click();
    }
  }
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('tabby.foodtruck.scene-mini.v1') ?? '{}'),
  );
  expect(saved.scenes['memory-0'].attempts[0].dimension).toBe('memory');
  expect(saved.scenes['memory-0'].support).toContain('memory-relook');
  await page.screenshot({ path: 'docs/evidence/minigames-vocab/memory-phone.png' });
});

test('phone sorting accepts both-use containers without English penalties for incomplete moves', async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 665 });
  await enter(page);
  await choose(page, '小仓库整理', '一物多用');
  await take(page, '篮子');
  await place(page, '花园');
  await page.getByRole('button', { name: '给大咪看看' }).click();
  await expect(page.locator('.scene-feedback')).toContainText('还有');
  for (const [word, target] of [
    ['倒水壶', '花园'],
    ['浇水壶', '花园'],
  ]) {
    await take(page, word ?? '');
    await place(page, target ?? '');
  }
  await check(page);
  await meaning(page);
  for (const [word, target] of [
    ['袋子', '厨房'],
    ['餐巾', '厨房'],
    ['叶子', '花园'],
  ]) {
    await take(page, word ?? '');
    await place(page, target ?? '');
  }
  await check(page);
  await meaning(page);
  for (const [word, target] of [
    ['盒子', '花园'],
    ['瓶子', '厨房'],
    ['书', '木架'],
  ]) {
    await take(page, word ?? '');
    await place(page, target ?? '');
  }
  await page.screenshot({ path: 'docs/evidence/minigames-vocab/sort-phone.png' });
  await images(page);
  await check(page);
  await expect(page.getByText('这次小院活动完成了')).toBeVisible();
});

test('phone designer spatial targets and saved free mode use actual objects', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 665 });
  await enter(page);
  await choose(page, '餐桌设计师', '上下里面旁边');
  for (const [word, target] of [
    ['杯子', '桌上'],
    ['球', '篮内'],
    ['球', '桌下'],
    ['椅子', '桌边'],
  ]) {
    await take(page, word ?? '');
    await place(page, target ?? '');
    await check(page);
    if (word !== '椅子') await meaning(page);
  }
  await page.getByRole('button', { name: '继续自由布置' }).click();
  await take(page, '灯');
  await place(page, '桌下');
  await page.getByRole('button', { name: '留下我的布置' }).click();
  await expect(page.locator('.scene-feedback')).toContainText('接着摆');
  await images(page);
  await page.screenshot({ path: 'docs/evidence/minigames-vocab/design-phone.png' });
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('tabby.foodtruck.scene-mini.v1') ?? '{}'),
  );
  expect(saved.scenes['design-0'].mode).toBe('free');
  expect(saved.scenes['design-0'].objects.find((o: { id: string }) => o.id === 'lamp').place).toBe(
    'under',
  );
});

test('desktop theatre follows actual tool and liquid prerequisites with keyboard operation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page);
  await choose(page, '大咪动作小剧场', '朋友的水杯');
  await page.getByRole('button', { name: '倒水杯子', exact: true }).click();
  await expect(page.locator('.scene-feedback')).toContainText('准备');
  await take(page, '杯子');
  await page.getByRole('button', { name: '放到桌上' }).press('Enter');
  await check(page);
  await take(page, '倒水壶');
  await page.getByRole('button', { name: '倒水杯子' }).click();
  await place(page, '桌上');
  await check(page);
  await take(page, '勺子');
  await page.getByRole('button', { name: '搅拌杯子' }).click();
  await place(page, '桌上');
  await check(page);
  await take(page, '碗');
  await place(page, '水槽');
  await page.getByRole('button', { name: '清洗碗' }).click();
  await page.screenshot({ path: 'docs/evidence/minigames-vocab/theatre-desktop.png' });
  await images(page);
  await check(page);
  await expect(page.getByText('这次小院活动完成了')).toBeVisible();
});

test('new vocabulary is reachable in small batches and audio failure keeps support through replay', async ({
  page,
}) => {
  await page.route('**/audio/vocab-*.wav*', (route) => route.abort());
  await page.goto('/');
  await page.getByRole('button', { name: '迷你游戏', exact: true }).click();
  await page.getByRole('button', { name: /小院场景小游戏 ·/ }).click();
  await choose(page, '小院寻物', '帮大咪拿东西');
  await expect(page.getByRole('button', { name: '重试声音' })).toBeVisible();
  await page.getByRole('button', { name: '看图继续' }).click();
  await take(page, '杯子');
  await page.getByRole('button', { name: '交付找到的物件' }).click();
  await page.getByRole('button', { name: '重玩这一组', exact: true }).click();
  await page.getByRole('button', { name: '确认重玩' }).click();
  await page.getByRole('button', { name: '先认识今天的物件' }).click();
  await page.getByRole('button', { name: '我来动手' }).click();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('tabby.foodtruck.scene-mini.v1') ?? '{}'),
  );
  expect(saved.scenes['hunt-0'].support).toContain('answer-help');
  expect(saved.scenes['hunt-0'].heard).toBe(false);
  await page.getByRole('button', { name: '返回游乐角' }).click();
  await page.getByRole('button', { name: '返回游戏小摊' }).click();
  await page.getByRole('button', { name: /主题关卡 ·/ }).click();
  await page.getByRole('button', { name: /认识小院120词/ }).click();
  await expect(page.locator('.course-level-grid article')).toHaveCount(1);
  await page.getByRole('button', { name: '认识下一小组' }).click();
  await expect(page.locator('.library-navigation')).toContainText('第2小组');
});

test('original five mechanics retain normal entry and optional literacy, with hands-on quantity', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: '迷你游戏', exact: true }).click();
  await page.getByRole('button', { name: /主题关卡 ·/ }).click();
  await page.getByRole('button', { name: '开始', exact: true }).first().click();
  await page.getByRole('button', { name: '看看今天的内容' }).click();
  await page.getByRole('button', { name: '我来试试' }).click();
  await page.getByRole('button', { name: '选择苹果', exact: true }).click();
  await expect(page.getByRole('button', { name: '下一份' })).toBeVisible();
  await page.getByRole('button', { name: '← 返回主题' }).click();
  await page.getByRole('button', { name: '多组配对' }).click();
  await page
    .locator('.course-level-grid article')
    .filter({ hasText: '水果标签成组配' })
    .getByRole('button', { name: '开始' })
    .click();
  await page.getByRole('button', { name: '看看今天的内容' }).click();
  await page.getByRole('button', { name: '我来试试' }).click();
  await page.getByRole('button', { name: `选择${wordById('apple')?.chinese}` }).click();
  await expect(page.getByRole('button', { name: '下一份' })).toBeVisible();
  await page.getByRole('button', { name: '← 返回主题' }).click();

  await page.getByRole('button', { name: 'WordSpell' }).click();
  await page.getByRole('button', { name: '认识字母' }).click();
  await page
    .locator('.course-level-grid article')
    .filter({ hasText: '短短的水果词' })
    .getByRole('button', { name: '开始' })
    .click();
  await page.getByRole('button', { name: '看看今天的内容' }).click();
  await page.getByRole('button', { name: '我来试试' }).click();
  for (const letter of 'APPLE')
    await page
      .getByRole('group', { name: '可用词块' })
      .getByRole('button', { name: letter })
      .first()
      .click();
  await page.getByRole('button', { name: '完成这句' }).click();
  await expect(page.getByRole('button', { name: '下一份' })).toBeVisible();
  await page.getByRole('button', { name: '← 返回主题' }).click();

  await page.getByRole('button', { name: '数量与组合' }).click();
  await page
    .locator('.course-level-grid article')
    .filter({ hasText: '一个还是两个' })
    .getByRole('button', { name: '开始' })
    .click();
  await page.getByRole('button', { name: '看看今天的内容' }).click();
  await page.getByRole('button', { name: '我来试试' }).click();
  await page.getByRole('button', { name: '动手摆一盘' }).click();
  await page.getByRole('button', { name: '摆入苹果' }).click();
  await page.getByRole('button', { name: '交付这一盘' }).click();
  await expect(page.getByRole('button', { name: '下一份' })).toBeVisible();
  await page.getByRole('button', { name: '← 返回主题' }).click();

  await page.getByRole('button', { name: '选词组句' }).click();
  await page.getByRole('button', { name: '愿意组句' }).click();
  await expect(page.locator('.course-level-grid article')).toHaveCount(6);
  await page
    .locator('.course-level-grid article')
    .filter({ hasText: '请给我一个' })
    .getByRole('button', { name: '开始' })
    .click();
  await page.getByRole('button', { name: '看看今天的内容' }).click();
  await page.getByRole('button', { name: '我来试试' }).click();
  for (const word of ['An', 'apple', 'please'])
    await page
      .getByRole('group', { name: '可用词块' })
      .getByRole('button', { name: word })
      .first()
      .click();
  await page.getByRole('button', { name: '完成这句' }).click();
  await expect(page.getByRole('button', { name: '下一份' })).toBeVisible();
});

test('yard minigames return to the activity and preserve adventure and free-kitchen entry', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  await page.getByRole('button', { name: '去小院游乐角' }).click();
  await page.getByRole('button', { name: '← 小院', exact: true }).click();
  await expect(page.getByRole('region', { name: '小院活动桌' })).toBeVisible();
  await page.getByRole('button', { name: '返回小院', exact: true }).click();
  await page.getByRole('button', { name: '自由开店', exact: true }).click();
  await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  await expect(page.locator('canvas')).toBeVisible();
  await page.getByRole('button', { name: '我来试试', exact: true }).click();
  await expect(page.getByRole('group', { name: '餐车操作' })).toBeVisible();
  await page.getByRole('button', { name: '拿苹果', exact: true }).click();
  await page.getByRole('button', { name: '1号托盘：放入食品或选择整盘', exact: true }).click();
  await expect
    .poll(async () => (await worldState(page)).items.some((i) => i.product === 'apple'))
    .toBe(true);
});
test('phone five-cup layout and theatre controls remain visible and individually usable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 665 });
  await enter(page);
  await choose(page, '餐桌设计师', '几位朋友');
  for (let count = 1; count <= 5; count++) {
    const bank = page.locator('.scene-bank').getByRole('button', { name: '拿起杯子', exact: true });
    for (let i = 0; i < count; i++) {
      await bank.first().click();
      await place(page, '桌上');
    }
    if (count === 5) {
      const props = page.locator('.place-on .scene-prop');
      await expect(props).toHaveCount(5);
      for (const prop of await props.all()) {
        const box = await prop.boundingBox();
        expect(box).not.toBeNull();
        if (!box) throw Error('prop');
        expect(box.y + box.height).toBeLessThan(665);
        await prop.click();
        await place(page, '桌上');
      }
      const submit = await page.getByRole('button', { name: '给大咪看看' }).boundingBox();
      expect(submit?.y ?? 9999).toBeLessThan(617);
      await page.screenshot({ path: 'docs/evidence/minigames-vocab/designer-five-phone.png' });
    }
    await check(page);
    if (count < 5) await meaning(page);
  }
  await page.getByRole('button', { name: '返回游乐角' }).click();
  await choose(page, '大咪动作小剧场', '朋友的水杯');
  await page.getByRole('button', { name: '看图示范' }).click();
  await expect(page.getByRole('dialog', { name: '物件与动作示范' })).toBeVisible();
  await page.screenshot({ path: 'docs/evidence/minigames-vocab/theatre-help-phone.png' });
  await page.getByRole('button', { name: '收起图示，自己试试' }).click();
  const checkBox = await page.getByRole('button', { name: '给大咪看看' }).boundingBox();
  expect(checkBox?.y ?? 9999).toBeLessThan(617);
  await images(page);
  await page.screenshot({ path: 'docs/evidence/minigames-vocab/theatre-phone.png' });
});
