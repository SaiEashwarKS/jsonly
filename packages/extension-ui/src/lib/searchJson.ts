export type JsonMatch = {
  id: number;
  kind: "key" | "value";
  parentContainer: object;
  indexOrName: string | number;
  valueRef: unknown;
  path: (string | number)[];
};

export type SearchResult = {
  matches: JsonMatch[];
  expandSet: Set<object>;
  valueMatchSet: Set<unknown>;
};

const MAX_MATCHES = 1000;

function emptyResult(): SearchResult {
  return { matches: [], expandSet: new Set(), valueMatchSet: new Set() };
}

export function searchJson(data: unknown, query: string): SearchResult {
  if (!query) return emptyResult();

  const lowerQuery = query.toLowerCase();
  const result = emptyResult();
  let nextId = 0;

  function addAncestors(ancestors: object[]) {
    for (const a of ancestors) {
      result.expandSet.add(a);
    }
  }

  function walk(node: unknown, ancestors: object[], path: (string | number)[]) {
    if (result.matches.length >= MAX_MATCHES) return;

    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        if (result.matches.length >= MAX_MATCHES) return;
        const child = node[i];
        walk(child, [...ancestors, node], [...path, i]);
      }
    } else if (node !== null && typeof node === "object") {
      const obj = node as Record<string, unknown>;
      for (const key of Object.keys(obj)) {
        if (result.matches.length >= MAX_MATCHES) return;

        // Check key match
        if (key.toLowerCase().includes(lowerQuery)) {
          result.matches.push({
            id: nextId++,
            kind: "key",
            parentContainer: obj,
            indexOrName: key,
            valueRef: key,
            path: [...path, key],
          });
          addAncestors([...ancestors, obj]);
        }

        // Recurse into value
        walk(obj[key], [...ancestors, obj], [...path, key]);
      }
    } else {
      // Leaf value: string, number, boolean, null
      if (ancestors.length === 0) return;
      const parent = ancestors[ancestors.length - 1];
      const parentPath = path.slice(0, -1);
      const indexOrName = path[path.length - 1];
      const strValue = String(node);

      if (strValue.toLowerCase().includes(lowerQuery)) {
        result.matches.push({
          id: nextId++,
          kind: "value",
          parentContainer: parent,
          indexOrName,
          valueRef: node,
          path: [...path],
        });
        addAncestors(ancestors);
        result.valueMatchSet.add(node);
      }
    }
  }

  walk(data, [], []);
  return result;
}
