# 2026-10-12 · 参赛Demo修复与验收主报告

本轮直接实施，先完成实质性文档治理独立提交，再分别提交工程、体验及整合修正。原工作区未改，未推送、创建PR、合并或部署。五章、双野餐、自由厨房、十类小游戏、50食品/120学习概念及冻结角色方向保留。

## 身份、交付与结论

| 项目 | 完整身份/实际状态 |
| --- | --- |
| baseline origin/main | `f359b4053cf73e0103bf13b46d26496f19868508`，已fetch |
| 收尾远端main | `0b249b04697b1df43d74bbe1a4f532175b2d04f1`，工作期间另一材料任务合入；[只读比较](final/main-advance.json)证明src/public/art/scripts/依赖/测试与初始baseline相同 |
| 原工作区 | `codex/player-review-2026-10-11`；HEAD `64f03fc716de70e20f64f9bbc3802de7601a460f`；原有`?? docs/playtests/`保持 |
| 独立分支 | `codex/demo-repair-2026-10-12` |
| 最终受测提交 | `e0542ff0882eb77fcf8e189dad6b0b0a71f977bd`，构建前git status为空，运行`data-build-dirty=false` |
| 内容/资源 | `adventure-experience-2`；manifest SHA-256 `325147c9c3a95a163aa05b55eb6aa6e3894d0e8896097f7b21708bbf36ed5b02` |
| 运行文件 | 590文件、41,700,545字节；逐文件hash及实际构建文件时间见[构建身份](final/build-identity.json) |
| 文档/证据最终提交 | 交付后本地[delivery-receipt.json](/Users/dafangzi/.codex/artifacts/tabby-demo-2026-10-12/delivery-receipt.json)记录最终完整HEAD；其后仅文档/证据，产品源码相对受测提交差异为零 |
| 工作包1 | 工程缺陷关闭，原生门禁和定向/整合验证结果见下表 |
| 工作包2 | 代码完成；浏览器代理触控体验结果以最终记录为准；负责人手感与目标年龄理解未验 |
| 工作包3 | PARTIAL / BLOCKED：同构建工程、浏览器模拟与验收材料可执行；实体设备、人工听审、儿童观察及权利尚未完成，不能宣布整体通过 |

最终本地文件包、hash和启动方式见本报告末尾。受测SHA与最终文档SHA区分，历史站点不属于本轮构建。

## 文档治理与实际实现

完整读取AGENTS、README、STATUS、01–05、最新2026-10-11整合报告/证据索引、e2e合同、资源登记及相关计划，再只读核查对应源码。治理提交`9a06559714c2ab3f3d0e75f7c915bfabe38eaceb`先于产品代码：现行入口统一职责，移除重复阶段叙述和相冲突的旧测试/授权限制，原文和独立历史计划移至[归档](../../archive/pre-demo-repair-2026-10-12/index.md)并修引用。全部失败证据、资源来源/权利和有效toast/烤面包机/速度候选保留；这些候选明确不属于本轮。方案写回03/04/05，没有平行最终设计。收尾发现main另合入参赛说明/治理0b249b0：保留独立正式材料、原稿/PDF一致性与历史43d7c76受测身份；当前索引指向本轮结果，旧材料失败与授权不冒充当前合同。相同baseline归档只保留一份并修引用，独立AI制作史/M0证据原索引保留。正式材料未改正文/PDF/配图，不把另一个任务的推送合并授权继承到本轮。

工程提交`005e2c06e9e5f43aecfeffb534f848527f1cb066`，体验提交`a79d4ea0ed011823e4a2a742909dba68f7a5ff5b`。整合修正桌面盘把`e45201943f03214e9694f9932ad4f67ce399b7e2`、新请求教学时序`f99e00d7f51f5db2a35db6144a689accc7f55a80`，合法回程测试调整`337bd84c7a24264f038a9d45be83b867fbac012b`，最终统一托盘/角色/拖动与恢复区`e0542ff0882eb77fcf8e189dad6b0b0a71f977bd`。均可分别审查。

