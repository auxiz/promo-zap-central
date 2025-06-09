
/**
 * WhatsApp QR Code Controller
 * Handles QR code generation and retrieval
 */

const whatsappClient = require('../../whatsapp/client');
const circuitBreaker = require('../../whatsapp/services/connection/circuitBreaker');

// Get QR code for instance
const getQRCode = (req, res) => {
  const { instanceId = 'default' } = req.query;
  
  // Check circuit breaker status
  const circuitStatus = circuitBreaker.getCircuitStatus(instanceId);
  if (circuitStatus.state === 'OPEN') {
    return res.json({ 
      qr: null,
      error: 'Connection temporarily blocked due to repeated failures'
    });
  }
  
  res.json({ qr: whatsappClient.getQRCode(instanceId) });
};

module.exports = {
  getQRCode
};
