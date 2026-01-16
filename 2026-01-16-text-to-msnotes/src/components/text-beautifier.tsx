import { useState } from 'react';
import { parseBullets } from '../utils/parse-bullets';

export function TextBeautifier() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const output = parseBullets(input);

  const handleCopy = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Text Beautifier
        </h1>

        {/* Two-panel layout */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Input Panel */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Input (paste your messy text)
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`-Daily Standup\n- Townhall\n  - nested item`}
              className="flex-1 min-h-[300px] p-4 border border-gray-300 rounded-lg
                         font-mono text-sm resize-none focus:ring-2
                         focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Output Panel */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                Output (clean markdown)
              </label>
              <button
                onClick={handleCopy}
                disabled={!output}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded
                           hover:bg-blue-700 disabled:bg-gray-400
                           disabled:cursor-not-allowed transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
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
          Paste text with dashes or bullets. Indented lines become nested bullets.
        </p>
      </div>
    </div>
  );
}
