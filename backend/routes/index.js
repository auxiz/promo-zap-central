
const express = require('express');
const router = express.Router();

// Import all route modules
const whatsappRoutes = require('./whatsapp');
const shopeeRoutes = require('./shopee');
const activityModule = require('./activity');
const activityRoutes = activityModule.router; // Get router from activity module
const { addActivity } = activityModule; // Import the addActivity function from the module
const templatesRoutes = require('./templates');
const promozapRoutes = require('./promozap');

// Register all route modules
router.use('/whatsapp', whatsappRoutes);
router.use('/shopee', shopeeRoutes);
router.use('/activity', activityRoutes);
router.use('/templates', templatesRoutes);
router.use('/v1', promozapRoutes);

// Expose addActivity for other modules to use
router.addActivity = addActivity;

module.exports = router;
