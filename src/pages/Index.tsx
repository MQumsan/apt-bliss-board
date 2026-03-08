import { Languages, FileCheck, AlertTriangle } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BuildingTabs } from '@/components/BuildingTabs';
import { StatsBar } from '@/components/StatsBar';
import { useI18n } from '@/lib/i18n';
import { useCheques } from '@/lib/chequeStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const { t, toggleLang, lang } = useI18n();
  const { getUpcomingCheques } = useCheques();
  const upcoming = getUpcomingCheques(7);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h2 className="text-lg font-semibold text-foreground">{t('dashboard')}</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleLang} className="gap-2">
              <Languages className="h-4 w-4" />
              {t('language')}
            </Button>
          </header>
          <main className="flex-1 p-6">
            <StatsBar />

            {/* Upcoming Cheques Widget */}
            <div className="bg-card rounded-lg border border-border p-4 mb-6">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <FileCheck className="h-4 w-4 text-status-maintenance" />
                {t('upcomingCheques')}
                {upcoming.length > 0 && <Badge variant="secondary" className="bg-status-expiring/10 text-status-expiring border-status-expiring/20">{upcoming.length}</Badge>}
              </h3>
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('noChequesDue')}</p>
              ) : (
                <div className="space-y-2">
                  {upcoming.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-status-expiring/5 border border-status-expiring/15">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-4 w-4 text-status-expiring" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{c.tenantName}</p>
                          <p className="text-xs text-muted-foreground">{c.chequeNumber} — {c.bankName}</p>
                        </div>
                      </div>
                      <div className="text-end">
                        <p className="text-sm font-bold text-foreground">{c.amount.toLocaleString()} AED</p>
                        <p className="text-xs text-status-expiring font-medium">{t('dueDate')}: {c.dueDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <BuildingTabs />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
