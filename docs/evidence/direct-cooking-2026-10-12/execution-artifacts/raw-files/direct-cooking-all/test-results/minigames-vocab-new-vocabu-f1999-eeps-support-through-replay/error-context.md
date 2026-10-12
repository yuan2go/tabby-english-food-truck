# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: minigames-vocab.spec.ts >> new vocabulary is reachable in small batches and audio failure keeps support through replay
- Location: e2e/minigames-vocab.spec.ts:220:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: '听一句怎么用' })
Expected: visible
Timeout: 6000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('button', { name: '听一句怎么用' }) with timeout 6000ms
  - waiting for getByRole('button', { name: '听一句怎么用' })

```

```yaml
- main:
  - img "同桌场景画面"
  - region "听音观察 · 杯子、盘子、碗、勺子关卡":
    - button "← 返回主题"
    - button "暂停小游戏"
    - heading "听音观察 · 杯子、盘子、碗、勺子" [level=2]
    - paragraph: 第11小组，先认识这一小组；动作和方位看演示。
    - text: 听音找物 · 1/4 · 听声音，观察物件或动作，再找一找
    - button "重玩本关"
    - group "今天的物件":
      - img "杯子"
      - text: cup
      - img "盘子"
      - text: plate
      - img "碗"
      - text: bowl
      - img "勺子"
      - text: spoon
    - button "♫ 重听请求"
    - button "选择杯子":
      - img "杯子"
    - button "选择盘子":
      - img "盘子"
    - button "选择碗":
      - img "碗"
    - button "选择勺子":
      - img "勺子"
    - status: 声音没播完整，可以重听或看图。
    - button "看图和例句"
    - status:
      - paragraph: 声音没有播完整，可重试或看图继续。
      - button "重试声音"
      - button "看图继续"
    - text: 开发语音尚未人工听审；听过不等于会了。
