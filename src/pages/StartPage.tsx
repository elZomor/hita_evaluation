import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export const StartPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleStart = useCallback(() => {
    navigate('/select');
  }, [navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleStart();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleStart]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]"
    >
      <div className="text-center space-y-8">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <GraduationCap className="w-24 h-24 mx-auto text-amber-600 dark:text-amber-500" />
        </motion.div>

        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
            {t('start.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t('start.subtitle')}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className="px-12 py-4 bg-amber-600 hover:bg-amber-700 text-white text-xl font-semibold rounded-lg shadow-lg transition-colors focus:outline-none focus:ring-4 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950"
        >
          {t('start.startButton')}
        </motion.button>
      </div>
    </motion.div>
  );
};
