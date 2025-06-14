
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Save, Loader2, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserRole } from '@/hooks/useUserRole';
import { useVisualFeedback } from '@/hooks/useVisualFeedback';

export function ProfileForm() {
  const { user } = useAuth();
  const { profile, updateProfile, loading: profileLoading } = useUserProfile();
  const { role, isAdmin, loading: roleLoading } = useUserRole();
  const { showSuccess, showError } = useVisualFeedback();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');

  // Update local state when profile loads
  React.useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      setIsUpdating(true);
      await updateProfile({ full_name: fullName });
      showSuccess('Perfil atualizado com sucesso!');
    } catch (error) {
      showError('Erro ao atualizar perfil');
    } finally {
      setIsUpdating(false);
    }
  };

  if (profileLoading || roleLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Carregando perfil...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Pessoais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nome Completo</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Digite seu nome completo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              value={user?.email || ''}
              disabled
              className="pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            O email não pode ser alterado
          </p>
        </div>

        {role && (
          <div className="space-y-2">
            <Label>Tipo de Conta</Label>
            <div className="flex items-center gap-2">
              <Badge 
                variant={isAdmin ? "default" : "secondary"}
                className={isAdmin ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" : ""}
              >
                {isAdmin ? (
                  <>
                    <Crown className="w-3 h-3 mr-1" />
                    Administrador
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3 mr-1" />
                    Usuário
                  </>
                )}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {isAdmin 
                ? "Você tem acesso completo a todas as funcionalidades do sistema."
                : "Você tem acesso às funcionalidades básicas do sistema."
              }
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSaveProfile} disabled={isUpdating}>
            {isUpdating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar Alterações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
