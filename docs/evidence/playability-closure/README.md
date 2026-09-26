# WP-M22-PLAYABILITY-CLOSURE-01 · 工程与可见界面证据

## 版本与方法

- 默认分支开工基线：`43ec1d1463a54d8eb715e1cf84465d10cc071491`；独立分支 `codex/m22-playability-closure`。
- 最后运行源码提交：`6259f674ceefe75da297bf52a5fc4dfbe1aab8be`。本轮**干净验证构建**：`d893116fa14dc06037317f7f66fff7dc446268e0`（仅浏览器断言修正，运行源码相同），`dirty=false`，内容版本 `m2.2`，资源清单 SHA-256 `024a0dacbe8e7d057054d62f984d41e63180daaaca0da1503fa095df46f38e36`。本地 Node `v26.3.1`；CI 锁定 Node `22.12.0`，均满足 `package.engines`。本地 Playwright 通过 `http://127.0.0.1:4174/` 访问构建后的 preview。
- 构建产物：`dist/index.html` SHA-256 `1943e65863717473d3b7bffca18b376aacd44790f9112b7f63ecddec6eb7467f`；`dist/assets/index-NxNtdA4p.js` SHA-256 `087d71475becba1ed9583d4c16be4b49186dfdea787f47fcf459cdf26b3a2b02`。构建内嵌完整运行 SHA、`dirty=false`、内容与资源身份；`dist` 本身不提交。
- [机器可读身份清单](identity.json) 绑定上述构建、两段录像与视口；现场设备复核须使用同一运行源码和资源身份。
- 后续证据与状态文档提交不修改上述运行代码；其完整交付 SHA 以 PR head 与最终报告为准。
- 最后运行源码提交后，仅修改浏览器测试、证据和文档；平台/WebKit 定向复验仍访问上述干净构建。[PR #7](https://github.com/yuan2go/tabby-english-food-truck/pull/7) 的 CI 在每个 PR head 重新安装、构建并跑精选浏览器路径；以 PR 上对应 SHA 的检查结论为准。

## 统一工程检查

| 命令 | 退出码 | 实际结果 | 日志 |
| --- | ---: | --- | --- |
| `npm run lint` | 0 | 无错误；33 条既有/非阻断 warning，7 条 info | [lint](tabby-closure-lint.log) |
| `npm test` | 0 | 12 文件、191/191 规则测试 | [rules](tabby-closure-rules.log) |
| `npm run resources` | 0 | 347 文件、196 语音引用、50 食品概念与资源映射校验 | [resources](tabby-closure-resources.log) |
| `npm run build` | 0 | 含 TypeScript 类型检查；Phaser 大块提示保留 | [build](tabby-closure-build.log) |
| `CI=1 npx playwright test e2e/game.spec.ts e2e/m22-boundaries.spec.ts e2e/m22-growth.spec.ts e2e/m22-visible-walk.spec.ts e2e/m22-playability-visible.spec.ts e2e/minigames.spec.ts` | 0 | 11/11 HTTP Chromium；完整 19 单故事、可见界面 19 单、双客/错单/音频故障/小游戏 | [final browser](tabby-closure-browser-final.log) |
| `CI=1 npx playwright test e2e/upgrade.spec.ts e2e/recovery.spec.ts --grep 'drag and keyboard\|phone DPR and Pad\|Pad prologue\|native background'` | 0 | 4/4；Pad 横竖屏、键鼠/拖动、资源重试、真实 CDP freeze | [platforms](tabby-closure-platforms-final.log) · [native report](native-lifecycle.json) |
| `BROWSER=webkit CI=1 npx playwright test e2e/m22-boundaries.spec.ts --grep 'phone wrong delivery\|audio loading failure'` | 0 | 2/2；模拟 WebKit 双客错单与音频故障 | [WebKit](tabby-closure-webkit-final.log) |

首轮集中浏览器检查在旧测试断言下为 **9/11、退出 1**，保留 [日志](failures/browser-initial.log) 与 [暂停恢复](failures/pause-context.md)、[小游戏](failures/mini-context.md) 的失败现场。前者仍等待机器 `READY`，而当前规则在任务到期时把唯一成品放入预留盘位并释放机器；修正后检查实际果汁位置、路由清理、机器状态与无额外语言尝试。后者因新增就近声音恢复状态后，旧 `role=status` 查询命中两个元素；修正为只检查小游戏纠错反馈。两条定向复验通过后，重新从干净提交构建并整轮跑出上表 11/11；没有删除断言、隐藏失败或注入通关状态。

补充平台检查首轮 **2/4、退出 1**，[日志](failures/platforms-initial.log) 保留：Pad 用例也误等机器 `READY`，已改为断言绑定盘位的真实成品；资源故障用例仍找已移除的常驻警告，已改查现有状态入口和就近重试。WebKit 首轮 **1/2、退出 1**，[日志](failures/webkit-initial.log) 保留：第二客仍在入场时用例提前寻找双客目标菜单；现在等待两位客人实际待服务，再断言双客选择。对应定向复验分别为上表 4/4、2/2。后台测试曾覆盖历史 `docs/evidence/m21` 输出，已将脚本输出指向本次测试目录并恢复历史文件。

[PR #7 首轮 CI](https://github.com/yuan2go/tabby-english-food-truck/actions/runs/36245803319) 在交付候选 `318b1afea17b854eb59764897c4db82c67457059` 上，依赖安装、lint、191 条规则、资源、构建均通过；Chromium **9/11、退出 1**。保留 [失败日志](failures/ci-36245803319.log)、[故事现场](failures/ci-story-context.md)、[故事画面](failures/ci-story.png)、[边界现场](failures/ci-boundary-context.md)和[边界画面](failures/ci-boundary.png)。三明治在刷新后已按规则把三份原料转成沿用首份 ID 的成品，旧断言仍要求原料 ID 全留；果汁在暂停前已完成并入盘，旧断言误以为它仍在杯座。现按加工前输入、预留目标、产物 ID 与无关食品逐项核对。定向 `game` 完整故事 **1/1、退出 0**；同一轮边界用例在短横屏取到调整视口前的旧触区坐标，合并运行 **1/2、退出 1**，保留[日志](failures/local-ci-fix-initial.log)。等待帮助触区与新布局同步后，单独边界用例 **1/1、退出 0**，见[日志](ci-fix-boundary.log)；同一改动的模拟 WebKit 边界 **1/1、退出 0**，见[日志](ci-fix-webkit.log)。这些本地定向结果不冒充 PR head 的整轮 CI；最新远端结论见 PR 检查。

## 可见界面走查

[e2e/m22-playability-visible.spec.ts](../../../e2e/m22-playability-visible.spec.ts) 从首页进入，靠画面中的请求图、正式食谱图和台面操作完成五章 19 单；包括一次故意错单、食品留盘和就近放回，后段选择双客并连续营业。它不读取存档答案、不导入内容/配方答案、不设置内部通关状态。它用可见图片的 `alt` 读取图意，再用屏幕实际触点操作；这是**视觉辅助走查**，不是儿童听力或趣味观察。工程回归另行读取内部状态，且明确知道答案。

[完整操作计数](visible-cost.json)：导航 7、教学继续 19、求助/图片/食谱 150、纠错 3、纯备餐触点 161、加工等待 20、送餐 19。共 359 次触点加 20 次等待；求助高频是为了每单只凭正式可见提示取答案，不能当作儿童正常熟练路径成本或“2次/4次点击”宣传。

同一 `393×665` CSS 视口、DPR3 的开局对照：[旧基线](../m22/baseline-393x665-dpr3.png) → [本轮开局](opening-393x665.png)，两张实测均为 `1179×1995` 像素。过程画面：[果汁](juice-393x665.png) · [冰淇淋](ice-393x665.png) · [三明治](sandwich-393x665.png) · [汉堡](burger-393x665.png)。[可见走查连续录像](visible-story.webm) SHA-256 `1a4d930d91914d8d2b35e5985e8514019d35bdbb2926eb09592d9da1229730f3`；[内部状态工程主线录像](engineering-story.webm) SHA-256 `8e6546e3036340b2fd29fd302718d6df72f41bb3e7b28017274b4f9fceb38e4b`。录像是模拟 Chromium 操作，录制工具不能证明儿童实际听见或理解英语。

## 负责人实体 iPhone 复核

把与上述运行源码、内容和资源身份一致的构建提供到 iPhone 15 Pro 的 Chrome，并记录该构建自己的完整 SHA；若使用同一局域网预览，在本机运行 `npm run preview -- --host 0.0.0.0 --port 4174`，手机访问本机局域网地址与端口。先在二级设置核对完整构建 SHA、内容 `m2.2` 与资源哈希，然后：

1. 从首页进入故事；第 1 章故意放错一份，确认食品留盘、就近放回，再做果汁；检查浏览器栏伸缩、触点与画面重合、声音重试和图示继续。
2. 完成冰淇淋杯/筒、球数/配料；三明治夹层撤回；汉堡煎饼加工时备另一盘、熟饼接入绑定组合板；切食谱与暂停/刷新后核对物料和盘位。
3. 第 3 章后选择双客，完成汉堡与社区混合菜品；横竖屏、短可视高度、后台恢复及多指取消各试一次。记录实际 iOS/Chrome 版本、构建身份、遮挡/误触/卡点与能否继续。

实体设备尚未接入本工作环境，**真机验收 BLOCKED**，模拟 Chromium/WebKit 不能代替。儿童观察须由负责人安排、取得监护人同意，仅留匿名卡点、成人读字帮助、听不懂提示、错单后能否修正及是否主动继续；本轮 **NOT_RUN**。开发语音的人工听审、教研和资源权利审核仍 **PENDING**，不生成掌握率、趣味性结论或公开发布资格。部署与合并均未授权执行。
