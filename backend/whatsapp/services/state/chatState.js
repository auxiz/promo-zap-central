
/**
 * Chat State Manager for WhatsApp
 * Handles getting chat information for WhatsApp instances with proper timeouts
 */

const instanceModel = require('../../models/instance');

// Get chats for a specific instance with extended timeout for group loading
const getChats = async (instanceId = 'default') => {
  const instance = instanceModel.getInstance(instanceId);
  if (!instance.client || !instance.isConnected) {
    console.log(`Instance ${instanceId} not connected, cannot fetch chats`);
    return [];
  }

  try {
    console.log(`Fetching chats for instance ${instanceId}...`);
    
    // Add timeout wrapper for getChats operation
    const chatsPromise = instance.client.getChats();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Chat loading timeout')), 30000); // 30 seconds timeout
    });
    
    const chats = await Promise.race([chatsPromise, timeoutPromise]);
    
    console.log(`Successfully fetched ${chats.length} chats for instance ${instanceId}`);
    return chats;
  } catch (error) {
    console.error(`Error fetching chats for instance ${instanceId}:`, error);
    
    // Retry once after a short delay
    try {
      console.log(`Retrying chat fetch for instance ${instanceId} after error...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      
      const retryChatsPromise = instance.client.getChats();
      const retryTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Chat loading retry timeout')), 15000); // 15 seconds on retry
      });
      
      const chats = await Promise.race([retryChatsPromise, retryTimeoutPromise]);
      console.log(`Retry successful: fetched ${chats.length} chats for instance ${instanceId}`);
      return chats;
    } catch (retryError) {
      console.error(`Retry failed for fetching chats for instance ${instanceId}:`, retryError);
      return [];
    }
  }
};

module.exports = {
  getChats
};
