# 本轮制作资源与审核

这些资产全部为本仓库新制作。未读取、复制或抠取旧项目。`manifest.json` 是实际文件登记，记录原稿与运行导出的尺寸、字节、SHA-256、Alpha、来源、派生与审核状态；`npm run resources` 重新核对文件。

## 图片

2026-09-20 使用 OpenAI 内置 imagegen，三次新图生成（完整实际提示词见 [prompts](prompts.md)）：

1. `source-market`：1536×1024 原创纸艺集市餐车环境板；墨绿木结构、赭黄白色条纹遮阳篷、暖木柜台、晨光与树叶。明确要求无人物、食物、杯盘、设备和文字。
2. `source-props`：1536×1024 六格透明道具原稿；苹果、香蕉、空杯、果汁杯、绿色果汁机、托盘。同方向光、纸纤维与清晰轮廓。透明背景要求经实际 Alpha 像素核验，不依据预览底色判断。
3. `source-guests`：1536×1024 六姿态透明角色原稿；兔子与刺猬，各自等待、接物、挥手三种姿态。客人身份与请求不固定绑定。明确要求无猫、无文字。

`art/source` 保留生产原稿。`scripts/export-assets.mjs` 机械裁切独立资源、调整运行尺寸并输出 WebP；没有手工绘画修改，也没有将插值放大称为原生高清。Alpha 完整保留；背景原稿非完全不透明，导出时按餐车底色 flatten。实际最终尺寸见清单。

运行入口：`src/game/assets.ts` → `TruckScene.preload()`，加载独立 WebP。客人使用三个独立姿态与规则时钟控制的接物/离场过程；果汁填充与食品轨迹由 Phaser 绘制，不宣称为逐帧动画。

**参考已选定，派生待制作/审核**：本轮实际附件冻结为 reference/tabby-approved-received.png，1254×1254 RGB，无 Alpha，SHA-256 e2eddeddbbd94edd6813b4ac64e29d19c34c4f07cc5553dbeef7c54b216fbaca。来源：用户本轮上传且明确指定为本项目制作参考；用途：角色身份与姿态制作。未收到所述 tabby-approved-reference.jpeg 原字节，不转码冒充原件。获准形象不等于派生运行效果、权利或内容审核。

图片权利与视觉审核均 PENDING，AI 生成不是人工批准或公开发布许可。

## 声音

本地 `public/audio/*.wav` 是 macOS `say -v Samantha -r 150` 实际合成，经 `afconvert -f WAVE -d LEI16@22050` 导出。请求、apple/banana/apple juice、two apples、示例与感谢语保存在本地；一个 HTMLAudioElement 前景通道取消旧播放，后台不补播。Web Audio 振荡器合成轻量操作反馈，不含第三方采样。未采用背景音乐。

状态统一 `DEVELOPMENT_TTS_UNREVIEWED`。实际开始、结束、中断、失败写入有限记录；这些记录只证明浏览器播放事件，不证明听审或孩子听懂。未审核声音不作为正式独立听力证据。声音商业分发权尚未确认，公开发布前需替换为获准/听审音频或完成权利核验。

## 代码、字体与模板

工程手写，没有复制 Phaser/Vite 模板代码或示例 UI，没有模板遥测脚本或分析 SDK。Phaser 3.90.0、React/React DOM 19.1.1 为 MIT；TypeScript 为 Apache-2.0；Vite 为 MIT。依赖的实际包与完整性锁在 package-lock.json。项目自身代码未自行替负责人设定开源授权，仓库保持原权限。

字体用浏览器系统字体栈 Trebuchet MS / PingFang SC / Microsoft YaHei / sans-serif，没有重新分发字体文件。当前仅有本地资源请求，无后端、账户、麦克风和运行时模型。

构建期图像工具 sharp 使用 libvips，锁文件中的平台二进制含 LGPL-3.0-or-later（部分组合为 Apache/MIT/LGPL）。其位于 devDependencies，仅用于本机导出与校验，不进入浏览器 dist；不把整个依赖树错误写成全部 MIT。仓库不分发 node_modules。
