import { Card, CardContent } from '../ui/card';
import { useTranslation } from 'react-i18next';
import type { KPIMetrics } from '@/types/dashboard';
import {
  TrendingUp,
  FileText,
  MessageSquare,
  Users,
  BookOpen,
  Activity,
  AlertTriangle,
  Target,
} from 'lucide-react';
import { useLocaleFormatting } from '@/lib/hooks/useLocaleFormatting';

interface KPIGridProps {
  metrics: KPIMetrics;
}

export function KPIGrid({ metrics }: KPIGridProps) {
  const { t } = useTranslation();
  const { formatDecimal, formatInteger, formatPercent } = useLocaleFormatting();

  const kpis = [
    {
      label: t('kpi.overallScore'),
      value: formatDecimal(metrics.overallScore, 2),
      icon: TrendingUp,
      color: 'text-gold-600',
    },
    {
      label: t('kpi.submittedForms'),
      value: formatInteger(metrics.submittedForms),
      icon: FileText,
      color: 'text-gold-600',
    },
    {
      label: t('kpi.answersCount'),
      value: formatInteger(metrics.answersCount),
      icon: MessageSquare,
      color: 'text-gold-600',
    },
    {
      label: t('kpi.professorsEvaluated'),
      value: formatInteger(metrics.professorsEvaluated),
      icon: Users,
      color: 'text-gold-600',
    },
    {
      label: t('kpi.coursesEvaluated'),
      value: formatInteger(metrics.coursesEvaluated),
      icon: BookOpen,
      color: 'text-gold-600',
    },
    {
      label: t('kpi.dispersion'),
      value: formatDecimal(metrics.dispersion, 2),
      icon: Activity,
      color: 'text-gold-600',
    },
    {
      label: t('kpi.belowTarget'),
      value: formatPercent(metrics.belowTargetPercent),
      icon: Target,
      color: 'text-warning-600',
    },
    {
      label: t('kpi.lowSample'),
      value: formatInteger(metrics.lowSampleCount),
      icon: AlertTriangle,
      color: 'text-warning-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card
            key={kpi.label}
            className="transition-all hover:scale-105 hover:shadow-lg"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="mt-1 text-2xl font-bold">{kpi.value}</p>
                </div>
                <Icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
