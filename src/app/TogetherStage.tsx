import {
  type CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { ADVENTURES, VISITOR_NAMES, type Visitor } from '../content/adventure';
import { drawerTools, type Tool } from '../content/adventure-experience';
import { PRODUCT_NAMES, REQUESTS } from '../content/catalog';
import { type DialogueLine, type LineId, lineFor } from '../content/dialogue';
import { type Product, RECIPES, type StationId } from '../content/recipes';
import { type StageRect, togetherDamiRect, togetherLayout } from '../game/together-layout';
import type { ForegroundAudio } from '../platform/audio';
import type { GameController } from '../platform/controller';
import type { DialogueDirector } from '../platform/dialogue';
import { adventureReady, openCommission } from '../rules/adventure';
import { handItems } from '../rules/game';
import type { Command } from '../rules/types';
import { Sentence } from './Dialogue';
import { useDialogFocus } from './dialog-focus';
import { Food } from './Food';
import { SceneIcon } from './SceneIcon';
import { RequestPicture, StageDemonstration } from './TogetherHelp';
import { TogetherKitchen } from './TogetherKitchen';
import { WorkGallery } from './WorkGallery';
import './together.css';

const position = (r: StageRect): CSSProperties => ({
  left: r.x,
  top: r.y,
  width: r.width,
  height: r.height,
});
const toolNames: Record<Tool, string> = {
  seed: '花苗',
  'watering-can': '浇水壶',
  mat: '餐垫',
  lantern: '灯串',
  spoon: '小勺',
};
type Target =
  | { kind: 'friend'; visitor: Visitor; seat: 0 | 1 | 2 }
  | { kind: 'machine'; port: 'apple' | 'cup' }
  | { kind: 'station'; station: StationId }
  | { kind: 'preparation' }
  | { kind: 'world' }
  | { kind: 'basket' }
  | { kind: 'food'; id: string }
  | { kind: 'decor' }
  | { kind: 'garden'; seat: 0 | 1 | 2 };
type Gesture = { id: number; x: number; y: number; source: string; dragged: boolean };

export function TogetherStage({
  controller,
  audio,
  dialogue,
  pause,
  home,
  next,
  replay,
  games,
  demoOrder,
  closeDemo,
}: {
  controller: GameController;
  audio: ForegroundAudio;
  dialogue: DialogueDirector;
  pause: () => void;
  home: () => void;
  next: () => void;
  replay: () => void;
  games: () => void;
  demoOrder: string | null;
  closeDemo: () => void;
}) {
  const s = controller.state,
    a = s.adventure;
  const showDemoDevice = useCallback(() => {}, []);
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [book, setBook] = useState(false),
    [confirm, setConfirm] = useState(false);
  const [focusedSpeaker, setFocusedSpeaker] = useState<Visitor | null>(null);
  const [feedback, setFeedback] = useState('点朋友听需要，拿起食品，再点目标。');
  const say = (message: string) => {
    controller.message = message;
    setFeedback(message);
  };
  const [ghost, setGhost] = useState<{ x: number; y: number; product: Product } | null>(null);
  const [momentAge, setMomentAge] = useState(0);
  const root = useRef<HTMLElement>(null),
    gesture = useRef<Gesture | null>(null),
    suppress = useRef(0);
  const held = handItems(s),
    worldHand = a?.foods.find((f) => f.place === 'hand'),
    tool = a?.experience?.heldTool,
    decoration = a?.experience?.heldDecoration;
  const count = a?.chapter === 4 || a?.invitations.includes('elder') ? 3 : 2;
  const l = togetherLayout(size.width, size.height, count);
  const moment = a?.experience?.moments.at(-1);
  useEffect(() => {
    for (const order of s.orders.filter(
      (o) => o.status === 'waiting' && !o.support.includes('caption-visible'),
    ))
      controller.command({ type: 'support', order: order.id, reason: 'caption-visible' });
  }, [s.orders, controller]);
  useDialogFocus(
    book ? 'together-book' : confirm ? 'together-confirm' : demoOrder ? 'stage-demo' : null,
  );
  useEffect(() => {
    controller.pause('together-dialog', confirm);
    if (book || confirm) audio.stop();
    return () => controller.pause('together-dialog', false);
  }, [controller, audio, book, confirm]);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const measure = () => {
      gesture.current = null;
      setGhost(null);
      setSize({ width: element.clientWidth, height: element.clientHeight });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (moment?.kind === 'place' && moment.destination === 'work' && moment.visitor) {
      controller.message = '这份分享留在作品区。朋友的餐位有变化，食品保留，可以再拿起分享。';
      setFeedback(controller.message);
    }
  }, [moment, controller]);
  useEffect(() => {
    if (!moment) {
      setMomentAge(0);
      return;
    }
    let elapsed = 0,
      previous = performance.now();
    setMomentAge(0);
    const timer = setInterval(() => {
      const now = performance.now();
      if (!document.hidden && !controller.pauses.size) elapsed += Math.min(250, now - previous);
      previous = now;
      setMomentAge(elapsed);
      if (elapsed >= Math.max(1, moment.foods.length) * 3500) clearInterval(timer);
    }, 120);
    return () => clearInterval(timer);
  }, [moment, controller]);
  useEffect(() => {
    const cancel = () => {
      gesture.current = null;
      setGhost(null);
    };
    window.addEventListener('blur', cancel);
    document.addEventListener('visibilitychange', cancel);
    return () => {
      window.removeEventListener('blur', cancel);
      document.removeEventListener('visibilitychange', cancel);
    };
  }, []);
  const run = (command: Command) => {
    const r = controller.command(command);
    say(r.message);
    if (r.kind === 'confirm') setConfirm(true);
    if (r.kind === 'ok') audio.effect('place');
    else if (r.kind === 'mismatch') audio.effect('gentle');
    return r;
  };
  const act = (
    action: string,
    extra: Omit<Extract<Command, { type: 'adventure' }>, 'type' | 'action'> = {},
  ) => run({ type: 'adventure', action, ...extra });
  const commission = a ? openCommission(a) : null;
  const narrowPortrait = size.width < 600 && size.height >= size.width;
  const currentRole = dialogue.current?.line.role;
  const visibleSpeaker =
    currentRole === 'rabbit' || currentRole === 'hedgehog' || currentRole === 'elder'
      ? currentRole
      : (focusedSpeaker ??
        s.orders.find((o) => o.status === 'waiting')?.visitor ??
        (commission?.action === 'cool' ? 'hedgehog' : 'rabbit'));
  const focusedIndex = visibleSpeaker === 'rabbit' ? 0 : visibleSpeaker === 'hedgehog' ? 1 : 2;
  const commissionLine = (visitor: Visitor): DialogueLine | null =>
    commission &&
    ((commission.action === 'cool' && visitor === 'hedgehog') ||
      (commission.action === 'pack' && visitor === 'rabbit'))
      ? { ...lineFor(commission.action === 'cool' ? 'open-cool' : 'open-pack'), role: visitor }
      : null;
  const orderFor = (v: Visitor, seat: number) =>
    controller.state.orders.find(
      (o) => o.status !== 'done' && (o.visitor === v || (!o.visitor && o.seat === seat)),
    );
  const take = (source: string) => {
    if (source.startsWith('stock:'))
      return run({ type: 'pickup', source: { supply: source.slice(6) as Product } });
    if (source.startsWith('item:'))
      return run({ type: 'pickup', source: { item: source.slice(5) } });
    if (source.startsWith('world:')) return act('pickup', { item: source.slice(6) });
    return act('take-tool', { object: source.slice(5) });
  };
  const use = (target: Target) => {
    const s = controller.state,
      a = s.adventure,
      held = handItems(s),
      worldHand = a?.foods.find((f) => f.place === 'hand'),
      tool = a?.experience?.heldTool,
      decoration = a?.experience?.heldDecoration;
    if (target.kind === 'food') {
      if (held.length) {
        const food = a?.foods.find((f) => f.id === target.id),
          v =
            food?.place === 'guest-rabbit' || food?.place === 'table:0'
              ? 'rabbit'
              : food?.place === 'guest-hedgehog' || food?.place === 'table:1'
                ? 'hedgehog'
                : food?.place === 'guest-elder' || food?.place === 'table:2'
                  ? 'elder'
                  : null;
        if (v) {
          use({ kind: 'friend', visitor: v, seat: v === 'rabbit' ? 0 : v === 'hedgehog' ? 1 : 2 });
        } else say('这是活动食品，制作中的食品仍在手里。');
        return;
      }
      if (tool === 'spoon') {
        const r = act('taste', { item: target.id });
        if (r.kind === 'ok') act('put-tool');
      } else take(`world:${target.id}`);
      return;
    }
    if (decoration) {
      if (target.kind === 'decor' || target.kind === 'preparation') act('put-decoration');
      else say('装饰仍在手里，点桌面或挂绳。');
      return;
    }
    if (target.kind === 'friend' && tool && tool !== 'lantern' && tool !== 'spoon') {
      say('工具仍在手里，点对应的场景物件或放回。');
      return;
    }
    if (target.kind === 'friend') {
      setFocusedSpeaker(target.visitor);
      const order = orderFor(target.visitor, target.seat);
      if (tool === 'lantern') {
        act('cooperate', { visitor: target.visitor, object: 'lantern' });
        return;
      }
      if (tool === 'spoon') {
        const food = a?.foods.find(
          (f) =>
            f.recipient === target.visitor ||
            f.place === `guest-${target.visitor}` ||
            f.place === `table:${target.seat}`,
        );
        if (food) {
          const r = act('taste', { item: food.id, visitor: target.visitor });
          if (r.kind === 'ok') act('put-tool');
        }
        return;
      }
      if (worldHand) {
        act(a?.experience?.needs.some((n) => n.visitor === target.visitor) ? 'share' : 'place', {
          item: worldHand.id,
          visitor: target.visitor,
          seat: target.seat,
        });
        return;
      }
      if (held.length) {
        if (order?.status === 'waiting') run({ type: 'put', target: { order: order.id } });
        else if (a?.chapter === 1 && target.visitor === 'hedgehog')
          run({ type: 'put', target: { world: 'cool' } });
        else if (
          a &&
          (a.chapter === 4 || a.kind === 'shop' || a.rewards.length) &&
          a.invitations.includes(target.visitor)
        ) {
          const tray = ([0, 1] as const).find((t) => !s.trays[t].remaining);
          if (tray !== undefined) act('create', { tray, fromHand: true, visitor: target.visitor });
        } else say('先与这位朋友打招呼，食品仍在手里。');
        return;
      }
      if (order?.status === 'queued') {
        const r = act('welcome', { visitor: target.visitor });
        if (r.kind !== 'ok') return;
        const welcomed = controller.state.orders.find((o) => o.id === order.id);
        if (welcomed) {
          controller.command({ type: 'support', order: welcomed.id, reason: 'caption-visible' });
          dialogue.request(welcomed);
        }
      } else if (order?.status === 'waiting') dialogue.request(order);
      else if (
        a &&
        (a.chapter === 4 || a.kind === 'shop' || a.rewards.length) &&
        !a.invitations.includes(target.visitor)
      ) {
        const r = act('invite', { visitor: target.visitor });
        if (r.kind === 'ok') dialogue.invite(target.visitor);
      } else if (commissionLine(target.visitor)) {
        const line = commissionLine(target.visitor);
        if (line) dialogue.show({ key: `${s.runId}:commission:${target.visitor}`, line });
      } else if (
        a?.experience?.needs.some((n) => n.visitor === target.visitor && !n.fulfilled.length)
      ) {
        const need = a.experience.needs.find((n) => n.visitor === target.visitor);
        if (need)
          dialogue.show(
            {
              key: `${s.runId}:need:${target.visitor}`,
              line: { ...lineFor(`sharing-${need.kind}` as LineId), role: target.visitor },
            },
            true,
          );
      } else if (
        a?.steps.includes(`served:${target.visitor}`) ||
        a?.foods.some(
          (f) =>
            f.recipient === target.visitor ||
            f.place === `guest-${target.visitor}` ||
            f.place === `table:${target.seat}`,
        )
      )
        dialogue.show(
          {
            key: `${s.runId}:thanks:${target.visitor}`,
            line: { ...lineFor('thanks'), role: target.visitor },
          },
          true,
        );
      return;
    }
    if (target.kind === 'decor') {
      say('先拿起桌布、彩旗或灯光，再点这里。');
      return;
    }
    if (target.kind === 'garden') {
      if (tool === 'seed') act('plant', { seat: target.seat });
      else if (tool === 'watering-can') act('water');
      else say('可以从抽屉拿花苗或水壶，早餐后慢慢探索。');
      return;
    }
    if (tool) {
      if (target.kind === 'world' || target.kind === 'preparation') act('put-tool', { seat: 0 });
      else say('工具仍在手里，点它对应的场景物件。');
      return;
    }
    if (worldHand) {
      if (target.kind === 'world') act('put-world');
      else say('这份已接收的食品留在活动桌，可摆放、分享或品尝。');
      return;
    }
    if (target.kind === 'machine') {
      run({ type: 'put', target: { machine: target.port } });
      return;
    }
    if (target.kind === 'station') {
      run({ type: 'put', target: { station: target.station } });
      return;
    }
    if (target.kind === 'preparation') {
      run({ type: 'put', target: { preparation: true } });
      return;
    }
    if (target.kind === 'basket') {
      run({ type: 'put', target: { world: 'pack' } });
      return;
    }
    if (target.kind === 'world')
      run({
        type: 'put',
        target: { world: 'create' },
      });
  };
  const drop = (target: Target) => ({
    'data-put-target': JSON.stringify(target),
    className: 'stage-drop',
  });
  const isCarrying = held.length > 0 || Boolean(worldHand) || Boolean(tool) || Boolean(decoration);
  const sourceButton = (item: { id: string; product: Product }, world = false) => {
    if (world)
      return (
        <span className="world-food" key={item.id}>
          <button
            type="button"
            className="loose-food"
            aria-label={`${held.length ? '交到餐位：' : '品尝'}${PRODUCT_NAMES[item.product]}`}
            data-put-target={JSON.stringify({ kind: 'food', id: item.id })}
            onClick={() =>
              held.length ? use({ kind: 'food', id: item.id }) : act('taste', { item: item.id })
            }
          >
            <Food product={item.product} />
          </button>
          {!held.length ? (
            <button
              type="button"
              className="move-portion"
              data-grab={`world:${item.id}`}
              data-hotspot={`item-${item.id}`}
              aria-label={`拿起${PRODUCT_NAMES[item.product]}（活动）`}
              onClick={() => take(`world:${item.id}`)}
            >
              ↥
            </button>
          ) : null}
        </span>
      );
    return (
      <button
        type="button"
        key={item.id}
        className="loose-food"
        style={
          !world &&
          held.length &&
          s.items.some(
            (i) =>
              i.id === item.id &&
              (i.location.startsWith('station:') || i.location.startsWith('machine:')),
          )
            ? { pointerEvents: 'none' }
            : undefined
        }
        data-grab={`${world ? 'world' : 'item'}:${item.id}`}
        data-hotspot={`item-${item.id}`}
        data-put-target={world ? JSON.stringify({ kind: 'food', id: item.id }) : undefined}
        aria-label={`${world ? '品尝' : '拿起'}${PRODUCT_NAMES[item.product]}`}
        onClick={() => (world ? act('taste', { item: item.id }) : take(`item:${item.id}`))}
      >
        <Food product={item.product} />
      </button>
    );
  };
  const delivered =
    s.actor.current?.kind === 'delivery'
      ? s.items.filter((i) => s.actor.current?.itemIds.includes(i.id))
      : [];
  const cat = togetherDamiRect(s, l);
  const title =
    a?.kind === 'shop'
      ? '自由厨房'
      : (ADVENTURES[a?.chapter ?? s.session.chapter]?.title ?? '玩具厨房');
  const phase = Math.min(4, Math.floor(momentAge / 700));
  return (
    <section
      ref={root}
      className={`together-stage ${l.short ? 'short-stage' : ''}`}
      aria-label="同桌厨房"
      onClickCapture={(e) => {
        if (performance.now() < suppress.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onPointerDown={(e) => {
        if (!e.isPrimary) {
          gesture.current = null;
          setGhost(null);
          return;
        }
        const button = (e.target as HTMLElement).closest<HTMLElement>('[data-grab]');
        if (button?.dataset.grab)
          gesture.current = {
            id: e.pointerId,
            x: e.clientX,
            y: e.clientY,
            source: button.dataset.grab,
            dragged: false,
          };
      }}
      onPointerMove={(e) => {
        const g = gesture.current;
        if (!g || g.id !== e.pointerId) return;
        if (Math.hypot(e.clientX - g.x, e.clientY - g.y) < 8 && !g.dragged) return;
        g.dragged = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        const id = g.source.split(':').slice(1).join(':');
        const product = g.source.startsWith('stock:')
          ? (id as Product)
          : (s.items.find((i) => i.id === id)?.product ??
            a?.foods.find((f) => f.id === id)?.product);
        const box = e.currentTarget.getBoundingClientRect();
        if (product) setGhost({ x: e.clientX - box.left, y: e.clientY - box.top, product });
      }}
      onPointerCancel={() => {
        gesture.current = null;
        setGhost(null);
      }}
      onLostPointerCapture={() => {
        gesture.current = null;
        setGhost(null);
      }}
      onPointerUp={(e) => {
        const g = gesture.current;
        gesture.current = null;
        setGhost(null);
        if (!g?.dragged) return;
        suppress.current = performance.now() + 250;
        const candidates = [...e.currentTarget.querySelectorAll<HTMLElement>('[data-put-target]')]
          .filter((el) => el.getClientRects().length && !el.closest('[inert]'))
          .map((el) => {
            const r = el.getBoundingClientRect();
            return {
              el,
              distance: Math.hypot(
                Math.max(r.left - e.clientX, 0, e.clientX - r.right),
                Math.max(r.top - e.clientY, 0, e.clientY - r.bottom),
              ),
            };
          })
          .filter((c) => c.distance <= 24)
          .sort((a, b) => a.distance - b.distance);
        const selected = candidates[0];
        if (!selected) return;
        const id = g.source.slice(5),
          existing = s.items.find((i) => i.id === id);
        if (!existing?.location.startsWith('hand:')) {
          const r = take(g.source);
          if (r.kind !== 'ok' && r.kind !== 'duplicate') return;
        }
        // The next render owns the changed hand; dispatch targets against fresh state.
        const target = JSON.parse(selected.el.dataset.putTarget ?? 'null') as Target | null;
        if (target) use(target);
      }}
    >
      <div className="together-content">
        <header>
          <span>{title}</span>
          <button type="button" style={position(l.pause)} aria-label="暂停" onClick={pause}>
            Ⅱ
          </button>
        </header>
        <section
          className={`together-friends stage-${phase}`}
          aria-label="朋友实际使用食品"
          data-moment={moment?.id}
        >
          {l.guests.map((rect, index) => {
            const visitor: Visitor = index === 0 ? 'rabbit' : index === 1 ? 'hedgehog' : 'elder';
            const order = orderFor(visitor, index),
              name = VISITOR_NAMES[visitor];
            const sharing = a?.experience?.needs.find((n) => n.visitor === visitor);
            const need = sharing?.fulfilled.length ? null : sharing;
            const current = dialogue.current;
            const line: DialogueLine | null =
              order?.status === 'waiting'
                ? { ...REQUESTS[order.request], role: visitor, trigger: 'order' }
                : commissionLine(visitor)
                  ? commissionLine(visitor)
                  : sharing?.fulfilled.length
                    ? { ...lineFor('thanks'), role: visitor }
                    : current?.line.role === visitor
                      ? current.line
                      : need
                        ? { ...lineFor(`sharing-${need.kind}` as LineId), role: visitor }
                        : commissionLine(visitor);
            const listen = () => {
              setFocusedSpeaker(visitor);
              if (order?.status === 'waiting') dialogue.request(order);
              else if (line) dialogue.show({ key: `${s.runId}:need:${visitor}`, line }, true);
            };
            const target: Target = { kind: 'friend', visitor, seat: index as 0 | 1 | 2 };
            const label = isCarrying
              ? `交给${name}`
              : order?.status === 'queued'
                ? `先帮${name}`
                : order?.status === 'waiting'
                  ? `听${name}的请求`
                  : a &&
                      (a.chapter === 4 || a.kind === 'shop' || a.rewards.length) &&
                      !a.invitations.includes(visitor)
                    ? `邀请${name}`
                    : `和${name}说话`;
            const foods =
              a?.foods.filter(
                (f) => f.place === `guest-${visitor}` || f.place === `table:${index}`,
              ) ?? [];
            return (
              <div key={visitor}>
                {line ? (
                  <div
                    className={`local-bubble${narrowPortrait && (index !== focusedIndex || currentRole === 'dami') ? ' speaker-mini' : ''}`}
                    style={
                      narrowPortrait
                        ? {
                            ...position(l.bubbles[index] ?? rect),
                            left:
                              index === focusedIndex && currentRole !== 'dami'
                                ? 10 + focusedIndex * 58
                                : index < focusedIndex
                                  ? 10 + index * 58
                                  : size.width - 10 - (count - index) * 58,
                            width:
                              index === focusedIndex && currentRole !== 'dami'
                                ? size.width - 20 - (count - 1) * 58
                                : 48,
                            height: index === focusedIndex && currentRole !== 'dami' ? 74 : 48,
                          }
                        : position(l.bubbles[index] ?? rect)
                    }
                  >
                    {narrowPortrait && (index !== focusedIndex || currentRole === 'dami') ? (
                      <button
                        type="button"
                        className="speaker-replay"
                        aria-label={`重听${name}：${line.text}`}
                        onClick={listen}
                      >
                        ↻
                      </button>
                    ) : (
                      <Sentence line={line} audio={audio} play={listen} />
                    )}
                  </div>
                ) : null}
                {order?.status === 'waiting' ? (
                  <RequestPicture
                    controller={controller}
                    order={order}
                    audio={audio}
                    style={{
                      left: Math.min(size.width - 58, rect.x + rect.width - 15),
                      top: rect.y + rect.height * 0.43,
                    }}
                  />
                ) : null}
                <button
                  type="button"
                  {...drop(target)}
                  className="friend-hotspot stage-drop"
                  style={position(rect)}
                  aria-label={label}
                  data-actor={visitor}
                  data-waiting={!isCarrying && order?.status === 'queued'}
                  onClick={() => use(target)}
                >
                  <span className="sr-only">{name}</span>
                </button>
                <button
                  type="button"
                  {...drop(target)}
                  className="meal-seat stage-drop"
                  style={position(l.seats[index] ?? rect)}
                  aria-label={isCarrying ? `交给${name}的餐盘` : `${name}的接餐盘`}
                  onClick={() => use(target)}
                >
                  <span className="sr-only">{name}面前的接餐盘</span>
                </button>
                <div className="actual-meal" style={position(l.seats[index] ?? rect)}>
                  {foods.map((f) => sourceButton(f, true))}
                  {foods.some((f) => f.tasted) ? (
                    <span role="img" className="flavor-note" aria-label={`${name}已经品尝`}>
                      ♡
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </section>
        <div
          className="scene-objects"
          style={{ left: l.table.x + 4, top: l.table.y + l.table.height + 4 }}
        >
          {a && (a.chapter === 0 || (a.chapter === 2 && a.branch === 'hedgehog')) ? (
            <button
              type="button"
              aria-label="打开储物抽屉"
              onClick={() => act('explore', { object: 'drawer' })}
            >
              <SceneIcon kind="drawer" />
            </button>
          ) : null}
          {a?.foods.some((f) => f.source.startsWith('create:')) ? (
            <button type="button" aria-label="保存到食谱" onClick={() => act('save-work')}>
              <SceneIcon kind="recipe" />
            </button>
          ) : null}
          <button type="button" aria-label="翻开旧食谱" onClick={() => setBook(true)}>
            <SceneIcon kind="recipe" />
          </button>
          {a?.chapter === 1 && a.steps.includes('cool') ? (
            <button type="button" aria-label="比较两份甜点" onClick={() => act('compare')}>
              <SceneIcon kind="compare" />
            </button>
          ) : null}
          {a?.chapter === 2 && a.branch === 'rabbit' && !a.rewards.length ? (
            <button
              type="button"
              {...drop({ kind: 'basket' })}
              aria-label={
                !a.explored.includes('basket')
                  ? '检查野餐篮'
                  : a.steps.includes('pack') && !a.steps.includes('unpack')
                    ? '把篮子摆上桌'
                    : '把食品放进野餐篮'
              }
              onClick={() =>
                !a.explored.includes('basket')
                  ? act('explore', { object: 'basket' })
                  : a.steps.includes('pack') && !a.steps.includes('unpack')
                    ? act('unpack')
                    : use({ kind: 'basket' })
              }
            >
              <SceneIcon kind="basket" />
              {a.foods
                .filter((f) => f.place === 'basket')
                .map((f) => (
                  <Food key={f.id} product={f.product} />
                ))}
            </button>
          ) : null}
          {a &&
            drawerTools(a)
              .filter((t) => t !== tool)
              .map((t) => (
                <button
                  type="button"
                  key={t}
                  data-grab={`tool:${t}`}
                  aria-label={`取出${toolNames[t]}`}
                  onClick={() => take(`tool:${t}`)}
                >
                  <SceneIcon kind={t} />
                </button>
              ))}
        </div>
        <TogetherKitchen
          state={s}
          rect={l.preparation}
          run={run}
          use={use}
          drop={drop}
          source={sourceButton}
        />
        <section
          className="held-objects"
          style={position({ ...l.hand, x: cat.x - 5, y: cat.y + cat.height * 0.58 })}
          aria-label="手中真实物件"
        >
          {held.map((i) => (
            <Food key={i.id} product={i.product} />
          ))}
          {worldHand ? <Food product={worldHand.product} /> : null}
          {tool ? <SceneIcon kind={tool} /> : null}
          {decoration ? (
            <SceneIcon
              tone={
                decoration.value === 'cool'
                  ? '#69aaa0'
                  : decoration.value === 'leaf'
                    ? '#719675'
                    : decoration.value === 'moon'
                      ? '#d2eafa'
                      : '#f1d485'
              }
              kind={
                decoration.kind === 'cloth'
                  ? 'mat'
                  : decoration.kind === 'light'
                    ? 'lantern'
                    : 'bunting'
              }
            />
          ) : null}
          {!held.length &&
            !worldHand &&
            delivered.map((i) => <Food key={i.id} product={i.product} />)}
        </section>
        {isCarrying ? (
          <button
            type="button"
            className="return-held"
            style={{
              left: size.width - 62,
              top: l.table.y + l.table.height + 4,
              width: 52,
              minHeight: 48,
            }}
            aria-label="放回手中食品"
            onClick={() =>
              decoration
                ? act('return-decoration')
                : tool
                  ? act('put-tool')
                  : worldHand
                    ? act('put-world')
                    : run({ type: 'return-hand' })
            }
          >
            放回
          </button>
        ) : null}
        <div
          className="activity-workspace"
          style={{
            left: l.table.x + l.table.width * 0.36,
            top: l.table.y + l.table.height - 52,
            width: l.table.width * 0.28,
          }}
        >
          {a?.foods.filter((f) => f.place === 'work').map((f) => sourceButton(f, true))}
          {a && (a.chapter === 4 || a.kind === 'shop' || a.rewards.length) ? (
            <button
              type="button"
              {...drop({ kind: 'world' })}
              aria-label="放到作品区"
              onClick={() => use({ kind: 'world' })}
            >
              <SceneIcon kind="table" />
            </button>
          ) : null}
        </div>
        {a && ((a.chapter === 0 && a.explored.includes('drawer')) || a.steps.includes('plant')) ? (
          <div className="garden-spots" style={{ left: l.table.x, top: l.table.y - 25 }}>
            {([0, 1, 2] as const).map((seat) => (
              <button
                type="button"
                key={seat}
                {...drop({ kind: 'garden', seat })}
                aria-label={`把花种在${['左边', '中间', '右边'][seat]}`}
                onClick={() => use({ kind: 'garden', seat })}
              >
                <SceneIcon
                  kind={a.steps.includes('plant') && a.decor.flower === seat ? 'flower' : 'seed'}
                />
                {a.experience?.used.includes('water') && a.decor.flower === seat ? (
                  <span>🦋</span>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
        {decoration ? (
          <button
            type="button"
            {...drop({ kind: 'decor' })}
            className="decoration-place stage-drop"
            style={{
              left: l.table.x + l.table.width * 0.4,
              top: decoration.kind === 'cloth' ? l.table.y : size.height * 0.2,
              width: 80,
              height: 48,
            }}
            aria-label={decoration.kind === 'cloth' ? '把桌布铺在桌面' : '把装饰挂到绳上'}
            onClick={() => use({ kind: 'decor' })}
          >
            放好
          </button>
        ) : null}
        {a?.chapter === 3 && a.steps.some((step) => step.startsWith('served:')) ? (
          <div
            className="direct-cooperation"
            style={{ left: l.table.x, top: l.table.y + l.table.height - 12 }}
          >
            {(['rabbit', 'hedgehog'] as const).map((visitor) => (
              <button
                type="button"
                key={visitor}
                aria-label={`请${VISITOR_NAMES[visitor]}带灯`}
                onClick={() => act('cooperate', { visitor, object: 'lantern' })}
              >
                <SceneIcon kind="lantern" />
                {VISITOR_NAMES[visitor]}
              </button>
            ))}
          </div>
        ) : null}
        <div
          className="scene-finishing"
          style={{ left: l.table.x + l.table.width * 0.55, top: l.table.y + l.table.height + 4 }}
        >
          {a?.chapter === 1 && a.steps.includes('cool') && a.steps.includes('taste')
            ? (['warm', 'cool'] as const).map((value) => (
                <button
                  type="button"
                  key={value}
                  aria-label={value === 'warm' ? '挂起暖色彩旗' : '挂起清凉彩旗'}
                  onClick={() => act('bunting', { value })}
                >
                  <SceneIcon kind="bunting" tone={value === 'cool' ? '#69aaa0' : '#eeb46d'} />
                </button>
              ))
            : null}
          {a?.chapter === 2 &&
          (a.steps.includes('unpack') ||
            (a.steps.includes('place:0') && a.steps.includes('place:1')))
            ? (['leaf', 'sun'] as const).map((value) => (
                <button
                  type="button"
                  key={value}
                  aria-label={value === 'leaf' ? '铺叶子桌布' : '铺阳光桌布'}
                  onClick={() => act('cloth', { value })}
                >
                  <SceneIcon kind="mat" tone={value === 'leaf' ? '#719675' : '#f1d485'} />
                </button>
              ))
            : null}
          {a?.chapter === 3 && a.steps.some((step) => step.startsWith('served:'))
            ? (['warm', 'moon'] as const).map((value) => (
                <button
                  type="button"
                  key={value}
                  aria-label={value === 'warm' ? '点亮暖灯' : '点亮月光灯'}
                  onClick={() => act('light', { value })}
                >
                  <SceneIcon kind="lantern" tone={value === 'moon' ? '#d2eafa' : '#ffde7d'} />
                </button>
              ))
            : null}
          {a?.kind === 'chapter' && !a.rewards.length && adventureReady(a) ? (
            <button
              type="button"
              className="natural-finish"
              aria-label={a.chapter === 0 ? '一起吃早餐' : '一起开席'}
              onClick={() => act('finish')}
            >
              {a.chapter === 0 ? '一起吃早餐' : '一起开席'}
            </button>
          ) : null}
          {a?.rewards.length && a.chapter < 4 ? (
            <button type="button" className="natural-finish" onClick={next}>
              下一院活动
            </button>
          ) : null}
        </div>
        <p className="nearby-feedback" role="status" style={position(l.footer)}>
          {controller.message || feedback}
        </p>
        {dialogue.current?.line.role === 'dami' ? (
          <div
            className="local-bubble dami-bubble"
            style={{
              left: narrowPortrait ? 68 : (size.width - 350) / 2,
              top: narrowPortrait ? 49 : 3,
              width: narrowPortrait ? size.width - 136 : 350,
              minHeight: 78,
            }}
          >
            <Sentence line={dialogue.current.line} audio={audio} play={() => dialogue.replay()} />
          </div>
        ) : null}
        {ghost ? (
          <div className="drag-food" style={{ left: ghost.x, top: ghost.y }}>
            <Food product={ghost.product} />
          </div>
        ) : null}
      </div>
      {demoOrder && s.orders.find((o) => o.id === demoOrder && o.status === 'waiting') ? (
        <StageDemonstration
          key={demoOrder}
          controller={controller}
          order={
            s.orders.find((o) => o.id === demoOrder) ??
            (s.orders[0] as NonNullable<(typeof s.orders)[0]>)
          }
          audio={audio}
          layout={l}
          close={closeDemo}
          showDevice={showDemoDevice}
        />
      ) : null}
      {book || confirm ? (
        <div className="stage-modal-layer" inert={false}>
          <section role="dialog" aria-modal="true" aria-label={book ? '食谱与作品' : '收起成品'}>
            {confirm ? (
              <>
                <p>收起这份成品后，可以从暂停菜单恢复。</p>
                <button type="button" onClick={() => setConfirm(false)}>
                  继续拿着
                </button>
                <button
                  type="button"
                  onClick={() => {
                    run({ type: 'return-hand', confirmed: true });
                    setConfirm(false);
                  }}
                >
                  确认收起
                </button>
              </>
            ) : (
              <>
                <button type="button" aria-label="收起食谱" onClick={() => setBook(false)}>
                  ×
                </button>
                <h2>今天的做法与作品</h2>
                {RECIPES.filter((r) => s.session.unlocked.includes(r.family)).map((r) => (
                  <div key={r.id} className="recipe-pictures">
                    {r.inputs
                      .map((p, i) => ({
                        product: p,
                        id: `${r.id}:${p}:${r.inputs.slice(0, i + 1).filter((v) => v === p).length}`,
                      }))
                      .map((f) => (
                        <Food key={f.id} product={f.product} />
                      ))}
                    <span>→</span>
                    <Food product={r.output} />
                  </div>
                ))}
                {a?.chapter === 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      act('compare');
                      setBook(false);
                    }}
                  >
                    比较两种甜点
                  </button>
                ) : null}
                {a?.foods.map((f) => (
                  <button
                    type="button"
                    key={f.id}
                    aria-label={`品尝${PRODUCT_NAMES[f.product]}`}
                    onClick={() => {
                      act('taste', { item: f.id });
                      setBook(false);
                    }}
                  >
                    <Food product={f.product} />
                    <SceneIcon kind="taste" />
                  </button>
                ))}
                {a && (a.chapter === 4 || a.kind === 'shop' || a.rewards.length) ? (
                  <button
                    type="button"
                    onClick={() => {
                      act('save-work');
                      setBook(false);
                    }}
                  >
                    保存到食谱
                  </button>
                ) : null}
                <details>
                  <summary>回看最近交流</summary>
                  {dialogue.recent.map((turn) => (
                    <Sentence
                      key={turn.key}
                      line={turn.line}
                      audio={audio}
                      play={() => dialogue.replay(turn)}
                    />
                  ))}
                </details>
                <WorkGallery
                  title="这次保存的作品"
                  works={a?.works ?? []}
                  audio={audio}
                  dialogue={dialogue}
                  revise={() => setBook(false)}
                />
                <WorkGallery
                  title="旧活动的作品"
                  works={controller.profile.value.activityMemories
                    .filter((m) => m.runId !== s.runId)
                    .flatMap((m) => m.state.works)}
                  audio={audio}
                  dialogue={dialogue}
                  revise={() => setBook(false)}
                />
                <button
                  type="button"
                  onClick={() => {
                    setBook(false);
                    games();
                  }}
                >
                  去游乐角
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBook(false);
                    home();
                  }}
                >
                  收摊回小院
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBook(false);
                    replay();
                  }}
                >
                  再准备一次
                </button>
              </>
            )}
          </section>
        </div>
      ) : null}
    </section>
  );
}
