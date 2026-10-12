/** Original vector scene symbols: no baked text and no third-party artwork. */
export function SceneIcon({
  kind,
  className = '',
  tone,
}: {
  kind: string;
  className?: string;
  tone?: string;
}) {
  const shapes: Record<string, React.ReactNode> = {
    home: (
      <>
        <path d="m3 28 29-25 29 25M10 25v34h44V25" fill="#d1aa67" />
        <path d="M25 59V36h14v23" />
      </>
    ),
    clear: (
      <>
        <path d="m42 6-19 29m-12-1 21 12-8 14L2 49z" fill="#d1aa67" />
        <path d="m9 42-6 10m16-5-6 10m15-5-6 9" />
      </>
    ),
    ear: (
      <>
        <path d="M19 29C9 10 46 0 45 23c0 13-15 9-14 24-1 12-17 14-20 2" />
        <path d="M24 28c-6-10 15-15 12-2l-10 8" />
      </>
    ),
    friend: (
      <>
        <circle cx="31" cy="21" r="12" fill="#e6c696" />
        <path d="M12 57c0-28 38-28 38 0" fill="#e6c696" />
        <circle cx="27" cy="21" r="1" />
        <circle cx="36" cy="21" r="1" />
        <path d="m25 27 5 3 7-3" />
      </>
    ),
    friends: (
      <>
        <circle cx="18" cy="21" r="10" />
        <circle cx="46" cy="21" r="10" />
        <path d="M4 55c0-27 27-27 27 0m2 0c0-27 27-27 27 0" />
      </>
    ),
    kitchen: (
      <>
        <path d="M7 18h50v37H7z" fill="#d1aa67" />
        <path d="M4 17V9h55v8M16 55V35h16v20M40 35h9" />
        <path d="M20 5V1m12 4V1m12 4V1" />
      </>
    ),
    counter: (
      <>
        <path d="M6 30h52v25H6z" fill="#d1aa67" />
        <path d="M6 30V12h52v18" />
        <path d="M18 18h28v8H18z" />
      </>
    ),
    drawer: (
      <>
        <path d="M7 9h50v46H7z" fill="#d1aa67" />
        <path d="M7 30h50M26 20h12M26 42h12" />
      </>
    ),
    seed: (
      <>
        <path d="M14 36h36l-5 22H19z" fill="#c87c4c" />
        <path d="M32 36V16c-23-20-29 9 0 9m0 0c23-22 30 8 0 7" fill="#70a978" />
      </>
    ),
    flower: (
      <>
        <path d="M17 40h31l-4 19H21z" fill="#c87c4c" />
        <path d="M32 41V22" />
        <path
          d="M32 8c-13-14-23 4-12 11-13 13 7 23 12 10 10 14 28-1 17-11C60 5 38-7 32 8"
          fill="#ecc467"
        />
        <circle cx="32" cy="18" r="5" fill="#c87847" />
      </>
    ),
    'watering-can': (
      <>
        <path d="M17 28h29v25H17z" fill="#739aa0" />
        <path d="M17 34 5 23v-7l18 14m20-3c19-26 26 19 3 18M25 27v-9h12v9" />
        <path d="m3 32 1 5m4-6 1 5m4-5 1 5" stroke="#64a7c3" />
      </>
    ),
    cup: (
      <>
        <path d="m15 17 5 38h25l5-38" fill="#d3e0ae" />
        <path d="M12 16h42M21 9c-10-19 32-19 21 0" />
      </>
    ),
    cone: (
      <>
        <path d="m17 27 15 33 15-33" fill="#d9b177" />
        <circle cx="32" cy="17" r="16" fill="#f0d6a6" />
        <path d="m23 35 15 10m-16-2 20-7" />
      </>
    ),
    spoon: (
      <>
        <ellipse cx="32" cy="15" rx="10" ry="13" fill="#d7e4cb" />
        <path d="M32 28v30" strokeWidth="6" />
      </>
    ),
    basket: (
      <>
        <path d="M10 27h45l-6 28H17z" fill="#d1aa67" />
        <path d="M18 26c-1-28 29-28 28 0M11 36h42M15 46h36m-27-19 3 27m9-27-3 27" />
      </>
    ),
    mat: (
      <>
        <path d="M4 17h24v36H4zm31 0h24v36H35z" fill={tone ?? '#9eb38d'} />
        <circle cx="16" cy="35" r="9" />
        <circle cx="47" cy="35" r="9" />
      </>
    ),
    table: (
      <>
        <ellipse cx="32" cy="26" rx="28" ry="17" fill="#d1aa67" />
        <path d="M14 38v20m35-20v20" />
        <circle cx="17" cy="26" r="8" fill="#fff1cb" />
        <circle cx="46" cy="26" r="8" fill="#fff1cb" />
      </>
    ),
    lantern: (
      <>
        <path d="M19 19h27v35H19z" fill={tone ?? '#ffe086'} />
        <path d="M23 19V9h19v10m-26 35h33M26 2h14M5 30H1m58 0h4M32 59v4" />
      </>
    ),
    bunting: (
      <>
        <path d="M3 7q29 17 58 0" />
        <path d="m7 10 4 24 13-17m2 1 7 25 10-27m1-1 11 19 5-24" fill={tone ?? '#d89459'} />
      </>
    ),
    cloth: (
      <>
        <path d="M6 10h51v45H6z" fill="#e6d6ad" />
        <path d="M6 23h51M6 42h51M22 10v45M43 10v45" stroke="#7ca181" strokeWidth="6" />
      </>
    ),
    recipe: (
      <>
        <path d="M3 10q14-8 29 1 14-9 29-1v43q-16-8-29 1Q17 46 3 53z" fill="#f5e1b5" />
        <path d="M32 11v43" />
        <circle cx="16" cy="29" r="7" fill="#90b37d" />
        <path d="m41 23 9 3-4 13z" fill="#c88455" />
      </>
    ),
    carry: (
      <>
        <path d="M5 36h54l-7 9H12z" fill="#d1aa67" />
        <path d="m16 52 4-7h24l6 7" />
        <circle cx="22" cy="24" r="9" fill="#e0a372" />
        <path d="M37 14h12v17H37z" fill="#acc39a" />
      </>
    ),
    shade: (
      <>
        <path d="M4 29q28-47 56 0z" fill="#84a38d" />
        <path d="M32 6v53M14 58h37" />
      </>
    ),
    missing: (
      <>
        <path d="M9 10h46v46H9z" strokeDasharray="5 4" />
        <path d="M22 33h20m-10-10v20" />
      </>
    ),
    taste: (
      <>
        <path d="M8 22q24 34 48 0M20 40q12 14 24 0" />
        <circle cx="14" cy="12" r="3" />
        <circle cx="50" cy="12" r="3" />
      </>
    ),
  };
  const aliases: Record<string, string> = {
    water: 'watering-can',
    light: 'lantern',
    plant: 'seed',
    compare: 'cup',
    invite: 'friends',
    finish: 'friends',
    share: 'carry',
    wait: 'carry',
  };
  return (
    <svg
      className={`scene-icon ${className}`}
      viewBox="0 0 64 64"
      fill="none"
      stroke="#375b46"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {shapes[kind] ?? shapes[aliases[kind] ?? 'friend']}
    </svg>
  );
}
