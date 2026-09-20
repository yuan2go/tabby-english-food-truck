# M1 升级证据 · 2026-09-21

这些是本轮真实正常入口操作、原始量测和完整视频，不能替代负责人视觉接受、实体设备、教研听审或儿童观察。

## 身份和复现

- baseline main：`0b904284131eb425118c0a1baa7a8d0663201c8e`。
- 受测实现/实际生产构建：`1bf69a1f0db98bd612f309a1a147d00d0e9ab8d4`，构建时 clean，运行读取 dirty=false。
- 分支：`codex/m1-preschool-production`。之后的提交仅补文档与本目录证据，最终 full SHA 在交付消息/PR head；不把证据提交的 SHA 伪称成已经运行过的旧构建 SHA。
- 内容 m1.2；资源清单 SHA-256 `34f8548e8adc45b3b90f6c9c6b2f2a6b9730f28d6d858038003c4aa4d058ca51`。
- 生产入口 `dist/assets/index-B-jm2gfp.js`；[构建文件清单](build-manifest.json) 登记每个文件实际 hash/字节及运行身份。
- macOS 26.5.2 arm64，Node26.3.1/npm11.16，Playwright1.63/Chromium153.0.8010.12。无网络/CPU限速，localhost HTTP。模拟触控不是实体iPhone。

`npm run build` 从上述干净实现生成 dist；`npm run preview -- --port 4173 --strictPort` 启动同一份生产包。之后完整回归、显示测量、性能和录屏使用该包，没有在这些步骤之间重新构建。Phaser 大分块提示如实保留。

## 实际命令与退出码

| 命令 | 退出码 | 结果/原始记录 |
| --- | --- | --- |
| npm run typecheck | 0 | [strict TypeScript](typecheck.log) |
| npm run lint | 0 | [Biome，无告警](lint.log) |
| npm test | 0 | [28/28](test.log)：守恒、容量/预留、幂等、三模式、快照/坏档/拒绝存储、教学与回访、token重排 |
| npm run build | 0 | [生产构建](build.log)，保留Phaser分块告警 |
| npm run resources | 0 | [44文件+4合成音层/9类提示](resources.log) |
| npm run test:browser | 0 | [17/17](browser.log)，含子进程原生冻结/恢复 |
| node scripts/measure-display.mjs | 0 | [实际CSS/DPR/缓冲/文字纹理](display-measurements.json) |
| node scripts/performance.mjs | 0 | [操作段原始样本](performance.json) |
| node scripts/review-videos.mjs | 0 | 三条完整录像全时段0.5秒抽帧，142帧生成后由agent逐页查看；没有音轨 |

[机器可读验证记录](checks.json)。安装 npm ci 在本轮初始阶段 exit0，无依赖升级。最终未另跑 npm audit，不能继承历史 audit 结论。

修复中间失败如实保留：[第一整套16/17](first-full-run.log)、[第二整套15/17](second-full-run.log)、[输入修复后4/4](input-targeted-run.log)。第一轮6秒墙钟上限不足以稳定容纳5秒有效游戏时间和DPR3录像开销，保留精确规则断言，改浏览器上限10秒。第二轮在途食品截获连续落盘点击，实际导致少放一份；修复公共输入目的地解释，增加每次拿放库存断言，未删满盘/错误交付断言。最后17/17是上述生产实现的新结果。

## 完整路径和视觉证据

| 文件 | 实际路径 | 环境与边界 |
| --- | --- | --- |
| [低龄完整触控](guided-touch.webm) | 正常首页默认guided → 猫示范 → 点击拿放苹果 → CDP touch整盘递出 → 确认重玩预放杯果汁 → 加工/交付 | CSS393×665/DPR3，26.48s；53帧逐段复查 |
| [双订单完整触控](service-touch.webm) | 正常首页选service → 词块请求banana+apple，绑定2盘 → 改选1盘 → 猫按来源取料落盘 → 启动机器 → PROCESSING中整盘交水果 → 果汁完成再交付 | 同尺寸/DPR，28.24s；57帧复查。完整路径使用touchscreen和CDP Input.dispatchTouchEvent，未注入通关世界 |
| [Pad完整串行](pad-serial.webm) | 正常首页service → 键盘果汁制作/交付 → 水果准备 → 旋转 → 整盘交付 | 768×1024→1024×768，DPR1，15.64s；32帧复查。键盘路径不冒称触控 |
| [五请求完整触控](practice-touch.webm) | 单客顺序完成五类请求 → 换service拿食物 → 回practice → 刷新恢复 | CSS393×665/DPR3，真实浏览器touch |
| [词块触控](note-touch.webm) | 首尾/前后/重复词独立ID、取消、多指、旋转、返回词库 | 无语言提交；编辑不暂停加工 |
| [音频控制操作](audio-controls.webm) | 重听/背景压低、机器循环、暂停、静音保存与恢复 | 无音轨！只证明操作与诊断状态，不是听审 |

