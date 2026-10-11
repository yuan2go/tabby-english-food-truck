import { sceneLevel } from '../content/scene-levels';
import { type SceneState, sceneTask } from '../rules/scene-games';
import { ObjectArt, VocabularyVisual } from './VocabularyVisual';

const placeArt: Record<string, string> = {
  on: 'table',
  under: 'table',
  in: 'basket',
  beside: 'plate',
  shelf: 'shelf',
  garden: 'watering-can',
  kitchen: 'pot',
  basket: 'basket',
  board: 'cutting-board',
  sink: 'bowl',
  hand: 'take',
  patio: 'tree',
  guest: 'share',
};
/** A visible demonstration, never a command or a completion. Help is recorded before display. */
export function SceneGuide({ state }: { state: SceneState }) {
  const level = sceneLevel(state.levelId),
    task = sceneTask(state);
  if (!level) return null;
  if (level.kind === 'sort')
    return (
      <div className="scene-guide">
        {task.objects.map((o) => (
          <span className="guide-step" key={o.id}>
            <ObjectArt word={o.word} color={o.color} />
            <b aria-hidden="true">→</b>
            {task.legal?.[o.id]?.map((place) => (
              <ObjectArt
                key={place}
                word={
                  level.id === 'sort-2' && state.round === 0
                    ? 'cup'
                    : level.id === 'sort-2' && state.round === 1
                      ? place === 'garden'
                        ? 'plate'
                        : 'book'
                      : (placeArt[place] ?? 'shelf')
                }
                color={
                  level.id === 'sort-2' && state.round === 0
                    ? place === 'garden'
                      ? 'blue'
                      : 'red'
                    : undefined
                }
              />
            ))}
          </span>
        ))}
      </div>
    );
  if (level.kind === 'hunt')
    return (
      <div className="scene-guide">
        {task.targets?.map((id) => {
          const o = task.objects.find((o) => o.id === id);
          return o ? (
            <span className="guide-step" key={id}>
              <ObjectArt word={o.word} color={o.color} />
              <b aria-hidden="true">→</b>
              <ObjectArt word="basket" />
            </span>
          ) : null;
        })}
      </div>
    );
  if (level.kind === 'design')
    return (
      <div className="scene-guide">
        {task.arrangement?.map((g) => (
          <span className={`guide-placement guide-${g.place}`} key={`${g.word ?? g.id}-${g.place}`}>
            <ObjectArt
              word={g.reference ?? placeArt[g.place] ?? 'table'}
              className="guide-reference"
            />
            <span className="guide-items">
              {['example-one', 'example-two', 'example-three', 'example-four', 'example-five']
                .slice(0, g.count)
                .map((slot) => (
                  <ObjectArt
                    key={slot}
                    word={g.word ?? task.objects.find((o) => o.id === g.id)?.word ?? 'cup'}
                    color={g.color}
                    size={g.size}
                  />
                ))}
            </span>
          </span>
        ))}
      </div>
    );
  if (level.kind === 'theatre') {
    const action =
      task.words.find((w) =>
        ['open', 'close', 'take', 'put', 'pour', 'stir', 'wash', 'cut', 'carry', 'share'].includes(
          w,
        ),
      ) ?? 'take';
    const tool =
      action === 'pour' ? 'jug' : action === 'stir' ? 'spoon' : action === 'cut' ? 'knife' : null;
    const destination =
      action === 'wash'
        ? 'sink'
        : action === 'cut'
          ? 'board'
          : action === 'pour' || action === 'stir'
            ? 'on'
            : task.goal?.place;
    return (
      <div className="scene-guide theatre-guide">
        {destination ? (
          <span className="guide-step">
            <ObjectArt
              word={
                task.goal
                  ? (task.objects.find((o) => o.id === task.goal?.object)?.word ?? 'cup')
                  : 'cup'
              }
            />
            <b aria-hidden="true">→</b>
            {destination === 'hand' ? (
              <VocabularyVisual id="take" />
            ) : destination === 'guest' ? (
              <VocabularyVisual id="share" />
            ) : (
              <ObjectArt word={placeArt[destination] ?? 'table'} />
            )}
          </span>
        ) : null}
        {tool ? (
          <span className="guide-step">
            <VocabularyVisual id="take" />
            <ObjectArt word={tool} />
          </span>
        ) : null}
        <VocabularyVisual id={action} />
        {action === 'share' ? (
          <span className="guide-step">
            <ObjectArt word="apple" state="cut" />
            <ObjectArt word="basket" />
            <ObjectArt word="tree" />
          </span>
        ) : null}
      </div>
    );
  }
  return (
    <div className="scene-guide">
      {task.words.map((id) => (
        <VocabularyVisual key={id} id={id} />
      ))}
    </div>
  );
}
