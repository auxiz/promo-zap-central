
/**
 * Connection manager for WhatsApp
 * Main entry point for managing WhatsApp client connections
 */

const clientInitializer = require('./connection/clientInitializer');
const clientDestroyer = require('./connection/clientDestroyer');
const reconnectionManager = require('./connection/reconnectionManager');
const instanceRestorer = require('./connection/instanceRestorer');

// Export all functionality through a unified interface
module.exports = {
  // Client initialization
  initializeClient: clientInitializer.initializeClient,
  clearQRCode: clientInitializer.clearQRCode,
  
  // Client destruction
  destroyClient: clientDestroyer.destroyClient,
  
  // Reconnection management
  attemptReconnection: reconnectionManager.attemptReconnection,
  configureReconnection: reconnectionManager.configureReconnection,
  getReconnectionStatus: reconnectionManager.getReconnectionStatus,
  
  // Instance restoration
  restoreInstances: instanceRestorer.restoreInstances
};
