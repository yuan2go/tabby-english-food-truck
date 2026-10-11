# 当前浏览器合同

WP-PLAYABLE-ADVENTURE-01 将“25个固定订单小关＋每关结算”替换为五章因果活动，WP-ADVENTURE-EXPERIENCE-02 深化活动与无识字路径。`playwright.config.ts` 明确选择当前16条风险用例：adventure 全主线/野餐另一分支/自由开店/桌面键鼠恢复、恢复开店换菜单与补客，experience单/双客切换、较少帮助与音频失败、静音图示，m22-boundaries 库存/预留/取消/错单/音频失败，m22-growth 与 wp-dual-growth 首次教学和菜单延后，minigames 与 wp-dual-mini-course 保留小游戏/主题课入口和恢复。

旧 adventure-flow、game、visible-walk、playability-visible、wp-dual-story-throughline、wp-dual-layout 等脚本仍保留原断言与历史证据，它们的25关/旧标题/结算入口已失效，不属于当前默认门禁。未删掉库存、错误交付、帮助、迁移或恢复断言；这些行为在共享单元、当前 boundary 和 adventure 用例中验证。旧脚本应在其对应历史提交上追溯，不能在新流程上冒报通过。

现有工程 workflow 的触发条件/权限保持原样。本机执行不等于托管 CI 已通过。默认浏览器为 Playwright Chromium headless shell；`CHROMIUM_CHANNEL=chromium` 可明确使用锁定浏览器的完整 Chromium headless。较长路径的等待预算不改变操作或规则断言；当前8条相关路径的实际分批执行、环境、失败及截图/视频见[本包证据](../docs/evidence/adventure-experience-02/README.md)，上一包证据保留。
