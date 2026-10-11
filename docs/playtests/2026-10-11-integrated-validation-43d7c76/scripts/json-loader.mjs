// Isolated verification adapter, no repository source changes.
// Native Node22 failure is retained; adapted outcomes are reported separately.
export async function resolve(specifier, context, nextResolve) {
  if (specifier.endsWith('.json')) return nextResolve(specifier, {...context, importAttributes: {...context.importAttributes, type:'json'}});
  return nextResolve(specifier, context);
}
import { readFile } from 'node:fs/promises';
export async function load(url,context,nextLoad) {
  if (url.endsWith('.json')) return {format:'module',source:'export default '+await readFile(new URL(url),'utf8')+';',shortCircuit:true};
  return nextLoad(url,context);
}
