import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { getEffectiveStatus } from '@/lib/data';
import { useBuildings } from '@/lib/store';
import { UnitCard } from './UnitCard';
import { FilterBar } from './FilterBar';
import { AddUnitDialog } from './AddUnitDialog';

export function BuildingTabs() {
  const { lang, t } = useI18n();
  const { buildings } = useBuildings();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [addUnitOpen, setAddUnitOpen] = useState(false);
  const [addUnitBuildingId, setAddUnitBuildingId] = useState('');

  return (
    <div>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
      <Tabs defaultValue={buildings[0]?.id} className="w-full">
        <TabsList className="bg-muted mb-6 h-auto flex-wrap gap-1 p-1">
          {buildings.map((b) => (
            <TabsTrigger
              key={b.id}
              value={b.id}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
            >
              {lang === 'ar' ? b.nameAr : b.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {buildings.map((building) => {
          const filteredUnits = building.units.filter((u) => {
            const matchesSearch = !search ||
              u.unitNumber.toLowerCase().includes(search.toLowerCase()) ||
              (u.tenantName && u.tenantName.toLowerCase().includes(search.toLowerCase()));
            const effectiveStatus = getEffectiveStatus(u);
            const matchesStatus = statusFilter === 'all' || effectiveStatus === statusFilter;
            return matchesSearch && matchesStatus;
          });

          const floors = [...new Set(filteredUnits.map(u => u.floor))].sort((a, b) => a - b);

          return (
            <TabsContent key={building.id} value={building.id}>
              <div className="flex justify-end mb-4">
                <Button size="sm" onClick={() => { setAddUnitBuildingId(building.id); setAddUnitOpen(true); }} className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  {t('addUnit')}
                </Button>
              </div>
              <div className="space-y-6">
                {floors.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">{t('noTenant')}</p>
                )}
                {floors.map((floor) => {
                  const floorUnits = filteredUnits.filter(u => u.floor === floor);
                  return (
                    <div key={floor}>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{floor}</span>
                        {t('floor')} {floor}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {floorUnits.map(unit => (
                          <UnitCard key={unit.id} unit={unit} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      <AddUnitDialog open={addUnitOpen} onOpenChange={setAddUnitOpen} buildingId={addUnitBuildingId} />
    </div>
  );
}
