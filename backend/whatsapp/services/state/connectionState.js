
/**
 * Connection State Manager for WhatsApp
 * Handles getting connection state information for WhatsApp instances
 */

const instanceModel = require('../../models/instance');

// Get QR code for a specific instance
const getQRCode = (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  return instance.qrCodeDataUrl;
};

// Get connection status for a specific instance
const getConnectionStatus = (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  return { 
    isConnected: instance.isConnected, 
    device: instance.device,
    // Include reconnection status
    reconnection: instance.sessionData?.isReconnecting ? {
      attempts: instance.sessionData.reconnectAttempts,
      max: instance.sessionData.maxReconnectAttempts,
      isActive: instance.sessionData.isReconnecting
    } : null
  };
};

// Get connection time for a specific instance
const getConnectionTime = (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  return instance.connectionTime;
};

// Get disconnection time for a specific instance
const getDisconnectionTime = (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  return instance.disconnectionTime;
};

// Get session information for an instance
const getSessionInfo = (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  return {
    lastActive: instance.sessionData?.lastActive || null,
    reconnectAttempts: instance.sessionData?.reconnectAttempts || 0,
    maxReconnectAttempts: instance.sessionData?.maxReconnectAttempts || 5,
    isReconnecting: instance.sessionData?.isReconnecting || false,
    reconnectDelay: instance.sessionData?.reconnectDelay || 5000
  };
};

module.exports = {
  getQRCode,
  getConnectionStatus,
  getConnectionTime,
  getDisconnectionTime,
  getSessionInfo
};
