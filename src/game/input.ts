import { type Product, REQUESTS } from '../content/catalog';
import { isFinished, type StationId } from '../content/recipes';
import type { ForegroundAudio } from '../platform/audio';
import type { GameController } from '../platform/controller';
import type { GameState, Source, TrayId } from '../rules/types';
import type { DoubleTap } from './gestures';
import type { Layout } from './layout';
export type Selection = Source | { tray: TrayId } | null;
export interface Hotspot {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind: 'supply' | 'item' | 'tray' | 'guest' | 'machine' | 'start' | 'clear' | 'note' | 'station';
}
export interface ViewState {
  layout?: Layout;
  openHelp: () => void;
  prep?: 'tray' | 'machine' | StationId;
  doubleTap?: DoubleTap;
  elements: Map<string, HTMLButtonElement>;
  lowGraphics: boolean;
  inputBlocked: boolean;
  teaching: string | null;
  lessonProducts?: readonly Product[];
  selected: Selection;
  selectedTray: TrayId;
  selectedGuest: string;
  hotspots: Hotspot[];
  focus: string | null;
  ready: boolean;
  assetFailure: boolean;
  assetLoading?: boolean;
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
  const s = controller.state,
    selected = dragSource ?? ui.selected;
  const source = selected && ('supply' in selected || 'item' in selected) ? selected : null;
  let command: Parameters<GameController['command']>[0] | undefined;
  const targetItem = id.startsWith('item-') ? s.items.find((i) => i.id === id.slice(5)) : undefined;
  if (
    dragSource &&
    targetItem &&
    source &&
    (!('item' in source) || source.item !== targetItem.id)
  ) {
    if (targetItem.location.startsWith('tray:')) id = `tray-${targetItem.location.split(':')[1]}`;
    else if (targetItem.location.startsWith('station:'))
      id = `station-${targetItem.location.split(':')[1]}`;
    else if (targetItem.location.startsWith('machine:')) id = targetItem.location.replace(':', '-');
  }
  if (id === 'note') {
    ui.openHelp();
    return;
  }
  if (id === 'start') command = { type: 'start-machine', tray: ui.selectedTray };
  else if (id.startsWith('start-station-'))
    command = { type: 'start-station', station: id.slice(14) as StationId, tray: ui.selectedTray };
  else if (id.startsWith('send-'))
    command = { type: 'deliver', tray: ui.selectedTray, order: id.slice(5) };
  else if (id === 'restore') command = { type: 'restore-cleared', tray: ui.selectedTray };
  else if (id === 'clear' && source)
    command = { type: 'move', source, destination: { discard: true, confirmed: false } };
  else if (id.startsWith('supply-') && !dragSource) {
    const product = id.slice(7) as Product;
    const prep = ui.prep ?? 'tray';
    command = {
      type: 'move',
      source: { supply: product },
      destination:
        prep === 'tray'
          ? { tray: ui.selectedTray }
          : prep === 'machine'
            ? { machine: product === 'cup' ? 'cup' : 'apple' }
            : { station: prep },
    };
  } else if (id.startsWith('tray-')) {
    const tray = Number(id.slice(5)) as TrayId;
    ui.selectedTray = tray;
    ui.prep = 'tray';
    if (source) command = { type: 'move', source, destination: { tray } };
    else {
      ui.selected = { tray };
      controller.message = `${tray + 1}号盘是当前备餐位置，点食材添加。`;
    }
  } else if (id.startsWith('machine-')) {
    ui.prep = 'machine';
    if (source)
      command = {
        type: 'move',
        source,
        destination: { machine: id === 'machine-cup' ? 'cup' : 'apple' },
      };
    else {
      ui.selected = null;
      if (
        !ui.teaching &&
        !s.items.some((i) => i.location === 'machine:cup') &&
        ['empty', 'loaded'].includes(s.machine.status)
      )
        command = { type: 'prepare-cup' };
      else controller.message = '果汁机已选中：点水果，再点空杯。';
    }
  } else if (id.startsWith('station-')) {
    const station = id.slice(8) as StationId;
    ui.prep = station;
    if (source) command = { type: 'move', source, destination: { station } };
    else {
      ui.selected = null;
      controller.message = '备餐台已选中，点食材放到这里。';
    }
  } else if (id.startsWith('guest-')) {
    ui.selectedGuest = id;
    if (dragSource && 'tray' in dragSource)
      command = { type: 'deliver', tray: dragSource.tray, order: id };
    else {
      const order = s.orders.find((o) => o.id === id);
      if (order?.status === 'waiting') void audio.play(REQUESTS[order.request].audio);
      controller.message = '听这位客人的请求；准备好后点送餐。';
    }
  } else if (targetItem) {
    if (targetItem.location.startsWith('delivery:')) return;
    if (ui.doubleTap?.tap(targetItem.id, performance.now()) && !isFinished(targetItem.product))
      command = {
        type: 'move',
        source: { item: targetItem.id },
        destination: { discard: true, confirmed: false },
      };
    else {
      ui.selected = { item: targetItem.id };
      // The occupied work object remains a direct target for the next ingredient.
      // Selection does not move, replace or consume the existing food.
      if (targetItem.location.startsWith('station:'))
        ui.prep = targetItem.location.split(':')[1] as StationId;
      else if (targetItem.location.startsWith('machine:')) ui.prep = 'machine';
      else if (targetItem.location.startsWith('tray:')) {
        ui.prep = 'tray';
        ui.selectedTray = Number(targetItem.location.split(':')[1]) as TrayId;
      }
      controller.message = isFinished(targetItem.product)
        ? '成品已选中：点盘子接取；清理需要确认。'
        : '已选中。再点同一份可退回，也可以点旁边的放回。';
    }
  } else {
    ui.selected = null;
    ui.doubleTap?.cancel();
    controller.message = '已取消选择，食物仍在原处。';
  }
  if (command) {
    const action = command,
      r = controller.command(action);
    if (r.kind === 'confirm' && action.type === 'move')
      ui.confirmClear(() => {
        controller.command({ ...action, destination: { discard: true, confirmed: true } });
        ui.selected = null;
        ui.change();
      });
    if (r.kind === 'ok') {
      ui.selected = null;
      if (action.type === 'move') audio.effect('place');
    } else if (r.kind !== 'confirm') audio.effect('gentle');
  }
  ui.change();
}
