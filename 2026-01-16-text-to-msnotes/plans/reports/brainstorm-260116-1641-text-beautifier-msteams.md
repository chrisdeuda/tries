# Brainstorm: Text Beautifier for MS Teams

## Problem Statement
User needs simple tool to convert messy text input into clean markdown bullet list format for MS Teams copy-paste.

## Requirements
- **Input**: Raw text with inconsistent formatting (dashes, spaces, mixed indentation)
- **Output**: Clean markdown bullet list
- **Nesting**: Preserve indentation levels
- **Inline dashes**: Keep as single item (e.g., "API Substance - SDS Details" stays together)
- **Copy button**: One-click clipboard copy

## Tech Stack
- React (functional component)
- Tailwind CSS
- Browser Clipboard API

## Evaluated Approaches

### Option A: Single Component (Recommended ✓)
**Pros**: Simple, fast to build, easy to maintain, ~100 lines
**Cons**: Less reusable if app grows

### Option B: Separate Parser Module
**Pros**: Testable, reusable
**Cons**: Over-engineering for this scope

### Option C: External Markdown Library
**Pros**: Battle-tested parsing
**Cons**: Heavy dependency for simple use case

## Final Solution: Option A
Single React component with:
1. Textarea for input
2. Side-by-side preview
3. Copy button
4. Inline parsing logic

## Parsing Algorithm
1. Split by `\n`
2. Count leading whitespace → nesting level
3. Strip leading `-`, `*`, `•` and trim
4. Rebuild: `"  ".repeat(level) + "- " + content`
5. Filter empty lines

## UI Layout
```
┌─────────────────┬─────────────────┐
│  Input          │  Output         │
│  [textarea]     │  [preview]      │
│                 │     [Copy 📋]   │
└─────────────────┴─────────────────┘
```

## Risks
- Edge cases: tabs vs spaces (normalize to spaces)
- Very deep nesting (cap at 4 levels)

## Success Criteria
- Paste messy text → get clean bullets
- One-click copy works
- Handles 2-3 nesting levels

## Next Steps
Create implementation plan via /plan command.
