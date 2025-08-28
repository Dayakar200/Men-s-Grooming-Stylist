
import React, { useRef, useEffect, useCallback, useState } from 'react';
import Icon from './Icon';

interface CameraViewProps {
  onCapture: (imageDataUrl: string) => void;
}

const CAMERA_ICON_PATH = "M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 .9-2 2-2V6c0-1.1-.9-2-2-2zm-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z";
const UPLOAD_ICON_PATH = "M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z";
const WEBCAM_ICON_PATH = "M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z";
const STOP_ICON_PATH = "M6 6h12v12H6z";

const CameraView: React.FC<CameraViewProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Camera access denied. Please enable permissions in your browser settings.");
    }
  }, []);
  
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Flip the image horizontally for a natural mirror effect
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        onCapture(canvas.toDataURL('image/jpeg'));
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onCapture(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg w-full aspect-square flex flex-col justify-center items-center relative text-gray-300">
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-80 p-4 z-20">
          <p className="text-red-400 text-center mb-4">{error}</p>
          <button onClick={() => { setError(null); startCamera(); }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Retry Camera</button>
        </div>
      )}

      {stream ? (
        <>
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
          <div className="absolute bottom-4 left-4 right-4 flex justify-center items-center gap-4 z-10">
            <button
              onClick={stopCamera}
              className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              title="Stop Camera"
            >
              <Icon path={STOP_ICON_PATH} />
            </button>
            <button
              onClick={handleCapture}
              className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-500 transition-transform transform hover:scale-110"
              title="Take Photo"
            >
              <Icon path={CAMERA_ICON_PATH} />
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-6 text-center p-4">
            <h2 className="text-2xl font-bold text-white">Choose Your Photo</h2>
            <p className="text-gray-400">Upload an image or use your webcam to start.</p>
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
      )}
    </div>
  );
};

export default CameraView;
