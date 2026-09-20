/** Phaser 3.90 has no GameConfig.resolution. Resize the actual buffer and use a
 * CSS-sized world camera. The same CSS coordinate system serves DOM and input. */
export function renderScale(width: number, height: number, dpr: number, low = false): number {
  const pixelBudget = low ? 1_000_000 : 2_400_000;
  return Math.min(low ? 1.25 : 2.5, dpr, Math.sqrt(pixelBudget / Math.max(1, width * height)));
}
