import React, { useRef, useEffect, useCallback, useState, useImperativeHandle, forwardRef } from 'react';
import Icon from './Icon';

interface UserMediaViewProps {
  onReadyChange: (isReady: boolean) => void;
}

export interface UserMediaViewHandle {
  capture: () => string | null;
}

const UPLOAD_ICON_PATH = "M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z";
const WEBCAM_ICON_PATH = "M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z";
const CLOSE_ICON_PATH = "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z";

const UserMediaView = forwardRef<UserMediaViewHandle, UserMediaViewProps>(({ onReadyChange }, ref) => {
  const [mode, setMode] = useState<'prompt' | 'live' | 'uploaded'>('prompt');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    stopCamera(); // Ensure any previous stream is stopped
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setMode('live');
      setError(null);
      onReadyChange(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Camera access denied. Please enable camera permissions in your browser settings.");
      onReadyChange(false);
      setMode('prompt'); // Revert to prompt on error
    }
  }, [stopCamera, onReadyChange]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const result = e.target.result as string;
          setUploadedImage(result);
          setMode('uploaded');
          onReadyChange(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleClose = () => {
    stopCamera();
    setUploadedImage(null);
    setMode('prompt');
    setError(null);
    onReadyChange(false);
  };
  
  useEffect(() => {
    // Cleanup on unmount
    return () => stopCamera();
  }, [stopCamera]);

  useImperativeHandle(ref, () => ({
    capture: () => {
      if (mode === 'live' && videoRef.current && videoRef.current.readyState >= 2) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          return canvas.toDataURL('image/jpeg');
        }
      } else if (mode === 'uploaded' && uploadedImage) {
        return uploadedImage;
      }
      return null;
    }
  }), [mode, uploadedImage, stream]);

  const renderContent = () => {
    switch (mode) {
      case 'live':
        return (
          <>
            <h3 className="absolute top-4 text-lg font-semibold text-gray-300 z-10">Live Preview</h3>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
          </>
        );
      case 'uploaded':
        return (
          <>
            <h3 className="absolute top-4 text-lg font-semibold text-gray-300 z-10">Your Photo</h3>
            {uploadedImage && <img src={uploadedImage} alt="User upload" className="w-full h-full object-cover" />}
          </>
        );
      case 'prompt':
      default:
        return (
          <div className="flex flex-col items-center gap-6 text-center p-4">
            <h2 className="text-2xl font-bold text-white">Start Your Makeover</h2>
            {error && <p className="text-red-400 max-w-xs">{error}</p>}
            <p className="text-gray-400">Upload a clear, front-facing photo or use your webcam.</p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button
                onClick={startCamera}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all"
              >
                <Icon path={WEBCAM_ICON_PATH} className="w-5 h-5"/>
                Use Webcam
              </button>
              <button
                onClick={triggerFileUpload}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
              >
                <Icon path={UPLOAD_ICON_PATH} className="w-5 h-5"/>
                Upload Image
              </button>
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg w-full aspect-square flex flex-col justify-center items-center relative text-gray-300">
      {renderContent()}
      {mode !== 'prompt' && (
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-2 bg-black bg-opacity-60 text-white rounded-full hover:bg-red-600 transition-all z-20"
          aria-label="Close and choose another input"
        >
          <Icon path={CLOSE_ICON_PATH} className="w-5 h-5" />
        </button>
      )}
    </div>
  );
});

export default UserMediaView;
