import { useEffect, useMemo, useState } from "react";

import { useElementRects } from "../hooks/useElementRects";
import { type JsonMatch, scanForJson } from "../lib/scanForJson";
import { JsonOverlayIcon } from "./JsonOverlayIcon";
import { JsonViewer } from "./JsonViewer";

export function ContentScriptApp() {
  const [matches, setMatches] = useState<JsonMatch[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    setMatches(scanForJson(document));

    let timer: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => setMatches(scanForJson(document)), 500);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const elements = useMemo(() => matches.map((m) => m.element), [matches]);
  const rects = useElementRects(elements);

  function handleIconClick(index: number) {
    setSelectedIndex((prev) => (prev === index ? null : index));
  }

  if (matches.length === 0) return null;

  return (
    <>
      {rects.map((rect, i) => (
        <JsonOverlayIcon
          key={`icon-${matches[i].element.tagName}-${i}`}
          rect={rect}
          isActive={selectedIndex === i}
          onClick={() => handleIconClick(i)}
        />
      ))}
      {selectedIndex !== null && (
        <JsonViewer
          key={selectedIndex}
          json={matches[selectedIndex].json}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </>
  );
}
