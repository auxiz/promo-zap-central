
import { useState, useEffect } from 'react';
import { Mail, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface EnhancedEmailInputProps {
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export const EnhancedEmailInput = ({
  id,
  placeholder,
  value,
  onChange,
  required = false,
  className = "",
}: EnhancedEmailInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setIsValid(emailRegex.test(value));
    } else {
      setIsValid(null);
    }
  }, [value]);

  const getValidationIcon = () => {
    if (isValid === null || !value) return null;
    
    return isValid ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <div className="relative">
      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 transition-colors duration-200" />
      <Input
        id={id}
        type="email"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`pl-10 pr-12 h-12 border-gray-200 dark:border-gray-700 transition-all duration-200 ${
          isFocused ? 'border-purple-500 dark:border-purple-400 ring-2 ring-purple-100 dark:ring-purple-900' : ''
        } ${
          isValid === false ? 'border-red-300 dark:border-red-700' : ''
        } ${className}`}
        required={required}
      />
      <div className="absolute right-3 top-3">
        {getValidationIcon()}
      </div>
    </div>
  );
};
