
const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

// Initialize express app
const app = express();
const port = 4000;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Initialize variables to store state
let qrCodeDataUrl = null;
let isConnected = false;
let device = null;
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
  console.log(`WhatsApp connected with device: ${device}`);
  qrCodeDataUrl = null; // Clear QR code after successful connection
});

// Event handler for disconnected state
client.on('disconnected', () => {
  isConnected = false;
  device = null;
  console.log('WhatsApp disconnected');
});

// Initialize WhatsApp client
client.initialize().catch(error => {
  console.error('Error initializing WhatsApp client:', error);
});

// API endpoint to get QR code
app.get('/api/whatsapp/qrcode', (req, res) => {
  res.json({ qr: qrCodeDataUrl });
});

// API endpoint to get connection status
app.get('/api/whatsapp/status', (req, res) => {
  let status = 'DISCONNECTED';
  
  if (isConnected) {
    status = 'CONNECTED';
  } else if (qrCodeDataUrl) {
    status = 'PENDING';
  }
  
  res.json({ status, device });
});

// API endpoint to disconnect WhatsApp
app.post('/api/whatsapp/disconnect', async (req, res) => {
  try {
    if (isConnected) {
      await client.destroy();
      console.log('WhatsApp client destroyed');
    }
    
    // Reset state
    isConnected = false;
    device = null;
    qrCodeDataUrl = null;
    
    // Reinitialize the client
    setTimeout(() => {
      client.initialize().catch(error => {
        console.error('Error reinitializing WhatsApp client:', error);
      });
    }, 1000);
    
    res.json({ status: 'DISCONNECTED' });
  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error);
    res.status(500).json({ error: 'Failed to disconnect WhatsApp' });
  }
});

// New API endpoint to get all WhatsApp groups
app.get('/api/whatsapp/groups', async (req, res) => {
  try {
    if (!isConnected) {
      return res.status(400).json({ error: 'WhatsApp not connected' });
    }

    const chats = await client.getChats();
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
});

// API endpoint to get monitored groups
app.get('/api/whatsapp/monitored', (req, res) => {
  res.json({ monitored: monitoredGroups });
});

// API endpoint to add a group to monitored
app.post('/api/whatsapp/monitored', (req, res) => {
  try {
    const { groupId } = req.body;

    if (!groupId) {
      return res.status(400).json({ error: 'Group ID is required' });
    }

    if (!monitoredGroups.includes(groupId)) {
      monitoredGroups.push(groupId);
    }

    res.json({ monitored: monitoredGroups });
  } catch (error) {
    console.error('Error adding monitored group:', error);
    res.status(500).json({ error: 'Failed to add monitored group' });
  }
});

// API endpoint to remove a group from monitored
app.delete('/api/whatsapp/monitored/:groupId', (req, res) => {
  try {
    const { groupId } = req.params;
    monitoredGroups = monitoredGroups.filter(id => id !== groupId);
    res.json({ monitored: monitoredGroups });
  } catch (error) {
    console.error('Error removing monitored group:', error);
    res.status(500).json({ error: 'Failed to remove monitored group' });
  }
});

// API endpoint to get send groups
app.get('/api/whatsapp/send', (req, res) => {
  res.json({ send: sendGroups });
});

// API endpoint to add a group to send list
app.post('/api/whatsapp/send', (req, res) => {
  try {
    const { groupId } = req.body;

    if (!groupId) {
      return res.status(400).json({ error: 'Group ID is required' });
    }

    if (!sendGroups.includes(groupId)) {
      sendGroups.push(groupId);
    }

    res.json({ send: sendGroups });
  } catch (error) {
    console.error('Error adding send group:', error);
    res.status(500).json({ error: 'Failed to add send group' });
  }
});

// API endpoint to remove a group from send list
app.delete('/api/whatsapp/send/:groupId', (req, res) => {
  try {
    const { groupId } = req.params;
    sendGroups = sendGroups.filter(id => id !== groupId);
    res.json({ send: sendGroups });
  } catch (error) {
    console.error('Error removing send group:', error);
    res.status(500).json({ error: 'Failed to remove send group' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`WhatsApp backend server running on port ${port}`);
});
