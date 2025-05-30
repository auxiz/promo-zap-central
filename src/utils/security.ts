
/**
 * Security utilities for input validation and sanitization
 */

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  if (password.length > 128) {
    errors.push('Senha não pode ter mais de 128 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const sanitizeCredentials = (obj: Record<string, any>): Record<string, any> => {
  const sensitiveKeys = [
    'password', 'secret', 'key', 'token', 'credential',
    'secretKey', 'app_id', 'signature', 'auth'
  ];
  
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (sensitiveKeys.some(sensitive => 
      key.toLowerCase().includes(sensitive.toLowerCase())
    )) {
      sanitized[key] = '[REDACTED]';
    }
  }
  
  return sanitized;
};

export const logSecurely = (message: string, data?: any) => {
  if (data) {
    console.log(message, sanitizeCredentials(data));
  } else {
    console.log(message);
  }
};
