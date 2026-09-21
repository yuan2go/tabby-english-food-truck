import type { Mode, Product, RequestId } from '../content/catalog';
import type { Activity, Support } from '../content/chapters';
import type { Family, StationId } from '../content/recipes';
import type { ActorPlan, ActorPoint } from '../game/actor';
export type TrayId = 0 | 1;
export type Location =
  | `tray:${TrayId}:${0 | 1 | 2}`
  | 'machine:apple'
  | 'machine:cup'
  | 'helper'
  | `station:${StationId}:${number}`
  | `delivery:${TrayId}:${number}`
  | 'recycle';
export interface Item {
  id: string;
  product: Product;
  location: Location;
}
export interface Order {
  revisit: boolean;
  heard: boolean;
  id: string;
  request: RequestId;
  seat: TrayId;
  status: 'queued' | 'waiting' | 'leaving' | 'done';
  remaining: number;
  support: string[];
}
export interface Attempt {
  id: string;
  condition: 'guided' | 'assisted' | 'independent-condition';
  visit: 'first' | 'revisit';
  audioQualified: false;
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
  schemaVersion: 4;
  session: {
    activity: Activity;
    chapter: number;
    support: Support;
    concurrency: 1 | 2;
    menu: RequestId[];
    family: Family;
    unlocked: Family[];
    seed: number;
    cursor: number;
    served: number;
    lastRequest: string;
  };
  stations: Record<
    StationId,
    {
      recipe: string | null;
      remaining: number;
      status: 'empty' | 'loaded' | 'processing' | 'ready';
    }
  >;
  actor: { point: ActorPoint; current: ActorJob | null; queue: ActorJob[] };
  recycle: Item | null;
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
  | { station: StationId }
  | { discard: true; confirmed: boolean };
export type Command =
  | { type: 'move'; source: Source; destination: Destination }
  | { type: 'start-machine' }
  | { type: 'start-station'; station: StationId }
  | { type: 'restore-cleared'; tray: TrayId }
  | { type: 'family'; family: Family }
  | { type: 'policy'; support: Support; concurrency: 1 | 2 }
  | { type: 'prepare-cup' }
  | { type: 'actor-anchor'; point: ActorPoint }
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

export interface ActorJob {
  plan: ActorPlan;
  elapsed: number;
  kind: 'helper' | 'delivery' | 'return';
  tray?: TrayId;
  order?: string;
  itemIds: string[];
}
