
import { ReactNode, useState } from 'react';
import { Label } from '@/components/ui/label';

interface AnimatedFormFieldProps {
  id: string;
  label: string;
  children: ReactNode;
  error?: string;
}

export const AnimatedFormField = ({ id, label, children, error }: AnimatedFormFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-2 group">
      <Label 
        htmlFor={id} 
        className={`text-sm font-medium transition-colors duration-200 ${
          isFocused || error 
            ? 'text-purple-600 dark:text-purple-400' 
            : 'text-gray-700 dark:text-gray-300'
        }`}
      >
        {label}
      </Label>
      <div 
        className="relative"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {children}
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};
