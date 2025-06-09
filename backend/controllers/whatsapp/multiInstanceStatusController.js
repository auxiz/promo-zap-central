
/**
 * Multi-Instance WhatsApp Status Controller
 * Handles all status-related API endpoints for multiple WhatsApp instances
 */

const whatsappClient = require('../../whatsapp/client');
const instanceModel = require('../../whatsapp/models/instance');
const isolatedReconnectionManager = require('../../whatsapp/services/connection/isolatedReconnectionManager');

// Get QR code for specific instance
const getInstanceQRCode = (req, res) => {
  const { instanceId = 'default' } = req.query;
  
  // Check if instance exists
  if (!instanceModel.instanceExists(instanceId)) {
    return res.status(404).json({ 
      error: `Instance ${instanceId} not found`
    });
  }
  
  // Check instance reconnection status
  const reconnectionStatus = isolatedReconnectionManager.getInstanceReconnectionStatus(instanceId);
  if (!reconnectionStatus.canReconnect) {
    return res.json({ 
      qr: null,
      error: 'Connection temporarily blocked due to repeated failures',
      instanceId
    });
  }
  
  res.json({ 
    qr: whatsappClient.getQRCode(instanceId),
    instanceId
  });
};

// Get connection status for specific instance
const getInstanceConnectionStatus = (req, res) => {
  const { instanceId = 'default' } = req.query;
  
  // Check if instance exists
  if (!instanceModel.instanceExists(instanceId)) {
    return res.status(404).json({ 
      error: `Instance ${instanceId} not found`
    });
  }
  
  const status = whatsappClient.getConnectionStatus(instanceId);
  const connectionTime = whatsappClient.getConnectionTime(instanceId);
  const disconnectionTime = whatsappClient.getDisconnectionTime(instanceId);
  const reconnectionStatus = isolatedReconnectionManager.getInstanceReconnectionStatus(instanceId);
  const instance = instanceModel.getInstance(instanceId);
  
  let connectionState = 'DISCONNECTED';
  if (status.isConnected) {
    connectionState = 'CONNECTED';
  } else if (whatsappClient.getQRCode(instanceId)) {
    connectionState = 'PENDING';
  } else if (reconnectionStatus.isReconnecting) {
    connectionState = 'RECONNECTING';
  }
  
  // Override state if circuit breaker is open
  if (!reconnectionStatus.canReconnect) {
    connectionState = 'CIRCUIT_OPEN';
  }
  
  res.json({ 
    instanceId,
    status: connectionState, 
    device: status.device,
    connected: status.isConnected,
    since: connectionTime,
    disconnectedAt: disconnectionTime,
    reconnection: reconnectionStatus,
    config: instance.config,
    monitoredGroupsCount: instance.monitoredGroups.length,
    sendGroupsCount: instance.sendGroups.length
  });
};

// Get status for all instances
const getAllInstancesStatus = (req, res) => {
  const allInstancesStatus = instanceModel.getAllInstancesStatus();
  
  // Enhance with connection details
  const enhancedStatus = {};
  for (const [instanceId, instanceStatus] of Object.entries(allInstancesStatus)) {
    const connectionStatus = whatsappClient.getConnectionStatus(instanceId);
    const reconnectionStatus = isolatedReconnectionManager.getInstanceReconnectionStatus(instanceId);
    
    enhancedStatus[instanceId] = {
      ...instanceStatus,
      connectionStatus: connectionStatus.isConnected ? 'CONNECTED' : 'DISCONNECTED',
      qrAvailable: !!whatsappClient.getQRCode(instanceId),
      reconnection: reconnectionStatus
    };
  }
  
  res.json(enhancedStatus);
};

// Connect specific WhatsApp instance
const connectInstance = async (req, res) => {
  try {
    const { instanceId = 'default' } = req.body;
    
    // Ensure instance exists
    instanceModel.ensureInstance(instanceId);
    
    // Check if instance can reconnect
    if (!isolatedReconnectionManager.canInstanceReconnect(instanceId)) {
      return res.status(429).json({ 
        error: 'Connection temporarily blocked due to repeated failures. Please wait before trying again.',
        instanceId,
        reconnectionStatus: isolatedReconnectionManager.getInstanceReconnectionStatus(instanceId)
      });
    }
    
    // Initialize the isolated client for this instance
    await whatsappClient.initializeClient(instanceId);
    
    // Mark instance as active
    instanceModel.updateInstanceConfig(instanceId, {
      isActive: true,
      lastConnectionAttempt: Date.now()
    });
    
    res.json({ 
      status: 'CONNECTING',
      instanceId
    });
  } catch (error) {
    console.error(`Error connecting WhatsApp instance ${req.body.instanceId}:`, error);
    res.status(500).json({ 
      error: 'Failed to connect WhatsApp instance',
      instanceId: req.body.instanceId
    });
  }
};

