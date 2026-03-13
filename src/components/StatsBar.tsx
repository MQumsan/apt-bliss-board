import { Building2, Users, Wrench, AlertTriangle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { getEffectiveStatus } from '@/lib/data';
import { useBuildings, useFinance } from '@/lib/store';
import { useMaintenance } from '@/lib/maintenanceStore';
import { useContracts } from '@/lib/contractStore';
import { formatCurrency } from '@/lib/currency';

export function StatsBar() {
  const { t, lang } = useI18n();
  const { buildings } = useBuildings();
  const { totalRevenue, totalExpenses } = useFinance();
  const { totalMaintenanceCost } = useMaintenance();
  const { getExpiringContracts } = useContracts();
  const allUnits = buildings.flatMap(b => b.units);
  const total = allUnits.length;
  const occupied = allUnits.filter(u => u.status === 'Occupied').length;
  const maintenanceCount = allUnits.filter(u => u.status === 'Maintenance').length;
  const expiringCount = getExpiringContracts(30).length;
  const netProfit = totalRevenue - totalExpenses - totalMaintenanceCost;

  const stats = [
    { label: t('totalUnits'), value: total, icon: Building2, color: 'text-primary bg-primary/10' },
    { label: t('occupancyRate'), value: `${total > 0 ? Math.round((occupied / total) * 100) : 0}%`, icon: Users, color: 'text-status-occupied bg-status-occupied/10' },
    { label: t('maintenanceRequests'), value: formatCurrency(totalMaintenanceCost, lang), icon: Wrench, color: 'text-status-maintenance bg-status-maintenance/10' },
    { label: t('expiringContracts'), value: expiringCount, icon: AlertTriangle, color: 'text-status-expiring bg-status-expiring/10' },
    { label: t('grossIncome'), value: formatCurrency(totalRevenue, lang), icon: TrendingUp, color: 'text-status-available bg-status-available/10' },
    { label: lang === 'ar' ? 'صافي الربح' : 'Net Profit', value: formatCurrency(netProfit, lang), icon: DollarSign, color: netProfit >= 0 ? 'text-status-available bg-status-available/10' : 'text-status-occupied bg-status-occupied/10' },
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
