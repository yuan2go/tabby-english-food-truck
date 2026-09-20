import Phaser from 'phaser';
import {
  HELPER_MS,
  JUICE_MS,
  MODES,
  PRODUCT_NAMES,
  type Product,
  RETURN_MS,
} from '../content/catalog';
import type { ForegroundAudio } from '../platform/audio';
import type { GameController } from '../platform/controller';
import { trayItems } from '../rules/game';
import type { GameState, Item, Location, TrayId } from '../rules/types';
import { ASSET_IDS, assetUrl } from './assets';
import { activate, type Hotspot, type Selection, sourceFor, type ViewState } from './input';
import { type Layout, layoutFor, type Point } from './layout';
import { renderScale } from './rendering';

type Sprite = Phaser.GameObjects.Image;
interface Motion {
  from: Point;
  to: Point;
  start: number;
  duration: number;
}
interface Delivery {
  tray: TrayId;
  seat: TrayId;
  start: number;
  from: Point;
  group: Phaser.GameObjects.Container;
  foods: Sprite[];
}
export class TruckScene extends Phaser.Scene {
  private layout!: Layout;
  private unsubscribe: (() => void) | null = null;
  private rendered: GameState | null = null;
  private images = new Map<string, Sprite>();
  private texts = new Map<string, Phaser.GameObjects.Text>();
  private badges = new Map<string, Phaser.GameObjects.Graphics>();
  private used = new Set<string>();
  private createdEntities = 0;
  private motions = new Map<string, Motion>();
  private deliveries: Delivery[] = [];
  private progress!: Phaser.GameObjects.Graphics;
  private focusRing!: Phaser.GameObjects.Graphics;
  private decor!: Phaser.GameObjects.Graphics;
  private dragImage: Phaser.GameObjects.Container | null = null;
  private press: {
    pointerId: number;
    x: number;
    y: number;
    id: string;
    source: Selection;
    anchor: Point;
    moved: boolean;
  } | null = null;
  private cancelMotion: {
    node: Phaser.GameObjects.Container;
    source: Selection;
    from: Point;
    to: Point;
    start: number;
  } | null = null;
  private dropOrigin: Point | null = null;
  private failed = new Set<string>();
  private discardDelta = true;
  private observer: ResizeObserver | null = null;
  private density = 1;
  private demoTime = 0;
  private lastTeaching: string | null = null;
  private catPose = '';
  private catReactionUntil = 0;
  private catReturn: Motion | null = null;
  private catPosition: Point | null = null;
  private readonly resize = () => {
    this.cancel();
    this.discardDelta = true;
    this.resizeBuffer();
    this.draw(true);
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
  private readonly freeze = () => {
    this.cancel();
    this.discardDelta = true;
    this.controller.pause('frozen', true);
    this.audio.stop();
  };
  private readonly resume = () => {
    this.discardDelta = true;
    this.controller.pause('frozen', false);
  };
  private readonly cancelNative = () => this.cancel();
  private readonly captureLost = (event: PointerEvent) => {
    // A completed pointer can lose capture after a new gesture has started.
    if (this.press?.pointerId === event.pointerId) this.cancel();
  };
  private readonly otherPointer = (event: PointerEvent) => {
    if (this.press && this.press.pointerId !== event.pointerId) this.cancel();
  };
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
    this.load.on('loaderror', (file: Phaser.Loader.File) => this.failed.add(file.key));
    for (const id of ASSET_IDS) this.load.image(id, assetUrl(id));
  }
  create(): void {
    this.decor = this.add.graphics().setDepth(1);
    this.progress = this.add.graphics().setDepth(12);
    this.focusRing = this.add.graphics().setDepth(16);
    this.ui.assetFailure = this.failed.size > 0;
    this.ui.resourceMessage = this.failed.size
      ? `有${this.failed.size}份画面未能加载。重试不会重置进度。`
      : '';
    this.ui.ready = true;
    this.resizeBuffer();
    this.unsubscribe = this.controller.subscribe(() => {
      if (this.controller.pauses.size) this.cancel();
      if (
        this.rendered?.revision !== this.controller.state.revision ||
        this.rendered.runId !== this.controller.state.runId
      )
        this.draw();
    });
    const canvas = this.game.canvas;
    canvas.addEventListener('pointerdown', this.down);
    canvas.addEventListener('pointermove', this.move);
    canvas.addEventListener('pointerup', this.up);
    canvas.addEventListener('pointercancel', this.captureLost);
    canvas.addEventListener('lostpointercapture', this.captureLost);
    document.addEventListener('pointerdown', this.otherPointer, true);
    canvas.addEventListener('contextmenu', this.prevent);
    document.addEventListener('visibilitychange', this.visibility);
    document.addEventListener('freeze', this.freeze);
    document.addEventListener('resume', this.resume);
    window.addEventListener('blur', this.blur);
    window.addEventListener('focus', this.focus);
    window.addEventListener('keydown', this.key);
    window.addEventListener('orientationchange', this.cancelNative);
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(canvas.parentElement as HTMLElement);
    this.events.once('shutdown', () => {
      this.unsubscribe?.();
      this.observer?.disconnect();
      this.cancel();
      this.clearCues();
      canvas.removeEventListener('pointerdown', this.down);
      canvas.removeEventListener('pointermove', this.move);
      canvas.removeEventListener('pointerup', this.up);
      canvas.removeEventListener('pointercancel', this.captureLost);
      canvas.removeEventListener('lostpointercapture', this.captureLost);
      document.removeEventListener('pointerdown', this.otherPointer, true);
      canvas.removeEventListener('contextmenu', this.prevent);
      document.removeEventListener('visibilitychange', this.visibility);
      document.removeEventListener('freeze', this.freeze);
      document.removeEventListener('resume', this.resume);
      window.removeEventListener('blur', this.blur);
      window.removeEventListener('focus', this.focus);
      window.removeEventListener('keydown', this.key);
      window.removeEventListener('orientationchange', this.cancelNative);
    });
    this.draw();
    this.ui.change();
  }
  private readonly prevent = (event: Event) => event.preventDefault();
  private resizeBuffer(): void {
    const host = this.game.canvas.parentElement;
    if (!host) return;
    const width = host.clientWidth,
      height = host.clientHeight;
    this.density = renderScale(width, height, devicePixelRatio, this.ui.lowGraphics);
    this.scale.setZoom(1 / this.density);
    this.scale.resize(Math.round(width * this.density), Math.round(height * this.density));
    this.game.canvas.style.width = `${width}px`;
    this.game.canvas.style.height = `${height}px`;
    this.scale.updateBounds();
    this.cameras.main
      .setSize(this.scale.width, this.scale.height)
      .setZoom(this.density)
      .setScroll(0, 0)
      .setOrigin(0, 0);
    this.layout = layoutFor(width, height, this.controller.state.mode);
    this.game.canvas.dataset.renderScale = this.density.toFixed(3);
    this.game.canvas.dataset.worldWidth = String(width);
    this.game.canvas.dataset.worldHeight = String(height);
  }
  setQuality(): void {
    this.resize();
  }
  retry(): void {
    if (!this.failed.size || this.load.isLoading()) return;
    const keys = [...this.failed];
    this.failed.clear();
    for (const key of keys) this.load.image(key, assetUrl(key));
    this.load.once('complete', () => {
      this.ui.assetFailure = this.failed.size > 0;
      this.ui.resourceMessage = this.failed.size ? '画面仍未加载，请重试。' : '';
      this.draw(true);
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
    key: string,
    texture: string,
    x: number,
    y: number,
    width: number,
    height = width,
    depth = 5,
  ): Sprite {
    this.used.add(key);
    let image = this.images.get(key);
    if (!image) {
      image = this.add.image(x, y, '__MISSING');
      this.images.set(key, image);
      this.createdEntities++;
    }
    image
      .setTexture(this.textures.exists(texture) ? texture : '__MISSING')
      .setDepth(depth)
      .setVisible(true)
      .setAlpha(1)
      .setAngle(0);
    if (!this.motions.has(key)) image.setPosition(x, y);
    // Preserve the source aspect ratio: no second arbitrary squeeze.
    const ratio = image.width / image.height;
    image.setDisplaySize(Math.min(width, height * ratio), Math.min(height, width / ratio));
    return image;
  }
  private text(
    key: string,
    value: string,
    x: number,
    y: number,
    size = 18,
    color = '#254337',
  ): Phaser.GameObjects.Text {
    this.used.add(key);
    let text = this.texts.get(key);
    if (!text) {
      text = this.add
        .text(x, y, '', {
          fontFamily: '"Trebuchet MS", "PingFang SC", sans-serif',
          fontStyle: 'bold',
          align: 'center',
          padding: { x: 5, y: 4 },
        })
        .setOrigin(0.5)
        .setDepth(8);
      this.texts.set(key, text);
    }
    if (text.text !== value) text.setText(value);
    text
      .setPosition(x, y)
      .setFontSize(size)
      .setColor(color)
      .setResolution(this.density)
      .setVisible(true);
    return text;
  }
  private badge(
    key: string,
    value: string,
    x: number,
    y: number,
    width: number,
    height = 38,
    active = false,
  ): void {
    let panel = this.badges.get(key);
    if (!panel) {
      panel = this.add.graphics().setDepth(6);
      this.badges.set(key, panel);
    }
    panel
      .clear()
      .fillStyle(active ? 0xf5cf73 : 0xf9efd6, 0.97)
      .lineStyle(1.5, 0x41614b, 0.75);
    panel.fillRoundedRect(x - width / 2, y - height / 2, width, height, 12);
    panel.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 12);
    this.text(key, value, x, y, height < 36 ? 16 : 18);
  }
  private slotOffset(slot: number): number {
    return (slot - 1) * Math.min(76, Math.max(46, this.layout.trayWidth * 0.26));
  }
  private itemPoint(item: Item): Point {
    const l = this.layout,
      p = item.location;
    if (p.startsWith('tray:')) {
      const [, tray, slot] = p.split(':');
      const center = l.trays[Number(tray) as TrayId];
      return { x: center.x + this.slotOffset(Number(slot)), y: center.y - 7 };
    }
    if (p === 'machine:apple')
      return { x: l.machine.x - 10 * l.scale, y: l.machine.y - 42 * l.scale };
    if (p === 'machine:cup')
      return { x: l.machine.x + 57 * l.scale, y: l.machine.y + 29 * l.scale };
    return { ...l.helper };
  }
  private supplyPoint(product: Product): Point {
    return this.layout.supplies[product === 'apple' ? 0 : product === 'banana' ? 1 : 2];
  }
  private clearCues(): void {
    this.motions.clear();
    this.catReturn = null;
    this.catPosition = null;
    for (const d of this.deliveries) d.group.destroy();
    this.deliveries = [];
    this.cancelMotion?.node.destroy();
    this.cancelMotion = null;
    this.dropOrigin = null;
  }
  private draw(resized = false): void {
    if (!this.decor) return;
    const s = this.controller.state,
      previous = this.rendered;
    if (!previous || previous.runId !== s.runId) {
      this.clearCues();
      this.cancel();
      this.layout = layoutFor(this.layout.width, this.layout.height, s.mode);
    }
    if (resized) this.motions.clear();
    const l = this.layout;
    if (previous?.helper && !s.helper && this.catPosition)
      this.catReturn = {
        from: { ...this.catPosition },
        to: l.helper,
        start: s.gameTime,
        duration: 360,
      };
    this.used.clear();
    this.decor.clear();
    this.ui.hotspots = [];
    const background = this.image(
      'market',
      'market',
      l.width / 2,
      l.height / 2,
      l.width,
      l.height,
      0,
    );
    const cover = Math.max(l.width / background.width, l.height / background.height);
    background.setScale(cover);
    this.decor.fillStyle(0x173e32, 0.12).fillRect(0, 0, l.width, 60);
    for (const o of s.orders) {
      if (o.status === 'queued' || o.status === 'done') continue;
      const p = l.guests[o.seat];
      this.image(
        o.id,
        `guest-${o.seat}-${o.status === 'leaving' ? 1 : 0}`,
        p.x,
        p.y,
        l.guestHeight,
        l.guestHeight,
        3,
      );
      if (o.status === 'leaving')
        this.badge(`label-${o.id}`, 'Thank you!', p.x, p.y + l.guestHeight * 0.47, 120, 36);
      this.hot(
        o.id,
        `客人${o.seat === 0 ? 'A' : 'B'}：听请求或递出已选托盘`,
        'guest',
        p.x,
        p.y,
        l.guestHeight * 0.85,
        l.guestHeight,
      );
    }
    const m = l.machine;
    const machineVisible = s.mode !== 'guided' || s.orders[0]?.request === 'juice';
    if (machineVisible) {
      this.image('machine', 'machine', m.x, m.y, 123 * l.scale, 145 * l.scale);
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
      this.decor
        .lineStyle(2, 0xfaf0d9, 0.85)
        .strokeEllipse(m.x + 57 * l.scale, m.y + 46 * l.scale, 42, 16);
      this.badge(
        'machine-label',
        s.machine.status === 'processing'
          ? '制作中…'
          : s.machine.status === 'ready'
            ? '果汁好了'
            : '▶ 榨汁',
        m.x,
        m.y + 85 * l.scale,
        Math.max(108, 120 * l.scale),
      );
      this.hot('start', '启动果汁机', 'start', m.x, m.y + 85 * l.scale, 120 * l.scale, 44);
    }
    this.image(
      'cat',
      'cat-idle',
      l.helper.x,
      l.helper.y - 36 * l.scale,
      154 * l.scale,
      170 * l.scale,
      14,
    );
    this.badge(
      'cat-label',
      s.helper ? '正在帮忙' : '🐾 帮我拿',
      l.helper.x,
      l.helper.y + 73 * l.scale,
      Math.max(112, 115 * l.scale),
      38,
      Boolean(s.helper),
    );
    this.hot(
      'note',
      '打开小猫便签',
      'note',
      l.helper.x,
      l.helper.y + 73 * l.scale,
      115 * l.scale,
      44,
    );
    for (const tray of MODES[s.mode].trays) {
      const p = l.trays[tray],
        returning = s.trays[tray].remaining > 0;
      this.image(`tray-${tray}`, 'tray', p.x, p.y, l.trayWidth, l.trayWidth * 0.64, 4).setVisible(
        !returning,
      );
      this.badge(
        `tray-label-${tray}`,
        returning ? '回盘中' : `${tray + 1}号盘 · 递出`,
        p.x,
        p.y + l.trayWidth * 0.25,
        Math.min(l.trayWidth - 10, 148),
        36,
      );
      this.hot(
        `tray-${tray}`,
        `${tray + 1}号托盘：放入食品或选择整盘`,
        'tray',
        p.x,
        p.y + 14,
        l.trayWidth,
        Math.max(78, l.trayWidth * 0.5),
      );
      if (s.helper?.tray === tray)
        for (const slot of s.helper.slots)
          this.decor.lineStyle(2, 0xd19638).strokeCircle(p.x + this.slotOffset(slot), p.y - 7, 20);
    }
    for (const product of ['apple', 'banana', 'cup'] as const) {
      if (!machineVisible && product === 'cup') continue;
      const p = this.supplyPoint(product);
      this.decor
        .fillStyle(0x163f32, 0.95)
        .fillRoundedRect(p.x - 33 * l.scale, p.y - 33 * l.scale, 66 * l.scale, 72 * l.scale, 12);
      this.image(`supply-${product}`, product, p.x, p.y, 53 * l.scale, 55 * l.scale);
      this.hot(
        `supply-${product}`,
        `拿${PRODUCT_NAMES[product]}`,
        'supply',
        p.x,
        p.y,
        Math.max(60, 66 * l.scale),
        Math.max(60, 72 * l.scale),
      );
    }
    this.badge('clear-label', '↩ 放回', l.clear.x, l.clear.y, Math.max(66, 70 * l.scale), 46);
    this.hot('clear', '放回原料或清理成品', 'clear', l.clear.x, l.clear.y, 70 * l.scale, 60);
    if (previous?.runId === s.runId)
      for (const o of s.orders) {
        if (
          o.status !== 'leaving' ||
          previous.orders.find((old) => old.id === o.id)?.status !== 'waiting'
        )
          continue;
        const tray = s.trays.findIndex(
          (t, i) => t.remaining > 0 && !previous.trays[i]?.remaining,
        ) as TrayId;
        if (tray !== 0 && tray !== 1) continue;
        const from = this.dropOrigin ?? l.trays[tray];
        const { group, foods } = this.trayGroup(tray, trayItems(previous, tray), from);
        this.deliveries.push({
          tray,
          seat: o.seat,
          start: s.gameTime,
          from: { ...from },
          group,
          foods,
        });
        this.catReactionUntil = s.gameTime + RETURN_MS + 1000;
      }
    for (const item of s.items) {
      const key = `item-${item.id}`,
        to = this.itemPoint(item);
      const prior =
        previous?.runId === s.runId ? previous.items.find((i) => i.id === item.id) : undefined;
      const currentImage = this.images.get(key);
      if (
        !resized &&
        previous?.runId === s.runId &&
        item.location !== 'helper' &&
        (!prior || prior.location !== item.location) &&
        !this.reduced()
      ) {
        const from =
          this.dropOrigin ??
          (currentImage
            ? { x: currentImage.x, y: currentImage.y }
            : this.supplyPoint(item.product));
        this.motions.set(key, {
          from: { ...from },
          to,
          start: s.gameTime,
          duration: prior?.location === 'helper' ? 100 : 240,
        });
      }
      const size = item.location.startsWith('tray:')
        ? Math.min(68, Math.max(46, l.trayWidth * 0.23))
        : Math.max(34, 38 * l.scale);
      const image = this.image(key, item.product, to.x, to.y, size, size, 10);
      if (item.location !== 'helper')
        this.hot(
          key,
          `${PRODUCT_NAMES[item.product]}，${this.locationLabel(item.location)}`,
          'item',
          image.x,
          image.y,
          44,
          44,
        );
    }
    for (const [key, image] of this.images)
      if (!this.used.has(key)) {
        image.destroy();
        this.images.delete(key);
        this.motions.delete(key);
      }
    for (const [key, text] of this.texts)
      if (!this.used.has(key)) {
        text.destroy();
        this.texts.delete(key);
      }
    for (const [key, panel] of this.badges)
      if (!this.used.has(key)) {
        panel.destroy();
        this.badges.delete(key);
      }
    this.rendered = s;
    this.dropOrigin = null;
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
    return this.ui.lowGraphics || matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  private cat(texture: string, position: Point, phase: number): void {
    const image = this.images.get('cat');
    if (!image) return;
    const key = `cat-${texture}`;
    if (this.catPose !== key || image.texture.key !== key) {
      if (this.textures.exists(key)) image.setTexture(key);
      this.catPose = key;
    }
    const h = 170 * this.layout.scale,
      ratio = image.width / image.height;
    image
      .setDisplaySize(h * ratio, h)
      .setPosition(
        position.x,
        position.y - 36 * this.layout.scale + (this.reduced() ? 0 : Math.sin(phase * Math.PI) * -3),
      );
    this.catPosition = { ...position };
    this.game.canvas.dataset.catPose = texture;
  }
  private handPoint(pose: string, point: Point): Point {
    const frame = this.textures.get(`cat-${pose}`).getSourceImage();
    const h = 170 * this.layout.scale;
    const anchor =
      pose === 'reach'
        ? { x: 0.27, y: 0.82 }
        : pose === 'place'
          ? { x: 0.79, y: 0.84 }
          : { x: 0.72, y: 0.62 };
    return {
      x: point.x + ((anchor.x - 0.5) * h * frame.width) / frame.height,
      y: point.y - 36 * this.layout.scale + (anchor.y - 0.5) * h,
    };
  }
  private reachPoint(supply: Point): Point {
    const hand = this.handPoint('reach', { x: 0, y: 0 });
    return { x: supply.x - hand.x, y: supply.y - hand.y - 3 };
  }
  private helperFrame(
    progress: number,
    products: Product[],
    destination?: Point,
  ): { point: Point; pose: string; picked: number; placing: boolean } {
    const l = this.layout;
    const travel = (a: Point, b: Point, t: number) => ({
      x: Phaser.Math.Linear(a.x, b.x, t),
      y: Phaser.Math.Linear(a.y, b.y, t),
    });
    if (progress < 0.15) return { point: l.helper, pose: 'read', picked: 0, placing: false };
    const first = this.supplyPoint(products[0] ?? 'apple'),
      second = this.supplyPoint(products[1] ?? products[0] ?? 'apple');
    const low = (p: Point) => this.reachPoint(p);
    const a = low(first),
      b = low(second);
    if (progress < 0.3)
      return {
        point: travel(l.helper, a, (progress - 0.15) / 0.15),
        pose: 'carry',
        picked: 0,
        placing: false,
      };
    if (progress < 0.4)
      return { point: a, pose: 'reach', picked: progress > 0.36 ? 1 : 0, placing: false };
    if (progress < 0.55 && products.length > 1)
      return {
        point: travel(a, b, (progress - 0.4) / 0.15),
        pose: 'carry',
        picked: 1,
        placing: false,
      };
    if (progress < 0.64 && products.length > 1)
      return { point: b, pose: 'reach', picked: progress > 0.6 ? 2 : 1, placing: false };
    const tray = l.trays[this.controller.state.helper?.tray ?? 0],
      target = destination ?? { x: tray.x, y: tray.y - 62 * l.scale };
    const start = products.length > 1 ? 0.64 : 0.4;
    if (progress < 0.88)
      return {
        point: travel(products.length > 1 ? b : a, target, (progress - start) / (0.88 - start)),
        pose: 'carry',
        picked: products.length,
        placing: false,
      };
    return { point: target, pose: 'place', picked: products.length, placing: true };
  }
  update(_time: number, delta: number): void {
    if (this.discardDelta) this.discardDelta = false;
    else this.controller.tick(delta);
    if (!this.layout) return;
    const s = this.controller.state,
      l = this.layout;
    this.progress.clear();
    this.focusRing.clear();
    const teaching = this.ui.teaching;
    if (teaching !== this.lastTeaching) {
      this.demoTime = 0;
      this.lastTeaching = teaching;
    }
    if (teaching && !document.hidden && !this.controller.pauses.has('blur'))
      this.demoTime = Math.min(4200, this.demoTime + Math.min(delta, 100));
    if (s.machine.status === 'processing') {
      const p = 1 - s.machine.remaining / JUICE_MS;
      this.progress
        .fillStyle(0x173e32, 0.8)
        .fillRoundedRect(
          l.machine.x - 45 * l.scale,
          l.machine.y + 64 * l.scale,
          90 * l.scale,
          7,
          3,
        );
      this.progress
        .fillStyle(0xf1c457)
        .fillRoundedRect(
          l.machine.x - 45 * l.scale,
          l.machine.y + 64 * l.scale,
          90 * l.scale * p,
          7,
          3,
        );
      this.progress
        .fillStyle(0xf3ba37, 0.75)
        .fillRect(
          l.machine.x + 47 * l.scale,
          l.machine.y + (43 - 24 * p) * l.scale,
          20 * l.scale,
          24 * p * l.scale,
        );
      this.images.get('machine')?.setAngle(this.reduced() ? 0 : Math.sin(s.gameTime / 50) * 0.8);
    } else this.images.get('machine')?.setAngle(0);
    if (s.helper) {
      const h = s.helper,
        p = 1 - h.remaining / HELPER_MS;
      const items = h.itemIds
        .map((id) => s.items.find((i) => i.id === id))
        .filter((i): i is Item => Boolean(i));
      const frame = this.helperFrame(
        p,
        items.map((i) => i.product),
      );
      this.cat(frame.pose, frame.point, p * 8);
      items.forEach((item, i) => {
        const image = this.images.get(`item-${item.id}`),
          slot = h.slots[i] ?? 0;
        const hand = this.handPoint(frame.pose, frame.point);
        const anchor = { x: hand.x + (i - (items.length - 1) / 2) * 25 * l.scale, y: hand.y };
        const target = { x: l.trays[h.tray].x + this.slotOffset(slot), y: l.trays[h.tray].y - 7 };
        const t = frame.placing ? Math.min(1, (p - 0.88) / 0.12) : 0;
        image
          ?.setDepth(15)
          .setPosition(
            Phaser.Math.Linear(anchor.x, target.x, t),
            Phaser.Math.Linear(anchor.y, target.y, t),
          )
          .setVisible(i < frame.picked);
      });
    } else if (teaching) {
      const p = Math.min(1, this.demoTime / 3600),
        isJuice = teaching === 'juice';
      const products: Product[] =
        teaching === 'banana'
          ? ['banana']
          : teaching === 'two'
            ? ['apple', 'apple']
            : teaching === 'fruit'
              ? ['apple', 'banana']
              : ['apple'];
      const frame = this.helperFrame(
        p,
        products,
        isJuice ? { x: l.machine.x + 38 * l.scale, y: l.machine.y - 60 * l.scale } : undefined,
      );
      this.cat(p > 0.95 ? 'greet' : frame.pose, frame.point, p * 8);
      products.forEach((product, index) => {
        const from = this.handPoint(frame.pose, frame.point),
          target = isJuice
            ? this.itemPoint({ id: '', product: 'apple', location: 'machine:apple' })
            : { x: l.trays[0].x + this.slotOffset(index), y: l.trays[0].y - 7 };
        const t = frame.placing ? Math.min(1, (p - 0.88) / 0.12) : 0;
        this.image(
          `demo-${index}`,
          product,
          Phaser.Math.Linear(from.x, target.x, t),
          Phaser.Math.Linear(from.y, target.y, t),
          48,
          48,
          15,
        ).setAlpha(index < frame.picked ? 0.92 : 0);
        this.focusRing.lineStyle(3, 0xffdc73).strokeCircle(target.x, target.y, 31);
      });
      if (isJuice) {
        const cup = this.itemPoint({ id: '', product: 'cup', location: 'machine:cup' });
        this.image('demo-cup', p > 0.9 ? 'juice' : 'cup', cup.x, cup.y, 42, 42, 15);
      }
    } else {
      for (const [key, demo] of this.images)
        if (key.startsWith('demo-')) {
          demo.destroy();
          this.images.delete(key);
        }
      const delivery = this.deliveries.at(-1);
      if (delivery) {
        const p = Math.min(1, (s.gameTime - delivery.start) / RETURN_MS),
          target = l.guests[delivery.seat];
        const q = p < 0.6 ? p / 0.6 : (p - 0.6) / 0.4;
        const destination = { x: target.x + 52 * l.scale, y: target.y + 68 * l.scale };
        const from = p < 0.6 ? l.helper : destination,
          to = p < 0.6 ? destination : l.helper;
        this.cat(
          p < 0.5 ? 'greet' : 'place',
          { x: Phaser.Math.Linear(from.x, to.x, q), y: Phaser.Math.Linear(from.y, to.y, q) },
          p * 4,
        );
      } else if (this.catReturn && s.gameTime - this.catReturn.start < this.catReturn.duration) {
        const c = this.catReturn,
          t = (s.gameTime - c.start) / c.duration;
        this.cat(
          'carry',
          {
            x: Phaser.Math.Linear(c.from.x, c.to.x, t),
            y: Phaser.Math.Linear(c.from.y, c.to.y, t),
          },
          t * 4,
        );
      } else {
        this.catReturn = null;
        const reaction =
          s.gameTime < this.catReactionUntil
            ? 'celebrate'
            : this.controller.message.includes('留在') || this.controller.message.includes('满了')
              ? 'blocked'
              : this.ui.selectedGuest
                ? 'idle'
                : 'greet';
        this.cat(reaction, l.helper, s.gameTime / 1000);
      }
    }
    for (const [id, motion] of this.motions) {
      const image = this.images.get(id);
      if (!image) {
        this.motions.delete(id);
        continue;
      }
      const p = Math.min(1, (s.gameTime - motion.start) / motion.duration),
        eased = 1 - (1 - p) ** 3;
      image.setPosition(
        Phaser.Math.Linear(motion.from.x, motion.to.x, eased),
        Phaser.Math.Linear(motion.from.y, motion.to.y, eased) - Math.sin(p * Math.PI) * 13,
      );
      const hot = this.ui.hotspots.find((h) => h.id === id);
      if (hot) {
        hot.x = image.x;
        hot.y = image.y;
        const element = this.ui.elements.get(id);
        if (element) {
          element.style.left = `${hot.x - hot.width / 2}px`;
          element.style.top = `${hot.y - hot.height / 2}px`;
        }
      }
      if (p === 1) this.motions.delete(id);
    }
    for (const d of this.deliveries) {
      const p = Math.min(1, (s.gameTime - d.start) / RETURN_MS),
        guest = l.guests[d.seat],
        target = { x: guest.x, y: guest.y + l.guestHeight * 0.3 },
        home = l.trays[d.tray];
      const q = p < 0.6 ? p / 0.6 : (p - 0.6) / 0.4;
      const from = p < 0.6 ? d.from : target,
        to = p < 0.6 ? target : home;
      d.group.setPosition(Phaser.Math.Linear(from.x, to.x, q), Phaser.Math.Linear(from.y, to.y, q));
      d.foods.forEach((i) => {
        i.setVisible(p < 0.6);
      });
      if (p === 1) {
        d.group.destroy();
        this.images.get(`tray-${d.tray}`)?.setVisible(true);
      }
    }
    this.deliveries = this.deliveries.filter((d) => s.gameTime - d.start < RETURN_MS);
    for (const o of s.orders)
      if (o.status === 'leaving') {
        const p = 1 - o.remaining / RETURN_MS;
        this.images
          .get(o.id)
          ?.setTexture(`guest-${o.seat}-${p > 0.6 ? 2 : 1}`)
          .setAlpha(1 - Math.max(0, p - 0.7) / 0.3);
      }
    if (this.cancelMotion) {
      const c = this.cancelMotion,
        t = Math.min(1, (s.gameTime - c.start) / 180);
      c.node
        .setPosition(
          Phaser.Math.Linear(c.from.x, c.to.x, t),
          Phaser.Math.Linear(c.from.y, c.to.y, t),
        )
        .setAlpha(1 - t * 0.3);
      if (t === 1) {
        c.node.destroy();
        this.cancelMotion = null;
        this.cancel();
      }
    }
    this.hideDragged();
    const selection = this.ui.selected;
    const id =
      this.ui.focus ??
      (selection
        ? 'supply' in selection
          ? `supply-${selection.supply}`
          : 'item' in selection
            ? `item-${selection.item}`
            : `tray-${selection.tray}`
        : null);
    const hot = this.ui.hotspots.find((h) => h.id === id);
    if (hot)
      this.focusRing
        .lineStyle(3, 0xffdc73)
        .strokeRoundedRect(
          hot.x - hot.width / 2,
          hot.y - hot.height / 2,
          hot.width,
          hot.height,
          12,
        );
    this.game.canvas.dataset.motionCount = String(this.motions.size);
    this.game.canvas.dataset.entityCount = String(this.images.size);
    this.game.canvas.dataset.createdEntities = String(this.createdEntities);
  }
  private trayGroup(
    tray: TrayId,
    items: Item[],
    at: Point,
  ): { group: Phaser.GameObjects.Container; foods: Sprite[] } {
    const l = this.layout,
      group = this.add.container(at.x, at.y).setDepth(20);
    const plate = this.add.image(0, 0, 'tray'),
      ratio = plate.width / plate.height;
    plate.setDisplaySize(
      Math.min(l.trayWidth, l.trayWidth * 0.64 * ratio),
      Math.min(l.trayWidth * 0.64, l.trayWidth / ratio),
    );
    group.add(plate);
    const foods = items.map((item) => {
      const slot = Number(item.location.split(':')[2]);
      const size = Math.min(68, Math.max(46, l.trayWidth * 0.23));
      const image = this.add.image(this.slotOffset(slot), -7, item.product);
      const ratio = image.width / image.height;
      image.setDisplaySize(Math.min(size, size * ratio), Math.min(size, size / ratio));
      group.add(image);
      return image;
    });
    group.setData('tray', tray);
    return { group, foods };
  }
  private hideDragged(): void {
    const source = this.press?.moved ? this.press.source : this.cancelMotion?.source;
    if (!source) return;
    if ('tray' in source) {
      this.images.get(`tray-${source.tray}`)?.setVisible(false);
      for (const item of trayItems(this.controller.state, source.tray))
        this.images.get(`item-${item.id}`)?.setVisible(false);
    }
    if ('item' in source) this.images.get(`item-${source.item}`)?.setVisible(false);
  }
  private hit(x: number, y: number): Hotspot | undefined {
    for (let i = this.ui.hotspots.length - 1; i >= 0; i--) {
      const h = this.ui.hotspots[i];
      if (
        h &&
        x >= h.x - h.width / 2 &&
        x <= h.x + h.width / 2 &&
        y >= h.y - h.height / 2 &&
        y <= h.y + h.height / 2
      )
        return h;
    }
    return undefined;
  }
  private point(e: PointerEvent): Point {
    const r = this.game.canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * this.layout.width) / r.width,
      y: ((e.clientY - r.top) * this.layout.height) / r.height,
    };
  }
  private readonly down = (e: PointerEvent): void => {
    if (this.controller.pauses.size || this.ui.inputBlocked) return;
    if (this.press || !e.isPrimary) {
      this.cancel();
      return;
    }
    if (this.cancelMotion) this.cancel();
    e.preventDefault();
    this.ui.focus = null;
    if (document.activeElement instanceof HTMLElement && document.activeElement.dataset.hotspot)
      document.activeElement.blur();
    const p = this.point(e),
      id = this.hit(p.x, p.y)?.id ?? '',
      image = this.images.get(id);
    this.press = {
      pointerId: e.pointerId,
      x: p.x,
      y: p.y,
      id,
      source: sourceFor(id, this.controller.state),
      anchor: image ? { x: image.x, y: image.y } : p,
      moved: false,
    };
    this.game.canvas.setPointerCapture(e.pointerId);
    this.audio.effect('press');
  };
  private readonly move = (e: PointerEvent): void => {
    const press = this.press;
    if (!press || press.pointerId !== e.pointerId) return;
    const p = this.point(e);
    const at = { x: press.anchor.x + p.x - press.x, y: press.anchor.y + p.y - press.y };
    if (Math.hypot(p.x - press.x, p.y - press.y) > 8) press.moved = true;
    if (press.moved && press.source && !this.dragImage) {
      const source = press.source;
      if ('tray' in source)
        this.dragImage = this.trayGroup(
          source.tray,
          trayItems(this.controller.state, source.tray),
          at,
        ).group;
      else {
        const product =
          'supply' in source
            ? source.supply
            : this.controller.state.items.find((i) => i.id === source.item)?.product;
        if (product) {
          this.dragImage = this.add.container(at.x, at.y).setDepth(20);
          const image = this.add.image(0, 0, product);
          const original = this.images.get(press.id);
          const ratio = image.width / image.height;
          image.setDisplaySize(
            original?.displayWidth ?? Math.min(52, 52 * ratio),
            original?.displayHeight ?? Math.min(52, 52 / ratio),
          );
          this.dragImage.add(image);
        }
      }
    }
    this.dragImage?.setPosition(at.x, at.y);
    this.hideDragged();
  };
  private readonly up = (e: PointerEvent): void => {
    const press = this.press;
    if (!press || press.pointerId !== e.pointerId) return;
    const p = this.point(e),
      h = this.hit(p.x, p.y),
      before = this.controller.state;
    if (!this.controller.pauses.size && !this.ui.inputBlocked) {
      if (press.moved) {
        if (h && h.id !== press.id && press.source) {
          this.dropOrigin = this.dragImage ? { x: this.dragImage.x, y: this.dragImage.y } : p;
          activate(h.id, this.controller, this.audio, this.ui, press.source);
        }
      } else activate(h?.id ?? '', this.controller, this.audio, this.ui);
    }
    const changed =
      this.controller.state.items !== before.items &&
      JSON.stringify(this.controller.state.items) !== JSON.stringify(before.items);
    if (press.moved && this.dragImage && !changed) {
      const source = press.source,
        returningItem =
          source && 'item' in source
            ? before.items.find((item) => item.id === source.item)
            : undefined;
      this.cancelMotion?.node.destroy();
      this.cancelMotion = {
        node: this.dragImage,
        source: press.source,
        from: { x: this.dragImage.x, y: this.dragImage.y },
        to: returningItem ? this.itemPoint(returningItem) : press.anchor,
        start: this.controller.state.gameTime,
      };
      this.dragImage = null;
    }
    this.cancel(true);
  };
  cancel(keepReturn = false): void {
    const press = this.press;
    this.press = null;
    if (press && this.game.canvas.hasPointerCapture(press.pointerId))
      this.game.canvas.releasePointerCapture(press.pointerId);
    this.dragImage?.destroy();
    this.dragImage = null;
    if (!keepReturn) {
      this.cancelMotion?.node.destroy();
      this.cancelMotion = null;
    }
    this.dropOrigin = null;
    for (const [id, image] of this.images)
      if (id.startsWith('item-') || id.startsWith('tray-')) image.setVisible(true);
    for (const d of this.deliveries) this.images.get(`tray-${d.tray}`)?.setVisible(false);
    this.hideDragged();
  }
}
