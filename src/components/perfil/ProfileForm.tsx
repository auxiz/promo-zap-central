
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Save, Loader2, Crown } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileFormProps {
  profile: any;
  user: any;
  role: string | null;
  isAdmin: boolean;
  updateProfile: (updates: any) => Promise<any>;
}

export function ProfileForm({ profile, user, role, isAdmin, updateProfile }: ProfileFormProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      setIsUpdating(true);
      await updateProfile({ full_name: fullName });
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
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
    </div>
  );
}
