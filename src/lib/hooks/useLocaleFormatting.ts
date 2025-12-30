import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { format as dateFnsFormat } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import type { Locale } from 'date-fns';

const localeMap: Record<string, Locale> = {
  ar: arSA,
  en: enUS,
};

const localeCodeMap: Record<string, string> = {
  ar: 'ar-SA',
  en: 'en-US',
};

export function useLocaleFormatting() {
  const { i18n } = useTranslation();
  const language = i18n.language || 'en';
  const locale = localeMap[language] || enUS;
  const numberLocale = localeCodeMap[language] || 'en-US';
  const isRTL = language === 'ar';

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) => {
      return new Intl.NumberFormat(numberLocale, options).format(value);
    },
    [numberLocale]
  );

  const formatDecimal = useCallback(
    (value: number, fractionDigits = 2) =>
      formatNumber(value, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }),
    [formatNumber]
  );

  const formatInteger = useCallback(
    (value: number) =>
      formatNumber(value, {
        maximumFractionDigits: 0,
      }),
    [formatNumber]
  );

  const formatPercent = useCallback(
    (value: number, fractionDigits = 1) =>
      formatNumber(value / 100, {
        style: 'percent',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }),
    [formatNumber]
  );

  const formatDate = useCallback(
    (date: Date | number, formatStr: string) =>
      dateFnsFormat(date, formatStr, { locale }),
    [locale]
  );

  return {
    language,
    locale,
    isRTL,
    formatNumber,
    formatDecimal,
    formatInteger,
    formatPercent,
    formatDate,
  };
}
