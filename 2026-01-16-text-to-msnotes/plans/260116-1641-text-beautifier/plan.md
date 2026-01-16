# Plan: Text Beautifier for MS Teams

## Problem Statement
User needs to quickly convert messy text notes into clean markdown bullet lists for pasting into MS Teams. Current pain: manually fixing inconsistent dashes, spacing, and indentation.

## Example Transformation

**Input (messy):**
```
-Daily Standup
- Townhall
- Backlog
- API Substance  - SDS Details
  - implement phrase text (continue)
- Approved list / My substance inventory
- sds location usage  , edit assessment button
```

**Output (clean markdown for MS Teams):**
```markdown
- Daily Standup
- Townhall
- Backlog
- API Substance - SDS Details
  - implement phrase text (continue)
- Approved list / My substance inventory
- sds location usage, edit assessment button
```

**Renders in MS Teams as:**
- Daily Standup
- Townhall
- Backlog
- API Substance - SDS Details
  - implement phrase text (continue)
- Approved list / My substance inventory
- sds location usage, edit assessment button

**Key behaviors:**
- Normalizes bullet character to `-`
- Adds consistent spacing after `-`
- Preserves inline dashes (e.g., "API Substance - SDS Details" stays as one item)
- Converts indentation to nested bullets
- Trims extra whitespace

## Tech Stack
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool, fast HMR |
| TypeScript | Type safety |
| Tailwind CSS v3 | Styling |

## Architecture
```
src/
├── App.tsx                      # Root component
├── main.tsx                     # Entry point
├── index.css                    # Tailwind imports
├── components/
│   └── text-beautifier.tsx      # Main UI component (2-column layout)
└── utils/
    ├── parse-bullets.ts         # Markdown bullet parser
    ├── parse-bullets.test.ts    # 32 unit tests
    ├── bullets-to-html.ts       # HTML converter for rich copy
    └── bullets-to-html.test.ts  # 30 unit tests
```

## UI Layout

### ASCII Layout Contract
```
+----------------------------------------------------------+
|  Text Beautifier                                          |  <- HEADER (h1)
+----------------------------------------------------------+
|  Column A (50%)         |  Column B (50%)                 |
|  [Label: Input]         |  [Label: Output]  [Copy Buttons]|
|  +------------------+   |  +----------------------+       |
|  | Textarea         |   |  | Output Preview       |       |
|  | (editable)       |   |  | (readonly <pre>)     |       |
|  | min-h-[300px]    |   |  | min-h-[300px]        |       |
|  +------------------+   |  +----------------------+       |
+----------------------------------------------------------+
|  Help text: Copy Text = markdown, Copy HTML = rich text   |  <- FOOTER
+----------------------------------------------------------+
```

### Layout Implementation

| Zone | Tailwind Classes | Element |
|------|------------------|---------|
| Container | `min-h-screen bg-gray-100 p-4 md:p-8` | `<div>` |
| Inner wrap | `max-w-6xl mx-auto` | `<div>` |
| Header | `text-2xl font-bold text-gray-800 mb-6` | `<h1>` |
| Grid | `grid md:grid-cols-2 gap-4` | `<div>` |
| Column A | `flex flex-col` | Input panel |
| Column B | `flex flex-col` | Output panel |
| Footer | `mt-4 text-sm text-gray-500` | `<p>` |

### Component Structure
```
TextBeautifier
├── Header (h1)
├── Grid (2 columns)
│   ├── Column A: Input Panel
│   │   ├── Label
│   │   └── Textarea (controlled, monospace)
│   └── Column B: Output Panel
│       ├── Label + Copy Buttons (flex justify-between)
│       │   ├── [Copy Text] (gray)
│       │   └── [Copy HTML] (blue)
│       └── Pre (readonly output)
└── Footer (help text)
```

### Copy Button Behavior
| Button | Action | Use Case |
|--------|--------|----------|
| Copy Text | `clipboard.writeText()` | Plain markdown for code/text editors |
| Copy HTML | `clipboard.write()` with `ClipboardItem` | Rich bullets for MS Teams/Word |

## Parsing Algorithm

```
INPUT: "-Daily Standup\n  - nested item"

Step 1: Split by newlines
  → ["-Daily Standup", "  - nested item"]

Step 2: For each line:
  a) Normalize tabs → spaces (1 tab = 2 spaces)
  b) Count leading spaces → nesting level (2 spaces = 1 level)
  c) Strip bullet chars (-, *, •) and trim content
  d) Skip if empty after cleaning

Step 3: Rebuild with clean format
  → "- Daily Standup\n  - nested item"
```

**Edge cases handled:**
- Empty input → empty output
- Tabs mixed with spaces → normalized
- Deep nesting → capped at 4 levels
- Lines without bullets → treated as content
- Multiple spaces → single space

## Phases

| # | File | Tasks | Verification |
|---|------|-------|--------------|
| 1 | `phase-01-project-setup.md` | Vite + React + TS + Tailwind | `npm run dev` shows styled page |
| 2 | `phase-02-parsing-logic.md` | `parse-bullets.ts` utility | Transform works correctly |
| 3 | `phase-03-ui-component.md` | TextBeautifier component | Two panels, copy works |
| 4 | `phase-04-verification.md` | Full test + build | `npm run build` succeeds |

## Success Criteria
- [ ] Paste messy text → instant clean bullets
- [ ] Nested indentation preserved (up to 4 levels)
- [ ] One-click copy to clipboard
- [ ] "Copied!" feedback on button
- [ ] Responsive layout (mobile-friendly)
- [ ] No external dependencies beyond React/Tailwind
- [ ] Build succeeds without errors

## Validation Summary

**Validated:** 2026-01-16
**Questions asked:** 3

### Confirmed Decisions
| Decision | Choice |
|----------|--------|
| Plain text lines (no bullet prefix) | Convert to bullets |
| Multiple spaces within text | Normalize to single space |
| Clear/Reset button | No - keep minimal |

### Action Items
- [x] Update `phase-02-parsing-logic.md`: Add `.replace(/\s+/g, ' ')` to normalize inner spaces
- [x] Update `phase-02-parsing-logic.md`: Ensure lines without `-/*` prefix still become bullets

---

## For Ralph

**Execution order:** Phase 1 → 2 → 3 → 4 (sequential)

**Each phase contains:**
- Objective
- Complete code to write
- Bash commands to run
- Verification checklist

**If verification fails:** Fix before proceeding to next phase.

**Test input for validation:**
```
-Daily Standup
- Townhall
- Backlog
- API Substance  - SDS Details
  - implement phrase text (continue)
- Approved list / My substance inventory
- sds location usage  , edit assessment button
```
