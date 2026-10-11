# 技术 · 单一世界与可恢复活动

## 现有活动架构

保留锁定TypeScript严格类型、Phaser3.90、React19.1.1、Vite7.3.6，仅修复实际相关的依赖风险、不盲目升级，不加后端/模型/ECS/全局事件总线。规则核是唯一事实源；输入→命令→边界校验→原子状态→Phaser/DOM投影→音画，不由动画/音频回调改进度。

| 责任 | 落点与接口 |
| --- | --- |
| 有限章目标/委托/探索/主题 | content/adventure.ts；可食用产品来自recipes与catalog |
| 活动规则、接收、分支、作品、守恒 | rules/adventure.ts；工具/协作/需要与收据由rules/adventure-experience.ts处理 |
| 活动内容与只读引导 | content/adventure-experience.ts声明工具与开放类别；rules/adventure-guidance.ts派生目标及有限受阻原因，不执行结算 |
| 图示、场景物与朋友使用 | AdventureGuide / AdventureObjects / WorldFoods / SharingPegs / WorkGallery / FriendTheatre独立组件；Adventure仅组合与输入转发 |
| 物品/设备/时钟/订单 | 现有rules/game/cooking/actions；严格订单保留原判定 |
| 新版快照 | rules/snapshot.ts/schema7；保留旧schema3–6与m2.3-story-1/m2.4-adventure-1迁移 |
| 活动入口与保存/成长同步 | platform/controller与ProfileStore；单活动可恢复，有限长期记忆 |
| 厨房/小院/活动桌表现 | App仅组合，独立Adventure/FreeShop组件；既有TruckScene/ActorView复用 |

活动世界保存章号、真实分支、探索收据、完成动作、收到食品、食品状态/位置、装饰选择、作品与奖励收据。收到食品与营业items不可重号；角色接收事件原子转移，不凭提交按钮提前获奖。保存作品是不可恢复成库存的记忆快照。每次真实变更保存，任务2秒检查点；历史作品/观察/事件有界，失败继续内存并可导出。

当前schema7/content adventure-experience-2 保留活动状态与自由营业接客策略，并以可选experience字段扩展；playable-adventure-1作为显式旧档入口，旧档只迁移字段，未有活动收据的新增目标保持未完成。新活动使用独立 story-X-adventure 会话键；旧营业入口保留原会话指针，进入新活动再刷新后仍可恢复原食品、任务与加工。旧levelId会话继续原关，不暗改订单；旧完成章保留历史，活动完成另记。不推断旧章奖励或新作品。当前键tabby.foodtruck.save.m2、profile.m2保持，旧M1另键原文保留；损坏/未来档阻止覆盖且可导出/明确重开。迁移先完整校验旧版本关系再接受新版本。

命令runId/commandId有界去重；角色/机器只用有效游戏时钟，暂停/后台丢大delta；有效慢帧1000ms以内单次最多推进250ms，不因400ms渲染帧冻结加工，不补暂停时间。已经接单不被菜单/主题/客流重写。物品、槽位与预留一致；加工的输出绑定盘、cancel释放；delivery接收与重读档不能复制食品/奖励。再玩新run可以产生新食品，长期章礼物去重，作品按有限记录保留。活动内最多12份食品/8件作品，长期最多16次活动记忆并保留每章最新完成收据，避免重玩挤掉已开放章节。

本地资源URL附实际manifest hash，来源/权利不随构建改为已审核。构建注入真实SHA/dirty/content/assets/时间；页面与设置可核验。DOM/Canvas同layout、语义按钮调用正常命令，无测试通关后门。输入取消、卸载解除订阅/捕获/音频/计时；低动态不影响规则。

学习记录保留当前support、first/revisit、音频事件与维度；实际接收产品集合受可食用目录约束，详细观察滚动保留160条也不能洗回首次。旧档仅从实际接收观察/食品记忆补此集合，不从旧通关或教学猜测。重玩继承已有便签支持，过去答案帮助仍有记录；开放/自由动作只写operation，明确订单/便签才写相应语言尝试，手速不评分。小游戏库存仍隔离。

目标60fps、输入p95<100ms等是预算，本包不无依据宣称达标；默认画质/省电、模拟/实机分别报告。构建保留Phaser分块警告。仅必要回归；共享库存与迁移改动应运行完整现有单元套件，浏览器不扩大无关矩阵。

吐司、旧方案与历史技术证据见[归档](archive/pre-playable-adventure-01/index.md)；真实结果见STATUS。

## 本包必要职责划分

保留schema7并以可选、边界校验的experience字段扩展；内容版本更新并对playable-adventure-1原档显式迁移，不改原任务、食品、帮助与完成事实。profile活动记忆使用同一校验/迁移入口。

content活动编排与情境音频定义；rules活动命令/接待/工具/回访/食品使用与有界收据；只读规则引导派生当前目标、缺项与阻碍；Adventure仅组合场景、独立图示引导/工具/食品/朋友演出组件。App只传入口和策略，不集中新规则。ForegroundAudio保留单一声音所有者。演出收据只描述已结算事实，重播不派发玩法命令；快速重复命令、重复品尝与奖励保持幂等。首次迎入时累积当前图片/示范支持，不仅在活动启动时记一次；真实接餐更新已介绍食品，实际野餐完成更新路线记忆，使同一跑次的回访也依据最新事实。受阻引导从被拒命令与当前食品/餐位/分享类别投影，选择已有食品、取回、重新制作或取物件的恢复路径均由正常按钮执行。

