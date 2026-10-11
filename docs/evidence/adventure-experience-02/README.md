# WP-ADVENTURE-EXPERIENCE-02 实际证据

状态：CODE_IMPLEMENTED / ENGINEERING_VERIFIED / EXTERNAL_ACCEPTANCE_PENDING。本包相关检查与正常入口路径已取得实际通过结果；下表按构建来源分列，不代表儿童或负责人验收。

基线 `64f03fc716de70e20f64f9bbc3802de7601a460f`；分支 `codex/wp-adventure-experience-02`。原工作区 `codex/player-review-2026-10-11` 的未跟踪 `docs/playtests/` 保留，原HEAD未改。文档治理独立提交 `260b1f82ef918a260ba11d4bfa7747690385fd2a`，随后进入产品实现；历史正文与索引见 [归档](../../archive/pre-adventure-experience-02/index.md)。收尾还修复更早两批归档的98处失效相对链接，没有删改原证据或历史验收结论。

环境：macOS 26.6.2 / 25G83 / arm64，Node v24.15.0，npm 11.12.1，锁定 Playwright 1.63.0 的 Chromium。没有升级依赖、导入旧仓库、设置运行时AI或后台。

## 实际运行身份与检查

已核验最终干净生产构建 `ab7978f16f1d27f3baf155c834666f225576cad4`，content `adventure-experience-2`，资源清单SHA-256 `a7f1f7f13f1921ca797c5e691d78de3cf45a7e1ef8bb8a1fe9bd70099aafb501`；页面实际读回 dirty=false、无pageerror，见 [build-probe-ab7978f.json](build-probe-ab7978f.json)。浏览器实际路径 `http://127.0.0.1:4191/`，默认画质与声音开启，未使用CI预置的省电状态。最新复查使用完整 Chromium 153.0.8010.12 headless（CHROMIUM_CHANNEL=chromium）；此前同版headless shell的实际结果保留。此后的交付提交仅文档和证据，最终Git full SHA以PR实际head与交付回读为准；没有为文档变动重复构建或冒称新构建。

| 命令 | 实际结果 | 日志 |
| --- | --- | --- |
| `npm test` | a8d945a：exit 0；18文件、258测试通过；之后规则/内容/存档/音频平台未变，已核对diff | [unit](unit.log) |
| `npm run build`（内含typecheck） | ab7978f：exit 0；104模块，15.71s；入口549.56kB/Phaser1208.05kB，保留分块提示 | [build](build-ab7978f.log) |
| `npm run lint` | ab7978f：exit 0；66 warnings / 7 infos，未冒称清零 | [lint](lint-ab7978f.log) |
| `npm run resources` | exit 0；387真实文件hash/尺寸/Alpha，236语音引用、50食品映射；此后资源及登记未变 | [resources](resources.log) |
| `git diff --check`、本地Markdown相对链接核对 | exit 0；链接数量见日志 | [文档和身份核对](delivery-checks.log) |
| `TEST_PORT=4191 npx playwright test e2e/adventure.spec.ts e2e/experience.spec.ts` | a8d945a：exit 1，6/8通过；完整原始成功/失败保留 | [浏览器原始日志](browser-a8d945a.log) |
| `TEST_PORT=4191 npx playwright test e2e/adventure.spec.ts --grep 'free shop stops'` | db5ef12：exit 0，1/1完整自由路径通过，2.0m | [自由路径](free-db5ef12.log) |
| `CHROMIUM_CHANNEL=chromium TEST_PORT=4191 npx playwright test e2e/adventure.spec.ts --grep 'visible activity entrance\|opening a new seat'` | 7cafefb：exit 1，1/2；五章完整通过4.8m，菜单暴露真实覆盖缺陷 | [五章及修正前结果](browser-7cafefb.log) |
| `CHROMIUM_CHANNEL=chromium TEST_PORT=4191 npx playwright test e2e/adventure.spec.ts --grep 'desktop feast exposes\|opening a new seat'` | ab7978f：exit 0，2/2，1.3m；朋友操作51.6s、完整旧请求23.3s | [最终定向复核](browser-ab7978f.log) |

