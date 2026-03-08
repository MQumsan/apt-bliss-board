import { Building2, Users, Wrench, AlertTriangle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { buildings, getEffectiveStatus } from '@/lib/data';

export function StatsBar() {
  const { t } = useI18n();
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
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-card rounded-lg border border-border p-4 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
