
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SecurePasswordInputProps {
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  minLength?: number;
}

export default function SecurePasswordInput({
  id,
  placeholder,
  value,
  onChange,
  required = false,
  minLength = 8,
}: SecurePasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= minLength;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: hasMinLength && hasUpperCase && hasLowerCase && hasNumbers,
      requirements: {
        minLength: hasMinLength,
        upperCase: hasUpperCase,
        lowerCase: hasLowerCase,
        numbers: hasNumbers,
        specialChar: hasSpecialChar,
      },
    };
  };

  const validation = validatePassword(value);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
      
      {value && (
        <div className="text-xs space-y-1">
          <div className={`${validation.requirements.minLength ? 'text-green-600' : 'text-red-600'}`}>
            • Mínimo {minLength} caracteres
          </div>
          <div className={`${validation.requirements.upperCase ? 'text-green-600' : 'text-red-600'}`}>
            • Uma letra maiúscula
          </div>
          <div className={`${validation.requirements.lowerCase ? 'text-green-600' : 'text-red-600'}`}>
            • Uma letra minúscula
          </div>
          <div className={`${validation.requirements.numbers ? 'text-green-600' : 'text-red-600'}`}>
            • Um número
          </div>
        </div>
      )}
    </div>
  );
}
