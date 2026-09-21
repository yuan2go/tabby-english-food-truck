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
export interface Profile {
  version: 1;
  prologue: boolean;
  completed: number[];
  introduced: Family[];
  tutorials: string[];
  exposure: string[];
  observations: Observation[];
  support: 'demonstration' | 'pictures' | 'less';
}
export const emptyProfile = (): Profile => ({
  version: 1,
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
        if (validProfile(v)) this.value = v;
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
  introduce(family: Family): void {
    if (!this.value.introduced.includes(family)) this.value.introduced.push(family);
    this.save();
  }
  tutorial(id: string): void {
    this.value.tutorials = [...new Set([...this.value.tutorials, id])].slice(-80);
    this.save();
  }
  observe(value: Observation): void {
    if (this.value.observations.some((o) => o.id === value.id)) return;
    this.value.observations = [...this.value.observations, value].slice(-160);
    this.value.exposure = [...new Set([...this.value.exposure, value.target])].slice(-80);
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
    p.version === 1 &&
    typeof p.prologue === 'boolean' &&
    Array.isArray(p.completed) &&
    p.completed.length <= 5 &&
    p.completed.every((n, i) => n === i) &&
    Array.isArray(p.introduced) &&
    p.introduced.length > 0 &&
    p.introduced.length <= 4 &&
    p.introduced.every((f, i) => f === ['juice', 'ice', 'sandwich', 'burger'][i]) &&
    p.introduced.every((f) => ['juice', 'ice', 'sandwich', 'burger'].includes(f)) &&
    Array.isArray(p.tutorials) &&
    p.tutorials.length <= 80 &&
    new Set(p.tutorials).size === p.tutorials.length &&
    p.tutorials.every((t) => typeof t === 'string' && t.length < 100) &&
    Array.isArray(p.exposure) &&
    p.exposure.length <= 80 &&
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
