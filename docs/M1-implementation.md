# M0/M1 实施记录

基线：`85585137e82bd24e3c3e4d61a972243dbaa683d5`，2026-09-20 fetch 后的 origin/main。PR #1 已合并，文档 head 为 `558e1521ffa2829a003fcaf099ddeb0e0693c359`。工作区初始干净，只含文档。实现分支 `codex/m0-m1-food-truck`，独立 worktree。不读取旧项目。

## 文档整理

已完整阅读 README、AGENTS、STATUS、01–05。规则与体验没有过期内容、失效相对引用或需要删除的重复规范。完整首包仍是有效后续设计。本轮以 05 的 M0/M1 为界，覆盖必要可靠性；M2、T07、吐司与第二设备不实现。修正 STATUS 的先合并 PR 说明；其余当前时态随实际落地更新。

## 实现决策

一个纯 TypeScript 规则状态持有物品归属、两盘三槽、任务剩余时间、订单、支持与尝试。所有输入调用同一命令入口；Phaser 根据状态表现，任务完成由规则时钟驱动。React 只显示开始/暂停/教学/便签及语义操作，不拥有游戏业务副本。

独立背景和透明道具承载纸艺墨绿餐车、赭黄遮阳篷与木台。游戏内不用网页卡片。手机上下分接待、设备与猫、托盘、原料；横屏将设备/猫与托盘左右展开。文字单独绘制。角色参考缺失是制作门槛，已向负责人索取路径/链接，等待期间不导入旧资产、不将占位角色标为成品。

配方时长 5 秒，助手 2 秒，盘回位 0.8 秒起步；从规则任务进度驱动分段姿态。每局随机交换两个请求的座位/客人映射，保存 variant。开发音频明确未听审；独立条件隐藏目标，不伪称听力测评合格。

## 分阶段工作

- [x] 规则与 M0：配置/真实锁文件；`src/rules` 命令、时钟、快照；`src/content` 有限语法；`tests` 验证守恒、容量、预留、幂等、支持和恢复。
- [x] 可玩场景：`src/game` 布局/输入/表现；`src/app` 薄外围；`src/platform` 音频/存储；正常首页可完成串行与交错路径。
- [ ] 制作：新背景、独立道具、客人、获准参考后的猫动作；登记真实尺寸/Alpha/hash/来源/审核；资源检查入口。
- [x] 验证：typecheck、lint、build、test、resources、HTTP Playwright；Canvas 指针和键盘、手机/Pad/旋转、故障恢复、完整视频与实际性能采样。
- [x] 当前工程与证据交付：更新 STATUS/README/技术与素材记录、阶段提交、push、[Draft PR #2](https://github.com/yuan2go/tabby-english-food-truck/pull/2)，不合并不部署。整包制作仍受上述参考阻塞，画面手感 AWAITING_OWNER_REVIEW。

## 边界接口

`createGame(runId, variant, priorSupport)` 创建一局；`dispatch(state, envelope)` 返回新状态与明确结果；`advance(state, milliseconds)` 仅推进有效游戏时间；`decodeSnapshot(unknown)` 验证完整关系后恢复；命令带 runId/id。时钟暂停属于宿主生命周期，存档任务只存剩余游戏时间，不用墙钟补算。

`GameController` 唯一持有世界，提供 dispatch、subscribe、tick、pause reason 集合、保存和重开；场景与 React 订阅离散变化。输入选择、词块草稿、拖影为可丢弃视图状态。

## 依赖依据

2026-09-20 查阅 [Phaser 安装](https://docs.phaser.io/phaser/getting-started/installation)、[Vite 版本要求](https://vite.dev/guide/)、[React 宿主集成](https://react.dev/learn/add-react-to-an-existing-project)，并核对 npm 元数据。Node 22.22.2 满足 Vite 7 的 >=22.12；采用 Phaser 3.90.0、Vite 7.3.6、React 19.1.1、TypeScript 5.9.3 的固定版本，避免无必要跨大版本升级。手写工程配置，不克隆模板；无模板遥测脚本。

## 实施修整

- Vitest 初选 3.2.4 后审计发现漏洞；3.2.7 仍有 mocker 告警，核对 Node/Vite peer 兼容后锁定 4.1.11，audit 为零。未启动 Vitest UI/server。
- Phaser 默认平滑 delta 在负载下拖长配方等待，改 `fps.smoothStep=false`；仍使用同一规则时钟，后台/失焦/帮助冻结，恢复丢弃大 delta，不修改 5 秒配方去迎合测试。
- 浏览器双路径使用实际 Canvas 指针与键盘。编辑五词便签超过加工时长是合法慢想；交错证据使用先助手备苹果、开机后手动配水果并先交付的自然顺序，断言机器仍在加工。
- 键盘焦点不覆盖食品，帮助仅对显式打开的当前客人显示；切换客人不把帮助文字自动带过去。教学示例自动登记便签 demonstration，关闭帮助不能洗白。
- 运行环境在本轮外部发生 Node 切换：初始探测 22.22.2/npm 10.9.7，后续实际命令为 Homebrew Node 26.3.1/npm 11.16.0。本任务没有安装/升级系统 Node；最终证据注明实测环境。
- 冻结测试最初因 Playwright 强制焦点模拟而没有实际冻结，最小页证明定时器仍运行且无 freeze 事件。改用独立临时 Chromium default context + noDefaults，确认 hidden/freeze/resume 真实事件后保留离线断言；并按 [Chrome Page Lifecycle](https://developer.chrome.com/docs/web-platform/page-lifecycle-api) 的 document freeze/resume 事件加显式暂停、保存和丢弃恢复首帧，保留原断言修复。
- 生命周期驱动与主 Playwright runner 分进程：原生 CDP 默认上下文必须禁用焦点覆盖，且不能被 runner 的录屏覆盖重新强制活跃；相同的 freeze/resume、任务剩余时间断言保留在 `scripts/check-lifecycle.mjs`，浏览器测试要求其退出码 0 并附实际事件 JSON。
- 截图复查后，将 <500px 高的横屏原料行上移，避免反馈栏压到物品；Pad 托盘内食品随尺寸增大，槽间距保持可分辨。Canvas 指针开始时清掉残留的语义键盘焦点。针对手机 Canvas、Pad 键盘/旋转、真实合成触控三条受影响路径回归，3/3 通过，不修改规则或宽松化断言。
