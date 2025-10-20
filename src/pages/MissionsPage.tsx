import React from 'react';
import { MissionsHub } from '@/components/missions';

export default function MissionsPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <MissionsHub />
      </div>
    </div>
  );
}