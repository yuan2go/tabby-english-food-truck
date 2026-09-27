import { useState } from 'react';
import { REQUESTS } from '../content/catalog';
import { type Family, isFinished, type Product, SUPPLY_PAGES } from '../content/recipes';
import { teachingFigures } from '../content/teaching';
import { activate, type ViewState } from '../game/input';
import { stationPoint } from '../game/KitchenView';
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
    ui.change();
    setTargets(false);
  };
  const r = l.regions.action,
    g = selected ? l.guests[selected.seat] : l.guests[0];
  return (
    <>
      {s.session.unlocked.length > 1 ? (
        <div className="recipe-switch" style={{ left: l.stage.x + l.stage.width - 104, top: 4 }}>
          <button
            type="button"
            aria-label="选择食谱"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            ▤ 食谱
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
                  <span aria-hidden="true" className="recipe-option-picture">
                    <Food
                      product={
                        {
                          juice: 'juice',
                          ice: 'vanilla-cone',
                          sandwich: 'sandwich',
                          burger: 'burger',
                          ready: 'apple',
                        }[f] as Product
                      }
                    />
                  </span>
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
      {ui.hotspots
        .filter((h) => h.kind === 'start')
        .map((h) => {
          const station = h.id.startsWith('start-station-')
            ? (h.id.slice(14) as 'ice' | 'board' | 'grill')
            : null;
          const status = station ? s.stations[station].status : s.machine.status;
          const verb =
            station === 'ice'
              ? '接好冰淇淋'
              : station === 'grill'
                ? '煎熟肉饼'
                : station === 'board'
                  ? '盖合食物'
                  : '榨成果汁';
          return (
            <button
              type="button"
              key={h.id}
              className="station-action"
              style={{
                left: h.x - h.width / 2,
                top: h.y - h.height / 2,
                width: h.width,
                minHeight: h.height,
              }}
              disabled={status === 'processing' || status === 'ready'}
              onClick={() => activate(h.id, controller, audio, ui)}
            >
              {status === 'processing'
                ? '制作中…'
                : status === 'ready'
                  ? '已完成，看看托盘'
                  : `▶ ${verb}`}
            </button>
          );
        })}
      {s.session.family !== 'ready' ? (
        <button
          type="button"
          className="tray-prep-action"
          aria-pressed={ui.prep === 'tray'}
          style={{
            left:
              l.form === 'phone'
                ? l.regions.trays.x + l.regions.trays.width - 86
                : l.regions.trays.x + 8,
            top: l.regions.trays.y + 2,
          }}
          onClick={() => {
            ui.prep = 'tray';
            ui.selected = null;
            controller.message = `食材会直接放到${ui.selectedTray + 1}号盘。要制作时点设备。`;
            ui.change();
          }}
        >
          {l.form === 'phone' ? '放盘' : '食材直接放盘'}
        </button>
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
            aria-expanded={waiting.length > 1 ? targets : undefined}
            onClick={() => {
              if (waiting.length === 1 && waiting[0]) send(waiting[0]);
              else {
                const chosen = waiting.find((o) => o.id === ui.selectedGuest);
                if (chosen) send(chosen);
                else setTargets(!targets);
              }
            }}
          >
            {waiting.length > 1 && waiting.some((o) => o.id === ui.selectedGuest)
              ? `送给${waiting.find((o) => o.id === ui.selectedGuest)?.seat === 0 ? '左边' : '右边'}客人 ↗`
              : '送餐 ↗'}
          </button>
        )}
      </div>
      {selectedItem
        ? (() => {
            const h = ui.hotspots.find((h) => h.id === `item-${selectedItem.id}`);
            const inWork =
              selectedItem.location.startsWith('station:') ||
              selectedItem.location.startsWith('machine:');
            const station = selectedItem.location.startsWith('station:')
              ? (selectedItem.location.split(':')[1] as 'ice' | 'board' | 'grill')
              : null;
            const origin = station ? stationPoint(station, l) : l.machine;
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
                    ? Math.max(8, Math.min(l.width - 56, origin.x + (station ? 76 : 120)))
                    : Math.max(8, Math.min(l.width - 148, h.x - 70)),
                  top: inWork
                    ? l.form === 'phone'
                      ? l.regions.work.y + l.regions.work.height - 56
                      : Math.max(l.regions.work.y + 8, h.y - 24)
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
