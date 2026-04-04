import { render, screen, fireEvent } from "@testing-library/react";
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

  test("renders button with aria-label", () => {
    render(<JsonOverlayIcon rect={makeRect()} isActive={false} onClick={vi.fn()} />);
    expect(screen.getByLabelText("View JSON")).toBeInTheDocument();
  });

  test("positions button at rect.top+4, rect.right-36", () => {
    render(<JsonOverlayIcon rect={makeRect({ top: 100, right: 400 })} isActive={false} onClick={vi.fn()} />);
    const btn = screen.getByLabelText("View JSON");
    expect(btn.style.top).toBe("104px");
    expect(btn.style.left).toBe("364px");
  });

  test("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<JsonOverlayIcon rect={makeRect()} isActive={false} onClick={onClick} />);
    fireEvent.click(screen.getByLabelText("View JSON"));
    expect(onClick).toHaveBeenCalledOnce();
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

  test("renders when rect is partially on screen", () => {
    render(<JsonOverlayIcon rect={makeRect({ top: -50, bottom: 50 })} isActive={false} onClick={vi.fn()} />);
    expect(screen.getByLabelText("View JSON")).toBeInTheDocument();
  });

  test("applies active styling when isActive is true", () => {
    render(<JsonOverlayIcon rect={makeRect()} isActive={true} onClick={vi.fn()} />);
    expect(screen.getByLabelText("View JSON").className).toContain("bg-blue-600");
  });

  test("applies inactive styling when isActive is false", () => {
    render(<JsonOverlayIcon rect={makeRect()} isActive={false} onClick={vi.fn()} />);
    expect(screen.getByLabelText("View JSON").className).toContain("bg-white/90");
  });
});
