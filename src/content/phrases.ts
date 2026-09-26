import { type Fruit, TOKENS } from './catalog';
export type PhraseResult =
  | { kind: 'valid'; fruits: Fruit[]; normalized: string }
  | { kind: 'incomplete' | 'language-adjust' | 'outside'; message: string };
export function parsePhrase(input: string): PhraseResult {
  const normalized = input
    .toLowerCase()
    .replace(/[.,!?，。！]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
  if (!normalized) return { kind: 'incomplete', message: '先把想说的词放到便签上。' };
  let words = normalized.split(' ');
  if (words[0] === 'please') words = words.slice(1);
  if (words.at(-1) === 'please') words = words.slice(0, -1);
  if (!words.length || words.at(-1) === 'and')
    return { kind: 'incomplete', message: '便签还没写完，可以接着放词。' };
  if (
    words.some(
      (w) => !['a', 'an', 'one', 'two', 'apple', 'apples', 'banana', 'bananas', 'and'].includes(w),
    )
  )
    return { kind: 'outside', message: '这张便签目前认识 apple、banana、one、two 和 and。' };
  const parts = words.join(' ').split(' and ');
  if (parts.length > 2) return { kind: 'outside', message: '大咪一次最多拿两份水果。' };
  const fruits: Fruit[] = [];
  for (const part of parts) {
    const pieces = part.split(' ');
    if (pieces.length === 1 && ['apple', 'banana'].includes(pieces[0] ?? '')) {
      fruits.push(pieces[0] as Fruit);
      continue;
    }
    const [det, noun, extra] = pieces;
    if (!noun) return { kind: 'incomplete', message: '再告诉大咪要什么水果。' };
    if (extra || !det) return { kind: 'outside', message: '试试一个数量词配一个水果词。' };
    const fruit: Fruit | undefined =
      noun === 'apple' || noun === 'apples'
        ? 'apple'
        : noun === 'banana' || noun === 'bananas'
          ? 'banana'
          : undefined;
    if (!fruit || !['a', 'an', 'one', 'two'].includes(det))
      return { kind: 'outside', message: '这句话超出大咪当前认识的表达。' };
    const two = det === 'two';
    const correctArticle =
      (det !== 'a' && det !== 'an') || det === (fruit === 'apple' ? 'an' : 'a');
    if (!correctArticle || noun !== `${fruit}${two ? 's' : ''}`)
      return {
        kind: 'language-adjust',
        message: '一个用 an apple / a banana；两个用 two apples / two bananas。',
      };
    fruits.push(fruit);
    if (two) fruits.push(fruit);
  }
  if (fruits.length > 2) return { kind: 'outside', message: '大咪一次最多拿两份水果。' };
  return { kind: 'valid', fruits, normalized };
}
export function parseTokens(ids: readonly string[]): PhraseResult {
  if (ids.length > 12 || new Set(ids).size !== ids.length)
    return { kind: 'outside', message: '每张词块只能使用一次。' };
  const tokens = ids.map((id) => TOKENS.find((t) => t.id === id));
  if (tokens.some((t) => !t)) return { kind: 'outside', message: '这张词块不在便签盒里。' };
  return parsePhrase(tokens.map((t) => t?.text ?? '').join(' '));
}
