
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const randomMessages = [
  `🔥 SUPER DEAL: --produtodescricao--
From: ~R$ --precoantigo--~
Now: *R$ --precocomdesconto--*
BUY: --linklojaoficial--`,

  `⚡️ FLASH SALE ⚡️
--produtodescricao--
❌ Original: --precoantigo--
✅ Today only: --precocomdesconto--
🛒 SHOP NOW: --linklojaoficial--`,

  `🎯 DON'T MISS THIS!
--produtodescricao--
From --precoantigo--
NOW ONLY --precocomdesconto--
👉 --linklojaoficial--`,

  `🚨 LIMITED OFFER 🚨
--produtodescricao--
Was: --precoantigo--
Price now: --precocomdesconto--
Monthly option: --precorecorrencia--/month
🛍️ SHOP: --linklojaoficial--`,

  `✨ EXCLUSIVE DISCOUNT ✨
--produtodescricao--
Regular price: --precoantigo--
Your price today: --precocomdesconto--
ORDER NOW: --linklojaoficial--`
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
