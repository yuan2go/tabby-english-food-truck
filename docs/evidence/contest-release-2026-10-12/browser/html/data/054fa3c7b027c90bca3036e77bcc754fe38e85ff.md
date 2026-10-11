# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: immersion.spec.ts >> phone: held tray and two guests replay without delivery; cancellation, pause, failure and short landscape
- Location: e2e/immersion.spec.ts:112:1

# Error details

```
Error: guest-0

expect(received).toBe(expected) // Object.is equality

Expected: false
Received: true
```

# Page snapshot

```yaml
- main [ref=e3]:
  - img "英语餐车游戏画面" [ref=e4]
  - generic:
    - generic:
      - button "暂停" [ref=e6] [cursor=pointer]: Ⅱ
      - generic: 晨光开门
      - button "到活动桌" [ref=e7] [cursor=pointer]
      - region "图示下一步":
        - button "图示下一步：听请求，做食物，再交给这位朋友。" [ref=e13] [cursor=pointer]:
          - generic [ref=e15]:
            - img "苹果"
            - img "数量1" [ref=e16]: ●
        - button "重听下一步" [ref=e17] [cursor=pointer]: ♫
    - group "餐车操作":
      - button "客人A·兔兔：拿盘交付，空手重听请求"
      - button "客人B·刺刺：拿盘交付，空手重听请求"
      - button "果汁机苹果入口"
      - button "果汁机杯座"
      - button "▶ 榨成果汁" [ref=e18] [cursor=pointer]
      - button "切换果汁机" [ref=e19] [cursor=pointer]
      - button "请大咪帮忙"
      - button "1号托盘：放入食品或选择整盘"
      - button "拿起或放下1号整盘" [pressed] [ref=e20] [cursor=pointer]
      - button "2号托盘：放入食品或选择整盘"
      - button "拿起或放下2号整盘" [ref=e21] [cursor=pointer]
      - button "拿苹果"
      - button "拿香蕉"
      - button "拿空杯"
      - button "苹果，1号盘"
    - region "英语交流":
      - generic:
        - button "重听客人A的请求" [ref=e22] [cursor=pointer]: A ♫
        - button "重听客人B的请求" [pressed] [ref=e23] [cursor=pointer]: B ♫
        - button "图示帮助" [ref=e24] [cursor=pointer]: ▧
        - group:
          - generic "回看最近交流": ↶
      - generic:
        - button "重听刺刺：Can I have a banana, please?" [ref=e25] [cursor=pointer]:
          - text: Can I have a
          - strong [ref=e26]: banana
          - text: ", please?"
        - button "播放整句：Can I have a banana, please?" [active] [ref=e27] [cursor=pointer]: ▶
        - generic: 可播放整句
    - generic:
      - status: 餐盘拿好了 → 点朋友递出；点气泡可再听
```

# Test source

```ts
  115 |   await page.setViewportSize({ width: 393, height: 665 });
  116 |   await page.goto('/');
  117 |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  118 |   await page.getByRole('button', { name: '一起接待两位', exact: true }).click();
  119 |   await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  120 |   await lesson(page);
  121 |   await choosePrep(page, '● 1号盘');
  122 |   await tap(page, 'supply-apple');
  123 |   await tap(page, 'lift-tray-0');
  124 |   const before = await state(page);
  125 |   await page.getByRole('button', { name: '重听客人A的请求', exact: true }).click();
  126 |   const play = page.getByRole('button', {
  127 |     name: '播放整句：Can I have an apple, please?',
  128 |     exact: true,
  129 |   });
  130 |   await play.click();
  131 |   await play.click();
  132 |   await expect
  133 |     .poll(
  134 |       async () =>
  135 |         JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}').active,
  136 |     )
  137 |     .toContain('imm-order-apple');
  138 |   expect((await state(page)).items).toEqual(before.items);
  139 |   expect((await state(page)).attempts).toEqual(before.attempts);
  140 |   await page.getByRole('button', { name: '重听客人B的请求', exact: true }).click();
  141 |   await lesson(page);
  142 |   await expect(sentence(page)).toHaveText('Can I have a banana, please?');
  143 |   await page
  144 |     .getByRole('button', { name: '播放整句：Can I have a banana, please?', exact: true })
  145 |     .click();
  146 |   await page.getByRole('button', { name: '暂停', exact: true }).click();
  147 |   await expect
  148 |     .poll(
  149 |       async () =>
  150 |         JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}').active,
  151 |     )
  152 |     .toBeNull();
  153 |   const paused = await state(page);
  154 |   await page.waitForTimeout(150);
  155 |   expect((await state(page)).gameTime).toBe(paused.gameTime);
  156 |   await page.getByRole('button', { name: '继续营业', exact: true }).click();
  157 |   await page.route('**/audio/imm-order-*.wav*', (r) => r.abort());
  158 |   await page
  159 |     .getByRole('button', { name: '播放整句：Can I have a banana, please?', exact: true })
  160 |     .click();
  161 |   await expect
  162 |     .poll(
  163 |       async () =>
  164 |         JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}').failure
  165 |           ?.kind,
  166 |     )
  167 |     .toBeTruthy();
  168 |   await expect(sentence(page)).toHaveText('Can I have a banana, please?');
  169 |   await page.unroute('**/audio/imm-order-*.wav*');
  170 |   await page
  171 |     .getByRole('button', { name: '播放整句：Can I have a banana, please?', exact: true })
  172 |     .click();
  173 |   await expect
  174 |     .poll(
  175 |       async () =>
  176 |         JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}').active,
  177 |     )
  178 |     .toBe('imm-order-banana');
  179 |   await expect
  180 |     .poll(
  181 |       async () =>
  182 |         JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}').failure,
  183 |     )
  184 |     .toBeNull();
  185 |   await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  186 |   await expect
  187 |     .poll(
  188 |       async () =>
  189 |         JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}').active,
  190 |     )
  191 |     .toBeNull();
  192 |   const suspended = await state(page);
  193 |   await page.waitForTimeout(150);
  194 |   expect((await state(page)).gameTime).toBe(suspended.gameTime);
  195 |   await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  196 |   await expect
  197 |     .poll(
  198 |       async () =>
  199 |         JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}').active,
  200 |     )
  201 |     .toBeNull();
  202 |   await expect(sentence(page)).toHaveText('Can I have a banana, please?');
  203 |   await page.screenshot({ path: info.outputPath('phone-request.png') });
  204 |   await page.setViewportSize({ width: 852, height: 393 });
  205 |   const panel = await page.locator('.conversation').boundingBox();
  206 |   expect(panel).toBeTruthy();
  207 |   if (!panel) throw Error('sentence panel missing');
  208 |   for (const id of ['supply-apple', 'tray-0', before.orders[0]?.id ?? 'guest-0']) {
  209 |     const b = await page.locator(`[data-hotspot="${id}"]`).boundingBox();
  210 |     if (!b) throw Error(id);
  211 |     expect(
  212 |       Math.max(panel.x, b.x) < Math.min(panel.x + panel.width, b.x + b.width) &&
  213 |         Math.max(panel.y, b.y) < Math.min(panel.y + panel.height, b.y + b.height),
  214 |       id,
> 215 |     ).toBe(false);
      |       ^ Error: guest-0
  216 |   }
  217 |   expect((await state(page)).attempts).toEqual(before.attempts);
  218 |   await page.screenshot({ path: info.outputPath('short-landscape.png') });
  219 | });
  220 | 
```