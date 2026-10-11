# 项目状态

## 2026-10-12 · 双工作包集成与公开站点交付 · IN_PROGRESS

负责人已授权两个工程任务完成后提交、推送、PR合并main、更新现有公开站点及参赛说明并复制桌面；此授权替代以下源包的仅本地交付限制。发布基线 `0b249b04697b1df43d74bbe1a4f532175b2d04f1`，隔离分支 `codex/contest-release-2026-10-12`。源包最终SHA分别为Demo `36200dd4d7bd931e4e5fedf8a25465d6b3f9e9e5`、英语 `103c2bb2272ddaa86fe32e342fc20e86feeb3a80`。当前仅整合，合并树工程/浏览器验证、PR和部署状态以本节后续记录为准；外部待验维持原事实。


## 2026-10-12 · WP-ENGLISH-IMMERSION-01 · ENGINEERING_PASS / OWNER_ACCEPTANCE_PENDING

baseline `64f03fc716de70e20f64f9bbc3802de7601a460f`，origin/main；隔离worktree `/Users/dafangzi/.codex/worktrees/english-immersion/tabby-english-food-truck`，分支 `codex/wp-english-immersion-01`。原工作区`docs/playtests/`未跟踪内容保留，不复制/覆盖。先文档治理独立提交，再编码。上一合同已归档到[索引](archive/pre-english-immersion-01/index.md)，原失败/权利/待办保留。

实现提交 `c51c4f6bdc08cc581f948b4f797c6443634534d5`；文档治理先行提交 `081e57e8aa8f0e251995c301e8f017c66e6716c8`。明确订单从真实产品/数量统一生成完整请求，开放语义允许合法多方案；128段离线整句音频与文本/来源/hash登记一致。英语贯穿制作、真实接收、品尝、小院行动、主动赠送、作品与实际历史回访。默认完整英文可见、48px整句重听、双客一触恢复请求与最近6句回看；重复重播取消、持盘不交付，失败/静音保留图示入口。沿用规则核及唯一前景通道，不增依赖/运行时TTS/AI/录音/后台，不改奖励、制作或章分支；字幕理解、听取、帮助及操作分记。修复图鉴播放误记听取、首次音频机会提前消耗、未领奖真实食品回访缺失及短横屏便签后续点击穿透。

单元259/259（20文件）、typecheck、lint（0错误/54warnings/10infos）、resources（475文件/324speech/50食品/128新增整句）、build全部退出0。完整浏览器首轮13/15退出1，随后修复两处问题，仅复跑受影响6/6退出0；五章、双野餐分支、自由制作、菜单与小游戏通过证据保留，不冒报最终文档HEAD重跑15条。macOS26.6.2 arm64 / Node24.15.0 / npm11.12.1 / Chromium153.0.8010.12、默认画质；正式首页、真实按钮/指针操作，状态只读。正常验收路径及命令/日志/原失败/画面/受测源码指纹见[本包证据](evidence/english-immersion/README.md)。最终干净HEAD构建身份与本地预览 `http://127.0.0.1:4186/` 以交付回复/页面metadata读回为准。

文档清理废止碎片点餐、默认隐藏英文、字幕混记纯听力、小院仅中文的冲突；01–05/README/STATUS继续唯一权威，六份上一合同逐字节归档，原失败/资源来源/权利/有效待办保留。独立只读代码审查及增量复核未发现剩余实质问题；此不等于人工听审。人工听审/教研/实体iPhone15 Pro＋Chrome/儿童试玩NOT_RUN，负责人运行与手感PENDING、声音分发权PENDING；全部新音频DEVELOPMENT_TTS_UNREVIEWED。历史真机NEEDS_REVISION、60fps NOT_MET保持。模拟视口及DOM失焦不是实机后台；托管CI/部署NOT_RUN，公开发布BLOCKED。不推送/PR/合并/部署。



## 2026-10-12 · 参赛Demo修复 · ENGINEERING_VERIFIED / EXTERNAL_ACCEPTANCE_PENDING

远端main基线 `f359b4053cf73e0103bf13b46d26496f19868508`（已fetch）；原工作区 `codex/player-review-2026-10-11`、HEAD `64f03fc716de70e20f64f9bbc3802de7601a460f`、`?? docs/playtests/`保持。独立worktree `demo-repair-2026-10-12/tabby-english-food-truck`，分支 `codex/demo-repair-2026-10-12`，本地交付。

已读当前合同、资源及最新报告，文档治理先独立提交。当前范围五章/双野餐/自由厨房/十类小游戏/120概念，实施与验收合同见[05](05-delivery.md)。旧授权/历史状态移至[归档](archive/pre-demo-repair-2026-10-12/index.md)，全部失败、来源、权利与有效后续候选保留。

本轮[主报告/证据](evidence/demo-repair-2026-10-12/README.md)受测`e0542ff0882eb77fcf8e189dad6b0b0a71f977bd`、dirty=false、content adventure-experience-2。文档治理9a06559先于工程005e2c0、体验a79d4ea及整合修正分别提交；D01–D04/T01、X01/X02关闭。289/289完整单元、31/31零重试整合（6.3分钟），lint/build含typecheck、685资源/458语音/50食品与audit 0项均退出0。完整五章、两路野餐、自由厨房、受影响小游戏和默认/低动态分别通过；手机/Pad/短横屏仅浏览器代理触控体验，不称儿童独立理解或真机接受。所有中间失败/中断及原始[旧报告](playtests/2026-10-11-integrated-validation.md)保留，不能用最终绿覆盖历史失败。

冻结包590运行文件、逐文件hash/bytes验证一致，本机启动/响应9样本与可执行全部声音待审材料见主报告。本轮真实后台专项未取得hidden状态，NOT_CONFIRMED、返回恢复NOT_RUN；没有模拟事件补成通过，该专项PENDING。响应小样本不算p95、FPS或实体手机性能证明。

收尾远端main已推进至`0b249b04697b1df43d74bbe1a4f532175b2d04f1`，是另一参赛说明/治理任务；只读比较源码、资源、依赖及测试与初始baseline相同。保留[既有正式稿/PDF及历史受测关系](submission/index.md)，不改其43d7c76配图/失败/授权事实；同baseline十份重复档逐字节等值，引用已有快照，独立AI史与M0证据原索引保留。当前修复未合入main，旧材料不当当前验收合同，也不继承其云端授权。

实体手机/Pad与人工听审本轮BLOCKED / NOT_RUN（用户选择浏览器模拟、暂无听审）；儿童观察NOT_RUN，未安排真实观察者与监护同意。负责人接受、教研/适龄及声音/素材分发权PENDING。历史实体iPhone NEEDS_REVISION和60fps NOT_MET保留。外部条件未齐不影响已完成的独立工程。本輪未推送、PR、合并或部署。
