# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: direct-cooking.spec.ts >> free kitchen starts at once and configuration is optional
- Location: e2e/direct-cooking.spec.ts:17:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('region', { name: '同桌厨房', exact: true })
Expected: visible
Timeout: 6000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('region', { name: '同桌厨房', exact: true }) with timeout 6000ms
  - waiting for getByRole('region', { name: '同桌厨房', exact: true })

```

```yaml
- main:
  - img "同桌场景画面"
  - region "自由开店菜单":
    - button "← 小院"
    - heading "今天的小院由你安排" [level=2]
    - paragraph: 选熟悉的食物和主题。旧客人照原来的请求，新朋友再看新菜单。
    - button "熟客小院" [pressed]
    - button "晨间水果"
    - button "树荫甜点" [disabled]
    - button "分享小食" [disabled]
    - group "今天供应哪些？":
      - text: 今天供应哪些？
      - checkbox "供应Can I have an apple, please?" [checked]
      - img "苹果"
    - group "这次需要怎样的帮助？":
      - text: 这次需要怎样的帮助？
      - button "先看大咪做"
      - button "图片陪我做" [pressed]
      - button "少些帮助，听一听"
    - button "一位一位来" [pressed]
    - button "两位一起招呼"
    - button "开门 / 继续营业"
    - paragraph: 可随时停止接客，做自己的作品，主动收摊结束今天。
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
  10 |  await page.getByRole('button',{name:'冰淇淋：蛋筒',exact:true}).click();await page.getByRole('button',{name:'冰淇淋：香草球',exact:true}).click();
  11 |  expect((await state(page)).items.map(i=>i.product)).toEqual(['vanilla-cone']);
  12 |  await expect(page.getByRole('button',{name:'启动冰淇淋台',exact:true})).toHaveCount(0);
  13 |  await page.getByRole('button',{name:'拿起香草蛋筒',exact:true}).click();await page.getByRole('button',{name:'交给兔兔',exact:true}).click();await expect.poll(async()=> (await state(page)).orders[0]?.status).toBe('done');
  14 |  await page.getByRole('button',{name:'冰淇淋：空杯',exact:true}).click();await page.getByRole('button',{name:'冰淇淋：草莓球',exact:true}).click();await page.getByRole('button',{name:'拿起草莓冰淇淋杯',exact:true}).click();await page.getByRole('button',{name:'交给刺刺',exact:true}).click();await expect.poll(async()=> (await state(page)).adventure?.steps.includes('cool')).toBe(true);
  15 |  await page.getByRole('button',{name:'比较两份甜点',exact:true}).click();await page.getByRole('button',{name:'品尝草莓冰淇淋杯',exact:true}).click();await page.getByRole('button',{name:'一起开席',exact:true}).click();expect((await state(page)).adventure?.rewards).toEqual(['bunting-page']);expect((await state(page)).adventure?.explored).not.toContain('recipe');
  16 | });
  17 | test('free kitchen starts at once and configuration is optional',async({page})=>{
> 18 |  await page.goto('/');await page.locator('.yard-endless .entry-main').click();await expect(page.getByRole('region',{name:'同桌厨房',exact:true})).toBeVisible();await expect(page.getByRole('region',{name:'自由开店菜单',exact:true})).toHaveCount(0);
     |                                                                                                                                               ^ Error: expect(locator).toBeVisible() failed
  19 |  await page.getByRole('button',{name:'暂停',exact:true}).click();await page.getByRole('button',{name:'调整开店设置',exact:true}).click();await expect(page.getByRole('region',{name:'自由开店菜单',exact:true})).toBeVisible();
  20 | });
  21 | 
```