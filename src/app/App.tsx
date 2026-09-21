import { FoodBaskets } from './FoodBaskets';
import './foods.css';
import Phaser from 'phaser';
import { useEffect, useReducer, useRef, useState } from 'react';
import { CONTENT_VERSION, REQUESTS, type RequestId } from '../content/catalog';
import { CHAPTERS, type Support } from '../content/chapters';
import type { Family } from '../content/recipes';
import { DoubleTap } from '../game/gestures';
import { activate, type ViewState } from '../game/input';
import { TruckScene } from '../game/TruckScene';
import { ForegroundAudio } from '../platform/audio';
import { BUILD_INFO } from '../platform/build';
import { GameController } from '../platform/controller';
import { useDialogFocus } from './dialog-focus';
import { Food } from './Food';
import { Home } from './Home';
import { Lesson } from './Lesson';
import { MiniGames } from './MiniGames';
import { Note } from './Note';
import { ServiceControls } from './ServiceControls';
import { Settings } from './Settings';
import { Story } from './Story';
import { SupportChoice } from './SupportChoice';
import { useViewport } from './viewport';
import './app.css';
import './m2.css';
import './service.css';

type Screen = 'foods' | 'home' | 'story' | 'game' | 'mini' | 'setup' | 'settings';
type Modal = 'help' | 'audio' | 'pause' | 'clear' | 'restart' | null;
export function App() {
  const [controller] = useState(() => new GameController()),
    [audio] = useState(() => new ForegroundAudio(controller));
  const [, refresh] = useReducer((n) => n + 1, 0);
  const [screen, setScreen] = useState<Screen>('home'),
    [modal, setModal] = useState<Modal>(null),
    [teaching, setTeaching] = useState<RequestId | null>(null),
    [note, setNote] = useState(false),
    [caption, setCaption] = useState<string | null>(null);
  const [collection, setCollection] = useState<{ ids: string[]; focus: string } | null>(null);
  const [setup, setSetup] = useState<'endless' | 'training'>('endless');
  const [trainingChapter, setTrainingChapter] = useState(0);
  const [support, setSupport] = useState<Support>(controller.profile.value.support);
  const [opening, setOpening] = useState<number | null>(null);
  const [concurrency, setConcurrency] = useState<1 | 2>(
    controller.state.session.activity === 'endless'
      ? controller.state.session.concurrency
      : controller.profile.value.concurrency,
  );
  const announced = useRef('');
  useDialogFocus(modal ?? (teaching ? 'teaching' : note ? 'note' : null));
  const [settingsBack, setSettingsBack] = useState<Screen>('home');
  const [ui] = useState<ViewState>(() => ({
    elements: new Map(),
    lowGraphics: (() => {
      try {
        return localStorage.getItem('tabby.foodtruck.lowGraphics') === 'true';
      } catch {
        return false;
      }
    })(),
    inputBlocked: true,
    teaching: null,
    selected: null,
    selectedTray: 0,
    selectedGuest: '',
    hotspots: [],
    focus: null,
    ready: false,
    assetFailure: false,
    resourceMessage: '',
    prep: 'tray',
    doubleTap: new DoubleTap(),
    openNote: () => {},
    openHelp: () => {},
    confirmClear: () => {},
    change: () => {},
  }));
  const shell = useRef<HTMLElement>(null);
  useViewport(shell);
  const host = useRef<HTMLDivElement>(null),
    scene = useRef<TruckScene | null>(null),
    confirm = useRef<() => void>(() => {});
  const s = controller.state;
  const waiting = s.orders.filter((o) => o.status === 'waiting');
  const active = waiting[0];
  const actorBusy = Boolean(s.actor.current && s.actor.current.kind !== 'return');
  const selected = waiting.find((o) => o.id === ui.selectedGuest) ?? active;
  const done = s.session.activity !== 'endless' && s.orders.every((o) => o.status === 'done');
  ui.change = refresh;
  ui.teaching = teaching;
  ui.inputBlocked =
    screen !== 'game' ||
    !!modal ||
    !!teaching ||
    opening !== null ||
    note ||
    done ||
    !!ui.assetLoading;
  ui.openNote = () => setNote(true);
  ui.openHelp = () => setModal('help');
  ui.confirmClear = (action) => {
    confirm.current = action;
    setModal('clear');
  };
  useEffect(() => {
    if (!host.current) return;
    const truck = new TruckScene(controller, audio, ui);
    scene.current = truck;
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
      scene: [truck],
      banner: false,
      fps: { smoothStep: false },
      input: { mouse: false, touch: false },
    });
    const unsub = controller.subscribe(refresh);
    const flush = () => {
      controller.save.save(controller.state);
      controller.profile.save();
    };
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      unsub();
      audio.destroy();
      controller.destroy();
      game.destroy(true);
    };
  }, [controller, audio, ui]);
  useEffect(() => {
    controller.pause('home', screen !== 'game');
  }, [screen, controller]);
  useEffect(() => {
    controller.pause('modal', !!modal);
    if (modal) audio.stop();
  }, [modal, controller, audio]);
  const teach = (request: RequestId) => {
    if (selected)
      controller.command({ type: 'support', order: selected.id, reason: 'meaning-picture' });
    controller.pause('teaching', true);
    setTeaching(request);
  };
  useEffect(() => {
    if (opening === null || screen !== 'game') return;
    let cancelled = false;
    controller.pause('opening', true);
    const chapter = CHAPTERS[opening];
    void audio.sequence(chapter ? [chapter.audio] : []).then((result) => {
      if (!cancelled && result === 'completed') {
        controller.profile.present(`chapter-${opening}`);
        setOpening(null);
      }
    });
    return () => {
      cancelled = true;
      audio.stop();
      controller.pause('opening', false);
    };
  }, [opening, screen, audio, controller]);
  const activeId = active?.id,
    activeRequest = active?.request;
  useEffect(() => {
    if (
      screen !== 'game' ||
      modal ||
      teaching ||
      opening !== null ||
      !activeId ||
      !activeRequest ||
      actorBusy
    )
      return;
    const key = `${s.runId}:${activeId}`;
    const offered = `offered:${activeId}`;
    const pendingLesson = controller.profile.value.lessons[key];
    if (
      (pendingLesson && !['done', 'skipped'].includes(pendingLesson.phase)) ||
      (!s.lessons.includes(offered) &&
        !controller.profile.value.presented.includes(`request:${activeRequest}`))
    ) {
      controller.command({ type: 'lesson', lesson: offered });
      controller.profile.present(`request:${activeRequest}`);
      controller.command({ type: 'support', order: activeId, reason: 'meaning-picture' });
      controller.pause('teaching', true);
      setTeaching(activeRequest);
      return;
    }
    if (announced.current !== key) {
      announced.current = key;
      void audio.sequence([REQUESTS[activeRequest].audio]);
    }
  }, [
    screen,
    modal,
    teaching,
    opening,
    activeId,
    activeRequest,
    actorBusy,
    s.runId,
    s.lessons,
    controller,
    audio,
  ]);
  const closeTeaching = () => {
    audio.stop();
    setTeaching(null);
    ui.teaching = null;
    controller.pause('teaching', false);
    controller.message = '选好备餐位置，点食材添加。准备好后点送餐。';
    announced.current = '';
  };
  const home = () => {
    scene.current?.cancel();
    audio.stop();
    setOpening(null);
    controller.pause('opening', false);
    setTeaching(null);
    ui.teaching = null;
    controller.pause('teaching', false);
    controller.pause('home', true);
    setModal(null);
    setNote(false);
    setCaption(null);
    ui.selected = null;
    ui.doubleTap?.cancel();
    setScreen('home');
  };
  const enter = (activity: 'story' | 'endless' | 'training', chapter = 0, replay = false) => {
    audio.stop();
    controller.enter(activity, chapter, support, replay, activity === 'endless' ? concurrency : 1);
    if (controller.save.blocked) {
      setModal('restart');
      return;
    }
    ui.selected = null;
    ui.selectedTray = 0;
    ui.selectedGuest = '';
    ui.prep = 'tray';
    ui.doubleTap?.cancel();
    setCaption(null);
    const chapterKey = `chapter-${chapter}`;
    setOpening(
      activity === 'story' &&
        !controller.savedGame &&
        !controller.profile.value.presented.includes(chapterKey)
        ? chapter
        : null,
    );
    announced.current = '';
    setScreen('game');
    controller.pause('home', false);
    void audio.unlock();
  };
  const help = () => {
    if (selected) {
      controller.command({ type: 'support', order: selected.id, reason: 'picture-request' });
      setCaption(selected.id);
    }
  };
  const family = (f: Family) => {
    controller.command({ type: 'family', family: f });
    ui.prep = 'tray';
    ui.doubleTap?.cancel();
    ui.selected = null;
    refresh();
  };
  const showSettings = (back: Screen) => {
    audio.stop();
    setSettingsBack(back);
    setModal(null);
    setScreen('settings');
  };
  const selectedItem =
    ui.selected && 'item' in ui.selected
      ? s.items.find((i) => i.id === (ui.selected as { item: string }).item)
      : null;
  const picture = selected && (s.session.support !== 'less' || caption === selected.id);
  return (
    <main
      ref={shell}
      className={`game-shell m2-shell screen-${screen}`}
      data-build-sha={BUILD_INFO.sha}
      data-build-dirty={String(BUILD_INFO.dirty)}
      data-content-version={CONTENT_VERSION}
      data-asset-version={BUILD_INFO.assets}
      data-audio-state={JSON.stringify(audio.diagnostics())}
    >
      <div className="canvas-host" ref={host} role="img" aria-label="英语餐车游戏画面" />
      {screen === 'home' ? (
        <Home
          profile={controller.profile.value}
          legacy={Boolean(controller.save.legacyRaw)}
          audio={audio}
          onChoose={(choice) => {
            audio.stop();
            if (choice === 'endless' || choice === 'training') {
              setSetup(choice);
              setScreen('setup');
            } else if (choice === 'settings') showSettings('home');
            else setScreen(choice);
          }}
        />
      ) : screen === 'story' ? (
        <Story
          controller={controller}
          audio={audio}
          support={support}
          setSupport={setSupport}
          enter={(chapter, replay) => enter('story', chapter, replay)}
          home={home}
        />
      ) : screen === 'mini' ? (
        <MiniGames
          controller={controller}
          audio={audio}
          home={() => {
            if (collection) {
              setCollection(null);
              setScreen('foods');
            } else home();
          }}
          collection={collection}
          baskets={() => setScreen('foods')}
        />
      ) : screen === 'foods' ? (
        <FoodBaskets
          controller={controller}
          audio={audio}
          home={home}
          practice={(ids, focus) => {
            setCollection({ ids, focus });
            setScreen('mini');
          }}
          serve={() => enter('endless')}
        />
      ) : screen === 'settings' ? (
        <Settings
          controller={controller}
          audio={audio}
          close={() => {
            setSupport(controller.profile.value.support);
            setConcurrency(controller.profile.value.concurrency);
            setScreen(settingsBack);
          }}
          refresh={refresh}
          quality={ui.lowGraphics}
          setQuality={(v) => {
            ui.lowGraphics = v;
            scene.current?.setQuality();
            try {
              localStorage.setItem('tabby.foodtruck.lowGraphics', String(v));
            } catch {}
            refresh();
          }}
        />
      ) : screen === 'setup' ? (
        <section className="setup-board">
          <button type="button" className="corner-back" onClick={home}>
            ← 小院
          </button>
          <h2>{setup === 'endless' ? '今天也开门迎客' : '和小猫一起练习'}</h2>
          <p>慢慢想，客人会等你。随时可以求助。</p>
          <SupportChoice value={support} change={setSupport} />
          {setup === 'endless' ? (
            <fieldset className="choice-row">
              <legend>今天想多忙？</legend>
              {([1, 2] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={concurrency === n}
                  onClick={() => setConcurrency(n)}
                >
                  {n === 1 ? '一位一位来' : '两位一起招呼'}
                </button>
              ))}
            </fieldset>
          ) : null}
          {setup === 'training' ? (
            <button
              type="button"
              className="food-basket-entry"
              onClick={() => {
                void audio.play('basket-welcome');
                setScreen('foods');
              }}
            >
              <Food product="orange" />
              五篮食物朋友 · 听音与配对
            </button>
          ) : null}
          {setup === 'training' ? (
            <fieldset className="training-recipes">
              <legend>今天练哪一道？</legend>
              {controller.profile.value.introduced
                .filter((f) => f !== 'ready')
                .map((f, i) => (
                  <button
                    type="button"
                    key={f}
                    aria-pressed={trainingChapter === i}
                    onClick={() => setTrainingChapter(i)}
                  >
                    <Food
                      product={
                        (['juice', 'vanilla-cone', 'sandwich', 'burger'] as const)[i] ?? 'juice'
                      }
                    />
                    {CHAPTERS[i]?.title}
                  </button>
                ))}
            </fieldset>
          ) : null}

          <button
            type="button"
            className="primary"
            disabled={!ui.ready}
            onClick={() => enter(setup, setup === 'training' ? trainingChapter : 0)}
          >
            开始 / 继续
          </button>
          <small>教学不要求识字；拼写不会挡住故事。</small>
        </section>
      ) : (
        <div className="service-surface">
          <header className="game-toolbar">
            <button type="button" aria-label="暂停" onClick={() => setModal('pause')}>
              Ⅱ
            </button>
            <span className="service-count">
              {s.session.activity === 'story'
                ? CHAPTERS[s.session.chapter]?.title
                : s.session.activity === 'endless'
                  ? '无尽营业'
                  : '教学练习'}{' '}
              <b>
                {s.session.activity === 'endless'
                  ? `已送出 ${s.session.served} 单`
                  : `${s.orders.filter((o) => o.status === 'done').length} / ${s.orders.length}`}
              </b>
            </span>
            {audio.failure ? (
              <button type="button" aria-label="声音状态" onClick={() => setModal('audio')}>
                ♫!
              </button>
            ) : null}
          </header>
          <fieldset className="semantic-layer" aria-label="餐车操作">
            {ui.hotspots.map((h) => (
              <button
                type="button"
                key={h.id}
                data-hotspot={h.id}
                aria-label={h.label}
                ref={(el) => {
                  if (el) ui.elements.set(h.id, el);
                  else ui.elements.delete(h.id);
                }}
                tabIndex={ui.inputBlocked ? -1 : 0}
                disabled={ui.inputBlocked}
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
          {!done && !teaching && !modal && !note && opening === null ? (
            <ServiceControls
              controller={controller}
              audio={audio}
              ui={ui}
              waiting={waiting}
              selected={selected}
              selectedItem={selectedItem}
              picture={picture}
              caption={caption}
              setCaption={setCaption}
              help={help}
              family={family}
            />
          ) : null}
          {opening !== null ? (
            <section className="chapter-opening" role="dialog" aria-label="章节开场">
              <p>{CHAPTERS[opening]?.line}</p>
              <button
                type="button"
                onClick={() => {
                  audio.stop();
                  controller.profile.present(`chapter-${opening}`);
                  setOpening(null);
                }}
              >
                跳过开场
              </button>
            </section>
          ) : null}
          {teaching ? (
            <Lesson
              key={teaching}
              view={ui}
              request={teaching}
              controller={controller}
              lessonKey={`${s.runId}:${selected?.id ?? teaching}`}
              audio={audio}
              close={closeTeaching}
            />
          ) : null}
          {ui.assetLoading ? (
            <div className="loading-page" role="status">
              食谱翻页中…
            </div>
          ) : null}
          <footer
            className="game-feedback"
            style={
              ui.layout
                ? {
                    left: ui.layout.regions.feedback.x,
                    top: ui.layout.regions.feedback.y,
                    width: ui.layout.regions.feedback.width,
                    height: ui.layout.regions.feedback.height,
                  }
                : undefined
            }
          >
            <p role="status">{controller.message}</p>
          </footer>
          {note ? (
            <Note
              controller={controller}
              initialTray={ui.selectedTray}
              feedback={() => audio.effect('gentle')}
              close={() => setNote(false)}
            />
          ) : null}
          {done ? (
            <section className="ending">
              <img src="/assets/cat-celebrate.webp" alt="小猫完成营业" />
              <h2>
                {s.session.chapter === 4 && s.session.activity === 'story'
                  ? '小院里的朋友，都到齐啦！'
                  : '这一页，有了新的味道。'}
              </h2>
              <p>
                {s.session.activity === 'story'
                  ? `小院添上了${CHAPTERS[s.session.chapter]?.gift}。食谱已保存，随时可以再来。`
                  : '今天的练习完成啦，可以到故事里试一试。'}
              </p>
              {s.session.activity === 'story' && s.session.chapter < 4 ? (
                <button
                  type="button"
                  className="primary"
                  onClick={() => enter('story', s.session.chapter + 1)}
                >
                  翻开下一页
                </button>
              ) : (
                <button type="button" className="primary" onClick={home}>
                  回小院
                </button>
              )}
              <button
                type="button"
                onClick={() => enter(s.session.activity, s.session.chapter, true)}
              >
                重玩这一页
              </button>
              <button type="button" onClick={home}>
                回到首页
              </button>
            </section>
          ) : null}
        </div>
      )}
      {modal ? (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={modal === 'pause' ? '休息一下' : '确认操作'}
          >
            {modal === 'pause' ? (
              <>
                <h2>歇一歇，食物会等你。</h2>
                <button type="button" className="primary" onClick={() => setModal(null)}>
                  继续营业
                </button>
                <button type="button" onClick={() => showSettings('game')}>
                  设置
                </button>
                <button type="button" onClick={home}>
                  保存并回到首页
                </button>
              </>
            ) : modal === 'help' ? (
              <>
                <h2>小猫陪你一起做</h2>
                <button
                  type="button"
                  onClick={() => {
                    setModal(null);
                    help();
                  }}
                >
                  看看客人想要什么
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModal(null);
                    if (selected) teach(selected.request);
                  }}
                >
                  看食谱与示范
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModal(null);
                    setNote(true);
                  }}
                >
                  请小猫帮我拿
                </button>
                {s.helper ? (
                  <button
                    type="button"
                    onClick={() => {
                      controller.command({ type: 'cancel-helper' });
                      setModal(null);
                    }}
                  >
                    撤回便签
                  </button>
                ) : null}
                <button type="button" className="primary" onClick={() => setModal(null)}>
                  继续营业
                </button>
              </>
            ) : modal === 'audio' ? (
              <>
                <h2>声音小提示</h2>
                <p>{audio.failure || '可以继续看图制作。'}</p>
                <button
                  type="button"
                  onClick={() => {
                    const id = audio.failedRequest ?? audio.lastRequested;
                    setModal(null);
                    if (id) void audio.play(id);
                  }}
                >
                  重试声音
                </button>
                <button
                  type="button"
                  onClick={() => {
                    help();
                    setModal(null);
                  }}
                >
                  使用图示帮助
                </button>
                <button type="button" onClick={() => setModal(null)}>
                  继续营业
                </button>
              </>
            ) : modal === 'clear' ? (
              <>
                <h2>收起这份成品？</h2>
                <p>不会变回原料。腾出位置后可以恢复。</p>
                <button
                  type="button"
                  onClick={() => {
                    confirm.current();
                    setModal(null);
                  }}
                >
                  确认收起
                </button>
                <button type="button" onClick={() => setModal(null)}>
                  留在这里
                </button>
              </>
            ) : (
              <>
                <h2>存档需要处理</h2>
                <p>旧版或异常存档已保留，可先在设置导出，再明确开始新旅程。</p>
                <button type="button" onClick={() => showSettings('home')}>
                  导出与设置
                </button>
                <button
                  type="button"
                  onClick={() => {
                    controller.save.reset();
                    setModal(null);
                    home();
                  }}
                >
                  开始新旅程
                </button>
              </>
            )}
          </section>
        </div>
      ) : null}
      {ui.assetFailure ? (
        <div className="resource-alert" role="alert">
          {ui.resourceMessage}
          <button type="button" onClick={() => scene.current?.retry()}>
            重试画面
          </button>
        </div>
      ) : null}
      {audio.failure && screen !== 'game' ? (
        <button
          type="button"
          className="sound-status"
          onClick={() => {
            const id = audio.failedRequest ?? audio.lastRequested;
            if (id) void audio.play(id);
          }}
        >
          ♫! 重试声音
        </button>
      ) : null}
      {controller.save.issue || controller.profile.issue ? (
        <div className="storage-alert" role="alert">
          {controller.save.issue || controller.profile.issue}
          <button type="button" onClick={() => showSettings(screen)}>
            导出进度
          </button>
        </div>
      ) : null}
    </main>
  );
}
