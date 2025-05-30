
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Crown, User, MoreHorizontal, UserCheck, UserX, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { generateRandomAvatar, generateInitialsAvatar } from '@/utils/avatarGenerator';
import { useAdminUsers } from '@/hooks/useAdminUsers';

export function AdminUsersTab() {
  const { data, loading, error, refetch, toggleUserRole } = useAdminUsers();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Erro ao carregar usuários: {error}</p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </Card>
    );
  }

  const users = data?.users || [];
  const stats = data?.stats || { totalUsers: 0, adminCount: 0, activeInstances: 0 };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total de Usuários</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.adminCount}</div>
            <div className="text-sm text-muted-foreground">Administradores</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.activeInstances}</div>
            <div className="text-sm text-muted-foreground">Instâncias Ativas</div>
          </div>
        </Card>
      </div>

      {/* Lista de usuários */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Gerenciamento de Usuários</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {users.length} usuários
              </Badge>
              <Button onClick={refetch} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Último Login</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const avatarUrl = user.avatar_url || generateRandomAvatar(user.id, 32);
                const initialsData = generateInitialsAvatar(user.full_name || 'User', user.email);
                
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={avatarUrl} alt={user.full_name} />
                          <AvatarFallback 
                            style={{
                              backgroundColor: initialsData.backgroundColor,
                              color: initialsData.textColor,
                            }}
                          >
                            {initialsData.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {user.full_name || 'Sem nome'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{user.email}</span>
                        {!user.email_confirmed_at && (
                          <Badge variant="destructive" className="text-xs w-fit mt-1">
                            Email não confirmado
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.role === 'admin' ? 'default' : 'secondary'}
                        className={user.role === 'admin' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : ''}
                      >
                        {user.role === 'admin' ? (
                          <>
                            <Crown className="w-3 h-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 mr-1" />
                            Usuário
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.last_sign_in_at ? (
                        new Date(user.last_sign_in_at).toLocaleString('pt-BR')
                      ) : (
                        <span className="text-muted-foreground">Nunca</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => toggleUserRole(user.id, user.role)}
                          >
                            {user.role === 'admin' ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                Remover Admin
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Tornar Admin
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
