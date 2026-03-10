import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n';
import { Unit, UnitStatus, getEffectiveStatus } from '@/lib/data';
import { useBuildings, useFinance } from '@/lib/store';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const statusConfig = {
  Available: 'bg-status-available text-status-available-foreground',
  Occupied: 'bg-status-occupied text-status-occupied-foreground',
  Maintenance: 'bg-status-maintenance text-status-maintenance-foreground',
  ExpiringSoon: 'bg-status-expiring text-status-expiring-foreground',
};

// VIEW DIALOG
export function ViewUnitDialog({ unit, open, onOpenChange }: { unit: Unit; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useI18n();
  const effectiveStatus = getEffectiveStatus(unit);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('unitDetails')} — {t('unitNumber')} {unit.unitNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('type')}</p>
              <p className="font-medium text-foreground">{t(unit.type)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('status')}</p>
              <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', statusConfig[effectiveStatus])}>
                {effectiveStatus === 'ExpiringSoon' ? t('expiringSoon') : t(effectiveStatus.toLowerCase() as any)}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('floor')}</p>
              <p className="font-medium text-foreground">{unit.floor}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('tenantName')}</p>
              <p className="font-medium text-foreground">{unit.tenantName || t('noTenant')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('contractEnd')}</p>
              <p className="font-medium text-foreground">{unit.contractEnd || t('noContractEnd')}</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// EDIT DIALOG — now saves changes to global store (and API if configured)
export function EditUnitDialog({ unit, open, onOpenChange }: { unit: Unit; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useI18n();
  const { updateUnit } = useBuildings();
  const [tenantName, setTenantName] = useState(unit.tenantName || '');
  const [status, setStatus] = useState<UnitStatus>(unit.status);
  const [contractEnd, setContractEnd] = useState(unit.contractEnd || '');

  const handleSave = () => {
    updateUnit(unit.id, {
      status,
      tenantName: tenantName.trim() || undefined,
      contractEnd: contractEnd || undefined,
    });
    toast({ title: t('unitUpdated') });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('editUnit')} — {t('unitNumber')} {unit.unitNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('tenantName')}</Label>
            <Input value={tenantName} onChange={(e) => setTenantName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t('status')}</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as UnitStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">{t('available')}</SelectItem>
                <SelectItem value="Occupied">{t('occupied')}</SelectItem>
                <SelectItem value="Maintenance">{t('maintenance')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('contractEnd')}</Label>
            <Input type="date" value={contractEnd} onChange={(e) => setContractEnd(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
          <Button onClick={handleSave}>{t('save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// PAYMENT DIALOG — records income to financial store (and API if configured)
export function PaymentDialog({ unit, open, onOpenChange }: { unit: Unit; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t, lang } = useI18n();
  const { addIncome } = useFinance();
  const { buildings } = useBuildings();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'cash' | 'cheque' | 'transfer'>('cash');
  const [statement, setStatement] = useState('');

  // Find building for this unit
  const building = buildings.find(b => b.units.some(u => u.id === unit.id));

  const handleRecord = () => {
    if (!amount || Number(amount) <= 0) {
      toast({ title: t('fillRequired'), variant: 'destructive' });
      return;
    }

    addIncome({
      date: new Date().toISOString().split('T')[0],
      tenantId: '',
      tenantName: unit.tenantName || '',
      unitNumber: unit.unitNumber,
      buildingName: building?.name || '',
      buildingNameAr: building?.nameAr || '',
      amount: Number(amount),
      method,
      category: 'rent',
      statement: statement.trim() || `Payment - Unit ${unit.unitNumber}`,
    });

    toast({ title: t('incomeAdded') });
    setAmount('');
    setStatement('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('paymentDetails')} — {t('unitNumber')} {unit.unitNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">{t('tenantName')}</p>
            <p className="font-medium text-foreground">{unit.tenantName || t('noTenant')}</p>
          </div>
          <div className="space-y-2">
            <Label>{t('amount')} (OMR) *</Label>
            <Input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.000" dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label>{t('paymentMethod')}</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">{t('cash')}</SelectItem>
                <SelectItem value="cheque">{t('cheque')}</SelectItem>
                <SelectItem value="transfer">{t('transfer')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('statement')}</Label>
            <Input value={statement} onChange={(e) => setStatement(e.target.value)} placeholder={lang === 'ar' ? 'ملاحظات...' : 'Notes...'} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
          <Button onClick={handleRecord}>{t('recordPayment')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
