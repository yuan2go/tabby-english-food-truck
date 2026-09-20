import type { Mode } from '../content/catalog';
export interface Point {
  x: number;
  y: number;
}
export interface Layout {
  width: number;
  height: number;
  landscape: boolean;
  guests: [Point, Point];
  machine: Point;
  helper: Point;
  trays: [Point, Point];
  supplies: [Point, Point, Point];
  clear: Point;
  trayWidth: number;
  guestHeight: number;
  scale: number;
}
export function layoutFor(width: number, height: number, mode: Mode = 'service'): Layout {
  const landscape = width > height * 1.15;
  const scale = Math.min(width / (landscape ? 900 : 390), height / (landscape ? 640 : 780), 1.45);
  const l: Layout = {
    width,
    height,
    landscape,
    scale,
    guests: landscape
      ? [
          { x: width * 0.38, y: height * 0.25 },
          { x: width * 0.69, y: height * 0.25 },
        ]
      : [
          { x: width * 0.27, y: height * 0.23 },
          { x: width * 0.73, y: height * 0.23 },
        ],
    guestHeight: Math.min(height * 0.245, landscape ? 180 : width * 0.43),
    machine: landscape
      ? { x: width * 0.23, y: height * 0.46 }
      : { x: width * 0.27, y: height * 0.455 },
    helper: landscape
      ? { x: width * 0.4, y: height * 0.57 }
      : { x: width * 0.76, y: height * 0.445 },
    trays: landscape
      ? [
          { x: width * 0.62, y: height * 0.57 },
          { x: width * 0.83, y: height * 0.57 },
        ]
      : [
          { x: width * 0.255, y: height * 0.68 },
          { x: width * 0.745, y: height * 0.68 },
        ],
    supplies: [
      {
        x: width * (landscape ? 0.28 : 0.15),
        y: height * (landscape ? (height < 500 ? 0.77 : 0.82) : 0.85),
      },
      {
        x: width * (landscape ? 0.44 : 0.39),
        y: height * (landscape ? (height < 500 ? 0.77 : 0.82) : 0.85),
      },
      {
        x: width * (landscape ? 0.6 : 0.63),
        y: height * (landscape ? (height < 500 ? 0.77 : 0.82) : 0.85),
      },
    ],
    clear: {
      x: width * (landscape ? 0.78 : 0.87),
      y: height * (landscape ? (height < 500 ? 0.77 : 0.82) : 0.85),
    },
    trayWidth: width * (landscape ? 0.2 : 0.46),
  };
  // Stable work positions make actor action anchors and all input paths agree.
  // Landscape uses a wider counter and separate equipment staging, not a different world.
  l.helper = { x: width * 0.76, y: height * 0.445 };
  l.trays = [
    { x: width * 0.255, y: height * 0.68 },
    { x: width * 0.745, y: height * 0.68 },
  ];
  l.guests = [
    { x: width * 0.27, y: height * 0.23 },
    { x: width * 0.73, y: height * 0.23 },
  ];
  if (mode !== 'service') {
    l.guests = [
      { x: width * 0.5, y: height * 0.225 },
      { x: width * 0.5, y: height * 0.225 },
    ];
    l.trays[0] = { x: width * 0.5, y: height * 0.68 };
    l.trayWidth = Math.min(280, width * (landscape ? 0.28 : 0.64));
  }
  l.scale = Math.max(0.72, l.scale);
  return l;
}
