import { useState, useRef, useCallback } from 'react';

interface SnapshotCaptureProps {
  onSnapshot: (imageData: string) => void;
  disabled?: boolean;
}

const SnapshotCapture = ({ onSnapshot, disabled = false }: SnapshotCaptureProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const captureSnapshot = useCallback(() => {
    if (disabled || isCapturing) return;

    setIsCapturing(true);

    try {
      // Find the video element in the player container
      const playerContainer = document.getElementById('player');
      if (!playerContainer) {
        console.error('Player container not found');
        setIsCapturing(false);
        return;
      }

      // Look for video element within the player container
      const videoElement = playerContainer.querySelector('video') as HTMLVideoElement;
      if (!videoElement) {
        console.error('Video element not found in player');
        setIsCapturing(false);
        return;
      }

      // Check if video is ready and has content
      if (videoElement.readyState < 2) {
        console.error('Video not ready for capture');
        setIsCapturing(false);
        return;
      }

      // Create canvas element if it doesn't exist
      if (!canvasRef.current) {
        const canvas = document.createElement('canvas');
        canvasRef.current = canvas;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('Could not get canvas context');
        setIsCapturing(false);
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = videoElement.videoWidth || videoElement.clientWidth;
      canvas.height = videoElement.videoHeight || videoElement.clientHeight;

      // Draw the current video frame to canvas
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Convert canvas to data URL
      const imageData = canvas.toDataURL('image/png', 0.9);
      
      // Call the callback with the image data
      onSnapshot(imageData);
      
    } catch (error) {
      console.error('Error capturing snapshot:', error);
    } finally {
      setIsCapturing(false);
    }
  }, [disabled, isCapturing, onSnapshot]);

  return (
    <button
      onClick={captureSnapshot}
      disabled={disabled || isCapturing}
      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2"
    >
      {isCapturing ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          Capturing...
        </>
      ) : (
        <>
          📸 Take Snapshot
        </>
      )}
    </button>
  );
};

export default SnapshotCapture;
