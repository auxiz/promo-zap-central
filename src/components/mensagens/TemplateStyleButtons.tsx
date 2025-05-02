
import { Button } from '@/components/ui/button';

interface TemplateStyle {
  id: string;
  name: string;
  description: string;
}

interface TemplateStyleButtonsProps {
  templateStyles: TemplateStyle[];
  loadDefaultTemplate: (templateType: string) => void;
}

export function TemplateStyleButtons({
  templateStyles,
  loadDefaultTemplate
}: TemplateStyleButtonsProps) {
  return (
    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
      {templateStyles.map((style) => (
        <Button
          key={style.id}
          onClick={() => loadDefaultTemplate(style.id)}
          className={`p-2 h-auto text-sm justify-center transition-colors whitespace-nowrap`}
          variant={style.id === 'normal' ? 'default' : 'outline'}
        >
          {style.name}
        </Button>
      ))}
    </div>
  );
}