## 词库与场景小游戏职责

content/vocabulary与独立JSON包含120学习概念，foods/recipes供应映射不改。content/scene-levels配置具象场景、有效解与短请求；rules/scene-games负责实例归属、状态前置、空间/数量/多解、明确提交与有界尝试；app/SceneGames组合独立场景表现，app/VocabularyVisual负责静态道具与动作空间投影。既有mini-course使用新的学习查询，原31关与旧小游戏保存保持。

新场景快照独立键/version1，MiniStore统一拥有内存和持久化，损坏/未来档保留原文、拒存可玩可导出可重试；不推断旧完成变新完成。保存seed、题号、实际物件、支持、提交收据和自由作品；命令绑定轮次并去重，重复输入/切换/恢复不重复完成。重玩支持累积，不洗白。旧存档键与schema7厨房不变。资源清单记录矢量源文件、WAV文本/实际hash/来源，不改旧素材审核状态。

课程保留version1及旧键，新增paused/assembly/assembled/carry均为可选字段。原31关ID不改；新增56听音/配对小组。保存与读取共用课程3,000,000、场景1,500,000字符预算，写前超限留下内存/导出，不写出自身拒读的档。所有概念均有稳定供给之外的学习ID。SceneState version1包含显式covered/reveal、唯一归属、12步撤回、64次详细尝试和不会截断的有限支持汇总。记忆维度独立、自由不判语言、剧场状态后继不造成不可逆死局。

表现拆为SceneGames生命周期/音频、SceneBoards五种空间交互、SceneGuide已记帮助的图示、VocabularyVisual意义/动作。示范只绘制，不向规则发送通关；音频完成只记heard。随机池为明确合法配置，run/seed/round/原物件随档保留；刷新不换答案。

当前实施/验证见[05](05-delivery.md)和[STATUS](STATUS.md)；历史授权、已替代阶段计划见[归档](archive/pre-demo-repair-2026-10-12/index.md)。

## 本轮修复职责

vocabulary JSON使用原生导入属性，资源清单只格式化，不改变内容/hash事实。FriendTheatre只投影收据，SceneBoards剧场动作有独立CSS命名。dialog-focus统一处理模态焦点及背景隔离，覆盖小游戏暂停/重玩及同类确认；取消、卸载和后台沿用现有所有者。

厨房端盘目标与食品目标分开，实际命令仍走game/input→controller→rules。持续指引为状态只读派生，不能由动画推进。默认演出过程与低动态事实/幂等分别测试，不以CI省电默认值替代产品合同。存档schema/内容和奖励规则保持，本轮不重构规则或引入新平台。

layout的traySurface统一拥有食品、餐盘、选盘和端盘坐标，projectActor把既有逻辑盘位投影到同一物理盘，ActorView与拖动/取消不另写偏移。recoveryControl占用原料区固定槽，不随选中食品漂移。旋转重投影，手势取消和任务时钟仍由原生命周期处理；单盘模式的两逻辑端点共享位置，不改变已保存的任务/物品身份。

实现结果：模态连续替换保留原触发器，独占inert生命周期；help仅作为非模态时不拦场景输入，真正对比/确认采用圈定。Scene重玩先取消前景音频。source选择不消耗食品，明确lift-tray切换不会先移动单件；单件移动/错单恢复仍用现有命令。activityGuidance等待只看仍携食品的delivery任务，接收后立即回到当前目标。

依赖只定向patch开发构建的sharp 0.35.5和source-map-js 1.2.2；无运行时框架升级。矢量脚本增加--images-only --objects=<登记ID>，校验选中范围，仅导出对应SVG/WebP、更新对应清单，禁止顺带重制声音/内容。

## WP-ENGLISH-IMMERSION-01 边界

content/dialogue统一类型化语义参数、完整文本、目标词、整句资源ID、角色及触发；订单catalog消费同一语义生成器，speech与离线制作登记由同一语料导出。不维护第二套订单判定或音频播放器。平台dialogue从实际规则状态差分生成接收/加工/行动事件，短句组件只呈现与重播。前景ForegroundAudio继续唯一通道，生命周期取消；规则进度不由声音决定。重听历史有界、运行态不写通关快照；活动作品/回访文本由已保存真实食品派生，无新增存档schema。真实接收食品即进入既有有界活动记忆，即使未领取章奖励；仅已完成奖励收据解锁装饰与后章。首次被资源加载阻塞的未完成请求仅在仍有效时开始，已播放或已中断的旧句不恢复补播；教学/新菜单/章节旁白可在各自时钟暂停下播放，离场/弹窗/后台/资源暂停取消前景。非订单语料播放只记音频日志；订单听取证据必须显式匹配订单ID。

语音离线macOS Samantha完整句录制，明确DEVELOPMENT_TTS_UNREVIEWED、rights PENDING、人听NOT_RUN。不拼接词、不运行时合成、不录儿童声音。脚本验证文本/音频路径/hash/唯一映射与可达语料；数据化覆盖语法和分支。默认字幕在实际交付attempt支持中保留caption-visible，profile请求交付写meaning而非纯listening；历史记录原样保留。
