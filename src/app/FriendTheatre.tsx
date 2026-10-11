import { useEffect, useRef, useState } from 'react';
import { VISITOR_NAMES } from '../content/adventure';
import { FOOD_GROUPS, type WorldMoment } from '../content/adventure-experience';
import { assetUrl } from '../game/assets';
import type { ForegroundAudio } from '../platform/audio';
import type { GameController } from '../platform/controller';
import { Food } from './Food';
import { SceneIcon } from './SceneIcon';
import './friend-theatre.css';

const stages = ['接餐', '携带', '摆放', '品尝', '回应'];
/** Replaying the receipt only renders. No effect or timer dispatches a gameplay command. */
export function FriendTheatre({
  controller,
  audio,
  moment,
}: {
  controller: GameController;
  audio: ForegroundAudio;
  moment: WorldMoment | undefined;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [replay, setReplay] = useState(0);
  const playhead = useRef(0);
  const duration = Math.max(1, moment?.foods.length ?? 1) * 4800;
  const [low, setLow] = useState(
    () =>
      matchMedia('(prefers-reduced-motion: reduce)').matches ||
      (() => {
        try {
          return localStorage.getItem('tabby.foodtruck.lowGraphics') === 'true';
        } catch {
          return false;
        }
      })(),
  );
  // biome-ignore lint/correctness/useExhaustiveDependencies: Receipt identity and replay nonce restart a visual-only clock.
  useEffect(() => {
    setElapsed(0);
    let previous = performance.now();
    playhead.current = 0;
    const resetClock = () => {
      previous = performance.now();
    };
    document.addEventListener('visibilitychange', resetClock);
    const timer = window.setInterval(() => {
      const now = performance.now(),
        delta = Math.min(now - previous, 120);
      previous = now;
      if (!document.hidden && !controller.pauses.size) {
        playhead.current = Math.min(duration, playhead.current + delta);
        setElapsed(playhead.current);
        if (playhead.current === duration) clearInterval(timer);
      }
    }, 80);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', resetClock);
    };
  }, [moment?.id, replay, controller, duration]);
  if (!moment)
    return (
      <div className="friend-theatre empty-theatre" role="img" aria-label="朋友的分享场景">
        <SceneIcon kind="friends" />
        <SceneIcon kind="table" />
      </div>
    );
  const portion =
    moment.foods.length > 1 ? Math.min(moment.foods.length - 1, Math.floor(elapsed / 4800)) : 0;
  const phase = elapsed >= duration ? 4800 : elapsed % 4800;
  const food = moment.foods[portion];
  const visitor = food?.visitor ?? moment.visitor;
  const name = visitor ? VISITOR_NAMES[visitor] : '大咪';
  const eating = moment.kind === 'taste' || moment.kind === 'finish';
  const index = low
    ? eating
      ? 4
      : 2
    : moment.kind === 'taste'
      ? Math.min(4, 3 + Math.floor(phase / 2200))
      : Math.min(eating ? 4 : 2, Math.floor(phase / 960));
  const sip = food && FOOD_GROUPS.drink.includes(food.product);
  const cool = food && FOOD_GROUPS.cool.includes(food.product);
  const feedback =
    food && eating
      ? sip
        ? '朋友举杯，喝到清凉的饮品'
        : cool
          ? '冰凉的小口让朋友眯起眼'
          : FOOD_GROUPS.fruit.includes(food.product)
            ? '朋友咬下一口水果，慢慢咀嚼'
            : '朋友咬下一口，拍拍小肚子'
      : food
        ? `${name}接好食品，带到所选位置，等你安排分享`
        : moment.kind === 'water'
          ? '花朵展开，蝴蝶飞来'
          : moment.kind === 'cooperate'
            ? '朋友把物件带到餐桌旁'
            : '朋友和你一起准备';
  const voice =
    eating && food ? (sip ? 'world-sip' : cool ? 'world-cold' : 'world-bite') : 'world-use';
  return (
    <section
      className={`friend-theatre theatre-${moment.kind} stage-${index} ${low ? 'low-motion' : ''} ${sip ? 'sip' : cool ? 'lick' : 'bite'}`}
      aria-label="朋友实际使用食品"
      data-moment={moment.id}
    >
      <div className="theatre-track" role="img" aria-label="接餐、携带、摆放、品尝、回应">
        {stages.map((stage, i) => (
          <span key={stage} className={i === index ? 'current-stage' : ''}>
            <SceneIcon kind={['friend', 'carry', 'table', 'taste', 'friends'][i] ?? 'friend'} />
            <small>{stage}</small>
          </span>
        ))}
      </div>
      <div
        className="theatre-action"
        role="img"
        aria-label={`${name}${eating ? '品尝' : '携带'}真实食品`}
      >
        <img
          className="theatre-guest"
          src={assetUrl(
            !visitor
              ? `cat-${index === 4 ? 'celebrate' : index === 1 ? 'carry' : 'place'}`
              : visitor === 'elder'
                ? 'elder'
                : `guest-${visitor === 'rabbit' ? 0 : 1}-${index === 4 ? 2 : 1}`,
          )}
          alt={name}
        />
        <span className="theatre-arm" aria-hidden="true" />
        {food ? (
          <span
            className={`theatre-serving-place ${moment.destination === 'basket' ? 'serving-basket' : ''}`}
            aria-hidden="true"
          >
            {moment.destination === 'basket' ? <SceneIcon kind="basket" /> : <i />}
          </span>
        ) : null}
        <span className="theatre-held">
          {food ? <Food product={food.product} /> : null}
          {moment.tool ? <SceneIcon kind={moment.tool} /> : null}
          {moment.prop ? <SceneIcon kind={moment.prop} /> : null}
        </span>
        {eating && index >= 3 ? (
          <>
            <span className="theatre-mouth" aria-hidden="true" />
            <span className="flavor-response" aria-hidden="true">
              {sip ? '❄' : cool ? '❄ ♡' : '✦ ♡'}
            </span>
            <span className="bite-crumbs" aria-hidden="true">
              · · ·
            </span>
          </>
        ) : null}
        {moment.kind === 'water' ? (
          <div className="watering-display">
            <SceneIcon kind="watering-can" />
            <i />
            <SceneIcon kind="flower" />
            <span aria-hidden="true">🦋</span>
          </div>
        ) : null}
        <small className="theatre-caption">{feedback}</small>
      </div>
      {moment.foods.length > 1 ? (
        <span
          className="theatre-count"
          role="img"
          aria-label={`第${portion + 1}份，共${moment.foods.length}份`}
        >
          {moment.foods.map((f, i) => (
            <i key={f.id} className={i === portion ? 'current-portion' : ''}>
              ●
            </i>
          ))}
        </span>
      ) : null}
      <SceneIcon
        className="theatre-destination"
        kind={
          moment.destination === 'basket'
            ? 'basket'
            : moment.destination === 'work'
              ? 'carry'
              : 'table'
        }
      />
      <div className="theatre-controls">
        <button
          type="button"
          aria-label="重看朋友使用"
          onClick={() => {
            setReplay(replay + 1);
            void audio.play(voice);
          }}
        >
          ↻ ♫
        </button>
        <button
          type="button"
          aria-label="跳过朋友演出"
          onClick={() => {
            playhead.current = duration;
            setElapsed(duration);
            audio.skip();
          }}
        >
          ↗
        </button>
        <button
          type="button"
          aria-label="低动态表现"
          aria-pressed={low}
          onClick={() => setLow(!low)}
        >
          ◒
        </button>
      </div>
    </section>
  );
}
