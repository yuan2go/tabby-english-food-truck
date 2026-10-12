import Phaser from 'phaser';
import type { ForegroundAudio } from '../platform/audio';
import type { GameController } from '../platform/controller';
import { assetUrl, CORE_ASSETS } from './assets';
import { renderScale } from './rendering';
import { TogetherView } from './TogetherView';

export interface TogetherViewState {
  togetherVisible: boolean;
  lowGraphics: boolean;
  ready: boolean;
  assetFailure: boolean;
  resourceMessage: string;
  change: () => void;
}
/** One renderer and one existing domain clock. DOM owns all game input. */
export class TruckScene extends Phaser.Scene {
  private view: TogetherView | null = null;
  private unsubscribe: (() => void) | null = null;
  private observer: ResizeObserver | null = null;
  private discardDelta = true;
  private uiFrame = 0;
  private width = 0;
  private height = 0;
  private failed = new Set<string>();
  private readonly resize = () => {
    this.discardDelta = true;
    this.resizeBuffer();
    this.draw();
  };
  private readonly visibility = () => {
    this.discardDelta = true;
    this.controller.pause('hidden', document.hidden);
    if (document.hidden) this.audio.stop();
  };
  private readonly blur = () => {
    this.discardDelta = true;
    this.controller.pause('blur', true);
    this.audio.stop();
  };
  private readonly focus = () => {
    this.discardDelta = true;
    this.controller.pause('blur', false);
  };
  private readonly freeze = () => {
    this.discardDelta = true;
    this.controller.pause('frozen', true);
    this.audio.stop();
  };
  private readonly resume = () => {
    this.discardDelta = true;
    this.controller.pause('frozen', false);
  };
  constructor(
    private readonly controller: GameController,
    private readonly audio: ForegroundAudio,
    private readonly ui: TogetherViewState,
  ) {
    super('truck');
  }
  preload() {
    this.load.on('loaderror', (file: Phaser.Loader.File) => this.failed.add(file.key));
    this.load.image('courtyard', assetUrl('courtyard'));
    for (const key of CORE_ASSETS.filter(
      (k) => k.startsWith('cat-') || k.startsWith('guest-') || k === 'elder',
    ))
      this.load.image(key, assetUrl(key));
  }
  create() {
    this.resourceStatus();
    this.ui.ready = true;
    this.view = new TogetherView(this);
    this.resizeBuffer();
    this.unsubscribe = this.controller.subscribe(() => this.draw());
    document.addEventListener('visibilitychange', this.visibility);
    document.addEventListener('freeze', this.freeze);
    document.addEventListener('resume', this.resume);
    window.addEventListener('blur', this.blur);
    window.addEventListener('focus', this.focus);
    window.addEventListener('orientationchange', this.resize);
    this.observer = new ResizeObserver(this.resize);
    const parent = this.game.canvas.parentElement;
    if (parent) this.observer.observe(parent);
    this.events.once('shutdown', () => {
      this.unsubscribe?.();
      this.observer?.disconnect();
      this.view?.destroy();
      this.view = null;
      document.removeEventListener('visibilitychange', this.visibility);
      document.removeEventListener('freeze', this.freeze);
      document.removeEventListener('resume', this.resume);
      window.removeEventListener('blur', this.blur);
      window.removeEventListener('focus', this.focus);
      window.removeEventListener('orientationchange', this.resize);
    });
    this.draw();
    this.ui.change();
  }
  private resizeBuffer() {
    const host = this.game.canvas.parentElement;
    if (!host || !host.clientWidth || !host.clientHeight) return;
    this.width = host.clientWidth;
    this.height = host.clientHeight;
    const density = renderScale(this.width, this.height, devicePixelRatio, this.ui.lowGraphics);
    this.scale.setZoom(1 / density);
    this.scale.resize(Math.round(this.width * density), Math.round(this.height * density));
    this.game.canvas.style.width = `${this.width}px`;
    this.game.canvas.style.height = `${this.height}px`;
    this.scale.updateBounds();
    this.cameras.main
      .setSize(this.scale.width, this.scale.height)
      .setZoom(density)
      .setScroll(0, 0)
      .setOrigin(0, 0);
    this.game.canvas.dataset.renderScale = density.toFixed(3);
    this.game.canvas.dataset.worldWidth = String(this.width);
    this.game.canvas.dataset.worldHeight = String(this.height);
  }
  private resourceStatus() {
    this.ui.assetFailure = this.failed.size > 0;
    this.ui.resourceMessage = this.failed.size
      ? `有${this.failed.size}份画面未能加载。重试不会重置进度。`
      : '';
  }
  setQuality() {
    this.resize();
  }
  cancel() {
    this.discardDelta = true;
  }
  retry() {
    if (!this.failed.size || this.load.isLoading()) return;
    const keys = [...this.failed];
    this.failed.clear();
    for (const key of keys) this.load.image(key, assetUrl(key));
    this.load.once('complete', () => {
      this.resourceStatus();
      this.draw();
      this.ui.change();
    });
    this.load.start();
  }
  private draw() {
    if (this.width && this.height)
      this.view?.draw(
        this.controller.state,
        this.width,
        this.height,
        this.ui.togetherVisible,
        this.ui.lowGraphics || matchMedia('(prefers-reduced-motion: reduce)').matches,
      );
  }
  update(_time: number, delta: number) {
    if (this.discardDelta) this.discardDelta = false;
    else this.controller.tick(delta);
    this.draw();
    this.uiFrame += delta;
    const s = this.controller.state;
    if (
      this.uiFrame >= 100 &&
      !this.controller.pauses.size &&
      (s.actor.current ||
        s.machine.status === 'processing' ||
        Object.values(s.stations).some((st) => st.status === 'processing'))
    ) {
      this.uiFrame = 0;
      this.ui.change();
    }
  }
}
