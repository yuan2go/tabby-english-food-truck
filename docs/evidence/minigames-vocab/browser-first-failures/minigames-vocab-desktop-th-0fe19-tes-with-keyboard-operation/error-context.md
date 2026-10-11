# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: minigames-vocab.spec.ts >> desktop theatre follows actual tool and liquid prerequisites with keyboard operation
- Location: e2e/minigames-vocab.spec.ts:42:1

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: '给大咪看看' })
    - locator resolved to <button type="button" class="primary">给大咪看看</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling

```

# Page snapshot

```yaml
- main [ref=e3]:
  - img "英语餐车游戏画面" [ref=e4]
  - region "大咪动作小剧场 · 朋友的水杯" [ref=e6]:
    - generic [ref=e7]:
      - button "返回游乐角" [ref=e8] [cursor=pointer]
      - heading "大咪动作小剧场 换一种玩法 · 4/4" [level=2] [ref=e9]:
        - text: 大咪动作小剧场
        - generic [ref=e10]: 换一种玩法 · 4/4
      - button "暂停小游戏" [ref=e11] [cursor=pointer]: 暂停
    - generic [ref=e12]:
      - generic [ref=e13]:
        - button "重听场景请求" [ref=e14] [cursor=pointer]
        - paragraph [ref=e18]: Wash the bowl.
        - button "看图示范" [ref=e19] [cursor=pointer]
      - generic [ref=e20]:
        - img "大咪响应你做的动作"
        - generic [ref=e21]:
          - generic [ref=e22]:
            - generic [ref=e23]:
              - button "拿起杯子" [ref=e24] [cursor=pointer]:
                - generic [ref=e25]:
                  - img "杯子"
              - generic [ref=e26]: 水已搅拌
            - generic [ref=e27]:
              - button "拿起倒水壶" [ref=e28] [cursor=pointer]:
                - generic [ref=e29]:
                  - img "倒水壶"
              - generic [ref=e30]: 杯里有水
            - button "拿起勺子" [ref=e32] [cursor=pointer]:
              - generic [ref=e33]:
                - img "勺子"
            - generic [ref=e34]:
              - button "拿起碗" [ref=e35] [cursor=pointer]:
                - generic [ref=e36]:
                  - img "碗"
              - generic [ref=e37]: 碗洗干净了
          - group "大咪手里的物件" [ref=e38]:
            - generic [ref=e39]: 先点物件
            - generic [aria-hidden] [ref=e40]: →
            - button "放回物件" [disabled] [ref=e41]: 放回
          - generic [ref=e42]:
            - generic [ref=e43]:
              - button "放到桌上" [ref=e44] [cursor=pointer]:
                - generic [ref=e45]:
                  - img "桌子"
                - generic [ref=e46]: 桌上
              - generic [ref=e47]:
                - button "拿起杯子" [ref=e48] [cursor=pointer]:
                  - generic [ref=e49]:
                    - img "杯子"
                - button "拿起倒水壶" [ref=e50] [cursor=pointer]:
                  - generic [ref=e51]:
                    - img "倒水壶"
                - button "拿起勺子" [ref=e52] [cursor=pointer]:
                  - generic [ref=e53]:
                    - img "勺子"
            - generic [ref=e54]:
              - button "放到水槽" [ref=e55] [cursor=pointer]:
                - generic [ref=e56]:
                  - img "碗"
                - generic [ref=e57]: 水槽
              - button "拿起碗" [ref=e59] [cursor=pointer]:
                - generic [ref=e60]:
                  - img "碗"
          - generic [ref=e61]:
            - button "倒水杯子" [ref=e62] [cursor=pointer]:
              - generic [ref=e63]:
                - img "杯子"
              - generic [ref=e64]: 倒水
            - button "搅拌杯子" [ref=e65] [cursor=pointer]:
              - generic [ref=e66]:
                - img "杯子"
              - generic [ref=e67]: 搅拌
            - button "清洗碗" [active] [ref=e68] [cursor=pointer]:
              - generic [ref=e69]:
                - img "碗"
              - generic [ref=e70]: 清洗
      - generic [ref=e71]:
        - button "撤回一步" [ref=e72] [cursor=pointer]
        - button "给大咪看看" [ref=e73] [cursor=pointer]
      - status [ref=e74]
      - generic [ref=e75]:
        - button "重玩这一组" [ref=e76] [cursor=pointer]
        - generic [ref=e77]: 开发语音未听审 · 没有计时与能力评分
