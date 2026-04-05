import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { useEffect, useRef } from "react";

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  matchCount: number;
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export function SearchBar({
  query,
  onQueryChange,
  matchCount,
  currentIndex,
  onNext,
  onPrev,
  onClose,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    e.stopPropagation();
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        onPrev();
      } else {
        onNext();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  function renderCounter() {
    if (!query) return null;
    if (matchCount === 0) {
      return (
        <span className="whitespace-nowrap text-xs text-red-400">
          No results
        </span>
      );
    }
    return (
      <span className="whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
        {currentIndex + 1} of {matchCount}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1 border-b border-gray-200 px-3 py-1.5 dark:border-gray-700">
      <Search size={16} className="shrink-0 text-gray-400 dark:text-gray-500" />

      <div className="relative flex flex-1 items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search…"
          className="w-full rounded bg-transparent px-2 py-1 text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-gray-200 dark:placeholder:text-gray-500"
          aria-label="Search input"
        />
        <div className="pointer-events-none pr-1">{renderCounter()}</div>
      </div>

      <button
        type="button"
        onClick={onPrev}
        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
        title="Previous match"
        aria-label="Previous match"
      >
        <ChevronUp size={16} />
      </button>

      <button
        type="button"
        onClick={onNext}
        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
        title="Next match"
        aria-label="Next match"
      >
        <ChevronDown size={16} />
      </button>

      <button
        type="button"
        onClick={onClose}
        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
        title="Close search"
        aria-label="Close search"
      >
        <X size={16} />
      </button>
    </div>
  );
}
