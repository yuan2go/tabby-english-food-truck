# 当前浏览器合同

当前playwright.config.ts八套件在修复前预期收集26条：adventure（完整五章/另一野餐路线/自由厨房/桌面恢复/演出/重新开店菜单），experience（客流/较少帮助/静音），m22-boundaries（库存/预留/取消/错单/声音），m22-growth/wp-dual-growth（教学/菜单），minigames/wp-dual-mini-course/minigames-vocab（十类入口、恢复和边界）。本轮新增5条（低动态4布局、暂停/重玩焦点、托盘意图/接收提示、图音对比/支持与焦点、首页命中），收集31条/9套件；原生`--list`及最终实际结果见主报告。

默认演出过程须显式默认画质，低动态另验证收据事实、控制可达与幂等，不能把省电stage4断言为必须stage0。默认单worker/原断言保留，不依赖诊断JSON loader。`CHROMIUM_CHANNEL=chromium`可指定完整Chromium，环境与画质须分别记录；模拟触控不等于实体设备。

旧25关/旧标题/每关结算的adventure-flow、game、visible-walk、playability-visible、wp-dual-story-throughline、wp-dual-layout等仅作历史追溯，不属于当前默认门禁；库存/帮助/错误/迁移断言仍在当前规则与boundary用例。工程workflow权限和触发条件保持。本地执行不等于云端CI通过。

本轮范围及证据见[05](../docs/05-delivery.md)、[STATUS](../docs/STATUS.md)；原失败见[整合报告](../docs/playtests/2026-10-11-integrated-validation.md)。历史脚本不得覆盖旧工作包画面；本轮输出放独立证据目录。

整合第三次失败保留：意义教学提前后，旧委托的收据已产生但空盘尚在回程；正常玩法拒绝以忙盘开始新的成品加工。choosePrep仅在准备目的盘时等待真实回程时钟归零，不推进时钟、不注入状态、不改变判定或删除成品断言；故意操作忙盘的boundary测试仍直接tap。

整合第四次保留28通过/3失败。自由厨房刷新后按真实菜单弹窗点击“这次先不加”再操作；剧场帮助按实际非模态region验证，不虚构dialog。短横屏食品/撤回控件重叠属于产品缺陷，修复统一托盘坐标与独立恢复槽，原错单、库存、取消和旋转断言保留。交付使用可见端盘把手，单件移动仍点食品和目的盘；几何断言覆盖实际边界与命中，不依赖旧按钮内部偏移。

## 2026-10-12 双包集成

默认门禁保留Demo九套件并加入immersion两条代表路径，预期33条/10套件；实际收集/结果在本次交付记录读回，不把两包各自绿当集成通过。新的端盘目标使用lift-tray，单件选择仍使用食品目标；五章和另一野餐分支原断言保留。
