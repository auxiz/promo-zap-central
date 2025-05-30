
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { AutomationTemplateStyle } from '@/hooks/useAutomationTemplateUtils';

interface AutomationTemplateStyleButtonsProps {
  templateStyles: AutomationTemplateStyle[];
  loadAutomationTemplate: (templateType: string) => void;
  activeStyleId?: string;
}

export function AutomationTemplateStyleButtons({
  templateStyles,
  loadAutomationTemplate,
  activeStyleId
}: AutomationTemplateStyleButtonsProps) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Templates de Automação Pré-definidos</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {templateStyles.map((style) => (
          <TooltipProvider key={style.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => loadAutomationTemplate(style.id)}
                  className="p-3 h-auto text-sm justify-start transition-colors"
                  variant={style.id === activeStyleId ? "default" : "outline"}
                >
                  <div className="text-left">
                    <div className="font-medium">{style.name}</div>
                    {style.id === 'ofertaDetectada' && activeStyleId !== style.id && (
                      <Badge variant="secondary" className="mt-1 text-xs py-0">Recomendado</Badge>
                    )}
                  </div>
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
        Templates otimizados para automação. Clique para aplicar um modelo pré-definido.
      </p>
    </div>
  );
}
