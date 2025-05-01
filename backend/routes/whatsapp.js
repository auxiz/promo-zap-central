
const express = require('express');
const router = express.Router();
const whatsappClient = require('../whatsapp/client');

// API endpoint to get QR code
router.get('/qrcode', (req, res) => {
  res.json({ qr: whatsappClient.getQRCode() });
});

// API endpoint to get connection status
router.get('/status', (req, res) => {
  const { isConnected, device } = whatsappClient.getConnectionStatus();
  
  let status = 'DISCONNECTED';
  if (isConnected) {
    status = 'CONNECTED';
  } else if (whatsappClient.getQRCode()) {
    status = 'PENDING';
  }
  
  res.json({ status, device });
});

// API endpoint to disconnect WhatsApp
router.post('/disconnect', async (req, res) => {
  try {
    const { isConnected } = whatsappClient.getConnectionStatus();
    
    if (isConnected) {
      await whatsappClient.client.destroy();
      console.log('WhatsApp client destroyed');
    }
    
    // Reinitialize the client
    setTimeout(() => {
      whatsappClient.initializeClient();
    }, 1000);
    
    res.json({ status: 'DISCONNECTED' });
  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error);
    res.status(500).json({ error: 'Failed to disconnect WhatsApp' });
  }
});

// API endpoint to get all WhatsApp groups
router.get('/groups', async (req, res) => {
  try {
    const { isConnected } = whatsappClient.getConnectionStatus();
    
    if (!isConnected) {
      return res.status(400).json({ error: 'WhatsApp not connected' });
    }

    const chats = await whatsappClient.client.getChats();
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
router.get('/monitored', (req, res) => {
  res.json({ monitored: whatsappClient.getMonitoredGroups() });
});

// API endpoint to add a group to monitored
router.post('/monitored', (req, res) => {
  try {
    const { groupId } = req.body;

    if (!groupId) {
      return res.status(400).json({ error: 'Group ID is required' });
    }

    whatsappClient.addMonitoredGroup(groupId);
    res.json({ monitored: whatsappClient.getMonitoredGroups() });
  } catch (error) {
    console.error('Error adding monitored group:', error);
    res.status(500).json({ error: 'Failed to add monitored group' });
  }
});

// API endpoint to remove a group from monitored
router.delete('/monitored/:groupId', (req, res) => {
  try {
    const { groupId } = req.params;
    whatsappClient.removeMonitoredGroup(groupId);
    res.json({ monitored: whatsappClient.getMonitoredGroups() });
  } catch (error) {
    console.error('Error removing monitored group:', error);
    res.status(500).json({ error: 'Failed to remove monitored group' });
  }
});

// API endpoint to get send groups
router.get('/send', (req, res) => {
  res.json({ send: whatsappClient.getSendGroups() });
});

// API endpoint to add a group to send list
router.post('/send', (req, res) => {
  try {
    const { groupId } = req.body;

    if (!groupId) {
      return res.status(400).json({ error: 'Group ID is required' });
    }

    whatsappClient.addSendGroup(groupId);
    res.json({ send: whatsappClient.getSendGroups() });
  } catch (error) {
    console.error('Error adding send group:', error);
    res.status(500).json({ error: 'Failed to add send group' });
  }
});

// API endpoint to remove a group from send list
router.delete('/send/:groupId', (req, res) => {
  try {
    const { groupId } = req.params;
    whatsappClient.removeSendGroup(groupId);
    res.json({ send: whatsappClient.getSendGroups() });
  } catch (error) {
    console.error('Error removing send group:', error);
    res.status(500).json({ error: 'Failed to remove send group' });
  }
});

module.exports = router;
