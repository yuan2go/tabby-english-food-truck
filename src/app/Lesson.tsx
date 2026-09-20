import { useState } from 'react';
import { REQUESTS, type RequestId } from '../content/catalog';
import { CHAPTERS } from '../content/chapters';
import { LANGUAGE_UNITS, lessonWords } from '../content/learning';
import { RECIPES, type Recipe } from '../content/recipes';
import type { ForegroundAudio } from '../platform/audio';
import { Food } from './Food';
export function Lesson({
  request,
  audio,
  close,
  chapter,
}: {
  request: RequestId;
  audio: ForegroundAudio;
  close: () => void;
  chapter?: number | undefined;
}) {
  const spec = REQUESTS[request],
    product = spec.products[0],
    recipe = RECIPES.find((r) => r.output === product);
  const preparation = recipe?.inputs.flatMap((p) => RECIPES.filter((r) => r.output === p)) ?? [];
  const steps: (Recipe | undefined)[] = [...preparation, recipe];
  const [step, setStep] = useState(0);
  const current = steps[step];
  const inputs = current?.inputs ?? spec.products;
  const unit = LANGUAGE_UNITS[request];
  const c = chapter === undefined ? undefined : CHAPTERS[chapter];
  return (
    <section className="lesson-dialog" role="dialog" aria-label="场景小教学">
      <span className="lesson-tab">{c?.title ?? '小猫的食谱'} · 看意义，再亲手试试</span>
      {c ? (
        <div className="chapter-moment">
          <p>{c.line}</p>
          <button type="button" onClick={() => void audio.play(c.audio)} aria-label="听本章故事">
            ♫
          </button>
        </div>
      ) : null}
      <div className="lesson-ingredients">
        {lessonWords(inputs).map((w, i) => (
          <button
            type="button"
            key={`${w.product}-${inputs.slice(0, i).filter((p) => p === w.product).length}`}
            onClick={() => void audio.play(w.audio)}
          >
            <Food product={w.product} />
            <span>{w.text}</span>
          </button>
        ))}
        <span>→</span>
        <button type="button" aria-label="听成品名称" onClick={() => void audio.play(spec.audio)}>
          <Food product={current?.output ?? product} />
        </button>
      </div>
      <div className="lesson-process">
        <span>
          {current
            ? { machine: '◉ 果汁机', ice: '❄ 接取台', board: '▰ 组合板', grill: '♨ 煎台' }[
                current.station
              ]
            : '● 托盘'}
        </span>
        <span>→ {current?.action ?? '摆好'} →</span>
        <span>送给客人 ↗</span>
      </div>
      {steps.length > 1 ? (
        <div className="lesson-stepper">
          {steps.map((r, i) => (
            <button
              type="button"
              key={r?.id ?? 'raw'}
              aria-pressed={step === i}
              onClick={() => setStep(i)}
            >
              {i + 1} · {r?.action ?? '摆好'}
            </button>
          ))}
        </div>
      ) : null}
      <h2>{spec.text}</h2>
      <p className="language-focus">{unit.join(' · ')}</p>
      <p>
        {spec.explanation}{' '}
        {request === 'double-cream'
          ? '数的是球：one scoop → two scoops。'
          : request.includes('juice')
            ? 'juice 不加 s；杯子记录在真实配方里。'
            : ''}
      </p>
      <div className="lesson-actions">
        <button type="button" onClick={() => void audio.play(spec.audio)}>
          ♫ 再听一遍
        </button>
        <button type="button" className="primary" onClick={close}>
          我来试试
        </button>
      </div>
    </section>
  );
}
