import { render, screen, fireEvent } from "@testing-library/react";
import { createRef } from "react";
import { JsonToolbar } from "../JsonToolbar";

function setup(overrides = {}) {
  const props = {
    onClose: vi.fn(),
    onToggleCollapse: vi.fn(),
    isCollapsed: false,
    onCopy: vi.fn(),
    onToggleRaw: vi.fn(),
    isRaw: false,
    dragHandleRef: createRef<HTMLDivElement>(),
    ...overrides,
  };
  return { props, ...render(<JsonToolbar {...props} />) };
}

test("renders all four buttons", () => {
  setup();
  expect(screen.getByLabelText("Collapse all")).toBeInTheDocument();
  expect(screen.getByLabelText("Raw view")).toBeInTheDocument();
  expect(screen.getByLabelText("Copy JSON")).toBeInTheDocument();
  expect(screen.getByLabelText("Close")).toBeInTheDocument();
});

test("close button calls onClose", () => {
  const { props } = setup();
  fireEvent.click(screen.getByLabelText("Close"));
  expect(props.onClose).toHaveBeenCalledOnce();
});

test("copy button calls onCopy", () => {
  const { props } = setup();
  fireEvent.click(screen.getByLabelText("Copy JSON"));
  expect(props.onCopy).toHaveBeenCalledOnce();
});

test("collapse toggle calls onToggleCollapse", () => {
  const { props } = setup();
  fireEvent.click(screen.getByLabelText("Collapse all"));
  expect(props.onToggleCollapse).toHaveBeenCalledOnce();
});

test("shows expand label when isCollapsed is true", () => {
  setup({ isCollapsed: true });
  expect(screen.getByLabelText("Expand all")).toBeInTheDocument();
});

test("raw toggle calls onToggleRaw", () => {
  const { props } = setup();
  fireEvent.click(screen.getByLabelText("Raw view"));
  expect(props.onToggleRaw).toHaveBeenCalledOnce();
});

test("shows tree view label when isRaw is true", () => {
  setup({ isRaw: true });
  expect(screen.getByLabelText("Tree view")).toBeInTheDocument();
});
