
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface RememberMeCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const RememberMeCheckbox = ({ checked, onCheckedChange }: RememberMeCheckboxProps) => {
  return (
    <div className="flex items-center space-x-2 group">
      <Checkbox
        id="remember-me"
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="transition-all duration-200 group-hover:ring-2 group-hover:ring-purple-100 dark:group-hover:ring-purple-900"
      />
      <Label 
        htmlFor="remember-me" 
        className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer transition-colors duration-200 group-hover:text-purple-600 dark:group-hover:text-purple-400"
      >
        Lembrar de mim
      </Label>
    </div>
  );
};
