import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useTranslation } from 'react-i18next';
import type { RatingDistribution } from '@/types/dashboard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useLocaleFormatting } from '@/lib/hooks/useLocaleFormatting';

interface DistributionChartProps {
  data: RatingDistribution[];
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

export function DistributionChart({ data }: DistributionChartProps) {
  const { t } = useTranslation();
  const { formatInteger, formatPercent, isRTL } = useLocaleFormatting();

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle>{t('charts.distribution')}</CardTitle>
      </CardHeader>
      <CardContent dir={isRTL ? 'rtl' : 'ltr'}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="rating"
              className="text-xs"
              tick={{
                fill: 'hsl(var(--muted-foreground))',
                textAnchor: isRTL ? 'end' : 'start',
              }}
              reversed={isRTL}
            />
            <YAxis
              className="text-xs"
              tick={{
                fill: 'hsl(var(--muted-foreground))',
                textAnchor: isRTL ? 'end' : 'start',
              }}
              orientation={isRTL ? 'right' : 'left'}
              tickFormatter={(value) => formatInteger(value as number)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
              formatter={(value: number, _name: string, props: { payload: RatingDistribution }) => [
                `${formatInteger(value)} (${formatPercent(props.payload.percentage)})`,
                t('table.responses'),
              ]}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
