# 2026-10-13 · 连续游戏核心重构

ENGINEERING_PASS / PUBLIC_V7_DEPLOYED / ANONYMOUS_ENTRY_PASS / EXTERNAL_PENDING。

2026-10-13重新发布：代码PR25、材料PR26均已合并main；发布基线及线上运行构建为`829bb7ffe68d2110cf4a9165f85d45febf25e2bd`，dirty=false，continuous-gameplay-1。原工作区392件试玩文件与该main逐字节相同，缺失/冲突均为0。干净隔离构建371/371单元、typecheck/build退出0；原站v7部署succeeded、权限public，两个新建匿名Chromium会话分别在393×665和1280×720验证HTTP200、真实版本、正常故事入口、错送留物与苹果实际接收。后续本次回执归档只改README/docs，不改运行源码/资源/依赖，运行SHA与纯材料main分别记录。完整版本/部署ID、截图、命令/环境和边界见[本次报告](evidence/release-sync-2026-10-13/README.md)。

以下五章/双路线完整浏览器与人工边界是此前v6的记录；本次运行输入逐字节未变，只做上述发布所需验证，没有重跑45条全矩阵。

基线origin/main `f10f4b5b58e4ae815c213fa5ac69bf0591630682`。治理独立提交409070ac40d04e9d7e31c1d834f6ed0189c6f660先于代码，九份原合同逐字节归档，现行01–05唯一。实现分支codex/continuous-gameplay-2026-10-13；[PR25](https://github.com/yuan2go/tabby-english-food-truck/pull/25)已正常合并，受测head `a7ab8ed6de9567d8610eafd0b15fa35005180e9a`，原v6运行main `1c6af31fd2c109fca3cb36786f2e5232814b5839`，当时整树一致。原工作区64f03fc及本地docs/playtests保留。

全部五章、自然入客/短波/真实制作与接收/品尝/奖励/切章完成。保留两条野餐路线、并行加工、自由厨房、十类学习小游戏、50食品、120概念。无手动迎客、机械比较/开席/下一章门槛；规则决定进度，动画不结算。新完成收据与旧档迁移保留实际库存、在途、帮助、奖励和作品。

最终正常CI Ubuntu/Node22.12/Chromium：371/371单元、45/45浏览器、lint/resources/build退出0；[准确head回执](https://github.com/yuan2go/tabby-english-food-truck/actions/runs/38291628118)。本地macOS/Node24.15完整工程通过，资源818文件、133整句、120词检查。lint仍有原有142 warnings/23 infos，构建有大chunk提示。独立完整与增量审查无剩余Critical/Important。

实际发现并修复：首章目标与小食材、感谢遮挡请求、书页帮助漏记、野餐接收后回身锁、短横屏字幕越界、庆典长期遮挡；完成/清桌与旧奖励、档案凭证、跨章retry和profile恢复风险也已修复。失败记录、定向RED/GREEN和正常轨迹见[全报告](evidence/continuous-gameplay-2026-10-13/README.md)。候选矩阵42/43失败属于刷新helper选错入口，修复后定向通过，最终准确head45/45未删断言。

原Sites project/public/URL保持，v6部署succeeded。匿名两会话从空上下文正常完成五章/两路、错送、并行加工暂停刷新、自由作品与小游戏入口，103/96触控；DOM/存档读回完整运行SHA、dirty=false、continuous-gameplay-1。393×665、665×393、1280×720、820×1180实画及CI1024×768几何/鼠键分开记录。正式说明/一页PDF/原站真实图已更新，旧材料十文件/hash归档。

真人成人、儿童观察、实体iPhone/Pad、教研、人工听审NOT_RUN；素材/声音权利PENDING，开发TTS未审核。历史真机NEEDS_REVISION、60fps NOT_MET保留；代理可操作不意味着儿童好玩或学习有效，未宣称新的性能或外部公开审核通过。
