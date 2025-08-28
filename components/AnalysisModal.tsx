import React from 'react';
import { FaceShapeAnalysisResult, Hairstyle, BeardStyle } from '../types';
import Icon from './Icon';

interface AnalysisModalProps {
  result: FaceShapeAnalysisResult;
  onClose: () => void;
  onApply: (hairstyle: Hairstyle, beardStyle: BeardStyle) => void;
}

const CLOSE_ICON_PATH = "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z";

const AnalysisModal: React.FC<AnalysisModalProps> = ({ result, onClose, onApply }) => {
  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300 scale-95 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-white">AI Stylist Analysis</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close analysis modal">
            <Icon path={CLOSE_ICON_PATH} className="w-6 h-6" />
          </button>
        </header>
        
        <main className="p-6 overflow-y-auto space-y-6">
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-blue-300">Your Face Shape: <span className="text-white font-bold">{result.faceShape}</span></h3>
            <p className="text-sm text-gray-400 mt-1 italic">"{result.reasoning}"</p>
            <p className="text-sm text-gray-300 mt-3">
              <strong>Stylist's Observation:</strong> {result.description}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Style Recommendations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.recommendations.map((rec, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg flex flex-col justify-between hover:bg-gray-600/50 transition-colors">
                  <div>
                      <h4 className="font-semibold text-blue-300">{rec.hairstyle}</h4>
                      <h5 className="text-sm text-gray-400 mb-2">{rec.beardStyle}</h5>
                      <p className="text-xs text-gray-300">{rec.reason}</p>
                  </div>
                  <button 
                    onClick={() => onApply(rec.hairstyle, rec.beardStyle)}
                    className="mt-4 w-full bg-blue-600 text-white text-sm font-semibold py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors"
                  >
                    Try This Style
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AnalysisModal;
