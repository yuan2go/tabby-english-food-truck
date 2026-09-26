import type Phaser from 'phaser';
import { FAMILY_STATIONS, RECIPES, type StationId } from '../content/recipes';
import { stationItems } from '../rules/cooking';
import type { GameState } from '../rules/types';
import type { ViewState } from './input';
import type { Layout, Point } from './layout';
export function stationPoint(id: StationId, l: Layout): Point {
  const r = l.regions.work;
  return {
    x: r.x + r.width * (id === 'grill' ? 0.24 : id === 'board' ? 0.72 : 0.5),
    y: r.y + (l.form === 'desktop' || l.form === 'tablet' ? 96 : 52),
  };
}
export function stationActionPoint(id: StationId, l: Layout): Point {
  const p = stationPoint(id, l);
  return { x: p.x, y: Math.min(l.regions.work.y + l.regions.work.height - 24, p.y + 89 * l.scale) };
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
      const foods = stationItems(s, id);
      const has = (product: string) => foods.filter((item) => item.product === product).length;
      const finished = st.status === 'ready';
      const boardSandwich =
        has('bread') > 0 ||
        (!has('bun') && !has('cooked-patty') && s.session.family === 'sandwich');
      const cue =
        id === 'ice'
          ? `${has('cup') ? '杯' : has('cone') ? '筒' : '选杯/筒'} · ${has('vanilla') + has('strawberry')}球${has('banana') ? ' + 香蕉' : ''}`
          : id === 'grill'
            ? st.status === 'processing'
              ? '正在煎熟'
              : finished
                ? '熟饼已好'
                : has('patty')
                  ? '生饼就位'
                  : '放生饼'
            : boardSandwich
              ? `${has('bread')}片面包 · ${has('cheese') + has('lettuce') + has('tomato')}份夹层`
              : `${has('bun') ? '面包' : '等面包'} · ${has('cooked-patty') ? '熟饼' : '等熟饼'} · ${has('cheese') + has('lettuce') + has('tomato')}份配料`;
      // These marks are a visual reading of actual item instances, not another recipe evaluator.
      if (foods.length && !finished) {
        const preview = this.scene.add.graphics().setDepth(6);
        preview.fillStyle(0xfff2c9, 0.85).fillRoundedRect(p.x - 39, p.y - 18, 78, 39, 12);
        if (id === 'ice') {
          preview
            .fillStyle(has('cone') ? 0xc78b4b : 0xb6d8e1)
            .fillRoundedRect(p.x - 19, p.y + 1, 38, 14, 6);
          for (let i = 0; i < has('vanilla') + has('strawberry'); i++) {
            preview
              .fillStyle(i < has('vanilla') ? 0xfff3cc : 0xf4a9b9)
              .fillCircle(p.x - 8 + i * 16, p.y - 5 - i * 5, 10);
          }
          if (has('banana')) preview.fillStyle(0xf4cf55).fillCircle(p.x + 25, p.y - 6, 6);
        } else if (id === 'board') {
          const layers = boardSandwich
            ? [
                has('bread') && 0xc99855,
                has('cheese') && 0xf4d259,
                has('lettuce') && 0x79b875,
                has('tomato') && 0xd66c58,
                has('bread') > 1 && 0xc99855,
              ]
            : [
                has('bun') && 0xc99855,
                has('lettuce') && 0x79b875,
                has('cooked-patty') && 0x7c5141,
                has('cheese') && 0xf4d259,
                has('tomato') && 0xd66c58,
              ];
          layers
            .filter((color): color is number => Boolean(color))
            .forEach((color, i) => {
              preview.fillStyle(color).fillRoundedRect(p.x - 29, p.y + 12 - i * 8, 58, 7, 3);
            });
        } else {
          preview.fillStyle(0xa7583a).fillCircle(p.x, p.y, 14);
          if (st.status === 'processing') preview.lineStyle(3, 0xf5c458).strokeCircle(p.x, p.y, 20);
        }
        this.nodes.push(preview);
      }
      const text = this.scene.add
        .text(
          l.form === 'phone' && id === 'ice' ? l.regions.work.x + l.regions.work.width * 0.73 : p.x,
          l.form === 'phone' && id === 'ice' ? l.regions.work.y + 27 : p.y - 72 * l.scale,
          st.status === 'processing'
            ? `${id === 'grill' ? '煎制' : id === 'ice' ? '接球' : '盖合'}中…`
            : st.status === 'ready'
              ? '点成品接取'
              : cue,
          {
            fontSize: '14px',
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
          ...stationActionPoint(id, l),
          width: Math.max(110, 112 * l.scale),
          height: 48,
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
