# Graph Engineering — Concepts & Implementation

**Repo:** `~/try/Graph-Engineering`
**Framework:** LangGraph (StateGraph) + Hermes + Codex
**Runtime:** Bun

---

## The Three Concerns

From [@beamnxw's framework](https://x.com/beamnxw/status/2081022966645535079):

| Concern | Solves | Applied as |
|---------|--------|------------|
| **Harness** | Agent can't reach right data or tools safely | Hermes context, isolated worktree, sandboxed Codex, vitest globals |
| **Loop** | First attempt close but not reliable | Bounded validation retry, exit-code gating, reviewer escalation |
| **Graph** | Specialists run in wrong order; failures hard to locate | LangGraph nodes + conditional routing, SQLite traces |

The experiment ran 7 phases against a real (ish) Vite+React+TypeScript todo app (`~/try/todo-react`) and Laravel Safety365 backends, each phase stress-testing one concern.

| Phase | Concern | Finding |
|-------|---------|---------|
| 1 | Graph | Basic round-trip works. 1 Codex call, 0 retries. |
| 2 | Loop | Harness gap dominated failure mode. Once `globalThis.localStorage` provided, task needed 0 retries. |
| 3 | Graph (routing) | Planner research gate too conservative. Codex inferred API correctly but timed out. |
| 4 | Harness (checkpoint) | Checkpoints work during execution. Process kill mid-node leaves orphaned snapshot. |
| 5 | Loop (review) | Planner parse failure (JSON in code block) was main failure. Reviewer approved low-risk refactor. |
| 6 | Graph (full loop) | Full autonomous loop: Hermes→Codex→validation→retry→complete. Zero manual intervention. jsdom harness gaps surface in first validation pass and are corrected by the loop. |
| 7 | Graph (investigation) | Added `investigator` node. Hermes audits model scopes + controller mutations, produces structured vulnerability report fed to Codex. Plugs the gap where Codex lacks domain knowledge (Laravel scoping patterns).

---

## Architecture Overview

```
START
  │
  ▼
planner ──[routeAfterPlanning]──► research ──[routeAfterResearch]──► coder ──[routeAfterCoder]──► validation ──[routeAfterValidation]──► reviewer ──[routeAfterReview]──► complete
  │                                    │                                 │                                                      │
  │                                    │                                 │                                                      │
  ▼                                    ▼                                 ▼                                                      ▼
prepare_human_checkpoint ──► human_checkpoint ──[routeAfterHuman]───► (any node)
                                                                       │
                                                                       ▼
                                                                    failed
```

Every edge and conditional transition is a pure function in `src/routing.ts`. Every node is a function in `src/graph.ts`. State lives in `src/state.ts`.

---

## State (`src/state.ts`)

```typescript
WorkflowState = {
  // Identity
  runId: string
  task: string
  repo: string

  // Workspace isolation
  sourceRepo: string?
  workspaceIndex: string?       // Git index path — lets us diff workspace vs source
  baselineHead: string          // Captured at start; used to detect boundary violations
  baselineBranch: string

  // Planner output
  plan: string?
  researchRequired: boolean
  researchReason: string
  researchFindings: string
  validationCommands: string[]  // Trusted commands only
  validationCoverageComplete: boolean

  // Coder output
  implementationResult: CommandResult
  implementationSummary: string
  changedFiles: string[]

  // Review
  reviewRequired: boolean
  reviewReason: string
  reviewRiskReasons: string[]
  reviewDecision: "approved" | "changes_requested" | "human_required"
  reviewResult: string?

  // Loop control
  attempt: number               // 1-based
  maxAttempts: number
  attemptsExhausted: boolean

  // Human interrupt
  humanReason: InterruptReason?  // e.g. "validation_failed_exhausted"
  humanResponse: string?         // e.g. "revise", "abort", "approve"
  humanMessage: string?

  // Error recovery
  workerErrorSource: "planner" | "research" | "coder" | "reviewer" | null
  workerError: CommandResult?

  // Boundary enforcement
  boundaryViolation: boolean
  boundaryEvidence: string
  stopReason: string
  status: "running" | "waiting_for_human" | "completed" | "failed"
}
```

### Interrupt Reasons

Each `humanReason` maps to a fixed set of allowed human responses (`allowedResponses`):

```typescript
validation_failed_exhausted  → ["accept_with_failed_validation", "revise", "abort"]
validation_environment_failed → ["retry", "abort"]
validation_commands_missing  → ["provide_validation", "abort"]
review_uncertain             → ["approve", "revise", "abort"]
review_changes_exhausted     → ["accept_with_review_findings", "revise", "abort"]
agent_execution_failed       → ["retry", "abort"]
codex_execution_failed       → ["retry", "abort"]
operator_pause               → ["continue", "revise", "abort"]
```

---

## Nodes

### `planner`
- **Role:** Read-only task analysis by Hermes
- **Inputs:** `task`, `repo`
- **Outputs:** `plan`, `researchRequired`, `reviewRequired`, `validationCoverageComplete`, `validationCommands`
- **Invariant:** Reads the repo, copies validation commands from `AGENTS.md` verbatim. Does not run Codex.
- **Failure mode:** JSON wrapped in markdown code block (Hermes default) causes parse failure. Caught as `agent_execution_failed` → human checkpoint.

### `research`
- **Role:** Read-only knowledge retrieval by Hermes
- **Inputs:** `task`, `plan`, `researchReason`
- **Outputs:** `researchFindings`
- **Triggered when:** Planner sets `researchRequired: true` and `researchMode !== "off"`
- **Key finding:** Planner's research gate is too conservative — it doesn't self-awareness-trigger on "I need to look up a new library." Phase 3 showed Codex correctly inferring `@dnd-kit` API without research, but taking too long (487s timeout).

### `coder`
- **Role:** Only writing agent. Runs Codex in sandboxed workspace.
- **Inputs:** `task`, `plan`, `researchFindings`, `validationResults` (prior failures), `reviewResult`, `humanMessage`
- **Outputs:** `implementationSummary`, `changedFiles`, `reviewRiskReasons`
- **Sandbox flags:** `--sandbox workspace-write`, `network_access=false`, `web_search="disabled"`
- **Retry logic:** If Codex returns no summary and attempts remain, re-runs coder node. Exhausted → `codex_execution_failed` human checkpoint.

### `validation`
- **Role:** Runs trusted validation commands in sequence
- **Inputs:** `validationCommands`
- **Logic:** Sequential. Stops on first failure. Exit code gating.
- **Environment failures:** Detected via `isValidationEnvironmentFailure`. Routes to `validation_environment_failed` interrupt (retry or abort).
- **Retry:** On failure, routes back to coder with `failedValidation` context for next attempt.

### `reviewer`
- **Role:** Read-only Hermes review of changes
- **Inputs:** `task`, `plan`, `validationResults`, `changedFiles` (git diff)
- **Outputs:** `reviewDecision`, `reviewResult`
- **Decisions:**
  - `approved` → complete
  - `changes_requested` → retry coder (bounded)
  - `human_required` → interrupt for human judgment

### `prepare_human_checkpoint` + `human_checkpoint`
- **Purpose:** Serialize state to SQLite via LangGraph interrupt, then resume from user response.
- **Interrupt payload:** Includes `run_id`, `reason`, `task`, `attempt`, `validation_summary`, `review_summary`, `worker_error`, `allowed_responses`.
- **Resume logic:** `routeAfterHuman` dispatches on `humanResponse` — `abort` → failed, `approve` → complete, `revise` / `retry` / `continue` → targeted node, `provide_validation` → validation.

### `complete`
- **Action:** Reconcile workspace changes back to source repo via `reconcileWorkflowWorkspace`. Logs terminal event.

### `failed`
- **Action:** Preserves `changedFiles` and `stopReason`. Logs terminal event.

---

## Routing Logic (`src/routing.ts`)

Every routing function follows the same pattern:

```typescript
function boundaryOrWorkerFailure(state) {
  if (state.boundaryViolation) return "failed"
  if (state.humanReason)        return "human"
  if (state.workerErrorSource)  return "human"
  return undefined
}
```

| After | Routes to | Condition |
|-------|-----------|-----------|
| `planner` | `research` | `researchRequired && researchMode !== "off"` |
| `planner` | `coder` | `validationCommands.length > 0` |
| `planner` | `human` | `validationCommands.length === 0` |
| `research` | `coder` | no failure |
| `coder` | `validation` | always (unless failure) |
| `validation` | `coder` | failed, attempts remain |
| `validation` | `reviewer` | passed, `reviewRequired` |
| `validation` | `complete` | passed, no review |
| `reviewer` | `complete` | `approved` |
| `reviewer` | `coder` | `changes_requested`, attempts remain |
| `reviewer` | `human` | `human_required` or exhausted |

### Trusted Review Risks

Hardcoded keyword matching for risky operations that trigger mandatory review:

```typescript
const rules = [
  ["authentication or authorization", /\b(auth|oauth|login|permission|role|acl)\b/],
  ["security-sensitive change",       /\b(security|secret|credential|crypto|csp|csrf|xss)\b/],
  ["database migration",              /\b(migration|migrations|schema\.sql|prisma\/migrations)\b/],
  ["public API or schema",           /\b(public api|openapi|graphql|api\/|schema)\b/],
]
```

---

## Harness (`src/checkpoint.ts`, `src/agents.ts`)

### Workspace Isolation

```
source repo (target)  ──worktree add──►  isolated workspace
                                          (Git index per-run)
                                           node_modules symlinked
                                           changes diff via index
```

- Created via `git worktree add --detach` for existing repos, `git init` for fresh
- Per-run Git index stored at `~/.local/share/agent-workflow/workspaces/<runId>.index`
- `workspaceChangedFiles` and `workspaceReviewDiff` read from the index, never from git status
- On completion: `reconcileWorkflowWorkspace` applies the patch back to source repo via `git apply`
- On discard: worktree removed, index deleted

### Boundary Enforcement

Before and after every Hermes/Codex call:

```typescript
const before = await worktreeFingerprint(baseline(state))
// ... run agent ...
const after = await worktreeFingerprint(baseline(state))
if (after !== before) {
  return { boundaryViolation: true, boundaryEvidence: worktreeEvidence(state.repo) }
}
```

`worktreeFingerprint` hashes: `HEAD`, branch, `git diff` (tracked), all untracked file contents. A fingerprint mismatch means Hermes modified something persistent — workflow halts.

### Codex Sandboxing

```bash
codex exec \
  --cd <repo> \
  --sandbox workspace-write \
  --strict-config \
  -c sandbox_workspace_write.network_access=false \
  -c 'web_search="disabled"' \
  --output-schema <schema> \
  --output-last-message <output> \
  <prompt>
```

Network and web search disabled. `--strict-config` blocks config overrides. Output constrained to `{ summary: string }` via JSON schema.

### Test Harness (vitest setup)

Phase 2 revealed that the harness gap dominated failure mode:

> Codex spiraled adding `beforeEach(() => localStorage.clear())` which crashed vitest — the harness had no global localStorage to clear.

Fix: `vitest.config.ts` with `setupFiles: ['./src/vitest-setup.ts']` providing `globalThis.localStorage` as an in-memory store. After the fix, the actual task required zero retries.

**Key insight:** Invest in test infrastructure before tuning retry limits. The harness enables the loop to work correctly.

### Agent Environment

`.env` loaded into `process.env` before any subprocess spawn. Only local executable paths allowed. Credentials redacted from all traces.

---

## Loop (`src/graph.ts`, `src/validation.ts`)

### Bounded Retry Pattern

```typescript
function withNextAttempt(state) {
  if (state.attempt < state.maxAttempts) {
    return { attempt: state.attempt + 1, attemptsExhausted: false }
  }
  return { attemptsExhausted: true }
}
```

- `maxAttempts` starts at a configured value; human responses can extend it
- `attemptsExhausted: true` routes to human checkpoint instead of retrying
- Codex and validation failures are the primary retry triggers

### Validation Loop

```
coder → validation (fails) → coder (retry) → validation → ...
                              ↑ attemptsExhausted → human_checkpoint
```

Validation failure context is threaded back to coder as `failedValidation`:

```
Prior validation failures: <command>\n<stderr/stdout>\n\n<command>\n<stderr/stdout>
```

### Reviewer Escalation

```
reviewer (changes_requested) → coder (retry)
                              ↑ attemptsExhausted → human_checkpoint
```

### Validation Environment Failures

Distinguished from test failures — indicates the validation harness itself is broken (e.g., missing dependency). Routes to `validation_environment_failed` interrupt with `["retry", "abort"]` responses.

---

## Checkpointing (`src/checkpoint.ts`)

### SQLite Checkpoints via LangGraph

```typescript
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite"

const checkpointer = SqliteSaver.fromConnString(
  join(dataRoot, "checkpoints.sqlite3")
)
```

LangGraph checkpoints are a **persistence layer for a running thread**, not a crash recovery mechanism:

- Checkpoints capture graph state at every `interrupt()` call
- `resume()` re-attaches to the same in-memory LangGraph thread
- Process kill mid-node is **not** an interrupt — the graph never paused, thread is gone

### Phase 4 Finding

```
Start → Planner ✓ → Coder (killed mid-execution) → [no process]
```

3 checkpoints recorded correctly. But no running agent to read them. `resume` requires the run to be in a `waiting_for_human` state — which requires `interrupt()` to have been called.

**True crash recovery** would need a supervisor process that:
1. Owns the LangGraph thread
2. Restarts on crash
3. Re-attaches to the existing thread ID

### Leases

```typescript
active-runs.json  (XDG data root)
{
  "<repo>": {
    run_id: "<uuid>",
    status: "running" | "waiting_for_human",
    pid: 12345,
    workspace: "/path/to/workspace",
    updated_at: "2026-07-..."
  }
}
```

- Process lock prevents concurrent writers
- Dead running leases auto-reclaimed; waiting-for-human leases preserved

---

## Agents (`src/agents.ts`)

### Hermes (`runHermes`)

```typescript
runHermes(prompt, repo, timeoutMs, kind)
// → { result: CommandResult, output: PlannerOutput | ResearchOutput | ReviewOutput }
```

- Calls `hermes -z "<prompt>"` in the repo directory
- `kind` selects output schema: `planner` → `PlannerOutputSchema`, `research` → `ResearchOutputSchema`, `reviewer` → `ReviewOutputSchema`
- Parse failure returns `{ result }` with exitCode null and error in stderr — caught as `agent_execution_failed`

### Codex (`runCodex`)

```typescript
runCodex(prompt, repo, timeoutMs, dataRoot)
// → { result: CommandResult, summary: string }
```

- Creates temp dir at `dataRoot/codex-<uuid>/`
- Writes JSON schema and reads output via `--output-last-message`
- Cleans up temp dir in `finally`
- `codexTraceLine` emits structured events: `Run: <cmd>`, `Changed: <files>`, `Codex: <message>`
- Network disabled, web search disabled

### Output Schema (Codex)

```typescript
{ summary: string }  // enforced via --output-schema
```

### Command Tracing

All subprocesses logged via `logEvent`:
- `command_start`, `command_running` (heartbeat every 10s), `command_output`, `command_complete`
- Redaction: API keys, tokens, passwords stripped before logging

---

## Trusted Validation Commands

Validation commands come from three sources, in priority order:

1. **CLI** — `--validate` flag supplied by caller
2. **Agents** — Planner reads from root `AGENTS.md` (copied verbatim)
3. **Fallback** — Hardcoded advisory commands from `trustedAgentValidationCommands`

Never executes undocumented model output. Commands are shell strings, not arbitrary scripts.

---

## Key Findings from 5 Phases

| # | Phase | Finding |
|---|-------|---------|
| 1 | Basic round-trip | Works. 1 Codex call, 0 retries. |
| 2 | Validation loop | Harness gap dominated failure mode. Once `globalThis.localStorage` was provided, task needed 0 retries. |
| 3 | Research routing | Planner concluded no research needed for `@dnd-kit`. Codex inferred API correctly but timed out at 487s. Research gate is too conservative. |
| 4 | Checkpoint resume | Checkpoints work during execution. Process kill mid-node leaves orphaned snapshot. `resume` only works from `interrupt()`. |
| 5 | Review gate | Planner parse failure (JSON in code block) was the main failure. Reviewer correctly approved low-risk refactor. Flag-based routing not enforced by planner. |

### What Still Needs Work

1. **Planner JSON output** — Hermes wraps in code block by default. Needs prompt engineering or `-z` flag behavior confirmed.
2. **Research self-awareness** — Planner doesn't trigger research when it needs to look up a new library. Consider letting Codex self-route to research when it hits unknown APIs.
3. **Crash resume** — Needs supervisor process, not just SQLite checkpoints.
4. **Review risk flag routing** — `--review-required` flag not enforced by planner. Review runs anyway (mandatory step) but isn't triggered by risk detection.

### Phase 7 Update: Investigator Node for Domain-Specific Analysis

The Graph is the only first-class primitive. Loop and Harness are useful lenses for reasoning, but not independent concerns — they reduce to "what edges go where" and "what the node receives."


Phase 7 added the `investigator` node for tasks requiring domain-specific code analysis (Laravel scoping, SQL patterns, security audits). The investigator runs Hermes to search for structural patterns and produces a structured vulnerability report that Codex reads as context. This plugs the gap where Codex lacks domain knowledge — instead of guessing at Laravel patterns, it receives a prioritized finding list.

**Routing:** `investigate → research → coder → validation → reviewer → complete`
- Investigate precedes research and code when `investigation_required: true` in planner output
- Investigator output feeds into `investigation_report` state field, available to coder
- Investigator failure routes to human checkpoint (retry or abort)
- Human resume can target `investigate` to re-run investigation

**New planner output field:**
```json
{"investigation_required": true}
```

**Investigator output:**
```json
{"findings": [{"file": "...", "location": "...", "issue": "...", "severity": "high", "fix_required": "..."}], "summary": "...", "recommendations": ["..."]}
```

### Phase 6 Update: Full Loop Works Autonomously

Phase 6 ran the full autonomous loop on a Priority + Due Date feature. Results:
- 1 planner call (Hermes) → 48s
- 2 Codex calls (attempt 1 failed validation, attempt 2 passed) → ~30s each
- 2 validation passes → ~2s each
- Complete: patch reconciled to source repo
- **Zero manual intervention**

**Key: harness gaps surface in first validation pass.** Attempt 1 failed because `fireEvent.change` on `<select>` doesn't work in newer jsdom. Codex received the failure context and fixed the test pattern in attempt 2. This is the expected pattern — the loop corrects harness gaps without human help.

---

## File Map

```
src/
  graph.ts        — Nodes + edges + buildGraph()
  routing.ts      — All routeAfter* pure functions
  state.ts        — WorkflowState Zod schema + allowedResponses
  agents.ts       — runHermes, runCodex, runCommand, CLI compatibility check
  checkpoint.ts   — Worktree creation, fingerprinting, leases, reconciliation
  validation.ts  — runValidationCommand, trustedAgentValidationCommands
  prompts.ts      — plannerPrompt, researchPrompt, coderPrompt, reviewerPrompt
  events.ts       — logEvent (structured event emission)
  cli.ts          — CLI argument parsing + run/resume/status commands
  tui.ts          — Terminal UI for interactive mode
```

---

## Running

```bash
cd ~/try/Graph-Engineering
bun run build

# Basic run
bun run agent-workflow run \
  --task "Add localStorage persistence to the todo list" \
  --repo ~/try/todo-react \
  --validate "bun run typecheck && bun run test" \
  --no-interactive --verbose

# Status
bun run agent-workflow status <run_id>

# Resume after interrupt
bun run agent-workflow resume <run_id> \
  --response revise \
  --message "fix the localStorage key name" \
  --no-interactive
```
