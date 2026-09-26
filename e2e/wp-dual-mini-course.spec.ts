import { expect, test } from '@playwright/test';
import { REQUESTS } from '../src/content/catalog';
import { wordById } from '../src/content/learning';
import { MINI_LEVELS } from '../src/content/mini-levels';

test('theme lobby reaches a four-task listening level and restores its progress', async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.goto('/');
  await page.locator('.yard-mini .entry-main').click();
  await page.getByRole('button', { name: /主题关卡 ·/ }).click();
  await expect(page.getByRole('region', { name: '主题关卡' })).toBeVisible();
  await page.screenshot({
    path: 'docs/evidence/dual-layout-playflow/mini-theme-phone-390x844.png',
  });
  await page.getByRole('button', { name: '开始', exact: true }).first().click();
  const level = MINI_LEVELS[0];
  if (!level) throw Error('missing first level');
  await page.getByRole('button', { name: '看看今天的内容' }).click();
  for (const [index, target] of level.targets.entries()) {
    await expect(page.locator('.course-progress')).toContainText(
      `${index + 1}/${level.targets.length}`,
    );
    await page.getByRole('button', { name: '我来试试' }).click();
    const name = wordById(target)?.chinese;
    if (!name) throw Error(`missing ${target}`);
    await page.getByRole('button', { name: `选择${name}` }).click();
    await expect(page.locator('.course-prompt + .course-choice-grid')).toBeVisible();
    await page.getByRole('button', { name: '下一份' }).click();
  }
  await expect(page.locator('.course-done')).toBeVisible();
  await page.getByRole('button', { name: '回主题关卡' }).click();
  await expect(page.getByRole('region', { name: '主题关卡' })).toContainText('✓ 完成');
  await page.reload();
  await page.locator('.yard-mini .entry-main').click();
  await page.getByRole('button', { name: /主题关卡 ·/ }).click();
  await expect(page.getByRole('region', { name: '主题关卡' })).toContainText('✓ 完成');
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
  await page.getByRole('button', { name: `选择${REQUESTS.apple.explanation}` }).click();
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
