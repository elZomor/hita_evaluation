import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle, ChevronDown, Link, Check, LayoutList, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../lib/api/client';
import { useEvaluationStore } from '../store/useEvaluationStore';
import { RatingButtons } from '../components/RatingButtons';
import { YesNoButtons } from '../components/YesNoButtons';
import { TextAnswer } from '../components/TextAnswer';
import type { SessionCourse, SessionProfessor, SessionQuestion, Answer, SubmitAnswersRequest, SubmitCourseAnswers } from '../types';

export const EvaluatePage = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { t } = useTranslation();

  const sessionData = useEvaluationStore((state) => state.sessionData);
  const answers = useEvaluationStore((state) => state.answers);
  const setAnswer = useEvaluationStore((state) => state.setAnswer);
  const setSessionData = useEvaluationStore((state) => state.setSessionData);
  const resetAll = useEvaluationStore((state) => state.resetAll);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showAlreadySubmitted, setShowAlreadySubmitted] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'subject' | 'category'>('subject');

  // Fetch session data if not in store (resume scenario)
  const { data: fetchedSession, isLoading: loadingSession, isError } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => apiClient.getSession(sessionId!),
    enabled: !!sessionId && (!sessionData || sessionData.session_id !== sessionId),
  });

  // Handle fetched session data
  useEffect(() => {
    if (fetchedSession) {
      if (fetchedSession.status === 'completed') {
        // Session already completed, show already submitted page
        setShowAlreadySubmitted(true);
      } else {
        setSessionData(fetchedSession);
      }
    }
  }, [fetchedSession, setSessionData]);

  // Handle fetch error
  useEffect(() => {
    if (isError) {
      // Session not found, redirect to select
      resetAll();
      navigate('/select');
    }
  }, [isError, resetAll, navigate]);

  useEffect(() => {
    if (!sessionId) {
      navigate('/select');
    }
  }, [sessionId, navigate]);

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  // Reorganize data for category-first view
  const categoryGroupedData = useMemo(() => {
    if (!sessionData) return [];

    const categoryMap = new Map<string, {
      categoryName: string;
      questions: Array<{
        question: SessionQuestion;
        courseProfessors: Array<{
          course: SessionCourse;
          professor: SessionProfessor;
        }>;
      }>;
    }>();

    // Group questions by category, then by question text (to find same questions across professors)
    sessionData.courses.forEach((course) => {
      course.professors.forEach((professor) => {
        professor.questions.forEach((question) => {
          const categoryName = question.category_name || 'uncategorized';

          if (!categoryMap.has(categoryName)) {
            categoryMap.set(categoryName, {
              categoryName,
              questions: [],
            });
          }

          const category = categoryMap.get(categoryName)!;

          // Find if this question already exists (by question text)
          let existingQuestion = category.questions.find(
            (q) => q.question.question_text === question.question_text
          );

          if (!existingQuestion) {
            existingQuestion = {
              question,
              courseProfessors: [],
            };
            category.questions.push(existingQuestion);
          }

          existingQuestion.courseProfessors.push({ course, professor });
        });
      });
    });

    return Array.from(categoryMap.values());
  }, [sessionData]);

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

  if (showAlreadySubmitted) {
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
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('alreadySubmitted.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {t('alreadySubmitted.message')}
            </p>
            <button
              onClick={() => {
                resetAll();
                navigate('/');
              }}
              className="mt-4 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-lg transition-colors focus:outline-none focus:ring-4 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950"
            >
              {t('alreadySubmitted.newSurvey')}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (loadingSession || !sessionData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Copy Link Banner */}
      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          {t('evaluate.resumeLink')}
        </p>
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-900 rounded-lg transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              {t('evaluate.copied')}
            </>
          ) : (
            <>
              <Link className="w-4 h-4" />
              {t('evaluate.copyLink')}
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('evaluate.title')}
          </h2>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('subject')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'subject'
                  ? 'bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              {t('evaluate.viewBySubject')}
            </button>
            <button
              onClick={() => setViewMode('category')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'category'
                  ? 'bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <LayoutList className="w-4 h-4" />
              {t('evaluate.viewByCategory')}
            </button>
          </div>
        </div>

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

      {/* Subject-first View */}
      {viewMode === 'subject' && (
        <div className="space-y-4">
          {sessionData.courses.map((course) => (
            <div key={course.course_id} className="space-y-2">
              <h3 className="sticky top-0 z-40 text-lg font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-900 py-3 -mx-4 px-4 border-b border-gray-200 dark:border-gray-700 shadow-sm">
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
      )}

      {/* Category-first View */}
      {viewMode === 'category' && (
        <div className="space-y-4">
          {categoryGroupedData.map((category) => {
            const categoryKey = `cat-${category.categoryName}`;
            const isCategoryExpanded = expandedItems.has(categoryKey);

            // Calculate category progress
            let totalInCategory = 0;
            let answeredInCategory = 0;
            category.questions.forEach((qg) => {
              qg.courseProfessors.forEach(({ course, professor }) => {
                totalInCategory++;
                const answerKey = `${course.course_id}-${professor.professor_id}`;
                if (answers[answerKey]?.[qg.question.id]) {
                  answeredInCategory++;
                }
              });
            });
            const isCategoryComplete = totalInCategory > 0 && answeredInCategory === totalInCategory;

            return (
              <div key={category.categoryName} className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                {/* Category Header - Accordion */}
                <button
                  onClick={() => toggleExpanded(categoryKey)}
                  className="sticky top-0 z-40 w-full px-4 py-3 flex items-center justify-between text-start rounded-t-lg border-b transition-colors shadow-md bg-amber-100 dark:bg-gray-900 border-amber-200 dark:border-gray-700 hover:bg-amber-200 dark:hover:bg-gray-800"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-amber-900 dark:text-amber-400">
                      {category.categoryName === 'uncategorized' ? t('evaluate.uncategorized') : category.categoryName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('evaluate.progress', { answered: answeredInCategory, total: totalInCategory })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCategoryComplete ? (
                      <span className="px-2 py-1 text-xs font-medium bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-300 rounded">
                        {t('evaluate.complete')}
                      </span>
                    ) : answeredInCategory > 0 ? (
                      <span className="px-2 py-1 text-xs font-medium bg-amber-200 dark:bg-amber-900/50 text-amber-800 dark:text-amber-400 rounded">
                        {t('evaluate.inProgress')}
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        {t('evaluate.notStarted')}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform ${isCategoryExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {/* Category Content */}
                <AnimatePresence>
                  {isCategoryExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-4 space-y-4">
                        {/* Questions in this category */}
                        {category.questions.map((questionGroup, qIndex) => {
                          const { question, courseProfessors } = questionGroup;
                          const questionKey = `q-${category.categoryName}-${qIndex}`;
                          const isQuestionExpanded = expandedItems.has(questionKey);

                          // Calculate question progress
                          const answeredForQuestion = courseProfessors.filter(({ course, professor }) => {
                            const answerKey = `${course.course_id}-${professor.professor_id}`;
                            return !!answers[answerKey]?.[question.id];
                          }).length;
                          const totalForQuestion = courseProfessors.length;
                          const isQuestionComplete = totalForQuestion > 0 && answeredForQuestion === totalForQuestion;

                          return (
                            <div
                              key={questionKey}
                              className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                            >
                              {/* Question Header - Accordion */}
                              <button
                                onClick={() => toggleExpanded(questionKey)}
                                className={`sticky top-[4.5rem] z-30 w-full px-4 py-3 flex items-center justify-between text-start transition-colors rounded-t-xl shadow-md border-b ${
                                  isQuestionComplete
                                    ? 'bg-green-100 dark:bg-green-800 border-green-200 dark:border-green-700'
                                    : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                              >
                                <div className="flex-1 pe-4">
                                  <p className={`text-sm font-medium ${
                                    isQuestionComplete
                                      ? 'text-green-800 dark:text-green-300'
                                      : 'text-slate-800 dark:text-slate-200'
                                  }`}>
                                    {question.question_text}
                                    {question.is_mandatory && (
                                      <span className="text-red-500 dark:text-red-400 ms-1">*</span>
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {t('evaluate.progress', { answered: answeredForQuestion, total: totalForQuestion })}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isQuestionComplete ? (
                                    <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
                                  ) : answeredForQuestion > 0 ? (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded">
                                      {answeredForQuestion}/{totalForQuestion}
                                    </span>
                                  ) : null}
                                  <ChevronDown
                                    className={`w-4 h-4 text-gray-500 transition-transform ${isQuestionExpanded ? 'rotate-180' : ''}`}
                                  />
                                </div>
                              </button>

                              {/* Question Content - Professor Answers */}
                              <AnimatePresence>
                                {isQuestionExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                      {courseProfessors.map(({ course, professor }) => {
                                        const answerKey = `${course.course_id}-${professor.professor_id}`;
                                        const professorAnswers = answers[answerKey] || {};
                                        const answer = professorAnswers[question.id];
                                        const isAnswered = !!answer;

                                        return (
                                          <div
                                            key={`${course.course_id}-${professor.professor_id}`}
                                            className="bg-white dark:bg-gray-800"
                                          >
                                            {/* Subject & Professor info - Sticky */}
                                            <div className="sticky top-[8rem] z-20 px-4 py-2 flex items-center justify-between border-b shadow-md bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                                              <div>
                                                <p className={`font-medium ${
                                                  isAnswered
                                                    ? 'text-green-700 dark:text-green-400'
                                                    : 'text-gray-900 dark:text-white'
                                                }`}>
                                                  {professor.professor_name}
                                                  {isAnswered && (
                                                    <span className="ms-2 text-green-600 dark:text-green-400">✓</span>
                                                  )}
                                                </p>
                                                <p className={`text-sm ${
                                                  isAnswered
                                                    ? 'text-green-600 dark:text-green-500'
                                                    : 'text-gray-500 dark:text-gray-400'
                                                }`}>
                                                  {course.subject_name}
                                                </p>
                                              </div>
                                            </div>

                                            {/* Answer Input */}
                                            <div className="px-4 py-4">
                                            {question.question_type === 'YN' && (
                                              <YesNoButtons
                                                value={answer?.ratingValue === 1 ? true : answer?.ratingValue === 0 ? false : undefined}
                                                onChange={(value) =>
                                                  handleAnswerChange(course.course_id, professor.professor_id, question.id, {
                                                    questionId: String(question.id),
                                                    ratingValue: value ? 1 : 0 as any,
                                                  })
                                                }
                                              />
                                            )}

                                            {question.question_type === 'R' && (
                                              <RatingButtons
                                                value={answer?.ratingValue}
                                                onChange={(value) =>
                                                  handleAnswerChange(course.course_id, professor.professor_id, question.id, {
                                                    questionId: String(question.id),
                                                    ratingValue: value,
                                                  })
                                                }
                                                variant="rating"
                                              />
                                            )}

                                            {question.question_type === 'S' && (
                                              <RatingButtons
                                                value={answer?.ratingValue}
                                                onChange={(value) =>
                                                  handleAnswerChange(course.course_id, professor.professor_id, question.id, {
                                                    questionId: String(question.id),
                                                    ratingValue: value,
                                                  })
                                                }
                                                variant="suggestion"
                                              />
                                            )}

                                            {question.question_type === 'T' && (
                                              <TextAnswer
                                                value={answer?.textValue || ''}
                                                onChange={(value) =>
                                                  handleAnswerChange(course.course_id, professor.professor_id, question.id, {
                                                    questionId: String(question.id),
                                                    textValue: value,
                                                  })
                                                }
                                              />
                                            )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

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
  const { t, i18n } = useTranslation();

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = professor.questions.length;
  const isComplete = answeredCount === totalQuestions && totalQuestions > 0;

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(i18n.language),
    [i18n.language]
  );

  const groupedQuestions = useMemo(() => {
    const groups = new Map<string, SessionQuestion[]>();
    professor.questions.forEach((question) => {
      const key = question.category_name || 'uncategorized';
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(question);
    });
    return Array.from(groups.entries()).map(([categoryName, questions]) => ({
      categoryName,
      questions,
    }));
  }, [professor.questions]);

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(groupedQuestions.map((group) => group.categoryName))
  );

  const categoryNamesRef = useRef<string[]>(
    groupedQuestions.map((group) => group.categoryName)
  );

  useEffect(() => {
    const names = groupedQuestions.map((group) => group.categoryName);
    const prevNames = categoryNamesRef.current;
    const changed =
      names.length !== prevNames.length ||
      names.some((name, index) => name !== prevNames[index]);

    if (changed) {
      categoryNamesRef.current = names;
      setExpandedCategories(new Set(names));
    }
  }, [groupedQuestions]);

  const toggleCategorySection = (categoryName: string) => {
    if (categoryName === 'uncategorized') return;
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
      <button
        onClick={onToggle}
        className="sticky top-12 z-30 w-full px-4 py-3 flex items-center justify-between text-start bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700 rounded-t-lg shadow-sm"
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
          >
            <div className="px-4 pb-4 space-y-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              {/* Group questions by category */}
              {groupedQuestions.map(({ categoryName, questions }) => {
                const isCategoryComplete = questions.every(
                  (question) => !!answers[question.id]
                );

                const answeredInCategory = questions.reduce(
                  (count, question) => (answers[question.id] ? count + 1 : count),
                  0
                );
                const totalInCategory = questions.length;

                const categoryContainerClasses = isCategoryComplete
                  ? 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600';

                const categoryTextClasses = isCategoryComplete
                  ? 'text-green-800 dark:text-green-300'
                  : 'text-slate-800 dark:text-slate-200';

                const isSpecialCategory = categoryName === 'uncategorized';
                const isCategoryExpanded =
                  isSpecialCategory || expandedCategories.has(categoryName);

                return (
                  <div
                    key={categoryName}
                    className="space-y-2 w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/40 shadow-inner"
                  >
                    {!isSpecialCategory && (
                      <button
                        type="button"
                        onClick={() => toggleCategorySection(categoryName)}
                        aria-expanded={isCategoryExpanded}
                        className={`sticky top-[7.5rem] z-20 w-full px-4 py-3 rounded-t-2xl border-b text-left flex items-center justify-between gap-3 transition-colors ${categoryContainerClasses}`}
                      >
                        <span className={`text-lg font-bold flex items-center gap-3 ${categoryTextClasses}`}>
                          {categoryName}
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            ({numberFormatter.format(answeredInCategory)}/{numberFormatter.format(totalInCategory)})
                          </span>
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-current transition-transform ${
                            isCategoryExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    )}

                    <AnimatePresence initial={false}>
                      {isCategoryExpanded && (
                        <motion.div
                          key={categoryName}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-5 w-full px-4 pb-4"
                        >
                          {questions.map((question, index) => {
                            const answer = answers[question.id];
                            const questionType = question.question_type;

                            const isAnswered = !!answer;
                            const isLast = index === questions.length - 1;

                            return (
                              <div
                                key={question.id}
                                className={`space-y-3 w-full pt-3 border-t ${
                                  isLast ? 'pb-2' : 'pb-5'
                                } border-gray-200 dark:border-gray-700`}
                              >
                                <div className="w-full">
                                  <label className={`block text-sm font-medium w-full ${
                                    isAnswered
                                      ? 'text-green-800 dark:text-green-300'
                                      : 'text-slate-800 dark:text-slate-200'
                                  }`}>
                                    {question.question_text}
                                    {question.is_mandatory && (
                                      <span className="text-red-500 dark:text-red-400 ms-1">*</span>
                                    )}
                                    {isAnswered && (
                                      <span className="ms-2 text-green-600 dark:text-green-400">✓</span>
                                    )}
                                  </label>
                                </div>

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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
