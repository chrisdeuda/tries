/**
 * Converts markdown bullet list to HTML unordered list
 * Handles nested bullets by creating nested <ul> elements
 */
export function bulletsToHtml(markdown: string): string {
  if (!markdown.trim()) return '';

  const lines = markdown.split('\n');
  const result: string[] = [];
  const stack: number[] = []; // Track nesting levels

  for (const line of lines) {
    if (!line.trim()) continue;

    // Count indentation (2 spaces = 1 level)
    const indent = line.match(/^(\s*)/)?.[1].length ?? 0;
    const level = Math.floor(indent / 2);
    const content = line.replace(/^\s*-\s*/, '').trim();

    // Close nested lists if going back up
    while (stack.length > level) {
      result.push('</ul>');
      stack.pop();
    }

    // Open new nested lists if going deeper
    while (stack.length < level) {
      result.push('<ul>');
      stack.push(stack.length);
    }

    result.push(`<li>${content}</li>`);
  }

  // Close remaining open lists
  while (stack.length > 0) {
    result.push('</ul>');
    stack.pop();
  }

  // Wrap in outer ul if we have content
  if (result.length > 0) {
    return `<ul>${result.join('')}</ul>`;
  }

  return '';
}
