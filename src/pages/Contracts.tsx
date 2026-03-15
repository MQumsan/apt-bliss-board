import { useState } from 'react';
import { FileText, Plus, AlertTriangle, Download, Pen, Trash2, Upload } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { PageLayout } from '@/components/PageLayout';
import { useI18n } from '@/lib/i18n';
import { useContracts, PaymentFrequency, Contract } from '@/lib/contractStore';
import { useTenants } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { exportToCsv } from '@/lib/exportCsv';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';

const Contracts = () => {
  const { t, lang } = useI18n();
  const { contracts, addContract, editContract, deleteContract, getExpiringContracts } = useContracts();
  const { tenants } = useTenants();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState({ tenantId: '', unitId: '', startDate: '', endDate: '', monthlyRent: '', paymentFrequency: '', contractFile: '' });
  const isAr = lang === 'ar';
  const expiring = getExpiringContracts(30);

  const freqLabel = (f: string) => ({ monthly: { en: 'Monthly', ar: 'شهري' }, quarterly: { en: 'Quarterly', ar: 'ربع سنوي' }, 'semi-annual': { en: 'Semi-Annual', ar: 'نصف سنوي' }, annual: { en: 'Annual', ar: 'سنوي' } }[f]?.[lang] || f);
  const calcAnnual = (monthly: string) => Number(monthly) * 12;

  const resetForm = () => setForm({ tenantId: '', unitId: '', startDate: '', endDate: '', monthlyRent: '', paymentFrequency: '', contractFile: '' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tenantId || !form.startDate || !form.endDate || !form.monthlyRent || !form.paymentFrequency) {
      toast({ title: t('fillRequired'), variant: 'destructive' }); return;
    }
    const tenant = tenants.find(tn => tn.id === form.tenantId);
    if (!tenant) return;
    const monthly = Number(form.monthlyRent);
    addContract({ tenantId: tenant.id, tenantName: tenant.fullName, unitId: tenant.unitId, unitNumber: tenant.unitNumber, buildingName: tenant.buildingName, buildingNameAr: tenant.buildingNameAr, startDate: form.startDate, endDate: form.endDate, monthlyRent: monthly, annualRent: monthly * 12, paymentFrequency: form.paymentFrequency as PaymentFrequency, contractFile: form.contractFile || undefined });
    toast({ title: isAr ? 'تمت إضافة العقد بنجاح' : 'Contract added successfully' });
    resetForm();
    setAddOpen(false);
  };

  const openEdit = (c: Contract) => {
    setSelectedId(c.id);
    setForm({ tenantId: c.tenantId, unitId: c.unitId, startDate: c.startDate, endDate: c.endDate, monthlyRent: String(c.monthlyRent), paymentFrequency: c.paymentFrequency, contractFile: c.contractFile || '' });
    setEditOpen(true);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const monthly = Number(form.monthlyRent);
    editContract(selectedId, { startDate: form.startDate, endDate: form.endDate, monthlyRent: monthly, annualRent: monthly * 12, paymentFrequency: form.paymentFrequency as PaymentFrequency, contractFile: form.contractFile || undefined });
    toast({ title: isAr ? 'تم تحديث العقد' : 'Contract updated' });
    setEditOpen(false);
  };

  const handleDelete = () => {
    deleteContract(selectedId);
    toast({ title: isAr ? 'تم حذف العقد' : 'Contract deleted' });
    setDeleteOpen(false);
  };

  const isExpiring = (endDate: string) => { const d = (new Date(endDate).getTime() - Date.now()) / 86400000; return d > 0 && d <= 30; };

  const handleExport = () => {
    const headers = [isAr ? 'المستأجر' : 'Tenant', isAr ? 'الوحدة' : 'Unit', isAr ? 'المبنى' : 'Building', isAr ? 'بداية العقد' : 'Start Date', isAr ? 'نهاية العقد' : 'End Date', isAr ? 'الإيجار الشهري' : 'Monthly Rent', isAr ? 'الإيجار السنوي' : 'Annual Rent', isAr ? 'تكرار الدفع' : 'Frequency'];
    const rows = contracts.map(c => [c.tenantName, c.unitNumber, isAr ? c.buildingNameAr : c.buildingName, c.startDate, c.endDate, String(c.monthlyRent), String(c.annualRent), freqLabel(c.paymentFrequency)]);
    exportToCsv('contracts.csv', headers, rows);
  };

  const renderContractForm = (onSubmit: (e: React.FormEvent) => void, submitLabel: string, isEdit = false) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {!isEdit && (
          <div className="space-y-1.5 sm:col-span-2">
            <Label>{t('tenantName')} *</Label>
            <Select value={form.tenantId} onValueChange={v => setForm(p => ({...p, tenantId: v}))}><SelectTrigger><SelectValue placeholder={t('selectTenant')} /></SelectTrigger>
              <SelectContent>{tenants.filter(tn => tn.active).map(tn => <SelectItem key={tn.id} value={tn.id}>{tn.fullName} ({tn.unitNumber})</SelectItem>)}</SelectContent></Select>
          </div>
        )}
        <div className="space-y-1.5"><Label>{t('contractStart')} *</Label><Input type="date" value={form.startDate} onChange={e => setForm(p => ({...p, startDate: e.target.value}))} /></div>
        <div className="space-y-1.5"><Label>{t('contractEnd')} *</Label><Input type="date" value={form.endDate} onChange={e => setForm(p => ({...p, endDate: e.target.value}))} /></div>
        <div className="space-y-1.5">
          <Label>{isAr ? 'الإيجار الشهري' : 'Monthly Rent'} (OMR) *</Label>
          <Input type="number" min="0" step="0.001" value={form.monthlyRent} onChange={e => setForm(p => ({...p, monthlyRent: e.target.value}))} dir="ltr" />
        </div>
        <div className="space-y-1.5">
          <Label>{isAr ? 'الإيجار السنوي (محسوب)' : 'Annual Rent (Calculated)'}</Label>
          <div className="h-9 rounded-md border border-input bg-muted/50 px-3 flex items-center text-sm font-bold text-primary" dir="ltr">
            {form.monthlyRent ? formatCurrency(calcAnnual(form.monthlyRent), lang) : '—'}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>{isAr ? 'تكرار الدفع' : 'Payment Frequency'} *</Label>
          <Select value={form.paymentFrequency} onValueChange={v => setForm(p => ({...p, paymentFrequency: v}))}><SelectTrigger><SelectValue placeholder={isAr ? 'اختر التكرار' : 'Select frequency'} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">{isAr ? 'شهري' : 'Monthly'}</SelectItem><SelectItem value="quarterly">{isAr ? 'ربع سنوي' : 'Quarterly'}</SelectItem>
              <SelectItem value="semi-annual">{isAr ? 'نصف سنوي' : 'Semi-Annual'}</SelectItem><SelectItem value="annual">{isAr ? 'سنوي' : 'Annual'}</SelectItem>
            </SelectContent></Select>
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5"><Upload className="h-3.5 w-3.5" />{isAr ? 'ملف العقد (رابط)' : 'Contract File (URL)'}</Label>
          <Input value={form.contractFile} onChange={e => setForm(p => ({...p, contractFile: e.target.value}))} placeholder={isAr ? 'رابط الملف...' : 'File URL...'} dir="ltr" />
        </div>
      </div>
      <DialogFooter className="gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => { setAddOpen(false); setEditOpen(false); }}>{t('cancel')}</Button>
        <Button type="submit">{submitLabel}</Button>
      </DialogFooter>
    </form>
  );

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
          <Button onClick={() => { resetForm(); setAddOpen(true); }} className="gap-2"><Plus className="h-4 w-4" />{isAr ? 'إضافة عقد' : 'Add Contract'}</Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>{t('tenantName')}</TableHead><TableHead>{t('unitNumber')}</TableHead><TableHead>{t('building')}</TableHead>
              <TableHead>{t('contractStart')}</TableHead><TableHead>{t('contractEnd')}</TableHead>
              <TableHead>{isAr ? 'شهري' : 'Monthly'}</TableHead><TableHead>{t('annualRent')}</TableHead>
              <TableHead>{isAr ? 'تكرار الدفع' : 'Frequency'}</TableHead><TableHead>{t('status')}</TableHead>
              <TableHead className="w-24">{isAr ? 'إجراءات' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.length === 0 ? (
              <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">{t('noRecordsFound')}</TableCell></TableRow>
            ) : contracts.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.tenantName}</TableCell><TableCell>{c.unitNumber}</TableCell>
                <TableCell>{isAr ? c.buildingNameAr : c.buildingName}</TableCell><TableCell>{c.startDate}</TableCell><TableCell>{c.endDate}</TableCell>
                <TableCell className="font-semibold">{formatCurrency(c.monthlyRent, lang)}</TableCell>
                <TableCell className="font-bold">{formatCurrency(c.annualRent, lang)}</TableCell><TableCell>{freqLabel(c.paymentFrequency)}</TableCell>
                <TableCell>{isExpiring(c.endDate) ? <Badge className="bg-status-expiring/10 text-status-expiring border-status-expiring/20">{t('expiringSoon')}</Badge> : <Badge variant="secondary" className="bg-status-available/10 text-status-available border-status-available/20">{t('active')}</Badge>}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(c)}>
                      <Pen className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { setSelectedId(c.id); setDeleteOpen(true); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />{isAr ? 'إضافة عقد جديد' : 'Add New Contract'}</DialogTitle></DialogHeader>
          {renderContractForm(handleAdd, isAr ? 'إضافة العقد' : 'Add Contract')}
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />{isAr ? 'تعديل العقد' : 'Edit Contract'}</DialogTitle></DialogHeader>
          {renderContractForm(handleEdit, t('save'), true)}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={handleDelete} />
    </PageLayout>
  );
};

export default Contracts;
