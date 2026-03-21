import { useState, useMemo } from 'react';
import { Wrench, Plus, CheckCircle, Clock, Download, Pen, Trash2, Share2 } from 'lucide-react';
import { formatCurrency, CURRENCY } from '@/lib/currency';
import { PageLayout } from '@/components/PageLayout';
import { useI18n } from '@/lib/i18n';
import { useMaintenance, MaintenanceRecord } from '@/lib/maintenanceStore';
import { useBuildings, useFinance } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { exportToCsv } from '@/lib/exportCsv';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';

const MaintenancePage = () => {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';
  const { records, addRecord, editRecord, deleteRecord, updateStatus, totalMaintenanceCost } = useMaintenance();
  const { buildings } = useBuildings();
  const { addExpense } = useFinance();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [finalCost, setFinalCost] = useState('');
  const [form, setForm] = useState({ buildingId: '', unitNumber: '', issueDescription: '', cost: '', date: '', status: 'pending' as string });

  const buildingUnits = useMemo(() => {
    if (!form.buildingId) return [];
    return buildings.find(b => b.id === form.buildingId)?.units || [];
  }, [form.buildingId, buildings]);

  const resetForm = () => setForm({ buildingId: '', unitNumber: '', issueDescription: '', cost: '', date: '', status: 'pending' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.buildingId || !form.unitNumber || !form.issueDescription.trim() || !form.cost || !form.date) {
      toast({ title: t('fillRequired'), variant: 'destructive' }); return;
    }
    const building = buildings.find(b => b.id === form.buildingId);
    addRecord({ buildingId: form.buildingId, buildingName: building?.name || '', buildingNameAr: building?.nameAr || '', unitNumber: form.unitNumber, issueDescription: form.issueDescription.trim(), cost: Number(form.cost), date: form.date, status: form.status as 'pending' | 'completed' });
    toast({ title: isAr ? 'تمت إضافة طلب الصيانة' : 'Maintenance record added' });
    resetForm();
    setAddOpen(false);
  };

  const openEdit = (r: MaintenanceRecord) => {
    setSelectedId(r.id);
    setForm({ buildingId: r.buildingId, unitNumber: r.unitNumber, issueDescription: r.issueDescription, cost: String(r.cost), date: r.date, status: r.status });
    setEditOpen(true);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const building = buildings.find(b => b.id === form.buildingId);
    editRecord(selectedId, { buildingId: form.buildingId, buildingName: building?.name || '', buildingNameAr: building?.nameAr || '', unitNumber: form.unitNumber, issueDescription: form.issueDescription.trim(), cost: Number(form.cost), date: form.date, status: form.status as 'pending' | 'completed' });
    toast({ title: isAr ? 'تم تحديث طلب الصيانة' : 'Maintenance record updated' });
    setEditOpen(false);
  };

  const handleDelete = () => {
    deleteRecord(selectedId);
    toast({ title: isAr ? 'تم حذف طلب الصيانة' : 'Maintenance record deleted' });
    setDeleteOpen(false);
  };

  // Maintenance-Expense Bridge: prompt for final cost on completion
  const openCompleteDialog = (r: MaintenanceRecord) => {
    setSelectedId(r.id);
    setFinalCost(String(r.cost));
    setCompleteOpen(true);
  };

  const handleComplete = () => {
    const record = records.find(r => r.id === selectedId);
    if (!record) return;
    const cost = Number(finalCost) || record.cost;

    // Update maintenance record
    updateStatus(selectedId, 'completed');
    editRecord(selectedId, { cost });

    // Auto-create expense record
    addExpense({
      date: new Date().toISOString().split('T')[0],
      category: 'maintenance',
      amount: cost,
      buildingName: record.buildingName,
      buildingNameAr: record.buildingNameAr,
      unitNumber: record.unitNumber,
      statement: `${isAr ? 'صيانة:' : 'Maintenance:'} ${record.issueDescription}`,
    });

    toast({ title: isAr ? 'تم إكمال الصيانة وتسجيل المصروف تلقائياً' : 'Maintenance completed & expense auto-recorded' });
    setCompleteOpen(false);
  };

  const handleExport = () => {
    const headers = [isAr ? 'التاريخ' : 'Date', isAr ? 'المبنى' : 'Building', isAr ? 'الوحدة' : 'Unit', isAr ? 'الوصف' : 'Description', isAr ? 'التكلفة' : 'Cost', isAr ? 'الحالة' : 'Status'];
    const rows = records.map(r => [r.date, isAr ? r.buildingNameAr : r.buildingName, r.unitNumber, r.issueDescription, String(r.cost), r.status === 'pending' ? (isAr ? 'قيد الانتظار' : 'Pending') : (isAr ? 'مكتمل' : 'Completed')]);
    exportToCsv('maintenance.csv', headers, rows);
  };

  const shareWhatsApp = (r: MaintenanceRecord) => {
    const text = isAr
      ? `🏢 *المشرق للتطوير العقاري* 🏢

*تقرير صيانة*
---------------------------
🏠 *المبنى:* ${r.buildingNameAr || r.buildingName}
🔢 *الوحدة:* ${r.unitNumber}
🔧 *الوصف:* ${r.issueDescription}
💰 *التكلفة:* ${r.cost.toLocaleString('en', { minimumFractionDigits: 3 })} ر.ع
📊 *الحالة:* ${r.status === 'pending' ? 'قيد الانتظار' : 'مكتمل'}
🗓️ *التاريخ:* ${r.date}
---------------------------
📍 مسقط، سلطنة عُمان`
      : `🏢 *Al Mashreq Real Estate Development* 🏢

*Maintenance Report*
---------------------------
🏠 *Building:* ${r.buildingName}
🔢 *Unit:* ${r.unitNumber}
🔧 *Description:* ${r.issueDescription}
💰 *Cost:* ${r.cost.toLocaleString('en', { minimumFractionDigits: 3 })} OMR
📊 *Status:* ${r.status === 'pending' ? 'Pending' : 'Completed'}
🗓️ *Date:* ${r.date}
---------------------------
📍 Muscat, Sultanate of Oman`;
    const phoneInput = window.prompt(isAr ? 'أدخل رقم هاتف المستلم (مثال: 96899123456):' : 'Enter recipient phone number (e.g. 96899123456):');
    let cleanPhone = phoneInput?.trim().replace(/[\s\-\+\(\)]/g, '') || '';
    if (cleanPhone && !cleanPhone.startsWith('968') && cleanPhone.length <= 8) {
      cleanPhone = '968' + cleanPhone;
    }
    const encoded = encodeURIComponent(text);
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    const win = window.open(url, '_blank');
    if (!win) {
      navigator.clipboard.writeText(text).then(() => {
        alert(isAr ? 'تم نسخ الرسالة. الصقها في واتساب.' : 'Message copied. Paste it in WhatsApp.');
      });
    }
  };

  const renderMaintenanceForm = (onSubmit: (e: React.FormEvent) => void, submitLabel: string) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5"><Label>{t('date')} *</Label><Input type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} /></div>
        <div className="space-y-1.5"><Label>{t('property')} *</Label>
          <Select value={form.buildingId} onValueChange={v => setForm(p => ({...p, buildingId: v, unitNumber: ''}))}><SelectTrigger><SelectValue placeholder={t('selectProperty')} /></SelectTrigger>
            <SelectContent>{buildings.map(b => <SelectItem key={b.id} value={b.id}>{isAr ? b.nameAr : b.name}</SelectItem>)}</SelectContent></Select>
        </div>
        <div className="space-y-1.5"><Label>{t('unitNumber')} *</Label>
          <Select value={form.unitNumber} onValueChange={v => setForm(p => ({...p, unitNumber: v}))}><SelectTrigger><SelectValue placeholder={t('selectUnit')} /></SelectTrigger>
            <SelectContent>{buildingUnits.map(u => <SelectItem key={u.id} value={u.unitNumber}>{t('unitNumber')} {u.unitNumber}</SelectItem>)}</SelectContent></Select>
        </div>
        <div className="space-y-1.5"><Label>{isAr ? 'التكلفة المقدرة' : 'Estimated Cost'} ({CURRENCY}) *</Label><Input type="number" min="0" value={form.cost} onChange={e => setForm(p => ({...p, cost: e.target.value}))} dir="ltr" /></div>
      </div>
      <div className="space-y-1.5"><Label>{isAr ? 'وصف المشكلة' : 'Issue Description'} *</Label>
        <Textarea value={form.issueDescription} onChange={e => setForm(p => ({...p, issueDescription: e.target.value}))} rows={3} placeholder={isAr ? 'وصف تفصيلي للمشكلة...' : 'Detailed description...'} className="resize-none" />
      </div>
      <DialogFooter className="gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => { setAddOpen(false); setEditOpen(false); }}>{t('cancel')}</Button>
        <Button type="submit" className="bg-status-maintenance hover:bg-status-maintenance/90 text-status-maintenance-foreground">{submitLabel}</Button>
      </DialogFooter>
    </form>
  );

  return (
    <PageLayout>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-status-maintenance/10 text-status-maintenance"><Wrench className="w-5 h-5" /></div>
          <div><p className="text-xl font-bold text-card-foreground">{records.length}</p><p className="text-xs text-muted-foreground">{isAr ? 'إجمالي الطلبات' : 'Total Requests'}</p></div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-status-expiring/10 text-status-expiring"><Clock className="w-5 h-5" /></div>
          <div><p className="text-xl font-bold text-card-foreground">{records.filter(r => r.status === 'pending').length}</p><p className="text-xs text-muted-foreground">{isAr ? 'قيد الانتظار' : 'Pending'}</p></div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-status-occupied/10 text-status-occupied"><Wrench className="w-5 h-5" /></div>
          <div><p className="text-xl font-bold text-card-foreground">{formatCurrency(totalMaintenanceCost, lang)}</p><p className="text-xs text-muted-foreground">{isAr ? 'إجمالي تكاليف الصيانة' : 'Total Maintenance Cost'}</p></div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5"><Download className="h-4 w-4" />{t('exportCsv')}</Button>
          <Button onClick={() => { resetForm(); setAddOpen(true); }} className="gap-2"><Plus className="h-4 w-4" />{isAr ? 'إضافة طلب صيانة' : 'Add Maintenance'}</Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>{t('date')}</TableHead><TableHead>{t('building')}</TableHead><TableHead>{t('unitNumber')}</TableHead>
              <TableHead>{isAr ? 'الوصف' : 'Description'}</TableHead><TableHead className="text-end">{isAr ? 'التكلفة' : 'Cost'}</TableHead>
              <TableHead>{t('status')}</TableHead><TableHead className="w-40">{isAr ? 'إجراءات' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t('noRecordsFound')}</TableCell></TableRow>
            ) : records.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.date}</TableCell>
                <TableCell>{isAr ? r.buildingNameAr : r.buildingName}</TableCell>
                <TableCell>{r.unitNumber}</TableCell>
                <TableCell><p className="text-sm max-w-[250px]">{r.issueDescription}</p></TableCell>
                <TableCell className="text-end font-bold text-status-occupied">{formatCurrency(r.cost, lang)}</TableCell>
                <TableCell>
                  {r.status === 'pending' ? <Badge className="bg-status-expiring/10 text-status-expiring border-status-expiring/20">{isAr ? 'قيد الانتظار' : 'Pending'}</Badge>
                  : <Badge className="bg-status-available/10 text-status-available border-status-available/20">{isAr ? 'مكتمل' : 'Completed'}</Badge>}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {r.status === 'pending' && (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-status-available" onClick={() => openCompleteDialog(r)}>
                        <CheckCircle className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(r)}>
                      <Pen className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-status-available" onClick={() => shareWhatsApp(r)}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { setSelectedId(r.id); setDeleteOpen(true); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Complete Maintenance Dialog - Prompt for Final Cost */}
      <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-status-available" />{isAr ? 'إتمام الصيانة' : 'Complete Maintenance'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{isAr ? 'أدخل التكلفة النهائية. سيتم تسجيل مصروف تلقائياً في المالية.' : 'Enter the final cost. An expense will be auto-recorded in Financials.'}</p>
            <div className="space-y-1.5">
              <Label>{isAr ? 'التكلفة النهائية' : 'Final Cost'} ({CURRENCY})</Label>
              <Input type="number" min="0" value={finalCost} onChange={e => setFinalCost(e.target.value)} dir="ltr" />
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setCompleteOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleComplete} className="bg-status-available hover:bg-status-available/90 text-status-available-foreground">{isAr ? 'إتمام وتسجيل مصروف' : 'Complete & Record Expense'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Wrench className="h-5 w-5 text-status-maintenance" />{isAr ? 'إضافة طلب صيانة' : 'Add Maintenance Record'}</DialogTitle></DialogHeader>
          {renderMaintenanceForm(handleAdd, isAr ? 'إضافة' : 'Add')}
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Wrench className="h-5 w-5 text-status-maintenance" />{isAr ? 'تعديل طلب الصيانة' : 'Edit Maintenance Record'}</DialogTitle></DialogHeader>
          {renderMaintenanceForm(handleEdit, t('save'))}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={handleDelete} />
    </PageLayout>
  );
};

export default MaintenancePage;
