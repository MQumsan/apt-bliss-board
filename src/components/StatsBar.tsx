import { Building2, Users, Wrench, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { getEffectiveStatus } from '@/lib/data';
import { useBuildings, useFinance } from '@/lib/store';

export function StatsBar() {
  const { t } = useI18n();
  const { buildings } = useBuildings();
  const { totalRevenue, totalExpenses } = useFinance();
  const allUnits = buildings.flatMap(b => b.units);
  const total = allUnits.length;
  const occupied = allUnits.filter(u => u.status === 'Occupied').length;
  const maintenance = allUnits.filter(u => u.status === 'Maintenance').length;
  const expiring = allUnits.filter(u => getEffectiveStatus(u) === 'ExpiringSoon').length;

  const stats = [
    { label: t('totalUnits'), value: total, icon: Building2, color: 'text-primary bg-primary/10' },
    { label: t('occupancyRate'), value: `${Math.round((occupied / total) * 100)}%`, icon: Users, color: 'text-status-occupied bg-status-occupied/10' },
    { label: t('maintenanceRequests'), value: maintenance, icon: Wrench, color: 'text-status-maintenance bg-status-maintenance/10' },
    { label: t('expiringContracts'), value: expiring, icon: AlertTriangle, color: 'text-status-expiring bg-status-expiring/10' },
    { label: t('totalRevenue'), value: `${totalRevenue.toLocaleString('en',{minimumFractionDigits:3,maximumFractionDigits:3})} OMR`, icon: TrendingUp, color: 'text-status-available bg-status-available/10' },
    { label: t('totalExpensesLabel'), value: `${totalExpenses.toLocaleString('en',{minimumFractionDigits:3,maximumFractionDigits:3})} OMR`, icon: TrendingDown, color: 'text-status-occupied bg-status-occupied/10' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-card rounded-lg border border-border p-4 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-card-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
