export interface EvaluationAnswer {
  evaluation_id: string
  submitted_at: string
  department_id: string
  department_name: string
  course_id: string
  course_name: string
  professor_id: string
  professor_name: string
  regulation?: string
  cohort_id?: string
  question_id: string
  question_text: string
  category_id: string
  category_name: string
  rating: number
}

export interface DashboardDepartment {
  id: string
  name_en: string
  name_ar: string
}

export interface DashboardCourse {
  id: string
  name_en: string
  name_ar: string
  department_id: string
}

export interface DashboardProfessor {
  id: string
  name_en: string
  name_ar: string
  department_id: string
}

export interface DashboardCategory {
  id: string
  name_en: string
  name_ar: string
  order_index: number
}

export interface FilterParams {
  semesterIds?: string[]
  departmentIds?: string[]
  courseIds?: string[]
  professorIds?: string[]
  regulations?: string[]
  cohortIds?: string[]
}

export interface DashboardSemester {
  id: string
  year: number
  type: string
  type_display: string
  is_current: boolean
}

export interface ProfessorMetrics {
  professorId: string
  professorName: string
  avgScore: number
  responsesCount: number
  categoryScores: Record<string, { avg: number; count: number }>
  worstCategory?: { name: string; score: number }
  trendDelta?: number
}

export interface CourseMetrics {
  courseId: string
  courseName: string
  avgScore: number
  responsesCount: number
  categoryScores: Record<string, { avg: number; count: number }>
}

export interface KPIMetrics {
  overallScore: number
  submittedForms: number
  answersCount: number
  professorsEvaluated: number
  coursesEvaluated: number
  coveragePercent?: number
  dispersion: number
  belowTargetPercent: number
  lowSampleCount: number
}

export interface TimeSeriesPoint {
  date: string
  avgScore: number
  count: number
}

export interface RatingDistribution {
  rating: number
  count: number
  percentage: number
}
