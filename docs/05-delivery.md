# 全游戏操作重构 Implementation Plan

> For agentic workers: superpowers:executing-plans inline；一名实现负责人，末尾一次独立只读全分支审查。用户已授权自主设计/实现/验证/PR/按规则合并main/原站发布/桌面材料。

**Goal:** 五章、双野餐、自由厨房及受影响小游戏均以直接物件操作持续可玩。
**Architecture:** 单规则核直接输入和组合命令；各设备同屏投影；活动简化前置，实际行为/实例/收据继续判定。
**Tech Stack:** 既有锁定React/Phaser/TypeScript/Vite，不加依赖或运行时AI。
**Spec:** 01–04及本轮用户任务。

## Global Constraints

保留严格订单/食品唯一归属/容量/有效时钟/原子失败/双客选择/两路野餐/学习历史/旧档迁移；完整英文/重听一致，操作错误不是英语错误。新知识先表意义，帮助留痕。保持既有角色资源及审核记录。无测试通关注入、不删关键断言、不强推/绕保护。

## Review Focus

持物点直接供给不丢物；冰淇淋追加非法组合保留原品；封合前误料可恢复；设备并发/满盘/旧加工预留不被重排；旧档迁移不补奖或洗白；逐份装篮不能多装或复制；小游戏减少阶段仍保留支持和物理前置。

### Task 1: 治理与修改前基线

- [x] 最新main完整SHA、原工作区保留、隔离分支；读现行合同/最新报告/实际源码状态机测试。
- [x] 逐字节归档被替代八份合同、更新唯一01–05，独立docs提交先于代码。
- [x] 正常手机入口测单球7点击，基线339单元通过；其余操作链源读回见本轮baseline。

### Task 2: 料理规则

Files: rules/direct-cooking/game/cooking/types/snapshot、content/recipes/catalog，tests/direct-cooking.test.ts。
Interfaces: ingredient(product,target)明确设备原子投料；compose真实输入/输出，旧move仍有效；assemble自然完成、肉饼/果汁时钟不改。
- [x] RED：杯筒/口味/追加球与非法追加、bread盖合、熟饼实际煎制、忙态/手持/容量/失败原子性、有效旧档恢复。
- [x] 实现单规则命令与迁移；定向GREEN，必要完整单元回归，阶段提交。

### Task 3: 全场景与模式

Files: app/TogetherKitchen/Stage/App、rules/adventure/experience/guidance、小游戏规则/组件，受影响E2E/helpers。
Interfaces: 复用Task2命令/真实归属，活动实际食品判定，小游戏规则开场与下一轮。
- [x] RED场景入口：无接好/盖合/设备轮换；四点击冰淇淋、同屏煎锅/果汁、一次自由入口与直接小游戏。
- [x] 实现全部五章：场景对比/品尝，逐份篮/原位布置双路，直接协作/装饰，分享/保存；去除旧导航与冗余确认。保持高级拼写自选、记忆主动遮挡。
- [x] 定向规则/UI GREEN、更新旧E2E正常语义但保留守恒/匹配/错单/恢复断言，阶段提交。

### Task 4: 正常游玩与质量

- [x] 正常新档393×665触控连续五章、自由厨房、受影响小游戏、另一野餐路；1280×720及短横屏必要补查。
- [x] 记录看不懂/读说明/操作次数/重复动作/遮挡与恢复，实际修复→定向复测；少量必要截图和可复现操作记录。
- [x] lint、typecheck/build、resources、词库、共享单元及当前42浏览器回归；一次独立只读全分支审查并处理实际问题。
- [x] 代理/真人成人/儿童/实体设备/教研/听审分记；未执行NOT_RUN，不撤销历史真机NEEDS_REVISION与性能NOT_MET。

### Task 5: PR、发布与材料

- [ ] 提交push/PR、精确head检查success后按规则merge；核对main及完整SHA。原站appgprj_6ab141055ab8819186112dee423d0d04从merged main更新，不新建站、不绕保护。
- [ ] 原网址匿名VPN访问、SHA/content/dirty和真实核心料理复核，存版本/部署ID。
- [ ] 最新设计说明短稿及同稿PDF，真实AI与实有玩法，附原网址及“访问需要开启 VPN”；文字比对/渲染QA，真实桌面旧版备份+复制hash回读。
- [ ] 报告/材料通过PR归档main，最终前后对照、问题修复、测试退出码/限制、Git/部署/桌面绝对路径交付。
