import type { Support } from '../content/chapters';
export function SupportChoice({
  value,
  change,
}: {
  value: Support;
  change: (value: Support) => void;
}) {
  return (
    <fieldset className="support-options">
      <legend>这次需要怎样的帮助？</legend>
      {(['demonstration', 'pictures', 'less'] as const).map((v, i) => (
        <button type="button" key={v} aria-pressed={value === v} onClick={() => change(v)}>
          <span aria-hidden="true">{['▶', '▧', '♫'][i]} </span>
          {['先看大咪做', '图片陪我做', '少些帮助，听一听'][i]}
        </button>
      ))}
    </fieldset>
  );
}
