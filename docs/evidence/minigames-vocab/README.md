# WP-MINIGAMES-VOCAB-EXPANSION-01 · 产品实现与工程验证

本包保留五类原小游戏，接入五类有独立操作和规则的小院场景；学习词库从50食品概念扩展为120个去重概念，与供应、配方、营业库存分离。工程实现完成；负责人视觉/手感、人工听审、教研、儿童观察、真机与分发权利仍待验，不代表公开发布接受。

## 实际内容与入口

从首页「迷你游戏」可进入「主题关卡」和「小院场景小游戏」；小院活动桌「去小院游乐角」为可选入口，返回原活动。拼写、组句按基础自选，不锁故事。认识120词每次只呈现一个小组，下一组/上一组/建议复访可达全部内容。

| 类型 | 实际操作与变化 |
|---|---|
| 听音找物 | 先见物听音，再听声音选择；新词提供「听一句怎么用」，学习例句与挑战听音分开 |
| 多组配对 | 实际选择多对，重复选取和已用配对有规则约束；新增词用实物、动作、空间表现 |
| 拼写 | 字母拼接与撤回，自选识字负荷，不阻主线 |
| 数量组合 | 手动逐件配盘、取回、确认；按内容与数量而非摆放顺序，保留原选择方式 |
| 组句 | 词块拼接/撤回，语法与实际请求分开，播放完整请求 |
| 小院寻物 | 清晰热点取物、手持、交付，多件目标按真实交付累计；3关含入门/线索变化/多件复访 |
| 餐桌少了什么 | 观察→真实遮挡→揭开→补回；允许重看，错补记录记忆维度；3关改变缺项和观察负荷 |
| 小仓库整理 | 类别、用途、属性实际搬放，容器等合法多解接受，未摆完不算英语错误；3关 |
| 餐桌设计师 | 桌上/桌下/盘旁/容器内真实布置，数量及属性变化；3任务关另有自由布置，自由不计英语尝试 |
| 大咪动作小剧场 | 拿工具、开合、倒水、搅拌、洗、切、搬运、分享；物件状态与前置决定可执行动作，3关 |

混合复习沿用，不另算一种。新增15场景关、51任务；保留31原关（30主题+1混合）并新增56小组课。词条为50食品+70新词，新增70覆盖餐具厨具20、小院18、属性13、数量5、动作10、方位4。固定多词按一个概念，词形/大小写/加工不增计数。33条当前精确短请求/指令独立统计。

完整名单与真实覆盖：[120行CSV](vocabulary-coverage.csv)、[可读词表](vocabulary-coverage.md)、[机器数据](coverage.json)、[33条指令](instructions.md)。场景栏为空表示该词通过主题听音/配对实际到达，并非假装已经加入某个场景。每个词至少两类适合玩法，数据校验直接执行课程阶段和51任务解，不注入通关。

## 资源、规则与恢复

新增38幅原创道具SVG源稿及38个对应WebP，动作与方位由实际角色/物件动画和空间表达；关键文字仍由UI绘制。新增222个落盘WAV涵盖词名、情境、引导与精确任务语音及历史版本。全部资源清单645文件、418明确语音引用，尺寸/哈希/透明度/实际入口通过校验；原50食品映射未改。资源来源、用途、权利和开发语音审核状态见[art登记](../../../art/README.md)。开发语音使用本机Samantha离线制作，明确 DEVELOPMENT_TTS_UNREVIEWED，人工听审 NOT_RUN。

职责按 vocabulary/课程与scene-levels内容、mini-course/scene-games纯规则、SceneBoards/SceneGuide/VocabularyVisual表现、AudioManager音频、MiniStore保存划分。非食品不进入食谱或库存，无新后端/运行时AI/账号/经济/地图框架。

保存保持旧小游戏和课程key/version，新场景独立key；手持、具体摆放、阶段、暂停、支持与实际尝试恢复，随机池按会话/轮次稳定。重复输入/交付和奖励幂等。详细尝试有界，支持汇总不因截断/重玩洗掉；声音失败可重试/图示，未听到不标独立听力，播放例句不产生尝试。学习示范进入挑战时重置挑战heard。自由创作、记忆与操作不算英语掌握率。

坏档、未来版本、拒存保护原档并可导出；课程3M/场景1.5M统一写读预算，超限仅内存继续与导出，不覆盖旧档。后台/暂停取消音频，暂停期规则拒绝动作，刷新保留暂停由正常「继续玩」恢复。剧场先搅拌不会使后续filled目标死锁；盘旁必须有桌上参照盘；五杯手机可逐件取回再放。

## 验证环境与结果

macOS Darwin arm64；Node v24.15.0/npm11.12.1；package-lock固定依赖，未升级。React19.1.1/Phaser3.90.0/TypeScript5.9.3/Vite7.3.6/Biome2.5.14/Vitest4.1.11/Playwright1.63.0，Chromium桌面1440×900和手机模拟393×665，单worker浏览器。CI既有Node22.12配置未改、未新增/启用工作流，云端运行结果另看PR。

