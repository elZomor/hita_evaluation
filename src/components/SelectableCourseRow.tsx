import { useTranslation } from 'react-i18next';
import type { CourseAssignment } from '../types';

interface SelectableCourseRowProps {
  assignment: CourseAssignment;
  isSelected: boolean;
  onToggle: () => void;
}

export const SelectableCourseRow = ({
  assignment,
  isSelected,
  onToggle,
}: SelectableCourseRowProps) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const courseName = isArabic ? assignment.courseName_ar : assignment.courseName_en;
  const professorName = isArabic ? assignment.professorName_ar : assignment.professorName_en;

  return (
    <label
      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
        isSelected
          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        className="w-6 h-6 rounded border-gray-300 text-amber-600 focus:ring-amber-500 focus:ring-2 cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 dark:text-white truncate">
          {courseName}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {professorName}
        </div>
      </div>
    </label>
  );
};
