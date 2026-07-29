import type { WorkflowStateValue } from "./state.js";

const MODEL_OUTPUT_LIMIT = 6_000;
const REVIEW_DIFF_LIMIT = 30_000;

export function compactModelOutput(text: string, limit = MODEL_OUTPUT_LIMIT): string {
  if (text.length <= limit) return text;
  const head = Math.floor(limit / 3);
  const omitted = text.length - limit;
  return `${text.slice(0, head)}\n[${omitted} characters omitted]\n${text.slice(-(limit - head))}`;
}

export function plannerPrompt(state: WorkflowStateValue): string {
  return `You are the read-only planner in a fixed development workflow.
Repository: ${state.repo}
Task: ${state.task}

Inspect the repository as needed, but do not modify any file or run Codex. Keep scope exact.
Read the root AGENTS.md when present. Copy validation_commands exactly from its setup, build, test, validation, or check instructions; return an empty list when it documents no applicable commands.
Return only one JSON object with this shape:
{"plan":"concrete plan","research_required":false,"research_reason":"","review_required":false,"review_reason":"","validation_coverage_complete":true,"validation_commands":["advisory command"]}
Do not invent or rewrite validation commands. Do not wrap the JSON in Markdown.`;
}

export function researchPrompt(state: WorkflowStateValue): string {
  return `You are the read-only research worker in a fixed development workflow.
Repository: ${state.repo}
Task: ${state.task}
Plan: ${state.plan ?? ""}
Research reason: ${state.researchReason}

Research only the stated gap. Do not modify repository files and do not run Codex.
Return only JSON: {"findings":"concise implementation-relevant findings"}.`;
}

export function investigatorPrompt(state: WorkflowStateValue): string {
  return `You are the read-only code investigator in a fixed development workflow.
Repository: ${state.repo}
Task: ${state.task}
Plan: ${state.plan ?? ""}

Investigate the codebase to find structural issues. Do NOT modify any files.

Produce a structured vulnerability or audit report as JSON with this exact shape:
{"findings":[{"file":"path/to/file.php","location":"function name or line range","issue":"plain-language description of the problem","severity":"high|medium|low","fix_required":"concise description of the change needed"}],"summary":"overall finding count and severity summary","recommendations":["ordered list of recommended fixes"]}

Guidelines:
- Find issues by searching for patterns: unscoped queries, missing where clauses, raw ID parameters in write operations
- Check all model scopes (public function scope*) that accept raw IDs and perform writes
- Check controller methods that call model statics with raw IDs
- Check cascade operations (deletes, mass updates) for missing scoping
- Check for session() usage instead of Auth::user() for auth data
- Mark HIGH severity for cross-tenant data access (IDOR patterns, unscoped deletes)
- Mark MEDIUM for information disclosure, missing authorization
- Mark LOW for code style, unused parameters
- If no issues found, return empty findings array
- Do not wrap JSON in Markdown code blocks
- Do not run Codex or modify files`;
}

export function coderPrompt(state: WorkflowStateValue): string {
  const failedValidation = state.validationResults
    .flatMap((result) => {
      if (result.exitCode !== 0 || result.timedOut) {
        return [`${result.argv.join(" ")}\n${compactModelOutput(result.stderr || result.stdout)}`];
      }
      return [];
    })
    .join("\n\n");
  return `You are the only coding worker in a controlled local workflow.
Repository: ${state.repo}
Task: ${state.task}
Attempt: ${state.attempt} of ${state.maxAttempts}
Plan: ${state.plan ?? ""}
Investigation report: ${state.investigationReport
    ? compactModelOutput(state.investigationReport, 8000)
    : "none"}
Research: ${state.researchFindings || "none"}
Prior validation failures: ${failedValidation || "none"}
Review feedback: ${state.reviewResult ?? "none"}
Human guidance: ${state.humanMessage ?? "none"}

Inspect the current worktree, including partial edits from prior attempts. Read and follow every applicable AGENTS.md before editing. Make only the requested repository changes, preserve existing conventions, and update AGENTS.md when the completed behavior makes its instructions stale.
Do not push, deploy, commit, reset, clean, switch branches, or open a pull request.
Return a concise structured summary when finished.`;
}

export function reviewerPrompt(state: WorkflowStateValue, diff: string): string {
  const validation = compactModelOutput(state.validationResults
    .map(
      (result) =>
        `${result.argv.join(" ")} → ${result.timedOut ? "timeout" : `exit ${result.exitCode}`}\n${result.stderr || result.stdout}`,
    )
    .join("\n\n"));
  return `You are the read-only reviewer in a fixed development workflow.
Task: ${state.task}
Plan: ${state.plan ?? ""}
Research: ${state.researchFindings}
Codex summary: ${state.implementationSummary}
Validation passed: ${String(state.validationPassed)}
Validation results: ${validation}
Review reasons: ${[state.reviewReason, ...state.reviewRiskReasons].filter(Boolean).join("; ")}
Git diff:\n${compactModelOutput(diff, REVIEW_DIFF_LIMIT)}

Do not modify files and do not run Codex. Review correctness and scope.
Return only JSON with exactly one decision:
{"decision":"approved|changes_requested|human_required","findings":"concise evidence"}.`;
}
