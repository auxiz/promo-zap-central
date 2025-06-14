
import { CheckCircle, XCircle } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  show: boolean;
}

export const PasswordStrengthIndicator = ({ password, show }: PasswordStrengthIndicatorProps) => {
  if (!show || !password) return null;

  const requirements = [
    { text: 'Pelo menos 8 caracteres', met: password.length >= 8 },
    { text: 'Uma letra maiúscula', met: /[A-Z]/.test(password) },
    { text: 'Uma letra minúscula', met: /[a-z]/.test(password) },
    { text: 'Um número', met: /\d/.test(password) },
    { text: 'Um caractere especial', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const strength = requirements.filter(req => req.met).length;
  const strengthColors = {
    0: 'bg-red-500',
    1: 'bg-red-500',
    2: 'bg-orange-500',
    3: 'bg-yellow-500',
    4: 'bg-blue-500',
    5: 'bg-green-500',
  };

  const strengthLabels = {
    0: 'Muito fraca',
    1: 'Fraca',
    2: 'Regular',
    3: 'Boa',
    4: 'Forte',
    5: 'Muito forte',
  };

  return (
    <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border animate-fade-in">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Força da senha: {strengthLabels[strength as keyof typeof strengthLabels]}
          </span>
        </div>
        <div className="flex space-x-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded transition-colors duration-300 ${
                index < strength 
                  ? strengthColors[strength as keyof typeof strengthColors]
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>
      
      <div className="space-y-1">
        {requirements.map((requirement, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
              requirement.met 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {requirement.met ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            <span>{requirement.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
