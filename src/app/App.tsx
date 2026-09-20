import Phaser from 'phaser';
import { useEffect, useReducer, useRef, useState } from 'react';
import { REQUESTS, type RequestId } from '../content/catalog';
import { assetUrl } from '../game/assets';
import { activate, type ViewState } from '../game/input';
import { TruckScene } from '../game/TruckScene';
import { ForegroundAudio } from '../platform/audio';
import { GameController } from '../platform/controller';
import { Note } from './Note';
import './app.css';
export function App() {
  const [controller] = useState(() => new GameController());
  const [audio] = useState(() => new ForegroundAudio(controller));
  const [, refresh] = useReducer((n) => n + 1, 0);
  const [screen, setScreen] = useState<'home' | 'game'>('home');
  const [modal, setModal] = useState<'lesson' | 'pause' | 'restart' | 'clear' | null>(null);
  const [lesson, setLesson] = useState(0);
  const [note, setNote] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const [ui] = useState<ViewState>(() => ({
    selected: null,
    selectedTray: 0,
    selectedGuest: 'guest-0',
    hotspots: [],
    focus: null,
    ready: false,
    assetFailure: false,
    resourceMessage: '',
    openNote: () => {},
    confirmClear: () => {},
    change: () => {},
  }));
  const host = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<TruckScene | null>(null);
  const confirmAction = useRef<() => void>(() => {});
  const dialog = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  ui.change = refresh;
  ui.openNote = () => setNote(true);
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
      transparent: false,
      scale: {
        mode: Phaser.Scale.RESIZE,
        width: host.current.clientWidth,
        height: host.current.clientHeight,
      },

      render: { antialias: true, roundPixels: false },
      audio: { noAudio: true },
      scene: [scene],
      banner: false,
      fps: { smoothStep: false },
    });
    const unsubscribe = controller.subscribe(refresh);
    return () => {
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
  const start = (fresh: boolean) => {
    if (fresh) controller.restart();
    setScreen('game');
    controller.pause('home', false);
    if (!controller.state.lessons.includes('meaning-m1')) {
      setLesson(0);
      setModal('lesson');
    } else void audio.play(REQUESTS[controller.state.orders[0]?.request ?? 'juice'].audio);
  };
  useEffect(() => {
    if (
      modal === 'lesson' &&
      lesson === 2 &&
      !controller.state.noteSupport.includes('demonstration')
    )
      controller.command({ type: 'note-support', reason: 'demonstration' });
  }, [modal, lesson, controller]);
  const closeLesson = () => {
    controller.command({ type: 'lesson', lesson: 'meaning-m1' });
    setModal(null);
    void audio.play(
      REQUESTS[controller.state.orders.find((o) => o.id === ui.selectedGuest)?.request ?? 'juice']
        .audio,
    );
  };
  const selectedOrder = controller.state.orders.find((o) => o.id === ui.selectedGuest);
  const done = controller.state.orders.every((o) => o.status === 'done');
  const fulfilled = controller.state.orders.filter((o) => o.status !== 'waiting').length;
  const support = () => {
    controller.command({ type: 'support', order: ui.selectedGuest, reason: 'text-request' });
    setCaption(ui.selectedGuest);
  };
  const exportSave = () => {
    const blob = new Blob(
      [
        controller.save.blocked && controller.save.raw
          ? controller.save.raw
          : JSON.stringify(controller.state, null, 2),
      ],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tabby-foodtruck-save.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const toggleAudio = () => {
    audio.enabled = !audio.enabled;
    if (!audio.enabled) audio.stop();
    refresh();
  };
  return (
    <main className="game-shell">
      <div className="canvas-host" ref={host} role="img" aria-label="英语餐车游戏画面" />
      {screen === 'game' ? (
        <>
          <header className="game-toolbar">
            <button type="button" onClick={() => setModal('pause')} aria-label="暂停">
              Ⅱ
            </button>
            <span className="service-count">
              小小餐车 <b>{fulfilled} / 2</b>
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
              onClick={() => {
                setLesson(0);
                setModal('lesson');
              }}
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
                data-hotspot={h.id}
                aria-label={h.label}
                tabIndex={modal || note || done ? -1 : 0}
                disabled={Boolean(modal) || done}
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
          {!done ? (
            <div className="request-tools">
              <button
                type="button"
                onClick={() => {
                  if (selectedOrder?.status === 'waiting')
                    void audio.play(REQUESTS[selectedOrder.request].audio);
                }}
                aria-label="重听当前客人请求"
              >
                ↻ 重听
              </button>
              <button type="button" onClick={support}>
                文字帮助
              </button>
              {controller.state.helper ? (
                <button type="button" onClick={() => controller.command({ type: 'cancel-helper' })}>
                  撤回便签
                </button>
              ) : null}
            </div>
          ) : null}
          {caption === ui.selectedGuest && selectedOrder?.status === 'waiting' ? (
            <div className="request-caption" role="status">
              <span>{REQUESTS[selectedOrder.request].text}</span>
              <button type="button" aria-label="收起文字帮助" onClick={() => setCaption(null)}>
                ×
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
              <p>两份心意，都送到了。</p>
              <h2>谢谢款待！</h2>
              <p className="ending-small">机器忙的时候，水果也可以先上桌。</p>
              <button type="button" className="primary" onClick={() => setModal('restart')}>
                再开一次小摊
              </button>
              <button type="button" onClick={() => setModal('pause')}>
                保存与离开
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
            <p className="home-copy">
              听懂一份请求，
              <br />
              亲手准备一份小小的快乐。
            </p>
            <div className="home-food">
              <img src={assetUrl('apple')} alt="" />
              <img src={assetUrl('juice')} alt="" />
              <img src={assetUrl('banana')} alt="" />
            </div>
            <button
              type="button"
              className="primary start-button"
              disabled={!ui.ready}
              onClick={() => (controller.save.blocked ? setModal('restart') : start(false))}
            >
              {!ui.ready ? '餐车准备中…' : controller.savedGame ? '继续摆摊' : '开摊啦'}
            </button>
            {controller.savedGame ? (
              <button type="button" onClick={() => setModal('restart')}>
                重新开始
              </button>
            ) : null}
            <button type="button" className="sound-option" onClick={toggleAudio}>
              {audio.enabled ? '♫ 声音已开' : '♪ 安静模式'} · 可随时切换
            </button>
            <small>开发语音未听审 · 角色参考待确认</small>
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
            className={`modal ${modal === 'lesson' ? 'recipe-book' : ''}`}
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-label={modal === 'lesson' ? '小食谱' : modal === 'pause' ? '休息一下' : '确认操作'}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.stopPropagation();
                setModal(null);
              }
              if (e.key === 'Tab') {
                const buttons = [
                  ...(dialog.current?.querySelectorAll<HTMLElement>(
                    'button:not(:disabled),a,input',
                  ) ?? []),
                ];
                const first = buttons[0];
                const last = buttons.at(-1);
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
            {modal === 'lesson' ? (
              <>
                <p className="eyebrow">开摊前的小食谱 · {lesson + 1} / 3</p>
                <h2>{['先认识好吃的', '苹果变成一杯果汁', '让小猫帮你拿'][lesson]}</h2>
                {lesson === 0 ? (
                  <>
                    <div className="meaning-pair">
                      {(['apple', 'banana'] as const).map((id) => (
                        <button
                          type="button"
                          key={id}
                          aria-label={`听 ${id}`}
                          onClick={() => void audio.play(id)}
                        >
                          <img src={assetUrl(id)} alt={id === 'apple' ? '苹果' : '香蕉'} />
                          <span>{id} ♫</span>
                        </button>
                      ))}
                    </div>
                    <p>点一点，听听它的名字。拿起水果，再点托盘放下。</p>
                  </>
                ) : lesson === 1 ? (
                  <>
                    <div className="recipe-flow">
                      <img src={assetUrl('apple')} alt="苹果" />
                      <span>＋</span>
                      <img src={assetUrl('cup')} alt="空杯" />
                      <span>→</span>
                      <button type="button" onClick={() => void audio.play('juice')}>
                        <img src={assetUrl('juice')} alt="苹果汁" />
                      </button>
                    </div>
                    <h3>apple juice ♫</h3>
                    <p>苹果放上面，空杯放右边，按下机器。等果汁时，也能准备另一盘水果。</p>
                  </>
                ) : (
                  <>
                    <div className="meaning-pair">
                      <img src={assetUrl('apple')} alt="苹果" />
                      <img src={assetUrl('apple')} alt="第二个苹果" />
                    </div>
                    <button
                      type="button"
                      className="example"
                      onClick={() => {
                        controller.command({ type: 'note-support', reason: 'demonstration' });
                        void audio.play('two');
                      }}
                    >
                      Two apples, please. ♫
                    </button>
                    <p>
                      小猫一次能拿一份或两份水果。便签里的 <b>and</b>{' '}
                      把两种水果连起来。先选目的地，再交给小猫。
                    </p>
                  </>
                )}
                <div className="modal-actions">
                  {lesson > 0 ? (
                    <button type="button" onClick={() => setLesson((n) => n - 1)}>
                      前一页
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="primary"
                    onClick={() => {
                      audio.stop();
                      if (lesson < 2) setLesson((n) => n + 1);
                      else closeLesson();
                    }}
                  >
                    {lesson < 2 ? '明白了，继续' : '开始接待'}
                  </button>
                </div>
                <small>这里暂停营业 · 示例是学习支持，不是测验</small>
              </>
            ) : modal === 'pause' ? (
              <>
                <p className="eyebrow">TAKE A LITTLE BREAK</p>
                <h2>歇一歇，食物会等你。</h2>
                <p>机器和小猫都已暂停。回来接着做。</p>
                <div className="pause-actions">
                  <button type="button" className="primary" onClick={() => setModal(null)}>
                    继续营业
                  </button>
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
                  本局交付尝试{' '}
                  {controller.state.attempts.filter((a) => a.activity === 'delivery').length}{' '}
                  次；便签提交{' '}
                  {controller.state.attempts.filter((a) => a.activity === 'note').length}{' '}
                  次。支持记录保留，不显示能力评分。
                </p>
              </>
            ) : modal === 'restart' ? (
              <>
                <h2>重新开摊？</h2>
                <p>当前食品和任务会清空。看过的帮助仍会保留记录。</p>
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
                      ui.selected = null;
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
                <p>这杯会清理掉，苹果不会倒回原来。</p>
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
export const requestText = (id: RequestId): string => REQUESTS[id].text;
