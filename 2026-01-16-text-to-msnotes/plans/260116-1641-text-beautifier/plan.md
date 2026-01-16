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
│   └── text-beautifier.tsx      # Main UI component
└── utils/
    └── parse-bullets.ts         # Parsing logic (pure function)
```

## UI Layout
```
┌─────────────────────────────────────────────────────────┐
│  Text Beautifier                                        │
├───────────────────────────┬─────────────────────────────┤
│  Input                    │  Output            [Copy]   │
│  ┌─────────────────────┐  │  ┌─────────────────────┐    │
│  │ -Daily Standup      │  │  │ - Daily Standup     │    │
│  │ - Townhall          │  │  │ - Townhall          │    │
│  │   - nested item     │  │  │   - nested item     │    │
│  │                     │  │  │                     │    │
│  └─────────────────────┘  │  └─────────────────────┘    │
├───────────────────────────┴─────────────────────────────┤
│  Paste text with dashes or bullets. Indented = nested.  │
└─────────────────────────────────────────────────────────┘
```

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
