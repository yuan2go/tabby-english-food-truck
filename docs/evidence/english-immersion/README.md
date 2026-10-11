# WP-ENGLISH-IMMERSION-01 实际证据

baseline `64f03fc716de70e20f64f9bbc3802de7601a460f`；文档治理提交 `081e57e8aa8f0e251995c301e8f017c66e6716c8` 先于代码。实现提交 `c51c4f6bdc08cc581f948b4f797c6443634534d5`；隔离分支 `codex/wp-english-immersion-01`，原工作区未跟踪的docs/playtests/未读取、复制或覆盖。本包没有推送、PR、合并或部署。

## 实现与审查

明确订单由真实产品多重集合生成完整请求，涵盖冠词、数量、质量名词、夹层、单/双球及杯/筒；开放句只表达真实合法范围。制作提示、真实receive后的感谢、真实taste后的评价、探索/摆放/布置、主动分享、作品与历史回访统一进入DialogueDirector及既有ForegroundAudio。字幕始终英文整句可见，目标词加重，不伪造逐词同步；持续请求可从A/B一触恢复，历史至多6句，已播旧句不补播。

新增128段离线整句WAV，全部DEVELOPMENT_TTS_UNREVIEWED。单词资源/旧音频/图像与来源权利记录保留。speech、真实文件/hash、manifest、语料逐一映射；规则与奖励不由语音驱动。保持schema与会话键，不覆盖既有存档；历史食品已有接收才被记忆，即使尚未领奖，不据此解锁章节或布置。

按requesting-code-review技能实施独立只读代理审查及增量复核：修订历史回放被失效订单清空、资源暂停提前消耗首次自动机会、图鉴播放误记订单听取、单球请求数量、28px切客目标及开放请求可访问名称。最终增量复核未发现剩余Critical/Important，定向38/38退出0。此为代码审查，不是人工听审或负责人运行验收。

## 已执行工程检查

| 命令 | 结果 / 退出码 | 原始记录 |
| --- | --- | --- |
| baseline `npm test` | 241/241、17文件 / 0 | [baseline](baseline-unit.log) |
| `npm test` | 259/259、20文件 / 0 | [单元](unit-final.log) |
| `npm run typecheck` | 通过 / 0 | [类型](typecheck-final.log) |
| `npm run lint` | 0错误，54warnings/10infos / 0 | [lint](lint-final.log) |
| `npm run resources` | 475文件、324speech、50食品、128新增整句 / 0 | [资源](resources-final.log) |
| `TEST_PORT=4186 npm run test:browser` | 首轮13/15 / 1；两处失败保留 | [浏览器门禁](browser-gate.log) |
| `TEST_PORT=4186 npx playwright test e2e/immersion.spec.ts e2e/m22-boundaries.spec.ts e2e/m22-growth.spec.ts e2e/wp-dual-growth.spec.ts` | 修复后受影响6/6 / 0 | [定向门禁](browser-affected-final.log) |
| `npm run build` | 通过 / 0；Phaser块警告保留 | [构建](build-final.log) |

环境macOS26.6.2 arm64、Node24.15.0、npm11.12.1、Chromium153.0.8010.12，默认画质。浏览器从正式首页通过真实指针/按钮进入，状态只读用于守恒及事件核验，没有注入食品或通关状态。[环境与测试源指纹](environment.json)标明门禁构建为文档SHA＋dirty=true；[定向运行源码清单](affected-source-files.json)逐文件绑定受测源；实现提交与此清单一致。生产构建日志对应实现SHA、dirty=true（待提交证据）；最终干净交付HEAD的构建与本地HTTP读回见交付回复。没有在最终文档HEAD重复完整15条门禁。

## 文档治理

README、01–05与STATUS为当前权威；上一合同六份原文归档、逐字节核对见[hash](governance-integrity.json)及[历史索引](../../archive/pre-english-immersion-01/index.md)。废止碎片请求、默认隐藏英文、字幕混记纯听力和小院仅中文的约定；原失败证据、吐司/速度候选、资源来源/审核与有效待办保留。现有E2E合同增两条代表路径；截图写到当前输出，避免覆盖历史包证据，不建平行规范。

## 发现的失败与修复

红/绿日志均保留。最初content/events测试在模块尚未建立时导入失败；audio/preparation/lifecycle/resume/scope/memory回归先看到真实断言失败再修复。首次全单元发现改变客流会额外写入未实际展示的图片支持，修正后保留已接受订单不变断言。浏览器早期还出现一次临时语法错误、6秒离场等待不足及跨章同页面字幕为空；等待采用既有actor路径18秒标准，生命周期问题以单元补证，没有改变成功断言。

browser-immersion-2中回访本应记得实际接收的蛋筒，却只记得早前苹果，根因是未领奖的章节食品未写入长期活动记忆；[原失败画面/上下文](history-before-fix/)与memory红绿保留，实际食品现进入既有有界记忆。未修改奖励判定、伪造完成或删除断言。

最后完整15条运行保留五章、野餐另一分支、自由厨房、桌面键盘与三个小游戏的通过结果；其后只复跑受影响6条，没有重复无关全套。首轮两处失败分别为旧“Apple juice”片段断言，以及852×300便签触摸的后续点击落入新弹窗首按钮；[捕获目标红日志](ghost-click-red.log)确认后者。修复在Canvas完成手势时登记归属，捕获并消费同次后续点击，保留下一次DOM指针/键盘和卸载清理；原库存/帮助/300、342、393横屏断言未放宽。菜单断言更新为真实完整句。两者最终通过，短横屏与正常链[画面](affected-final-outputs/)经渲染查看，[hash](screenshot-hashes.json)供核对。

## 正常入口复现

在本worktree执行 `npm ci && npm run dev -- --port 4186 --strictPort`，打开 `http://127.0.0.1:4186/`。首页“正在准备·晨光开门”→“去厨房备餐”→首次教学“我来试试”→默认看/听Can I have an apple, please?→点1号盘与苹果→拿盘后点击句子/播放仍仅重听→点击A客人实际交付→接收后Thank you!→香蕉同样交付→“到活动桌”听Please open the drawer.→打开抽屉→重听下一步、种花→一起开席→下一院活动。

第二章厨房按真实兔兔请求做单球香草蛋筒；开放分享用香蕉冰淇淋杯（或合法其他杯装口味）→品尝后才Yummy! I like it.；收摊后自由开店→活动桌邀请兔兔，回忆实际蛋筒→停止接客、制作香蕉作品→送到桌边This is for you.→保存/翻食谱I made a banana.。代表E2E覆盖此链；五章和另一野餐分支由既有门禁验证。

## 外部验收与限制

人工听审、教研、实体iPhone15 Pro＋Chrome、儿童试玩均NOT_RUN；负责人画面/手感PENDING；声音分发权PENDING。历史真机NEEDS_REVISION和60fps NOT_MET保持，未重测性能。手机视口和DOM blur/focus事件模拟单列，不替代实体设备系统后台；无音轨录像不证明听审。托管CI/部署NOT_RUN，公开发布仍BLOCKED。已有Phaser块大小警告及lint告警保留；未升级依赖。正常工程PASS不能替代上述验收。
