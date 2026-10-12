import type Phaser from 'phaser';
import { foodVisitor } from '../content/adventure-experience';
import type { GameState } from '../rules/types';
import actorBounds from './together-actors.json' with { type: 'json' };
import { type StageRect, togetherDamiRect, togetherLayout } from './together-layout';

/** Rendering only. Every body appears once and all motion reads the domain clock. */
export class TogetherView {
  private actors = new Map<string, Phaser.GameObjects.Image>();
  private surface: Phaser.GameObjects.Graphics;
  private background: Phaser.GameObjects.Image;
  constructor(private scene: Phaser.Scene) {
    this.background = scene.add.image(0, 0, 'courtyard').setOrigin(0).setDepth(0);
    this.surface = scene.add.graphics().setDepth(4);
  }
  private actor(name: string, key: string, r: StageRect, depth = 3) {
    if (!this.scene.textures.exists(key)) return;
    let image = this.actors.get(name);
    if (!image) {
      image = this.scene.add.image(0, 0, key);
      this.actors.set(name, image);
    }
    if (image.texture.key !== key) image.setTexture(key);
    const b = actorBounds[key as keyof typeof actorBounds];
    if (!b) return;
    const scale = Math.min(r.width / b.width, r.height / b.height);
    image
      .setCrop(b.x, b.y, b.width, b.height)
      .setOrigin((b.x + b.width / 2) / b.sourceWidth, (b.y + b.height) / b.sourceHeight)
      .setScale(scale)
      .setPosition(r.x + r.width / 2, r.y + r.height)
      .setDepth(depth)
      .setVisible(true);
  }
  draw(s: GameState, width: number, height: number, visible: boolean) {
    this.background.setVisible(visible);
    this.surface.setVisible(visible);
    for (const sprite of this.actors.values()) sprite.setVisible(false);
    if (!visible) return;
    const a = s.adventure;
    const count = a?.chapter === 4 || a?.invitations.includes('elder') ? 3 : 2;
    const l = togetherLayout(width, height, count);
    const texture = this.background.texture.getSourceImage() as HTMLImageElement;
    const scale = Math.max(width / texture.width, height / texture.height);
    this.background
      .setScale(scale)
      .setPosition((width - texture.width * scale) / 2, (height - texture.height * scale) / 2)
      .setTint(0xe9e0ba);
    this.surface.clear();
    const t = l.table;
    this.surface.fillStyle(0x735132).fillRoundedRect(t.x, t.y + 18, t.width, t.height, 35);
    this.surface
      .fillStyle(0x735132)
      .fillRect(t.x + t.width * 0.12, t.y + t.height - 8, 18, 70)
      .fillRect(t.x + t.width * 0.83, t.y + t.height - 8, 18, 70);
    this.surface
      .fillStyle(0xca9a65)
      .fillEllipse(t.x + t.width / 2, t.y + t.height / 2, t.width, t.height);
    if (a?.steps.includes('cloth')) {
      this.surface
        .fillStyle(a.decor.cloth === 'leaf' ? 0x719675 : 0xf1d485, 0.8)
        .fillEllipse(t.x + t.width / 2, t.y + t.height / 2, t.width * 0.92, t.height * 0.78);
    }
    if (a?.steps.includes('bunting') || a?.steps.includes('light')) {
      const y = height * 0.2;
      this.surface.lineStyle(3, 0x726045).lineBetween(t.x, y, t.x + t.width, y);
      for (let i = 0; i < 9; i++) {
        const x = t.x + (t.width * (i + 0.5)) / 9;
        if (a.steps.includes('bunting'))
          this.surface
            .fillStyle(a.decor.bunting === 'cool' ? 0x69aaa0 : 0xeeb46d)
            .fillTriangle(x - 9, y, x + 9, y, x, y + 21);
        if (a.steps.includes('light'))
          this.surface
            .fillStyle(a.decor.light === 'moon' ? 0xd2eafa : 0xffde7d)
            .fillCircle(x, y + 7, 8);
      }
    }
    for (const [i, rect] of l.guests.entries()) {
      const visitor = i === 0 ? 'rabbit' : i === 1 ? 'hedgehog' : 'elder';
      const moment = a?.experience?.moments.at(-1);
      const used = a?.foods.some((f) => foodVisitor(f) === visitor && f.tasted);
      const stage =
        moment && s.gameTime - moment.at < 3000 ? Math.floor((s.gameTime - moment.at) / 600) : 4;
      this.actor(
        visitor,
        visitor === 'elder'
          ? 'elder'
          : `guest-${i}-${used && stage >= 3 ? 2 : a?.foods.some((f) => foodVisitor(f) === visitor) ? 1 : 0}`,
        rect,
      );
    }
    const job = s.actor.current;
    const carrying = job?.kind === 'delivery' && job.itemIds.length;
    const cat = togetherDamiRect(s, l);
    this.actor(
      'dami',
      carrying ? 'cat-carry' : a?.rewards.length ? 'cat-celebrate' : 'cat-greet',
      cat,
      8,
    );
  }
  destroy() {
    for (const image of this.actors.values()) image.destroy();
    this.background.destroy();
    this.surface.destroy();
  }
}
