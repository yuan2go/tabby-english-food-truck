# 本轮整合验证证据索引

受测 full SHA：`43d7c76c80df54361790c47ba1715fe7290f9039`；content `adventure-experience-2`，dirty=false。任务2026-10-11启动，2026-10-12收尾。只读测试最新 main，未修产品、提交、推送、合并或部署。

[完整报告](../2026-10-11-integrated-validation.md) · [版本／环境](engineering/version-environment.json) · [SHA-256清单](SHA256SUMS.txt)

## 优先复核

- [首轮五章与自由厨房连续录像](manual/video/page@71d4f0bb9fc8912f637f770ed0aaf997.webm)：782.88秒、960×540；受测桌面viewport1280×720。首轮靠正常UI、图示、教学、反馈与可访问名称，无源码／E2E答案／内部状态推进。
- [手机第二野餐路径、小游戏与操作录像](manual/mobile-video/page@9cea73b27cadcb314b5db2aa7915b92b.webm)：1383.44秒、392×664；受测viewport393×665，真实touch事件模拟，非实体设备。
- [默认画质桌面宴会失败截图](engineering/browser-full-chromium-repro/test-results/adventure-desktop-feast-ex-fd0ba-ithout-repeating-settlement/test-failed-1.png)：低动态按钮被截。
- [手机按钮裁切测量](manual/control-geometry-phone.json) · [桌面测量](manual/control-geometry-desktop.json)
- [场景暂停焦点第一次](manual/scene-pause-focus.json) · [再次复现](manual/scene-pause-focus-repro.json) · [背景返回触发截图](manual/118-scene-pause-background-navigation.png)
- [原生Node22浏览器首次失败](logs/browser-node22-first.log) · [完整适配基线首次23通过／3失败](logs/browser-adapted-first.log) · [三项完整Chromium定向2通过／1失败](logs/browser-full-chromium-repro.log)

主录像通过完整Chromium HTMLVideo实际读取，readyState=4、无media error，见[视频读回](manual/video-readback.json)。输入流为VP8／25fps且无音频；25fps是录屏编码，不是游戏帧率。FFmpeg日志读取了流信息，但其极简发行版无null muxer，退出234，不能宣称FFmpeg完整解码通过。没有声音听审证据。短的初始`page@520...`录像是工具入口尝试，不作为五章通关证据。

## 报告证据代号

| 代号 | 范围 | 文件 |
|---|---|---|
| M0 | 当前实际页面身份／无页面错误 | [runtime](manual/runtime.json)；[自然完成档](manual/natural-storage.json) |
| M1 | 首轮正常首页连续五章 | 下方02–46截图；[操作与UI文本日志](manual/journal.json)；上方桌面完整录像 |
| M2 | 双野餐路线、接收时刻、奖励与恢复 | [提交前](manual/phone-picnic-prebranch.json)、[提交后未接收](manual/phone-picnic-submitted.json)、[已接收](manual/phone-picnic-received.json)、[刺刺路完成](manual/phone-hedgehog-complete.json)、[读回比较](manual/readback-comparison.json)；兔兔路在natural-storage的story-2-adventure会话 |
| M3 | 自由厨房全路径与旧单／作品保留 | [服务](manual/free-service.json)、[停客前](manual/free-before-stop.json)、[停客后](manual/free-after-stop.json)、[作品回看](manual/free-work-gallery.json)、[重新开店](manual/free-reopened.json)，47–54截图 |
| M4 | 课程／场景刷新、小游戏旁路隔离 | [旁路进入](manual/mini-source-entered.json)、[原来源返回](manual/mini-source-returned.json)、[手持刷新前](manual/hunt-held-before-reload.json)、[四轮课程暂停](manual/mini-course-paused.json)，62–96截图 |
| M5 | 实际触控／取消／布局／键盘 | [74条可信touch指针记录](manual/touch-events.json)、[取消前](manual/input-cancel-before.json)、[取消后](manual/input-cancel-after.json)、[帮助焦点](manual/keyboard-focus.json)、[拖落空](manual/drag-miss.json)，99–101／112–118截图。touch-events-final为空是刷新后重建诊断数组，不冒认为无触控 |
| E1 | 当前全部单元首次及缺fixture定向 | [首次281项](logs/unit-first.log)、[同SHA fixture补齐后9项](logs/unit-fixture-recheck.log)；首次失败仍保留 |
| E2 | 26项当前有效浏览器基线 | [适配列表](logs/browser-loader-list-v2.log)、[首次完整结果](logs/browser-adapted-first.log)、[HTML详情](engineering/browser-node24-first/html/index.html)。这个目录名带node24，实际该轮是Node22.12.0，见原执行记录 |
| E3 | 失败的定向环境复现 | [默认画质headless shell](logs/browser-default-repro-v2.log)、[完整Chromium](logs/browser-full-chromium-repro.log)；各自目录保留截图、视频和原始error-context |
| C1 | 120词／15关51任务／33请求及实际引用 | [检查日志](logs/content-check.log)、[覆盖JSON](engineering/content/coverage.json)、[120行覆盖表](engineering/content/vocabulary-coverage.md)、[请求表](engineering/content/instructions.md) |
| C2 | 概念与食品目录分离 | [检查日志](logs/content-separation.log)、[70概念逐项结果](engineering/content-separation.json) |
| P1 | 外部合同样例、归类16多解、schema3–7 | [最终日志](logs/contract-probes-final.log)、[17组探针结果](engineering/contract-probes.json)；原脚本错误版本与日志也保留 |
| P3 | 开放委托非声明合法成品拒绝 | [读回](engineering/open-non-options.json)、[日志](logs/open-non-options-recheck.log)；不把未实施的strawberry-cone列作产品缺陷 |

