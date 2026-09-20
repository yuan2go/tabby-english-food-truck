import { useRef, useState } from 'react';
import { TOKENS } from '../content/catalog';
import type { GameController } from '../platform/controller';
import type { TrayId } from '../rules/types';

interface Props {
  controller: GameController;
  initialTray: TrayId;
  close: () => void;
}
export function Note({ controller, initialTray, close }: Props) {
  const [ids, setIds] = useState<string[]>([]);
  const [tray, setTray] = useState<TrayId>(initialTray);
  const [message, setMessage] = useState('用词块告诉小猫拿什么。');
  const gesture = useRef<{ id: string; x: number; y: number; fromDraft: boolean } | null>(null);
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
    gesture.current = { id, x: e.clientX, y: e.clientY, fromDraft };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const pointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g || Math.hypot(e.clientX - g.x, e.clientY - g.y) < 8) return;
    ignoreClick.current = true;
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const zone = target?.closest('[data-note-draft]');
    if (zone) {
      const index = Number(
        target?.closest('[data-index]')?.getAttribute('data-index') ?? ids.length,
      );
      setIds((old) => {
        const next = old.filter((id) => id !== g.id);
        next.splice(index, 0, g.id);
        return next;
      });
    } else if (g.fromDraft) setIds((old) => old.filter((id) => id !== g.id));
  };
  const click = (fn: () => void) => {
    if (ignoreClick.current) {
      ignoreClick.current = false;
      return;
    }
    fn();
  };
  return (
    <section className="note-sheet" role="dialog" aria-label="小猫便签">
      <div className="sheet-heading">
        <span>给小猫的便签</span>
        <button type="button" onClick={close} aria-label="收起便签">
          ×
        </button>
      </div>
      <div className="note-destination">
        <span>送到</span>
        {([0, 1] as const).map((i) => (
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
      <fieldset className="draft" data-note-draft="true" aria-label="便签草稿">
        {ids.length ? (
          ids.map((id, index) => (
            <button
              type="button"
              data-index={index}
              key={id}
              onPointerDown={(e) => pointerDown(e, id, true)}
              onPointerUp={pointerUp}
              onPointerCancel={() => {
                gesture.current = null;
              }}
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
            onPointerCancel={() => {
              gesture.current = null;
            }}
            onClick={() => click(() => add(t.id))}
          >
            {t.text}
          </button>
        ))}
      </div>
      <p className="note-message" role="status">
        {message}
      </p>
      <div className="note-actions">
        <button type="button" onClick={() => setIds([])}>
          清空草稿
        </button>
        <button
          type="button"
          className="primary"
          onClick={() => {
            const r = controller.command({ type: 'note', tray, tokens: ids });
            setMessage(r.message);
            if (r.kind === 'ok') close();
          }}
        >
          交给小猫
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
