import React, { useState, useCallback } from 'react';
import type { AnalysisResult } from './types';
import { analyzeText, analyzeUrl } from './services/geminiService';
import Header from './components/Header';
import InputForm from './components/InputForm';
import AnalysisDisplay from './components/AnalysisDisplay';
import Loader from './components/Loader';

export type InputMode = 'text' | 'url';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      let result: AnalysisResult;
      if (inputMode === 'text') {
        if (!inputText.trim()) {
          setError('Please enter some text to analyze.');
          setIsLoading(false);
          return;
        }
        result = await analyzeText(inputText);
      } else { // 'url' mode
        if (!url.trim()) {
          setError('Please enter a URL to analyze.');
          setIsLoading(false);
          return;
        }
        result = await analyzeUrl(url);
      }
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, url, inputMode]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Header />
        <main>
          <InputForm
            inputText={inputText}
            setInputText={setInputText}
            url={url}
            setUrl={setUrl}
            inputMode={inputMode}
            setInputMode={setInputMode}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
          {isLoading && <Loader message={inputMode === 'url' ? 'Fetching & Analyzing Article...' : 'Analyzing Text...'}/>}
          {error && (
            <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {analysisResult && (
            <div className="mt-8 animate-fade-in">
              <AnalysisDisplay result={analysisResult} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
