
/**
 * WhatsApp Error Controller
 * Handles all error-related API endpoints for WhatsApp
 */

const whatsappClient = require('../../whatsapp/client');

// Get error statistics
const getErrorStats = (req, res) => {
  try {
    const { instanceId } = req.query;
    
    if (instanceId) {
      // Get errors for a specific instance
      const instanceErrors = whatsappClient.getInstanceErrorStats(instanceId);
      res.json({ errors: instanceErrors });
    } else {
      // Get global error stats
      const globalErrors = whatsappClient.getGlobalErrorStats();
      const instanceErrors = {};
      
      // Get all instance IDs from the request if provided
      const instances = req.query.instances ? 
        req.query.instances.split(',') : 
        ['default'];
      
      // Get error stats for each instance
      instances.forEach(id => {
        instanceErrors[id] = whatsappClient.getInstanceErrorStats(id);
      });
      
      res.json({
        global: globalErrors,
        instances: instanceErrors
      });
    }
  } catch (error) {
    console.error('Error fetching error stats:', error);
    res.status(500).json({ error: 'Failed to fetch error statistics' });
  }
};

// Clear error history
const clearErrorHistory = (req, res) => {
  try {
    const { instanceId } = req.body;
    
    if (instanceId) {
      // Clear errors for a specific instance
      whatsappClient.clearErrorHistory(instanceId);
      res.json({ success: true, message: `Error history cleared for instance ${instanceId}` });
    } else {
      // Clear global error history (all instances)
      const instances = req.body.instances ? 
        req.body.instances : 
        ['default'];
      
      instances.forEach(id => {
        whatsappClient.clearErrorHistory(id);
      });
      
      res.json({ success: true, message: 'Error history cleared for all specified instances' });
    }
  } catch (error) {
    console.error('Error clearing error history:', error);
    res.status(500).json({ error: 'Failed to clear error history' });
  }
};

module.exports = {
  getErrorStats,
  clearErrorHistory
};
