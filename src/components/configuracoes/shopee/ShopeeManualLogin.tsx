
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, KeyRound } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { API_BASE } from '@/utils/api-constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useShopeeManualLogin } from '@/hooks/useShopeeManualLogin';

export function ShopeeManualLogin() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { isLoading, loginStatus, startLogin, checkLoginStatus } = useShopeeManualLogin();
  
  const handleStartLogin = async () => {
    try {
      await startLogin();
      setDialogOpen(true);
    } catch (error) {
      console.error("Error starting Shopee login:", error);
      toast.error("Erro ao iniciar login na Shopee");
    }
  };
  
  const handleCheckStatus = async () => {
    await checkLoginStatus();
  };
  
  return (
    <Card className="dashboard-card overflow-hidden">
      <div className="border-b p-4 bg-card">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Login Manual Shopee</h2>
          <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">
            Solução Temporária
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Login Manual na Shopee</h3>
          <p className="text-muted-foreground mb-4">
            Esta é uma solução temporária para login na Shopee enquanto aguardamos a integração completa via API OAuth.
          </p>
          <p className="text-muted-foreground mb-4">
            Ao clicar no botão abaixo, um navegador Chromium será aberto com a página de login da Shopee. 
            Faça login com suas credenciais e complete qualquer verificação CAPTCHA necessária.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Button 
              onClick={handleStartLogin}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <KeyRound size={16} />
              Iniciar Login na Shopee
            </Button>
            <Button 
              variant="outline"
              onClick={handleCheckStatus}
              disabled={isLoading}
            >
              Verificar Status de Login
            </Button>
          </div>
        </div>
        
        <div className="bg-muted p-4 rounded text-sm">
          <p className="font-medium mb-2">Como funciona?</p>
          <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
            <li>Ao clicar em "Iniciar Login", uma janela do navegador Chromium será aberta</li>
            <li>Faça login com sua conta Shopee normalmente</li>
            <li>Complete qualquer verificação CAPTCHA necessária</li>
            <li>Após o login bem-sucedido, você pode fechar o navegador</li>
            <li>Os cookies de autenticação serão salvos para uso nas funções de afiliados</li>
            <li>Use o botão "Verificar Status" para confirmar se o login está ativo</li>
          </ol>
          <p className="text-amber-600 mt-3 text-xs">
            Nota: Esta função será substituída pela autenticação via OAuth quando a integração API estiver completa
          </p>
        </div>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Shopee em Andamento</DialogTitle>
            <DialogDescription>
              Uma janela de navegador foi aberta para você fazer login na Shopee.
              Por favor, faça o login normalmente, incluindo qualquer verificação CAPTCHA, e feche o navegador quando terminar.
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            <p>Instruções de login:</p>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>Insira seu e-mail e senha da Shopee</li>
              <li>Complete qualquer verificação CAPTCHA ou "Não sou um robô" se solicitado</li>
              <li>Após fazer login com sucesso, você pode fechar a janela do navegador</li>
              <li>Verifique se o login foi bem-sucedido usando o botão "Verificar Status"</li>
            </ol>
          </div>
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
            >
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
