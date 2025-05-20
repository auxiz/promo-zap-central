
/**
 * Legacy shopee router - now modularized
 * This file is kept as a reference and redirects to the new modular structure
 * All functionality has been moved to /routes/shopee/ directory
 */
const express = require('express');
const router = express.Router();
const shopeeRoutes = require('./shopee/index');

// Use the new modular shopee routes
router.use('/', shopeeRoutes);

module.exports = router;
