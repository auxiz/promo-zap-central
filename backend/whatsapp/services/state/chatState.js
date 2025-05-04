
/**
 * Chat State Manager for WhatsApp
 * Handles getting chat information for WhatsApp instances
 */

const instanceModel = require('../../models/instance');

// Get chats for a specific instance
const getChats = async (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  if (!instance.client || !instance.isConnected) {
    return [];
  }
  return await instance.client.getChats();
};

module.exports = {
  getChats
};
