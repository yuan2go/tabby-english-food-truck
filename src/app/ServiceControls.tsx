import { REQUESTS } from '../content/catalog';
import { isFinished, SUPPLY_PAGES } from '../content/recipes';
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
  selected: Order | undefined;
  selectedItem: Item | null | undefined;
  picture: boolean | undefined;
  caption: string | null;
  setCaption: (id: string | null) => void;
}
export function ServiceControls({
  controller,
  audio,
  ui,
  selected,
  selectedItem,
  picture,
  caption,
  setCaption,
}: Props) {
  const s = controller.state,
    l = ui.layout;
  if (!l) return null;
  const g = selected ? l.guests[selected.seat] : l.guests[0];
  return (
    <>
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
      {selected ? (
        <button
          type="button"
          className="request-picture"
          aria-label="点请求气泡重听"
          style={{
            left: Math.max(8, Math.min(l.width - 120, g.x - 60)),
            top: l.regions.guests.y,
            width: 120,
          }}
          onClick={() => activate(`listen-${selected.id}`, controller, audio, ui)}
        >
          {(picture ? teachingFigures(REQUESTS[selected.request].products) : []).map(
            ({ product, id }) => (
              <Food key={id} product={product} />
            ),
          )}
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
