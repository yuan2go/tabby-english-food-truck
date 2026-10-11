# 当前浏览器合同 · WP-ENGLISH-IMMERSION-01

WP-PLAYABLE-ADVENTURE-01 将“25个固定订单小关＋每关结算”替换为五章因果活动。`playwright.config.ts` 明确选择当前15条风险用例：adventure 全主线/野餐另一分支/自由开店/桌面键鼠恢复、恢复开店换菜单与补客，m22-boundaries 库存/预留/取消/错单/音频失败，m22-growth 与 wp-dual-growth 首次教学和菜单延后，minigames 与 wp-dual-mini-course 保留小游戏/主题课入口和恢复。immersion两条复用正常入口，覆盖完整请求/接收/小院/开放口味/分享与实际历史回访，以及手机持盘/切客/取消/暂停/失焦事件/失败恢复/长句与短横屏。

旧 adventure-flow、game、visible-walk、playability-visible、wp-dual-story-throughline、wp-dual-layout 等脚本仍保留原断言与历史证据，它们的25关/旧标题/结算入口已失效，不属于当前默认门禁。未删掉库存、错误交付、帮助、迁移或恢复断言；这些行为在共享单元、当前 boundary 和 adventure 用例中验证。旧脚本应在其对应历史提交上追溯，不能在新流程上冒报通过。

现有工程 workflow 只更新测试选择，触发条件/权限保持原样。本机执行不等于托管 CI 已通过。截图/视频和具体构建身份见 `docs/evidence/playable-adventure/README.md`。

本包截图写入Playwright输出目录，避免覆盖历史包的失败与验收证据；所选结果与边界归档到docs/evidence/english-immersion。失焦由浏览器DOM生命周期事件模拟，不等于实体设备切后台验收。
