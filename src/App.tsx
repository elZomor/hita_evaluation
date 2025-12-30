import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './lib/contexts/ThemeContext';
import { useInactivityTimer } from './lib/hooks/useInactivityTimer';
import { useEvaluationStore } from './store/useEvaluationStore';
import { AppShell } from './components/AppShell';
import { InactivityModal } from './components/InactivityModal';
import { ProtectedRoute } from './components/ProtectedRoute';
import { StartPage } from './pages/StartPage';
import { SelectPage } from './pages/SelectPage';
import { EvaluatePage } from './pages/EvaluatePage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import './lib/i18n/config';
import { useTranslation } from 'react-i18next';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { showModal, handleContinue, handleReset } = useInactivityTimer();
  const location = useLocation();
  const selectedAssignments = useEvaluationStore((state) => state.selectedAssignments);
  const { i18n } = useTranslation();

  useEffect(() => {
    const onEvaluationRoute = location.pathname.startsWith('/evaluate');
    if (!onEvaluationRoute) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (selectedAssignments.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [location.pathname, selectedAssignments.length]);

  useEffect(() => {
    const updateDirection = (lng: string) => {
      const dir = lng === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.dir = dir;
      document.documentElement.lang = lng;
    };

    updateDirection(i18n.language);
    i18n.on('languageChanged', updateDirection);
    return () => {
      i18n.off('languageChanged', updateDirection);
    };
  }, [i18n]);

  return (
    <>
      <Routes>
        {/* Routes with AppShell (kiosk flow) */}
        <Route
          path="/"
          element={
            <AppShell>
              <StartPage />
            </AppShell>
          }
        />
        <Route
          path="/select"
          element={
            <AppShell>
              <SelectPage />
            </AppShell>
          }
        />
        <Route
          path="/evaluate/:sessionId"
          element={
            <AppShell>
              <EvaluatePage />
            </AppShell>
          }
        />
        {/* Routes without AppShell (own headers) */}
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <InactivityModal
        isOpen={showModal}
        onContinue={handleContinue}
        onReset={handleReset}
      />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
