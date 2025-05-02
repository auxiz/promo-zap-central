/**
 * Metrics tracker for WhatsApp
 * Tracks usage metrics and connection statistics
 */

const instanceModel = require('../models/instance');

// Metrics state - tracks metrics for each instance
const metricsState = {};

// Initialize metrics for an instance
const initializeMetrics = (instanceId = 'default') => {
  if (!metricsState[instanceId]) {
    metricsState[instanceId] = {
      uptime: {
        startTime: null,
        totalTime: 0,
        lastCalculated: null
      },
      messages: {
        sent: 0,
        received: 0,
        failed: 0
      },
      rateLimits: {
        warnings: [],
        lastWarning: null,
        isThrottled: false
      },
      reconnections: 0
    };
  }
  return metricsState[instanceId];
};

// Update connection start time
const recordConnectionStart = (instanceId = 'default') => {
  const metrics = initializeMetrics(instanceId);
  metrics.uptime.startTime = Date.now();
  metrics.uptime.lastCalculated = Date.now();
};

// Update connection end (accumulate total time)
const recordConnectionEnd = (instanceId = 'default') => {
  const metrics = initializeMetrics(instanceId);
  
  if (metrics.uptime.startTime) {
    const currentTime = Date.now();
    metrics.uptime.totalTime += (currentTime - metrics.uptime.startTime);
    metrics.uptime.startTime = null;
    metrics.uptime.lastCalculated = currentTime;
  }
};

// Get current uptime in milliseconds
const getCurrentUptime = (instanceId = 'default') => {
  const metrics = initializeMetrics(instanceId);
  const instance = instanceModel.getInstance(instanceId);
  
  if (!instance.isConnected) {
    return metrics.uptime.totalTime;
  }
  
  // If connected, calculate current uptime plus accumulated time
  const currentTime = Date.now();
  let currentUptime = metrics.uptime.totalTime;
  
  if (metrics.uptime.startTime) {
    currentUptime += (currentTime - metrics.uptime.startTime);
  }
  
  return currentUptime;
};

// Record message sent
const recordMessageSent = (instanceId = 'default', count = 1) => {
  const metrics = initializeMetrics(instanceId);
  metrics.messages.sent += count;
};

// Record message received
const recordMessageReceived = (instanceId = 'default', count = 1) => {
  const metrics = initializeMetrics(instanceId);
  metrics.messages.received += count;
};

// Record failed message
const recordMessageFailed = (instanceId = 'default', count = 1) => {
  const metrics = initializeMetrics(instanceId);
  metrics.messages.failed += count;
};

// Record rate limit warning
const recordRateLimitWarning = (instanceId = 'default', message, details = null) => {
  const metrics = initializeMetrics(instanceId);
  
  const warning = {
    timestamp: Date.now(),
    message,
    details
  };
  
  metrics.rateLimits.warnings.push(warning);
  metrics.rateLimits.lastWarning = warning;
  metrics.rateLimits.isThrottled = true;
  
  // Keep only the last 10 warnings
  if (metrics.rateLimits.warnings.length > 10) {
    metrics.rateLimits.warnings.shift();
  }
  
  // Auto-reset throttled state after 30 minutes
  setTimeout(() => {
    metrics.rateLimits.isThrottled = false;
  }, 30 * 60 * 1000);
};

// Record reconnection attempt
const recordReconnection = (instanceId = 'default') => {
  const metrics = initializeMetrics(instanceId);
  metrics.reconnections++;
};

// Clear rate limit warnings
const clearRateLimitWarnings = (instanceId = 'default') => {
  const metrics = initializeMetrics(instanceId);
  metrics.rateLimits.warnings = [];
  metrics.rateLimits.lastWarning = null;
  metrics.rateLimits.isThrottled = false;
};

// Reset metrics for an instance
const resetMetrics = (instanceId = 'default') => {
  if (metricsState[instanceId]) {
    metricsState[instanceId] = null;
  }
  initializeMetrics(instanceId);
};

// Get metrics for an instance
const getMetrics = (instanceId = 'default') => {
  const metrics = initializeMetrics(instanceId);
  const instance = instanceModel.getInstance(instanceId);
  
  // Calculate current uptime
  let uptime = metrics.uptime.totalTime;
  if (instance.isConnected && metrics.uptime.startTime) {
    uptime += (Date.now() - metrics.uptime.startTime);
  }
  
  return {
    uptime,
    connectionState: instance.isConnected ? 'connected' : 'disconnected',
    messages: { ...metrics.messages },
    rateLimits: {
      warnings: [...metrics.rateLimits.warnings],
      lastWarning: metrics.rateLimits.lastWarning,
      isThrottled: metrics.rateLimits.isThrottled
    },
    reconnections: metrics.reconnections
  };
};

module.exports = {
  recordConnectionStart,
  recordConnectionEnd,
  getCurrentUptime,
  recordMessageSent,
  recordMessageReceived,
  recordMessageFailed,
  recordRateLimitWarning,
  recordReconnection,
  clearRateLimitWarnings,
  resetMetrics,
  getMetrics
};
