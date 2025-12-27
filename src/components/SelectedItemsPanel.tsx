import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import type { SelectedAssignment } from '../types';

interface SelectedItemsPanelProps {
  selectedAssignments: SelectedAssignment[];
  onRemove: (assignmentId: string) => void;
  onContinue?: () => void;
  isLoading?: boolean;
  sticky?: boolean;
}

export const SelectedItemsPanel = ({
  selectedAssignments,
  onRemove,
  onContinue,
  isLoading = false,
  sticky = false,
}: SelectedItemsPanelProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const groupedByCategory = selectedAssignments.reduce((acc, item) => {
    const categoryTitle = isArabic ? item.categoryTitle_ar : item.categoryTitle_en;
    if (!acc[categoryTitle]) {
      acc[categoryTitle] = [];
    }
    acc[categoryTitle].push(item);
    return acc;
  }, {} as Record<string, SelectedAssignment[]>);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6 space-y-4 ${sticky ? 'sticky top-4 max-h-[calc(100vh-8rem)] overflow-y-auto' : ''}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {t('select.selectedItems')}
      </h3>

      {selectedAssignments.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('select.noItemsSelected')}
        </p>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByCategory).map(([categoryTitle, items]) => (
            <div key={categoryTitle} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {categoryTitle} ({items.length})
              </h4>
              <div className="space-y-1">
                {items.map((item) => {
                  const courseName = isArabic ? item.courseName_ar : item.courseName_en;
                  const professorName = isArabic
                    ? item.professorName_ar
                    : item.professorName_en;

                  return (
                    <div
                      key={item.assignmentId}
                      className="flex items-start gap-2 p-2 rounded bg-gray-50 dark:bg-gray-900 group"
                    >
                      <div className="flex-1 min-w-0 text-sm">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {courseName}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {professorName}
                        </div>
                      </div>
                      <button
                        onClick={() => onRemove(item.assignmentId)}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {onContinue && (
        <div className="space-y-2 pt-2">
          <button
            onClick={() => selectedAssignments.forEach(item => onRemove(item.assignmentId))}
            disabled={selectedAssignments.length === 0}
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            {t('select.clearAll')}
          </button>
          <button
            onClick={onContinue}
            disabled={selectedAssignments.length === 0 || isLoading}
            className="w-full px-8 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition-colors focus:outline-none focus:ring-4 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950"
          >
            {isLoading ? t('common.loading') : t('select.continueButton')}
          </button>
        </div>
      )}
    </div>
  );
};
