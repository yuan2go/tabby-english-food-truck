# 参赛文档核验记录

2026-10-12（北京时间）。本记录是材料检查，不是新一轮游戏验收。正文为[design-description.md](design-description.md)，[PDF](design-description.pdf)是其同稿打印派生，修改时以Markdown为准。

## 范围与环境

main baseline `f359b4053cf73e0103bf13b46d26496f19868508`；本轮收尾fetch仍为该SHA。治理提交 `ba4685144bfff0fe834acb37db1b2a87ec7da221` 已先完成，之后才写正文/附录、配图清单及临时导出/核验程序。分支 `codex/contest-design-description-2026-10-12`；材料final完整SHA以Git交付回复为准。

使用Codex已配置的Python3.12.14、ReportLab、pypdf、pypdfium2与系统Arial Unicode字体；无新增依赖、锁文件、运行时模型或部署工具链。PDF嵌入字体子集；排版由当前Markdown文字及三张原图生成。临时渲染图用于检查，不作为游戏证据或新增正文。

## 本轮实际检查

| 命令/方法 | 结果 / 退出码 |
| --- | --- |
| `git fetch origin main`、`git rev-parse`、`git status --short --branch` | 默认main和本地/交付分支完整SHA已读回 / 0；原工作区仍64f03fc，仍仅未跟踪docs/playtests，未写入 |
| `git diff 43d7c76… f359b40… -- src public art package.json package-lock.json` | 空差异 / 0；支持沿用报告受测版本，不称本轮重测 |
| Python检查12份归档与`git show f359b40:<原路径>`逐字节比较 | 12/12一致 / 0；历史失败及资源原件不改 |
| Python扫描现行索引、01–05、STATUS/AI/资源说明、E2E入口、治理索引及submission Markdown链接 | 166个本地目标逐项存在 / 0；不以归档纯文本中的历史链接冒充当前导航 |
| Python SHA-256与Pillow检查配图 | 3/3与正常UI原图字节一致、1280×720、无附加PNG元数据 / 0 |
| Python检查对外正文、附录及材料清单 | 无本机路径、密钥格式、内部聊天原文或含糊占位词 / 0；PENDING/NOT_RUN有具体对象 |
| ReportLab从正文导出，pypdf逐段检查，pypdfium2渲染 | 3页、全部26个文字块存在、3张图片嵌入 / 0 |
| 逐页视觉检查 | 实际查看3页完整渲染，文字/图注可读、图片等比、未裁切，无重叠/乱码或空白页；这是代理视觉检查，不称负责人确认 |
| `git diff --check` | 无空白/补丁问题 / 0 |
| 历史站点浏览器打开与DOM读取 | 首页可访问，cc36166f…/dirty=false/m2.2；[本轮读回](assets/historical-site-check.json)，无玩法重测 |

正文含约1,550个汉字（含标题/图注/必要限制），六项内容齐备。按负责人提供的比赛通知核对三条硬性要求、三项交卷标准及四个评审维度，未虚构权重、原始提示词、工时或学习成效。图2保留原受测版本控件裁切，正文没有宣布修复。

## 派生一致性

- Markdown SHA-256：`bc3d937ff60c37e8706b314eddb614ce96a07dac6b2a398de9b95d4415e0fb62`
- PDF SHA-256：`a25d5211c91baab0173bffb590a2a863ec1b29a01b00bcc5a3573220b6642b66`
- 三张配图独立hash/原件路径：[screenshots.json](assets/screenshots.json)。

PDF文字按去Markdown标记和空白后的完整文字块核对；无需把图片烘焙的游戏文字再次列作正文。PDF是正式打印稿，证据附录另按仓库相对链接复核；不将PDF导出视为产品运行验收。

## 未执行与影响提交的事项

本轮完整游戏test/lint/typecheck/build/resources/E2E、补拍、实体设备、人工听审、儿童观察、部署、推送、PR/合并、权限或工作流变更均 **NOT_RUN**。已引用的游戏结果均为43d7c76受测版本历史结果，工程门禁与交互失败维持原结论。

材料已齐备；完整参赛交卷仍缺可供评委访问的同版Demo或现场预览安排、提交时效确认。实体手机/Pad复核、教研/儿童观察、人工听审与素材/声音分发权仍分别待验，不能把文档完成视为公开发布审核通过。
