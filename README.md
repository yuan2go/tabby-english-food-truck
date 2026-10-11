# 大咪的英语餐车 / Dami's English Food Truck

和大咪一起听需要、亲手制作、明确交付、看朋友使用，再改变小院。单人、面向3–6岁、手机/Pad触控优先的轻冒险与玩具厨房。

现行范围：五章、双野餐路线、自由厨房、十类可选小游戏；50食品概念与120学习概念分开，认知项不自动成为可供应料理，拼写/组句不锁主线。当前整合工程修复、首次体验、完整英文短句/整句重听与同构建设备/内容验收准备，实际结果见[STATUS](docs/STATUS.md)。

## 启动与验证

Node >=22.12.0，依赖锁于package-lock.json。`npm ci`、`npm run dev`，访问终端HTTP（默认 http://127.0.0.1:5173）。生产：`npm run build`、`npm run preview`。不双击index.html。

必要门禁：`npm run lint`、`npm test`、`npm run build`（含typecheck）、`npm run resources`；内容：`node scripts/check-vocabulary.mjs`。浏览器先安装 `npx playwright install chromium`，再 `npm run test:browser`；当前有效范围见[e2e合同](e2e/README.md)。原生Node22运行，不使用诊断loader。

## 权威入口

| 文档 | 唯一职责 |
| --- | --- |
| [01 产品](docs/01-product.md) | 目标、范围与非目标 |
| [02 规则](docs/02-game-design.md) | 严格/开放/自由、单归属、奖励及支持 |
| [03 体验](docs/03-experience-design.md) | 首次路径、意图、布局、冻结形象、音画 |
| [04 技术](docs/04-technical-design.md) | 状态源、模块职责、迁移及生命周期 |
| [05 验收](docs/05-delivery.md) | 本轮顺序、验证与交付合同 |
| [STATUS](docs/STATUS.md) | 实际实现与验证状态 |
| [本轮主报告](docs/evidence/demo-repair-2026-10-12/README.md) | 同构建289单元/31整合、模拟体验、失败与外部待验 |
| [现行索引](docs/index.md) / [既有参赛材料](docs/submission/index.md) | 当前合同与原正式稿/PDF的版本关系 |
| [AGENTS](AGENTS.md) | 协作边界 |
| [资源登记](art/README.md) | 来源、hash、制作、审核与权利 |
| [本轮前历史索引](docs/archive/pre-demo-repair-2026-10-12/index.md) | 被替代合同、授权和实施记录 |
| [上轮整合报告](docs/playtests/2026-10-11-integrated-validation.md) | D01–D04、T01、X01/X02原始失败及证据 |

规则是唯一事实源，错误交付留盘，可慢想、重听、撤回与重新准备。本仓库从零制作，不导入旧项目。本仓库存档恢复不推断新活动完成；无后端、账号、麦克风、儿童身份采集或运行时AI。

开发语音未听审、分发权待确认。代码、工程、代理体验、真机、教研/听审/权利与儿童观察分别记录。[既有站点](https://tabby-english-food-truck.yuan576264675.chatgpt.site/)是历史部署。2026-10-12负责人授权本次双包集成后的云端提交、PR合并与公开站点更新；实际部署及验证见STATUS。

明确点餐、制作提示、实际接收、品尝、小院行动、分享与历史回访使用统一完整英文台词及可重听声音。默认有英文字幕，字幕理解、听取、帮助和操作记录分开；不把角色代读当孩子口语输出。
