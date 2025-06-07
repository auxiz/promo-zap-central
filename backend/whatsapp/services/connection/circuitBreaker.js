
/**
 * Circuit Breaker for WhatsApp connections
 * Prevents infinite reconnection loops and resource exhaustion
 */

const instanceModel = require('../../models/instance');

// Circuit breaker states
const STATES = {
  CLOSED: 'CLOSED',     // Normal operation
  OPEN: 'OPEN',         // Blocking requests
  HALF_OPEN: 'HALF_OPEN' // Testing if service is back
};

// Circuit breaker configuration
const CIRCUIT_CONFIG = {
  failureThreshold: 3,      // Max failures before opening circuit
  recoveryTimeout: 300000,  // 5 minutes before trying again
  monitoringPeriod: 60000,  // 1 minute window for failure counting
  maxConcurrentConnections: 2 // Max simultaneous connection attempts
};

// Track circuit breaker state per instance
const circuitStates = new Map();

// Initialize circuit breaker for instance
const initCircuitBreaker = (instanceId) => {
  if (!circuitStates.has(instanceId)) {
    circuitStates.set(instanceId, {
      state: STATES.CLOSED,
      failures: 0,
      lastFailureTime: null,
      lastAttemptTime: null,
      activeConnections: 0
    });
  }
};

// Check if connection attempt is allowed
const canAttemptConnection = (instanceId) => {
  initCircuitBreaker(instanceId);
  const circuit = circuitStates.get(instanceId);
  const now = Date.now();

  // Check for too many concurrent connections
  if (circuit.activeConnections >= CIRCUIT_CONFIG.maxConcurrentConnections) {
    console.log(`Circuit breaker: Too many concurrent connections for ${instanceId}`);
    return false;
  }

  // Check circuit state
  switch (circuit.state) {
    case STATES.CLOSED:
      return true;

    case STATES.OPEN:
      // Check if enough time has passed to try again
      if (now - circuit.lastFailureTime >= CIRCUIT_CONFIG.recoveryTimeout) {
        console.log(`Circuit breaker: Moving to HALF_OPEN for ${instanceId}`);
        circuit.state = STATES.HALF_OPEN;
        return true;
      }
      console.log(`Circuit breaker: OPEN - blocking connection attempt for ${instanceId}`);
      return false;

    case STATES.HALF_OPEN:
      // Only allow one attempt in half-open state
      if (circuit.activeConnections === 0) {
        return true;
      }
      return false;

    default:
      return false;
  }
};

// Record connection attempt start
const recordConnectionStart = (instanceId) => {
  initCircuitBreaker(instanceId);
  const circuit = circuitStates.get(instanceId);
  circuit.activeConnections++;
  circuit.lastAttemptTime = Date.now();
  console.log(`Circuit breaker: Connection started for ${instanceId} (active: ${circuit.activeConnections})`);
};

// Record connection success
const recordConnectionSuccess = (instanceId) => {
  initCircuitBreaker(instanceId);
  const circuit = circuitStates.get(instanceId);
  circuit.activeConnections = Math.max(0, circuit.activeConnections - 1);
  circuit.failures = 0;
  circuit.state = STATES.CLOSED;
  console.log(`Circuit breaker: Connection success for ${instanceId}`);
};

// Record connection failure
const recordConnectionFailure = (instanceId, error) => {
  initCircuitBreaker(instanceId);
  const circuit = circuitStates.get(instanceId);
  circuit.activeConnections = Math.max(0, circuit.activeConnections - 1);
  circuit.failures++;
  circuit.lastFailureTime = Date.now();

  console.log(`Circuit breaker: Connection failure for ${instanceId} (failures: ${circuit.failures})`);

  // Check if we should open the circuit
  if (circuit.failures >= CIRCUIT_CONFIG.failureThreshold) {
    circuit.state = STATES.OPEN;
    console.log(`Circuit breaker: OPENED for ${instanceId} due to ${circuit.failures} failures`);
    
    // Force stop any reconnection attempts
    const instance = instanceModel.getInstance(instanceId);
    instance.sessionData.isReconnecting = false;
    instance.sessionData.reconnectAttempts = instance.sessionData.maxReconnectAttempts;
  }
};

// Get circuit breaker status
const getCircuitStatus = (instanceId) => {
  initCircuitBreaker(instanceId);
  return circuitStates.get(instanceId);
};

// Reset circuit breaker (manual override)
const resetCircuit = (instanceId) => {
  if (circuitStates.has(instanceId)) {
    const circuit = circuitStates.get(instanceId);
    circuit.state = STATES.CLOSED;
    circuit.failures = 0;
    circuit.activeConnections = 0;
    circuit.lastFailureTime = null;
    console.log(`Circuit breaker: Manually reset for ${instanceId}`);
  }
};

// Emergency stop all connections
const emergencyStop = () => {
  console.log('Circuit breaker: EMERGENCY STOP - Blocking all connections');
  for (const [instanceId, circuit] of circuitStates.entries()) {
    circuit.state = STATES.OPEN;
    circuit.activeConnections = 0;
    circuit.lastFailureTime = Date.now();
    
    // Stop reconnection loops
    const instance = instanceModel.getInstance(instanceId);
    instance.sessionData.isReconnecting = false;
    instance.sessionData.reconnectAttempts = instance.sessionData.maxReconnectAttempts;
  }
};

module.exports = {
  canAttemptConnection,
  recordConnectionStart,
  recordConnectionSuccess,
  recordConnectionFailure,
  getCircuitStatus,
  resetCircuit,
  emergencyStop,
  STATES
};
