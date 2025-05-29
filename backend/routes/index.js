
const express = require('express');
const router = express.Router();

// Import route modules
const whatsappRoutes = require('./whatsapp');
const shopeeRoutes = require('./shopee');
const promozapRoutes = require('./promozap');
const healthRoutes = require('./health');

// Register routes
router.use('/whatsapp', whatsappRoutes);
router.use('/shopee', shopeeRoutes);
router.use('/promozap', promozapRoutes);
router.use('/health', healthRoutes);

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Promozap Central API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      whatsapp: '/api/whatsapp',
      shopee: '/api/shopee',
      promozap: '/api/promozap'
    }
  });
});

module.exports = router;
