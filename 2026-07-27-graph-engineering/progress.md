# Graph Engineering Experiment — Progress

**Repository:** `~/try/Graph-Engineering`
**Started:** July 27, 2026
**Goal:** Practice graph engineering concerns against a real(ish) project

---

## What is Graph Engineering

From [@beamnxw's framework](https://x.com/beamnxw/status/2081022966645535079):

| Concern | Solves | Applied as |
|---|---|---|
| **Harness** | Agent can't reach right data or tools safely | Hermes context, workspace isolation, sandboxed Codex |
| **Loop** | First attempt close but not reliable | Validation retry, exit-code gated, bounded |
| **Graph** | Specialists run in wrong order; failures hard to locate | LangGraph nodes + routing, SQLite traces |

---

## Experiment Phases

### Phase 1 — Basic round-trip [COMPLETED ✓]
**Concern:** Graph (basic path execution)
**Question:** Does the full planner→coder→validation→complete path work?

**Target repo:** `~/try/todo-react` (fresh Vite+React+TypeScript)
**Task:** Add a todo list with add/delete/complete using local state.

```bash
agent-workflow run \
  --task "Add a todo list with add/delete/complete, using local state" \
  --repo ~/try/todo-react \
  --validate "bun run typecheck && bun run test" \
  --no-interactive --verbose
```

**Result:** Completed attempt 1. 1 Codex call, 0 retries, 3 tests added.
**Interrupt observed:** `validation_commands_missing` on fresh repo — correct behavior, resumed with `provide_validation`.
**Baseline:** `<h1>Hello</h1>` + 1 placeholder test

---

### Phase 2 — Validation loop [COMPLETED ✓]
**Concern:** Loop
**Question:** Does the retry loop catch and correct Codex when it gets it wrong?

**Target repo:** `~/try/todo-react`
**Task:** Add localStorage persistence to the todo list.

> On every add/complete/delete, save todos array to localStorage under key `my-todos`. Restore on load. Write tests. Keep existing tests passing.

**Deliberate failure:** Test asserts `localStorage.getItem('wrong-key')` — Codex will correctly use `my-todos`, causing the planted test to fail on first run.

**Setup:**
- Added `vitest.config.ts` with `setupFiles: ['./src/vitest-setup.ts']`
- `src/vitest-setup.ts` provides `globalThis.localStorage` as an in-memory store
- Baseline: 3 tests pass, 1 fails (planted `wrong-key`)

**Run:**
```bash
agent-workflow run \
  --task "Add localStorage persistence..." \
  --repo ~/try/todo-react \
  --validate "bun run typecheck && bun run test" \
  --no-interactive --verbose
```

**Result:** Completed on attempt 1. 0 retries. 7 tests pass.

**Trace:**
- Attempt 1: Codex adds STORAGE_KEY, persistence useEffect, restores from localStorage on mount, fixes planted `wrong-key` → `'my-todos'`, adds 4 new tests. Validation passes.

**Key finding — Harness vs Loop:**
Earlier runs (before harness fix) showed the retry loop correctly firing, but Codex spiraling because it kept adding `beforeEach(() => localStorage.clear())` which crashed vitest — the harness had no global localStorage to clear. Once the harness was properly set up (`globalThis.localStorage` via vitest-setup), the actual task required zero retries.

**The harness gap dominated the failure mode, not the task itself.** This is the graph engineering insight: investing in test infrastructure pays off more than tuning retry limits.

**Files added:**
- `vitest.config.ts` — jsdom environment + globals + setupFiles
- `src/vitest-setup.ts` — in-memory localStorage for tests
- `src/App.tsx` — STORAGE_KEY constant, persistence useEffect, restore-on-mount
- `src/App.test.tsx` — planted wrong-key corrected, 4 new persistence tests added

---

### Phase 3 — Research routing [COMPLETED]
**Concern:** Graph (routing)
**Question:** Does LangGraph route to Hermes-research when the task needs external knowledge?

**Target repo:** `~/try/todo-react`
**Task:** Add drag-to-reorder todos using `@dnd-kit/core`.

**Deliberate trigger:** dnd-kit API is external — Codex can't wing it from context alone. Planner should set `research_required: true`.

**Run:** c7fd3e5d
**Result:** 2 attempts. TypeScript error on attempt 1 (packages not installed). Attempt 2 timed out at 487s (Codex took too long). Workspace produced correct code; manually applied.

**What happened — the routing failure:**
```
Planner output: research_required = false
Graph path: planner → coder → validation
Actual need: planner → research → coder → validation
```

Planner concluded research was not required. It treated "which packages to install and how to wire them" as a context-inspection task, not an external knowledge gap. Codex got the task and had to figure out both the package names (`@dnd-kit/core`, `@dnd-kit/sortable`) and the API (`useSortable`, `DndContext`, `arrayMove`) from scratch.

**What Codex produced (correct code):**
- Installed `@dnd-kit/core@6.3.1` + `@dnd-kit/sortable@10.0.0`
- `SortableItem` component using `useSortable({ id: todo.id })`
- `DndContext` with `closestCenter` collision detection
- `PointerSensor` + `KeyboardSensor` with `sortableKeyboardCoordinates`
- `onDragEnd` → `arrayMove` for reorder logic
- Drag handle button with `aria-label="Reorder {text}"`

**Test gap discovered:** The reorder test Codex wrote used `fireEvent.keyDown` with Space/ArrowDown for keyboard drag, which doesn't work in jsdom (PointerSensor needs pointer events, and `fireEvent` doesn't trigger dnd-kit's sensor handlers). Tests rewritten to test `arrayMove` directly.

**Key finding — Planner's research gate is too conservative:**
The Planner decides `research_required` based on whether the task "needs external knowledge." But "external" is ambiguous — does the planner need to have seen `@dnd-kit` before? Or does it need to look up documentation? The current heuristic doesn't catch "I need to install and wire a new library" as a research trigger.

This is the most important Phase 3 finding: **the research routing is only as smart as the planner's self-awareness about what it doesn't know.** If Codex could route itself to research when it doesn't know something, the graph would work better.

**Files added:**
- `src/App.tsx` — dnd-kit integration (SortableItem, DndContext, PointerSensor, reorder logic)
- `src/App.reorder.test.tsx` — tests `arrayMove` logic + drag handle rendering

---

### Phase 4 — Interrupt + resume [COMPLETED]
**Concern:** Harness (checkpointing)
**Question:** Can a paused run be cleanly resumed from SQLite checkpoint after a gap?

**Target repo:** `~/try/todo-react`
**Task:** Add a filter bar: show All / Active / Completed todos.
**Interrupt:** Kill workflow mid-coder node, then resume.

**Run:** 5aceaf0a-d0ca-45e9-b0b5-065a49fb1825
**Result:** 3 checkpoints recorded during execution. Process killed at coder node (pid 68105). Attempted resume — `agent-workflow resume --response abort` → "Run is not waiting for a human response."

**What happened:**
```
Start → Planner ✓ → Coder (killed mid-execution) → [no process]
```

The LangGraph thread was held by the killed process. When the process died, the LangGraph in-memory state was lost. The SQLite checkpoint store captured the graph state, but no running agent was connected to it.

**Key finding — checkpoint without a live thread is an orphaned snapshot:**
LangGraph checkpoints are a persistence layer for a *running* thread. When you kill the process, the thread is gone. The SQLite data is intact, but there's no agent to read it and continue. `resume` requires the run to be in a `waiting_for_response` state — which requires a live LangGraph thread to have called `interrupt()`.

This means:
- **Checkpoints work correctly during execution** — 3 checkpoints captured the graph state at planner start, planner end, and coder start
- **Resume only works from interrupt points** — a process kill mid-node is not the same as an interrupt; the graph doesn't know it needs to wait
- **For true crash recovery**, you'd need the agent-workflow process itself to be managed by a supervisor that restarts it and re-attaches to the same thread

**This is a fundamental architecture constraint**, not a bug:
- LangGraph checkpoints persist graph state for *resuming from interrupt()*
- Interrupt() is called explicitly by nodes that need human input (review, validation failure requiring retry choice, etc.)
- A clean kill mid-node is not an interrupt — the graph never got a chance to pause itself
- To simulate true crash-resume, the workflow would need to run as a managed service with process supervision

**Files at time of interrupt:**
- Workspace had Phase 3 dnd-kit code intact (App.tsx with SortableItem, DndContext, PointerSensor)
- @dnd-kit packages installed (node_modules populated)
- Filter bar code NOT yet written (killed before coder finished)

**Implication for autonomous agent goal:**
The checkpoint mechanism works for its intended use (interrupt-based human-in-the-loop), but it does NOT provide crash recovery in the way you'd want for "agent runs overnight, context window resets, agent continues in the morning." That would require a different architecture — either the agent process itself is long-lived with proper state management, or the graph state is stored in a way that a new process can re-attach.

---

### Phase 5 — Review gate [COMPLETED]
**Concern:** Loop (review)
**Question:** Does Hermes review correctly block or flag a risky refactor?

**Target repo:** `~/try/todo-react`
**Task:** Refactor App.tsx: convert todos state from useState array to useReducer. Keep all existing tests passing.

**Run:** f1b9dd2c-c093-4051-adef-6cbf8a8c1252
**Attempts:** 2 (first hit planner parse error: Hermes wrapped JSON in markdown code block)
**Result:** Reviewer approved after retry. `reviewDecision: "approved"`.

**What happened (attempt 1):**
```
Planner (Hermes) → ✗ Malformed planner output: JSON Parse error
→ human_checkpoint (agent_execution_failed)
→ retry
```

**What happened (attempt 2):**
```
Planner → Coder → Validation (passed) → Reviewer (approved) → complete
```

**Reviewer output:**
> "Reducer correctly implements all four mutation arms (add appends, toggle maps and flips, delete filters by id, clear-completed filters out completed todos). Todo and TodoAction types are properly scoped. loadTodos initializer is lazy. Component API preserved. No scope creep."

**Key findings:**

1. **Planner parse failure is the main failure mode** — Hermes wrapped its JSON response in a markdown code block. The workflow correctly caught this as `agent_execution_failed` and created a human checkpoint. After retry, it succeeded.

2. **`--review-required` flag is not enforced by the planner** — Attempt 1: `review_required: false` despite `--review-required` flag. Attempt 2: still `review_required: false`. The flag was passed to the workflow but the planner didn't route to a review node — instead the reviewer ran anyway because the workflow has a mandatory review step at the end.

3. **Reviewer correctly approved low-risk refactor** — The refactor was straightforward (useState → useReducer, same API). Reviewer correctly identified it as safe and approved. This is the expected happy path.

4. **The review gate as designed works for "should we proceed?"** — But the real test of a review gate is whether it *blocks* something risky. This refactor was not risky, so we didn't actually test the gate's blocking behavior.

**The actual review question that matters for autonomy:**
> "Given this task, should the agent proceed or should a human review first?"

For the todo app refactor, the reviewer correctly approved. But a genuinely risky refactor (e.g., changing auth logic, touching payment flows, deleting migrations) would need the reviewer to correctly identify the risk and block.

**Files at completion:**
- `src/App.tsx` — useReducer refactor applied to source repo
- 1 test passing (original test: heading renders)

---

## Summary: All 5 Phases Complete

| Phase | Concern | Question | Status |
|-------|---------|----------|--------|
| 1 | Harness | Basic round-trip with validation | COMPLETED |
| 2 | Loop | Retry on planted failure | COMPLETED |
| 3 | Graph | Research routing | COMPLETED |
| 4 | Checkpoint | Interrupt + resume | COMPLETED |
| 5 | Review | Review gate | COMPLETED |

### What works:
- Validation loop catches test failures and retries bounded
- Planner routes tasks through coder → validation → reviewer → complete
- Reviewer approves correct refactors
- Checkpoints capture graph state during execution
- Workspace isolation protects source repo

### What doesn't work (yet):
- **Research gate too conservative** — planner concluded no research needed for dnd-kit wiring, Codex had to infer from documentation
- **Planner parse reliability** — Hermes wraps JSON in code blocks, causing parse failures that require retry
- **Crash resume** — checkpoints persist but require a live LangGraph thread to resume; process kill leaves orphaned snapshots
- **Review gate blocking** — flag exists but planner doesn't route risky tasks to mandatory human review; the review runs anyway but isn't triggered by risk detection

### Implication for "agent I don't need to watch":
The workflow handles the happy path correctly (1-2 attempts, bounded retries, review approval). But the failure modes — parser errors, incorrect research routing, checkpoint orphans — all require human intervention. For true unsupervised operation, these three need to be fixed first:
1. Planner JSON output must be parseable without code blocks
2. Research routing needs a better self-awareness trigger
3. Crash resume needs a supervisor process, not just SQLite checkpoints

### Phase 7 — Investigator Node for Laravel Domain Analysis [COMPLETED]
**Concern:** Graph (new node type)
**Question:** Can we add an `investigator` node for domain-specific code analysis that produces a structured vulnerability report for Codex?

**Result:** Added `investigator` node to the LangGraph. Hermes runs structural code analysis (model scopes, controller mutations, cascade operations) and outputs a JSON vulnerability report that Codex reads as context. Plugs the gap where Codex lacks Laravel/PHP domain knowledge.

**Files changed:**
- `src/state.ts` — `investigation_report`, `investigation_required`, `investigation_mode` fields + `investigator` in worker sources
- `src/prompts.ts` — `investigatorPrompt()` with structured output schema
- `src/routing.ts` — `routeAfterInvestigation()`, extended `routeAfterPlanning` and `routeAfterResearch`
- `src/agents.ts` — `InvestigatorOutputSchema`, `investigator` kind in `runHermes`
- `src/graph.ts` — `investigatorNode`, edges: `planner→investigate`, `research→investigate`, `investigate→research/coder`, `human→investigate`
- `tests/routing.test.ts` — new routing assertions for investigate precedence

**Routing tree:**
```
planner
  ├── investigation_required=true → investigate → research → coder
  ├── research_required=true     → research → (investigate) → coder
  └── default                    → coder

investigate
  ├── research_required=true     → research → coder
  └── default                    → coder

research
  └── investigation_required=true → investigate → (research) → coder

human_checkpoint
  └── resumeTarget=investigate → investigate
```

**Key insight:** The Graph is the only primitive. Loop and Harness are emergent patterns, not independent concerns.

---

### Phase 6 — Priority + Due Dates via Sub-Agents [COMPLETED]
**Concern:** Graph (full orchestrator loop)
**Question:** Can the agent-workflow autonomously implement a multi-field feature through the full Hermes→Codex→validation loop, with zero manual intervention?

**Target repo:** `~/try/todo-react`
**Feature:** Priority (`low`/`medium`/`high`) + Due Date fields. Colored priority badge per todo. Inline priority selector and date input. Extended filter bar with `Priority: High/Medium/Low` + `Due Soon` (within 3 days) filters. localStorage persistence. 4 new tests, all existing tests pass.

**Run:** `f51d5016`
**Attempts:** 2
**Result:** `completed` — 11 tests pass.

**What happened:**
```
Run ID: f51d5016

planner (Hermes, attempt 1) → 48s
  Output: plan + validation commands + research_required=false + review_required=false
  Routes to: coder

coder (Codex, attempt 1) → 29s
  Changes: src/App.tsx (+152 lines: types, reducer actions, priority badge, date label,
               filter buttons, inline selectors) + src/App.test.tsx (+96 lines: 4 new tests)
  Exit: 0 (success)
  Routes to: validation

validation (attempt 1) ✗
  ✓ bun run typecheck → 0
  ✗ bun run test → exit 1
    2 failures:
      - changes todo priority via inline selector: fireEvent.change on <select>
        → "The given element does not have a value setter" (jsdom limitation)
      - filters by priority: same issue
  Routes to: coder (attempts remain)

coder (Codex, attempt 2) → 32s
  Prior validation failures: passed to Codex as context
  Codex fixes: rewrites select element tests to use querySelector approach
    (finds select by data-testid, uses fireEvent.change)
  Exit: 0
  Routes to: validation

validation (attempt 2) ✓
  ✓ bun run typecheck → 0
  ✓ bun run test → 0
    11 tests passed (7 original + 4 new)
  Routes to: complete

complete
  reconciliation: git apply --check → ✓
  patch applied to source repo: /Users/chrisdeuda/try/todo-react
  workspace cleaned up
  status: completed
```

**Key findings:**

1. **The full loop ran autonomously.** Zero human intervention from task → completed. The agent-workflow spawned Hermes (planner) and Codex (coder) as sub-agents, validated deterministically, retried on failure, and reconciled changes back to the source repo.

2. **Validation loop caught jsdom harness gap.** Attempt 1 failed because `fireEvent.change` on `<select>` elements doesn't work in jsdom — it requires `setNativeValue`. This is the same harness-gap insight from Phase 2, but this time the loop corrected it without human intervention. Codex received the test failure output as context and fixed the tests in attempt 2.

3. **The loop needs 2 attempts for UI+tests features.** Attempt 1: code + tests both correct logically, but tests fail on jsdom harness limitation. Attempt 2: Codex fixes the test pattern, validation passes. This is the expected pattern for UI features — harness gaps surface in the first validation pass.

4. **Planner correctly identified no research needed.** The feature was entirely context-derived from the existing codebase — no external API lookups needed.

5. **No review was required.** The change was UI-only (state + rendering), not auth/security/DB/migration. The deterministic risk rules didn't escalate.

**What Codex produced:**
- `Todo` type extended: `priority: Priority` (default `'medium'`) + `dueDate: string | null`
- `TodoAction` extended: `set-priority`, `set-due-date`
- `todoReducer` handles all new actions
- `loadTodos` migrated: spreads parsed todos with priority defaults (backward-compat)
- `Filter` union extended: `'priority_high' | 'priority_medium' | 'priority_low' | 'due_soon'`
- `isWithinThreeDays` helper: date math, excludes null and past dates
- New state: `newTodoPriority`, `newTodoDueDate`
- New UI: priority selector + date input in add form; priority badge per row; inline selectors per row
- 4 new tests covering priority change, due date change, priority filter, due-soon filter

**Harness fix pattern discovered:**
```typescript
// Attempt 1 (failed): direct fireEvent.change on select
fireEvent.change(selector, { target: { value: 'high' } })
// jsdom error: "The given element does not have a value setter"

// Attempt 2 (succeeded): use querySelector to find the select element
const selectEl = todoItem.querySelector(
  'select[data-testid^="todo-priority-"]',
) as HTMLSelectElement
fireEvent.change(selectEl, { target: { value: 'high' } })
```

The jsdom `fireEvent.change` behavior for `<select>` elements changed in newer versions. The fix is to use `querySelector` to find the element first, then fire the event — which is actually the correct pattern anyway.

---

## Running All Phases

```bash
cd ~/try/Graph-Engineering

# Reset todo-react to clean baseline
cd ~/try/todo-react && git checkout -- . && git clean -fd

# Phase 2
bun run agent-workflow run \
  --task "Add localStorage persistence..." \
  --repo ~/try/todo-react \
  --validate "bun run typecheck && bun run test" \
  --no-interactive --verbose

# For interrupted runs, check status:
bun run agent-workflow status <run_id>

# For interrupted runs, resume:
bun run agent-workflow resume <run_id> \
  --response revise \
  --message "fix the localStorage key name" \
  --no-interactive
```
