import { type CSSProperties, type ReactNode, useState } from 'react';
import { PRODUCT_NAMES } from '../content/catalog';
import { type Product, type StationId, SUPPLY_PAGES } from '../content/recipes';
import { assetUrl } from '../game/assets';
import type { StageRect } from '../game/together-layout';
import type { Command, GameState } from '../rules/types';
import { Food } from './Food';
import { SceneIcon } from './SceneIcon';

type Target =
  | { kind: 'machine'; port: 'apple' | 'cup' }
  | { kind: 'station'; station: StationId }
  | { kind: 'preparation' };
export function TogetherKitchen({
  state: s,
  rect,
  run,
  use,
  drop,
  source,
}: {
  state: GameState;
  rect: StageRect;
  run: (c: Command) => unknown;
  use: (t: Target) => void;
  drop: (t: Target) => Record<string, string>;
  source: (i: GameState['items'][number]) => ReactNode;
}) {
  const unlocked = s.session.unlocked;
  const [pantry, setPantry] = useState(false);
  const stock = (
    product: Product,
    target: Extract<Command, { type: 'ingredient' }>['target'],
    name: string,
  ) => (
    <button
      type="button"
      key={`${name}:${product}`}
      className="direct-ingredient"
      data-grab={`stock:${product}`}
      data-ingredient={product}
      aria-label={`${name}：${PRODUCT_NAMES[product]}`}
      onClick={() => run({ type: 'ingredient', product, target })}
    >
      <Food product={product} />
    </button>
  );
  const manual = (id: StationId, title: string, products: Product[], image: string) => (
    <section className={`direct-device device-${id}`} aria-label={title} key={id}>
      <div
        className={`device-surface ${s.stations[id].status}`}
        style={{ backgroundImage: `url(${assetUrl(image)})` }}
      >
        <button
          type="button"
          {...drop({ kind: 'station', station: id })}
          className="direct-drop"
          aria-label={`放到${id === 'ice' ? '冰淇淋台' : id === 'grill' ? '煎台' : '组合板'}`}
          onClick={() => use({ kind: 'station', station: id })}
        />
        <div className="direct-inputs">
          {s.items
            .filter((i) => i.location.startsWith(`station:${id}:`))
            .map((item) => source(item))}
        </div>
        {id === 'grill' && s.stations.grill.status !== 'ready' ? (
          <button
            type="button"
            className="heat-switch"
            data-hotspot="start-station-grill"
            aria-label="启动煎台"
            disabled={s.stations.grill.status === 'processing'}
            onClick={() => run({ type: 'start-station', station: 'grill' })}
          >
            {s.stations.grill.status === 'processing'
              ? `${Math.ceil(s.stations.grill.remaining / 1000)}s`
              : '🔥'}
          </button>
        ) : null}
      </div>
      <div className="device-stock">{products.map((p) => stock(p, { station: id }, title))}</div>
    </section>
  );
  const chapter =
    s.adventure?.flow && s.adventure.flow.phase !== 'complete' ? s.adventure.chapter : null;
  const active = (ids: number[]) => chapter === null || ids.includes(chapter);
  const juice =
    unlocked.includes('juice') &&
    (active([3, 4]) || s.items.some((i) => i.location.startsWith('machine:')));
  const ice =
    unlocked.includes('ice') &&
    (active([1, 4]) || s.items.some((i) => i.location.startsWith('station:ice:')));
  const board = (unlocked.includes('sandwich') || unlocked.includes('burger')) && active([2, 3, 4]);
  const grill = unlocked.includes('burger') && active([3, 4]);
  return (
    <div
      className="direct-kitchen"
      style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height } as CSSProperties}
      data-devices={[juice && 'juice', ice && 'ice', board && 'board', grill && 'grill']
        .filter(Boolean)
        .join(' ')}
    >
      <div className={`direct-equipment ${board ? 'many-devices' : ''}`}>
        {juice ? (
          <section className="direct-device device-juice" aria-label="果汁机">
            <div
              className={`device-surface ${s.machine.status}`}
              style={{ backgroundImage: `url(${assetUrl('machine')})` }}
            >
              {(['apple', 'cup'] as const).map((port) => (
                <div className={`juice-port port-${port}`} key={port}>
                  <button
                    type="button"
                    {...drop({ kind: 'machine', port })}
                    className="direct-drop"
                    aria-label={port === 'apple' ? '放入果汁机水果口' : '放到果汁机杯座'}
                    onClick={() => use({ kind: 'machine', port })}
                  />
                  {s.items
                    .filter((i) => i.location === `machine:${port}`)
                    .map((item) => source(item))}
                </div>
              ))}
              {s.machine.status !== 'ready' ? (
                <button
                  type="button"
                  className="heat-switch"
                  data-hotspot="start"
                  aria-label="启动果汁机"
                  disabled={s.machine.status === 'processing'}
                  onClick={() => run({ type: 'start-machine' })}
                >
                  {s.machine.status === 'processing'
                    ? `${Math.ceil(s.machine.remaining / 1000)}s`
                    : '▶'}
                </button>
              ) : null}
            </div>
            <div className="device-stock">
              {(['apple', 'banana', 'cup'] as Product[]).map((p) =>
                stock(p, { machine: p === 'cup' ? 'cup' : 'apple' }, '果汁机'),
              )}
            </div>
          </section>
        ) : null}
        {ice
          ? manual(
              'ice',
              '冰淇淋',
              ['cone', 'cup', 'vanilla', 'strawberry', 'banana'],
              'ice-station',
            )
          : null}
        {board
          ? manual(
              'board',
              '组合板',
              [
                ...(unlocked.includes('sandwich') ? ['bread' as const] : []),
                ...(grill ? ['bun' as const] : []),
                'cheese',
                'lettuce',
                'tomato',
              ],
              'board-station',
            )
          : null}
        {grill ? manual('grill', '煎锅', ['patty'], 'grill-station') : null}
      </div>
      {pantry ? (
        <section className="extra-pantry" aria-label="更多食物篮">
          <div>
            {SUPPLY_PAGES.map((foods, page) => (
              <button
                type="button"
                key={foods.join('|')}
                aria-label={`查看第${page + 1}篮食物`}
                onClick={() => run({ type: 'supply-page', page })}
              >
                {page + 1}
              </button>
            ))}
          </div>
          <div>
            {(SUPPLY_PAGES[s.session.supplyPage] ?? []).map((p) => (
              <button
                type="button"
                key={p}
                data-grab={`stock:${p}`}
                data-hotspot={`supply-${p}`}
                aria-label={`拿起${PRODUCT_NAMES[p]}`}
                onClick={() => {
                  run({ type: 'pickup', source: { supply: p } });
                  setPantry(false);
                }}
              >
                <Food product={p} />
              </button>
            ))}
          </div>
        </section>
      ) : null}
      <div className="direct-rest">
        <button
          type="button"
          {...drop({ kind: 'preparation' })}
          aria-label="放到制作承放区"
          onClick={() => use({ kind: 'preparation' })}
        >
          <SceneIcon kind="carry" />
        </button>
        {s.items.filter((i) => i.location.startsWith('tray:')).map((item) => source(item))}
        {unlocked.includes('ready') ? (
          <button
            type="button"
            aria-label="查看更多食物篮"
            aria-expanded={pantry}
            onClick={() => setPantry(!pantry)}
          >
            <SceneIcon kind="basket" />
          </button>
        ) : null}
        <section className="fruit-basket" aria-label="可直接拿取的水果">
          {(['apple', 'banana'] as Product[]).map((p) => (
            <button
              type="button"
              key={p}
              data-grab={`stock:${p}`}
              data-hotspot={`supply-${p}`}
              aria-label={`拿起${PRODUCT_NAMES[p]}`}
              onClick={() => run({ type: 'pickup', source: { supply: p } })}
            >
              <Food product={p} />
            </button>
          ))}
        </section>
      </div>
    </div>
  );
}
