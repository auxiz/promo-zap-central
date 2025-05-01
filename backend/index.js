
const express = require('express');
const cors = require('cors');
const { Client } = require('whatsapp-web.js');
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

// Initialize WhatsApp client with LocalAuth
const client = new Client({
  authStrategy: new (require('whatsapp-web.js')).LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
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

// Start the server
app.listen(port, () => {
  console.log(`WhatsApp backend server running on port ${port}`);
});
