import { useEffect, useState } from 'react';
import { REQUESTS, type RequestId } from '../content/catalog';
import { ITEM_AUDIO, lessonWords } from '../content/learning';
import { FOOD } from '../content/recipes';
import {
  acceptsChoice,
  preparationSteps,
  REQUEST_UNITS,
  teachingFigures,
  UNITS,
} from '../content/teaching';
import type { ViewState } from '../game/input';
import type { ForegroundAudio } from '../platform/audio';
import type { GameController } from '../platform/controller';
import type { LessonProgress } from '../platform/profile';
import { shuffle } from '../rules/minigames';
import { Food } from './Food';

/** A teaching projection has no inventory. Its small choices use the content semantics. */
export function Lesson({
  request,
  audio,
  close,
  controller,
  lessonKey,
  view,
}: {
  request: RequestId;
  audio: ForegroundAudio;
  close: () => void;
  controller: GameController;
  lessonKey: string;
  view: ViewState;
}) {
  const profile = controller.profile;
  const [progress, setProgress] = useState<LessonProgress>(() => {
    const saved = profile.value.lessons[lessonKey];
    if (saved && saved.request === request && !['done', 'skipped'].includes(saved.phase))
      return saved;
    const units = REQUEST_UNITS[request].filter((id) => !profile.value.learnedUnits.includes(id));
    return {
      request,
      units: units.length ? units : [...REQUEST_UNITS[request]].slice(-1),
      index: 0,
      phase: 'meaning',
      step: 0,
      tries: 0,
      nextAttempt: saved?.nextAttempt ?? 0,
      support: ['meaning-picture'],
    };
  });
  const [feedback, setFeedback] = useState('');
  const unit = UNITS[progress.units[progress.index] ?? ''];
  const spec = REQUESTS[request];
  const steps = preparationSteps(spec.products[0]);
  const current = steps[progress.step];
  const update = (next: LessonProgress) => {
    profile.lesson(lessonKey, next);
    setProgress(next);
  };
  useEffect(() => {
    if (progress.phase === 'meaning' && unit) {
      profile.present(unit.id);
      void audio.play(unit.audio);
    } else if (progress.phase === 'try' && unit) void audio.play(unit.prompt);
    else if (progress.phase === 'recipe')
      void audio.play(ITEM_AUDIO[current?.output ?? spec.products[0]]);
    return () => audio.stop();
  }, [audio, profile, progress.phase, unit, current?.output, spec.products]);
  useEffect(() => {
    view.lessonProducts =
      progress.phase === 'recipe' ? [current?.output ?? spec.products[0]] : (unit?.products ?? []);
    return () => {
      view.lessonProducts = [];
    };
  }, [view, progress.phase, current?.output, spec.products, unit]);
  const finish = (completed: boolean) => {
    update({ ...progress, phase: completed ? 'done' : 'skipped' });
    if (completed) profile.tutorial(`request-${request}`);
    close();
  };
  const choose = (choice: string) => {
    if (!unit) return;
    const correct = acceptsChoice(unit, choice);
    profile.observe({
      id: `lesson:${lessonKey}:${progress.nextAttempt}`,
      dimension: unit.prerequisite === 'recognition' ? 'meaning' : 'structure',
      target: unit.id,
      result: correct ? 'completed' : 'adjust',
      support: progress.support,
      visit: profile.value.learnedUnits.includes(unit.id) ? 'revisit' : 'first',
      audioQualified: false,
    });
    if (!correct) {
      update({
        ...progress,
        tries: progress.tries + 1,
        nextAttempt: progress.nextAttempt + 1,
        support: [...new Set([...progress.support, 'difference-feedback'])],
      });
      setFeedback('再看看刚才的食物，随时可以听或请小猫帮忙。');
      return;
    }
    profile.value.learnedUnits = [...new Set([...profile.value.learnedUnits, unit.id])].slice(-80);
    const index = progress.index + 1;
    update({
      ...progress,
      index,
      phase: index < progress.units.length ? 'meaning' : 'recipe',
      tries: 0,
      nextAttempt: progress.nextAttempt + 1,
    });
    setFeedback(unit.feedback);
    audio.effect('place');
  };
  return (
    <section className="lesson-dialog short-lesson" role="dialog" aria-label="场景小教学">
      <div className="lesson-heading">
        <span>小猫的食谱 · 一次学一点</span>
        <button type="button" onClick={() => finish(false)} aria-label="我来试试">
          先到餐车试试 ↗
        </button>
      </div>
      {progress.phase !== 'recipe' && unit ? (
        <>
          <div
            className="lesson-beads"
            role="img"
            aria-label={`认识食物 ${progress.index + 1}/${progress.units.length}`}
          >
            {progress.units.map((id, i) => (
              <span key={id} className={i <= progress.index ? 'filled' : ''} />
            ))}
          </div>
          {progress.phase === 'meaning' ? (
            <>
              <button
                type="button"
                className="meaning-object"
                onClick={() => void audio.play(unit.audio)}
                aria-label={`听 ${unit.text}`}
              >
                <span className="meaning-products">
                  {teachingFigures(unit.products).map(({ id, product }) => (
                    <Food key={id} product={product} />
                  ))}
                </span>
                <strong>{unit.text}</strong>
                <span>♫</span>
              </button>
              <p>
                {unit.prerequisite === 'quantity'
                  ? '看得见的份数。点一下，听名字。'
                  : unit.prerequisite === 'combination'
                    ? '两种一起放。点一下，听名字。'
                    : '点食物，听它的名字。'}
              </p>
              <button
                type="button"
                className="primary"
                onClick={() => {
                  setFeedback('');
                  update({ ...progress, phase: 'try' });
                }}
              >
                来试一下 →
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="sound-tile"
                onClick={() => void audio.play(unit.prompt)}
              >
                ♫ 再听一遍
              </button>
              <div className="meaning-choices">
                {shuffle(unit.choices, controller.state.session.seed + progress.index).map(
                  (choice) => (
                    <button
                      type="button"
                      key={choice.id}
                      onClick={() => choose(choice.id)}
                      aria-label={choice.products.map((p) => FOOD[p][0]).join('、')}
                    >
                      {teachingFigures(choice.products).map(({ id, product }) => (
                        <Food key={id} product={product} />
                      ))}
                    </button>
                  ),
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  update({
                    ...progress,
                    phase: 'meaning',
                    support: [...new Set([...progress.support, 'answer-help'])],
                  });
                }}
              >
                🐾 再看小猫示范
              </button>
            </>
          )}
        </>
      ) : (
        <>
          <h2>{current?.action ?? '摆到盘里'}</h2>
          <div className="lesson-ingredients">
            {teachingFigures(current?.inputs ?? spec.products).map(({ id, product }) => {
              const w = lessonWords([product])[0];
              if (!w) return null;
              return (
                <button type="button" key={id} onClick={() => void audio.play(w.audio)}>
                  <Food product={w.product} />
                  <span>{w.text}</span>
                </button>
              );
            })}
            <span>→</span>
            <button
              type="button"
              aria-label="听成品名称"
              onClick={() => void audio.play(ITEM_AUDIO[current?.output ?? spec.products[0]])}
            >
              <Food product={current?.output ?? spec.products[0]} />
              <span>{FOOD[current?.output ?? spec.products[0]][1]}</span>
            </button>
          </div>
          <div className="lesson-process">
            <span>
              {current
                ? { machine: '◉ 果汁机', ice: '❄ 冰淇淋台', board: '▰ 组合板', grill: '♨ 煎台' }[
                    current.station
                  ]
                : '● 备餐盘'}
            </span>
            <span>→ {current?.action ?? '摆好'} → 接取</span>
          </div>
          {steps.length > 1 ? (
            <div className="lesson-stepper">
              {steps.map((r, i) => (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={progress.step === i}
                  onClick={() => update({ ...progress, step: i })}
                >
                  {i + 1} · {r.action}
                </button>
              ))}
            </div>
          ) : null}
          {request.includes('juice') ? (
            <p>
              这里的果汁是一杯。水果由你选。
              <button
                type="button"
                aria-label="听果汁菜单约定"
                onClick={() => void audio.play('menu-cup')}
              >
                ♫
              </button>
            </p>
          ) : ['double-cream', 'banana-cream'].includes(request) ? (
            <p>
              这两道菜单用杯子装，口味和数量由你放。
              <button
                type="button"
                aria-label="听冰淇淋菜单约定"
                onClick={() => void audio.play('menu-cream')}
              >
                ♫
              </button>
            </p>
          ) : null}
          <button
            type="button"
            className="primary"
            onClick={() => {
              if (progress.step < steps.length - 1)
                update({ ...progress, step: progress.step + 1 });
              else finish(true);
            }}
          >
            {progress.step < steps.length - 1 ? '接着组装 →' : '回餐车，亲手做 ↗'}
          </button>
        </>
      )}
      <p role="status" className="lesson-feedback">
        {feedback}
      </p>
    </section>
  );
}
