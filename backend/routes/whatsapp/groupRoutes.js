
/**
 * WhatsApp Group Routes
 * Routes for managing WhatsApp groups
 */

const express = require('express');
const router = express.Router();
const groupController = require('../../controllers/whatsapp/groupController');

// Get all WhatsApp groups
router.get('/groups', groupController.getAllGroups);

// Get monitored groups count
router.get('/monitored/count', groupController.getMonitoredCount);

// Get send groups count
router.get('/send/count', groupController.getSendCount);

// Manage monitored groups
router.get('/monitored', groupController.getMonitoredGroups);
router.post('/monitored', groupController.addMonitoredGroup);
router.delete('/monitored/:groupId', groupController.removeMonitoredGroup);

// Manage send groups
router.get('/send', groupController.getSendGroups);
router.post('/send', groupController.addSendGroup);
router.delete('/send/:groupId', groupController.removeSendGroup);

module.exports = router;
