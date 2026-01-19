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

    // Calculate nesting level (1+ spaces = nested, max 4 levels)
    // Use ceil to be lenient - even 1 space counts as 1 level
    const level = Math.min(Math.ceil(leadingSpaces / 2), 4);

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
