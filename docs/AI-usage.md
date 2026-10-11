# AI使用与制作追溯

本记录描述已发生的开发期工作；审核状态以[资源登记](../art/README.md)与[STATUS](STATUS.md)为准。运行游戏不连接大模型，没有AI实时对话、模型判题或模型个性化教学。

| 工具/方法 | 实际参与 | 可核验产物 |
| --- | --- | --- |
| OpenAI Codex | 设计约束整理、规则/界面/存档编码、原创SVG/DOM/CSS道具、验证及失败修复、交付文档 | src、tests、e2e、scripts及各工作包证据；代理复查不等于人工审核 |
| OpenAI内置imagegen | 本仓库新背景、角色姿态、独立食品/设备源稿；按获准参考保持大咪身份 | art/source、public/assets、提示词/制作登记与manifest |
| macOS say / Samantha、Tingting | 落盘开发英语与中文情境TTS，afconvert导出WAV | art各audio记录、speech.json、public/audio；普通TTS，不称大模型能力 |
| 原创波形音效、规则与seed随机 | 操作反馈、合法题目选择及确定性判定 | audio-synthesis、rules/content；不计作运行期AI |

## 可追溯修订案例

**食品图片与配方一致。** 初始m2-foods候选三明治/汉堡含多余配料，制作登记保留不匹配及相邻裁区问题。随后imagegen按两片面包＋芝士、圆面包＋熟肉饼＋生菜＋番茄且无芝士的约束重生成recipe-outputs，机械裁切、保留透明边并缩小，独立WebP由食品资源映射加载。[制作记录](../art/m2-production.json)前六条是制作意图摘要，后两条标exact；不能将摘要冒充原始提示词。[导出记录](../art/m2-exports.json)、[导出脚本](../scripts/export-m2.mjs)、[配方](../src/content/recipes.ts)、[资源注册](../src/game/assets.ts)共同追溯。

**工程检查检出跨界面样式冲突。** Codex生成的活动演出及场景小游戏在源工作包分别有通过结果，整合版复核却发现两处同名theatre-controls样式相互影响，重播/跳过/低动态控件裁切；另有暂停焦点问题。最新报告保留证据与原因，当前main不能宣称已修复。本轮文档仅据此修订完成度表达，不把未合入修复分支写成最终落地。[完整报告](playtests/2026-10-11-integrated-validation.md)5–6节可复核。正式说明优先采用已落地的食品图片案例。

## 记录与审核边界

完整阶段制作史、具体当时SHA/命令/分批结果及临时交付授权见[历史AI记录原文](archive/pre-submission-2026-10-12/AI-usage.md.txt)；其“未合并”等是当时事实，不是当前Git状态。原始提示词、意图摘要、导出记录、自动检查和人工审核明确区分；没有工时或学习效果测量，不补造效率数字。

图像派生已接入不等于负责人接受或权利批准；开发语音统一DEVELOPMENT_TTS_UNREVIEWED，人工听审NOT_RUN、分发权PENDING。新场景道具为Codex编写的原创SVG，不冒称imagegen生成。历史失败及资源生产原件全部保留。
