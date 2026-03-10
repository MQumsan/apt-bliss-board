import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useBuildings } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface AddUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buildingId?: string;
}

export function AddUnitDialog({ open, onOpenChange, buildingId: defaultBuildingId }: AddUnitDialogProps) {
  const { t, lang } = useI18n();
  const { buildings, addUnit } = useBuildings();
  const [buildingId, setBuildingId] = useState(defaultBuildingId || '');
  const [unitNumber, setUnitNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [type, setType] = useState<'studio' | 'oneBed' | 'twoBed' | 'threeBed' | 'penthouse'>('studio');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buildingId || !unitNumber.trim() || !floor) {
      toast({ title: t('fillRequired'), variant: 'destructive' });
      return;
    }
    addUnit(buildingId, {
      unitNumber: unitNumber.trim(),
      floor: Number(floor),
      type,
      status: 'Available',
    });
    toast({ title: t('unitAdded') });
    setUnitNumber('');
    setFloor('');
    setType('studio');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addUnit')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('building')} *</Label>
            <Select value={buildingId} onValueChange={setBuildingId}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectBuilding')} />
              </SelectTrigger>
              <SelectContent>
                {buildings.map(b => (
                  <SelectItem key={b.id} value={b.id}>
                    {lang === 'ar' ? b.nameAr : b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('unitNumber')} *</Label>
              <Input value={unitNumber} onChange={e => setUnitNumber(e.target.value)} placeholder="301" dir="ltr" maxLength={10} />
            </div>
            <div className="space-y-2">
              <Label>{t('floor')} *</Label>
              <Input type="number" min="0" value={floor} onChange={e => setFloor(e.target.value)} dir="ltr" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('type')}</Label>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="studio">{t('studio')}</SelectItem>
                <SelectItem value="oneBed">{t('oneBed')}</SelectItem>
                <SelectItem value="twoBed">{t('twoBed')}</SelectItem>
                <SelectItem value="threeBed">{t('threeBed')}</SelectItem>
                <SelectItem value="penthouse">{t('penthouse')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
            <Button type="submit">{t('addUnit')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
