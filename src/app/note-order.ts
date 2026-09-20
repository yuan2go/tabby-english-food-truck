/** Boundary is measured in the original sequence (0..length), never the filtered one. */
export function insertToken(ids: readonly string[], id: string, boundary: number): string[] {
  const previous = ids.indexOf(id);
  const target = Math.max(0, Math.min(ids.length, boundary));
  const next = ids.filter((token) => token !== id);
  next.splice(target - (previous >= 0 && previous < target ? 1 : 0), 0, id);
  return next;
}
