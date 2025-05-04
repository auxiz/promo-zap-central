
const express = require('express');
const router = express.Router();

// Import all route modules
const credentialsRoutes = require('./credentials');
const shopRoutes = require('./shop');
const affiliateRoutes = require('./affiliate');

// Register all route modules
router.use('/credentials', credentialsRoutes);
router.use('/shop', shopRoutes);
router.use('/affiliate', affiliateRoutes);

module.exports = router;
