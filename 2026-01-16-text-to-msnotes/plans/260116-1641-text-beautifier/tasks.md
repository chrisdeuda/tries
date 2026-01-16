# Text Beautifier for MS Teams

## Phase 1: Prototype (RALPH_MODE=prototype)

### Setup
- [x] Task 1: Initialize Vite + React + TypeScript project
  - **AC:** `npm create vite@latest` completes, `package.json` exists
- [x] Task 2: Install and configure Tailwind CSS
  - **AC:** `tailwind.config.js` exists, `index.css` has tailwind directives
- [x] Task 3: Clean boilerplate and create directory structure
  - **AC:** `src/components/` and `src/utils/` exist, no `App.css`

### Core Implementation
- [x] Task 4: Create parse-bullets.ts utility
  - **AC:** File exists at `src/utils/parse-bullets.ts` with `parseBullets()` function
  - **Ref:** See `phase-02-parsing-logic.md` for exact code
- [x] Task 5: Create TextBeautifier component
  - **AC:** File exists at `src/components/text-beautifier.tsx`
  - **Ref:** See `phase-03-ui-component.md` for exact code
- [x] Task 6: Wire up App.tsx to render TextBeautifier
  - **AC:** `src/App.tsx` imports and renders `<TextBeautifier />`

### Verification
- [x] Task 7: Verify dev server runs
  - **AC:** `npm run dev` starts, page loads at localhost:5173

## CHECKPOINT

- [x] CHECKPOINT: Manual verification
  - **AC:** Paste test input, see clean bullets, copy works
  - **PAUSE:** Stop here, verify before Phase 2
  - **Test input:**
    ```
    -Daily Standup
    - Townhall
      - nested item
    plain text line
    - API Substance  - SDS Details
    ```

## Phase 2: Quality (RALPH_MODE=production)

- [x] Task 8: Add unit tests for parse-bullets utility
  - **AC:** Install vitest, create `src/utils/parse-bullets.test.ts`, tests pass
  - **Test cases:** empty input, single bullet, nested bullets, plain text lines, multiple spaces normalization
- [x] Task 9: Add unit tests for bullets-to-html utility
  - **AC:** Create `src/utils/bullets-to-html.test.ts`, tests pass
  - **Test cases:** empty input, flat list, nested list
- [x] Task 10: Run production build
  - **AC:** `npm run build` succeeds, `dist/` folder created
- [x] Task 11: Test production preview
  - **AC:** `npm run preview` works correctly

## Phase 3: UI Polish (RALPH_MODE=production)

### 2-Column Layout Refinements
- [x] Task 12: Verify 2-column responsive behavior
  - **AC:** On mobile (< 768px), columns stack vertically; on desktop, side-by-side
  - **Test:** Resize browser window, verify layout switches at md breakpoint

- [x] Task 13: Add equal height columns
  - **AC:** Both textarea and output pre have matching heights
  - **Implementation:** Use `flex-1` on both panels, ensure `min-h-[300px]` consistent

- [x] Task 14: Add visual column separator
  - **AC:** Subtle vertical divider between columns on desktop view
  - **Implementation:** Add `md:border-r md:border-gray-200` to Column A or use gap styling

- [x] Task 15: Improve copy button grouping
  - **AC:** Copy buttons visually grouped with gap, clear hierarchy
  - **Implementation:** "Copy HTML" as primary (blue), "Copy Text" as secondary (outline/gray)

## CHECKPOINT

- [ ] CHECKPOINT: Visual review
  - **AC:** 2-column layout matches ASCII spec in plan.md
  - **PAUSE:** Manual visual verification before final build

## Phase 4: Final Build

- [ ] Task 16: Final production build
  - **AC:** `npm run build` succeeds with no warnings
- [ ] Task 17: Commit all changes
  - **AC:** All UI polish changes committed with proper message
