
/**
 * WhatsApp Metrics Routes
 * Routes for managing WhatsApp metrics
 */

const express = require('express');
const router = express.Router();
const metricsController = require('../../controllers/whatsapp/metricsController');

// Get metrics
router.get('/metrics', metricsController.getMetrics);

// Reset metrics
router.delete('/metrics', metricsController.resetMetrics);

// Clear rate limit warnings
router.delete('/metrics/rate-limits', metricsController.clearRateLimitWarnings);

module.exports = router;
