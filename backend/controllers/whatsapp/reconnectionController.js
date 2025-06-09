
/**
 * WhatsApp Reconnection Controller
 * Handles reconnection logic and configuration
 */

const whatsappClient = require('../../whatsapp/client');
const circuitBreaker = require('../../whatsapp/services/connection/circuitBreaker');

// Manually trigger reconnection with circuit breaker check
const reconnect = async (req, res) => {
  try {
    const { instanceId = 'default' } = req.body;
    
    // Check circuit breaker first
    if (!circuitBreaker.canAttemptConnection(instanceId)) {
      return res.status(429).json({ 
        status: 'CIRCUIT_OPEN', 
        message: 'Reconnection blocked by circuit breaker due to repeated failures',
        circuitState: circuitBreaker.getCircuitStatus(instanceId).state
      });
    }
    
    const status = whatsappClient.getConnectionStatus(instanceId);
    
    if (status.isConnected) {
      return res.json({ 
        status: 'ALREADY_CONNECTED', 
        message: 'WhatsApp is already connected'
      });
    }
    
    whatsappClient.attemptReconnection(instanceId);
    
    res.json({ 
      status: 'RECONNECTING',
      message: 'Reconnection process started'
    });
  } catch (error) {
    console.error('Error initiating WhatsApp reconnection:', error);
    res.status(500).json({ error: 'Failed to reconnect WhatsApp' });
  }
};

// Configure reconnection parameters with safety limits
const configureReconnection = async (req, res) => {
  try {
    const { 
      instanceId = 'default', 
      maxAttempts = 3, 
      baseDelay = 15000 
    } = req.body;
    
    // Enforce stricter limits to prevent resource exhaustion
    if (maxAttempts < 1 || maxAttempts > 5) {
      return res.status(400).json({ 
        error: 'maxAttempts must be between 1 and 5 (reduced for resource protection)' 
      });
    }
    
    if (baseDelay < 15000 || baseDelay > 300000) {
      return res.status(400).json({ 
        error: 'baseDelay must be between 15000 and 300000 ms (minimum 15s for resource protection)' 
      });
    }
    
    whatsappClient.configureReconnection(instanceId, maxAttempts, baseDelay);
    
    res.json({
      status: 'SUCCESS',
      message: 'Reconnection configuration updated with resource protection',
      config: {
        instanceId,
        maxAttempts,
        baseDelay
      }
    });
  } catch (error) {
    console.error('Error configuring WhatsApp reconnection:', error);
    res.status(500).json({ error: 'Failed to configure reconnection' });
  }
};

module.exports = {
  reconnect,
  configureReconnection
};
