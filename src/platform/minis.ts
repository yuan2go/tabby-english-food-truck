import { MINI_LEVELS, miniLevel } from '../content/mini-levels';
import { type CourseState, validateCourse } from '../rules/mini-course';
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
export const COURSE_KEY = 'tabby.foodtruck.mini-course.v1';
export const miniKey = (kind: MiniKind, mode: MatchMode = 'listen') =>
  kind === 'spell' ? 'spell' : `match-${mode}`;
/** One session-lifetime owner, including when storage is refused or the React screen unmounts. */
export class MiniStore {
  sessions: Record<string, MiniState> = {};
  courses: Record<string, CourseState> = {};
  completedCourses: string[] = [];
  courseRaw: string | null = null;
  courseBlocked = false;
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
    try {
      this.courseRaw = storage().getItem(COURSE_KEY);
      if (this.courseRaw) {
        if (this.courseRaw.length > 240000) throw Error('size');
        const saved: unknown = JSON.parse(this.courseRaw);
        if (!saved || typeof saved !== 'object') throw Error('format');
        const value = saved as { version?: unknown; courses?: unknown; completed?: unknown };
        if (
          value.version !== 1 ||
          !value.courses ||
          typeof value.courses !== 'object' ||
          Array.isArray(value.courses) ||
          Object.keys(value.courses).length > MINI_LEVELS.length ||
          !Array.isArray(value.completed) ||
          value.completed.length > MINI_LEVELS.length ||
          value.completed.some((id) => typeof id !== 'string' || !miniLevel(id)) ||
          new Set(value.completed).size !== value.completed.length
        )
          throw Error('format');
        for (const [id, state] of Object.entries(value.courses))
          if (!miniLevel(id) || !validateCourse(state) || state.levelId !== id)
            throw Error('course');
        this.courses = value.courses as Record<string, CourseState>;
        this.completedCourses = value.completed;
      }
    } catch {
      this.courseBlocked = this.courseRaw !== null;
      this.issue = '新关卡记录未通过校验，原文保留供导出；本次可以临时玩。';
    }
  }
  saveCourse(state: CourseState): void {
    if (!validateCourse(state)) {
      this.issue = '当前关卡状态未通过校验，保留上一份进度。';
      return;
    }
    this.courses[state.levelId] = state;
    if (state.phase === 'done')
      this.completedCourses = [...new Set([...this.completedCourses, state.levelId])];
    if (this.courseBlocked) return;
    try {
      this.storage().setItem(
        COURSE_KEY,
        JSON.stringify({ version: 1, courses: this.courses, completed: this.completedCourses }),
      );
      this.issue = '';
    } catch {
      this.issue = '新关卡仅保留在本次内存中，离开前请导出。';
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
      courses: this.courses,
      completedCourses: this.completedCourses,
      protectedCourseRaw: this.courseBlocked ? this.courseRaw : null,
      protectedRaw: this.blocked ? this.raw : null,
      legacyRaw: this.legacyRaw,
    };
  }
}
