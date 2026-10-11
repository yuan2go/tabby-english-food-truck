# 大咪的英语餐车 / Dami's English Food Truck

和大咪一起做早餐、分享甜点、准备野餐、点亮餐桌和邀请朋友。面向3–6岁、单人、触控优先的英语轻冒险，以玩具厨房、共同活动和自由创作承载听理解与情境动作。

当前产品合并了五章活动、野餐双路径、自由厨房、朋友回访与十类可选小游戏。规则和范围以01–04为准；实现不等于验收。最新整合验证走通了代表性辅助UI路径，工程门禁及部分交互仍失败，真机、儿童观察、教研、人工听审与资源权利待验，详见[STATUS](docs/STATUS.md)。

## 启动

Node >=22.12.0，依赖由真实package-lock锁定。

```sh
npm ci
npm run dev
```

打开终端显示的本地HTTP地址。生产预览使用 `npm run build`、`npm run preview`，不双击index.html。本地地址是开发/评审预览，不是在线Demo。

工程命令：`npm run typecheck`、`npm run lint`、`npm test`、`npm run build`、`npm run resources`；浏览器命令为 `npm run test:browser`。当前失败与受测版本见STATUS，不承诺所有命令已通过。

## 文档入口

完整[现行文档索引](docs/index.md)区分产品权威、实际验证、AI/资源记录与历史归档。

| 文档 | 职责 |
| --- | --- |
| [01 产品](docs/01-product.md) | 目标、五章、厨房、小游戏范围与有效候选 |
| [02 规则](docs/02-game-design.md) | 明确订单、开放委托、自由制作与状态判定 |
| [03 体验](docs/03-experience-design.md) | 场景、触控、音画及角色约束 |
| [04 技术](docs/04-technical-design.md) | 单规则核、状态、存档与生命周期 |
| [05 交付](docs/05-delivery.md) | 当前验收边界及文档工作包范围 |
| [STATUS](docs/STATUS.md) | 最新Git基线、实际结果、失败与待验事项 |
| [证据索引](docs/evidence/README.md) | 最新整合报告与历史证据入口 |
| [AI使用](docs/AI-usage.md) / [资源登记](art/README.md) | 实际制作、修订、接入、来源及审核状态 |
| [AGENTS](AGENTS.md) | 长期协作约束 |
| [治理归档](docs/archive/pre-submission-2026-10-12/index.md) | 被替代阶段说明、授权和旧计划原文 |

原料、加工、交付共用规则；错单保留食品，允许慢想、重听、帮助和重新准备。五十食品概念含仅认知项，不能写成五十道可制作料理；120学习概念也不代表120份营业食品。拼写与组句不锁主线。

本仓库从零制作，不导入旧项目。无后端、账号、运行时AI或儿童个人数据采集。

[既有站点](https://tabby-english-food-truck.yuan576264675.chatgpt.site/)于2026-10-12打开核实仍是历史 `m2.2`，不对应当前五章版本。源码链接和本地预览均不作为正式在线Demo；本轮不部署。
