import React from 'react';
import { UserManagement } from '@/components/admin/UserManagement';
import { UserManagementProps } from '@/types/admin';

// Mock current user and permissions (comportamento anterior)
const mockCurrentUser = {
  id: '1',
  email: 'admin@esquads.com',
  name: 'João Silva',
  role: {
    id: '1',
    name: 'Administrador',
    description: 'Acesso total',
    permissions: [],
    isCustom: false,
    isSystemRole: true,
  },
  status: 'active' as const,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date(),
};

const mockPermissions = [
  'users.create',
  'users.read',
  'users.update',
  'users.delete',
  'users.bulk_operations',
  'roles.manage',
  'departments.manage',
];

const UsersPage: React.FC = () => {
  const userManagementProps: UserManagementProps = {
    organizationId: 'org-1',
    currentUser: mockCurrentUser,
    permissions: mockPermissions,
  };

  return (
    <div className="container mx-auto p-6">
      <UserManagement {...userManagementProps} />
    </div>
  );
};

export default UsersPage;
