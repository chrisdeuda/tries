import assert from "node:assert/strict";
import { test } from "bun:test";
import {
  routeAfterCoder,
  routeAfterHuman,
  routeAfterInvestigation,
  routeAfterPlanning,
  routeAfterResearch,
  routeAfterReview,
  routeAfterValidation,
  trustedReviewRisks,
} from "../src/routing.js";
import type { WorkflowStateValue } from "../src/state.js";

function state(update: Partial<WorkflowStateValue> = {}): WorkflowStateValue {
  return {
    boundaryViolation: false,
    workerErrorSource: null,
    validationCommands: ["npm test"],
    researchRequired: false,
    researchMode: "auto",
    investigationRequired: false,
    investigationMode: "auto",
    attempt: 1,
    maxAttempts: 3,
    attemptsExhausted: false,
    reviewRequired: false,
    status: "running",
    ...update,
  } as WorkflowStateValue;
}

test("trusted review risks only escalate known sensitive work", () => {
  assert.deepEqual(trustedReviewRisks("Change button copy", ["src/ui.ts"]), []);
  assert.deepEqual(
    trustedReviewRisks("Update login permissions", ["prisma/migrations/001.sql"]),
    ["authentication or authorization", "database migration"],
  );
});

test("planning routes research, missing validation, worker errors, and boundaries", () => {
  // Investigate takes precedence over research
  assert.equal(routeAfterPlanning(state({ investigationRequired: true })), "investigate");
  // Investigate off → routes to research (if required) then coder
  assert.equal(
    routeAfterPlanning(state({ investigationRequired: true, investigationMode: "off", researchRequired: true })),
    "research",
  );
  assert.equal(
    routeAfterPlanning(state({ investigationRequired: true, investigationMode: "off", researchRequired: true, researchMode: "off" })),
    "coder",
  );
  // Research then investigate
  assert.equal(routeAfterPlanning(state({ researchRequired: true })), "research");
  assert.equal(
    routeAfterPlanning(state({ researchRequired: true, researchMode: "off" })),
    "coder",
  );
  assert.equal(routeAfterPlanning(state({ validationCommands: [] })), "human");
  assert.equal(routeAfterPlanning(state({ workerErrorSource: "planner" })), "human");
  assert.equal(routeAfterPlanning(state({ boundaryViolation: true })), "failed");
  // Research routes to investigate when also required
  assert.equal(routeAfterResearch(state()), "coder");
  assert.equal(
    routeAfterResearch(state({ investigationRequired: true })),
    "investigate",
  );
  assert.equal(routeAfterResearch(state({ workerErrorSource: "research" })), "human");
  // Investigate routes to research then code
  assert.equal(routeAfterInvestigation(state()), "coder");
  assert.equal(
    routeAfterInvestigation(state({ researchRequired: true })),
    "research",
  );
  assert.equal(
    routeAfterInvestigation(state({ workerErrorSource: "investigator" })),
    "human",
  );
});

test("Codex and validation retry only before deterministic exhaustion", () => {
  assert.equal(routeAfterCoder(state()), "validation");
  assert.equal(routeAfterCoder(state({ workerErrorSource: "coder" })), "coder");
  assert.equal(
    routeAfterCoder(state({ workerErrorSource: "coder", attemptsExhausted: true })),
    "human",
  );
  assert.equal(routeAfterCoder(state({ boundaryViolation: true })), "failed");

  assert.equal(routeAfterValidation(state({ validationPassed: false })), "coder");
  assert.equal(
    routeAfterValidation(
      state({ validationPassed: false, humanReason: "validation_environment_failed" }),
    ),
    "human",
  );
  assert.equal(
    routeAfterValidation(state({ validationPassed: false, attemptsExhausted: true })),
    "human",
  );
  assert.equal(
    routeAfterValidation(state({ validationPassed: true, reviewRequired: true })),
    "reviewer",
  );
  assert.equal(routeAfterValidation(state({ validationPassed: true })), "complete");
});

test("review and human outcomes use explicit routes", () => {
  assert.equal(routeAfterReview(state({ reviewDecision: "approved" })), "complete");
  assert.equal(
    routeAfterReview(state({ reviewDecision: "changes_requested" })),
    "coder",
  );
  assert.equal(
    routeAfterReview(
      state({ reviewDecision: "changes_requested", attemptsExhausted: true }),
    ),
    "human",
  );
  assert.equal(routeAfterReview(state({ reviewDecision: "human_required" })), "human");
  assert.equal(routeAfterReview(state({ workerErrorSource: "reviewer" })), "human");

  assert.equal(routeAfterHuman(state({ humanResponse: "approve" })), "complete");
  assert.equal(
    routeAfterHuman(state({ humanResponse: "accept_with_failed_validation" })),
    "complete",
  );
  assert.equal(routeAfterHuman(state({ humanResponse: "abort" })), "failed");
  assert.equal(
    routeAfterHuman(state({ humanResponse: "retry", resumeTarget: "research" })),
    "research",
  );
  assert.equal(
    routeAfterHuman(state({ humanResponse: "continue", resumeTarget: "validation" })),
    "validation",
  );
  // Resume to investigate
  assert.equal(
    routeAfterHuman(state({ humanResponse: "retry", resumeTarget: "investigate" })),
    "investigate",
  );
});
