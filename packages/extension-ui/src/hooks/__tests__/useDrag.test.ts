import { renderHook, act, render, screen } from "@testing-library/react";
import { createElement, useState } from "react";
import { useDrag } from "../useDrag";

// Test drag by rendering a component that uses the hook with a real DOM element
function DragTestComponent({
  initialX,
  initialY,
}: {
  initialX: number;
  initialY: number;
}) {
  const { position, titleBarRef } = useDrag({
    initialPosition: { x: initialX, y: initialY },
  });
  return createElement(
    "div",
    { "data-testid": "container", "data-x": position.x, "data-y": position.y },
    createElement(
      "div",
      { ref: titleBarRef, "data-testid": "handle" },
      "drag handle",
    ),
  );
}

describe("useDrag", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", { writable: true, value: 1024 });
    Object.defineProperty(window, "innerHeight", { writable: true, value: 768 });
  });

  test("uses default bottom-right position when no initialPosition given", () => {
    const { result } = renderHook(() => useDrag());
    expect(result.current.position).toEqual({
      x: 1024 - 420,
      y: 768 - 520,
    });
  });

  test("uses initialPosition when provided", () => {
    const { result } = renderHook(() =>
      useDrag({ initialPosition: { x: 100, y: 200 } }),
    );
    expect(result.current.position).toEqual({ x: 100, y: 200 });
  });

  test("updates position on drag sequence", () => {
    render(createElement(DragTestComponent, { initialX: 100, initialY: 100 }));
    const handle = screen.getByTestId("handle");
    const container = screen.getByTestId("container");

    // mousedown on handle
    act(() => {
      handle.dispatchEvent(
        new MouseEvent("mousedown", {
          clientX: 110,
          clientY: 110,
          bubbles: true,
        }),
      );
    });

    // mousemove on document
    act(() => {
      document.dispatchEvent(
        new MouseEvent("mousemove", {
          clientX: 200,
          clientY: 200,
          bubbles: true,
        }),
      );
    });

    expect(container.dataset.x).toBe("190");
    expect(container.dataset.y).toBe("190");

    // mouseup stops drag
    act(() => {
      document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    });

    // Further mousemove should not change position
    act(() => {
      document.dispatchEvent(
        new MouseEvent("mousemove", {
          clientX: 500,
          clientY: 500,
          bubbles: true,
        }),
      );
    });

    expect(container.dataset.x).toBe("190");
    expect(container.dataset.y).toBe("190");
  });

  test("clamps position to viewport bounds", () => {
    render(createElement(DragTestComponent, { initialX: 100, initialY: 100 }));
    const handle = screen.getByTestId("handle");
    const container = screen.getByTestId("container");

    act(() => {
      handle.dispatchEvent(
        new MouseEvent("mousedown", {
          clientX: 100,
          clientY: 100,
          bubbles: true,
        }),
      );
    });

    // Drag to negative coordinates
    act(() => {
      document.dispatchEvent(
        new MouseEvent("mousemove", {
          clientX: -100,
          clientY: -100,
          bubbles: true,
        }),
      );
    });

    expect(container.dataset.x).toBe("0");
    expect(container.dataset.y).toBe("0");
  });
});