抽帧：[guided 1](review/guided-touch-1.jpg)、[2](review/guided-touch-2.jpg)、[3](review/guided-touch-3.jpg)、[4](review/guided-touch-4.jpg)；[service 1](review/service-touch-1.jpg)、[2](review/service-touch-2.jpg)、[3](review/service-touch-3.jpg)、[4](review/service-touch-4.jpg)；[Pad 1](review/pad-serial-1.jpg)、[2](review/pad-serial-2.jpg)。原始时间/帧数在对应 `*-review.json`。

已看到实际弯身取料、携带、放入指定盘、交付接物和空盘返回；角色不再被盘名文字盖脸。场内演示可跳过，自动化只为第一段保留观看时间，不把点击“我来试试”当已经理解。视觉接受仍 AWAITING_OWNER_REVIEW。

高清静帧：[取香蕉/组合携带](banana-source-touch.png)、[带食品整盘拖动](service-drag-food-touch.png)、[单盘拖动](whole-tray-with-food-touch.png)、[Pad竖屏](pad-portrait.png)、[Pad横屏](pad-landscape.png)、[小屏恢复](small-phone-recovery.png)、[手机横屏](phone-landscape-touch.png)。香蕉文件捕获于等待reach状态后，截图时可能已进入carry；完整动作依据视频而非文件名判断。

## 同视口同DPR前后量测

[用户手机原图](owner-phone-before.png) 为1179×2556；其实际CSS/DPR没有设备直读证据。受控对比另用同 CSS393×665 / DPR3 / visualViewport.scale=1，在原始baseline归档和新生产包从首页操作后采样。

| 指标 | 原baseline | 新生产包 |
| --- | --- | --- |
| Canvas实际buffer | 393×665 | 983×1663 |
| Canvas CSS | 393×665 | 393×665 |
| CSS transform | none | none |
| 1号盘文字纹理 | 99×23，16px，内部1x | 277×69，18px，内部2.5x |
| 最小语义命中 | 44 CSS px | 44 CSS px |
| 页面滚动尺寸 | 393×665 | 393×665 |

[前](baseline-comparison-393x665-dpr3.png) / [后](after-comparison-393x665-dpr3.png)，[原始测量](display-measurements.json)。纹理通过只读拦截Canvas2D fillText记录真实画布尺寸与变换；没有注入规则状态。旧引擎没有暴露世界尺寸，记录not exposed，不猜填。

渲染上限2.5倍、240万像素，低画质1.25倍/100万像素且设置保存。当前DPR3的屏幕合成仍约1.2倍，属于明确的预算取舍，不宣称全3倍原生缓冲。实体设备、缩放手感与低性能硬件 NOT_RUN。

## 操作性能和生命周期

[性能原始数据](performance.json)：首屏可操作1436ms；实际传输2,526,948字节。拿料、入机、启动、同时摆水果、递盘、暂停/恢复共14次触控，事件到第二个rAF代理p50=43ms/p95=59.6ms；159帧操作段间隔p95=50.1ms/max=83.3ms。不是显示延迟/INP，不证明60fps；无同设备同DPR旧性能对照，因此不宣称FPS提升。

[实际生命周期事件](native-lifecycle.json)：visibility hidden→freeze→resume hidden→visible，离线1800ms，助手和机器只各消耗前后50ms有效时间。独立原生Chromium避免runner强制焦点导致“假冻结”；不是手机Safari后台验证。

## 部署对应与尚缺条件

[现有站点读取](deployment-verification.json)：新浏览器无登录态，HTTP200，正常首页进入；线上脚本 `index-DD0KRite.js`，未提供SHA，UNKNOWN，Canvas仍393×665。此次新构建是 `index-B-jm2gfp.js` / `1bf69a1f0db98bd612f309a1a147d00d0e9ab8d4`，没有发布到线上。

本轮 PENDING_DEPLOYMENT；没有新建第二站点、上传部署、自动合并、改权限或启用工作流。本地预览不是公网交付。负责人运行效果待审；正式视觉/音频/素材权利、实体iPhone/Android/iPad、教研和儿童观察均未执行或待授权审核，不能由工程测试替代。用户选定参考不等于批准全部派生素材。
