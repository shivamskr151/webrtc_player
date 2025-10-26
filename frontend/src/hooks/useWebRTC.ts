import { useState, useCallback, useRef, useEffect } from 'react';
import type { OvenPlayerInstance, PlayerState, LogEntry, StreamConfig } from '../types/webrtc';

export const useWebRTC = (config: StreamConfig) => {
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const playerRef = useRef<OvenPlayerInstance | null>(null);
  const keepaliveIntervalRef = useRef<number | null>(null);
  const healthCheckIntervalRef = useRef<number | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Memoized log function
  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-49), { timestamp, message, type }]);
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (keepaliveIntervalRef.current) {
      clearInterval(keepaliveIntervalRef.current);
      keepaliveIntervalRef.current = null;
    }
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
      healthCheckIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Start keepalive mechanism
  const startKeepalive = useCallback(() => {
    cleanup();
    
    addLog('🔄 Starting keepalive mechanism...', 'info');
    
    // Ping the WebRTC endpoint every interval
    keepaliveIntervalRef.current = window.setInterval(() => {
      fetch(config.KeepaliveUrl, { method: 'HEAD' })
        .catch(() => {
          // Silent fail
        });
    }, config.keepaliveInterval);
    
    // Health check
    healthCheckIntervalRef.current = window.setInterval(() => {
      if (playerRef.current && playerRef.current.getState) {
        const state = playerRef.current.getState();
        if (state !== 'playing' && state !== 'loading') {
          addLog(`⚠️ Connection health check failed, state: ${state}`, 'warning');
        }
      }
    }, config.healthCheckInterval);
  }, [config.keepaliveInterval, config.healthCheckInterval, cleanup, addLog]);

  // Stop keepalive
  const stopKeepalive = useCallback(() => {
    cleanup();
    addLog('🛑 Keepalive stopped', 'info');
  }, [cleanup, addLog]);

  // Play WebRTC stream
  const playWebRTC = useCallback(() => {
    addLog('🚀 Starting optimized WebRTC stream...', 'info');
    setPlayerState('loading');
    
    try {
      if (playerRef.current) {
        playerRef.current.remove();
        playerRef.current = null;
      }

      if (!window.OvenPlayer) {
        addLog('❌ OvenPlayer not loaded', 'error');
        return;
      }

      const player = window.OvenPlayer.create('player', {
        sources: [
          {
            label: 'WebRTC (Video Only)',
            type: 'webrtc',
            file: config.webrtcUrl,
          },
        ],
        autoStart: true,
        controls: true,
        mute: true,
        volume: 0,
        webrtcConfig: {
          iceServers: config.iceServers,
          iceTransportPolicy: 'all',
          iceCandidatePoolSize: 10,
        },
        timeouts: {
          loading: 10000,
          buffering: 5000,
        },
      });

      playerRef.current = player;

      // Handle player events
      player.on('ready', () => {
        addLog('✅ Player ready', 'success');
      });

      player.on('stateChanged', (state: any) => {
        const newState = state.newstate as PlayerState;
        addLog(`🔄 Player state: ${newState}`, 'info');
        setPlayerState(newState);
        
        if (newState === 'playing') {
          addLog('✅ WebRTC stream is playing successfully (video only)', 'success');
          setReconnectAttempts(0);
          //startKeepalive();
        } else if (newState === 'error') {
          //stopKeepalive();
          addLog('⚠️ Player error state detected', 'warning');
        } else if (newState === 'idle') {
          //stopKeepalive();
        }
      });

      player.on('error', (error: any) => {
        const errorMsg = error.message || error.code || JSON.stringify(error);
        addLog(`❌ Player error: ${errorMsg}`, 'error');
        
        // Only reconnect on specific errors
        if (
          error.code === 511 || 
          errorMsg.includes('terminated') || 
          errorMsg.includes('failed')
        ) {
          if (reconnectAttempts < config.maxReconnectAttempts) {
            setReconnectAttempts(prev => prev + 1);
            addLog(`🔄 Auto-reconnecting... (Attempt ${reconnectAttempts + 1}/${config.maxReconnectAttempts})`, 'warning');
            
            reconnectTimeoutRef.current = window.setTimeout(() => {
              playWebRTC();
            }, config.reconnectDelay);
          } else {
            addLog('❌ Max reconnection attempts reached', 'error');
            setReconnectAttempts(0);
          }
        }
      });

      addLog('📡 WebRTC connection initiated with TURN servers', 'info');
      addLog('🔄 Using UDP/TCP fallback for optimal connectivity', 'info');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Failed to start WebRTC: ${errorMsg}`, 'error');
    }
  }, [config, reconnectAttempts, startKeepalive, stopKeepalive, addLog]);

  // Stop stream
  const stopStream = useCallback(() => {
    stopKeepalive();
    if (playerRef.current) {
      addLog('⏹️ Stopping stream...', 'info');
      playerRef.current.remove();
      playerRef.current = null;
      setReconnectAttempts(0);
      setPlayerState('idle');
      addLog('✅ Stream stopped', 'success');
    }
  }, [stopKeepalive, addLog]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    addLog('🔄 Manual reconnect requested...', 'info');
    setReconnectAttempts(0);
    stopStream();
    setTimeout(() => {
      playWebRTC();
    }, 1000);
  }, [stopStream, playWebRTC, addLog]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      if (playerRef.current) {
        playerRef.current.remove();
      }
    };
  }, [cleanup]);

  return {
    playerState,
    logs,
    reconnectAttempts,
    playWebRTC,
    stopStream,
    reconnect,
    addLog,
  };
};

