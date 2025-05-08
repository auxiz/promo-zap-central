
const express = require('express');
const router = express.Router();

// Import all route modules
const whatsappRoutes = require('./whatsapp');
const shopeeRoutes = require('./shopee');
const activityRoutes = require('./activity');
const templatesRoutes = require('./templates');
const promozapRoutes = require('./promozap');

// Register all route modules
router.use('/whatsapp', whatsappRoutes);
router.use('/shopee', shopeeRoutes);
router.use('/activity', activityRoutes);
router.use('/templates', templatesRoutes);
router.use('/v1', promozapRoutes);

module.exports = router;
