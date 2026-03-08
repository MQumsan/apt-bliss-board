import { Eye, Pencil, CreditCard, User } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Unit, getEffectiveStatus } from '@/lib/data';
import { cn } from '@/lib/utils';

const statusConfig = {
  Available: { bg: 'bg-status-available', fg: 'text-status-available-foreground', dot: 'bg-status-available' },
  Occupied: { bg: 'bg-status-occupied', fg: 'text-status-occupied-foreground', dot: 'bg-status-occupied' },
  Maintenance: { bg: 'bg-status-maintenance', fg: 'text-status-maintenance-foreground', dot: 'bg-status-maintenance' },
  ExpiringSoon: { bg: 'bg-status-expiring', fg: 'text-status-expiring-foreground', dot: 'bg-status-expiring' },
};

export function UnitCard({ unit }: { unit: Unit }) {
  const { t } = useI18n();
  const effectiveStatus = getEffectiveStatus(unit);
  const config = statusConfig[effectiveStatus];

  const statusLabel = effectiveStatus === 'ExpiringSoon' ? t('expiringSoon')
    : effectiveStatus === 'Available' ? t('available')
    : effectiveStatus === 'Occupied' ? t('occupied')
    : t('maintenance');

  return (
    <div className={cn(
      'group relative rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5',
    )}>
      {/* Status bar top */}
      <div className={cn('absolute top-0 inset-x-0 h-1 rounded-t-lg', config.bg)} />

      <div className="flex items-start justify-between mt-1">
        <div>
          <p className="text-lg font-semibold text-card-foreground">{t('unitNumber')} {unit.unitNumber}</p>
          <p className="text-xs text-muted-foreground">{t(unit.type)}</p>
        </div>
        <span className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
          config.bg, config.fg
        )}>
          {statusLabel}
        </span>
      </div>

      {unit.tenantName ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-3.5 w-3.5" />
          <span>{unit.tenantName}</span>
        </div>
      ) : (
        <div className="mt-3 text-sm text-muted-foreground italic">{t('noTenant')}</div>
      )}

      <div className="mt-3 flex items-center gap-1 border-t border-border pt-3">
        <button className="flex-1 flex items-center justify-center gap-1 rounded-md py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors" title={t('view')}>
          <Eye className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t('view')}</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-1 rounded-md py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors" title={t('edit')}>
          <Pencil className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t('edit')}</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-1 rounded-md py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors" title={t('payment')}>
          <CreditCard className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t('payment')}</span>
        </button>
      </div>
    </div>
  );
}
