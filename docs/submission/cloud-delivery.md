# 参赛文档云端交付记录

2026-10-12。负责人在完成材料后明确授权：完整推送本次文档治理、设计说明、配图、PDF和证据附录，创建PR并合并main；保留其他未提交修改，不部署、不重复运行游戏测试。该授权替代材料制作阶段“不自动推送/合并”的边界，仅适用于本次文档交付。

## 基线与范围

- 默认分支main，交付前fetch仍为 `f359b4053cf73e0103bf13b46d26496f19868508`。
- 分支 `codex/contest-design-description-2026-10-12`。
- 治理提交 `ba4685144bfff0fe834acb37db1b2a87ec7da221`。
- 正式材料提交 `acc7ebf481992a8a8b9b7e2e2fef99a5519e6b54`。
- 本次追加Git交付记录及PDF文件属性，未改正文、PDF、配图、源码、运行资源或依赖。

交付包括：现行文档/索引治理及12份历史原文归档，唯一[设计说明](design-description.md)、[3页PDF](design-description.pdf)、[证据附录](evidence.md)、[核验记录](validation.md)、3张真实运行配图及来源/hash/历史站点读回。正文和PDF仍对应原材料SHA-256，受测游戏仍为43d7c76，不能把合并后的新Git SHA当成游戏重新验收版本。

## 本次必要检查

本次仅Git状态/分支/main/权限可用性读取、文件清单和hash、文本差异检查及远端交付读回。完整游戏test/build/lint/typecheck/resources/E2E、浏览器玩法、真机、部署全部 **NOT_RUN**。所有新提交及merge消息使用 `[skip ci]`，不修改CI配置、触发条件或权限。

首次对整包执行 `git diff --check <baseline>..HEAD` 时，Git将PDF识别为文本并报告PDF内部二进制/交叉引用行的尾空白，退出2。仅针对该文件声明binary；PDF字节保持不变。随后整个基线差异及当前未提交差异的check均退出0，PDF的diff/merge/text属性均为unset，不重生成PDF。

本次Python核查正文/PDF与acc7ebf逐字节一致及原记录hash、三张配图hash、173个本地引用和src/public/art/package/lock空差异，均通过/退出0。这些是文件完整性和文档检查，不是重复游戏测试。

原工作区仍在 `codex/player-review-2026-10-11`，HEAD `64f03fc716de70e20f64f9bbc3802de7601a460f`，未跟踪docs/playtests保留。全部修改及Git写操作在本次独立交付分支进行；不checkout/reset/stash/clean其他工作区，不删除其他分支或worktree。

## 远端回执

本记录随交付提交；push、PR、merge后完整SHA与提交数量从GitHub及远端main实际读回，写入同一PR正文的云端交付回执，并在最终回复报告。未完成的操作不预先标为成功。

材料交付不等于游戏、真机、学习效果或发布审核通过。已有失败及听审/权利等外部边界保持不变；本次不部署，也不更新历史体验站点。
