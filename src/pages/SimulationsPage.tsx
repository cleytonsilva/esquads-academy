// Esquads Academy - Página do Centro de Simulações
import React from 'react';
import { SimulationsCenter } from '@/components/simulations';

const SimulationsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <SimulationsCenter />
      </div>
    </div>
  );
};

export default SimulationsPage;