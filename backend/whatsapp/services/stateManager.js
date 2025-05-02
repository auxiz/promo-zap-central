
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
    device: instance.device 
  };
};

// Get connection time for a specific instance
const getConnectionTime = (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  return instance.connectionTime;
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

module.exports = {
  getQRCode,
  getConnectionStatus,
  getConnectionTime,
  getChats,
  getMonitoredGroups,
  getSendGroups,
  setMonitoredGroups,
  setSendGroups,
  addMonitoredGroup,
  removeMonitoredGroup,
  addSendGroup,
  removeSendGroup
};
