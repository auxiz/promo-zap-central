
/**
 * WhatsApp Connection Controller
 * Handles connection status and connection management
 */

const whatsappClient = require('../../whatsapp/client');
const circuitBreaker = require('../../whatsapp/services/connection/circuitBreaker');

// Get connection status
const getConnectionStatus = (req, res) => {
  const { instanceId = 'default' } = req.query;
  const status = whatsappClient.getConnectionStatus(instanceId);
  const connectionTime = whatsappClient.getConnectionTime(instanceId);
  const disconnectionTime = whatsappClient.getDisconnectionTime(instanceId);
  const circuitStatus = circuitBreaker.getCircuitStatus(instanceId);
  
  let connectionState = 'DISCONNECTED';
  if (status.isConnected) {
    connectionState = 'CONNECTED';
  } else if (whatsappClient.getQRCode(instanceId)) {
    connectionState = 'PENDING';
  } else if (status.reconnection && status.reconnection.isActive) {
    connectionState = 'RECONNECTING';
  }
  
  // Override state if circuit breaker is open
  if (circuitStatus.state === 'OPEN') {
    connectionState = 'CIRCUIT_OPEN';
  }
  
  res.json({ 
    status: connectionState, 
    device: status.device,
    connected: status.isConnected,
    since: connectionTime,
    disconnectedAt: disconnectionTime,
    reconnection: status.reconnection,
    circuitBreaker: {
      state: circuitStatus.state,
      failures: circuitStatus.failures,
      canConnect: circuitBreaker.canAttemptConnection(instanceId)
    }
  });
};

// Connect WhatsApp instance with circuit breaker protection
const connect = async (req, res) => {
  try {
    const { instanceId = 'default' } = req.body;
    
    // Check circuit breaker
    if (!circuitBreaker.canAttemptConnection(instanceId)) {
      return res.status(429).json({ 
        error: 'Connection temporarily blocked due to repeated failures. Please wait before trying again.',
        circuitState: circuitBreaker.getCircuitStatus(instanceId).state
      });
    }
    
    // Initialize the client for this instance
    await whatsappClient.initializeClient(instanceId);
    
    res.json({ status: 'CONNECTING' });
  } catch (error) {
    console.error('Error connecting WhatsApp:', error);
    res.status(500).json({ error: 'Failed to connect WhatsApp' });
  }
};

// Disconnect WhatsApp instance
const disconnect = async (req, res) => {
  try {
    const { instanceId = 'default' } = req.body;
    const { isConnected } = whatsappClient.getConnectionStatus(instanceId);
    
    if (isConnected) {
      await whatsappClient.destroyClient(instanceId);
      console.log(`WhatsApp client for instance ${instanceId} destroyed`);
      whatsappClient.clearQRCode(instanceId);
    }
    
    // Reset circuit breaker on manual disconnect
    circuitBreaker.resetCircuit(instanceId);
    
    res.json({ status: 'DISCONNECTED' });
  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error);
    res.status(500).json({ error: 'Failed to disconnect WhatsApp' });
  }
};

module.exports = {
  getConnectionStatus,
  connect,
  disconnect
};
