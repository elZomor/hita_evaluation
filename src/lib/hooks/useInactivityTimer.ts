import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEvaluationStore } from '../../store/useEvaluationStore';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export const useInactivityTimer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const resetAll = useEvaluationStore((state) => state.resetAll);
  const timeoutRef = useRef<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleReset = useCallback(() => {
    setShowModal(false);
    resetAll();
    navigate('/');
  }, [navigate, resetAll]);

  const handleContinue = useCallback(() => {
    setShowModal(false);
  }, []);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (location.pathname !== '/' && !location.pathname.startsWith('/dashboard') && !showModal) {
      timeoutRef.current = window.setTimeout(() => {
        setShowModal(true);
      }, INACTIVITY_TIMEOUT);
    }
  }, [location.pathname, showModal]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

    const handleActivity = () => {
      if (!showModal) {
        resetTimer();
      }
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    resetTimer();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimer, showModal]);

  return {
    showModal,
    handleContinue,
    handleReset,
  };
};
