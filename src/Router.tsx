
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';

// Import pages
import Index from './pages/Index';
import Mensagens from './pages/Mensagens';
import Configuracoes from './pages/Configuracoes';
import ConfigShopee from './pages/ConfigShopee';
import ShopeeOAuthCallback from './pages/ShopeeOAuthCallback';
import GruposMonitorados from './pages/GruposMonitorados';
import GruposEnvio from './pages/GruposEnvio';
import WhatsAppConexao from './pages/WhatsAppConexao';
import NotFound from './pages/NotFound';

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Index />} />
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path="config-shopee" element={<ConfigShopee />} />
          <Route path="config-shopee/callback" element={<ShopeeOAuthCallback />} />
          <Route path="mensagens" element={<Mensagens />} />
          <Route path="grupos-monitorados" element={<GruposMonitorados />} />
          <Route path="grupos-envio" element={<GruposEnvio />} />
          <Route path="whatsapp-conexao" element={<WhatsAppConexao />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}
