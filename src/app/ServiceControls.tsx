import { REQUESTS } from '../content/catalog';
import { FAMILY_STATIONS, type Family, isFinished } from '../content/recipes';
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
  help,
  family,
}: Props) {
  const s = controller.state;
  return (
    <>
      <div className="request-tools">
        <button
          type="button"
          onClick={() => selected && audio.play(REQUESTS[selected.request].audio)}
        >
          ↻ 重听
        </button>
        <button type="button" onClick={help}>
          图示帮助
        </button>
        {s.helper ? (
          <button type="button" onClick={() => controller.command({ type: 'cancel-helper' })}>
            撤回便签
          </button>
        ) : null}
      </div>
      <fieldset className="family-tabs" aria-label="选择食谱工作台">
        {s.session.unlocked.map((f) => (
          <button
            type="button"
            key={f}
            aria-label={{ juice: '果汁', ice: '冰淇淋', sandwich: '三明治', burger: '汉堡' }[f]}
            aria-pressed={s.session.family === f}
            onClick={() => family(f)}
          >
            <Food
              product={
                { juice: 'apple', ice: 'vanilla-cone', sandwich: 'sandwich', burger: 'burger' }[
                  f
                ] as 'apple' | 'vanilla-cone' | 'sandwich' | 'burger'
              }
            />
            {{ juice: '果汁', ice: '冰淇淋', sandwich: '三明治', burger: '汉堡' }[f]}
          </button>
        ))}
      </fieldset>
      <fieldset className="prep-selector" aria-label="当前备餐位置">
        <span>放到</span>
        <button
          type="button"
          aria-pressed={ui.prep === 'tray'}
          onClick={() => {
            activate(`tray-${ui.selectedTray}`, controller, audio, ui);
          }}
        >
          ● {ui.selectedTray + 1}号盘
        </button>
        {s.session.family === 'juice' ? (
          <button
            type="button"
            aria-pressed={ui.prep === 'machine'}
            onClick={() => {
              activate(
                selectedItem?.product === 'cup' ? 'machine-cup' : 'machine-apple',
                controller,
                audio,
                ui,
              );
            }}
          >
            果汁机
          </button>
        ) : (
          FAMILY_STATIONS[s.session.family].map((id) => (
            <button
              type="button"
              key={id}
              aria-pressed={ui.prep === id}
              onClick={() => {
                activate(`station-${id}`, controller, audio, ui);
              }}
            >
              {{ ice: '冰淇淋台', board: '组合板', grill: '煎台' }[id]}
            </button>
          ))
        )}
      </fieldset>
      <fieldset className="delivery-actions" aria-label="送餐">
        {waiting.map((o) => (
          <button
            type="button"
            key={o.id}
            onClick={() => {
              ui.selectedGuest = o.id;
              activate(`send-${o.id}`, controller, audio, ui);
            }}
          >
            送给{waiting.length === 1 ? '客人' : o.seat === 0 ? '左边客人' : '右边客人'} ↗
          </button>
        ))}
      </fieldset>
      {selectedItem ? (
        <button
          type="button"
          className="near-remove"
          style={(() => {
            const h = ui.hotspots.find((h) => h.id === `item-${selectedItem.id}`);
            return h
              ? {
                  left: Math.max(8, Math.min(innerWidth - 145, h.x - 65)),
                  top: Math.max(70, h.y - 62),
                  right: 'auto',
                }
              : undefined;
          })()}
          onClick={() => activate('clear', controller, audio, ui)}
        >
          {isFinished(selectedItem.product) ? '收起成品' : '↩ 放回这份'}
        </button>
      ) : null}
      {s.recycle ? (
        <button
          type="button"
          className="restore-food"
          onClick={() => activate('restore', controller, audio, ui)}
        >
          恢复刚收起的成品
        </button>
      ) : null}
      {picture && selected ? (
        <fieldset
          className="request-picture"
          aria-label="有图示支持的请求"
          style={{ left: s.mode === 'service' ? (selected.seat === 0 ? '27%' : '73%') : '50%' }}
        >
          {REQUESTS[selected.request].products.map((p, i) => (
            <Food
              key={`${p}-${REQUESTS[selected.request].products.slice(0, i).filter((v) => v === p).length}`}
              product={p}
            />
          ))}
        </fieldset>
      ) : null}
      {caption === selected?.id && selected ? (
        <div className="request-caption">
          {REQUESTS[selected.request].text}
          <button type="button" aria-label="收起文字帮助" onClick={() => setCaption(null)}>
            ×
          </button>
        </div>
      ) : null}
    </>
  );
}
