# M2.2 续做交付证据

2026-09-21。实现已完成，工程证据按下列轮次报告；iPhone 15 Pro Chrome仍 **NEEDS_REVISION / AWAITING_OWNER_REVIEW**。本目录根下既有日志属于首轮候选；本次结果放在 `continuation/`，不继承旧PASS。

## 本轮 Git 交付（不测试）

负责人已明确授权推送所有本地分支、通过 PR #6 合并到 main，并上传本报告及截图录像。全部证据已纳入 Git；本轮只补充同步记录，所有测试、构建、lint、资源检查、浏览器操作及性能采样均 NOT_RUN，Git hooks 跳过。下文是实现阶段历史结果，未重跑。完整 Git 同步范围和计数见 [STATUS](../../STATUS.md)，最终 SHA 与合并结果见 PR 和交付消息。未部署，外部验收状态不变。

## 版本与范围

- baseline/main：`c105ec8478de5f1f0a03d38ca03255b7938e92f8`，开始和交付前fetch一致。
- 接手：`7593dff08ab90b5cb36d65db17344666c1208ba7`；保留并续接9个未提交文件。文档治理：`00808639943d7068e54f57c32fbd203d2573d16e`。
- 集中验证候选：`fb9d4c07566b559b3deb712dc4eeb59ca75d7148`，dirty=false。
- 最后运行代码：`3a73ee42ec39255bc9f22b38d10ffc22d794ed0b`，dirty=false；之后只归档证据和更新文档。分支 `codex/m22-phone-foods`，[PR #6](https://github.com/yuan2go/tabby-english-food-truck/pull/6)，现按负责人明确授权合并，结果以PR状态为准。
- content `m2.2`；manifest SHA-256 `024a0dacbe8e7d057054d62f984d41e63180daaaca0da1503fa095df46f38e36`；世界schema6、Profile v3。

续做补齐：显式菜单成长、语言负荷与帮助/并发分开、教学选择进入真实库存、口味与食品意义分离、旧教学迁移、制作台逐实体命中、单客升级双客座位、短横屏空间、异常状态入口与按钮触点。没有换引擎、课程平台或旧项目导入。

## 操作与内容

删除独立重听/图示/常驻问号与帮我拿、放到选择器、单食谱类别切换、远处放回。点客人重听，点猫展开帮助；食谱仅多设备时按需展开；暂停一级只有继续、设置、保存回首页。原料就近撤回与成品确认收起/恢复分开。

| 路径 | baseline实际新资料 | 当前实际新资料 |
| --- | --- | --- |
| 单水果 | 2次 | 2次 |
| 首次苹果汁 | 7次：选机器、水果、杯、启动、点成品、选盘、送餐 | 4次：点机器、水果、启动、送餐 |

计数不含首页导航、教学关闭与等待；当前可见帮助走查另用了2次配方帮助操作。[基线实走记录](continuation/baseline-clicks.json)中的dirty=true来自临时worktree未跟踪的依赖符号链接，tracked源码diff为空；没有修改基线代码或注入通关状态。三明治/汉堡的器具搬运、煎饼接取和成品落盘已省去；完整19单验证包含这些动作，但未把带检查/纠错点击的录像宣称为最短点击数。

50项均有真实图片、名称与短情境语音、词形/单位、五项批次、实际听音找图活动。详细[逐项注册与用途](continuation/food-coverage.json)与 `src/content/foods.json` 一致：

| 注册主角色 | 数量 | 实际用途 |
| --- | --- | --- |
| 直接水果 | 8 | 新鲜水果菜单和装盘订单 |
| 配料 | 8 | 真实制作链；苹果/香蕉也能直接供应 |
| 成品配方 | 4 | 果汁、冰淇淋、三明治、汉堡及变体 |
| 预制供应 | 8 | milk/yogurt/smoothie/milkshake/pizza/salad/cake/cookie；不声称完成其烹饪 |
| 仅认知 | 22 | 意义学习和小游戏；禁止生成不可供应营业单 |

草莓也映射鲜果与口味勺；香草植物和口味分别表达。ice cream不拆成两个食品，词界和字母独立ID可恢复。拼写按基础筛选，长词/短语不进初级任务。食品篮看过答案会带入collection-preview支持，不能变成独立听力证据。

无尽新档只准入apple，在营业间隙明确认识/选择加入banana→juice→banana-juice；跳过不解锁，之后仍能遇见学习机会。口味阶段固定一球装杯，容器阶段固定一球香草，组合阶段再加数量/配料。切换只影响新单，seed/cursor、已接任务、原料、预留和旧题帮助保留。

## 实际检查

环境：macOS 26.5.2 arm64 / Darwin25.5，Node26.3.1、npm11.16.0，锁定依赖未升级。HTTP `http://127.0.0.1:4174/`。Chromium和WebKit均为桌面自动化模拟，不是实体iPhone Chrome。

| 命令/范围 | 结果 / 退出码 | 证据 |
| --- | --- | --- |
| fb9d4c0 `npm run build`（含typecheck） | PASS / 0，保留Phaser大块提示 | [build](continuation/build.log) |
| `npm run lint` | PASS_WITH_WARNINGS / 0，23 warnings、7 infos | [lint](continuation/lint.log) |
| `npm run resources` | PASS / 0：347真实文件、196语音引用、50概念图音 | [resources](continuation/resources.log) |
| `npm test` | 188/188 / 0，含50项参数化、守恒/错单/支持/迁移 | [rules](continuation/rules.log) |
| 同候选 `npm run test:browser` 关键9路径 | 8/9 / 1；组合板启动被撤回命中，已修 | [browser](continuation/browser.log) |
| 同候选 `BROWSER=webkit npm run test:browser` 4路径 | 3/4 / 1；缩窗检查没等测量帧，已修 | [webkit](continuation/webkit.log) |
| dbe65ad 中间定向 | Chromium2/4 / 1；实际触点与刷新断言继续诊断；WebKit1/1 / 0 | [中间失败](continuation/affected-browser.log)、[WebKit](continuation/affected-webkit.log) |
| 3a73ee4 `npm run build`、lint | PASS / 0；lint同样保留23 warnings/7 infos | [build](continuation/build-touch.log)、[lint](continuation/lint-touch.log) |
| 最后代码 `npm run test:browser` 受影响路径 | 4/4 / 0：完整19单/Pad恢复/多词恢复、满盘纠错/多指/横屏、声音失败重试、水果2点/果汁4点 | [最终定向](continuation/touch-browser.log) |
| 最后代码WebKit完整故事 | 1/1 / 0：19单、四类制作、Pad旋转恢复和多词恢复 | [WebKit主线](continuation/story-webkit.log) |
| 后台真实freeze/resume | PASS / 0；1800ms隐藏，设备/助手只前进83.4ms前后台操作时间，暂停声音为空 | [lifecycle](continuation/lifecycle.log) |
| 桌面1440×900/DPR1 | 键盘取料、鼠标实际交付PASS | [桌面](continuation/desktop.json) |

不把分次结果合称一次9/9或整仓浏览器全套通过；未运行的旧浏览器路径为NOT_RUN。最后变更只涉及布局、撤回目标和命中，规则/资源没有再改。脚本完整参数、退出码分别保留在log与同名exit；规则失败前后还见development和本目录历史日志。

## 界面、录像和仅用可见帮助走查

[截图/录像浏览页](review.html)；同393×665/DPR3 [baseline](baseline-393x665-dpr3.png)与[候选](continuation/viewport-393x665-dpr3.png)。[实测视口/宿主/缓冲/DOM顶层命中](continuation/viewports.json)覆盖393×565/665/759、852×300/393、1024×768；手机DPR3时缓冲983×1663（像素预算下2.5倍率），没有为布局降低清晰度。后三项撤回按钮修改后的触控原片见最终定向录像。

实际浏览器工具栏伸缩以可见高度变化模拟；真实iOS Chrome浏览器栏、安全区、旋转与原图逐项对照仍PENDING。用户所述三张真机原图在本次输入/仓库中未定位，PENDING_INPUT，既有截图不冒充用户原图。

`m22-visible-walk.spec.ts`不导入内容答案、不读世界存档：只看当前请求图片、正式“看看怎么做”帮助，完成苹果和果汁两单；[走查记录](continuation/chromium/m22-visible-walk-visible-i-4a833-uice-without-hidden-answers/walk.json)。当前工具没有可听输入，所以这是ASSISTED_VISUAL_WALK，人工声音体验NOT_RUN。单词听到与否只以播放事件记录，不认定听懂。

完整主线录像保留；Agent查看每8秒的顺序抽帧及原尺寸代表截图。该抽样不是逐帧人工手感审查，也不是儿童体验结论。一次仅为定位撤回碰撞的隔离诊断使用了章节fixture（diagnostic-board.json明确标记）；它不计入故事通关或正常路径证据。

声音故障测试实际阻断WAV加载，验证错误分类入口、重试当前对象、不中断取料及不产生语言错误；真机截图对应的具体失败根因因缺原图/设备日志仍PENDING_INPUT，不能预设权限或网络。

## 性能与外部验收

[主采样](continuation/performance-candidate.json)：3a73ee4、393×665/DPR3，无录屏、无CPU profiler；424帧p50=33.3/p95=33.4/max=66.7ms；6次点击至第二rAF代理p95=48.1ms；长任务58/53ms；冷传输3,181,587 bytes、暖9,300 bytes。输入代理<100ms；**60fps预算NOT_MET**。这是本机自动化样本，不是真机性能或教学水平。

另做[CPU诊断](continuation/performance-diagnostic-cpu.json)，与浏览器回归并行、开启profiler，不用于性能比较。7682/7943样本落在native `(program)`，可命名的JS主要在Phaser图形批处理；不足以把原生/GPU开销归因到某个源码函数。未凭猜测改规则或降低清晰度，实体设备进一步归因PENDING。

既有站点本轮实读HTTP200：[线上身份](live-version.json)，仍是build `5f39d12cbfa6b1a4cd4d295b1cbe91421e0bc1fd`、content m2.1、旧资源hash `170ddd2db8ca265f5fe6f126405adea8208ac4ca0c2d8f7a009888533729695b`。M2.2 **PENDING_DEPLOYMENT**；未创建新站点、未把旧线上版本当本包通过证据。

| 维度 | 状态 |
| --- | --- |
| 运行实现/规则与所列本地回归 | IMPLEMENTED / LOCAL_VERIFIED，按上述各轮原始结果 |
| iPhone 15 Pro Chrome真机、视觉手感 | NEEDS_REVISION / AWAITING_OWNER_REVIEW |
| Pad实体、人工听感/听审、教研、儿童观察 | NOT_RUN |
| 新图片与开发语音分发权利 | PENDING；没有真实审核者或授权记录 |
| 60fps目标 | NOT_MET |
| 线上M2.2与部署验收 | PENDING_DEPLOYMENT |
| 公开发布 | BLOCKED，待上述外部验收与部署；不阻断本次工程交付 |
