export interface Department {
  value: string;
  label: string;
}

export interface Regulation {
  id: number;
  name: string;
  valid_from: string | null;
  valid_to: string | null;
  is_latest: boolean;
}

export type CategoryType = "REQUIRED" | "OPTIONAL";
export type CategoryScope = "ACADEMY" | "INSTITUTE" | "DEPARTMENT";

// Backend response type for courses
export interface Course {
  id: number;
  subject_name: string;
  category: string;
  credit_hours: number;
  professor_name: string;
  department: string;
}

export interface CourseAssignment {
  assignmentId: string;
  courseId: string;
  courseName_ar: string;
  courseName_en: string;
  professorId: string;
  professorName_ar: string;
  professorName_en: string;
  department: string;
  category?: string;
  creditHours?: number;
}

export interface Category {
  id: string;
  type: CategoryType;
  scope: CategoryScope;
  title_ar: string;
  title_en: string;
  items: CourseAssignment[];
}

export interface CatalogResponse {
  categories: Category[];
}

export type QuestionType = "RATING" | "TEXT";

export interface Question {
  id: string;
  type: QuestionType;
  required: boolean;
  text_ar: string;
  text_en: string;
  order: number;
}

export interface QuestionsResponse {
  assignmentId: string;
  questions: Question[];
}

export interface Answer {
  questionId: string;
  ratingValue?: 1 | 2 | 3 | 4 | 5;
  textValue?: string;
}

export interface EvaluationItem {
  assignmentId: string;
  answers: Answer[];
}

export interface SubmitPayload {
  departmentId: string;
  submittedAt: string;
  items: EvaluationItem[];
}

// Submit Answers API types
export interface SubmitAnswer {
  question_id: number;
  yes_no_value?: boolean | null;
  rating_value?: number | null;
  text_value?: string | null;
}

export interface SubmitProfessorAnswers {
  professor_id: number;
  answers: SubmitAnswer[];
}

export interface SubmitCourseAnswers {
  course_id: number;
  professors: SubmitProfessorAnswers[];
}

export interface SubmitAnswersRequest {
  session_id: string;
  courses: SubmitCourseAnswers[];
}

export interface SubmitAnswersResponse {
  answers_count: number;
}

export interface SelectedAssignment extends CourseAssignment {
  categoryId: string;
  categoryTitle_ar: string;
  categoryTitle_en: string;
}

// Session API types
export interface SessionQuestion {
  id: number;
  question_text: string;
  question_type: 'R' | 'YN' | 'S' | 'T';
  is_mandatory: boolean;
  category_id: number | null;
  category_name: string | null;
}

export interface SessionProfessor {
  professor_id: number;
  professor_name: string;
  questions: SessionQuestion[];
}

export interface SessionCourse {
  course_id: number;
  subject_name: string;
  professors: SessionProfessor[];
}

export interface StartSessionRequest {
  course_ids: number[];
  department: string;
  regulation_id: number;
  is_parallel: boolean;
}

export interface StartSessionResponse {
  session_id: string;
  courses: SessionCourse[];
}

export interface GetSessionResponse {
  session_id: string;
  status: 'draft' | 'completed';
  department: string;
  regulation_id: number | null;
  is_parallel: boolean;
  courses: SessionCourse[];
}
