import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthPage from "@/components/auth/AuthPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminRoute from "@/components/admin/AdminRoute";
import Layout from "@/components/layout/Layout";
import { Loader2 } from "lucide-react";
import { EnhancedFeedback } from "@/components/ui/EnhancedFeedback";
import { ErrorBoundary } from "react-error-boundary";

// Lazy load das páginas principais para otimizar bundle
const Index = lazy(() => import("@/pages/Index"));
const WhatsAppConexao = lazy(() => import("@/pages/WhatsAppConexao"));
const GruposMonitorados = lazy(() => import("@/pages/GruposMonitorados"));
const GruposEnvio = lazy(() => import("@/pages/GruposEnvio"));
const Mensagens = lazy(() => import("@/pages/Mensagens"));
const Configuracoes = lazy(() => import("@/pages/Configuracoes"));
const Perfil = lazy(() => import("@/pages/Perfil"));
const Admin = lazy(() => import("@/pages/Admin"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Componente de loading para rotas
const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <EnhancedFeedback
      type="loading"
      title="Carregando página..."
      message="Aguarde enquanto preparamos o conteúdo."
    />
  </div>
);

// Componente de erro para rotas
const RouteErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="min-h-screen flex items-center justify-center">
    <EnhancedFeedback
      type="error"
      title="Erro ao carregar página"
      message="Ocorreu um erro inesperado ao carregar esta página."
      action={{
        label: "Tentar novamente",
        onClick: resetErrorBoundary
      }}
    />
  </div>
);

// HOC para wrapping lazy routes com erro handling
const withLazyRoute = (Component: React.LazyExoticComponent<React.ComponentType<any>>) => {
  return (props: any) => (
    <ErrorBoundary FallbackComponent={RouteErrorFallback}>
      <Suspense fallback={<RouteLoader />}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

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
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  // If user is logged in, show protected routes with lazy loading
  return (
    <Routes>
      <Route path="/auth" element={<Navigate to="/" replace />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            {withLazyRoute(Index)({})}
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/whatsapp-conexao" element={
        <ProtectedRoute>
          <Layout>
            {withLazyRoute(WhatsAppConexao)({})}
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/grupos-monitorados" element={
        <ProtectedRoute>
          <Layout>
            {withLazyRoute(GruposMonitorados)({})}
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/grupos-envio" element={
        <ProtectedRoute>
          <Layout>
            {withLazyRoute(GruposEnvio)({})}
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/mensagens" element={
        <ProtectedRoute>
          <Layout>
            {withLazyRoute(Mensagens)({})}
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/configuracoes" element={
        <ProtectedRoute>
          <Layout>
            {withLazyRoute(Configuracoes)({})}
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/perfil" element={
        <ProtectedRoute>
          <Layout>
            {withLazyRoute(Perfil)({})}
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminRoute>
            <Layout>
              {withLazyRoute(Admin)({})}
            </Layout>
          </AdminRoute>
        </ProtectedRoute>
      } />
      {/* Redirect old configuracoes-usuario route to perfil */}
      <Route path="/configuracoes-usuario" element={<Navigate to="/perfil" replace />} />
      <Route path="*" element={withLazyRoute(NotFound)({})} />
    </Routes>
  );
}
