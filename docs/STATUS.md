# 项目状态

## 2026-10-12 · WP-ENGLISH-IMMERSION-01 · ENGINEERING_PASS / OWNER_ACCEPTANCE_PENDING

baseline `64f03fc716de70e20f64f9bbc3802de7601a460f`，origin/main；隔离worktree `/Users/dafangzi/.codex/worktrees/english-immersion/tabby-english-food-truck`，分支 `codex/wp-english-immersion-01`。原工作区`docs/playtests/`未跟踪内容保留，不复制/覆盖。先文档治理独立提交，再编码。上一合同已归档到[索引](archive/pre-english-immersion-01/index.md)，原失败/权利/待办保留。

实现提交 `c51c4f6bdc08cc581f948b4f797c6443634534d5`；文档治理先行提交 `081e57e8aa8f0e251995c301e8f017c66e6716c8`。明确订单从真实产品/数量统一生成完整请求，开放语义允许合法多方案；128段离线整句音频与文本/来源/hash登记一致。英语贯穿制作、真实接收、品尝、小院行动、主动赠送、作品与实际历史回访。默认完整英文可见、48px整句重听、双客一触恢复请求与最近6句回看；重复重播取消、持盘不交付，失败/静音保留图示入口。沿用规则核及唯一前景通道，不增依赖/运行时TTS/AI/录音/后台，不改奖励、制作或章分支；字幕理解、听取、帮助及操作分记。修复图鉴播放误记听取、首次音频机会提前消耗、未领奖真实食品回访缺失及短横屏便签后续点击穿透。

单元259/259（20文件）、typecheck、lint（0错误/54warnings/10infos）、resources（475文件/324speech/50食品/128新增整句）、build全部退出0。完整浏览器首轮13/15退出1，随后修复两处问题，仅复跑受影响6/6退出0；五章、双野餐分支、自由制作、菜单与小游戏通过证据保留，不冒报最终文档HEAD重跑15条。macOS26.6.2 arm64 / Node24.15.0 / npm11.12.1 / Chromium153.0.8010.12、默认画质；正式首页、真实按钮/指针操作，状态只读。正常验收路径及命令/日志/原失败/画面/受测源码指纹见[本包证据](evidence/english-immersion/README.md)。最终干净HEAD构建身份与本地预览 `http://127.0.0.1:4186/` 以交付回复/页面metadata读回为准。

文档清理废止碎片点餐、默认隐藏英文、字幕混记纯听力、小院仅中文的冲突；01–05/README/STATUS继续唯一权威，六份上一合同逐字节归档，原失败/资源来源/权利/有效待办保留。独立只读代码审查及增量复核未发现剩余实质问题；此不等于人工听审。人工听审/教研/实体iPhone15 Pro＋Chrome/儿童试玩NOT_RUN，负责人运行与手感PENDING、声音分发权PENDING；全部新音频DEVELOPMENT_TTS_UNREVIEWED。历史真机NEEDS_REVISION、60fps NOT_MET保持。模拟视口及DOM失焦不是实机后台；托管CI/部署NOT_RUN，公开发布BLOCKED。不推送/PR/合并/部署。


## 2026-10-11 · WP-PLAYABLE-ADVENTURE-01 · ENGINEERING_PASS / OWNER_ACCEPTANCE_PENDING

