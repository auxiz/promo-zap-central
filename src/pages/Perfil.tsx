
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileForm } from '@/components/perfil/ProfileForm';
import { NotificationsTab } from '@/components/perfil/NotificationsTab';
import { PrivacyTab } from '@/components/perfil/PrivacyTab';
import { AppearanceTab } from '@/components/perfil/AppearanceTab';
import { AccessibilityTab } from '@/components/perfil/AccessibilityTab';
import { User, Bell, Shield, Palette, Eye } from 'lucide-react';

export default function Perfil() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Perfil do Usuário</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacidade</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Aparência</span>
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Acessibilidade</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <ProfileForm />
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <NotificationsTab />
          </TabsContent>

          <TabsContent value="privacy" className="mt-6">
            <PrivacyTab />
          </TabsContent>

          <TabsContent value="appearance" className="mt-6">
            <AppearanceTab />
          </TabsContent>

          <TabsContent value="accessibility" className="mt-6">
            <AccessibilityTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
