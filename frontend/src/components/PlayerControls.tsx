import { memo } from 'react';

interface PlayerControlsProps {
  onPlay: () => void;
  onStop: () => void;
  onReconnect: () => void;
  disabled?: boolean;
}

const PlayerControls = memo<PlayerControlsProps>(({ 
  onPlay, 
  onStop, 
  onReconnect, 
  disabled = false 
}) => {
  return (
    <div className="flex gap-3">
      <button
        onClick={onPlay}
        disabled={disabled}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200"
      >
        ▶️ Play WebRTC Stream
      </button>
      <button
        onClick={onStop}
        disabled={disabled}
        className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200"
      >
        ⏹️ Stop Stream
      </button>
      <button
        onClick={onReconnect}
        disabled={disabled}
        className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200"
      >
        🔄 Reconnect
      </button>
    </div>
  );
});

PlayerControls.displayName = 'PlayerControls';

export default PlayerControls;

