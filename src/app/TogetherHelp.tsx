import { type CSSProperties, useEffect, useState } from 'react';
import { VISITOR_NAMES } from '../content/adventure';
import { REQUESTS } from '../content/catalog';
import { ITEM_AUDIO } from '../content/learning';
import { type Family, FOOD, type Product, RECIPES } from '../content/recipes';
import { REQUEST_UNITS, teachingFigures } from '../content/teaching';
import type { TogetherLayout } from '../game/together-layout';
import type { ForegroundAudio } from '../platform/audio';
import type { GameController } from '../platform/controller';
import type { Order } from '../rules/types';
import { Food } from './Food';

function expose(controller: GameController, order: Order, reason: string) {
  controller.command({ type: 'support', order: order.id, reason });
  const profile = controller.profile,
    key = `${controller.state.runId}:${order.id}`;
  const units = [...REQUEST_UNITS[order.request]];
  for (const unit of units) profile.present(unit);
  const prior = profile.value.lessons[key];
  profile.lesson(key, {
    request: order.request,
    units,
    index: 0,
    phase: reason === 'demonstration' ? 'recipe' : 'meaning',
    step: 0,
    tries: prior?.tries ?? 0,
    nextAttempt: prior?.nextAttempt ?? 0,
    support: [...new Set([...(prior?.support ?? []), reason])],
  });
  profile.observe({
    id: `${key}:exposed:${reason}`,
    dimension: 'meaning',
    target: order.request,
    result: 'exposed',
    support: [reason],
    visit: order.revisit ? 'revisit' : 'first',
    audioQualified: false,
  });
}
export function RequestPicture({
  controller,
  order,
  audio,
  style,
}: {
  controller: GameController;
  order: Order;
  audio: ForegroundAudio;
  style: CSSProperties;
}) {
  const [opened, setOpened] = useState(false);
  const visible =
    opened ||
    controller.state.session.support !== 'less' ||
    !audio.enabled ||
    !audio.settings.voice ||
    audio.failedRequest === REQUESTS[order.request].audio;
  useEffect(() => {
    if (visible && !order.support.includes('meaning-picture'))
      expose(controller, order, 'meaning-picture');
  }, [visible, order, controller]);
  const products = REQUESTS[order.request].products;
  return (
    <section className="request-picture" style={style} aria-label="说话者的图示需要">
      <button
        type="button"
        aria-label={`看图理解${VISITOR_NAMES[order.visitor ?? (order.seat === 0 ? 'rabbit' : 'hedgehog')]}的请求`}
        onClick={() => {
          setOpened(true);
          expose(controller, order, 'picture-request');
          void audio.sequence([
            ...new Set(products.map((p) => ITEM_AUDIO[p])),
            REQUESTS[order.request].audio,
          ]);
        }}
      >
        {visible ? (
          <>
            {teachingFigures(products).map((f) => (
              <Food key={f.id} product={f.product} />
            ))}
            {products.length > 1 ? <span>{products.length}</span> : null}
          </>
        ) : (
          <span>?</span>
        )}
      </button>
    </section>
  );
}
interface Example {
  product: Product;
  action: 'take' | 'start' | 'receive';
  device?: string;
  family?: Family;
}
/** Recipe-derived presentation, never an inventory command or an acceptance result. */
function examples(products: readonly Product[]): Example[] {
  const trace: Example[] = [];
  const make = (p: Product) => {
    const recipe = RECIPES.find((r) => r.output === p);
    if (!recipe) {
      trace.push({ product: p, action: 'take' });
      return;
    }
    for (const input of recipe.inputs) {
      const sub = RECIPES.find((r) => r.output === input);
      if (sub) {
        make(input);
        trace.push({
          product: input,
          action: 'take',
          device: recipe.station,
          family: recipe.family,
        });
      } else
        trace.push({
          product: input,
          action: 'take',
          device: recipe.station,
          family: recipe.family,
        });
    }
    trace.push({ product: p, action: 'start', device: recipe.station, family: recipe.family });
  };
  for (const product of products) make(product);
  trace.push({ product: products[0] ?? 'apple', action: 'receive' });
  return trace;
}
export function StageDemonstration({
  controller,
  order,
  audio,
  layout,
  close,
  showDevice,
}: {
  controller: GameController;
  order: Order;
  audio: ForegroundAudio;
  layout: TogetherLayout;
  close: () => void;
  showDevice: (family: Family, station: string) => void;
}) {
  const frames = examples(REQUESTS[order.request].products),
    [step, setStep] = useState(0),
    frame = frames[Math.min(step, frames.length - 1)];
  const orderId = order.id;
  useEffect(() => {
    controller.pause('teaching', true);
    const current = controller.state.orders.find((o) => o.id === orderId);
    if (current) expose(controller, current, 'demonstration');
    return () => {
      controller.pause('teaching', false);
      audio.stop();
    };
  }, [controller, orderId, audio]);
  const exampleFamily = frame?.family,
    exampleStation = frame?.device;
  useEffect(() => {
    if (exampleFamily && exampleStation) showDevice(exampleFamily, exampleStation);
  }, [exampleFamily, exampleStation, showDevice]);
  const audioProduct = frame?.product;
  useEffect(() => {
    if (audioProduct) void audio.play(ITEM_AUDIO[audioProduct]);
  }, [audio, audioProduct]);
  const visitor = order.visitor ?? (order.seat === 0 ? 'rabbit' : 'hedgehog');
  const rect =
    layout.seats[visitor === 'rabbit' ? 0 : visitor === 'hedgehog' ? 1 : 2] ?? layout.seats[0];
  const point =
    frame?.action === 'receive'
      ? { x: rect?.x ?? 0, y: rect?.y ?? 0 }
      : frame?.device
        ? { x: layout.preparation.x + 75, y: layout.preparation.y + 85 }
        : {
            x: layout.dami.x + layout.dami.width / 2 - 24,
            y: layout.dami.y + layout.dami.height * 0.58,
          };
  return (
    <section
      className="stage-demonstration"
      role="dialog"
      aria-modal="true"
      aria-label="同场动作示范"
    >
      <div className="demonstration-food" style={{ left: point.x, top: point.y }}>
        {frame ? <Food product={frame.product} /> : null}
        <span>示范</span>
      </div>
      <div
        className="demonstration-caption"
        style={{
          left: layout.preparation.x,
          top: layout.preparation.y,
          width: layout.preparation.width,
        }}
      >
        <p>
          {frame?.action === 'take'
            ? `拿起${FOOD[frame.product][0]}，点${frame.device === 'machine' ? '果汁机对应入口' : frame.device === 'grill' ? '煎台' : frame.device ? '制作台' : '朋友'}。`
            : frame?.action === 'start'
              ? '按设备开关，等做好，再拿起成品。'
              : `点${VISITOR_NAMES[visitor]}，把准备好的食品交给这位朋友。`}
        </p>
        <button
          type="button"
          onClick={() => setStep((n) => Math.min(frames.length - 1, n + 1))}
          disabled={step >= frames.length - 1}
        >
          下一步示范
        </button>
        <button type="button" onClick={close}>
          我来动手
        </button>
      </div>
    </section>
  );
}
