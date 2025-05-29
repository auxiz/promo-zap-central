
// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://84c94cc0-176b-4da2-bd4c-8ad76c953c8d.lovableproject.com'
  ],
  credentials: true
}));
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

// Start the server - bind to all network interfaces (0.0.0.0)
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server is running on ${HOST}:${PORT}`);
  console.log(`📡 Server accessible at http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(`🔗 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`❤️  Health check at http://localhost:${PORT}/api/health`);
  
  // Log environment info
  logger.info('Server started successfully', {
    port: PORT,
    host: HOST,
    environment: process.env.NODE_ENV || 'development'
  });
});
