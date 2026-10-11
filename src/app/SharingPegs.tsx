import { type AdventureState, VISITOR_NAMES } from '../content/adventure';
import { FOOD_GROUPS, NEED_AUDIO } from '../content/adventure-experience';
import { assetUrl } from '../game/assets';
import type { ForegroundAudio } from '../platform/audio';
import type { Command } from '../rules/types';
import { Food } from './Food';
import { SceneIcon } from './SceneIcon';

const descriptions = {
  fruit: '带一份水果分享',
  drink: '带一杯饮品',
  cool: '带一份清凉甜点',
  savory: '带一份三明治或汉堡',
  any: '尝尝你的新做法',
};
export function SharingPegs({
  a,
  audio,
  selection,
  act,
}: {
  a: AdventureState;
  audio: ForegroundAudio;
  selection: string;
  act: (c: Omit<Extract<Command, { type: 'adventure' }>, 'type'>) => void;
}) {
  const [page, setPage] = useState(0);
  const needs = a.experience?.needs ?? [];
  const lastPage = Math.max(0, Math.ceil(needs.length / 2) - 1);
  const current = Math.min(page, lastPage);
  return (
    <section className="sharing-pegs" aria-label="朋友的回访分享需要">
      {lastPage ? (
        <button
          type="button"
          aria-label="上一组分享朋友"
          disabled={current === 0}
          onClick={() => setPage(current - 1)}
        >
          ◀
        </button>
      ) : null}
      {needs.slice(current * 2, current * 2 + 2).map((need) => (
        <div
          className={`sharing-peg ${need.fulfilled.length ? 'need-met' : ''}`}
          key={need.visitor}
        >
          <button
            type="button"
            aria-label={`重听${VISITOR_NAMES[need.visitor]}的分享需要`}
            onClick={() => void audio.play(NEED_AUDIO[need.kind])}
          >
            <img
              src={assetUrl(
                need.visitor === 'elder' ? 'elder' : `guest-${need.visitor === 'rabbit' ? 0 : 1}-2`,
              )}
              alt=""
            />
            <span aria-hidden="true">♫</span>
          </button>
          <span className="need-pictures" role="img" aria-label={descriptions[need.kind]}>
            {need.kind === 'any' ? (
              <SceneIcon kind="carry" />
            ) : (
              FOOD_GROUPS[need.kind].slice(0, 2).map((p) => <Food key={p} product={p} />)
            )}
          </span>
          <small>
            {need.basis === 'first'
              ? '今天的新朋友'
              : need.basis === 'packing'
                ? '记得一起打包'
                : need.basis === 'table'
                  ? '记得桌边分餐'
                  : '记得树荫甜点'}{' '}
            · {descriptions[need.kind]}
          </small>
          <button
            type="button"
            data-world-target="share"
            aria-label={`分享给${VISITOR_NAMES[need.visitor]}`}
            disabled={!!need.fulfilled.length}
            onClick={() => act({ action: 'share', visitor: need.visitor, item: selection })}
          >
            <SceneIcon kind={need.fulfilled.length ? 'taste' : 'carry'} />
          </button>
        </div>
      ))}
      {lastPage ? (
        <button
          type="button"
          aria-label="下一组分享朋友"
          disabled={current === lastPage}
          onClick={() => setPage(current + 1)}
        >
          ▶
        </button>
      ) : null}
    </section>
  );
}

import { useState } from 'react';
