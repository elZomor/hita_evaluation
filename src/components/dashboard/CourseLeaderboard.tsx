import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useTranslation } from 'react-i18next';
import type { CourseMetrics } from '@/types/dashboard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useLocaleFormatting } from '@/lib/hooks/useLocaleFormatting';

interface CourseLeaderboardProps {
  courses: CourseMetrics[];
  onSelectCourse: (courseId: string) => void;
}

interface ChartDataPoint {
  name: string;
  score: number;
  n: number;
  id: string;
}

export function CourseLeaderboard({
  courses,
  onSelectCourse,
}: CourseLeaderboardProps) {
  const { t } = useTranslation();
  const { formatDecimal, formatInteger, isRTL } = useLocaleFormatting();

  const top10 = courses.slice(0, 10);
  const chartData: ChartDataPoint[] = top10.map((c) => ({
    name: c.courseName.length > 20 ? c.courseName.substring(0, 17) + '...' : c.courseName,
    score: c.avgScore,
    n: c.responsesCount,
    id: c.courseId,
  }));

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle>{t('charts.courseLeaderboard')}</CardTitle>
      </CardHeader>
      <CardContent dir={isRTL ? 'rtl' : 'ltr'}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: isRTL ? 0 : 40, right: isRTL ? 40 : 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              type="number"
              domain={[0, 5]}
              className="text-xs"
              tick={{
                fill: 'hsl(var(--muted-foreground))',
                textAnchor: 'end',
              }}
              reversed={isRTL}
              tickFormatter={(value) => formatDecimal(value as number, 1)}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={150}
              className="text-xs"
              tick={{
                fill: 'hsl(var(--muted-foreground))',
                textAnchor: 'end',
              }}
              orientation={isRTL ? 'right' : 'left'}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
              formatter={(value: number, _name: string, props: { payload: ChartDataPoint }) => [
                `${formatDecimal(value, 2)} (${t('table.responses')}: ${formatInteger(props.payload.n)})`,
                t('table.avgScore'),
              ]}
            />
            <Bar
              dataKey="score"
              fill="hsl(var(--primary))"
              radius={isRTL ? [8, 0, 0, 8] : [0, 8, 8, 0]}
              onClick={(data: ChartDataPoint) => onSelectCourse(data.id)}
              className="cursor-pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
