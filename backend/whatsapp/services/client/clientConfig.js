
/**
 * Client configuration for WhatsApp
 * Contains configuration options for WhatsApp client
 */

// Generate client configuration options with instance-specific settings
const generateClientOptions = (instanceId) => {
  return {
    authStrategy: {
      type: 'LocalAuth',
      options: { 
        clientId: instanceId, 
        // Using separate data paths for each instance to ensure proper isolation
        dataPath: `./whatsapp-sessions/${instanceId}`
      }
    },
    puppeteer: {
      // Use appropriate Chromium path for Debian
      executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium' || '/usr/bin/chromium-browser',
      headless: true,
      // Enhanced args for better stability in headless environments
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-gpu',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // Helps with memory issues
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process' // Help with WebKit issues
      ],
      // Browser timeout settings
      timeout: 120000, // 2 minutes
      // Memory management
      defaultViewport: {
        width: 1280,
        height: 800
      }
    },
    // Add client-specific timeouts
    qrTimeoutMs: 60000, // 1 minute
    authTimeoutMs: 120000, // 2 minutes
    takeoverOnConflict: true, // Auto-handle session conflicts
    takeoverTimeoutMs: 30000 // 30 seconds to wait for takeover
  };
};

module.exports = {
  generateClientOptions
};
