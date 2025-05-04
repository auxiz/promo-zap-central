
/**
 * WhatsApp Error Routes
 * Routes for managing WhatsApp errors
 */

const express = require('express');
const router = express.Router();
const errorController = require('../../controllers/whatsapp/errorController');

// Get error stats
router.get('/errors', errorController.getErrorStats);

// Clear error history
router.delete('/errors', errorController.clearErrorHistory);

module.exports = router;
