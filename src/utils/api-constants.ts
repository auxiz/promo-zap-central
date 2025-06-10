
export const WHATSAPP_API_BASE_URL = 'http://localhost:4000/api/whatsapp';

// Helper function to build instance-specific URLs
export const buildInstanceUrl = (instanceId: string = 'default') => {
  return `${WHATSAPP_API_BASE_URL}/instances/${instanceId}`;
};
