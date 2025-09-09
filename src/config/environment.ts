// Environment configuration for Anon Dealer
export const environment = {
  // Default signaling server configuration
  DEFAULT_SIGNALING_SERVER_URL: import.meta.env.VITE_DEFAULT_SIGNALING_SERVER_URL || 'http://localhost:8080',
  DEFAULT_SIGNALING_SERVER_WS_URL: import.meta.env.VITE_DEFAULT_SIGNALING_SERVER_WS_URL || 'ws://localhost:8080',
  
  // P2P configuration
  P2P_ENABLED: import.meta.env.VITE_P2P_ENABLED === 'true' || true,
  P2P_DEFAULT_ROOM: import.meta.env.VITE_P2P_DEFAULT_ROOM || 'anon-dealer-network',
  
  // App configuration
  APP_TITLE: import.meta.env.VITE_APP_TITLE || 'Anon Dealer',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Development flags
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD
}

export default environment
