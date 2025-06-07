
/**
 * WhatsApp Status Controller with resource protection
 * Handles all status-related API endpoints for WhatsApp
 */

const whatsappClient = require('../../whatsapp/client');
const circuitBreaker = require('../../whatsapp/services/connection/circuitBreaker');

// Get QR code for instance
const getQRCode = (req, res) => {
  const { instanceId = 'default' } = req.query;
  
  // Check circuit breaker status
  const circuitStatus = circuitBreaker.getCircuitStatus(instanceId);
  if (circuitStatus.state === 'OPEN') {
    return res.json({ 
      qr: null,
      error: 'Connection temporarily blocked due to repeated failures'
    });
  }
  
  res.json({ qr: whatsappClient.getQRCode(instanceId) });
};

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

// Emergency stop endpoint (for admin use)
const emergencyStop = async (req, res) => {
  try {
    const reconnectionManager = require('../../whatsapp/services/connection/reconnectionManager');
    reconnectionManager.emergencyStopReconnections();
    
    res.json({ 
      status: 'SUCCESS',
      message: 'Emergency stop executed - all reconnections halted'
    });
  } catch (error) {
    console.error('Error executing emergency stop:', error);
    res.status(500).json({ error: 'Failed to execute emergency stop' });
  }
};

module.exports = {
  getQRCode,
  getConnectionStatus,
  connect,
  disconnect,
  reconnect,
  configureReconnection,
  getSessionInfo,
  emergencyStop
};
