export interface OvenPlayerInstance {
  create(containerId: string, config: PlayerConfig): OvenPlayerInstance;
  remove(): void;
  getState(): PlayerState;
  on(event: PlayerEvent, callback: (data?: any) => void): void;
}

export interface PlayerConfig {
  sources: Source[];
  autoStart?: boolean;
  controls?: boolean;
  mute?: boolean;
  volume?: number;
  webrtcConfig?: WebRTCConfig;
  timeouts?: {
    loading?: number;
    buffering?: number;
  };
}

export interface Source {
  label: string;
  type: 'webrtc' | 'hls';
  file: string;
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  iceTransportPolicy?: RTCIceTransportPolicy;
  iceCandidatePoolSize?: number;
}

export type PlayerState = 'idle' | 'loading' | 'playing' | 'error' | 'paused';

export type PlayerEvent = 
  | 'ready' 
  | 'stateChanged' 
  | 'error' 
  | 'connectionStateChanged';

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface StreamConfig {
  webrtcUrl: string;
  iceServers: RTCIceServer[];
  keepaliveInterval: number;
  KeepaliveUrl: string;
  healthCheckInterval: number;
  maxReconnectAttempts: number;
  reconnectDelay: number;
  timeout: number;
}

declare global {
  interface Window {
    OvenPlayer: {
      create(containerId: string, config: PlayerConfig): OvenPlayerInstance;
    };
  }
}

