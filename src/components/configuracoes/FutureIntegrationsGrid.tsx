
import { FutureIntegrationCard } from './FutureIntegrationCard';

export function FutureIntegrationsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <FutureIntegrationCard title="Amazon" />
      <FutureIntegrationCard title="Magalu" />
      <FutureIntegrationCard title="Natura" />
    </div>
  );
}
