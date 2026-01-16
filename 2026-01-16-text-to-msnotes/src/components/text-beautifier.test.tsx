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

  it('should have flex-1 on both textarea and pre for equal height growth', () => {
    const { container } = render(<TextBeautifier />);

    const textarea = container.querySelector('textarea');
    const preElement = container.querySelector('pre');

    expect(textarea?.className).toContain('flex-1');
    expect(preElement?.className).toContain('flex-1');
  });

  it('should have gap between columns', () => {
    const { container } = render(<TextBeautifier />);

    const gridContainer = container.querySelector('.grid');
    expect(gridContainer?.className).toContain('gap-4');
  });

  it('should have visual column separator on desktop (border-right on input panel)', () => {
    const { container } = render(<TextBeautifier />);

    // Find the input panel (first flex flex-col)
    const inputPanel = container.querySelector('.flex.flex-col');

    expect(inputPanel).toBeTruthy();
    expect(inputPanel?.className).toContain('md:border-r');
    expect(inputPanel?.className).toContain('md:border-gray-200');
    expect(inputPanel?.className).toContain('md:pr-4');
  });

  it('should have Copy HTML button as primary (blue background)', () => {
    const { getByRole } = render(<TextBeautifier />);

    const copyHtmlButton = getByRole('button', { name: 'Copy HTML' });

    expect(copyHtmlButton).toBeTruthy();
    expect(copyHtmlButton.className).toContain('bg-blue-600');
    expect(copyHtmlButton.className).toContain('text-white');
    expect(copyHtmlButton.className).toContain('font-medium');
    expect(copyHtmlButton.className).toContain('shadow-sm');
  });

  it('should have Copy Text button as secondary (outline style)', () => {
    const { getByRole } = render(<TextBeautifier />);

    const copyTextButton = getByRole('button', { name: 'Copy Text' });

    expect(copyTextButton).toBeTruthy();
    expect(copyTextButton.className).toContain('border');
    expect(copyTextButton.className).toContain('border-gray-300');
    expect(copyTextButton.className).toContain('text-gray-700');
    expect(copyTextButton.className).toContain('bg-white');
  });
});
