const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request ID tracking for logs
app.use(logger.requestMiddleware);

// Log incoming requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, { 
    requestId: req.requestId, 
    ip: req.ip 
  });
  next();
});

// Register all API routes
app.use('/api', routes);

// Global error handler
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, { 
    error: err, 
    requestId: req.requestId,
    path: req.path
  });
  
  res.status(500).json({ 
    status: 'error',
    message: 'Internal server error',
    requestId: req.requestId
  });
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
