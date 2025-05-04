
/**
 * State Manager for WhatsApp
 * Main entry point for WhatsApp state management
 */

// Import state modules
const connectionState = require('./state/connectionState');
const chatState = require('./state/chatState');
const groupState = require('./state/groupState');
const errorTracker = require('./errorTracker');

// Export all state management functions through a unified interface
module.exports = {
  // Connection state
  getQRCode: connectionState.getQRCode,
  getConnectionStatus: connectionState.getConnectionStatus,
  getConnectionTime: connectionState.getConnectionTime,
  getDisconnectionTime: connectionState.getDisconnectionTime,
  getSessionInfo: connectionState.getSessionInfo,
  
  // Chat state
  getChats: chatState.getChats,
  
  // Group state
  getMonitoredGroups: groupState.getMonitoredGroups,
  getSendGroups: groupState.getSendGroups,
  setMonitoredGroups: groupState.setMonitoredGroups,
  setSendGroups: groupState.setSendGroups,
  addMonitoredGroup: groupState.addMonitoredGroup,
  removeMonitoredGroup: groupState.removeMonitoredGroup,
  addSendGroup: groupState.addSendGroup,
  removeSendGroup: groupState.removeSendGroup,
  
  // Error tracking
  trackError: errorTracker.trackError,
  trackShopeeError: errorTracker.trackShopeeError,
  getErrorStats: errorTracker.getGlobalErrorStats
};
