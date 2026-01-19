/**
 * Format output with header and list style options
 */

export type HeaderType = 'targets' | 'accomplishments';
export type ListStyle = 'bullets' | 'numbered';

export const HEADERS = {
  targets: '📝 Targets for Today:',
  accomplishments: '✅ Accomplishments:',
} as const;

/**
 * Convert bullet list to numbered list
 * Handles nesting with a. b. c. for sub-items
 */
export function bulletsToNumbered(markdown: string): string {
  if (!markdown.trim()) return '';

  const lines = markdown.split('\n');
  const result: string[] = [];
  const counters: number[] = [0]; // Track counter for each nesting level

  for (const line of lines) {
    if (!line.trim()) continue;

    // Count indentation
    const indent = line.match(/^(\s*)/)?.[1].length ?? 0;
    const level = Math.floor(indent / 2);

    // Get content (remove bullet)
    const content = line.replace(/^\s*-\s*/, '').trim();

    // Adjust counters array for current level
    while (counters.length <= level) {
      counters.push(0);
    }
    while (counters.length > level + 1) {
      counters.pop();
    }

    // Increment counter for current level
    counters[level]++;
    // Reset deeper level counters
    for (let i = level + 1; i < counters.length; i++) {
      counters[i] = 0;
    }

    // Format number based on level
    const number = level === 0
      ? `${counters[level]}.`
      : String.fromCharCode(96 + counters[level]) + '.'; // a. b. c.

    const spaces = '   '.repeat(level);
    result.push(`${spaces}${number} ${content}`);
  }

  return result.join('\n');
}

/**
 * Format the final output with header
 */
export function formatOutput(
  markdown: string,
  headerType: HeaderType,
  listStyle: ListStyle
): string {
  if (!markdown.trim()) return '';

  const header = HEADERS[headerType];
  const body = listStyle === 'numbered' ? bulletsToNumbered(markdown) : markdown;

  return `${header}\n${body}`;
}

/**
 * Convert numbered list to HTML
 */
export function numberedToHtml(text: string): string {
  if (!text.trim()) return '';

  const lines = text.split('\n');
  const result: string[] = [];
  const stack: number[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    // Skip header line
    if (line.startsWith('📝') || line.startsWith('✅')) {
      result.push(`<p><strong>${line}</strong></p>`);
      continue;
    }

    // Count indentation (3 spaces = 1 level for numbered)
    const indent = line.match(/^(\s*)/)?.[1].length ?? 0;
    const level = Math.floor(indent / 3);

    // Get content (remove number prefix like "1." or "a.")
    const content = line.replace(/^\s*\d+\.\s*/, '').replace(/^\s*[a-z]\.\s*/, '').trim();

    // Close nested lists if going back up
    while (stack.length > level) {
      result.push('</ol>');
      stack.pop();
    }

    // Open new nested lists if going deeper
    while (stack.length < level) {
      result.push('<ol type="a">');
      stack.push(stack.length);
    }

    result.push(`<li>${content}</li>`);
  }

  // Close remaining open lists
  while (stack.length > 0) {
    result.push('</ol>');
    stack.pop();
  }

  // Wrap in outer ol if we have list content
  const listContent = result.filter(r => !r.startsWith('<p>')).join('');
  const headerContent = result.filter(r => r.startsWith('<p>')).join('');

  if (listContent) {
    return `${headerContent}<ol>${listContent}</ol>`;
  }

  return headerContent;
}
