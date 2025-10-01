/**
 * Production Configuration for HausPet App
 * Use this when deploying to App Store / Google Play Store
 */

export const PRODUCTION_CONFIG = {
  // Cloud AI Server (replace with your deployed URL)
  AI_SERVER_URL: 'https://hauspet-ai-production.up.railway.app',
  
  // Cloud Database API (replace with your deployed URL)
  API_BASE_URL: 'https://hauspet-api-production.up.railway.app',
  
  // Feature Flags
  FEATURES: {
    AI_CHAT: true,
    REAL_TIME_HEALTH: true,
    SMART_COLLAR: true,
    PUSH_NOTIFICATIONS: true,
    ANALYTICS: true
  },
  
  // App Store Configuration
  APP_STORE: {
    VERSION: '1.0.0',
    BUILD_NUMBER: '1',
    BUNDLE_ID: 'com.hauspet.smartcollar',
    APP_NAME: 'HausPet - Smart Pet Collar'
  },
  
  // Analytics & Monitoring
  ANALYTICS: {
    ENABLED: true,
    SENTRY_DSN: 'your_sentry_dsn_here',
    AMPLITUDE_KEY: 'your_amplitude_key_here'
  }
};

export default PRODUCTION_CONFIG;