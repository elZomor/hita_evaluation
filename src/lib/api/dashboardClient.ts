import type {
  EvaluationAnswer,
  DashboardDepartment,
  DashboardCourse,
  DashboardProfessor,
  DashboardCategory,
  DashboardSemester,
  DashboardRegulation,
  FilterParams,
} from '../../types/dashboard';
import { useAuthStore } from '../../store/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005';

interface ApiResponse<T> {
  data: T;
  status: string;
  message: string | null;
}

/**
 * Authenticated fetch wrapper that adds JWT token and handles auto-refresh on 401
 */
async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const authState = useAuthStore.getState();
  const accessToken = authState.accessToken;

  const headers = {
    ...options.headers,
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
  };

  let response = await fetch(url, { ...options, headers });

  // If 401 Unauthorized, try to refresh the token
  if (response.status === 401 && authState.refreshToken) {
    const refreshed = await authState.refreshAccessToken();
    if (refreshed) {
      // Retry with new token
      const newAccessToken = useAuthStore.getState().accessToken;
      const newHeaders = {
        ...options.headers,
        ...(newAccessToken && { Authorization: `Bearer ${newAccessToken}` }),
      };
      response = await fetch(url, { ...options, headers: newHeaders });
    } else {
      // Refresh failed, logout and redirect
      authState.logout();
      window.location.href = '/login';
    }
  }

  return response;
}

export const dashboardClient = {
  getEvaluationAnswers: async (filters?: FilterParams): Promise<EvaluationAnswer[]> => {
    const params = new URLSearchParams();

    if (filters?.semesterIds?.length) {
      filters.semesterIds.forEach(id => params.append('semester_ids', id));
    }
    if (filters?.departmentIds?.length) {
      filters.departmentIds.forEach(id => params.append('department_ids', id));
    }
    if (filters?.courseIds?.length) {
      filters.courseIds.forEach(id => params.append('course_ids', id));
    }
    if (filters?.professorIds?.length) {
      filters.professorIds.forEach(id => params.append('professor_ids', id));
    }
    if (filters?.regulationIds?.length) {
      filters.regulationIds.forEach(id => params.append('regulation_ids', id));
    }
    if (filters?.isParallel !== undefined && filters?.isParallel !== null) {
      params.append('is_parallel', String(filters.isParallel));
    }

    const queryString = params.toString();
    const url = `${API_BASE_URL}/hita_evaluation/dashboard/answers${queryString ? `?${queryString}` : ''}`;

    const response = await authenticatedFetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch evaluation answers');
    }
    const result: ApiResponse<EvaluationAnswer[]> = await response.json();
    return result.data;
  },

  getSemesters: async (): Promise<DashboardSemester[]> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/hita_evaluation/dashboard/semesters`);
    if (!response.ok) {
      throw new Error('Failed to fetch semesters');
    }
    const result: ApiResponse<DashboardSemester[]> = await response.json();
    return result.data;
  },

  getDashboardDepartments: async (): Promise<DashboardDepartment[]> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/hita_evaluation/dashboard/departments`);
    if (!response.ok) {
      throw new Error('Failed to fetch departments');
    }
    const result: ApiResponse<DashboardDepartment[]> = await response.json();
    return result.data;
  },

  getDashboardCourses: async (departmentIds?: string[]): Promise<DashboardCourse[]> => {
    const params = new URLSearchParams();
    if (departmentIds?.length) {
      departmentIds.forEach(id => params.append('department_ids', id));
    }

    const queryString = params.toString();
    const url = `${API_BASE_URL}/hita_evaluation/dashboard/courses${queryString ? `?${queryString}` : ''}`;

    const response = await authenticatedFetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }
    const result: ApiResponse<DashboardCourse[]> = await response.json();
    return result.data;
  },

  getDashboardProfessors: async (departmentIds?: string[], courseIds?: string[]): Promise<DashboardProfessor[]> => {
    const params = new URLSearchParams();
    if (departmentIds?.length) {
      departmentIds.forEach(id => params.append('department_ids', id));
    }
    if (courseIds?.length) {
      courseIds.forEach(id => params.append('course_ids', id));
    }

    const queryString = params.toString();
    const url = `${API_BASE_URL}/hita_evaluation/dashboard/professors${queryString ? `?${queryString}` : ''}`;

    const response = await authenticatedFetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch professors');
    }
    const result: ApiResponse<DashboardProfessor[]> = await response.json();
    return result.data;
  },

  getCategories: async (): Promise<DashboardCategory[]> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/hita_evaluation/dashboard/categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const result: ApiResponse<DashboardCategory[]> = await response.json();
    return result.data;
  },

  getRegulations: async (): Promise<DashboardRegulation[]> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/hita_evaluation/dashboard/regulations`);
    if (!response.ok) {
      throw new Error('Failed to fetch regulations');
    }
    const result: ApiResponse<DashboardRegulation[]> = await response.json();
    return result.data;
  },
};
