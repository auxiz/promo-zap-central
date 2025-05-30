
import { Card } from '@/components/ui/card';
import { ResponsiveButton } from '@/components/ui/responsive-button';
import { toast } from '@/components/ui/sonner';

const randomMessages = [
  `🤖 DETECÇÃO AUTOMÁTICA 🤖
--produtodescricao--
💰 Preço especial: --precopromocional--
🔗 LINK AFILIADO: --linkafiliado--
📊 Economia de --desconto--%
🕒 Detectado agora`,

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
🚀 GARANTIR: --linkafiliado--`,
];

interface NewRandomMessageButtonProps {
  setTemplateContent: (content: string) => void;
}

export function NewRandomMessageButton({ setTemplateContent }: NewRandomMessageButtonProps) {
  const handleGenerateRandom = () => {
    const randomIndex = Math.floor(Math.random() * randomMessages.length);
    setTemplateContent(randomMessages[randomIndex]);
    toast.success('Template gerado!', {
      description: 'Template aleatório foi aplicado com sucesso'
    });
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">Gerar Aleatório</h3>
          <p className="text-xs text-muted-foreground">
            Template otimizado para automação
          </p>
        </div>
        
        <ResponsiveButton 
          onClick={handleGenerateRandom} 
          variant="outline"
          className="w-full"
        >
          Template Aleatório
        </ResponsiveButton>
      </div>
    </Card>
  );
}
