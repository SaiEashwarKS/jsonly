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
    isModified: false,
    onReset: vi.fn(),
    dragHandleRef: createRef<HTMLDivElement>(),
    ...overrides,
  };
  return { props, ...render(<JsonToolbar {...props} />) };
}

describe("JsonToolbar", () => {
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

  test("shows modified dot when isModified is true", () => {
    setup({ isModified: true });
    expect(screen.getByTitle("Modified")).toBeInTheDocument();
  });

  test("does not show modified dot when isModified is false", () => {
    setup({ isModified: false });
    expect(screen.queryByTitle("Modified")).not.toBeInTheDocument();
  });

  test("shows reset button when isModified is true", () => {
    setup({ isModified: true });
    expect(screen.getByLabelText("Reset to original")).toBeInTheDocument();
  });

  test("reset button is hidden when not modified", () => {
    setup({ isModified: false });
    expect(
      screen.queryByLabelText("Reset to original"),
    ).not.toBeInTheDocument();
  });

  test("reset button calls onReset", () => {
    const { props } = setup({ isModified: true });
    fireEvent.click(screen.getByLabelText("Reset to original"));
    expect(props.onReset).toHaveBeenCalledOnce();
  });
});
