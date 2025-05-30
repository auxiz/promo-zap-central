
import { ResponsiveButton } from '@/components/ui/responsive-button';
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
    <div className="automation-template-style-buttons">
      <h3 className="text-sm font-medium mb-2">Templates de Automação Pré-definidos</h3>
      <div className="style-buttons-grid">
        {templateStyles.map((style) => (
          <TooltipProvider key={style.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <ResponsiveButton
                  onClick={() => loadAutomationTemplate(style.id)}
                  className="style-button"
                  variant={style.id === activeStyleId ? "default" : "outline"}
                  size="sm"
                >
                  <div className="style-button-content">
                    <div className="font-medium">{style.name}</div>
                    {style.id === 'ofertaDetectada' && activeStyleId !== style.id && (
                      <Badge variant="secondary" className="style-badge">Recomendado</Badge>
                    )}
                  </div>
                </ResponsiveButton>
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
