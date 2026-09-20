# 项目状态

## 2026-09-21 Git 同步（按要求不测试）

负责人明确要求提交并推送全部本地分支、通过 PR 合并到 main。本次初始核对 3 个本地分支、3 个工作区均干净；main 基线为 `0b904284131eb425118c0a1baa7a8d0663201c8e`，新增实现分支 `codex/m1-preschool-production` 的初始 head 为 `b8f81bd31deeb6abb0569742b96f94d33b659c75`，含 7 个已推送、尚未合入 main 的提交。复用 PR #3，本次仅补充此状态记录，不修改运行代码；最终合并结果和完整 SHA 以 PR 及交付报告为准。

本次测试、浏览器操作、类型检查、lint、构建、资源检查、性能采样均为 NOT_RUN，退出码不适用，提交/推送跳过 Git hooks。当前仓库没有 GitHub Actions 工作流，未启用工作流或修改权限。下方验证与浏览器材料来自实现阶段，本次未重跑；代码合并不代表负责人接受画面、完成真机/内容/权利审核或授权部署。

## 当前工作包 · 2026-09-21

M1 完整制作、低龄化玩法与移动端体验升级。一个实现负责人在独立 worktree `/Users/yuan/.codex/worktrees/tabby-m1-upgrade`、分支 `codex/m1-preschool-production` 执行。实现阶段未读取或迁移旧英语仓库，未启用工作流、改权限、合并或部署；后续 Git 合并授权见上方同步记录。

