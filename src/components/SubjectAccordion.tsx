import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CourseAssignment, SelectedAssignment } from '../types';

interface SubjectAccordionProps {
  subjectName_ar: string;
  subjectName_en: string;
  professors: CourseAssignment[];
  selectedAssignments: SelectedAssignment[];
  onToggle: (assignment: SelectedAssignment) => void;
}

export const SubjectAccordion = ({
  subjectName_ar,
  subjectName_en,
  professors,
  selectedAssignments,
  onToggle,
}: SubjectAccordionProps) => {
  const { i18n, t } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [isOpen, setIsOpen] = useState(false);

  const subjectName = isArabic ? subjectName_ar : subjectName_en;
  const selectedCount = professors.filter((p) =>
    selectedAssignments.some((a) => a.assignmentId === p.assignmentId)
  ).length;

  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full px-4 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0 text-start">
          <Users className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 dark:text-white break-words sm:truncate">
              {subjectName}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('select.professorsCount', { count: professors.length })}
              {selectedCount > 0 && (
                <span className="text-amber-600 dark:text-amber-400 ms-2">
                  ({t('select.selectedCount', { count: selectedCount })})
                </span>
              )}
            </div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 space-y-2 border-t-2 border-gray-200 dark:border-gray-700 pt-3">
              {professors.map((professor) => {
                const professorName = isArabic
                  ? professor.professorName_ar
                  : professor.professorName_en;
                const isSelected = selectedAssignments.some(
                  (a) => a.assignmentId === professor.assignmentId
                );

                return (
                  <label
                    key={professor.assignmentId}
                    className={`flex items-center gap-4 p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        onToggle({
                          ...professor,
                          categoryId: professor.category || '',
                          categoryTitle_ar: professor.category || '',
                          categoryTitle_en: professor.category || '',
                        })
                      }
                      className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 focus:ring-2 cursor-pointer"
                    />
                    <span className="flex-1 text-gray-900 dark:text-white font-medium">
                      {professorName}
                    </span>
                  </label>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