| 问题 | 最终行为及证据 |
| --- | --- |
| D01 | JSON导入使用Node22原生`with {type:'json'}`；list/build/tests不用诊断loader |
| D02 | manifest格式归一；工程提交685条资源与baseline语义等值，[修正后的等值计数](manifest-semantic-check-corrected.json)；早期脚本错误把entries计为0的原文件保留，未冒充独立证明 |
| D03 | SceneTheatre采用独立scene-theatre样式，FriendTheatre控制独立三列；桌面/手机/Pad/852×300短横屏完整控件，未缩小掩盖；默认演出与低动态收据分开 |
| D04 | 统一模态初始安全焦点、Tab/ShiftTab和外部focus约束、各层背景inert及原值恢复；暂停/重玩/确认/设置覆盖，关闭回原触发器；帮助→对比连续模态链保留最初焦点；非模态场景线索保留操作 |
| T01 | 两个默认演出用例显式默认画质/无减动画，保留过程断言；低动态单独覆盖4布局、真实食品收据/奖励幂等，不断言合法省电模式必须逐阶段演出 |
| X01 | 点食品选择一件，独立48px盘把拿整盘，即使已选单件也不先移动它；食品下方两个48px高按钮横向间隔8px，选择和端盘不重叠；食品、角色放盘、拖动/回弹共用Canvas/DOM坐标；同盘放下/持盘重听保留，玩家自己选朋友交付 |
| X02 | 目标与持续文字派生真实选择/物料/任务；接收后结束旧送餐文字，空盘回程不冒充仍带食品的送餐；图带、文字与角色事实一致 |

首页主活动牌配听需要→制作→整盘交付→朋友使用→小院变化图带，自主玩法保留次入口；已有活动记忆减少重复开场。普通/芝士汉堡、杯/筒、1/2份与水壶/浇水壶提供通用双向图音对比，较少帮助不主动显示严格答案；打开对比如实记visual-contrast支持。两个已有原创矢量器具细化后选择性导出，仅4条资源事实更新；声音与其他来源/权利未改变。宽容单词表达记意义、称“表达需要”，多词短请求才记结构，不冒称完整句式掌握；拼写/组句不锁主线。既有花位、彩旗、灯、两路餐桌、作品/回访继续按实际历史表现选择后果，没有新复杂系统。

规则保持唯一来源。单归属、真实消耗/产出、严格/开放/自由分判、接收与奖励幂等、支持不可洗白、坏档/未来档/拒存恢复均由既有规则和验证覆盖。生命周期继续通过独立暂停原因、取消前景声音及卸载/后台清理，未增加运行时AI、框架、账号或经济。

