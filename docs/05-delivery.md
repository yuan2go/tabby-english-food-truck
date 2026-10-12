# 连续游戏重构 Implementation Plan

> For agentic workers: superpowers:executing-plans inline，一名实现负责人，完成后独立只读全分支审查。用户已明确授权自主设计/实现/必要验证/推送/PR/正常合并main/原站发布/一致材料。

**Goal:** 五章自然连续游玩、统一物件操作、可观察波次与真实奖励，整合自由厨房与原学习范围。
**Architecture:** 配置与规则层持有有界连续进度，真实接收产生后果；表现投影，存档保存全部安全边界与历史记忆。
**Tech Stack:** 现有锁定React/Phaser/TypeScript/Vite。
**Spec:** [02](02-game-design.md)，体验03、架构04和本轮用户完整要求。

## Global Constraints

不导入旧仓库，不增无关依赖。保留严格匹配/单归属/原子失败/加工钟/容量预留/双客分支/帮助与奖励历史/恢复迁移。无测试通关状态、强推或绕门禁。开发声音UNREVIEWED，真人/儿童/实体设备/教研/人工听审未执行写NOT_RUN，权利PENDING，历史真机NEEDS_REVISION与60fps NOT_MET不撤销。

## Review Focus

首次请求被自动演出抢断；波次重复入客/收据复发；跨章额外库存/在途加工丢失；旧档补新任务或伪造完成；第二个朋友/短横屏物件遮挡。各风险纳入对应规则/交互测试。

### Task 1: 文档治理

- [x] fetch最新origin/main完整SHA，保留原工作区未跟踪游玩材料，建立隔离分支/worktree，读权威/报告/E2E/资源及实际代码。
- [x] 九份原文归档并核hash，重写唯一01–05与E2E/README/STATUS，独立文档提交先于代码。
- [x] Node24.15/npm11.12/macOS arm64基线350/350单元退出0，npm ci audit0。

### Task 2: 连续规则与恢复

Files: content/story-flow.ts，rules/story-flow.ts、adventure/game/snapshot，platform/controller/profile；tests/story-flow.test.ts。
Interfaces: enableStoryFlow(GameState)，advanceStoryFlow(GameState): boolean，validStoryFlow(AdventureState): boolean；AdventureState.flow可选兼容字段。
- [x] RED：自动首客与下一波、严格错单不推进、真实接收/两野餐路线、品尝奖励幂等、暂停/旧档/在途/跨章库存恢复。
- [x] 实现全部五章波次/自动后果与档案，定向GREEN；保留旧规则验证，阶段提交。

### Task 3: 输入与音画

Files: TogetherStage/Kitchen/Home、together.css、TogetherView、dialogue；e2e/continuous-gameplay.spec.ts及受影响helpers/套件。
Interfaces: Task2状态投影，统一pickup/ingredient/put命令；进度无UI判定。
- [x] RED正常入口首客/反馈/无流程按钮、五章/两路/并行/自由/小游戏/视口和英语自动首次。
- [x] 各章固定可见设备与目标、食品/角色反馈、波次旅程、自然奖励过场；低动态/静音/触控/键盘不改变事实。更新旧UI路径，守恒/容量/错误/支持断言保留。
- [x] 定向GREEN、阶段提交。

### Task 4: 游戏性审查与工程门禁

- [x] 正常新档393×665连续五章、另一路、自由厨房/受影响小游戏，665×393/1280×720/必要Pad；记录轨迹/有效动作/等待/中断/关键画面。
- [x] 修真实问题、定向复测，保存原失败。完整工程/浏览器仅最终稳定版运行必要一次；不重复无关矩阵。
- [x] 独立全分支代码审查、处理实质问题；最终lint/test/build/resources/词库与现行浏览器门禁。环境/退出码和未验边界如实记录。

### Task 5: Git、发布与一致材料

- [x] push/PR，精确head正常门禁通过后合并main；核验完整SHA和工作区保护。
- [x] 合并main干净构建更新原Sites，保存版本映射；匿名新会话真实版本/正常核心路径验证。
- [x] 更新STATUS/README/验收报告及参赛说明/PDF/真实同版配图，文字比对/渲染检查；材料归档PR，最终报告。

本轮准确head a7ab8ed6de9567d8610eafd0b15fa35005180e9a的371/45正常CI通过，PR25已合并，原站v6和两个匿名正常五章/两路通过；最终事实/失败/版映射见evidence/continuous-gameplay-2026-10-13/README.md。最后纯材料PR不重跑同一游戏矩阵，执行PDF全文/全页/图hash/链接/范围核对。

材料[PR26](https://github.com/yuan2go/tabby-english-food-truck/pull/26)仅README/docs；PDF文字与1页渲染/线上图byte、十文件旧档hash与30个当前本地引用通过。main正常推送门禁38292804117也通过371/45。外部验收状态不因交付改变。
