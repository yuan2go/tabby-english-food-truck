# 2026-10-12 · 参赛Demo修复与验收主报告

本轮本地直接实施，原工作区未改。文档先治理独立提交，然后工程与体验分别提交。五章、双野餐、自由厨房、十类小游戏与120概念保留，未新建平行设计、运行时AI或账号经济。

## 身份与实际状态

baseline origin/main `f359b4053cf73e0103bf13b46d26496f19868508`；文档治理 `9a06559714c2ab3f3d0e75f7c915bfabe38eaceb`；工程修复 `005e2c06e9e5f43aecfeffb534f848527f1cb066`；分支 `codex/demo-repair-2026-10-12`。当前代码/定向验证完成，正在准备体验提交后的干净同构建整合验证。最终受测SHA、构建身份、命令、画面、待验路径及证据索引在最终验收记录补齐；此阶段不声明工作包3通过。

已确认缺陷D01–D04/T01复现原始日志在logs，体验首次回归失败在browser-experience-ui、browser-ui-space，与修后browser-experience-converged分开。日志和失败图片/视频均保留。

完整单元284/284，相关单元先红后绿。原生Node22.12.0（无诊断loader）、定向UI5/5、lint退出0（仍有122 warnings/17 infos）、build含typecheck退出0，685资源/458speech/50食品映射通过；详细最终运行结果随后补齐。

手机/Pad仅浏览器模拟：用户明确“先用浏览器模拟设备，暂时没有听审”。实体手机/Pad性能和触控、人工听审、目标年龄观察、负责人视觉/手感、教研和分发权独立BLOCKED/PENDING；没有观察者与监护人同意，不开展或伪造儿童观察。

[独立复核](code-review.md)；[声音队列](audio-review-queue.csv)；[技术信号检查](audio-technical-summary.json)；[D02语义等值](manifest-semantic-check-corrected.json)。声音技术检查不等于听审。
