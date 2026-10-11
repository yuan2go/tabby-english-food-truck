import { useEffect, useState } from 'react';
import { ADVENTURES, VISITOR_NAMES, type Visitor } from '../content/adventure';
import { PRODUCT_NAMES } from '../content/catalog';
import { assetUrl } from '../game/assets';
import type { ForegroundAudio } from '../platform/audio';
import type { GameController } from '../platform/controller';
import { activityHint, adventureReady, openCommission } from '../rules/adventure';
import type { Command } from '../rules/types';
import { useDialogFocus } from './dialog-focus';
import { Food } from './Food';
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
  const food = a.foods.find((f) => f.id === selection);
  const act = (command: Omit<Extract<Command, { type: 'adventure' }>, 'type'>) => {
    const r = controller.command({ type: 'adventure', ...command });
    if (command.action === 'invite' && r.kind === 'ok') {
      const picnic = memory(2);
      controller.message = !picnic
        ? `${VISITOR_NAMES[command.visitor as Visitor]}第一次来到你的分享桌，想尝尝你做的食品。`
        : command.visitor === 'rabbit'
          ? picnic?.branch === 'rabbit'
            ? '兔兔记得你补齐的野餐篮，今天也想一起打包分享。'
            : '兔兔记得你摆好的野餐桌，今天来帮忙选餐位。'
          : command.visitor === 'hedgehog'
            ? picnic?.branch === 'hedgehog'
              ? '刺刺记得桌边分餐，带着一起摆餐的心意来了。'
              : '刺刺记得打开的野餐篮，今天也想尝你的新作品。'
            : '长辈来看看你写好的新食谱。';
    }
    if (r.kind === 'ok') audio.effect(command.action === 'finish' ? 'success' : 'place');
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
      className={`world-object ${shape}`}
      aria-label={label}
      onClick={() => {
        act({ action: 'explore', object: id });
        if (id === 'recipe') setBook(!book);
      }}
    >
      <span className="object-art" aria-hidden="true" />
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
      <div className="adventure-content" inert={clear}>
        <header className="activity-header">
          <button type="button" onClick={home} aria-label="返回小院">
            ← 小院
          </button>
          <div>
            <h2>{a.kind === 'shop' ? '自由开店' : chapter?.title}</h2>
            <p>{completed ? '这页已经留下记忆' : chapter?.goal}</p>
          </div>
          <button type="button" className="primary" onClick={kitchen}>
            去厨房备餐
          </button>
        </header>
        <div className="activity-world">
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
            {a.chapter === 4 || completed || a.kind === 'shop' ? (
              <div className="invitation-pegs">
                {(['rabbit', 'hedgehog', 'elder'] as const).map((v) => (
                  <button
                    type="button"
                    key={v}
                    aria-label={`邀请${VISITOR_NAMES[v]}`}
                    aria-pressed={a.invitations.includes(v)}
                    onClick={() => act({ action: 'invite', visitor: v })}
                  >
                    <img
                      src={assetUrl(v === 'elder' ? 'elder' : `guest-${v === 'rabbit' ? 0 : 1}-2`)}
                      alt=""
                    />
                    {VISITOR_NAMES[v]}
                  </button>
                ))}
              </div>
            ) : (
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
            )}
          </div>
          <p className="activity-hint">{activityHint(a)}</p>
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
                key={seat}
                aria-label={`摆到${seat + 1}号餐位`}
                onClick={() => act({ action: 'place', item: selection, seat })}
              >
                <span>{seat + 1}</span>
                {a.foods
                  .filter((f) => f.place === `table:${seat}`)
                  .map((f) => (
                    <Food key={f.id} product={f.product} />
                  ))}
                {a.foods.some((f) => f.place === `table:${seat}` && f.tasted) ? (
                  <b>尝过了</b>
                ) : null}
              </button>
            ))}
          </div>
          <fieldset className="received-foods" aria-label="真实送到活动桌的食物">
            {a.foods.map((f) => (
              <div
                key={f.id}
                className={`world-food ${f.place === 'basket' ? 'packed' : ''} ${f.tasted ? 'tasted' : ''}`}
              >
                <button
                  type="button"
                  aria-label={`选择${PRODUCT_NAMES[f.product]}`}
                  aria-pressed={selection === f.id}
                  onClick={() => setSelection(f.id)}
                >
                  <Food product={f.product} />
                  {f.place === 'basket' ? <span>篮内</span> : null}
                </button>
                <button
                  type="button"
                  className="taste-food"
                  aria-label={`品尝${PRODUCT_NAMES[f.product]}`}
                  disabled={f.tasted || f.place === 'basket'}
                  onClick={() => act({ action: 'taste', item: f.id })}
                >
                  {f.tasted ? '✓' : '尝一口'}
                </button>
                {f.place.startsWith('table:') ? (
                  <button
                    type="button"
                    aria-label={`拿回${PRODUCT_NAMES[f.product]}到桌边`}
                    onClick={() => act({ action: 'pickup', item: f.id })}
                  >
                    拿起
                  </button>
                ) : null}
              </div>
            ))}
            {!a.foods.length ? (
              <p className="empty-table">朋友带着请求来了。去厨房做第一份吧。</p>
            ) : null}
          </fieldset>
          {book ? (
            <section className="world-recipe" aria-label="食谱中的活动与作品">
              <button type="button" aria-label="收起食谱" onClick={() => setBook(false)}>
                ×
              </button>
              <h3>今天留下的味道</h3>
              {a.works.length ? (
                a.works.map((w) => (
                  <div key={w.id}>
                    {w.foods.map((f) => (
                      <Food key={f.id} product={f.product} />
                    ))}
                  </div>
                ))
              ) : (
                <p>换一种口味或夹层，准备好后带到桌边。自己的拼盘可以保存。</p>
              )}
              {pastWorks.length ? (
                <section aria-label="上次留下的作品">
                  <h3>上次留下的作品</h3>
                  {pastWorks.map((w) => (
                    <div key={w.id}>
                      {w.foods.map((f) => (
                        <Food key={f.id} product={f.product} />
                      ))}
                    </div>
                  ))}
                  <p>这些是食谱记忆。新作品用今天的食品重新制作。</p>
                </section>
              ) : null}
            </section>
          ) : null}
        </div>
        <footer className="activity-footer">
          <div className="activity-decisions">
            {a.chapter === 0 && a.explored.includes('drawer')
              ? ([0, 1, 2] as const).map((seat) => (
                  <button
                    type="button"
                    key={seat}
                    aria-pressed={has('plant') && a.decor.flower === seat}
                    onClick={() => act({ action: 'plant', seat })}
                  >{`把花种在${['左边', '中间', '右边'][seat]}`}</button>
                ))
              : null}
            {a.chapter === 1 && a.explored.includes('recipe')
              ? (['warm', 'cool'] as const).map((value) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => act({ action: 'bunting', value })}
                  >
                    {value === 'warm' ? '挂上暖色彩旗' : '挂上清凉彩旗'}
                  </button>
                ))
              : null}
            {a.chapter === 2 && a.branch === 'rabbit' && has('pack') ? (
              <button type="button" onClick={() => act({ action: 'unpack' })}>
                把篮子摆上桌
              </button>
            ) : null}
            {a.chapter === 2 && (has('unpack') || (has('place:0') && has('place:1')))
              ? (['leaf', 'sun'] as const).map((value) => (
                  <button type="button" key={value} onClick={() => act({ action: 'cloth', value })}>
                    {value === 'leaf' ? '铺上叶子桌布' : '铺上阳光桌布'}
                  </button>
                ))
              : null}
            {a.chapter === 3 && a.explored.includes('drawer')
              ? (['warm', 'moon'] as const).map((value) => (
                  <button type="button" key={value} onClick={() => act({ action: 'light', value })}>
                    {value === 'warm' ? '点亮暖灯' : '点亮月光灯'}
                  </button>
                ))
              : null}
            {a.chapter === 4 || completed || a.kind === 'shop' ? (
              <>
                <button type="button" onClick={() => act({ action: 'save-work' })}>
                  保存到食谱
                </button>
                <button type="button" onClick={() => setClear(true)}>
                  收拾桌面
                </button>
              </>
            ) : null}
          </div>
          {commission && commission.action !== 'create' ? (
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
                disabled={!adventureReady(a)}
                onClick={() => act({ action: 'finish' })}
              >
                一起开席
              </button>
            ) : null}
            {completed && a.chapter < 4 ? (
              <button type="button" className="primary" onClick={next}>
                下一院活动
              </button>
            ) : null}
            {completed ? (
              <button type="button" onClick={replay}>
                再准备一次
              </button>
            ) : null}
            <button type="button" onClick={home}>
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
          <p>食谱中保存的作品会留下。桌上食品收起后不会回到营业库存。</p>
          <button type="button" onClick={() => setClear(false)}>
            继续摆餐
          </button>
          <button
            type="button"
            onClick={() => {
              act({ action: 'clear-table', confirmed: true });
              setClear(false);
            }}
          >
            确认收拾
          </button>
        </section>
      ) : null}
    </section>
  );
}
