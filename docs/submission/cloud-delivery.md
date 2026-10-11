# 本轮云端与桌面交付

负责人已明确授权：两个完成包及全部代码、资源、报告、文档提交/推送，PR合并main，更新原公开网站，按最新线上内容更新简短四项说明与同稿PDF，再复制桌面。未重复请求确认。

发布baseline `0b249b04697b1df43d74bbe1a4f532175b2d04f1`；[PR17](https://github.com/yuan2go/tabby-english-food-truck/pull/17)整合两包，精确head cbdd515的310单元/33浏览器及其他工程门禁通过后合并 `2a7b774a33d6586aa586bb6a3ed59c9ac2b83405`；[PR18](https://github.com/yuan2go/tabby-english-food-truck/pull/18)修正实际线上发现的图带叠压，最终代码head `53c072bda4a5c3668f4bd973232f46e5f25cde0d`，门禁通过后main `7339c5119007e913327609fa6e24d89a5a86cb21`。源分支推送与531件原工作包证据同一性见[主报告](../evidence/contest-release-2026-10-12/README.md)。

| 部署对应 | 实际值 |
| --- | --- |
| 站点ID | appgprj_6ab141055ab8819186112dee423d0d04 |
| 网址与权限 | https://tabby-english-food-truck.aw9923299.chatgpt.site，public，空cookie免登录HTTP200 |
| Sites来源SHA | `1ab58709b1d557099180f28174cb0526cdfc7160` |
| 保存版本 | 3，`appgprj_6ab141055ab8819186112dee423d0d04~appgver_c315d17ab284819181f3887729a4eeb5` |
| 部署 | `appgdep_6acbf0bdd1b08191b4e863c6d50c7fe2`，succeeded |
| GitHub代码来源 | `7339c5119007e913327609fa6e24d89a5a86cb21` |

[部署JSON](../evidence/contest-release-2026-10-12/deployment.json)分别记GitHub SHA、Sites SHA、原生版本/部署ID、服务器存储hash和本地archive hash；凭证仅会话内存/隐藏stdin，不写文件或参数。所有保留源码及资源按Git blob逐路径同一，仅新增只读版本映射；大量原验证录像完整留在GitHub，未重复灌入Sites源仓库。首次v2匿名访问与后续图带修正事实分别保存，不覆盖原成功/失败。

最终[说明](design-description.md)、[一页PDF](design-description.pdf)、新配图、核验和本轮报告在独立codex文档分支交付。文档最终完整SHA及PR/main合并回执从GitHub读回写入该PR正文与最终回复，避免在文件中自引用尚不存在的提交SHA。最后文档提交不会改变src/public/art/scripts/依赖等运行输入，本站已是最新游戏代码，无需为文档再重复部署。

桌面文件：`/Users/dafangzi/Desktop/狸花猫英语餐车-设计说明.pdf`，正常系统复制后内容SHA256 `ac7e847a0353bd45bb79c6038cf404f612e2aa4cdd36bcf3ef1921a59fbf1a10`，[实际核验](../evidence/contest-release-2026-10-12/desktop-copy.json)。原工作区64f03fc和未跟踪docs/playtests保持；没有强推、修改仓库权限或覆盖无关修改。实体设备、儿童、教研、人工听审及权利状态仍分别待验，不把实际上线冒称这些审核通过。
