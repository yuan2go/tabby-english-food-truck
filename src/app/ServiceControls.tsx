import { REQUESTS } from '../content/catalog';
import { lineFor } from '../content/dialogue';
import { isFinished, SUPPLY_PAGES } from '../content/recipes';
import { teachingFigures } from '../content/teaching';
import { activate, type ViewState } from '../game/input';
import { stationPoint } from '../game/KitchenView';
import { kitchenActions, recoveryControl } from '../game/layout';
import type { ForegroundAudio } from '../platform/audio';
import type { GameController } from '../platform/controller';
import type { DialogueDirector } from '../platform/dialogue';
import { openCommission } from '../rules/adventure';
import type { Item, Order } from '../rules/types';
import { Conversation } from './Dialogue';
import { Food } from './Food';

interface Props {
  controller: GameController;
  audio: ForegroundAudio;
  ui: ViewState;
  selected: Order | undefined;
  selectedItem: Item | null | undefined;
  picture: boolean | undefined;
  dialogue: DialogueDirector;
  help: () => void;
}
export function ServiceControls({
  controller,
  audio,
  ui,
  selected,
  selectedItem,
  picture,
  dialogue,
  help,
}: Props) {
  const s = controller.state,
    l = ui.layout;
  if (!l) return null;
  const commission = openCommission(s.adventure);
  const handoff = kitchenActions(l, s.session.unlocked.length, !!commission).handoff;
  return (
    <>
      {commission && handoff ? (
        <button
          type="button"
          className="commission-handoff primary"
          style={{ left: handoff.x, top: handoff.y, width: handoff.width, height: handoff.height }}
          onClick={() => {
            const result = controller.command({
              type: 'adventure',
              action: commission.action,
              tray: ui.selectedTray,
            });
            ui.feedback = result.message;
            if (result.kind === 'ok') {
              ui.selected = null;
              audio.effect('place');
            } else audio.effect('gentle');
            ui.change();
          }}
        >
          {commission.label}
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
      {selectedItem && !selectedItem.location.startsWith('tray:')
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
      {selectedItem?.location.startsWith('tray:') || s.recycle ? (
        <button
          type="button"
          className="food-recovery"
          aria-label={
            selectedItem?.location.startsWith('tray:')
              ? isFinished(selectedItem.product)
                ? '收起成品'
                : '↩ 放回这份'
              : '↶ 恢复成品'
          }
          style={{
            position: 'absolute',
            left: recoveryControl(l).x,
            top: recoveryControl(l).y,
            width: 48,
            height: 48,
            padding: 2,
            zIndex: 8,
          }}
          onClick={() =>
            activate(
              selectedItem?.location.startsWith('tray:') ? 'clear' : 'restore',
              controller,
              audio,
              ui,
            )
          }
        >
          <span aria-hidden="true">{selectedItem?.location.startsWith('tray:') ? '↩' : '↶'}</span>
          <small>
            {selectedItem?.location.startsWith('tray:')
              ? isFinished(selectedItem.product)
                ? '收起'
                : '放回'
              : '恢复'}
          </small>
        </button>
      ) : null}
      <Conversation
        director={dialogue}
        audio={audio}
        help={help}
        style={{
          position: 'absolute',
          left: l.dialogue.x,
          top: l.dialogue.y,
          width: l.dialogue.width,
          minHeight: 88,
        }}
      >
        {s.orders
          .filter((o) => o.status === 'waiting')
          .map((o) => (
            <button
              type="button"
              key={o.id}
              aria-pressed={dialogue.current?.order === o.id}
              aria-label={`重听客人${o.seat === 0 ? 'A' : 'B'}的请求`}
              onClick={() => activate(`listen-${o.id}`, controller, audio, ui)}
            >
              {o.seat === 0 ? 'A' : 'B'} ♫
            </button>
          ))}
        {commission ? (
          <button
            type="button"
            aria-label="重听开放请求"
            onClick={() =>
              dialogue.show({
                key: `${s.runId}:commission:${commission.action}`,
                line: lineFor(
                  commission.action === 'cool'
                    ? 'open-cool'
                    : commission.action === 'pack'
                      ? 'open-pack'
                      : 'open-create',
                ),
              })
            }
          >
            ▧ ♫
          </button>
        ) : null}
        {picture && selected ? (
          <div className="request-figures">
            {teachingFigures(REQUESTS[selected.request].products).map(({ product, id }) => (
              <Food key={id} product={product} />
            ))}
          </div>
        ) : null}
      </Conversation>
    </>
  );
}
