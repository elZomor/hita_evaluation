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

interface CustomTickProps {
  payload: { value: string };
  x: number;
  y: number;
  cx: number;
  cy: number;
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

  const renderCustomTick = ({ payload, x, y, cx, cy }: CustomTickProps) => {
    // Calculate angle from center to determine text anchor and position
    const dx = x - cx;
    const dy = y - cy;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Normalize angle to 0-360
    const normalizedAngle = ((angle % 360) + 360) % 360;

    // Determine text anchor based on position
    let textAnchor: 'start' | 'end' | 'middle' = 'middle';
    let offsetX = 0;
    let offsetY = 0;

    // Right side (315-45 degrees) - keep original behavior
    if (normalizedAngle >= 315 || normalizedAngle <= 45) {
      textAnchor = isRTL ? 'end' : 'start';
    }
    // Left side (135-225 degrees) - text anchor start for both AR and EN
    else if (normalizedAngle >= 135 && normalizedAngle <= 225) {
      textAnchor = 'start';
    }
    // Bottom (45-135 degrees in screen coords) - middle with vertical offset
    else if (normalizedAngle > 45 && normalizedAngle < 135) {
      textAnchor = 'middle';
      offsetY = 20;
    }
    // Top (225-315 degrees in screen coords) - middle with vertical offset
    else if (normalizedAngle > 225 && normalizedAngle < 315) {
      textAnchor = 'middle';
      offsetY = -20;
    }

    return (
      <text
        x={x + offsetX}
        y={y + offsetY}
        textAnchor={textAnchor}
        fill="hsl(var(--muted-foreground))"
        fontSize={12}
        dominantBaseline="central"
      >
        {payload.value}
      </text>
    );
  };

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
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="60%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="category" tick={renderCustomTick} />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 5]}
                tick={{
                  fill: 'hsl(var(--muted-foreground))',
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
