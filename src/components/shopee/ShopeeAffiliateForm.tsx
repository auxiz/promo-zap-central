
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader, Check, AlertTriangle, Link, Eye, EyeOff, Key } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useShopeeDirectConversion } from '@/hooks/useShopeeDirectConversion';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  appId: z.string().min(1, 'App ID é obrigatório'),
  secretKey: z.string().min(1, 'Secret Key é obrigatória'),
  originalUrl: z.string().url('URL inválida').min(1, 'URL é obrigatória')
});

type FormValues = z.infer<typeof formSchema>;

export function ShopeeAffiliateForm() {
  const [showSecretKey, setShowSecretKey] = useState(false);
  const { convertUrl, convertedUrl, isConverting, error } = useShopeeDirectConversion();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      appId: '',
      secretKey: '',
      originalUrl: ''
    }
  });
  
  const onSubmit = async (data: FormValues) => {
    await convertUrl(data);
  };
  
  const toggleSecretVisibility = () => {
    setShowSecretKey(!showSecretKey);
  };
  
  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="appId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>App ID</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Insira seu App ID da Shopee Afiliados"
                      disabled={isConverting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="secretKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret Key</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        type={showSecretKey ? "text" : "password"}
                        className="pl-10 pr-10"
                        placeholder="Insira sua Secret Key da Shopee Afiliados"
                        disabled={isConverting}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={toggleSecretVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        aria-label={showSecretKey ? "Ocultar Secret Key" : "Mostrar Secret Key"}
                      >
                        {showSecretKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="originalUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL da Shopee</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Cole o link da Shopee que deseja converter"
                    disabled={isConverting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button
            type="submit"
            disabled={isConverting}
            className="w-full bg-primary text-primary-foreground flex items-center justify-center gap-2"
          >
            {isConverting ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Convertendo...
              </>
            ) : (
              <>
                <Link className="h-4 w-4" />
                Converter
              </>
            )}
          </Button>
        </form>
      </Form>
      
      {convertedUrl && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">Link convertido com sucesso!</p>
              <p className="text-sm text-green-600 mt-1 break-all">{convertedUrl}</p>
              <div className="mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 border-green-200"
                  onClick={() => {
                    navigator.clipboard.writeText(convertedUrl);
                    // You could add a toast notification here
                  }}
                >
                  Copiar Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Erro na conversão</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
