import { CONTENT_VERSION } from '../content/catalog';
import type { ForegroundAudio, SoundSetting } from '../platform/audio';
import { BUILD_INFO } from '../platform/build';
import type { GameController } from '../platform/controller';
export function Settings({
  controller,
  audio,
  close,
  refresh,
  quality,
  setQuality,
}: {
  controller: GameController;
  audio: ForegroundAudio;
  close: () => void;
  refresh: () => void;
  quality: boolean;
  setQuality: (v: boolean) => void;
}) {
  const read = (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };
  const exportSave = () => {
    const raw = JSON.stringify(
      {
        profile: controller.profile.value,
        session: controller.state,
        protectedRaw: controller.save.blocked ? controller.save.raw : null,
        legacy: controller.save.legacyRaw,
        protectedProfile: controller.profile.blocked ? controller.profile.raw : null,
        mini: read('tabby.foodtruck.minigame.m2'),
      },
      null,
      2,
    );
    const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tabby-m2-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section className="adult-settings" role="dialog" aria-label="详细设置">
      <button type="button" className="corner-back" onClick={close}>
        ← 返回
      </button>
      <h2>餐车的小设置</h2>
      {controller.save.legacyRaw ? (
        <p role="status">
          检测到 M1 存档，原文仍保留。M2
          使用新的故事与食谱记录，旧订单无法可靠映射；导出会包含旧档，不会覆盖它。
        </p>
      ) : null}
      {controller.profile.issue ? <p role="status">{controller.profile.issue}</p> : null}
      <div className="sound-settings">
        {(Object.keys(audio.settings) as SoundSetting[]).map((key) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={audio.settings[key]}
              onChange={(e) => {
                audio.set(key, e.target.checked);
                if (e.target.checked) void audio.unlock();
                refresh();
              }}
            />
            {
              {
                master: '全部声音',
                voice: '英语',
                music: '音乐',
                ambience: '小院环境',
                effects: '取放与设备',
              }[key]
            }
          </label>
        ))}
      </div>
      <label>
        <input type="checkbox" checked={quality} onChange={(e) => setQuality(e.target.checked)} />
        省电画面
      </label>
      <button type="button" onClick={exportSave}>
        导出全部本地进度
      </button>
      <details open>
        <summary>给大人的学习观察</summary>
        <p>这些是活动记录，不是掌握率。开发语音和内容尚未完成教研及听审。</p>
        <p>遇见过：{controller.profile.value.exposure.join('、') || '还没开始'}</p>
        <ul>
          {controller.profile.value.observations.slice(-12).map((o) => (
            <li key={o.id}>
              {o.target} ·{' '}
              {
                {
                  meaning: '词义',
                  listening: '听请求',
                  spelling: '拼写',
                  structure: '基础表达',
                  operation: '操作',
                }[o.dimension]
              }{' '}
              · {o.support.length ? `使用帮助：${o.support.join('、')}` : '较少辅助条件'} ·{' '}
              {o.result === 'completed'
                ? '完成'
                : o.result === 'introduced'
                  ? '看过意义示范'
                  : o.result === 'process-started'
                    ? '启动制作（操作）'
                    : '调整'}{' '}
              · {o.visit === 'revisit' ? '回访' : '初次'}
            </li>
          ))}
        </ul>
      </details>
      <details>
        <summary>版本与素材</summary>
        <p>
          Build {BUILD_INFO.sha}
          {BUILD_INFO.dirty ? ' · 工作区修改中' : ''}
          <br />
          内容 {CONTENT_VERSION}
          <br />
          资源 {BUILD_INFO.assets}
        </p>
        <output data-audio-diagnostics>{JSON.stringify(audio.diagnostics())}</output>
      </details>
    </section>
  );
}
