import Reports from '@/pages/admin/Reports';
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleVerification } from '@/hooks/useRoleVerification';
import { RoleProtectedRoute, AdminProtectedRoute, StudentProtectedRoute, AuthProtectedRoute, PublicRoute } from '@/components/auth/RoleProtectedRoute';
import { navigationMiddleware } from '@/middleware/navigationMiddleware';
import { ROUTES } from '@/utils/constants';
import { supabase } from '@/integrations/supabase/client';

// Layouts
import { AuthLayout } from '@/layouts/AuthLayout';
import { StudentLayout } from '@/layouts/StudentLayout';
// Removed InstructorLayout routes
import { AdminLayout } from '@/layouts/AdminLayout';

// Auth Pages
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { ResetPassword } from '@/pages/auth/ResetPassword';

// Dashboard Pages
import { StudentDashboard } from '@/pages/student/Dashboard';
// Removed instructor pages
import AdminDashboard from '@/pages/admin/Dashboard';

// Student Pages
import StudentGamification from '@/pages/student/Gamification';
import StudentCourses from '@/pages/student/Courses';
import StudentCourseDetail from '@/pages/student/CourseDetail';
import StudentCertificates from '@/pages/student/Certificates';
import StudentMissions from '@/pages/student/Missions';
import StudentProfile from '@/pages/student/Profile';
import StudentAchievements from '@/pages/student/Achievements';
import StudentLeaderboard from '@/pages/student/Leaderboard';
import StudentMission from '@/pages/student/Mission';
import StudentPaths from '@/pages/student/Paths';
import StudentPathDetail from '@/pages/student/PathDetail';
import StudentExams from '@/pages/student/Exams';
import { StudentSocial } from '@/pages/student/Social';

// Test Pages
import TestMissions from '@/pages/test/TestMissions';

// Public Pages
import CertificateVerification from '@/pages/CertificateVerification';
// Landing
import LandingPage from '@/pages/landing/src/pages/LandingPage';

// Instructor Pages
import { CourseCreationWizard } from '@/components/course/CourseCreationWizard';

// Admin Pages
import { AdminCourses } from '@/pages/admin/Courses';
import AdminBadges from '@/pages/admin/Badges';
import AdminAchievements from '@/pages/admin/AdminAchievements';
import AdminMissions from '@/pages/admin/Missions';
import AdminPaths from '@/pages/admin/Paths';
import AdminUsers from '@/pages/admin/Users';
import AdminRoles from '@/pages/admin/Roles';
import AdminAnalytics from '@/pages/admin/Analytics';
import AdminProfile from '@/pages/admin/Profile';
import AdminSettings from '@/pages/admin/Settings';
import CertificateDesigner from '@/pages/admin/CertificateDesigner';
import AdminExams from '@/pages/admin/Exams';

// Admin AI Pages
import AIGenerator from '@/pages/admin/AIGenerator';
import AITemplates from '@/pages/admin/AITemplates';
import AIQuality from '@/pages/admin/AIQuality';

/**
 * Componente interno para gerenciar navegação com middleware
 */
const NavigationManager: React.FC = () => {
  const { user, loading } = useAuth();
  const { role, isLoading: roleLoading, isVerified } = useRoleVerification();
  const location = useLocation();
  const navigate = useNavigate();

  // Helper: verificar se é rota pública
  const isPublicRoute = (path: string): boolean => {
    const publicRoutes = [
      ROUTES.HOME,
      ROUTES.LOGIN,
      ROUTES.REGISTER,
      ROUTES.FORGOT_PASSWORD,
      '/reset-password',
      '/certificate/verify'
    ];
    return publicRoutes.some(route => path === route || path.startsWith('/certificate/verify/'));
  };

  // CORREÇÃO 1: Lógica de redirecionamento mais simples e confiável
  useEffect(() => {
    const currentPath = location.pathname;
    const isPublic = isPublicRoute(currentPath);

    // Não fazer nada em rotas públicas
    if (isPublic) {
      return;
    }

    // Aguardar carregamento completo
    if (loading || roleLoading || !isVerified) {
      return;
    }

    // Se não há usuário, redirecionar para login
    if (!user) {
      console.log('🔄 No user, redirecting to login');
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }

    // Se não há role verificada, aguardar
    if (!role) {
      return;
    }

    // CORREÇÃO 2: Verificação de rota baseada em role mais precisa
    const isAdminRoute = currentPath.startsWith('/admin');
    const isStudentRoute = currentPath.startsWith('/student');

    // Redirecionar admin para área correta
    if (role === 'admin' && !isAdminRoute) {
      console.log('🔄 Admin user, redirecting to admin area');
      navigate('/admin', { replace: true });
      return;
    }

    // Redirecionar student para área correta
    if (role === 'student' && !isStudentRoute) {
      console.log('🔄 Student user, redirecting to student area');
      navigate('/student', { replace: true });
      return;
    }

    // Bloquear student de acessar área admin
    if (role === 'student' && isAdminRoute) {
      console.log('🚫 Student trying to access admin area, redirecting to student');
      navigate('/student', { replace: true });
      return;
    }

  }, [location.pathname, user, role, loading, roleLoading, isVerified, navigate]);

  // CORREÇÃO 3: Spinner mais inteligente - só mostrar quando realmente necessário
  const shouldShowSpinner = () => {
    const isPublic = isPublicRoute(location.pathname);
    
    // Nunca mostrar spinner em rotas públicas
    if (isPublic) return false;
    
    // Mostrar spinner apenas se está carregando autenticação OU role E tem usuário
    return (loading || (roleLoading && user)) && !isVerified;
  };

  if (shouldShowSpinner()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Verificando permissões...</p>
          <p className="text-gray-500 text-sm mt-2">Aguarde enquanto validamos seu acesso</p>
        </div>
      </div>
    );
  }

  return <AppRoutes />;
};

