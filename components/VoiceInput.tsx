import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
}

// Minimal type definition for the SpeechRecognition API to avoid using `any`
// and provide type safety for the parts of the API we use.
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: any) => void;
  onend: () => void;
  onerror: (event: any) => void;
}

const MIC_ICON_PATH = "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 12v1a7 7 0 0 1-14 0v-1h2v1a5 5 0 0 0 10 0v-1h2z";
// Renamed to avoid shadowing the `SpeechRecognition` interface. Cast to `any` to access non-standard window property.
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, isListening, setIsListening }) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      console.warn("Speech Recognition API is not supported in this browser.");
      return;
    }

    const recognition: SpeechRecognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onTranscript(finalTranscript.trim());
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [onTranscript, setIsListening]);
  
  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };

  if (!SpeechRecognitionAPI) {
    return null; // Don't render if not supported
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`absolute right-3 bottom-3 p-2 rounded-full transition-colors duration-300 ${
        isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-600 hover:bg-blue-600 text-gray-300'
      }`}
      aria-label="Toggle voice input"
    >
      <Icon path={MIC_ICON_PATH} className="w-5 h-5" />
    </button>
  );
};

export default VoiceInput;
