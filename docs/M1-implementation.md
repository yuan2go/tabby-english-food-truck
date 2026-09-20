# M0/M1 实施记录

基线：`85585137e82bd24e3c3e4d61a972243dbaa683d5`，2026-09-20 fetch 后的 origin/main。PR #1 已合并，文档 head 为 `558e1521ffa2829a003fcaf099ddeb0e0693c359`。工作区初始干净，只含文档。实现分支 `codex/m0-m1-food-truck`，独立 worktree。不读取旧项目。

## 文档整理

已完整阅读 README、AGENTS、STATUS、01–05。规则与体验没有过期内容、失效相对引用或需要删除的重复规范。完整首包仍是有效后续设计。本轮以 05 的 M0/M1 为界，覆盖必要可靠性；M2、T07、吐司与第二设备不实现。修正 STATUS 的先合并 PR 说明；其余当前时态随实际落地更新。

## 实现决策

一个纯 TypeScript 规则状态持有物品归属、两盘三槽、任务剩余时间、订单、支持与尝试。所有输入调用同一命令入口；Phaser 根据状态表现，任务完成由规则时钟驱动。React 只显示开始/暂停/教学/便签及语义操作，不拥有游戏业务副本。

独立背景和透明道具承载纸艺墨绿餐车、赭黄遮阳篷与木台。游戏内不用网页卡片。手机上下分接待、设备与猫、托盘、原料；横屏将设备/猫与托盘左右展开。文字单独绘制。角色参考缺失是制作门槛，已向负责人索取路径/链接，等待期间不导入旧资产、不将占位角色标为成品。

配方时长 5 秒，助手 2 秒，盘回位 0.8 秒起步；从规则任务进度驱动分段姿态。每局随机交换两个请求的座位/客人映射，保存 variant。开发音频明确未听审；独立条件隐藏目标，不伪称听力测评合格。

## 分阶段工作

- [ ] 规则与 M0：配置/真实锁文件；`src/rules` 命令、时钟、快照；`src/content` 有限语法；`tests` 验证守恒、容量、预留、幂等、支持和恢复。
- [ ] 可玩场景：`src/game` 布局/输入/表现；`src/app` 薄外围；`src/platform` 音频/存储；正常首页可完成串行与交错路径。
- [ ] 制作：新背景、独立道具、客人、获准参考后的猫动作；登记真实尺寸/Alpha/hash/来源/审核；资源检查入口。
- [ ] 验证：typecheck、lint、build、test、resources、HTTP Playwright；Canvas 指针和键盘、手机/Pad/旋转、故障恢复、完整视频与实际性能采样。
- [ ] 交付：更新 STATUS/README/技术与素材记录、阶段提交、push、PR、不合并不部署，画面手感 AWAITING_OWNER_REVIEW。

## 边界接口

`createGame(runId, variant, priorSupport)` 创建一局；`dispatch(state, envelope)` 返回新状态与明确结果；`advance(state, milliseconds)` 仅推进有效游戏时间；`decodeSnapshot(unknown)` 验证完整关系后恢复；命令带 runId/id。时钟暂停属于宿主生命周期，存档任务只存剩余游戏时间，不用墙钟补算。

`GameController` 唯一持有世界，提供 dispatch、subscribe、tick、pause reason 集合、保存和重开；场景与 React 订阅离散变化。输入选择、词块草稿、拖影为可丢弃视图状态。

## 依赖依据

2026-09-20 查阅 [Phaser 安装](https://docs.phaser.io/phaser/getting-started/installation)、[Vite 版本要求](https://vite.dev/guide/)、[React 宿主集成](https://react.dev/learn/add-react-to-an-existing-project)，并核对 npm 元数据。Node 22.22.2 满足 Vite 7 的 >=22.12；采用 Phaser 3.90.0、Vite 7.3.6、React 19.1.1、TypeScript 5.9.3 的固定版本，避免无必要跨大版本升级。手写工程配置，不克隆模板；无模板遥测脚本。
