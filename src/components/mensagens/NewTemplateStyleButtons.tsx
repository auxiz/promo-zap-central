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
  return;
}