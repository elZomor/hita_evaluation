import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Star, ThumbsUp } from 'lucide-react';

type RatingVariant = 'rating' | 'suggestion';

interface RatingButtonsProps {
  value: number | undefined;
  onChange: (value: 1 | 2 | 3 | 4 | 5) => void;
  variant?: RatingVariant;
}

export const RatingButtons = ({
  value,
  onChange,
  variant = 'rating',
}: RatingButtonsProps) => {
  const { t } = useTranslation();
  const ratings: (1 | 2 | 3 | 4 | 5)[] = [1, 2, 3, 4, 5];

  const isRating = variant === 'rating';

  const labels = isRating
    ? {
        low: t('evaluate.ratingLow'),
        high: t('evaluate.ratingHigh'),
        ariaLabel: t('evaluate.rating'),
      }
    : {
        low: t('evaluate.suggestionLow'),
        high: t('evaluate.suggestionHigh'),
        ariaLabel: t('evaluate.suggestion'),
      };

  const colors = isRating
    ? {
        selected: 'bg-amber-600 text-white shadow-lg',
        unselected:
          'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900/30',
        ring: 'focus:ring-amber-500',
      }
    : {
        selected: 'bg-blue-600 text-white shadow-lg',
        unselected:
          'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30',
        ring: 'focus:ring-blue-500',
      };

  const handleKeyDown = (e: React.KeyboardEvent, rating: 1 | 2 | 3 | 4 | 5) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(rating);
    }
  };

  const Icon = isRating ? Star : ThumbsUp;

  return (
    <div className="space-y-2">
      {/* Rating buttons */}
      <div className="flex gap-2 sm:gap-3" role="radiogroup" aria-label={labels.ariaLabel}>
        {ratings.map((rating) => (
          <div key={rating} className="flex flex-col items-center flex-1 sm:flex-none">
            {/* Labels above buttons 1 and 5 */}
            <div className="min-h-8 sm:min-h-10 mb-2 flex items-end">
              {rating === 1 && (
                <span className={`text-[10px] sm:text-xs font-medium text-center ${isRating ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {labels.low}
                </span>
              )}
              {rating === 5 && (
                <span className={`text-[10px] sm:text-xs font-medium text-center ${isRating ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {labels.high}
                </span>
              )}
            </div>
            <motion.button
              type="button"
              role="radio"
              aria-checked={value === rating}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(rating)}
              onKeyDown={(e) => handleKeyDown(e, rating)}
              tabIndex={0}
              className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg font-bold text-base sm:text-lg transition-all focus:outline-none focus:ring-4 ${colors.ring} focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 ${
                value === rating ? colors.selected : colors.unselected
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-0.5 sm:gap-1">
                <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{rating}</span>
              </div>
            </motion.button>
          </div>
        ))}
      </div>

      {/* Variant indicator */}
      <div className="flex items-center gap-2 text-xs">
        <div
          className={`w-2 h-2 rounded-full ${isRating ? 'bg-amber-500' : 'bg-blue-500'}`}
        />
        <span className="text-gray-500 dark:text-gray-400">
          {isRating ? t('evaluate.ratingType') : t('evaluate.suggestionType')}
        </span>
      </div>
    </div>
  );
};
