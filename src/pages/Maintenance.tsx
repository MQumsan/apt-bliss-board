import { useState, useMemo } from 'react';
import { Wrench, Plus, Languages, CheckCircle, Clock, Download } from 'lucide-react';
import { formatCurrency, CURRENCY } from '@/lib/currency';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useI18n } from '@/lib/i18n';
import { useMaintenance } from '@/lib/maintenanceStore';
import { useBuildings } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { exportToCsv } from '@/lib/exportCsv';

const MaintenancePage = () => {
  const { t, toggleLang, lang } = useI18n();
  const { records, addRecord, updateStatus, totalMaintenanceCost } = useMaintenance();
  const { buildings } = useBuildings();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ buildingId: '', unitNumber: '', issueDescription: '', cost: '', date: '', status: 'pending' as string });

  const buildingUnits = useMemo(() => {
    if (!form.buildingId) return [];
    return buildings.find(b => b.id === form.buildingId)?.units || [];
  }, [form.buildingId, buildings]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.buildingId || !form.unitNumber || !form.issueDescription.trim() || !form.cost || !form.date) {
      toast({ title: t('fillRequired'), variant: 'destructive' });
      return;
    }
    const building = buildings.find(b => b.id === form.buildingId);
    addRecord({
      buildingId: form.buildingId,
      buildingName: building?.name || '',
      buildingNameAr: building?.nameAr || '',
      unitNumber: form.unitNumber,
      issueDescription: form.issueDescription.trim(),
      cost: Number(form.cost),
      date: form.date,
      status: form.status as 'pending' | 'completed',
    });
    toast({ title: lang === 'ar' ? 'تمت إضافة طلب الصيانة' : 'Maintenance record added' });
    setForm({ buildingId: '', unitNumber: '', issueDescription: '', cost: '', date: '', status: 'pending' });
    setAddOpen(false);
  };

  const handleExport = () => {
    const headers = [lang === 'ar' ? 'التاريخ' : 'Date', lang === 'ar' ? 'المبنى' : 'Building', lang === 'ar' ? 'الوحدة' : 'Unit', lang === 'ar' ? 'الوصف' : 'Description', lang === 'ar' ? 'التكلفة' : 'Cost', lang === 'ar' ? 'الحالة' : 'Status'];
    const rows = records.map(r => [r.date, lang === 'ar' ? r.buildingNameAr : r.buildingName, r.unitNumber, r.issueDescription, String(r.cost), r.status === 'pending' ? (lang === 'ar' ? 'قيد الانتظار' : 'Pending') : (lang === 'ar' ? 'مكتمل' : 'Completed')]);
    exportToCsv('maintenance.csv', headers, rows);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h2 className="text-lg font-semibold text-foreground">{lang === 'ar' ? 'الصيانة' : 'Maintenance'}</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleLang} className="gap-2">
              <Languages className="h-4 w-4" />{t('language')}
            </Button>
          </header>
          <main className="flex-1 p-6">
            {/* KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-card rounded-lg border border-border p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-status-maintenance/10 text-status-maintenance"><Wrench className="w-5 h-5" /></div>
                <div>
                  <p className="text-xl font-bold text-card-foreground">{records.length}</p>
                  <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي الطلبات' : 'Total Requests'}</p>
                </div>
              </div>
              <div className="bg-card rounded-lg border border-border p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-status-expiring/10 text-status-expiring"><Clock className="w-5 h-5" /></div>
                <div>
                  <p className="text-xl font-bold text-card-foreground">{records.filter(r => r.status === 'pending').length}</p>
                  <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'قيد الانتظار' : 'Pending'}</p>
                </div>
              </div>
              <div className="bg-card rounded-lg border border-border p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-status-occupied/10 text-status-occupied"><Wrench className="w-5 h-5" /></div>
                <div>
                  <p className="text-xl font-bold text-card-foreground">{formatCurrency(totalMaintenanceCost, lang)}</p>
                  <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي تكاليف الصيانة' : 'Total Maintenance Cost'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
                  <Download className="h-4 w-4" />{t('exportCsv')}
                </Button>
                <Button onClick={() => setAddOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />{lang === 'ar' ? 'إضافة طلب صيانة' : 'Add Maintenance'}
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>{t('date')}</TableHead>
                    <TableHead>{t('building')}</TableHead>
                    <TableHead>{t('unitNumber')}</TableHead>
                    <TableHead>{lang === 'ar' ? 'الوصف' : 'Description'}</TableHead>
                    <TableHead className="text-end">{lang === 'ar' ? 'التكلفة' : 'Cost'}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t('noRecordsFound')}</TableCell></TableRow>
                  ) : records.map(r => (
                    <TableRow key={r.id}>
                      <TableCell>{r.date}</TableCell>
                      <TableCell>{lang === 'ar' ? r.buildingNameAr : r.buildingName}</TableCell>
                      <TableCell>{r.unitNumber}</TableCell>
                      <TableCell><p className="text-sm max-w-[250px]">{r.issueDescription}</p></TableCell>
                      <TableCell className="text-end font-bold text-status-occupied">{formatCurrency(r.cost, lang)}</TableCell>
                      <TableCell>
                        {r.status === 'pending' ? (
                          <Badge className="bg-status-expiring/10 text-status-expiring border-status-expiring/20">{lang === 'ar' ? 'قيد الانتظار' : 'Pending'}</Badge>
                        ) : (
                          <Badge className="bg-status-available/10 text-status-available border-status-available/20">{lang === 'ar' ? 'مكتمل' : 'Completed'}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {r.status === 'pending' && (
                          <Button size="sm" variant="outline" className="gap-1 text-status-available" onClick={() => { updateStatus(r.id, 'completed'); toast({ title: lang === 'ar' ? 'تم تحديث الحالة' : 'Status updated' }); }}>
                            <CheckCircle className="h-3.5 w-3.5" />{lang === 'ar' ? 'إكمال' : 'Complete'}
                          </Button>
                        )}
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
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Wrench className="h-5 w-5 text-status-maintenance" />{lang === 'ar' ? 'إضافة طلب صيانة' : 'Add Maintenance Record'}</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{t('date')} *</Label>
                <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('property')} *</Label>
                <Select value={form.buildingId} onValueChange={v => setForm(p => ({ ...p, buildingId: v, unitNumber: '' }))}>
                  <SelectTrigger><SelectValue placeholder={t('selectProperty')} /></SelectTrigger>
                  <SelectContent>
                    {buildings.map(b => <SelectItem key={b.id} value={b.id}>{lang === 'ar' ? b.nameAr : b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t('unitNumber')} *</Label>
                <Select value={form.unitNumber} onValueChange={v => setForm(p => ({ ...p, unitNumber: v }))}>
                  <SelectTrigger><SelectValue placeholder={t('selectUnit')} /></SelectTrigger>
                  <SelectContent>
                    {buildingUnits.map(u => <SelectItem key={u.id} value={u.unitNumber}>{t('unitNumber')} {u.unitNumber}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{lang === 'ar' ? 'التكلفة' : 'Cost'} ({CURRENCY}) *</Label>
                <Input type="number" min="0" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} dir="ltr" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{lang === 'ar' ? 'وصف المشكلة' : 'Issue Description'} *</Label>
              <Textarea value={form.issueDescription} onChange={e => setForm(p => ({ ...p, issueDescription: e.target.value }))} rows={3} placeholder={lang === 'ar' ? 'وصف تفصيلي للمشكلة...' : 'Detailed description of the issue...'} className="resize-none" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>{t('cancel')}</Button>
              <Button type="submit" className="bg-status-maintenance hover:bg-status-maintenance/90 text-status-maintenance-foreground">{lang === 'ar' ? 'إضافة' : 'Add'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default MaintenancePage;
