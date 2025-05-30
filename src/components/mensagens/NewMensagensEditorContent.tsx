
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ResponsiveButton } from '@/components/ui/responsive-button';
import { Zap } from 'lucide-react';
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

interface NewMensagensEditorContentProps {
  templateContent: string;
  setTemplateContent: (content: string) => void;
}

export function NewMensagensEditorContent({
  templateContent,
  setTemplateContent,
}: NewMensagensEditorContentProps) {
  const handleGenerateRandom = () => {
    const randomIndex = Math.floor(Math.random() * randomMessages.length);
    setTemplateContent(randomMessages[randomIndex]);
    toast.success('Template gerado!', {
      description: 'Template aleatório foi aplicado com sucesso'
    });
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex flex-col gap-3">
          <label className="block text-sm font-medium">
            Conteúdo do Template
          </label>
          <div className="sm:flex sm:justify-end">
            <ResponsiveButton 
              onClick={handleGenerateRandom} 
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
            >
              <Zap className="h-4 w-4" />
              Template Aleatório
            </ResponsiveButton>
          </div>
        </div>
        <Textarea
          value={templateContent}
          onChange={(e) => setTemplateContent(e.target.value)}
          className="w-full h-64 font-mono text-sm"
          placeholder="Digite o conteúdo do seu template aqui..."
        />
      </div>
    </Card>
  );
}
