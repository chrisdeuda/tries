import { useState } from 'react';
import { parseBullets } from '../utils/parse-bullets';
import { bulletsToHtml } from '../utils/bullets-to-html';
import { formatOutput, numberedToHtml, type HeaderType, type ListStyle } from '../utils/format-output';

export function TextBeautifier() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState<'text' | 'html' | null>(null);
  const [headerType, setHeaderType] = useState<HeaderType>('targets');
  const [listStyle, setListStyle] = useState<ListStyle>('numbered');

  // Parse bullets first, then format with header and style
  const parsed = parseBullets(input);
  const output = formatOutput(parsed, headerType, listStyle);

  // Copy as plain text
  const handleCopyText = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied('text');
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Copy as HTML (renders as formatted list in MS Teams, Word, etc.)
  const handleCopyHtml = async () => {
    if (!output) return;

    try {
      const html = listStyle === 'numbered'
        ? numberedToHtml(output)
        : bulletsToHtml(parsed);
      const blob = new Blob([html], { type: 'text/html' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blob,
          'text/plain': new Blob([output], { type: 'text/plain' }),
        }),
      ]);
      setCopied('html');
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy HTML:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Text Beautifier
        </h1>

        {/* Options */}
        <div className="flex flex-wrap gap-6 mb-4 p-3 bg-white rounded-lg border border-gray-200">
          {/* Header Type */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">Header:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="headerType"
                checked={headerType === 'targets'}
                onChange={() => setHeaderType('targets')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">📝 Targets</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="headerType"
                checked={headerType === 'accomplishments'}
                onChange={() => setHeaderType('accomplishments')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">✅ Accomplishments</span>
            </label>
          </div>

          {/* List Style */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">Style:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="listStyle"
                checked={listStyle === 'numbered'}
                onChange={() => setListStyle('numbered')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">1. Numbered</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="listStyle"
                checked={listStyle === 'bullets'}
                onChange={() => setListStyle('bullets')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">- Bullets</span>
            </label>
          </div>
        </div>

        {/* Two-panel layout */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Input Panel */}
          <div className="flex flex-col md:border-r md:border-gray-200 md:pr-4">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Input (paste your messy text)
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Daily Standup\n- Townhall\n  - nested item`}
              className="flex-1 min-h-[300px] p-4 border border-gray-300 rounded-lg
                         font-mono text-sm resize-none focus:ring-2
                         focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Output Panel */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                Output (formatted)
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyHtml}
                  disabled={!output}
                  className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded
                             hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500
                             disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {copied === 'html' ? 'Copied!' : 'Copy HTML'}
                </button>
                <button
                  onClick={handleCopyText}
                  disabled={!output}
                  className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 bg-white rounded
                             hover:bg-gray-50 hover:border-gray-400 disabled:bg-gray-100
                             disabled:text-gray-400 disabled:border-gray-200
                             disabled:cursor-not-allowed transition-colors"
                >
                  {copied === 'text' ? 'Copied!' : 'Copy Text'}
                </button>
              </div>
            </div>
            <pre
              className="flex-1 min-h-[300px] p-4 bg-white border border-gray-300
                         rounded-lg font-mono text-sm overflow-auto whitespace-pre-wrap"
            >
              {output || <span className="text-gray-400">Output will appear here...</span>}
            </pre>
          </div>
        </div>

        {/* Help text */}
        <p className="mt-4 text-sm text-gray-500">
          Paste text with dashes or bullets. <strong>Copy HTML</strong> = rich formatting for MS Teams.
        </p>
      </div>
    </div>
  );
}
