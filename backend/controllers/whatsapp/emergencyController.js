
/**
 * WhatsApp Emergency Controller
 * Handles emergency operations for admin use
 */

// Emergency stop endpoint (for admin use)
const emergencyStop = async (req, res) => {
  try {
    const reconnectionManager = require('../../whatsapp/services/connection/reconnectionManager');
    reconnectionManager.emergencyStopReconnections();
    
    res.json({ 
      status: 'SUCCESS',
      message: 'Emergency stop executed - all reconnections halted'
    });
  } catch (error) {
    console.error('Error executing emergency stop:', error);
    res.status(500).json({ error: 'Failed to execute emergency stop' });
  }
};

module.exports = {
  emergencyStop
};