## 工程与故障原证据

- 首次命令：[ci](logs/npm-ci-first.log)、[lint](logs/lint-first.log)、[resources](logs/resources-first.log)、[build含typecheck](logs/build-first.log)、[原生browser list](logs/browser-list-first.log)。
- 未来厨房原文：[读回](manual/future-save-readback.json)、[实际导出](manual/future-save-export.json)；[损坏档读回](manual/corrupt-save-readback.json)。
- 未来场景原文：[读回](manual/future-scene-readback.json)、[实际临时任务与原文导出](manual/future-scene-export.json)。
- 配额拒存：[内存导出](manual/quota-memory-export.json)、[解除后重试读回](manual/quota-retry-readback.json)。原文保留，不与自然通关混用。
- [独立音频故障录像](manual/fault-video/page@2935673136bec63a826870b6287999a2.webm)：155.48秒；加载失败、错单调整、实际交付；末尾工具重试调用无成功读回，不能据此说代理重试完成。
- [默认rAF样本](manual/performance-default.json)、[省电样本](manual/performance-low.json)：各约3秒，只证明调度观测，不能替代历史60fps目标验收。
- [实际标签切换尝试](manual/actual-background.json)、[窗口最小化尝试](manual/actual-window-background.json)：此环境仍报告visible，未取得hidden事件，不将原档继续变化误报后台计时缺陷。
- [npm审计原JSON](logs/audit.json)：2 high提示，静态风险；未升级／修依赖，也未证明漏洞可利用。
- [有效权威文档与配置原文](engineering/document-baseline/)：从受测SHA直接导出，包括AGENTS、README、STATUS、01–05和三个指定证据入口。

## 复核运行条件

产品源码在独立受测worktree。所有独立脚本在`scripts/`，含绝对同机路径。跨机器复核需调整路径，保留原源码和现有测试断言。

原生基线：Node22.12.0，依次`npm ci`、`npm run lint`、`npm test`、`npm run resources`、`npm run build`、`npm run test:browser -- --list`、`npm run test:browser`；本轮失败日志如上，不承诺这些当前都通过。

仅用于诊断的loader与config：`NODE_OPTIONS=--experimental-loader=<此目录>/scripts/json-loader.mjs`；`CI=true TEST_PORT=4278`运行`browser-isolated.config.ts`；原默认单worker、超时和断言不改。原生JSON门禁依然FAIL。定向完整Chromium运行unset CI、设置`CHROMIUM_CHANNEL=chromium`，使用`browser-full-chromium-repro.config.ts`和三项失败grep。该轮同时改变channel与画质，不能单因归责。

