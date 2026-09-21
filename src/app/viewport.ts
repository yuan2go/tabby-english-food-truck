import { type RefObject, useLayoutEffect } from 'react';
/** One owner of visible viewport sizing. Safe-area padding belongs only to this host. */
export function useViewport(ref: RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    const host = ref.current;
    if (!host) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const v = window.visualViewport;
      const width = v?.width ?? innerWidth,
        height = v?.height ?? innerHeight;
      host.style.width = `${Math.round(width)}px`;
      host.style.height = `${Math.round(height)}px`;
      host.style.left = `${Math.round(v?.offsetLeft ?? 0)}px`;
      host.style.top = `${Math.round(v?.offsetTop ?? 0)}px`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('resize', schedule);
    window.visualViewport?.addEventListener('resize', schedule);
    window.visualViewport?.addEventListener('scroll', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
      window.visualViewport?.removeEventListener('resize', schedule);
      window.visualViewport?.removeEventListener('scroll', schedule);
    };
  }, [ref]);
}
