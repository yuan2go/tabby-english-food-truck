import Phaser from 'phaser';
import { useEffect, useReducer, useRef, useState } from 'react';
import { CONTENT_VERSION, type RequestId } from '../content/catalog';
import { CHAPTERS, type Support } from '../content/chapters';
import type { ShopTheme } from '../content/free-shop';
import { type TogetherViewState, TruckScene } from '../game/TruckScene';
import { ForegroundAudio } from '../platform/audio';
import { BUILD_INFO } from '../platform/build';
import { GameController } from '../platform/controller';
import { DialogueDirector } from '../platform/dialogue';
import { freeSlots } from '../rules/game';
import { useDialogFocus } from './dialog-focus';
import { FoodBaskets } from './FoodBaskets';
import { FreeShop } from './FreeShop';
import { Home } from './Home';
import { MenuGrowth } from './MenuGrowth';
import { MiniGames } from './MiniGames';
import { Note } from './Note';
import { Settings } from './Settings';
import { Story } from './Story';
import { SupportChoice } from './SupportChoice';
import { TogetherStage } from './TogetherStage';
import { useViewport } from './viewport';
import './app.css';
import './m2.css';
import './foods.css';

type Screen = 'home' | 'story' | 'game' | 'setup' | 'mini' | 'foods' | 'settings';
export function App() {
  const [controller] = useState(() => new GameController());
  const [audio] = useState(() => new ForegroundAudio(controller));
  const [dialogue] = useState(() => new DialogueDirector(controller, audio));
  const [, refresh] = useReducer((n) => n + 1, 0);
  const [screen, setScreen] = useState<Screen>('home');
  const [settingsBack, setSettingsBack] = useState<Screen>('home');
  const [paused, setPaused] = useState(false),
    [note, setNote] = useState(false);
  const [setup, setSetup] = useState<'endless' | 'training'>('endless');
  const [chapter, setChapter] = useState(0);
  const [support, setSupport] = useState<Support>(controller.profile.value.support);
  const [concurrency, setConcurrency] = useState<1 | 2>(controller.profile.value.concurrency);
  const [miniReturn, setMiniReturn] = useState<Screen>('home');
  const [collection, setCollection] = useState<{ ids: string[]; focus: string } | null>(null);
  const [protectedSave, setProtectedSave] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [demoOrder, setDemoOrder] = useState<string | null>(null);
  const [retryAudio, setRetryAudio] = useState<string | null>(null);
  const shell = useRef<HTMLElement>(null),
    host = useRef<HTMLDivElement>(null),
    scene = useRef<TruckScene | null>(null);
  useViewport(shell);
  const [ui] = useState<TogetherViewState>(() => ({
    togetherVisible: false,
    lowGraphics: (() => {
      try {
        return localStorage.getItem('tabby.foodtruck.lowGraphics') === 'true';
      } catch {
        return false;
      }
    })(),
    ready: false,
    assetFailure: false,
    resourceMessage: '',
    change: () => {},
  }));
  const s = controller.state;
  ui.togetherVisible = screen === 'game';
  ui.change = refresh;
  const growthId = (['banana', 'juice', 'banana-juice'] as const).find(
    (id) => !controller.profile.menu().includes(id),
  );
  const growth =
    screen === 'game' &&
    s.session.activity === 'endless' &&
    growthId &&
    s.session.served >= { banana: 1, juice: 2, 'banana-juice': 3 }[growthId] &&
    s.items.length === 0 &&
    !s.actor.current &&
    !s.lessons.includes(`growth:${growthId}`) &&
    !s.lessons.some((l) => l === `growth-deferred:${growthId}:${s.session.served}`)
      ? growthId
      : null;
  useDialogFocus(
    paused
      ? 'pause'
      : note
        ? 'note'
        : protectedSave
          ? 'protected-save'
          : screen === 'settings'
            ? 'settings'
            : growth
              ? 'growth'
              : null,
  );
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
    const unsubscribe = controller.subscribe(refresh);
    const flush = () => {
      controller.save.save(controller.state);
      controller.profile.save();
    };
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      unsubscribe();
      dialogue.destroy();
      audio.destroy();
      controller.destroy();
      game.destroy(true);
    };
  }, [controller, audio, dialogue, ui]);
  useEffect(() => {
    controller.pause('home', screen !== 'game');
    dialogue.setSurface(screen === 'game' && !paused && !note && !growth ? 'yard' : 'off');
  }, [screen, paused, note, growth, controller, dialogue]);
  useEffect(() => {
    controller.pause('modal', paused || protectedSave || Boolean(growth));
    if (paused || note || growth) audio.stop();
  }, [paused, note, protectedSave, growth, controller, audio]);
  // Resume the single dialogue owner before explicit retry; surface changes stop old playback.
  useEffect(() => {
    if (retryAudio && !paused) {
      void audio.play(retryAudio);
      setRetryAudio(null);
    }
  }, [retryAudio, paused, audio]);
  const home = () => {
    scene.current?.cancel();
    audio.stop();
    setPaused(false);
    setClearConfirm(false);
    setNote(false);
    setDemoOrder(null);
    setScreen('home');
  };
  const enter = (
    activity: 'story' | 'endless' | 'training',
    index = 0,
    replay = false,
    levelId?: string,
    shop?: { menu: RequestId[]; theme: ShopTheme },
    explore = false,
  ) => {
    audio.stop();
    controller.enter(
      activity,
      index,
      support,
      replay,
      activity === 'endless' ? concurrency : 1,
      levelId,
      shop,
      explore,
    );
    if (controller.save.blocked) {
      setProtectedSave(true);
      return;
    }
    setPaused(false);
    setScreen('game');
    controller.pause('home', false);
    void audio.unlock();
  };
  const settings = (back: Screen) => {
    audio.stop();
    setPaused(false);
    setSettingsBack(back);
    setScreen('settings');
  };
  const openMini = () => {
    audio.stop();
    setMiniReturn(screen);
    setScreen('mini');
  };
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
      <div ref={host} className="canvas-host" role="img" aria-label="同桌场景画面" />
      {screen === 'game' ? (
        <TogetherStage
          key={s.runId}
          controller={controller}
          audio={audio}
          dialogue={dialogue}
          demoOrder={demoOrder}
          closeDemo={() => setDemoOrder(null)}
          pause={() => setPaused(true)}
          home={home}
          replay={() => enter(s.session.activity, s.session.chapter, true, s.session.levelId)}
          games={openMini}
        />
      ) : screen === 'home' ? (
        <Home
          profile={controller.profile.value}
          legacy={Boolean(controller.save.legacyRaw)}
          audio={audio}
          {...(s.adventure?.kind === 'chapter' &&
          (!s.adventure.rewards.length || s.adventure.flow?.phase === 'reward')
            ? { resumeChapter: s.session.chapter }
            : {})}
          onActivity={(c, explore) => enter('story', c, false, undefined, undefined, explore)}
          onChoose={(choice) => {
            audio.stop();
            if (choice === 'endless') enter('endless');
            else if (choice === 'training') {
              setSetup(choice);
              setScreen('setup');
            } else if (choice === 'settings') settings('home');
            else if (choice === 'mini') openMini();
            else setScreen('story');
          }}
        />
      ) : screen === 'story' ? (
        <Story
          controller={controller}
          audio={audio}
          support={support}
          setSupport={setSupport}
          enter={(c, r, id) => enter('story', c, r, id, undefined, true)}
          home={home}
          resumeExisting={() => {
            if (controller.resumeLegacyStory()) {
              setScreen('game');
              controller.pause('home', false);
            }
          }}
        />
      ) : screen === 'mini' ? (
        <MiniGames
          controller={controller}
          audio={audio}
          collection={collection}
          baskets={() => setScreen('foods')}
          home={() => {
            audio.stop();
            if (collection) {
              setCollection(null);
              setScreen('foods');
            } else setScreen(miniReturn);
          }}
        />
      ) : screen === 'foods' ? (
        <FoodBaskets
          controller={controller}
          audio={audio}
          home={home}
          practice={(ids, focus) => {
            setCollection({ ids, focus });
            setMiniReturn('foods');
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
            setConcurrency(controller.state.session.concurrency);
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
      ) : setup === 'endless' ? (
        <FreeShop
          controller={controller}
          support={support}
          setSupport={setSupport}
          concurrency={concurrency}
          setConcurrency={setConcurrency}
          ready={ui.ready}
          home={home}
          start={(menu, theme) => enter('endless', 0, false, undefined, { menu, theme })}
        />
      ) : (
        <section className="setup-board">
          <button type="button" onClick={home}>
            ← 小院
          </button>
          <h2>和大咪一起练习</h2>
          <SupportChoice value={support} change={setSupport} />
          <div className="training-recipes">
            {controller.profile.value.introduced
              .filter((f) => f !== 'ready')
              .map((f, i) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={chapter === i}
                  onClick={() => setChapter(i)}
                >
                  {CHAPTERS[i]?.title}
                </button>
              ))}
          </div>
          <button type="button" onClick={() => setScreen('foods')}>
            五篮食物朋友 · 听音与配对
          </button>
          <button
            type="button"
            className="primary"
            disabled={!ui.ready}
            onClick={() => enter('training', chapter)}
          >
            开始 / 继续
          </button>
        </section>
      )}
      {paused ? (
        <div className="modal-backdrop">
          <section className="modal" role="dialog" aria-modal="true" aria-label="休息一下">
            <h2>歇一歇，食物会等你。</h2>
            <button type="button" className="primary" onClick={() => setPaused(false)}>
              继续操作
            </button>
            <button type="button" onClick={() => settings('game')}>
              详细设置
            </button>
            <button
              type="button"
              onClick={() => {
                setPaused(false);
                setNote(true);
              }}
            >
              给大咪写便签
            </button>
            {s.orders
              .filter((o) => o.status === 'waiting')
              .map((o) => (
                <button
                  type="button"
                  key={o.id}
                  onClick={() => {
                    setPaused(false);
                    setDemoOrder(o.id);
                  }}
                >
                  看{o.visitor === 'hedgehog' || (!o.visitor && o.seat === 1) ? '刺刺' : '兔兔'}
                  的同场示范
                </button>
              ))}
            {s.helper ? (
              <button type="button" onClick={() => controller.command({ type: 'cancel-helper' })}>
                撤回便签
              </button>
            ) : null}
            {s.recycle ? (
              <button
                type="button"
                onClick={() => {
                  const tray = ([0, 1] as const).find(
                    (t) =>
                      !controller.state.trays[t].remaining && freeSlots(controller.state, t).length,
                  );
                  if (tray !== undefined) controller.command({ type: 'restore-cleared', tray });
                  setPaused(false);
                }}
              >
                恢复收起的成品
              </button>
            ) : null}
            {s.adventure ? (
              <button
                type="button"
                onClick={() => {
                  const r = controller.command({
                    type: 'adventure',
                    action: 'clear-table',
                    confirmed: clearConfirm,
                  });
                  if (r.kind === 'confirm') setClearConfirm(true);
                  else if (r.kind === 'ok') {
                    setClearConfirm(false);
                    setPaused(false);
                  }
                }}
              >
                {clearConfirm ? '确认收拾活动桌（作品仍保存在食谱）' : '收拾活动桌'}
              </button>
            ) : null}
            {s.session.activity === 'endless' ? (
              <button
                type="button"
                onClick={() => {
                  setPaused(false);
                  setSetup('endless');
                  setScreen('setup');
                }}
              >
                调整开店设置
              </button>
            ) : null}
            {s.session.activity === 'endless' ? (
              <button
                type="button"
                onClick={() => {
                  controller.command({
                    type: 'shop-policy',
                    menu: s.session.menu,
                    theme: s.session.shop?.theme ?? 'all',
                    accepting: s.session.shop?.accepting === false,
                  });
                  setPaused(false);
                }}
              >
                {s.session.shop?.accepting === false ? '重新开门接客' : '停止接客，做作品'}
              </button>
            ) : null}
            {ui.assetFailure ? (
              <button type="button" onClick={() => scene.current?.retry()}>
                重试画面
              </button>
            ) : null}
            {audio.failure ? (
              <button
                type="button"
                onClick={() => {
                  setRetryAudio(audio.failedRequest);
                  setPaused(false);
                }}
              >
                重试声音
              </button>
            ) : null}
            {controller.save.issue ? (
              <button type="button" onClick={() => controller.save.save(controller.state)}>
                重试保存
              </button>
            ) : null}
            <button type="button" onClick={home}>
              收摊回小院
            </button>
            <p>开发语音未人工审核。{controller.save.issue ?? ui.resourceMessage}</p>
          </section>
        </div>
      ) : null}
      {note ? (
        <div className="modal-backdrop">
          <Note
            controller={controller}
            initialTray={([0, 1] as const).find((t) => freeSlots(s, t).length) ?? 0}
            feedback={() => audio.effect('gentle')}
            close={() => setNote(false)}
          />
        </div>
      ) : null}
      {growth ? (
        <MenuGrowth
          request={growth}
          audio={audio}
          close={(add) => {
            controller.command({
              type: 'lesson',
              lesson: add ? `growth:${growth}` : `growth-deferred:${growth}:${s.session.served}`,
            });
            if (add) {
              controller.profile.present(`menu:${growth}`);
              controller.profile.present(`request:${growth}`);
              controller.command({
                type: 'menu',
                requests: controller.profile.menu(),
                families: controller.profile.value.introduced,
              });
            }
            audio.stop();
            refresh();
          }}
        />
      ) : null}
      {protectedSave ? (
        <div className="modal-backdrop">
          <section role="dialog" aria-modal="true" className="modal" aria-label="存档保护">
            <p>原存档已保留，没有覆盖。请先在详细设置导出检查。</p>
            <button
              type="button"
              onClick={() => {
                setProtectedSave(false);
                settings('home');
              }}
            >
              导出与详细设置
            </button>
            <button type="button" onClick={() => setProtectedSave(false)}>
              暂不开始
            </button>
          </section>
        </div>
      ) : null}
    </main>
  );
}
