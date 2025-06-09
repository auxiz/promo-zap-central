
/**
 * WhatsApp Session Controller
 * Handles session information and management
 */

const circuitBreaker = require('../../whatsapp/services/connection/circuitBreaker');

// Get session information including circuit breaker status
const getSessionInfo = async (req, res) => {
  try {
    const { instanceId = 'default' } = req.query;
    
    const stateManager = require('../../whatsapp/services/stateManager');
    const sessionInfo = stateManager.getSessionInfo(instanceId);
    const circuitStatus = circuitBreaker.getCircuitStatus(instanceId);
    
    res.json({ 
      session: sessionInfo,
      circuitBreaker: circuitStatus
    });
  } catch (error) {
    console.error('Error fetching session information:', error);
    res.status(500).json({ error: 'Failed to get session information' });
  }
};

module.exports = {
  getSessionInfo
};
