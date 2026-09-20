import { type Product, REQUESTS } from '../content/catalog';
import type { ForegroundAudio } from '../platform/audio';
import type { GameController } from '../platform/controller';
import type { GameState, Source, TrayId } from '../rules/types';
export type Selection = Source | { tray: TrayId } | null;
export interface Hotspot {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind: 'supply' | 'item' | 'tray' | 'guest' | 'machine' | 'start' | 'clear' | 'note';
}
export interface ViewState {
  elements: Map<string, HTMLButtonElement>;
  lowGraphics: boolean;
  inputBlocked: boolean;
  teaching: string | null;
  selected: Selection;
  selectedTray: TrayId;
  selectedGuest: string;
  hotspots: Hotspot[];
  focus: string | null;
  ready: boolean;
  assetFailure: boolean;
  resourceMessage: string;
  openNote: () => void;
  confirmClear: (action: () => void) => void;
  change: () => void;
}
export function sourceFor(id: string, s: GameState): Selection {
  if (id.startsWith('supply-')) return { supply: id.slice(7) as Product };
  if (id.startsWith('item-') && s.items.some((i) => i.id === id.slice(5)))
    return { item: id.slice(5) };
  if (id.startsWith('tray-')) return { tray: Number(id.slice(5)) as TrayId };
  return null;
}
export function activate(
  id: string,
  controller: GameController,
  audio: ForegroundAudio,
  ui: ViewState,
  dragSource?: Selection,
): void {
  const s = controller.state;
  const selected = dragSource ?? ui.selected;
  const isSource = selected && ('supply' in selected || 'item' in selected);
  let command: Parameters<GameController['command']>[0] | undefined;
  if (id === 'note') {
    ui.openNote();
    return;
  }
  if (id === 'start') command = { type: 'start-machine' };
  else if (id === 'clear' && isSource)
    command = { type: 'move', source: selected, destination: { discard: true, confirmed: false } };
  else if (id.startsWith('machine-') && isSource)
    command = {
      type: 'move',
      source: selected,
      destination: { machine: id === 'machine-apple' ? 'apple' : 'cup' },
    };
  else if (id.startsWith('tray-')) {
    const tray = Number(id.slice(5)) as TrayId;
    ui.selectedTray = tray;
    if (isSource) command = { type: 'move', source: selected, destination: { tray } };
    else {
      ui.selected = { tray };
      controller.message = `${tray + 1}号托盘已选中。点客人递出整盘，或点盘里的食品调整。`;
    }
  } else if (id.startsWith('guest-')) {
    ui.selectedGuest = id;
    if (selected && 'tray' in selected)
      command = { type: 'deliver', tray: selected.tray, order: id };
    else {
      ui.selected = null;
      const o = s.orders.find((o) => o.id === id);
      if (o?.status === 'waiting') void audio.play(REQUESTS[o.request].audio);
    }
  } else {
    const next = sourceFor(id, s);
    if (next) {
      ui.selected = next;
      controller.message = '拿起来了。点一个位置放下；按 Esc 或空白处取消。';
    } else {
      ui.selected = null;
      controller.message = '已取消拿取，物品留在原处。';
    }
  }
  if (command) {
    const action = command;
    const result = controller.command(action);
    if (result.kind === 'confirm' && action.type === 'move')
      ui.confirmClear(() => {
        controller.command({ ...action, destination: { discard: true, confirmed: true } });
        ui.selected = null;
        ui.change();
      });
    if (result.kind === 'ok') {
      ui.selected = null;
      if (action.type === 'deliver') void audio.play('thanks');
      if (action.type === 'move')
        audio.effect('machine' in action.destination ? 'insert' : 'place');
    } else if (result.kind !== 'confirm') audio.effect('gentle');
  }
  ui.change();
}
