import type { MiniLevel } from './mini-levels';
import { VOCABULARY } from './vocabulary';
/** Small meaning-first batches: all concepts occur in sound selection and multi-pairing. */
export const VOCAB_COURSES: readonly MiniLevel[] = [
  ...new Set(VOCABULARY.map((w) => w.batch)),
].flatMap((batch, index) => {
  const words = VOCABULARY.filter((w) => w.batch === batch);
  const title = words.map((w) => w.chinese).join('、');
  return (['listen', 'pair'] as const).map((kind) => ({
    id: `vocabulary-${kind}-${batch}`,
    kind,
    theme: words[0]?.group === 'food' ? '食品回访' : '小院新朋友',
    title: `${kind === 'listen' ? '听音观察' : '成组找朋友'} · ${title}`,
    goal: kind === 'listen' ? '听声音，观察物件或动作，再找一找' : '把每个声音配到真实物件或动作',
    scene: `第${index + 1}小组，先认识这一小组；动作和方位看演示。`,
    foundation: 'new',
    targets: words.map((w) => w.id),
    pool: words.map((w) => w.id),
    support: '每次只认识一个；重听、图示、动作可随时看',
    completion: '这组朋友见过面了，可以在场景里再遇见',
  }));
});
