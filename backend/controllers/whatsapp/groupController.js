
/**
 * WhatsApp Group Controller
 * Handles all group-related API endpoints for WhatsApp
 */

const whatsappClient = require('../../whatsapp/client');

// Get all WhatsApp groups
const getAllGroups = async (req, res) => {
  try {
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
};

// Get monitored groups count
const getMonitoredCount = (req, res) => {
  const { instanceId = 'default' } = req.query;
  const monitoredGroups = whatsappClient.getMonitoredGroups(instanceId);
  const { isConnected } = whatsappClient.getConnectionStatus(instanceId);
  
  res.json({
    total: monitoredGroups.length,
    active: isConnected ? monitoredGroups.length : 0
  });
};

// Get send groups count
const getSendCount = (req, res) => {
  const { instanceId = 'default' } = req.query;
  const sendGroups = whatsappClient.getSendGroups(instanceId);
  const { isConnected } = whatsappClient.getConnectionStatus(instanceId);
  
  res.json({
    total: sendGroups.length,
    active: isConnected ? sendGroups.length : 0
  });
};

// Get monitored groups
const getMonitoredGroups = (req, res) => {
  const { instanceId = 'default' } = req.query;
  res.json({ monitored: whatsappClient.getMonitoredGroups(instanceId) });
};

// Add a group to monitored
const addMonitoredGroup = (req, res) => {
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
};

// Remove a group from monitored
const removeMonitoredGroup = (req, res) => {
  try {
    const { groupId } = req.params;
    const { instanceId = 'default' } = req.query;
    whatsappClient.removeMonitoredGroup(groupId, instanceId);
    res.json({ monitored: whatsappClient.getMonitoredGroups(instanceId) });
  } catch (error) {
    console.error('Error removing monitored group:', error);
    res.status(500).json({ error: 'Failed to remove monitored group' });
  }
};

// Get send groups
const getSendGroups = (req, res) => {
  const { instanceId = 'default' } = req.query;
  res.json({ send: whatsappClient.getSendGroups(instanceId) });
};

// Add a group to send list
const addSendGroup = (req, res) => {
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
};

// Remove a group from send list
const removeSendGroup = (req, res) => {
  try {
    const { groupId } = req.params;
    const { instanceId = 'default' } = req.query;
    whatsappClient.removeSendGroup(groupId, instanceId);
    res.json({ send: whatsappClient.getSendGroups(instanceId) });
  } catch (error) {
    console.error('Error removing send group:', error);
    res.status(500).json({ error: 'Failed to remove send group' });
  }
};

module.exports = {
  getAllGroups,
  getMonitoredCount,
  getSendCount,
  getMonitoredGroups,
  addMonitoredGroup,
  removeMonitoredGroup,
  getSendGroups,
  addSendGroup,
  removeSendGroup
};
