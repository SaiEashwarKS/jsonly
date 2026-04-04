import { renderHook, act } from "@testing-library/react";
import { useSystemTheme } from "../useSystemTheme";

function mockMatchMedia(matches: boolean) {
  const listeners: Array<(e: { matches: boolean }) => void> = [];
  const mql = {
    matches,
    media: "(prefers-color-scheme: dark)",
    addEventListener: vi.fn(
      (_event: string, handler: (e: { matches: boolean }) => void) => {
        listeners.push(handler);
      },
    ),
    removeEventListener: vi.fn(),
  };
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn(() => mql),
  });
  return { mql, listeners };
}

describe("useSystemTheme", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns isDark false when system prefers light", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useSystemTheme());
    expect(result.current.isDark).toBe(false);
  });

  test("returns isDark true when system prefers dark", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useSystemTheme());
    expect(result.current.isDark).toBe(true);
  });

  test("updates reactively when preference changes", () => {
    const { listeners } = mockMatchMedia(false);
    const { result } = renderHook(() => useSystemTheme());
    expect(result.current.isDark).toBe(false);

    act(() => {
      for (const listener of listeners) {
        listener({ matches: true });
      }
    });
    expect(result.current.isDark).toBe(true);
  });

  test("cleans up listener on unmount", () => {
    const { mql } = mockMatchMedia(false);
    const { unmount } = renderHook(() => useSystemTheme());
    unmount();
    expect(mql.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });
});
