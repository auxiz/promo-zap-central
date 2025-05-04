
/**
 * Client factory for WhatsApp
 * Handles the creation and initialization of WhatsApp web.js clients
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const { generateClientOptions } = require('./client/clientConfig');
const { attachEventHandlers } = require('./client/eventHandlers');
const instanceModel = require('../models/instance');

// Function to create and initialize a WhatsApp client for a specific instance
const createClient = (instanceId) => {
  const instance = instanceModel.getInstance(instanceId);
  
  // Get client configuration
  const clientOptions = generateClientOptions(instanceId);
  
  // Initialize WhatsApp client with generated options
  const client = new Client({
    authStrategy: new LocalAuth({ 
      clientId: clientOptions.authStrategy.options.clientId, 
      dataPath: clientOptions.authStrategy.options.dataPath
    }),
    puppeteer: clientOptions.puppeteer,
    qrTimeoutMs: clientOptions.qrTimeoutMs,
    authTimeoutMs: clientOptions.authTimeoutMs,
    takeoverOnConflict: clientOptions.takeoverOnConflict,
    takeoverTimeoutMs: clientOptions.takeoverTimeoutMs
  });

  // Attach event handlers to client
  attachEventHandlers(client, instanceId);
  
  return client;
};

module.exports = {
  createClient
};
