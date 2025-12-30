import { useEffect, useMemo, useRef, useState } from 'react';
import { X, ChevronsUpDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import type {
  FilterParams,
  DashboardDepartment,
  DashboardCourse,
  DashboardProfessor,
  DashboardSemester,
} from '@/types/dashboard';

interface Option {
  value: string;
  label: string;
}

interface DropdownFilterProps {
  label: string;
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholderLabel: string;
  searchPlaceholder: string;
  disabled?: boolean;
  emptyLabel?: string;
}

const DropdownFilter = ({
  label,
  options,
  selectedValues,
  onChange,
  placeholderLabel,
  searchPlaceholder,
  disabled = false,
  emptyLabel = placeholderLabel,
}: DropdownFilterProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredOptions = useMemo(() => {
    const lower = search.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(lower));
  }, [options, search]);

  const selectedLabels = options
    .filter((opt) => selectedValues.includes(opt.value))
    .map((opt) => opt.label);

  let displayText = placeholderLabel;
  if (selectedLabels.length === 1) {
    displayText = selectedLabels[0];
  } else if (selectedLabels.length > 1) {
    displayText = `${selectedLabels[0]} +${selectedLabels.length - 1}`;
  }

  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div className="relative space-y-2" ref={containerRef}>
      <label className="block text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed"
      >
        <span className="truncate text-left">{displayText}</span>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute z-30 mt-2 w-full rounded-md border bg-background shadow-lg">
          <div className="p-2">
            <div className="flex items-center rounded-md border px-2 py-1 focus-within:ring-2 focus-within:ring-primary">
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="ml-2 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>
          <div className="filter-dropdown-scroll max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {emptyLabel}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={() => toggleValue(option.value)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="truncate">{option.label}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface FilterBarProps {
  filters: FilterParams;
  onFiltersChange: (filters: FilterParams) => void;
  departments: DashboardDepartment[];
  courses: DashboardCourse[];
  professors: DashboardProfessor[];
  semesters: DashboardSemester[];
}

export function FilterBar({
  filters,
  onFiltersChange,
  departments,
  courses,
  professors,
  semesters,
}: FilterBarProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const updateFilter = <K extends keyof FilterParams>(
    key: K,
    value: FilterParams[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilter = (key: keyof FilterParams) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    // Keep current semester selected by default
    const currentSemester = semesters.find((s) => s.is_current);
    onFiltersChange({
      semesterIds: currentSemester ? [currentSemester.id] : [],
    });
  };

  const hasActiveFilters =
    (filters.departmentIds && filters.departmentIds.length > 0) ||
    (filters.courseIds && filters.courseIds.length > 0) ||
    (filters.professorIds && filters.professorIds.length > 0);

  const getName = (id: string, type: 'department' | 'course' | 'professor' | 'semester') => {
    const lang = language === 'ar' ? 'name_ar' : 'name_en';
    if (type === 'department') {
      return departments.find((d) => d.id === id)?.[lang] || id;
    }
    if (type === 'course') {
      return courses.find((c) => c.id === id)?.[lang] || id;
    }
    if (type === 'professor') {
      return professors.find((p) => p.id === id)?.[lang] || id;
    }
    if (type === 'semester') {
      const semester = semesters.find((s) => s.id === id);
      if (semester) {
        return `${semester.year} - ${semester.type_display}`;
      }
      return id;
    }
    return id;
  };

  const departmentOptions = useMemo<Option[]>(() => {
    const seen = new Set<string>();
    return departments.reduce<Option[]>((options, dept) => {
      if (seen.has(dept.id)) return options;
      seen.add(dept.id);
      options.push({
        value: dept.id,
        label: language === 'ar' ? dept.name_ar : dept.name_en,
      });
      return options;
    }, []);
  }, [departments, language]);

  const courseOptions = useMemo<Option[]>(() => {
    const seen = new Set<string>();
    return courses.reduce<Option[]>((options, course) => {
      if (seen.has(course.id)) return options;
      seen.add(course.id);
      options.push({
        value: course.id,
        label: language === 'ar' ? course.name_ar : course.name_en,
      });
      return options;
    }, []);
  }, [courses, language]);

  const professorOptions = useMemo<Option[]>(() => {
    const seen = new Set<string>();
    return professors.reduce<Option[]>((options, prof) => {
      if (seen.has(prof.id)) return options;
      seen.add(prof.id);
      options.push({
        value: prof.id,
        label: language === 'ar' ? prof.name_ar : prof.name_en,
      });
      return options;
    }, []);
  }, [professors, language]);

  const semesterOptions = useMemo<Option[]>(() => {
    return semesters.map((semester) => ({
      value: semester.id,
      label: `${semester.year} - ${semester.type_display}${semester.is_current ? ` (${t('dashboard.current')})` : ''}`,
    }));
  }, [semesters, t]);

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DropdownFilter
            label={t('dashboard.semester')}
            options={semesterOptions}
            selectedValues={filters.semesterIds || []}
            onChange={(values) => updateFilter('semesterIds', values)}
            placeholderLabel={t('common.all')}
            searchPlaceholder={t('common.search')}
            disabled={semesterOptions.length === 0}
            emptyLabel={t('common.noData')}
          />

          <DropdownFilter
            label={t('dashboard.department')}
            options={departmentOptions}
            selectedValues={filters.departmentIds || []}
            onChange={(values) => updateFilter('departmentIds', values)}
            placeholderLabel={t('common.all')}
            searchPlaceholder={t('common.search')}
            disabled={departmentOptions.length === 0}
            emptyLabel={t('common.noData')}
          />

          <DropdownFilter
            label={t('dashboard.course')}
            options={courseOptions}
            selectedValues={filters.courseIds || []}
            onChange={(values) => updateFilter('courseIds', values)}
            placeholderLabel={t('common.all')}
            searchPlaceholder={t('common.search')}
            disabled={courseOptions.length === 0}
            emptyLabel={t('common.noData')}
          />

          <DropdownFilter
            label={t('dashboard.professor')}
            options={professorOptions}
            selectedValues={filters.professorIds || []}
            onChange={(values) => updateFilter('professorIds', values)}
            placeholderLabel={t('common.all')}
            searchPlaceholder={t('common.search')}
            disabled={professorOptions.length === 0}
            emptyLabel={t('common.noData')}
          />
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{t('dashboard.filters')}:</span>
            {filters.departmentIds?.map((id) => (
              <Badge key={id} variant="secondary" className="gap-1">
                {getName(id, 'department')}
                <button
                  onClick={() => clearFilter('departmentIds')}
                  className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={t('dashboard.clearSelection')}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {filters.courseIds?.map((id) => (
              <Badge key={id} variant="secondary" className="gap-1">
                {getName(id, 'course')}
                <button
                  onClick={() => clearFilter('courseIds')}
                  className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={t('dashboard.clearSelection')}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {filters.professorIds?.map((id) => (
              <Badge key={id} variant="secondary" className="gap-1">
                {getName(id, 'professor')}
                <button
                  onClick={() => clearFilter('professorIds')}
                  className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={t('dashboard.clearSelection')}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-primary hover:text-primary"
            >
              {t('dashboard.clearAll')}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
