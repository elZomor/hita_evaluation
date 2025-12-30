import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useTranslation } from 'react-i18next';
import type { TimeSeriesPoint } from '@/types/dashboard';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useLocaleFormatting } from '@/lib/hooks/useLocaleFormatting';

interface TrendChartProps {
  data: TimeSeriesPoint[];
}

export function TrendChart({ data }: TrendChartProps) {
  const { t } = useTranslation();
  const { formatDate, formatDecimal, isRTL } = useLocaleFormatting();

  const chartData = data.map((point) => ({
    ...point,
    rawDate: point.date,
    dateFormatted: formatDate(new Date(point.date), 'MMM dd'),
  }));

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle>{t('charts.trend')}</CardTitle>
      </CardHeader>
      <CardContent dir={isRTL ? 'rtl' : 'ltr'}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ left: isRTL ? 20 : 0, right: isRTL ? 0 : 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="dateFormatted"
              className="text-xs"
              tick={{
                fill: 'hsl(var(--muted-foreground))',
                textAnchor: isRTL ? 'end' : 'start',
              }}
              reversed={isRTL}
            />
            <YAxis
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
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
              labelFormatter={(_label, payload) => {
                const rawDate = payload?.[0]?.payload?.rawDate;
                return rawDate ? formatDate(new Date(rawDate), 'PPPP') : '';
              }}
              formatter={(value: number) => [
                formatDecimal(value, 2),
                t('table.avgScore'),
              ]}
            />
            <Line
              type="monotone"
              dataKey="avgScore"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
