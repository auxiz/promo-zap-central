
/**
 * State manager for WhatsApp
 * Handles getting and setting state for WhatsApp instances
 */

const instanceModel = require('../models/instance');

// Get QR code for a specific instance
const getQRCode = (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  return instance.qrCodeDataUrl;
};

// Get connection status for a specific instance
const getConnectionStatus = (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  return { 
    isConnected: instance.isConnected, 
    device: instance.device,
    // Include reconnection status
    reconnection: instance.sessionData?.isReconnecting ? {
      attempts: instance.sessionData.reconnectAttempts,
      max: instance.sessionData.maxReconnectAttempts,
      isActive: instance.sessionData.isReconnecting
    } : null
  };
};

// Get connection time for a specific instance
const getConnectionTime = (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  return instance.connectionTime;
};

// Get disconnection time for a specific instance
const getDisconnectionTime = (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  return instance.disconnectionTime;
};

// Get chats for a specific instance
const getChats = async (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  if (!instance.client || !instance.isConnected) {
    return [];
  }
  return await instance.client.getChats();
};

// Group management functions
const getMonitoredGroups = (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  return instance.monitoredGroups;
};

const getSendGroups = (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  return instance.sendGroups;
};

const setMonitoredGroups = (groups, instanceId = 'default') => { 
  const instance = instanceModel.getInstance(instanceId);
  instance.monitoredGroups = groups; 
};

const setSendGroups = (groups, instanceId = 'default') => { 
  const instance = instanceModel.getInstance(instanceId);
  instance.sendGroups = groups; 
};

const addMonitoredGroup = (groupId, instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  if (!instance.monitoredGroups.includes(groupId)) {
    instance.monitoredGroups.push(groupId);
  }
};

const removeMonitoredGroup = (groupId, instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  instance.monitoredGroups = instance.monitoredGroups.filter(id => id !== groupId);
};

const addSendGroup = (groupId, instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  if (!instance.sendGroups.includes(groupId)) {
    instance.sendGroups.push(groupId);
  }
};

const removeSendGroup = (groupId, instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  instance.sendGroups = instance.sendGroups.filter(id => id !== groupId);
};

// Get session information for an instance
const getSessionInfo = (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  return {
    lastActive: instance.sessionData?.lastActive || null,
    reconnectAttempts: instance.sessionData?.reconnectAttempts || 0,
    maxReconnectAttempts: instance.sessionData?.maxReconnectAttempts || 5,
    isReconnecting: instance.sessionData?.isReconnecting || false,
    reconnectDelay: instance.sessionData?.reconnectDelay || 5000
  };
};

module.exports = {
  getQRCode,
  getConnectionStatus,
  getConnectionTime,
  getDisconnectionTime,
  getChats,
  getMonitoredGroups,
  getSendGroups,
  setMonitoredGroups,
  setSendGroups,
  addMonitoredGroup,
  removeMonitoredGroup,
  addSendGroup,
  removeSendGroup,
  getSessionInfo
};
