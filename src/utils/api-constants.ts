
// API Configuration
// Determine the correct API base URL based on environment
const getApiBase = () => {
  // Check if we're in development or production
  if (import.meta.env.DEV) {
    // In development, try to connect to the local backend
    return 'http://localhost:3000';
  }
  
  // In production, use the same origin
  return window.location.origin;
};

export const API_BASE = getApiBase();
export const WHATSAPP_API_BASE_URL = `${API_BASE}/api/whatsapp`;
export const SHOPEE_API_BASE_URL = `${API_BASE}/api/shopee`;

// Health check endpoint
export const HEALTH_CHECK_URL = `${API_BASE}/api/health`;

console.log('API Configuration:', {
  API_BASE,
  WHATSAPP_API_BASE_URL,
  SHOPEE_API_BASE_URL
});
