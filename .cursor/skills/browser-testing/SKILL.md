---
name: browser-testing
description: Test web components visually and functionally using the Chrome DevTools MCP tools. Use when the user asks to test a component, verify UI behavior, check responsiveness, validate interactions, or debug visual issues in the browser.
---

# Browser Testing with Chrome DevTools MCP

Test web components directly in the browser using Chrome DevTools MCP tools. Covers visual verification, user interactions, responsive testing, and runtime debugging.

## Prerequisites

- Dev server running (e.g. `npm run dev`)
- Know the URL to test (e.g. `http://localhost:3000`)

### Pre-flight Check (Required)

Before starting any test, verify the dev server is running. List the terminals folder to check for an active dev server process (e.g. `npm run dev`, `next dev`).

**If no dev server is detected:** Stop immediately. Warn the user:

> "No dev server detected. Please start your dev server first (e.g. `npm run dev`) and try again."

Do **not** proceed with navigation or any testing steps. Do **not** start the dev server yourself — the user may have a specific setup or port requirement.

---

## Core Workflow

Every testing session follows this loop:

```
1. Navigate  →  2. Snapshot  →  3. Interact  →  4. Verify  →  5. Debug (if needed)
```

### Step 1: Navigate to the Page

```
Tool: navigate_page
Params: { type: "url", url: "http://localhost:3000" }
```

For SPAs, use `reload` type to reset state. Use `initScript` to inject setup code before the page loads (e.g. mock data, feature flags).

### Step 2: Take a Snapshot (Required Before Any Interaction)

```
Tool: take_snapshot
```

This returns the **a11y tree** — a text representation of all page elements with unique `uid` values. You **must** snapshot before clicking, typing, or interacting with any element.

The snapshot tells you:
- What elements exist on the page
- Their roles (button, input, link, heading, etc.)
- Their current text/value
- Their `uid` for targeting interactions

### Step 3: Interact with Elements

Use the `uid` from the snapshot to target elements:

| Action | Tool | Key Params |
|--------|------|------------|
| Click | `click` | `uid`, optional `dblClick: true` |
| Type into input | `fill` | `uid`, `value` (clears then types) |
| Fill multiple fields | `fill_form` | `elements: [{ uid, value }, ...]` |
| Hover | `hover` | `uid` |
| Press key/shortcut | `press_key` | `key` (e.g. `"Enter"`, `"ArrowUp"`, `"Control+A"`) |
| Drag and drop | `drag` | `from_uid`, `to_uid` |
| Upload file | `upload_file` | `uid`, `filePath` |

**Important**: After each interaction, take a **new snapshot** to see the updated state. UIDs may change after DOM updates.

### Step 4: Verify Results

**Visual verification** — take a screenshot:

```
Tool: take_screenshot
Params: { fullPage: true }           # entire page
Params: { uid: "element-uid" }       # specific element
Params: { filePath: "test-output/screenshot.png" }  # save to file
```

**Text verification** — wait for expected content:

```
Tool: wait_for
Params: { text: "Expected text", timeout: 5000 }
```

**Custom assertions** — run JavaScript:

```
Tool: evaluate_script
Params: {
  function: "() => { return document.querySelectorAll('.item').length }"
}
```

You can also pass elements as arguments:

```
Tool: evaluate_script
Params: {
  function: "(el) => { return el.getBoundingClientRect() }",
  args: [{ uid: "target-element" }]
}
```

### Step 5: Debug Issues

**Check console for errors:**

```
Tool: list_console_messages
Params: { types: ["error", "warn"] }
```

**Inspect network requests:**

```
Tool: list_network_requests
Params: { resourceTypes: ["fetch", "xhr"] }
```

**Get request/response details:**

```
Tool: get_network_request
Params: { reqid: 123 }
```

---

## Testing Patterns

### Responsive Testing

Test at different viewport sizes:

```
Tool: resize_page
Params: { width: 375, height: 812 }   # iPhone
```

```
Tool: resize_page
Params: { width: 768, height: 1024 }  # Tablet
```

```
Tool: resize_page
Params: { width: 1440, height: 900 }  # Desktop
```

Or use device emulation for mobile-specific behavior:

```
Tool: emulate
Params: {
  viewport: { width: 375, height: 812, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }
}
```

Reset with: `{ viewport: null }`

### Dark Mode Testing

```
Tool: emulate
Params: { colorScheme: "dark" }
```

Reset with: `{ colorScheme: "auto" }`

### Keyboard Navigation Testing

Test tab order and keyboard accessibility:

```
Tool: press_key → { key: "Tab" }           # Move focus forward
Tool: press_key → { key: "Shift+Tab" }     # Move focus backward
Tool: press_key → { key: "Enter" }         # Activate focused element
Tool: press_key → { key: "Escape" }        # Close modal/dropdown
Tool: press_key → { key: "ArrowDown" }     # Navigate list items
```

Take a snapshot after each key press to verify focus moved correctly.

### Form Testing

```
1. take_snapshot                              # Find form fields
2. fill_form → elements: [                    # Fill all fields
     { uid: "name-input", value: "John" },
     { uid: "email-input", value: "j@x.com" }
   ]
3. click → uid: "submit-btn"                  # Submit
4. wait_for → text: "Success"                 # Verify result
5. list_console_messages → types: ["error"]   # Check for errors
```

### Dialog Handling

If a component triggers `alert()`, `confirm()`, or `prompt()`:

```
Tool: handle_dialog
Params: { action: "accept" }          # Click OK
Params: { action: "dismiss" }         # Click Cancel
Params: { action: "accept", promptText: "custom input" }
```

**Important**: Call `handle_dialog` **before** the action that triggers it (e.g. before clicking the delete button that shows a confirm dialog).

### Performance Testing

Record a performance trace for a page load:

```
Tool: performance_start_trace
Params: { reload: true, autoStop: true }
```

Then analyze specific insights:

```
Tool: performance_analyze_insight
Params: { insightSetId: "...", insightName: "LCPBreakdown" }
```

Save traces for comparison:

```
Tool: performance_start_trace
Params: { reload: true, autoStop: true, filePath: "traces/before.json.gz" }
```

---

## Quick Reference

### Most-Used Tools (ordered by frequency)

| Tool | Purpose |
|------|---------|
| `take_snapshot` | Inspect page structure, get element UIDs |
| `click` | Click buttons, links, toggles |
| `fill` | Type into inputs, select dropdowns |
| `press_key` | Keyboard shortcuts, Enter, Tab, arrows |
| `take_screenshot` | Visual verification |
| `wait_for` | Wait for async content to appear |
| `evaluate_script` | Run custom JS assertions |
| `navigate_page` | Load/reload pages |
| `list_console_messages` | Check for runtime errors |
| `emulate` | Dark mode, mobile viewport |
| `resize_page` | Test responsive breakpoints |

### Common Pitfalls

1. **Always snapshot before interacting** — you need fresh UIDs
2. **Re-snapshot after interactions** — DOM changes invalidate old UIDs
3. **Use short waits** — prefer `wait_for` with specific text over arbitrary sleeps
4. **handle_dialog goes BEFORE the trigger** — not after
5. **Iframes are not accessible** — only elements outside iframes can be targeted
6. **Use `fill` to replace text, `press_key` to append** — `fill` clears first
