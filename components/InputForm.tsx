import React from 'react';
import type { InputMode } from '../App';

interface InputFormProps {
  inputText: string;
  setInputText: (text: string) => void;
  url: string;
  setUrl: (url: string) => void;
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ inputText, setInputText, url, setUrl, inputMode, setInputMode, onAnalyze, isLoading }) => {
  
  const activeTabClasses = "border-blue-500 text-blue-600 dark:text-blue-400";
  const inactiveTabClasses = "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600";

  const isAnalyzeDisabled = isLoading || (inputMode === 'text' && !inputText.trim()) || (inputMode === 'url' && !url.trim());

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg transition-all overflow-hidden">
      <div className="px-6 border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setInputMode('text')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${inputMode === 'text' ? activeTabClasses : inactiveTabClasses}`}
            aria-current={inputMode === 'text' ? 'page' : undefined}
          >
            Analyze Text
          </button>
          <button
            onClick={() => setInputMode('url')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${inputMode === 'url' ? activeTabClasses : inactiveTabClasses}`}
            aria-current={inputMode === 'url' ? 'page' : undefined}
          >
            Summarize via URL
          </button>
        </nav>
      </div>
      
      <div className="p-6">
        {inputMode === 'text' ? (
          <div>
            <label htmlFor="text-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Paste your news article or policy text below:
            </label>
            <textarea
              id="text-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="The government has announced a new electric-vehicle subsidy plan..."
              rows={12}
              className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-base"
              disabled={isLoading}
            />
          </div>
        ) : (
          <div>
            <label htmlFor="url-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Paste the article URL here:
            </label>
            <input
              id="url-input"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/news/policy-announcement"
              className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-base"
              disabled={isLoading}
            />
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onAnalyze}
            disabled={isAnalyzeDisabled}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed dark:disabled:bg-slate-600 transition-colors"
          >
            {isLoading ? 'Analyzing...' : (inputMode === 'url' ? 'Analyze URL' : 'Analyze Text')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputForm;
