
export const WHATSAPP_API_BASE_URL = 'http://localhost:4000/api/whatsapp';
export const API_BASE = 'http://localhost:4000';
export const SHOPEE_API_BASE_URL = 'http://localhost:4000/api/shopee';
export const HEALTH_CHECK_URL = 'http://localhost:4000/api/health';

// Helper function to build instance-specific URLs
export const buildInstanceUrl = (instanceId: string = 'default') => {
  return `${WHATSAPP_API_BASE_URL}/instances/${instanceId}`;
};
