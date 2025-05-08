
/**
 * Main router for Shopee affiliate routes
 */
const express = require('express');
const router = express.Router();

// Import sub-routers
const linkRoutes = require('./linkRoutes');
const performanceRoutes = require('./performanceRoutes');

// Register routes
router.use('/convert', linkRoutes);
router.use('/performance', performanceRoutes);

module.exports = router;
