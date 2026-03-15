import { useState, useEffect } from 'react';
import { Plus, FileCheck, Download, AlertTriangle, Ban, Pen, Trash2 } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { useI18n } from '@/lib/i18n';
import { useCheques, ChequeStatus, Cheque, setOnChequeCleared } from '@/lib/chequeStore';
import { useTenants, useFinance } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { exportToCsv } from '@/lib/exportCsv';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';

const statusColors: Record<ChequeStatus, string> = {
  pending: 'bg-status-maintenance/10 text-status-maintenance border-status-maintenance/20',
  cleared: 'bg-status-available/10 text-status-available border-status-available/20',
  bounced: 'bg-status-occupied/10 text-status-occupied border-status-occupied/20',
  cancelled: 'bg-muted text-muted-foreground border-border',
};

const Cheques = () => {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';
  const { cheques, addCheque, editCheque, deleteCheque, updateStatus, getBouncedCheques } = useCheques();
  const { tenants } = useTenants();
  const { addIncome } = useFinance();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState({ chequeNumber: '', bankName: '', dueDate: '', amount: '', tenantId: '', status: 'pending' as ChequeStatus });

  useEffect(() => {
    setOnChequeCleared((cheque) => {
      addIncome({
        date: new Date().toISOString().split('T')[0],
        tenantId: cheque.tenantId,
        tenantName: cheque.tenantName,
        unitNumber: cheque.unitNumber,
        buildingName: cheque.buildingName,
        buildingNameAr: cheque.buildingNameAr,
        amount: cheque.amount,
        method: 'cheque',
        category: 'rent',
        statement: `Cheque ${cheque.chequeNumber} cleared — ${cheque.bankName}`,
      });
    });
  }, [addIncome]);

  const resetForm = () => setForm({ chequeNumber: '', bankName: '', dueDate: '', amount: '', tenantId: '', status: 'pending' });

  const handleClear = (id: string) => {
    updateStatus(id, 'cleared');
    toast({ title: t('chequeCleared') });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.chequeNumber || !form.bankName || !form.dueDate || !form.amount || !form.tenantId) {
      toast({ title: t('fillRequired'), variant: 'destructive' }); return;
    }
    const tenant = tenants.find(tn => tn.id === form.tenantId);
    if (!tenant) return;
    addCheque({
      chequeNumber: form.chequeNumber, bankName: form.bankName, dueDate: form.dueDate, amount: Number(form.amount),
      tenantId: tenant.id, tenantName: tenant.fullName, buildingName: tenant.buildingName, buildingNameAr: tenant.buildingNameAr, unitNumber: tenant.unitNumber, status: form.status,
    });
    toast({ title: t('chequeAdded') });
    resetForm();
    setAddOpen(false);
  };

  const openEdit = (c: Cheque) => {
    setSelectedId(c.id);
    setForm({ chequeNumber: c.chequeNumber, bankName: c.bankName, dueDate: c.dueDate, amount: String(c.amount), tenantId: c.tenantId, status: c.status });
    setEditOpen(true);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    editCheque(selectedId, { chequeNumber: form.chequeNumber, bankName: form.bankName, dueDate: form.dueDate, amount: Number(form.amount) });
    toast({ title: isAr ? 'تم تحديث الشيك' : 'Cheque updated' });
    setEditOpen(false);
  };

  const handleDelete = () => {
    deleteCheque(selectedId);
    toast({ title: isAr ? 'تم حذف الشيك' : 'Cheque deleted' });
    setDeleteOpen(false);
  };

  const handleExport = () => {
    const headers = [t('chequeNumber'), t('bankName'), t('dueDate'), t('amount'), t('tenantName'), t('property'), t('unitNumber'), t('status')];
    const rows = cheques.map(c => [c.chequeNumber, c.bankName, c.dueDate, String(c.amount), c.tenantName, lang === 'ar' ? c.buildingNameAr : c.buildingName, c.unitNumber, t(c.status as any)]);
    exportToCsv('cheques.csv', headers, rows);
  };

  const bouncedCheques = getBouncedCheques();
  const isOverdue = (c: { status: ChequeStatus; dueDate: string }) => {
    if (c.status !== 'pending') return false;
    const now = new Date(); now.setHours(0,0,0,0);
    return new Date(c.dueDate) < now;
  };

  const renderTable = (list: typeof cheques) => (
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
            <TableHead className="w-36">{isAr ? 'إجراءات' : 'Actions'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.length === 0 ? (
            <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">{t('noRecordsFound')}</TableCell></TableRow>
          ) : list.map(c => (
            <TableRow key={c.id} className={isOverdue(c) ? 'bg-destructive/5' : ''}>
              <TableCell className="font-mono font-medium">{c.chequeNumber}</TableCell>
              <TableCell>{c.bankName}</TableCell>
              <TableCell className={`whitespace-nowrap ${isOverdue(c) ? 'text-destructive font-semibold' : ''}`}>
                {c.dueDate}{isOverdue(c) && <AlertTriangle className="inline-block h-3.5 w-3.5 ms-1 text-destructive" />}
              </TableCell>
              <TableCell className="font-medium">{c.tenantName}</TableCell>
              <TableCell>{lang === 'ar' ? c.buildingNameAr : c.buildingName}</TableCell>
              <TableCell>{c.unitNumber}</TableCell>
              <TableCell className="text-end font-bold whitespace-nowrap">{c.amount.toLocaleString('en',{minimumFractionDigits:3,maximumFractionDigits:3})} OMR</TableCell>
              <TableCell><Badge variant="outline" className={statusColors[c.status]}>{t(c.status as any)}</Badge></TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {c.status === 'pending' && (
                    <>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-status-available/30 text-status-available hover:bg-status-available/10" onClick={() => handleClear(c.id)}>
                        <FileCheck className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => updateStatus(c.id, 'bounced')}>
                        <Ban className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => openEdit(c)}>
                    <Pen className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => { setSelectedId(c.id); setDeleteOpen(true); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <PageLayout>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground">{cheques.length} {t('cheques')}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2"><Download className="h-4 w-4" />{t('exportCsv')}</Button>
          <Button size="sm" onClick={() => { resetForm(); setAddOpen(true); }} className="gap-2"><Plus className="h-4 w-4" />{t('addCheque')}</Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">{t('cheques')}</TabsTrigger>
          <TabsTrigger value="bounced" className="gap-1.5">
            {t('bouncedCheques')}
            {bouncedCheques.length > 0 && <Badge variant="destructive" className="h-5 min-w-5 px-1 text-xs">{bouncedCheques.length}</Badge>}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">{renderTable(cheques)}</TabsContent>
        <TabsContent value="bounced">
          <div className="mb-3 flex items-center gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/15">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">{isAr ? 'شيكات مرتجعة تحتاج متابعة فورية' : 'Bounced cheques requiring immediate follow-up'}</span>
          </div>
          {renderTable(bouncedCheques)}
        </TabsContent>
      </Tabs>

      {/* Add Cheque Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><FileCheck className="h-5 w-5 text-primary" />{t('addCheque')}</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>{t('chequeNumber')} *</Label><Input value={form.chequeNumber} onChange={e => setForm(p => ({...p, chequeNumber: e.target.value}))} placeholder="CHQ-XXXXXX" /></div>
              <div className="space-y-1.5"><Label>{t('bankName')} *</Label><Input value={form.bankName} onChange={e => setForm(p => ({...p, bankName: e.target.value}))} /></div>
              <div className="space-y-1.5"><Label>{t('dueDate')} *</Label><Input type="date" value={form.dueDate} onChange={e => setForm(p => ({...p, dueDate: e.target.value}))} /></div>
              <div className="space-y-1.5"><Label>{t('amount')} (OMR) *</Label><Input type="number" min="0" value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))} dir="ltr" /></div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t('tenantName')} *</Label>
                <Select value={form.tenantId} onValueChange={v => setForm(p => ({...p, tenantId: v}))}>
                  <SelectTrigger><SelectValue placeholder={t('selectTenant')} /></SelectTrigger>
                  <SelectContent>{tenants.filter(tn => tn.active).map(tn => <SelectItem key={tn.id} value={tn.id}>{tn.fullName} ({tn.unitNumber})</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>{t('cancel')}</Button>
              <Button type="submit">{t('addCheque')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Cheque Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{isAr ? 'تعديل الشيك' : 'Edit Cheque'}</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>{t('chequeNumber')}</Label><Input value={form.chequeNumber} onChange={e => setForm(p => ({...p, chequeNumber: e.target.value}))} /></div>
              <div className="space-y-1.5"><Label>{t('bankName')}</Label><Input value={form.bankName} onChange={e => setForm(p => ({...p, bankName: e.target.value}))} /></div>
              <div className="space-y-1.5"><Label>{t('dueDate')}</Label><Input type="date" value={form.dueDate} onChange={e => setForm(p => ({...p, dueDate: e.target.value}))} /></div>
              <div className="space-y-1.5"><Label>{t('amount')} (OMR)</Label><Input type="number" min="0" value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))} dir="ltr" /></div>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>{t('cancel')}</Button>
              <Button type="submit">{t('save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={handleDelete} />
    </PageLayout>
  );
};

export default Cheques;
