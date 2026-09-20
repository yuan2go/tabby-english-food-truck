import type { Mode, Product, RequestId } from '../content/catalog';
export type TrayId = 0 | 1;
export type Location = `tray:${TrayId}:${0 | 1 | 2}` | 'machine:apple' | 'machine:cup' | 'helper';
export interface Item {
  id: string;
  product: Product;
  location: Location;
}
export interface Order {
  id: string;
  request: RequestId;
  seat: TrayId;
  status: 'queued' | 'waiting' | 'leaving' | 'done';
  remaining: number;
  support: string[];
}
export interface Attempt {
  runId: string;
  activity: 'delivery' | 'note';
  input: string;
  result: string;
  support: string[];
  retry: number;
  gameTime: number;
}
export interface AudioRecord {
  id: string;
  version: string;
  status: 'started' | 'completed' | 'interrupted' | 'failed';
  gameTime: number;
}
export interface GameState {
  schemaVersion: 2;
  mode: Mode;
  history: Partial<Record<RequestId, string[]>>;
  contentVersion: string;
  runId: string;
  revision: number;
  nextId: number;
  variant: 0 | 1;
  gameTime: number;
  items: Item[];
  orders: Order[];
  machine: {
    status: 'empty' | 'loaded' | 'processing' | 'ready';
    remaining: number;
    jobId: string | null;
  };
  helper: {
    id: string;
    tray: TrayId;
    slots: (0 | 1 | 2)[];
    itemIds: string[];
    remaining: number;
  } | null;
  trays: [{ remaining: number }, { remaining: number }];
  receipts: string[];
  attempts: Attempt[];
  audio: AudioRecord[];
  lessons: string[];
  noteSupport: string[];
}
export type Source = { supply: Product } | { item: string };
export type Destination =
  | { tray: TrayId }
  | { machine: 'apple' | 'cup' }
  | { discard: true; confirmed: boolean };
export type Command =
  | { type: 'move'; source: Source; destination: Destination }
  | { type: 'start-machine' }
  | { type: 'deliver'; tray: TrayId; order: string }
  | { type: 'note'; tray: TrayId; tokens: string[] }
  | { type: 'picture-request'; tray: TrayId; fruits: ('apple' | 'banana')[] }
  | { type: 'cancel-helper' }
  | { type: 'support'; order: string | 'all'; reason: string }
  | { type: 'lesson'; lesson: string }
  | { type: 'note-support'; reason: string }
  | { type: 'audio'; audio: Omit<AudioRecord, 'gameTime'> };
export interface Envelope {
  id: string;
  runId: string;
  command: Command;
}
export interface Result {
  state: GameState;
  kind:
    | 'ok'
    | 'blocked'
    | 'incomplete'
    | 'mismatch'
    | 'language-adjust'
    | 'outside'
    | 'duplicate'
    | 'stale'
    | 'confirm';
  message: string;
}
