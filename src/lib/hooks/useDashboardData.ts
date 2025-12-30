import { useQuery } from '@tanstack/react-query';
import { dashboardClient } from '@/lib/api/dashboardClient';
import type { FilterParams } from '@/types/dashboard';

export function useEvaluationAnswers(filters: FilterParams) {
  return useQuery({
    queryKey: ['dashboardAnswers', filters],
    queryFn: () => dashboardClient.getEvaluationAnswers(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDashboardDepartments() {
  return useQuery({
    queryKey: ['dashboardDepartments'],
    queryFn: dashboardClient.getDashboardDepartments,
    staleTime: 30 * 60 * 1000,
  });
}

export function useDashboardCourses(departmentIds?: string[]) {
  return useQuery({
    queryKey: ['dashboardCourses', departmentIds],
    queryFn: () => dashboardClient.getDashboardCourses(departmentIds),
    staleTime: 30 * 60 * 1000,
  });
}

export function useDashboardProfessors(departmentIds?: string[], courseIds?: string[]) {
  return useQuery({
    queryKey: ['dashboardProfessors', departmentIds, courseIds],
    queryFn: () => dashboardClient.getDashboardProfessors(departmentIds, courseIds),
    staleTime: 30 * 60 * 1000,
  });
}

export function useDashboardCategories() {
  return useQuery({
    queryKey: ['dashboardCategories'],
    queryFn: dashboardClient.getCategories,
    staleTime: 30 * 60 * 1000,
  });
}

export function useDashboardSemesters() {
  return useQuery({
    queryKey: ['dashboardSemesters'],
    queryFn: dashboardClient.getSemesters,
    staleTime: 30 * 60 * 1000,
  });
}
