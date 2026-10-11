# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: minigames-vocab.spec.ts >> phone five-cup layout and theatre controls remain visible and individually usable
- Location: e2e/minigames-vocab.spec.ts:359:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('dialog', { name: '物件与动作示范' })
Expected: visible
Timeout: 6000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('dialog', { name: '物件与动作示范' }) with timeout 6000ms
  - waiting for getByRole('dialog', { name: '物件与动作示范' })

```

```yaml
- main:
  - img "英语餐车游戏画面"
  - region "大咪动作小剧场 · 朋友的水杯":
    - button "返回游乐角"
    - heading "大咪动作小剧场 换一种玩法 · 1/4" [level=2]
    - button "暂停小游戏": 暂停
    - button "重听场景请求"
    - paragraph: Put the cup on the table.
    - button "看图示范"
    - region "物件与动作示范":
      - button "收起图示，自己试试"
      - img "杯子"
      - img "桌子"
      - img "Put the cup on the table.":
        - img "桌子"
        - img "大咪演示"
        - img "球"
      - text: 按图示动手，帮助会保留。
    - img "大咪响应你做的动作"
    - button "拿起杯子":
      - img "杯子"
    - button "拿起倒水壶":
      - img "倒水壶"
    - text: 里面有水
    - button "拿起勺子":
      - img "勺子"
    - button "拿起碗":
      - img "碗"
    - group "大咪手里的物件":
      - text: 先点物件
      - button "放回物件" [disabled]: 放回
    - button "放到桌上":
      - img "桌子"
      - text: 桌上
    - button "放到水槽":
      - img "碗"
      - text: 水槽
    - button "倒水杯子": 倒水
    - button "搅拌杯子": 搅拌
    - button "清洗碗": 清洗
    - button "撤回一步" [disabled]
    - button "给大咪看看"
    - status: 看看图示和动作，再自己试试。
    - button "重玩这一组"
    - text: 开发语音未听审 · 没有计时与能力评分
