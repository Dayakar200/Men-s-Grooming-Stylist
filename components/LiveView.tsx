import React, { useRef, useEffect, useCallback, useState, useImperativeHandle, forwardRef } from 'react';
import Icon from './Icon';

interface LiveViewProps {
  onCameraReady: (isReady: boolean) => void;
}

export interface LiveViewHandle {
  capture: () => string | null;
}

const WEBCAM_ICON_PATH = "M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z";

const LiveView = forwardRef<LiveViewHandle, LiveViewProps>(({ onCameraReady }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    if (stream) return; // Camera already running
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setError(null);
      onCameraReady(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Camera access denied. Please enable camera permissions in your browser settings to use this feature.");
      onCameraReady(false);
    }
  }, [stream, onCameraReady]);
  
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      onCameraReady(false);
    }
  }, [stream, onCameraReady]);

  // Start camera on component mount
  useEffect(() => {
    startCamera();
    // Cleanup effect to stop camera when component unmounts
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);
  
  // Expose the capture function to the parent component via ref
  useImperativeHandle(ref, () => ({
    capture: () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Flip the image horizontally to create a mirror image, which is more natural for selfies.
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          // Reset transform before returning data URL
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          return canvas.toDataURL('image/jpeg');
        }
      }
      return null;
    }
  }));

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg w-full aspect-square flex flex-col justify-center items-center relative text-gray-300">
        <h3 className="absolute top-4 text-lg font-semibold text-gray-300 z-10">Live Preview</h3>
        {stream ? (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
        ) : (
            <div className="flex flex-col items-center gap-4 text-center p-4">
                <Icon path={WEBCAM_ICON_PATH} className="w-16 h-16 text-gray-500"/>
                {error ? (
                     <p className="text-red-400">{error}</p>
                ) : (
                    <p>Starting camera...</p>
                )}
                <button onClick={startCamera} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Retry Camera
                </button>
            </div>
        )}
    </div>
  );
});

export default LiveView;
