
import React from 'react';
import { Card } from '@/components/ui/card';
import InstructionSteps from './InstructionSteps';

export default function Instructions() {
  return (
    <Card className="dashboard-card">
      <div className="border-b p-6">
        <h2 className="text-xl font-medium">Instruções</h2>
      </div>
      
      <div className="p-6">
        <InstructionSteps />
      </div>
    </Card>
  );
}
