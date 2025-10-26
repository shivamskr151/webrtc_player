import { useMemo, useEffect, useState, useCallback } from 'react';
import { useWebRTC } from './hooks/useWebRTC';
import StatusBadge from './components/StatusBadge';
import PlayerControls from './components/PlayerControls';
import LogViewer from './components/LogViewer';
import SnapshotGallery from './components/SnapshotGallery';
import type { StreamConfig } from './types/webrtc';

interface Snapshot {
  id: string;
  data: string;
  timestamp: Date;
  isServerSnapshot?: boolean;
}

function App() {
  // State for snapshots
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

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

  // Enhanced canvas capture with maximum quality
  const captureHighQualitySnapshot = useCallback(() => {
    try {
      // Find the video element in the player container
      const playerContainer = document.getElementById('player');
      if (!playerContainer) {
        addLog('❌ Player container not found for snapshot', 'error');
        return null;
      }

      // Look for video element within the player container
      const videoElement = playerContainer.querySelector('video') as HTMLVideoElement;
      if (!videoElement) {
        addLog('❌ Video element not found for snapshot', 'error');
        return null;
      }

      // Check if video is ready and has content
      if (videoElement.readyState < 2) {
        addLog('❌ Video not ready for snapshot capture', 'error');
        return null;
      }

      // Create canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        addLog('❌ Could not get canvas context for snapshot', 'error');
        return null;
      }

      // Use video's natural dimensions for maximum quality
      const videoWidth = videoElement.videoWidth || videoElement.clientWidth;
      const videoHeight = videoElement.videoHeight || videoElement.clientHeight;
      
      if (videoWidth === 0 || videoHeight === 0) {
        addLog('❌ Video dimensions not available for snapshot', 'error');
        return null;
      }

      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // Draw the current video frame to canvas at full quality
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Convert canvas to data URL at maximum quality
      const imageData = canvas.toDataURL('image/png', 1.0);
      
      addLog(`📸 High-quality snapshot captured (${canvas.width}x${canvas.height})`, 'success');
      return imageData;
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Error capturing snapshot: ${errorMsg}`, 'error');
      return null;
    }
  }, [addLog]);

  // OME Server-side snapshot API
  const takeServerSnapshot = useCallback(async () => {
    try {
      const omeApiUrl = import.meta.env.VITE_OME_API_URL || 'http://localhost:8080';
      const streamName = import.meta.env.VITE_STREAM_NAME || 'camera_0051';
      
      const response = await fetch(`${omeApiUrl}/v1/vhosts/default/apps/app/streams/${streamName}/snapshots`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          outputPath: `/tmp/snapshots/${streamName}_${Date.now()}.jpg`,
          format: 'jpeg',
          quality: 95
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        addLog('📸 Server snapshot captured (highest quality)', 'success');
        return data.snapshot_url || data.url;
      } else {
        const errorText = await response.text();
        addLog(`⚠️ Server snapshot failed: ${response.status} - ${errorText}`, 'warning');
        return null;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addLog(`⚠️ Server snapshot failed: ${errorMsg}`, 'warning');
      return null;
    }
  }, [addLog]);

  // Hybrid snapshot approach - try server first, fallback to client
  const handleSnapshot = useCallback(async () => {
    addLog('📸 Taking snapshot...', 'info');
    
    // Try server-side snapshot first (best quality)
    const serverSnapshot = await takeServerSnapshot();
    if (serverSnapshot) {
      // Create snapshot object with server URL
      const snapshot: Snapshot = {
        id: `snapshot_${Date.now()}`,
        data: serverSnapshot,
        timestamp: new Date(),
        isServerSnapshot: true
      };
      
      setSnapshots(prev => [...prev, snapshot]);
      return;
    }
    
    // Fallback to enhanced client capture
    addLog('🔄 Falling back to client-side capture...', 'info');
    const clientSnapshot = captureHighQualitySnapshot();
    if (clientSnapshot) {
      const snapshot: Snapshot = {
        id: `snapshot_${Date.now()}`,
        data: clientSnapshot,
        timestamp: new Date(),
        isServerSnapshot: false
      };
      
      setSnapshots(prev => [...prev, snapshot]);
    } else {
      addLog('❌ All snapshot methods failed', 'error');
    }
  }, [takeServerSnapshot, captureHighQualitySnapshot, addLog]);

  const handleClearSnapshots = useCallback(() => {
    setSnapshots([]);
    addLog('🗑️ All snapshots cleared', 'info');
  }, [addLog]);

  const handleDownloadSnapshot = useCallback((snapshot: Snapshot) => {
    try {
      const link = document.createElement('a');
      link.download = `snapshot_${snapshot.timestamp.toISOString().replace(/[:.]/g, '-')}.png`;
      link.href = snapshot.data;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addLog(`💾 Snapshot downloaded: ${link.download}`, 'success');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Error downloading snapshot: ${errorMsg}`, 'error');
    }
  }, [addLog]);

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
            onSnapshot={handleSnapshot}
            isPlaying={playerState === 'playing'}
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

        {/* Snapshots Gallery */}
        <div className="mb-6">
          <SnapshotGallery
            snapshots={snapshots}
            onClear={handleClearSnapshots}
            onDownload={handleDownloadSnapshot}
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
