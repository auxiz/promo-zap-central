
import { Card } from '@/components/ui/card';
import { ResponsiveButton } from '@/components/ui/responsive-button';
import { Badge } from '@/components/ui/badge';
import { Bot, Zap, Target, TrendingDown } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface NewTemplateStyleButtonsProps {
  loadAutomationTemplate: (templateType: string) => void;
  activeStyleId?: string;
}

const templateStyles = [
  {
    id: 'ofertaDetectada',
    name: 'Oferta Detectada',
    icon: Bot,
    recommended: true
  },
  {
    id: 'linkConvertido',
    name: 'Link Convertido',
    icon: Zap,
    recommended: false
  },
  {
    id: 'botOportunidade',
    name: 'Nova Oportunidade',
    icon: Target,
    recommended: false
  },
  {
    id: 'monitoramentoDesconto',
    name: 'Desconto Encontrado',
    icon: TrendingDown,
    recommended: false
  },
];

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
        <div>
          <h3 className="text-sm font-medium mb-2">Templates Pré-definidos</h3>
          <p className="text-xs text-muted-foreground">
            Escolha um template otimizado para automação
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {templateStyles.map((style) => {
            const Icon = style.icon;
            const isActive = style.id === activeStyleId;
            
            return (
              <ResponsiveButton
                key={style.id}
                onClick={() => handleLoadTemplate(style.id)}
                variant={isActive ? "default" : "outline"}
                className="h-auto p-3 flex items-center justify-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium text-sm">{style.name}</span>
                {style.recommended && !isActive && (
                  <Badge variant="secondary" className="text-xs ml-2">
                    Recomendado
                  </Badge>
                )}
              </ResponsiveButton>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
