# 设计说明证据附录

2026-10-12。正文只保留参赛要求四项；本附录提供可核验来源和实际边界。

## 同版来源

| 项目 | 实际记录 |
| --- | --- |
| 发布main基线 | `0b249b04697b1df43d74bbe1a4f532175b2d04f1` |
| Demo完整源包 | `36200dd4d7bd931e4e5fedf8a25465d6b3f9e9e5` |
| 英语完整源包 | `103c2bb2272ddaa86fe32e342fc20e86feeb3a80` |
| 最新GitHub代码main | `7339c5119007e913327609fa6e24d89a5a86cb21` |
| 最终代码PR受检head | `53c072bda4a5c3668f4bd973232f46e5f25cde0d` |
| Sites来源 | `1ab58709b1d557099180f28174cb0526cdfc7160`，dirty=false |
| 线上身份 | version 3，content adventure-experience-2，asset `aee135e9f33a2fa387ba5319e0f7ced101841b38207d06e2e303bf67db230caa` |
| 实际网址 | https://tabby-english-food-truck.aw9923299.chatgpt.site |

[部署映射](../evidence/contest-release-2026-10-12/deployment.json)、[源文件同一性](../evidence/contest-release-2026-10-12/site-source-integrity.json)、[工程结果](../evidence/contest-release-2026-10-12/engineering-results.json)共同关联GitHub、Sites与静态构建。Sites仅排除docs/evidence和docs/playtests的大量原始验证录像，它们完整留在已合并GitHub仓库；所有保留源码/运行资源逐路径Git blob相同，仅添加只读site-release.json版本映射。

## 玩法与主题

五章、双野餐选择、自由制作/作品记忆、十类自选小游戏来自[01产品](../01-product.md)、[02规则](../02-game-design.md)和[03体验](../03-experience-design.md)。统一规则、真实食品接收/品尝、合法开放方案、错单留盘以及支持/尝试分记分别见src/rules、src/platform和有效E2E。完整故事与代表行为通过精确代码head的33条GitHub浏览器门禁；实际线上只复核代表入口，不冒称重新逐项玩完五章。

[匿名线上读回](../evidence/contest-release-2026-10-12/live/live-verification.json)：空cookie的新Chromium上下文，HTTP200、正常首页→晨光→主动迎入兔兔→图示教学→完整英文苹果请求→取苹果→端整盘→明确交付→真实苹果回执→活动桌。1280×720、393×665、852×300、768×1024三个演出控制均48px以上、完整在视口并可实际命中；新增图带图示包含/不叠压约束也复核。没有注入通关或伪造孩子作答，读回语言尝试实际为assisted、audio-not-observed。

3–6岁是产品目标，纸艺小院、亲手准备与帮助朋友是主题。工程/浏览器代理检查不证明真实儿童适龄、趣味或学习效果。

## AI采用案例

采用OpenAI Codex和OpenAI内置imagegen。Codex参与规则、界面、存档、原创SVG/DOM图示、验证修复及文档；imagegen生成本仓库新背景、姿态和食品。记录见[AI使用](../AI-usage.md)和[资源来源/权利](../../art/README.md)。

真实修订案例：初始m2-foods三明治/汉堡配料与规则不符，[制作记录](../../art/m2-production.json)保留原因；随后按两片面包＋芝士，以及圆面包＋熟肉饼＋生菜＋番茄、无芝士的约束重生成recipe-outputs，经[机械导出](../../scripts/export-m2.mjs)与[登记](../../art/manifest.json)接入成品显示。前六条promptRecord是制作意图摘要，标exact的记录才是实际提示词，不补造原始对话、效率数字或学习成效。

Samantha/Tingting是普通离线开发TTS，当前133条新增整句映射与文本/文件登记一致；未人工听审、分发权待验。运行时是明确规则和本地状态，没有实时模型对话、模型判题、后端、麦克风或儿童身份采集。

## 配图

当前图1：[04-online-kitchen](assets/04-online-kitchen.png)，1280×720，来自最新公开站点正常入口，SHA256 `d16376dcbe54c8fabe75ed9092b77b5d71f895d2edf74421984622d4b358d1ce`，与[原图](../evidence/contest-release-2026-10-12/live/04-online-kitchen.png)逐字节相同；无裁切、拼合、重绘或后加文字。PDF按原比例缩放嵌入。原01/02/03三图仍保留，来源43d7c76，仅作为历史材料，身份和hash见[清单](assets/screenshots.json)。

## 参赛要求与边界

负责人要求“附一份简短《设计说明》，写清玩法、主题、用了哪些AI、核心亮点”；当前一页正文逐项覆盖，附实际可玩网址，并明确“访问需要开启 VPN”。已核验public与免登录访问，GitHub源码链接未当成游戏网址。

比赛原通知的截止/评选日期未注明年份；是否接受本次提交由组织方确认，本轮不冒称报名或按时提交成功。实体手机/Pad、儿童观察、教研、人工听审及素材/声音权利各自NOT_RUN/PENDING；历史真机NEEDS_REVISION、60fps NOT_MET和真实后台hidden NOT_CONFIRMED保留。用户授权上线不等于这些审核通过。
