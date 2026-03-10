import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useBuildings } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface AddBuildingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddBuildingDialog({ open, onOpenChange }: AddBuildingDialogProps) {
  const { t, lang } = useI18n();
  const { addBuilding } = useBuildings();
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nameAr.trim()) {
      toast({ title: t('fillRequired'), variant: 'destructive' });
      return;
    }
    addBuilding(name.trim(), nameAr.trim());
    toast({ title: t('buildingAdded') });
    setName('');
    setNameAr('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addBuilding')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('buildingNameEn')} *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Al-Noor Tower" dir="ltr" maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label>{t('buildingNameAr')} *</Label>
            <Input value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="مثال: برج النور" dir="rtl" maxLength={100} />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
            <Button type="submit">{t('addBuilding')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
