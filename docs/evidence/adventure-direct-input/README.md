# WP-ADVENTURE-DIRECT-INPUT-01 验证记录

基线 main `e3724a59cfe958a1d584aa4864988aeec73ba7e9`；分支 `codex/adventure-direct-input`。运行源码与干净生产构建 `d874531f565f558d4a51cdb5b245b6beb06ee0a9`，构建 `dirty=false`，内容 `m2.4-adventure-1`，资源 hash、环境和实际预览地址见 `build.json`。其后只整理证据与交付文档。负责人已明确要求停止新增或重跑测试，由“提交并合并刚完成的修改”统一提交、推送、PR与合并；本实现聊天停在上述 HEAD，不执行这些 Git 写操作。具体交接见 [HANDOFF.md](HANDOFF.md)，云端结果由 [cloud-delivery.md](cloud-delivery.md) 和统一交付消息记录。

## 当前候选验证

环境：macOS 26.6.2 / Node v24.15.0 / npm 11.12.1 / Playwright 1.63.0 / Chromium 153.0.8010.12。

| 命令/范围 | 结果 | 退出码 | 证据 |
| --- | --- | --- | --- |
| `npm test` | 214/214，15个文件 | 0 | `unit.log` |
| `npm run lint` | 无错误；49 warning / 7 info保留 | 0 | `lint.log` |
| `npm run resources` | 347文件 / 196语音引用 / 50食品 | 0 | `resources.log` |
| `npm run build`（含typecheck） | 成功；Phaser大块警告保留 | 0 | `build.log` |
| 下列同一生产构建的串行浏览器组 | 16/16；22.7分钟 | 0 | `browser-ci.log` |
| 默认画质桌面25关与双设备交叠 | FAIL 1/1；8.3分钟；进入23/25后旧脚本重复送餐 | 1 | `default-desktop.log`；未修改或重跑 |

完整浏览器命令：`CI=1 TEST_PORT=4192 npx playwright test e2e/adventure-flow.spec.ts e2e/game.spec.ts e2e/m22-boundaries.spec.ts e2e/m22-growth.spec.ts e2e/m22-visible-walk.spec.ts e2e/m22-playability-visible.spec.ts e2e/minigames.spec.ts`。

这组使用既有省电画面设置，393×665 DPR3模拟触控为主，连续操作另覆盖1280×720；恢复路径含1024×768和768×1024。全25关的可见图片/正式食谱走查不读隐藏答案、不注入进度，最终计数见 `visible-cost.json`；工程通关另核对实际食品实例、输出预留和暂停/刷新守恒。两条25关分别完成后才记录本组PASS，未将中间失败拼接成整轮通过。配对、拼写和双语、快捷操作、音频失败、新无尽教学、故事分支重玩同组通过。

`operation-performance-ci.json` 是带录像、软件GPU、省电设置的自动化记录，不能证明真机60fps。当前包未进行正式无录像性能采样、WebKit或完整所有历史浏览器脚本（NOT_RUN）。

截图：`scene-result-phone-393x665.png`、`juice-desktop-1280x720.png`、四类料理手机图及 `grown-yard-phone.png` 均来自上述真实操作。运行地址：自动化 `http://127.0.0.1:4192/`；保留给负责人的本地生产预览 `http://127.0.0.1:4193/`。部署仍未执行。

最后一次额外桌面命令为 `CI=1 TEST_PORT=4194 npx playwright test e2e/wp-dual-story-throughline.spec.ts`。脚本自建1440×900、DPR1、触控和录像的 context，没有继承省电 storageState，因此此轮为默认画质。正常完成前22关，进入 `c5-help`；第四章加工时准备第二盘、第五章两设备同时加工的断言和截图已产生，随后 `choosePrep('● 2号盘')` 拿起整盘、`tap('guest-1')` 已交付，旧脚本又调用 `handOver`，报 `no waiting guest`。这属于遗留脚本与已批准直接交付语义不一致，不能计默认画质整轮PASS，也不据此认定食品规则失败。待负责人以后允许测试时再修正该脚本并复验；本次明确不修改、不重跑。

现存执行产物已归档至 [execution-artifacts](execution-artifacts/manifest.json)：全部当前任务前缀临时日志、两份通过正常游玩生成的检查点、最后一轮完整 `test-results`（含录像/失败现场/隐藏状态文件）、HTML报告，以及既有 `dist` 的 `production-build.tar.gz`。清单记录原路径、归档路径、字节数与SHA-256；只复制、打包和读取，没有重新构建或测试。原先被后续运行覆盖且未归档的临时录像无法补齐，保留上述明确限制。

## 修复证据与中间失败

- 基线 npm test 198/198，退出0。直接输入7项首先全失败，修复后7/7。后续新增真实接餐/续玩/版本迁移/机器真实杯与慢帧检查，各有失败后通过记录。
- 序章浏览器回归先失败（session.levelId undefined、进入旧整章订单），统一入口后首轮 adventure-flow 3/3，手机393×665与桌面1280×720实际完成苹果、果汁与刷新续玩。
- 独立代码审查发现机器仅有杯却提示启动、工具架解锁贴图未加载、首页继续绕过新分支选择3项P2；补复核还发现已有活动分支无 Profile 选择记录时会重开、重玩前关后下一页复用已完成分支。已全部修复；只读实际规则脚本复核退出0，未发现残留P2。浏览器最终候选检查仍独立执行。
- `989eef2a0493a739914ecb09fe317fea5745c4e0` 干净生产构建的完整串行组在前4项通过后，为补齐上述重玩缺口主动停止（1中断/10未运行，退出130），不能计整轮通过；见 `partial-browser-before-replay.log`。新增重玩测试先有一次按钮名称写错的脚本失败，修正选择器后在旧构建实际走到重玩前关的结尾，因缺少明确重玩入口失败（退出1），见 `replay-initial-failure.log`。未删除断言或注入通关状态。
- 首轮默认画质手机与桌面两个长跑并发。手机第三章第3关果汁等待15000ms超时，失败截图显示实际仍processing（约20%），不得记为整轮PASS；桌面执行至第15关后主动中断。两命令退出130，手机其中已有1失败、1中断，桌面1中断。已检查CPU软件GPU高负载和丢弃慢活动帧的规则；修复有上限的慢帧推进，不提高超时、不注入进度。失败截图和文本永久保留为 `initial-slow-frame-failure.png` / `initial-slow-frame-error.md`；首轮临时原始录像未归档，不作为可用交付证据。
- 后段并行测试的旧送餐按钮改为点盘+点客人，明确第二盘参数；测试读状态只核对守恒，不注入通关状态。默认TEST_PORT支持独立生产预览，防止复用旧项目服务。
- `63f32a207aacc933a3021cdc097e3a311a213a8b` 串行组7通过后，无尽首教实际暴露苹果默认进入机器而无法继续递盘；第9项可见故事走查主动中断，总计7通过/1失败/1中断/7未运行，退出130，见 `browser-before-entry-fix.log` 与 `initial-endless-entry-failure.png`。果汁入口现在默认托盘，只有机器真实loaded时保留机器投料位置；不根据请求选答案。加严实际教学食品归属断言后定向1/1退出0，见 `entry-targeted.log`；最终完整16项已经在新候选整组重跑通过。

## 验收边界

仅工程与浏览器路径验证。实体iPhone 15 Pro＋Chrome、负责人体验接受、教研、儿童观察与人工听审分别PENDING / NOT_RUN；资源仍开发素材未审核，不声称已好玩或公开可发布。本聊天无推送、PR、合并或部署；统一交付聊天另有合并授权，结果以其读回为准。无新外部素材或依赖升级。