```

# Test source

```ts
  1  | import { expect, test, type Page } from '@playwright/test';
  2  | const enter = async(page:Page)=>{await page.goto('/');await page.getByRole('button',{name:'迷你游戏',exact:true}).click();await page.getByRole('button',{name:/小院场景小游戏 ·/}).click();};
  3  | const choose=async(page:Page,kind:string,title:string)=>{await page.getByRole('button',{name:new RegExp(kind)}).first().click();await page.getByRole('button',{name:new RegExp(title)}).click();await page.getByRole('button',{name:'先认识今天的物件'}).click();await page.getByRole('button',{name:'我来动手'}).click();};
  4  | const meaning=async(page:Page)=>{if(await page.getByRole('button',{name:'我来动手'}).isVisible())await page.getByRole('button',{name:'我来动手'}).click();};
  5  | const take=async(page:Page,name:string)=>{await page.getByRole('button',{name:`拿起${name}`,exact:true}).click();};
  6  | const place=async(page:Page,name:string)=>{await page.getByRole('button',{name:`放到${name}`,exact:true}).click();};
> 7  | const check=async(page:Page)=>{await page.getByRole('button',{name:'给大咪看看'}).click();await expect(page.getByRole('button',{name:'下一段活动'})).toBeVisible();await page.getByRole('button',{name:'下一段活动'}).click();};
     |                                                                              ^ Error: locator.click: Test timeout of 60000ms exceeded.
  8  | const images=async(page:Page)=>{await expect.poll(()=>page.locator('.scene-game img, .scene-lobby img').evaluateAll((imgs)=>imgs.every(i=>(i as HTMLImageElement).complete&&(i as HTMLImageElement).naturalWidth>0))).toBe(true);};
  9  | 
  10 | test('desktop hunt, actual two-item delivery, recovery and no broken artwork',async({page})=>{
  11 |  await page.setViewportSize({width:1440,height:900});await enter(page);await choose(page,'小院寻物','朋友的两份心意');await images(page);
  12 |  await take(page,'杯子');await page.getByRole('button',{name:'交付找到的物件'}).click();await expect(page.getByRole('button',{name:'下一段活动'})).toHaveCount(0);
  13 |  await take(page,'勺子');await page.getByRole('button',{name:'交付找到的物件'}).click();await page.getByRole('button',{name:'下一段活动'}).click();await meaning(page);
  14 |  await take(page,'书');await page.getByRole('button',{name:'暂停小游戏'}).click();await expect(page.getByRole('dialog',{name:'小游戏已暂停'})).toBeVisible();await page.getByRole('button',{name:'继续玩'}).click();
  15 |  await page.reload();await page.getByRole('button',{name:'迷你游戏',exact:true}).click();await page.getByRole('button',{name:/小院场景小游戏 ·/}).click();await page.getByRole('button',{name:/朋友的两份心意/}).click();await expect(page.getByRole('group',{name:'大咪手里的物件'})).toContainText('放回');
  16 |  await page.getByRole('button',{name:'交付找到的物件'}).click();await page.getByRole('button',{name:'下一段活动'}).click();await meaning(page);await take(page,'花');await page.getByRole('button',{name:'交付找到的物件'}).click();await page.screenshot({path:'docs/evidence/minigames-vocab/hunt-desktop.png'});await page.getByRole('button',{name:'下一段活动'}).click();await expect(page.getByText('这次小院活动完成了')).toBeVisible();
  17 | });
  18 | 
  19 | test('phone memory supports relook and classifies a wrong replacement separately',async({page})=>{
  20 |  await page.setViewportSize({width:393,height:665});await enter(page);await choose(page,'餐桌少了什么','看看两件');await images(page);
  21 |  await page.getByRole('button',{name:'看好了，盖上再找'}).click();await take(page,'勺子');await page.getByRole('button',{name:'补回餐桌'}).click();await page.getByRole('button',{name:'给大咪看看'}).click();await expect(page.locator('.scene-feedback')).toContainText('再看');
  22 |  await page.getByRole('button',{name:'再看一眼'}).click();await page.getByRole('button',{name:'看好了，盖上再找'}).click();
  23 |  for(const word of ['杯子','碗','花']){await take(page,word);await page.getByRole('button',{name:'补回餐桌'}).click();await check(page);if(word!=='花'){await meaning(page);await page.getByRole('button',{name:'看好了，盖上再找'}).click();}}
  24 |  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('tabby.foodtruck.scene-mini.v1')??'{}'));expect(saved.scenes['memory-0'].attempts[0].dimension).toBe('memory');expect(saved.scenes['memory-0'].support).toContain('memory-relook');await page.screenshot({path:'docs/evidence/minigames-vocab/memory-phone.png'});
  25 | });
  26 | 
  27 | test('phone sorting accepts both-use containers without English penalties for incomplete moves',async({page})=>{
  28 |  await page.setViewportSize({width:393,height:665});await enter(page);await choose(page,'小仓库整理','一物多用');
  29 |  await take(page,'篮子');await place(page,'花园');await page.getByRole('button',{name:'给大咪看看'}).click();await expect(page.locator('.scene-feedback')).toContainText('还有');
  30 |  for(const [word,target]of [['倒水壶','花园'],['浇水壶','花园']]){await take(page,word);await place(page,target);}await check(page);await meaning(page);
  31 |  for(const [word,target]of [['袋子','厨房'],['餐巾','厨房'],['叶子','花园']]){await take(page,word);await place(page,target);}await check(page);await meaning(page);
  32 |  for(const [word,target]of [['盒子','花园'],['瓶子','厨房'],['书','木架']]){await take(page,word);await place(page,target);}await page.screenshot({path:'docs/evidence/minigames-vocab/sort-phone.png'});await images(page);await check(page);await expect(page.getByText('这次小院活动完成了')).toBeVisible();
  33 | });
  34 | 
  35 | test('phone designer spatial targets and saved free mode use actual objects',async({page})=>{
  36 |  await page.setViewportSize({width:393,height:665});await enter(page);await choose(page,'餐桌设计师','上下里面旁边');
  37 |  for(const [word,target]of [['杯子','桌上'],['球','篮内'],['球','桌下'],['椅子','桌边']]){await take(page,word);await place(page,target);await check(page);if(word!=='椅子')await meaning(page);}
  38 |  await page.getByRole('button',{name:'继续自由布置'}).click();await take(page,'灯');await place(page,'桌下');await page.getByRole('button',{name:'留下我的布置'}).click();await expect(page.locator('.scene-feedback')).toContainText('接着摆');await images(page);await page.screenshot({path:'docs/evidence/minigames-vocab/design-phone.png'});
  39 |  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('tabby.foodtruck.scene-mini.v1')??'{}'));expect(saved.scenes['design-0'].mode).toBe('free');expect(saved.scenes['design-0'].objects.find((o:{id:string})=>o.id==='lamp').place).toBe('under');
  40 | });
  41 | 
  42 | test('desktop theatre follows actual tool and liquid prerequisites with keyboard operation',async({page})=>{
  43 |  await page.setViewportSize({width:1440,height:900});await enter(page);await choose(page,'大咪动作小剧场','朋友的水杯');
  44 |  await page.getByRole('button',{name:'倒水杯子',exact:true}).click();await expect(page.locator('.scene-feedback')).toContainText('准备');
  45 |  await take(page,'杯子');await page.getByRole('button',{name:'放到桌上'}).press('Enter');await check(page);
  46 |  await take(page,'倒水壶');await page.getByRole('button',{name:'倒水杯子'}).click();await place(page,'桌上');await check(page);
  47 |  await take(page,'勺子');await page.getByRole('button',{name:'搅拌杯子'}).click();await place(page,'桌上');await check(page);
  48 |  await take(page,'碗');await place(page,'水槽');await page.getByRole('button',{name:'清洗碗'}).click();await page.screenshot({path:'docs/evidence/minigames-vocab/theatre-desktop.png'});await images(page);await check(page);await expect(page.getByText('这次小院活动完成了')).toBeVisible();
  49 | });
  50 | 
  51 | test('new vocabulary is reachable in small batches and audio failure keeps support through replay',async({page})=>{
  52 |  await page.route('**/audio/vocab-*.wav*',route=>route.abort());await page.goto('/');await page.getByRole('button',{name:'迷你游戏',exact:true}).click();await page.getByRole('button',{name:/小院场景小游戏 ·/}).click();await choose(page,'小院寻物','帮大咪拿东西');
  53 |  await expect(page.getByRole('button',{name:'重试声音'})).toBeVisible();await page.getByRole('button',{name:'看图继续'}).click();await take(page,'杯子');await page.getByRole('button',{name:'交付找到的物件'}).click();
  54 |  await page.getByRole('button',{name:'重玩这一组',exact:true}).click();await page.getByRole('button',{name:'确认重玩'}).click();await page.getByRole('button',{name:'先认识今天的物件'}).click();await page.getByRole('button',{name:'我来动手'}).click();
  55 |  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('tabby.foodtruck.scene-mini.v1')??'{}'));expect(saved.scenes['hunt-0'].support).toContain('answer-help');expect(saved.scenes['hunt-0'].heard).toBe(false);
  56 |  await page.getByRole('button',{name:'返回游乐角'}).click();await page.getByRole('button',{name:'返回游戏小摊'}).click();await page.getByRole('button',{name:/主题关卡 ·/}).click();await page.getByRole('button',{name:/认识小院120词/}).click();await expect(page.locator('.course-level-grid article')).toHaveCount(1);await page.getByRole('button',{name:'认识下一小组'}).click();await expect(page.locator('.library-navigation')).toContainText('第2小组');
  57 | });
  58 | 
```