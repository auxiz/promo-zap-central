
import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

interface EnhancedPasswordInputProps {
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  showStrengthIndicator?: boolean;
  className?: string;
}

export const EnhancedPasswordInput = ({
  id,
  placeholder,
  value,
  onChange,
  required = false,
  showStrengthIndicator = false,
  className = "",
}: EnhancedPasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 transition-colors duration-200" />
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`pl-10 pr-12 h-12 border-gray-200 dark:border-gray-700 transition-all duration-200 ${
            isFocused ? 'border-purple-500 dark:border-purple-400 ring-2 ring-purple-100 dark:ring-purple-900' : ''
          } ${className}`}
          required={required}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1 h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-500" />
          ) : (
            <Eye className="h-4 w-4 text-gray-500" />
          )}
        </Button>
      </div>
      
      <PasswordStrengthIndicator 
        password={value} 
        show={showStrengthIndicator && (isFocused || value.length > 0)} 
      />
    </div>
  );
};
