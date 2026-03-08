import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useBuildings, useTenants } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface AddTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTenantDialog({ open, onOpenChange }: AddTenantDialogProps) {
  const { t, lang } = useI18n();
  const { getAvailableUnits, assignUnit } = useBuildings();
  const { addTenant } = useTenants();

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    nationalId: '',
    passportNumber: '',
    unitId: '',
    contractStart: '',
    contractEnd: '',
    annualRent: '',
  });

  const availableUnits = getAvailableUnits();

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      fullName: '', phone: '', email: '', nationalId: '',
      passportNumber: '', unitId: '', contractStart: '', contractEnd: '', annualRent: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim() || !form.phone.trim() || !form.nationalId.trim() || !form.unitId || !form.contractStart || !form.contractEnd || !form.annualRent) {
      toast({ title: t('fillRequired'), variant: 'destructive' });
      return;
    }

    const selectedUnit = availableUnits.find(u => u.id === form.unitId);
    if (!selectedUnit) return;

    addTenant({
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      nationalId: form.nationalId.trim(),
      passportNumber: form.passportNumber.trim() || undefined,
      unitId: selectedUnit.id,
      unitNumber: selectedUnit.unitNumber,
      buildingName: selectedUnit.buildingName,
      buildingNameAr: selectedUnit.buildingNameAr,
      contractStart: form.contractStart,
      contractEnd: form.contractEnd,
      annualRent: Number(form.annualRent),
    });

    assignUnit(selectedUnit.id, form.fullName.trim(), form.contractEnd);

    toast({ title: t('tenantAdded') });
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('addTenant')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t('fullName')} *</Label>
              <Input value={form.fullName} onChange={e => handleChange('fullName', e.target.value)} maxLength={100} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('phone')} *</Label>
              <Input value={form.phone} onChange={e => handleChange('phone', e.target.value)} dir="ltr" maxLength={20} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('email')}</Label>
              <Input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} dir="ltr" maxLength={255} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('nationalId')} *</Label>
              <Input value={form.nationalId} onChange={e => handleChange('nationalId', e.target.value)} dir="ltr" maxLength={30} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>{t('passportNumber')}</Label>
              <Input value={form.passportNumber} onChange={e => handleChange('passportNumber', e.target.value)} dir="ltr" maxLength={20} />
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-4">
            <h4 className="text-sm font-semibold text-foreground">{t('leaseDetails')}</h4>
            <div className="space-y-1.5">
              <Label>{t('selectUnit')} *</Label>
              <Select value={form.unitId} onValueChange={v => handleChange('unitId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectAvailableUnit')} />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {lang === 'ar' ? u.buildingNameAr : u.buildingName} — {t('unitNumber')} {u.unitNumber} ({t(u.type)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{t('contractStart')} *</Label>
                <Input type="date" value={form.contractStart} onChange={e => handleChange('contractStart', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('contractEnd')} *</Label>
                <Input type="date" value={form.contractEnd} onChange={e => handleChange('contractEnd', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t('annualRent')} (AED) *</Label>
              <Input type="number" min="0" value={form.annualRent} onChange={e => handleChange('annualRent', e.target.value)} dir="ltr" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
            <Button type="submit">{t('addTenant')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
