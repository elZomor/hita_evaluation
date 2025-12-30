import type {
  EvaluationAnswer,
  DashboardDepartment,
  DashboardCourse,
  DashboardProfessor,
  DashboardCategory,
  DashboardSemester,
  FilterParams,
} from '../../types/dashboard';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005';

interface ApiResponse<T> {
  data: T;
  status: string;
  message: string | null;
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
    if (filters?.regulations?.length) {
      filters.regulations.forEach(r => params.append('regulations', r));
    }

    const queryString = params.toString();
    const url = `${API_BASE_URL}/hita_evaluation/dashboard/answers${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch evaluation answers');
    }
    const result: ApiResponse<EvaluationAnswer[]> = await response.json();
    return result.data;
  },

  getSemesters: async (): Promise<DashboardSemester[]> => {
    const response = await fetch(`${API_BASE_URL}/hita_evaluation/dashboard/semesters`);
    if (!response.ok) {
      throw new Error('Failed to fetch semesters');
    }
    const result: ApiResponse<DashboardSemester[]> = await response.json();
    return result.data;
  },

  getDashboardDepartments: async (): Promise<DashboardDepartment[]> => {
    const response = await fetch(`${API_BASE_URL}/hita_evaluation/dashboard/departments`);
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

    const response = await fetch(url);
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

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch professors');
    }
    const result: ApiResponse<DashboardProfessor[]> = await response.json();
    return result.data;
  },

  getCategories: async (): Promise<DashboardCategory[]> => {
    const response = await fetch(`${API_BASE_URL}/hita_evaluation/dashboard/categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const result: ApiResponse<DashboardCategory[]> = await response.json();
    return result.data;
  },
};
