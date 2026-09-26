import { useCallback, useEffect, useRef, useState } from 'react';
import { MODES, TOKENS } from '../content/catalog';
import { assetUrl } from '../game/assets';
import type { GameController } from '../platform/controller';
import type { TrayId } from '../rules/types';
import { insertToken } from './note-order';

interface Props {
  controller: GameController;
  initialTray: TrayId;
  close: () => void;
  feedback: () => void;
}
export function Note({ controller, initialTray, close, feedback }: Props) {
  const [picture, setPicture] = useState(controller.state.mode !== 'service');
  const [fruits, setFruits] = useState<{ id: string; product: 'apple' | 'banana' }[]>([]);
  const [ids, setIds] = useState<string[]>([]);
  const [tray, setTray] = useState<TrayId>(initialTray);
  const [message, setMessage] = useState('用词块告诉大咪拿什么。');
  const gesture = useRef<{
    id: string;
    x: number;
    y: number;
    fromDraft: boolean;
    pointer: number;
    target: HTMLButtonElement;
  } | null>(null);
  const cancel = useCallback(() => {
    const g = gesture.current;
    if (!g) return;
    gesture.current = null;
    ignoreClick.current = true;
    if (g.target.hasPointerCapture(g.pointer)) g.target.releasePointerCapture(g.pointer);
  }, []);
  useEffect(() => {
    const stop = () => cancel();
    const otherPointer = (event: PointerEvent) => {
      if (gesture.current && event.pointerId !== gesture.current.pointer) cancel();
    };
    document.addEventListener('pointerdown', otherPointer, true);
    window.addEventListener('resize', stop);
    window.addEventListener('blur', stop);
    document.addEventListener('visibilitychange', stop);
    return () => {
      stop();
      document.removeEventListener('pointerdown', otherPointer, true);
      window.removeEventListener('resize', stop);
      window.removeEventListener('blur', stop);
      document.removeEventListener('visibilitychange', stop);
    };
  }, [cancel]);
  const ignoreClick = useRef(false);
  const add = (id: string) => setIds((old) => (old.includes(id) ? old : [...old, id]));
  const move = (id: string, direction: number) =>
    setIds((old) => {
      const next = [...old];
      const index = next.indexOf(id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= next.length) return old;
      next.splice(index, 1);
      next.splice(target, 0, id);
      return next;
    });
  const pointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    id: string,
    fromDraft: boolean,
  ) => {
    if (gesture.current || !e.isPrimary) {
      cancel();
      return;
    }
    ignoreClick.current = false;
    gesture.current = {
      id,
      x: e.clientX,
      y: e.clientY,
      fromDraft,
      pointer: e.pointerId,
      target: e.currentTarget,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const pointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const g = gesture.current;
    if (g?.pointer !== e.pointerId) return;
    gesture.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
    if (!g || Math.hypot(e.clientX - g.x, e.clientY - g.y) < 8) return;
    ignoreClick.current = true;
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const zone = target?.closest('[data-note-draft]');
    if (zone) {
      const token = target?.closest('[data-index]');
      const rect = token?.getBoundingClientRect();
      const boundary = token
        ? Number(token.getAttribute('data-index')) +
          (rect && e.clientX > rect.x + rect.width / 2 ? 1 : 0)
        : e.clientX < zone.getBoundingClientRect().x + 10
          ? 0
          : ids.length;
      setIds((old) => insertToken(old, g.id, boundary));
    } else if (g.fromDraft && target?.closest('.word-bank'))
      setIds((old) => old.filter((id) => id !== g.id));
  };
  const click = (fn: () => void) => {
    if (ignoreClick.current) {
      ignoreClick.current = false;
      return;
    }
    fn();
  };
  return (
    <section className="note-sheet" role="dialog" aria-label="大咪便签">
      <div className="sheet-heading">
        <span>给大咪的便签</span>
        <button type="button" onClick={close} aria-label="收起便签">
          ×
        </button>
      </div>
      <div className="note-destination">
        <span>送到</span>
        {MODES[controller.state.mode].trays.map((i) => (
          <button
            type="button"
            key={i}
            className={tray === i ? 'chosen' : ''}
            onClick={() => setTray(i)}
          >
            {i + 1}号盘
          </button>
        ))}
        <small>营业继续中</small>
      </div>
      <div className="note-format">
        <button type="button" aria-pressed={picture} onClick={() => setPicture(true)}>
          看图请大咪
        </button>
        <button type="button" aria-pressed={!picture} onClick={() => setPicture(false)}>
          词块便签
        </button>
      </div>
      {picture ? (
        <div className="picture-note">
          <section className="picture-draft" aria-label="图片请求草稿">
            {fruits.map((fruit, i) => (
              <button
                type="button"
                key={fruit.id}
                aria-label={`撤回第${i + 1}份`}
                onClick={() => setFruits((old) => old.filter((_, n) => n !== i))}
              >
                <img src={assetUrl(fruit.product)} alt={fruit.product} />
              </button>
            ))}
          </section>
          <div className="picture-bank">
            {(['apple', 'banana'] as const).map((fruit) => (
              <button
                type="button"
                key={fruit}
                disabled={fruits.length >= 2}
                aria-label={`图片 ${fruit}`}
                onClick={() =>
                  setFruits((old) => [...old, { id: crypto.randomUUID(), product: fruit }])
                }
              >
                <img src={assetUrl(fruit)} alt="" />
                <span>＋</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <fieldset className="draft" data-note-draft="true" aria-label="便签草稿">
            {ids.length ? (
              ids.map((id, index) => (
                <button
                  type="button"
                  data-index={index}
                  key={id}
                  onPointerDown={(e) => pointerDown(e, id, true)}
                  onPointerUp={pointerUp}
                  onPointerCancel={cancel}
                  onLostPointerCapture={cancel}
                  onClick={() => click(() => setIds((old) => old.filter((v) => v !== id)))}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                      e.preventDefault();
                      move(id, e.key === 'ArrowLeft' ? -1 : 1);
                    }
                  }}
                  aria-label={`草稿 ${TOKENS.find((t) => t.id === id)?.text}，点按撤回，方向键重排`}
                >
                  {TOKENS.find((t) => t.id === id)?.text}
                </button>
              ))
            ) : (
              <span>把词放到这里 · 点词可撤回</span>
            )}
          </fieldset>
          <div className="word-bank">
            {TOKENS.map((t) => (
              <button
                type="button"
                key={t.id}
                disabled={ids.includes(t.id)}
                onPointerDown={(e) => pointerDown(e, t.id, false)}
                onPointerUp={pointerUp}
                onPointerCancel={cancel}
                onLostPointerCapture={cancel}
                onClick={() => click(() => add(t.id))}
              >
                {t.text}
              </button>
            ))}
          </div>
        </>
      )}
      <p className="note-message" role="status">
        {message}
      </p>
      <div className="note-actions">
        <button
          type="button"
          onClick={() => {
            setIds([]);
            setFruits([]);
          }}
        >
          清空草稿
        </button>
        <button
          type="button"
          className="primary"
          onClick={() => {
            const r = controller.command(
              picture
                ? { type: 'picture-request', tray, fruits: fruits.map((f) => f.product) }
                : { type: 'note', tray, tokens: ids },
            );
            setMessage(r.message);
            if (r.kind === 'ok') close();
            else feedback();
          }}
        >
          交给大咪
        </button>
      </div>
      {controller.state.helper ? (
        <button
          type="button"
          className="cancel-job"
          onClick={() => {
            setMessage(controller.command({ type: 'cancel-helper' }).message);
          }}
        >
          撤回正在执行的便签
        </button>
      ) : null}
    </section>
  );
}
