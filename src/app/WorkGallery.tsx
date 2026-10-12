import { VISITOR_NAMES, type Work } from '../content/adventure';
import { madeLine, workCaption } from '../content/dialogue';
import type { ForegroundAudio } from '../platform/audio';
import type { DialogueDirector } from '../platform/dialogue';
import { Sentence } from './Dialogue';
import { Food } from './Food';
import { SceneIcon } from './SceneIcon';

/** Saved pages are read-only memories. Revisiting never creates a second inventory. */
export function WorkGallery({
  works,
  title,
  revise,
  audio,
  dialogue,
}: {
  works: readonly Work[];
  title: string;
  revise: () => void;
  audio: ForegroundAudio;
  dialogue: DialogueDirector;
}) {
  return (
    <section className="work-gallery" aria-label={title}>
      <h3>{title}</h3>
      {works.map((work) => (
        <article className="work-memory" key={work.id} aria-label="保存的实际摆盘与品尝">
          <p className="work-description" lang="en">
            {workCaption(work.foods.map((food) => food.product))}
          </p>
          <div className="remembered-table">
            {([0, 1, 2] as const).map((seat) => (
              <div className="remembered-seat" key={seat}>
                <span>
                  {VISITOR_NAMES[seat === 0 ? 'rabbit' : seat === 1 ? 'hedgehog' : 'elder']}
                </span>
                {work.foods
                  .filter((f) => f.place === `table:${seat}`)
                  .map((food) => (
                    <Food key={food.id} product={food.product} />
                  ))}
              </div>
            ))}
          </div>
          <section className="remembered-side" aria-label="当时放在桌边或朋友手里的食品">
            {work.foods
              .filter((f) => !f.place.startsWith('table:'))
              .map((food) => (
                <Food key={food.id} product={food.product} />
              ))}
          </section>
          <section className="remembered-tastes" aria-label="当时实际品尝的食品与朋友">
            {work.foods
              .filter((f) => f.tasted)
              .map((food) => (
                <span key={food.id}>
                  <Food product={food.product} />
                  <SceneIcon kind="taste" />
                  {food.tastedBy ? <span>{VISITOR_NAMES[food.tastedBy]}</span> : null}
                </span>
              ))}
          </section>
          {[...new Set(work.foods.map((food) => food.product))].map((product) => {
            const line = madeLine(product);
            return line ? (
              <Sentence
                key={product}
                line={line}
                audio={audio}
                play={() => dialogue.show({ key: `${work.id}:${product}`, line })}
              />
            ) : null;
          })}
          <button type="button" aria-label="重新制作并修改这个作品" onClick={revise}>
            <SceneIcon kind="kitchen" />
            <span aria-hidden="true">↻</span>
            <SceneIcon kind="carry" />
          </button>
        </article>
      ))}
      {!works.length ? (
        <div className="work-empty">
          <SceneIcon kind="kitchen" />
          <span aria-hidden="true">➜</span>
          <SceneIcon kind="recipe" />
        </div>
      ) : null}
    </section>
  );
}