```

# Test source

```ts
  303 |   await page.getByRole('button', { name: '数量与组合' }).click();
  304 |   await page
  305 |     .locator('.course-level-grid article')
  306 |     .filter({ hasText: '一个还是两个' })
  307 |     .getByRole('button', { name: '开始' })
  308 |     .click();
  309 |   await page.getByRole('button', { name: '看看今天的内容' }).click();
  310 |   await page.getByRole('button', { name: '我来试试' }).click();
  311 |   await page.getByRole('button', { name: '动手摆一盘' }).click();
  312 |   await page.getByRole('button', { name: '摆入苹果' }).click();
  313 |   await page.getByRole('button', { name: '交付这一盘' }).click();
  314 |   await expect(page.getByRole('button', { name: '下一份' })).toBeVisible();
  315 |   await page.getByRole('button', { name: '← 返回主题' }).click();
  316 | 
  317 |   await page.getByRole('button', { name: '选词表达' }).click();
  318 |   await page.getByRole('button', { name: '愿意组句' }).click();
  319 |   await expect(page.locator('.course-level-grid article')).toHaveCount(6);
  320 |   await page
  321 |     .locator('.course-level-grid article')
  322 |     .filter({ hasText: '用词表达需要' })
  323 |     .getByRole('button', { name: '开始' })
  324 |     .click();
  325 |   await page.getByRole('button', { name: '看看今天的内容' }).click();
  326 |   await page.getByRole('button', { name: '我来试试' }).click();
  327 |   for (const word of ['An', 'apple', 'please'])
  328 |     await page
  329 |       .getByRole('group', { name: '可用词块' })
  330 |       .getByRole('button', { name: word })
  331 |       .first()
  332 |       .click();
  333 |   await page.getByRole('button', { name: '表达这个需要' }).click();
  334 |   await expect(page.getByRole('button', { name: '下一份' })).toBeVisible();
  335 | });
  336 | 
  337 | test('yard minigames return to the activity and preserve adventure and free-kitchen entry', async ({
  338 |   page,
  339 | }) => {
  340 |   await page.goto('/');
  341 |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  342 |   await page.getByRole('button', { name: '去小院游乐角' }).click();
  343 |   await page.getByRole('button', { name: '← 小院', exact: true }).click();
  344 |   await expect(page.getByRole('region', { name: '小院活动桌' })).toBeVisible();
  345 |   await page.getByRole('button', { name: '返回小院', exact: true }).click();
  346 |   await page.getByRole('button', { name: '自由开店', exact: true }).click();
  347 |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  348 |   await expect(page.locator('canvas')).toBeVisible();
  349 |   await page.getByRole('button', { name: '我来试试', exact: true }).click();
  350 |   await expect(page.getByRole('group', { name: '餐车操作' })).toBeVisible();
  351 |   const apple = await hot(page, 'supply-apple');
  352 |   await page.mouse.click(apple.x, apple.y);
  353 |   const tray = await hot(page, 'tray-0');
  354 |   await page.mouse.click(tray.x, tray.y);
  355 |   await expect
  356 |     .poll(async () => (await worldState(page)).items.some((i) => i.product === 'apple'))
  357 |     .toBe(true);
  358 | });
  359 | test('phone five-cup layout and theatre controls remain visible and individually usable', async ({
  360 |   page,
  361 | }) => {
  362 |   // Five full rounds, five distinct take-backs and the theatre help flow measured 174s locally.
  363 |   // Action/expectation budgets stay unchanged; this is only the whole-flow budget.
  364 |   test.setTimeout(240000);
  365 |   await page.setViewportSize({ width: 393, height: 665 });
  366 |   await enter(page);
  367 |   await choose(page, '餐桌设计师', '几位朋友');
  368 |   for (let count = 1; count <= 5; count++) {
  369 |     const bank = page.locator('.scene-bank').getByRole('button', { name: '拿起杯子', exact: true });
  370 |     for (let i = 0; i < count; i++) {
  371 |       await bank.first().click();
  372 |       await place(page, '桌上');
  373 |     }
  374 |     if (count === 5) {
  375 |       const props = page.locator('.place-on .scene-prop');
  376 |       await expect(props).toHaveCount(5);
  377 |       const identities = await props.evaluateAll((buttons) =>
  378 |         buttons.map((button) => [...button.classList].find((name) => name.startsWith('prop-'))),
  379 |       );
  380 |       expect(new Set(identities).size).toBe(5);
  381 |       for (const identity of identities) {
  382 |         if (!identity) throw Error('missing visible prop identity');
  383 |         const prop = page.locator(`.place-on .${identity}`);
  384 |         const box = await prop.boundingBox();
  385 |         expect(box).not.toBeNull();
  386 |         if (!box) throw Error('prop');
  387 |         expect(box.y + box.height).toBeLessThan(665);
  388 |         await prop.click();
  389 |         await place(page, '桌上');
  390 |       }
  391 |       const submit = await page.getByRole('button', { name: '给大咪看看' }).boundingBox();
  392 |       expect(submit?.y ?? 9999).toBeLessThan(617);
  393 |       await page.screenshot({
  394 |         path: evidencePath('docs/evidence/minigames-vocab/designer-five-phone.png'),
  395 |       });
  396 |     }
  397 |     await check(page);
  398 |     if (count < 5) await meaning(page);
  399 |   }
  400 |   await page.getByRole('button', { name: '返回游乐角' }).click();
  401 |   await choose(page, '大咪动作小剧场', '朋友的水杯');
  402 |   await page.getByRole('button', { name: '看图示范' }).click();
> 403 |   await expect(page.getByRole('dialog', { name: '物件与动作示范' })).toBeVisible();
      |                                                               ^ Error: expect(locator).toBeVisible() failed
  404 |   await page.screenshot({
  405 |     path: evidencePath('docs/evidence/minigames-vocab/theatre-help-phone.png'),
  406 |   });
  407 |   await page.getByRole('button', { name: '收起图示，自己试试' }).click();
  408 |   const checkBox = await page.getByRole('button', { name: '给大咪看看' }).boundingBox();
  409 |   expect(checkBox?.y ?? 9999).toBeLessThan(617);
  410 |   await images(page);
  411 |   await page.screenshot({ path: evidencePath('docs/evidence/minigames-vocab/theatre-phone.png') });
  412 | });
  413 | 
```