依赖审计仅修确认相关的sharp资源导出与source-map-js构建开发依赖，未升级整套；精确锁定sharp0.35.5，保留无关锁文件平台元数据。依据官方[sharp advisory](https://github.com/advisories/GHSA-wq5f-xc86-pv6w)、[source-map-js advisory](https://github.com/advisories/GHSA-68fv-2mgg-jv7q)及实际依赖使用面；最终npm audit为0项。不声称无法由此证明的全面安全。

## 最终命令、范围与失败保留

环境：macOS26.6.2/25G83、arm64；Node22.12.0/npm10.9.0；Playwright1.63.0、完整Chromium153.0.8010.12。所有原生命令使用`PATH=/tmp/node-v22.12.0-darwin-arm64/bin:$PATH`。build已含typecheck，不另计一次。

| 命令 | 退出码 | 实际结果 / 证据 |
| --- | --- | --- |
| `npm run build` | 0 | strict typecheck + Vite生产构建；[build.log](final/build.log)，Phaser大分块警告保留 |
| `npm test` | 0 | 21文件、289/289；[unit.log](final/unit.log) |
| `npm run lint` | 0 | 122 warnings / 17 infos、0 errors；[lint.log](final/lint.log) |
| `npm run resources` | 0 | 685实文件hash/尺寸/alpha，458speech，50食品映射；[resources.log](final/resources.log) |
| `node scripts/check-vocabulary.mjs` | 0 | 120概念≥2机制、51场景解、33短指令；[内容检查](final/content.log)，不作全120词UI验收 |
| `npm audit --json` | 0 | 0 vulnerabilities；[audit.log](final/audit.log) |
| `npx playwright test --list` | 0 | Node22原生收集31条/9文件；[vocabulary.log](final/vocabulary.log) |
| `npm run test:browser` + 下述环境 | 0 | 31/31通过，6.3分钟，零重试；[完整HTML](final/browser/html/index.html)、[日志](final/browser.log) |
| `node node_modules/.cache/demo-acceptance.mjs` + 冻结URL | 0 | 9可信输入样本及实际身份一致；首轮后台NOT_CONFIRMED（不算通过）；[同构建9样本/后台/声音](final/manual/browser-measurements.json) |
| `node .../demo-native-background.mjs` + CUA真实窗口/标签 | 0（首次语法1） | 后台NOT_CONFIRMED、返回恢复NOT_RUN；不是通过 |
| 本地打包及逐文件核验 | 0 | 590运行文件精确集合/bytes/hash一致；[包核验](final/package-verification.json) |

安装门禁`npm ci`退出0见初始/整合尝试记录，当前最终package-lock与最后安装相同，未在每次布局修改重复安装。以上最终命令时间/退出码见[命令记录](final/commands.json)与[浏览器命令](final/browser-command.json)，UTC与本机Asia/Shanghai差8小时。

浏览器正式命令：`CI=1 TEST_PORT=4293 CHROMIUM_CHANNEL=chromium EVIDENCE_DIR=/tmp/tabby-demo-final-5-2026-10-12/browser npm run test:browser`，单worker、零重试。CI其余用例沿用低动态初始存储；两项默认演出用例显式关闭低动态并声明no-preference，独立低动态用例覆盖四布局事实。后述9次响应测量使用默认画质。完整五章从正常首页逐次制作/交付，兔兔野餐路线；独立刺刺路线、自由厨房作品/改位/保存/回看/收摊、活动/小游戏往返、十类小游戏代表边界、静音/较少帮助、错误交付/满盘/库存/预留/取消多指/音频拒播、刷新与旋转恢复。没有穷举120词、注入通关、删除断言或测试旧固定关卡流程。

失败与修后证据分开：[初始失败](before/html/index.html)、[原始日志](logs/)、[定向收敛](experience-converged/html/index.html)、[独立复核](code-review.md)，完整尝试分别保留integrated-attempt-1/2/3/4。第1次五章失败暴露盘把遮住桌面工具，第2次暴露旧动作结束后意义教学突插，第3次按规则与路径判断为合法空盘回程被测试忽略（当刻未附remaining/routing，不伪称直接状态证明）；修后choosePrep只等待真实回程，不推进/注入状态，忙盘边界仍直接tap。新增失败状态只读附件供诊断。三次停止退出130，未跑完项INTERRUPTED/NOT_RUN，不算通过。最终启动时上一停止进程残留4293导致预检退出1，日志独立保留；只终止已识别的本任务预览PID后启动，未重试产品断言到绿。第4次完整尝试退出1：28通过/3失败，完整五章及两路野餐均通过；自由厨房未先处理实际菜单弹窗、剧场帮助按旧dialog角色查找两项修正测试操作/语义而保留内容断言。第三项为短横屏食品和顶部/撤回覆盖的真实产品问题：食品移至盘面、两48px控制横排，Pad竖屏双盤縱排；原料区预留48px恢复位。一次定向4用例退出1（3通过，短横屏撤回仍覆盖），随后恢复槽修后原边界1/1通过，289单元通过；失败和修后分开，未删除错单/库存/取消/旋转断言。独立复核三项坐标P2关闭。

lint退出0仍有122 warnings/17 infos，主要既有代码风格问题；无错误，不扩本轮为全库风格重写。本地浏览器测试不等于云CI。收尾文档核对228个本地目标退出0（自引用交付回执在最终commit后生成）；首次在索引尚未生成时退出1并保留，补齐后通过。两份新材料JSON格式检查、10份正式材料原字节保持、10份重复档等值及git diff --check均退出0，见[文档记录](final/document-command.json)。

## 模拟设备、性能与声音实际验收

最终冻结/build/、同SHA/dirty=false，在实际macOS桌面运行headful Chromium，关闭录像/CPU和网络节流；desktop1280×720、phone393×665及Pad768×1024布局均DPR1、默认画质/no-preference，每种3个fresh context，共9样本。两个手机/Pad只是布局和触控代理，不是实体设备；fresh context不等于磁盘冷启动。

启动从实际导航performance起点到主入口与角色图解码可用；响应从浏览器可信pointerdown到目标DOM提交并经过两次绘制机会，排除Playwright往返时间。该方法不能证明显示器延迟、INP或持续帧率，小样本不计算p95。下表为中位数（最小–最大），单位ms；全部9样本身份和输入可信性已核对。

| 条件 | 启动到首页可用 | 首页→活动 | 取料 | 端盘 | 厨房→活动桌 |
| --- | --- | --- | --- | --- | --- |
| desktop | 723.3 (710.2–864.3) | 186.3 (169.8–503.0) | 23.3 (22.4–27.9) | 28.3 (27.7–31.5) | 29.8 (23.3–30.6) |
| phone-simulation | 737.2 (487.6–741.5) | 158.0 (113.7–171.9) | 33.1 (33.0–33.3) | 33.3 (33.2–34.0) | 32.7 (32.6–33.8) |
| Pad-simulation | 503.3 (496.8–513.6) | 102.2 (101.9–103.6) | 32.7 (32.1–32.9) | 33.4 (32.6–33.4) | 32.8 (32.5–32.9) |

取料/端盘没有出现此环境下的明显阻塞；首次活动进入包含场景初始化，最大503ms，不能将取料<100ms概括为所有切换达标。未发现可据这9样本确认的运行性能故障，未为数字盲目重写加载或动画；实体启动/输入/场景切换、持续帧稳定与热量仍待实测。历史60fps NOT_MET不改记通过。完整方法与原始数据见[脚本](final/browser-acceptance.mjs)和[记录](final/manual/browser-measurements.json)。

首手势后AudioContext running，正常UI请求重听到实际heard事件，资源拒播/重试、静音和回访支持由整合路径验证；这不证明人听见或听审。第一轮另开Playwright页面时原页visibility仍visible，快照继续计时，后台结论NOT_CONFIRMED并保留；随后独立尝试原生最小化、再以CUA真实新标签页切走游戏（新标签选中、游戏标签取消选中），移除Playwright后台禁用启动参数，隐状态谓词仍超时；没有取得真实hidden证据，专项NOT_CONFIRMED，返回/恢复NOT_RUN。见[专项记录](final/native-background/result.json)和[操作/退出码](final/native-background-command.json)。第一次脚本换行转义导致SyntaxError退出1及rAF轮询未确认均保留；第二次改interval观察，不反复重跑产品断言。未注入visibility或时钟，不能据此认定产品后台通过或存在确定后台缺陷；实际浏览器后台和实体生命周期继续PENDING。

实际可见/命中验证：首页三布局入口与重听逐一中心命中；厨房食品/盘把浏览器真实触控输入事件后核查单件与整盘状态、盘内75%位置移动、同盘放下/持盘重听；演出控制4布局点击与奖励事实。新核心目标优先48–64px；现行底线44px的单件食品未压缩。桌面/Pad盘把在完整工具/委托行上方保留8px间隙；Pad竖屏双盘垂直容纳三件食品，单盘活动物理盘统一；食品/端盘/选盘/恢复互不遮挡；手机工作区/托盘重排，短横屏演出不盖抽屉和操作行。布局模拟不能证明实体胖手指、系统安全区或真机手感。

全458条speech保守列入[精确文本/文件hash/技术参数听审队列](audio-review-queue.csv)，66条核心优先，其余为全部可触达内容目录；459个登记WAV中`note.wav`无speech引用单列，不作可触达审核通过。全部PCM22050Hz/16bit/mono，0.3207–7.3013秒；无全零文件/饱和样本，[技术脚本和结果](audio-technical-summary.json)可复跑。这只证明文件事实，不能证明发音、断句、舒适音量、图音、适龄性或授权。

声音范围还含[4条合成声音层与9个登记短反馈](final/audio-review-synthesis.csv)，原创代码source/hash及逐项触发路径；effects层共用9个cue，insert仅登记、未发现实际调用，保守列为待审。人工听审必须覆盖语音、音乐/环境/机器/操作及语音让位，不能把这458条文件队列当全部声音已通过。用户明确“先用浏览器模拟设备，暂时没有听审”：人工听审BLOCKED/NOT_RUN，教研适龄与声音/图片分发权PENDING。未发现有证据需替换的声音，未伪造审核者，未更改源授权事实。

## 同构建外部待验的可执行路径

使用下述冻结文件包；每次记录完整SHA/manifest、dirty=false、设备型号/系统/浏览器版本/画质/网络、本地存档是否已有。实体手机和Pad各至少一台，须独立记录，模拟截图不代替。

1. 新存档首页→早餐主牌→先帮兔兔→厨房→看意义图并点“我来试试”→1号盘取苹果。点苹果确认仅这件选中，再点盘把确认整盘；同盘放下、持盘重听，自己点兔兔明确交付。错食品给朋友应留盘并可撤回，不能自动改客人；接收完成旧送餐提示消失。香蕉给刺刺，抽屉花苗/浇水壶→选花位→浇水→开席；演出三个控件可见可点，重播/跳过不重复奖励。
2. 继续清凉：正常制作杯/筒甜点、比较杯筒图音、分享/品尝、挂旗。野餐先帮兔兔走装篮，另一个新局先帮刺刺走摆餐垫，两路汇合。暖灯夜餐含芝士汉堡/果汁，最后自由创作两种作品、改餐位、品尝、保存食谱、收摊并回看真实作品/回访。食物/装饰/回访与真实选择一致，不靠精细拖动或滚动找核心控件。
3. 活动进入小游戏→剧场取工具/液体前置→暂停初焦点/Tab边界/背景不可操作→继续→重玩取消/确认→回活动，订单/厨房物料不丢。另覆盖图音对比四组与1/2份；通用两边参考不替玩家选答案，支持记录后续不能洗白。
4. 制作进行中旋转竖/短横→后台至少30秒→恢复，后台不推进游戏加工/演出，不补播过期声音；刷新→从主入口继续，核查单归属和目标。首手势音频解锁、静音、重听打断、系统拒播/失败重试；设备/浏览器操作方式与事实单列。现本轮真实hidden后台未确认，独立重验该项；暂停/刷新/旋转已有整合证据不替代实体Safari/Chrome后台政策。
5. 真机各3次以上实际导航启动、取料/端盘输入、厨房/活动切换计时并记录工具与条件。响应测真实输入→状态/画面，启动包含资源；连续实际玩法再评估帧稳定与热量。不得将本轮短DOM+rAF响应样本、模拟器、录像帧率说成实体60fps证明。
6. 成人先审核66核心语音，再逐条覆盖458目录和合成声音：文本一致、英语发音/中文读法、断句、首尾截断、请求/数量/杯筒图音、音量/混音让位、低龄语义与反馈；记录实际日期/审阅角色/意见/资源hash。同构建听审页原文件可直接播放，播放不自动转为已审。权利另核对冻结角色参考/派生、各素材生成来源和系统TTS分发凭证。
7. 具备真实目标年龄观察者与监护同意后，小范围观察首次主入口理解、单件/整盘、错单恢复、自主重玩；记录匿名观察编号、年龄段/条件、卡点及所用帮助，不采儿童身份。不把完成一轮或速度解释为学习效果已证明。

| 外部环节 | 状态/解除条件 |
| --- | --- |
| 真实浏览器后台专项 | PENDING / NOT_CONFIRMED；取得实际hidden后按4核对暂停/恢复、声循环与物料 |
| 实体手机/实体Pad | BLOCKED / NOT_RUN；用户当前只用浏览器模拟，取得设备后执行1–5 |
| 人工听审 | BLOCKED / NOT_RUN；暂无听审者，成人按全部声音范围执行6 |
| 教研/适龄 | PENDING；实际成人审阅精确文本/图音/支持口径并留意见 |
| 声音/素材权利 | PENDING；现有来源记录保留，实际凭证/负责人确认独立补齐 |
| 目标年龄观察 | NOT_RUN；暂无实际观察者/监护同意，条件满足再执行7 |
| 负责人最终接受 | PENDING；体验模拟和工程通过不代替最终手感/视觉接受 |

历史实体iPhone NEEDS_REVISION、60fps NOT_MET保持原报告结论，没有用本轮代理检查覆盖。整体参赛接受仍PENDING，工作包3未全面通过。

## 本地启动、关键画面与证据

冻结包：[game-build-e0542ff.tar.gz](/Users/dafangzi/.codex/artifacts/tabby-demo-2026-10-12/game-build-e0542ff.tar.gz)，34,475,111字节，SHA-256 `9adb5bc06dc4a47370fc93fd4a14bb19193071d7e7562372db2d0917a32b6662`。运行目录590文件/41,700,545字节；包中另含构建身份和全部声音待审材料，未把文档/证据计作游戏资源。旧包留在独立attempt目录，不能当最终构建。

当前仅本机HTTP可用：[打开同一游戏](http://127.0.0.1:4295/build/)、[成人听审页](http://127.0.0.1:4295/audio-review.html)。暂停服务器后可用标准Python恢复：

```sh
python3 -m http.server 4295 --bind 127.0.0.1 --directory /Users/dafangzi/.codex/artifacts/tabby-demo-2026-10-12
```

从压缩包解出全部文件后，以解压目录代替上述directory即可。同构建听审页逐条播放原WAV，不采集信息、不自动登记审核通过。运行入口/build/与所有590文件逐一hash一致；早期包曾包含macOS AppleDouble侧文件，第一次精确核验退出1并保留，最终COPYFILE_DISABLE=1重打包后精确集合及全部hash通过。

开发者在该worktree使用Node>=22.12：`npm ci`→`npm run build`→`npm run preview -- --port 4294 --strictPort`；重新build会写入当时HEAD/dirty，若要复核本报告同一身份优先使用冻结包。不要双击HTML或使用历史部署站点。

关键画面全部来自最终正常入口：[首页手机](final/browser/screenshots/home-393x665.png)、[首页Pad](final/browser/screenshots/home-768x1024.png)、[短横屏首页](final/browser/screenshots/home-852x300.png)、[短横屏厨房](final/browser/test-results/m22-boundaries-phone-wrong-a3848-ndscape-keep-real-inventory/short-landscape-300.png)、[单件](final/browser/screenshots/individual-food-phone.png)、[整盘](final/browser/screenshots/whole-tray-phone.png)、[接收后目标](final/browser/screenshots/received-current-goal-phone.png)、[汉堡](final/browser/screenshots/burger-contrast-phone.png)、[杯筒](final/browser/screenshots/cup-cone-contrast-phone.png)、[份数](final/browser/screenshots/quantity-contrast-phone.png)、[器具](final/browser/screenshots/vessel-contrast-phone.png)、[默认早餐演出](final/browser/screenshots/breakfast-friends-desktop.png)、[兔兔野餐](final/browser/screenshots/picnic-rabbit-desktop.png)、[刺刺野餐](final/browser/screenshots/picnic-hedgehog-phone.png)、[夜餐喝汁](final/browser/screenshots/dinner-drink-desktop.png)、[低动态短横屏收据](final/browser/screenshots/receipt-852x300.png)。

全部本轮证据逐文件SHA-256/bytes见[evidence-index.tsv](evidence-index.tsv)；索引自身不递归哈希。构建身份只计运行文件；证据、截图、命令日志不混作游戏资源。未执行均按上述NOT_RUN/INTERRUPTED/BLOCKED/PENDING列出。
