
/**
 * Client factory for WhatsApp with complete session isolation
 * Handles the creation and initialization of isolated WhatsApp WPPConnect clients
 */

const wppconnect = require('@wppconnect-team/wppconnect');
const path = require('path');
const fs = require('fs');
const { attachEventHandlers } = require('./client/eventHandlers');
const instanceModel = require('../models/instance');

// Create WPP client with complete session isolation
const createClient = async (instanceId) => {
  const instance = instanceModel.getInstance(instanceId);
  
  // Ensure unique session directory for this instance
  const sessionPath = path.join(process.cwd(), 'whatsapp-sessions', instanceId);
  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }
  
  // Set up token directory for this instance (completely isolated)
  const tokenPath = path.join(sessionPath, 'tokens');
  if (!fs.existsSync(tokenPath)) {
    fs.mkdirSync(tokenPath, { recursive: true });
  }
  
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
        break;
      }
    }
    
    if (!executablePath) {
      console.warn(`No Chromium/Chrome executable found for instance ${instanceId}. WPPConnect will attempt to use system default.`);
    } else {
      console.log(`Using browser at: ${executablePath} for instance ${instanceId}`);
    }
    
    // Initialize WPPConnect client with complete isolation
    const client = await wppconnect.create({
      session: instanceId, // Unique session identifier
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
          '--disable-features=IsolateOrigins,site-per-process', // Help with WebKit issues
          // Instance-specific user data directory for complete isolation
          `--user-data-dir=${path.join(sessionPath, 'chrome-data')}`
        ],
        headless: true,
        defaultViewport: {
          width: 1280,
          height: 800
        },
        timeout: 300000 // 5 minutes timeout for Puppeteer operations
      },
      tokenStore: 'file',
      tokenDir: tokenPath, // Instance-specific token directory
      catchQR: (qrCode, asciiQR, attempt) => {
        // Handle QR code generation here - instance specific
        instance.qrCodeDataUrl = qrCode;
        console.log(`QR code generated for instance ${instanceId} (attempt ${attempt}) - QR will be available for 5 minutes`);
        
        // Update instance as active when QR is generated
        instanceModel.updateInstanceConfig(instanceId, { 
          isActive: true, 
          lastQrGenerated: Date.now() 
        });
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
      browserRevision: '',
      addProxy: [],
      folderNameToken: instanceId, // Unique folder for this instance
      mkdirFolderToken: sessionPath, // Instance-specific directory
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
    
    // Attach event handlers for consistent behavior
    attachEventHandlers(client, instanceId);
    
    // Mark instance as active when client is created
    instanceModel.updateInstanceConfig(instanceId, { 
      isActive: true, 
      lastClientCreated: Date.now() 
    });
    
    console.log(`WPPConnect client created for ${instanceId} with complete session isolation and 5-minute timeouts`);
    
    return client;
  } catch (error) {
    console.error(`Error creating isolated WPPConnect client for instance ${instanceId}:`, error);
    
    // Mark instance as inactive on error
    instanceModel.updateInstanceConfig(instanceId, { 
      isActive: false, 
      lastError: Date.now(),
      errorMessage: error.message 
    });
    
    throw error;
  }
};

// Validate session isolation for an instance
const validateSessionIsolation = (instanceId) => {
  const sessionPath = path.join(process.cwd(), 'whatsapp-sessions', instanceId);
  const tokenPath = path.join(sessionPath, 'tokens');
  const chromeDataPath = path.join(sessionPath, 'chrome-data');
  
  return {
    sessionExists: fs.existsSync(sessionPath),
    tokensExist: fs.existsSync(tokenPath),
    chromeDataExists: fs.existsSync(chromeDataPath),
    sessionPath,
    tokenPath,
    chromeDataPath
  };
};

// Clean up session files for an instance
const cleanupSessionFiles = (instanceId) => {
  if (instanceId === 'default') {
    console.log('Cannot cleanup default instance session files');
    return false;
  }
  
  const sessionPath = path.join(process.cwd(), 'whatsapp-sessions', instanceId);
  
  try {
    if (fs.existsSync(sessionPath)) {
      fs.rmSync(sessionPath, { recursive: true, force: true });
      console.log(`Cleaned up session files for instance ${instanceId}`);
      return true;
    }
  } catch (error) {
    console.error(`Error cleaning up session files for instance ${instanceId}:`, error);
  }
  
  return false;
};

module.exports = {
  createClient,
  validateSessionIsolation,
  cleanupSessionFiles
};
