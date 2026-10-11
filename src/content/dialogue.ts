import data from './dialogue-lines.json' with { type: 'json' };
import { dialogueProducts, foodList, type SpokenLine } from './request-language';
import speech from './speech.json' with { type: 'json' };
export type Speaker = 'dami' | 'guest' | 'rabbit' | 'hedgehog' | 'elder';
export type LineId = keyof typeof data;
export type DialogueTrigger =
  | 'order'
  | 'welcome'
  | 'receive'
  | 'create'
  | 'taste'
  | 'open'
  | 'request-action'
  | 'invite'
  | 'explore'
  | 'plant'
  | 'bunting'
  | 'light'
  | 'cloth'
  | 'unpack'
  | 'place'
  | 'save-work'
  | 'finish'
  | 'preparation'
  | 'process-start'
  | 'process-ready'
  | 'deliver'
  | 'work'
  | 'revisit'
  | 'teaching';
export interface DialogueLine extends SpokenLine {
  role: Speaker;
  trigger: DialogueTrigger;
}
export const lines: DialogueLine[] = [
  ...Object.entries(data).map(([id, d]) => ({
    ...d,
    role: d.role as Speaker,
    trigger: d.trigger as DialogueTrigger,
    audio: `imm-${id}`,
    emphasis: [
      'cup',
      'drawer',
      'basket',
      'table',
      'flower',
      'lights',
      'sandwich',
      'fruit',
      'ice cream',
    ],
  })),
  ...Object.entries(dialogueProducts).flatMap(([id, p]) => [
    {
      text: `I made ${p.one}.`,
      audio: `imm-made-${id}`,
      role: 'dami' as const,
      trigger: 'work' as const,
      emphasis: [p.name],
    },
    {
      text: `I remember your ${p.name}.`,
      audio: `imm-remember-${id}`,
      role: 'guest' as const,
      trigger: 'revisit' as const,
      emphasis: [p.name],
    },
  ]),
];
export function lineFor(id: LineId): DialogueLine {
  const d = data[id];
  return {
    ...d,
    role: d.role as Speaker,
    trigger: d.trigger as DialogueTrigger,
    audio: `imm-${id}`,
    emphasis: lines.find((l) => l.audio === `imm-${id}`)?.emphasis ?? [],
  };
}
export const madeLine = (p: string): DialogueLine | undefined =>
  lines.find((l) => l.audio === `imm-made-${p}`);
export const revisitLine = (p: string | undefined): DialogueLine =>
  lines.find((l) => l.audio === `imm-remember-${p}`) ?? lineFor('welcome');
export const workCaption = (foods: readonly string[]): string => `I made ${foodList(foods)}.`;

/** Existing instructional clips use their registered exact text as their caption. */
export function spokenResource(audio: string): DialogueLine {
  const entry = speech[audio as keyof typeof speech];
  if (!entry) throw new Error(`Missing spoken instruction: ${audio}`);
  return {
    text: entry.text,
    audio,
    emphasis: ['apple', 'banana', 'two', 'cup', 'bread'],
    role: 'dami',
    trigger: 'teaching',
  };
}
