
import { useState, useCallback, useRef, useEffect } from 'react';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs: number;
}

interface RateLimitState {
  requests: number[];
  isBlocked: boolean;
  blockUntil: number;
  remainingRequests: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60000, // 1 minute
  blockDurationMs: 300000 // 5 minutes
};

export function useAdvancedRateLimit(
  key: string,
  config: Partial<RateLimitConfig> = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const [state, setState] = useState<RateLimitState>({
    requests: [],
    isBlocked: false,
    blockUntil: 0,
    remainingRequests: finalConfig.maxRequests
  });

  const configRef = useRef(finalConfig);
  configRef.current = finalConfig;

  const cleanupOldRequests = useCallback((requests: number[], now: number) => {
    return requests.filter(timestamp => now - timestamp < configRef.current.windowMs);
  }, []);

  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    const stored = localStorage.getItem(`rate_limit_${key}`);
    
    let currentState: RateLimitState;
    
    if (stored) {
      try {
        currentState = JSON.parse(stored);
      } catch {
        currentState = {
          requests: [],
          isBlocked: false,
          blockUntil: 0,
          remainingRequests: configRef.current.maxRequests
        };
      }
    } else {
      currentState = {
        requests: [],
        isBlocked: false,
        blockUntil: 0,
        remainingRequests: configRef.current.maxRequests
      };
    }

    // Check if block period has expired
    if (currentState.isBlocked && now >= currentState.blockUntil) {
      currentState.isBlocked = false;
      currentState.blockUntil = 0;
      currentState.requests = [];
    }

    // Clean up old requests
    currentState.requests = cleanupOldRequests(currentState.requests, now);
    currentState.remainingRequests = Math.max(0, configRef.current.maxRequests - currentState.requests.length);

    setState(currentState);
    localStorage.setItem(`rate_limit_${key}`, JSON.stringify(currentState));

    return currentState;
  }, [key, cleanupOldRequests]);

  const attemptRequest = useCallback((): boolean => {
    const now = Date.now();
    const currentState = checkRateLimit();

    if (currentState.isBlocked) {
      return false;
    }

    const cleanRequests = cleanupOldRequests(currentState.requests, now);

    if (cleanRequests.length >= configRef.current.maxRequests) {
      // Rate limit exceeded - block the user
      const newState: RateLimitState = {
        requests: cleanRequests,
        isBlocked: true,
        blockUntil: now + configRef.current.blockDurationMs,
        remainingRequests: 0
      };

      setState(newState);
      localStorage.setItem(`rate_limit_${key}`, JSON.stringify(newState));
      return false;
    }

    // Add new request
    const newRequests = [...cleanRequests, now];
    const newState: RateLimitState = {
      requests: newRequests,
      isBlocked: false,
      blockUntil: 0,
      remainingRequests: Math.max(0, configRef.current.maxRequests - newRequests.length)
    };

    setState(newState);
    localStorage.setItem(`rate_limit_${key}`, JSON.stringify(newState));
    return true;
  }, [key, checkRateLimit, cleanupOldRequests]);

  const getRemainingTime = useCallback((): number => {
    if (!state.isBlocked) return 0;
    return Math.max(0, state.blockUntil - Date.now());
  }, [state.isBlocked, state.blockUntil]);

  const reset = useCallback(() => {
    const resetState: RateLimitState = {
      requests: [],
      isBlocked: false,
      blockUntil: 0,
      remainingRequests: configRef.current.maxRequests
    };

    setState(resetState);
    localStorage.setItem(`rate_limit_${key}`, JSON.stringify(resetState));
  }, [key]);

  useEffect(() => {
    checkRateLimit();
    const interval = setInterval(checkRateLimit, 1000); // Check every second
    return () => clearInterval(interval);
  }, [checkRateLimit]);

  return {
    isBlocked: state.isBlocked,
    remainingRequests: state.remainingRequests,
    remainingTime: getRemainingTime(),
    attemptRequest,
    reset,
    maxRequests: finalConfig.maxRequests,
    windowMs: finalConfig.windowMs
  };
}
