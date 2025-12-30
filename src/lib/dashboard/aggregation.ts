import type {
  EvaluationAnswer,
  ProfessorMetrics,
  CourseMetrics,
  KPIMetrics,
  TimeSeriesPoint,
  RatingDistribution,
} from '@/types/dashboard';
import { format, startOfWeek } from 'date-fns';

export function calculateKPIMetrics(
  answers: EvaluationAnswer[],
  targetScore: number = 4.0
): KPIMetrics {
  if (answers.length === 0) {
    return {
      overallScore: 0,
      submittedForms: 0,
      answersCount: 0,
      professorsEvaluated: 0,
      coursesEvaluated: 0,
      dispersion: 0,
      belowTargetPercent: 0,
      lowSampleCount: 0,
    };
  }

  const evaluationAverages = calculatePerEvaluationAverages(answers);
  const overallScore =
    evaluationAverages.reduce((sum, avg) => sum + avg, 0) /
      evaluationAverages.length || 0;

  const evaluationIds = new Set(answers.map((a) => a.evaluation_id));
  const professorIds = new Set(answers.map((a) => a.professor_id));
  const courseIds = new Set(answers.map((a) => a.course_id));

  const variance =
    evaluationAverages.reduce(
      (sum, avg) => sum + Math.pow(avg - overallScore, 2),
      0
    ) / evaluationAverages.length;
  const dispersion = Math.sqrt(variance);

  const belowTarget = evaluationAverages.filter((avg) => avg < targetScore);
  const belowTargetPercent =
    (belowTarget.length / evaluationAverages.length) * 100;

  return {
    overallScore,
    submittedForms: evaluationIds.size,
    answersCount: answers.length,
    professorsEvaluated: professorIds.size,
    coursesEvaluated: courseIds.size,
    dispersion,
    belowTargetPercent,
    lowSampleCount: 0,
  };
}

export function calculatePerEvaluationAverages(
  answers: EvaluationAnswer[]
): number[] {
  const evaluationGroups = new Map<string, number[]>();

  for (const answer of answers) {
    if (!evaluationGroups.has(answer.evaluation_id)) {
      evaluationGroups.set(answer.evaluation_id, []);
    }
    evaluationGroups.get(answer.evaluation_id)!.push(answer.rating);
  }

  return Array.from(evaluationGroups.values()).map(
    (ratings) => ratings.reduce((sum, r) => sum + r, 0) / ratings.length
  );
}

export function calculateProfessorMetrics(
  answers: EvaluationAnswer[]
): ProfessorMetrics[] {
  const professorGroups = new Map<
    string,
    {
      name: string;
      evaluations: Map<string, number[]>;
      categories: Map<string, number[]>;
    }
  >();

  for (const answer of answers) {
    if (!professorGroups.has(answer.professor_id)) {
      professorGroups.set(answer.professor_id, {
        name: answer.professor_name,
        evaluations: new Map(),
        categories: new Map(),
      });
    }

    const prof = professorGroups.get(answer.professor_id)!;

    if (!prof.evaluations.has(answer.evaluation_id)) {
      prof.evaluations.set(answer.evaluation_id, []);
    }
    prof.evaluations.get(answer.evaluation_id)!.push(answer.rating);

    if (!prof.categories.has(answer.category_name)) {
      prof.categories.set(answer.category_name, []);
    }
    prof.categories.get(answer.category_name)!.push(answer.rating);
  }

  const metrics: ProfessorMetrics[] = [];

  for (const [professorId, data] of professorGroups) {
    const evaluationAvgs = Array.from(data.evaluations.values()).map(
      (ratings) => ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    );

    const avgScore =
      evaluationAvgs.reduce((sum, avg) => sum + avg, 0) / evaluationAvgs.length;

    const categoryScores: Record<string, { avg: number; count: number }> = {};
    for (const [category, ratings] of data.categories) {
      categoryScores[category] = {
        avg: ratings.reduce((sum, r) => sum + r, 0) / ratings.length,
        count: ratings.length,
      };
    }

    let worstCategory: { name: string; score: number } | undefined;
    for (const [name, { avg }] of Object.entries(categoryScores)) {
      if (!worstCategory || avg < worstCategory.score) {
        worstCategory = { name, score: avg };
      }
    }

    metrics.push({
      professorId,
      professorName: data.name,
      avgScore,
      responsesCount: data.evaluations.size,
      categoryScores,
      worstCategory,
    });
  }

  return metrics.sort((a, b) => b.avgScore - a.avgScore);
}

