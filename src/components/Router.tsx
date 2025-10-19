import Reports from '@/pages/admin/Reports';
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleVerification } from '@/hooks/useRoleVerification';
import { AdminProtectedRoute, StudentProtectedRoute, PublicRoute } from '@/components/auth/RoleProtectedRoute';
import { ROUTES } from '@/utils/constants';

// Layouts
import { AuthLayout } from '@/layouts/AuthLayout';
import { StudentLayout } from '@/layouts/StudentLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

// Auth Pages
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { ResetPassword } from '@/pages/auth/ResetPassword';

// Dashboard Pages
import { StudentDashboard } from '@/pages/student/Dashboard';
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

  useEffect(() => {
    const currentPath = location.pathname;
    const isPublic = isPublicRoute(currentPath);

    if (isPublic) {
      return;
    }

    if (loading || roleLoading || !isVerified) {
      return;
    }

    if (!user) {
      console.log('🔄 No user, redirecting to login');
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }

    if (!role) {
      return;
    }

    const isAdminRoute = currentPath.startsWith('/admin');
    const isStudentRoute = currentPath.startsWith('/student');

    if (role === 'admin' && !isAdminRoute) {
      console.log('🔄 Admin user, redirecting to admin area');
      navigate('/admin', { replace: true });
      return;
    }

    if (role === 'student' && !isStudentRoute) {
      console.log('🔄 Student user, redirecting to student area');
      navigate('/student', { replace: true });
      return;
    }

    if (role === 'student' && isAdminRoute) {
      console.log('🚫 Student trying to access admin area, redirecting to student');
      navigate('/student', { replace: true });
    }
  }, [location.pathname, user, role, loading, roleLoading, isVerified, navigate]);

  const shouldShowSpinner = () => {
    const isPublic = isPublicRoute(location.pathname);

    if (isPublic) return false;

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

const StudentSection: React.FC = () => (
  <StudentProtectedRoute>
    <StudentLayout>
      <Outlet />
    </StudentLayout>
  </StudentProtectedRoute>
);

const AdminSection: React.FC = () => (
  <AdminProtectedRoute>
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  </AdminProtectedRoute>
);

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
      <Route element={<StudentSection />}>
        <Route path={ROUTES.STUDENT_DASHBOARD} element={<StudentDashboard />} />
        <Route path={ROUTES.STUDENT_COURSES} element={<StudentCourses />} />
        <Route path={ROUTES.STUDENT_COURSE_DETAIL} element={<StudentCourseDetail />} />
        <Route path={ROUTES.STUDENT_GAMIFICATION} element={<StudentGamification />} />
        <Route path="/student/certificates" element={<StudentCertificates />} />
        <Route path={ROUTES.STUDENT_MISSIONS} element={<StudentMissions />} />
        <Route path={ROUTES.STUDENT_PATHS} element={<StudentPaths />} />
        <Route path={ROUTES.STUDENT_PATH_DETAIL} element={<StudentPathDetail />} />
        <Route path="/student/missions/:id" element={<StudentMission />} />
        <Route path={ROUTES.STUDENT_PROFILE} element={<StudentProfile />} />
        <Route path={ROUTES.STUDENT_ACHIEVEMENTS} element={<StudentAchievements />} />
        <Route path={'/student/archivments'} element={<StudentAchievements />} />
        <Route path={ROUTES.STUDENT_LEADERBOARD} element={<StudentLeaderboard />} />
        <Route path={ROUTES.STUDENT_CERTIFICATIONS} element={<StudentExams />} />
        <Route path={ROUTES.STUDENT_SOCIAL} element={<StudentSocial />} />
        {process.env.NODE_ENV === 'development' && (
          <Route path="/test/missions" element={<TestMissions />} />
        )}
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminSection />}>
        <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
        <Route path={ROUTES.ADMIN_COURSES} element={<AdminCourses />} />
        <Route path={ROUTES.ADMIN_BADGES} element={<AdminBadges />} />
        <Route path={ROUTES.ADMIN_ACHIEVEMENTS} element={<AdminAchievements />} />
        <Route path={ROUTES.ADMIN_PATHS} element={<AdminPaths />} />
        <Route path={ROUTES.ADMIN_MISSIONS} element={<AdminMissions />} />
        <Route path="/admin/certificates/designer" element={<CertificateDesigner />} />
        <Route path={ROUTES.ADMIN_USERS} element={<AdminUsers />} />
        <Route path={ROUTES.ADMIN_ROLES} element={<AdminRoles />} />
        <Route path={ROUTES.ADMIN_ANALYTICS} element={<AdminAnalytics />} />
        <Route path={ROUTES.ADMIN_SETTINGS} element={<AdminSettings />} />
        <Route path={ROUTES.ADMIN_PROFILE} element={<AdminProfile />} />
        <Route path={ROUTES.ADMIN_REPORTS} element={<Reports />} />
        <Route path={ROUTES.ADMIN_CERTIFICATIONS} element={<AdminExams />} />
        <Route path="/admin/ai-generator" element={<AIGenerator />} />
        <Route path="/admin/ai-templates" element={<AITemplates />} />
        <Route path="/admin/ai-quality" element={<AIQuality />} />
        <Route path="/admin/courses/wizard" element={<CourseCreationWizard />} />
      </Route>

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
