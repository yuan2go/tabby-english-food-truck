import { REQUESTS, type RequestId } from '../content/catalog';
import { CHAPTERS } from '../content/chapters';
import type { Family } from '../content/recipes';
import type { StoragePort } from './save';
export interface Observation {
  id: string;
  dimension: 'meaning' | 'listening' | 'spelling' | 'structure' | 'operation';
  target: string;
  result: string;
  support: string[];
  visit: 'first' | 'revisit';
  audioQualified: false;
}
export interface LessonProgress {
  request: RequestId;
  units: string[];
  index: number;
  phase: 'meaning' | 'try' | 'recipe' | 'done' | 'skipped';
  step: number;
  tries: number;
  nextAttempt: number;
  support: string[];
}
export interface Profile {
  version: 2;
  concurrency: 1 | 2;
  observedIds: string[];
  presented: string[];
  learnedUnits: string[];
  lessons: Record<string, LessonProgress>;
  prologue: boolean;
  completed: number[];
  introduced: Family[];
  tutorials: string[];
  exposure: string[];
  observations: Observation[];
  support: 'demonstration' | 'pictures' | 'less';
}
export const emptyProfile = (): Profile => ({
  version: 2,
  concurrency: 1,
  observedIds: [],
  presented: [],
  learnedUnits: [],
  lessons: {},
  prologue: false,
  completed: [],
  introduced: ['juice'],
  tutorials: [],
  exposure: [],
  observations: [],
  support: 'pictures',
});
const KEY = 'tabby.foodtruck.profile.m2';
export class ProfileStore {
  value = emptyProfile();
  issue = '';
  raw: string | null = null;
  blocked = false;
  constructor(private storage: () => StoragePort) {
    try {
      const raw = storage().getItem(KEY);
      this.raw = raw;
      if (raw) {
        const v: unknown = JSON.parse(raw);
        if (v && typeof v === 'object' && Reflect.get(v, 'version') === 1) {
          const migrated = {
            ...v,
            version: 2,
            concurrency: 1,
            observedIds: [] as string[],
            presented: [],
            learnedUnits: [],
            lessons: {},
          };
          // Old tutorial flags meant "opened", not completed; retain their original raw export.
          if (validProfile(migrated)) {
            migrated.observedIds = migrated.observations.map((o) => o.id);
            migrated.tutorials = migrated.tutorials.map((t) => `legacy-opened:${t}`);
            this.value = migrated;
          } else {
            this.blocked = true;
            this.issue = '旧成长记录未通过校验，原文已保留。';
          }
        } else if (validProfile(v)) this.value = v;
        else {
          this.blocked = true;
          this.issue = '成长记录版本不受支持，原文已保留。';
        }
      }
    } catch {
      this.blocked = this.raw !== null;
      this.issue = this.blocked
        ? '成长记录损坏，原文保留供导出；本次使用临时进度。'
        : '成长记录暂时无法读取，本次仍可玩。';
    }
  }
  save(): void {
    if (this.blocked) return;
    try {
      this.storage().setItem(KEY, JSON.stringify(this.value));
      this.issue = '';
    } catch {
      this.issue = '成长记录仅保留在本次会话，请导出。';
    }
  }
  menu(): RequestId[] {
    // A new endless run always has a tiny spoken foundation: apple, banana, and
    // the basic juice. The active order's Lesson introduces the meaning before
    // any other food can appear; later basket choices add explicit menu items.
    const foundation = new Set<RequestId>(['apple', 'banana', 'juice']);
    return (Object.keys(REQUESTS) as RequestId[]).filter(
      (id) =>
        foundation.has(id) ||
        this.value.tutorials.includes(`request-${id}`) ||
        this.value.presented.includes(`menu:${id}`),
    );
  }
  present(id: string): void {
    if (this.value.presented.includes(id)) return;
    this.value.presented = [...this.value.presented, id].slice(-240);
    this.save();
  }
  lesson(key: string, value: LessonProgress): void {
    this.value.lessons[key] = value;
    const keys = Object.keys(this.value.lessons);
    for (const old of keys.slice(0, Math.max(0, keys.length - 40))) delete this.value.lessons[old];
    this.save();
  }
  introduce(family: Family): void {
    if (!this.value.introduced.includes(family)) this.value.introduced.push(family);
    this.save();
  }
  tutorial(id: string): void {
    this.value.tutorials = [...new Set([...this.value.tutorials, id])].slice(-240);
    this.save();
  }
  observe(value: Observation): void {
    if (this.value.observedIds.includes(value.id)) return;
    this.value.observedIds = [...this.value.observedIds, value.id].slice(-1200);
    this.value.observations = [...this.value.observations, value].slice(-160);
    this.value.exposure = [...new Set([...this.value.exposure, value.target])].slice(-240);
    this.save();
  }
  complete(chapter: number): void {
    if (!CHAPTERS[chapter]) return;
    this.value.completed = [...new Set([...this.value.completed, chapter])];
    this.save();
  }
}
export function validProfile(v: unknown): v is Profile {
  if (!v || typeof v !== 'object') return false;
  const p = v as Partial<Profile>;
  return (
    p.version === 2 &&
    Array.isArray(p.observedIds) &&
    p.observedIds.length <= 1200 &&
    p.observedIds.every((x) => typeof x === 'string' && x.length < 160) &&
    [1, 2].includes(p.concurrency ?? 0) &&
    Array.isArray(p.presented) &&
    p.presented.length <= 240 &&
    p.presented.every((x) => typeof x === 'string' && x.length < 100) &&
    Array.isArray(p.learnedUnits) &&
    p.learnedUnits.length <= 80 &&
    p.learnedUnits.every((x) => typeof x === 'string' && x.length < 100) &&
    !!p.lessons &&
    typeof p.lessons === 'object' &&
    Object.keys(p.lessons).length <= 40 &&
    Object.values(p.lessons).every(
      (l) =>
        l &&
        l.request in REQUESTS &&
        Array.isArray(l.units) &&
        l.units.length <= 12 &&
        l.units.every((u) => typeof u === 'string' && u.length < 100) &&
        Number.isInteger(l.index) &&
        l.index >= 0 &&
        l.index <= l.units.length &&
        ['meaning', 'try', 'recipe', 'done', 'skipped'].includes(l.phase) &&
        Number.isInteger(l.step) &&
        l.step >= 0 &&
        l.step < 4 &&
        Number.isInteger(l.nextAttempt) &&
        l.nextAttempt >= 0 &&
        l.nextAttempt < 1e9 &&
        Number.isInteger(l.tries) &&
        l.tries >= 0 &&
        Array.isArray(l.support) &&
        l.support.length <= 24 &&
        l.support.every((x) => typeof x === 'string'),
    ) &&
    typeof p.prologue === 'boolean' &&
    Array.isArray(p.completed) &&
    p.completed.length <= 5 &&
    p.completed.every((n, i) => n === i) &&
    Array.isArray(p.introduced) &&
    p.introduced.length > 0 &&
    p.introduced.length <= 5 &&
    p.introduced
      .filter((f) => f !== 'ready')
      .every((f, i) => f === ['juice', 'ice', 'sandwich', 'burger'][i]) &&
    new Set(p.introduced).size === p.introduced.length &&
    p.introduced.every((f) => ['juice', 'ice', 'sandwich', 'burger', 'ready'].includes(f)) &&
    Array.isArray(p.tutorials) &&
    p.tutorials.length <= 240 &&
    new Set(p.tutorials).size === p.tutorials.length &&
    p.tutorials.every((t) => typeof t === 'string' && t.length < 100) &&
    Array.isArray(p.exposure) &&
    p.exposure.length <= 240 &&
    new Set(p.exposure).size === p.exposure.length &&
    p.exposure.every((t) => typeof t === 'string' && t.length < 100) &&
    ['demonstration', 'pictures', 'less'].includes(p.support ?? '') &&
    Array.isArray(p.observations) &&
    p.observations.length <= 160 &&
    new Set(p.observations.map((o) => o?.id)).size === p.observations.length &&
    p.observations.every(
      (o) =>
        o &&
        typeof o.id === 'string' &&
        o.id.length < 160 &&
        ['meaning', 'listening', 'spelling', 'structure', 'operation'].includes(o.dimension) &&
        typeof o.target === 'string' &&
        o.target.length < 100 &&
        typeof o.result === 'string' &&
        Array.isArray(o.support) &&
        o.support.length <= 24 &&
        o.support.every((s) => typeof s === 'string') &&
        ['first', 'revisit'].includes(o.visit) &&
        o.audioQualified === false,
    )
  );
}
