
import { Route, Routes } from 'react-router-dom';
import Layout from '@/components/layout/Layout';

// Pages
import Index from '@/pages/Index';
import Mensagens from '@/pages/Mensagens';
import GruposMonitorados from '@/pages/GruposMonitorados';
import GruposEnvio from '@/pages/GruposEnvio';
import WhatsAppConexao from '@/pages/WhatsAppConexao';
import Configuracoes from '@/pages/Configuracoes';
import NotFound from '@/pages/NotFound';

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Index /></Layout>} />
      <Route path="/mensagens" element={<Layout><Mensagens /></Layout>} />
      <Route path="/grupos-monitorados" element={<Layout><GruposMonitorados /></Layout>} />
      <Route path="/grupos-envio" element={<Layout><GruposEnvio /></Layout>} />
      <Route path="/whatsapp-conexao" element={<Layout><WhatsAppConexao /></Layout>} />
      <Route path="/configuracoes" element={<Layout><Configuracoes /></Layout>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
