
/**
 * WhatsApp Status Controller
 * Handles all status-related API endpoints for WhatsApp
 * Updated for WPPConnect integration
 */

const whatsappClient = require('../../whatsapp/client');

// Get QR code for instance
const getQRCode = (req, res) => {
  const { instanceId = 'default' } = req.query;
  res.json({ qr: whatsappClient.getQRCode(instanceId) });
};

// Get connection status
const getConnectionStatus = (req, res) => {
  const { instanceId = 'default' } = req.query;
  const status = whatsappClient.getConnectionStatus(instanceId);
  const connectionTime = whatsappClient.getConnectionTime(instanceId);
  const disconnectionTime = whatsappClient.getDisconnectionTime(instanceId);
  
  let connectionState = 'DISCONNECTED';
  if (status.isConnected) {
    connectionState = 'CONNECTED';
  } else if (whatsappClient.getQRCode(instanceId)) {
    connectionState = 'PENDING';
  } else if (status.reconnection && status.reconnection.isActive) {
    connectionState = 'RECONNECTING';
  }
  
  res.json({ 
    status: connectionState, 
    device: status.device,
    connected: status.isConnected,
    since: connectionTime,
    disconnectedAt: disconnectionTime,
    reconnection: status.reconnection
  });
};

// Connect WhatsApp instance
const connect = async (req, res) => {
  try {
    const { instanceId = 'default' } = req.body;
    
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
      
      // Clear the QR code for this instance
      whatsappClient.clearQRCode(instanceId);
    }
    
    res.json({ status: 'DISCONNECTED' });
  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error);
    res.status(500).json({ error: 'Failed to disconnect WhatsApp' });
  }
};

// Manually trigger reconnection
const reconnect = async (req, res) => {
  try {
    const { instanceId = 'default' } = req.body;
    
    // Get current connection status
    const status = whatsappClient.getConnectionStatus(instanceId);
    
    // Only try to reconnect if not already connected
    if (status.isConnected) {
      return res.json({ 
        status: 'ALREADY_CONNECTED', 
        message: 'WhatsApp is already connected'
      });
    }
    
    // Trigger reconnection
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

// Configure reconnection parameters
const configureReconnection = async (req, res) => {
  try {
    const { 
      instanceId = 'default', 
      maxAttempts = 5, 
      baseDelay = 5000 
    } = req.body;
    
    // Validate input
    if (maxAttempts < 1 || maxAttempts > 20) {
      return res.status(400).json({ 
        error: 'maxAttempts must be between 1 and 20' 
      });
    }
    
    if (baseDelay < 1000 || baseDelay > 60000) {
      return res.status(400).json({ 
        error: 'baseDelay must be between 1000 and 60000 ms' 
      });
    }
    
    // Configure reconnection
    whatsappClient.configureReconnection(instanceId, maxAttempts, baseDelay);
    
    res.json({
      status: 'SUCCESS',
      message: 'Reconnection configuration updated',
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

// Get session information
const getSessionInfo = async (req, res) => {
  try {
    const { instanceId = 'default' } = req.query;
    
    // Get state manager
    const stateManager = require('../../whatsapp/services/stateManager');
    
    // Get session information
    const sessionInfo = stateManager.getSessionInfo(instanceId);
    
    res.json({ session: sessionInfo });
  } catch (error) {
    console.error('Error fetching session information:', error);
    res.status(500).json({ error: 'Failed to get session information' });
  }
};

module.exports = {
  getQRCode,
  getConnectionStatus,
  connect,
  disconnect,
  reconnect,
  configureReconnection,
  getSessionInfo
};
