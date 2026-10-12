# 设计说明核验 · 2026-10-13

正文为公开v5实际玩法，源稿和PDF四项完整，原网址及“访问需要开启 VPN”存在。1页A4、16正文文字块、1张1280×720匿名公开实测原图；图与online/layout-1280.png字节相同。pypdf全文与Markdown仅统一空白/NFC后逐字相同，URI链接指向原站；所有1页pypdfium2渲染已实际查看，无裁切/重叠/乱码/空白页，字体Arial Unicode嵌入子集。PDF title/author均为大咪。

[Markdown](design-description.md) SHA256 26a5cdd4fd6fefdea4eedb26c29f9c0a7c1614845735e41998fb486268440ae0；[PDF](design-description.pdf) SHA256 03dca11e9aa9a8047338ebd5b432fcb9c753f888778360d1c9b354d6977eb55a。可复现[导出程序](render-description.py)、[全文](pdf-qa/exported-text.txt)、[JSON](pdf-qa/pdf-validation.json)与[全页图](pdf-qa/page-1.png)。

系统osascript确认真实桌面/Users/dafangzi/Desktop，旧PDF/源稿/图已备份，新PDF和MD/图复制后逐文件byte/hash一致。[桌面回执](../evidence/direct-cooking-2026-10-12/desktop-copy.json)和[旧版备份](../evidence/direct-cooking-2026-10-12/desktop-backup.json)提供实际路径。使用bundled Python及既有ReportLab/pypdf/pypdfium2，不改工程依赖；系统Python不含pypdf，已使用bundled运行时成功导出。

材料仅docs/报告/图/PDF，无运行代码与配置变化；仓库PR强制门禁照常执行。PDF/代理视觉PASS不代表真人、儿童、实体设备、人工听审或权利审核通过。
