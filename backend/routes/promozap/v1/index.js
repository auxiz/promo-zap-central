
const express = require('express');
const router = express.Router();
const shopeeRoutes = require('./shopee');

// Register Shopee routes
router.use('/shopee', shopeeRoutes);

module.exports = router;
