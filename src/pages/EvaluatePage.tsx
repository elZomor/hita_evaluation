import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../lib/api/client';
import { useEvaluationStore } from '../store/useEvaluationStore';
import { RatingButtons } from '../components/RatingButtons';
import { YesNoButtons } from '../components/YesNoButtons';
import { TextAnswer } from '../components/TextAnswer';
import type { SessionCourse, SessionProfessor, SessionQuestion, Answer, SubmitAnswersRequest, SubmitCourseAnswers } from '../types';

export const EvaluatePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const sessionData = useEvaluationStore((state) => state.sessionData);
  const answers = useEvaluationStore((state) => state.answers);
  const setAnswer = useEvaluationStore((state) => state.setAnswer);
  const resetAll = useEvaluationStore((state) => state.resetAll);

  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!sessionData || sessionData.courses.length === 0) {
      navigate('/select');
    }
  }, [sessionData, navigate]);

  // Count total professors and completed evaluations
  const { totalProfessors, completedCount, canSubmit } = useMemo(() => {
    if (!sessionData) return { totalProfessors: 0, completedCount: 0, canSubmit: false };

    let total = 0;
    let completed = 0;
    let allMandatoryAnswered = true;

    sessionData.courses.forEach((course) => {
      course.professors.forEach((professor) => {
        total++;
        const key = `${course.course_id}-${professor.professor_id}`;
        const professorAnswers = answers[key] || {};

        // Check if all mandatory questions for this professor are answered
        const mandatoryQuestions = professor.questions.filter((q) => q.is_mandatory);
        const allMandatoryQuestionsAnswered = mandatoryQuestions.every(
          (q) => professorAnswers[q.id]
        );

        // Check if all questions are answered (for completion status)
        const allQuestionsAnswered = professor.questions.every(
          (q) => professorAnswers[q.id]
        );

        if (allQuestionsAnswered && professor.questions.length > 0) {
          completed++;
        }

        if (!allMandatoryQuestionsAnswered && mandatoryQuestions.length > 0) {
          allMandatoryAnswered = false;
        }
      });
    });

    return { totalProfessors: total, completedCount: completed, canSubmit: allMandatoryAnswered && total > 0 };
  }, [sessionData, answers]);

  const toggleExpanded = (key: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleAnswerChange = (
    courseId: number,
    professorId: number,
    questionId: number,
    answer: Answer
  ) => {
    setAnswer(courseId, professorId, questionId, answer);
  };

  const submitMutation = useMutation({
    mutationFn: apiClient.submitAnswers,
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => {
        resetAll();
        navigate('/');
      }, 2000);
    },
  });

  const handleSubmit = () => {
    if (!canSubmit || !sessionData) return;

    // Build submission payload in backend format
    const courses: SubmitCourseAnswers[] = sessionData.courses.map((course) => ({
      course_id: course.course_id,
      professors: course.professors.map((professor) => {
        const key = `${course.course_id}-${professor.professor_id}`;
        const professorAnswers = answers[key] || {};

        return {
          professor_id: professor.professor_id,
          answers: professor.questions.map((question) => {
            const answer = professorAnswers[question.id];
            const questionType = question.question_type;

            return {
              question_id: question.id,
              yes_no_value: questionType === 'YN' && answer?.ratingValue !== undefined
                ? answer.ratingValue === 1
                : null,
              rating_value: (questionType === 'R' || questionType === 'S') && answer?.ratingValue
                ? answer.ratingValue
                : null,
              text_value: questionType === 'T' && answer?.textValue
                ? answer.textValue
                : null,
            };
          }),
        };
      }),
    }));

    const payload: SubmitAnswersRequest = {
      session_id: sessionData.session_id,
      courses,
    };

    submitMutation.mutate(payload);
  };

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]"
      >
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <CheckCircle className="w-24 h-24 mx-auto text-green-600 dark:text-green-400" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('success.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {t('success.message')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {t('success.redirecting')}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!sessionData) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('evaluate.title')}
        </h2>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('evaluate.totalItems')}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalProfessors}
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('evaluate.completedItems')}
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {completedCount}
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('evaluate.remainingItems')}
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {totalProfessors - completedCount}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sessionData.courses.map((course) => (
          <div key={course.course_id} className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {course.subject_name}
            </h3>
            {course.professors.map((professor) => (
              <ProfessorAccordion
                key={`${course.course_id}-${professor.professor_id}`}
                course={course}
                professor={professor}
                isExpanded={expandedItems.has(`${course.course_id}-${professor.professor_id}`)}
                onToggle={() => toggleExpanded(`${course.course_id}-${professor.professor_id}`)}
                answers={answers[`${course.course_id}-${professor.professor_id}`] || {}}
                onAnswerChange={(questionId, answer) =>
                  handleAnswerChange(course.course_id, professor.professor_id, questionId, answer)
                }
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-6">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitMutation.isPending}
          className="px-8 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition-colors focus:outline-none focus:ring-4 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950"
        >
          {submitMutation.isPending ? t('common.loading') : t('evaluate.submitEvaluation')}
        </button>
      </div>

      {!canSubmit && totalProfessors > 0 && (
        <p className="text-sm text-center text-red-600 dark:text-red-400">
          {t('evaluate.allRequired')}
        </p>
      )}
    </motion.div>
  );
};

// Professor Accordion Component
interface ProfessorAccordionProps {
  course: SessionCourse;
  professor: SessionProfessor;
  isExpanded: boolean;
  onToggle: () => void;
  answers: Record<number, Answer>;
  onAnswerChange: (questionId: number, answer: Answer) => void;
}

const ProfessorAccordion = ({
  course,
  professor,
  isExpanded,
  onToggle,
  answers,
  onAnswerChange,
}: ProfessorAccordionProps) => {
  const { t } = useTranslation();

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = professor.questions.length;
  const isComplete = answeredCount === totalQuestions && totalQuestions > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-start hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex-1">
          <div className="font-medium text-gray-900 dark:text-white">
            {professor.professor_name}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('evaluate.progress', { answered: answeredCount, total: totalQuestions })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isComplete ? (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
              {t('evaluate.complete')}
            </span>
          ) : answeredCount > 0 ? (
            <span className="px-2 py-1 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded">
              {t('evaluate.inProgress')}
            </span>
          ) : (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
              {t('evaluate.notStarted')}
            </span>
          )}
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              {/* Group questions by category */}
              {(() => {
                const grouped = professor.questions.reduce((acc, question) => {
                  const categoryKey = question.category_name || 'uncategorized';
                  if (!acc[categoryKey]) {
                    acc[categoryKey] = [];
                  }
                  acc[categoryKey].push(question);
                  return acc;
                }, {} as Record<string, SessionQuestion[]>);

                return Object.entries(grouped).map(([categoryName, questions]) => (
                  <div key={categoryName} className="space-y-4">
                    {/* Category Header */}
                    {categoryName !== 'uncategorized' && (
                      <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                        {categoryName}
                      </h4>
                    )}

                    {/* Questions in this category */}
                    <div className="space-y-5">
                      {questions.map((question) => {
                        const answer = answers[question.id];
                        const questionType = question.question_type;

                        return (
                          <div key={question.id} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              {question.question_text}
                              {question.is_mandatory && (
                                <span className="text-red-500 dark:text-red-400 ms-1">*</span>
                              )}
                            </label>

                            {/* Yes/No Question */}
                            {questionType === 'YN' && (
                              <YesNoButtons
                                value={answer?.ratingValue === 1 ? true : answer?.ratingValue === 0 ? false : undefined}
                                onChange={(value) =>
                                  onAnswerChange(question.id, {
                                    questionId: String(question.id),
                                    ratingValue: value ? 1 : 0 as any,
                                  })
                                }
                              />
                            )}

                            {/* Rating Question (1=Very Low, 5=Very High) */}
                            {questionType === 'R' && (
                              <RatingButtons
                                value={answer?.ratingValue}
                                onChange={(value) =>
                                  onAnswerChange(question.id, {
                                    questionId: String(question.id),
                                    ratingValue: value,
                                  })
                                }
                                variant="rating"
                              />
                            )}

                            {/* Suggestion Question (1=Strongly Disagree, 5=Strongly Agree) */}
                            {questionType === 'S' && (
                              <RatingButtons
                                value={answer?.ratingValue}
                                onChange={(value) =>
                                  onAnswerChange(question.id, {
                                    questionId: String(question.id),
                                    ratingValue: value,
                                  })
                                }
                                variant="suggestion"
                              />
                            )}

                            {/* Text Question */}
                            {questionType === 'T' && (
                              <TextAnswer
                                value={answer?.textValue || ''}
                                onChange={(value) =>
                                  onAnswerChange(question.id, {
                                    questionId: String(question.id),
                                    textValue: value,
                                  })
                                }
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
