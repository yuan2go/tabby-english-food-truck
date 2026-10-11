import { type SceneObject, type ScenePlace, sceneLevel } from '../content/scene-levels';
import { vocabularyWord } from '../content/vocabulary';
import type { SceneCommand, SceneState } from '../rules/scene-games';
import { ObjectArt } from './VocabularyVisual';
export type BoardProps = { state: SceneState; send: (command: SceneCommand) => void };
function Prop({ object, send }: { object: SceneObject; send: BoardProps['send'] }) {
  return (
    <button
      type="button"
      className={`scene-prop prop-${object.id} at-${object.place}`}
      aria-label={`拿起${vocabularyWord(object.word)?.chinese ?? object.word}${object.color ? ` ${vocabularyWord(object.color)?.chinese}` : ''}${object.size ? ` ${vocabularyWord(object.size)?.chinese}` : ''}`}
      onClick={() => send({ type: 'take', object: object.id })}
    >
      <ObjectArt word={object.word} color={object.color} size={object.size} state={object.state} />
    </button>
  );
}
function Place({
  place,
  label,
  art,
  state,
  send,
  color,
}: { place: ScenePlace; label: string; art: string; color?: string | undefined } & BoardProps) {
  const objects = state.objects.filter((o) => o.place === place);
  return (
    <div className={`scene-place place-${place}`}>
      <button
        type="button"
        className="place-target"
        aria-label={`放到${label}`}
        onClick={() => send({ type: 'place', place })}
      >
        <ObjectArt word={art} color={color} />
        <span>{label}</span>
      </button>
      <div className="place-objects">
        {objects.map((o) => (
          <Prop key={o.id} object={o} send={send} />
        ))}
      </div>
    </div>
  );
}
export function Held({ state, send }: BoardProps) {
  const held = state.objects.find((o) => o.place === 'hand');
  return (
    <fieldset className={`scene-hand ${held ? 'holding' : ''}`} aria-label="大咪手里的物件">
      {held ? (
        <ObjectArt word={held.word} color={held.color} size={held.size} state={held.state} />
      ) : (
        <span>先点物件</span>
      )}
      <span aria-hidden="true">→</span>
      <button
        type="button"
        aria-label="放回物件"
        disabled={!held}
        onClick={() => send({ type: 'undo' })}
      >
        放回
      </button>
    </fieldset>
  );
}
export function HuntBoard(p: BoardProps) {
  return (
    <div className="hunt-board">
      <div className="hunt-zones">
        {(['garden', 'shelf'] as const).map((place) => (
          <div className={`hunt-zone hunt-${place}`} key={place}>
            <ObjectArt word={place === 'garden' ? 'tree' : 'shelf'} />
            <div className="hunt-objects">
              {p.state.objects
                .filter((o) => o.place === place || (place === 'garden' && o.place === 'bank'))
                .map((o) => (
                  <Prop key={o.id} object={o} send={p.send} />
                ))}
            </div>
          </div>
        ))}
      </div>
      <Held {...p} />
      <button
        type="button"
        className="delivery-basket"
        aria-label="交付找到的物件"
        onClick={() => p.send({ type: 'deliver' })}
      >
        <ObjectArt word="basket" />
        <span>交给篮子</span>
        <span className="delivered-items">
          {p.state.objects
            .filter((o) => o.place === 'basket')
            .map((o) => (
              <ObjectArt key={o.id} word={o.word} color={o.color} />
            ))}
        </span>
      </button>
    </div>
  );
}
export function MemoryBoard(p: BoardProps) {
  return (
    <div
      className={`memory-board ${p.state.phase === 'observe' ? 'observing' : p.state.phase === 'covered' ? 'cloth-covered' : 'remembering'}`}
    >
      <div className="memory-table">
        <ObjectArt word="table" />
        {p.state.objects
          .filter((o) => o.place === 'table')
          .map((o) => (
            <Prop
              key={o.id}
              object={o}
              send={['covered', 'observe'].includes(p.state.phase) ? () => {} : p.send}
            />
          ))}
      </div>
      {p.state.phase === 'covered' ? (
        <button type="button" className="primary" onClick={() => p.send({ type: 'reveal' })}>
          揭开餐桌看看
        </button>
      ) : p.state.phase === 'observe' ? (
        <button type="button" className="primary" onClick={() => p.send({ type: 'cover' })}>
          看好了，盖上再找
        </button>
      ) : (
        <>
          <div className="scene-bank">
            {p.state.objects
              .filter((o) => o.place === 'bank')
              .map((o) => (
                <Prop key={o.id} object={o} send={p.send} />
              ))}
          </div>
          <Held {...p} />
          <button
            type="button"
            className="memory-return"
            aria-label="补回餐桌"
            onClick={() => p.send({ type: 'place', place: 'table' })}
          >
            <ObjectArt word="plate" />
            补回桌上
          </button>
          <button type="button" onClick={() => p.send({ type: 'reobserve' })}>
            再看一眼
          </button>
        </>
      )}
    </div>
  );
}
export function SortBoard(p: BoardProps) {
  const level = sceneLevel(p.state.levelId);
  const attribute = level?.id === 'sort-2' && p.state.round < 2;
  return (
    <div className="sort-board">
      <div className="scene-bank">
        {p.state.objects
          .filter((o) => o.place === 'bank')
          .map((o) => (
            <Prop key={o.id} object={o} send={p.send} />
          ))}
      </div>
      <Held {...p} />
      <div className="sorting-places">
        {!attribute || p.state.round === 1 ? (
          <Place
            place="shelf"
            art={attribute ? 'book' : 'shelf'}
            label={attribute ? '其他形状' : '木架'}
            {...p}
          />
        ) : null}
        <Place
          place="garden"
          art={attribute ? (p.state.round === 0 ? 'cup' : 'plate') : 'watering-can'}
          color={attribute && p.state.round === 0 ? 'blue' : undefined}
          label={attribute ? (p.state.round === 0 ? '蓝色一组' : '圆形一组') : '花园'}
          {...p}
        />
        {!attribute || p.state.round === 0 ? (
          <Place
            place="kitchen"
            art={attribute ? 'cup' : 'pot'}
            color={attribute ? 'red' : undefined}
            label={attribute ? '其他颜色' : '厨房'}
            {...p}
          />
        ) : null}
        {level?.id === 'sort-0' ? (
          <Place place="basket" art="basket" label="食物篮" {...p} />
        ) : null}
      </div>
    </div>
  );
}
export function DesignerBoard(p: BoardProps) {
  const reference = sceneLevel(p.state.levelId)?.tasks[p.state.round]?.arrangement?.find(
    (g) => g.reference,
  )?.reference;
  return (
    <div className="designer-board">
      <div className="scene-bank">
        {p.state.objects
          .filter((o) => o.place === 'bank')
          .map((o) => (
            <Prop key={o.id} object={o} send={p.send} />
          ))}
      </div>
      <Held {...p} />
      <div className={`design-table ${reference ? 'has-reference' : ''}`}>
        <ObjectArt word="table" />
        <Place place="on" label="桌上" art="plate" {...p} />
        <Place place="under" label="桌下" art="ball" {...p} />
        <Place place="in" label="篮内" art="basket" {...p} />
        <Place
          place="beside"
          label={reference ? '盘子旁边' : '桌边'}
          art={reference ? 'plate' : 'chair'}
          {...p}
        />
      </div>
    </div>
  );
}
const actionLabels: Record<string, string> = {
  open: '打开',
  close: '关上',
  pour: '倒水',
  stir: '搅拌',
  wash: '清洗',
  cut: '切分',
  carry: '搬到院里',
  share: '分享给朋友',
};
export function TheatreBoard(p: BoardProps) {
  const level = sceneLevel(p.state.levelId),
    variant = level?.id;
  const controls =
    variant === 'theatre-0'
      ? [
          ['open', 'box'],
          ['close', 'box'],
        ]
      : variant === 'theatre-1'
        ? [
            ['pour', 'cup'],
            ['stir', 'cup'],
            ['wash', 'bowl'],
          ]
        : [
            ['cut', 'apple'],
            ['carry', 'basket'],
            ['share', 'apple'],
          ];
  return (
    <div className="theatre-board">
      <div className="theatre-world">
        {p.state.objects
          .filter(
            (o) =>
              ![
                'hand',
                'on',
                variant === 'theatre-0' ? 'in' : variant === 'theatre-1' ? 'sink' : 'board',
              ].includes(o.place),
          )
          .map((o) => (
            <div key={o.id} className={`theatre-object location-${o.place}`}>
              <Prop object={o} send={p.send} />
              <small>
                {o.place === 'guest'
                  ? '朋友收到了'
                  : o.state === 'filled'
                    ? '杯里有水'
                    : o.state === 'stirred'
                      ? '水已搅拌'
                      : o.state === 'cut'
                        ? '苹果切好了'
                        : o.state === 'clean'
                          ? '碗洗干净了'
                          : o.state === 'open'
                            ? '打开了'
                            : o.state === 'closed'
                              ? '关着'
                              : o.place === 'box'
                                ? '在盒子里'
                                : o.place === 'board'
                                  ? '在砧板'
                                  : o.place === 'sink'
                                    ? '在水槽'
                                    : ''}
              </small>
            </div>
          ))}
      </div>
      <Held {...p} />
      <div className="theatre-places">
        <Place place="on" label="桌上" art="table" {...p} />
        {variant === 'theatre-0' ? (
          <Place place="in" label="篮内" art="basket" {...p} />
        ) : variant === 'theatre-1' ? (
          <Place place="sink" label="水槽" art="bowl" {...p} />
        ) : (
          <Place place="board" label="砧板" art="cutting-board" {...p} />
        )}
      </div>
      <div className="theatre-controls">
        {controls.map(([action, object]) => (
          <button
            type="button"
            key={`${action}-${object}`}
            aria-label={`${actionLabels[action ?? '']}${vocabularyWord(object ?? '')?.chinese ?? ''}`}
            onClick={() => p.send({ type: 'operate', action: action ?? '', object: object ?? '' })}
          >
            <ObjectArt word={object ?? ''} />
            <span>{actionLabels[action ?? '']}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
