import {
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { searchJson } from "../lib/searchJson";

export interface UseJsonSearchOptions {
  data: unknown;
  collapseDepth: number | boolean;
  isModified: boolean;
  jsonRegionRef: RefObject<HTMLDivElement | null>;
  viewerRef: RefObject<HTMLDivElement | null>;
  bumpCollapseKey: () => void;
}

export function useJsonSearch({
  data,
  collapseDepth,
  isModified,
  jsonRegionRef,
  viewerRef,
  bumpCollapseKey,
}: UseJsonSearchOptions) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounced search query (~150ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Compute search results
  const searchResult = useMemo(() => {
    if (!debouncedQuery) return searchJson(null, "");
    return searchJson(data, debouncedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, isModified]);

  // Clamp currentMatchIndex when match count changes
  useEffect(() => {
    if (searchResult.matches.length === 0) {
      setCurrentMatchIndex(0);
    } else if (currentMatchIndex >= searchResult.matches.length) {
      setCurrentMatchIndex(searchResult.matches.length - 1);
    }
  }, [searchResult.matches.length, currentMatchIndex]);

  // Dynamic collapsed prop: force-expand ancestors of matches during search
  const collapsedProp = useMemo(() => {
    if (searchOpen && debouncedQuery && searchResult.expandSet.size > 0) {
      return ({ node }: { node: any; depth: number }) => {
        if (searchResult.expandSet.has(node)) return false;
        // Fall back to depth-based collapse
        if (typeof collapseDepth === "number") return true;
        return collapseDepth as boolean;
      };
    }
    return collapseDepth;
  }, [searchOpen, debouncedQuery, searchResult.expandSet, collapseDepth]);

  // customizeNode: highlight value matches
  const customizeNode = useMemo(() => {
    if (!searchOpen || !debouncedQuery || searchResult.matches.length === 0) {
      return undefined;
    }

    const currentMatch = searchResult.matches[currentMatchIndex];

    return ({ node }: { node: any }) => {
      if (!searchResult.valueMatchSet.has(node)) return {};

      // Check if this is the current match
      if (
        currentMatch &&
        currentMatch.kind === "value" &&
        currentMatch.valueRef === node
      ) {
        return { className: "jsonly-search-hit jsonly-search-current" };
      }
      return { className: "jsonly-search-hit" };
    };
  }, [searchOpen, debouncedQuery, searchResult, currentMatchIndex]);

  // DOM walker: highlight key matches + scroll current into view
  useLayoutEffect(() => {
    const region = jsonRegionRef.current;
    if (!region) return;

    // Clean up previous marks
    const existingMarks = region.querySelectorAll("mark");
    existingMarks.forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(
          document.createTextNode(mark.textContent || ""),
          mark,
        );
        parent.normalize();
      }
    });

    if (!searchOpen || !debouncedQuery || searchResult.matches.length === 0) {
      return;
    }

    // Skip if an inline edit is active
    if (region.querySelector("[contenteditable]")) return;

    const lowerQuery = debouncedQuery.toLowerCase();
    const currentMatch = searchResult.matches[currentMatchIndex];

    // Find all .json-view--property spans and highlight matching key text
    const propertySpans = region.querySelectorAll(".json-view--property");
    propertySpans.forEach((span) => {
      const text = span.textContent || "";
      // Property text typically has quotes around it
      const stripped = text.replace(/^"|"$/g, "");
      if (!stripped.toLowerCase().includes(lowerQuery)) return;

      // Walk text nodes inside the span
      const walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT);
      const textNodes: Text[] = [];
      let textNode: Text | null;
      while ((textNode = walker.nextNode() as Text | null)) {
        textNodes.push(textNode);
      }

      for (const tn of textNodes) {
        const nodeText = tn.nodeValue || "";
        const idx = nodeText.toLowerCase().indexOf(lowerQuery);
        if (idx === -1) continue;

        const before = nodeText.slice(0, idx);
        const match = nodeText.slice(idx, idx + debouncedQuery.length);
        const after = nodeText.slice(idx + debouncedQuery.length);

        const mark = document.createElement("mark");

        // Determine if this key is the current match
        const isCurrentKeyMatch =
          currentMatch &&
          currentMatch.kind === "key" &&
          stripped.toLowerCase().includes(lowerQuery) &&
          String(currentMatch.indexOrName) === stripped;

        mark.className = isCurrentKeyMatch
          ? "jsonly-search-hit jsonly-search-current"
          : "jsonly-search-hit";
        mark.textContent = match;

        const parent = tn.parentNode;
        if (!parent) continue;

        if (before) parent.insertBefore(document.createTextNode(before), tn);
        parent.insertBefore(mark, tn);
        if (after) parent.insertBefore(document.createTextNode(after), tn);
        parent.removeChild(tn);
      }
    });

    // Scroll current match into view
    requestAnimationFrame(() => {
      const currentEl = region.querySelector(".jsonly-search-current");
      if (currentEl) {
        currentEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    });
  }, [searchOpen, debouncedQuery, searchResult, currentMatchIndex]);

  // Next/Prev with wrap-around
  const onNext = useCallback(() => {
    if (searchResult.matches.length === 0) return;
    setCurrentMatchIndex((i) =>
      i >= searchResult.matches.length - 1 ? 0 : i + 1,
    );
  }, [searchResult.matches.length]);

  const onPrev = useCallback(() => {
    if (searchResult.matches.length === 0) return;
    setCurrentMatchIndex((i) =>
      i <= 0 ? searchResult.matches.length - 1 : i - 1,
    );
  }, [searchResult.matches.length]);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setDebouncedQuery("");
    setCurrentMatchIndex(0);
    // Collapse state auto-restores via collapseDepth fallback
    bumpCollapseKey();
  }, [bumpCollapseKey]);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
  }, []);

  // Ref to avoid stale closure for searchOpen in the keydown handler
  const searchOpenRef = useRef(searchOpen);
  searchOpenRef.current = searchOpen;

  // Shared ref to the SearchBar input so the cmd+f handler can focus it
  // directly when the search bar is already open.
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Ctrl/Cmd+F handler — uses capture phase so it fires even when a child
  // element inside the viewer has focus (the div itself may never be focused).
  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;

    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        e.stopPropagation();
        setSearchOpen(true);
        // If the search bar is already mounted, focus the input directly.
        // On first open, this is a no-op (ref is null) and SearchBar's own
        // mount effect focuses the input after render.
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape" && searchOpenRef.current) {
        e.preventDefault();
        e.stopPropagation();
        closeSearch();
      }
    }

    el.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => el.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [closeSearch]);

  return {
    searchOpen,
    searchQuery,
    currentMatchIndex,
    matchCount: searchResult.matches.length,
    collapsedProp,
    customizeNode,
    openSearch,
    closeSearch,
    onQueryChange: setSearchQuery,
    onNext,
    onPrev,
    searchInputRef,
  };
}
