import Reports from '@/pages/admin/Reports';
import AdminQuestionBank from '@/pages/admin/QuestionBank';
import SimulationGenerator from '@/pages/admin/SimulationGenerator';
import ExamInterface from '@/pages/student/ExamInterface';
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
import { AdminLayout } from '@/layouts/AdminLayout';

// Auth Pages
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { ResetPassword } from '@/pages/auth/ResetPassword';

// Unified Pages (New Structure)
import MissionsHub from '@/pages/unified/MissionsHub';
import SimulationsPage from '@/pages/SimulationsPage';

// Dashboard Pages (Legacy)
import { StudentDashboard } from '@/pages/student/Dashboard';
import AdminDashboard from '@/pages/admin/Dashboard';

// Student Pages (Legacy - for gradual migration)
import StudentCourses from '@/pages/student/Courses';
import StudentCourseDetail from '@/pages/student/CourseDetail';
import StudentCertificates from '@/pages/student/Certificates';
import StudentMissions from '@/pages/student/Missions';
import StudentProfile from '@/pages/student/Profile';
import StudentAchievements from '@/pages/student/Achievements';
import StudentLeaderboard from '@/pages/student/Leaderboard';
import { MissionPlay } from '@/pages/student/MissionPlay';
import { MissionResult } from '@/pages/student/MissionResult';
import { ResultsPage } from '@/pages/student/ResultsPage';
import StudentPaths from '@/pages/student/Paths';
import StudentPathDetail from '@/pages/student/PathDetail';
import { StudentSocial } from '@/pages/student/Social';
import { StudentSimulations } from '@/pages/student/Simulations';

// Test Pages
import TestMissions from '@/pages/test/TestMissions';

// Public Pages
import CertificateVerification from '@/pages/CertificateVerification';
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
import AdminSimulations from '@/pages/admin/Simulations';

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
      ROUTES.RESET_PASSWORD,
      '/certificate/verify',
      '/test-landing'
    ];
    return publicRoutes.some(route => path === route || path.startsWith('/certificate/verify/'));
  };

  // Lógica de redirecionamento simplificada para evitar loops
  useEffect(() => {
    const currentPath = location.pathname;
    const isPublic = isPublicRoute(currentPath);

    // Não fazer nada em rotas públicas
    if (isPublic) {
      return;
    }

    // Aguardar carregamento completo
    if (loading || roleLoading) {
      return;
    }

    // Se não há usuário, redirecionar para login
    if (!user) {
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }

    // Se não há role verificada, aguardar
    if (!role) {
      return;
    }

    // Bloquear student de acessar área admin
    if (role === 'student' && currentPath.startsWith('/admin')) {
      navigate(ROUTES.STUDENT_DASHBOARD, { replace: true });
      return;
    }

    // Redirecionar admin para área correta se não estiver em rota admin
    if (role === 'admin' && !currentPath.startsWith('/admin')) {
      navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
      return;
    }

  }, [location.pathname, user, role, loading, roleLoading, navigate]);

  // Spinner simplificado
  const shouldShowSpinner = () => {
    const isPublic = isPublicRoute(location.pathname);
    
    // Nunca mostrar spinner em rotas públicas
    if (isPublic) return false;
    
    // Mostrar spinner apenas se está carregando
    return loading || roleLoading;
  };

  if (shouldShowSpinner()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-pulse text-2xl mb-4 text-green-400 font-mono">LOADING...</div>
          <p className="text-cyan-400 text-lg font-mono">Verificando permissões...</p>
          <p className="text-gray-500 text-sm mt-2 font-mono">Aguarde enquanto validamos seu acesso</p>
        </div>
      </div>
    );
  }

  return <AppRoutes />;
};

/**
 * Componente com as rotas da aplicação - Estrutura Unificada
 */
