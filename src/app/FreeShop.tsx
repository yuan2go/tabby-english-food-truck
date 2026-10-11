import { useState } from 'react';
import { REQUESTS, type RequestId } from '../content/catalog';
import type { Support } from '../content/chapters';
import { SHOP_THEMES, type ShopTheme, themeAllows } from '../content/free-shop';
import { teachingFigures } from '../content/teaching';
import type { GameController } from '../platform/controller';
import { Food } from './Food';
import { SupportChoice } from './SupportChoice';
export function FreeShop({
  controller,
  support,
  setSupport,
  concurrency,
  setConcurrency,
  ready,
  home,
  start,
}: {
  controller: GameController;
  support: Support;
  setSupport: (s: Support) => void;
  concurrency: 1 | 2;
  setConcurrency: (n: 1 | 2) => void;
  ready: boolean;
  home: () => void;
  start: (menu: RequestId[], theme: ShopTheme) => void;
}) {
  const known = controller.profile.menu();
  const [menu, setMenu] = useState<RequestId[]>(() =>
    controller.state.session.activity === 'endless'
      ? controller.state.session.menu.filter((r) => known.includes(r))
      : known,
  );
  const [theme, setTheme] = useState<ShopTheme>(controller.state.session.shop?.theme ?? 'all');
  const available = menu.filter((r) => themeAllows(theme, r));
  return (
    <section className="setup-board free-shop" aria-label="自由开店菜单">
      <button type="button" className="corner-back" onClick={home}>
        ← 小院
      </button>
      <h2>今天的小院由你安排</h2>
      <p>选熟悉的食物和主题。旧客人照原来的请求，新朋友再看新菜单。</p>
      <div className="shop-themes">
        {SHOP_THEMES.map((t) => (
          <button
            type="button"
            key={t.id}
            aria-pressed={theme === t.id}
            disabled={!known.some((r) => themeAllows(t.id, r))}
            onClick={() => setTheme(t.id)}
          >
            {t.name}
          </button>
        ))}
      </div>
      <fieldset className="free-shop-menu">
        <legend>今天供应哪些？</legend>
        {known.map((r) => (
          <label key={r}>
            <input
              type="checkbox"
              aria-label={`供应${REQUESTS[r].text}`}
              checked={menu.includes(r)}
              onChange={() =>
                setMenu(menu.includes(r) ? menu.filter((x) => x !== r) : [...menu, r])
              }
            />
            {teachingFigures(REQUESTS[r].products).map(({ product, id }) => (
              <Food key={id} product={product} />
            ))}
          </label>
        ))}
      </fieldset>
      <SupportChoice value={support} change={setSupport} />
      <div className="choice-row">
        <button type="button" aria-pressed={concurrency === 1} onClick={() => setConcurrency(1)}>
          一位一位来
        </button>
        <button type="button" aria-pressed={concurrency === 2} onClick={() => setConcurrency(2)}>
          两位一起招呼
        </button>
      </div>
      <button
        type="button"
        className="primary"
        disabled={!ready || !available.length}
        onClick={() => start(menu, theme)}
      >
        开门 / 继续营业
      </button>
      <p>可随时停止接客，做自己的作品，主动收摊结束今天。</p>
    </section>
  );
}
