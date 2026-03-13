import { useState } from 'react';
import { Languages, Plus, LogOut, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BuildingTabs } from '@/components/BuildingTabs';
import { useI18n } from '@/lib/i18n';
import { useBuildings } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { AddBuildingDialog } from '@/components/AddBuildingDialog';
import { exportToCsv } from '@/lib/exportCsv';

const Properties = () => {
  const { t, toggleLang, lang } = useI18n();
  const navigate = useNavigate();
  const { buildings } = useBuildings();
  const [addBuildingOpen, setAddBuildingOpen] = useState(false);

  const handleExportBuildings = () => {
    const headers = [lang === 'ar' ? 'المبنى' : 'Building', lang === 'ar' ? 'الوحدة' : 'Unit', lang === 'ar' ? 'الطابق' : 'Floor', lang === 'ar' ? 'النوع' : 'Type', lang === 'ar' ? 'الحالة' : 'Status', lang === 'ar' ? 'المستأجر' : 'Tenant'];
    const rows: string[][] = [];
    buildings.forEach(b => {
      b.units.forEach(u => {
        rows.push([lang === 'ar' ? b.nameAr : b.name, u.unitNumber, String(u.floor), u.type, u.status, u.tenantName || '']);
      });
    });
    exportToCsv('buildings.csv', headers, rows);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h2 className="text-lg font-semibold text-foreground">{t('properties')}</h2>
              
              {/* زر الإضافة الجديد بجانب العنوان مباشرة بلون مميز لسهولة الوصول */}
              <Button 
                size="sm" 
                onClick={() => setAddBuildingOpen(true)} 
                className="bg-primary hover:opacity-90 text-primary-foreground gap-1.5 px-4 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                إضافة بناية جديدة
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleLang} className="gap-2">
                <Languages className="h-4 w-4" />
                {t('language')}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="gap-1.5 text-muted-foreground">
                <LogOut className="h-4 w-4" />
                {t('logout')}
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6">
            <BuildingTabs />
          </main>
        </div>
      </div>
      <AddBuildingDialog open={addBuildingOpen} onOpenChange={setAddBuildingOpen} />
    </SidebarProvider>
  );
};

export default Properties;
