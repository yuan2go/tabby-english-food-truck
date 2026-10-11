import { useEffect, useState } from 'react';
import { REQUESTS } from '../content/catalog';
import type { ForegroundAudio } from '../platform/audio';
import type { GameController } from '../platform/controller';
import { type ActivityGuidance, activityGuidance } from '../rules/adventure-guidance';
import { Food } from './Food';
import { SceneIcon } from './SceneIcon';
export function AdventureGuide({
  controller,
  audio,
  compact = false,
  navigate,
  obstacle,
}: {
  controller: GameController;
  audio: ForegroundAudio;
  compact?: boolean;
  navigate: (target: string, select?: string) => void;
  obstacle?: ActivityGuidance | undefined;
}) {
  const guide = obstacle ?? activityGuidance(controller.state);
  const [demoId, setDemoId] = useState<string | null>(null);
  const demo = demoId === guide.id;
  const [failedId, setFailedId] = useState<string | null>(null);
  const failed = failedId === guide.id;
  const play = () => {
    void audio
      .play(guide.audio)
      .then((r) => setFailedId(r === 'failed' || r === 'muted' ? guide.id : null));
  };
  useEffect(() => {
    if (compact) return;
    const timer = window.setTimeout(() => {
      if (!audio.active && !controller.pauses.size)
        void audio
          .play(guide.audio)
          .then((r) => setFailedId(r === 'failed' || r === 'muted' ? guide.id : null));
    }, 600);
    return () => {
      clearTimeout(timer);
      if (audio.active === guide.audio) audio.stop();
    };
  }, [guide.id, guide.audio, audio, compact, controller]);
  const waiting = controller.state.orders.find((o) => o.status === 'waiting');
  const showFallback = failed || !!audio.failure || !audio.enabled || !audio.settings.voice;
  const waitingId = waiting?.id;
  const products =
    showFallback && waiting && guide.id === 'kitchen'
      ? REQUESTS[waiting.request].products
      : guide.products;
  useEffect(() => {
    if (showFallback && waitingId)
      controller.command({ type: 'support', order: waitingId, reason: 'audio-unavailable' });
  }, [showFallback, waitingId, controller]);
  return (
    <section
      className={`goal-guide ${compact ? 'compact-guide' : ''} ${demo ? 'demo-active' : ''} ${obstacle ? 'obstacle-guide' : ''}`}
      aria-label="图示下一步"
      data-guide={guide.id}
    >
      <button
        type="button"
        className="goal-pictures"
        aria-label={`图示下一步：${guide.label}`}
        onClick={() => navigate(guide.target, guide.select)}
      >
        <SceneIcon kind={guide.from} />
        <span className="guide-arrow" aria-hidden="true">
          ➜
        </span>
        {products.length ? (
          <span className="guide-foods">
            {[...new Set(products)].slice(0, 4).map((p) => (
              <span className="guide-product" key={p}>
                <Food product={p} />
                <i role="img" aria-label={`数量${products.filter((item) => item === p).length}`}>
                  {'●'.repeat(products.filter((item) => item === p).length)}
                </i>
              </span>
            ))}
          </span>
        ) : (
          <SceneIcon kind={guide.to} />
        )}
        {obstacle && products.length ? <SceneIcon kind={guide.to} /> : null}
        <span className="guide-dots" aria-hidden="true">
          ●
        </span>
      </button>
      {demo ? (
        <div
          className="guide-demonstration"
          role="img"
          aria-label="观察物件、点选、带到目标位置的动作演示"
        >
          <span>
            <SceneIcon kind={guide.from} />
          </span>
          <span className="demo-finger">☝</span>
          <span className="demo-carry">
            <SceneIcon kind="carry" />
          </span>
          <span>
            <SceneIcon kind={guide.to} />
          </span>
        </div>
      ) : null}
      <div className="guide-caption">
        <small>{guide.label}</small>
        {showFallback ? <small>看图继续 · 声音可重试</small> : null}
      </div>
      <button type="button" aria-label="重听下一步" onClick={play}>
        ♫
      </button>
      <button
        type="button"
        aria-label={demo ? '收起动作演示' : '看看怎么行动'}
        onClick={() => setDemoId(demo ? null : guide.id)}
      >
        {demo ? '■' : '▶'}
      </button>
    </section>
  );
}
