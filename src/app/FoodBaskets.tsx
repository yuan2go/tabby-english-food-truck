import { useState } from 'react';
import { REQUESTS, type RequestId } from '../content/catalog';
import { requestFamily } from '../content/chapters';
import { FOOD_GROUPS, FOODS, foodBatch } from '../content/foods';
import type { Product } from '../content/recipes';
import type { ForegroundAudio } from '../platform/audio';
import type { GameController } from '../platform/controller';
import { Food } from './Food';

/** Five tactile baskets, five food choices at a time. No reading is required to select or listen. */
export function FoodBaskets({
  controller,
  audio,
  home,
  practice,
  serve,
}: {
  controller: GameController;
  audio: ForegroundAudio;
  home: () => void;
  practice: (ids: string[], focus: string) => void;
  serve: () => void;
}) {
  const [batch, setBatch] = useState('fruit-0');
  const [selected, select] = useState<string | null>(null);
  const foods = foodBatch(batch),
    food = FOODS.find((f) => f.id === selected);
  const say = (id: string) => {
    const f = FOODS.find((f) => f.id === id);
    if (!f) return;
    select(id);
    controller.profile.present(id);
    void audio.play(f.audio);
  };
  return (
    <section className="food-baskets" aria-label="五十种食物朋友">
      <header>
        <button
          type="button"
          onClick={() => {
            audio.stop();
            home();
          }}
        >
          ← 小院
        </button>
        <h2>食物朋友</h2>
      </header>
      <nav aria-label="选择食物篮">
        {FOOD_GROUPS.map((g) => (
          <button
            type="button"
            key={g.id}
            aria-label={g.name}
            aria-pressed={batch.startsWith(g.id)}
            onClick={() => {
              setBatch(`${g.id}-0`);
              select(null);
              void audio.play(g.audio);
            }}
          >
            <Food product={FOODS.find((f) => f.group === g.id)?.product as Product} />
            <span>{g.name}</span>
          </button>
        ))}
      </nav>
      <fieldset className="basket-foods" aria-label="这一篮的五位朋友">
        {foods.map((f) => (
          <button
            type="button"
            key={f.id}
            aria-label={`认识${f.chinese}`}
            aria-pressed={selected === f.id}
            onClick={() => say(f.id)}
          >
            <Food product={f.product as Product} />
          </button>
        ))}
      </fieldset>
      <button
        type="button"
        className="basket-page"
        onClick={() => {
          const next = batch.endsWith('-0') ? '1' : '0';
          setBatch(batch.slice(0, -1) + next);
          select(null);
          void audio.play('basket-next');
        }}
      >
        ↔ 换半篮 {batch.endsWith('-0') ? '1 / 2' : '2 / 2'}
      </button>
      {food ? (
        <section className="food-meaning" aria-label="食物的意思">
          <button type="button" onClick={() => void audio.play(food.audio)}>
            <strong>{food.text}</strong> ♫ <span>{food.chinese}</span>
          </button>
          <button type="button" onClick={() => void audio.play(food.contextAudio)}>
            ♫ {food.context}
          </button>
          <p>
            {food.role === 'recognition'
              ? '先在找朋友游戏里认识；餐车暂未供应。'
              : food.role === 'prepared'
                ? '预制供应：餐车可以送出，尚未制作这道食品。'
                : food.role === 'direct'
                  ? '水果可以直接送给客人。'
                  : food.role === 'recipe'
                    ? '在食谱里亲手制作，再送给客人。'
                    : '在已开放的食谱里选择和使用配料。'}
          </p>
          <button
            type="button"
            className="primary"
            onClick={() => {
              audio.stop();
              practice(
                foods.map((f) => f.id),
                food.id,
              );
            }}
          >
            ▶ 听一听，找朋友
          </button>
          {['direct', 'prepared'].includes(food.role) || ['apple', 'banana'].includes(food.id) ? (
            <button
              type="button"
              onClick={() => {
                const request = (Object.keys(REQUESTS) as RequestId[]).find(
                  (id) =>
                    REQUESTS[id].products.length === 1 && REQUESTS[id].products[0] === food.product,
                );
                if (!request) return;
                controller.profile.introduce(requestFamily(request));
                controller.profile.present(`menu:${request}`);
                controller.profile.present(`request:${request}`);
                audio.stop();
                serve();
              }}
            >
              放上今日菜单，去营业 ↗
            </button>
          ) : null}
        </section>
      ) : (
        <p role="status">点一位朋友，听名字；小猫陪你找一找。</p>
      )}
      <small>开发语音未听审 · 接触与一次答对都不代表掌握</small>
    </section>
  );
}
