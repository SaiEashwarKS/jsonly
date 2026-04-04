import { useCallback, useEffect, useRef, useState } from "react";

interface UseDragOptions {
  initialPosition?: { x: number; y: number };
}

export function useDrag(options?: UseDragOptions) {
  const [position, setPosition] = useState(() => {
    if (options?.initialPosition) return options.initialPosition;
    return {
      x: window.innerWidth - 420,
      y: window.innerHeight - 520,
    };
  });

  const titleBarRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  const onMouseMove = useCallback((e: MouseEvent) => {
    const newX = Math.max(0, Math.min(e.clientX - offsetRef.current.x, window.innerWidth - 100));
    const newY = Math.max(0, Math.min(e.clientY - offsetRef.current.y, window.innerHeight - 40));
    setPosition({ x: newX, y: newY });
  }, []);

  const onMouseUp = useCallback(() => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }, [onMouseMove]);

  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      offsetRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
      e.preventDefault();
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [position, onMouseMove, onMouseUp],
  );

  useEffect(() => {
    const el = titleBarRef.current;
    if (!el) return;
    el.addEventListener("mousedown", onMouseDown);
    return () => el.removeEventListener("mousedown", onMouseDown);
  }, [onMouseDown]);

  return { position, titleBarRef };
}
