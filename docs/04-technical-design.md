# 技术 · 单规则核与同桌舞台

## 保留与职责

锁定React19.1.1、Phaser3.90、严格TypeScript、Vite7.3.6；不新增依赖、后端、运行时AI、ECS或事件总线。规则仍是唯一事实源，设备和delivery按游戏时钟推进；表现只读取状态/真实演出收据。

- rules/types/game：hand:0–2实际归属与拿放命令；调用现有move/deliver/adventure判定，副本预检多食品操作，失败不部分提交。
- rules/cooking：设备输入由station/recipe真实输入决定，取消隐藏family前置；既有解锁、忙态、容量/预留保持。
- rules/adventure/adventure-experience：早餐收尾不再依赖plant/water，其余活动及食品/奖励收据保持。
- rules/snapshot/platform/save/profile：schema7保持、手中槽位/共享容量校验，显式接受本仓库旧content版本；空字段不推断完成。内容版本together-play-1。旧完成奖、请求、食品、加工和支持原样保留；坏/未来档阻止覆盖并可导出。
- app/TogetherStage及专职场景组件：同一舞台、空间坐标、物件输入和就近英文；接收/品尝表现复用收据，不派命令重播。旧独立Adventure/FriendTheatre及旧service操作入口不再并行供玩家使用。
- Phaser现有生命周期与时钟继续负责游戏推进/暂停/后台/卸载；新DOM命令经过同一Controller，拖动取消不写业务状态。
- content/dialogue与ForegroundAudio继续唯一完整句/前景通道，首次声音、失败、字幕、帮助、回访记录边界保持。自动代读不算用户提交。

物品、盘位、预留、加工输入/输出、活动食品不可重号；明确交付才写语言尝试，错单保留，速度不评分。手中食品只在手中投影；收据重播不重新消费/发奖。暂停保存，后台丢大delta，不补离线时间；缩放/旋转只是重新投影。

## 验证与发布

先在第一章与一种实际加工料理验证拿放/容量/错误/恢复，再推广五章与自由厨房。共享规则/快照改动需完整单元；浏览器代表触控和桌面、连续五章、另一野餐路线、自由厨房、重听/错拿/误送/放回/加工/中断，避免无关矩阵。保留原失败，不删除断言或注入通关。

构建注入真实SHA/dirty/content/assets；发布从合并main进入既有Sites源仓库，保存GitHub→Sites source SHA→saved version→deployment映射与匿名新会话实测。既有project_id=appgprj_6ab141055ab8819186112dee423d0d04、static.directory=dist保持；网址必须仍为https://tabby-english-food-truck.aw9923299.chatgpt.site，public无邀请，无运行时登录依赖。

旧技术合同/完整迁移和历史证据见[归档](archive/pre-simplified-play-2026-10-12/index.md)，并非新规则的平行实现。
