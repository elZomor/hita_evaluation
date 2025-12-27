import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Search, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from '../lib/api/client';
import { useEvaluationStore } from '../store/useEvaluationStore';
import { SelectableCourseRow } from '../components/SelectableCourseRow';
import { SelectedItemsPanel } from '../components/SelectedItemsPanel';
import type { SelectedAssignment } from '../types';

export const SelectPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const selectedDepartmentId = useEvaluationStore((state) => state.selectedDepartmentId);
  const isParallel = useEvaluationStore((state) => state.isParallel);
  const selectedAssignments = useEvaluationStore((state) => state.selectedAssignments);
  const setSelectedDepartment = useEvaluationStore((state) => state.setSelectedDepartment);
  const setIsParallel = useEvaluationStore((state) => state.setIsParallel);
  const toggleAssignment = useEvaluationStore((state) => state.toggleAssignment);
  const setSessionData = useEvaluationStore((state) => state.setSessionData);

  const [searchQuery, setSearchQuery] = useState('');

  // Fetch departments on page load
  const { data: departments, isLoading: loadingDepts } = useQuery({
    queryKey: ['departments'],
    queryFn: apiClient.getDepartments,
  });

  // Fetch ALL courses on page load (not per department)
  const { data: allCourses, isLoading: loadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: apiClient.getCourses,
  });

  // Start session mutation
  const startSessionMutation = useMutation({
    mutationFn: apiClient.startSession,
    onSuccess: (data) => {
      setSessionData(data);
      navigate('/evaluate');
    },
  });

  // Filter courses by selected department (client-side filtering)
  // Courses only appear when both department AND education type are selected
  const departmentCourses = useMemo(() => {
    if (!allCourses || !selectedDepartmentId || isParallel === null) return [];
    return allCourses.filter((course) => course.department === selectedDepartmentId);
  }, [allCourses, selectedDepartmentId, isParallel]);

  // Add category info to courses for SelectedAssignment compatibility
  const allItems = useMemo(() => {
    return departmentCourses.map((item) => ({
      ...item,
      categoryId: item.category || '',
      categoryTitle_ar: item.category || '',
      categoryTitle_en: item.category || '',
    }));
  }, [departmentCourses]);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return allItems;

    const query = searchQuery.toLowerCase();
    return allItems.filter(
      (item) =>
        item.courseName_ar.toLowerCase().includes(query) ||
        item.courseName_en.toLowerCase().includes(query) ||
        item.professorName_ar.toLowerCase().includes(query) ||
        item.professorName_en.toLowerCase().includes(query)
    );
  }, [allItems, searchQuery]);

  const handleToggleAssignment = (assignment: SelectedAssignment) => {
    toggleAssignment(assignment);
  };

  const handleRemoveAssignment = (assignmentId: string) => {
    const assignment = selectedAssignments.find((a) => a.assignmentId === assignmentId);
    if (assignment) {
      toggleAssignment(assignment);
    }
  };

  const handleContinue = () => {
    if (selectedAssignments.length === 0 || !selectedDepartmentId || isParallel === null) return;

    const courseIds = selectedAssignments.map((a) => Number(a.courseId));
    startSessionMutation.mutate({
      course_ids: courseIds,
      department: selectedDepartmentId,
      is_parallel: isParallel,
    });
  };

  if (loadingDepts || loadingCourses) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('select.title')}
        </h2>

        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('select.selectDepartment')}
          </label>
          <select
            value={selectedDepartmentId || ''}
            onChange={(e) => setSelectedDepartment(e.target.value || null)}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500 transition-colors"
          >
            <option value="">{t('select.selectDepartment')}</option>
            {departments?.map((dept) => (
              <option key={dept.value} value={dept.value}>
                {dept.label}
              </option>
            ))}
          </select>
        </div>

        {/* Education Type Selection */}
        {selectedDepartmentId && (
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('select.selectEducationType')}
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsParallel(false)}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 ${
                  isParallel === false
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                }`}
              >
                {t('select.creditHours')}
              </button>
              <button
                type="button"
                onClick={() => setIsParallel(true)}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 ${
                  isParallel === true
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                }`}
              >
                {t('select.parallelEducation')}
              </button>
            </div>
          </div>
        )}

        {!selectedDepartmentId && (
          <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {t('select.departmentRequired')}
            </p>
          </div>
        )}

        {selectedDepartmentId && isParallel === null && (
          <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {t('select.educationTypeRequired')}
            </p>
          </div>
        )}
      </div>

      {selectedDepartmentId && isParallel !== null && (
        <>
          {/* Mobile: Selected items at top */}
          <div className="lg:hidden">
            <SelectedItemsPanel
              selectedAssignments={selectedAssignments}
              onRemove={handleRemoveAssignment}
              onContinue={handleContinue}
              isLoading={startSessionMutation.isPending}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="relative">
                <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('select.searchPlaceholder')}
                  className="w-full ps-12 pe-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 transition-colors"
                />
              </div>

              {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {searchQuery ? t('select.noResults') : t('select.noCourses')}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredItems.map((item) => {
                    const isSelected = selectedAssignments.some(
                      (a) => a.assignmentId === item.assignmentId
                    );
                    return (
                      <SelectableCourseRow
                        key={item.assignmentId}
                        assignment={item}
                        isSelected={isSelected}
                        onToggle={() => handleToggleAssignment(item)}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Desktop: Selected items on side */}
            <div className="hidden lg:block lg:col-span-1">
              <SelectedItemsPanel
                selectedAssignments={selectedAssignments}
                onRemove={handleRemoveAssignment}
                onContinue={handleContinue}
                isLoading={startSessionMutation.isPending}
                sticky
              />
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};
