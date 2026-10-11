# 2026-10-11 两包统一云端交付

负责人授权全部代码、报告、文档与现存任务执行产物提交、推送、PR并合并main，明确不要测试；随后明确放弃试玩报告。本次不收录原工作区docs/playtests，不删除其文件，不运行或重跑测试、构建、lint、资源脚本、浏览器或试玩。

基线完整SHA：`64f03fc716de70e20f64f9bbc3802de7601a460f`。交付分支：`codex/oct11-combined-delivery`。代码整合提交：`0883b3a54cb94c513bcf5e7d452b15d6565f4e2d`。

输入包与唯一历史提交数：

- 小游戏/120词：`d567e562808dbeb18f571e704a0ffacb0a611428`，[原PR #12](https://github.com/yuan2go/tabby-english-food-truck/pull/12)，8个提交。
- 五章体验深化：`2be658b2267131f1d1bf28490890b44fad0dc00c`，[原PR #13](https://github.com/yuan2go/tabby-english-food-truck/pull/13)，17个提交。
- 两分支共同基线相同，无重复新提交；25个历史提交＋1个代码整合提交＋1个执行产物/交付记录提交＝PR分支27个提交。云端采用merge方式后main新增28个提交，实际SHA与数量由Git读回，另记于云端交付回执。

行为变化包括十类可选小游戏、120去重概念、33短指令、15场景关/51任务、56课程组，以及五章单/双客、图示引导、真实食品使用、工具协作与回访作品。整合保留Adventure到游乐角及返回来源状态；文档分别保留两包范围，语音和资源按键合并。厨房schema7、content adventure-experience-2和场景小游戏独立存档保留。

## 现存产物来源与恢复

原包已入库的计划、实现报告、截图、短片、失败和覆盖表完整保留于 [小游戏证据](../minigames-vocab/README.md) 和 [体验证据](../adventure-experience-02/README.md)。本目录追加归档当时仍在磁盘的dist、最后test-results/playwright-report及任务专属临时日志/图像/原片；没有重新生成产物。`execution-artifacts/manifest.json`逐文件记录来源路径、归档内路径、字节与SHA-256，也记录每个压缩包的SHA-256；超过GitHub100MB上限的文件未产生。

- `vocab-existing-build.tar.gz` / `experience-existing-build.tar.gz`：原包既有生产构建；两个构建各自独立，均不是本次整合构建。构建身份以各自dist及原包probe记录为准。
- `*-last-browser-reports.tar.gz`：最后尚存的HTML报告、test-results及视频；被先前运行覆盖的内容不能凭空补齐。
- `*-existing-temp-artifacts.tar.gz`：任务专属/tmp前缀文件和目录，含历史失败、截图、原始录像、运行检查点及脚本。目录可能含多轮候选构建，不能统一记作最终通过。
- `vocab-source-apron.aiff`：本机静态语音生成时尚存的原始临时音频，未重新合成；仍属于未经听审的开发语音。
- `ci/`：只读下载的原PR最新失败日志，不能解释为本轮执行。

解包示例：`tar -xzf <archive.tar.gz> -C <empty-directory>`。这是历史产物恢复操作，不是检查命令。本仓库不提交node_modules、不改依赖或工作流，不部署。英语开发语音与素材审核状态维持原记录。

## 验证与限制

本轮整合版本：测试、构建、lint、资源运行检查、浏览器及实体设备全部 **NOT_RUN**（负责人要求）；无相应命令、退出码或运行环境结果。执行的仅为Git状态/历史/差异读取、冲突整理、现存文件复制压缩/hash和GitHub元数据读回。

历史运行环境、命令、退出码和正常浏览器路径分别见源包报告；词库最后受测源码1b2d7b3d15cff2d2446939c59be5040e61bb802c、体验最后受测源码ab7978f16f1d27f3baf155c834666f225576cad4，仅对应原包。历史264与258单元结果、分轮浏览器结果不能证明整合源码通过。

[词库CI run38145372683](https://github.com/yuan2go/tabby-english-food-truck/actions/runs/38145372683) FAILURE：Node22读取vocabulary-extra.json缺少type导入属性。[体验CI run38146000185](https://github.com/yuan2go/tabby-english-food-truck/actions/runs/38146000185) FAILURE：浏览器17项中15通过、五章与桌面宴会2项失败。本轮保留失败，不修成通过，不重跑。后续交付提交、PR标题与合并提交使用[skip ci]，不启动新CI。

负责人手感/真机/教研/儿童观察/听审/权利仍按原记录PENDING/NOT_RUN；历史真机NEEDS_REVISION与60fps NOT_MET保留。源码合并不构成部署或发布验收。
