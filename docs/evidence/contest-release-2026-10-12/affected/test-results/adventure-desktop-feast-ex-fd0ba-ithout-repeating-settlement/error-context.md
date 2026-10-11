# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adventure.spec.ts >> desktop feast exposes replay skip and low motion without repeating settlement
- Location: e2e/adventure.spec.ts:200:1

# Error details

```
TimeoutError: locator.click: Timeout 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: '选择苹果汁', exact: true })
    - locator resolved to <button type="button" aria-label="选择苹果汁" class="world-food  " aria-pressed="false">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <path fill="#70a978" d="M32 36V16c-23-20-29 9 0 9m0 0c23-22 30 8 0 7"></path> from <footer class="activity-footer">…</footer> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <path fill="#70a978" d="M32 36V16c-23-20-29 9 0 9m0 0c23-22 30 8 0 7"></path> from <footer class="activity-footer">…</footer> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    48 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <path fill="#70a978" d="M32 36V16c-23-20-29 9 0 9m0 0c23-22 30 8 0 7"></path> from <footer class="activity-footer">…</footer> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- main [ref=e3]:
  - img "英语餐车游戏画面" [ref=e4]
  - region "小院活动桌" [ref=e6]:
    - generic [ref=e7]:
      - generic [ref=e8]:
        - button "返回小院" [ref=e9] [cursor=pointer]: ← 小院
        - generic [ref=e10]:
          - heading "晨光开门" [level=2] [ref=e11]
          - paragraph [ref=e12]: 这页已经留下记忆
        - group "活动客流" [ref=e13]:
          - button "一次接待一位" [pressed] [ref=e14] [cursor=pointer]: 👤
          - button "一起接待两位" [ref=e15] [cursor=pointer]: 👥
        - button "去厨房备餐" [ref=e16] [cursor=pointer]
      - region "英语交流" [ref=e21]:
        - generic [ref=e22]:
          - button "重听下一步行动" [ref=e23] [cursor=pointer]: ➜ ♫
          - generic [ref=e24]: 大咪
          - group [ref=e25]:
            - generic "回看最近交流" [ref=e26] [cursor=pointer]: ↶
        - generic [ref=e27]:
          - button "重听大咪：This is for you." [ref=e28] [cursor=pointer]: This is for you.
          - button "播放整句：This is for you." [ref=e29] [cursor=pointer]: ▶
          - generic [ref=e30]: 可播放整句
      - generic [ref=e31]:
        - generic [ref=e32]:
          - button "去小院游乐角" [ref=e33] [cursor=pointer]:
            - generic [ref=e35]: 去游乐角 · 随时回来
          - button "打开储物抽屉":
            - generic:
              - text: 打开储物抽屉
              - generic: Drawer
            - generic [aria-hidden]: ✓
          - button "翻开旧食谱" [ref=e36] [cursor=pointer]:
            - generic [ref=e42]:
              - text: 翻开旧食谱
              - generic [ref=e43]: Recipe book
        - region "抽屉里的可用物件" [ref=e44]:
          - button "取出花苗" [pressed] [ref=e45] [cursor=pointer]:
            - generic [ref=e49]: 已取出
          - button "取出浇水壶" [pressed] [ref=e50] [cursor=pointer]:
            - generic [ref=e55]: 已取出
        - region "图示下一步" [ref=e56]:
          - button "图示下一步：继续搭配、分享或修改，喜欢的作品留在食谱。" [ref=e57] [cursor=pointer]:
            - generic [aria-hidden] [ref=e62]: ➜
            - generic [aria-hidden] [ref=e67]: ●
          - generic [ref=e68]: 继续搭配、分享或修改，喜欢的作品留在食谱。
          - button "重听下一步" [ref=e70] [cursor=pointer]: ♫
          - button "看看怎么行动" [ref=e71] [cursor=pointer]: ▶
        - paragraph [ref=e72]: 活动已经开席。继续制作、布置，或收摊回小院。
        - region "朋友实际使用食品" [ref=e73]:
          - img "接餐、携带、摆放、品尝、回应" [ref=e74]:
            - generic [ref=e75]: 接餐
            - generic [ref=e83]: 携带
            - generic [ref=e90]: 摆放
            - generic [ref=e97]: 品尝
            - generic [ref=e103]: 回应
          - img "大咪携带真实食品" [ref=e109]:
            - img "大咪" [ref=e110]
            - generic [ref=e112]:
              - img "苹果汁"
            - generic [ref=e113]: 大咪接好食品，带到所选位置，等你安排分享
          - generic [ref=e119]:
            - button "重看朋友使用" [ref=e120] [cursor=pointer]: ↻ ♫
            - button "跳过朋友演出" [ref=e121] [cursor=pointer]: ↗
            - button "低动态表现" [ref=e122] [cursor=pointer]: ◒
        - generic [ref=e123]:
          - img "已经种下的迎客花":
            - generic: ✿
            - generic: ✿
            - generic [aria-hidden]: 🦋
          - button "摆到1号餐位" [ref=e124] [cursor=pointer]
          - button "摆到2号餐位" [ref=e126] [cursor=pointer]
          - button "摆到3号餐位" [ref=e128] [cursor=pointer]
        - region "真实送到活动桌的食物" [ref=e130]:
          - generic [ref=e131]:
            - button "选择苹果" [pressed] [ref=e132] [cursor=pointer]:
              - img "苹果"
              - generic [aria-hidden] [ref=e133]: ♡
            - button "选择香蕉" [ref=e134] [cursor=pointer]:
              - img "香蕉"
              - generic [aria-hidden] [ref=e135]: ♡
            - button "选择苹果汁" [ref=e136] [cursor=pointer]:
              - img "苹果汁"
              - generic [aria-hidden] [ref=e137]: ●
          - region "当前拿着苹果" [ref=e138]:
            - img "苹果"
            - generic [aria-hidden] [ref=e139]: ➜
            - button "品尝苹果" [disabled] [ref=e145]
        - region "朋友的回访分享需要" [ref=e150]:
          - button "邀请兔兔" [ref=e151] [cursor=pointer]:
            - generic [ref=e152]: 兔兔
          - button "邀请刺刺" [ref=e153] [cursor=pointer]:
            - generic [ref=e154]: 刺刺
          - button "邀请长辈" [ref=e155] [cursor=pointer]:
            - generic [ref=e156]: 长辈
      - generic [ref=e157]:
        - generic [ref=e158]:
          - button "把花种在左边" [ref=e159] [cursor=pointer]: ◀
          - button "把花种在中间" [pressed] [ref=e163] [cursor=pointer]: ●
          - button "把花种在右边" [ref=e167] [cursor=pointer]: ▶
          - button "保存到食谱" [ref=e171] [cursor=pointer]
          - button "收拾桌面" [ref=e176] [cursor=pointer]
        - status [ref=e180]: 继续搭配、分享或修改，喜欢的作品留在食谱。
        - button "自由布置工具" [ref=e182] [cursor=pointer]: 布置
        - generic [ref=e186]:
          - button "下一院活动" [ref=e187] [cursor=pointer]: ➜下一院活动
          - button "再准备一次" [ref=e194] [cursor=pointer]
          - button "收摊回小院" [ref=e195] [cursor=pointer]
      - generic [ref=e199]: 当前拿着苹果，可点一个餐位摆放。
```

