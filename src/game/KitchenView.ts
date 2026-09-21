import type Phaser from 'phaser';
import { FAMILY_STATIONS, RECIPES, type StationId } from '../content/recipes';
import type { GameState } from '../rules/types';
import type { ViewState } from './input';
import type { Layout, Point } from './layout';
export function stationPoint(id: StationId, l: Layout): Point {
  const r = l.regions.work;
  return { x: r.x + r.width * (id === 'grill' ? 0.23 : id === 'board' ? 0.64 : 0.32), y: r.y + 44 };
}
export function stationSlotPoint(id: StationId, slot: number, l: Layout): Point {
  const p = stationPoint(id, l);
  if (id === 'grill') return p;
  return { x: p.x + ((slot % 3) - 1) * 48, y: p.y + (slot < 3 ? -22 : 26) };
}
export class KitchenView {
  private nodes: Phaser.GameObjects.GameObject[] = [];
  private bars: Phaser.GameObjects.Graphics;
  constructor(private scene: Phaser.Scene) {
    this.bars = scene.add.graphics().setDepth(13);
  }
  draw(s: GameState, l: Layout, ui: ViewState, density: number): void {
    for (const n of this.nodes) n.destroy();
    this.nodes = [];
    for (const id of FAMILY_STATIONS[s.session.family]) {
      const p = stationPoint(id, l),
        st = s.stations[id];
      const sprite = this.scene.add.image(p.x, p.y, `${id}-station`).setDepth(4);
      const h = 108 * l.scale;
      sprite.setDisplaySize((h * sprite.width) / sprite.height, h);
      this.nodes.push(sprite);
      const label = id === 'ice' ? '冰淇淋台' : id === 'board' ? '组合板' : '煎台';
      const text = this.scene.add
        .text(
          p.x,
          l.regions.work.y + l.regions.work.height - 22,
          st.status === 'processing'
            ? '制作中…'
            : st.status === 'ready'
              ? '点成品接取'
              : id === 'ice'
                ? '接好冰淇淋'
                : id === 'board'
                  ? '盖合'
                  : '煎制',
          {
            fontSize: '18px',
            fontFamily: 'Trebuchet MS, PingFang SC',
            color: '#203b2c',
            backgroundColor: '#fff0bf',
            padding: { x: 12, y: 8 },
          },
        )
        .setOrigin(0.5)
        .setResolution(density)
        .setDepth(8);
      this.nodes.push(text);
      ui.hotspots.push(
        {
          id: `station-${id}`,
          kind: 'station',
          label: `选择${label}备餐`,
          x: p.x,
          y: p.y,
          width: 105 * l.scale,
          height: 95 * l.scale,
        },
        {
          id: `start-station-${id}`,
          kind: 'start',
          label: `${label}开始制作`,
          x: p.x,
          y: l.regions.work.y + l.regions.work.height - 22,
          width: Math.max(110, 120 * l.scale),
          height: 44,
        },
      );
    }
  }
  update(s: GameState, l: Layout): void {
    this.bars.clear();
    for (const id of FAMILY_STATIONS[s.session.family]) {
      const st = s.stations[id];
      if (st.status !== 'processing') continue;
      const p = stationPoint(id, l),
        duration = RECIPES.find((r) => r.id === st.recipe)?.ms ?? 1;
      this.bars
        .fillStyle(0x183f32)
        .fillRoundedRect(p.x - 45, p.y + 42, 90, 8, 4)
        .fillStyle(0xf2c057)
        .fillRoundedRect(p.x - 45, p.y + 42, 90 * (1 - st.remaining / duration), 8, 4);
    }
  }
  destroy(): void {
    for (const n of this.nodes) n.destroy();
    this.bars.destroy();
  }
}
