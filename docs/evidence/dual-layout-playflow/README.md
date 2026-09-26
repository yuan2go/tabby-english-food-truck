# WP-DUAL-LAYOUT-PLAYFLOW-CONTENT-01 交付证据

基线：`origin/main` `0217871ca06a6b36d8cf0a34b7280a6f83283fe2`，2026-09-27 开工时干净。分支：`codex/dual-layout-playflow-content`；只在本项目的独立工作树实施。最终运行代码提交及干净生产构建为 `72895eb8b0c6e68298f769826c4a432a64c32330`，页面 [`build-identity.json`](build-identity.json) 实测 `dirty=false`；最后证据提交及 PR 的完整 SHA 见交付消息。生产预览使用 `http://127.0.0.1:4174/`；截图及录像是此本地 HTTP 预览的工程证据，不是部署网址。

## 产品入口与实际接入

- 首页→故事→五章各五小关，共 **25** 个稳定关卡 ID。第一章开门、果汁、水果变化、双客选择、花；第二章杯/筒、口味、双球、配料与彩旗；第三章三明治夹层、饮品/水果配合与桌布；第四章汉堡、芝士、煎饼等待时另一盘、服务顺序选择与灯；第五章主动邀请、朋友到来、协作、回访和由大咪完成最后交付。旧五章收据保留，不据此跳过新增小关。
- 兔兔由熟悉苹果走到尝试新水果，刺刺带旧食谱并帮忙挂旗、布置，长辈由交钥匙走到把笔交给大咪。关卡订单带稳定来访者 ID，按来访者显示对应现有贴图；第一章两位朋友与第四章双料理的选择改变订单先后、盘位、人物和结算回应，分支汇合。花、树荫纸条、彩旗、桌布与灯串在结尾回收，完成后可回看/重玩。
- 首页→小游戏→主题入口，共 **30** 个明确关卡（听音找物、多组配对、WordSpell、数量/组合、选词组句各六关）和 **1** 个混合复习。每关由内容文件定义目标、情境、目标序列、题池、支持、完成条件和基础分支；每局 4–8 个短任务。只有已经介绍并能制作的食品进入营业订单；仅认知食品只用于学习场景。小游戏读写与故事进度分离，识字/拼写不是剧情门槛。
- 首页→无尽营业的菜单暂缓会在下一单后再出现；已介绍的食谱是轻量参考，首次教学会暂停。工作台、食材投放位置、托盘及客人焦点分别显示，明确按钮启动加工。错误交付不消耗食品，原料可撤回、成品可恢复，制作中保存/暂停/刷新仍由规则时钟与快照负责。

## 画面与连续操作

| 证据 | 含义 |
| --- | --- |
| [桌面前](before-desktop-1440x900.png) / [桌面后](after-desktop-1440x900.png) | 1440×900 同视口正常入口，比较窗口、柜台、设备、角色、按钮和食材距离 |
| [宽屏](wide-desktop-1920x1080.png) / [窄桌面](narrow-desktop-1024x768.png) | 同一任务切换 1920×1080、1024×768；桌面舞台受控，窄桌面按内容空间重排 |
| [手机前](before-phone-393x665.png) / [手机后](after-phone-393x665.png) | 393×665 同视口正常入口；后图由实际手机触控完成首单的路径截取 |
| [手机冰淇淋](ice-phone-393x665.png) | 393×665 冰淇淋蛋筒的触控操作画面 |
| [桌面冰淇淋](ice-desktop-1440x900.png) / [双球配料](ice-topping-desktop-1440x900.png) | 鼠标杯装、蛋筒、双球和香蕉配料的制作路径 |
| [短横屏](short-landscape-844x390.png) / [平板](tablet-768x1024.png) | 同一在途冰淇淋任务的窗口变化，未重开游戏 |
| [加工与另一盘](overlap-prep-desktop-1440x900.png) / [回汉堡台](overlap-desktop-1440x900.png) | 肉饼处于 processing 时苹果已在 2 号盘；送苹果后返回组装汉堡 |
| [两台设备并行](parallel-devices-desktop-1440x900.png) | 终章香蕉汁与肉饼同时 processing，目的盘分别预留；截图显示当前汉堡台，两个设备状态由连续测试断言 |
| [长辈与兔兔到窗前](visitor-elder-desktop-1440x900.png) | 从正常主线保存的第五章营业节点恢复后拍摄；人物与本关订单关联，不按左右座位硬编码角色 |
| [小游戏主题](mini-theme-phone-390x844.png) / [终章](story-finale-1440x900.png) | 主题入口与真实完成最后交付后的结尾 |
| [桌面首杯鼠标录像](ice-desktop-first-cup.webm) / [桌面纠错与多球鼠标录像](ice-desktop-mouse.webm) / [手机蛋筒触控录像](ice-phone-touch.webm) | 杯/筒、双球、配料、撤回、错单恢复及屏幕旋转的连续操作 |
| [五章连续操作录像](story-throughline.webm) | 从首页进入，逐关完成 25 个营业小关；第四章实际重叠加工/备餐，终章交付后结束。自动化读取状态用于工程检查，不能作为儿童独立理解的证明 |

