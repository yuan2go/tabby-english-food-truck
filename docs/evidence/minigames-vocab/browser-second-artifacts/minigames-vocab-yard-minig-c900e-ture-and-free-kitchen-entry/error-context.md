# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: minigames-vocab.spec.ts >> yard minigames return to the activity and preserve adventure and free-kitchen entry
- Location: e2e/minigames-vocab.spec.ts:322:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: '← 小院', exact: true })
Expected: visible
Timeout: 6000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('button', { name: '← 小院', exact: true }) with timeout 6000ms
  - waiting for getByRole('button', { name: '← 小院', exact: true })

```

```yaml
- main:
  - img "英语餐车游戏画面"
  - button "暂停": Ⅱ
  - text: 无尽营业
  - group "餐车操作":
    - button "客人A·兔兔：拿盘交付，空手重听请求" [disabled]
    - button "果汁机苹果入口" [disabled]
    - button "果汁机杯座" [disabled]
    - button "▶ 榨成果汁" [disabled]
    - button "切换果汁机" [disabled]
    - button "请大咪帮忙" [disabled]
    - button "1号托盘：放入食品或选择整盘" [disabled]
    - button "2号托盘：放入食品或选择整盘" [disabled]
    - button "拿苹果" [disabled]
    - button "拿香蕉" [disabled]
    - button "拿空杯" [disabled]
  - dialog "场景小教学":
    - text: 大咪的食谱 · 一次学一点
    - button "我来试试": 先到餐车试试 ↗
    - img "认识食物 1/1"
    - button "听 apple":
      - img "苹果"
      - strong: apple
      - text: ♫
    - paragraph: 点食物，听它的名字。
    - button "来试一下 →"
    - status
  - status: 点食材直接装盘；要制作时先点设备
