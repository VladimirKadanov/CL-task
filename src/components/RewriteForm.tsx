import { useState } from 'react';
import { RewriteStyle } from '@/types';

export const RewriteForm = () => {
  const [text, setText] = useState('');
  const [style, setStyle] = useState<RewriteStyle>('formal');
  const [result, setResult] = useState<{ original: string; transformed: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null); // Clear previous results

    try {
      const response = await fetch('/api/v1/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, style }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to transform text' }));
        throw new Error(errorData.error || 'Failed to transform text');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
            Text to Transform
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out"
            rows={5}
            placeholder="Enter your text here..."
            required
          />
        </div>

        <div>
          <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-1">
            Transformation Style
          </label>
          <select
            id="style"
            value={style}
            onChange={(e) => setStyle(e.target.value as RewriteStyle)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out"
          >
            <option value="formal">Formal</option>
            <option value="pirate">Pirate</option>
            <option value="haiku">Haiku</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
        >
          Transform Text
        </button>
      </form>

      {error && (
        <div className="rounded-md bg-red-50 p-4 ring-1 ring-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              {/* Heroicon name: solid/x-circle */}
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error transforming text</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-6 pt-6 border-t border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Original Text</h3>
            <div className="mt-1 rounded-md bg-gray-100 p-4 border border-gray-200 text-gray-700 text-sm">
              {result.original}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Transformed Text</h3>
            <div className="mt-1 rounded-md bg-indigo-50 p-4 border border-indigo-100 text-gray-800 text-sm whitespace-pre-wrap">
              {result.transformed}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 