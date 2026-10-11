import { type Product, REQUESTS } from '../content/catalog';
import { type Family, isFinished, type StationId } from '../content/recipes';
import type { ForegroundAudio } from '../platform/audio';
import type { GameController } from '../platform/controller';
import type { GameState, Order, Source, TrayId } from '../rules/types';
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
  kind:
    | 'supply'
    | 'item'
    | 'tray'
    | 'guest'
    | 'machine'
    | 'start'
    | 'clear'
    | 'note'
    | 'station'
    | 'tool';
}
export interface ViewState {
  layout?: Layout;
  openHelp: () => void;
  listen?: (order: Order) => void;
  preparation?: () => void;
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
  feedback?: string;
  openNote: () => void;
  confirmClear: (action: () => void) => void;
  change: () => void;
}
export function sourceFor(id: string, s: GameState): Selection {
  if (id.startsWith('supply-')) return { supply: id.slice(7) as Product };
  if (id.startsWith('item-') && s.items.some((i) => i.id === id.slice(5)))
    return { item: id.slice(5) };
  if (id.startsWith('lift-tray-')) return { tray: Number(id.slice(10)) as TrayId };
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
  ui.feedback = '';
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
  if (id.startsWith('family-')) command = { type: 'family', family: id.slice(7) as Family };
  else if (id === 'start') command = { type: 'start-machine', tray: ui.selectedTray };
  else if (id.startsWith('start-station-'))
    command = { type: 'start-station', station: id.slice(14) as StationId, tray: ui.selectedTray };
  else if (id.startsWith('send-'))
    command = { type: 'deliver', tray: ui.selectedTray, order: id.slice(5) };
  else if (id === 'restore') command = { type: 'restore-cleared', tray: ui.selectedTray };
  else if (id === 'clear' && source)
    command = { type: 'move', source, destination: { discard: true, confirmed: false } };
  else if (id.startsWith('supply-') && dragSource && source && 'item' in source) {
    const item = s.items.find((food) => food.id === source.item);
    if (item?.product === id.slice(7))
      command = { type: 'move', source, destination: { discard: true, confirmed: false } };
  } else if (id.startsWith('supply-') && !dragSource) {
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
  } else if (id.startsWith('lift-tray-')) {
    const tray = Number(id.slice(10));
    if (tray !== 0 && tray !== 1) return;
    if (s.trays[tray].remaining) {
      ui.feedback = '空盘还在回来，另一盘可以继续准备。';
    } else {
      const filled = s.items.some((item) => item.location.startsWith(`tray:${tray}:`));
      const putDown = selected && 'tray' in selected && selected.tray === tray;
      ui.selectedTray = tray;
      ui.prep = 'tray';
      ui.doubleTap?.cancel();
      ui.selected = filled && !putDown ? { tray } : null;
      controller.message = putDown
        ? '整盘放下了，食物仍在盘中。'
        : filled
          ? '拿起整盘，点你选择的朋友交付；气泡只重听。'
          : '这只盘还空着，点食品放进来。';
    }
  } else if (id.startsWith('tray-')) {
    const tray = Number(id.slice(5)) as TrayId;
    ui.selectedTray = tray;
    ui.prep = 'tray';
    if (source) command = { type: 'move', source, destination: { tray } };
    else {
      const filled = s.items.some((item) => item.location.startsWith(`tray:${tray}:`));
      const putDown = selected && 'tray' in selected && selected.tray === tray;
      ui.selected = filled && !putDown ? { tray } : null;
      controller.message = putDown
        ? '餐盘放好了，随时可以再拿起。'
        : filled
          ? '餐盘拿好了，点要招呼的朋友递出。'
          : '点食材，直接放到这个盘子里。';
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
  } else if (id.startsWith('guest-') || id.startsWith('listen-guest-')) {
    const guest = id.replace(/^listen-/, '');
    ui.selectedGuest = guest;
    if (!id.startsWith('listen-') && selected && 'tray' in selected)
      command = { type: 'deliver', tray: selected.tray, order: guest };
    else {
      const order = s.orders.find((o) => o.id === guest);
      if (order?.status === 'waiting') {
        if (ui.listen) ui.listen(order);
        else void audio.play(REQUESTS[order.request].audio, undefined, order.id);
      }
      controller.message = '听朋友说一说。装好餐盘后，拿起来递给朋友。';
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
      if (action.type === 'family')
        ui.prep = (
          {
            juice: 'machine',
            ice: 'ice',
            sandwich: 'board',
            burger: 'grill',
            ready: 'tray',
          } as const
        )[action.family];
      if (
        action.type === 'family' &&
        action.family === 'juice' &&
        !ui.teaching &&
        !controller.state.items.some((i) => i.location === 'machine:cup') &&
        ['empty', 'loaded'].includes(controller.state.machine.status)
      )
        controller.command({ type: 'prepare-cup' });
      if (action.type === 'start-machine') ui.prep = 'tray';
      if (action.type === 'start-station') ui.prep = action.station === 'grill' ? 'board' : 'tray';
      if (action.type === 'move') audio.effect('place');
    } else if (r.kind !== 'confirm') {
      ui.feedback = r.message;
      audio.effect('gentle');
    }
  }
  if (
    id.startsWith('machine-') ||
    id.startsWith('station-') ||
    id.startsWith('family-') ||
    command?.type === 'move'
  )
    ui.preparation?.();
  ui.change();
}
