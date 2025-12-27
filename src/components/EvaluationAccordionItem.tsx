import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, CheckCircle, Circle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../lib/api/client';
import { useEvaluationStore } from '../store/useEvaluationStore';
import { useDebouncedCallback } from '../lib/hooks/useDebounce';
import { RatingButtons } from './RatingButtons';
import { TextAnswer } from './TextAnswer';
import type { SelectedAssignment, Answer } from '../types';

const EMPTY_ANSWERS: Record<string, Answer> = {};

interface EvaluationAccordionItemProps {
  assignment: SelectedAssignment;
}

export const EvaluationAccordionItem = ({ assignment }: EvaluationAccordionItemProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [isOpen, setIsOpen] = useState(false);

  const setAnswer = useEvaluationStore((state) => state.setAnswer);
  const allAnswers = useEvaluationStore((state) => state.answers);
  const answers = useMemo(() => allAnswers[assignment.assignmentId] || EMPTY_ANSWERS, [allAnswers, assignment.assignmentId]);

  const { data: questionsData, isLoading } = useQuery({
    queryKey: ['questions', assignment.assignmentId],
    queryFn: () => apiClient.getQuestions(assignment.assignmentId),
  });

  const questions = questionsData?.questions || [];
  const answeredCount = Object.keys(answers).length;
  const requiredQuestions = questions.filter((q) => q.required);
  const requiredAnswered = requiredQuestions.filter((q) => answers[q.id]).length;
  const isComplete = requiredAnswered === requiredQuestions.length;

  const courseName = isArabic ? assignment.courseName_ar : assignment.courseName_en;
  const professorName = isArabic ? assignment.professorName_ar : assignment.professorName_en;

  const handleRatingChange = (questionId: string, value: 1 | 2 | 3 | 4 | 5) => {
    setAnswer(assignment.assignmentId, questionId, { questionId, ratingValue: value });
  };

  const debouncedSetAnswer = useDebouncedCallback(
    (assignmentId: string, questionId: string, value: string) => {
      setAnswer(assignmentId, questionId, { questionId, textValue: value });
    },
    300
  );

  const handleTextChange = (questionId: string, value: string) => {
    debouncedSetAnswer(assignment.assignmentId, questionId, value);
  };

  const getStatus = () => {
    if (isComplete) return 'complete';
    if (answeredCount > 0) return 'inProgress';
    return 'notStarted';
  };

  const status = getStatus();

  const StatusIcon = {
    complete: CheckCircle,
    inProgress: Clock,
    notStarted: Circle,
  }[status];

  const statusColor = {
    complete: 'text-green-600 dark:text-green-400',
    inProgress: 'text-amber-600 dark:text-amber-400',
    notStarted: 'text-gray-400 dark:text-gray-600',
  }[status];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div
      className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 transition-colors"
      onKeyDown={handleKeyDown}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0 text-start">
          <StatusIcon className={`w-6 h-6 flex-shrink-0 ${statusColor}`} />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 dark:text-white truncate">
              {courseName}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {professorName}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('evaluate.progress', { answered: answeredCount, total: questions.length })}
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              status === 'complete'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : status === 'inProgress'
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            {t(`evaluate.${status}`)}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 py-4 border-t-2 border-gray-200 dark:border-gray-700 space-y-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                </div>
              ) : (
                questions.map((question) => {
                  const questionText = isArabic ? question.text_ar : question.text_en;
                  const answer = answers[question.id];

                  return (
                    <div key={question.id} className="space-y-3">
                      <label className="block text-gray-900 dark:text-white font-medium">
                        {questionText}
                        {question.required && (
                          <span className="text-red-600 dark:text-red-400 ms-1">*</span>
                        )}
                      </label>
                      {question.type === 'RATING' ? (
                        <RatingButtons
                          value={answer?.ratingValue}
                          onChange={(value) => handleRatingChange(question.id, value)}
                          required={question.required}
                        />
                      ) : (
                        <TextAnswer
                          value={answer?.textValue || ''}
                          onChange={(value) => handleTextChange(question.id, value)}
                          required={question.required}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
