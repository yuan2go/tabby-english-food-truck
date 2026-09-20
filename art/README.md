# 本轮制作资源与审核

这些资产全部为本仓库新制作。未读取、复制或抠取旧项目。`manifest.json` 是实际文件登记，记录原稿与运行导出的尺寸、字节、SHA-256、Alpha、来源、派生与审核状态；`npm run resources` 重新核对文件。

## 图片

2026-09-20 使用 OpenAI 内置 imagegen，三次新图生成（完整实际提示词见 [prompts](prompts.md)）：

1. `source-market`：1536×1024 原创纸艺集市餐车环境板；墨绿木结构、赭黄白色条纹遮阳篷、暖木柜台、晨光与树叶。明确要求无人物、食物、杯盘、设备和文字。
2. `source-props`：1536×1024 六格透明道具原稿；苹果、香蕉、空杯、果汁杯、绿色果汁机、托盘。同方向光、纸纤维与清晰轮廓。透明背景要求经实际 Alpha 像素核验，不依据预览底色判断。
3. `source-guests`：1536×1024 六姿态透明角色原稿；兔子与刺猬，各自等待、接物、挥手三种姿态。客人身份与请求不固定绑定。明确要求无猫、无文字。

`art/source` 保留生产原稿。`scripts/export-assets.mjs` 机械裁切独立资源、调整运行尺寸并输出 WebP；没有手工绘画修改，也没有将插值放大称为原生高清。Alpha 完整保留；背景原稿非完全不透明，导出时按餐车底色 flatten。实际最终尺寸见清单。

运行入口：`src/game/assets.ts` → `TruckScene.preload()`，加载独立 WebP。客人使用三个独立姿态与规则时钟控制的接物/离场过程；果汁填充与食品轨迹由 Phaser 绘制，不宣称为逐帧动画。

**参考已选定，派生已接入、待负责人审核**：本轮实际附件冻结为 reference/tabby-approved-received.png，1254×1254 RGB，无 Alpha，SHA-256 e2eddeddbbd94edd6813b4ac64e29d19c34c4f07cc5553dbeef7c54b216fbaca。来源：用户本轮上传且明确指定为本项目制作参考；用途：角色身份与姿态制作。未收到所述 tabby-approved-reference.jpeg 原字节，不转码冒充原件。获准形象不等于派生运行效果、权利或内容审核。

图片权利与视觉审核均 PENDING，AI 生成不是人工批准或公开发布许可。

## M1 升级制作（2026-09-20/21）

8 次内置 imagegen 分别生成独立 1254×1254 原生 Alpha 猫姿态：idle、read、reach、carry、place、greet、blocked、celebrate。第一张从用户实际 PNG 制作，其余以同角色 idle 为派生参考；棕灰虎斑、金眼、浅口鼻、灰项圈、绿围巾、背包与画面颈部偏右露出的白色定位器不变。没有整体镜像。提示词/意图记录见 [character-prompts.json](character-prompts.json)；idle 项为制作摘要，其余为实际派生提示词。Agent 查看了所有输出，不等于人工视觉或权利审核。

原稿在 `art/source/cat-*.png`，运行层为 `public/assets/cat-*.webp`；`export-character.mjs` 仅按有效 Alpha 裁边、留 5px 边距和缩小到最长边 640，不从低清合集放大。实际裁边/有效像素见 [character-exports.json](character-exports.json)，全部尺寸/hash/Alpha/来源在 manifest。一次额外 imagegen 生成独立 1536×1024 透明 `tray-hd.png`（意图：保持现有墨绿金边双把手纸艺托盘造型与俯视方向，单盘大图，无食品/文字/背景）；运行导出宽 960。

已有客人恢复到原稿帧的 494px 高，机器使用原有 480px 有效裁区，均禁止插值放大。食品实际 320px，满足手机/Pad 当前最大显示尺寸；背景保持原稿 1536×1024、按比例 cover，裁切而不拉伸。参考图从未作为运行贴图。

正式运行注册表加载全部 8 猫姿态。猫实体按 read → carry → reach → carry → place 任务阶段变化，苹果/香蕉取各自原料位置，组合逐件取；独立食品跟随姿态手锚，再进入提交时预留盘位。接待、递交、回位、受阻和短庆祝也用不同姿态。方法是姿态帧切换与位置插值，不宣称骨骼动画或每一中间帧均为独立画稿。待机轻微呼吸位移只是附加表现。低动态保留姿态和规则因果。

## 声音

本地 `public/audio/*.wav` 是 macOS `say -v Samantha -r 150` 实际合成，经 `afconvert -f WAVE -d LEI16@22050` 导出。请求、apple/banana/apple juice、two apples、示例与感谢语保存在本地；一个 HTMLAudioElement 前景通道取消旧播放，后台不补播。新请求 apple/banana 以 145 wpm 合成，其余历史文件为 150 wpm。统一 Web Audio 管理音乐、环境、机器与操作，详见 [合成声音登记](audio-synthesis.json)。16 秒轻量音乐、8 秒户外鸟鸣/低底噪近似环境、1 秒机器循环、9 类短反馈均为代码原创波形，无第三方采样；不是实地录音。英语期间压低背景与机器；PROCESSING 循环、暂停/后台/重开、拒播和失败生命周期受统一管理。总静音及语音/音乐/环境/音效开关保存。正式听审 NOT_RUN。

状态统一 `DEVELOPMENT_TTS_UNREVIEWED`。实际开始、结束、中断、失败写入有限记录；这些记录只证明浏览器播放事件，不证明听审或孩子听懂。未审核声音不作为正式独立听力证据。声音商业分发权尚未确认，公开发布前需替换为获准/听审音频或完成权利核验。

## 代码、字体与模板

工程手写，没有复制 Phaser/Vite 模板代码或示例 UI，没有模板遥测脚本或分析 SDK。Phaser 3.90.0、React/React DOM 19.1.1 为 MIT；TypeScript 为 Apache-2.0；Vite 为 MIT。依赖的实际包与完整性锁在 package-lock.json。项目自身代码未自行替负责人设定开源授权，仓库保持原权限。

字体用浏览器系统字体栈 Trebuchet MS / PingFang SC / Microsoft YaHei / sans-serif，没有重新分发字体文件。当前仅有本地资源请求，无后端、账户、麦克风和运行时模型。

构建期图像工具 sharp 使用 libvips，锁文件中的平台二进制含 LGPL-3.0-or-later（部分组合为 Apache/MIT/LGPL）。其位于 devDependencies，仅用于本机导出与校验，不进入浏览器 dist；不把整个依赖树错误写成全部 MIT。仓库不分发 node_modules。
