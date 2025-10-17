import React from 'react';
import RoleManagement from '@/components/admin/RoleManagement';
import { Role } from '@/types/admin';

const RolesPage: React.FC = () => {
  const handleRoleChange = (roles: Role[]) => {
    console.log('Roles updated:', roles);
    // Aqui você pode implementar lógica adicional quando os papéis são alterados
    // Por exemplo, atualizar cache, notificar outros componentes, etc.
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <RoleManagement onRoleChange={handleRoleChange} />
    </div>
  );
};

export default RolesPage;