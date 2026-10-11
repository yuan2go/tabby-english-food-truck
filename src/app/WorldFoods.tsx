import { useEffect, useState } from 'react';
import type { AdventureState } from '../content/adventure';
import { PRODUCT_NAMES } from '../content/catalog';
import type { Command } from '../rules/types';
import { Food } from './Food';
import { SceneIcon } from './SceneIcon';
/** Page the collection, while the selected portion and core actions stay in the viewport. */
export function WorldFoods({
  a,
  selection,
  select,
  act,
}: {
  a: AdventureState;
  selection: string;
  select: (id: string) => void;
  act: (c: Omit<Extract<Command, { type: 'adventure' }>, 'type'>) => void;
}) {
  const [page, setPage] = useState(0);
  useEffect(() => {
    const index = a.foods.findIndex((f) => f.id === selection);
    if (index >= 0) setPage(Math.floor(index / 3));
  }, [selection, a.foods]);
  const pages = Math.ceil(a.foods.length / 3);
  const foods = a.foods.slice(
    Math.min(page, Math.max(0, pages - 1)) * 3,
    Math.min(page, Math.max(0, pages - 1)) * 3 + 3,
  );
  const selected = a.foods.find((f) => f.id === selection);
  return (
    <section className="food-workbench" aria-label="真实送到活动桌的食物">
      <div className="received-foods">
        {foods.map((f) => (
          <button
            type="button"
            key={f.id}
            className={`world-food ${f.tasted ? 'tasted' : ''} ${f.place === 'basket' ? 'packed' : ''}`}
            aria-label={`选择${PRODUCT_NAMES[f.product]}`}
            aria-pressed={selection === f.id}
            onClick={() => select(f.id)}
          >
            <Food product={f.product} />
            <span aria-hidden="true">{f.place === 'basket' ? '▧' : f.tasted ? '♡' : '●'}</span>
          </button>
        ))}
        {!a.foods.length ? <SceneIcon kind="carry" /> : null}
      </div>
      {selected ? (
        <section className="held-portion" aria-label={`当前拿着${PRODUCT_NAMES[selected.product]}`}>
          <Food product={selected.product} />
          <span aria-hidden="true">➜</span>
          <SceneIcon kind="table" />
          <button
            type="button"
            data-world-target="taste"
            aria-label={`品尝${PRODUCT_NAMES[selected.product]}`}
            disabled={selected.tasted || selected.place === 'basket'}
            onClick={() => act({ action: 'taste', item: selected.id })}
          >
            <SceneIcon kind="taste" />
          </button>
          {selected.place.startsWith('table:') ? (
            <button
              type="button"
              aria-label={`拿回${PRODUCT_NAMES[selected.product]}到桌边`}
              onClick={() => act({ action: 'pickup', item: selected.id })}
            >
              <SceneIcon kind="carry" />
            </button>
          ) : null}
        </section>
      ) : null}
      {pages > 1 ? (
        <div className="food-paging">
          <button
            type="button"
            aria-label="前一组食物"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            ◀
          </button>
          <span>
            {page + 1}/{pages}
          </span>
          <button
            type="button"
            aria-label="后一组食物"
            disabled={page >= pages - 1}
            onClick={() => setPage(page + 1)}
          >
            ▶
          </button>
        </div>
      ) : null}
    </section>
  );
}
