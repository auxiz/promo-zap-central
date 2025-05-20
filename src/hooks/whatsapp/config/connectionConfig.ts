
/**
 * Configuration parameters for WhatsApp connection management
 */
export const CONNECTION_CONFIG = {
  maxStatusAttempts: 30,      // Maximum number of times to check status before giving up
  maxQrAttempts: 10,          // Maximum number of QR code fetch attempts
  basePollingInterval: 5000,  // Base polling interval when everything is normal (5 seconds)
  maxPollingInterval: 300000, // Maximum polling interval when backend is down (5 minutes)
  reconnectLimit: 5,          // Number of automatic reconnection attempts
};