// Disconnect specific WhatsApp instance
const disconnectInstance = async (req, res) => {
  try {
    const { instanceId = 'default' } = req.body;
    
    if (!instanceModel.instanceExists(instanceId)) {
      return res.status(404).json({ 
        error: `Instance ${instanceId} not found`
      });
    }
    
    const { isConnected } = whatsappClient.getConnectionStatus(instanceId);
    
    if (isConnected) {
      await whatsappClient.destroyClient(instanceId);
      console.log(`WhatsApp client for instance ${instanceId} destroyed`);
      whatsappClient.clearQRCode(instanceId);
    }
    
    // Stop any reconnection attempts
    isolatedReconnectionManager.stopInstanceReconnection(instanceId);
    
    // Update instance as inactive
    instanceModel.updateInstanceConfig(instanceId, {
      isActive: false,
      lastDisconnection: Date.now()
    });
    
    res.json({ 
      status: 'DISCONNECTED',
      instanceId
    });
  } catch (error) {
    console.error(`Error disconnecting WhatsApp instance ${req.body.instanceId}:`, error);
    res.status(500).json({ 
      error: 'Failed to disconnect WhatsApp instance',
      instanceId: req.body.instanceId
    });
  }
};

// Create new WhatsApp instance
const createInstance = async (req, res) => {
  try {
    const { instanceId, name } = req.body;
    
    if (!instanceId || !name) {
      return res.status(400).json({ 
        error: 'instanceId and name are required'
      });
    }
    
    // Check if instance already exists
    if (instanceModel.instanceExists(instanceId)) {
      return res.status(409).json({ 
        error: `Instance ${instanceId} already exists`
      });
    }
    
    // Create new instance
    instanceModel.ensureInstance(instanceId);
    instanceModel.updateInstanceConfig(instanceId, {
      name,
      isActive: false,
      createdAt: Date.now()
    });
    
    console.log(`Created new WhatsApp instance: ${instanceId} (${name})`);
    
    res.json({ 
      status: 'CREATED',
      instanceId,
      name,
      message: `Instance ${name} created successfully`
    });
  } catch (error) {
    console.error('Error creating WhatsApp instance:', error);
    res.status(500).json({ 
      error: 'Failed to create WhatsApp instance'
    });
  }
};

// Delete WhatsApp instance
const deleteInstance = async (req, res) => {
  try {
    const { instanceId } = req.params;
    
    if (instanceId === 'default') {
      return res.status(400).json({ 
        error: 'Cannot delete default instance'
      });
    }
    
    if (!instanceModel.instanceExists(instanceId)) {
      return res.status(404).json({ 
        error: `Instance ${instanceId} not found`
      });
    }
    
    // Disconnect if connected
    const { isConnected } = whatsappClient.getConnectionStatus(instanceId);
    if (isConnected) {
      await whatsappClient.destroyClient(instanceId);
    }
    
    // Stop reconnection
    isolatedReconnectionManager.stopInstanceReconnection(instanceId);
    
    // Delete instance completely
    const deleted = instanceModel.deleteInstance(instanceId);
    
    if (deleted) {
      res.json({ 
        status: 'DELETED',
        instanceId,
        message: `Instance ${instanceId} deleted successfully`
      });
    } else {
      res.status(500).json({ 
        error: `Failed to delete instance ${instanceId}`
      });
    }
  } catch (error) {
    console.error(`Error deleting WhatsApp instance ${req.params.instanceId}:`, error);
    res.status(500).json({ 
      error: 'Failed to delete WhatsApp instance'
    });
  }
};

// Manually trigger reconnection for specific instance
const reconnectInstance = async (req, res) => {
  try {
    const { instanceId = 'default' } = req.body;
    
    if (!instanceModel.instanceExists(instanceId)) {
      return res.status(404).json({ 
        error: `Instance ${instanceId} not found`
      });
    }
    
    // Check if instance can reconnect
    if (!isolatedReconnectionManager.canInstanceReconnect(instanceId)) {
      return res.status(429).json({ 
        status: 'CIRCUIT_OPEN', 
        message: 'Reconnection blocked by circuit breaker due to repeated failures',
        instanceId,
        reconnectionStatus: isolatedReconnectionManager.getInstanceReconnectionStatus(instanceId)
      });
    }
    
    const status = whatsappClient.getConnectionStatus(instanceId);
    
    if (status.isConnected) {
      return res.json({ 
        status: 'ALREADY_CONNECTED', 
        message: 'WhatsApp instance is already connected',
        instanceId
      });
    }
    
    isolatedReconnectionManager.attemptInstanceReconnection(instanceId);
    
    res.json({ 
      status: 'RECONNECTING',
      message: 'Isolated reconnection process started',
      instanceId
    });
  } catch (error) {
    console.error(`Error initiating WhatsApp reconnection for instance ${req.body.instanceId}:`, error);
    res.status(500).json({ 
      error: 'Failed to reconnect WhatsApp instance',
      instanceId: req.body.instanceId
    });
  }
};

module.exports = {
  getInstanceQRCode,
  getInstanceConnectionStatus,
  getAllInstancesStatus,
  connectInstance,
  disconnectInstance,
  createInstance,
  deleteInstance,
  reconnectInstance
};
