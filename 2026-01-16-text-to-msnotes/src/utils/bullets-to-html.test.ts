import { describe, it, expect } from 'vitest';
import { bulletsToHtml } from './bullets-to-html';

describe('bulletsToHtml', () => {
  describe('empty input', () => {
    it('returns empty string for empty input', () => {
      expect(bulletsToHtml('')).toBe('');
    });

    it('returns empty string for whitespace-only input', () => {
      expect(bulletsToHtml('   ')).toBe('');
      expect(bulletsToHtml('\n\n\n')).toBe('');
    });

    it('returns empty string for lines with only whitespace', () => {
      expect(bulletsToHtml('   \n   \n   ')).toBe('');
    });
  });

  describe('flat list', () => {
    it('converts single item to ul with li', () => {
      expect(bulletsToHtml('- item')).toBe('<ul><li>item</li></ul>');
    });

    it('converts multiple items to flat list', () => {
      const input = '- item 1\n- item 2\n- item 3';
      const expected = '<ul><li>item 1</li><li>item 2</li><li>item 3</li></ul>';
      expect(bulletsToHtml(input)).toBe(expected);
    });

    it('trims whitespace from items', () => {
      expect(bulletsToHtml('-   item with spaces  ')).toBe('<ul><li>item with spaces</li></ul>');
    });

    it('preserves content with special characters', () => {
      expect(bulletsToHtml('- item with @#$%^ symbols')).toBe('<ul><li>item with @#$%^ symbols</li></ul>');
    });

    it('preserves inline dashes in content', () => {
      expect(bulletsToHtml('- API Substance - SDS Details')).toBe('<ul><li>API Substance - SDS Details</li></ul>');
    });
  });

  describe('nested list', () => {
    it('converts single nested item', () => {
      const input = '- item\n  - nested';
      const expected = '<ul><li>item</li><ul><li>nested</li></ul></ul>';
      expect(bulletsToHtml(input)).toBe(expected);
    });

    it('handles multiple items at same level with nesting', () => {
      const input = '- item 1\n  - nested 1.1\n- item 2\n  - nested 2.1';
      const expected = '<ul><li>item 1</li><ul><li>nested 1.1</li></ul><li>item 2</li><ul><li>nested 2.1</li></ul></ul>';
      expect(bulletsToHtml(input)).toBe(expected);
    });

    it('handles deeply nested structure', () => {
      const input = '- level 1\n  - level 2\n    - level 3\n      - level 4';
      const expected = '<ul><li>level 1</li><ul><li>level 2</li><ul><li>level 3</li><ul><li>level 4</li></ul></ul></ul></ul>';
      expect(bulletsToHtml(input)).toBe(expected);
    });

    it('handles returning to shallower nesting level', () => {
      const input = '- item 1\n  - nested\n- item 2';
      const expected = '<ul><li>item 1</li><ul><li>nested</li></ul><li>item 2</li></ul>';
      expect(bulletsToHtml(input)).toBe(expected);
    });

    it('handles multiple nested items at same level', () => {
      const input = '- item\n  - nested 1\n  - nested 2\n  - nested 3';
      const expected = '<ul><li>item</li><ul><li>nested 1</li><li>nested 2</li><li>nested 3</li></ul></ul>';
      expect(bulletsToHtml(input)).toBe(expected);
    });
  });

  describe('complex structures', () => {
    it('handles realistic nested structure from parse-bullets output', () => {
      const input = `- Daily Standup
- Townhall
  - nested item
- plain text line
- API Substance - SDS Details`;

      const expected = `<ul><li>Daily Standup</li><li>Townhall</li><ul><li>nested item</li></ul><li>plain text line</li><li>API Substance - SDS Details</li></ul>`;
      expect(bulletsToHtml(input)).toBe(expected);
    });

    it('handles complex messy real-world input', () => {
      const input = `- Daily Standup
- Townhall
- Backlog
- API Substance - SDS Details
  - implement phrase text (continue)
- Approved list / My substance inventory
- sds location usage , edit assessment button`;

      const expected = `<ul><li>Daily Standup</li><li>Townhall</li><li>Backlog</li><li>API Substance - SDS Details</li><ul><li>implement phrase text (continue)</li></ul><li>Approved list / My substance inventory</li><li>sds location usage , edit assessment button</li></ul>`;
      expect(bulletsToHtml(input)).toBe(expected);
    });

    it('handles structure with varied nesting depths', () => {
      const input = `- item 1
  - item 1.1
    - item 1.1.1
  - item 1.2
- item 2
  - item 2.1`;

      const expected = `<ul><li>item 1</li><ul><li>item 1.1</li><ul><li>item 1.1.1</li></ul><li>item 1.2</li></ul><li>item 2</li><ul><li>item 2.1</li></ul></ul>`;
      expect(bulletsToHtml(input)).toBe(expected);
    });
  });

  describe('edge cases', () => {
    it('skips empty lines between items', () => {
      const input = '- item 1\n\n- item 2';
      const expected = '<ul><li>item 1</li><li>item 2</li></ul>';
      expect(bulletsToHtml(input)).toBe(expected);
    });

    it('handles trailing newlines', () => {
      expect(bulletsToHtml('- item\n\n')).toBe('<ul><li>item</li></ul>');
    });

    it('handles leading newlines', () => {
      expect(bulletsToHtml('\n\n- item')).toBe('<ul><li>item</li></ul>');
    });

    it('creates empty li for items with only whitespace after dash', () => {
      const input = '- item 1\n-   \n- item 2';
      const expected = '<ul><li>item 1</li><li></li><li>item 2</li></ul>';
      expect(bulletsToHtml(input)).toBe(expected);
    });

    it('handles unicode characters', () => {
      expect(bulletsToHtml('- café ☕ 🎯')).toBe('<ul><li>café ☕ 🎯</li></ul>');
    });

    it('handles very large indentation (beyond typical 4 levels)', () => {
      const input = '- item\n                  - deep nested';
      // 18 spaces = 9 levels of nesting
      const expected = '<ul><li>item</li><ul><ul><ul><ul><ul><ul><ul><ul><ul><li>deep nested</li></ul></ul></ul></ul></ul></ul></ul></ul></ul></ul>';
      expect(bulletsToHtml(input)).toBe(expected);
    });

    it('handles items with html-like content', () => {
      expect(bulletsToHtml('- item <with> &tags')).toBe('<ul><li>item <with> &tags</li></ul>');
    });
  });

  describe('indentation formats', () => {
    it('correctly interprets 2-space indentation as one level', () => {
      const input = '- parent\n  - child';
      expect(bulletsToHtml(input)).toContain('<ul><li>parent</li><ul><li>child</li>');
    });

    it('correctly interprets 4-space indentation as two levels', () => {
      const input = '- level1\n    - level2';
      expect(bulletsToHtml(input)).toContain('<ul><li>level1</li><ul><ul><li>level2</li>');
    });

    it('correctly interprets 6-space indentation as three levels', () => {
      const input = '- level1\n      - level3';
      expect(bulletsToHtml(input)).toContain('<ul><li>level1</li><ul><ul><ul><li>level3</li>');
    });
  });

  describe('output structure validation', () => {
    it('always wraps output in outer ul tags', () => {
      const result = bulletsToHtml('- item');
      expect(result).toMatch(/^<ul>.*<\/ul>$/);
    });

    it('all ul tags are properly closed', () => {
      const input = '- l1\n  - l2\n    - l3';
      const result = bulletsToHtml(input);
      const openUls = (result.match(/<ul>/g) || []).length;
      const closeUls = (result.match(/<\/ul>/g) || []).length;
      expect(openUls).toBe(closeUls);
    });

    it('all li tags are properly closed', () => {
      const input = '- item 1\n- item 2\n  - nested';
      const result = bulletsToHtml(input);
      const openLis = (result.match(/<li>/g) || []).length;
      const closeLis = (result.match(/<\/li>/g) || []).length;
      expect(openLis).toBe(closeLis);
    });

    it('li tags are properly nested within ul tags', () => {
      const result = bulletsToHtml('- item');
      expect(result).toBe('<ul><li>item</li></ul>');
      // Should not have li directly containing ul without closing previous li
      expect(result).not.toMatch(/<li>.*<ul>/);
    });
  });
});