# Test source

```ts
  144 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  145 |   console.log('EVIDENCE_DINNER_START_SECONDS', (Date.now() - walkStarted) / 1000);
  146 |   await expect(page.getByRole('img', { name: '第2份，共2份', exact: true })).toBeVisible({
  147 |     timeout: 15000,
  148 |   });
  149 |   await expect(feast).toHaveClass(/sip/);
  150 |   await expect(feast).toHaveClass(/stage-4/, { timeout: 15000 });
  151 |   await page.screenshot({
  152 |     path: evidencePath('docs/evidence/adventure-experience-02/dinner-drink-desktop.png'),
  153 |   });
  154 |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  155 |   await page.getByRole('button', { name: '邀请兔兔', exact: true }).click();
  156 |   await page.getByRole('button', { name: '邀请刺刺', exact: true }).click();
  157 |   await kitchen(page);
  158 |   await choosePrep(page, '● 1号盘');
  159 |   await make(page, 'sandwich');
  160 |   await make(page, 'juice');
  161 |   await page.getByRole('button', { name: '带作品到活动桌', exact: true }).click();
  162 |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('create')).toBe(true);
  163 |   await table(page);
  164 |   await page.getByRole('button', { name: '选择芝士三明治', exact: true }).click();
  165 |   await page.getByRole('button', { name: '分享给兔兔', exact: true }).click();
  166 |   await page.getByRole('button', { name: '品尝芝士三明治', exact: true }).click();
  167 |   await page.getByRole('button', { name: '保存到食谱', exact: true }).click();
  168 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  169 |   await expect
  170 |     .poll(() =>
  171 |       page.evaluate(
  172 |         () =>
  173 |           JSON.parse(
  174 |             localStorage.getItem('tabby.foodtruck.profile.m2') ?? '{}',
  175 |           ).activityMemories.filter((m: { state: { rewards: string[] } }) => m.state.rewards.length)
  176 |             .length,
  177 |       ),
  178 |     )
  179 |     .toBe(5);
  180 |   await page.screenshot({
  181 |     path: evidencePath('docs/evidence/adventure-experience-02/feast-desktop.png'),
  182 |   });
  183 |   const before = await state(page);
  184 |   await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  185 |   await page.reload();
  186 |   await page.getByRole('button', { name: '正在准备 · 社区小食会', exact: true }).click();
  187 |   expect((await state(page)).adventure?.works).toEqual(before.adventure?.works);
  188 |   await page.getByRole('button', { name: '再准备一次', exact: true }).click();
  189 |   await page.getByRole('button', { name: '翻开旧食谱', exact: true }).click();
  190 |   await expect(
  191 |     page
  192 |       .getByRole('region', { name: '上次留下的作品', exact: true })
  193 |       .locator('.remembered-table')
  194 |       .getByRole('img', { name: '芝士三明治', exact: true }),
  195 |   ).toBeVisible();
  196 |   expect((await state(page)).adventure?.foods).toEqual([]);
  197 |   expect((await state(page)).adventure?.rewards).toEqual([]);
  198 | });
  199 | 
  200 | test('desktop feast exposes replay skip and low motion without repeating settlement', async ({
  201 |   page,
  202 | }) => {
  203 |   test.setTimeout(180000);
  204 |   page.setDefaultTimeout(30000);
  205 |   const walkStarted = Date.now();
  206 |   await page.setViewportSize({ width: 1280, height: 720 });
  207 |   await begin(page);
  208 |   await kitchen(page);
  209 |   await send(page, 0, 'apple');
  210 |   await send(page, 1, 'banana');
  211 |   await table(page);
  212 |   await page.getByRole('button', { name: '打开储物抽屉', exact: true }).click();
  213 |   await page.getByRole('button', { name: '取出花苗', exact: true }).click();
  214 |   await page.getByRole('button', { name: '把花种在中间', exact: true }).click();
  215 |   await page.getByRole('button', { name: '取出浇水壶', exact: true }).click();
  216 |   await page.getByRole('button', { name: '给迎客花浇水', exact: true }).click();
  217 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  218 |   console.log('EVIDENCE_FEAST_START_SECONDS', (Date.now() - walkStarted) / 1000);
  219 |   const before = await state(page);
  220 |   const feast = page.getByRole('region', { name: '朋友实际使用食品', exact: true });
  221 |   for (let stage = 0; stage < 5; stage++)
  222 |     await expect(feast).toHaveClass(new RegExp(`stage-${stage}`), { timeout: 15000 });
  223 |   await expect(page.getByRole('img', { name: '第2份，共2份', exact: true })).toBeVisible({
  224 |     timeout: 15000,
  225 |   });
  226 |   await expect(feast).toHaveClass(/stage-4/, { timeout: 15000 });
  227 |   await page.screenshot({
  228 |     path: evidencePath('docs/evidence/adventure-experience-02/breakfast-friends-desktop.png'),
  229 |   });
  230 |   for (const name of ['重看朋友使用', '跳过朋友演出', '低动态表现']) {
  231 |     const button = page.getByRole('button', { name, exact: true });
  232 |     await expect(button).toBeInViewport({ ratio: 1 });
  233 |     await button.click();
  234 |   }
  235 |   expect((await state(page)).adventure).toEqual(before.adventure);
  236 |   await page.screenshot({
  237 |     path: evidencePath('docs/evidence/adventure-experience-02/desktop-friend-controls.png'),
  238 |   });
  239 |   await page.getByRole('button', { name: '低动态表现', exact: true }).click();
  240 |   await kitchen(page);
  241 |   await make(page, 'juice');
  242 |   await page.getByRole('button', { name: '带作品到活动桌', exact: true }).click();
  243 |   await table(page);
> 244 |   await page.getByRole('button', { name: '选择苹果汁', exact: true }).click();
      |                                                                  ^ TimeoutError: locator.click: Timeout 30000ms exceeded.
  245 |   await page.getByRole('button', { name: '摆到1号餐位', exact: true }).click();
  246 |   await page.getByRole('button', { name: '品尝苹果汁', exact: true }).click();
  247 |   console.log('EVIDENCE_DRINK_START_SECONDS', (Date.now() - walkStarted) / 1000);
  248 |   const tasted = await state(page);
  249 |   await expect(feast).toHaveClass(/sip.*stage-3|stage-3.*sip/, { timeout: 15000 });
  250 |   await expect(feast).toHaveClass(/stage-4/, { timeout: 15000 });
  251 |   await page.screenshot({
  252 |     path: evidencePath('docs/evidence/adventure-experience-02/drink-use-desktop.png'),
  253 |   });
  254 |   await page.getByRole('button', { name: '重看朋友使用', exact: true }).click();
  255 |   await page.getByRole('button', { name: '跳过朋友演出', exact: true }).click();
  256 |   expect((await state(page)).adventure).toEqual(tasted.adventure);
  257 | });
  258 | 
  259 | test('phone replay follows hedgehog path with real food and no packing task', async ({ page }) => {
  260 |   test.setTimeout(300000);
  261 |   await page.setViewportSize({ width: 393, height: 665 });
  262 |   await begin(page);
  263 |   await kitchen(page);
  264 |   await send(page, 0, 'apple');
  265 |   await send(page, 1, 'banana');
  266 |   await table(page);
  267 |   await page.getByRole('button', { name: '打开储物抽屉', exact: true }).click();
  268 |   await page.getByRole('button', { name: '取出花苗', exact: true }).click();
  269 |   await page.getByRole('button', { name: '把花种在左边', exact: true }).click();
  270 |   await page.getByRole('button', { name: '取出浇水壶', exact: true }).click();
  271 |   await page.getByRole('button', { name: '给迎客花浇水', exact: true }).click();
  272 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  273 |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  274 |   await kitchen(page);
  275 |   await send(page, 0, 'vanilla-cone');
  276 |   await make(page, 'vanilla-cup');
  277 |   await page.getByRole('button', { name: '送去树荫分享', exact: true }).click();
  278 |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('cool')).toBe(true);
  279 |   await table(page);
  280 |   await page.getByRole('button', { name: '翻开旧食谱', exact: true }).click();
  281 |   await page.getByRole('button', { name: '收起食谱', exact: true }).click();
  282 |   await page.getByRole('button', { name: '比较两种甜点', exact: true }).click();
  283 |   await page.getByRole('button', { name: '选择香草冰淇淋杯', exact: true }).click();
  284 |   await page.getByRole('button', { name: '品尝香草冰淇淋杯', exact: true }).click();
  285 |   await page.getByRole('button', { name: '挂上暖色彩旗', exact: true }).click();
  286 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  287 |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  288 |   await kitchen(page);
  289 |   await send(page, 1, 'salad-sandwich');
  290 |   await table(page);
  291 |   await page.getByRole('button', { name: '打开储物抽屉', exact: true }).click();
  292 |   await page.getByRole('button', { name: '取出餐垫', exact: true }).click();
  293 |   await page.getByRole('button', { name: '选择蔬菜三明治', exact: true }).click();
  294 |   await page.getByRole('button', { name: '摆到1号餐位', exact: true }).click();
  295 |   await kitchen(page);
  296 |   await send(page, 0, 'sandwich');
  297 |   await table(page);
  298 |   await page.getByRole('button', { name: '选择芝士三明治', exact: true }).click();
  299 |   await page.getByRole('button', { name: '摆到2号餐位', exact: true }).click();
  300 |   await page.getByRole('button', { name: '铺上阳光桌布', exact: true }).click();
  301 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  302 |   expect((await state(page)).adventure?.branch).toBe('hedgehog');
  303 |   expect((await state(page)).adventure?.rewards).toEqual(['picnic-page']);
  304 |   await expect(page.getByRole('button', { name: '把篮子摆上桌', exact: true })).toHaveCount(0);
  305 |   await page.screenshot({
  306 |     path: evidencePath('docs/evidence/adventure-experience-02/picnic-hedgehog-phone.png'),
  307 |   });
  308 | });
  309 | 
  310 | test('free shop stops accepting, saves actual food, restores and returns to a natural ending', async ({
  311 |   page,
  312 | }) => {
  313 |   test.setTimeout(150000);
  314 |   await page.setViewportSize({ width: 393, height: 665 });
  315 |   await page.goto('/');
  316 |   await page.getByRole('button', { name: '自由开店', exact: true }).click();
  317 |   await page.getByRole('button', { name: '晨间水果', exact: true }).click();
  318 |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  319 |   await lesson(page);
  320 |   await table(page);
  321 |   await page.getByRole('button', { name: '邀请兔兔', exact: true }).click();
  322 |   await expect(page.getByRole('region', { name: '朋友的回访分享需要', exact: true })).toBeVisible();
  323 |   await page.getByRole('button', { name: '邀请刺刺', exact: true }).click();
  324 |   await page.getByRole('button', { name: '邀请长辈', exact: true }).click();
  325 |   await page.getByRole('button', { name: '下一组分享朋友', exact: true }).click();
  326 |   await expect(page.getByRole('button', { name: '分享给长辈', exact: true })).toBeInViewport();
  327 |   await page.getByRole('button', { name: '上一组分享朋友', exact: true }).click();
  328 |   await expect(page.getByRole('button', { name: '取出小勺', exact: true })).toBeInViewport();
  329 |   await page.getByRole('button', { name: '取出小勺', exact: true }).click();
  330 |   const beforeRotation = await state(page);
  331 |   await page.setViewportSize({ width: 665, height: 393 });
  332 |   await expect(page.getByRole('button', { name: '分享给兔兔', exact: true })).toBeInViewport();
  333 |   await expect(page.getByRole('button', { name: '收摊回小院', exact: true })).toBeInViewport();
  334 |   await page.setViewportSize({ width: 393, height: 665 });
  335 |   expect((await state(page)).adventure).toEqual(beforeRotation.adventure);
  336 |   await page.getByRole('button', { name: '停止接客，做作品', exact: true }).click();
  337 |   await kitchen(page);
  338 |   await send(page, 0, 'apple');
  339 |   await expect.poll(async () => (await state(page)).orders.length).toBe(0);
  340 |   await make(page, 'juice');
  341 |   await page.getByRole('button', { name: '带作品到活动桌', exact: true }).click();
  342 |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('create')).toBe(true);
  343 |   await table(page);
  344 |   await page.getByRole('button', { name: '选择苹果', exact: true }).click();
```