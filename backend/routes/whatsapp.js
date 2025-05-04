
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

// Use the routes
router.use('/', statusRoutes);
router.use('/', groupRoutes);
router.use('/', errorRoutes);
router.use('/', metricsRoutes);

module.exports = router;
