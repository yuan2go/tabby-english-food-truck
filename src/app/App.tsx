import Phaser from 'phaser';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { CONTENT_VERSION, MODES, type Mode, REQUESTS } from '../content/catalog';
import { assetUrl } from '../game/assets';
import { activate, type ViewState } from '../game/input';
import { TruckScene } from '../game/TruckScene';
import { ForegroundAudio, type SoundSetting } from '../platform/audio';
import { GameController } from '../platform/controller';
import { Note } from './Note';
import './app.css';

declare const __BUILD_INFO__: { sha: string; dirty: boolean; assets: string; builtAt: string };
const modeIds: Mode[] = ['guided', 'practice', 'service'];
export function App() {
  const [controller] = useState(() => new GameController());
  const [audio] = useState(() => new ForegroundAudio(controller));
  const [, refresh] = useReducer((n: number) => n + 1, 0);
  const [screen, setScreen] = useState<'home' | 'game'>('home');
  const [modal, setModal] = useState<'pause' | 'restart' | 'clear' | null>(null);
  const [teaching, setTeaching] = useState<string | null>(null);
  const [note, setNote] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const [pictures, setPictures] = useState(controller.state.mode === 'guided');
  const [ui] = useState<ViewState>(() => ({
    elements: new Map(),
    selected: null,
    selectedTray: 0,
    selectedGuest: 'guest-0',
    hotspots: [],
    focus: null,
    ready: false,
    assetFailure: false,
    resourceMessage: '',
    lowGraphics: (() => {
      try {
        return localStorage.getItem('tabby.foodtruck.lowGraphics') === 'true';
      } catch {
        return false;
      }
    })(),
    inputBlocked: false,
    teaching: null,
    openNote: () => {},
    confirmClear: () => {},
    change: () => {},
  }));
  const host = useRef<HTMLDivElement>(null),
    sceneRef = useRef<TruckScene | null>(null);
  const confirmAction = useRef<() => void>(() => {}),
    dialog = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const state = controller.state;
  const activeOrder = state.orders.find((o) => o.status === 'waiting');
  const selectedOrder =
    state.orders.find((o) => o.id === ui.selectedGuest && o.status === 'waiting') ?? activeOrder;
  const done = state.orders.every((o) => o.status === 'done');
  const fulfilled = state.orders.filter(
    (o) => o.status === 'done' || o.status === 'leaving',
  ).length;
  ui.change = refresh;
  ui.teaching = teaching;
  ui.inputBlocked = note || Boolean(modal) || Boolean(teaching);
  ui.openNote = () => {
    setNote(true);
  };
  ui.confirmClear = (action) => {
    confirmAction.current = action;
    setModal('clear');
  };
  useEffect(() => {
    if (!host.current) return;
    const scene = new TruckScene(controller, audio, ui);
    sceneRef.current = scene;
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host.current,
      backgroundColor: '#173e32',
      scale: {
        mode: Phaser.Scale.NONE,
        width: host.current.clientWidth,
        height: host.current.clientHeight,
        autoRound: false,
      },
      render: { antialias: true, roundPixels: false },
      audio: { noAudio: true },
      scene: [scene],
      banner: false,
      fps: { smoothStep: false },
      input: { mouse: false, touch: false },
    });
    const unsubscribe = controller.subscribe(refresh);
    const flush = () => controller.save.save(controller.state);
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      unsubscribe();
      audio.destroy();
      controller.destroy();
      game.destroy(true);
      sceneRef.current = null;
    };
  }, [controller, audio, ui]);
  useEffect(() => {
    controller.pause('modal', modal !== null);
    if (modal) audio.stop();
  }, [modal, controller, audio]);
  useEffect(() => {
    if (!modal) return;
    previousFocus.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.current?.querySelector<HTMLButtonElement>('button')?.focus();
    return () => previousFocus.current?.focus();
  }, [modal]);
  const teach = useCallback(
    (request: string) => {
      controller.pause('teaching', true);
      controller.command({ type: 'lesson', lesson: `meaning-${request}` });
      if (selectedOrder)
        controller.command({ type: 'support', order: selectedOrder.id, reason: 'demonstrated' });
      setTeaching(request);
      const sound =
        request === 'juice'
          ? 'juice'
          : request === 'banana'
            ? 'banana'
            : request === 'two'
              ? 'two'
              : request === 'fruit'
                ? 'note'
                : 'apple';
      void audio.play(sound);
    },
    [audio, controller, selectedOrder],
  );
  // Only a newly encountered active request opens its short scene demonstration.
  // This does not manufacture an attempt or a real inventory item.
  useEffect(() => {
    if (screen !== 'game' || modal || teaching || !activeOrder) return;
    ui.selectedGuest = selectedOrder?.id ?? activeOrder.id;
    if (!controller.state.lessons.includes(`meaning-${activeOrder.request}`))
      teach(activeOrder.request);
  }, [screen, activeOrder, modal, teaching, selectedOrder, controller, ui, teach]);
  useEffect(() => {
    if (
      screen === 'game' &&
      pictures &&
      selectedOrder &&
      !selectedOrder.support.includes('picture-request')
    )
      controller.command({ type: 'support', order: selectedOrder.id, reason: 'picture-request' });
  }, [pictures, screen, selectedOrder, controller]);
  const closeTeaching = () => {
    setTeaching(null);
    ui.teaching = null;
    controller.pause('teaching', false);
    controller.message = '轮到你啦：点水果，再点盘子。';
    if (selectedOrder) void audio.play(REQUESTS[selectedOrder.request].audio);
  };
  const start = (fresh: boolean) => {
    if (fresh) controller.restart();
    ui.selectedGuest = controller.state.orders.find((o) => o.status === 'waiting')?.id ?? 'guest-0';
    ui.selected = null;
    setScreen('game');
    controller.pause('home', false);
    void audio.unlock();
    audio.effect('arrive');
    if (
      controller.state.lessons.includes(`meaning-${controller.state.orders[0]?.request}`) &&
      selectedOrder
    )
      void audio.play(REQUESTS[selectedOrder.request].audio);
  };
  const chooseMode = (mode: Mode) => {
    audio.stop();
    sceneRef.current?.cancel();
    setTeaching(null);
    ui.teaching = null;
    controller.pause('teaching', false);
    setCaption(null);
    setNote(false);
    ui.selected = null;
    ui.selectedTray = 0;
    controller.switchMode(mode);
    if (controller.state.mode !== mode) return;
    ui.selectedGuest = controller.state.orders.find((o) => o.status === 'waiting')?.id ?? 'guest-0';
    setPictures(mode === 'guided');
    setModal(null);
  };
  const support = () => {
    if (!selectedOrder) return;
    controller.command({ type: 'support', order: selectedOrder.id, reason: 'text-request' });
    controller.command({ type: 'support', order: selectedOrder.id, reason: 'picture-request' });
    setCaption(selectedOrder.id);
  };
  const exportSave = () => {
    const raw =
      controller.save.blocked && controller.save.raw
        ? controller.save.raw
        : JSON.stringify(controller.state, null, 2);
    const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tabby-foodtruck-save.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const toggleAudio = () => {
    audio.enabled = !audio.enabled;
    if (audio.enabled) void audio.unlock();
    refresh();
  };
  const modePicker = (
    <fieldset className="mode-picker" aria-label="选择玩法">
      {modeIds.map((mode) => (
        <button
          type="button"
          key={mode}
          aria-pressed={state.mode === mode}
          onClick={() => chooseMode(mode)}
        >
          <span>{MODES[mode].icon}</span>
          {MODES[mode].name}
        </button>
      ))}
    </fieldset>
  );
  const pictureVisible = selectedOrder && (pictures || caption === selectedOrder.id);
  return (
    <main
      data-build-sha={__BUILD_INFO__.sha}
      data-build-dirty={String(__BUILD_INFO__.dirty)}
      data-content-version={CONTENT_VERSION}
      data-asset-version={__BUILD_INFO__.assets}
      onPointerDownCapture={(event) => {
        if (event.target instanceof Element && event.target.closest('button:not([data-hotspot])'))
          audio.effect('press');
      }}
      onKeyDownCapture={(event) => {
        if (
          (event.key === 'Enter' || event.key === ' ') &&
          event.target instanceof HTMLButtonElement
        )
          audio.effect('press');
      }}
      className={`game-shell mode-${state.mode}`}
      data-audio-state={JSON.stringify(audio.diagnostics())}
    >
      <div className="canvas-host" ref={host} role="img" aria-label="英语餐车游戏画面" />
      {screen === 'game' ? (
        <>
          <header className="game-toolbar">
            <button type="button" onClick={() => setModal('pause')} aria-label="暂停">
              Ⅱ
            </button>
            <span className="service-count">
              {MODES[state.mode].icon} 小小餐车{' '}
              <b>
                {fulfilled} / {state.orders.length}
              </b>
            </span>
            <button
              type="button"
              onClick={toggleAudio}
              aria-label={audio.enabled ? '关闭声音' : '打开声音'}
            >
              {audio.enabled ? '♫' : '♪'}
            </button>
            <button
              type="button"
              onClick={() => selectedOrder && teach(selectedOrder.request)}
              aria-label="打开小食谱"
            >
              ?
            </button>
          </header>
          <fieldset className="semantic-layer" aria-label="餐车操作">
            {ui.hotspots.map((h) => (
              <button
                type="button"
                key={h.id}
                ref={(element) => {
                  if (element) ui.elements.set(h.id, element);
                  else ui.elements.delete(h.id);
                }}
                data-hotspot={h.id}
                aria-label={h.label}
                tabIndex={modal || note || teaching || done ? -1 : 0}
                disabled={Boolean(modal || teaching) || done}
                style={{
                  left: h.x - h.width / 2,
                  top: h.y - h.height / 2,
                  width: h.width,
                  height: h.height,
                }}
                onFocus={() => {
                  ui.focus = h.id;
                  refresh();
                }}
                onBlur={() => {
                  ui.focus = null;
                  refresh();
                }}
                onClick={() => activate(h.id, controller, audio, ui)}
              >
                {h.label}
              </button>
            ))}
          </fieldset>
          {!done && !teaching ? (
            <div className="request-tools">
              <button
                type="button"
                onClick={() => {
                  if (selectedOrder) void audio.play(REQUESTS[selectedOrder.request].audio);
                }}
                aria-label="重听当前客人请求"
              >
                ↻ 重听
              </button>
              <button type="button" onClick={support}>
                图示帮助
              </button>
              {state.helper ? (
                <button type="button" onClick={() => controller.command({ type: 'cancel-helper' })}>
                  撤回便签
                </button>
              ) : null}
            </div>
          ) : null}
          {pictureVisible && !teaching ? (
            <section className="request-picture" aria-label="有图示支持的请求">
              {REQUESTS[selectedOrder.request].products.map((product, index) => (
                <img
                  key={`${selectedOrder.id}-${product}-${REQUESTS[selectedOrder.request].products.slice(0, index).filter((p) => p === product).length}`}
                  src={assetUrl(product)}
                  alt={product}
                />
              ))}
              {caption === selectedOrder.id ? (
                <button type="button" aria-label="收起文字帮助" onClick={() => setCaption(null)}>
                  ×
                </button>
              ) : null}
            </section>
          ) : null}
          {caption === selectedOrder?.id && selectedOrder && !teaching ? (
            <div className="request-caption">
              <span>{REQUESTS[selectedOrder.request].text}</span>
            </div>
          ) : null}
          {teaching ? (
            <div className="scene-teaching" role="dialog" aria-label="场景小教学">
              <div className="teaching-sequence">
                <img src={assetUrl(teaching === 'banana' ? 'banana' : 'apple')} alt="" />
                {teaching === 'two' ? (
                  <img src={assetUrl('apple')} alt="" />
                ) : teaching === 'fruit' ? (
                  <img src={assetUrl('banana')} alt="" />
                ) : null}
                <span>→</span>
                <img src={assetUrl(teaching === 'juice' ? 'machine' : 'tray')} alt="" />
                {teaching === 'juice' ? (
                  <>
                    <span>→</span>
                    <img src={assetUrl('juice')} alt="" />
                  </>
                ) : null}
              </div>
              <p>
                {teaching === 'juice'
                  ? '苹果＋杯子，按一下，等果汁。'
                  : teaching === 'two'
                    ? '一、二。两份苹果放一盘。'
                    : teaching === 'fruit'
                      ? '苹果和香蕉，一起放一盘。'
                      : '看小猫拿起来，放进盘子。'}
              </p>
              <button type="button" className="primary" onClick={closeTeaching}>
                我来试试
              </button>
            </div>
          ) : null}
          <footer className="game-feedback">
            <p role="status">{controller.message}</p>
            <small>开发语音 · 未听审</small>
          </footer>
          {note ? (
            <Note
              controller={controller}
              feedback={() => audio.effect('gentle')}
              initialTray={ui.selectedTray}
              close={() => {
                setNote(false);
                document.querySelector<HTMLButtonElement>('[data-hotspot="note"]')?.focus();
              }}
            />
          ) : null}
          {done ? (
            <div className="ending">
              <span className="ending-flower">✺</span>
              <p>心意送到了。</p>
              <h2>谢谢款待！</h2>
              <p className="ending-small">给今天的小主厨一朵小花。</p>
              <button type="button" className="primary" onClick={() => setModal('restart')}>
                再开一次小摊
              </button>
              <button type="button" onClick={() => setModal('pause')}>
                保存与换玩法
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="home-shade">
          <section className="home-sign">
            <p className="eyebrow">TABBY'S LITTLE MARKET</p>
            <h1>
              狸花猫的
              <br />
              <em>英语餐车</em>
            </h1>
            <div className="home-cat">
              <img src={assetUrl('cat-greet')} alt="戴绿围巾、背小背包的狸花猫" />
            </div>
            {modePicker}
            <button
              type="button"
              className="primary start-button"
              disabled={!ui.ready}
              onClick={() => (controller.save.blocked ? setModal('restart') : start(false))}
            >
              {!ui.ready ? '餐车准备中…' : controller.savedGame ? '继续摆摊' : '开摊啦'}
            </button>
            <button type="button" className="sound-option" onClick={toggleAudio}>
              {audio.enabled ? '♫ 声音已开' : '♪ 安静模式'} · 可随时切换
            </button>
            <small>开发素材与语音待审核</small>
          </section>
        </div>
      )}
      {ui.assetFailure ? (
        <div className="resource-alert" role="alert">
          {ui.resourceMessage}
          <button type="button" onClick={() => sceneRef.current?.retry()}>
            重试画面
          </button>
        </div>
      ) : null}
      {audio.failure ? (
        <div className="audio-alert" role="alert">
          {audio.failure}
          <button
            type="button"
            onClick={() => {
              if (selectedOrder) void audio.play(REQUESTS[selectedOrder.request].audio);
            }}
          >
            重试声音
          </button>
          <button
            type="button"
            onClick={() => {
              support();
              audio.failure = '';
              refresh();
            }}
          >
            使用文字支持
          </button>
        </div>
      ) : null}
      {controller.save.issue ? (
        <div className="storage-alert" role="alert">
          {controller.save.issue}
          <button type="button" onClick={exportSave}>
            导出存档
          </button>
        </div>
      ) : null}
      {modal ? (
        <div className="modal-backdrop">
          <div
            className="modal"
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-label={modal === 'pause' ? '休息一下' : '确认操作'}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.stopPropagation();
                setModal(null);
              }
              if (e.key === 'Tab') {
                const buttons = [
                    ...(dialog.current?.querySelectorAll<HTMLElement>(
                      'button:not(:disabled),input',
                    ) ?? []),
                  ],
                  first = buttons[0],
                  last = buttons.at(-1);
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last?.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first?.focus();
                }
              }
            }}
          >
            {modal === 'pause' ? (
              <>
                <h2>歇一歇，食物会等你。</h2>
                <button type="button" className="primary" onClick={() => setModal(null)}>
                  继续营业
                </button>
                <p>换玩法会保存每一局的食品与任务。</p>
                {modePicker}
                <div className="sound-settings">
                  {(Object.keys(audio.settings) as SoundSetting[]).map((key) => (
                    <label key={key}>
                      <input
                        type="checkbox"
                        checked={audio.settings[key]}
                        onChange={(e) => {
                          audio.set(key, e.target.checked);
                          if (e.target.checked) void audio.unlock();
                          refresh();
                        }}
                      />
                      {
                        {
                          master: '全部声音',
                          voice: '英语语音',
                          music: '背景音乐',
                          ambience: '集市环境',
                          effects: '动作和机器声音',
                        }[key]
                      }
                    </label>
                  ))}
                </div>
                <label className="setting-line">
                  <input
                    type="checkbox"
                    checked={pictures}
                    onChange={(e) => setPictures(e.target.checked)}
                  />
                  图片支持（关闭后可只听请求）
                </label>
                <label className="setting-line">
                  <input
                    type="checkbox"
                    checked={ui.lowGraphics}
                    onChange={(e) => {
                      ui.lowGraphics = e.target.checked;
                      try {
                        localStorage.setItem('tabby.foodtruck.lowGraphics', String(ui.lowGraphics));
                      } catch {
                        /* Keep session preference. */
                      }
                      sceneRef.current?.setQuality();
                      refresh();
                    }}
                  />
                  省电画面
                </label>
                <div className="pause-actions">
                  <button type="button" onClick={exportSave}>
                    导出当前进度
                  </button>
                  <button type="button" onClick={() => setModal('restart')}>
                    重新开始
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      audio.stop();
                      controller.pause('home', true);
                      setScreen('home');
                      setModal(null);
                      controller.savedGame = true;
                    }}
                  >
                    回到首页
                  </button>
                </div>
                <p className="record-summary">
                  本局交付尝试 {state.attempts.filter((a) => a.activity === 'delivery').length}{' '}
                  次；便签提交 {state.attempts.filter((a) => a.activity === 'note').length}{' '}
                  次。教学、示范、辅助与回访支持保留，不显示能力评分。
                </p>
                <details className="build-info">
                  <summary>版本与声音状态</summary>
                  <p>
                    Build {__BUILD_INFO__.sha}
                    {__BUILD_INFO__.dirty ? '（工作区含未提交修改）' : ''}
                    <br />
                    内容 {CONTENT_VERSION}
                    <br />
                    资源 {__BUILD_INFO__.assets}
                    <br />
                    声音：开发合成，未听审。无麦克风。
                  </p>
                  <output data-audio-diagnostics>{JSON.stringify(audio.diagnostics())}</output>
                </details>
              </>
            ) : modal === 'restart' ? (
              <>
                <h2>重新开摊？</h2>
                <p>这个玩法的食品和任务会重新准备，看过的帮助仍保留。其他玩法进度保留。</p>
                {controller.save.blocked ? (
                  <button type="button" onClick={exportSave}>
                    先导出原始存档
                  </button>
                ) : null}
                <div className="modal-actions">
                  <button type="button" onClick={() => setModal(null)}>
                    留下继续
                  </button>
                  <button
                    type="button"
                    className="primary"
                    onClick={() => {
                      audio.stop();
                      setTeaching(null);
                      setCaption(null);
                      setNote(false);
                      setModal(null);
                      start(true);
                    }}
                  >
                    确认重新开始
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>重新准备这杯果汁？</h2>
                <p>杯里的果汁会清理掉，其他食物保留。</p>
                <div className="modal-actions">
                  <button type="button" onClick={() => setModal(null)}>
                    保留果汁
                  </button>
                  <button
                    type="button"
                    className="primary"
                    onClick={() => {
                      confirmAction.current();
                      setModal(null);
                    }}
                  >
                    确认清理
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
