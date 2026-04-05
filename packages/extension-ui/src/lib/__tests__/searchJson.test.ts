import { searchJson } from "../searchJson";

describe("searchJson", () => {
  test("empty query returns empty result", () => {
    const result = searchJson({ a: 1, b: "hello" }, "");
    expect(result.matches).toEqual([]);
    expect(result.expandSet.size).toBe(0);
    expect(result.valueMatchSet.size).toBe(0);
  });

  test("key match (case-insensitive substring)", () => {
    const data = { userName: "alice", age: 30 };
    const result = searchJson(data, "user");
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].kind).toBe("key");
    expect(result.matches[0].indexOrName).toBe("userName");
    expect(result.matches[0].valueRef).toBe("userName");
    expect(result.matches[0].path).toEqual(["userName"]);
  });

  test("value match on string", () => {
    const data = { name: "Alice" };
    const result = searchJson(data, "alice");
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].kind).toBe("value");
    expect(result.matches[0].valueRef).toBe("Alice");
    expect(result.matches[0].indexOrName).toBe("name");
  });

  test("value match on number", () => {
    const data = { count: 42 };
    const result = searchJson(data, "42");
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].kind).toBe("value");
    expect(result.matches[0].valueRef).toBe(42);
  });

  test("value match on boolean", () => {
    const data = { active: true };
    const result = searchJson(data, "true");
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].kind).toBe("value");
    expect(result.matches[0].valueRef).toBe(true);
  });

  test("value match on null", () => {
    const data = { missing: null };
    const result = searchJson(data, "null");
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].kind).toBe("value");
    expect(result.matches[0].valueRef).toBe(null);
  });

  test("nested objects produce correct paths", () => {
    const data = { a: { b: { c: "found" } } };
    const result = searchJson(data, "found");
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].path).toEqual(["a", "b", "c"]);
  });

  test("arrays produce numeric path segments", () => {
    const data = { items: ["apple", "banana"] };
    const result = searchJson(data, "banana");
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].path).toEqual(["items", 1]);
    expect(result.matches[0].indexOrName).toBe(1);
  });

  test("expandSet contains all ancestor containers", () => {
    const inner = { value: "match" };
    const middle = { nested: inner };
    const data = { top: middle };
    const result = searchJson(data, "match");
    expect(result.expandSet.has(data)).toBe(true);
    expect(result.expandSet.has(middle)).toBe(true);
    expect(result.expandSet.has(inner)).toBe(true);
  });

  test("expandSet includes array ancestors", () => {
    const arr = [{ name: "target" }];
    const data = { list: arr };
    const result = searchJson(data, "target");
    expect(result.expandSet.has(data)).toBe(true);
    expect(result.expandSet.has(arr)).toBe(true);
    expect(result.expandSet.has(arr[0])).toBe(true);
  });

  test("valueMatchSet contains matched leaf values", () => {
    const data = { a: "yes", b: "no" };
    const result = searchJson(data, "yes");
    expect(result.valueMatchSet.has("yes")).toBe(true);
    expect(result.valueMatchSet.has("no")).toBe(false);
  });

  test("case insensitive key and value matching", () => {
    const data = { FooBar: "BazQux" };
    const result = searchJson(data, "foobar");
    expect(result.matches.some((m) => m.kind === "key")).toBe(true);

    const result2 = searchJson(data, "BAZQUX");
    expect(result2.matches.some((m) => m.kind === "value")).toBe(true);
  });

  test("matches both key and value when both match", () => {
    const data = { test: "test" };
    const result = searchJson(data, "test");
    expect(result.matches).toHaveLength(2);
    expect(result.matches[0].kind).toBe("key");
    expect(result.matches[1].kind).toBe("value");
  });

  test("match cap at 1000", () => {
    const data: Record<string, string> = {};
    for (let i = 0; i < 600; i++) {
      data[`key_match_${i}`] = `value_match_${i}`;
    }
    const result = searchJson(data, "match");
    expect(result.matches).toHaveLength(1000);
  });

  test("ids are sequential DFS order", () => {
    const data = { a: "x", b: { c: "x" } };
    const result = searchJson(data, "x");
    for (let i = 0; i < result.matches.length; i++) {
      expect(result.matches[i].id).toBe(i);
    }
  });

  test("no matches returns empty result", () => {
    const data = { hello: "world" };
    const result = searchJson(data, "zzz");
    expect(result.matches).toEqual([]);
    expect(result.expandSet.size).toBe(0);
    expect(result.valueMatchSet.size).toBe(0);
  });

  test("primitive root value is not matched (no parent container)", () => {
    const result = searchJson("hello", "hello");
    expect(result.matches).toEqual([]);
  });

  test("deeply nested arrays", () => {
    const data = [[["deep"]]];
    const result = searchJson(data, "deep");
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].path).toEqual([0, 0, 0]);
    expect(result.expandSet.has(data)).toBe(true);
    expect(result.expandSet.has(data[0])).toBe(true);
    expect(result.expandSet.has(data[0][0])).toBe(true);
  });
});
