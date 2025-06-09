
/**
 * WhatsApp Status Routes with resource protection
 * Routes for managing WhatsApp connection status
 */

const express = require('express');
const router = express.Router();
const statusController = require('../../controllers/whatsapp/mainStatusController');

// Get QR code for connection
router.get('/qrcode', statusController.getQRCode);

// Get connection status
router.get('/status', statusController.getConnectionStatus);

// Connect WhatsApp
router.post('/connect', statusController.connect);

// Disconnect WhatsApp
router.post('/disconnect', statusController.disconnect);

// Manual reconnection
router.post('/reconnect', statusController.reconnect);

// Configure reconnection parameters
router.post('/reconnect/config', statusController.configureReconnection);

// Get session information
router.get('/session', statusController.getSessionInfo);

// Emergency stop all connections (admin endpoint)
router.post('/emergency-stop', statusController.emergencyStop);

module.exports = router;