| 相关正常入口路径 | 实际构建 / 结果 |
| --- | --- |
| 桌面完整五章、两份食品连续使用、作品保存/刷新/重玩 | 7cafefb PASS，4.8m；保留a8d945a历史PASS |
| 手机先接刺刺的野餐另一分支，真实两份分餐、等价奖励 | a8d945a PASS |
| 手机三位朋友/第三位分页/工具取用/旋转/占位恢复/真实品尝/作品回看/清桌/自然收摊 | db5ef12 PASS |
| 桌面鼠标与键盘、错单留食品、暂停加工/刷新 | a8d945a PASS |
| 新菜单和双客补位，完整旧请求保持；手机请求重听可达 | ab7978f PASS，23.3s；修正前失败保留 |
| 桌面朋友连续使用两份食品、真实制作苹果汁并饮用；重播/跳过/低动态可达且不重复结算 | ab7978f PASS，51.6s；修正前真实失败回归保留 |
| 单客主动选刺刺、切双客再切单客不丢食品/已接请求 | a8d945a PASS |
| 较少帮助无严格答案，拒播后图示补救且记录辅助 | a8d945a PASS |
| 可见设置静音，图示目标与安全重听 | a8d945a PASS |

上述9条相关路径按实际来源分批通过，没有把它们写成最终构建一次9/9的全套。db5ef12之后规则/内容/存档/资源未变，表现修正为品尝反馈、放杯朝向、演出忙帧时钟；7cafefb五章完整复核通过。7cafefb到ab7978f仅厨房引导移至顶栏、桌面演出布局及对应风险回归；最终在手机请求和桌面朋友操作上复核。默认另8条未改的浏览器门禁本机 NOT_RUN，托管CI单独读回。当前用例清单为[17条/7文件](browser-list.log)。

7cafefb定向复查exit 1，1/2：五章完整通过，菜单用例揭示厨房紧凑引导覆盖请求气泡，保留[失败上下文](failures/covered-request-context.md)与[画面](failures/covered-request.png)。截图还揭示桌面演出控制被容器裁掉，[画面](failures/clipped-desktop-controls.png)；新增回归修正前exit1，实际按钮可视比例仅0.136，见[日志](failures/desktop-controls-red.log)。保留完整阶段、食品守恒与旧请求相等断言，修为顶栏引导和独立桌面控制行；ab7978f两条实际通过，不以完整五章通过掩盖局部输入缺陷。

从可见首页进入，点击/触控/键盘执行正常命令；只读保存状态用于食品、请求、奖励与恢复核对，没有注入通关、任务、食品或奖励。音频故障通过中止WAV网络请求模拟。桌面1280×720、手机393×665为模拟视口；另有鼠标和键盘实际入口路径。

## 少量关键画面与连续录像

最终ab7978f：两份水果分别进入朋友接餐、携带、摆放、品尝、回应；随后从厨房真实制作苹果汁、摆放并品尝。以下短录像取自同一次正常入口操作，保持原速，仅去除录屏下方灰色填充并缩至960×540；没有音轨，不能证明人工听审。原片位置、字节/hash、裁段区间和所有证据hash见[manifest](manifest.json)。

- [两位朋友连续使用两份食品，12.8秒](friends-two-foods.webm)
- [兔兔实际喝苹果汁，8秒](friend-sips-juice.webm)
- [最终桌面操作完整可见](desktop-friend-controls.png)、[最终饮用与回应](drink-use-desktop.png)
- [手机三位朋友与取出的工具](three-friends-tools-phone.png)、[手机占位后的实际恢复](occupied-recovery-phone.png)、[另一野餐路线](picnic-hedgehog-phone.png)

手机图来自db5ef12/野餐图来自a8d945a，来源逐项列在manifest。其他旧截图和失败画面完整保留；旧饮用杯朝向及裁切画面不作为最终表现证明。

## 行为与责任

- 故事默认单客，由玩家迎入朋友；双客可选，切换保留已接请求与食品，分支只由首次真实接收决定。
- 图示与情境语音覆盖目标、缺项、可操作对象和具体受阻恢复。较少帮助隐藏严格订单食品；静音/失败时出现图示并保留辅助记录。
- 花苗和水壶实际取用/种植/浇水；两份甜点比较与彩旗遮阴分享；篮内内容和缺位、餐垫分餐、搬杯/搬灯协作；实际邀请与回访类别分享。
- 食品与使用者来自真实接收收据，连续演出独立于结算。跳过、重播、低动态不消费或发奖；旧档补空体验字段，已有完成奖励不重锁。
- 自由制作、换位、品尝、保存真实位置/使用者、回看、重新制作和自然收摊贯通。清桌释放分享引用，保留作品、已接请求与奖励。

