import { useLayoutEffect, useRef } from "react";

// FLIP reorder animation for a list of children. Mark each animatable child
// with `data-flip-key={stableId}` and attach the returned ref to their parent.
// On every render the hook measures children with that attribute, compares to
// the positions captured on the previous render, and plays an inverse-then-
// release transform via the Web Animations API.
export function useFlipContainer<T extends HTMLElement>() {
  const containerRef = useRef<T | null>(null);
  const prev = useRef<Map<string, DOMRect>>(new Map());

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const els = Array.from(
      node.querySelectorAll<HTMLElement>("[data-flip-key]"),
    );
    const next = new Map<string, DOMRect>();
    for (const el of els) {
      next.set(el.dataset.flipKey!, el.getBoundingClientRect());
    }
    for (const el of els) {
      const key = el.dataset.flipKey!;
      const p = prev.current.get(key);
      const n = next.get(key)!;
      if (!p) continue;
      const dx = p.left - n.left;
      const dy = p.top - n.top;
      if (dx === 0 && dy === 0) continue;
      el.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: "translate(0, 0)" },
        ],
        { duration: 280, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" },
      );
    }
    prev.current = next;
  });

  return containerRef;
}