```

# Test source

```ts
  151 |     await place(page, target ?? '');
  152 |   }
  153 |   await page.screenshot({ path: evidencePath('docs/evidence/minigames-vocab/sort-phone.png') });
  154 |   await images(page);
  155 |   await check(page);
  156 |   await expect(page.getByText('这次小院活动完成了')).toBeVisible();
  157 | });
  158 | 
  159 | test('phone designer spatial targets and saved free mode use actual objects', async ({ page }) => {
  160 |   await page.setViewportSize({ width: 393, height: 665 });
  161 |   await enter(page);
  162 |   await choose(page, '餐桌设计师', '上下里面旁边');
  163 |   for (const [word, target] of [
  164 |     ['杯子', '桌上'],
  165 |     ['球', '篮内'],
  166 |     ['球', '桌下'],
  167 |     ['椅子', '桌边'],
  168 |   ]) {
  169 |     await take(page, word ?? '');
  170 |     await place(page, target ?? '');
  171 |     await check(page);
  172 |     if (word !== '椅子') await meaning(page);
  173 |   }
  174 |   await page.getByRole('button', { name: '继续自由布置' }).click();
  175 |   await take(page, '灯');
  176 |   await place(page, '桌下');
  177 |   await page.getByRole('button', { name: '留下我的布置' }).click();
  178 |   await expect(page.locator('.scene-feedback')).toContainText('接着摆');
  179 |   await images(page);
  180 |   await page.screenshot({ path: evidencePath('docs/evidence/minigames-vocab/design-phone.png') });
  181 |   const saved = await page.evaluate(() =>
  182 |     JSON.parse(localStorage.getItem('tabby.foodtruck.scene-mini.v1') ?? '{}'),
  183 |   );
  184 |   expect(saved.scenes['design-0'].mode).toBe('free');
  185 |   expect(saved.scenes['design-0'].objects.find((o: { id: string }) => o.id === 'lamp').place).toBe(
  186 |     'under',
  187 |   );
  188 | });
  189 | 
  190 | test('desktop theatre follows actual tool and liquid prerequisites with keyboard operation', async ({
  191 |   page,
  192 | }) => {
  193 |   await page.setViewportSize({ width: 1440, height: 900 });
  194 |   await enter(page);
  195 |   await choose(page, '大咪动作小剧场', '朋友的水杯');
  196 |   await page.getByRole('button', { name: '倒水杯子', exact: true }).click();
  197 |   await expect(page.locator('.scene-feedback')).toContainText('准备');
  198 |   await take(page, '杯子');
  199 |   await page.getByRole('button', { name: '放到桌上' }).press('Enter');
  200 |   await check(page);
  201 |   await take(page, '倒水壶');
  202 |   await page.getByRole('button', { name: '倒水杯子' }).click();
  203 |   await place(page, '桌上');
  204 |   await check(page);
  205 |   await take(page, '勺子');
  206 |   await page.getByRole('button', { name: '搅拌杯子' }).click();
  207 |   await place(page, '桌上');
  208 |   await check(page);
  209 |   await take(page, '碗');
  210 |   await place(page, '水槽');
  211 |   await page.getByRole('button', { name: '清洗碗' }).click();
  212 |   await page.screenshot({
  213 |     path: evidencePath('docs/evidence/minigames-vocab/theatre-desktop.png'),
  214 |   });
  215 |   await images(page);
  216 |   await check(page);
  217 |   await expect(page.getByText('这次小院活动完成了')).toBeVisible();
  218 | });
  219 | 
  220 | test('new vocabulary is reachable in small batches and audio failure keeps support through replay', async ({
  221 |   page,
  222 | }) => {
  223 |   await page.route('**/audio/vocab-*.wav*', (route) => route.abort());
  224 |   await page.goto('/');
  225 |   await page.getByRole('button', { name: '迷你游戏', exact: true }).click();
  226 |   await page.getByRole('button', { name: /小院场景小游戏 ·/ }).click();
  227 |   await choose(page, '小院寻物', '帮大咪拿东西');
  228 |   await expect(page.getByRole('button', { name: '重试声音' })).toBeVisible();
  229 |   await page.getByRole('button', { name: '看图继续' }).click();
  230 |   await take(page, '杯子');
  231 |   await page.getByRole('button', { name: '交付找到的物件' }).click();
  232 |   await page.getByRole('button', { name: '重玩这一组', exact: true }).click();
  233 |   await page.getByRole('button', { name: '确认重玩' }).click();
  234 |   await expect(page.locator('.scene-stage')).toBeVisible();
  235 |   await expect(page.locator('.scene-stage')).toBeVisible();
  236 |   const saved = await page.evaluate(() =>
  237 |     JSON.parse(localStorage.getItem('tabby.foodtruck.scene-mini.v1') ?? '{}'),
  238 |   );
  239 |   expect(saved.scenes['hunt-0'].support).toContain('answer-help');
  240 |   expect(saved.scenes['hunt-0'].heard).toBe(false);
  241 |   await page.getByRole('button', { name: '返回游乐角' }).click();
  242 |   await page.getByRole('button', { name: '返回游戏小摊' }).click();
  243 |   await page.getByRole('button', { name: /主题关卡 ·/ }).click();
  244 |   await page.getByRole('button', { name: /认识小院120词/ }).click();
  245 |   await expect(page.locator('.course-level-grid article')).toHaveCount(1);
  246 |   await page.getByRole('button', { name: '认识下一小组' }).click();
  247 |   await expect(page.locator('.library-navigation')).toContainText('第2小组');
  248 |   for (let i = 2; i < 11; i++) await page.getByRole('button', { name: '认识下一小组' }).click();
  249 |   await page.getByRole('button', { name: '开始', exact: true }).click();
  250 |   await expect(page.locator('.course-prompt')).toBeVisible();
> 251 |   await expect(page.getByRole('button', { name: '听一句怎么用' })).toBeVisible();
      |                                                              ^ Error: expect(locator).toBeVisible() failed
  252 |   await page.getByRole('button', { name: '听一句怎么用' }).click();
  253 |   const courses = await page.evaluate(() =>
  254 |     JSON.parse(localStorage.getItem('tabby.foodtruck.mini-course.v1') ?? '{}'),
  255 |   );
  256 |   expect(courses.courses['vocabulary-listen-vocab-0'].support).toContain('context-example');
  257 |   expect(courses.courses['vocabulary-listen-vocab-0'].attempts).toHaveLength(0);
  258 | });
  259 | 
  260 | test('original five mechanics retain normal entry and optional literacy, with hands-on quantity', async ({
  261 |   page,
  262 | }) => {
  263 |   await page.goto('/');
  264 |   await page.getByRole('button', { name: '迷你游戏', exact: true }).click();
  265 |   await page.getByRole('button', { name: /主题关卡 ·/ }).click();
  266 |   await page.getByRole('button', { name: '开始', exact: true }).first().click();
  267 |   await expect(page.locator('.course-prompt')).toBeVisible();
  268 |   await expect(page.locator('.course-prompt')).toBeVisible();
  269 |   await page.getByRole('button', { name: '选择苹果', exact: true }).click();
  270 |   await expect(page.getByRole('button', { name: '下一份' })).toBeVisible();
  271 |   await page.getByRole('button', { name: '← 返回主题' }).click();
  272 |   await page.getByRole('button', { name: '多组配对' }).click();
  273 |   await page
  274 |     .locator('.course-level-grid article')
  275 |     .filter({ hasText: '水果标签成组配' })
  276 |     .getByRole('button', { name: '开始' })
  277 |     .click();
  278 |   await expect(page.locator('.course-prompt')).toBeVisible();
  279 |   await expect(page.locator('.course-prompt')).toBeVisible();
  280 |   await page.getByRole('button', { name: `选择${wordById('apple')?.chinese}` }).click();
  281 |   await expect(page.getByRole('button', { name: '下一份' })).toBeVisible();
  282 |   await page.getByRole('button', { name: '← 返回主题' }).click();
  283 | 
  284 |   await page.getByRole('button', { name: 'WordSpell' }).click();
  285 |   await page.getByRole('button', { name: '认识字母' }).click();
  286 |   await page
  287 |     .locator('.course-level-grid article')
  288 |     .filter({ hasText: '短短的水果词' })
  289 |     .getByRole('button', { name: '开始' })
  290 |     .click();
  291 |   await expect(page.locator('.course-prompt')).toBeVisible();
  292 |   await expect(page.locator('.course-prompt')).toBeVisible();
  293 |   for (const letter of 'APPLE')
  294 |     await page
  295 |       .getByRole('group', { name: '可用词块' })
  296 |       .getByRole('button', { name: letter })
  297 |       .first()
  298 |       .click();
  299 |   await page.getByRole('button', { name: '表达这个需要' }).click();
  300 |   await expect(page.getByRole('button', { name: '下一份' })).toBeVisible();
  301 |   await page.getByRole('button', { name: '← 返回主题' }).click();
  302 | 
  303 |   await page.getByRole('button', { name: '数量与组合' }).click();
  304 |   await page
  305 |     .locator('.course-level-grid article')
  306 |     .filter({ hasText: '一个还是两个' })
  307 |     .getByRole('button', { name: '开始' })
  308 |     .click();
  309 |   await expect(page.locator('.course-prompt')).toBeVisible();
  310 |   await expect(page.locator('.course-prompt')).toBeVisible();
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
  325 |   await expect(page.locator('.course-prompt')).toBeVisible();
  326 |   await expect(page.locator('.course-prompt')).toBeVisible();
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
  342 |   await page.getByRole('button', { name: '翻开旧食谱', exact: true }).click();
  343 |   await page.getByRole('button', { name: '去游乐角', exact: true }).click();
  344 |   await page.getByRole('button', { name: '← 小院', exact: true }).click();
  345 |   await expect(page.getByRole('region', { name: '同桌厨房' })).toBeVisible();
  346 |   await page.getByRole('button', { name: '暂停', exact: true }).click();
  347 |   await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  348 |   await page.getByRole('button', { name: '自由开店', exact: true }).click();
  349 |   await page.getByRole('button', { name: '暂停', exact: true }).click();
  350 |   await page.getByRole('button', { name: '调整开店设置', exact: true }).click();
  351 |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
```