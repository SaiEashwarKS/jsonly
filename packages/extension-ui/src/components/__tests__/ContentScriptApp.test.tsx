import { render, screen, fireEvent, within } from "@testing-library/react";
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

const addedElements: HTMLElement[] = [];

function addJsonPre(json: string): HTMLPreElement {
  const pre = document.createElement("pre");
  pre.textContent = json;
  document.body.appendChild(pre);
  addedElements.push(pre);
  return pre;
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
    for (const el of addedElements) el.remove();
    addedElements.length = 0;
    vi.restoreAllMocks();
  });

  test("renders nothing when document has no JSON", () => {
    const { container } = render(<ContentScriptApp />);
    expect(container.innerHTML).toBe("");
  });

  test("shows one overlay icon per JSON match", () => {
    addJsonPre('{"a":1}');
    addJsonPre('{"b":2}');
    render(<ContentScriptApp />);
    expect(screen.getAllByLabelText("View JSON")).toHaveLength(2);
  });

  test("clicking an icon opens the JSON viewer", () => {
    addJsonPre('{"hello":"world"}');
    const { container } = render(<ContentScriptApp />);
    fireEvent.click(screen.getByLabelText("View JSON"));
    expect(screen.getByLabelText("Close")).toBeInTheDocument();
    expect(within(container).getByText(/hello/)).toBeInTheDocument();
  });

  test("clicking the same icon again closes the viewer", () => {
    addJsonPre('{"hello":"world"}');
    render(<ContentScriptApp />);
    const icon = screen.getByLabelText("View JSON");
    fireEvent.click(icon);
    expect(screen.getByLabelText("Close")).toBeInTheDocument();
    fireEvent.click(icon);
    expect(screen.queryByLabelText("Close")).not.toBeInTheDocument();
  });

  test("clicking a different icon switches to that JSON", () => {
    addJsonPre('{"alpha":1}');
    addJsonPre('{"beta":2}');
    const { container } = render(<ContentScriptApp />);
    const icons = screen.getAllByLabelText("View JSON");
    fireEvent.click(icons[0]);
    expect(within(container).getByText(/alpha/)).toBeInTheDocument();
    fireEvent.click(icons[1]);
    expect(within(container).getByText(/beta/)).toBeInTheDocument();
  });

  test("closing the viewer via close button deselects", () => {
    addJsonPre('{"test":true}');
    render(<ContentScriptApp />);
    fireEvent.click(screen.getByLabelText("View JSON"));
    expect(screen.getByLabelText("Close")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Close"));
    expect(screen.queryByLabelText("Close")).not.toBeInTheDocument();
  });
});
