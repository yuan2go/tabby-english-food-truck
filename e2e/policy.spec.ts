import { writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { lesson, serve, startEndless, state } from './helpers';

test.use({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2, hasTouch: true });
test('M2 increased support preserves active orders, reduces new concurrency and survives reload', async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await startEndless(page);
  const before = await state(page);
  expect(before.orders).toHaveLength(2);
  await page.getByRole('button', { name: '暂停', exact: true }).tap();
  await page.getByRole('button', { name: '保存并回到首页' }).tap();
  await page.locator('.yard-endless .entry-main').tap();
  await page.getByRole('button', { name: '先看小猫做', exact: true }).tap();
  await page.getByRole('button', { name: '开始 / 继续', exact: true }).tap();
  await lesson(page);
  const assisted = await state(page);
  expect(assisted.orders.map((o) => [o.id, o.request])).toEqual(
    before.orders.map((o) => [o.id, o.request]),
  );
  expect(assisted.session.support).toBe('demonstration');
  await serve(page);
  await lesson(page);
  expect((await state(page)).orders).toHaveLength(1);
  expect((await state(page)).session.cursor).toBe(before.session.cursor);
  await page.getByRole('button', { name: '暂停', exact: true }).tap();
  const saved = await state(page);
  await page.reload();
  await page.locator('.yard-endless .entry-main').tap();
  await page.getByRole('button', { name: '开始 / 继续', exact: true }).tap();
  await lesson(page);
  expect((await state(page)).runId).toBe(saved.runId);
  expect((await state(page)).orders.map((o) => o.id)).toEqual(saved.orders.map((o) => o.id));
  await serve(page);
  expect((await state(page)).orders).toHaveLength(1);
  expect(['apple', 'banana', 'juice', 'banana-juice']).toContain(
    (await state(page)).orders[0]?.request,
  );
  await page.screenshot({ path: info.outputPath('support-policy.png') });
  const root = page.locator('main');
  await writeFile(
    info.outputPath('build.json'),
    JSON.stringify(
      {
        sha: await root.getAttribute('data-build-sha'),
        dirty: await root.getAttribute('data-build-dirty'),
        assets: await root.getAttribute('data-asset-version'),
      },
      null,
      2,
    ),
  );
});
