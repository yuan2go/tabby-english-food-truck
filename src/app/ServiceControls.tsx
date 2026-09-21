import { useState } from 'react';
import { REQUESTS } from '../content/catalog';
import { type Family, isFinished, SUPPLY_PAGES } from '../content/recipes';
import { teachingFigures } from '../content/teaching';
import { activate, type ViewState } from '../game/input';
import type { ForegroundAudio } from '../platform/audio';
import type { GameController } from '../platform/controller';
import type { Item, Order } from '../rules/types';
import { Food } from './Food';

interface Props {
  controller: GameController;
  audio: ForegroundAudio;
  ui: ViewState;
  waiting: Order[];
  selected: Order | undefined;
  selectedItem: Item | null | undefined;
  picture: boolean | undefined;
  caption: string | null;
  setCaption: (id: string | null) => void;
  help: () => void;
  family: (f: Family) => void;
}
export function ServiceControls({
  controller,
  audio,
  ui,
  waiting,
  selected,
  selectedItem,
  picture,
  caption,
  setCaption,
  family,
}: Props) {
  const [menu, setMenu] = useState(false),
    [targets, setTargets] = useState(false);
  const s = controller.state,
    l = ui.layout;
  if (!l) return null;
  const send = (o: Order) => {
    ui.selectedGuest = o.id;
    activate(`send-${o.id}`, controller, audio, ui);
    setTargets(false);
  };
  const r = l.regions.action,
    g = selected ? l.guests[selected.seat] : l.guests[0];
  return (
    <>
      {s.session.unlocked.length > 1 ? (
        <div
          className="recipe-switch"
          style={{ left: l.regions.work.x, top: l.regions.work.y - 2 }}
        >
          <button
            type="button"
            aria-label="选择食谱"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            ▤
          </button>
          {menu ? (
            <fieldset className="recipe-options" aria-label="选择食谱工作台">
              {s.session.unlocked.map((f) => (
                <button
                  type="button"
                  key={f}
                  aria-pressed={s.session.family === f}
                  onClick={() => {
                    family(f);
                    setMenu(false);
                  }}
                >
                  {
                    {
                      juice: '果汁',
                      ice: '冰淇淋',
                      sandwich: '三明治',
                      burger: '汉堡',
                      ready: '水果与预制点心',
                    }[f]
                  }
                </button>
              ))}
            </fieldset>
          ) : null}
        </div>
      ) : null}
      {s.session.family === 'ready' ? (
        <button
          type="button"
          className="supply-page"
          style={{ position: 'absolute', left: l.regions.work.x + 60, top: l.regions.work.y }}
          onClick={() => {
            controller.command({
              type: 'supply-page',
              page: (s.session.supplyPage + 1) % SUPPLY_PAGES.length,
            });
            void audio.play('basket-next');
          }}
        >
          ↔ 换一篮 {s.session.supplyPage + 1}/{SUPPLY_PAGES.length}
        </button>
      ) : null}
      <div
        className="delivery-actions"
        style={{ left: r.x, top: r.y, width: r.width, height: r.height }}
      >
        {targets && waiting.length > 1 ? (
          <fieldset aria-label="选择送餐客人">
            {waiting.map((o) => (
              <button type="button" key={o.id} onClick={() => send(o)}>
                送给{o.seat === 0 ? '左边' : '右边'}客人 ↗
              </button>
            ))}
          </fieldset>
        ) : (
          <button
            type="button"
            className="primary"
            onClick={() => {
              if (waiting.length === 1 && waiting[0]) send(waiting[0]);
              else setTargets(true);
            }}
          >
            送餐 ↗
          </button>
        )}
      </div>
      {selectedItem
        ? (() => {
            const h = ui.hotspots.find((h) => h.id === `item-${selectedItem.id}`);
            const inWork = selectedItem.location.startsWith('station:');
            return h ? (
              <button
                type="button"
                className="near-remove"
                aria-label={
                  inWork
                    ? isFinished(selectedItem.product)
                      ? '收起'
                      : '↩'
                    : isFinished(selectedItem.product)
                      ? '收起成品'
                      : '↩ 放回这份'
                }
                style={{
                  left: inWork
                    ? l.landscape
                      ? h.x - 24
                      : l.regions.work.x + l.regions.work.width - 48
                    : Math.max(8, Math.min(l.width - 148, h.x - 70)),
                  top: inWork
                    ? l.landscape
                      ? l.regions.top.y + 4
                      : h.y - 24
                    : Math.max(l.regions.trays.y - 20, h.y - 54),
                  width: inWork ? 48 : undefined,
                  padding: inWork ? 0 : undefined,
                }}
                onClick={() => activate('clear', controller, audio, ui)}
              >
                {inWork
                  ? isFinished(selectedItem.product)
                    ? '收起'
                    : '↩'
                  : isFinished(selectedItem.product)
                    ? '收起成品'
                    : '↩ 放回这份'}
              </button>
            ) : null;
          })()
        : null}
      {s.recycle ? (
        <button
          type="button"
          className="restore-food"
          style={{ left: l.regions.action.x, top: l.regions.action.y - 48 }}
          onClick={() => activate('restore', controller, audio, ui)}
        >
          ↶ 恢复成品
        </button>
      ) : null}
      {picture && selected ? (
        <button
          type="button"
          className="request-picture"
          aria-label="点请求气泡重听"
          style={{
            left: Math.max(8, Math.min(l.width - 120, g.x - 60)),
            top: l.regions.guests.y,
            width: 120,
          }}
          onClick={() => activate(selected.id, controller, audio, ui)}
        >
          {teachingFigures(REQUESTS[selected.request].products).map(({ product, id }) => (
            <Food key={id} product={product} />
          ))}
          <span>♫</span>
        </button>
      ) : null}
      {caption === selected?.id && selected ? (
        <div
          className="request-caption"
          style={{ left: 8, top: l.regions.guests.y, width: l.width - 16 }}
        >
          {REQUESTS[selected.request].text}
          <button type="button" aria-label="收起文字帮助" onClick={() => setCaption(null)}>
            ×
          </button>
        </div>
      ) : null}
    </>
  );
}