| 命令/检查 | 退出码与实测 |
|---|---|
| npm ci | 0，真实锁文件，版本未变 |
| npx vitest run --maxWorkers=2 | 0，20文件264/264，通过原断言与原5秒用例预算；[最终日志](unit-final-pass.log) |
| npm run lint | 0，199文件、0 errors，110 warnings/16 infos；[日志](lint-delivery-final.log)，未削规则，警告含原有与本包CSS优先级 |
| npm run build（包含npm run typecheck） | 0，严格类型检查通过，103模块生产输出；[生产构建](build-delivery.log)，保留>500KB分块提示 |
| npm run resources | 0，645文件/418语音引用/50食品全部资源；[日志](resources-visual-final.log) |
| node scripts/check-vocabulary.mjs | 0，120去重、每词至少2玩法、50供应不变、51实际解、33指令；[日志](content-delivery.log) |
| 正常入口Playwright9例 | 1，第二轮7通过/2流程假设失败；[日志](browser-second.log)，原视频/错误保留 |
| 音频修订后5例 | 1，3通过/2失败（首页点击超时、误点厨房键盘热区）；[原日志](browser-final-attempt.log)/[原视频](browser-final-attempt-artifacts/) |
| 桌面布局/指针修订后定向3例 | 0，3/3，通过双物刷新、实际厨房拿放、五杯/剧场；[日志](browser-final.log)/[视频](browser-final-artifacts/) |
| 最后容器提示/稳定物件身份手机复核 | 0，1/1，通过五只稳定身份物件各自取放、视口与剧场帮助/核心控件；[日志](browser-phone-final.log)/[视频](browser-phone-final-artifacts/) |
| git diff --check（源代码） | 0；原始控制台日志保留终端空白，不改写失败证据 |

分轮定向复核包括寻物实际双物交付+手持刷新、新词小组+音频失败+例句、原五类实际操作、活动返回与自由厨房真实拿放、手机五杯和动作按钮。上一轮通过的记忆完整3任务、整理多解完整3任务、设计方位与自由、大咪茶杯剧场完整4任务不因无关UI改动重跑。浏览器从正常入口逐步点击和键盘操作，只读存档作核验；未注入学习完成、未穷举120浏览器操作。

失败并列保留：早期缺图cat-listen引用已换既有cat-idle；刷新保持暂停必须正常继续，厨房存在入门教学必须「我来试试」后拿放；首次剧场长流程60秒预算不足，用例180秒而不改判定。旧100单无尽用例在并行默认worker时5秒超时，定向同18项/同预算通过，最终限制单元worker=2全264通过，未延长规则测试预算或删断言。红→绿规则与独立只读复核见[review](review.md)，原失败视频见[browser-first-failures](browser-first-failures/)和[browser-second-artifacts](browser-second-artifacts/)。

复核命令（均通过实际入口，不设置通关数据）：

```sh
TEST_PORT=5195 npx playwright test e2e/minigames-vocab.spec.ts
TEST_PORT=5195 npx playwright test e2e/minigames-vocab.spec.ts --grep 'desktop hunt|new vocabulary|original five|yard minigames|phone five-cup'
TEST_PORT=5195 npx playwright test e2e/minigames-vocab.spec.ts --grep 'desktop hunt|yard minigames|phone five-cup'
TEST_PORT=5195 npx playwright test e2e/minigames-vocab.spec.ts --grep 'phone five-cup'
```

## Git、启动与验收边界

baseline/main：`64f03fc716de70e20f64f9bbc3802de7601a460f`。独立分支 `codex/wp-minigames-vocab-expansion-01`，文档先行 `3685ecd8eecd7a4d7d0f6b0f1dd833e5e4ebf97a`，完整产品 `ebe104d468b81eac5703b5a832827ed168cda17a`，恢复与视觉 `3eea0577891315eeca3ef4be09bf37fb24121e60`，动作按钮 `8596bfbbc55fe6acadfb2dfa6243a0315d5f15a5`，最终运行源码 `1b2d7b3d15cff2d2446939c59be5040e61bb802c`（生产dirty=false证据见runtime-build.json）。264项规则测试在83c0453通过；随后6edde73调整手机桌面CSS/真实指针路径，1b2d7b3只把容器提示改为“里面有水”并强化五杯稳定身份复核；没有规则变化，未再重复无关单元。报告提交后final完整SHA在Git/PR交付消息列示；其后仅文档与原始证据，不改变本次受测源码。原工作区codex/player-review-2026-10-11未提交docs/playtests保留。

在工作分支目录 `/Users/dafangzi/.codex/worktrees/minigames-vocab-01/tabby-english-food-truck` 运行：`npm ci`，`npm run dev`（默认http://127.0.0.1:5173）；生产 `npm run build` 后 `npm run preview -- --port 5195 --strictPort`，实际本包路径http://127.0.0.1:5195 →首页→迷你游戏。既有线上站点是历史部署，不代表本包。本次push/草稿PR，不合并/部署/强推/权限或工作流更改。

五章与自由厨房核心规则、供应、配方及旧存档回归保留，正常入口复核活动往返及自由厨房拿放；本包未重复完整五章浏览器矩阵，记 NOT_RUN，历史验证仍可追溯。负责人视觉/手感 PENDING；人工听审/教研/儿童观察/实体手机 NOT_RUN；分发权利 PENDING；公开发布 BLOCKED。历史真机 NEEDS_REVISION、60fps NOT_MET不因模拟检查改写，新增内容也未测定60fps。失败证据、历史设计、素材来源与权利记录全部保留，见[扩展前索引](../../archive/pre-minigames-vocab-01/index.md)。
