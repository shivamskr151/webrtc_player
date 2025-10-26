/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SIGNALING_URL?: string
  readonly VITE_STUN_HOST?: string
  readonly VITE_STUN_PORT?: string
  readonly VITE_TURN1_HOST?: string
  readonly VITE_TURN1_PORT?: string
  readonly VITE_TURN1_USERNAME?: string
  readonly VITE_TURN1_PASSWORD?: string
  readonly VITE_TURN2_HOST?: string
  readonly VITE_TURN2_PORT?: string
  readonly VITE_TURN2_USERNAME?: string
  readonly VITE_TURN2_PASSWORD?: string
  readonly VITE_KEEPALIVE_INTERVAL?: string
  readonly VITE_HEALTH_CHECK_INTERVAL?: string
  readonly VITE_MAX_RECONNECT_ATTEMPTS?: string
  readonly VITE_RECONNECT_DELAY?: string
  readonly VITE_TIMEOUT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
