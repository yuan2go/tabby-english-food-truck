import { useLayoutEffect, useRef } from 'react';

/** One modal keyboard and pointer boundary, including controls outside content wrappers. */
export function useDialogFocus(key: string | null) {
  const returnFocus = useRef<Element | null>(null);
  const currentKey = useRef(key);
  currentKey.current = key;
  useLayoutEffect(() => {
    if (!key) return;
    // Preserve the original trigger across help → comparison and other modal replacements.
    if (!returnFocus.current) returnFocus.current = document.activeElement;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    if (!dialog) return;
    const controls = () =>
      [
        ...dialog.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]',
        ),
      ].filter((el) => el.getClientRects().length > 0 && !el.closest('[inert]'));
    const initial = () =>
      dialog.querySelector<HTMLElement>('[data-dialog-initial]') ?? controls()[0] ?? dialog;
    const previousTabIndex = dialog.getAttribute('tabindex');
    dialog.tabIndex = -1;
    // Isolate every sibling branch on the way to the root, not just the board.
    // Preserve existing inert attributes; cleanup must not enable another modal's background.
    const isolated: { node: HTMLElement; inert: boolean }[] = [];
    let branch: HTMLElement = dialog;
    while (branch.parentElement && branch.parentElement !== document.documentElement) {
      for (const sibling of branch.parentElement.children) {
        if (
          sibling !== branch &&
          sibling instanceof HTMLElement &&
          !['SCRIPT', 'STYLE'].includes(sibling.tagName)
        ) {
          isolated.push({ node: sibling, inert: sibling.inert });
          sibling.inert = true;
        }
      }
      branch = branch.parentElement;
    }
    initial().focus({ preventScroll: true });
    const refocus = () => {
      if (!dialog.contains(document.activeElement)) initial().focus({ preventScroll: true });
    };
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const items = controls(),
        first = items[0],
        last = items.at(-1);
      if (!first || !last) {
        event.preventDefault();
        dialog.focus();
      } else if (
        event.shiftKey &&
        (document.activeElement === first || !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', trap, true);
    document.addEventListener('focusin', refocus);
    return () => {
      document.removeEventListener('keydown', trap, true);
      document.removeEventListener('focusin', refocus);
      for (const { node, inert } of isolated) node.inert = inert;
      if (previousTabIndex === null) dialog.removeAttribute('tabindex');
      else dialog.setAttribute('tabindex', previousTabIndex);
      const previous = returnFocus.current;
      if (previous instanceof HTMLElement && previous.isConnected && !previous.closest('[inert]'))
        previous.focus({ preventScroll: true });
      if (!currentKey.current) returnFocus.current = null;
    };
  }, [key]);
}