- baseline/default main：`0b904284131eb425118c0a1baa7a8d0663201c8e`，开工 fetch 后完整 SHA，初始 git status 干净。PR #1/#2 已合并，旧 PR 状态只作历史。
- 已推送并建立 [PR #3](https://github.com/yuan2go/tabby-english-food-truck/pull/3)，本次按负责人明确授权合并；视觉与手感仍 AWAITING_OWNER_REVIEW，未部署。实际 Git 状态以 PR 为准。
- 本轮受测生产代码：`1bf69a1f0db98bd612f309a1a147d00d0e9ab8d4`。从干净工作区构建，运行页显示完整 SHA / dirty=false / 内容 m1.2 / 资源清单 SHA。之后只提交验证证据与文档；最终提交 SHA 与 PR 见交付消息及 PR head，不在提交内部伪造自身 hash。
- 当前本包工程与本地回归已通过，结果见下方本轮记录；下面独立的“历史记录”不继承 PASS。

## 本轮实际行为

| 模式 | 内容与并发 | 教学与支持 |
| --- | --- | --- |
| 跟着小猫做 | 首次默认，一客一盘一个苹果；重玩变体是苹果汁 | 场内语音/实物/猫动作后亲手做；果汁预放杯明确 guided-preparation，不能记独立制作 |
| 帮客人准备食物 | 一次一客，五单：单苹果、单香蕉、两个苹果、组合、苹果汁；有限顺序变体 | 新知识先短示范，后续收起目标图；重听、图示、图片助手随时可用 |
| 小小餐车营业中 | 双客双盘，水果组合与果汁；串行和加工等待中交错都能完成 | 可选图片助手/词块，目标不常亮；请求与座位交换，不用固定位置证明独立听懂 |

三模式共享 createGame/dispatch/advance、配方、所有权、容量和快照校验器。切换保留各模式库存、预留与剩余时间，重玩当前模式须确认；支持历史跨模式保留。schema2 明确拒绝旧schema1/未来/坏档并保留原文导出，不猜测迁移成绩。拒绝存储时本次切换保留经过校验的内存序列化快照；关页前仍需导出。

稳定实体 ID 局部更新；新命令、语音、选客或别的落盘不清空正在飞行的食品。已拿起食品后点击盘内食品，统一按目的盘尝试放置，避免在途物品截住连续点击。整盘与食品共享槽位/比例/抓取偏移，递交到客人接物位置，食品收走后空盘返回；单个食品拖动仍是编辑。取消、capture丢失、多指、旋转、后台和卸载清理旧表现，动画不改领域。

便签使用独立 token ID，按原插入边界校正前后移动，支持首尾、重复词、返回词库；取消不提交。图片请求与词块调用同一助手预留任务，前者不伪造语言尝试。助手按实际苹果/香蕉顺序取料，物品跟随姿态手锚，落入提交时绑定盘位。取消释放全部预留。

教学、图片/文字支持、示范、独立条件、回访和英语播放状态分别记录；开发音频全部 audioQualified=false，不宣称听力测评。重听、拖空、未齐、设备忙和存储/声音失败不算语言错误。没有惩罚倒计时、扣币或羞辱反馈。

## 角色与资源

实际收到 1254×1254 RGB PNG，已原字节冻结，SHA-256 `e2eddeddbbd94edd6813b4ac64e29d19c34c4f07cc5553dbeef7c54b216fbaca`。用户所述 JPEG 原件未传入，此项为具体文件传递缺口；没有转码冒充原件，也没有阻断独立制作。

8 张独立 1254px Alpha 生产原稿（idle/read/reach/carry/place/greet/blocked/celebrate）实际接入；棕灰虎斑、金眼、浅口鼻、灰项圈、绿围巾、背包、画面颈部偏右露出的白色定位器保持，没有整体镜像。待机观察、读便签、分别取苹果/香蕉、携带、绑定盘落料、接待递交、受阻和短庆祝使用真实姿态变化与运动插值，非单张左右平移。原稿、运行导出、实际像素及权利状态见 [art/README](../art/README.md)、[manifest](../art/manifest.json)。

新托盘为独立1536×1024原稿；猫运行最长边640、托盘960宽；客人与机器回到原稿有效尺寸，不从低清合集插值放大。44份参考/原稿/运行图片/本地语音经 hash、字节、实际尺寸、Alpha、有效像素和运行注册检查。Agent 视觉检查不代表用户接受或素材权利审核。

## 手机、声音与性能证据边界

用户手机问题截图原件已收到：[手机原图](evidence/m1-upgrade/owner-phone-before.png)。原图1179×2556；该实体手机的CSS视口/DPR未从设备直接读到，不能仅由像素尺寸假装已证实。

受控对比用相同 CSS393×665 / DPR3：旧版 Canvas393×665，新版983×1663。实际 Canvas CSS边界、世界尺寸、文字纹理和二次缩放由测量脚本记录。“1号盘 · 递出”文字纹理从99×23/16px/1x变为277×69/18px/2.5x；实际CSS命中最小44px、visualViewport.scale=1、Canvas CSS transform=none。DPR3合成到屏幕仍有约1.2倍的预算内缩放，不宣称全3倍原生缓冲。高画质倍率上限2.5、240万像素预算；低画质1.25/100万预算，手动选择并保存。输入/DOM/相机统一 CSS 像素，背景按比例 cover。Pad 横竖屏重新布局。不是实体 iPhone 验证，也不声称所有设备2.5倍渲染。

音频四层：16秒轻背景、8秒合成户外氛围、英语单前景、机器/操作短声；来源与9种过程/反馈声见 [合成声音记录](../art/audio-synthesis.json)。英语压低音乐和机器，按下即时轻声、真实提交后成功声；PROCESSING循环严格随前景任务，暂停/后台/重开/离场停，恢复不补旧奖励。主静音及英语/音乐/环境/音效开关保存，拒播有重听/图示帮助。Samantha WAV 未听审、分发权未确认；音频事件只证明浏览器事件，完整录像没有音轨。

已消除每帧全世界 structuredClone、JSON签名、整场重建；advance共享食品/证据引用，仅复制小型时钟分支。存储只在离散操作、2秒检查点和生命周期刷盘，语音事件不独立同步写盘。生产 HTTP 新上下文实测：首屏可操作1436ms，传输2,526,948字节；14次触控到第二个rAF的代理延迟p95=59.6ms，159个操作段帧间隔p95=50.1ms、max=83.3ms。不是显示延迟/INP，不证明60fps或真机性能；不把历史1x数据与新DPR数据相减宣称FPS提升。

## 本轮验证与交付

最终生产代码、完整回归、尺寸量测、完整录像、操作段性能及退出码见 [证据索引](evidence/m1-upgrade/README.md)。构建保留 Phaser >500KB 分块提示，不隐藏警告。无实体设备、教研或儿童参与的证据。已实际查看三条核心完整录像的全部0.5秒抽帧：低龄26.48s/53帧、双单28.24s/57帧、Pad15.64s/32帧。这个142帧的覆盖仅是agent视觉复查，不是人工接受或听审。

修复过程保留：第一整套16/17（引导果汁6秒墙钟上限，保持精确5秒有效时钟规则，调整浏览器有界等待为10秒）；第二整套15/17抓到连续点击被在途食品截获，修复共同输入目标解释并保留满盘断言；随后4条定向回归全部通过。原始失败日志在证据目录，不删除断言换PASS。

| 完成维度 | 当前结论 |
| --- | --- |
| 本轮工程与本地生产构建 | IMPLEMENTED / VERIFIED：28/28规则、17/17浏览器，以及typecheck/lint/build/resources退出0 |
| 视觉与手感 | AWAITING_OWNER_REVIEW，用户选参考不是对运行效果的批准 |
| 实体 iPhone / Android / iPad | NOT_RUN，无设备控制或实测记录 |
| 教研、正式语音听审 | NOT_RUN，内容候选 PENDING |
| 儿童观察 | NOT_RUN，无儿童样本，不以自动化代替 |
| 资源与声音权利 | PENDING_OWNER_AND_RIGHTS_REVIEW；系统TTS未核实商业分发权 |
| 本轮部署 | PENDING_DEPLOYMENT，未获得本轮发布授权 |
| 公开发布准备 | BLOCKED，仍缺负责人运行接受、权利/内容/实体设备验收及部署授权 |

既有站点：[tabby-english-food-truck](https://tabby-english-food-truck.yuan576264675.chatgpt.site/)。未登录 Chromium 正常首页 HTTP200；旧站点 script 为 `index-DD0KRite.js`，未显示 build SHA，版本 **UNKNOWN**。这是读取旧站点的证据，不是本轮通过；没有另建第二站点。本地生产预览仅供当前机器审阅，不冒充公网试玩。

## 历史记录（本轮不继承 PASS）

更新：2026-09-20。范围：M0/M1 独立实现及负责人授权的不测试 Git 同步；未进入 M2，未部署。

## 身份与来源

- 仓库：yuan2go/tabby-english-food-truck，默认分支 main。
- baseline：`85585137e82bd24e3c3e4d61a972243dbaa683d5`，开工 fetch 后最新 origin/main，初始 git status 干净。
- PR #1 已合并；文档分支 docs/product-design-v0-1 的 head 为 `558e1521ffa2829a003fcaf099ddeb0e0693c359`。
- 实现分支：`codex/m0-m1-food-truck`，独立 worktree。完整最终提交身份以本轮交付报告及 PR head 为准，不在提交内部猜写自身 SHA。
- 已推送并建立 [PR #2](https://github.com/yuan2go/tabby-english-food-truck/pull/2)；PR #1 已合并为基线，不存在未合并的文档依赖。负责人现已明确授权不测试、推送所有本地分支并将 PR 合并到 main，替代此前保持草稿的安排；合并结果与完整 SHA 以 PR 和本次交付报告为准。该授权不改变下列制作、审核与发布状态。
- 完整阅读 README、AGENTS、STATUS、01–05。有效未来设计保留，只更新真实状态与实施细节。未读取、复制或导入旧仓库。

## 当前可玩行为

正式首页进入 Phaser 同屏餐车。两位并发客人、两只三槽托盘、苹果/香蕉/空杯、5 秒苹果汁配方、2 秒真实便签取料、原子预留、整盘集合匹配、错误保留、放回/确认清理、暂停/重玩/继续/导出。串行和交错都从正常首页实际操作完成；交错用例断言水果交付时果汁机仍在加工。没有一键配餐、限时惩罚或通关状态注入。

React 只承担启动、必要教学/便签、暂停和语义 DOM。规则独立于 Phaser/React，输入调用同一命令；任务由单一未平滑的有效游戏时钟完成。字幕只显示显式求助的客人，教学示范、错误解释、文字支持和音频事件分别保留。没有正式能力评分。

新图片独立生成并接入：餐车背景、食物/杯盘/机器、兔子与刺猬三个姿态。食品移动、加工填充、递盘/接物/回盘按状态与游戏时间表现。新资产、实际尺寸/hash/Alpha/来源及审核见 [资产记录](../art/README.md) 和 [清单](../art/manifest.json)。

## 制作阻塞与完成口径

| 维度 | 状态 | 依据与限制 |
| --- | --- | --- |
| M0 工程基础 | IMPLEMENTED / VERIFIED | 真实固定依赖与锁文件，安装/类型/规范/规则/构建/HTTP/资源入口存在并运行 |
| M0 制作基线完整性 | BLOCKED | 缺获准狸花猫参考 |
| M1 双订单可玩逻辑 | IMPLEMENTED / VERIFIED | 正常首页、Canvas 指针交错与 Pad 键盘串行完整路径 |
| M1 高完成度整包 | BLOCKED，不能标完成 | 猫角色与连续姿态尚未制作，不以待确认标记冒充正式美术 |
| ENGINEERING_READY（完整首包） | NOT_MET | M2/T07/第二设备不在本轮范围；本轮可运行工程另列 |
| VISUAL_ACCEPTED / 手感 | AWAITING_OWNER_REVIEW | 已有真实画面与录像，尚无负责人反馈；角色本身仍受阻塞 |
| DEVICE_VALIDATED | NOT_RUN | 仅 Chromium 桌面/模拟手机/Pad，无实体 iPhone/Android/iPad |
| CONTENT_REVIEWED | PENDING | 本地 Samantha 开发 TTS 未听审；词句、图像指代与可接受表达未教研签审 |
| FUN_OBSERVED | NOT_RUN | 未做儿童观察，不以 agent 操作替代 |
| PUBLIC_RELEASE_READY | BLOCKED | 角色、素材/声音权利、内容与真机未验收；未授权部署 |

**具体阻塞**：03 §7 要求先取得获准参考。新仓库没有图片参考，本轮已向负责人索取绝对路径/链接及本项目制作许可，尚未收到。没有读取旧角色资产、生成未经认可的新猫或用静态贴图冒充动作。收到后需完成待机、读便签、取料、携带、递交与反应，逐姿态核验棕灰虎斑、金眼、浅口鼻、灰项圈、绿围巾、背包、画面颈部偏右白色定位器，再重新录制双路径供审核。

## 本次 Git 同步（不测试）

初始核对共 2 个本地分支、2 个工作区，均无未提交修改，同名远端 SHA 一致。main 基线为 `85585137e82bd24e3c3e4d61a972243dbaa683d5`；实现分支初始 head 为 `c2b461a44300894477a5df303fcc00457a61e22c`，有 6 个已推送、尚未进入 main 的提交。复用 PR #2，本次仅补充本状态记录，不改变运行代码。

按负责人明确要求，本次单元测试、浏览器测试、类型检查、lint、构建、资源检查与性能采样均为 NOT_RUN，退出码不适用；提交及推送跳过 Git hooks。Git/PR 状态回读属于仓库同步核对，不是游戏验收。仓库当前没有配置 GitHub Actions 工作流，不启用工作流或修改权限。

下面的测试、浏览器路径、截图、录像与性能数据均为此前实现阶段记录，本次未重跑或重新确认，不作为合并后新增的验证证据。

## 历史实现验证（本次未重跑）

实装代码检查身份：`0188720efcacea481d92398c6bf84c0420dcf6bc`。全套浏览器 11/11 在 fc74b84e47f3a4da9ecaef98a31e1fedda39de39 通过；随后只调整短横屏布局、Pad 食物比例与指针焦点，受影响三路径在该实装身份重新通过。Pad 录像单独提高到 1024×1024 再录制，未改变游戏行为。

| 实际命令 | 退出码 | 结果 |
| --- | --- | --- |
| `npm ci` | 0 | 从真实锁文件安装 64 个包；Node 26.3.1/npm 11.16.0 |
| `npm run typecheck` | 0 | strict、noUncheckedIndexedAccess、exactOptionalPropertyTypes |
| `npm run lint` | 0 | Biome，未删除失败断言 |
| `npm test` | 0 | 19 个规则/语言/快照/时钟用例 |
| `npm run build` | 0 | Vite 生产 dist；Phaser 大分块提示保留 |
| `npm run resources` | 0 | 24 文件 hash/字节/尺寸/Alpha/资源注册表 |
| `npm run test:browser` | 0 | 11/11，真实生产 HTTP 入口，含独立原生 Chromium 生命周期驱动 |
| `npm run test:browser -- --grep 'phone Canvas\|Pad serial\|true touch placement'` | 0 | 最后布局修正的 3/3 回归 |
| `npm run test:browser -- --grep 'Pad serial'` | 0 | 1024×1024 录像配置下完整串行路径再次通过 |
| `npm audit` | 0 | 0 个已知漏洞 |
| `node scripts/performance.mjs` | 0 | 当前生产预览 4180 上实际操作采样 |
| `node scripts/review-videos.mjs` | 0 | 两条录像全时段 0.5 秒逐段抽帧，agent 实际查看 |

`npm ci` 提示 esbuild/fsevents 安装脚本的 npm 审批元数据未登记；安装与构建已成功。本任务没有设置全局允许脚本或改权限。

## 实际证据与性能

- [手机交错截图](evidence/phone-interleaved.png)、[手机完整录像](evidence/phone-interleaved.webm)：先由便签备苹果，再加工；机器工作中先递出水果盘，后交果汁。
- [Pad 竖屏](evidence/pad-portrait.png)、[Pad 横屏](evidence/pad-landscape.png)、[Pad 串行完整录像](evidence/pad-serial.webm)：键盘先做完并交付果汁，再准备水果；中途旋转，世界不变。
- [360×640 恢复](evidence/small-phone-recovery.png)、[844×390 触控横屏](evidence/phone-landscape-touch.png)、[场内收尾](evidence/phone-ending.png)。
- [原生生命周期事件](evidence/native-lifecycle.json)：真实 hidden/freeze/resume/visible，冻结 1800ms，助手与机器仅各消耗恢复前后约 83ms 的有效时间。不能把默认 Playwright 强制焦点页面当已冻结。
- [性能原始样本](evidence/performance.json)：本地生产 HTTP、新浏览器上下文、无网络/CPU 限速，首屏可开始约 997ms；实际载入传输 1,120,505 字节。15 次操作到第二个 rAF 的代理延迟 p95 54.1ms；操作段 124 帧，帧间隔 p95 50ms。**不是直接显示延迟/INP，不证明 60fps，也不代表真机/公网。**

已实际查看手机、Pad、短横屏截图，并对两条完整录像按 0.5 秒覆盖全时段复查。修复了焦点覆盖、短横屏原料遮挡和 Pad 食品比例；便签食品轨迹、苹果入机/加工、递盘/接物/空盘回来可观察。仍明确缺猫的连续姿态。录像无音轨，未伪称听过正式录音；音频启动/中断/失败证据与本地 WAV 单列。

| 05 验收 | 当前覆盖 |
| --- | --- |
| T01 | 规则：配方输入输出、同杯、单归属、三槽容量、预留、重复命令和取消 |
| T02 | 规则与浏览器：机器、助手、暂停/恢复、剩余时间与丢弃大 delta；冻结恢复单列记录 |
| T03 | 集合匹配、顺序无关、多/少/错误商品、重复交付、不自动转交 |
| T04 | 独立词块 ID、a/an/one/two/and、单复数、大小写标点、incomplete/outside/world-blocked |
| T05 | 自动示范支持、显式文字支持、错后重试、刷新保留、切客人不偷显示新答案、开发音频事件 |
| T06 | 正常入口 Canvas 指针交错与 Pad 键盘串行完整通关 |
| T07 | NOT_RUN / DEFERRED：M2 三场次、回访、拼写未实现 |
| T08 | 满盘、预留、撤回、放回与果汁确认清理；第二设备 READY 明确 DEFERRED |
| T09 | 360×640、390×844、768×1024、1024×768、844×390；Canvas 鼠标、真实合成 touch、touchCancel、多指、旋转、键盘焦点、低动态。辅助技术真人走查 NOT_RUN |
| T10 | 加工/助手中刷新、重复快照、损坏/未来版本、拒绝存储、导出、重开支持保留 |
| T11 | 实际尺寸/字节/hash/Alpha，正常入口资源请求、失败重试保留世界，本地英语单通道与失败文字支持；听审仍 PENDING |
| T12 | 本轮实际截图与录像检查，不等于负责人视觉接受；猫动作部分 BLOCKED |

## 环境与限制

macOS 26.5.2 (25F84)、arm64。开工 Node 22.22.2/npm 10.9.7；本轮系统环境随后变为 Homebrew Node 26.3.1/npm 11.16.0，最终检查用后者。本任务没有修改系统 Node。Phaser 3.90.0、Vite 7.3.6、React 19.1.1、TypeScript 5.9.3、Vitest 4.1.11、Playwright 1.63.0；浏览器为随 Playwright 安装的 Chromium。

视频为 Playwright 的屏幕录像，不包含浏览器音轨；本地音频文件与播放事件另有记录，未冒充听审。localhost 不是公网试玩。构建保留 Phaser 分块 >500kB 的提示，不隐藏警告；实际压缩体积与操作性能另采样。此前实现阶段没有启用 GitHub Actions、修改权限、合并 PR 或部署；后续授权合并见本次 Git 同步记录。

历史文档交付：首次初始化 4639140d9dc75cdaa7140c9f9bdeda56ee5c2d84；当时确实只有文档且所有实现检查 NOT_RUN。这段历史不作为当前通过证据。
