# 参赛说明核验记录

2026-10-12，同桌共玩公开v4，游戏main2e3f36442a54a564647632d6bf421ec58a3b6252。可编辑[Markdown源稿](design-description.md)、[PDF](design-description.pdf)及最新原图同版；正文已替换旧端整盘/独立拿盘描述。Markdown源稿在桌面独立文件夹携带相对assets，正常可编辑/显示配图。

| 检查 | 实际结果 |
|---|---|
| 四项/网址/VPN | 主题与目标玩家、实际玩法、AI工具用途、亮点全部存在；实际原站及“访问需要开启 VPN”明示 |
| ReportLab导出 | 退出0，1页A4、15正文文字块、1张实际v4原图 |
| pypdf全文 | 与Markdown逐字相同，仅统一空白/NFC，保留全部标点/大小写；PASS |
| 点击链接 | PDF URI annotation指向实际原站；提取文字含VPN原句；PASS |
| pypdfium2渲染 | 实际查看全部1页PNG，无裁切、重叠、乱码、空白页；字体嵌入、原图等比；代理视觉PASS |
| 源码/截图身份 | v4与SHA2e3实际读回；图05与CUA原图相同hash；历史图01–04保留 |
| 真实桌面 | Foundation FileManager系统目录 /Users/dafangzi/Desktop；旧PDF正常备份、新PDF/Markdown及图片正常复制、直接读取、byte/SHA256一致；[回执](../evidence/simplified-play-2026-10-12/desktop-copy.json) |

Markdown SHA256 `60415e958a88589cc3285164ad7add5d1f83799aaa7312545c31fbf8c0f756b3`；PDF SHA256 `bec9916388015425c9091ad05c73072d0952165003fb697fd97a5a8c09d08097`。使用 bundled Python、ReportLab/pypdf/pypdfium2和系统Arial Unicode嵌入子集，工程依赖未改。可复现[导出程序](render-description.py)、[逐字提取](pdf-qa/exported-text.txt)、[JSON核验](pdf-qa/pdf-validation.json)、[全页图](pdf-qa/page-1.png)。PDF视觉与桌面核验不当作游戏儿童验收。

[完整游戏/发布报告](../evidence/simplified-play-2026-10-12/README.md)保留所有失败与实际修复、339/39精确head云端门禁、VPN匿名真实游玩、历史外部待验。材料仅修改docs/报告/图片/PDF，无运行输入变化，不重跑无关游戏门禁或再次发布站点；材料PR的仓库强制检查照常执行。
