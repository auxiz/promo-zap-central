/**
 * Error tracker for WhatsApp integration
 * Collects and manages error information for monitoring and reporting
 */

// Error tracking state
const errorState = {
  // Store errors by instance ID
  instances: {},
  // Global error stats
  globalStats: {
    qrCodeErrors: 0,
    connectionErrors: 0,
    disconnectionErrors: 0,
    shopeeErrors: 0,
    lastError: null,
    totalErrors: 0
  }
};

// Initialize error tracking for an instance
const initializeErrorTracking = (instanceId = 'default') => {
  if (!errorState.instances[instanceId]) {
    errorState.instances[instanceId] = {
      qrCodeErrors: 0,
      connectionErrors: 0,
      disconnectionErrors: 0,
      shopeeErrors: 0,
      retryAttempts: 0,
      lastError: null,
      errorHistory: []
    };
  }
  return errorState.instances[instanceId];
};

// Track a new error
const trackError = (instanceId = 'default', errorType, errorMessage, errorObject = null) => {
  // Initialize tracking for this instance if it doesn't exist
  const instanceErrors = initializeErrorTracking(instanceId);
  
  // Create error entry
  const errorEntry = {
    timestamp: Date.now(),
    type: errorType,
    message: errorMessage,
    details: errorObject ? String(errorObject) : null
  };
  
  // Update instance specific error counts
  switch (errorType) {
    case 'QR_CODE':
      instanceErrors.qrCodeErrors++;
      break;
    case 'CONNECTION':
      instanceErrors.connectionErrors++;
      break;
    case 'DISCONNECTION':
      instanceErrors.disconnectionErrors++;
      break;
    case 'SHOPEE_API':
      instanceErrors.shopeeErrors++;
      break;
    default:
      // Other errors
      break;
  }
  
  // Update last error
  instanceErrors.lastError = errorEntry;
  
  // Keep history limited to last 10 errors
  instanceErrors.errorHistory.unshift(errorEntry);
  if (instanceErrors.errorHistory.length > 10) {
    instanceErrors.errorHistory.pop();
  }
  
  // Update global stats
  errorState.globalStats.totalErrors++;
  errorState.globalStats.lastError = errorEntry;
  
  switch (errorType) {
    case 'QR_CODE':
      errorState.globalStats.qrCodeErrors++;
      break;
    case 'CONNECTION':
      errorState.globalStats.connectionErrors++;
      break;
    case 'DISCONNECTION':
      errorState.globalStats.disconnectionErrors++;
      break;
    case 'SHOPEE_API':
      errorState.globalStats.shopeeErrors++;
      break;
    default:
      // Other errors
      break;
  }
  
  // Log the error
  console.error(`Error [${instanceId}] [${errorType}]: ${errorMessage}`);
  
  return errorEntry;
};

// Track specifically Shopee API errors
const trackShopeeError = (errorType, errorMessage, errorObject = null) => {
  return trackError('shopee', 'SHOPEE_API', `${errorType}: ${errorMessage}`, errorObject);
};

// Track retry attempt for QR code generation
const trackRetryAttempt = (instanceId = 'default') => {
  const instanceErrors = initializeErrorTracking(instanceId);
  instanceErrors.retryAttempts++;
  return instanceErrors.retryAttempts;
};

// Reset retry counter
const resetRetryAttempts = (instanceId = 'default') => {
  const instanceErrors = initializeErrorTracking(instanceId);
  instanceErrors.retryAttempts = 0;
};

// Get error stats for a specific instance
const getInstanceErrorStats = (instanceId = 'default') => {
  return errorState.instances[instanceId] || initializeErrorTracking(instanceId);
};

// Get global error stats
const getGlobalErrorStats = () => {
  return errorState.globalStats;
};

// Clear error history for an instance
const clearErrorHistory = (instanceId = 'default') => {
  if (errorState.instances[instanceId]) {
    errorState.instances[instanceId].errorHistory = [];
  }
};

module.exports = {
  trackError,
  trackShopeeError,
  trackRetryAttempt,
  resetRetryAttempts,
  getInstanceErrorStats,
  getGlobalErrorStats,
  clearErrorHistory
};