硬编码旧证据输出由各config的process.cwd隔离在本轮engineering目录，原包没有被覆盖。首次chdir错误、独立脚本预期错误、媒体检查工具不支持null等验证工具问题保留日志，不算产品错误。

## 本轮截图目录

编号是记录序列，不是测试项数量；每项可打开原图。部分后续故障截图不在最初journal里，下方以实际文件为准。

| 原图 | 当时说明／时间（UTC，若有journal） |
|---|---|
| [01-home.png](manual/01-home.png) | 按文件名查看实际场景  |
| [02-ch1-entry.png](manual/02-ch1-entry.png) | fresh default quality player UI 2026-10-11T15:18:04.014Z |
| [03-ch1-kitchen.png](manual/03-ch1-kitchen.png) | rabbit welcomed using visible character; tutorial appeared 2026-10-11T15:18:30.566Z |
| [04-ch1-request.png](manual/04-ch1-request.png) | Canvas mouse target matching DOM hotspot 2026-10-11T15:19:15.095Z |
| [05-ch1-breakfast.png](manual/05-ch1-breakfast.png) | held plate request replay then explicit friend delivery; returned to activity 2026-10-11T15:19:27.085Z |
| [06-drawer.png](manual/06-drawer.png) | second food delivered via visible tutorial, drawer exploration 2026-10-11T15:19:43.655Z |
| [07-ch1-flower-breakfast.png](manual/07-ch1-flower-breakfast.png) | watered left flower, real foods placed, banana tasted 2026-10-11T15:19:58.753Z |
| [08-ch1-complete.png](manual/08-ch1-complete.png) | first chapter complete through visible controls 2026-10-11T15:20:04.626Z |
| [09-icecream-processing.png](manual/09-icecream-processing.png) | cone + vanilla physically placed, switched device on 2026-10-11T15:20:27.147Z |
| [10-dessert-second.png](manual/10-dessert-second.png) | strict cone delivered; independently chose different strawberry cup for open sharing 2026-10-11T15:20:34.940Z |
| [100-short-landscape-help.png](manual/100-short-landscape-help.png) | 852×300帮助弹窗，核对继续操作 2026-10-11T15:48:53.711Z |
| [101-short-landscape-resumed.png](manual/101-short-landscape-resumed.png) | 正常触控继续营业，帮助遮挡解除 2026-10-11T15:49:10.144Z |
| [102-learning-observation.png](manual/102-learning-observation.png) | 学习记录将记忆/词义/拼写/基础表达/操作和帮助分开，非掌握率 2026-10-11T15:49:52.048Z |
| [103-muted-real-delivery.png](manual/103-muted-real-delivery.png) | 全部声音关闭，按图示制作苹果并实际交付旧任务 2026-10-11T15:50:19.522Z |
| [104-audio-failure-delivery.png](manual/104-audio-failure-delivery.png) | 按文件名查看实际场景  |
| [105-audio-failure-corrected.png](manual/105-audio-failure-corrected.png) | 按文件名查看实际场景  |
| [106-audio-retry.png](manual/106-audio-retry.png) | 按文件名查看实际场景  |
| [108-future-save-protection.png](manual/108-future-save-protection.png) | 按文件名查看实际场景  |
| [109-storage-quota.png](manual/109-storage-quota.png) | 按文件名查看实际场景  |
| [11-ch2-sharing.png](manual/11-ch2-sharing.png) | second dessert sent to open share; old recipe explored 2026-10-11T15:20:42.674Z |
| [110-quota-guidance.png](manual/110-quota-guidance.png) | 按文件名查看实际场景  |
| [111-quota-retry.png](manual/111-quota-retry.png) | 按文件名查看实际场景  |
| [112-control-clipping-phone.png](manual/112-control-clipping-phone.png) | 按文件名查看实际场景  |
| [113-control-clipping-desktop.png](manual/113-control-clipping-desktop.png) | 按文件名查看实际场景  |
| [114-keyboard-help-restored.png](manual/114-keyboard-help-restored.png) | 按文件名查看实际场景  |
| [115-note-clock.png](manual/115-note-clock.png) | 按文件名查看实际场景  |
| [116-background-return.png](manual/116-background-return.png) | 按文件名查看实际场景  |
| [117-scene-pause-focus.png](manual/117-scene-pause-focus.png) | 按文件名查看实际场景  |
| [118-scene-pause-background-navigation.png](manual/118-scene-pause-background-navigation.png) | 按文件名查看实际场景  |
| [119-corrupt-save-protected.png](manual/119-corrupt-save-protected.png) | 按文件名查看实际场景  |
| [12-ch2-compare-flags.png](manual/12-ch2-compare-flags.png) | different real cone/cup and flavors compared; strawberry tasted; cool flags 2026-10-11T15:20:57.517Z |
| [120-future-scene-temporary-play.png](manual/120-future-scene-temporary-play.png) | 按文件名查看实际场景  |
| [121-real-background-return.png](manual/121-real-background-return.png) | 按文件名查看实际场景  |
| [13-ch2-complete.png](manual/13-ch2-complete.png) | two desserts complete, entered next chapter naturally 2026-10-11T15:21:04.433Z |
| [14-ch3-entry.png](manual/14-ch3-entry.png) | rabbit first selected, no food received yet; no internal state read 2026-10-11T15:21:07.019Z |
| [15-ch3-sandwich.png](manual/15-ch3-sandwich.png) | two breads plus cheese, cover normal UI 2026-10-11T15:21:23.865Z |
| [16-ch3-receiving.png](manual/16-ch3-receiving.png) | submitted but still visibly receiving 2026-10-11T15:21:30.537Z |
| [17-ch3-rabbit-branch.png](manual/17-ch3-rabbit-branch.png) | branch visible after receive; drawer replaced by inspect basket 2026-10-11T15:21:50.002Z |
| [18-ch3-late-friend.png](manual/18-ch3-late-friend.png) | vegetable sandwich late friend request completed unchanged 2026-10-11T15:22:10.148Z |
| [19-ch3-rapid-input-not-delivered.png](manual/19-ch3-rapid-input-not-delivered.png) | rapid make+tray+guest sequence left vegetable food on plate; needs another actual selection 2026-10-11T15:22:26.937Z |
| [20-ch3-late-receiving.png](manual/20-ch3-late-receiving.png) | second deliberate plate pickup delivers, no food lost 2026-10-11T15:22:37.950Z |
| [21-ch3-branch-refresh.png](manual/21-ch3-branch-refresh.png) | same rabbit path restored after mid-receive reload and strategy switches; pack different cheese + fruit recipe 2026-10-11T15:22:49.456Z |
| [22-picnic-pack.png](manual/22-picnic-pack.png) | cheese sandwich + apple valid open combination, transferred to basket 2026-10-11T15:23:18.819Z |
| [23-basket-on-table.png](manual/23-basket-on-table.png) | actual basket contents opened on table 2026-10-11T15:23:31.832Z |
| [24-ch3-rabbit-complete.png](manual/24-ch3-rabbit-complete.png) | rabbit path complete, leaves tablecloth 2026-10-11T15:23:38.609Z |
| [25-ch4-parallel-start.png](manual/25-ch4-parallel-start.png) | patty frying, switch to juice while task running 2026-10-11T15:23:59.370Z |
| [26-ch4-juice.png](manual/26-ch4-juice.png) | visible request juice; output intended tray2; simultaneous device tasks 2026-10-11T15:24:09.247Z |
| [27-ch4-burger.png](manual/27-ch4-burger.png) | cooked patty from fry stage used at board with bun while juice runs 2026-10-11T15:24:19.653Z |
| [28-ch4-recipe-confusion.png](manual/28-ch4-recipe-confusion.png) | bun+cooked patty insufficient; UI asks check bun and additions; consulting visible recipe 2026-10-11T15:24:29.324Z |
| [29-ch4-mixed-plate.png](manual/29-ch4-mixed-plate.png) | initial no explicit new output selection; observe food recovery 2026-10-11T15:24:57.665Z |
| [30-ch4-recovery.png](manual/30-ch4-recovery.png) | moved burger out of mixed plate, explicit target customer delivery 2026-10-11T15:25:08.179Z |
| [31-ch4-drawer.png](manual/31-ch4-drawer.png) | both products prepared and delivered; lamp exploration 2026-10-11T15:25:15.833Z |
| [32-ch4-delivery-attempt.png](manual/32-ch4-delivery-attempt.png) | rapid transfer+pickup+guest did not deliver; foods still recoverable 2026-10-11T15:25:25.783Z |
| [33-ch4-cooperation.png](manual/33-ch4-cooperation.png) | rabbit lamp + hedgehog cup collaboration, juice placed seat2 2026-10-11T15:25:49.243Z |
| [34-held-burger.png](manual/34-held-burger.png) | explicitly held plate now, before guest click 2026-10-11T15:26:03.923Z |
| [35-wrong-burger-feedback.png](manual/35-wrong-burger-feedback.png) | actual strict mismatch: expected cheese burger; wrong burger retained, not pointer bug 2026-10-11T15:26:14.417Z |
| [36-cheeseburger-reprepare.png](manual/36-cheeseburger-reprepare.png) | wrong product shelved with confirmation, preparing cheese burger from feedback 2026-10-11T15:26:33.166Z |
| [37-cheeseburger-cook.png](manual/37-cheeseburger-cook.png) | valid burger combo after cooked patty arrives 2026-10-11T15:26:45.266Z |
| [38-shelf-confirm-no-effect.png](manual/38-shelf-confirm-no-effect.png) | confirmed shelf still left ordinary burger on tray; candidate defect requires direct reproduction 2026-10-11T15:27:04.763Z |
| [39-plate-edge-pickup.png](manual/39-plate-edge-pickup.png) | center click hit food selection; lower right plate label area successfully picks entire plate 2026-10-11T15:27:26.940Z |
| [40-ch4-lights.png](manual/40-ch4-lights.png) | real two foods placed, collaborators selected, moonlight lighting 2026-10-11T15:27:46.763Z |
| [41-ch4-complete.png](manual/41-ch4-complete.png) | evening complete after recovery 2026-10-11T15:27:48.196Z |
| [42-ch5-invitations.png](manual/42-ch5-invitations.png) | rabbit + hedgehog invitation sharing needs from history, UI read only 2026-10-11T15:27:55.217Z |
| [43-ch5-free-creation.png](manual/43-ch5-free-creation.png) | prepared chosen savory + cool dessert, no strict kitchen order 2026-10-11T15:28:04.855Z |
| [44-ch5-work-receiving.png](manual/44-ch5-work-receiving.png) | actual two foods moved as work, no score UI 2026-10-11T15:28:11.762Z |
| [45-ch5-save.png](manual/45-ch5-save.png) | actual savory and cool sharing + real tasting + work saved 2026-10-11T15:28:27.371Z |
| [46-five-chapters-complete.png](manual/46-five-chapters-complete.png) | five chapters reached using normal UI, pictures/tutorial/feedback support; no test answers or state access 2026-10-11T15:28:28.816Z |
| [47-free-shop-setup.png](manual/47-free-shop-setup.png) | after five chapters, chooses introduced menu and theme 2026-10-11T15:28:41.403Z |
| [48-free-served.png](manual/48-free-served.png) | apple-only familiar menu, first service 2026-10-11T15:28:59.951Z |
| [49-free-stop-processing.png](manual/49-free-stop-processing.png) | stopped arrivals while accepted next order and juice task preserved 2026-10-11T15:29:14.693Z |
| [50-free-work-handoff.png](manual/50-free-work-handoff.png) | juice sent as free work despite apple order retained 2026-10-11T15:29:25.399Z |
| [51-free-wrong-share.png](manual/51-free-wrong-share.png) | specific open savory need rejects juice, food retained; this is not free-creation grading 2026-10-11T15:29:39.810Z |
| [52-free-gallery.png](manual/52-free-gallery.png) | free juice tasted, taken back, moved seat3 to seat1, saved and viewed; accepted apple order preserved 2026-10-11T15:29:41.964Z |
| [53-free-natural-ending.png](manual/53-free-natural-ending.png) | active accepted order, work and food persist after owner-chosen closing 2026-10-11T15:29:54.693Z |
| [54-free-reopen-new-menu.png](manual/54-free-reopen-new-menu.png) | reopened banana menu with two guests, old apple order preserved and new banana introduced 2026-10-11T15:29:57.233Z |
| [55-phone-story-list.png](manual/55-phone-story-list.png) | home old recipe unexpectedly showed first-time prologue despite completed chapters; skip available 2026-10-11T15:31:10.750Z |
| [56-phone-picnic-before-food.png](manual/56-phone-picnic-before-food.png) | replay is normal button, welcomed rabbit first but will actually serve hedgehog first 2026-10-11T15:31:19.141Z |
| [57-phone-picnic-receiving.png](manual/57-phone-picnic-receiving.png) | touch held replay then actual hedgehog delivery, before receive branch 2026-10-11T15:31:34.217Z |
| [58-phone-hedgehog-path.png](manual/58-phone-hedgehog-path.png) | rabbit welcomed first, hedgehog received first -> drawer/mat path 2026-10-11T15:31:40.259Z |
| [59-phone-late-rabbit.png](manual/59-phone-late-rabbit.png) | drawer mat obtained; hedgehog placed, unchanged late rabbit cheese request 2026-10-11T15:31:51.439Z |
| [60-phone-hedgehog-complete.png](manual/60-phone-hedgehog-complete.png) | distinct mat and two received foods, sunlight cloth; no packing 2026-10-11T15:32:13.230Z |
| [61-short-landscape.png](manual/61-short-landscape.png) | phone touch context rotated short landscape, same completed activity 2026-10-11T15:32:13.617Z |
| [62-mini-bypass-lobby.png](manual/62-mini-bypass-lobby.png) | active free kitchen orders/materials/processing paused by optional minigame entry 2026-10-11T15:32:33.184Z |
| [63-theme-mini-lobby.png](manual/63-theme-mini-lobby.png) | ten mechanics visible, literacy optional 2026-10-11T15:32:41.237Z |
| [64-listen-meaning.png](manual/64-listen-meaning.png) | meaning first with image, before challenge 2026-10-11T15:32:51.190Z |
| [65-listen-feedback.png](manual/65-listen-feedback.png) | wrong banana then picture help apple, distinct supported response 2026-10-11T15:33:05.987Z |
| [66-listen-resumed.png](manual/66-listen-resumed.png) | same second task resumed, support kept; continuing multiple rounds 2026-10-11T15:33:39.974Z |
| [67-listen-complete.png](manual/67-listen-complete.png) | four successive normal UI tasks complete, first with wrong/help; no independent listening claim 2026-10-11T15:33:51.767Z |
| [68-pair-play.png](manual/68-pair-play.png) | paired mechanics UI before selecting real image 2026-10-11T15:34:05.172Z |
| [69-pair-feedback.png](manual/69-pair-feedback.png) | first real pair complete 2026-10-11T15:34:05.486Z |
| [70-spelling-feedback.png](manual/70-spelling-feedback.png) | P withdrawn then independent letter instances APPLE composed and submitted 2026-10-11T15:34:18.783Z |
| [71-quantity-feedback.png](manual/71-quantity-feedback.png) | one actual apple, banana withdrawn before submission 2026-10-11T15:34:34.922Z |
| [72-sentence-noun-only.png](manual/72-sentence-noun-only.png) | single noun attempted for full request, observe grammar vs semantics 2026-10-11T15:34:42.336Z |
| [73-new-scenes-lobby.png](manual/73-new-scenes-lobby.png) | five new mechanics visible and optional 2026-10-11T15:34:53.222Z |
| [74-hunt-two-demand.png](manual/74-hunt-two-demand.png) | cup + spoon actual two-object request 2026-10-11T15:35:30.455Z |
| [75-hunt-wrong.png](manual/75-hunt-wrong.png) | wrong bowl rejected, not fake success 2026-10-11T15:35:41.368Z |
| [76-hunt-one-of-two.png](manual/76-hunt-one-of-two.png) | one of two actually delivered, task still active 2026-10-11T15:35:41.865Z |
| [77-hunt-complete-task.png](manual/77-hunt-complete-task.png) | refresh resumes paused, held spoon survives; both actually delivered 2026-10-11T15:36:05.930Z |
| [78-memory-covered.png](manual/78-memory-covered.png) | 玩家主动遮挡；准备从实际桌面补物 2026-10-11T15:42:21.493Z |
| [79-memory-wrong.png](manual/79-memory-wrong.png) | 勺子补错反馈；区分记忆与英语 2026-10-11T15:42:43.432Z |
| [80-memory-recovered.png](manual/80-memory-recovered.png) | 主动重看后杯子补回，记忆恢复成功 2026-10-11T15:43:01.466Z |
| [81-sort-incomplete.png](manual/81-sort-incomplete.png) | 未完成移动先检查，不产生错误成绩 2026-10-11T15:43:26.609Z |
| [82-sort-alternative.png](manual/82-sort-alternative.png) | 篮子放花园，倒水壶放厨房，合法多用途方案完成 2026-10-11T15:43:27.494Z |
| [83-design-wrong-color.png](manual/83-design-wrong-color.png) | 蓝杯桌上拒绝，属性确实判定 2026-10-11T15:43:57.594Z |
| [84-design-wrong-position.png](manual/84-design-wrong-position.png) | 红杯桌下拒绝，空间确实判定 2026-10-11T15:43:58.764Z |
| [85-design-correct.png](manual/85-design-correct.png) | 红杯桌上完成 2026-10-11T15:43:59.429Z |
| [86-design-reference-missing.png](manual/86-design-reference-missing.png) | 盘子拿离桌上，白杯旁边不能成功 2026-10-11T15:44:34.160Z |
| [87-design-reference-restored.png](manual/87-design-reference-restored.png) | 参照物恢复桌上后成功 2026-10-11T15:44:36.766Z |
| [88-design-free.png](manual/88-design-free.png) | 同一布置关转自由，书放篮内保存，不判标准答案 2026-10-11T15:44:56.226Z |
| [89-theatre-closed.png](manual/89-theatre-closed.png) | 闭盒中球无法拿出，无语言失败 2026-10-11T15:45:33.857Z |
| [90-theatre-container-complete.png](manual/90-theatre-container-complete.png) | 开盒取球、搬入篮子与关盒连续四任务，真实状态保留 2026-10-11T15:46:21.798Z |
| [91-theatre-preconditions.png](manual/91-theatre-preconditions.png) | 未拿壶、未放杯、无水、未进水槽时操作受阻且可恢复 2026-10-11T15:46:41.796Z |
| [92-theatre-tea-complete.png](manual/92-theatre-tea-complete.png) | 放杯、拿壶倒水、拿勺搅拌、碗进水槽清洗，四任务完成 2026-10-11T15:46:45.277Z |
| [93-theatre-cut-blocked.png](manual/93-theatre-cut-blocked.png) | 苹果未进砧板/无刀，不能切；没有带到院里不能分享 2026-10-11T15:46:56.530Z |
| [94-theatre-share-complete.png](manual/94-theatre-share-complete.png) | 苹果切分后篮子搬院里，实际分享完成 2026-10-11T15:47:14.313Z |
| [95-kitchen-after-ten-games.png](manual/95-kitchen-after-ten-games.png) | 十类小游戏后原订单与加工回到厨房 2026-10-11T15:47:58.919Z |
| [96-mini-return-source.png](manual/96-mini-return-source.png) | 无刷新旁路正常返回原活动桌，订单加工不丢失 2026-10-11T15:48:00.860Z |
| [97-shelf-modal.png](manual/97-shelf-modal.png) | 成品收起确认弹窗，背景不能操作 2026-10-11T15:48:37.229Z |
| [98-shelf-after.png](manual/98-shelf-after.png) | 重复核查确认收起效果 2026-10-11T15:48:37.661Z |
| [99-touch-cancel.png](manual/99-touch-cancel.png) | 真实CDP touchStart/multi-touch/touchCancel，未产生新食品 2026-10-11T15:48:53.054Z |
