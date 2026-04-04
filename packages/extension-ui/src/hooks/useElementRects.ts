import { useEffect, useState } from "react";

export function useElementRects(elements: HTMLElement[]): DOMRect[] {
  const [rects, setRects] = useState<DOMRect[]>([]);

  useEffect(() => {
    if (elements.length === 0) return;

    function measure() {
      setRects(elements.map((el) => el.getBoundingClientRect()));
    }
    measure();

    let rafId: number;
    function onScrollOrResize() {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(measure);
    }

    window.addEventListener("scroll", onScrollOrResize, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScrollOrResize, { capture: true });
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [elements]);

  return rects;
}
