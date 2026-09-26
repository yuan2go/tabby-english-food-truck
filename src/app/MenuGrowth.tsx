import { useCallback, useEffect, useRef, useState } from 'react';
import { REQUESTS } from '../content/catalog';
import { preparationSteps } from '../content/teaching';
import type { ForegroundAudio, PlaybackResult } from '../platform/audio';
import { Food } from './Food';
/** One explicit, skippable menu introduction between completed orders. No score or inventory. */
export function MenuGrowth({
  request,
  audio,
  close,
}: {
  request: 'banana' | 'juice' | 'banana-juice';
  audio: ForegroundAudio;
  close: (add: boolean) => void;
}) {
  const spec = REQUESTS[request];
  const [voiceResult, setVoiceResult] = useState<PlaybackResult | null>(null);
  const voiceToken = useRef(0);
  const replay = useCallback(() => {
    const token = ++voiceToken.current;
    setVoiceResult(null);
    void audio.play(`grow-${request}`).then((result) => {
      if (token === voiceToken.current) setVoiceResult(result);
    });
  }, [audio, request]);
  useEffect(() => {
    replay();
    return () => {
      voiceToken.current++;
      audio.stop();
    };
  }, [audio, replay]);
  return (
    <section
      className="lesson-dialog short-lesson"
      role="dialog"
      aria-modal="true"
      aria-label="今日新菜单"
    >
      <div className="lesson-heading">
        <span>小猫发现一个新味道</span>
        <button type="button" onClick={() => close(false)}>
          这次先不加 ↗
        </button>
      </div>
      <h2>认识后，再放上菜单</h2>
      <button type="button" className="meaning-object" onClick={replay} aria-label="听新菜单">
        <span className="meaning-products">
          <Food product={spec.products[0]} />
        </span>
        <strong>{spec.text}</strong>
        <span>♫</span>
      </button>
      {voiceResult === 'failed' || voiceResult === 'muted' || voiceResult === 'interrupted' ? (
        <div className="voice-recovery" role="status">
          <span>声音没播完整，图片和做法在下面。</span>
          <button type="button" onClick={replay}>
            ♫ 重试
          </button>
        </div>
      ) : null}
      {preparationSteps(spec.products[0]).map((step) => (
        <div className="lesson-ingredients" key={step.id}>
          {step.inputs.map((p) => (
            <Food key={p} product={p} />
          ))}
          <span>→</span>
          <Food product={step.output} />
        </div>
      ))}
      <p>
        {request === 'banana'
          ? '香蕉可以直接放到盘子里。'
          : '这里的果汁是一杯。点机器，自己选水果，启动后会放到绑定的盘里。'}
      </p>
      <button type="button" className="primary" onClick={() => close(true)}>
        加入今日菜单
      </button>
      <small>这是认识新菜单，不是考试。随时可请小猫帮忙。</small>
    </section>
  );
}
