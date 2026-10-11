# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: demo-repair.spec.ts >> individual food and the whole tray remain distinct through touch, rehearing and delivery
- Location: e2e/demo-repair.spec.ts:49:1

# Error details

```
TimeoutError: locator.tap: Timeout 12000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: '点请求气泡重听', exact: true })

```

# Page snapshot

```yaml
- main [ref=e3]:
  - img "英语餐车游戏画面" [ref=e4]
  - generic:
    - generic:
      - button "暂停" [ref=e6] [cursor=pointer]: Ⅱ
      - button "到活动桌" [ref=e7] [cursor=pointer]
      - region "图示下一步":
        - button "图示下一步：听请求，做食物，再交给这位朋友。" [ref=e13] [cursor=pointer]:
          - generic [ref=e15]:
            - img "苹果"
            - img "数量1" [ref=e16]: ●
        - button "重听下一步" [ref=e17] [cursor=pointer]: ♫
    - group "餐车操作":
      - button "客人A·兔兔：拿盘交付，空手重听请求"
      - button "果汁机苹果入口"
      - button "果汁机杯座"
      - button "▶ 榨成果汁" [ref=e18] [cursor=pointer]
      - button "切换果汁机" [ref=e19] [cursor=pointer]
      - button "请大咪帮忙"
      - button "1号托盘：放入食品或选择整盘"
      - button "拿起或放下1号整盘" [active] [pressed] [ref=e20] [cursor=pointer]
      - button "2号托盘：放入食品或选择整盘"
      - button "拿起或放下2号整盘" [ref=e21] [cursor=pointer]
      - button "拿苹果"
      - button "拿香蕉"
      - button "拿空杯"
      - button "苹果，1号盘"
      - button "香蕉，1号盘"
    - region "英语交流":
      - generic:
        - button "重听客人A的请求" [pressed] [ref=e22] [cursor=pointer]: A ♫
        - generic: 兔兔
        - button "图示帮助" [ref=e23] [cursor=pointer]: ▧
        - group:
          - generic "回看最近交流": ↶
      - generic:
        - button "重听兔兔：Can I have an apple, please?" [ref=e24] [cursor=pointer]:
          - text: Can I have an
          - strong [ref=e25]: apple
          - text: ", please?"
        - button "播放整句：Can I have an apple, please?" [ref=e26] [cursor=pointer]: ▶
        - generic: 可播放整句
    - generic:
      - status: 餐盘拿好了 → 点朋友递出；点气泡可再听
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | import { SCENE_KEY } from '../src/platform/minis';
  3   | import { evidencePath, startStory, state, tap } from './helpers';
  4   | 
  5   | test.use({ hasTouch: true, isMobile: true });
  6   | 
  7   | test('scene pause and restart isolate background, trap focus and restore the trigger', async ({
  8   |   page,
  9   | }) => {
  10  |   await page.goto('/');
  11  |   await page.getByRole('button', { name: '迷你游戏', exact: true }).click();
  12  |   await page.getByRole('button', { name: /小院场景小游戏 ·/ }).click();
  13  |   await page.getByRole('button', { name: /朋友的两份心意/ }).click();
  14  |   await page.getByRole('button', { name: '先认识今天的物件' }).click();
  15  |   await page.getByRole('button', { name: '我来动手' }).click();
  16  |   await page.getByRole('button', { name: '拿起杯子', exact: true }).click();
  17  |   const before = await page.evaluate((key) => localStorage.getItem(key), SCENE_KEY);
  18  |   const pause = page.getByRole('button', { name: '暂停小游戏' });
  19  |   await pause.click();
  20  |   const dialog = page.getByRole('dialog', { name: '小游戏已暂停' });
  21  |   await expect(dialog.getByRole('button', { name: '继续玩' })).toBeFocused();
  22  |   for (let i = 0; i < 6; i++) {
  23  |     await page.keyboard.press(i % 2 ? 'Shift+Tab' : 'Tab');
  24  |     expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  25  |   }
  26  |   // A programmatic attempt to focus the background must also be redirected.
  27  |   await page
  28  |     .locator('.scene-top button')
  29  |     .first()
  30  |     .evaluate((el) => (el as HTMLElement).focus());
  31  |   expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  32  |   await dialog.getByRole('button', { name: '继续玩' }).click();
  33  |   await expect(pause).toBeFocused();
  34  |   await expect(page.getByRole('group', { name: '大咪手里的物件' })).toContainText('放回');
  35  |   expect(before).not.toBeNull();
  36  |   expect(await page.evaluate((key) => localStorage.getItem(key), SCENE_KEY)).toBe(before);
  37  |   const restart = page.getByRole('button', { name: '重玩这一组', exact: true });
  38  |   await restart.click();
  39  |   const confirm = page.getByRole('dialog', { name: '重玩场景小游戏' });
  40  |   await expect(confirm.getByRole('button', { name: '继续这一轮' })).toBeFocused();
  41  |   await page.keyboard.press('Shift+Tab');
  42  |   await page.keyboard.press('Shift+Tab');
  43  |   expect(await confirm.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  44  |   await confirm.getByRole('button', { name: '继续这一轮' }).click();
  45  |   await expect(restart).toBeFocused();
  46  |   expect((await state(page)).items).toEqual([]);
  47  | });
  48  | 
  49  | test('individual food and the whole tray remain distinct through touch, rehearing and delivery', async ({
  50  |   page,
  51  | }) => {
  52  |   await page.setViewportSize({ width: 393, height: 665 });
  53  |   await startStory(page);
  54  |   await tap(page, 'tray-0');
  55  |   await tap(page, 'supply-apple');
  56  |   await tap(page, 'supply-banana');
  57  |   const foods = (await state(page)).items;
  58  |   const apple = foods.find((i) => i.product === 'apple');
  59  |   const banana = foods.find((i) => i.product === 'banana');
  60  |   if (!apple || !banana) throw Error('actual food missing');
  61  |   for (const size of [
  62  |     { width: 393, height: 665 },
  63  |     { width: 768, height: 1024 },
  64  |     { width: 852, height: 300 },
  65  |   ]) {
  66  |     await page.setViewportSize(size);
  67  |     for (const tray of [0, 1]) {
  68  |       const body = await page.locator(`[data-hotspot="tray-${tray}"]`).boundingBox();
  69  |       const handle = page.locator(`[data-hotspot="lift-tray-${tray}"]`);
  70  |       await expect(handle).toBeInViewport({ ratio: 1 });
  71  |       const box = await handle.boundingBox();
  72  |       if (!body || !box) throw Error('missing tray geometry');
  73  |       expect(box.x + box.width + 8).toBeLessThanOrEqual(body.x + 0.01);
  74  |       expect(box.width).toBeGreaterThanOrEqual(48);
  75  |       expect(box.height).toBeGreaterThanOrEqual(48);
  76  |       expect(
  77  |         await handle.evaluate((el) => {
  78  |           const r = el.getBoundingClientRect();
  79  |           return [0.25, 0.5, 0.75].every((n) => {
  80  |             const hit = document.elementFromPoint(r.x + r.width * n, r.y + r.height / 2);
  81  |             return hit === el || (!!hit && el.contains(hit));
  82  |           });
  83  |         }),
  84  |       ).toBe(true);
  85  |     }
  86  |   }
  87  |   await page.setViewportSize({ width: 393, height: 665 });
  88  |   await tap(page, `item-${banana.id}`);
  89  |   await expect(page.locator(`[data-hotspot="item-${banana.id}"]`)).toHaveAttribute(
  90  |     'aria-pressed',
  91  |     'true',
  92  |   );
  93  |   await page.screenshot({ path: evidencePath('individual-food-phone.png') });
  94  |   const handle = page.locator('[data-hotspot="lift-tray-0"]');
  95  |   await handle.tap();
  96  |   await expect(handle).toHaveAttribute('aria-pressed', 'true');
  97  |   expect((await state(page)).items).toEqual(foods);
  98  |   await page.screenshot({ path: evidencePath('whole-tray-phone.png') });
> 99  |   await page.getByRole('button', { name: '点请求气泡重听', exact: true }).tap();
      |                                                                    ^ TimeoutError: locator.tap: Timeout 12000ms exceeded.
  100 |   await expect(handle).toHaveAttribute('aria-pressed', 'true');
  101 |   await handle.tap();
  102 |   await expect(handle).toHaveAttribute('aria-pressed', 'false');
  103 |   expect((await state(page)).items).toEqual(foods);
  104 |   await tap(page, `item-${banana.id}`);
  105 |   const body = page.locator('[data-hotspot="tray-1"]');
  106 |   const bodyBox = await body.boundingBox();
  107 |   if (!bodyBox) throw Error('plate body missing');
  108 |   await page.touchscreen.tap(bodyBox.x + bodyBox.width / 2, bodyBox.y + bodyBox.height * 0.75);
  109 |   await expect
  110 |     .poll(async () => (await state(page)).items.find((i) => i.id === banana.id)?.location)
  111 |     .toMatch(/^tray:1:/);
  112 |   await handle.tap();
  113 |   const order = (await state(page)).orders.find((o) => o.status === 'waiting');
  114 |   if (!order) throw Error('guest missing');
  115 |   await tap(page, order.id, 20);
  116 |   await expect
  117 |     .poll(async () => (await state(page)).adventure?.foods.some((i) => i.product === 'apple'), {
  118 |       timeout: 15000,
  119 |     })
  120 |     .toBe(true);
  121 |   expect((await state(page)).attempts.filter((a) => a.activity === 'delivery')).toHaveLength(1);
  122 |   expect((await state(page)).items.find((i) => i.id === banana.id)?.location).toMatch(/^tray:1:/);
  123 |   await page.getByRole('button', { name: '到活动桌', exact: true }).tap();
  124 |   await expect(page.locator('.goal-guide')).not.toHaveAttribute('data-guide', 'wait');
  125 |   const hint = await page.locator('.goal-pictures').getAttribute('aria-label');
  126 |   await expect(page.locator('.world-feedback')).not.toContainText('正在送过去');
  127 |   await expect(page.locator('.world-feedback')).toHaveText(
  128 |     hint?.replace('图示下一步：', '') ?? 'missing guide',
  129 |   );
  130 |   await page.screenshot({ path: evidencePath('received-current-goal-phone.png') });
  131 | });
  132 | 
  133 | test('optional visual contrasts preserve assistance and leave the choice to the player', async ({
  134 |   page,
  135 | }) => {
  136 |   await page.setViewportSize({ width: 393, height: 665 });
  137 |   await startStory(page);
  138 |   const helpTrigger = page.locator('[data-hotspot="note"]');
  139 |   await helpTrigger.focus();
  140 |   await helpTrigger.press('Enter');
  141 |   await page.getByRole('button', { name: '看食物和份数对比', exact: true }).tap();
  142 |   const contrast = page.getByRole('region', { name: '食物和份数图音对比' });
  143 |   await expect(contrast.getByRole('img', { name: '汉堡', exact: true })).toBeVisible();
  144 |   await expect(contrast.getByRole('img', { name: '芝士汉堡', exact: true })).toBeVisible();
  145 |   await contrast
  146 |     .locator('img')
  147 |     .evaluateAll((images) => Promise.all(images.map((img) => (img as HTMLImageElement).decode())));
  148 |   await page.screenshot({ path: evidencePath('burger-contrast-phone.png') });
  149 |   await contrast.getByRole('button', { name: '杯和筒', exact: true }).tap();
  150 |   await expect(contrast.getByRole('img', { name: '香草冰淇淋杯', exact: true })).toBeVisible();
  151 |   await expect(contrast.getByRole('img', { name: '香草蛋筒', exact: true })).toBeVisible();
  152 |   await contrast
  153 |     .locator('img')
  154 |     .evaluateAll((images) => Promise.all(images.map((img) => (img as HTMLImageElement).decode())));
  155 |   await page.screenshot({ path: evidencePath('cup-cone-contrast-phone.png') });
  156 |   await contrast.getByRole('button', { name: '一份和两份', exact: true }).tap();
  157 |   await expect(contrast.getByRole('img', { name: '苹果', exact: true })).toHaveCount(3);
  158 |   await contrast.getByRole('button', { name: '听两份', exact: true }).tap();
  159 |   await contrast
  160 |     .locator('img')
  161 |     .evaluateAll((images) => Promise.all(images.map((img) => (img as HTMLImageElement).decode())));
  162 |   await page.screenshot({ path: evidencePath('quantity-contrast-phone.png') });
  163 |   await contrast.getByRole('button', { name: '两种壶', exact: true }).tap();
  164 |   await expect(contrast.getByRole('button', { name: '听倒水的壶', exact: true })).toBeVisible();
  165 |   await contrast
  166 |     .locator('img')
  167 |     .evaluateAll((images) => Promise.all(images.map((img) => (img as HTMLImageElement).decode())));
  168 |   await page.screenshot({ path: evidencePath('vessel-contrast-phone.png') });
  169 |   await page.getByRole('button', { name: '回去自己做', exact: true }).tap();
  170 |   await expect(helpTrigger).toBeFocused();
  171 |   expect((await state(page)).orders[0]?.support).toContain('visual-contrast');
  172 |   expect((await state(page)).items).toEqual([]);
  173 |   expect((await state(page)).attempts).toEqual([]);
  174 |   await page.reload();
  175 |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).tap();
  176 |   expect((await state(page)).orders[0]?.support).toContain('visual-contrast');
  177 | });
  178 | 
  179 | test('home main invitation and autonomous entrances are physically reachable in compact layouts', async ({
  180 |   page,
  181 | }) => {
  182 |   await page.goto('/');
  183 |   for (const size of [
  184 |     { width: 393, height: 665 },
  185 |     { width: 768, height: 1024 },
  186 |     { width: 852, height: 300 },
  187 |   ]) {
  188 |     await page.setViewportSize(size);
  189 |     for (const name of [
  190 |       '正在准备 · 晨光开门',
  191 |       '自由开店',
  192 |       '迷你游戏',
  193 |       '教学练习',
  194 |       '旧食谱 · 回访活动与作品',
  195 |     ]) {
  196 |       const button = page.getByRole('button', { name, exact: true });
  197 |       await expect(button).toBeInViewport({ ratio: 1 });
  198 |       expect(
  199 |         await button.evaluate((el) => {
```