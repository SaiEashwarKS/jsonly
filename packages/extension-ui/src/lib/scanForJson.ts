export interface JsonMatch {
  element: HTMLElement;
  json: string;
}

const MAX_TEXT_LENGTH = 5 * 1024 * 1024; // 5MB

export function scanForJson(root: ParentNode = document): JsonMatch[] {
  const candidates = root.querySelectorAll<HTMLElement>("pre, code");
  const matches: JsonMatch[] = [];
  const matchedElements = new Set<HTMLElement>();

  for (const el of candidates) {
    // Skip if an ancestor already matched
    let dominated = false;
    for (const matched of matchedElements) {
      if (matched.contains(el)) {
        dominated = true;
        break;
      }
    }
    if (dominated) continue;

    const text = el.textContent?.trim() ?? "";
    if (text.length === 0 || text.length > MAX_TEXT_LENGTH) continue;

    const first = text[0];
    if (first !== "{" && first !== "[") continue;

    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === "object" && parsed !== null) {
        matches.push({ element: el, json: text });
        matchedElements.add(el);
      }
    } catch {
      // Not valid JSON
    }
  }

  return matches;
}
