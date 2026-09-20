# M2 真实证据索引

本轮40条规则、17条HTTP浏览器路径通过；完整状态以 [STATUS](../../STATUS.md) 为准。此前 M1 PASS 不继承。[打开录像播放器](review.html)。最终正式全流程基于 `36cb8e6ae05759f47de04a6649cbcc273175e182` / dirty=false / content m2.0 / manifest SHA-256 `72bafdb32b5dc6af44260d1b3d8ccbe9f1fbe52d944fc8a744679641b9664bef`。

## 实际路径

- [手机完整故事](phone-story.webm)：393×665、DPR3、真实合成触控；正式首页、可跳过序章入口、4章与小食会18单，全部点按。包含盖合/煎制中暂停刷新和从首页继续。序章三拍完整播放在 Pad 路径。
- [Pad 序章与加工恢复](pad-processing.webm)：1024×768→768×1024→1024×768，从长辈交接到果汁加工中刷新，等待、接取、交付。
- [教学退出与连续动作](actor-continuity.webm)、[助手和送餐重叠](helper-overlap.webm)：教学退出、新动作、读档、撤回与暂停/旋转；rAF 中间点检查，非只核对最终坐标。
- [无尽八轮与继续](endless.webm)、[教学五单](training.webm)、[配对四题](match.webm)、[WordSpell四题](wordspell.webm)。字母包含真实触控拖入/拖回、点按、重复字母ID、帮助与刷新、结算/重玩/返回。
- [成长首页](grown-yard.png)、[Pad横屏](pad-landscape-after.png)、[Pad竖屏](pad-portrait-collected.png)、[配对反馈](match-feedback.png)、[拼写反馈](spell-feedback.png)。

正常路径没有写入通关存档或调用规则后门。故障用例明确注入未来版本坏档和资源/语音失败；测试读取状态用于断言，不把预置成绩当完成。

## 动作与操作修复对照

| 已确认反馈 / 实际失败 | M2处理 | 证据边界 |
| --- | --- | --- |
| HELP/RETURN固定短时长、教学/交付争抢位置 | 同一距离/阶段计划、当前位置衔接、有界任务队列；接收阶段转移库存 | 规则回归与连续 rAF、录像；非骨骼动画，手感仍待负责人 |
| 拿取再放置繁琐、客人点击含义变动 | 先选备餐位→点食材；独立重听与明确目标送餐 | 完整手机点击18单，错误交付保留物品；不自动选择正确客人 |
| 误触 / 双击与拖动冲突 | 首次立即选中，同实体双击退原料、就近放回；清成品确认且可恢复 | 多指/取消/重复提交/整盘拖放/键盘，操作失败不记英语错 |
| 暂停混杂 | 继续、声音、帮助、首页；详细设置和学习观察二级 | 暂停/返回/刷新继续路径 |
| 冰淇淋缺杯、组合板被已放面包截获、Pad果汁按钮与盘重叠 | 补真实杯供应、显式备餐目标也执行落料、机器位置调整 | 真实失败日志保留，后续完整路径通过 |
| 成长桌布压住首页文字 | 移到场景空位，入口位于装饰上层 | [修整前](before-final-polish/grown-yard.png) → [修整后](grown-yard.png) |
| 支持策略切换使旧复杂订单无法保存且继续补双客 | 已有订单按已介绍内容校验；后续按新策略收敛人数 | support-policy-before/after 日志，[完整策略切换路径](support-policy.webm) |

[修整前完整复查](before-final-polish/README.md)保留 `67b9197…` 原录像与抽帧；与 e5dca120 之间游戏 TypeScript 无变化，仅首页装饰CSS调整。最终目录使用36cb8e6完整重跑录像；e5dca120完整原件保留于Git历史，前一次性能/动作JSON另存pre-final-verification。历史 M1 录像/负责人手机截图仍在原目录，不修改为 M2证据。

## 性能与加载

环境：macOS26.5.2 arm64，Node26.3.1/npm11.16.0，Playwright1.63.0 Chromium headless，启用录屏、无CPU/网络限速。是桌面执行环境上的模拟触控/DPR，**不是实体手机或 Safari**。

