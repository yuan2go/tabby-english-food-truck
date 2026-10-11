# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: minigames-vocab.spec.ts >> yard minigames return to the activity and preserve adventure and free-kitchen entry
- Location: e2e/minigames-vocab.spec.ts:335:1

# Error details

```
TimeoutError: locator.click: Timeout 12000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: '拿苹果', exact: true })
    - locator resolved to <button tabindex="0" type="button" aria-label="拿苹果" data-hotspot="supply-apple">拿苹果</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <canvas width="390" height="844" data-cat-x="0.73" data-cat-y="0.43" data-cat-pose="idle" data-motion-count="0" data-entity-count="9" data-world-width="390" data-cat-action="idle" data-world-height="844" data-render-scale="1.000" data-created-entities="10"></canvas> from <div role="img" class="canvas-host" aria-label="英语餐车游戏画面">…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <canvas width="390" height="844" data-cat-x="0.73" data-cat-y="0.43" data-cat-pose="idle" data-motion-count="0" data-entity-count="9" data-world-width="390" data-cat-action="idle" data-world-height="844" data-render-scale="1.000" data-created-entities="10"></canvas> from <div role="img" class="canvas-host" aria-label="英语餐车游戏画面">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    6 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <canvas width="390" height="844" data-cat-x="0.73" data-cat-y="0.43" data-cat-pose="idle" data-motion-count="0" data-entity-count="9" data-world-width="390" data-cat-action="idle" data-world-height="844" data-render-scale="1.000" data-created-entities="10"></canvas> from <div role="img" class="canvas-host" aria-label="英语餐车游戏画面">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms

```

# Page snapshot

```yaml
- main [ref=e3]:
  - img "英语餐车游戏画面" [ref=e4]
  - generic:
    - generic:
      - button "暂停" [ref=e6] [cursor=pointer]: Ⅱ
      - generic: 无尽营业
      - button "到活动桌" [ref=e7] [cursor=pointer]
    - group "餐车操作":
      - button "客人A·兔兔：拿盘交付，空手重听请求"
      - button "果汁机苹果入口"
      - button "果汁机杯座"
      - button "▶ 榨成果汁" [ref=e8] [cursor=pointer]
      - button "切换果汁机" [ref=e9] [cursor=pointer]
      - button "请大咪帮忙"
      - button "1号托盘：放入食品或选择整盘"
      - button "2号托盘：放入食品或选择整盘"
      - button "拿苹果"
      - button "拿香蕉"
      - button "拿空杯"
    - button "带作品到活动桌" [ref=e10] [cursor=pointer]
    - button "点请求气泡重听" [ref=e11] [cursor=pointer]:
      - img "苹果"
      - generic [ref=e12]: ♫
    - generic:
      - status: 点食材直接装盘；要制作时先点设备
```

# Test source

