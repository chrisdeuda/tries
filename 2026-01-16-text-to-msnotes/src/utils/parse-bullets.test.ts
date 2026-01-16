import { describe, it, expect } from 'vitest';
import { parseBullets } from './parse-bullets';

describe('parseBullets', () => {
  describe('empty input', () => {
    it('returns empty string for empty input', () => {
      expect(parseBullets('')).toBe('');
    });

    it('returns empty string for whitespace-only input', () => {
      expect(parseBullets('   ')).toBe('');
      expect(parseBullets('\n\n\n')).toBe('');
      expect(parseBullets('\t\t')).toBe('');
    });

    it('returns empty string for lines with only whitespace', () => {
      expect(parseBullets('   \n   \n   ')).toBe('');
    });
  });

  describe('single bullet', () => {
    it('converts single line with dash to bullet', () => {
      expect(parseBullets('- item')).toBe('- item');
    });

    it('converts single line without bullet prefix to bullet', () => {
      expect(parseBullets('item')).toBe('- item');
    });

    it('normalizes asterisk bullet to dash', () => {
      expect(parseBullets('* item')).toBe('- item');
    });

    it('normalizes dot bullet to dash', () => {
      expect(parseBullets('• item')).toBe('- item');
    });

    it('treats leading spaces as indentation level', () => {
      // 2 spaces = 1 level of indentation
      expect(parseBullets('  - item')).toBe('  - item');
      expect(parseBullets('    - item')).toBe('    - item');
    });
  });

  describe('nested bullets', () => {
    it('preserves single level nesting', () => {
      const input = '- item\n  - nested';
      const expected = '- item\n  - nested';
      expect(parseBullets(input)).toBe(expected);
    });

    it('preserves multiple levels of nesting', () => {
      const input = '- item\n  - nested1\n    - nested2\n      - nested3';
      const expected = '- item\n  - nested1\n    - nested2\n      - nested3';
      expect(parseBullets(input)).toBe(expected);
    });

    it('caps nesting at 4 levels', () => {
      const input = '- item\n  - l1\n    - l2\n      - l3\n        - l4\n          - l5';
      const expected = '- item\n  - l1\n    - l2\n      - l3\n        - l4\n        - l5';
      expect(parseBullets(input)).toBe(expected);
    });

    it('handles mixed indentation (tabs and spaces)', () => {
      const input = '- item\n\t- nested';
      const expected = '- item\n  - nested';
      expect(parseBullets(input)).toBe(expected);
    });

    it('normalizes tabs to 2 spaces', () => {
      const input = '- item\n\t- nested\n\t\t- deep';
      const expected = '- item\n  - nested\n    - deep';
      expect(parseBullets(input)).toBe(expected);
    });
  });

  describe('plain text lines', () => {
    it('converts plain text line to bullet', () => {
      expect(parseBullets('plain text')).toBe('- plain text');
    });

    it('converts multiple plain text lines to bullets', () => {
      const input = 'line 1\nline 2\nline 3';
      const expected = '- line 1\n- line 2\n- line 3';
      expect(parseBullets(input)).toBe(expected);
    });

    it('handles plain text mixed with bullet lines', () => {
      const input = '- item 1\nplain text\n- item 2';
      const expected = '- item 1\n- plain text\n- item 2';
      expect(parseBullets(input)).toBe(expected);
    });

    it('skips empty lines between content', () => {
      const input = '- item 1\n\n- item 2';
      const expected = '- item 1\n- item 2';
      expect(parseBullets(input)).toBe(expected);
    });
  });

  describe('multiple spaces normalization', () => {
    it('normalizes multiple spaces within content', () => {
      expect(parseBullets('- item   with   spaces')).toBe('- item with spaces');
    });

    it('normalizes tabs within content', () => {
      expect(parseBullets('- item\twith\ttabs')).toBe('- item with tabs');
    });

    it('normalizes mixed tabs and spaces within content', () => {
      expect(parseBullets('- item  \t  with  \t  mixed')).toBe('- item with mixed');
    });

    it('preserves inline dashes as part of content', () => {
      expect(parseBullets('- API Substance - SDS Details')).toBe('- API Substance - SDS Details');
    });

    it('preserves indentation levels (4 spaces = level 2)', () => {
      expect(parseBullets('- item\n    - nested')).toBe('- item\n    - nested');
    });
  });

  describe('real-world examples', () => {
    it('handles checkpoint test input from plan', () => {
      const input = `-Daily Standup
- Townhall
  - nested item
plain text line
- API Substance  - SDS Details`;

      const expected = `- Daily Standup
- Townhall
  - nested item
- plain text line
- API Substance - SDS Details`;

      expect(parseBullets(input)).toBe(expected);
    });

    it('handles complex messy input', () => {
      const input = `-Daily Standup
- Townhall
- Backlog
- API Substance  - SDS Details
  - implement phrase text (continue)
- Approved list / My substance inventory
- sds location usage  , edit assessment button`;

      const expected = `- Daily Standup
- Townhall
- Backlog
- API Substance - SDS Details
  - implement phrase text (continue)
- Approved list / My substance inventory
- sds location usage , edit assessment button`;

      expect(parseBullets(input)).toBe(expected);
    });

    it('handles inconsistent bullet types', () => {
      const input = `- item 1
* item 2
• item 3
item 4`;

      const expected = `- item 1
- item 2
- item 3
- item 4`;

      expect(parseBullets(input)).toBe(expected);
    });
  });

  describe('edge cases', () => {
    it('handles lines with only bullet characters', () => {
      expect(parseBullets('-')).toBe('');
      expect(parseBullets('*')).toBe('');
      expect(parseBullets('•')).toBe('');
    });

    it('handles lines with bullet and only spaces', () => {
      expect(parseBullets('-   ')).toBe('');
      expect(parseBullets('*   ')).toBe('');
    });

    it('handles consecutive newlines', () => {
      const input = '- item 1\n\n\n- item 2';
      const expected = '- item 1\n- item 2';
      expect(parseBullets(input)).toBe(expected);
    });

    it('handles trailing newlines', () => {
      expect(parseBullets('- item\n\n')).toBe('- item');
    });

    it('handles leading newlines', () => {
      expect(parseBullets('\n\n- item')).toBe('- item');
    });

    it('handles special characters in content', () => {
      expect(parseBullets('- item with @#$%^ symbols')).toBe('- item with @#$%^ symbols');
    });

    it('handles unicode characters', () => {
      expect(parseBullets('- café ☕ 🎯')).toBe('- café ☕ 🎯');
    });
  });
});
