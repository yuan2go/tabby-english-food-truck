# M2.1 证据与交付记录

M2.1运行实现已完成；本地工程结论与外部验收分列。完整范围以 [01–05](../../05-delivery.md) 与 [STATUS](../../STATUS.md) 为准。[连续录像播放器](review.html)、[实际语音文件](audio/index.html)、[正式帮助体验走查](experience-walk.md)。没有读取或导入旧英语仓库，没有新增食品、章节、账号或平台。

## 版本与环境

- 开始和交付前fetch的默认分支：main，baseline `20382877cc9711765b91ada2e081d19be0e81bfb`。原主工作区干净，PR #1–#4均已合并；开工时无开放PR。
- [PR #5](https://github.com/yuan2go/tabby-english-food-truck/pull/5)已创建并推送，未合并。分支 `codex/m21-learning-revisit`，独立worktree `/Users/yuan/.codex/worktrees/tabby-m21-learning/tabby-english-food-truck`，一个实现负责人。
- 合并检查的干净实现：`c0fe89e5e1d81036c702f0431b33799e99cd9367`，dirty=false，content=m2.1，manifest SHA-256 `170ddd2db8ca265f5fe6f126405adea8208ac4ca0c2d8f7a009888533729695b`。原始命令 [commands.json](commands.json)。
- 最后运行实现：`229073b3829b00e991c509067b8f53565f14270c`，干净构建。相对c0fe的运行差异只有拼写页CSS：至少44px字母、长词布局和提示间距；TypeScript、规则、音频、内容、保存及资源未再改变。其后只修测试格式、整理证据及文档；最终Git SHA见PR head与交付消息，避免在提交内伪造自身hash。
- macOS26.5.2 arm64 / Node26.3.1 / npm11.16.0；锁文件中的React19.1.1、Phaser3.90.0、TS5.9.3、Vite7.3.6、Playwright1.63.0不升级。npm ci成功，audit 0。
- 所有浏览器操作来自实际HTTP `http://127.0.0.1:4174/`。Chromium headless、桌面Mac模拟触控/DPR，非实体手机、Pad或Safari。

## 缺陷到运行行为

| 实际缺陷 / 要求 | 当前实现 | 本轮证据 |
| --- | --- | --- |
| 中间肉饼却播放成品订单、名称猜文件名 | 80条显式speech注册、23项产品名称、词汇/中间产物/成品/请求/剧情提示分开；递归制作步骤使用当前output的图文音频 | m21-contracts与regressions；151资源真实hash/引用；audio样本含patty→cooked patty→cheeseburger→request |
| 章节与请求抢播、第一句无触发 | App统一开场→小教学→请求；Audio完成/中断/失败/静音结果和可取消序列，首句显式触发；主动重听可抢占 | audio contracts；首句/跳过/拒播/正确对象重试HTTP路径 |
| 完整句和所有原料堆面板 | 食物/口味→数量/容器/组合的有限内容单元；意义展示→一个图片/数量选择→当前制作步骤→实际营业，允许随时跳过 | lesson.webm；正式帮助走查；数量与组合语义复用内容定义 |
| 打开教学或播放成功当学习完成 | presented、真实choice、learnedUnits、操作教程与当前题支持分别存；稳定attempt ID去重；旧打开记录标legacy-opened | unfinished lesson恢复、规则/资料迁移与拒存测试；无掌握率 |
| ICECREAM无词界、所有档位长词相同 | 固定词界和独立字母ID；已介绍词＋字母基础＋帮助档位选池；示范/部分固定/自己试真实不同；保留长词 | phone完整故事后的ICE CREAM恢复；规则词池/重复字母/撤回/重排 |
| 字母库36px、默认内边距挤字 | 手机至少44px；8字母单词仍属同词组，窄屏分两行；收紧提示间距 | letter-before真实失败；229073b布局定向回归和原尺寸截图 |
| 听音后还强制喇叭、固定/过量选项 | 实际播放后直接选图；按已教内容选2–4个干扰项并洗牌；逐题找图、英文配图、识字后的中英文字配对分别命名 | direct matching、bilingual及四题闭环HTTP |
| 必须四题做完才能退出、活动互相覆盖 | 小摊随时返回，spell/listen/word-picture/bilingual分别保存；继续与确认重开；新设置不默默套旧档 | mini-settings、刷新、拒存内存与坏档导出 |
| 切换/重开洗掉本题帮助、缺实际播放也算独立 | 未完成题carry支持不可清洗；听音需实际play成功证据，否则audio-not-observed；字母库如实是letter-bank支持 | 稳定attempt、restart与播放条件规则；HTTP新设置继续测试 |
| enter只改support沿用旧mode | support与concurrency独立；新建/继续/刷新用统一policy，降并发完成现有单再收敛，升并发合法空位补单 | policy.webm；seed/cursor/库存/设备/预留/剩余时间；多轮有界与schema迁移 |
| 苹果首单默认果汁机，切换制作选中残留 | 默认备餐盘，类别/备餐位显式选；已学非目标空杯由规则登记；一键送餐、双击退料、可选拖动 | 手机18单；纠错/连续点按/键盘/触控取消；无自动答案设备选择 |
| 语音失败提示盖住苹果供给 | 提示缩到安全底栏，明确重听/图示按钮，不阻挡制作 | browser-targeted原失败与browser-fixes修复；voice-failure录像 |
| 每帧重复深拷贝动作计划 | 不可变计划共享，只复制当前任务壳；保留唯一物料权威、动作队列与规则时钟 | mutation isolation规则；微基准、连续坐标及取消边界 |

食品守恒、容量、配方消耗/产出、原子交付和规则时钟未放宽。schema4从schema3只迁移可确定的旧实际并发与菜单，不猜成绩；旧v1资料的打开记录不冒充完成。复杂在手订单不因改支持变无效，后续补单才用新策略。坏档原文受保护并可导出，拒绝存储保留本次内存进度但不能保证关页后恢复。

## 命令、失败与影响范围

| 命令 | 结果 / 退出码 | 说明 |
| --- | --- | --- |
| `npm run build` | PASS / 0 | c0fe与229073b均从干净提交构建；已含typecheck，不再重复；Phaser >500KB提示保留 |
| `npm run lint` | PASS_WITH_WARNINGS / 0 | 36条specificity警告、1条info，不关闭规则；229073b后一次测试格式失败已修，保留日志 |
| `npm run resources` | PASS / 0 | 151文件、80条speech显式引用；真实尺寸/Alpha/hash/运行注册；不等于听审或授权 |
| `npm test` | 54/55 / 1 | 唯一失败为旧测试将“自己试”错误期待成零支持，实际字母库应记letter-bank；修正合同断言后受影响 `npm test -- tests/m2-world.test.ts` 9/9 / 0 |
| `npm run test:browser` | 20/21 / 1 | c0fe同一生产构建整套；唯一失败是中英玩法按钮加语义说明后旧定位失效；保留原失败 |
| `npm run test:browser -- e2e/minigames.spec.ts e2e/m21.spec.ts --grep 'bilingual\|matching accepts'` | 2/2 / 0 | 修正定位，并验证按新设置重开携带本题支持 |
| `npm run test:browser -- e2e/minigames.spec.ts --grep 'spell complete'` | 0/1 / 1（修复前） | 原尺寸复查发现36px触控目标，先新增断言复现；非人工通过 |
| 229073b拼写、完整故事词界、手机/Pad、后台关键烟测 | 5/5 / 0；[原始日志](layout-browser.log) | 后续只重跑CSS影响路径，不重复整包测试；最终结果同步STATUS |
| `EVIDENCE_DIR=… node scripts/check-lifecycle.mjs http://127.0.0.1:4174/` | PASS / 0 | native hidden/freeze/resume/visible，1800ms冻结，不把模拟失焦冒充后台 |
| `EVIDENCE_DIR=… node scripts/measure-m21.mjs …` | PASS（采样执行）/ 0 | 性能是否达标单列，不以命令退出0表示60fps |

原始日志：build/lint/resources/test/browser、affected-rules/browser、letter-before、layout-*。没有把54/55＋定向9/9写成一次55/55，也没有把20/21＋2/2写成一次21/21。旧断言变更都有依据：支持不再暗含双客，部分补全按真实固定量；听音错误使用实际可选干扰项；独立拼写如实记录字母库；中英活动定位包含当前玩法。没有删除保障或注入正常通关状态。

## 手机、Pad、动作与声音

手机393×665/DPR3完整18单，从正式首页经过四食品类、煎制/组装中保存、结局，再正常进入多词拼写并刷新；Pad1024×768↔768×1024在序章、制作、接取和送餐中恢复。布局后229073b同版本手机/Pad证据见final-layout；c0fe整套原始材料在browser和播放器，版本不混写。

教学退出9.76秒全部0.1秒抽帧98帧、助手/交付20.4秒全部0.25秒抽帧82帧、Pad35.36秒全部1秒抽帧36帧，16页顺序复查图已实际查看。它们结合每帧连续坐标及取消前后同一绘制点，检查接续、物料跟随和旧动作覆盖；不是仅拿最终静帧证明动作。原片全部保留。抽帧检查不是实时人类手感观看；交叉淡变仍可见，不宣称骨骼动作或负责人已接受。详见 [visual-review.json](visual-review.json)。

所有WebM无音轨。音频曾尝试提交给当前工具，但返回不支持音频输入，实际听感检查 **NOT_RUN**。浏览器play/ended、音轨文件与映射校验只证明工程事件。11份实际运行样本、hash和来源已提供；本机Samantha开发TTS、教研、人类听审、分发权利仍未获批准。

## 性能

主采样关闭录像与CPU profiler，Mac同机393×665/DPR3、同样首个苹果交付和下一单榨汁路径；冷上下文与缓存命中导航分开。完整故事录像中的performance JSON不当主采样。

c0fe：426操作段帧，p50=33.3ms、p95=50ms、max=50.1ms；8次pointerup到第二个rAF代理p95=47.5ms；长任务50/63/50ms；冷资源传输3,170,183 bytes，暖9,300 bytes。最终229073b布局版427帧，p50=33.3/p95=50/max=83.3ms，8次输入代理p95=45.8ms；长任务62/71ms；冷3,170,253、暖9,300 bytes，见performance-layout.json。不是INP、显示器延迟或实体手机60fps。

此前基线同机同路径为p50=33.3/p95=33.4/max=66.7ms；冷3,161,435、暖9,300 bytes。基线构建来自仅文档变更的b0c73d，dirty=true（测量脚本/证据），运行源码与203828一致，不能冒称干净基线发布。单次采样有波动，当前没有整机FPS改善证据，**60fps目标NOT_MET**。

6阶段真实动作计划、10,000次规则微基准：advance平均0.01563→0.000505ms。这个结果只支持移除每帧深拷贝，不能推断整机帧率。没有凭函数名声称热点，也没有为零警告全面换皮。

## 线上身份与更新后验收

[既有站点](https://tabby-english-food-truck.yuan576264675.chatgpt.site/) 未登录可访问HTTP200；本轮首尾读取均是 build `854dbfc691f111104e9d565f436a88c90c6f0775`，dirty=false，content=m2.0，manifest `72bafdb32b5dc6af44260d1b3d8ccbe9f1fbe52d944fc8a744679641b9664bef`，见deployment-baseline/final.json。它确已更新，历史m1.1结论不再描述当前站点。当前站点与本包版本不同，M2.1线上冒烟 **PENDING_DEPLOYMENT**，未自动部署或另建站点。

准确待部署运行提交为 `229073b3829b00e991c509067b8f53565f14270c`，或包含它的最终PR提交。后者应在干净checkout构建，页面build SHA显示实际构建的最终提交；content必须m2.1、manifest必须170ddd…、dirty=false。不要把本地旧dist搬过去并宣称来自新head。

获得该站点部署授权并更新后，在未登录正常首页核对这三个身份，再执行：故事序章首句→开场/教学可跳过→苹果/果汁点按制作→加工中返回/刷新继续；听词直接选图→中途切到拼写→继续草稿；无尽单客/双客与三档帮助双向切换，已有订单和食品仍在；手机DPR及Pad横竖屏、静音/拒播、后台恢复。版本一致后才能填写该站点的PASS；发布不自动继承本地结果。

## 分项结论

- 工程实现：IMPLEMENTED；覆盖规则和HTTP入口，本轮失败及修复记录完整。
- 本地功能：按合并运行＋定向修复报告；外部验收不由这些结果代替。
- 视觉/操作手感：用户反馈已落实工程修订，AWAITING_OWNER_REVIEW；agent发现的字母触控问题已修。
- 性能：已测，60fps预算NOT_MET。
- 可听输出体验、人工听审、教研：NOT_RUN；资源/声音权利PENDING。
- 实体iPhone/Android/iPad、Safari、儿童观察：NOT_RUN。
- 部署：PENDING_DEPLOYMENT；当前公网仍是M2。
- 公开发布：BLOCKED，不能把本地工程交付写成整包所有验收通过。
