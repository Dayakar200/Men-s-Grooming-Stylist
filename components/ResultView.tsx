import React, { useState } from 'react';
import Icon from './Icon';

interface ResultViewProps {
  generatedImage: string | null;
  isLoading: boolean;
  error: string | null;
  onClear: () => void;
}

const TRASH_ICON_PATH = "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z";
const PREVIEW_ICON_PATH = "M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z";
const DOWNLOAD_ICON_PATH = "M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z";
const CLOSE_ICON_PATH = "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z";


const Placeholder: React.FC = () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
        <svg className="w-16 h-16 text-gray-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 013.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 013.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 01-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.455-2.456L12.5 18l1.178-.398a3.375 3.375 0 002.455-2.456L16.5 14.25l.398 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.398a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-200">Your New Look</h3>
        <p className="text-gray-400 text-sm">Results will appear here after you apply a style.</p>
    </div>
);

const SkeletonLoader: React.FC = () => (
    <div className="w-full h-full bg-gray-700 animate-pulse"></div>
);


const ResultView: React.FC<ResultViewProps> = ({ generatedImage, isLoading, error, onClear }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'ai-style-makeover.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = () => {
    if (!generatedImage) return;
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg w-full flex flex-col overflow-hidden">
      {/* Image/Content Area */}
      <div className="w-full aspect-square flex flex-col items-center justify-center relative overflow-hidden group">
        <h3 className="absolute top-4 text-lg font-semibold text-gray-300 z-10 pointer-events-none">New Style</h3>
        <div className="w-full h-full">
          {isLoading ? (
            <SkeletonLoader />
          ) : error ? (
             <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-red-400 bg-gray-700">
               <p className="font-semibold">Generation Failed</p>
               <p className="text-sm mt-2 max-w-sm">{error}</p>
               <button onClick={onClear} className="mt-4 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 text-sm">
                  Dismiss
               </button>
             </div>
          ) : generatedImage ? (
             <img src={generatedImage} alt="Generated Style" className="w-full h-full object-cover" />
          ) : (
            <Placeholder />
          )}
        </div>
        {generatedImage && !isLoading && !error && (
           <button
              onClick={onClear}
              className="absolute top-3 right-3 p-1.5 bg-black bg-opacity-50 text-white rounded-full hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 z-20"
              aria-label="Clear generated style"
           >
              <Icon path={TRASH_ICON_PATH} className="w-5 h-5"/>
           </button>
        )}
      </div>

      {/* Action Buttons Area */}
      {generatedImage && !isLoading && !error && (
        <div className="p-3 bg-gray-700/50 border-t border-gray-700 flex justify-center items-center gap-4">
          <button
            onClick={handlePreview}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all text-sm w-1/2"
            aria-label="Preview generated image in a new tab"
          >
            <Icon path={PREVIEW_ICON_PATH} className="w-4 h-4" />
            <span>Preview</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all text-sm w-1/2"
            aria-label="Download generated image"
          >
            <Icon path={DOWNLOAD_ICON_PATH} className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && generatedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={handleClosePreview}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={handleClosePreview}
            className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors z-10"
            aria-label="Close preview"
          >
            <Icon path={CLOSE_ICON_PATH} className="w-6 h-6" />
          </button>
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src={generatedImage} 
              alt="Generated Style Preview" 
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultView;