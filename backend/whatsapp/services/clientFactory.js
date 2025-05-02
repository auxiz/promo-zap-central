
/**
 * Client factory for WhatsApp
 * Handles the creation and initialization of WhatsApp web.js clients
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const instanceModel = require('../models/instance');
const errorTracker = require('./errorTracker');
const metricsTracker = require('./metricsTracker');

// Function to create and initialize a WhatsApp client for a specific instance
const createClient = (instanceId) => {
  const instance = instanceModel.getInstance(instanceId);
  
  // Initialize WhatsApp client with LocalAuth and specific puppeteer options
  const client = new Client({
    authStrategy: new LocalAuth({ clientId: instanceId }),
    puppeteer: {
      executablePath: '/usr/bin/chromium',
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-gpu'
      ]
    }
  });

  // Event handler for QR code generation
  client.on('qr', async (qrString) => {
    console.log(`QR generated for instance ${instanceId}: ${qrString}`);
    
    try {
      // Convert QR string to data URL
      instance.qrCodeDataUrl = await qrcode.toDataURL(qrString);
      // Reset retry count on successful QR code generation
      errorTracker.resetRetryAttempts(instanceId);
    } catch (error) {
      errorTracker.trackError(
        instanceId, 
        'QR_CODE', 
        `Error generating QR code for instance ${instanceId}`, 
        error
      );
      instance.qrCodeDataUrl = null;
    }
  });

  // Event handler for ready state
  client.on('ready', () => {
    instance.isConnected = true;
    instance.device = client.info.wid.user;
    instance.connectionTime = Date.now();
    console.log(`WhatsApp connected for instance ${instanceId} with device: ${instance.device}`);
    instance.qrCodeDataUrl = null; // Clear QR code after successful connection
    errorTracker.resetRetryAttempts(instanceId);
    
    // Record connection started for metrics
    metricsTracker.recordConnectionStart(instanceId);
  });

  // Event handler for disconnected state
  client.on('disconnected', (reason) => {
    instance.isConnected = false;
    instance.device = null;
    
    // Record connection ended for metrics
    metricsTracker.recordConnectionEnd(instanceId);
    
    // Record the disconnection time
    instance.connectionTime = null;
    console.log(`WhatsApp disconnected for instance ${instanceId}. Reason: ${reason || 'Unknown'}`);
    
    if (reason) {
      errorTracker.trackError(
        instanceId,
        'DISCONNECTION',
        `WhatsApp disconnected: ${reason}`,
        { reason }
      );
    }
  });
  
  // Error handler
  client.on('auth_failure', (error) => {
    errorTracker.trackError(
      instanceId,
      'CONNECTION',
      'Authentication failure',
      error
    );
  });
  
  // Message handling for metrics
  client.on('message', () => {
    metricsTracker.recordMessageReceived(instanceId);
  });
  
  // Handling for rate limiting and throttling
  client.on('message_ack', (msg, ack) => {
    // Message sending has been acknowledged - update metrics
    if (ack === 1 || ack === 2 || ack === 3) {
      metricsTracker.recordMessageSent(instanceId);
    } else if (ack === -1) {
      metricsTracker.recordMessageFailed(instanceId);
      
      // Check for potential rate limiting
      if (msg.body && msg.body.includes("can't send messages")) {
        metricsTracker.recordRateLimitWarning(
          instanceId, 
          "WhatsApp rate limit detected", 
          { messageId: msg.id._serialized, error: "Can't send messages" }
        );
      }
    }
  });

  return client;
};

module.exports = {
  createClient
};
