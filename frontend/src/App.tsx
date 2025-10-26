import { useMemo, useEffect } from 'react';
import { useWebRTC } from './hooks/useWebRTC';
import StatusBadge from './components/StatusBadge';
import PlayerControls from './components/PlayerControls';
import LogViewer from './components/LogViewer';
import type { StreamConfig } from './types/webrtc';

function App() {
  // Memoized stream configuration
  const streamConfig = useMemo<StreamConfig>(() => {
    const signalingUrl = import.meta.env.VITE_SIGNALING_URL || 'ws://localhost:3333/app/camera_0051';
    const keepaliveUrl = signalingUrl.replace('ws://', 'http://').replace('wss://', 'https://');
    
    return {
      webrtcUrl: signalingUrl,
      KeepaliveUrl: keepaliveUrl,
      iceServers: [
        {
          urls: `stun:${import.meta.env.VITE_STUN_HOST || 'stun.l.google.com'}:${import.meta.env.VITE_STUN_PORT || '19302'}`,
        },
        {
          urls: [
            `turn:${import.meta.env.VITE_TURN1_HOST || 'turn.variphi.com'}:${import.meta.env.VITE_TURN1_PORT || '3478'}?transport=udp`,
            `turn:${import.meta.env.VITE_TURN1_HOST || 'turn.variphi.com'}:${import.meta.env.VITE_TURN1_PORT || '3478'}?transport=tcp`,
          ],
          username: import.meta.env.VITE_TURN1_USERNAME || 'variphi',
          credential: import.meta.env.VITE_TURN1_PASSWORD || 'variphi2024',
        },
        {
          urls: [
            `turn:${import.meta.env.VITE_TURN2_HOST || 'turn.arresto.com'}:${import.meta.env.VITE_TURN2_PORT || '3478'}?transport=udp`,
            `turn:${import.meta.env.VITE_TURN2_HOST || 'turn.arresto.com'}:${import.meta.env.VITE_TURN2_PORT || '3478'}?transport=tcp`,
          ],
          username: import.meta.env.VITE_TURN2_USERNAME || 'arresto',
          credential: import.meta.env.VITE_TURN2_PASSWORD || 'arresto1234',
        },
      ],  
      keepaliveInterval: parseInt(import.meta.env.VITE_KEEPALIVE_INTERVAL || '10000'),
      healthCheckInterval: parseInt(import.meta.env.VITE_HEALTH_CHECK_INTERVAL || '5000'),
      maxReconnectAttempts: parseInt(import.meta.env.VITE_MAX_RECONNECT_ATTEMPTS || '5'),
      reconnectDelay: parseInt(import.meta.env.VITE_RECONNECT_DELAY || '3000'),
      timeout: parseInt(import.meta.env.VITE_TIMEOUT || '300000'),
    };
  }, []);

  const {
    playerState,
    logs,
    reconnectAttempts,
    playWebRTC,
    stopStream,
    reconnect,
    addLog,
  } = useWebRTC(streamConfig);

  // Initial log on mount
  useEffect(() => {
    addLog('🌐 Optimized WebRTC Player loaded', 'info');
    addLog('📋 WebRTC Configuration:', 'info');
    addLog(`   • URL: ${streamConfig.webrtcUrl}`, 'info');
    addLog('   • Mode: Video Only (no audio for stability)', 'info');
    addLog('   • TURN Servers: turn.variphi.com:3478, turn.arresto.com:3478', 'info');
    addLog('   • TCP Fallback: Enabled', 'info');
    addLog(`   • Timeout: ${streamConfig.timeout / 1000}s`, 'info');
    addLog(`   • Keepalive: Every ${streamConfig.keepaliveInterval / 1000}s`, 'info');
    addLog(`   • Health Check: Every ${streamConfig.healthCheckInterval / 1000}s`, 'info');
    addLog(`   • Auto-reconnect: ${streamConfig.maxReconnectAttempts} attempts`, 'info');
    addLog('', 'info');
    addLog('🔧 ICE Configuration:', 'info');
    addLog('   • STUN: stun.l.google.com:19302', 'info');
    addLog('   • TURN: turn.variphi.com:3478 (UDP/TCP)', 'info');
    addLog('   • TURN: turn.arresto.com:3478 (UDP/TCP)', 'info');
    addLog('   • Local UDP: 40000-40010, 9000', 'info');
    addLog('   • Local TCP: 3478', 'info');
    addLog('   • Transport: UDP + TCP fallback', 'info');
    addLog('', 'info');
    addLog('ℹ️ Click "Play WebRTC Stream" to start', 'info');
  }, [streamConfig, addLog]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            🎥 WebRTC Player
          </h1>
        </div>


        {/* Status and Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <StatusBadge state={playerState} />
            {reconnectAttempts > 0 && (
              <div className="text-yellow-400 text-sm">
                Reconnect attempt: {reconnectAttempts}/{streamConfig.maxReconnectAttempts}
              </div>
            )}
          </div>
          
          <PlayerControls
            onPlay={playWebRTC}
            onStop={stopStream}
            onReconnect={reconnect}
          />
        </div>

        {/* Video Player */}
        <div className="bg-black rounded-lg overflow-hidden mb-6 shadow-2xl">
          <div 
            id="player" 
            className="w-full aspect-video"
            style={{ minHeight: '480px' }}
          />
        </div>

        {/* Connection Log */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
          <h3 className="text-xl font-semibold mb-4 text-gray-200">
            📋 Connection Log
          </h3>
          <LogViewer logs={logs} />
        </div>

      </div>
    </div>
  );
}

export default App;
