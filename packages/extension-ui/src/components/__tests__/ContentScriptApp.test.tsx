import { render } from "@testing-library/react";
import { ContentScriptApp } from "../ContentScriptApp";

function mockMatchMedia(matches = false) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn(() => ({
      matches,
      media: "(prefers-color-scheme: dark)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
}

describe("ContentScriptApp", () => {
  beforeEach(() => {
    mockMatchMedia();
    Object.defineProperty(window, "innerWidth", { writable: true, value: 1024 });
    Object.defineProperty(window, "innerHeight", { writable: true, value: 768 });
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders nothing when document has no JSON", () => {
    const { container } = render(<ContentScriptApp />);
    expect(container.innerHTML).toBe("");
  });
});
