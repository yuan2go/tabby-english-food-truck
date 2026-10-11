# 双工作包集成与发布记录

2026-10-12（北京时间）。状态：两个完整源分支已推送并经PR17整合main；线上实测发现的窄图带叠压经PR18修正，精确head全部工程门禁通过后合并；原公开站点已部署version3且匿名正常路径通过；四项一页设计说明/同稿PDF已完成并正常复制桌面。负责人已明确授权本轮推送、PR、合并main、公开站点更新和材料交付。最后文档提交/合并完整SHA从该PR实际回执和最终回复读回。

## 来源与范围

- main baseline：`0b249b04697b1df43d74bbe1a4f532175b2d04f1`。
- Demo完整交付：`36200dd4d7bd931e4e5fedf8a25465d6b3f9e9e5`，原基线`f359b4053cf73e0103bf13b46d26496f19868508`；[原报告](../demo-repair-2026-10-12/README.md)。
- 英语完整交付：`103c2bb2272ddaa86fe32e342fc20e86feeb3a80`，原基线`64f03fc716de70e20f64f9bbc3802de7601a460f`；[原报告](../english-immersion/README.md)。
- 隔离分支：`codex/contest-release-2026-10-12`。两个源包以merge保留全部提交、资源、报告、原始日志及归档。原工作区未跟踪docs/playtests未纳入。

## 必要整合

保留Demo正常首页、单客自主迎入、食品/作品分页、工具与分享演出、暂停焦点和48px独立拿盘/放盘；融合英语导演、整句可见字幕、真实收到/品尝回执、作品描述与实际历史回访。资源清单按两包增量语义合并，不覆盖已修正SVG资源。

合并后的单元测试复现横屏布局失败：顶栏预留导致桌面误分类，短横屏托盘宽度降至110px。修正以真实视口分类并分配完整托盘区域，保留食物、拿盘、放盘的独立目标，不删断言。两条旧测试随新规则明确迎入访客和引用新整句资源，保留原行为断言。

分享挂签原有5个片段请求与新完整英语要求冲突；新增5个真实整句、离线WAV和资源登记，经失败再通过的内容检查验证。没有模型/后端、运行时TTS、新依赖、通关注入或旧仓库导入。

## 本轮检查

[命令、退出码与环境](engineering-results.json)，[受检输入hash](checked-inputs.json)。Node22.12.0/npm10.9.0、macOS ARM64；类型/310项单元/资源818项/生产构建/lint均退出0；词库120概念、51个真实规则解与33条独立场景指令校验退出0。lint既有122警告与20提示保留；Vite大chunk警告保留，未声称性能达标。

浏览器首轮33条中26通过、7失败，随后复现并修正真实布局遮挡：活动对话栏被旧flex样式覆盖；手机被压缩的制作行与启动目标重叠。按实际风险复跑，活动/正常英语3/3及最终手机/错误交付/持盘/两客/取消/音频/横屏5/5均退出0；对话仍保留132px整句空间，食品、拿盘、放盘、设备/委托行分别可操作。另一3项旧选择器/单客座位/选中食品测试跟随真实新入口，原断言与真实食品/记忆检查保留。随后PR17精确head cbdd515在GitHub通过完整33/33（20.1分钟）；PR18精确head 53c072b再次通过33/33（15.1分钟），两次310/310单元及其他工程步骤均成功。不冒报本地最终head重跑33条。原日志/失败截图/视频均保留。真实后台hidden未确认、实体手机/Pad、儿童观察、教研、人工听审、素材/声音权利分别待验；历史NEEDS_REVISION/60fps NOT_MET不改写为通过。工程和部署结果不冒称参赛审核或儿童体验接受。

## 实际云端交付

既有站点ID保持 `appgprj_6ab141055ab8819186112dee423d0d04`，网址 https://tabby-english-food-truck.aw9923299.chatgpt.site ，owner/public读回，version3部署succeeded。最新游戏代码main `7339c5119007e913327609fa6e24d89a5a86cb21`；Sites来源 `1ab58709b1d557099180f28174cb0526cdfc7160`，dirty=false。保存版本/部署ID、archive hash和原生流程命令/退出码见[部署映射](deployment.json)。GitHub代码PR17与PR18分别已按授权正常merge，无强推/权限或CI配置更改。

[最新匿名复核](live/live-verification.json)：空cookie的新Chromium上下文HTTP200、完整英文苹果请求→取苹果→端整盘→明确交付→实际回执→活动桌；四视口演出控制和图带边界通过，3个线上JS/CSS逐字节等于本次静态构建。原v2[部署](deployment-v2.json)/[匿名读回](live-v2/live-verification.json)完整保留；Pad/短横屏真实叠压先红再绿见[图带修正](online-guide/README.md)，不把首次控制可达等同全部图示完美。

[来源同一性](site-source-integrity.json)核对1102条保留源码/资源的Git mode/type/blob全相同，只新增只读site-release.json映射。原大量验证录像完整留在Github，不再次灌入Sites源仓库；首个包含1.8GB证据的本地上传主动停止、未改远端ref，旧候选/原失败事实见[首次同步记录](site-source-integrity-v2.json)。正式流程从确切Git main归档同步，未导入正在编辑的说明。

[最终设计说明](../../submission/design-description.md)一页覆盖玩法/主题/AI/亮点，附真实站点与“访问需要开启 VPN”；[PDF文字/渲染](../../submission/validation.md)逐字及全页视觉核验通过。桌面 `/Users/dafangzi/Desktop/狸花猫英语餐车-设计说明.pdf` 正常cp成功，文件存在且逐字节/SHA256一致，[实际回执](desktop-copy.json)。最后材料分支仅文档、报告、图/PDF及复核工具，不改已验运行输入；不重复已通过的33条游戏测试或部署，GitHub最终head/main full SHA在PR合并后回执读回。

原工作包证据按Git blob逐件核对：[完整性记录](source-evidence-integrity.json)，英语102件、Demo429件，缺失或修改均0。源分支远端HEAD等于两个已验最终SHA。最新受检代码/测试指纹在checked-inputs；浏览器当时构建元数据对应阶段HEAD/dirty状态，完整CI及日志以cloud-ci/的实际成功run/head为准，所有中间失败仍保留。
