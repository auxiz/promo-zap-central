const express = require('express');
const router = express.Router();
const whatsappClient = require('../whatsapp/client');

// API endpoint to get QR code
router.get('/qrcode', (req, res) => {
  // Get the instanceId from query params, default to 'default'
  const { instanceId = 'default' } = req.query;
  res.json({ qr: whatsappClient.getQRCode(instanceId) });
});

// API endpoint to get connection status
router.get('/status', (req, res) => {
  // Get the instanceId from query params, default to 'default'
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
});

// API endpoint to connect WhatsApp
router.post('/connect', async (req, res) => {
  try {
    // Get the instanceId from the request body, default to 'default'
    const { instanceId = 'default' } = req.body;
    
    // Initialize the client for this instance
    whatsappClient.initializeClient(instanceId);
    
    res.json({ status: 'CONNECTING' });
  } catch (error) {
    console.error('Error connecting WhatsApp:', error);
    res.status(500).json({ error: 'Failed to connect WhatsApp' });
  }
});

// API endpoint to disconnect WhatsApp
router.post('/disconnect', async (req, res) => {
  try {
    // Get the instanceId from the request body, default to 'default'
    const { instanceId = 'default' } = req.body;
    const { isConnected } = whatsappClient.getConnectionStatus(instanceId);
    
    if (isConnected) {
      // Properly destroy the client session without reinitializing
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
});

// New API endpoint for manual reconnection
router.post('/reconnect', async (req, res) => {
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
});

// New API endpoint to configure reconnection parameters
router.post('/reconnect/config', async (req, res) => {
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
});

// New API endpoint to get session information
router.get('/session', async (req, res) => {
  try {
    const { instanceId = 'default' } = req.query;
    
    // Get state manager
    const stateManager = require('../whatsapp/services/stateManager');
    
    // Get session information
    const sessionInfo = stateManager.getSessionInfo(instanceId);
    
    res.json({ session: sessionInfo });
  } catch (error) {
    console.error('Error fetching session information:', error);
    res.status(500).json({ error: 'Failed to get session information' });
  }
});

// API endpoint to get all WhatsApp groups
router.get('/groups', async (req, res) => {
  try {
    // Get the instanceId from query params, default to 'default'
    const { instanceId = 'default' } = req.query;
    const { isConnected } = whatsappClient.getConnectionStatus(instanceId);
    
    if (!isConnected) {
      return res.status(400).json({ error: 'WhatsApp not connected' });
    }

    const chats = await whatsappClient.getChats(instanceId);
    const groups = chats
      .filter(chat => chat.isGroup)
      .map(group => ({
        id: group.id._serialized,
        name: group.name
      }));

    res.json({ groups });
  } catch (error) {
    console.error('Error fetching WhatsApp groups:', error);
    res.status(500).json({ error: 'Failed to fetch WhatsApp groups' });
  }
});

// API endpoint to get monitored groups count
router.get('/monitored/count', (req, res) => {
  // Get the instanceId from query params, default to 'default'
  const { instanceId = 'default' } = req.query;
  const monitoredGroups = whatsappClient.getMonitoredGroups(instanceId);
  const { isConnected } = whatsappClient.getConnectionStatus(instanceId);
  
  res.json({
    total: monitoredGroups.length,
    active: isConnected ? monitoredGroups.length : 0
  });
});

// API endpoint to get send groups count
router.get('/send/count', (req, res) => {
  // Get the instanceId from query params, default to 'default'
  const { instanceId = 'default' } = req.query;
  const sendGroups = whatsappClient.getSendGroups(instanceId);
  const { isConnected } = whatsappClient.getConnectionStatus(instanceId);
  
  res.json({
    total: sendGroups.length,
    active: isConnected ? sendGroups.length : 0
  });
});

// API endpoint to get monitored groups
router.get('/monitored', (req, res) => {
  const { instanceId = 'default' } = req.query;
  res.json({ monitored: whatsappClient.getMonitoredGroups(instanceId) });
});

// API endpoint to add a group to monitored
router.post('/monitored', (req, res) => {
  try {
    const { groupId } = req.body;
    const { instanceId = 'default' } = req.query;

    if (!groupId) {
      return res.status(400).json({ error: 'Group ID is required' });
    }

    whatsappClient.addMonitoredGroup(groupId, instanceId);
    res.json({ monitored: whatsappClient.getMonitoredGroups(instanceId) });
  } catch (error) {
    console.error('Error adding monitored group:', error);
    res.status(500).json({ error: 'Failed to add monitored group' });
  }
});

// API endpoint to remove a group from monitored
router.delete('/monitored/:groupId', (req, res) => {
  try {
    const { groupId } = req.params;
    const { instanceId = 'default' } = req.query;
    whatsappClient.removeMonitoredGroup(groupId, instanceId);
    res.json({ monitored: whatsappClient.getMonitoredGroups(instanceId) });
  } catch (error) {
    console.error('Error removing monitored group:', error);
    res.status(500).json({ error: 'Failed to remove monitored group' });
  }
});

// API endpoint to get send groups
router.get('/send', (req, res) => {
    const { instanceId = 'default' } = req.query;
  res.json({ send: whatsappClient.getSendGroups(instanceId) });
});

// API endpoint to add a group to send list
router.post('/send', (req, res) => {
  try {
    const { groupId } = req.body;
      const { instanceId = 'default' } = req.query;

    if (!groupId) {
      return res.status(400).json({ error: 'Group ID is required' });
    }

    whatsappClient.addSendGroup(groupId, instanceId);
    res.json({ send: whatsappClient.getSendGroups(instanceId) });
  } catch (error) {
    console.error('Error adding send group:', error);
    res.status(500).json({ error: 'Failed to add send group' });
  }
});

// API endpoint to remove a group from send list
router.delete('/send/:groupId', (req, res) => {
  try {
    const { groupId } = req.params;
      const { instanceId = 'default' } = req.query;
    whatsappClient.removeSendGroup(groupId, instanceId);
    res.json({ send: whatsappClient.getSendGroups(instanceId) });
  } catch (error) {
    console.error('Error removing send group:', error);
    res.status(500).json({ error: 'Failed to remove send group' });
  }
});

// API endpoint to get error stats
router.get('/errors', (req, res) => {
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
});

// API endpoint to clear error history
router.delete('/errors', (req, res) => {
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
});

// API endpoint to get metrics
router.get('/metrics', (req, res) => {
  try {
    const { instanceId = 'default' } = req.query;
    const metrics = whatsappClient.getMetrics(instanceId);
    res.json({ metrics });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// API endpoint to reset metrics
router.delete('/metrics', (req, res) => {
  try {
    const { instanceId = 'default' } = req.body;
    whatsappClient.resetMetrics(instanceId);
    res.json({ success: true, message: `Metrics reset for instance ${instanceId}` });
  } catch (error) {
    console.error('Error resetting metrics:', error);
    res.status(500).json({ error: 'Failed to reset metrics' });
  }
});

// API endpoint to clear rate limit warnings
router.delete('/metrics/rate-limits', (req, res) => {
  try {
    const { instanceId = 'default' } = req.body;
    whatsappClient.clearRateLimitWarnings(instanceId);
    res.json({ success: true, message: `Rate limit warnings cleared for instance ${instanceId}` });
  } catch (error) {
    console.error('Error clearing rate limit warnings:', error);
    res.status(500).json({ error: 'Failed to clear rate limit warnings' });
  }
});

module.exports = router;
