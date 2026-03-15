import { useState } from 'react';
import { Building2, Plus, Pen, Trash2, Download, Home } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { useI18n } from '@/lib/i18n';
import { useBuildings } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { exportToCsv } from '@/lib/exportCsv';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { AddUnitDialog } from '@/components/AddUnitDialog';

const Buildings = () => {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';
  const { buildings, addBuilding, editBuilding, deleteBuilding } = useBuildings();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addUnitOpen, setAddUnitOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState({ name: '', nameAr: '', address: '', floors: '' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.nameAr.trim()) {
      toast({ title: t('fillRequired'), variant: 'destructive' }); return;
    }
    addBuilding(form.name.trim(), form.nameAr.trim(), form.address.trim(), Number(form.floors) || 1);
    toast({ title: t('buildingAdded') });
    setForm({ name: '', nameAr: '', address: '', floors: '' });
    setAddOpen(false);
  };

  const openEdit = (id: string) => {
    const b = buildings.find(b => b.id === id);
    if (!b) return;
    setSelectedId(id);
    setForm({ name: b.name, nameAr: b.nameAr, address: b.address || '', floors: String(b.floors || '') });
    setEditOpen(true);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.nameAr.trim()) {
      toast({ title: t('fillRequired'), variant: 'destructive' }); return;
    }
    editBuilding(selectedId, { name: form.name.trim(), nameAr: form.nameAr.trim(), address: form.address.trim(), floors: Number(form.floors) || 1 });
    toast({ title: isAr ? 'تم تحديث المبنى' : 'Building updated' });
    setEditOpen(false);
  };

  const handleDelete = () => {
    deleteBuilding(selectedId);
    toast({ title: isAr ? 'تم حذف المبنى' : 'Building deleted' });
    setDeleteOpen(false);
  };

  const handleExport = () => {
    const headers = [isAr ? 'المبنى (إنجليزي)' : 'Building (EN)', isAr ? 'المبنى (عربي)' : 'Building (AR)', isAr ? 'العنوان' : 'Address', isAr ? 'الطوابق' : 'Floors', isAr ? 'عدد الوحدات' : 'Units Count'];
    const rows = buildings.map(b => [b.name, b.nameAr, b.address || '', String(b.floors || ''), String(b.units.length)]);
    exportToCsv('buildings.csv', headers, rows);
  };

  const renderForm = (onSubmit: (e: React.FormEvent) => void, submitLabel: string) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>{t('buildingNameEn')} *</Label>
          <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Al-Noor Tower" dir="ltr" />
        </div>
        <div className="space-y-1.5">
          <Label>{t('buildingNameAr')} *</Label>
          <Input value={form.nameAr} onChange={e => setForm(p => ({ ...p, nameAr: e.target.value }))} placeholder="مثال: برج النور" dir="rtl" />
        </div>
        <div className="space-y-1.5">
          <Label>{isAr ? 'العنوان' : 'Address'}</Label>
          <Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder={isAr ? 'مثال: مسقط، عمان' : 'e.g. Muscat, Oman'} />
        </div>
        <div className="space-y-1.5">
          <Label>{isAr ? 'عدد الطوابق' : 'Floors'}</Label>
          <Input type="number" min="1" value={form.floors} onChange={e => setForm(p => ({ ...p, floors: e.target.value }))} dir="ltr" />
        </div>
      </div>
      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={() => { setAddOpen(false); setEditOpen(false); }}>{t('cancel')}</Button>
        <Button type="submit">{submitLabel}</Button>
      </DialogFooter>
    </form>
  );

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          {isAr ? 'إدارة المباني' : 'Buildings Management'}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5"><Download className="h-4 w-4" />{t('exportCsv')}</Button>
          <Button onClick={() => { setForm({ name: '', nameAr: '', address: '', floors: '' }); setAddOpen(true); }} className="gap-2"><Plus className="h-4 w-4" />{t('addBuilding')}</Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>{t('buildingNameEn')}</TableHead>
              <TableHead>{t('buildingNameAr')}</TableHead>
              <TableHead>{isAr ? 'العنوان' : 'Address'}</TableHead>
              <TableHead>{isAr ? 'الطوابق' : 'Floors'}</TableHead>
              <TableHead>{isAr ? 'الوحدات' : 'Units'}</TableHead>
              <TableHead className="w-32">{isAr ? 'إجراءات' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buildings.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t('noRecordsFound')}</TableCell></TableRow>
            ) : buildings.map(b => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell className="font-medium">{b.nameAr}</TableCell>
                <TableCell>{b.address || '—'}</TableCell>
                <TableCell>{b.floors || '—'}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{b.units.length}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => { setSelectedId(b.id); setAddUnitOpen(true); }}>
                      <Home className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(b.id)}>
                      <Pen className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { setSelectedId(b.id); setDeleteOpen(true); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{t('addBuilding')}</DialogTitle></DialogHeader>
          {renderForm(handleAdd, t('addBuilding'))}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{isAr ? 'تعديل المبنى' : 'Edit Building'}</DialogTitle></DialogHeader>
          {renderForm(handleEdit, t('save'))}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <DeleteConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={handleDelete} />

      {/* Add Unit to Building */}
      <AddUnitDialog open={addUnitOpen} onOpenChange={setAddUnitOpen} buildingId={selectedId} />
    </PageLayout>
  );
};

export default Buildings;
