
import { sanitizeInput } from './security';

// List of curated placeholder image IDs from Unsplash for avatars
const AVATAR_IDS = [
  'photo-1535713875002-d1d0cf377fde', // man with glasses
  'photo-1494790108755-2616b2e16a93', // woman smiling
  'photo-1507003211169-0a1dd7228f2d', // man with beard
  'photo-1438761681033-6461ffad8d80', // woman with curly hair
  'photo-1472099645785-5658abf4ff4e', // man in suit
  'photo-1544005313-94ddf0286df2', // woman with straight hair
  'photo-1566492031773-4f4e44671d66', // man with hat
  'photo-1517841905240-472988babdf9', // woman professional
  'photo-1519345182560-3f2917c472ef', // man casual
  'photo-1487412720507-e7ab37603c6f', // woman with blonde hair
];

/**
 * Generates a consistent random avatar URL based on user identifier
 */
export const generateRandomAvatar = (userId: string, size: number = 150): string => {
  if (!userId) {
    return getDefaultAvatarSvg();
  }

  // Create a simple hash from userId to ensure consistency
  const sanitizedId = sanitizeInput(userId);
  let hash = 0;
  for (let i = 0; i < sanitizedId.length; i++) {
    const char = sanitizedId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use absolute value and modulo to get a consistent index
  const avatarIndex = Math.abs(hash) % AVATAR_IDS.length;
  const selectedId = AVATAR_IDS[avatarIndex];
  
  return `https://images.unsplash.com/${selectedId}?w=${size}&h=${size}&fit=crop&crop=face`;
};

/**
 * Generates a colorful avatar with initials
 */
export const generateInitialsAvatar = (name: string | null | undefined, email: string | null | undefined): {
  initials: string;
  backgroundColor: string;
  textColor: string;
} => {
  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'AA';
  };

  const initials = getInitials(name, email);
  
  // Generate consistent colors based on initials
  const colors = [
    { bg: '#8B5CF6', text: '#FFFFFF' }, // Purple
    { bg: '#06B6D4', text: '#FFFFFF' }, // Cyan
    { bg: '#10B981', text: '#FFFFFF' }, // Emerald
    { bg: '#F59E0B', text: '#FFFFFF' }, // Amber
    { bg: '#EF4444', text: '#FFFFFF' }, // Red
    { bg: '#3B82F6', text: '#FFFFFF' }, // Blue
    { bg: '#EC4899', text: '#FFFFFF' }, // Pink
    { bg: '#84CC16', text: '#FFFFFF' }, // Lime
  ];

  let hash = 0;
  for (let i = 0; i < initials.length; i++) {
    hash = initials.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const selectedColor = colors[colorIndex];

  return {
    initials,
    backgroundColor: selectedColor.bg,
    textColor: selectedColor.text,
  };
};

/**
 * Default avatar SVG for ultimate fallback
 */
export const getDefaultAvatarSvg = (): string => {
  return "data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='50' cy='50' r='50' fill='%23e5e7eb'/%3e%3ccircle cx='50' cy='35' r='12' fill='%239ca3af'/%3e%3cpath d='M50 55c-8 0-15 4-19 10v10c0 8 6 15 14 15h10c8 0 14-7 14-15v-10c-4-6-11-10-19-10z' fill='%239ca3af'/%3e%3c/svg%3e";
};
