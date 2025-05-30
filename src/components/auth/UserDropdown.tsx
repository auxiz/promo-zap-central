
import { User, LogOut, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserRole } from '@/hooks/useUserRole';

export default function UserDropdown() {
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();
  const { role, isAdmin } = useUserRole();
  const navigate = useNavigate();

  if (!user) return null;

  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'AA';
  };

  const handleNavigateToProfile = () => {
    navigate('/perfil');
  };

  const displayName = profile?.full_name || user.user_metadata?.full_name || 'Usuário';

  // Default avatar SVG as data URL
  const defaultAvatar = "data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='50' cy='50' r='50' fill='%23e5e7eb'/%3e%3ccircle cx='50' cy='35' r='12' fill='%239ca3af'/%3e%3cpath d='M50 55c-8 0-15 4-19 10v10c0 8 6 15 14 15h10c8 0 14-7 14-15v-10c-4-6-11-10-19-10z' fill='%239ca3af'/%3e%3c/svg%3e";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-8 w-8 rounded-full border-2 border-transparent hover:border-border focus:border-primary transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={profile?.avatar_url || defaultAvatar} 
              alt={displayName}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {getInitials(displayName, user.email)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 bg-background border shadow-lg z-50" 
        align="end" 
        forceMount
        sideOffset={5}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none flex items-center gap-2">
              {displayName}
              {isAdmin && (
                <Crown className="h-3 w-3 text-yellow-500" title="Administrador" />
              )}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {role && (
              <p className="text-xs leading-none text-muted-foreground capitalize">
                {role === 'admin' ? 'Administrador' : 'Usuário'}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleNavigateToProfile}
          className="cursor-pointer hover:bg-accent"
        >
          <User className="mr-2 h-4 w-4" />
          <span>Minha Conta</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => signOut()}
          className="cursor-pointer hover:bg-accent text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
