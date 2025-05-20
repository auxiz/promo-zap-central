
const express = require('express');
const router = express.Router();
const shopeeRoutes = require('./shopee');
const shopeeDirectRoutes = require('./shopee-direct');

// Register Shopee routes
router.use('/shopee', shopeeRoutes);
router.use('/shopee', shopeeDirectRoutes);

module.exports = router;
