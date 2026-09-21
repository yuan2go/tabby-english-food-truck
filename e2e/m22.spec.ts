import { expect, test } from '@playwright/test';
import { lesson, startStory, state, tap } from './helpers';

test.use({
  viewport: { width: 393, height: 665 },
  deviceScaleFactor: 3,
  hasTouch: true,
  isMobile: true,
});
test('M22 two-tap fruit, four-tap juice, pause and measured unobscured supplies', async ({
  page,
}, info) => {
  await startStory(page);
  expect(await page.locator('.prep-selector,.request-tools,.family-tabs').count()).toBe(0);
  const hit = async (id: string) => {
    const h = page.locator(`[data-hotspot="${id}"]`);
    await expect
      .poll(() =>
        h.evaluate((e) => {
          const r = e.getBoundingClientRect(),
            top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
          return (
            r.width >= 44 &&
            r.height >= 44 &&
            r.bottom <= innerHeight &&
            (top?.tagName === 'CANVAS' || top === e)
          );
        }),
      )
      .toBe(true);
  };
  await hit('supply-apple');
  await tap(page, 'supply-apple');
  await page.getByRole('button', { name: '送餐 ↗', exact: true }).tap();
  await expect
    .poll(async () => (await state(page)).orders[0]?.status, { timeout: 18000 })
    .toBe('done');
  await lesson(page);
  await hit('machine-apple');
  await tap(page, 'machine-apple');
  await tap(page, 'supply-apple');
  await tap(page, 'start');
  await expect.poll(async () => (await state(page)).routing.machine !== null).toBe(true);
  await page.getByRole('button', { name: '暂停', exact: true }).tap();
  expect(await page.getByRole('dialog').getByRole('button').count()).toBe(3);
  await page.getByRole('button', { name: '继续营业', exact: true }).tap();
  await expect
    .poll(
      async () =>
        (await state(page)).items.some(
          (i) => i.product === 'juice' && i.location.startsWith('tray:'),
        ),
      { timeout: 15000 },
    )
    .toBe(true);
  await page.screenshot({ path: info.outputPath('juice-393x665-dpr3.png') });
  await page.getByRole('button', { name: '送餐 ↗', exact: true }).tap();
  await expect
    .poll(async () => (await state(page)).orders[1]?.status, { timeout: 18000 })
    .toBe('done');
  await lesson(page);
  for (const h of [565, 759, 665]) {
    await page.setViewportSize({ width: 393, height: h });
    await hit('supply-apple');
  }
  await page.setViewportSize({ width: 852, height: 393 });
  await hit('supply-apple');
  await hit('note');
  await page.screenshot({ path: info.outputPath('landscape.png') });
});
