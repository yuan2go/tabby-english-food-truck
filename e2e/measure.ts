import type { Page } from '@playwright/test';
export async function installMeasure(page: Page) {
  await page.addInitScript(() => {
    const m = { frames: [] as number[], response: [] as number[], last: 0, running: false };
    Object.assign(window, { m2measure: m });
    const frame = (t: number) => {
      if (m.running && m.last) m.frames.push(t - m.last);
      m.last = t;
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    document.addEventListener(
      'pointerup',
      () => {
        if (!m.running) return;
        const t = performance.now();
        requestAnimationFrame(() =>
          requestAnimationFrame(() => m.response.push(performance.now() - t)),
        );
      },
      true,
    );
  });
}
export async function startMeasure(page: Page) {
  await page.evaluate(() => {
    const m = (
      window as unknown as {
        m2measure: { frames: number[]; response: number[]; running: boolean; last: number };
      }
    ).m2measure;
    m.frames = [];
    m.response = [];
    m.last = 0;
    m.running = true;
  });
}
export async function endMeasure(page: Page) {
  return page.evaluate(() => {
    const m = (
      window as unknown as { m2measure: { frames: number[]; response: number[]; running: boolean } }
    ).m2measure;
    m.running = false;
    const stats = (a: number[]) => {
      const list = [...a].sort((a, b) => a - b);
      const at = (q: number) => list[Math.min(list.length - 1, Math.floor(list.length * q))] ?? 0;
      return { count: list.length, medianMs: at(0.5), p95Ms: at(0.95), maxMs: at(1) };
    };
    const c = document.querySelector('canvas'),
      root = document.querySelector('main');
    return {
      environment:
        'Headless Chromium on developer macOS; touch and DPR emulation, not a physical device',
      frameIntervals: stats(m.frames),
      pointerUpToTwoFrames: stats(m.response),
      viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
      canvas: { width: c?.width, height: c?.height, scale: c?.dataset.renderScale },
      build: root?.dataset.buildSha,
      dirty: root?.dataset.buildDirty,
      assets: root?.dataset.assetVersion,
      resources: (performance.getEntriesByType('resource') as PerformanceResourceTiming[]).map(
        (r) => ({
          name: r.name.split('/').pop(),
          encodedBytes: r.encodedBodySize,
          transferBytes: r.transferSize,
          durationMs: r.duration,
        }),
      ),
    };
  });
}
