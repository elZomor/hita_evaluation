import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useTranslation } from 'react-i18next';
import type { ProfessorMetrics } from '@/types/dashboard';
import { Search } from 'lucide-react';
import { useLocaleFormatting } from '@/lib/hooks/useLocaleFormatting';

interface ProfessorLeaderboardProps {
  professors: ProfessorMetrics[];
  onSelectProfessor: (professorId: string) => void;
}

export function ProfessorLeaderboard({
  professors,
  onSelectProfessor,
}: ProfessorLeaderboardProps) {
  const { t } = useTranslation();
  const { formatDecimal, formatInteger, isRTL } = useLocaleFormatting();
  const [search, setSearch] = useState('');

  const filtered = professors.filter((p) =>
    p.professorName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle>{t('charts.professorLeaderboard')}</CardTitle>
        <div className="relative mt-2">
          <Search
            className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ${
              isRTL ? 'right-3' : 'left-3'
            }`}
          />
          <input
            type="text"
            placeholder={t('table.search')}
            value={search}
            dir={isRTL ? 'rtl' : 'ltr'}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full rounded-md border bg-background py-2 text-sm ${
              isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'
            }`}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
            <thead className="border-b">
              <tr>
                <th className="pb-2 text-start">{t('table.rank')}</th>
                <th className="pb-2 text-start">{t('table.professor')}</th>
                <th className="pb-2 text-start">{t('table.avgScore')}</th>
                <th className="pb-2 text-start">{t('table.responses')}</th>
                <th className="pb-2 text-start">{t('table.worstCategory')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 15).map((prof, index) => (
                <tr
                  key={prof.professorId}
                  onClick={() => onSelectProfessor(prof.professorId)}
                  className="cursor-pointer border-b transition-colors hover:bg-accent"
                >
                  <td className="py-3">{formatInteger(index + 1)}</td>
                  <td className="py-3 max-w-[200px]">
                    <span className="block truncate" title={prof.professorName}>
                      {prof.professorName}
                    </span>
                  </td>
                  <td className="py-3">
                    <Badge
                      variant={
                        prof.avgScore >= 4.5
                          ? 'success'
                          : prof.avgScore >= 4
                          ? 'default'
                          : 'destructive'
                      }
                    >
                      {formatDecimal(prof.avgScore, 2)}
                    </Badge>
                  </td>
                  <td className="py-3">{formatInteger(prof.responsesCount)}</td>
                  <td className="py-3 max-w-[150px]">
                    {prof.worstCategory && (
                      <span
                        className="block truncate text-muted-foreground"
                        title={`${prof.worstCategory.name} (${formatDecimal(prof.worstCategory.score, 2)})`}
                      >
                        {prof.worstCategory.name} (
                        {formatDecimal(prof.worstCategory.score, 2)})
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              {t('table.noResults')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
