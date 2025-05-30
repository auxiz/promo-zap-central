
import { Card } from '@/components/ui/card';
import { ResponsiveButton } from '@/components/ui/responsive-button';
import { Badge } from '@/components/ui/badge';
import { Bot, Zap, Target, TrendingDown } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface NewTemplateStyleButtonsProps {
  loadAutomationTemplate: (templateType: string) => void;
  activeStyleId?: string;
}

const templateStyles = [{
  id: 'ofertaDetectada',
  name: 'Oferta Detectada',
  icon: Bot,
  recommended: false
}, {
  id: 'linkConvertido',
  name: 'Link Convertido',
  icon: Zap,
  recommended: false
}, {
  id: 'botOportunidade',
  name: 'Nova Oportunidade',
  icon: Target,
  recommended: false
}, {
  id: 'monitoramentoDesconto',
  name: 'Desconto Encontrado',
  icon: TrendingDown,
  recommended: false
}];

export function NewTemplateStyleButtons({
  loadAutomationTemplate,
  activeStyleId
}: NewTemplateStyleButtonsProps) {
  const handleLoadTemplate = (styleId: string) => {
    loadAutomationTemplate(styleId);
    toast.success('Template aplicado!', {
      description: `Template "${templateStyles.find(s => s.id === styleId)?.name}" foi carregado`
    });
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Templates de Automação</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {templateStyles.map((style) => {
            const IconComponent = style.icon;
            return (
              <ResponsiveButton
                key={style.id}
                onClick={() => handleLoadTemplate(style.id)}
                variant={style.id === activeStyleId ? "default" : "outline"}
                className="h-auto p-3 flex items-center gap-3 justify-start"
              >
                <IconComponent className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium">{style.name}</span>
                {style.recommended && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Recomendado
                  </Badge>
                )}
              </ResponsiveButton>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Clique em um template para carregar um modelo pré-definido otimizado para automação
        </p>
      </div>
    </Card>
  );
}
