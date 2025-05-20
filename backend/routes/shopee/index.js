
const express = require('express');
const router = express.Router();

// Import all route modules
const credentialsRoutes = require('./credentials');
const shopRoutes = require('./shop');
const affiliateRoutes = require('./affiliate');
const authRoutes = require('./auth');
const connectRoutes = require('./connect');
const manualLoginRoutes = require('./manual-login');

// Register all route modules
router.use('/credentials', credentialsRoutes);
router.use('/shop', shopRoutes);
router.use('/affiliate', affiliateRoutes);
router.use('/auth', authRoutes);
router.use('/connect', connectRoutes);
router.use('/', manualLoginRoutes); // These endpoints are directly on the /shopee path

module.exports = router;
