# 项目状态

## 当前基线 · 2026-10-12

默认分支 `origin/main`。本轮fetch读回 **f359b4053cf73e0103bf13b46d26496f19868508**；PR #14整合源码在 `43d7c76c80df54361790c47ba1715fe7290f9039`，PR #15已合并验证报告与执行产物。43d7c76至f359b40之间的src/public/art/package/lock没有变化，因此最新报告仍对应当前游戏源码和资源；不冒称在f359b40重测。

原工作区分支 `codex/player-review-2026-10-11`、HEAD `64f03fc716de70e20f64f9bbc3802de7601a460f`，有未跟踪 `docs/playtests/`。本轮只读核查并保护这些文件，正式材料在独立分支 `codex/contest-design-description-2026-10-12` 制作。

另发现本地候选 `codex/demo-repair-2026-10-12`，核查时HEAD `005e2c06e9e5f43aecfeffb534f848527f1cb066`，尚未包含在本轮main基线。其变更及后续验收不属于本说明的已验证事实；不替另一个工作包确认修复。

## 实现与最新验证 · ENGINEERING_FAILED / EXTERNAL_ACCEPTANCE_PENDING

已实现五章共同活动、首次实际接收决定的野餐两路、自由厨房/作品/朋友回访、十类可选小游戏、120学习概念与独立供应目录。范围与规则见01–04；目标与设计约束不表示每项体验已验收。

最新[整合验证报告](playtests/2026-10-11-integrated-validation.md)于2026-10-12收尾，[完整证据索引](playtests/2026-10-11-integrated-validation-43d7c76/README.md)保留截图、录像、读回及失败。受测baseline/final均为 **43d7c76c80df54361790c47ba1715fe7290f9039**、dirty=false、content `adventure-experience-2`。环境macOS26.6.2 arm64、Node22.12.0、Chromium153.0.8010.12；桌面1280×720、模拟触控393×665及短横屏。

| 观察/检查 | 已有结果及边界 |
| --- | --- |
| 五章、两路野餐、自由厨房 | 正常UI代表路径完成；使用图示、教学、反馈和可访问名称，非儿童独立通关 |
| 十类小游戏 | 每类至少一条代表UI路径；不冒称所有关组或120词均逐项浏览器验收 |
| build含typecheck、resources | 当次exit0；资源685文件/458语音引用；播放及文件检查不等于人工听审 |
| lint | 当次exit1，manifest格式1 error；历史绿色结果不能替代 |
| npm test | 首次280/281通过，缺两fixture造成ENOENT；补取同SHA fixture后仅相关9项通过，未重跑整套 |
| 原生browser list/整套 | Node22 JSON导入收集失败，exit1；独立loader是诊断手段 |
| 适配浏览器 | 首次23通过/3失败；完整Chromium默认画质定向2通过/1失败；不能合并成全绿 |
| 交互 | 演出控制裁切、场景暂停焦点越界已复现；单件/整盘意图及旧进行提示有体验问题 |

实体iPhone15 Pro＋Chrome新构建 **NOT_RUN**，历史 **NEEDS_REVISION**；Pad当前整合构建专门触控路径 **NOT_RUN**。负责人视觉/手感 **PENDING**；儿童观察、教研、人工听审 **NOT_RUN**；图片/开发声音分发权 **PENDING**；历史60fps **NOT_MET**，当前未重新验收。实际隐藏后台及普通回访轻食谱计时专项UI路径NOT_RUN。公开发布不能记为通过。

## 本轮文档工作包

治理已独立提交 `ba4685144bfff0fe834acb37db1b2a87ec7da221`。正式正文、3页同稿PDF、三张真实浏览器运行配图和精简追溯附录见[参赛材料](submission/design-description.md)与[证据](submission/evidence.md)。必要文档核验已完成，见[记录](submission/validation.md)；这是材料完成，不是游戏/真机/发布审核通过。

先将被替代的阶段合同、实施勾选、临时授权和旧状态原文归档，合并现行索引及验收说明；[治理索引](archive/pre-submission-2026-10-12/index.md)列明来源和非本轮候选。治理独立提交后撰写参赛材料。仅核查事实、引用、配图和阅读/导出效果；游戏完整单元、lint、资源运行检查、build、E2E及真机 **NOT_RUN**。材料制作阶段未新增玩法、运行时AI、依赖或部署，也未推送、合并、改权限或启动工作流。材料完成不表示游戏验收通过。

负责人随后明确授权完整推送本次材料、创建PR并合并main，保留其他未提交修改，不部署、不重复游戏测试。仅本次Git交付范围采用该新授权；来源、操作边界与远端回执规则见[云端交付记录](submission/cloud-delivery.md)，最终实际结果在PR正文和交付回复读回，不修改历史受测结果。

既有站点于2026-10-12通过浏览器实际打开，DOM标识为SHA `cc36166f521fe5b92455321f0a4bd609a1d201fd`、dirty=false、content `m2.2`；不能用于证明本说明的五章/自由厨房版本。

## 历史追溯

原阶段完整记录在[治理前STATUS原文](archive/pre-submission-2026-10-12/STATUS.md.txt)；工作包受测结果仍见各[证据入口](evidence/README.md)。失败、资源来源/权利和未实现候选不删除。历史“不测试”“可合并”等仅对应当时任务，不作为当前或未来授权。
