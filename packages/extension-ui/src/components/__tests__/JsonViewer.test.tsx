import { render, screen, fireEvent } from "@testing-library/react";
import { JsonViewer } from "../JsonViewer";

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

test("renders valid JSON in tree view", () => {
  render(<JsonViewer json='{"name":"test","value":42}' onClose={vi.fn()} />);
  expect(screen.getByText(/name/)).toBeInTheDocument();
});

test("shows error for invalid JSON", () => {
  render(<JsonViewer json="not json" onClose={vi.fn()} />);
  expect(screen.getByText(/Invalid JSON/)).toBeInTheDocument();
});

test("close button triggers onClose", () => {
  const onClose = vi.fn();
  render(<JsonViewer json='{"a":1}' onClose={onClose} />);
  fireEvent.click(screen.getByLabelText("Close"));
  expect(onClose).toHaveBeenCalledOnce();
});

test("raw toggle switches to formatted text", () => {
  render(<JsonViewer json='{"a":1}' onClose={vi.fn()} />);
  fireEvent.click(screen.getByLabelText("Raw view"));
  const pre = document.querySelector("pre");
  expect(pre).toBeInTheDocument();
  expect(pre?.textContent).toContain('"a": 1');
});

test("raw toggle switches back to tree view", () => {
  render(<JsonViewer json='{"a":1}' onClose={vi.fn()} />);
  fireEvent.click(screen.getByLabelText("Raw view"));
  expect(document.querySelector("pre")).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText("Tree view"));
  expect(document.querySelector("pre")).not.toBeInTheDocument();
});

test("copy writes to clipboard", () => {
  render(<JsonViewer json='{"a":1}' onClose={vi.fn()} />);
  fireEvent.click(screen.getByLabelText("Copy JSON"));
  expect(navigator.clipboard.writeText).toHaveBeenCalledWith(JSON.stringify({ a: 1 }, null, 2));
});

test("renders at custom defaultPosition", () => {
  const { container } = render(
    <JsonViewer json='{"a":1}' onClose={vi.fn()} defaultPosition={{ x: 50, y: 100 }} />,
  );
  const viewer = container.firstElementChild as HTMLElement;
  expect(viewer.style.left).toBe("50px");
  expect(viewer.style.top).toBe("100px");
});
