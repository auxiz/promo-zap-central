
/**
 * Client configuration for WhatsApp
 * Optimized for proper QR scanning while maintaining resource efficiency
 */

// Generate client configuration options with extended timeouts for QR scanning
const generateClientOptions = (instanceId) => {
  return {
    authStrategy: {
      type: 'LocalAuth',
      options: { 
        clientId: instanceId, 
        dataPath: `./whatsapp-sessions/${instanceId}`
      }
    },
    puppeteer: {
      executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium' || '/usr/bin/chromium-browser',
      headless: true,
      // Optimized args for minimal resource usage while allowing proper QR scanning
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-gpu',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        // Memory optimization
        '--memory-pressure-off',
        '--max_old_space_size=512', // Limit to 512MB
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        // Reduce CPU usage
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-sync',
        '--metrics-recording-only',
        '--no-report-upload'
      ],
      timeout: 300000, // 5 minutes - proper time for QR scanning
      defaultViewport: {
        width: 800, // Smaller viewport for resource efficiency
        height: 600
      }
    },
    // Extended timeouts for comfortable QR scanning experience
    qrTimeoutMs: 300000, // 5 minutes for QR code scanning
    authTimeoutMs: 300000, // 5 minutes for authentication
    takeoverOnConflict: true,
    takeoverTimeoutMs: 30000, // 30 seconds for takeover
    // Additional resource limits
    restartOnCrash: false, // Don't auto-restart to prevent loops
    killProcessOnBrowserClose: true
  };
};

module.exports = {
  generateClientOptions
};