```ts
  249 |   await expect(page.getByRole('button', { name: '听一句怎么用' })).toBeVisible();
  250 |   await page.getByRole('button', { name: '听一句怎么用' }).click();
  251 |   const courses = await page.evaluate(() =>
  252 |     JSON.parse(localStorage.getItem('tabby.foodtruck.mini-course.v1') ?? '{}'),
  253 |   );
  254 |   expect(courses.courses['vocabulary-listen-vocab-0'].support).toContain('context-example');
  255 |   expect(courses.courses['vocabulary-listen-vocab-0'].attempts).toHaveLength(0);
  256 | });
  257 | 
  258 | test('original five mechanics retain normal entry and optional literacy, with hands-on quantity', async ({
  259 |   page,
  260 | }) => {
  261 |   await page.goto('/');
  262 |   await page.getByRole('button', { name: '迷你游戏', exact: true }).click();
  263 |   await page.getByRole('button', { name: /主题关卡 ·/ }).click();
  264 |   await page.getByRole('button', { name: '开始', exact: true }).first().click();
  265 |   await page.getByRole('button', { name: '看看今天的内容' }).click();
  266 |   await page.getByRole('button', { name: '我来试试' }).click();
  267 |   await page.getByRole('button', { name: '选择苹果', exact: true }).click();
  268 |   await expect(page.getByRole('button', { name: '下一份' })).toBeVisible();
  269 |   await page.getByRole('button', { name: '← 返回主题' }).click();
  270 |   await page.getByRole('button', { name: '多组配对' }).click();
  271 |   await page
  272 |     .locator('.course-level-grid article')
  273 |     .filter({ hasText: '水果标签成组配' })
  274 |     .getByRole('button', { name: '开始' })
  275 |     .click();
  276 |   await page.getByRole('button', { name: '看看今天的内容' }).click();
  277 |   await page.getByRole('button', { name: '我来试试' }).click();
  278 |   await page.getByRole('button', { name: `选择${wordById('apple')?.chinese}` }).click();
  279 |   await expect(page.getByRole('button', { name: '下一份' })).toBeVisible();
  280 |   await page.getByRole('button', { name: '← 返回主题' }).click();
  281 | 
  282 |   await page.getByRole('button', { name: 'WordSpell' }).click();
  283 |   await page.getByRole('button', { name: '认识字母' }).click();
  284 |   await page
  285 |     .locator('.course-level-grid article')
  286 |     .filter({ hasText: '短短的水果词' })
  287 |     .getByRole('button', { name: '开始' })
  288 |     .click();
  289 |   await page.getByRole('button', { name: '看看今天的内容' }).click();
  290 |   await page.getByRole('button', { name: '我来试试' }).click();
  291 |   for (const letter of 'APPLE')
  292 |     await page
  293 |       .getByRole('group', { name: '可用词块' })
  294 |       .getByRole('button', { name: letter })
  295 |       .first()
  296 |       .click();
  297 |   await page.getByRole('button', { name: '完成这句' }).click();
  298 |   await expect(page.getByRole('button', { name: '下一份' })).toBeVisible();
  299 |   await page.getByRole('button', { name: '← 返回主题' }).click();
  300 | 
  301 |   await page.getByRole('button', { name: '数量与组合' }).click();
  302 |   await page
  303 |     .locator('.course-level-grid article')
  304 |     .filter({ hasText: '一个还是两个' })
  305 |     .getByRole('button', { name: '开始' })
  306 |     .click();
  307 |   await page.getByRole('button', { name: '看看今天的内容' }).click();
  308 |   await page.getByRole('button', { name: '我来试试' }).click();
  309 |   await page.getByRole('button', { name: '动手摆一盘' }).click();
  310 |   await page.getByRole('button', { name: '摆入苹果' }).click();
  311 |   await page.getByRole('button', { name: '交付这一盘' }).click();
  312 |   await expect(page.getByRole('button', { name: '下一份' })).toBeVisible();
  313 |   await page.getByRole('button', { name: '← 返回主题' }).click();
  314 | 
  315 |   await page.getByRole('button', { name: '选词组句' }).click();
  316 |   await page.getByRole('button', { name: '愿意组句' }).click();
  317 |   await expect(page.locator('.course-level-grid article')).toHaveCount(6);
  318 |   await page
  319 |     .locator('.course-level-grid article')
  320 |     .filter({ hasText: '请给我一个' })
  321 |     .getByRole('button', { name: '开始' })
  322 |     .click();
  323 |   await page.getByRole('button', { name: '看看今天的内容' }).click();
  324 |   await page.getByRole('button', { name: '我来试试' }).click();
  325 |   for (const word of ['An', 'apple', 'please'])
  326 |     await page
  327 |       .getByRole('group', { name: '可用词块' })
  328 |       .getByRole('button', { name: word })
  329 |       .first()
  330 |       .click();
  331 |   await page.getByRole('button', { name: '完成这句' }).click();
  332 |   await expect(page.getByRole('button', { name: '下一份' })).toBeVisible();
  333 | });
  334 | 
  335 | test('yard minigames return to the activity and preserve adventure and free-kitchen entry', async ({
  336 |   page,
  337 | }) => {
  338 |   await page.goto('/');
  339 |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  340 |   await page.getByRole('button', { name: '去小院游乐角' }).click();
  341 |   await page.getByRole('button', { name: '← 小院', exact: true }).click();
  342 |   await expect(page.getByRole('region', { name: '小院活动桌' })).toBeVisible();
  343 |   await page.getByRole('button', { name: '返回小院', exact: true }).click();
  344 |   await page.getByRole('button', { name: '自由开店', exact: true }).click();
  345 |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  346 |   await expect(page.locator('canvas')).toBeVisible();
  347 |   await page.getByRole('button', { name: '我来试试', exact: true }).click();
  348 |   await expect(page.getByRole('group', { name: '餐车操作' })).toBeVisible();
> 349 |   await page.getByRole('button', { name: '拿苹果', exact: true }).click();
      |                                                                ^ TimeoutError: locator.click: Timeout 12000ms exceeded.
  350 |   await page.getByRole('button', { name: '1号托盘：放入食品或选择整盘', exact: true }).click();
  351 |   await expect
  352 |     .poll(async () => (await worldState(page)).items.some((i) => i.product === 'apple'))
  353 |     .toBe(true);
  354 | });
  355 | test('phone five-cup layout and theatre controls remain visible and individually usable', async ({
  356 |   page,
  357 | }) => {
  358 |   await page.setViewportSize({ width: 393, height: 665 });
  359 |   await enter(page);
  360 |   await choose(page, '餐桌设计师', '几位朋友');
  361 |   for (let count = 1; count <= 5; count++) {
  362 |     const bank = page.locator('.scene-bank').getByRole('button', { name: '拿起杯子', exact: true });
  363 |     for (let i = 0; i < count; i++) {
  364 |       await bank.first().click();
  365 |       await place(page, '桌上');
  366 |     }
  367 |     if (count === 5) {
  368 |       const props = page.locator('.place-on .scene-prop');
  369 |       await expect(props).toHaveCount(5);
  370 |       for (const prop of await props.all()) {
  371 |         const box = await prop.boundingBox();
  372 |         expect(box).not.toBeNull();
  373 |         if (!box) throw Error('prop');
  374 |         expect(box.y + box.height).toBeLessThan(665);
  375 |         await prop.click();
  376 |         await place(page, '桌上');
  377 |       }
  378 |       const submit = await page.getByRole('button', { name: '给大咪看看' }).boundingBox();
  379 |       expect(submit?.y ?? 9999).toBeLessThan(617);
  380 |       await page.screenshot({ path: 'docs/evidence/minigames-vocab/designer-five-phone.png' });
  381 |     }
  382 |     await check(page);
  383 |     if (count < 5) await meaning(page);
  384 |   }
  385 |   await page.getByRole('button', { name: '返回游乐角' }).click();
  386 |   await choose(page, '大咪动作小剧场', '朋友的水杯');
  387 |   await page.getByRole('button', { name: '看图示范' }).click();
  388 |   await expect(page.getByRole('dialog', { name: '物件与动作示范' })).toBeVisible();
  389 |   await page.screenshot({ path: 'docs/evidence/minigames-vocab/theatre-help-phone.png' });
  390 |   await page.getByRole('button', { name: '收起图示，自己试试' }).click();
  391 |   const checkBox = await page.getByRole('button', { name: '给大咪看看' }).boundingBox();
  392 |   expect(checkBox?.y ?? 9999).toBeLessThan(617);
  393 |   await images(page);
  394 |   await page.screenshot({ path: 'docs/evidence/minigames-vocab/theatre-phone.png' });
  395 | });
  396 | 
```