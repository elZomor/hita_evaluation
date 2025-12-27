import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface YesNoButtonsProps {
  value: boolean | undefined;
  onChange: (value: boolean) => void;
}

export const YesNoButtons = ({ value, onChange }: YesNoButtonsProps) => {
  const { t } = useTranslation();

  const handleKeyDown = (e: React.KeyboardEvent, answer: boolean) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(answer);
    }
  };

  return (
    <div className="flex gap-4" role="radiogroup" aria-label={t('evaluate.yesNo')}>
      <motion.button
        type="button"
        role="radio"
        aria-checked={value === true}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange(true)}
        onKeyDown={(e) => handleKeyDown(e, true)}
        tabIndex={0}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 ${
          value === true
            ? 'bg-green-600 text-white shadow-lg'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/30'
        }`}
      >
        <Check className="w-5 h-5" />
        {t('evaluate.yes')}
      </motion.button>

      <motion.button
        type="button"
        role="radio"
        aria-checked={value === false}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange(false)}
        onKeyDown={(e) => handleKeyDown(e, false)}
        tabIndex={0}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 ${
          value === false
            ? 'bg-red-600 text-white shadow-lg'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30'
        }`}
      >
        <X className="w-5 h-5" />
        {t('evaluate.no')}
      </motion.button>
    </div>
  );
};