初始默认分支origin/main、原工作区基线 `e3724a59cfe958a1d584aa4864988aeec73ba7e9`，当时干净。独立worktree `/Users/dafangzi/.codex/worktrees/playable-adventure/tabby-english-food-truck`、分支 `codex/wp-playable-adventure-01`，一个实现负责人。独立文档整理提交 `616b66df0226daec2b601d843f14f0e809806bd6` 先于产品实现；最后运行源码提交 `5b4b2c598a7ac6f622b5f0e58212d81c9868fc2d`，本次交付提交还收录测试断言与最终证据。已推送[PR #11](https://github.com/yuan2go/tabby-english-food-truck/pull/11)，最终完整SHA以PR当前head与交付回复为准。

五章因果活动全部实现：晨光拿取交付/种花、树荫组合分享/品尝/挂旗、野餐寻找打包或桌边分餐/铺布、晚餐安排协作/灯、社区邀请创作/作品食谱。第三章首份真实接收决定兔兔或刺刺路径，不改已接订单；不同操作、等价奖励与汇合。严格订单精确匹配，开放委托明确有限方案，自由制作无订单式答案；已交付食物只在活动世界使用，不能回营业库存。作品/食品状态、熟客回访、探索收据和互动布置保存；菜单/主题只影响新客，停止接客后可继续制作，自然收摊。

沿用锁定栈、规则核与本项目登记资源，必要职责拆分至content/adventure、rules/adventure、Adventure与FreeShop，App接线。未扩题量、依赖、地图、经济、AI或通用框架。真实规则接收授奖；有界记忆保留每章最新完成和实际接收产品，不被详细日志滚动洗回首次。schema3–6恢复不虚构新增活动完成；实际PR #10归档51个schema6/m2.4会话逐一保留食品、角色、加工绑定、订单、历史和帮助。

### 已执行验证

| 检查 | 实际结果/退出码 |
| --- | --- |
| `npm test` | 241/241、17文件 / 0 |
| `npm run typecheck` | 通过 / 0 |
| `npm run lint` | 0错误、54 warnings/7 infos / 0 |
| `npm run build`（含独立outDir生产构建） | 通过 / 0；Phaser块大小警告保留 |
| `npm run resources` | 347文件/196语音/50食品映射 / 0；清单未变 |
| `npm run test:browser` | 干净d5f3008构建，默认画质，13/13 / 0 |
| 锚点修复后的定向输入 | 干净5b4b2c5：桌面单条通过；手机忙盘/库存/取消/恢复/横屏1/1 / 0 |
| 快速拖动实测 | 第二份食品拿取后21.9ms开始拖动，240ms窗口内；取消保留食品/尝试 / 0 |
| `CI=true npx playwright test --list` | 13条/6文件 / 0；托管CI另行显示 |

环境为macOS26.6.2 arm64、Node24.15.0、npm11.12.1、Chromium153.0.8010.12。正常可见入口完成五章、野餐两种操作、自由制作/品尝/保存/清桌/收摊、菜单补客、桌面鼠标键盘/重听、手机触控/音频故障及教学/小游戏；未注入通关或游戏状态。实际HTTP路径4174（完整13条）/4175（锚点定向），具体身份/原始失败/命令/六张画面/哈希见[本包证据](evidence/playable-adventure/README.md)。最后一次完整13条与随后仅锚点的定向结果分开，不冒报最终文档HEAD又重跑全套。

执行中main被其他工作推进至 `6a4598fb2c01216ec61907dd0cb563034745a532`（PR #10）；本隔离分支通过 `cd4115f91584bd591f6c2f11ac528e93783307f1` 整合其真实拿盘点客、独立气泡重听、原料回篮、实体工具及加工慢帧，旧营业续玩仍恢复原单。原工作区未被本包修改、远端main已核对；原证据/素材权利全文保留[历史索引](archive/pre-playable-adventure-01/index.md)与[main整合索引](archive/main-pr10/index.md)。

### 外部边界

负责人运行/视觉/手感PENDING；iPhone15 Pro＋Chrome新构建NOT_RUN、历史NEEDS_REVISION保留；儿童观察/教研/人工听审NOT_RUN，资源与声音分发权PENDING；历史60fps NOT_MET未重测。部署NOT_RUN，公开发布BLOCKED。工程PASS不替代这些验收。本包已推送分支及PR；负责人随后明确授权本次不测试、补齐执行产物并经PR合并main，替代原不合并限制。不强推、不改权限。试玩方式：本隔离worktree执行 `npm ci && npm run dev`；交付构建本地预览 `http://127.0.0.1:4187/`，由交付回复核验其最终SHA。


### 2026-10-11 统一云端交付补记

原实现聊天已结束，11个本包提交及全部代码/文档/已挑选证据已推送。统一交付聊天按负责人新指令追加归档现存日志、录像、HTML报告、生产包与中间产物，并提交一次交付记录；相对main `6a4598fb2c01216ec61907dd0cb563034745a532` 合计12个工作包提交，最终再加1个PR合并提交。复用PR #11转正式并执行合并，结果/完整SHA以PR与最终交付回复读回。见[云端交付](evidence/playable-adventure/cloud-delivery.md)。本次所有测试与构建命令NOT_RUN，使用`[skip ci]`；原CI已完成SUCCESS，不作为本次重跑。部署和外部验收状态维持原记录。
