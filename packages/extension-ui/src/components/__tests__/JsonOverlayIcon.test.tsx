import { render, screen } from "@testing-library/react";
import { JsonOverlayIcon } from "../JsonOverlayIcon";

function makeRect(overrides: Partial<DOMRect> = {}): DOMRect {
  return {
    top: 100,
    bottom: 200,
    left: 100,
    right: 400,
    width: 300,
    height: 100,
    x: 100,
    y: 100,
    toJSON: () => ({}),
    ...overrides,
  } as DOMRect;
}

describe("JsonOverlayIcon", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", { writable: true, value: 1024 });
    Object.defineProperty(window, "innerHeight", { writable: true, value: 768 });
  });

  test("returns null when rect is above viewport", () => {
    render(<JsonOverlayIcon rect={makeRect({ bottom: -1 })} isActive={false} onClick={vi.fn()} />);
    expect(screen.queryByLabelText("View JSON")).toBeNull();
  });

  test("returns null when rect is below viewport", () => {
    render(<JsonOverlayIcon rect={makeRect({ top: 769 })} isActive={false} onClick={vi.fn()} />);
    expect(screen.queryByLabelText("View JSON")).toBeNull();
  });

  test("returns null when rect is left of viewport", () => {
    render(<JsonOverlayIcon rect={makeRect({ right: -1 })} isActive={false} onClick={vi.fn()} />);
    expect(screen.queryByLabelText("View JSON")).toBeNull();
  });

  test("returns null when rect is right of viewport", () => {
    render(<JsonOverlayIcon rect={makeRect({ left: 1025 })} isActive={false} onClick={vi.fn()} />);
    expect(screen.queryByLabelText("View JSON")).toBeNull();
  });
});
