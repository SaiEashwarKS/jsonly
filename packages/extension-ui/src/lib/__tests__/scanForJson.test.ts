import { scanForJson } from "../scanForJson";

function makeRoot(...children: HTMLElement[]): HTMLDivElement {
  const root = document.createElement("div");
  for (const child of children) root.appendChild(child);
  return root;
}

function makePre(text: string): HTMLPreElement {
  const el = document.createElement("pre");
  el.textContent = text;
  return el;
}

function makeCode(text: string): HTMLElement {
  const el = document.createElement("code");
  el.textContent = text;
  return el;
}

describe("scanForJson", () => {
  test("returns empty array when no pre or code elements exist", () => {
    const root = makeRoot(document.createElement("div"));
    expect(scanForJson(root)).toEqual([]);
  });

  test("finds valid JSON object in a pre element", () => {
    const pre = makePre('{"a":1}');
    const root = makeRoot(pre);
    const matches = scanForJson(root);
    expect(matches).toHaveLength(1);
    expect(matches[0].element).toBe(pre);
    expect(matches[0].json).toBe('{"a":1}');
  });

  test("finds valid JSON array in a code element", () => {
    const code = makeCode("[1,2,3]");
    const root = makeRoot(code);
    const matches = scanForJson(root);
    expect(matches).toHaveLength(1);
    expect(matches[0].element).toBe(code);
    expect(matches[0].json).toBe("[1,2,3]");
  });

  test("finds multiple JSON blocks", () => {
    const pre1 = makePre('{"a":1}');
    const pre2 = makePre('{"b":2}');
    const root = makeRoot(pre1, pre2);
    const matches = scanForJson(root);
    expect(matches).toHaveLength(2);
    expect(matches[0].element).toBe(pre1);
    expect(matches[1].element).toBe(pre2);
  });

  test("skips elements not starting with { or [", () => {
    const root = makeRoot(makePre('"hello"'), makePre("42"), makePre("true"));
    expect(scanForJson(root)).toEqual([]);
  });

  test("skips invalid JSON that starts with { or [", () => {
    const root = makeRoot(makePre("{not json}"), makePre("[also, not json"));
    expect(scanForJson(root)).toEqual([]);
  });

  test("skips empty text content", () => {
    const root = makeRoot(makePre(""), makePre("   "));
    expect(scanForJson(root)).toEqual([]);
  });

  test("skips text exceeding 5MB", () => {
    const bigArray = `[${new Array(3 * 1024 * 1024).fill("1").join(",")}]`;
    const root = makeRoot(makePre(bigArray));
    expect(scanForJson(root)).toEqual([]);
  });

  test("skips nested code inside already-matched pre", () => {
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.textContent = '{"a":1}';
    pre.appendChild(code);
    const root = makeRoot(pre);

    const matches = scanForJson(root);
    expect(matches).toHaveLength(1);
    expect(matches[0].element).toBe(pre);
  });

  test("matches inner code when outer pre is not valid JSON", () => {
    const pre = document.createElement("pre");
    pre.insertAdjacentText("afterbegin", "some text ");
    const code = document.createElement("code");
    code.textContent = '{"inner":true}';
    pre.appendChild(code);
    const root = makeRoot(pre);

    const matches = scanForJson(root);
    expect(matches).toHaveLength(1);
    expect(matches[0].element).toBe(code);
  });

  test("handles whitespace around JSON", () => {
    const root = makeRoot(makePre('  {"a":1}  '));
    const matches = scanForJson(root);
    expect(matches).toHaveLength(1);
  });

  test("skips JSON null literal", () => {
    const root = makeRoot(makePre("null"));
    expect(scanForJson(root)).toEqual([]);
  });
});
