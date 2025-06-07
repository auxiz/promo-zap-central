
/**
 * Client configuration for WhatsApp
 * Optimized for low resource usage on VPS
 */

// Generate client configuration options with resource optimization
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
      // Optimized args for minimal resource usage
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
      timeout: 60000, // Reduced to 1 minute
      defaultViewport: {
        width: 800, // Smaller viewport
        height: 600
      }
    },
    // Reduced timeouts to prevent hanging
    qrTimeoutMs: 30000, // 30 seconds
    authTimeoutMs: 60000, // 1 minute
    takeoverOnConflict: true,
    takeoverTimeoutMs: 15000, // 15 seconds
    // Additional resource limits
    restartOnCrash: false, // Don't auto-restart to prevent loops
    killProcessOnBrowserClose: true
  };
};

module.exports = {
  generateClientOptions
};