export function calculateCourseMetrics(
  answers: EvaluationAnswer[]
): CourseMetrics[] {
  const courseGroups = new Map<
    string,
    {
      name: string;
      evaluations: Map<string, number[]>;
      categories: Map<string, number[]>;
    }
  >();

  for (const answer of answers) {
    if (!courseGroups.has(answer.course_id)) {
      courseGroups.set(answer.course_id, {
        name: answer.course_name,
        evaluations: new Map(),
        categories: new Map(),
      });
    }

    const course = courseGroups.get(answer.course_id)!;

    if (!course.evaluations.has(answer.evaluation_id)) {
      course.evaluations.set(answer.evaluation_id, []);
    }
    course.evaluations.get(answer.evaluation_id)!.push(answer.rating);

    if (!course.categories.has(answer.category_name)) {
      course.categories.set(answer.category_name, []);
    }
    course.categories.get(answer.category_name)!.push(answer.rating);
  }

  const metrics: CourseMetrics[] = [];

  for (const [courseId, data] of courseGroups) {
    const evaluationAvgs = Array.from(data.evaluations.values()).map(
      (ratings) => ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    );

    const avgScore =
      evaluationAvgs.reduce((sum, avg) => sum + avg, 0) / evaluationAvgs.length;

    const categoryScores: Record<string, { avg: number; count: number }> = {};
    for (const [category, ratings] of data.categories) {
      categoryScores[category] = {
        avg: ratings.reduce((sum, r) => sum + r, 0) / ratings.length,
        count: ratings.length,
      };
    }

    metrics.push({
      courseId,
      courseName: data.name,
      avgScore,
      responsesCount: data.evaluations.size,
      categoryScores,
    });
  }

  return metrics.sort((a, b) => b.avgScore - a.avgScore);
}

export function calculateTimeSeriesData(
  answers: EvaluationAnswer[]
): TimeSeriesPoint[] {
  const groups = new Map<string, { evaluations: Map<string, number[]> }>();

  for (const answer of answers) {
    const date = startOfWeek(new Date(answer.submitted_at));
    const dateKey = format(date, 'yyyy-MM-dd');

    if (!groups.has(dateKey)) {
      groups.set(dateKey, { evaluations: new Map() });
    }

    const group = groups.get(dateKey)!;
    if (!group.evaluations.has(answer.evaluation_id)) {
      group.evaluations.set(answer.evaluation_id, []);
    }
    group.evaluations.get(answer.evaluation_id)!.push(answer.rating);
  }

  const points: TimeSeriesPoint[] = [];

  for (const [date, data] of groups) {
    const evaluationAvgs = Array.from(data.evaluations.values()).map(
      (ratings) => ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    );

    const avgScore =
      evaluationAvgs.reduce((sum, avg) => sum + avg, 0) / evaluationAvgs.length;

    points.push({
      date,
      avgScore,
      count: data.evaluations.size,
    });
  }

  return points.sort((a, b) => a.date.localeCompare(b.date));
}

export function calculateRatingDistribution(
  answers: EvaluationAnswer[]
): RatingDistribution[] {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (const answer of answers) {
    counts[answer.rating]++;
  }

  const total = answers.length;

  return [1, 2, 3, 4, 5].map((rating) => ({
    rating,
    count: counts[rating],
    percentage: total > 0 ? (counts[rating] / total) * 100 : 0,
  }));
}

export function calculateCategoryBreakdown(
  answers: EvaluationAnswer[]
): Record<string, { avg: number; count: number }> {
  const categories = new Map<string, number[]>();

  for (const answer of answers) {
    if (!categories.has(answer.category_name)) {
      categories.set(answer.category_name, []);
    }
    categories.get(answer.category_name)!.push(answer.rating);
  }

  const breakdown: Record<string, { avg: number; count: number }> = {};

  for (const [name, ratings] of categories) {
    breakdown[name] = {
      avg: ratings.reduce((sum, r) => sum + r, 0) / ratings.length,
      count: ratings.length,
    };
  }

  return breakdown;
}

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => JSON.stringify(row[header] ?? '')).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
