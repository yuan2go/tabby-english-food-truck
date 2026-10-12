import type { AdventureState, Visitor, WorldFood } from './adventure';
import type { Product } from './recipes';

export const TOOLS = ['seed', 'watering-can', 'mat', 'lantern', 'spoon'] as const;
export type Tool = (typeof TOOLS)[number];
export type NeedKind = 'fruit' | 'drink' | 'cool' | 'savory' | 'any';
export interface SharingNeed {
  visitor: Visitor;
  kind: NeedKind;
  basis: 'first' | 'packing' | 'table' | 'treat';
  fulfilled: string[];
}
export interface WorldMoment {
  id: string;
  kind: 'receive' | 'place' | 'taste' | 'tool' | 'water' | 'cooperate' | 'share' | 'finish';
  at: number;
  foods: { id: string; product: Product; visitor?: Visitor }[];
  destination?: 'basket' | 'work' | 'table';
  visitor?: Visitor;
  seat?: 0 | 1 | 2;
  tool?: Tool;
  prop?: 'cup';
}
export type Decoration =
  | { kind: 'bunting'; value: 'warm' | 'cool' }
  | { kind: 'cloth'; value: 'leaf' | 'sun' }
  | { kind: 'light'; value: 'warm' | 'moon' };
export interface AdventureExperience {
  heldDecoration?: Decoration | null;
  heldTool?: Tool | null;
  version: 2;
  tools: Tool[];
  used: ('water' | 'compare' | 'cooperate' | 'share')[];
  helpers: { visitor: Visitor; role: 'cups' | 'lantern' }[];
  needs: SharingNeed[];
  known: Product[];
  picnic: 'rabbit' | 'hedgehog' | null;
  moments: WorldMoment[];
}
export const emptyExperience = (): AdventureExperience => ({
  version: 2,
  tools: [],
  used: [],
  helpers: [],
  needs: [],
  known: [],
  picnic: null,
  moments: [],
});
export const FOOD_GROUPS: Record<NeedKind, readonly Product[]> = {
  fruit: [
    'apple',
    'banana',
    'orange',
    'pear',
    'peach',
    'fresh-strawberry',
    'grape',
    'watermelon',
    'mango',
    'pineapple',
  ],
  drink: ['juice', 'banana-juice', 'milk', 'smoothie', 'milkshake'],
  cool: ['vanilla-cup', 'vanilla-cone', 'strawberry-cup', 'double-cream', 'banana-cream', 'yogurt'],
  savory: ['sandwich', 'salad-sandwich', 'burger', 'cheese-burger'],
  any: [],
};
export const needAccepts = (need: SharingNeed, food: WorldFood): boolean =>
  need.kind === 'any' || FOOD_GROUPS[need.kind].includes(food.product);
export const visitorSeat = (visitor: Visitor): 0 | 1 | 2 =>
  visitor === 'rabbit' ? 0 : visitor === 'hedgehog' ? 1 : 2;
export const foodVisitor = (food: WorldFood): Visitor =>
  food.tastedBy ??
  (food.place === 'guest-hedgehog' || food.place === 'table:1'
    ? 'hedgehog'
    : food.place === 'guest-elder' || food.place === 'table:2'
      ? 'elder'
      : 'rabbit');
export function drawerTools(a: AdventureState): readonly Tool[] {
  if (a.chapter === 0 && a.explored.includes('drawer')) return ['seed', 'watering-can'];
  if (a.chapter === 1 && a.explored.includes('recipe')) return ['spoon'];
  if (a.chapter === 2 && a.branch === 'hedgehog' && a.explored.includes('drawer')) return ['mat'];
  if (a.chapter === 3 && a.explored.includes('drawer')) return ['lantern'];
  if (a.rewards.length || a.kind === 'shop') return TOOLS;
  return [];
}
export function returningNeed(exp: AdventureExperience, visitor: Visitor): SharingNeed {
  const cool = exp.known.some((p) => FOOD_GROUPS.cool.includes(p));
  const kind: NeedKind =
    visitor === 'rabbit'
      ? exp.picnic === 'rabbit'
        ? 'savory'
        : exp.picnic === 'hedgehog'
          ? 'drink'
          : 'fruit'
      : visitor === 'hedgehog'
        ? cool
          ? 'cool'
          : 'drink'
        : exp.known.some((p) => FOOD_GROUPS.savory.includes(p))
          ? 'savory'
          : 'any';
  return {
    visitor,
    kind,
    basis:
      visitor === 'hedgehog' && cool
        ? 'treat'
        : exp.picnic === 'rabbit'
          ? 'packing'
          : exp.picnic === 'hedgehog'
            ? 'table'
            : 'first',
    fulfilled: [],
  };
}
export const NEED_AUDIO: Record<NeedKind, string> = {
  fruit: 'imm-sharing-fruit',
  drink: 'imm-sharing-drink',
  cool: 'imm-sharing-cool',
  savory: 'imm-sharing-savory',
  any: 'imm-sharing-any',
};
