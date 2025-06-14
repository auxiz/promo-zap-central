
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  label: string;
  color: string;
}

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthIndicatorProps) {
  const calculatePasswordStrength = (pwd: string): PasswordStrength => {
    let score = 0;
    const feedback = [];

    if (pwd.length >= 8) score += 1;
    else feedback.push('Pelo menos 8 caracteres');

    if (/[A-Z]/.test(pwd)) score += 1;
    else feedback.push('Uma letra maiúscula');

    if (/[a-z]/.test(pwd)) score += 1;
    else feedback.push('Uma letra minúscula');

    if (/\d/.test(pwd)) score += 1;
    else feedback.push('Um número');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score += 1;
    else feedback.push('Um caractere especial');

    let label = 'Muito fraca';
    let color = 'bg-red-500';

    if (score === 2) {
      label = 'Fraca';
      color = 'bg-orange-500';
    } else if (score === 3) {
      label = 'Média';
      color = 'bg-yellow-500';
    } else if (score === 4) {
      label = 'Forte';
      color = 'bg-green-500';
    } else if (score === 5) {
      label = 'Muito forte';
      color = 'bg-green-600';
    }

    return { score, feedback, label, color };
  };

  if (!password) return null;

  const strength = calculatePasswordStrength(password);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-400">Força da senha:</span>
        <span className={cn(
          "font-medium",
          strength.score <= 1 && "text-red-500",
          strength.score === 2 && "text-orange-500",
          strength.score === 3 && "text-yellow-500",
          strength.score >= 4 && "text-green-500"
        )}>
          {strength.label}
        </span>
      </div>
      
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              index <= strength.score ? strength.color : "bg-gray-200 dark:bg-gray-700"
            )}
          />
        ))}
      </div>
      
      {strength.feedback.length > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p className="mb-1">Para uma senha mais forte, adicione:</p>
          <ul className="space-y-1">
            {strength.feedback.map((item, index) => (
              <li key={index} className="flex items-center gap-1">
                <span className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
