
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

// Store instances state
const instances = {
  default: {
    qrCodeDataUrl: null,
    isConnected: false,
    device: null,
    connectionTime: null,
    monitoredGroups: [],
    sendGroups: [],
    client: null
  }
};

// Function to create and initialize a WhatsApp client for a specific instance
const createClient = (instanceId) => {
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
      instances[instanceId].qrCodeDataUrl = await qrcode.toDataURL(qrString);
    } catch (error) {
      console.error(`Error generating QR code for instance ${instanceId}:`, error);
      instances[instanceId].qrCodeDataUrl = null;
    }
  });

  // Event handler for ready state
  client.on('ready', () => {
    instances[instanceId].isConnected = true;
    instances[instanceId].device = client.info.wid.user;
    instances[instanceId].connectionTime = Date.now();
    console.log(`WhatsApp connected for instance ${instanceId} with device: ${instances[instanceId].device}`);
    instances[instanceId].qrCodeDataUrl = null; // Clear QR code after successful connection
  });

  // Event handler for disconnected state
  client.on('disconnected', () => {
    instances[instanceId].isConnected = false;
    instances[instanceId].device = null;
    instances[instanceId].connectionTime = null;
    console.log(`WhatsApp disconnected for instance ${instanceId}`);
  });

  return client;
};

// Initialize an instance if it doesn't exist
const ensureInstance = (instanceId) => {
  if (!instances[instanceId]) {
    instances[instanceId] = {
      qrCodeDataUrl: null,
      isConnected: false,
      device: null,
      connectionTime: null,
      monitoredGroups: [],
      sendGroups: [],
      client: null
    };
  }
};

// Initialize WhatsApp client for a specific instance
const initializeClient = (instanceId = 'default') => {
  ensureInstance(instanceId);
  
  // If client already exists, return it
  if (instances[instanceId].client) {
    return instances[instanceId].client;
  }
  
  // Create and initialize new client
  const client = createClient(instanceId);
  instances[instanceId].client = client;
  
  client.initialize().catch(error => {
    console.error(`Error initializing WhatsApp client for instance ${instanceId}:`, error);
  });
  
  return client;
};

// Destroy WhatsApp client for a specific instance
const destroyClient = async (instanceId = 'default') => {
  ensureInstance(instanceId);
  
  if (instances[instanceId].client) {
    try {
      await instances[instanceId].client.destroy();
      instances[instanceId].client = null;
      instances[instanceId].isConnected = false;
      instances[instanceId].device = null;
      instances[instanceId].connectionTime = null;
      instances[instanceId].qrCodeDataUrl = null;
      console.log(`Client for instance ${instanceId} destroyed successfully`);
      return true;
    } catch (error) {
      console.error(`Error destroying client for instance ${instanceId}:`, error);
      return false;
    }
  }
  
  return true; // No client to destroy
};

// Clear QR code for a specific instance
const clearQRCode = (instanceId = 'default') => {
  ensureInstance(instanceId);
  instances[instanceId].qrCodeDataUrl = null;
};

// Getters and setters for state
const getQRCode = (instanceId = 'default') => {
  ensureInstance(instanceId);
  return instances[instanceId].qrCodeDataUrl;
};

const getConnectionStatus = (instanceId = 'default') => {
  ensureInstance(instanceId);
  return { 
    isConnected: instances[instanceId].isConnected, 
    device: instances[instanceId].device 
  };
};

const getConnectionTime = (instanceId = 'default') => {
  ensureInstance(instanceId);
  return instances[instanceId].connectionTime;
};

const getChats = async (instanceId = 'default') => {
  ensureInstance(instanceId);
  if (!instances[instanceId].client || !instances[instanceId].isConnected) {
    return [];
  }
  return await instances[instanceId].client.getChats();
};

const getMonitoredGroups = (instanceId = 'default') => {
  ensureInstance(instanceId);
  return instances[instanceId].monitoredGroups;
};

const getSendGroups = (instanceId = 'default') => {
  ensureInstance(instanceId);
  return instances[instanceId].sendGroups;
};

const setMonitoredGroups = (groups, instanceId = 'default') => { 
  ensureInstance(instanceId);
  instances[instanceId].monitoredGroups = groups; 
};

const setSendGroups = (groups, instanceId = 'default') => { 
  ensureInstance(instanceId);
  instances[instanceId].sendGroups = groups; 
};

const addMonitoredGroup = (groupId, instanceId = 'default') => {
  ensureInstance(instanceId);
  if (!instances[instanceId].monitoredGroups.includes(groupId)) {
    instances[instanceId].monitoredGroups.push(groupId);
  }
};

const removeMonitoredGroup = (groupId, instanceId = 'default') => {
  ensureInstance(instanceId);
  instances[instanceId].monitoredGroups = instances[instanceId].monitoredGroups.filter(id => id !== groupId);
};

const addSendGroup = (groupId, instanceId = 'default') => {
  ensureInstance(instanceId);
  if (!instances[instanceId].sendGroups.includes(groupId)) {
    instances[instanceId].sendGroups.push(groupId);
  }
};

const removeSendGroup = (groupId, instanceId = 'default') => {
  ensureInstance(instanceId);
  instances[instanceId].sendGroups = instances[instanceId].sendGroups.filter(id => id !== groupId);
};

// Initialize default instance
initializeClient('default');

module.exports = {
  initializeClient,
  destroyClient,
  clearQRCode,
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
