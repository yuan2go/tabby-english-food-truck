export const ASSET_IDS = [
  'market',
  'apple',
  'banana',
  'cup',
  'juice',
  'machine',
  'tray',
  'guest-0-0',
  'guest-0-1',
  'guest-0-2',
  'guest-1-0',
  'guest-1-1',
  'guest-1-2',
] as const;
export const assetUrl = (id: string) => `${import.meta.env.BASE_URL}assets/${id}.webp`;
