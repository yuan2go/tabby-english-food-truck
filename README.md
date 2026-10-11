# 大咪的英语餐车 / Dami's English Food Truck

和大咪一起做早餐、分享甜点、准备野餐、点亮餐桌和邀请朋友。单人、触控优先、面向3–6岁，以轻冒险、玩具厨房与轻量调度组成完整游戏。

当前工作包 **WP-ADVENTURE-EXPERIENCE-02** 正在深化现有五章、野餐真实双路径和自由厨房：接通单/双客支持策略、完整无识字引导、朋友连续使用食品、工具探索与有差异的五章和回访创作。实现与验证状态只见[STATUS](docs/STATUS.md)，验收与实施顺序见[05](docs/05-delivery.md)。此前包已合并，证据保留[历史索引](docs/archive/pre-adventure-experience-02/index.md)，不把此前结果当本包通过。

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
