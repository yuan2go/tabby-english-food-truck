# M0/M1 浏览器证据

本目录只保存本项目正常首页产生的证据。规则状态没有通过测试后门或 localStorage 注入成通关；坏版本/拒绝存储/资源错误用例明确进行故障注入。完整录像记录真实输入，截图不是效果图。

运行代码身份：`0188720efcacea481d92398c6bf84c0420dcf6bc`；后续提交只整理证据、文档和录像配置。完整命令、环境与限制在 [STATUS](../STATUS.md) 维护。

- 手机交错：[实际截图](phone-interleaved.png)、[完整录像](phone-interleaved.webm)、[逐段复查图](phone-interleaved-review.png)。Canvas 指针从首页完成教学、便签备料、加工期间交水果，再交果汁。
- Pad 串行：[竖屏](pad-portrait.png)、[横屏](pad-landscape.png)、[完整录像](pad-serial.webm)、[逐段复查图](pad-serial-review.png)。键盘操作先交果汁，再做水果，中途旋转。
- 输入与恢复：[360×640](small-phone-recovery.png)、[844×390 触控](phone-landscape-touch.png)、[真实冻结事件](native-lifecycle.json)。

agent 实际查看了上述截图以及两条录像全时段按 0.5 秒抽帧的复查图；各自 `*-review.json` 保存原片时长和抽帧数量。视频没有音轨，不能作英语听审。画面外黑边是录像画布，不是游戏滚动区域。全部是 Chromium 模拟视口，没有实体设备证据。

`performance.json` 为操作路径实际采样，包含原始资源与帧/输入样本；第二次 requestAnimationFrame 只是显示反馈延迟代理，不是直接显示器延迟、INP 或真机性能。

本轮素材仍缺获准狸花猫参考，所以屏幕显示待确认标记。截图或规则通过不能使角色制作、负责人视觉审核或 M1 整包自动通过。
