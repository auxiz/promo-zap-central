
/**
 * Event handlers for WhatsApp client
 * Contains all event handlers for WhatsApp client events
 */

const qrcode = require('qrcode');
const errorTracker = require('../errorTracker');
const metricsTracker = require('../metricsTracker');
const instanceModel = require('../../models/instance');

// Attach all event handlers to a client
const attachEventHandlers = (client, instanceId) => {
  const instance = instanceModel.getInstance(instanceId);

  // Event handler for QR code generation
  client.on('qr', async (qrString) => {
    console.log(`QR generated for instance ${instanceId}: ${qrString}`);
    
    try {
      // Convert QR string to data URL
      instance.qrCodeDataUrl = await qrcode.toDataURL(qrString);
      // Reset retry count on successful QR code generation
      errorTracker.resetRetryAttempts(instanceId);
      
      // Update the last active time
      instanceModel.updateSessionData(instanceId, {
        lastActive: Date.now()
      });
    } catch (error) {
      errorTracker.trackError(
        instanceId, 
        'QR_CODE', 
        `Error generating QR code for instance ${instanceId}`, 
        error
      );
      instance.qrCodeDataUrl = null;
    }
  });

  // Event handler for ready state
  client.on('ready', () => {
    instance.isConnected = true;
    instance.device = client.info.wid.user;
    instance.connectionTime = Date.now();
    
    // Reset reconnection state since we're now connected
    instanceModel.updateSessionData(instanceId, {
      reconnectAttempts: 0,
      isReconnecting: false,
      lastActive: Date.now()
    });
    
    console.log(`WhatsApp connected for instance ${instanceId} with device: ${instance.device}`);
    instance.qrCodeDataUrl = null; // Clear QR code after successful connection
    errorTracker.resetRetryAttempts(instanceId);
    
    // Record connection started for metrics
    metricsTracker.recordConnectionStart(instanceId);
  });

  // Event handler for disconnected state
  client.on('disconnected', (reason) => {
    instance.isConnected = false;
    instance.device = null;
    
    // Record disconnection time
    instance.disconnectionTime = Date.now();
    
    // Record connection ended for metrics
    metricsTracker.recordConnectionEnd(instanceId);
    
    instance.connectionTime = null;
    console.log(`WhatsApp disconnected for instance ${instanceId}. Reason: ${reason || 'Unknown'}`);
    
    if (reason) {
      errorTracker.trackError(
        instanceId,
        'DISCONNECTION',
        `WhatsApp disconnected: ${reason}`,
        { reason }
      );
    }
    
    // Don't attempt reconnection for intentional disconnections
    if (reason !== 'NAVIGATION' && reason !== 'LOGOUT') {
      // Import reconnection manager dynamically to avoid circular dependency
      const reconnectionManager = require('../connection/reconnectionManager');
      // Attempt reconnection
      reconnectionManager.attemptReconnection(instanceId);
    }
  });
  
  // Add new authentication failure handler with reconnection logic
  client.on('auth_failure', (error) => {
    errorTracker.trackError(
      instanceId,
      'CONNECTION',
      'Authentication failure',
      error
    );
    
    // Import reconnection manager dynamically to avoid circular dependency
    const reconnectionManager = require('../connection/reconnectionManager');
    
    // Attempt reconnection after auth failure
    setTimeout(() => {
      reconnectionManager.attemptReconnection(instanceId);
    }, 15000); // Wait 15 seconds before reconnecting after auth failure
  });
  
  // Add new authenticated event handler
  client.on('authenticated', () => {
    // Update the last active time
    instanceModel.updateSessionData(instanceId, {
      lastActive: Date.now()
    });
    
    console.log(`WhatsApp authenticated for instance ${instanceId}`);
  });
  
  // Message handling for metrics
  client.on('message', () => {
    metricsTracker.recordMessageReceived(instanceId);
    
    // Update the last active time
    instanceModel.updateSessionData(instanceId, {
      lastActive: Date.now()
    });
  });
  
  // Handling for rate limiting and throttling
  client.on('message_ack', (msg, ack) => {
    // Message sending has been acknowledged - update metrics
    if (ack === 1 || ack === 2 || ack === 3) {
      metricsTracker.recordMessageSent(instanceId);
      
      // Update the last active time
      instanceModel.updateSessionData(instanceId, {
        lastActive: Date.now()
      });
    } else if (ack === -1) {
      metricsTracker.recordMessageFailed(instanceId);
      
      // Check for potential rate limiting
      if (msg.body && msg.body.includes("can't send messages")) {
        metricsTracker.recordRateLimitWarning(
          instanceId, 
          "WhatsApp rate limit detected", 
          { messageId: msg.id._serialized, error: "Can't send messages" }
        );
      }
    }
  });
  
  // Add new change_state event handler
  client.on('change_state', (state) => {
    console.log(`WhatsApp state changed for instance ${instanceId}: ${state}`);
    
    // If the state changes to CONNECTED, update connection status
    if (state === 'CONNECTED') {
      instance.isConnected = true;
      
      // Reset reconnection state
      instanceModel.updateSessionData(instanceId, {
        reconnectAttempts: 0,
        isReconnecting: false,
        lastActive: Date.now()
      });
    }
  });
  
  // Add new loading_screen event handler
  client.on('loading_screen', (percent, message) => {
    console.log(`WhatsApp loading screen for instance ${instanceId}: ${percent}% - ${message}`);
  });

  return client;
};

module.exports = {
  attachEventHandlers
};
