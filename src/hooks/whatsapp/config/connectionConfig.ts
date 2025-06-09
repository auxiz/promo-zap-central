
/**
 * Configuration parameters for WhatsApp connection management
 * Updated for proper QR scanning while maintaining resource efficiency
 */
export const CONNECTION_CONFIG = {
  maxStatusAttempts: 15,      // Increased from 10 to 15 for better connection success
  maxQrAttempts: 15,          // Increased from 5 to 15 to allow multiple QR generation attempts
  basePollingInterval: 10000, // Reduced to 10s for QR states to provide better UX
  maxPollingInterval: 300000, // 5 minutes when backend is down
  reconnectLimit: 3,          // Keep at 3 for resource protection
  maxErrorNotifications: 2,   // Keep at 2 to avoid spam
  errorNotificationCooldown: 600000, // Keep at 10 minutes between notifications
  // New QR-specific configurations
  qrPollingInterval: 15000,   // 15 seconds polling for QR code updates
  connectedPollingInterval: 120000, // 2 minutes when connected (very conservative)
};
