# 项目状态

更新：2026-09-20。范围：M0/M1 独立实现；未进入 M2，未部署。

## 身份与来源

- 仓库：yuan2go/tabby-english-food-truck，默认分支 main。
- baseline：`85585137e82bd24e3c3e4d61a972243dbaa683d5`，开工 fetch 后最新 origin/main，初始 git status 干净。
- PR #1 已合并；文档分支 docs/product-design-v0-1 的 head 为 `558e1521ffa2829a003fcaf099ddeb0e0693c359`。
- 实现分支：`codex/m0-m1-food-truck`，独立 worktree。完整最终提交身份以本轮交付报告及 PR head 为准，不在提交内部猜写自身 SHA。
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

## 验证

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

视频为 Playwright 的屏幕录像，不包含浏览器音轨；本地音频文件与播放事件另有记录，未冒充听审。localhost 不是公网试玩。构建保留 Phaser 分块 >500kB 的提示，不隐藏警告；实际压缩体积与操作性能另采样。没有启用 GitHub Actions、修改权限、合并 PR 或部署。

历史文档交付：首次初始化 4639140d9dc75cdaa7140c9f9bdeda56ee5c2d84；当时确实只有文档且所有实现检查 NOT_RUN。这段历史不作为当前通过证据。
