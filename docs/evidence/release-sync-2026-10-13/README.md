# 最新main重新发布与云端交付核对 · 2026-10-13

负责人明确授权提交/推送全部代码、报告和文档，创建PR、合并main，并更新现有站点供所有人访问。只读核对发现代码[PR25](https://github.com/yuan2go/tabby-english-food-truck/pull/25)、材料[PR26](https://github.com/yuan2go/tabby-english-food-truck/pull/26)均已合并；最新main为`829bb7ffe68d2110cf4a9165f85d45febf25e2bd`。本次从该main建立隔离worktree及分支`codex/release-sync-2026-10-13`，保留原工作区及其他worktree。

## 提交范围核对

原工作区仍停留在历史分支`codex/player-review-2026-10-11`、SHA`64f03fc716de70e20f64f9bbc3802de7601a460f`，其本地未跟踪`docs/playtests/`共392件、407,529,915字节，与最新main对应文件逐件SHA-256/字节相同，缺失0、差异0。两个近期实现worktree的Git状态均干净；其代码与材料已合并。本次只追加发布回执、检查脚本/结果/两张真实截图及README/STATUS/交付/索引更新，没有遗漏待提交的运行代码，也没有重复上传同一批历史产物。

## 原站重新发布

从上述干净main构建，运行源码/资源/依赖/构建配置相对原v6代码main`1c6af31fd2c109fca3cb36786f2e5232814b5839`无差异。Sites保留原project`appgprj_6ab141055ab8819186112dee423d0d04`、网址和public权限。1040个保留源路径与GitHub main逐字节相同；历史证据留在GitHub，运行发布包另存。

Sites source SHA为`1b56dff39acd36aba40bcdc18864bdb15e45bbfc`，v7已部署succeeded。线上构建SHA为`829bb7ffe68d2110cf4a9165f85d45febf25e2bd`，dirty=false，content=continuous-gameplay-1。完整opaque版本/部署ID、原始tar及平台规范化归档hash见[deployment.json](deployment.json)。后续本次纯材料合并SHA不冒充新的游戏构建SHA。

[公开体验](https://tabby-english-food-truck.aw9923299.chatgpt.site)：所有人持链接可访问，无需游戏账号；当前网络访问需要开启VPN。

## 本次实际验证

环境macOS arm64、Node24.15.0、npm11.12.1。

| 命令/检查 | 结果/退出码 |
|---|---|
| `npm ci` | 67包、audit0 vulnerabilities / 0 |
| `npm test`（干净main） | 371/371、29文件 / 0 |
| `npm run build`（含typecheck） | 通过，保留大chunk警告 / 0 |
| `node docs/evidence/release-sync-2026-10-13/verify-public.mjs` | 两个新匿名Chromium会话 / 0 |
| 平台部署回执与get_site | v7 succeeded、access_mode=public |

浏览器经本机现有VPN代理连接原公开URL，没有导入cookie/存档、授权头或写入通关状态。393×665手机模拟和1280×720桌面均读回HTTP200、上述完整运行SHA/资源hash、dirty=false和实际公开release元数据；正常首页进入故事，故意错送香蕉后食品保留，放回后真实送出苹果并获得接收收据，pageerror为空。APP启动自行生成默认存储键，不能称初始localStorage为空。读回用于核对，不用于推进游戏。

[匿名结果](anonymous-verification.json) · [复现脚本](verify-public.mjs) · [手机真实画面](public-393x665.png) · [桌面真实画面](public-1280x720.png)

完整45浏览器、五章/两野餐路线本次NOT_RUN；运行输入未变，原准确代码head371/45和原v6匿名完整路径见[既有完整报告](../continuous-gameplay-2026-10-13/README.md)。本次仅声称上述新验证，不把旧结果改成v7全矩阵。真人/儿童/实体设备/教研/人工听审NOT_RUN，素材与声音权利PENDING、开发TTS未审核，历史真机NEEDS_REVISION和60fps NOT_MET保留。

本次归档PR只改README/docs；最终工作提交、PR及合并main完整SHA以GitHub回执与交付回复为准。不强推、不改仓库权限/工作流或分支保护。
