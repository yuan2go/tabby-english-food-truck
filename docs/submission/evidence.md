# 《大咪的英语餐车》证据附录

本附录服务于[唯一正文](design-description.md)，不另列产品蓝图。日期2026-10-12。正文与assets可直接作为对外介绍；以下仓库相对链接供复核，不包含本机路径或内部聊天原文。历史工程报告用于内部追溯，含当时环境信息，不作为对外附件整包转发。

## 版本与核查边界

| 身份 | 完整SHA / 状态 |
| --- | --- |
| 本轮fetch的main / 材料baseline | `f359b4053cf73e0103bf13b46d26496f19868508`，已含PR15验证产物 |
| 玩法、配图、最新验证的受测源码 | `43d7c76c80df54361790c47ba1715fe7290f9039`，dirty=false，content `adventure-experience-2` |
| 文档治理独立提交 | `ba4685144bfff0fe834acb37db1b2a87ec7da221` |
| 历史在线页面本轮读回 | `cc36166f521fe5b92455321f0a4bd609a1d201fd`，dirty=false，content `m2.2` |

Git逐项比较确认43d7c76→f359b40的src/public/art/package/lock没有变化。配图与行为证据可关联本说明基线；文档更新造成的新HEAD不称为新游戏受测版本。其他本地修复分支未合入本基线，结果不计入本文。

主要来源：[最新报告](../playtests/2026-10-11-integrated-validation.md)、[索引及SHA256清单](../playtests/2026-10-11-integrated-validation-43d7c76/README.md)、[实际页面身份](../playtests/2026-10-11-integrated-validation-43d7c76/manual/runtime.json)。本轮不重复完整游戏测试，不补造人工接受。

## 关键事实索引

| 正文事实 | 源码/设计 | 同版行为证据及范围 |
| --- | --- | --- |
| 五章目标与正常首页入口 | [01产品](../01-product.md)、[章节配置](../../src/content/adventure.ts)、[Home](../../src/app/Home.tsx) | 报告3.1与4；新档UI连续五章，含图示/教学/中文反馈，不称儿童独立完成 |
| 两片面包＋芝士；兔兔与刺刺不同请求 | [recipes](../../src/content/recipes.ts)、[catalog](../../src/content/catalog.ts)、[speech](../../src/content/speech.json) | 报告M2；芝士请求原文“A cheese sandwich, please.”；蔬菜请求含lettuce and tomato |
| 单客自主迎入，首次实际接收定路线；两路等价 | [adventure规则](../../src/rules/adventure.ts)、[活动体验](../../src/rules/adventure-experience.ts) | 报告3.1；[双路读回](../playtests/2026-10-11-integrated-validation-43d7c76/manual/readback-comparison.json)；只复制本轮实际所得存档重玩 |
| 订单/开放委托/自由三种判定；错单保留 | [02规则](../02-game-design.md)、[game](../../src/rules/game.ts)、[活动内容](../../src/content/adventure.ts) | 报告3.2与P1/P3；开放杯类四个声明方案，不以任意食品替代；领域探针与UI范围分开 |
| 点盘标签拿整盘、点客交付，气泡重听 | [03体验](../03-experience-design.md)、[TruckScene](../../src/game/TruckScene.ts) | 报告4及X01；盘中央可能选到单件，正文给出实际恢复操作，不掩盖意图混淆 |
| 食品摆放/品尝、工具及装饰因果 | [adventure](../../src/rules/adventure.ts)、[FriendTheatre](../../src/app/FriendTheatre.tsx) | 报告M1；截图07、12、24、40–46；演出表现不参与结算 |
| 自由作品可改位、保存/回看；停止接客/收摊 | [FreeShop](../../src/app/FreeShop.tsx)、[WorkGallery](../../src/app/WorkGallery.tsx)、[活动规则](../../src/rules/adventure.ts) | 报告M3；[作品读回](../playtests/2026-10-11-integrated-validation-43d7c76/manual/free-work-gallery.json)，47–54；记忆不生成库存 |
| 熟客需要承接历史活动，非自由聊天 | [adventure-experience](../../src/content/adventure-experience.ts)、[同名规则](../../src/rules/adventure-experience.ts) | 报告3.1社区小食会、M1 42–46；有限类别/份数分享，不称运行期AI |
| 图音意义先行、支持与尝试分开 | [mini-course](../../src/rules/mini-course.ts)、[scene-games](../../src/rules/scene-games.ts)、[03](../03-experience-design.md) | 报告3.2/3.3及102学习观察；未完整听到记录audio-not-observed；自由/记忆不当听力掌握 |
| 十类小游戏与120概念，非120道料理 | [词库](../../src/content/vocabulary.ts)、[场景配置](../../src/content/scene-levels.ts) | 报告3.3及C1；120概念≥2可达玩法为数据/领域校验，各类代表UI路径不等于全量玩家验证 |

## AI案例与来源

**采用案例：成品图片服从配方。** [m2-production](../../art/m2-production.json)保留初稿m2-foods馅料不匹配、相邻裁区碎片及重生成说明；前六条promptRecord是制作意图摘要，后两条为标注exact的实际提示词。不得把摘要补写为原始对话。

