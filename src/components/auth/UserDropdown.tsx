
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
import { generateRandomAvatar, generateInitialsAvatar } from '@/utils/avatarGenerator';

export default function UserDropdown() {
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();
  const { role, isAdmin } = useUserRole();
  const navigate = useNavigate();

  if (!user) return null;

  const handleNavigateToProfile = () => {
    navigate('/perfil');
  };

  const displayName = profile?.full_name || user.user_metadata?.full_name || 'Usuário';

  // Avatar logic: use profile avatar, then random avatar, then initials
  const getAvatarUrl = () => {
    if (profile?.avatar_url) {
      return profile.avatar_url;
    }
    // Generate consistent random avatar based on user ID
    return generateRandomAvatar(user.id, 32);
  };

  const avatarUrl = getAvatarUrl();
  const initialsData = generateInitialsAvatar(displayName, user.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-8 w-8 rounded-full border-2 border-transparent hover:border-border focus:border-primary transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={avatarUrl} 
              alt={displayName}
              className="object-cover"
            />
            <AvatarFallback 
              className="text-sm font-medium"
              style={{
                backgroundColor: initialsData.backgroundColor,
                color: initialsData.textColor,
              }}
            >
              {initialsData.initials}
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
                <Crown className="h-3 w-3 text-yellow-500" aria-label="Administrador" />
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
