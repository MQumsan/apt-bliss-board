import { useState } from 'react';
import { Search, Building2, User } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { useI18n } from '@/lib/i18n';
import { useBuildings } from '@/lib/store';
import { getEffectiveStatus } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ViewUnitDialog, EditUnitDialog, PaymentDialog } from '@/components/UnitDialogs';
import { cn } from '@/lib/utils';
import type { Unit } from '@/lib/data';

const statusStyles = {
  Available: 'border-l-4 border-l-status-available bg-status-available/5',
  Occupied: 'border-l-4 border-l-status-occupied bg-status-occupied/5',
  Maintenance: 'border-l-4 border-l-muted-foreground bg-muted/30',
  ExpiringSoon: 'border-l-4 border-l-status-expiring bg-status-expiring/5',
};

const statusDot = {
  Available: 'bg-status-available',
  Occupied: 'bg-status-occupied',
  Maintenance: 'bg-muted-foreground',
  ExpiringSoon: 'bg-status-expiring',
};

const UnitsMonitor = () => {
  const { t, lang } = useI18n();
  const { buildings } = useBuildings();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [buildingFilter, setBuildingFilter] = useState('all');

  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const isAr = lang === 'ar';

  const allUnits = buildings.flatMap(b =>
    b.units.map(u => ({ ...u, buildingName: b.name, buildingNameAr: b.nameAr }))
  );

  const filtered = allUnits.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !search || u.unitNumber.includes(q) || String(u.floor).includes(q) || u.tenantName?.toLowerCase().includes(q);
    const eff = getEffectiveStatus(u);
    const matchStatus = statusFilter === 'all' || eff === statusFilter;
    const matchBuilding = buildingFilter === 'all' || buildings.find(b => b.units.some(bu => bu.id === u.id))?.id === buildingFilter;
    return matchSearch && matchStatus && matchBuilding;
  });

  const statusLabel = (s: string) => ({
    Available: isAr ? 'شاغر' : 'Vacant',
    Occupied: isAr ? 'مشغول' : 'Occupied',
    Maintenance: isAr ? 'صيانة' : 'Maintenance',
    ExpiringSoon: isAr ? 'ينتهي قريباً' : 'Expiring Soon',
  }[s] || s);

  return (
    <PageLayout>
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isAr ? 'بحث سريع بالوحدة أو الطابق أو المستأجر...' : 'Quick search by unit, floor, or tenant...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
        <Select value={buildingFilter} onValueChange={setBuildingFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={isAr ? 'كل المباني' : 'All Buildings'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isAr ? 'كل المباني' : 'All Buildings'}</SelectItem>
            {buildings.map(b => (
              <SelectItem key={b.id} value={b.id}>{isAr ? b.nameAr : b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t('allStatuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allStatuses')}</SelectItem>
            <SelectItem value="Available">{t('available')}</SelectItem>
            <SelectItem value="Occupied">{t('occupied')}</SelectItem>
            <SelectItem value="Maintenance">{t('maintenance')}</SelectItem>
            <SelectItem value="ExpiringSoon">{t('expiringSoon')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Row */}
      <div className="flex flex-wrap gap-3 mb-6">
        {['Available', 'Occupied', 'Maintenance', 'ExpiringSoon'].map(s => {
          const count = allUnits.filter(u => getEffectiveStatus(u) === s).length;
          return (
            <div key={s} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-xs font-medium">
              <span className={cn('h-2.5 w-2.5 rounded-full', statusDot[s as keyof typeof statusDot])} />
              {statusLabel(s)}: {count}
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {filtered.map(unit => {
          const eff = getEffectiveStatus(unit);
          return (
            <div
              key={unit.id}
              className={cn(
                'rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
                statusStyles[eff]
              )}
              onClick={() => { setSelectedUnit(unit); setViewOpen(true); }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-lg font-bold text-card-foreground">{t('unitNumber')} {unit.unitNumber}</p>
                  <p className="text-xs text-muted-foreground">{isAr ? (unit as any).buildingNameAr : (unit as any).buildingName}</p>
                </div>
                <span className={cn('h-3 w-3 rounded-full mt-1', statusDot[eff])} />
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('floor')}</span>
                  <span className="font-medium text-card-foreground">{unit.floor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('type')}</span>
                  <span className="font-medium text-card-foreground">{t(unit.type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('status')}</span>
                  <span className="font-medium">{statusLabel(eff)}</span>
                </div>
              </div>

              {unit.tenantName ? (
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-sm">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-card-foreground font-medium truncate">{unit.tenantName}</span>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-border text-sm text-muted-foreground italic">{t('noTenant')}</div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>{isAr ? 'لا توجد وحدات مطابقة' : 'No matching units found'}</p>
        </div>
      )}

      {selectedUnit && (
        <>
          <ViewUnitDialog unit={selectedUnit} open={viewOpen} onOpenChange={setViewOpen} />
          <EditUnitDialog unit={selectedUnit} open={editOpen} onOpenChange={setEditOpen} />
          <PaymentDialog unit={selectedUnit} open={payOpen} onOpenChange={setPayOpen} />
        </>
      )}
    </PageLayout>
  );
};

export default UnitsMonitor;
