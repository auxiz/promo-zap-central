
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, KeyRound } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useShopeeManualLogin } from '@/hooks/useShopeeManualLogin';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export function ShopeeManualLogin() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { isLoading, loginStatus, startLogin, checkLoginStatus } = useShopeeManualLogin();
  
  const handleStartLogin = async () => {
    try {
      const success = await startLogin();
      if (success) {
        setDialogOpen(true);
      }
    } catch (error) {
      console.error("Error starting Shopee login:", error);
      toast.error("Erro ao iniciar login na Shopee Afiliados");
    }
  };
  
  const handleCheckStatus = async () => {
    await checkLoginStatus();
  };
  
  return (
    <Card className="dashboard-card overflow-hidden">
      <div className="border-b p-4 bg-card">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Login Manual Shopee Afiliados</h2>
          <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">
            Solução Alternativa
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <Alert className="mb-6">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Este método é uma alternativa ao fluxo OAuth oficial. Recomendamos usar a autenticação OAuth 
            quando possível para melhor integração com a API da Shopee.
          </AlertDescription>
        </Alert>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Login na Plataforma de Afiliados Shopee</h3>
          <p className="text-muted-foreground mb-4">
            Este método abre uma janela pop-up para login manual na plataforma de afiliados da Shopee.
            Você precisará inserir suas credenciais e confirmar captchas manualmente.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Button 
              onClick={handleStartLogin}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <KeyRound size={16} />
              Iniciar Login na Shopee Afiliados
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
            <li>Ao clicar em "Iniciar Login", uma janela pop-up será aberta com a plataforma de afiliados Shopee</li>
            <li>Faça login com sua conta Shopee normalmente</li>
            <li>Complete qualquer verificação CAPTCHA necessária</li>
            <li>Após o login bem-sucedido, você pode fechar a janela pop-up</li>
            <li>Os cookies de autenticação serão salvos para uso nas funções de afiliados</li>
            <li>Use o botão "Verificar Status" para confirmar se o login está ativo</li>
          </ol>
          <div className="mt-4 flex items-start gap-2">
            <ExternalLink size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-amber-600 text-xs">
              Recomendamos utilizar o método de autenticação OAuth na aba "Autenticação OAuth API" 
              para acesso completo às funcionalidades de afiliado
            </p>
          </div>
        </div>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Shopee Afiliados em Andamento</DialogTitle>
            <DialogDescription>
              Uma janela pop-up para login na plataforma de afiliados Shopee foi aberta.
              Por favor, faça o login normalmente, incluindo qualquer verificação CAPTCHA, e feche a janela quando terminar.
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            <p>Instruções de login:</p>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>Insira seu e-mail e senha da Shopee</li>
              <li>Complete qualquer verificação CAPTCHA ou "Não sou um robô" se solicitado</li>
              <li>Após fazer login com sucesso, você pode fechar a janela pop-up</li>
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
