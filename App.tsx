import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import ResultView from './components/ResultView';
import UserMediaView, { UserMediaViewHandle } from './components/UserMediaView';
import AnalysisModal from './components/AnalysisModal';
import Icon from './components/Icon';
import { analyzeFaceShape } from './services/geminiService';
import { Hairstyle, BeardStyle, StyleOptions, FaceShapeAnalysisResult } from './types';
import { STYLE_PRESETS } from './constants';

const SPARKLES_ICON_PATH = "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 013.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 013.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 01-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.455-2.456L12.5 18l1.178-.398a3.375 3.375 0 002.455-2.456L16.5 14.25l.398 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.398a3.375 3.375 0 00-2.456 2.456z";

const App: React.FC = () => {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInputReady, setIsInputReady] = useState<boolean>(false);
  const [styleOptions, setStyleOptions] = useState<StyleOptions>({
    hairstyle: Hairstyle.None,
    beardStyle: BeardStyle.None,
    colorPrompt: '',
    textPrompt: '',
    referenceImage: null,
  });
  
  const userMediaViewRef = useRef<UserMediaViewHandle>(null);
  
  const [analysisResult, setAnalysisResult] = useState<FaceShapeAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);


  const handleApplyStyle = useCallback(async () => {
    if (!userMediaViewRef.current) {
      setError("Media component is not available.");
      return;
    }
    
    const userImage = userMediaViewRef.current.capture();
    if (!userImage) {
      setError("Could not get an image. Please use your webcam or upload a photo.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const { generateStyledImage } = await import('./services/geminiService');
      const result = await generateStyledImage(userImage, styleOptions);
      setGeneratedImage(result);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred during image generation.");
    } finally {
      setIsLoading(false);
    }
  }, [styleOptions]);

  const handleClearResult = useCallback(() => {
    setGeneratedImage(null);
    setError(null);
  }, []);
  
  const handleAnalyzeFaceShape = useCallback(async () => {
    if (!userMediaViewRef.current) return;
    
    const userImage = userMediaViewRef.current.capture();
    if (!userImage) {
        setAnalysisError("Could not get an image to analyze.");
        return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
        const result = await analyzeFaceShape(userImage);
        setAnalysisResult(result);
    } catch (err: any) {
        setAnalysisError(err.message || "An unknown error occurred during analysis.");
    } finally {
        setIsAnalyzing(false);
    }
  }, []);
  
  const handleApplyRecommendation = useCallback((hairstyle: Hairstyle, beardStyle: BeardStyle) => {
    const preset = STYLE_PRESETS.find(p => p.options.hairstyle === hairstyle && p.options.beardStyle === beardStyle)
    if (preset) {
        setStyleOptions(preset.options);
    } else {
        setStyleOptions(prev => ({
            ...prev,
            hairstyle,
            beardStyle,
            textPrompt: `A ${hairstyle} hairstyle with a ${beardStyle === BeardStyle.None ? 'clean shaven face' : beardStyle}.`,
            colorPrompt: '',
            referenceImage: null,
        }));
    }
    setAnalysisResult(null);
  }, []);

  const handleCloseModal = () => {
      setAnalysisResult(null);
      setAnalysisError(null);
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 font-sans">
      <Header />
      <main className="w-full max-w-7xl mx-auto mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-4">
           <UserMediaView ref={userMediaViewRef} onReadyChange={setIsInputReady} />
           {isInputReady && (
             <button
                onClick={handleAnalyzeFaceShape}
                disabled={isAnalyzing || isLoading}
                className="w-full py-3 px-4 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Icon path={SPARKLES_ICON_PATH} className="w-5 h-5"/>
                    <span>Analyze Face & Get Recommendations</span>
                  </>
                )}
             </button>
           )}
           {analysisError && !analysisResult && (
             <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-lg p-3 text-center">
               <p><strong>Analysis Failed:</strong> {analysisError}</p>
               <button onClick={() => setAnalysisError(null)} className="text-xs underline mt-1 opacity-80 hover:opacity-100">Dismiss</button>
             </div>
           )}
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="w-full">
                 <ResultView
                    generatedImage={generatedImage}
                    isLoading={isLoading}
                    error={error}
                    onClear={handleClearResult}
                />
            </div>
            <div className="w-full">
                <ControlPanel 
                    options={styleOptions}
                    setOptions={setStyleOptions}
                    onGenerate={handleApplyStyle}
                    isLoading={isLoading}
                    isInputReady={isInputReady}
                />
            </div>
        </div>
      </main>
      
      {analysisResult && (
          <AnalysisModal
              result={analysisResult}
              onClose={handleCloseModal}
              onApply={handleApplyRecommendation}
          />
      )}

      <footer className="text-center py-4 mt-8 text-gray-500 text-xs">
        <p>Powered by Google Gemini. Images are AI-generated and for conceptual purposes only.</p>
        <p>User identity is preserved by analyzing a snapshot and generating a new, styled image.</p>
      </footer>
    </div>
  );
};

export default App;