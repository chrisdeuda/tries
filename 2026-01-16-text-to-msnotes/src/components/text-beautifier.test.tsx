import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TextBeautifier } from './text-beautifier';

describe('TextBeautifier - Responsive Layout', () => {
  it('should have responsive grid classes for 2-column layout', () => {
    const { container } = render(<TextBeautifier />);

    // Find the grid container
    const gridContainer = container.querySelector('.grid');

    expect(gridContainer).toBeTruthy();
    expect(gridContainer?.className).toContain('grid');
    expect(gridContainer?.className).toContain('md:grid-cols-2');
  });

  it('should render two column panels (input and output)', () => {
    const { container } = render(<TextBeautifier />);

    // Find flex columns
    const columns = container.querySelectorAll('.flex.flex-col');

    expect(columns.length).toBeGreaterThanOrEqual(2);
  });

  it('should have input textarea in first column', () => {
    const { container } = render(<TextBeautifier />);

    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();
    expect(textarea?.placeholder).toContain('Daily Standup');
  });

  it('should have output pre element in second column', () => {
    const { container } = render(<TextBeautifier />);

    const preElement = container.querySelector('pre');
    expect(preElement).toBeTruthy();
    expect(preElement?.className).toContain('flex-1');
  });

  it('should have matching min-height for both input and output', () => {
    const { container } = render(<TextBeautifier />);

    const textarea = container.querySelector('textarea');
    const preElement = container.querySelector('pre');

    expect(textarea?.className).toContain('min-h-[300px]');
    expect(preElement?.className).toContain('min-h-[300px]');
  });

  it('should have gap between columns', () => {
    const { container } = render(<TextBeautifier />);

    const gridContainer = container.querySelector('.grid');
    expect(gridContainer?.className).toContain('gap-4');
  });
});
