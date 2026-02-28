import { matchShortcut, type KeyboardShortcut } from "@/lib/shortcuts";

function fakeEvent(
  key: string,
  modifiers: {
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
  } = {},
) {
  return {
    key,
    ctrlKey: modifiers.ctrlKey ?? false,
    altKey: modifiers.altKey ?? false,
    shiftKey: modifiers.shiftKey ?? false,
    metaKey: modifiers.metaKey ?? false,
  } as unknown as React.KeyboardEvent;
}

describe("matchShortcut", () => {
  const handler = jest.fn();

  it("returns matching shortcut when key and modifiers match", () => {
    const shortcuts: KeyboardShortcut[] = [
      { key: "l", ctrl: true, handler },
    ];

    const result = matchShortcut(fakeEvent("l", { ctrlKey: true }), shortcuts);
    expect(result).toBe(shortcuts[0]);
  });

  it("returns null when no shortcut matches", () => {
    const shortcuts: KeyboardShortcut[] = [
      { key: "l", ctrl: true, handler },
    ];

    const result = matchShortcut(fakeEvent("k", { ctrlKey: true }), shortcuts);
    expect(result).toBeNull();
  });

  it("matches keys case-insensitively", () => {
    const shortcuts: KeyboardShortcut[] = [{ key: "L", ctrl: true, handler }];

    const result = matchShortcut(fakeEvent("l", { ctrlKey: true }), shortcuts);
    expect(result).toBe(shortcuts[0]);
  });

  it("requires modifier flags to match exactly", () => {
    const shortcuts: KeyboardShortcut[] = [
      { key: "l", ctrl: true, handler },
    ];

    const result = matchShortcut(fakeEvent("l"), shortcuts);
    expect(result).toBeNull();
  });

  it("does not match when extra modifiers are pressed", () => {
    const shortcuts: KeyboardShortcut[] = [{ key: "a", handler }];

    const result = matchShortcut(fakeEvent("a", { ctrlKey: true }), shortcuts);
    expect(result).toBeNull();
  });

  it("returns first match when multiple shortcuts could match", () => {
    const first: KeyboardShortcut = { key: "a", ctrl: true, handler };
    const second: KeyboardShortcut = { key: "a", ctrl: true, handler };

    const result = matchShortcut(fakeEvent("a", { ctrlKey: true }), [
      first,
      second,
    ]);
    expect(result).toBe(first);
  });

  it("returns null for an empty shortcuts array", () => {
    const result = matchShortcut(fakeEvent("a"), []);
    expect(result).toBeNull();
  });
});
