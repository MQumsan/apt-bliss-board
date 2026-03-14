import { useState } from 'react';
import { FileCheck, AlertTriangle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/currency';
import { PageLayout } from '@/components/PageLayout';
import { BuildingTabs } from '@/components/BuildingTabs';
import { StatsBar } from '@/components/StatsBar';
import { useI18n } from '@/lib/i18n';
import { useCheques } from '@/lib/chequeStore';
import { useContracts } from '@/lib/contractStore';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const { t, lang } = useI18n();
  const { getUpcomingCheques, getOverduePendingCheques } = useCheques();
  const { getExpiringContracts } = useContracts();
  const upcoming = getUpcomingCheques(7);
  const overdue = getOverduePendingCheques();
  const expiringContracts = getExpiringContracts(30);

  return (
    <PageLayout>
      <StatsBar />

      {expiringContracts.length > 0 && (
        <div className="bg-status-expiring/5 rounded-lg border border-status-expiring/20 p-4 mb-4">
          <h3 className="text-sm font-semibold text-status-expiring flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4" />
            {lang === 'ar' ? 'عقود تنتهي قريباً' : 'Expiring Contracts'}
            <Badge className="bg-status-expiring text-status-expiring-foreground h-5 min-w-5 px-1.5 text-xs">{expiringContracts.length}</Badge>
          </h3>
          <div className="space-y-2">
            {expiringContracts.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-status-expiring/5 border border-status-expiring/15">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.tenantName}</p>
                  <p className="text-xs text-muted-foreground">{c.unitNumber} — {lang === 'ar' ? c.buildingNameAr : c.buildingName}</p>
                </div>
                <div className="text-end">
                  <p className="text-sm font-bold text-status-expiring">{formatCurrency(c.annualRent, lang)}</p>
                  <p className="text-xs text-status-expiring">{t('contractEnd')}: {c.endDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {overdue.length > 0 && (
        <div className="bg-destructive/5 rounded-lg border border-destructive/20 p-4 mb-4">
          <h3 className="text-sm font-semibold text-destructive flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4" />
            {t('overdueCheques')}
            <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">{overdue.length}</Badge>
          </h3>
          <div className="space-y-2">
            {overdue.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/15">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.tenantName}</p>
                    <p className="text-xs text-muted-foreground">{c.chequeNumber} — {c.bankName}</p>
                  </div>
                </div>
                <div className="text-end">
                  <p className="text-sm font-bold text-destructive">{formatCurrency(c.amount, lang)}</p>
                  <p className="text-xs text-destructive font-medium">{t('dueDate')}: {c.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
            {upcoming.map(c => {
              const now = new Date(); now.setHours(0,0,0,0);
              const isDue = new Date(c.dueDate) <= now;
              return (
                <div key={c.id} className={`flex items-center justify-between p-3 rounded-lg border ${isDue ? 'bg-destructive/5 border-destructive/20' : 'bg-status-expiring/5 border-status-expiring/15'}`}>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`h-4 w-4 ${isDue ? 'text-destructive' : 'text-status-expiring'}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.tenantName}</p>
                      <p className="text-xs text-muted-foreground">{c.chequeNumber} — {c.bankName}</p>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className={`text-sm font-bold ${isDue ? 'text-destructive' : 'text-foreground'}`}>{formatCurrency(c.amount, lang)}</p>
                    <p className={`text-xs font-medium ${isDue ? 'text-destructive' : 'text-status-expiring'}`}>{t('dueDate')}: {c.dueDate}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BuildingTabs />
    </PageLayout>
  );
};

export default Index;
