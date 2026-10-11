import { useEffect, useState } from 'react';
import { ADVENTURES, VISITOR_NAMES, type Visitor } from '../content/adventure';
import { drawerTools } from '../content/adventure-experience';
import { PRODUCT_NAMES } from '../content/catalog';
import { assetUrl } from '../game/assets';
import type { ForegroundAudio } from '../platform/audio';
import type { GameController } from '../platform/controller';
import { activityHint, adventureReady, openCommission } from '../rules/adventure';
import { type ActivityCommand, activityObstacle } from '../rules/adventure-guidance';
import type { Command } from '../rules/types';
import { AdventureGuide } from './AdventureGuide';
import { PicnicBasket, ToolShelf } from './AdventureObjects';
import { useDialogFocus } from './dialog-focus';
import { Food } from './Food';
import { FriendTheatre } from './FriendTheatre';
import { SceneIcon } from './SceneIcon';
import { SharingPegs } from './SharingPegs';
import { WorkGallery } from './WorkGallery';
import { WorldFoods } from './WorldFoods';
import './adventure.css';

/** Scene objects project the rule world; no independent inventory or progress lives here. */
export function Adventure({
  controller,
  audio,
  kitchen,
  home,
  next,
  replay,
  games,
}: {
  controller: GameController;
  audio: ForegroundAudio;
  kitchen: () => void;
  home: () => void;
  next: () => void;
  replay: () => void;
  games: () => void;
}) {
  const a = controller.state.adventure;
  const [selection, setSelection] = useState('');
  const [book, setBook] = useState(false);
  const [clear, setClear] = useState(false);
  const [decorating, setDecorating] = useState(false);
  const [blocked, setBlocked] = useState<ActivityCommand | null>(null);
  useDialogFocus(clear ? 'clear-table' : null);
  useEffect(() => {
    controller.pause('world-confirm', clear);
    return () => controller.pause('world-confirm', false);
  }, [clear, controller]);
  useEffect(() => {
    if (a && !a.foods.some((f) => f.id === selection))
      setSelection(a.foods.find((f) => f.place !== 'basket')?.id ?? '');
  }, [a, selection]);
  if (!a) return null;
  const chapter = ADVENTURES[a.chapter];
  const completed = !!a.rewards.length;
  const canInvite = a.chapter === 4 || completed || a.kind === 'shop';
  const food = a.foods.find((f) => f.id === selection);
  const act = (command: Omit<Extract<Command, { type: 'adventure' }>, 'type'>) => {
    const r = controller.command({ type: 'adventure', ...command });
    setBlocked(['ok', 'duplicate'].includes(r.kind) ? null : command);
    if (r.kind === 'ok') {
      audio.effect(command.action === 'finish' ? 'success' : 'place');
      if (['taste', 'water', 'cooperate', 'finish'].includes(command.action))
        void audio.play(
          command.action === 'taste'
            ? ['juice', 'banana-juice', 'milk', 'smoothie', 'milkshake'].includes(
                food?.product ?? '',
              )
              ? 'world-sip'
              : [
                    'vanilla-cup',
                    'vanilla-cone',
                    'strawberry-cup',
                    'double-cream',
                    'banana-cream',
                    'yogurt',
                  ].includes(food?.product ?? '')
                ? 'world-cold'
                : 'world-bite'
            : command.action === 'water'
              ? 'world-water'
              : command.action === 'finish'
                ? 'world-finish'
                : 'world-cooperate',
        );
    }
  };
  const commission = openCommission(a);
  const has = (id: string) => a.steps.includes(id);
  const memory = (chapter: number) =>
    controller.profile.value.activityMemories
      .filter((m) => m.state.chapter === chapter && m.state.rewards.length)
      .at(-1)?.state;
  const gardenFlower = has('plant') || !!memory(0);
  const gardenBunting = has('bunting') || !!memory(1);
  const gardenLight = has('light') || !!memory(3);
  const flowerPosition = has('plant') ? a.decor.flower : (memory(0)?.decor.flower ?? 0);
  const flagColor = has('bunting') ? a.decor.bunting : (memory(1)?.decor.bunting ?? 'warm');
  const pastWorks = controller.profile.value.activityMemories
    .filter(
      (m) =>
        m.runId !== controller.state.runId &&
        m.state.chapter === a.chapter &&
        m.state.kind === a.kind,
    )
    .flatMap((m) => m.state.works)
    .slice(-8);
  const object = (id: string, label: string, shape: string) => (
    <button
      type="button"
      className={`world-object ${shape} ${a.explored.includes(id) ? 'object-open' : ''}`}
      aria-label={label}
      data-world-target={id}
      onClick={() => {
        act({ action: 'explore', object: id });
        if (id === 'recipe') setBook(!book);
      }}
    >
      <span className="object-art" aria-hidden="true">
        <SceneIcon kind={shape === 'book' ? 'recipe' : shape} />
      </span>
      <span>{label}</span>
      {a.explored.includes(id) ? <b aria-hidden="true">✓</b> : null}
    </button>
  );
  return (
    <section
      className={`adventure-scene chapter-${a.chapter} cloth-${a.decor.cloth} light-${has('light') ? a.decor.light : 'day'}`}
      aria-label="小院活动桌"
      style={{ backgroundImage: `url(${assetUrl('courtyard')})` }}
    >
      <div className="adventure-content">
        <header className="activity-header">
          <button type="button" onClick={home} aria-label="返回小院">
            ← 小院
          </button>
          <div>
            <h2>{a.kind === 'shop' ? '自由开店' : chapter?.title}</h2>
            <p>{completed ? '这页已经留下记忆' : chapter?.goal}</p>
          </div>
          <fieldset className="activity-guests" aria-label="活动客流">
            {([1, 2] as const).map((n) => (
              <button
                type="button"
                key={n}
                aria-pressed={controller.state.session.concurrency === n}
                aria-label={n === 1 ? '一次接待一位' : '一起接待两位'}
                onClick={() =>
                  controller.command({
                    type: 'policy',
                    support: controller.state.session.support,
                    concurrency: n,
                  })
                }
              >
                <span aria-hidden="true">{n === 1 ? '👤' : '👥'}</span>
              </button>
            ))}
          </fieldset>
          <button type="button" className="primary" onClick={kitchen}>
            <SceneIcon kind="kitchen" />
            去厨房备餐
          </button>
        </header>
        <div
          className={`activity-world ${canInvite ? 'has-sharing-needs' : ''} ${drawerTools(a).length ? 'with-tool-shelf' : ''}`}
        >
          <div className="scene-objects">
            <button
              type="button"
              className="world-object book"
              aria-label="去小院游乐角"
              onClick={games}
            >
              <span className="object-art" aria-hidden="true" />
              <span>去游乐角 · 随时回来</span>
            </button>
            {a.chapter === 2 && a.branch === 'rabbit'
              ? object('basket', '检查野餐篮', 'basket')
              : object('drawer', '打开储物抽屉', 'drawer')}
            {object('recipe', '翻开旧食谱', 'book')}
            {!canInvite ? (
              <div
                className="scene-seed"
                role="img"
                aria-label={a.explored.includes('drawer') ? '已经找到活动物件' : '抽屉里有新的线索'}
              >
                {a.explored.includes('drawer')
                  ? a.chapter === 0
                    ? '✿'
                    : a.chapter === 3
                      ? '☀'
                      : '◯ ◯'
                  : '?'}
              </div>
            ) : null}
          </div>
          <ToolShelf a={a} take={(object) => act({ action: 'take-tool', object })} />
          <PicnicBasket a={a} />
          <AdventureGuide
            controller={controller}
            audio={audio}
            obstacle={blocked ? activityObstacle(controller.state, blocked) : undefined}
            navigate={(target, select) => {
              if (select) setSelection(select);
              if (target === 'kitchen') {
                kitchen();
                return;
              }
              window.requestAnimationFrame(() => {
                const element = document.querySelector<HTMLElement>(
                  `[data-world-target="${target}"]`,
                );
                element?.focus();
                element?.classList.add('show-target');
                window.setTimeout(() => element?.classList.remove('show-target'), 1800);
              });
            }}
          />
          <p className="activity-hint sr-only">{activityHint(a)}</p>
          <div className="friends-at-table">
            <img
              className="table-dami"
              src={assetUrl(completed ? 'cat-celebrate' : 'cat-greet')}
              alt="小主厨大咪"
            />
            {(['rabbit', 'hedgehog'] as Visitor[]).map((v) => (
              <div
                key={v}
                className={`world-friend ${a.invitations.includes(v) || has(`served:${v}`) ? 'friend-active' : ''}`}
              >
                <img
                  src={assetUrl(
                    v === 'elder'
                      ? 'elder'
                      : `guest-${v === 'rabbit' ? 0 : 1}-${has(`served:${v}`) ? 1 : 0}`,
                  )}
                  alt={VISITOR_NAMES[v]}
                />
                {controller.state.orders.some((o) => o.visitor === v && o.status === 'queued') ? (
                  <button
                    className="welcome-friend"
                    type="button"
                    aria-label={`先帮${VISITOR_NAMES[v]}`}
                    onClick={() => act({ action: 'welcome', visitor: v })}
                  >
                    👋
                  </button>
                ) : null}
                {has(`served:${v}`) ? (
                  <span className="friend-meal">
                    {a.foods
                      .filter((f) => f.place === `guest-${v}`)
                      .map((f) => (
                        <Food key={f.id} product={f.product} />
                      ))}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
          <FriendTheatre
            controller={controller}
            audio={audio}
            moment={a.experience?.moments.at(-1)}
          />
          <div
            className={`picnic-table ${has('cloth') ? 'cloth-spread' : ''} ${gardenBunting ? `flags-${flagColor}` : ''}`}
          >
            {gardenBunting ? (
              <div className="activity-bunting" role="img" aria-label="已挂起的分享彩旗">
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
            ) : null}
            {gardenFlower ? (
              <div
                className={`activity-flower flower-position-${flowerPosition}`}
                role="img"
                aria-label="已经种下的迎客花"
              >
                <i />
                <i />
                <b />
                {a.experience?.used.includes('water') ||
                memory(0)?.experience?.used.includes('water') ? (
                  <span className="garden-butterfly" aria-hidden="true">
                    🦋
                  </span>
                ) : null}
              </div>
            ) : null}
            {gardenLight ? (
              <div className="activity-lights" role="img" aria-label="已点亮灯串">
                <i />
                <i />
                <i />
                <i />
              </div>
            ) : null}
            {([0, 1, 2] as const).map((seat) => (
              <button
                type="button"
                className="table-seat"
                data-world-target="place"
                key={seat}
                aria-label={`摆到${seat + 1}号餐位`}
                onClick={() => act({ action: 'place', item: selection, seat })}
              >
                <span className="seat-friend">
                  <img src={assetUrl(seat === 2 ? 'elder' : `guest-${seat}-2`)} alt="" />
                </span>
                {a.experience?.helpers
                  .filter(
                    (h) =>
                      h.visitor === (seat === 0 ? 'rabbit' : seat === 1 ? 'hedgehog' : 'elder'),
                  )
                  .map((h) => (
                    <SceneIcon
                      key={h.visitor}
                      className="helper-prop"
                      kind={h.role === 'lantern' ? 'lantern' : 'cup'}
                    />
                  ))}
                {a.foods
                  .filter((f) => f.place === `table:${seat}`)
                  .map((f) => (
                    <Food key={f.id} product={f.product} />
                  ))}
                {a.foods.some((f) => f.place === `table:${seat}` && f.tasted) ? (
                  <b role="img" aria-label="朋友已经品尝">
                    ♡
                  </b>
                ) : null}
              </button>
            ))}
          </div>
          <WorldFoods a={a} selection={selection} select={setSelection} act={act} />
          <SharingPegs a={a} audio={audio} selection={selection} act={act} canInvite={canInvite} />
          {book ? (
            <section className="world-recipe" aria-label="食谱中的活动与作品">
              <button type="button" aria-label="收起食谱" onClick={() => setBook(false)}>
                ×
              </button>
              <WorkGallery works={a.works} title="今天留下的味道" revise={kitchen} />
              {pastWorks.length ? (
                <WorkGallery works={pastWorks} title="上次留下的作品" revise={kitchen} />
              ) : null}
              <p>图里保留原来的摆法和谁尝过。重新制作时可以换搭配，重新摆放并保存新的一页。</p>
            </section>
          ) : null}
        </div>
        <footer className="activity-footer">
          <div className="activity-decisions">
            {a.chapter === 0 && has('plant') && !a.experience?.used.includes('water') ? (
              <button
                type="button"
                data-world-target="water"
                aria-label="给迎客花浇水"
                onClick={() => act({ action: 'water' })}
              >
                <SceneIcon kind="watering-can" />
                <SceneIcon kind="flower" />
              </button>
            ) : null}
            {a.chapter === 1 && has('cool') && !a.experience?.used.includes('compare') ? (
              <button
                type="button"
                data-world-target="compare"
                aria-label="比较两种甜点"
                onClick={() => act({ action: 'compare' })}
              >
                <SceneIcon kind="cup" />
                <SceneIcon kind="cone" />
              </button>
            ) : null}
            {a.chapter === 3 && a.experience?.tools.includes('lantern') ? (
              <div className="cooperation-choices" data-world-target="cooperate">
                {(['rabbit', 'hedgehog'] as const).flatMap((visitor) =>
                  (['lantern', 'cups'] as const).map((role) => (
                    <button
                      type="button"
                      key={`${visitor}-${role}`}
                      aria-label={`请${VISITOR_NAMES[visitor]}${role === 'lantern' ? '带灯' : '带杯'}`}
                      aria-pressed={a.experience?.helpers.some(
                        (h) => h.visitor === visitor && h.role === role,
                      )}
                      disabled={a.experience?.helpers.some(
                        (h) => h.visitor === visitor && h.role !== role,
                      )}
                      onClick={() => act({ action: 'cooperate', visitor, object: role })}
                    >
                      <img src={assetUrl(`guest-${visitor === 'rabbit' ? 0 : 1}-2`)} alt="" />
                      <SceneIcon kind={role === 'lantern' ? 'lantern' : 'cup'} />
                    </button>
                  )),
                )}
              </div>
            ) : null}
            {a.chapter === 0 && a.explored.includes('drawer')
              ? ([0, 1, 2] as const).map((seat) => (
                  <button
                    type="button"
                    key={seat}
                    aria-pressed={has('plant') && a.decor.flower === seat}
                    data-world-target="plant"
                    aria-label={`把花种在${['左边', '中间', '右边'][seat]}`}
                    onClick={() => act({ action: 'plant', seat })}
                  >
                    <SceneIcon kind="seed" />
                    <span aria-hidden="true">{['◀', '●', '▶'][seat]}</span>
                  </button>
                ))
              : null}
            {a.chapter === 1 && a.explored.includes('recipe')
              ? (['warm', 'cool'] as const).map((value) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => act({ action: 'bunting', value })}
                    data-world-target="bunting"
                    aria-label={value === 'warm' ? '挂上暖色彩旗' : '挂上清凉彩旗'}
                    className={`decor-choice ${value}`}
                  >
                    <SceneIcon kind="bunting" />
                    <SceneIcon kind="shade" />
                  </button>
                ))
              : null}
            {a.chapter === 2 && a.branch === 'rabbit' && has('pack') ? (
              <button
                type="button"
                data-world-target="unpack"
                aria-label="把篮子摆上桌"
                onClick={() => act({ action: 'unpack' })}
              >
                <SceneIcon kind="basket" />
                <SceneIcon kind="table" />
              </button>
            ) : null}
            {a.chapter === 2 && (has('unpack') || (has('place:0') && has('place:1')))
              ? (['leaf', 'sun'] as const).map((value) => (
                  <button
                    type="button"
                    key={value}
                    data-world-target="cloth"
                    className={`decor-choice ${value}`}
                    aria-label={value === 'leaf' ? '铺上叶子桌布' : '铺上阳光桌布'}
                    onClick={() => act({ action: 'cloth', value })}
                  >
                    <SceneIcon kind="cloth" />
                  </button>
                ))
              : null}
            {a.chapter === 3 && a.explored.includes('drawer')
              ? (['warm', 'moon'] as const).map((value) => (
                  <button
                    type="button"
                    key={value}
                    data-world-target="light"
                    className={`decor-choice ${value}`}
                    aria-label={value === 'warm' ? '点亮暖灯' : '点亮月光灯'}
                    onClick={() => act({ action: 'light', value })}
                  >
                    <SceneIcon kind="lantern" />
                  </button>
                ))
              : null}
            {a.chapter === 4 || completed || a.kind === 'shop' ? (
              <>
                <button
                  type="button"
                  data-world-target="save-work"
                  aria-label="保存到食谱"
                  onClick={() => act({ action: 'save-work' })}
                >
                  <SceneIcon kind="recipe" />
                </button>
                <button
                  type="button"
                  data-world-target="clear-table"
                  onClick={() => setClear(true)}
                >
                  <SceneIcon kind="clear" />
                  收拾桌面
                </button>
              </>
            ) : null}
          </div>
          {commission && commission.action !== 'create' && !a.experience ? (
            <fieldset className="commission-clue" aria-label="开放委托的有效方案">
              {commission.action === 'pack' ? '篮子还需一份三明治＋一份水果' : '分享可选任意一杯：'}
              {commission.choices.map((p) => (
                <Food key={p} product={p} />
              ))}
            </fieldset>
          ) : null}
          <p role="status" className="world-feedback">
            {controller.message}
          </p>
          {completed || a.kind === 'shop' ? (
            <div className="free-decor-workshop">
              <button
                type="button"
                aria-label="自由布置工具"
                aria-expanded={decorating}
                onClick={() => setDecorating(!decorating)}
              >
                <SceneIcon kind="bunting" />
                布置
              </button>
              {decorating ? (
                <div>
                  {(['flower', 'bunting', 'cloth', 'light'] as const).map((kind, i) => (
                    <button
                      type="button"
                      key={kind}
                      aria-label={`换一种${['花的位置', '彩旗', '桌布', '灯光'][i]}`}
                      onClick={() =>
                        act(
                          kind === 'flower'
                            ? { action: 'plant', seat: ((a.decor.flower + 1) % 3) as 0 | 1 | 2 }
                            : kind === 'bunting'
                              ? {
                                  action: 'bunting',
                                  value: a.decor.bunting === 'warm' ? 'cool' : 'warm',
                                }
                              : kind === 'cloth'
                                ? {
                                    action: 'cloth',
                                    value: a.decor.cloth === 'leaf' ? 'sun' : 'leaf',
                                  }
                                : {
                                    action: 'light',
                                    value: a.decor.light === 'warm' ? 'moon' : 'warm',
                                  },
                        )
                      }
                    >
                      <SceneIcon kind={kind} />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="activity-exit">
            {a.kind === 'shop' ? (
              <button
                type="button"
                onClick={() => {
                  controller.command({
                    type: 'shop-policy',
                    menu: controller.state.session.menu,
                    theme: controller.state.session.shop?.theme ?? 'all',
                    accepting: controller.state.session.shop?.accepting === false,
                  });
                }}
              >
                {controller.state.session.shop?.accepting === false
                  ? '重新开门接客'
                  : '停止接客，做作品'}
              </button>
            ) : null}
            {!completed && a.kind === 'chapter' ? (
              <button
                type="button"
                className="primary"
                data-world-target="finish"
                disabled={!adventureReady(a)}
                onClick={() => act({ action: 'finish' })}
              >
                <SceneIcon kind="friends" />
                一起开席
              </button>
            ) : null}
            {completed && a.chapter < 4 ? (
              <button type="button" className="primary" onClick={next}>
                <SceneIcon kind="friend" />
                <span aria-hidden="true">➜</span>
                下一院活动
              </button>
            ) : null}
            {completed ? (
              <button type="button" onClick={replay}>
                再准备一次
              </button>
            ) : null}
            <button type="button" onClick={home}>
              <SceneIcon kind="home" />
              收摊回小院
            </button>
          </div>
        </footer>
        {food ? (
          <span className="sr-only">当前拿着{PRODUCT_NAMES[food.product]}，可点一个餐位摆放。</span>
        ) : null}
      </div>
      {clear ? (
        <section className="world-confirm" role="dialog" aria-modal="true" aria-label="收拾活动桌">
          <div className="clear-pictures" aria-hidden="true">
            <SceneIcon kind="recipe" />
            <span>♡</span>
            <SceneIcon kind="carry" />
            <span>➜</span>
            <SceneIcon kind="clear" />
          </div>
          <p>食谱中保存的作品会留下。桌上食品收起后不会回到营业库存。</p>
          <button type="button" onClick={() => setClear(false)}>
            <SceneIcon kind="table" />
            继续摆餐
          </button>
          <button
            type="button"
            onClick={() => {
              act({ action: 'clear-table', confirmed: true });
              setClear(false);
            }}
          >
            <SceneIcon kind="clear" />
            确认收拾
          </button>
        </section>
      ) : null}
    </section>
  );
}