/**
 * Componente com as rotas da aplicação
 */
const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  const { getCorrectPanel } = useRoleVerification();

  const getDefaultRoute = () => {
    if (!user) return ROUTES.LOGIN;
    return getCorrectPanel();
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/certificate/verify/:hash" element={
        <PublicRoute>
          <CertificateVerification />
        </PublicRoute>
      } />
      
      {/* Auth Routes */}
      <Route path={ROUTES.LOGIN} element={
        <PublicRoute>
          <AuthLayout>
            <Login />
          </AuthLayout>
        </PublicRoute>
      } />
      <Route path={ROUTES.REGISTER} element={
        <PublicRoute>
          <AuthLayout>
            <Register />
          </AuthLayout>
        </PublicRoute>
      } />
      <Route path={ROUTES.FORGOT_PASSWORD} element={
        <PublicRoute>
          <AuthLayout>
            <ForgotPassword />
          </AuthLayout>
        </PublicRoute>
      } />
      <Route path="/reset-password" element={
        <PublicRoute>
          <AuthLayout>
            <ResetPassword />
          </AuthLayout>
        </PublicRoute>
      } />

      {/* Student Routes */}
      <Route path={ROUTES.STUDENT_DASHBOARD} element={
        <StudentProtectedRoute>
          <StudentLayout>
            <StudentDashboard />
          </StudentLayout>
        </StudentProtectedRoute>
      } />
      <Route path={ROUTES.STUDENT_COURSES} element={
        <StudentProtectedRoute>
          <StudentLayout>
            <StudentCourses />
          </StudentLayout>
        </StudentProtectedRoute>
      } />
      <Route path={ROUTES.STUDENT_COURSE_DETAIL} element={
        <StudentProtectedRoute>
          <StudentLayout>
            <StudentCourseDetail />
          </StudentLayout>
        </StudentProtectedRoute>
      } />
      <Route path={ROUTES.STUDENT_GAMIFICATION} element={
        <StudentProtectedRoute>
          <StudentLayout>
            <StudentGamification />
          </StudentLayout>
        </StudentProtectedRoute>
      } />
      <Route path="/student/certificates" element={
        <StudentProtectedRoute>
          <StudentLayout>
            <StudentCertificates />
          </StudentLayout>
        </StudentProtectedRoute>
      } />
      <Route path={ROUTES.STUDENT_MISSIONS} element={
        <StudentProtectedRoute>
          <StudentLayout>
            <StudentMissions />
          </StudentLayout>
        </StudentProtectedRoute>
      } />
      <Route path={ROUTES.STUDENT_PATHS} element={
        <StudentProtectedRoute>
          <StudentLayout>
            <StudentPaths />
          </StudentLayout>
        </StudentProtectedRoute>
      } />
      <Route path={ROUTES.STUDENT_PATH_DETAIL} element={
        <StudentProtectedRoute>
          <StudentLayout>
            <StudentPathDetail />
          </StudentLayout>
        </StudentProtectedRoute>
      } />
      <Route path="/student/missions/:id" element={
        <StudentProtectedRoute>
          <StudentLayout>
            <StudentMission />
          </StudentLayout>
        </StudentProtectedRoute>
      } />
      <Route path={ROUTES.STUDENT_PROFILE} element={
        <StudentProtectedRoute>
          <StudentLayout>
            <StudentProfile />
          </StudentLayout>
        </StudentProtectedRoute>
      } />
      <Route path={ROUTES.STUDENT_ACHIEVEMENTS} element={
        <StudentProtectedRoute>
          <StudentLayout>
            <StudentAchievements />
          </StudentLayout>
        </StudentProtectedRoute>
      } />
      {/* Compat: rota alternativa para 'archivments' */}
      <Route path={'/student/archivments'} element={
        <StudentProtectedRoute>
          <StudentLayout>
            <StudentAchievements />
          </StudentLayout>
        </StudentProtectedRoute>
      } />
      <Route path={ROUTES.STUDENT_LEADERBOARD} element={
        <StudentProtectedRoute>
          <StudentLayout>
            <StudentLeaderboard />
          </StudentLayout>
        </StudentProtectedRoute>
      } />

      <Route path={ROUTES.STUDENT_EXAMS} element={
        <StudentProtectedRoute>
          <StudentLayout>
            <StudentExams />
          </StudentLayout>
        </StudentProtectedRoute>
      } />
      <Route path={ROUTES.STUDENT_SOCIAL} element={
        <StudentProtectedRoute>
          <StudentLayout>
            <StudentSocial />
          </StudentLayout>
        </StudentProtectedRoute>
      } />

      {/* Test Routes - Development Only */}
      {process.env.NODE_ENV === 'development' && (
        <Route path="/test/missions" element={
          <StudentProtectedRoute>
            <StudentLayout>
              <TestMissions />
            </StudentLayout>
          </StudentProtectedRoute>
        } />
      )}

      {/* Admin Course Wizard */}
      <Route path="/admin/courses/wizard" element={
        <AdminProtectedRoute>
          <AdminLayout>
            <CourseCreationWizard />
          </AdminLayout>
        </AdminProtectedRoute>
      } />

      <Route path={ROUTES.ADMIN_EXAMS} element={
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminExams />
          </AdminLayout>
        </AdminProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path={ROUTES.ADMIN_DASHBOARD} element={
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </AdminProtectedRoute>
      } />
      <Route path={ROUTES.ADMIN_COURSES} element={
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminCourses />
          </AdminLayout>
        </AdminProtectedRoute>
      } />
      <Route path={ROUTES.ADMIN_BADGES} element={
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminBadges />
          </AdminLayout>
        </AdminProtectedRoute>
      } />
      <Route path={ROUTES.ADMIN_ACHIEVEMENTS} element={
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminAchievements />
          </AdminLayout>
        </AdminProtectedRoute>
      } />
      <Route path={ROUTES.ADMIN_PATHS} element={
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminPaths />
          </AdminLayout>
        </AdminProtectedRoute>
      } />
      <Route path={ROUTES.ADMIN_MISSIONS} element={
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminMissions />
          </AdminLayout>
        </AdminProtectedRoute>
      } />
      <Route path="/admin/certificates/designer" element={
        <AdminProtectedRoute>
          <AdminLayout>
            <CertificateDesigner />
          </AdminLayout>
        </AdminProtectedRoute>
      } />
      <Route path={ROUTES.ADMIN_USERS} element={
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminUsers />
          </AdminLayout>
        </AdminProtectedRoute>
      } />
      <Route path={ROUTES.ADMIN_ROLES} element={
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminRoles />
          </AdminLayout>
        </AdminProtectedRoute>
      } />
      <Route path={ROUTES.ADMIN_ANALYTICS} element={
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminAnalytics />
          </AdminLayout>
        </AdminProtectedRoute>
      } />
      <Route path={ROUTES.ADMIN_SETTINGS} element={
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminSettings />
          </AdminLayout>
        </AdminProtectedRoute>
      } />
      <Route path={ROUTES.ADMIN_PROFILE} element={
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminProfile />
          </AdminLayout>
        </AdminProtectedRoute>
      } />
            <Route path={ROUTES.ADMIN_REPORTS} element={
        <AdminProtectedRoute>
          <AdminLayout>
            <Reports />
          </AdminLayout>
        </AdminProtectedRoute>
      } />

      {/* Admin AI Routes */}
      <Route path="/admin/ai-generator" element={
        <AdminProtectedRoute>
          <AdminLayout>
            <AIGenerator />
          </AdminLayout>
        </AdminProtectedRoute>
      } />
      <Route path="/admin/ai-templates" element={
        <AdminProtectedRoute>
          <AdminLayout>
            <AITemplates />
          </AdminLayout>
        </AdminProtectedRoute>
      } />
      <Route path="/admin/ai-quality" element={
        <AdminProtectedRoute>
          <AdminLayout>
            <AIQuality />
          </AdminLayout>
        </AdminProtectedRoute>
      } />

      {/* Public Home (Landing) */}
      <Route path={ROUTES.HOME} element={
        <PublicRoute>
          <LandingPage />
        </PublicRoute>
      } />
      
      {/* Catch all - redirect to appropriate dashboard */}
      <Route path="*" element={
        <Navigate to={getDefaultRoute()} replace />
      } />
    </Routes>
  );
};

/**
 * Componente principal do Router - SEM BrowserRouter (já está no App.tsx)
 */
const Router: React.FC = () => {
  return <NavigationManager />;
};

export default Router;





