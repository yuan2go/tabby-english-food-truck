# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: wp-dual-growth.spec.ts >> deferred menu introduction returns after another completed order
- Location: e2e/wp-dual-growth.spec.ts:4:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByRole('dialog', { name: '今日新菜单' })
Expected substring: "Apple juice"
Received string:    "大咪发现一个新味道这次先不加 ↗认识后，再放上菜单Can I have some apple juice, please?♫→这里的果汁是一杯。点机器，自己选水果，启动后会放到绑定的盘里。加入今日菜单这是认识新菜单，不是考试。随时可请大咪帮忙。"
Timeout: 6000ms

Call log:
  - Expect "toContainText" getByRole('dialog', { name: '今日新菜单' }) with timeout 6000ms
  - waiting for getByRole('dialog', { name: '今日新菜单' })
    15 × locator resolved to <section role="dialog" aria-modal="true" aria-label="今日新菜单" class="lesson-dialog short-lesson">…</section>
       - unexpected value "大咪发现一个新味道这次先不加 ↗认识后，再放上菜单Can I have some apple juice, please?♫→这里的果汁是一杯。点机器，自己选水果，启动后会放到绑定的盘里。加入今日菜单这是认识新菜单，不是考试。随时可请大咪帮忙。"

```

```yaml
- dialog "今日新菜单":
  - text: 大咪发现一个新味道
  - button "这次先不加 ↗"
  - heading "认识后，再放上菜单" [level=2]
  - button "听新菜单":
    - img "苹果汁"
    - strong: Can I have some apple juice, please?
    - text: ♫
  - img "苹果"
  - img "空杯"
  - text: →
  - img "苹果汁"
  - paragraph: 这里的果汁是一杯。点机器，自己选水果，启动后会放到绑定的盘里。
  - button "加入今日菜单"
  - text: 这是认识新菜单，不是考试。随时可请大咪帮忙。
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | import { hot, state } from './helpers';
  3  | 
  4  | test('deferred menu introduction returns after another completed order', async ({ page }) => {
  5  |   test.setTimeout(90000);
  6  |   await page.setViewportSize({ width: 1440, height: 900 });
  7  |   await page.goto('/');
  8  |   await page.locator('.yard-endless .entry-main').click();
  9  |   await page.getByRole('button', { name: '开门 / 继续营业' }).click();
  10 |   const firstLesson = page.getByRole('dialog', { name: '场景小教学' });
  11 |   if (await firstLesson.count())
  12 |     await firstLesson.getByRole('button', { name: '我来试试', exact: true }).click();
  13 |   for (let served = 1; served <= 2; served++) {
  14 |     const tray = await hot(page, 'tray-0', 26);
  15 |     await page.mouse.click(tray.x, tray.y);
  16 |     const point = await hot(page, 'supply-apple');
  17 |     await page.mouse.click(point.x, point.y);
  18 |     await page.mouse.click(tray.x, tray.y);
  19 |     const order = (await state(page)).orders.find((guest) => guest.status === 'waiting');
  20 |     if (!order) throw Error('no waiting guest');
  21 |     const guest = await hot(page, order.id, 20);
  22 |     await page.mouse.click(guest.x, guest.y);
  23 |     await expect(page.getByRole('dialog', { name: '今日新菜单' })).toBeVisible({
  24 |       timeout: 20000,
  25 |     });
  26 |     if (served === 1) await page.getByRole('button', { name: '这次先不加 ↗' }).click();
  27 |     else await page.getByRole('button', { name: '加入今日菜单' }).click();
  28 |   }
> 29 |   await expect(page.getByRole('dialog', { name: '今日新菜单' })).toContainText('Apple juice');
     |                                                             ^ Error: expect(locator).toContainText(expected) failed
  30 |   const menu = await page.evaluate(() => {
  31 |     const raw = localStorage.getItem('tabby.foodtruck.profile.m2');
  32 |     return raw ? JSON.parse(raw).presented : [];
  33 |   });
  34 |   expect(menu).toContain('menu:banana');
  35 | });
  36 | 
```