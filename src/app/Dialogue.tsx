import type { CSSProperties } from 'react';
import { VISITOR_NAMES } from '../content/adventure';
import type { DialogueLine } from '../content/dialogue';
import type { ForegroundAudio } from '../platform/audio';
import type { DialogueDirector } from '../platform/dialogue';
import './dialogue.css';

const speakerName = (line: DialogueLine) =>
  line.role === 'dami' ? '大咪' : line.role === 'guest' ? '朋友' : VISITOR_NAMES[line.role];
function emphasized(line: DialogueLine) {
  const pattern = [...line.emphasis]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  if (!pattern) return line.text;
  const occurrences = new Map<string, number>();
  return line.text.split(new RegExp(`(${pattern})`, 'gi')).map((part) => {
    const occurrence = (occurrences.get(part) ?? 0) + 1;
    occurrences.set(part, occurrence);
    return line.emphasis.some((t) => t.toLowerCase() === part.toLowerCase()) ? (
      <strong key={`${part}:${occurrence}`}>{part}</strong>
    ) : (
      part
    );
  });
}
export function Sentence({
  line,
  audio,
  play,
}: {
  line: DialogueLine;
  audio: ForegroundAudio;
  play: () => void;
}) {
  const status =
    audio.active === line.audio
      ? 'playing'
      : audio.failedRequest === line.audio
        ? 'failed'
        : !audio.enabled || !audio.settings.voice
          ? 'muted'
          : 'ready';
  return (
    <div className="spoken-sentence" data-playback={status}>
      <button
        type="button"
        className="sentence-text"
        lang="en"
        onClick={play}
        aria-label={`重听${speakerName(line)}：${line.text}`}
      >
        {emphasized(line)}
      </button>
      <button
        type="button"
        className="sentence-play"
        aria-label={`播放整句：${line.text}`}
        onClick={play}
      >
        <span aria-hidden="true">
          {status === 'playing'
            ? '↻'
            : status === 'failed'
              ? '♫!'
              : status === 'muted'
                ? '♫×'
                : '▶'}
        </span>
      </button>
      <span className="sr-only" aria-live="polite">
        {status === 'playing'
          ? '正在播放，点击从头重听'
          : status === 'failed'
            ? '声音未播放，可重试或看图继续'
            : status === 'muted'
              ? '已静音，英文保留'
              : '可播放整句'}
      </span>
    </div>
  );
}
export function Conversation({
  director,
  audio,
  style,
  children,
  help,
}: {
  director: DialogueDirector;
  audio: ForegroundAudio;
  style?: CSSProperties;
  children?: React.ReactNode;
  help?: () => void;
}) {
  const t = director.current;
  return (
    <section className="conversation" style={style} aria-label="英语交流">
      <div className="conversation-tabs">
        {children}
        <span className="speaker-name">{t ? speakerName(t.line) : '大咪'}</span>
        {help ? (
          <button type="button" className="sentence-help" aria-label="图示帮助" onClick={help}>
            ▧
          </button>
        ) : null}
        {director.recent.length > 1 ? (
          <details className="conversation-history">
            <summary aria-label="回看最近交流">↶</summary>
            <div>
              {director.recent
                .slice(0, -1)
                .reverse()
                .map((r) => (
                  <button type="button" key={r.key} lang="en" onClick={() => director.replay(r)}>
                    {r.line.text} ♫
                  </button>
                ))}
            </div>
          </details>
        ) : null}
      </div>
      {t ? <Sentence line={t.line} audio={audio} play={() => director.replay()} /> : null}
    </section>
  );
}
