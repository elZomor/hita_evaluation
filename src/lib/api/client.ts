import type {
  Department,
  Regulation,
  Course,
  CourseAssignment,
  StartSessionRequest,
  StartSessionResponse,
  GetSessionResponse,
  SubmitAnswersRequest,
  SubmitAnswersResponse,
} from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005';

interface ApiResponse<T> {
  data: T;
  status: string;
  message: string | null;
}

export const apiClient = {
  getDepartments: async (): Promise<Department[]> => {
    const response = await fetch(`${API_BASE_URL}/hita_evaluation/departments`);
    if (!response.ok) {
      throw new Error('Failed to fetch departments');
    }
    const result: ApiResponse<Department[]> = await response.json();
    return result.data;
  },

  getRegulations: async (): Promise<Regulation[]> => {
    const response = await fetch(`${API_BASE_URL}/hita_evaluation/regulations`);
    if (!response.ok) {
      throw new Error('Failed to fetch regulations');
    }
    const result: ApiResponse<Regulation[]> = await response.json();
    return result.data;
  },

  getCourses: async (filters?: {
    department?: string;
    regulation_id?: number;
    is_parallel?: boolean;
  }): Promise<CourseAssignment[]> => {
    const params = new URLSearchParams();
    if (filters?.department) params.append('department', filters.department);
    if (filters?.regulation_id) params.append('regulation_id', String(filters.regulation_id));
    if (filters?.is_parallel !== undefined) params.append('is_parallel', String(filters.is_parallel));

    const queryString = params.toString();
    const url = `${API_BASE_URL}/hita_evaluation/courses${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }
    const result: ApiResponse<Course[]> = await response.json();

    // Transform backend response to frontend CourseAssignment format
    return result.data.map((course) => ({
      assignmentId: String(course.id),
      courseId: String(course.id),
      courseName_ar: course.subject_name,
      courseName_en: course.subject_name,
      professorId: String(course.id),
      professorName_ar: course.professor_name || '',
      professorName_en: course.professor_name || '',
      department: course.department,
      category: course.category,
      creditHours: course.credit_hours,
    }));
  },

  startSession: async (request: StartSessionRequest): Promise<StartSessionResponse> => {
    const response = await fetch(`${API_BASE_URL}/hita_evaluation/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error('Failed to start session');
    }
    const result: ApiResponse<StartSessionResponse> = await response.json();
    return result.data;
  },

  getSession: async (sessionId: string): Promise<GetSessionResponse> => {
    const response = await fetch(`${API_BASE_URL}/hita_evaluation/sessions/${sessionId}`);
    if (!response.ok) {
      throw new Error('Session not found');
    }
    const result: ApiResponse<GetSessionResponse> = await response.json();
    return result.data;
  },

  submitAnswers: async (payload: SubmitAnswersRequest): Promise<SubmitAnswersResponse> => {
    const response = await fetch(`${API_BASE_URL}/hita_evaluation/sessions/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Failed to submit answers');
    }
    const result: ApiResponse<SubmitAnswersResponse> = await response.json();
    return result.data;
  },
};