规则分布于 `rules/adventure.ts` 和 `rules/adventure-experience.ts`；引导为只读投影 `rules/adventure-guidance.ts`；对象、图示、食品、分享牌、作品与演出分别由独立组件负责，App只接入口。未建立新框架或重复订单判定。

## 失败与复核

第一候选 `055219d0558eec105e6e990f0001470f7971c4c4` 的生产浏览器为6/8通过、exit 1：[原始日志](failures/browser-055219d.log)。桌面五章到第五章时触发300秒测试总时限，画面已做好两份食品；第二候选采用420秒并实际完整通过6.7分钟五章；为最终画面复核保留480秒余量，全部规则断言保留。[失败画面](failures/five-chapter-time-limit.png)。手机旧食谱入口被小游戏挡住为真实布局缺陷，现已修正并实际点开；[失败画面](failures/covered-home-book.png)、[上下文](failures/covered-home-book-context.md)。

手机截图还暴露邀请区撑宽场景、朋友演出部分出屏的真实布局缺陷：[原始画面](failures/phone-scene-overflow.png)。邀请与分享改用同一完整宽度行、网格允许收缩；最终用实际品尝及全区域视口断言复核。f531590的复查因这一发现主动中止，exit130，1 interrupted / 2 NOT_RUN，[中止日志](failures/browser-f531590-interrupted.log)，不记为通过。

a8d945a第二候选为6/8、exit 1：自由全流程90秒总时限到达，已有实际品尝、回看及恢复；改用150秒后db5ef12完整通过，不据超时推断产品通过。菜单客流用例因正常语音完成把heard从false改为true导致完整对象比较失败；改为通过可见按钮实际重听并等待真实完成后再取完整基线，不删除或放宽原对象相等断言。[自由超时上下文](failures/free-run-time-limit-context.md)、[正常播放差异](failures/order-audio-completion-context.md)。

0243361演出复查exit 1，0/2：忙帧下演出每次只保留120ms造成携带阶段过慢，原阶段断言保留，修为每次保留至一个960ms阶段；规则结算未变。菜单用例在可见首页点击时超过12秒，完整 Chromium 实际正常进入，最新复查明确浏览器与30秒操作等待。长五章用900秒总预算，阶段15秒等待，全部五阶段、第二份食品、守恒和完整旧请求断言仍在。[日志](failures/browser-0243361.log)、[时钟失败](failures/slow-visual-clock-context.md)、[首页超时](failures/busy-home-context.md)。文档补正期间的cb44b1d构建dirty=true，身份检查退出1，未用于最终复查；[读回](failures/build-probe-dirty-cb44b1d.json)。重新干净构建7cafefb并实际读回dirty=false。

`failures/*-red.log` 是缺陷补回归时的真实失败：客流/身份、容量恢复、收据使用者、已品尝食品不能重复分享、彩旗真实摆放、已完成章清桌、排队后辅助记录与同场回访记忆。另保留资源登记ID遗漏及严格可选属性类型失败；之后分别修正，没有删除断言或降低规则。

一次只读独立复查提出四项Important：迎入时帮助遗漏、同场回访记忆滞后、清桌分享引用未释放、具体受阻恢复不足。修复并定向验证后，复查到 `a8d945a` 四项均关闭；其中兔兔误指不可见抽屉的恢复提示也已改为真实篮子路径。复查未发现其他实质问题；不把代码复核当浏览器、儿童或负责人通过。

## 外部验收边界

负责人手感 PENDING；实体iPhone 15 Pro＋Chrome新构建 NOT_RUN，历史 NEEDS_REVISION 保留；儿童观察/教研/人工听审 NOT_RUN；素材和开发声音分发权 PENDING；性能新构建 NOT_RUN，历史60fps NOT_MET保留。40条开发TTS明确 DEVELOPMENT_TTS_UNREVIEWED；播放事件和无音轨视频不证明听审或儿童理解。

本包不合并、不部署、不强推、不更改权限或工作流。历史网站不代表本包运行结果；托管CI另列实际状态。

## 启动

在本分支工作区运行 `npm ci`、`npm run dev`，打开终端给出的本地HTTP地址；生产版运行 `npm run build` 后 `npm run preview -- --port 4191 --strictPort`。不要双击index.html。源码链接不是可玩网址。