历史基线图保持原样。前后图片是同视口模拟浏览器对比，用户附件原图未在本工作树出现时，不声称逐像素对齐原附件。

## 验证边界

macOS、Node `v26.3.1`、npm `11.16.0`；本地锁定依赖。以下工程检查以运行代码 SHA `72895eb8b0c6e68298f769826c4a432a64c32330` 为准：

| 命令 | 结果 |
| --- | --- |
| `npm run build`（含严格 typecheck） | PASS / 0，`dirty=false`；保留 Phaser 大块提示 |
| `npm run lint` | PASS_WITH_WARNINGS / 0；49 warning / 7 info，详见 [`lint.log`](lint.log) |
| `npm test` | PASS / 0；198/198，详见 [`unit.log`](unit.log) |
| `npm run resources` | PASS / 0；347 文件、196 语音引用、50 食品，详见 [`resources.log`](resources.log) |
| 精选 HTTP Chromium 桌面/手机/小游戏/成长 | PASS / 0；7/7，详见 [`browser-focused.log`](browser-focused.log) |
| 五章连续主线与两类并行 | PASS / 0；25/25 小关，1/1 连续 HTTP 路径，8.9 分钟；[`story-throughline.log`](story-throughline.log) 与对应 [`story-throughline.webm`](story-throughline.webm) |
| 旧手机完整回归适配 25 小关 | PASS / 0；1/1，7.0 分钟，逐关制作、加工中暂停刷新、终章及拼写回访；[`browser-legacy-stateful.log`](browser-legacy-stateful.log) |
| 旧可见提示回归适配 25 小关 | PASS / 0；1/1，7.0 分钟，图片与正式食谱帮助完成四类料理和混合服务；[`browser-legacy-visible.log`](browser-legacy-visible.log) |
| 旧双客边界回归 | PASS / 0；1/1，错单焦点、盘满、恢复及短横屏；[`browser-legacy-boundary.log`](browser-legacy-boundary.log) |

浏览器脚本直接操作正常页面和真实命令，不注入关卡完成或订单判定状态。完整工程通关会读取本地规则状态核对实例/并行/存档，不据此证明孩子能独立理解；只按可见提示的鼠标和触控走查分别保留录像。桌面与模拟手机分开记录；默认画质，未开启 CI 省电模式。早期并行测试先后漏了显式换汉堡台、送汁前切回 2 号盘，属于测试操作遗漏；原失败分别留在 [`story-throughline-initial.log`](story-throughline-initial.log)、[`story-throughline-tray-failure.log`](story-throughline-tray-failure.log)。用正常营业存档作针对性复验确认两个设备同时加工、选对盘后实际接收；不将分轮结果拼成一次通过。

PR 首轮远端 CI 的旧浏览器脚本仍假设点章节标题便进入整章营业，导致 7/11 失败（[首轮 Actions](https://github.com/yuan2go/tabby-english-food-truck/actions/runs/36262270330)）。修订旧用例以实际小关入口、独立“放盘”操作和 25 关进度继续，保留原有错单、库存、恢复、可见帮助、学习活动和最终交付断言。中间针对性复跑 3/4（边界脚本尚未修完）的记录保留于 [`browser-legacy-targeted.log`](browser-legacy-targeted.log)；上述最终各自通过的日志对应最终脚本。远端重跑结果以 PR 检查为准。

实体 iPhone 15 Pro＋Chrome **BLOCKED**（没有实体设备）；儿童观察、人工听审、教研 **NOT_RUN**；资源权利与已有开发语音审核 **PENDING**；公开部署 **PENDING_DEPLOYMENT**。本包未生成或引入新图片/声音，不将文字剧情当作已配音。默认画质浏览器截图与测试不能证明实体触感、儿童趣味或 60fps。
