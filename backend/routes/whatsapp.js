
/**
 * WhatsApp API Routes
 * Main entry point for WhatsApp API routes
 */

const express = require('express');
const router = express.Router();

// Import route modules
const statusRoutes = require('./whatsapp/statusRoutes');
const groupRoutes = require('./whatsapp/groupRoutes');
const errorRoutes = require('./whatsapp/errorRoutes');
const metricsRoutes = require('./whatsapp/metricsRoutes');
const multiInstanceRoutes = require('./whatsapp/multiInstanceRoutes');

// Use multi-instance routes (includes backward compatibility)
router.use('/', multiInstanceRoutes);

// Use the other routes
router.use('/', statusRoutes);
router.use('/', groupRoutes);
router.use('/', errorRoutes);
router.use('/', metricsRoutes);

module.exports = router;
