import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useTranslation } from 'react-i18next';
import type { ProfessorMetrics, DashboardCategory } from '@/types/dashboard';
import { useLocaleFormatting } from '@/lib/hooks/useLocaleFormatting';

interface HeatmapProps {
  professors: ProfessorMetrics[];
  categories: DashboardCategory[];
  onSelectProfessor: (professorId: string) => void;
}

export function Heatmap({
  professors,
  categories,
  onSelectProfessor,
}: HeatmapProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const { formatDecimal, formatInteger, isRTL } = useLocaleFormatting();

  const top15 = professors.slice(0, 15);
  const categoryColumns = categories.map((c) => ({
    label: language === 'ar' ? c.name_ar : c.name_en,
    keys: [c.name_en, c.name_ar],
  }));

  const getColor = (score: number) => {
    if (score >= 4.5) return 'bg-green-500';
    if (score >= 4.0) return 'bg-green-400';
    if (score >= 3.5) return 'bg-yellow-400';
    if (score >= 3.0) return 'bg-orange-400';
    return 'bg-red-400';
  };

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle>{t('charts.heatmap')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto" dir={isRTL ? 'rtl' : 'ltr'}>
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th
                  className={`sticky px-2 py-2 ${isRTL ? 'right-0 text-right' : 'left-0 text-left'} bg-card`}
                >
                  {t('table.professor')}
                </th>
                {categoryColumns.map((cat) => (
                  <th key={cat.label} className="px-2 py-2 text-center max-w-[120px]" title={cat.label}>
                    <span className="block truncate">{cat.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {top15.map((prof) => (
                <tr
                  key={prof.professorId}
                  onClick={() => onSelectProfessor(prof.professorId)}
                  className="cursor-pointer border-b transition-colors hover:bg-accent"
                >
                  <td
                    className={`sticky px-2 py-2 font-medium max-w-[180px] ${isRTL ? 'right-0 text-right' : 'left-0 text-left'} bg-card`}
                    title={prof.professorName}
                  >
                    <span className="block truncate">{prof.professorName}</span>
                  </td>
                  {categoryColumns.map((cat) => {
                    const score =
                      prof.categoryScores[cat.keys[0]] ??
                      prof.categoryScores[cat.keys[1]];
                    if (!score) {
                      return (
                        <td key={cat.label} className="px-2 py-2 text-center">
                          <div className="h-8 w-full rounded bg-muted" />
                        </td>
                      );
                    }
                    return (
                      <td key={cat.label} className="px-2 py-2 text-center">
                        <div
                          className={`mx-auto flex h-8 w-full items-center justify-center rounded text-white ${getColor(
                            score.avg
                          )}`}
                          title={`${cat.label}: ${formatDecimal(score.avg, 2)} (${t('table.responses')}: ${formatInteger(score.count)})`}
                        >
                          {formatDecimal(score.avg, 1)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs">
          <span className="text-muted-foreground">{t('common.legend')}:</span>
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded bg-green-500" />
            <span>{formatDecimal(4.5, 1)}+</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded bg-green-400" />
            <span>
              {formatDecimal(4.0, 1)}-{formatDecimal(4.5, 1)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded bg-yellow-400" />
            <span>
              {formatDecimal(3.5, 1)}-{formatDecimal(4.0, 1)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded bg-orange-400" />
            <span>
              {formatDecimal(3.0, 1)}-{formatDecimal(3.5, 1)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded bg-red-400" />
            <span>{`<${formatDecimal(3.0, 1)}`}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
