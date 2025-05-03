
const express = require('express');
const router = express.Router();

// Import all route modules
const credentialsRoutes = require('./credentials');
const authRoutes = require('./auth');
const shopRoutes = require('./shop');
const affiliateRoutes = require('./affiliate');
const manualLoginRoutes = require('./manual-login');

// Register all route modules
router.use('/credentials', credentialsRoutes);
router.use('/auth', authRoutes);
router.use('/shop', shopRoutes);
router.use('/affiliate', affiliateRoutes);
router.use('/', manualLoginRoutes); // This contains manual-login and login-status endpoints

module.exports = router;
