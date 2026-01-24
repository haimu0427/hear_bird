import React, { useState } from 'react';
import { HomeView } from './components/HomeView';
import { ResultsScreen } from './components/ResultsScreen';
import { analyzeAudio } from './services/birdService';
import { ApiResponse } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'results'>('home');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ApiResponse | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    try {
      const data = await analyzeAudio(file);
      setResults(data);
      setView('results');
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Something went wrong analyzing the audio. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    setResults(null);
    setView('home');
  };

  return (
    <div className="w-full min-h-[100dvh]">
      {view === 'home' && (
        <HomeView onFileSelect={handleFileSelect} isProcessing={isProcessing} />
      )}
      
      {view === 'results' && results && (
        <ResultsScreen data={results} onBack={handleBack} />
      )}
    </div>
  );
};

export default App;
