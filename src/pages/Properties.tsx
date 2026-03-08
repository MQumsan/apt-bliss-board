import { Languages } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BuildingTabs } from '@/components/BuildingTabs';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

const Properties = () => {
  const { t, toggleLang } = useI18n();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h2 className="text-lg font-semibold text-foreground">{t('properties')}</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleLang} className="gap-2">
              <Languages className="h-4 w-4" />
              {t('language')}
            </Button>
          </header>
          <main className="flex-1 p-6">
            <BuildingTabs />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Properties;
