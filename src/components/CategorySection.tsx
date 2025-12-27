import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Category, SelectedAssignment } from '../types';
import { SelectableCourseRow } from './SelectableCourseRow';

interface CategorySectionProps {
  category: Category;
  selectedAssignments: SelectedAssignment[];
  onToggleAssignment: (assignment: SelectedAssignment) => void;
  defaultOpen?: boolean;
}

export const CategorySection = ({
  category,
  selectedAssignments,
  onToggleAssignment,
  defaultOpen = false,
}: CategorySectionProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const title = isArabic ? category.title_ar : category.title_en;
  const selectedCount = selectedAssignments.filter((a) =>
    category.items.some((item) => item.assignmentId === a.assignmentId)
  ).length;

  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-start">
          {title}
        </h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t('common.selected')} {selectedCount} / {t('common.total')} {category.items.length}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 py-4 border-t-2 border-gray-200 dark:border-gray-700 space-y-2">
              {category.items.map((item) => {
                const isSelected = selectedAssignments.some(
                  (a) => a.assignmentId === item.assignmentId
                );
                return (
                  <SelectableCourseRow
                    key={item.assignmentId}
                    assignment={item}
                    isSelected={isSelected}
                    onToggle={() =>
                      onToggleAssignment({
                        ...item,
                        categoryId: category.id,
                        categoryTitle_ar: category.title_ar,
                        categoryTitle_en: category.title_en,
                      })
                    }
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
