
/**
 * WhatsApp Metrics Controller
 * Handles all metrics-related API endpoints for WhatsApp
 */

const whatsappClient = require('../../whatsapp/client');

// Get metrics
const getMetrics = (req, res) => {
  try {
    const { instanceId = 'default' } = req.query;
    const metrics = whatsappClient.getMetrics(instanceId);
    res.json({ metrics });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
};

// Reset metrics
const resetMetrics = (req, res) => {
  try {
    const { instanceId = 'default' } = req.body;
    whatsappClient.resetMetrics(instanceId);
    res.json({ success: true, message: `Metrics reset for instance ${instanceId}` });
  } catch (error) {
    console.error('Error resetting metrics:', error);
    res.status(500).json({ error: 'Failed to reset metrics' });
  }
};

// Clear rate limit warnings
const clearRateLimitWarnings = (req, res) => {
  try {
    const { instanceId = 'default' } = req.body;
    whatsappClient.clearRateLimitWarnings(instanceId);
    res.json({ success: true, message: `Rate limit warnings cleared for instance ${instanceId}` });
  } catch (error) {
    console.error('Error clearing rate limit warnings:', error);
    res.status(500).json({ error: 'Failed to clear rate limit warnings' });
  }
};

module.exports = {
  getMetrics,
  resetMetrics,
  clearRateLimitWarnings
};
