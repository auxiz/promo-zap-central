
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ModernAuthPage from "@/components/auth/ModernAuthPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminRoute from "@/components/admin/AdminRoute";
import Layout from "@/components/layout/Layout";
import Index from "@/pages/Index";
import WhatsAppConexao from "@/pages/WhatsAppConexao";
import GruposMonitorados from "@/pages/GruposMonitorados";
import GruposEnvio from "@/pages/GruposEnvio";
import Mensagens from "@/pages/Mensagens";
import Configuracoes from "@/pages/Configuracoes";
import Perfil from "@/pages/Perfil";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";
import { Loader2 } from "lucide-react";

export default function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, show auth page
  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={<ModernAuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  // If user is logged in, show protected routes
  return (
    <Routes>
      <Route path="/auth" element={<Navigate to="/" replace />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Index />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/whatsapp-conexao" element={
        <ProtectedRoute>
          <Layout>
            <WhatsAppConexao />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/grupos-monitorados" element={
        <ProtectedRoute>
          <Layout>
            <GruposMonitorados />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/grupos-envio" element={
        <ProtectedRoute>
          <Layout>
            <GruposEnvio />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/mensagens" element={
        <ProtectedRoute>
          <Layout>
            <Mensagens />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/configuracoes" element={
        <ProtectedRoute>
          <Layout>
            <Configuracoes />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/perfil" element={
        <ProtectedRoute>
          <Layout>
            <Perfil />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminRoute>
            <Layout>
              <Admin />
            </Layout>
          </AdminRoute>
        </ProtectedRoute>
      } />
      {/* Redirect old configuracoes-usuario route to perfil */}
      <Route path="/configuracoes-usuario" element={<Navigate to="/perfil" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
