
/**
 * Configuration parameters for WhatsApp connection management
 * Optimized for low resource usage
 */
export const CONNECTION_CONFIG = {
  maxStatusAttempts: 10,      // Reduced from 30 to 10
  maxQrAttempts: 5,           // Reduced from 10 to 5
  basePollingInterval: 30000, // Increased from 5s to 30s (6x less frequent)
  maxPollingInterval: 600000, // Increased to 10 minutes when backend is down
  reconnectLimit: 3,          // Reduced from 5 to 3
  maxErrorNotifications: 2,   // Reduced from 3 to 2
  errorNotificationCooldown: 600000, // Increased to 10 minutes between notifications
};
