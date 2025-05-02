
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

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
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Estilos de Template</h3>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2">
        {templateStyles.map((style) => (
          <TooltipProvider key={style.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => loadDefaultTemplate(style.id)}
                  className="p-2 h-auto text-sm justify-center transition-colors"
                  variant={style.id === 'normal' ? 'default' : 'outline'}
                >
                  {style.name}
                  {style.id === 'normal' && (
                    <Badge variant="secondary" className="ml-2 text-xs py-0">Padrão</Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{style.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Clique em um estilo para carregar um template pré-definido
      </p>
    </div>
  );
}
