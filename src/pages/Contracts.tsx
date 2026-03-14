import { useState } from 'react';
import { FileText, Plus, AlertTriangle, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { PageLayout } from '@/components/PageLayout';
import { useI18n } from '@/lib/i18n';
import { useContracts, PaymentFrequency } from '@/lib/contractStore';
import { useTenants } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { exportToCsv } from '@/lib/exportCsv';

const Contracts = () => {
  const { t, lang } = useI18n();
  const { contracts, addContract, getExpiringContracts } = useContracts();
  const { tenants } = useTenants();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ tenantId: '', unitId: '', startDate: '', endDate: '', annualRent: '', paymentFrequency: '' });
  const isAr = lang === 'ar';
  const expiring = getExpiringContracts(30);

  const freqLabel = (f: string) => ({ monthly: { en: 'Monthly', ar: 'شهري' }, quarterly: { en: 'Quarterly', ar: 'ربع سنوي' }, 'semi-annual': { en: 'Semi-Annual', ar: 'نصف سنوي' }, annual: { en: 'Annual', ar: 'سنوي' } }[f]?.[lang] || f);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tenantId || !form.startDate || !form.endDate || !form.annualRent || !form.paymentFrequency) {
      toast({ title: t('fillRequired'), variant: 'destructive' }); return;
    }
    const tenant = tenants.find(tn => tn.id === form.tenantId);
    if (!tenant) return;
    addContract({ tenantId: tenant.id, tenantName: tenant.fullName, unitId: tenant.unitId, unitNumber: tenant.unitNumber, buildingName: tenant.buildingName, buildingNameAr: tenant.buildingNameAr, startDate: form.startDate, endDate: form.endDate, annualRent: Number(form.annualRent), paymentFrequency: form.paymentFrequency as PaymentFrequency });
    toast({ title: isAr ? 'تمت إضافة العقد بنجاح' : 'Contract added successfully' });
    setForm({ tenantId: '', unitId: '', startDate: '', endDate: '', annualRent: '', paymentFrequency: '' });
    setAddOpen(false);
  };

  const isExpiring = (endDate: string) => { const d = (new Date(endDate).getTime() - Date.now()) / 86400000; return d > 0 && d <= 30; };

  const handleExport = () => {
    const headers = [isAr ? 'المستأجر' : 'Tenant', isAr ? 'الوحدة' : 'Unit', isAr ? 'المبنى' : 'Building', isAr ? 'بداية العقد' : 'Start Date', isAr ? 'نهاية العقد' : 'End Date', isAr ? 'الإيجار السنوي' : 'Annual Rent', isAr ? 'تكرار الدفع' : 'Frequency'];
    const rows = contracts.map(c => [c.tenantName, c.unitNumber, isAr ? c.buildingNameAr : c.buildingName, c.startDate, c.endDate, String(c.annualRent), freqLabel(c.paymentFrequency)]);
    exportToCsv('contracts.csv', headers, rows);
  };

  return (
    <PageLayout>
      {expiring.length > 0 && (
        <div className="bg-status-expiring/5 rounded-lg border border-status-expiring/20 p-4 mb-4">
          <h3 className="text-sm font-semibold text-status-expiring flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4" />{isAr ? 'عقود تنتهي خلال 30 يوم' : 'Contracts Expiring Within 30 Days'}
            <Badge className="bg-status-expiring text-status-expiring-foreground">{expiring.length}</Badge>
          </h3>
          <div className="space-y-2">
            {expiring.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-status-expiring/5 border border-status-expiring/15">
                <div><p className="text-sm font-medium text-foreground">{c.tenantName}</p><p className="text-xs text-muted-foreground">{c.unitNumber} — {isAr ? c.buildingNameAr : c.buildingName}</p></div>
                <div className="text-end"><p className="text-sm font-bold text-status-expiring">{formatCurrency(c.annualRent, lang)}</p><p className="text-xs text-status-expiring">{isAr ? 'ينتهي' : 'Expires'}: {c.endDate}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5"><Download className="h-4 w-4" />{t('exportCsv')}</Button>
          <Button onClick={() => setAddOpen(true)} className="gap-2"><Plus className="h-4 w-4" />{isAr ? 'إضافة عقد' : 'Add Contract'}</Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>{t('tenantName')}</TableHead><TableHead>{t('unitNumber')}</TableHead><TableHead>{t('building')}</TableHead>
              <TableHead>{t('contractStart')}</TableHead><TableHead>{t('contractEnd')}</TableHead><TableHead>{t('annualRent')}</TableHead>
              <TableHead>{isAr ? 'تكرار الدفع' : 'Frequency'}</TableHead><TableHead>{t('status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">{t('noRecordsFound')}</TableCell></TableRow>
            ) : contracts.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.tenantName}</TableCell><TableCell>{c.unitNumber}</TableCell>
                <TableCell>{isAr ? c.buildingNameAr : c.buildingName}</TableCell><TableCell>{c.startDate}</TableCell><TableCell>{c.endDate}</TableCell>
                <TableCell className="font-bold">{formatCurrency(c.annualRent, lang)}</TableCell><TableCell>{freqLabel(c.paymentFrequency)}</TableCell>
                <TableCell>{isExpiring(c.endDate) ? <Badge className="bg-status-expiring/10 text-status-expiring border-status-expiring/20">{t('expiringSoon')}</Badge> : <Badge variant="secondary" className="bg-status-available/10 text-status-available border-status-available/20">{t('active')}</Badge>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />{isAr ? 'إضافة عقد جديد' : 'Add New Contract'}</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t('tenantName')} *</Label>
                <Select value={form.tenantId} onValueChange={v => setForm(p => ({...p, tenantId: v}))}><SelectTrigger><SelectValue placeholder={t('selectTenant')} /></SelectTrigger>
                  <SelectContent>{tenants.filter(tn => tn.active).map(tn => <SelectItem key={tn.id} value={tn.id}>{tn.fullName} ({tn.unitNumber})</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-1.5"><Label>{t('contractStart')} *</Label><Input type="date" value={form.startDate} onChange={e => setForm(p => ({...p, startDate: e.target.value}))} /></div>
              <div className="space-y-1.5"><Label>{t('contractEnd')} *</Label><Input type="date" value={form.endDate} onChange={e => setForm(p => ({...p, endDate: e.target.value}))} /></div>
              <div className="space-y-1.5"><Label>{t('annualRent')} (OMR) *</Label><Input type="number" min="0" value={form.annualRent} onChange={e => setForm(p => ({...p, annualRent: e.target.value}))} dir="ltr" /></div>
              <div className="space-y-1.5">
                <Label>{isAr ? 'تكرار الدفع' : 'Payment Frequency'} *</Label>
                <Select value={form.paymentFrequency} onValueChange={v => setForm(p => ({...p, paymentFrequency: v}))}><SelectTrigger><SelectValue placeholder={isAr ? 'اختر التكرار' : 'Select frequency'} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">{isAr ? 'شهري' : 'Monthly'}</SelectItem><SelectItem value="quarterly">{isAr ? 'ربع سنوي' : 'Quarterly'}</SelectItem>
                    <SelectItem value="semi-annual">{isAr ? 'نصف سنوي' : 'Semi-Annual'}</SelectItem><SelectItem value="annual">{isAr ? 'سنوي' : 'Annual'}</SelectItem>
                  </SelectContent></Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>{t('cancel')}</Button>
              <Button type="submit">{isAr ? 'إضافة العقد' : 'Add Contract'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default Contracts;
