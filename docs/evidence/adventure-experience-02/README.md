# WP-ADVENTURE-EXPERIENCE-02 实际证据

状态：生产浏览器验证进行中；本页随实际结果更新，不代表儿童或负责人验收。

基线 `64f03fc716de70e20f64f9bbc3802de7601a460f`；分支 `codex/wp-adventure-experience-02`。原工作区 `codex/player-review-2026-10-11` 的未跟踪 `docs/playtests/` 保留，原HEAD未改。文档治理独立提交 `260b1f8`，随后进入产品实现；历史正文与索引见 `docs/archive/pre-adventure-experience-02/`。

环境：macOS 26.6.2 / 25G83 / arm64，Node v24.15.0，npm 11.12.1，锁定 Playwright 1.63.0 的 Chromium。没有升级依赖、导入旧仓库、设置运行时AI或后台。

## 实际运行身份与检查

已核验干净生产构建 `a8d945ab6786a9aee6eaed114dbea8d20a7da792`，content `adventure-experience-2`，资源清单SHA-256 `a7f1f7f13f1921ca797c5e691d78de3cf45a7e1ef8bb8a1fe9bd70099aafb501`；页面读回见 [build-probe.json](build-probe.json)。浏览器实际路径 `http://127.0.0.1:4191/`，默认画质与声音开启，未使用CI预置的省电状态。

| 命令 | 实际结果 | 日志 |
| --- | --- | --- |
| `npm test` | exit 0；18文件、258测试通过 | [unit](unit.log) |
| `npm run build`（内含typecheck） | exit 0；保留Phaser/入口大于500kB的分块提示 | [build](build.log) |
| `npm run lint` | exit 0；67 warnings / 7 infos，未冒称清零 | [lint](lint.log) |
| `npm run resources` | exit 0；387真实文件hash/尺寸/Alpha，236语音引用、50食品映射 | [resources](resources.log) |
| `git diff --check` | exit 0 | 本地实际运行 |
| `TEST_PORT=4191 npx playwright test e2e/adventure.spec.ts e2e/experience.spec.ts` | a8d945a：exit 1，6/8通过；五章、另一野餐分支、键鼠恢复、客流、拒播和静音通过，另两条复查中 | [浏览器原始日志](browser-a8d945a.log) |

从可见首页进入，点击/触控/键盘执行正常命令；只读保存状态用于食品、请求、奖励与恢复核对，没有注入通关、任务、食品或奖励。音频故障通过中止WAV网络请求模拟。桌面1280×720、手机393×665为模拟视口；另有鼠标和键盘实际入口路径。

## 行为与责任

- 故事默认单客，由玩家迎入朋友；双客可选，切换保留已接请求与食品，分支只由首次真实接收决定。
- 图示与情境语音覆盖目标、缺项、可操作对象和具体受阻恢复。较少帮助隐藏严格订单食品；静音/失败时出现图示并保留辅助记录。
- 花苗和水壶实际取用/种植/浇水；两份甜点比较与彩旗遮阴分享；篮内内容和缺位、餐垫分餐、搬杯/搬灯协作；实际邀请与回访类别分享。
- 食品与使用者来自真实接收收据，连续演出独立于结算。跳过、重播、低动态不消费或发奖；旧档补空体验字段，已有完成奖励不重锁。
- 自由制作、换位、品尝、保存真实位置/使用者、回看、重新制作和自然收摊贯通。清桌释放分享引用，保留作品、已接请求与奖励。

规则分布于 `rules/adventure.ts` 和 `rules/adventure-experience.ts`；引导为只读投影 `rules/adventure-guidance.ts`；对象、图示、食品、分享牌、作品与演出分别由独立组件负责，App只接入口。未建立新框架或重复订单判定。

## 失败与复核

第一候选 `055219d0558eec105e6e990f0001470f7971c4c4` 的生产浏览器为6/8通过、exit 1：[原始日志](failures/browser-055219d.log)。桌面五章到第五章时触发300秒测试总时限，画面已做好两份食品；第二候选采用420秒并实际完整通过6.7分钟五章；为最终画面复核保留480秒余量，全部规则断言保留。[失败画面](failures/five-chapter-time-limit.png)。手机旧食谱入口被小游戏挡住为真实布局缺陷，现已修正并实际点开；[失败画面](failures/covered-home-book.png)、[上下文](failures/covered-home-book-context.md)。

a8d945a第二候选为6/8、exit 1：自由全流程90秒总时限到达，已有实际品尝、回看及恢复；最终改用150秒并复查，不据超时推断产品通过。菜单客流用例因正常语音完成把heard从false改为true导致完整对象比较失败；改为通过可见按钮实际重听并等待真实完成后再取完整基线，不删除或放宽原对象相等断言。[自由超时上下文](failures/free-run-time-limit-context.md)、[正常播放差异](failures/order-audio-completion-context.md)。

`failures/*-red.log` 是缺陷补回归时的真实失败：客流/身份、容量恢复、收据使用者、已品尝食品不能重复分享、彩旗真实摆放、已完成章清桌、排队后辅助记录与同场回访记忆。另保留资源登记ID遗漏及严格可选属性类型失败；之后分别修正，没有删除断言或降低规则。

一次只读独立复查提出四项Important：迎入时帮助遗漏、同场回访记忆滞后、清桌分享引用未释放、具体受阻恢复不足。修复并定向验证后，复查到 `a8d945a` 四项均关闭；其中兔兔误指不可见抽屉的恢复提示也已改为真实篮子路径。复查未发现其他实质问题；不把代码复核当浏览器、儿童或负责人通过。

## 外部验收边界

负责人手感 PENDING；实体iPhone 15 Pro＋Chrome新构建 NOT_RUN，历史 NEEDS_REVISION 保留；儿童观察/教研/人工听审 NOT_RUN；素材和开发声音分发权 PENDING；性能新构建 NOT_RUN，历史60fps NOT_MET保留。40条开发TTS明确 DEVELOPMENT_TTS_UNREVIEWED；播放事件和无音轨视频不证明听审或儿童理解。

本包不合并、不部署、不强推、不更改权限或工作流。历史网站不代表本包运行结果；托管CI另列实际状态。

## 启动

在本分支工作区运行 `npm ci`、`npm run dev`，打开终端给出的本地HTTP地址；生产版运行 `npm run build` 后 `npm run preview -- --port 4191 --strictPort`。不要双击index.html。源码链接不是可玩网址。
