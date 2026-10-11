# 大咪的英语餐车 / Dami's English Food Truck

和大咪一起做早餐、分享甜点、准备野餐、点亮餐桌和邀请朋友。单人、触控优先、面向3–6岁，以轻冒险、玩具厨房与轻量调度组成完整游戏。

同次交付的 **WP-ADVENTURE-EXPERIENCE-02** 已实现五章、野餐真实双路径和自由厨房的体验深化：单/双客支持策略、图示与可重听引导、朋友连续使用食品、工具探索和回访创作。相关工程与正常入口路径已有实际通过结果；负责人、真机、儿童观察与听审仍待验。实现与验证状态见[STATUS](docs/STATUS.md)，验收见[05](docs/05-delivery.md)，构建身份、分批结果和影像见[本包证据](docs/evidence/adventure-experience-02/README.md)。此前包已合并，证据保留[历史索引](docs/archive/pre-adventure-experience-02/index.md)。

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

当前 **WP-MINIGAMES-VOCAB-EXPANSION-01** 工程实现已验证：十类可选小游戏、120学习概念、33短指令、15新场景关/51任务；外部接受仍待验。[完整报告与启动](docs/evidence/minigames-vocab/README.md)、[120词覆盖表](docs/evidence/minigames-vocab/vocabulary-coverage.csv)，实际结果以STATUS为准。[本包实施计划](docs/plans/2026-10-11-minigames-vocab.md)。

2026-10-11 负责人授权统一提交、推送、PR并合并main，包括现存执行产物；负责人最新要求放弃试玩报告。本次整合版本测试/构建/运行检查均 **NOT_RUN**；历史工程结果仅对应原工作包。最新原PR云端CI均失败，详情与交付记录见[STATUS](docs/STATUS.md)。

## 最新整合版本验证（2026-10-12）

[完整报告](docs/playtests/2026-10-11-integrated-validation.md)和[证据索引](docs/playtests/2026-10-11-integrated-validation-43d7c76/README.md)：同一43d7c76构建的辅助UI五章、双野餐、自由厨房和十类小游戏代表路径完成，工程门禁仍失败，详见STATUS。本次只提交现存产物、不重跑测试，来源/hash见[交付索引](docs/evidence/validation-delivery-2026-10-12/README.md)。
