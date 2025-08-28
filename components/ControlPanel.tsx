import React, { useState, useRef } from 'react';
import { Hairstyle, BeardStyle, StyleOptions } from '../types';
import { HAIRSTYLE_OPTIONS, BEARD_STYLE_OPTIONS, STYLE_PRESETS } from '../constants';
import VoiceInput from './VoiceInput';
import Icon from './Icon';

interface ControlPanelProps {
  options: StyleOptions;
  setOptions: React.Dispatch<React.SetStateAction<StyleOptions>>;
  onGenerate: () => void;
  isLoading: boolean;
  isInputReady: boolean;
}

const UPLOAD_ICON_PATH = "M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z";
const TRASH_ICON_PATH = "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z";


const ControlPanel: React.FC<ControlPanelProps> = ({ options, setOptions, onGenerate, isLoading, isInputReady }) => {
  const [isListening, setIsListening] = useState(false);
  const referenceFileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOptions(prev => ({ ...prev, [name]: value }));
  };
  
  const handleVoiceTranscript = (transcript: string) => {
    setOptions(prev => ({ ...prev, textPrompt: prev.textPrompt ? `${prev.textPrompt} ${transcript}` : transcript }));
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetName = e.target.value;
    const selectedPreset = STYLE_PRESETS.find(p => p.name === presetName);
    if (selectedPreset) {
      setOptions(selectedPreset.options);
    }
  };

  const handleReferenceImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setOptions(prev => ({ ...prev, referenceImage: e.target.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerReferenceImageUpload = () => {
    referenceFileInputRef.current?.click();
  };

  const clearReferenceImage = () => {
    setOptions(prev => ({ ...prev, referenceImage: null }));
    if (referenceFileInputRef.current) {
        referenceFileInputRef.current.value = "";
    }
  };


  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col gap-4 w-full h-full justify-between">
      <div className="flex-grow overflow-y-auto pr-2 space-y-4">
        <div>
          <label htmlFor="stylePreset" className="block text-sm font-medium text-gray-300 mb-2">Style Presets (Filters)</label>
          <select
            id="stylePreset"
            name="stylePreset"
            onChange={handlePresetChange}
            value={STYLE_PRESETS.find(p => JSON.stringify(p.options) === JSON.stringify(options))?.name || 'Select a Preset...'}
            className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          >
            {STYLE_PRESETS.map(preset => <option key={preset.name} value={preset.name}>{preset.name}</option>)}
          </select>
        </div>

        <hr className="border-gray-700" />
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Reference Image (Optional)</label>
          {options.referenceImage ? (
            <div className="relative group">
              <img src={options.referenceImage} alt="Reference" className="w-full h-auto max-h-32 object-contain rounded-md bg-gray-900" />
              <button 
                onClick={clearReferenceImage} 
                className="absolute top-2 right-2 p-1.5 bg-black bg-opacity-50 text-white rounded-full hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Remove reference image"
              >
                <Icon path={TRASH_ICON_PATH} className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div
              onClick={triggerReferenceImageUpload}
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition-colors"
              role="button"
              aria-label="Upload reference image"
            >
              <div className="space-y-1 text-center">
                <Icon path={UPLOAD_ICON_PATH} className="mx-auto h-8 w-8 text-gray-400" />
                <p className="text-sm text-blue-400 font-semibold">Click to upload</p>
                <p className="text-xs text-gray-500">Inspiration photo</p>
              </div>
            </div>
          )}
          <input type="file" accept="image/*" ref={referenceFileInputRef} onChange={handleReferenceImageUpload} className="hidden" />
        </div>

        <hr className="border-gray-700" />

        <div>
          <label htmlFor="hairstyle" className="block text-sm font-medium text-gray-300 mb-2">Hairstyle</label>
          <select
            id="hairstyle"
            name="hairstyle"
            value={options.hairstyle}
            onChange={handleInputChange}
            className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          >
            {HAIRSTYLE_OPTIONS.map(style => <option key={style} value={style}>{style}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="beardStyle" className="block text-sm font-medium text-gray-300 mb-2">Beard Style</label>
          <select
            id="beardStyle"
            name="beardStyle"
            value={options.beardStyle}
            onChange={handleInputChange}
            className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          >
            {BEARD_STYLE_OPTIONS.map(style => <option key={style} value={style}>{style}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="colorPrompt" className="block text-sm font-medium text-gray-300 mb-2">Hair Color</label>
          <input
            type="text"
            id="colorPrompt"
            name="colorPrompt"
            value={options.colorPrompt}
            onChange={handleInputChange}
            placeholder="e.g., ash blonde, silver, deep red"
            className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="relative">
          <label htmlFor="textPrompt" className="block text-sm font-medium text-gray-300 mb-2">Instructions</label>
          <textarea
            id="textPrompt"
            name="textPrompt"
            rows={2}
            value={options.textPrompt}
            onChange={handleInputChange}
            placeholder="e.g., shorter on the sides..."
            className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-blue-500 focus:border-blue-500 pr-12"
          />
          <VoiceInput onTranscript={handleVoiceTranscript} isListening={isListening} setIsListening={setIsListening} />
        </div>
      </div>
      
      <div className="flex-shrink-0 pt-4">
        <button
          onClick={onGenerate}
          disabled={isLoading || !isInputReady}
          className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : 'Apply Style'}
        </button>
        {!isInputReady && <p className="text-center text-xs text-yellow-400 mt-2">Please select a photo or enable your camera.</p>}
      </div>
    </div>
  );
};

export default ControlPanel;