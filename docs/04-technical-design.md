# 技术 · 规则驱动连续故事

沿用锁定React19.1.1、Phaser3.90、严格TypeScript与Vite7.3.6，不加依赖/后端/运行时AI/ECS/事件总线。

- content/story-flow：五章波次配置、目标/节奏常量；复用catalog/recipes完整订单语义。
- rules/story-flow：连续字段、自动客流、真实接收后果/波次/奖励/安全章转移。advance负责有效游戏钟；Controller只同步存储/档案和前景声音，不自行判断通关。
- rules/adventure/experience、game/cooking/direct-cooking：继续拥有单归属、原子命令、加工预留、严格/开放/自由判定。历史手动动作仅供旧档兼容和自主探索，现行主线不以其为门槛。
- rules/snapshot：连续状态和章节档案有界、关联校验；接受direct-cooking-1等本仓库历史content，不推断新完成。platform/save/profile保持坏/未来档保护、实际历史帮助和奖励去重。
- app/TogetherStage/Kitchen、game/TogetherView：状态投影、统一输入、当前目标/波次/场景变化/真实接收反馈；移除主线迎客/比较/完成/下一章按钮。动画与音频失败不能影响规则。
- platform/dialogue/audio：唯一前景英语通道，自动首次请求/双客重听、真实感谢/品尝/回访与有界回看；不从播放产生用户提交。

恢复与迁移仅指本仓库。连续过程的章记忆随游戏快照持久化，Controller将其同步到profile，避免跨两个localStorage写入丢奖励。保留真实run/food IDs、支持、订单/processing与routing；后台丢大delta、暂停不补钟、取消生命周期清理。

发布使用合并main的干净构建与真实SHA/content/assets，沿用Sites项目appgprj_6ab141055ab8819186112dee423d0d04及static.directory=dist，原网址https://tabby-english-food-truck.aw9923299.chatgpt.site。保存GitHub→Sites source→version→deployment映射，匿名新会话验证，无法发布则明确BLOCKED。
