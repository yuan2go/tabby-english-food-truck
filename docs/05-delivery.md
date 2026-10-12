# 简化操作与正式交付 Implementation Plan

> For agentic workers: use superpowers:executing-plans inline；一名实现负责人，完成后一次独立只读审查。

**Goal:** 将同桌拿放贯穿五章和自由厨房，优化真实游玩，经PR合并main更新原公开站点，交付最新一页设计说明源稿/PDF至真实桌面。
**Architecture:** 现规则核新增原子拿放适配及可校验手中归属；同桌舞台替代分离入口/独立剧场；生命周期、声音、存档和判定复用。
**Tech Stack:** 现有React/Phaser/TypeScript/Vite及真实锁文件。
**Spec:** 本轮用户指令、01产品、02规则、03体验、04技术。

## Global Constraints

只做同桌共玩，不做近景轮流；同屏角色一次；48px起目标、点击独立/拖动可选；完整英文/气泡重听/落空不提交；没有盘管理步骤、隐藏模式投料；真实选料/启动/取成品；错放/误送保留物品；早餐探索可选。保留五章/双路线/自由厨房/50食品/120概念/十类小游戏，单归属/容量/时钟/记录/旧档恢复。禁止旧项目导入及账号/经济/后端/运行时AI扩张。2026-10-12负责人已授权提交push/PR/按规则merge/main及更新原站；不强推或绕保护。

## Review Focus

- 已持物重复点供给和多份失败：不静默替换或部分丢料。
- 一个设备混合family、正在加工、旧预留盘：可见目标决定输入且忙态/预留保留。
- 气泡/等待朋友/盘子/空地/手势取消：重听不交付、等待不隐式切单、语义一致。
- 刷新/后台/旋转/旧档：实例和持有关系可恢复，不补时或推断探索完成。
- 开席/品尝/重播/低动态/章节恢复：奖励及消费只来自真实命令/时钟。

### Task 1: 权威文档治理

Files: README、01–05、STATUS、docs/index、docs/archive/pre-simplified-play-2026-10-12。Interfaces: 消费用户指令/原合同，产出唯一现行合同。
- [x] 先读latest main/线上登记/草案/发布和试玩报告，逐字节归档冲突原文，修索引。
- [x] 写回确定交互、早餐完成条件、迁移/验收与Git发布授权；独立docs提交，之后才产品代码。

### Task 2: 原子拿放与早餐收尾

Files: rules/types/game/cooking/snapshot/adventure/adventure-experience，tests/together-play.test.ts及受影响原测试。Interfaces: Command pickup(source)/put(target)/return-hand；Item.location包含hand:0–2，持物来自真实实例，无额外镜像库存。
- [x] RED：供给→手中唯一实例、已有手中物不可替换、原子失败、放回/错单、设备明确目标与预留、早餐无探索可完成、旧档/非法手中槽位恢复。
- [x] Run `npx vitest run tests/together-play.test.ts`，核对具体缺行为失败；实现仅走既有规则；GREEN及必要完整`npm test`，阶段提交。

### Task 3: 同桌舞台贯通

Files: app/TogetherStage及同桌场景/输入/CSS、App接线、替代旧入口、game资源轮廓投影，e2e/together-play.spec.ts及现行受影响E2E。Interfaces: 从Task2规则读取手中归属/物品/收据，使用Controller.command；后台时钟由既有Phaser生命周期。
- [x] RED：正常新入口第一章三核心点击/气泡重听/错物保留；一种料理输入→启动→取出；手机目标/角色不重复；观察失败后接入。
- [x] 第一章与真料理空间/恢复通过后，在同一舞台完整覆盖五章、另一野餐路线、活动工具/物品、自由制作/保存/回访/停止接客；清除被替代并行入口。旧E2E改正常入口/语义，保留食品/错误/守恒/恢复断言，不减少行为。
- [x] `npm run typecheck`、定向单元及浏览器，修真实失败并阶段提交。

### Task 4: 真实代理游玩与候选门禁

Files: docs/evidence/simplified-play-2026-10-12、STATUS、相关测试/源码。Interfaces: 正常新入口实际制作，不注入游戏状态；只读快照核对。
- [ ] 代表手机连续五章，抽查自由厨房/另一野餐路线；桌面补布局，重听、错拿、误送、放回、实际加工、刷新/暂停恢复。记录成人提醒式疑惑、读说明、无意义操作、等待和选择后果。
- [ ] 保存必要画面/短录像，发现问题实际修复，RED→GREEN定向复测。
- [ ] 最终候选必要门禁：`npm test`/`npm run lint`/`npm run build`/`npm run resources`/词库；当前有效E2E受影响全路径。已通过无变更不重复无关全量。代理/成人/儿童/真机分记，未做NOT_RUN。
- [ ] 一次独立只读全分支审查，处理实质问题并定向/影响回归；审查diff排密钥/无关/临时产物。

### Task 5: Git与原站公开发布

Files: 发布映射/本次报告；唯一目标原Sites项目。
- [ ] Push工作分支，PR完整说明及精确head实际门禁；按规则merge，不force/no bypass；fetch并读回main full SHA。
- [ ] 从合并main准备既有Sites源/构建、正常save/deploy；确认public无需邀请。保存代码SHA/源SHA/版本/部署ID/URL。
- [ ] 退出登录/无痕新会话、具备VPN的当前网络，真实打开最新站点玩核心段，复核资源/声音/保存；线上失败修复→PR→merge→重发及受影响复测。

### Task 6: 最新设计说明与桌面交付

Files: docs/submission既有源稿/PDF/validation/evidence/index，本次报告/STATUS。
- [ ] 先线上核验，再写简短一页主题/目标玩家、实有玩法、真实AI工具/用途、亮点；不称运行时AI/听审/学习效果，附可点击原站及“访问需要开启 VPN”。截图只用最新站。
- [ ] 同稿可编辑源稿/PDF，逐页渲染和文字/链接/版本核验；材料与报告另经PR合并main，如影响站点产物再发。
- [ ] 查真实Desktop目录、同名旧版备份，复制PDF及可编辑源稿，确认存在/可读/hash相同。
- [ ] 最终baseline/final SHA、行为、问题修复、命令/退出码/环境/NOT_RUN、所有PR/main读回、线上映射及公开访问、报告和桌面绝对路径完整交付。
