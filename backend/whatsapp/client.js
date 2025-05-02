
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

// Initialize variables to store state
let qrCodeDataUrl = null;
let isConnected = false;
let device = null;
let connectionTime = null;
let monitoredGroups = []; // Store monitored group IDs
let sendGroups = []; // Store send group IDs

// Initialize WhatsApp client with LocalAuth and specific puppeteer options
const client = new Client({
  authStrategy: new LocalAuth(),
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
  console.log(`QR generated: ${qrString}`);
  
  try {
    // Convert QR string to data URL
    qrCodeDataUrl = await qrcode.toDataURL(qrString);
  } catch (error) {
    console.error('Error generating QR code:', error);
    qrCodeDataUrl = null;
  }
});

// Event handler for ready state
client.on('ready', () => {
  isConnected = true;
  device = client.info.wid.user;
  connectionTime = Date.now();
  console.log(`WhatsApp connected with device: ${device}`);
  qrCodeDataUrl = null; // Clear QR code after successful connection
});

// Event handler for disconnected state
client.on('disconnected', () => {
  isConnected = false;
  device = null;
  connectionTime = null;
  console.log('WhatsApp disconnected');
});

// Initialize WhatsApp client
const initializeClient = () => {
  client.initialize().catch(error => {
    console.error('Error initializing WhatsApp client:', error);
  });
};

// Call initialization
initializeClient();

// Getters and setters for state
const getQRCode = () => qrCodeDataUrl;
const getConnectionStatus = () => ({ isConnected, device });
const getConnectionTime = () => connectionTime;
const getMonitoredGroups = () => monitoredGroups;
const getSendGroups = () => sendGroups;
const setMonitoredGroups = (groups) => { monitoredGroups = groups; };
const setSendGroups = (groups) => { sendGroups = groups; };
const addMonitoredGroup = (groupId) => {
  if (!monitoredGroups.includes(groupId)) {
    monitoredGroups.push(groupId);
  }
};
const removeMonitoredGroup = (groupId) => {
  monitoredGroups = monitoredGroups.filter(id => id !== groupId);
};
const addSendGroup = (groupId) => {
  if (!sendGroups.includes(groupId)) {
    sendGroups.push(groupId);
  }
};
const removeSendGroup = (groupId) => {
  sendGroups = sendGroups.filter(id => id !== groupId);
};

module.exports = {
  client,
  getQRCode,
  getConnectionStatus,
  getConnectionTime,
  getMonitoredGroups,
  getSendGroups,
  setMonitoredGroups,
  setSendGroups,
  addMonitoredGroup,
  removeMonitoredGroup,
  addSendGroup,
  removeSendGroup,
  initializeClient
};
