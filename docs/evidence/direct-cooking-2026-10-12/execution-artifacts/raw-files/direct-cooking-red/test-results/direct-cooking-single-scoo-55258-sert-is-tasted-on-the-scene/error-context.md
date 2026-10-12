# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: direct-cooking.spec.ts >> single scoop uses four real actions and a different dessert is tasted on the scene
- Location: e2e/direct-cooking.spec.ts:4:1

# Error details

```
TimeoutError: locator.click: Timeout 12000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: '冰淇淋：蛋筒', exact: true })

```

# Page snapshot

```yaml
- main [ref=e3]:
  - img "同桌场景画面" [ref=e4]
  - region "同桌厨房" [ref=e6]:
    - generic [ref=e7]:
      - generic:
        - generic: 树荫甜点
        - button "暂停" [ref=e8] [cursor=pointer]: Ⅱ
      - region "朋友实际使用食品":
        - generic:
          - generic [ref=e10]:
            - button "重听兔兔：Can I have one scoop of vanilla ice cream in a cone, please?" [ref=e11] [cursor=pointer]:
              - text: Can I have one scoop of
              - strong [ref=e12]: vanilla ice cream in a cone
              - text: ", please?"
            - button "播放整句：Can I have one scoop of vanilla ice cream in a cone, please?" [ref=e13] [cursor=pointer]: ▶
            - generic [ref=e14]: 可播放整句
          - region "说话者的图示需要" [ref=e15]:
            - button "看图理解兔兔的请求" [ref=e16] [cursor=pointer]:
              - img "香草蛋筒"
          - button "听兔兔的请求" [active] [ref=e17] [cursor=pointer]:
            - generic [ref=e18]: 兔兔
          - button "兔兔的接餐盘" [ref=e19] [cursor=pointer]:
            - generic [ref=e20]: 兔兔面前的接餐盘
        - generic:
          - button "重听刺刺：Can I have ice cream in a cup, please? Any flavor is fine." [ref=e22] [cursor=pointer]: ↻
          - button "和刺刺说话" [ref=e23] [cursor=pointer]:
            - generic [ref=e24]: 刺刺
          - button "刺刺的接餐盘" [ref=e25] [cursor=pointer]:
            - generic [ref=e26]: 刺刺面前的接餐盘
      - generic [ref=e27]:
        - button "打开储物抽屉" [ref=e28] [cursor=pointer]
        - button "翻开旧食谱" [ref=e29] [cursor=pointer]
      - generic [ref=e30]:
        - navigation "旁边的实体设备" [ref=e31]:
          - button "看看果汁机" [ref=e32] [cursor=pointer]:
            - generic [ref=e33]: 果汁机
        - generic [ref=e34]:
          - button "放到冰淇淋台" [ref=e35] [cursor=pointer]
          - button "启动冰淇淋台" [ref=e36] [cursor=pointer]: 接好
        - button "放到制作承放区" [ref=e38] [cursor=pointer]: 暂放
      - generic [ref=e39]:
        - button "拿起蛋筒" [ref=e40] [cursor=pointer]:
          - img "蛋筒"
          - generic [ref=e41]: cone
        - button "拿起空杯" [ref=e42] [cursor=pointer]:
          - img "空杯"
          - generic [ref=e43]: cup
        - button "拿起香草球" [ref=e44] [cursor=pointer]:
          - img "香草球"
          - generic [ref=e45]: vanilla
        - button "拿起草莓球" [ref=e46] [cursor=pointer]:
          - img "草莓球"
          - generic [ref=e47]: strawberry
        - button "拿起香蕉" [ref=e48] [cursor=pointer]:
          - img "香蕉"
          - generic [ref=e49]: banana
      - region "手中真实物件"
      - status: 可以看图、重听，慢慢准备。
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | import { state } from './helpers';
  3  | test.use({ viewport:{width:393,height:665}, hasTouch:true, isMobile:true });
  4  | test('single scoop uses four real actions and a different dessert is tasted on the scene',async({page})=>{
  5  |  await page.goto('/');await page.getByRole('button',{name:'正在准备 · 晨光开门',exact:true}).click();
  6  |  for(const [friend,food] of [['兔兔','苹果'],['刺刺','香蕉']]){
  7  |   await page.getByRole('button',{name:'先帮'+friend,exact:true}).click();await page.getByRole('button',{name:'拿起'+food,exact:true}).click();await page.getByRole('button',{name:'交给'+friend,exact:true}).click();await expect.poll(async()=> (await state(page)).orders.find(o=>o.visitor===(friend==='兔兔'?'rabbit':'hedgehog'))?.status).toBe('done');
  8  |  }
  9  |  await page.getByRole('button',{name:'一起吃早餐',exact:true}).click();await page.getByRole('button',{name:'下一院活动',exact:true}).click();await page.getByRole('button',{name:'先帮兔兔',exact:true}).click();
> 10 |  await page.getByRole('button',{name:'冰淇淋：蛋筒',exact:true}).click();await page.getByRole('button',{name:'冰淇淋：香草球',exact:true}).click();
     |                                                            ^ TimeoutError: locator.click: Timeout 12000ms exceeded.
  11 |  expect((await state(page)).items.map(i=>i.product)).toEqual(['vanilla-cone']);
  12 |  await expect(page.getByRole('button',{name:'启动冰淇淋台',exact:true})).toHaveCount(0);
  13 |  await page.getByRole('button',{name:'拿起香草蛋筒',exact:true}).click();await page.getByRole('button',{name:'交给兔兔',exact:true}).click();await expect.poll(async()=> (await state(page)).orders[0]?.status).toBe('done');
  14 |  await page.getByRole('button',{name:'冰淇淋：空杯',exact:true}).click();await page.getByRole('button',{name:'冰淇淋：草莓球',exact:true}).click();await page.getByRole('button',{name:'拿起草莓冰淇淋杯',exact:true}).click();await page.getByRole('button',{name:'交给刺刺',exact:true}).click();await expect.poll(async()=> (await state(page)).adventure?.steps.includes('cool')).toBe(true);
  15 |  await page.getByRole('button',{name:'比较两份甜点',exact:true}).click();await page.getByRole('button',{name:'品尝草莓冰淇淋杯',exact:true}).click();await page.getByRole('button',{name:'一起开席',exact:true}).click();expect((await state(page)).adventure?.rewards).toEqual(['bunting-page']);expect((await state(page)).adventure?.explored).not.toContain('recipe');
  16 | });
  17 | test('free kitchen starts at once and configuration is optional',async({page})=>{
  18 |  await page.goto('/');await page.locator('.yard-endless .entry-main').click();await expect(page.getByRole('region',{name:'同桌厨房',exact:true})).toBeVisible();await expect(page.getByRole('region',{name:'自由开店菜单',exact:true})).toHaveCount(0);
  19 |  await page.getByRole('button',{name:'暂停',exact:true}).click();await page.getByRole('button',{name:'调整开店设置',exact:true}).click();await expect(page.getByRole('region',{name:'自由开店菜单',exact:true})).toBeVisible();
  20 | });
  21 | 
```