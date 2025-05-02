
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const randomMessages = [
  `🔥 SUPER OFERTA: --produtodescricao--
De: ~R$ --precoantigo--~
Por apenas: *R$ --precocomdesconto--*
COMPRE AQUI: --linklojaoficial--`,

  `⚡️ PROMOÇÃO RELÂMPAGO ⚡️
--produtodescricao--
❌ Original: --precoantigo--
✅ Hoje por: --precocomdesconto--
🛒 COMPRE JÁ: --linklojaoficial--`,

  `🎯 NÃO PERCA ESSA!
--produtodescricao--
De --precoantigo--
AGORA APENAS --precocomdesconto--
👉 --linklojaoficial--`,

  `🚨 OFERTA LIMITADA 🚨
--produtodescricao--
Era: --precoantigo--
Preço atual: --precocomdesconto--
Opção mensal: --precorecorrencia--/mês
🛍️ COMPRAR: --linklojaoficial--`,

  `✨ DESCONTO EXCLUSIVO ✨
--produtodescricao--
Preço normal: --precoantigo--
Seu preço hoje: --precocomdesconto--
PEÇA JÁ: --linklojaoficial--`,

  `💰 ECONOMIA GARANTIDA 💰
--produtodescricao--
Antes: R$ --precoantigo--
Agora: R$ --precocomdesconto--
🛒 GARANTIR OFERTA: --linklojaoficial--`,

  `🏆 MELHOR PREÇO DO ANO!
--produtodescricao--
De R$ --precoantigo-- por apenas
*R$ --precocomdesconto--*
Compre aqui: --linklojaoficial--`,

  `📢 ATENÇÃO! PREÇO BAIXOU!
--produtodescricao--
Preço anterior: --precoantigo--
HOJE: --precocomdesconto--
👉 CLIQUE PARA COMPRAR: --linklojaoficial--`,

  `💫 OPORTUNIDADE ÚNICA!
--produtodescricao--
De ~--precoantigo--~ por
*--precocomdesconto--*
Recurso exclusivo: --precorecorrencia--/mês
Acesse: --linklojaoficial--`,

  `🎁 PRESENTE ESPECIAL PRA VOCÊ!
--produtodescricao--
De: --precoantigo--
Por: --precocomdesconto--
Adquira agora: --linklojaoficial--`,

  `⏰ CORRE QUE ACABA! ⏰
--produtodescricao--
Preço cheio: --precoantigo--
Preço promocional: --precocomdesconto--
🛒 COMPRA RÁPIDA: --linklojaoficial--`,

  `💎 OFERTA PREMIUM 💎
--produtodescricao--
Valor original: --precoantigo--
Valor com desconto: --precocomdesconto--
Assinatura mensal: --precorecorrencia--/mês
Garanta o seu: --linklojaoficial--`,

  `🔔 ALERTA DE OFERTA! 🔔
--produtodescricao--
De R$ --precoantigo--
POR APENAS R$ --precocomdesconto--
Aproveite aqui: --linklojaoficial--`,

  `🌟 DESTAQUE DA SEMANA! 🌟
--produtodescricao--
Antes: --precoantigo--
Agora: --precocomdesconto--
Compre já: --linklojaoficial--`,

  `🎯 PREÇO IMBATÍVEL!
--produtodescricao--
De: R$ --precoantigo--
Por: R$ --precocomdesconto--
CLIQUE E COMPRE: --linklojaoficial--`,

  `📱 OFERTA IMPERDÍVEL!
--produtodescricao--
Preço regular: --precoantigo--
Leve por apenas: --precocomdesconto--
Ou parcele em até 12x
COMPRE JÁ: --linklojaoficial--`,

  `🔥 MEGA DESCONTO 🔥
*--produtodescricao--*
❌ --precoantigo--
✅ --precocomdesconto--
LINK DE COMPRA: --linklojaoficial--`,

  `🏷️ PROMOÇÃO DO DIA 🏷️
--produtodescricao--
De --precoantigo--
Por --precocomdesconto--
Mensal: --precorecorrencia--/mês
🛍️ --linklojaoficial--`,

  `📉 PREÇO CAIU! 📉
--produtodescricao--
DE: --precoantigo--
POR: --precocomdesconto--
COMPRE AGORA: --linklojaoficial--`,

  `🛍️ OPORTUNIDADE ÚNICA!
--produtodescricao--
Valor de mercado: --precoantigo--
Valor promocional: --precocomdesconto--
Assinatura: --precorecorrencia--/mês
Link para compra: --linklojaoficial--`,

  `⚠️ ÚLTIMA CHANCE! ⚠️
--produtodescricao--
Antes custava: --precoantigo--
Hoje apenas: --precocomdesconto--
GARANTA O SEU: --linklojaoficial--`,

  `💡 DICA DE ECONOMIA 💡
--produtodescricao--
Preço normal: --precoantigo--
Preço especial: --precocomdesconto--
ADQUIRA JÁ: --linklojaoficial--`,

  `🤑 ECONOMIA REAL 🤑
--produtodescricao--
De R$ --precoantigo-- 
Por incrível R$ --precocomdesconto--
CONFIRA: --linklojaoficial--`,

  `⭐ OFERTA ESPECIAL ⭐
--produtodescricao--
Era: R$ --precoantigo--
HOJE: R$ --precocomdesconto--
Mensal: R$ --precorecorrencia--/mês
COMPRE AQUI: --linklojaoficial--`,

  `⏱️ TEMPO LIMITADO! ⏱️
--produtodescricao--
Preço antigo: --precoantigo--
Preço atual: --precocomdesconto--
Compre pelo link: --linklojaoficial--`
];

interface RandomMessageButtonProps {
  setTemplateContent: (content: string) => void;
}

export function RandomMessageButton({ setTemplateContent }: RandomMessageButtonProps) {
  const handleGenerateRandom = () => {
    const randomIndex = Math.floor(Math.random() * randomMessages.length);
    setTemplateContent(randomMessages[randomIndex]);
    toast.success('Mensagem aleatória gerada!');
  };

  return (
    <Button 
      onClick={handleGenerateRandom} 
      variant="outline"
      className="w-full flex items-center justify-center mt-4 bg-accent/30 hover:bg-accent/50"
    >
      <Zap className="mr-2 h-4 w-4" />
      Gerar Mensagem Aleatória
    </Button>
  );
}

