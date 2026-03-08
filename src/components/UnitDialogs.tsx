import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n';
import { Unit, getEffectiveStatus } from '@/lib/data';
import { cn } from '@/lib/utils';

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

// EDIT DIALOG
export function EditUnitDialog({ unit, open, onOpenChange }: { unit: Unit; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useI18n();
  const [tenantName, setTenantName] = useState(unit.tenantName || '');
  const [status, setStatus] = useState(unit.status);

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
            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
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
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
          <Button onClick={() => onOpenChange(false)}>{t('save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// PAYMENT DIALOG
export function PaymentDialog({ unit, open, onOpenChange }: { unit: Unit; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useI18n();
  const [amount, setAmount] = useState('');

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
            <Label>{t('amount')}</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
          <Button onClick={() => onOpenChange(false)}>{t('recordPayment')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
