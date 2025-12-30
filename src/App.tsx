import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './lib/contexts/ThemeContext';
import { useInactivityTimer } from './lib/hooks/useInactivityTimer';
import { useEvaluationStore } from './store/useEvaluationStore';
import { AppShell } from './components/AppShell';
import { InactivityModal } from './components/InactivityModal';
import { StartPage } from './pages/StartPage';
import { SelectPage } from './pages/SelectPage';
import { EvaluatePage } from './pages/EvaluatePage';
import { DashboardPage } from './pages/DashboardPage';
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
      <AppShell>
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/select" element={<SelectPage />} />
          <Route path="/evaluate/:sessionId" element={<EvaluatePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </AppShell>
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
