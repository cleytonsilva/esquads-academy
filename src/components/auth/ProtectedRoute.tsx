import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/utils/constants';
import type { UserRole } from '@/services/roleVerificationService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles,
  redirectTo = ROUTES.LOGIN
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const userDashboard = getUserDashboard(user.role);
    return <Navigate to={userDashboard} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    const userDashboard = getUserDashboard(user.role);
    return <Navigate to={userDashboard} replace />;
  }

  return <>{children}</>;
};

// Helper function to get user dashboard based on role
const getUserDashboard = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return ROUTES.ADMIN_DASHBOARD;
    case 'student':
    default:
      return ROUTES.STUDENT_DASHBOARD;
  }
};

// Higher-order component for role-based protection
export const withRoleProtection = (
  Component: React.ComponentType,
  requiredRole?: UserRole,
  allowedRoles?: UserRole[]
) => {
  return (props: any) => (
    <ProtectedRoute requiredRole={requiredRole} allowedRoles={allowedRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Specific role protection components
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
);

export const InstructorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin']}>{children}</ProtectedRoute>
);

export const StudentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin', 'student']}>{children}</ProtectedRoute>
);

export default ProtectedRoute;
