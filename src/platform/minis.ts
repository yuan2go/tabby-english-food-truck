import {
  decodeMini,
  type MatchMode,
  type MiniKind,
  type MiniState,
  validateMini,
} from '../rules/minigames';
import type { StoragePort } from './save';
export const MINI_KEY = 'tabby.foodtruck.minigame.m21';
export const MINI_LEGACY = 'tabby.foodtruck.minigame.m2';
export const miniKey = (kind: MiniKind, mode: MatchMode = 'listen') =>
  kind === 'spell' ? 'spell' : `match-${mode}`;
/** One session-lifetime owner, including when storage is refused or the React screen unmounts. */
export class MiniStore {
  sessions: Record<string, MiniState> = {};
  issue = '';
  raw: string | null = null;
  legacyRaw: string | null = null;
  blocked = false;
  constructor(private storage: () => StoragePort) {
    try {
      this.raw = storage().getItem(MINI_KEY);
      this.legacyRaw = storage().getItem(MINI_LEGACY);
      if (this.raw) {
        if (this.raw.length > 240000) throw Error('size');
        const v = JSON.parse(this.raw);
        if (
          v?.version !== 1 ||
          !v.sessions ||
          typeof v.sessions !== 'object' ||
          Object.keys(v.sessions).length > 4
        )
          throw Error('format');
        for (const [key, value] of Object.entries(v.sessions)) {
          if (!validateMini(value) || miniKey(value.kind, value.mode) !== key)
            throw Error('session');
        }
        this.sessions = v.sessions;
      } else if (this.legacyRaw) {
        const old = decodeMini(this.legacyRaw);
        if (old) this.sessions[miniKey(old.kind, old.mode)] = old;
        else this.issue = '旧小游戏记录未通过校验，原文保留供导出；可以开始新的活动。';
      }
    } catch {
      this.blocked = this.raw !== null;
      this.issue = this.blocked
        ? '小游戏存档未通过校验，原文保留；本次可以临时玩并导出。'
        : '小游戏存储不可用，本次进度留在内存。';
    }
  }
  save(state: MiniState): void {
    if (!validateMini(state)) {
      this.issue = '当前小游戏状态未通过校验，保留上一份进度。';
      return;
    }
    this.sessions[miniKey(state.kind, state.mode)] = state;
    if (this.blocked) return;
    try {
      this.storage().setItem(MINI_KEY, JSON.stringify({ version: 1, sessions: this.sessions }));
      this.issue = '';
    } catch {
      this.issue = '小游戏仅保留在本次内存中，离开前请导出。';
    }
  }
  export() {
    return {
      sessions: this.sessions,
      protectedRaw: this.blocked ? this.raw : null,
      legacyRaw: this.legacyRaw,
    };
  }
}
