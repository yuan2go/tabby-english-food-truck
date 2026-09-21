import type Phaser from 'phaser';
import { FAMILY_SUPPLIES, foodAsset, type Product } from '../content/recipes';
import type { GameController } from '../platform/controller';
import { ActorScheduler } from './actor';
import type { ViewState } from './input';
import type { Layout, Point } from './layout';
/** Presentation samples the rule clock; hands and tray interpolate inside the same phases. */
export class ActorView {
  private scheduler = new ActorScheduler();
  private teaching: string | null = null;
  private demoOwnsActor = false;
  private sprite: Phaser.GameObjects.Image;
  private blend: Phaser.GameObjects.Image;
  private tray: Phaser.GameObjects.Image;
  private pose = 'idle';
  private fade = 1;
  private held = new Map<string, Phaser.GameObjects.Image>();
  constructor(
    private scene: Phaser.Scene,
    private controller: GameController,
    private ui: ViewState,
  ) {
    this.blend = scene.add.image(0, 0, 'cat-idle').setDepth(14);
    this.sprite = scene.add.image(0, 0, 'cat-idle').setDepth(14);
    this.tray = scene.add.image(0, 0, 'tray').setDepth(15).setVisible(false);
  }
  update(delta: number, l: Layout): void {
    let s = this.controller.state;
    const teaching = this.ui.teaching;
    if (teaching !== this.teaching) {
      if (teaching) {
        // Help may open during a reserved action. Freeze that action in place;
        // the recipe panel demonstrates locally without taking over its body.
        this.demoOwnsActor =
          (!s.actor.current || s.actor.current.kind === 'return') && !s.actor.queue.length;
        if (this.demoOwnsActor) {
          this.scheduler = new ActorScheduler(s.actor.point);
          this.scheduler.schedule(
            'demo',
            [{ point: s.actor.point, pose: 'read', hold: 600 }],
            true,
          );
        }
      } else if (this.teaching && this.demoOwnsActor) {
        this.controller.command({ type: 'actor-anchor', point: this.scheduler.frame.point });
        s = this.controller.state;
      }
      this.teaching = teaching;
    }
    if (teaching && this.demoOwnsActor) {
      if (
        !document.hidden &&
        !this.controller.pauses.has('blur') &&
        !this.controller.pauses.has('modal')
      )
        this.scheduler.advance(Math.min(delta, 100));
    } else if (s.actor.current)
      this.scheduler.follow(s.actor.current.plan, s.actor.current.elapsed);
    else this.scheduler = new ActorScheduler(s.actor.point);
    const frame = this.scheduler.frame;
    const walking =
      frame.moving &&
      !this.ui.lowGraphics &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pose = walking
      ? `step-${Math.floor((teaching && this.demoOwnsActor ? this.scheduler.elapsed : s.gameTime) / 150) % 4}`
      : frame.pose;
    if (pose !== this.pose && this.scene.textures.exists(`cat-${pose}`)) {
      this.blend.setTexture(this.sprite.texture.key);
      this.sprite.setTexture(`cat-${pose}`);
      this.pose = pose;
      this.fade = 0;
    }
    if (!this.controller.pauses.size || (teaching && this.demoOwnsActor))
      this.fade = Math.min(1, this.fade + delta / 110);
    const x = frame.point.x * l.width,
      y = frame.point.y * l.height - 36 * l.scale,
      height = 150 * l.scale;
    for (const node of [this.sprite, this.blend])
      node
        .setDisplaySize((height * node.width) / node.height, height)
        .setPosition(x, y + (walking ? Math.sin(frame.progress * Math.PI * 4) * 1.8 : 0));
    this.sprite.setAlpha(this.fade);
    this.blend.setAlpha(1 - this.fade);
    const hand = { x: x + 18 * l.scale, y: y + height * 0.15 };
    const mix = (a: Point, b: Point, t: number) => ({
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    });
    const ids = new Set<string>();
    const show = (id: string, product: Product, p: Point, size: number, alpha = 1) => {
      ids.add(id);
      let node = this.held.get(id);
      if (!node) {
        node = this.scene.add.image(p.x, p.y, foodAsset(product)).setDepth(16);
        this.held.set(id, node);
      }
      node.setTexture(foodAsset(product));
      const ratio = node.width / node.height;
      node
        .setPosition(p.x, p.y)
        .setDisplaySize(Math.min(size, size * ratio), Math.min(size, size / ratio))
        .setAlpha(alpha);
    };
    const job = s.actor.current;
    this.tray.setVisible(false);
    // Queued deliveries stay on their own physical plate until the lift phase.
    for (const delivery of [...(job ? [job] : []), ...s.actor.queue].filter(
      (j) => j.kind === 'delivery',
    )) {
      const trayId = delivery.tray ?? 0,
        rest = l.trays[trayId];
      const active = delivery === job;
      const phase = active ? frame.phase : -1;
      const lift = delivery.plan.phases.findIndex((p) => p.event === 'lift');
      const receive = delivery.plan.phases.findIndex((p) => p.event === 'receive');
      const put = delivery.plan.phases.findIndex((p) => p.event === 'return');
      let at = rest;
      if (active && phase >= lift) {
        at =
          phase === lift
            ? mix(rest, hand, frame.progress)
            : phase === put
              ? mix(hand, rest, frame.progress)
              : hand;
        this.tray
          .setVisible(true)
          .setPosition(at.x, at.y + 10)
          .setDisplaySize(
            l.trayWidth *
              (phase === lift
                ? 1 - 0.38 * frame.progress
                : phase === put
                  ? 0.62 + 0.38 * frame.progress
                  : 0.62),
            l.trayWidth *
              (phase === lift
                ? 0.64 - 0.24 * frame.progress
                : phase === put
                  ? 0.4 + 0.24 * frame.progress
                  : 0.4),
          );
      }
      const foods = s.items.filter((i) => delivery.itemIds.includes(i.id));
      for (const [i, item] of foods.entries()) {
        let p = {
          x:
            at.x +
            (Number(item.location.split(':')[2]) - 1) *
              Math.min(76, Math.max(46, l.trayWidth * 0.26)),
          y: at.y - 7,
        };
        if (active && phase >= lift)
          p = { x: at.x + (i - (foods.length - 1) / 2) * 30 * l.scale, y: at.y };
        if (active && phase === receive) {
          const guest = l.guests[s.orders.find((o) => o.id === delivery.order)?.seat ?? 0];
          p = mix(
            p,
            { x: guest.x + (i - (foods.length - 1) / 2) * 25, y: guest.y + 40 * l.scale },
            frame.progress,
          );
        }
        show(
          item.id,
          item.product,
          p,
          active && phase >= lift ? 38 * l.scale : Math.min(68, Math.max(46, l.trayWidth * 0.23)),
        );
      }
    }
    if (job?.kind === 'helper') {
      const preceding = job.plan.phases.slice(0, frame.phase).map((p) => p.event);
      const items = s.items.filter((i) => job.itemIds.includes(i.id));
      for (const [i, item] of items.entries()) {
        const pick = `pick:${item.id}`;
        if (!preceding.includes(pick) && frame.event !== pick) continue;
        const products = FAMILY_SUPPLIES[s.session.family];
        const index = products.indexOf(item.product);
        const source = {
          x: (l.width * (Math.max(0, index) + 0.5)) / (products.length + 1),
          y: l.height * 0.85,
        };
        let p = { x: hand.x + (i - (items.length - 1) / 2) * 28, y: hand.y };
        if (frame.event === pick) p = mix(source, p, frame.progress);
        if (frame.event === 'place') {
          const center = l.trays[job.tray ?? 0],
            slot = s.helper?.slots[i] ?? i;
          p = mix(
            p,
            {
              x: center.x + (slot - 1) * Math.min(76, Math.max(46, l.trayWidth * 0.26)),
              y: center.y - 7,
            },
            frame.progress,
          );
        }
        show(item.id, item.product, p, 38 * l.scale);
      }
    }
    if (teaching && this.demoOwnsActor) {
      // This is the current teaching projection, never a guessed final order or inventory.
      for (const [index, product] of (this.ui.lessonProducts ?? []).entries()) {
        show(
          `demonstration-${index}`,
          product,
          { x: hand.x + index * 20 * l.scale, y: hand.y },
          34 * l.scale,
          0.85,
        );
      }
    }
    for (const [id, node] of this.held)
      if (!ids.has(id)) {
        node.destroy();
        this.held.delete(id);
      }
    const canvas = this.scene.game.canvas;
    canvas.dataset.catX = String(frame.point.x);
    canvas.dataset.catY = String(frame.point.y);
    canvas.dataset.catPose = pose;
    canvas.dataset.catAction = teaching && this.demoOwnsActor ? 'lesson' : (job?.kind ?? 'idle');
  }
  reset(): void {
    this.scheduler = new ActorScheduler(this.controller.state.actor.point);
    this.teaching = null;
    this.demoOwnsActor = false;
  }
  destroy(): void {
    this.sprite.destroy();
    this.blend.destroy();
    this.tray.destroy();
    for (const item of this.held.values()) item.destroy();
  }
}
