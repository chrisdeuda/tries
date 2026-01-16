# Phase 2: Parsing Logic

## Objective
Create utility function to parse messy text into clean markdown bullet list.

## Algorithm
1. Split input by newlines
2. For each line:
   - Count leading whitespace (tabs = 2 spaces)
   - Calculate nesting level (every 2 spaces = 1 level, max 4)
   - Strip leading bullet chars (`-`, `*`, `•`) and trim
   - Skip empty lines
3. Rebuild with proper markdown format: `"  ".repeat(level) + "- " + content`

## Tasks

### Task 2.1: Create parse-bullets.ts
Create `src/utils/parse-bullets.ts`:
```ts
/**
 * Parses messy text input into clean markdown bullet list
 * - Converts ALL non-empty lines to bullets (even without prefix)
 * - Preserves nesting based on indentation
 * - Normalizes bullet characters to "-"
 * - Normalizes multiple spaces to single space
 * - Handles tabs and mixed whitespace
 */
export function parseBullets(input: string): string {
  if (!input.trim()) return '';

  const lines = input.split('\n');
  const result: string[] = [];

  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) continue;

    // Count leading whitespace (convert tabs to 2 spaces)
    const normalized = line.replace(/\t/g, '  ');
    const leadingSpaces = normalized.match(/^(\s*)/)?.[1].length ?? 0;

    // Calculate nesting level (2 spaces = 1 level, max 4 levels)
    const level = Math.min(Math.floor(leadingSpaces / 2), 4);

    // Remove leading bullet characters and whitespace, normalize inner spaces
    const content = normalized
      .replace(/^\s*[-*•]?\s*/, '') // Remove optional bullet prefix
      .replace(/\s+/g, ' ')         // Normalize multiple spaces to single
      .trim();

    // Skip if no content after cleaning
    if (!content) continue;

    // Build clean bullet line
    const indent = '  '.repeat(level);
    result.push(`${indent}- ${content}`);
  }

  return result.join('\n');
}
```

## Verification
Test in browser console or create quick test:

Input:
```
-Daily Standup
- Townhall
- Backlog
- API Substance  - SDS Details
  - implement phrase text (continue)
- Approved list / My substance inventory
```

Expected output:
```
- Daily Standup
- Townhall
- Backlog
- API Substance  - SDS Details
  - implement phrase text (continue)
- Approved list / My substance inventory
```

## Output
- `src/utils/parse-bullets.ts` with working parsing logic
