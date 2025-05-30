
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown, User } from 'lucide-react';
import { generateRandomAvatar, generateInitialsAvatar } from '@/utils/avatarGenerator';

interface ProfileAvatarProps {
  profile: any;
  user: any;
  isAdmin: boolean;
  role: string | null;
}

export function ProfileAvatar({ profile, user, isAdmin, role }: ProfileAvatarProps) {
  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Usuário';

  const getAvatarUrl = () => {
    if (profile?.avatar_url) {
      return profile.avatar_url;
    }
    if (user?.id) {
      return generateRandomAvatar(user.id, 80);
    }
    return null;
  };

  const avatarUrl = getAvatarUrl();
  const initialsData = generateInitialsAvatar(displayName, user?.email);

  return (
    <div className="flex items-center space-x-4">
      <Avatar className="h-20 w-20">
        <AvatarImage 
          src={avatarUrl || undefined} 
          alt="Avatar"
          className="object-cover"
        />
        <AvatarFallback 
          className="text-lg font-medium"
          style={{
            backgroundColor: initialsData.backgroundColor,
            color: initialsData.textColor,
          }}
        >
          {initialsData.initials}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-medium">Foto do Perfil</h3>
          {isAdmin && (
            <Badge variant="default" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
              <Crown className="w-3 h-3 mr-1" />
              Admin
            </Badge>
          )}
          {role === 'user' && (
            <Badge variant="secondary">
              <User className="w-3 h-3 mr-1" />
              Usuário
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Upload de avatar será implementado em breve
        </p>
      </div>
    </div>
  );
}
