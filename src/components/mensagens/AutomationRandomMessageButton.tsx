
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const automationRandomMessages = [
  `🤖 DETECÇÃO AUTOMÁTICA 🤖
--produtodescricao--
💰 Preço especial: --precopromocional--
🔗 LINK AFILIADO: --linkafiliado--
📊 Economia de --desconto--%
🕒 Detectado agora em --grupoorigem--`,

  `⚡ BOT ENCONTROU OFERTA ⚡
🏷️ --produtodescricao--
❌ Era: --precooriginal--
✅ Agora: --precopromocional--
🛒 APROVEITAR: --linkafiliado--
🏪 Loja: --nomeloja--`,

  `🔍 MONITORAMENTO ATIVO 🔍
--produtodescricao--
💸 --desconto--% de desconto!
💰 Por apenas: --precopromocional--
🔗 Link convertido: --linkafiliado--
⏰ --datahorario--`,

  `🎯 OPORTUNIDADE DETECTADA 🎯
--produtodescricao--
🏪 --nomeloja--
💵 De --precooriginal-- para --precopromocional--
🚀 GARANTIR: --linkafiliado--
📍 Fonte: --grupoorigem--`,

  `🤖 BOT ATIVO: NOVA PROMOÇÃO 🤖
--produtodescricao--
🔥 --desconto--% OFF
💰 Apenas: --precopromocional--
🛍️ COMPRAR: --linkafiliado--
📅 Detectado em --datahorario--`,
];

interface AutomationRandomMessageButtonProps {
  setTemplateContent: (content: string) => void;
}

export function AutomationRandomMessageButton({ setTemplateContent }: AutomationRandomMessageButtonProps) {
  const handleGenerateRandom = () => {
    const randomIndex = Math.floor(Math.random() * automationRandomMessages.length);
    setTemplateContent(automationRandomMessages[randomIndex]);
    toast.success('Template de automação gerado!', {
      description: 'Template otimizado para o bot automático'
    });
  };

  return (
    <Button 
      onClick={handleGenerateRandom} 
      variant="outline"
      size="default"
      className="w-full h-auto min-h-[44px] px-4 py-3 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-medium"
    >
      <Bot className="h-4 w-4 flex-shrink-0" />
      <span className="text-sm text-center leading-tight">
        Gerar Template de Automação
      </span>
    </Button>
  );
}
