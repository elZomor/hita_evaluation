import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface TextAnswerProps {
  value: string;
  onChange: (value: string) => void;
  required: boolean;
  maxLength?: number;
}

export const TextAnswer = ({
  value,
  onChange,
  required,
  maxLength = 400,
}: TextAnswerProps) => {
  const { t } = useTranslation();
  const [localValue, setLocalValue] = useState(value);
  const remaining = maxLength - localValue.length;

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <textarea
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        maxLength={maxLength}
        rows={4}
        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 transition-colors resize-none"
        placeholder={required ? t('evaluate.textAnswer') + ' *' : t('evaluate.textAnswer')}
      />
      <div className="text-sm text-gray-600 dark:text-gray-400 text-end">
        {t('evaluate.charactersRemaining', { count: remaining })}
      </div>
    </div>
  );
};
