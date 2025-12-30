import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import {
  TopBar,
  FilterBar,
  KPIGrid,
  TrendChart,
  DistributionChart,
  ProfessorLeaderboard,
  ScatterPlot,
  Heatmap,
  CourseLeaderboard,
  CategoryBreakdown,
} from '@/components/dashboard';
import {
  useEvaluationAnswers,
  useDashboardDepartments,
  useDashboardCourses,
  useDashboardProfessors,
  useDashboardCategories,
  useDashboardSemesters,
  useDashboardRegulations,
} from '@/lib/hooks/useDashboardData';
import type { FilterParams } from '@/types/dashboard';
import {
  calculateKPIMetrics,
  calculateProfessorMetrics,
  calculateCourseMetrics,
  calculateTimeSeriesData,
  calculateRatingDistribution,
  calculateCategoryBreakdown,
  exportToCSV,
} from '@/lib/dashboard/aggregation';
import { useLocaleFormatting } from '@/lib/hooks/useLocaleFormatting';

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { formatDecimal, formatInteger, formatDate, isRTL } = useLocaleFormatting();

  const [filters, setFilters] = useState<FilterParams>({});

  const [selectedProfessorId, setSelectedProfessorId] = useState<string | null>(
    null
  );
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const { data: departments = [], isLoading: departmentsLoading } =
    useDashboardDepartments();
  const { data: courses = [], isLoading: coursesLoading } = useDashboardCourses(
    filters.departmentIds
  );
  const { data: professors = [], isLoading: professorsLoading } =
    useDashboardProfessors(filters.departmentIds, filters.courseIds);
  const { data: categories = [], isLoading: categoriesLoading } =
    useDashboardCategories();
  const { data: answers = [], isLoading: answersLoading } =
    useEvaluationAnswers(filters);
  const { data: semesters = [], isLoading: semestersLoading } =
    useDashboardSemesters();
  const { data: regulations = [], isLoading: regulationsLoading } =
    useDashboardRegulations();

  // Set current semester as default when semesters are loaded
  useEffect(() => {
    if (semesters.length > 0 && !filters.semesterIds?.length) {
      const currentSemester = semesters.find((s) => s.is_current);
      if (currentSemester) {
        setFilters((prev) => ({ ...prev, semesterIds: [currentSemester.id] }));
      }
    }
  }, [semesters, filters.semesterIds?.length]);

  const isLoading =
    departmentsLoading ||
    coursesLoading ||
    professorsLoading ||
    categoriesLoading ||
    answersLoading ||
    semestersLoading ||
    regulationsLoading;

  const kpiMetrics = useMemo(
    () => calculateKPIMetrics(answers),
    [answers]
  );

  const professorMetrics = useMemo(
    () => calculateProfessorMetrics(answers),
    [answers]
  );

  const courseMetrics = useMemo(() => calculateCourseMetrics(answers), [answers]);

  const timeSeriesData = useMemo(
    () => calculateTimeSeriesData(answers),
    [answers]
  );

  const ratingDistribution = useMemo(
    () => calculateRatingDistribution(answers),
    [answers]
  );

  const selectedProfessor = professorMetrics.find(
    (p) => p.professorId === selectedProfessorId
  );
  const selectedCourse = courseMetrics.find(
    (c) => c.courseId === selectedCourseId
  );

  const categoryBreakdownData = useMemo(() => {
    if (selectedProfessorId && selectedProfessor) {
      return selectedProfessor.categoryScores;
    }
    if (selectedCourseId && selectedCourse) {
      return selectedCourse.categoryScores;
    }
    return calculateCategoryBreakdown(answers);
  }, [
    selectedProfessorId,
    selectedCourseId,
    selectedProfessor,
    selectedCourse,
    answers,
  ]);

  const localizedCategoryBreakdown = useMemo(() => {
    if (!categories.length) {
      return categoryBreakdownData;
    }

    const useArabic = i18n.language === 'ar';
    const labelMap = new Map<string, string>();

    categories.forEach((category) => {
      const localized = useArabic ? category.name_ar : category.name_en;
      labelMap.set(category.name_en, localized);
      labelMap.set(category.name_ar, localized);
    });

    const mapped: Record<string, { avg: number; count: number }> = {};
    for (const [name, value] of Object.entries(categoryBreakdownData)) {
      const label = labelMap.get(name) || name;
      mapped[label] = value;
    }

    return mapped;
  }, [categories, categoryBreakdownData, i18n.language]);

  const handleExport = () => {
    const exportData = professorMetrics.map((p) => ({
      Professor: p.professorName,
      'Avg Score': formatDecimal(p.avgScore, 2),
      Responses: formatInteger(p.responsesCount),
      'Worst Category': p.worstCategory?.name || '',
      'Worst Score': p.worstCategory
        ? formatDecimal(p.worstCategory.score, 2)
        : '',
    }));
    exportToCSV(exportData, `professors-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const clearSelection = () => {
    setSelectedProfessorId(null);
    setSelectedCourseId(null);
  };

  const lastUpdated =
    answers.length > 0
      ? new Date(
          Math.max(...answers.map((a) => new Date(a.submitted_at).getTime()))
        )
      : new Date();

  return (
    <div className="min-h-screen bg-background">
      <TopBar lastUpdated={lastUpdated} />

      <main className="container mx-auto space-y-6 px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(selectedProfessorId || selectedCourseId) && (
              <Badge variant="secondary" className="gap-2">
                {selectedProfessor?.professorName || selectedCourse?.courseName}
                <button onClick={clearSelection}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
          {/*<Button onClick={handleExport} variant="outline" size="sm">*/}
          {/*  <Download className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />*/}
          {/*  {t('dashboard.export')}*/}
          {/*</Button>*/}
        </div>

        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          departments={departments}
          courses={courses}
          professors={professors}
          semesters={semesters}
          regulations={regulations}
        />

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-[400px]" />
          </div>
        ) : answers.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center rounded-lg border bg-card">
            <div className="text-center">
              <p className="text-lg font-semibold">{t('common.noData')}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  const currentSemester = semesters.find((s) => s.is_current);
                  setFilters({
                    semesterIds: currentSemester ? [currentSemester.id] : [],
                  });
                }}
              >
                {t('common.resetFilters')}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <KPIGrid metrics={kpiMetrics} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <TrendChart data={timeSeriesData} />
              </div>
              <div>
                <DistributionChart data={ratingDistribution} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ProfessorLeaderboard
                  professors={professorMetrics}
                  onSelectProfessor={setSelectedProfessorId}
                />
              </div>
              <div>
                <ScatterPlot
                  professors={professorMetrics}
                  onSelectProfessor={setSelectedProfessorId}
                />
              </div>
            </div>

            <Heatmap
              professors={professorMetrics}
              categories={categories}
              onSelectProfessor={setSelectedProfessorId}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <CourseLeaderboard
                courses={courseMetrics}
                onSelectCourse={setSelectedCourseId}
              />
              <CategoryBreakdown
                categoryScores={localizedCategoryBreakdown}
                selectionName={
                  selectedProfessor?.professorName || selectedCourse?.courseName
                }
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
