import { render, screen, fireEvent } from "@testing-library/react";
import { SearchBar } from "../SearchBar";

function setup(overrides = {}) {
  const props = {
    query: "",
    onQueryChange: vi.fn(),
    matchCount: 0,
    currentIndex: 0,
    onNext: vi.fn(),
    onPrev: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
  return { props, ...render(<SearchBar {...props} />) };
}

describe("SearchBar", () => {
  test("renders search input and navigation buttons", () => {
    setup();
    expect(screen.getByLabelText("Search input")).toBeInTheDocument();
    expect(screen.getByLabelText("Previous match")).toBeInTheDocument();
    expect(screen.getByLabelText("Next match")).toBeInTheDocument();
    expect(screen.getByLabelText("Close search")).toBeInTheDocument();
  });

  test("auto-focuses input on mount", () => {
    setup();
    expect(screen.getByLabelText("Search input")).toHaveFocus();
  });

  test("displays query value in input", () => {
    setup({ query: "hello" });
    expect(screen.getByLabelText("Search input")).toHaveValue("hello");
  });

  test("calls onQueryChange when typing", () => {
    const { props } = setup();
    fireEvent.change(screen.getByLabelText("Search input"), {
      target: { value: "test" },
    });
    expect(props.onQueryChange).toHaveBeenCalledWith("test");
  });

  test("shows counter when query has matches", () => {
    setup({ query: "foo", matchCount: 5, currentIndex: 2 });
    expect(screen.getByText("3 of 5")).toBeInTheDocument();
  });

  test("shows 'No results' when query is non-empty but 0 matches", () => {
    setup({ query: "missing", matchCount: 0 });
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  test("shows no counter when query is empty", () => {
    setup({ query: "", matchCount: 0 });
    expect(screen.queryByText("No results")).not.toBeInTheDocument();
  });

  test("Enter key calls onNext", () => {
    const { props } = setup({ query: "test" });
    fireEvent.keyDown(screen.getByLabelText("Search input"), { key: "Enter" });
    expect(props.onNext).toHaveBeenCalledOnce();
  });

  test("Shift+Enter calls onPrev", () => {
    const { props } = setup({ query: "test" });
    fireEvent.keyDown(screen.getByLabelText("Search input"), {
      key: "Enter",
      shiftKey: true,
    });
    expect(props.onPrev).toHaveBeenCalledOnce();
  });

  test("Escape key calls onClose", () => {
    const { props } = setup({ query: "test" });
    fireEvent.keyDown(screen.getByLabelText("Search input"), {
      key: "Escape",
    });
    expect(props.onClose).toHaveBeenCalledOnce();
  });

  test("next button calls onNext", () => {
    const { props } = setup();
    fireEvent.click(screen.getByLabelText("Next match"));
    expect(props.onNext).toHaveBeenCalledOnce();
  });

  test("prev button calls onPrev", () => {
    const { props } = setup();
    fireEvent.click(screen.getByLabelText("Previous match"));
    expect(props.onPrev).toHaveBeenCalledOnce();
  });

  test("close button calls onClose", () => {
    const { props } = setup();
    fireEvent.click(screen.getByLabelText("Close search"));
    expect(props.onClose).toHaveBeenCalledOnce();
  });

  test("keyboard events stop propagation", () => {
    setup({ query: "test" });
    const input = screen.getByLabelText("Search input");
    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
    });
    const stopPropagation = vi.spyOn(event, "stopPropagation");
    input.dispatchEvent(event);
    expect(stopPropagation).toHaveBeenCalled();
  });
});
