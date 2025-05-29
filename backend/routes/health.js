
const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      whatsapp: 'available',
      shopee: 'available'
    }
  };
  
  res.json(health);
});

module.exports = router;
