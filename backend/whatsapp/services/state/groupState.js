
/**
 * Group State Manager for WhatsApp
 * Handles getting and setting group information for WhatsApp instances
 */

const instanceModel = require('../../models/instance');

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
  getMonitoredGroups,
  getSendGroups,
  setMonitoredGroups,
  setSendGroups,
  addMonitoredGroup,
  removeMonitoredGroup,
  addSendGroup,
  removeSendGroup
};