```

# Test source

```ts
  234 |     JSON.parse(localStorage.getItem('tabby.foodtruck.scene-mini.v1') ?? '{}'),
  235 |   );
  236 |   expect(saved.scenes['hunt-0'].support).toContain('answer-help');
  237 |   expect(saved.scenes['hunt-0'].heard).toBe(false);
  238 |   await page.getByRole('button', { name: '返回游乐角' }).click();
  239 |   await page.getByRole('button', { name: '返回游戏小摊' }).click();
  240 |   await page.getByRole('button', { name: /主题关卡 ·/ }).click();
  241 |   await page.getByRole('button', { name: /认识小院120词/ }).click();
  242 |   await expect(page.locator('.course-level-grid article')).toHaveCount(1);
  243 |   await page.getByRole('button', { name: '认识下一小组' }).click();
  244 |   await expect(page.locator('.library-navigation')).toContainText('第2小组');
  245 | });
  246 | 
  247 | test('original five mechanics retain normal entry and optional literacy, with hands-on quantity', async ({
  248 |   page,
  249 | }) => {
  250 |   await page.goto('/');
  251 |   await page.getByRole('button', { name: '迷你游戏', exact: true }).click();
  252 |   await page.getByRole('button', { name: /主题关卡 ·/ }).click();
  253 |   await page.getByRole('button', { name: '开始', exact: true }).first().click();
  254 |   await page.getByRole('button', { name: '看看今天的内容' }).click();
  255 |   await page.getByRole('button', { name: '我来试试' }).click();
  256 |   await page.getByRole('button', { name: '选择苹果', exact: true }).click();
  257 |   await expect(page.getByRole('button', { name: '下一份' })).toBeVisible();
  258 |   await page.getByRole('button', { name: '← 返回主题' }).click();
  259 |   await page.getByRole('button', { name: '多组配对' }).click();
  260 |   await page
  261 |     .locator('.course-level-grid article')
  262 |     .filter({ hasText: '水果标签成组配' })
  263 |     .getByRole('button', { name: '开始' })
  264 |     .click();
  265 |   await page.getByRole('button', { name: '看看今天的内容' }).click();
  266 |   await page.getByRole('button', { name: '我来试试' }).click();
  267 |   await page.getByRole('button', { name: `选择${wordById('apple')?.chinese}` }).click();
  268 |   await expect(page.getByRole('button', { name: '下一份' })).toBeVisible();
  269 |   await page.getByRole('button', { name: '← 返回主题' }).click();
  270 | 
  271 |   await page.getByRole('button', { name: 'WordSpell' }).click();
  272 |   await page.getByRole('button', { name: '认识字母' }).click();
  273 |   await page
  274 |     .locator('.course-level-grid article')
  275 |     .filter({ hasText: '短短的水果词' })
  276 |     .getByRole('button', { name: '开始' })
  277 |     .click();
  278 |   await page.getByRole('button', { name: '看看今天的内容' }).click();
  279 |   await page.getByRole('button', { name: '我来试试' }).click();
  280 |   for (const letter of 'APPLE')
  281 |     await page
  282 |       .getByRole('group', { name: '可用词块' })
  283 |       .getByRole('button', { name: letter })
  284 |       .first()
  285 |       .click();
  286 |   await page.getByRole('button', { name: '完成这句' }).click();
  287 |   await expect(page.getByRole('button', { name: '下一份' })).toBeVisible();
  288 |   await page.getByRole('button', { name: '← 返回主题' }).click();
  289 | 
  290 |   await page.getByRole('button', { name: '数量与组合' }).click();
  291 |   await page
  292 |     .locator('.course-level-grid article')
  293 |     .filter({ hasText: '一个还是两个' })
  294 |     .getByRole('button', { name: '开始' })
  295 |     .click();
  296 |   await page.getByRole('button', { name: '看看今天的内容' }).click();
  297 |   await page.getByRole('button', { name: '我来试试' }).click();
  298 |   await page.getByRole('button', { name: '动手摆一盘' }).click();
  299 |   await page.getByRole('button', { name: '摆入苹果' }).click();
  300 |   await page.getByRole('button', { name: '交付这一盘' }).click();
  301 |   await expect(page.getByRole('button', { name: '下一份' })).toBeVisible();
  302 |   await page.getByRole('button', { name: '← 返回主题' }).click();
  303 | 
  304 |   await page.getByRole('button', { name: '选词组句' }).click();
  305 |   await page.getByRole('button', { name: '愿意组句' }).click();
  306 |   await expect(page.locator('.course-level-grid article')).toHaveCount(6);
  307 |   await page
  308 |     .locator('.course-level-grid article')
  309 |     .filter({ hasText: '请给我一个' })
  310 |     .getByRole('button', { name: '开始' })
  311 |     .click();
  312 |   await page.getByRole('button', { name: '看看今天的内容' }).click();
  313 |   await page.getByRole('button', { name: '我来试试' }).click();
  314 |   for (const word of ['An', 'apple', 'please'])
  315 |     await page
  316 |       .getByRole('group', { name: '可用词块' })
  317 |       .getByRole('button', { name: word })
  318 |       .first()
  319 |       .click();
  320 |   await page.getByRole('button', { name: '完成这句' }).click();
  321 |   await expect(page.getByRole('button', { name: '下一份' })).toBeVisible();
  322 | });
  323 | 
  324 | test('yard minigames return to the activity and preserve adventure and free-kitchen entry', async ({
  325 |   page,
  326 | }) => {
  327 |   await page.goto('/');
  328 |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  329 |   await page.getByRole('button', { name: '去小院游乐角' }).click();
  330 |   await page.getByRole('button', { name: '← 小院', exact: true }).click();
  331 |   await expect(page.getByRole('region', { name: '小院活动桌' })).toBeVisible();
  332 |   await page.getByRole('button', { name: '返回小院', exact: true }).click();
  333 |   await page.getByRole('button', { name: '自由开店', exact: true }).click();
> 334 |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
      |                                                                         ^ Error: expect(locator).toBeVisible() failed
  335 |   await expect(page.locator('canvas')).toBeVisible();
  336 |   await expect(page.getByRole('button', { name: '← 小院', exact: true })).toBeVisible();
  337 | });
  338 | test('phone five-cup layout and theatre controls remain visible and individually usable', async ({
  339 |   page,
  340 | }) => {
  341 |   await page.setViewportSize({ width: 393, height: 665 });
  342 |   await enter(page);
  343 |   await choose(page, '餐桌设计师', '几位朋友');
  344 |   for (let count = 1; count <= 5; count++) {
  345 |     const bank = page.locator('.scene-bank').getByRole('button', { name: '拿起杯子', exact: true });
  346 |     for (let i = 0; i < count; i++) {
  347 |       await bank.first().click();
  348 |       await place(page, '桌上');
  349 |     }
  350 |     if (count === 5) {
  351 |       const props = page.locator('.place-on .scene-prop');
  352 |       await expect(props).toHaveCount(5);
  353 |       for (const prop of await props.all()) {
  354 |         const box = await prop.boundingBox();
  355 |         expect(box).not.toBeNull();
  356 |         if (!box) throw Error('prop');
  357 |         expect(box.y + box.height).toBeLessThan(665);
  358 |         await prop.click();
  359 |         await place(page, '桌上');
  360 |       }
  361 |       const submit = await page.getByRole('button', { name: '给大咪看看' }).boundingBox();
  362 |       expect(submit?.y ?? 9999).toBeLessThan(617);
  363 |       await page.screenshot({ path: 'docs/evidence/minigames-vocab/designer-five-phone.png' });
  364 |     }
  365 |     await check(page);
  366 |     if (count < 5) await meaning(page);
  367 |   }
  368 |   await page.getByRole('button', { name: '返回游乐角' }).click();
  369 |   await choose(page, '大咪动作小剧场', '朋友的水杯');
  370 |   await page.getByRole('button', { name: '看图示范' }).click();
  371 |   await expect(page.getByRole('dialog', { name: '物件与动作示范' })).toBeVisible();
  372 |   await page.screenshot({ path: 'docs/evidence/minigames-vocab/theatre-help-phone.png' });
  373 |   await page.getByRole('button', { name: '收起图示，自己试试' }).click();
  374 |   const checkBox = await page.getByRole('button', { name: '给大咪看看' }).boundingBox();
  375 |   expect(checkBox?.y ?? 9999).toBeLessThan(617);
  376 |   await images(page);
  377 |   await page.screenshot({ path: 'docs/evidence/minigames-vocab/theatre-phone.png' });
  378 | });
  379 | 
```