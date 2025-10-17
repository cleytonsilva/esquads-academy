import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Router from './components/Router';
import { GlobalNotifications } from './components/notifications/GlobalNotifications';
import { Toaster } from '@/components/ui/toaster';
import { runVibeCheckHealth, logVibeHealthReport } from '@/services/vibeHealthCheck';
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    if (import.meta.env.DEV) {
      // Executa health check somente em desenvolvimento
      runVibeCheckHealth().then(logVibeHealthReport).catch((err) => {
        console.warn('VibeCheck health check failed:', err)
      })
    }
  }, [])
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <NotificationProvider>
              <Router />
              <GlobalNotifications />
              <Toaster />
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
