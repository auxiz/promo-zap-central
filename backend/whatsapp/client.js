/**
 * WhatsApp client module
 * Main entry point for WhatsApp functionality
 */

// Import service modules
const connectionManager = require('./services/connectionManager');
const stateManager = require('./services/stateManager');
const errorTracker = require('./services/errorTracker');
const metricsTracker = require('./services/metricsTracker');

// Initialize default instance
connectionManager.initializeClient('default');

// Export all functionality
module.exports = {
  // Connection management
  initializeClient: connectionManager.initializeClient,
  destroyClient: connectionManager.destroyClient,
  clearQRCode: connectionManager.clearQRCode,
  
  // New connection management functions
  attemptReconnection: connectionManager.attemptReconnection,
  restoreInstances: connectionManager.restoreInstances,
  configureReconnection: connectionManager.configureReconnection,
  getReconnectionStatus: connectionManager.getReconnectionStatus,
  
  // State getters
  getQRCode: stateManager.getQRCode,
  getConnectionStatus: stateManager.getConnectionStatus,
  getConnectionTime: stateManager.getConnectionTime,
  getDisconnectionTime: stateManager.getDisconnectionTime,
  getChats: stateManager.getChats,
  
  // Group management
  getMonitoredGroups: stateManager.getMonitoredGroups,
  getSendGroups: stateManager.getSendGroups,
  setMonitoredGroups: stateManager.setMonitoredGroups,
  setSendGroups: stateManager.setSendGroups,
  addMonitoredGroup: stateManager.addMonitoredGroup,
  removeMonitoredGroup: stateManager.removeMonitoredGroup,
  addSendGroup: stateManager.addSendGroup,
  removeSendGroup: stateManager.removeSendGroup,
  
  // Error tracking
  getInstanceErrorStats: errorTracker.getInstanceErrorStats,
  getGlobalErrorStats: errorTracker.getGlobalErrorStats,
  clearErrorHistory: errorTracker.clearErrorHistory,
  
  // Metrics tracking
  getMetrics: metricsTracker.getMetrics,
  resetMetrics: metricsTracker.resetMetrics,
  clearRateLimitWarnings: metricsTracker.clearRateLimitWarnings
};
