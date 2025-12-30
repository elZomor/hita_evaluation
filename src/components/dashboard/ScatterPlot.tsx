import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useTranslation } from 'react-i18next';
import type { ProfessorMetrics } from '@/types/dashboard';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useLocaleFormatting } from '@/lib/hooks/useLocaleFormatting';

interface ScatterPlotProps {
  professors: ProfessorMetrics[];
  onSelectProfessor: (professorId: string) => void;
}

interface ScatterDataPoint {
  x: number;
  y: number;
  name: string;
  id: string;
  worst?: { name: string; score: number };
}

export function ScatterPlot({
  professors,
  onSelectProfessor,
}: ScatterPlotProps) {
  const { t } = useTranslation();
  const { formatDecimal, formatInteger, isRTL } = useLocaleFormatting();

  const data: ScatterDataPoint[] = professors.map((p) => ({
    x: p.responsesCount,
    y: p.avgScore,
    name: p.professorName,
    id: p.professorId,
    worst: p.worstCategory,
  }));

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle>{t('charts.scatterPlot')}</CardTitle>
      </CardHeader>
      <CardContent dir={isRTL ? 'rtl' : 'ltr'}>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ left: isRTL ? 20 : 0, right: isRTL ? 0 : 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              type="number"
              dataKey="x"
              name={t('table.responses')}
              className="text-xs"
              tick={{
                fill: 'hsl(var(--muted-foreground))',
                textAnchor: isRTL ? 'end' : 'start',
              }}
              reversed={isRTL}
              tickFormatter={(value) => formatInteger(value as number)}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={t('table.avgScore')}
              domain={[1, 5]}
              className="text-xs"
              tick={{
                fill: 'hsl(var(--muted-foreground))',
                textAnchor: isRTL ? 'end' : 'start',
              }}
              orientation={isRTL ? 'right' : 'left'}
              tickFormatter={(value) => formatDecimal(value as number, 1)}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const data = payload[0].payload as ScatterDataPoint;
                return (
                  <div className="rounded-lg border bg-card p-3 shadow-lg">
                    <p className="font-semibold">{data.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('table.avgScore')}: {formatDecimal(data.y, 2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('table.responses')}: {formatInteger(data.x)}
                    </p>
                    {data.worst && (
                      <p className="text-sm text-muted-foreground">
                        {t('table.worstCategory')}: {data.worst.name} (
                        {formatDecimal(data.worst.score, 2)})
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Scatter
              data={data}
              fill="hsl(var(--primary))"
              onClick={(data: ScatterDataPoint) => onSelectProfessor(data.id)}
              className="cursor-pointer"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
