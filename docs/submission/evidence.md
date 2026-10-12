# 设计说明证据附录

2026-10-12，同桌共玩公开版v4。正文四项只描述最新实际运行内容，不增加草案功能或审核结论。

## 同版身份与访问

游戏GitHub main `2e3f36442a54a564647632d6bf421ec58a3b6252`，来自[PR20](https://github.com/yuan2go/tabby-english-food-truck/pull/20)；受检head faf195571c370faffb9a377558d6e6f3a88922a3，339单元、39浏览器及必要门禁全部success，合并树相同。Sites source `49d307ef2573173b31a7f6225bab0380fedec574`，version4，deployment appgdep_6acc6e74a5508191955f926fc5c21532 succeeded；[发布映射](../evidence/simplified-play-2026-10-12/deployment.json)、[逐文件源同一性](../evidence/simplified-play-2026-10-12/site-source-integrity.json)及[实际匿名读回](../evidence/simplified-play-2026-10-12/online/anonymous-validation.json)关联源码、静态构建、真实公开站点。

public/active，空cookie新Chromium上下文、VPN代理、HTTP200，无登录/邀请；实际SHA完整读回2e3、dirty=false、content together-play-1。正常首页→请求重听→误送留物→放回→真实两份早餐接收→可选探索之外开席→刷新保存→下一章/既有早餐记忆保留。声音资源200/206成功，真实播放完成记录存在；不冒称人工听审。CUA另从正常首页玩完早餐，配图来自这一最新线上会话。线上脚本的四次预期/时序编写失败保留并解释，不删断言伪造通关；见主报告。访问需要开启 VPN。

## 实际玩法与目标

[01产品](../01-product.md)、[02规则](../02-game-design.md)、[03体验](../03-experience-design.md)为唯一现行权威：五章、双野餐、自由厨房/作品与回访、50食品/120概念/十类自选小游戏。单一近景舞台、真实手持→点目标、真实选料/加工钟/取成品、明确接收者、原位接收/品尝、错物保留/放回、气泡仅重听、早餐探索可选均有已合并规则/输入/存档回归与实际游玩证据。正常新档手机连续代理五章与自由厨房、桌面布局补查见[完整报告](../evidence/simplified-play-2026-10-12/README.md)。3–6岁是产品目标，代理通关不证明儿童适龄、乐趣或学习效果。

## 真实AI使用

OpenAI Codex用于设计治理、规则/输入/界面/存档、失败修复、验证及材料；OpenAI内置imagegen用于此前本仓库新背景、角色姿态、食品/设备源稿。登记见[AI使用](../AI-usage.md)、[素材来源/权利](../../art/README.md)、[制作提示词与修订](../../art/m2-production.json)及manifest。本轮没有新imagegen素材或新声音，使用既有Alpha轮廓测量统一比例，未镜像/改变冻结角色身份。提示词意图摘要与真实exact提示词分记，不虚构模型型号、工时收益、审核者或学习成效。

Samantha/Tingting为macOS离线开发TTS，未人工听审、分发权PENDING。运行时明确规则和本地状态，没有大模型调用、实时AI对话、模型判题、后端、麦克风或账号/儿童身份采集。

## 配图与历史

图1 [05-online-together](assets/05-online-together.png)，1280×720，来自最新v4正常入口→真实兔兔接收苹果→刺刺请求香蕉→拿起香蕉的CUA公开会话；与[原图](../evidence/simplified-play-2026-10-12/online-cua-request.png)字节相同，SHA256 8df2cb75646dafe53da29881cc592620de29e47a1973ebe10e049013e8bb0fea。无裁切、拼合、重绘或后加文字；PDF原比例缩放。01–03为43d7c76历史图，04为version3，原件和来源/hash保留[清单](assets/screenshots.json)。[上一公开说明证据](https://github.com/yuan2go/tabby-english-food-truck/blob/2e3f36442a54a564647632d6bf421ec58a3b6252/docs/submission/evidence.md)保留完整历史，不作本版验证。

## 材料与外部边界

一页A4、同稿文字、可点击实际站点及VPN提示、全页渲染和真实桌面复制/hash核验见[validation](validation.md)。比赛是否接收/时效由组织方决定，本轮没有冒称报名或提交参赛成功。成人真人、实体手机/Pad、儿童观察、教研、人工听审、分发权分别NOT_RUN/PENDING；历史真机NEEDS_REVISION、60fps NOT_MET与真实后台hidden NOT_CONFIRMED保留。
