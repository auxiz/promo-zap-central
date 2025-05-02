
/**
 * WhatsApp client module
 * Main entry point for WhatsApp functionality
 */

// Import service modules
const connectionManager = require('./services/connectionManager');
const stateManager = require('./services/stateManager');

// Initialize default instance
connectionManager.initializeClient('default');

// Export all functionality
module.exports = {
  // Connection management
  initializeClient: connectionManager.initializeClient,
  destroyClient: connectionManager.destroyClient,
  clearQRCode: connectionManager.clearQRCode,
  
  // State getters
  getQRCode: stateManager.getQRCode,
  getConnectionStatus: stateManager.getConnectionStatus,
  getConnectionTime: stateManager.getConnectionTime,
  getChats: stateManager.getChats,
  
  // Group management
  getMonitoredGroups: stateManager.getMonitoredGroups,
  getSendGroups: stateManager.getSendGroups,
  setMonitoredGroups: stateManager.setMonitoredGroups,
  setSendGroups: stateManager.setSendGroups,
  addMonitoredGroup: stateManager.addMonitoredGroup,
  removeMonitoredGroup: stateManager.removeMonitoredGroup,
  addSendGroup: stateManager.addSendGroup,
  removeSendGroup: stateManager.removeSendGroup
};