[完整操作原始数据](operation-performance.json)。Canvas 983×1663、CSS393×665、渲染倍率2.5，仍有DPR3到2.5的预算缩放。下面只计实际制作/送餐窗口；章节2/3有刷新，资源列表自对应导航重新累计，含声音重听/缓存，不是每章独立冷启动或首屏加载量。

| 章节 | 帧样本 | 帧间隔 median / p95 ms | 点击样本 | 到第2个rAF p95 ms | 累计传输 bytes |
| --- | --- | --- | --- | --- | --- |
| 1 | 1229 | 33.4 / 50.1 | 27 | 48.6 | 3,977,643 |
| 2 | 1184 | 33.4 / 50.1 | 37 | 57.5 | 4,939,507 |
| 3 | 949 | 33.4 / 50.0 | 22 | 52.9 | 263,978 |
| 4 | 1180 | 33.4 / 50.1 | 32 | 45.8 | 247,046 |
| 5 | 1387 | 33.4 / 50.1 | 39 | 81.1 | 328,198 |

到第2个rAF是反馈代理，不是INP或实际显示延迟。帧间隔未达到60fps目标，不能声称真机流畅；录像和自动化本身也有成本。按场景加载已启用；完整 public/assets≈3.9MiB、public/audio≈4.1MiB，源码原稿不进入生产dist。上述第一章加载量包含整章操作，不能冒称首屏预算达标。

## 声音、生命周期和外部状态

[可听样本](audio/index.html)包括五条实际开发语音引用和六条按运行算法导出的音乐/环境/设备分轨，原始来源与hash见 [samples.json](audio/samples.json)。它们不是现场混音录音。所有WebM没有音轨；没有用无声视频冒充听审。教研、人类听审和声音权利签审均未完成。

[native-lifecycle.json](native-lifecycle.json)记录真实 hidden/freeze/resume/visible、1800ms离线时间和任务剩余时间，以及暂停后前景/循环声停止；普通Playwright焦点模拟不冒充冻结事件。暂停音频严格断言保留；初次失败来自读诊断早于React暂停效果，等待诊断更新后定向通过。

[既有站点核对](deployed-check.json)：线上 bundle 为 m1.1；未暴露可信源码SHA或manifest版本，二者 NOT_PROVEN。其bundle SHA-256是下载字节的hash，不冒充git SHA。M2 **PENDING_DEPLOYMENT**，没有新建或部署站点。

## 结论口径

工程与可玩路径按实际日志报告；视觉手感仍 AWAITING_OWNER_REVIEW（此前反馈 NEEDS_REVISION 已做实装修正）；教研/听审、实体设备、儿童观察 NOT_RUN，素材/声音权利 PENDING，公开发布 BLOCKED/PENDING。日志保留失败与修复，未删除断言换PASS。


## 最终检查与失败历史

最终 [browser-final-36cb8e6.log](browser-final-36cb8e6.log)：17/17，进程退出0；严格类型、lint、资源和40条规则各退出0，原始日志为final-typecheck/lint/resources/rules.log。最终浏览器构建从干净36cb8e6开始；独立40规则与静态检查在运行代码相同的904ed83执行，后续36cb8e6只修正测试采样。Biome保留27条CSS警告；Phaser保留分块体积提示。

此前67b9197整套14/15、e5dca120整套14/16、4fdc0aa定向4/5、904ed83定向1/2的失败日志均保留，原因及处理见STATUS。不是将部分定向通过拼成一次完整PASS。最终整套从正式首页重跑，没有注入成绩。


## 连续动作画面复查

最终构建连续录像的全部顺序抽帧已逐页查看：教学退出10.08秒/0.1秒间隔/101帧，取料与交付重叠24秒/0.25秒间隔/96帧，Pad序章和旋转加工恢复的全部1秒抽帧。原始序列、时长和实际中间点最大步长见 [visual-review.json](visual-review.json)。撤回瞬间实际绘制点与规则点完全相同。画面中姿态有交叉淡变，不能将此表述为骨骼或完整逐帧制作；这个复查也不是负责人的手感批准。
