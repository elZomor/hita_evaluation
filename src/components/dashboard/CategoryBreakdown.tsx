import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useTranslation } from 'react-i18next';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { useLocaleFormatting } from '@/lib/hooks/useLocaleFormatting';

interface CategoryBreakdownProps {
  categoryScores: Record<string, { avg: number; count: number }>;
  selectionName?: string;
}

export function CategoryBreakdown({
  categoryScores,
  selectionName,
}: CategoryBreakdownProps) {
  const { t } = useTranslation();
  const { isRTL } = useLocaleFormatting();

  const data = Object.entries(categoryScores).map(([name, { avg }]) => ({
    category: name,
    score: avg,
  }));

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle>
          {t('charts.categoryBreakdown')}
          {selectionName && (
            <span
              className={`text-sm font-normal text-muted-foreground ${
                isRTL ? 'mr-2' : 'ml-2'
              }`}
            >
              ({selectionName})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent dir={isRTL ? 'rtl' : 'ltr'}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={data}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="category"
                tick={{
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 12,
                  textAnchor: isRTL ? 'end' : 'start',
                }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 5]}
                tick={{
                  fill: 'hsl(var(--muted-foreground))',
                  textAnchor: isRTL ? 'end' : 'start',
                }}
              />
              <Radar
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            {t('common.noData')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
