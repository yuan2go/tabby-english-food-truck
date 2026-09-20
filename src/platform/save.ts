import type { Mode } from '../content/catalog';
import { type DecodeResult, decodeSnapshot, validateState } from '../rules/snapshot';
import type { GameState } from '../rules/types';
export const SAVE_KEY = 'tabby.foodtruck.save.v1';
export const BACKUP_KEY = `${SAVE_KEY}.previous`;
export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
export class SaveStore {
  blocked = false;
  issue = '';
  raw: string | null = null;
  private previousValid: string | null = null;
  constructor(private readonly storage: () => StoragePort) {}
  load(): DecodeResult | null {
    try {
      this.raw = this.storage().getItem(SAVE_KEY);
      if (!this.raw) return null;
      const result = decodeSnapshot(this.raw);
      if (!result.ok) {
        this.blocked = true;
        this.issue = result.reason;
      }
      if (result.ok) this.previousValid = this.raw;
      return result;
    } catch {
      this.issue = '无法读取本地存档。本局可继续，离开前请导出。';
      return null;
    }
  }
  loadMode(mode: Mode): GameState | null {
    try {
      const raw = this.storage().getItem(`${SAVE_KEY}.${mode}`);
      if (!raw) return null;
      const decoded = decodeSnapshot(raw);
      if (!decoded.ok) {
        this.raw = raw;
        this.blocked = true;
        this.issue = `这个玩法的${decoded.reason}`;
        return null;
      }
      return decoded.state.mode === mode ? decoded.state : null;
    } catch {
      return null;
    }
  }
  save(s: GameState): boolean {
    if (this.blocked) return false;
    if (!validateState(s)) {
      this.issue = '当前状态未通过存档校验，未覆盖旧档。';
      return false;
    }
    try {
      const store = this.storage();
      if (this.previousValid) store.setItem(BACKUP_KEY, this.previousValid);
      const raw = JSON.stringify(s);
      store.setItem(SAVE_KEY, raw);
      store.setItem(`${SAVE_KEY}.${s.mode}`, raw);
      this.raw = raw;
      this.previousValid = raw;
      this.issue = '';
      return true;
    } catch {
      this.issue = '本地保存失败。本局仍可玩，离开前请导出进度。';
      return false;
    }
  }
  reset(): void {
    try {
      this.storage().removeItem(SAVE_KEY);
      this.storage().removeItem(BACKUP_KEY);
    } catch {
      this.issue = '无法清理存储，本局使用临时进度。';
    }
    this.blocked = false;
    this.raw = null;
    this.previousValid = null;
  }
}
