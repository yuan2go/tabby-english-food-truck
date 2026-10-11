# 大咪的英语餐车 / Dami's English Food Truck

和大咪一起做早餐、分享甜点、准备野餐、点亮餐桌和邀请朋友。单人、触控优先、面向3–6岁，以轻冒险、玩具厨房与轻量调度组成完整游戏。

前包 **WP-PLAYABLE-ADVENTURE-01** 已实现五章连续共同活动、野餐真实双路径、自由制作/摆放/品尝/作品食谱、互动小院和熟悉菜单自由开店。交付改变活动，花、彩旗、桌布和灯随真实探索与协作解锁；收摊、重玩与回访保留作品及活动记忆。严格订单、开放委托、自由制作共用规则核并分别判定。

工程结果与外部验收见[STATUS](docs/STATUS.md)，正常入口与少量画面见[本包证据](docs/evidence/playable-adventure/README.md)，规则与验收见下表。进入小院当前活动即可开始五章；“自由开店”选择已介绍菜单与主题，停止接客后可继续做作品并自然收摊。

## 启动

Node >=22.12.0，依赖版本由真实package-lock锁定。

```sh
npm ci
npm run dev
```

终端本地HTTP默认 http://127.0.0.1:5173 。生产预览 `npm run build && npm run preview`；不双击index.html。必要检查：`npm run typecheck`、`npm run lint`、`npm test`、`npm run build`、`npm run resources`。浏览器 `npx playwright install chromium` 后 `npm run test:browser`。

## 权威文档

| 文档 | 职责 |
| --- | --- |
| [01 产品](docs/01-product.md) | 目标、五章共同活动、范围与非目标 |
| [02 规则](docs/02-game-design.md) | 严格订单/开放委托/自由制作、分支、物料与奖励 |
| [03 体验](docs/03-experience-design.md) | 场景、触控、动作、音画与冻结形象 |
| [04 技术](docs/04-technical-design.md) | 单规则核、状态、迁移、生命周期 |
| [05 交付](docs/05-delivery.md) | 实施顺序、风险验证、Git与交付边界 |
| [STATUS](docs/STATUS.md) | 实际实现、验证、提交与外部限制 |
| [AGENTS](AGENTS.md) | 协作约束 |
| [资源登记](art/README.md) | 来源、导出、实际清单、权利与审核 |
| [历史索引](docs/archive/pre-playable-adventure-01/index.md) | 旧方案与验证追溯 |

原料/加工/交付共用唯一规则；错误交付保留食品，允许慢想、重听、帮助与重新准备。小游戏与教学保留，拼写/组句不锁主线。五十食品含仅认知项，不冒称五十道可制作料理。

本仓库从零制作，不读取/复制旧项目；既有本仓库存档恢复不推断新增活动已完成。没有后端、运行时AI、账号或儿童个人数据采集。

[既有站点](https://tabby-english-food-truck.yuan576264675.chatgpt.site/)为历史部署；本包未经授权不部署。工程验证、负责人视觉/手感、真机、教研/听审/权利与儿童观察分别报告，开发语音明确未审核。

当前 **WP-MINIGAMES-VOCAB-EXPANSION-01** 实施中：十类可选小游戏、120学习概念与至少20短指令；完成与验证以STATUS为准。[本包实施计划](docs/plans/2026-10-11-minigames-vocab.md)。
