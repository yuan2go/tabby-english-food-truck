import { recipeFor } from '../content/recipes';
import { openCommission } from '../rules/adventure';
import { stationItems } from '../rules/cooking';
import { trayItems } from '../rules/game';
import type { GameState } from '../rules/types';
import type { ViewState } from './input';
/** Next action depends on actual objects, never on the requested answer. */
export function preparationCue(
  s: GameState,
  ui: Pick<ViewState, 'prep' | 'selectedTray' | 'selected'>,
) {
  const commission = openCommission(s.adventure);
  if (ui.selected && 'tray' in ui.selected)
    return {
      text: commission
        ? `餐盘拿好了 → ${s.orders.some((o) => o.status === 'waiting') ? '点朋友递出，或' : ''}${commission.label}`
        : '餐盘拿好了 → 点朋友递出；点气泡可再听',
      target: undefined,
    };
  if (ui.selected && 'item' in ui.selected)
    return {
      text: '选中这一份 → 点盘内或制作台移动；要端整盘，点盘把',
      target: `tray-${ui.selectedTray}`,
    };
  const busy =
    s.machine.status === 'processing' ||
    Object.values(s.stations).some((st) => st.status === 'processing');
  if (ui.prep === 'machine') {
    if (s.machine.status === 'processing')
      return { text: '果汁正在制作 → 等成品到托盘，或先准备另一盘', target: undefined };
    const foods = s.items.filter((i) => i.location.startsWith('machine:'));
    const ready = recipeFor(
      'machine',
      foods.map((i) => i.product),
    );
    const cup = foods.some((i) => i.product === 'cup');
    return {
      text: ready
        ? '水果和杯放好了 → 按果汁机开关'
        : cup
          ? '点水果放进机器；杯子已经备好'
          : '先点空杯放到出汁口，再放水果',
      target: ready ? 'start' : cup ? 'machine-apple' : 'machine-cup',
    };
  }
  if (ui.prep && ui.prep !== 'tray') {
    const station = ui.prep;
    const ready = recipeFor(
      station,
      stationItems(s, station).map((i) => i.product),
    );
    return {
      text: ready
        ? '食材就位 → 按设备开关制作'
        : station === 'board' && s.stations.grill.status === 'processing'
          ? '肉饼正在煎 → 可以先在组合板放面包和配料'
          : '点食材放到亮着的制作台；备齐后按开关',
      target: ready ? `start-station-${station}` : `station-${station}`,
    };
  }
  if (trayItems(s, ui.selectedTray).length)
    return {
      text: commission
        ? `这一盘备好了 → ${commission.label}${s.orders.some((o) => o.status === 'waiting') ? '，或拿盘点朋友' : ''}`
        : '备好这一盘 → 点托盘拿起，再点朋友递出',
      target: `tray-${ui.selectedTray}`,
    };
  if (s.orders.some((o) => o.status === 'leaving'))
    return { text: '大咪正在递餐 → 等朋友接好；还能准备另一盘', target: undefined };
  if (busy) return { text: '设备制作中 → 成品会到托盘；可以继续准备', target: undefined };
  return { text: '点食材直接装盘；要制作时先点设备', target: `tray-${ui.selectedTray}` };
}
