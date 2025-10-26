import { memo } from 'react';
import type { PlayerState } from '../types/webrtc';

interface StatusBadgeProps {
  state: PlayerState;
}

const StatusBadge = memo<StatusBadgeProps>(({ state }) => {
  const getStatusColor = () => {
    switch (state) {
      case 'playing':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'loading':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getStatusIcon = () => {
    switch (state) {
      case 'playing':
        return '▶️';
      case 'loading':
        return '⏳';
      case 'error':
        return '❌';
      default:
        return '⏸️';
    }
  };

  return (
    <div className={`px-4 py-2 rounded-lg border-2 font-semibold ${getStatusColor()}`}>
      <span className="mr-2">{getStatusIcon()}</span>
      {state.charAt(0).toUpperCase() + state.slice(1)}
    </div>
  );
});

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;

