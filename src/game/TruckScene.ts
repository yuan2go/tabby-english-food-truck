import Phaser from 'phaser';
import { HELPER_MS, JUICE_MS, PRODUCT_NAMES, type Product, RETURN_MS } from '../content/catalog';
import type { ForegroundAudio } from '../platform/audio';
import type { GameController } from '../platform/controller';
import { trayItems } from '../rules/game';
import type { GameState, Item, Location, TrayId } from '../rules/types';
import { ASSET_IDS, assetUrl } from './assets';
import { activate, type Hotspot, type Selection, sourceFor, type ViewState } from './input';
import { type Layout, layoutFor, type Point } from './layout';

interface Motion {
  image: Phaser.GameObjects.Image;
  from: Point;
  to: Point;
  start: number;
  duration: number;
  baseWidth: number;
  baseHeight: number;
}
export class TruckScene extends Phaser.Scene {
  private layout!: Layout;
  private unsubscribe: (() => void) | null = null;
  private rendered: GameState | null = null;
  private signature = '';
  private deliveries: { tray: TrayId; seat: TrayId; start: number; items: Item[] }[] = [];
  private group!: Phaser.GameObjects.Container;
  private progress!: Phaser.GameObjects.Graphics;
  private focusRing!: Phaser.GameObjects.Graphics;
  private dragImage: Phaser.GameObjects.Image | null = null;
  private press: {
    pointerId: number;
    x: number;
    y: number;
    id: string;
    source: Selection;
    moved: boolean;
  } | null = null;
  private motions: Motion[] = [];
  private held: Phaser.GameObjects.Image[] = [];
  private guests: Phaser.GameObjects.Image[] = [];
  private machineImage: Phaser.GameObjects.Image | null = null;
  private machineApple: Phaser.GameObjects.Image | null = null;
  private failed = new Set<string>();
  private discardDelta = true;
  private helperLabel: Phaser.GameObjects.Text | null = null;
  private readonly resize = () => {
    this.cancel();
    this.discardDelta = true;
    this.draw();
  };
  private readonly visibility = () => {
    this.cancel();
    this.discardDelta = true;
    this.controller.pause('hidden', document.hidden);
    if (document.hidden) this.audio.stop();
  };
  private readonly blur = () => {
    this.cancel();
    this.discardDelta = true;
    this.controller.pause('blur', true);
    this.audio.stop();
  };
  private readonly focus = () => {
    this.discardDelta = true;
    this.controller.pause('blur', false);
  };
  private readonly cancelNative = () => this.cancel();
  private readonly key = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      this.cancel();
      this.ui.selected = null;
      this.ui.change();
    }
  };
  constructor(
    private readonly controller: GameController,
    private readonly audio: ForegroundAudio,
    private readonly ui: ViewState,
  ) {
    super('truck');
  }
  preload(): void {
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      this.failed.add(file.key);
    });
    for (const id of ASSET_IDS) this.load.image(id, assetUrl(id));
  }
  create(): void {
    this.group = this.add.container();
    this.progress = this.add.graphics();
    this.focusRing = this.add.graphics();
    this.ui.assetFailure = this.failed.size > 0;
    this.ui.resourceMessage = this.failed.size
      ? `有${this.failed.size}份画面未能加载。重试不会重置进度。`
      : '';
    this.ui.ready = true;
    this.unsubscribe = this.controller.subscribe(() => {
      if (this.controller.pauses.size) this.cancel();
      if (this.signature !== this.worldSignature()) this.draw();
    });
    this.scale.on('resize', this.resize);
    this.input.addPointer(2);
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.down(pointer));
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => this.move(pointer));
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => this.up(pointer));
    this.input.on('pointerupoutside', this.cancelNative);
    document.addEventListener('visibilitychange', this.visibility);
    window.addEventListener('blur', this.blur);
    window.addEventListener('focus', this.focus);
    window.addEventListener('keydown', this.key);
    this.game.canvas.addEventListener('pointercancel', this.cancelNative);
    this.game.canvas.addEventListener('touchcancel', this.cancelNative);
    this.events.once('shutdown', () => {
      this.unsubscribe?.();
      this.scale.off('resize', this.resize);
      this.input.removeAllListeners();
      document.removeEventListener('visibilitychange', this.visibility);
      window.removeEventListener('blur', this.blur);
      window.removeEventListener('focus', this.focus);
      window.removeEventListener('keydown', this.key);
      this.game.canvas.removeEventListener('pointercancel', this.cancelNative);
      this.game.canvas.removeEventListener('touchcancel', this.cancelNative);
      this.cancel();
    });
    this.draw();
    this.ui.change();
  }
  retry(): void {
    if (!this.failed.size || this.load.isLoading()) return;
    const keys = [...this.failed];
    this.failed.clear();
    for (const key of keys) this.load.image(key, assetUrl(key));
    this.load.once('complete', () => {
      this.ui.assetFailure = this.failed.size > 0;
      this.ui.resourceMessage = this.failed.size ? '画面仍未加载，请检查连接再重试。' : '';
      this.draw();
      this.ui.change();
    });
    this.load.start();
  }
  private hot(
    id: string,
    label: string,
    kind: Hotspot['kind'],
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    this.ui.hotspots.push({
      id,
      label,
      kind,
      x,
      y,
      width: Math.max(44, width),
      height: Math.max(44, height),
    });
  }
  private image(
    id: string,
    x: number,
    y: number,
    width: number,
    height = width,
  ): Phaser.GameObjects.Image {
    const img = this.add.image(x, y, this.textures.exists(id) ? id : '__MISSING');
    img.setDisplaySize(width, height);
    this.group.add(img);
    return img;
  }
  private text(
    value: string,
    x: number,
    y: number,
    size = 16,
    color = '#254337',
  ): Phaser.GameObjects.Text {
    const text = this.add
      .text(x, y, value, {
        fontFamily: '"Trebuchet MS", "PingFang SC", sans-serif',
        fontSize: `${size}px`,
        color,
        align: 'center',
        fontStyle: 'bold',
        padding: { x: 5, y: 3 },
      })
      .setOrigin(0.5);
    this.group.add(text);
    return text;
  }
  private badge(
    value: string,
    x: number,
    y: number,
    width: number,
    height = 32,
    active = false,
  ): void {
    const g = this.add.graphics();
    g.fillStyle(active ? 0xf5cf73 : 0xf9efd6, 0.96);
    g.lineStyle(1.5, 0x41614b, 0.7);
    g.fillRoundedRect(x - width / 2, y - height / 2, width, height, 10);
    g.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 10);
    this.group.add(g);
    this.text(value, x, y, Math.min(17, height * 0.5));
  }
  private itemPoint(item: Item, l = this.layout): Point {
    const p = item.location;
    if (p.startsWith('tray:')) {
      const [, tray, slot] = p.split(':');
      const center = l.trays[Number(tray) as TrayId];
      return {
        x: center.x + (Number(slot) - 1) * Math.min(48, l.trayWidth * 0.26),
        y: center.y - 7,
      };
    }
    if (p === 'machine:apple')
      return { x: l.machine.x - 10 * l.scale, y: l.machine.y - 42 * l.scale };
    if (p === 'machine:cup')
      return { x: l.machine.x + 57 * l.scale, y: l.machine.y + 29 * l.scale };
    return { x: l.helper.x, y: l.helper.y };
  }
  private supplyPoint(product: Product): Point {
    return this.layout.supplies[product === 'apple' ? 0 : product === 'banana' ? 1 : 2];
  }
  private worldSignature(): string {
    const s = this.controller.state;
    return JSON.stringify([
      s.runId,
      s.items,
      s.machine.status,
      s.helper?.id,
      s.orders.map((o) => o.status),
      s.trays.map((t) => t.remaining > 0),
      this.ui.selectedGuest,
    ]);
  }
  private draw(): void {
    if (!this.group) return;
    this.layout = layoutFor(this.scale.width, this.scale.height);
    const l = this.layout;
    const s = this.controller.state;
    this.signature = this.worldSignature();
    if (this.rendered?.runId !== s.runId) this.deliveries = [];
    this.group.removeAll(true);
    this.motions = [];
    this.held = [];
    this.machineApple = null;
    this.guests = [];
    this.ui.hotspots = [];
    this.image('market', l.width / 2, l.height / 2, Math.max(l.width, l.height * 1.36), l.height);
    const top = this.add.graphics();
    top.fillStyle(0x173e32, 0.16);
    top.fillRect(0, 0, l.width, 60);
    this.group.add(top);
    for (const o of s.orders) {
      const p = l.guests[o.seat];
      if (o.status !== 'done') {
        const pose = o.status === 'leaving' ? 1 : 0;
        const guest = this.image(
          `guest-${o.seat}-${pose}`,
          p.x,
          p.y,
          l.guestHeight * 0.97,
          l.guestHeight,
        );
        this.guests.push(guest);
        guest.setData('seat', o.seat);
        this.badge(
          o.status === 'leaving' ? 'Thank you!' : `客人 ${o.seat === 0 ? 'A' : 'B'}  ♫`,
          p.x,
          p.y + l.guestHeight * 0.44,
          Math.max(98, l.guestHeight * 0.65),
          32,
          this.ui.selectedGuest === o.id,
        );
        this.hot(
          o.id,
          `客人${o.seat === 0 ? 'A' : 'B'}：听请求或递出已选托盘`,
          'guest',
          p.x,
          p.y,
          l.guestHeight * 0.85,
          l.guestHeight,
        );
      } else this.badge('✓ 谢谢款待', p.x, p.y + l.guestHeight * 0.38, 115);
    }
    const m = l.machine;
    this.machineImage = this.image('machine', m.x, m.y, 123 * l.scale, 145 * l.scale);
    this.hot(
      'machine-apple',
      '果汁机苹果入口',
      'machine',
      m.x - 10 * l.scale,
      m.y - 43 * l.scale,
      55,
      50,
    );
    this.hot(
      'machine-cup',
      '果汁机杯座',
      'machine',
      m.x + 57 * l.scale,
      m.y + 29 * l.scale,
      48,
      52,
    );
    if (!s.items.some((i) => i.location === 'machine:cup')) {
      const ring = this.add.graphics();
      ring.lineStyle(2, 0xfaf0d9, 0.8);
      ring.strokeEllipse(m.x + 57 * l.scale, m.y + 46 * l.scale, 42, 16);
      this.group.add(ring);
    }
    this.badge(
      s.machine.status === 'processing'
        ? '制作中…'
        : s.machine.status === 'ready'
          ? '果汁好了'
          : '开始榨汁',
      m.x,
      m.y + 86 * l.scale,
      Math.max(100, 120 * l.scale),
      34,
      s.machine.status === 'ready',
    );
    this.hot('start', '启动果汁机', 'start', m.x, m.y + 86 * l.scale, 120 * l.scale, 44);
    // Character identity is intentionally not invented before an approved reference arrives.
    this.badge(
      '小猫便签',
      l.helper.x,
      l.helper.y + 23,
      Math.max(104, 112 * l.scale),
      42,
      Boolean(s.helper),
    );
    this.helperLabel = this.text(
      s.helper ? '正在取料…' : '角色参考待确认',
      l.helper.x,
      l.helper.y - 22,
      Math.max(12, 14 * l.scale),
      '#f7efd7',
    );
    this.hot('note', '打开小猫便签', 'note', l.helper.x, l.helper.y + 18, 118 * l.scale, 66);
    for (const tray of [0, 1] as const) {
      const p = l.trays[tray];
      const returning = s.trays[tray].remaining > 0;
      this.image('tray', p.x, p.y, l.trayWidth, l.trayWidth * 0.64).setAlpha(returning ? 0.45 : 1);
      const active =
        this.ui.selected && 'tray' in this.ui.selected && this.ui.selected.tray === tray;
      this.badge(
        returning ? '回盘中' : `${tray + 1}号盘 · 递出`,
        p.x,
        p.y + l.trayWidth * 0.25,
        Math.min(l.trayWidth - 10, 148),
        32,
        Boolean(active),
      );
      this.hot(
        `tray-${tray}`,
        `${tray + 1}号托盘：放入食品或选择整盘`,
        'tray',
        p.x,
        p.y + 14,
        l.trayWidth,
        Math.max(70, l.trayWidth * 0.5),
      );
      if (s.helper?.tray === tray)
        for (const slot of s.helper.slots) {
          const g = this.add.graphics();
          g.lineStyle(2, 0xd19638, 0.9);
          g.strokeCircle(p.x + (slot - 1) * Math.min(48, l.trayWidth * 0.26), p.y - 7, 18);
          this.group.add(g);
        }
    }
    const products: Product[] = ['apple', 'banana', 'cup'];
    for (const [index, product] of products.entries()) {
      const p = l.supplies[index];
      if (!p) continue;
      const g = this.add.graphics();
      g.fillStyle(0x163f32, 0.93);
      g.fillRoundedRect(p.x - 34 * l.scale, p.y - 32 * l.scale, 68 * l.scale, 74 * l.scale, 10);
      g.lineStyle(1.5, 0xcba663);
      g.strokeRoundedRect(p.x - 34 * l.scale, p.y - 32 * l.scale, 68 * l.scale, 74 * l.scale, 10);
      this.group.add(g);
      this.image(product, p.x, p.y - 1, 50 * l.scale, 50 * l.scale);
      this.hot(
        `supply-${product}`,
        `拿${PRODUCT_NAMES[product]}`,
        'supply',
        p.x,
        p.y,
        Math.max(60, 68 * l.scale),
        Math.max(60, 74 * l.scale),
      );
    }
    this.badge('放回', l.clear.x, l.clear.y, Math.max(56, 65 * l.scale), 46);
    this.hot('clear', '放回原料或清理成品', 'clear', l.clear.x, l.clear.y, 65 * l.scale, 60);
    for (const item of s.items) {
      if (item.location === 'helper') {
        const image = this.image(item.product, l.helper.x, l.helper.y, 38 * l.scale);
        this.held.push(image);
        continue;
      }
      const to = this.itemPoint(item);
      const size = item.location.startsWith('tray:')
        ? Math.min(45, l.trayWidth * 0.27)
        : 37 * l.scale;
      const image = this.image(item.product, to.x, to.y, size, size);
      if (item.location === 'machine:apple') this.machineApple = image;
      const previous =
        this.rendered?.runId === s.runId
          ? this.rendered.items.find((i) => i.id === item.id)
          : undefined;
      if (
        (!previous || previous.location !== item.location) &&
        this.rendered?.runId === s.runId &&
        !this.reduced()
      ) {
        const from =
          previous?.location === 'helper'
            ? to
            : previous
              ? this.itemPoint(previous)
              : this.supplyPoint(item.product);
        this.motions.push({
          image,
          from,
          to,
          start: s.gameTime,
          duration: 240,
          baseWidth: size,
          baseHeight: size,
        });
      }
      this.hot(
        `item-${item.id}`,
        `${PRODUCT_NAMES[item.product]}，${this.locationLabel(item.location)}`,
        'item',
        to.x,
        to.y,
        44,
        44,
      );
    }
    if (this.rendered?.runId === s.runId)
      for (const order of s.orders) {
        const old = this.rendered.orders.find((o) => o.id === order.id);
        if (order.status === 'leaving' && old?.status === 'waiting') {
          const index = s.trays.findIndex(
            (t, i) => t.remaining > 0 && this.rendered?.trays[i]?.remaining === 0,
          );
          if (index === 0 || index === 1)
            this.deliveries.push({
              tray: index,
              seat: order.seat,
              start: s.gameTime,
              items: trayItems(this.rendered, index),
            });
        }
      }
    this.deliveries = this.deliveries.filter((cue) => s.gameTime - cue.start < RETURN_MS);
    if (!this.reduced())
      for (const cue of this.deliveries) {
        const from = l.trays[cue.tray],
          to = l.guests[cue.seat];
        const tray = this.image('tray', from.x, from.y, l.trayWidth, l.trayWidth * 0.64);
        this.motions.push({
          image: tray,
          from,
          to,
          start: cue.start,
          duration: RETURN_MS,
          baseWidth: l.trayWidth,
          baseHeight: l.trayWidth * 0.64,
        });
        for (const item of cue.items) {
          const pos = this.itemPoint(item);
          const image = this.image(item.product, pos.x, pos.y, 40, 40);
          this.motions.push({
            image,
            from: pos,
            to: { x: to.x + pos.x - from.x, y: to.y },
            start: cue.start,
            duration: RETURN_MS * 0.65,
            baseWidth: 40,
            baseHeight: 40,
          });
        }
      }
    this.rendered = structuredClone(s);
    this.ui.change();
  }
  private locationLabel(location: Location): string {
    return location.startsWith('tray:')
      ? `${Number(location.split(':')[1]) + 1}号盘`
      : location === 'machine:apple'
        ? '机器入口'
        : location === 'machine:cup'
          ? '杯座'
          : '小猫手里';
  }
  private reduced(): boolean {
    return matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  update(_time: number, delta: number): void {
    if (this.discardDelta) {
      this.discardDelta = false;
    } else this.controller.tick(delta);
    if (!this.layout) return;
    if (this.signature !== this.worldSignature()) this.draw();
    const s = this.controller.state;
    const l = this.layout;
    this.progress.clear();
    this.focusRing.clear();
    if (s.machine.status === 'processing') {
      const p = 1 - s.machine.remaining / JUICE_MS;
      this.machineApple
        ?.setDisplaySize(37 * l.scale * (1 - p * 0.7), 37 * l.scale * (1 - p * 0.7))
        .setAlpha(1 - p * 0.8);
      const x = l.machine.x;
      const y = l.machine.y + 67 * l.scale;
      this.progress.fillStyle(0x173e32, 0.7);
      this.progress.fillRoundedRect(x - 46 * l.scale, y, 92 * l.scale, 6, 3);
      this.progress.fillStyle(0xf1c457, 1);
      this.progress.fillRoundedRect(x - 46 * l.scale, y, 92 * l.scale * p, 6, 3);
      this.progress.fillStyle(0xf3ba37, 0.65);
      this.progress.fillRect(
        x + 47 * l.scale,
        l.machine.y + (43 - 24 * p) * l.scale,
        20 * l.scale,
        24 * p * l.scale,
      );
      if (this.machineImage)
        this.machineImage.angle = this.reduced() ? 0 : Math.sin(s.gameTime / 50) * 0.8;
    }
    if (s.helper) {
      const p = 1 - s.helper.remaining / HELPER_MS;
      const to = l.trays[s.helper.tray];
      const supply = l.supplies[0];
      const leg = p < 0.25 ? 0 : p < 0.55 ? (p - 0.25) / 0.3 : (p - 0.55) / 0.45;
      const from = p < 0.55 ? l.helper : supply;
      const target = p < 0.55 ? supply : to;
      const destination = {
        x: Phaser.Math.Linear(from.x, target.x, leg),
        y: Phaser.Math.Linear(from.y, target.y, leg),
      };
      this.held.forEach((image, i) => {
        image.setPosition(destination.x + i * 26 * l.scale, destination.y - 25 * l.scale);
        image.setAlpha(p < 0.5 ? 0 : 1);
      });
      this.helperLabel?.setText(p < 0.25 ? '读便签' : p < 0.6 ? '取料' : '送到托盘');
    }
    for (const motion of this.motions) {
      const p = Math.min(1, (s.gameTime - motion.start) / motion.duration);
      const eased = 1 - (1 - p) ** 3;
      motion.image.setPosition(
        Phaser.Math.Linear(motion.from.x, motion.to.x, eased),
        Phaser.Math.Linear(motion.from.y, motion.to.y, eased) - Math.sin(p * Math.PI) * 20,
      );
      if (motion.duration === RETURN_MS * 0.65 && p >= 1) motion.image.setVisible(false);
      if (motion.duration === RETURN_MS) {
        const returning = p > 0.65 ? (p - 0.65) / 0.35 : 0;
        if (returning)
          motion.image.setPosition(
            Phaser.Math.Linear(motion.to.x, motion.from.x, returning),
            Phaser.Math.Linear(motion.to.y, motion.from.y, returning),
          );
      }
    }
    for (const guest of this.guests) {
      const seat = guest.getData('seat') as TrayId;
      const order = s.orders.find((o) => o.seat === seat);
      if (order?.status === 'waiting' && s.gameTime < 600 && !this.reduced()) {
        const p = Math.min(1, s.gameTime / 600);
        guest.setX(l.guests[seat].x + (seat === 0 ? -35 : 35) * (1 - p)).setAlpha(p);
      }
      if (order?.status === 'leaving') {
        const p = 1 - order.remaining / RETURN_MS;
        guest.setTexture(`guest-${seat}-${p > 0.5 ? 2 : 1}`);
        guest.setAlpha(1 - Math.max(0, p - 0.6) / 0.4);
      }
    }
    const selection = this.ui.selected;
    const selectedId =
      this.ui.focus ??
      (selection
        ? 'supply' in selection
          ? `supply-${selection.supply}`
          : 'item' in selection
            ? `item-${selection.item}`
            : `tray-${selection.tray}`
        : null);
    const h = this.ui.hotspots.find((h) => h.id === selectedId);
    if (h) {
      this.focusRing.lineStyle(3, 0xffdc73, 1);
      this.focusRing.strokeRoundedRect(
        h.x - h.width / 2,
        h.y - h.height / 2,
        h.width,
        h.height,
        12,
      );
    }
  }
  private hit(x: number, y: number): Hotspot | undefined {
    return [...this.ui.hotspots]
      .reverse()
      .find(
        (h) =>
          x >= h.x - h.width / 2 &&
          x <= h.x + h.width / 2 &&
          y >= h.y - h.height / 2 &&
          y <= h.y + h.height / 2,
      );
  }
  private down(p: Phaser.Input.Pointer): void {
    if (this.controller.pauses.size) return;
    if (this.press) {
      this.cancel();
      return;
    }
    const h = this.hit(p.x, p.y);
    const id = h?.id ?? '';
    this.press = {
      pointerId: p.id,
      x: p.x,
      y: p.y,
      id,
      source: sourceFor(id, this.controller.state),
      moved: false,
    };
  }
  private move(p: Phaser.Input.Pointer): void {
    const press = this.press;
    if (!press || p.id !== press.pointerId) return;
    if (Math.hypot(p.x - press.x, p.y - press.y) > 8) press.moved = true;
    if (press.moved && press.source && !this.dragImage) {
      const source = press.source;
      const product =
        'supply' in source
          ? source.supply
          : 'tray' in source
            ? 'tray'
            : this.controller.state.items.find((i) => i.id === source.item)?.product;
      if (product)
        this.dragImage = this.add
          .image(p.x, p.y - 22, product)
          .setDisplaySize(product === 'tray' ? 110 : 52, product === 'tray' ? 70 : 52)
          .setDepth(20)
          .setAlpha(0.85);
    }
    this.dragImage?.setPosition(p.x, p.y - 22);
  }
  private up(p: Phaser.Input.Pointer): void {
    const press = this.press;
    if (!press || press.pointerId !== p.id) return;
    const h = this.hit(p.x, p.y);
    const drag = press.moved;
    this.cancel();
    if (this.controller.pauses.size) return;
    if (drag) {
      if (h && h.id !== press.id && press.source)
        activate(h.id, this.controller, this.audio, this.ui, press.source);
      else {
        this.ui.selected = null;
        this.controller.message = '没有放下，物品留在原处。';
        this.ui.change();
      }
    } else activate(h?.id ?? '', this.controller, this.audio, this.ui);
  }
  cancel(): void {
    this.press = null;
    this.dragImage?.destroy();
    this.dragImage = null;
  }
}
