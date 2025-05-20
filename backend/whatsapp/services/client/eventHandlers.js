
/**
 * Event handlers for WhatsApp client
 * Contains all event handlers for WPPConnect client events
 */

const qrcode = require('qrcode');
const errorTracker = require('../errorTracker');
const metricsTracker = require('../metricsTracker');
const instanceModel = require('../../models/instance');

// Attach all event handlers to a WPPConnect client
const attachEventHandlers = (client, instanceId) => {
  const instance = instanceModel.getInstance(instanceId);

  // WPPConnect doesn't need a QR handler as it's handled in the client creation options
  // Instead, we'll use the authenticated event for tracking
  
  // Event handler for authenticated state
  client.onStateChange(state => {
    console.log(`WPPConnect state change for instance ${instanceId}:`, state);
    
    if (state === 'CONNECTED') {
      if (!instance.isConnected) {
        // Just connected
        instance.isConnected = true;
        instance.connectionTime = Date.now();
        
        // Reset reconnection state since we're now connected
        instanceModel.updateSessionData(instanceId, {
          reconnectAttempts: 0,
          isReconnecting: false,
          lastActive: Date.now()
        });
        
        console.log(`WhatsApp connected for instance ${instanceId}`);
        instance.qrCodeDataUrl = null; // Clear QR code after successful connection
        errorTracker.resetRetryAttempts(instanceId);
        
        // Record connection started for metrics
        metricsTracker.recordConnectionStart(instanceId);
      }
    } else if (state === 'DISCONNECTED' || state === 'CONFLICT' || state === 'UNLAUNCHED') {
      if (instance.isConnected) {
        // Just disconnected
        instance.isConnected = false;
        instance.disconnectionTime = Date.now();
        
        // Record connection ended for metrics
        metricsTracker.recordConnectionEnd(instanceId);
        
        const reason = state === 'CONFLICT' ? 'Session conflict' : 
                       state === 'UNLAUNCHED' ? 'Browser closed' : 'Unknown';
        
        console.log(`WhatsApp disconnected for instance ${instanceId}. Reason: ${reason}`);
        
        errorTracker.trackError(
          instanceId,
          'DISCONNECTION',
          `WhatsApp disconnected: ${reason}`,
          { reason }
        );
        
        // Don't attempt reconnection for intentional disconnections
        if (reason !== 'INTENTIONAL_LOGOUT') {
          // Import reconnection manager dynamically to avoid circular dependency
          const reconnectionManager = require('../connection/reconnectionManager');
          // Attempt reconnection
          reconnectionManager.attemptReconnection(instanceId);
        }
      }
    }
  });
  
  // Set device info once available
  client.onStateChange(async state => {
    if (state === 'CONNECTED') {
      try {
        // Get client info
        const info = await client.getWid();
        instance.device = info.user;
      } catch (error) {
        console.error(`Error getting device info for instance ${instanceId}:`, error);
      }
    }
  });
  
  // Authentication events
  client.onAuthState(isAuthenticated => {
    if (isAuthenticated) {
      // Update the last active time
      instanceModel.updateSessionData(instanceId, {
        lastActive: Date.now()
      });
      
      console.log(`WhatsApp authenticated for instance ${instanceId}`);
    }
  });
  
  // New incoming messages
  client.onMessage(message => {
    metricsTracker.recordMessageReceived(instanceId);
    
    // Update the last active time
    instanceModel.updateSessionData(instanceId, {
      lastActive: Date.now()
    });
  });
  
  // Message acknowledgment
  client.onAck(ack => {
    if (ack.ack === 1 || ack.ack === 2 || ack.ack === 3) {
      metricsTracker.recordMessageSent(instanceId);
      
      // Update the last active time
      instanceModel.updateSessionData(instanceId, {
        lastActive: Date.now()
      });
    } else if (ack.ack === -1) {
      metricsTracker.recordMessageFailed(instanceId);
    }
  });
  
  // Handle rate limit warnings
  client.onIncomingCall(call => {
    // WPPConnect doesn't have a direct rate limit event, but we can use call events as indicators
    if (call.isGroup) {
      metricsTracker.recordRateLimitWarning(
        instanceId,
        "Possible WhatsApp rate limit detected",
        { callId: call.id, type: "Incoming group call" }
      );
    }
  });

  return client;
};

module.exports = {
  attachEventHandlers
};
