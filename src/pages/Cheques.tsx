import { useState, useMemo } from 'react';
import { Languages, Plus, FileCheck, Download } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useI18n } from '@/lib/i18n';
import { useCheques, ChequeStatus } from '@/lib/chequeStore';
import { useTenants } from '@/lib/store';
import { buildings } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { exportToCsv } from '@/lib/exportCsv';

const statusColors: Record<ChequeStatus, string> = {
  pending: 'bg-status-maintenance/10 text-status-maintenance border-status-maintenance/20',
  deposited: 'bg-status-available/10 text-status-available border-status-available/20',
  bounced: 'bg-status-occupied/10 text-status-occupied border-status-occupied/20',
  cancelled: 'bg-muted text-muted-foreground border-border',
};

const Cheques = () => {
  const { t, toggleLang, lang } = useI18n();
  const { cheques, addCheque, updateStatus } = useCheques();
  const { tenants } = useTenants();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ chequeNumber: '', bankName: '', dueDate: '', amount: '', tenantId: '', status: 'pending' as ChequeStatus });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.chequeNumber || !form.bankName || !form.dueDate || !form.amount || !form.tenantId) {
      toast({ title: t('fillRequired'), variant: 'destructive' });
      return;
    }
    const tenant = tenants.find(tn => tn.id === form.tenantId);
    if (!tenant) return;
    addCheque({
      chequeNumber: form.chequeNumber,
      bankName: form.bankName,
      dueDate: form.dueDate,
      amount: Number(form.amount),
      tenantId: tenant.id,
      tenantName: tenant.fullName,
      buildingName: tenant.buildingName,
      buildingNameAr: tenant.buildingNameAr,
      unitNumber: tenant.unitNumber,
      status: form.status,
    });
    toast({ title: t('chequeAdded') });
    setForm({ chequeNumber: '', bankName: '', dueDate: '', amount: '', tenantId: '', status: 'pending' });
    setAddOpen(false);
  };

  const handleExport = () => {
    const headers = [t('chequeNumber'), t('bankName'), t('dueDate'), t('amount'), t('tenantName'), t('property'), t('unitNumber'), t('status')];
    const rows = cheques.map(c => [c.chequeNumber, c.bankName, c.dueDate, String(c.amount), c.tenantName, lang === 'ar' ? c.buildingNameAr : c.buildingName, c.unitNumber, t(c.status as any)]);
    exportToCsv('cheques.csv', headers, rows);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h2 className="text-lg font-semibold text-foreground">{t('cheques')}</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleLang} className="gap-2">
              <Languages className="h-4 w-4" />
              {t('language')}
            </Button>
          </header>
          <main className="flex-1 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground">{cheques.length} {t('cheques')}</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                  <Download className="h-4 w-4" />{t('exportCsv')}
                </Button>
                <Button size="sm" onClick={() => setAddOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />{t('addCheque')}
                </Button>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('chequeNumber')}</TableHead>
                    <TableHead>{t('bankName')}</TableHead>
                    <TableHead>{t('dueDate')}</TableHead>
                    <TableHead>{t('tenantName')}</TableHead>
                    <TableHead>{t('property')}</TableHead>
                    <TableHead>{t('unitNumber')}</TableHead>
                    <TableHead className="text-end">{t('amount')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cheques.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">{t('noRecordsFound')}</TableCell></TableRow>
                  ) : cheques.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono font-medium">{c.chequeNumber}</TableCell>
                      <TableCell>{c.bankName}</TableCell>
                      <TableCell className="whitespace-nowrap">{c.dueDate}</TableCell>
                      <TableCell className="font-medium">{c.tenantName}</TableCell>
                      <TableCell>{lang === 'ar' ? c.buildingNameAr : c.buildingName}</TableCell>
                      <TableCell>{c.unitNumber}</TableCell>
                      <TableCell className="text-end font-bold whitespace-nowrap">{c.amount.toLocaleString('en', {minimumFractionDigits:3,maximumFractionDigits:3})} OMR</TableCell>
                      <TableCell>
                        <Select value={c.status} onValueChange={(v) => updateStatus(c.id, v as ChequeStatus)}>
                          <SelectTrigger className="h-7 w-[130px]">
                            <Badge variant="outline" className={statusColors[c.status]}>{t(c.status as any)}</Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">{t('pending')}</SelectItem>
                            <SelectItem value="deposited">{t('deposited')}</SelectItem>
                            <SelectItem value="bounced">{t('bounced')}</SelectItem>
                            <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><FileCheck className="h-5 w-5 text-primary" />{t('addCheque')}</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{t('chequeNumber')} *</Label>
                <Input value={form.chequeNumber} onChange={e => setForm(p => ({ ...p, chequeNumber: e.target.value }))} placeholder="CHQ-XXXXXX" />
              </div>
              <div className="space-y-1.5">
                <Label>{t('bankName')} *</Label>
                <Input value={form.bankName} onChange={e => setForm(p => ({ ...p, bankName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('dueDate')} *</Label>
                <Input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('amount')} (AED) *</Label>
                <Input type="number" min="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} dir="ltr" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t('tenantName')} *</Label>
                <Select value={form.tenantId} onValueChange={v => setForm(p => ({ ...p, tenantId: v }))}>
                  <SelectTrigger><SelectValue placeholder={t('selectTenant')} /></SelectTrigger>
                  <SelectContent>
                    {tenants.filter(tn => tn.active).map(tn => (
                      <SelectItem key={tn.id} value={tn.id}>{tn.fullName} ({tn.unitNumber})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>{t('cancel')}</Button>
              <Button type="submit">{t('addCheque')}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Cheques;
