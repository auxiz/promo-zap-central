
/**
 * Main WhatsApp Status Controller
 * Combines all status-related functionality with resource protection
 */

const qrController = require('./qrController');
const connectionController = require('./connectionController');
const reconnectionController = require('./reconnectionController');
const sessionController = require('./sessionController');
const emergencyController = require('./emergencyController');

module.exports = {
  // QR Code functionality
  getQRCode: qrController.getQRCode,
  
  // Connection functionality
  getConnectionStatus: connectionController.getConnectionStatus,
  connect: connectionController.connect,
  disconnect: connectionController.disconnect,
  
  // Reconnection functionality
  reconnect: reconnectionController.reconnect,
  configureReconnection: reconnectionController.configureReconnection,
  
  // Session functionality
  getSessionInfo: sessionController.getSessionInfo,
  
  // Emergency functionality
  emergencyStop: emergencyController.emergencyStop
};
