
/**
 * Client factory for WhatsApp
 * Handles the creation and initialization of WhatsApp WPPConnect clients
 */

const wppconnect = require('@wppconnect-team/wppconnect');
const path = require('path');
const fs = require('fs');
const { attachEventHandlers } = require('./client/eventHandlers');
const instanceModel = require('../models/instance');

// Ensure token directory exists
const TOKEN_DIR = path.join(process.cwd(), 'whatsapp-tokens');
if (!fs.existsSync(TOKEN_DIR)) {
  fs.mkdirSync(TOKEN_DIR, { recursive: true });
}

// Create WPP client with proper timeouts for QR scanning
const createClient = async (instanceId) => {
  const instance = instanceModel.getInstance(instanceId);
  
  // Set up token directory for this instance
  const tokenPath = path.join(TOKEN_DIR, instanceId);
  
  try {
    // Find appropriate Chromium path
    const chromiumPaths = [
      process.env.CHROMIUM_PATH,
      '/usr/bin/chromium', 
      '/usr/bin/chromium-browser',
      '/usr/bin/google-chrome',
      '/usr/bin/chrome'
    ];
    
    let executablePath = null;
    for (const path of chromiumPaths) {
      if (path && fs.existsSync(path)) {
        executablePath = path;
        console.log(`Using browser at: ${executablePath}`);
        break;
      }
    }
    
    if (!executablePath) {
      console.warn('No Chromium/Chrome executable found. WPPConnect will attempt to use system default.');
    }
    
    // Initialize WPPConnect client with extended timeouts for QR scanning
    const client = await wppconnect.create({
      session: instanceId,
      autoClose: 300000, // 5 minutes - enough time to scan QR code comfortably
      puppeteerOptions: {
        executablePath,
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
        headless: true,
        defaultViewport: {
          width: 1280,
          height: 800
        },
        timeout: 300000 // 5 minutes timeout for Puppeteer operations
      },
      tokenStore: 'file',
      tokenDir: tokenPath,
      catchQR: (qrCode, asciiQR, attempt) => {
        // Handle QR code generation here
        instance.qrCodeDataUrl = qrCode;
        console.log(`QR code generated for instance ${instanceId} (attempt ${attempt}) - QR will be available for 5 minutes`);
      },
      logQR: false, // Don't log QR to console
      disableWelcome: true, // Disable welcome message
      updatesLog: false, // Disable update logs
      createPathFileToken: true,
      // Extended timeouts for proper QR scanning experience
      browserWS: '', 
      browserArgs: [],
      headless: true,
      devtools: false,
      useChrome: true,
      debug: false,
      logQR: false,
      browserRevision: '',
      addProxy: [],
      folderNameToken: instanceId,
      mkdirFolderToken: '',
      addBrowserArgs: [],
      // Session and connection timeouts
      waitForLogin: true,
      // Extended timeouts to allow proper QR scanning
      timeoutQrCode: 300000, // 5 minutes for QR code timeout
      qrTimeout: 300000, // 5 minutes QR timeout
      authTimeout: 300000, // 5 minutes auth timeout
      waitForQrCodeScan: true,
      takeScreenshot: false
    });
    
    // Attach event handlers for consistent behavior with old system
    attachEventHandlers(client, instanceId);
    
    console.log(`WPPConnect client created for ${instanceId} with 5-minute timeouts for comfortable QR scanning`);
    
    return client;
  } catch (error) {
    console.error(`Error creating WPPConnect client for instance ${instanceId}:`, error);
    throw error;
  }
};

module.exports = {
  createClient
};
