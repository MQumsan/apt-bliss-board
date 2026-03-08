import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useI18n } from '@/lib/i18n';
import { buildings } from '@/lib/data';
import { UnitCard } from './UnitCard';

export function BuildingTabs() {
  const { lang, t } = useI18n();

  return (
    <Tabs defaultValue={buildings[0].id} className="w-full">
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
        const floors = [...new Set(building.units.map(u => u.floor))].sort((a, b) => a - b);

        return (
          <TabsContent key={building.id} value={building.id}>
            <div className="space-y-6">
              {floors.map((floor) => {
                const floorUnits = building.units.filter(u => u.floor === floor);
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
  );
}
