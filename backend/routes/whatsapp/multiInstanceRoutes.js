
/**
 * Multi-Instance WhatsApp Routes
 * Routes for managing multiple isolated WhatsApp instances
 */

const express = require('express');
const router = express.Router();
const multiInstanceController = require('../../controllers/whatsapp/multiInstanceStatusController');

// Instance management routes
router.post('/instances', multiInstanceController.createInstance);
router.delete('/instances/:instanceId', multiInstanceController.deleteInstance);
router.get('/instances', multiInstanceController.getAllInstancesStatus);

// Instance-specific connection routes
router.get('/instances/:instanceId/qrcode', (req, res) => {
  req.query.instanceId = req.params.instanceId;
  multiInstanceController.getInstanceQRCode(req, res);
});

router.get('/instances/:instanceId/status', (req, res) => {
  req.query.instanceId = req.params.instanceId;
  multiInstanceController.getInstanceConnectionStatus(req, res);
});

router.post('/instances/:instanceId/connect', (req, res) => {
  req.body.instanceId = req.params.instanceId;
  multiInstanceController.connectInstance(req, res);
});

router.post('/instances/:instanceId/disconnect', (req, res) => {
  req.body.instanceId = req.params.instanceId;
  multiInstanceController.disconnectInstance(req, res);
});

router.post('/instances/:instanceId/reconnect', (req, res) => {
  req.body.instanceId = req.params.instanceId;
  multiInstanceController.reconnectInstance(req, res);
});

// Backward compatibility routes (default instance)
router.get('/qrcode', multiInstanceController.getInstanceQRCode);
router.get('/status', multiInstanceController.getInstanceConnectionStatus);
router.post('/connect', multiInstanceController.connectInstance);
router.post('/disconnect', multiInstanceController.disconnectInstance);
router.post('/reconnect', multiInstanceController.reconnectInstance);

module.exports = router;
