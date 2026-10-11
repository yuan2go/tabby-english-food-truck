import type { AdventureState } from '../content/adventure';
import { drawerTools, type Tool } from '../content/adventure-experience';
import { Food } from './Food';
import { SceneIcon } from './SceneIcon';

const names: Record<Tool, string> = {
  seed: '花苗',
  'watering-can': '浇水壶',
  mat: '餐垫',
  lantern: '灯串',
  spoon: '小勺',
};
export function ToolShelf({ a, take }: { a: AdventureState; take: (tool: Tool) => void }) {
  const available = drawerTools(a);
  if (!available.length) return null;
  return (
    <section className="tool-shelf" aria-label="抽屉里的可用物件">
      {available.map((tool) => (
        <button
          type="button"
          key={tool}
          data-world-target={tool}
          aria-label={`取出${names[tool]}`}
          aria-pressed={a.experience?.tools.includes(tool)}
          onClick={() => take(tool)}
        >
          <SceneIcon kind={tool} />
          <small>{a.experience?.tools.includes(tool) ? '已取出' : names[tool]}</small>
        </button>
      ))}
    </section>
  );
}
export function PicnicBasket({ a }: { a: AdventureState }) {
  if (a.chapter !== 2 || a.branch !== 'rabbit' || !a.explored.includes('basket')) return null;
  const packed = a.foods.filter((f) => f.place === 'basket');
  const groups = [
    ['sandwich', 'salad-sandwich'],
    ['apple', 'banana'],
  ];
  return (
    <section className="basket-contents" aria-label="篮子实际内容与缺项">
      {groups.map((group, i) => {
        const food = packed.find((f) => group.includes(f.product));
        return (
          <div
            role="img"
            className={`basket-slot ${food ? 'filled' : 'missing-slot'}`}
            key={group[0]}
            aria-label={
              food
                ? `篮内实际食品${i + 1}`
                : a.steps.includes('unpack')
                  ? '已经搬到桌边'
                  : i === 0
                    ? '缺一份三明治'
                    : '缺一份水果'
            }
          >
            {food ? (
              <Food product={food.product} />
            ) : a.steps.includes('unpack') ? (
              <SceneIcon kind="table" />
            ) : (
              <>
                <Food product={i === 0 ? 'sandwich' : 'apple'} />
                <span aria-hidden="true">＋</span>
              </>
            )}
          </div>
        );
      })}
      <SceneIcon kind="basket" />
    </section>
  );
}
