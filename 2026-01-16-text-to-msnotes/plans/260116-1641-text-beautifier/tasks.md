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
- [ ] Task 9: Add unit tests for bullets-to-html utility
  - **AC:** Create `src/utils/bullets-to-html.test.ts`, tests pass
  - **Test cases:** empty input, flat list, nested list
- [ ] Task 10: Run production build
  - **AC:** `npm run build` succeeds, `dist/` folder created
- [ ] Task 11: Test production preview
  - **AC:** `npm run preview` works correctly