| 环节 | 原件/落点 | 可支持的结论 |
| --- | --- | --- |
| AI初稿及问题 | [m2-foods原稿](../../art/source/m2-foods.png)、上述production的correction | 候选三明治/汉堡与规则馅料不一致，登记保留原因 |
| 明确约束并重生成 | [recipe-outputs原稿](../../art/source/recipe-outputs.png)、production的exact记录 | 芝士三明治只用面包/芝士；普通汉堡用面包/熟饼/生菜/番茄，不带芝士 |
| 导出与接入 | [m2-exports](../../art/m2-exports.json)、[脚本](../../scripts/export-m2.mjs)、[manifest](../../art/manifest.json)、[assets](../../src/game/assets.ts)、recipes | 独立sandwich/burger WebP有真实裁区/尺寸/hash并参与成品显示；不称手工重绘 |
| 当前落地 | 报告M2三明治；M1黄昏普通汉堡错单→重做芝士汉堡 | 食品差异参与实际交付和活动；检查不替代负责人视觉或权利接受 |

其他真实参与：Codex规则/界面/保存/图示/验证代码见[当前AI记录](../AI-usage.md)及[原阶段制作史](../archive/pre-submission-2026-10-12/AI-usage.md.txt)；[资源来源与权利](../../art/README.md)保留冻结角色、imagegen、机械派生、原创SVG及波形声音的区分。[世界情境TTS](../../art/adventure-experience-audio.json)、[词库/场景语音](../../art/vocab-scene-audio.json)登记实际文本与开发来源。普通TTS、规则判定与seed随机不冒称大模型。没有效率、学习效果或获奖数据。

## 三张配图

均直接复制同一受测构建的正常UI原图，1280×720；无裁切、重绘、拼合、后加界面或通关注入。当前正文图注在对应画面处。原始录像无音轨，不能作听审。

| 图/交付文件 | 原始记录 | 所示步骤 |
| --- | --- | --- |
| 图1 [01-making-icecream](assets/01-making-icecream.png) | [09-icecream-processing](../playtests/2026-10-11-integrated-validation-43d7c76/manual/09-icecream-processing.png)，M1/09 | 已放蛋筒＋香草，设备接球中，尚非最终交付 |
| 图2 [02-picnic-sharing](assets/02-picnic-sharing.png) | [24-ch3-rabbit-complete](../playtests/2026-10-11-integrated-validation-43d7c76/manual/24-ch3-rabbit-complete.png)，M2/24 | 打包食品摆桌、铺布与开席后，兔兔实际品尝 |
| 图3 [03-saved-work](assets/03-saved-work.png) | [52-free-gallery](../playtests/2026-10-11-integrated-validation-43d7c76/manual/52-free-gallery.png)，M3/52 | 自由果汁作品回看，保留摆法与品尝者 |

逐文件哈希与原图一致性见[图片清单](assets/screenshots.json)。图2保留受测画面内控件裁切原貌，正文明确当前限制，不能用配图宣布交互修复。

## 比赛要求核对

依据负责人本轮提供的比赛通知原文；未获取独立公开公告链接。通知的三条硬性要求、三项交卷标准及四个评审维度可据原文核对，未给定权重。

| 通知要求 | 作品对应及状态 |
| --- | --- |
| AI制作英语学习网页游戏 | Codex/imagegen制作记录与实际规则/资源支持；英语请求、词义/动作学习真实存在 |
| Web技术，可在浏览器直接打开游玩 | Phaser/React/TypeScript构建及HTTP浏览器运行有同版证据；正式同版在线Demo仍缺，本机地址和源码不当在线入口 |
| 适合手机或Pad触控 | 点选→点目标、拖动可选；393×665实际touch事件模拟证据存在；同版实体手机/Pad未验，不能宣称硬件体验接受 |
| 可体验：可运行/可体验Demo | 本地生产预览有历史有效路径；提交者须提供可供评委访问的同版Demo或现场预览安排，当前尚未完成Demo交付 |
| 有说明：玩法、主题、AI、亮点 | 本次正式正文与真实配图覆盖；证据附录负责追溯 |
| 有完成度：目标、规则、基本可玩性 | 五章/自由/小游戏有实现与代表性正常路径；工程门禁和部分交互仍失败，不冒称全验收 |

通知评审维度为创意脑洞、AI应用深度、完成度与可玩性、趣味与体验；本说明以可见因果和实际AI修订对应，不虚构打分、权重或奖项承诺。

通知列9.23 18:00提交截止、9.24–9.25评选复核、9.28拟公布，未注明年份。本材料日期为10.12；是否接受本次补交或适用新轮次须组织方确认，不能将材料完成视为报名/按时提交成功。

## 体验入口与仍待验

由提交者在本基线安装锁定依赖并启动本地HTTP预览：Node>=22.12.0，`npm ci`后`npm run dev`；生产方式为`npm run build`后`npm run preview`。评委按正文路径使用正常首页；不预装通关状态、不通过后台解锁。启动命令本轮NOT_RUN，引用的是受测版本已有build/UI结果。

2026-10-12（北京时间）本轮浏览器实际打开[既有站点](https://tabby-english-food-truck.yuan576264675.chatgpt.site/)，首页可见，DOM读回SHA cc36166f…/dirty=false/content m2.2，见[本轮记录](assets/historical-site-check.json)。可访问不代表当前版本对应；该链接只标历史，不作本次正式Demo。

最新报告D01/D02/D03/D04及T01仍决定本基线限制：原生浏览器测试收集、lint格式、演出控制裁切和暂停焦点，不能引用其他分支修复为main已通过。手机模拟、桌面路径、实体设备、教研/人工听审、儿童观察、资源权利分别记录；后五项仍NOT_RUN/PENDING，历史真机NEEDS_REVISION与60fps NOT_MET保留。

本轮必要文档核验的范围、命令/退出码和阅读/导出结果见[核验记录](validation.md)。游戏完整测试、build、部署、推送、PR/合并与权限变更本轮均NOT_RUN。
