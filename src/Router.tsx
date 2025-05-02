
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Index from '@/pages/Index';
import WhatsAppConexao from '@/pages/WhatsAppConexao';
import GruposMonitorados from '@/pages/GruposMonitorados';
import GruposEnvio from '@/pages/GruposEnvio';
import Mensagens from '@/pages/Mensagens';
import Configuracoes from '@/pages/Configuracoes';
import ConfigShopee from '@/pages/ConfigShopee';
import ShopeeOAuthCallback from '@/pages/ShopeeOAuthCallback';
import NotFound from '@/pages/NotFound';
import { Outlet } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout>
      <Outlet />
    </Layout>,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Index />
      },
      {
        path: "/whatsapp",
        element: <WhatsAppConexao />
      },
      {
        path: "/grupos-monitorados",
        element: <GruposMonitorados />
      },
      {
        path: "/grupos-envio",
        element: <GruposEnvio />
      },
      {
        path: "/mensagens",
        element: <Mensagens />
      },
      {
        path: "/configuracoes",
        element: <Configuracoes />
      },
      {
        path: "/config-shopee",
        element: <ConfigShopee />
      }
    ]
  },
  {
    path: "/config-shopee/callback",
    element: <ShopeeOAuthCallback />
  }
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