const AppRoutes: React.FC = () => {
  // Não usar useAuth aqui para evitar duplicação com NavigationManager
  const getDefaultRoute = () => {
    return ROUTES.LOGIN; // Padrão simples, NavigationManager cuida do redirecionamento
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
      <Route path={ROUTES.RESET_PASSWORD} element={
        <PublicRoute>
          <AuthLayout>
            <ResetPassword />
          </AuthLayout>
        </PublicRoute>
      } />

      {/* ===== ESTRUTURA UNIFICADA ===== */}
      

      {/* Hub de Missões Gamificadas */}
      <Route path={ROUTES.MISSIONS} element={
        <AuthProtectedRoute>
          <MissionsHub />
        </AuthProtectedRoute>
      } />
      <Route path={ROUTES.MISSIONS_CATEGORY} element={
        <AuthProtectedRoute>
          <MissionsHub />
        </AuthProtectedRoute>
      } />
      <Route path={ROUTES.MISSION_DETAIL} element={
        <AuthProtectedRoute>
          <StudentLayout>
            <MissionPlay />
          </StudentLayout>
        </AuthProtectedRoute>
      } />
      <Route path={ROUTES.MISSION_PLAY} element={
        <AuthProtectedRoute>
          <StudentLayout>
            <MissionPlay />
          </StudentLayout>
        </AuthProtectedRoute>
      } />

      {/* Centro de Simulações */}
      <Route path={ROUTES.SIMULATIONS} element={
        <AuthProtectedRoute>
          <SimulationsPage />
        </AuthProtectedRoute>
      } />
      <Route path={ROUTES.SIMULATIONS_CERTIFICATION} element={
        <AuthProtectedRoute>
          <StudentLayout>
            <StudentSimulations />
          </StudentLayout>
        </AuthProtectedRoute>
      } />
      <Route path={ROUTES.SIMULATION_START} element={
        <AuthProtectedRoute>
          <StudentLayout>
            <StudentSimulations />
          </StudentLayout>
        </AuthProtectedRoute>
      } />
      <Route path="/student/results/:id" element={
        <AuthProtectedRoute>
          <StudentLayout>
            <ResultsPage />
          </StudentLayout>
        </AuthProtectedRoute>
      } />

      {/* Perfil e Progresso Unificado */}
      <Route path={ROUTES.PROFILE} element={
        <AuthProtectedRoute>
          <StudentLayout>
            <StudentProfile />
          </StudentLayout>
        </AuthProtectedRoute>
      } />
      <Route path={ROUTES.PROGRESS} element={
        <AuthProtectedRoute>
          <StudentLayout>
            <StudentProfile />
          </StudentLayout>
        </AuthProtectedRoute>
      } />
      <Route path={ROUTES.ACHIEVEMENTS} element={
        <AuthProtectedRoute>
          <StudentLayout>
            <StudentAchievements />
          </StudentLayout>
        </AuthProtectedRoute>
      } />
      <Route path={ROUTES.LEADERBOARD} element={
        <AuthProtectedRoute>
          <StudentLayout>
            <StudentLeaderboard />
          </StudentLayout>
        </AuthProtectedRoute>
      } />

      {/* Certificações */}
      <Route path={ROUTES.CERTIFICATIONS} element={
        <AuthProtectedRoute>
          <StudentLayout>
            <StudentCertificates />
          </StudentLayout>
        </AuthProtectedRoute>
      } />

      {/* Social (mantido para compatibilidade) */}
      <Route path={ROUTES.SOCIAL} element={
        <AuthProtectedRoute>
          <StudentLayout>
            <StudentSocial />
          </StudentLayout>
        </AuthProtectedRoute>
      } />

      {/* ===== ROTAS LEGADAS (para migração gradual) ===== */}
      
      {/* Student Routes (Legacy) */}
      <Route path="/student" element={
        <StudentProtectedRoute>
          <StudentLayout>
            <StudentDashboard />
          </StudentLayout>
        </StudentProtectedRoute>
      } />
      <Route path="/student/dashboard" element={
        <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />
      } />
      <Route path={ROUTES.STUDENT_MISSIONS} element={
        <StudentProtectedRoute>
          <StudentLayout>
            <StudentMissions />
          </StudentLayout>
        </StudentProtectedRoute>
      } />
      <Route path={ROUTES.STUDENT_SIMULATIONS} element={
        <StudentProtectedRoute>
          <StudentLayout>
            <StudentSimulations />
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
      <Route path={ROUTES.STUDENT_LEADERBOARD} element={
        <StudentProtectedRoute>
          <StudentLayout>
            <StudentLeaderboard />
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

      {/* Rotas de cursos e paths */}
      <Route path={ROUTES.STUDENT_COURSES} element={
        <StudentProtectedRoute>
          <StudentLayout>
            <StudentCourses />
          </StudentLayout>
        </StudentProtectedRoute>
      } />
      <Route path="/student/courses/:id" element={
        <StudentProtectedRoute>
          <StudentLayout>
            <StudentCourseDetail />
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
      <Route path={ROUTES.STUDENT_PATHS} element={
        <StudentProtectedRoute>
          <StudentLayout>
            <StudentPaths />
          </StudentLayout>
        </StudentProtectedRoute>
      } />
      <Route path="/student/paths/:id" element={
        <StudentProtectedRoute>
          <StudentLayout>
            <StudentPathDetail />
          </StudentLayout>
        </StudentProtectedRoute>
      } />

      {/* Mission Play Routes (Legacy) */}
      <Route path="/student/missions/:id" element={
        <StudentProtectedRoute>
          <StudentLayout>
            <MissionPlay />
          </StudentLayout>
        </StudentProtectedRoute>
      } />
        <Route path="/student/simulations/exam/:id" element={
            <StudentProtectedRoute>
              <StudentLayout>
                <ExamInterface />
              </StudentLayout>
            </StudentProtectedRoute>
          } />
      <Route path="/student/missions/:id/result" element={
        <StudentProtectedRoute>
          <StudentLayout>
            <MissionResult />
          </StudentLayout>
        </StudentProtectedRoute>
      } />

      {/* Test Routes - Development Only */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <Route path="/test/missions" element={
            <StudentProtectedRoute>
              <StudentLayout>
                <TestMissions />
              </StudentLayout>
            </StudentProtectedRoute>
          } />
          <Route path={ROUTES.DEV_MISSIONS_TEST} element={
            <AuthProtectedRoute>
              <MissionsHub />
            </AuthProtectedRoute>
          } />
        </>
      )}

      {/* ===== PAINEL ADMINISTRATIVO ===== */}
      
      {/* Admin Routes */}
      <Route path={ROUTES.ADMIN} element={
        <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />
      } />
      <Route path={ROUTES.ADMIN_DASHBOARD} element={
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </AdminProtectedRoute>
      } />

      {/* Admin Content Management */}
      <Route path={ROUTES.ADMIN_CONTENT} element={
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminCourses />
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
      <Route path={ROUTES.ADMIN_MISSIONS_CREATE} element={
        <AdminProtectedRoute>
          <AdminLayout>
            <CourseCreationWizard />
          </AdminLayout>
        </AdminProtectedRoute>
      } />
      <Route path={ROUTES.ADMIN_QUESTIONS} element={
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminQuestionBank />
          </AdminLayout>
        </AdminProtectedRoute>
      } />
      <Route path={ROUTES.ADMIN_SIMULATION_GENERATOR} element={
        <AdminProtectedRoute>
          <AdminLayout>
            <SimulationGenerator />
          </AdminLayout>
        </AdminProtectedRoute>
      } />
      <Route path={ROUTES.ADMIN_QUESTIONS_CREATE} element={
        <AdminProtectedRoute>
          <AdminLayout>
            <CourseCreationWizard />
          </AdminLayout>
        </AdminProtectedRoute>
      } />

      {/* Admin Approval Workflow */}
      <Route path={ROUTES.ADMIN_APPROVAL} element={
        <AdminProtectedRoute>
          <AdminLayout>
            <AIQuality />
          </AdminLayout>
        </AdminProtectedRoute>
      } />

      {/* Admin Management */}
      <Route path={ROUTES.ADMIN_USERS} element={
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminUsers />
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

      {/* Admin Routes */}
      <Route path={ROUTES.ADMIN_COURSES} element={
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminCourses />
          </AdminLayout>
        </AdminProtectedRoute>
      } />
      <Route path="/admin/courses/wizard" element={
        <AdminProtectedRoute>
          <AdminLayout>
            <CourseCreationWizard />
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
      <Route path="/admin/certificates/designer" element={
        <AdminProtectedRoute>
          <AdminLayout>
            <CertificateDesigner />
          </AdminLayout>
        </AdminProtectedRoute>
      } />
      <Route path="/admin/roles" element={
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminRoles />
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
      <Route path={ROUTES.ADMIN_EXAMS} element={
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminExams />
          </AdminLayout>
        </AdminProtectedRoute>
      } />
      <Route path={ROUTES.ADMIN_SIMULATORS} element={
        <AdminProtectedRoute>
          <AdminLayout>
            <AdminSimulations />
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

      {/* Public Home (Landing) - Always accessible */}
      <Route path={ROUTES.HOME} element={<LandingPage />} />
      
      {/* Test Landing Page Route (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <Route path="/test-landing" element={<LandingPage />} />
      )}
      
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





