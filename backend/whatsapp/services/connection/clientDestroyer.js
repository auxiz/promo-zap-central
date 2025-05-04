
/**
 * Client destroyer for WhatsApp connections
 * Handles the graceful destruction of WhatsApp clients
 */

const instanceModel = require('../../models/instance');
const errorTracker = require('../errorTracker');
const metricsTracker = require('../metricsTracker');

// Destroy WhatsApp client for a specific instance
const destroyClient = async (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  
  // Stop any ongoing reconnection attempts
  instanceModel.updateSessionData(instanceId, {
    isReconnecting: false
  });
  
  if (instance.client) {
    try {
      // Record connection ended for metrics
      metricsTracker.recordConnectionEnd(instanceId);
      
      // Record disconnection time
      instance.disconnectionTime = Date.now();
      
      await instance.client.destroy();
      instance.client = null;
      instance.isConnected = false;
      instance.device = null;
      instance.connectionTime = null;
      instance.qrCodeDataUrl = null;
      console.log(`Client for instance ${instanceId} destroyed successfully`);
      errorTracker.resetRetryAttempts(instanceId);
      return true;
    } catch (error) {
      errorTracker.trackError(
        instanceId,
        'DISCONNECTION',
        `Error destroying client for instance ${instanceId}`,
        error
      );
      return false;
    }
  }
  
  return true; // No client to destroy
};

module.exports = {
  destroyClient
};
