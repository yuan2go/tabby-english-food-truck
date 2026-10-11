# 参赛说明核验记录

2026-10-12。源稿[design-description.md](design-description.md)，[一页PDF](design-description.pdf)为同稿打印派生。正文基于公开站点version 3与上述实际代码身份，已删去碎片点餐、本地启动入口、无同版Demo及已修复裁切/焦点的过时描述；历史资料仍可追溯。

## 方法与结果

| 检查 | 实际结果 |
| --- | --- |
| 四项要求及网址/VPN | 玩法、主题、用了哪些AI、核心亮点全部存在；实际网址与“访问需要开启 VPN”明示 |
| ReportLab导出 | 1页、16正文文字块、1张实际线上原图；退出0 |
| pypdf完整文字比较 | 去Markdown标题/列表标记后，逐字核对完整正文；只统一空白及NFC，不忽略标点、大小写或全角差别；退出0 |
| pypdfium2渲染与逐页视觉 | 全部1页实际查看，文字/链接/图注可读、图片等比且无裁切、重叠/乱码或空白页；代理检查，不称负责人审核 |
| 图片来源/hash | 1280×720，04与最新线上原图字节相同，原3张历史图片不改 |
| Desktop正常系统复制及核验 | [实际回执](../evidence/contest-release-2026-10-12/desktop-copy.json)，普通 cp 复制，直接读取桌面文件并逐字节/SHA-256核对；内容hash相同 |

使用Codex配置Python3.12.14、ReportLab/pypdf/pypdfium2与系统Arial Unicode嵌入字体子集，未改工程依赖。可复现[导出程序](render-description.py)，[提取文字/完整性](pdf-qa/exported-text.txt)、[核验JSON](pdf-qa/pdf-validation.json)和[全页渲染](pdf-qa/page-1.png)。实际线上行为和完整工程门禁另见[本轮主报告](../evidence/contest-release-2026-10-12/README.md)，不把文档导出当游戏验收。

- Markdown SHA256：`8dfe4381031e7bca64d5927c20ebac13ac978c29c83324c1171d17769e415921`
- PDF SHA256：`ac7e847a0353bd45bb79c6038cf404f612e2aa4cdd36bcf3ef1921a59fbf1a10`
- 当前图1 SHA256：`d16376dcbe54c8fabe75ed9092b77b5d71f895d2edf74421984622d4b358d1ce`

源稿约566个汉字加必要英文，明确四项。材料中的AI贡献以真实登记为准，普通TTS不称实时AI。实体设备、儿童、听审/教研、权利和报名时效不在代理材料核验中冒记为通过。仅文档/报告/PDF的最后提交与已验代码无运行输入差异，因此不重复完整33条游戏检查；没有修改CI/仓库权限或绕过失败门禁。
