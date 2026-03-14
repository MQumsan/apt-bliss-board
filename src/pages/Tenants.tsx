import { useState } from 'react';
import { UserPlus, Search, Users, Download } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { exportToCsv } from '@/lib/exportCsv';
import { PageLayout } from '@/components/PageLayout';
import { useI18n } from '@/lib/i18n';
import { useTenants } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AddTenantDialog } from '@/components/AddTenantDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEffect } from 'react';

const Tenants = () => {
  const { t, lang } = useI18n();
  const { tenants } = useTenants();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('add') === '1') setAddOpen(true);
  }, [searchParams]);

  const filtered = tenants.filter(tenant => {
    if (!search) return true;
    const q = search.toLowerCase();
    return tenant.fullName.toLowerCase().includes(q) || tenant.nationalId.toLowerCase().includes(q) || tenant.unitNumber.toLowerCase().includes(q) || tenant.phone.toLowerCase().includes(q);
  });

  return (
    <PageLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('searchTenants')} value={search} onChange={e => setSearch(e.target.value)} className="ps-9" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const headers = [t('tenantName'), t('phone'), t('nationalId'), t('unitNumber'), t('building'), t('annualRent'), t('status')];
            const rows = filtered.map(tn => [tn.fullName, tn.phone, tn.nationalId, tn.unitNumber, lang === 'ar' ? tn.buildingNameAr : tn.buildingName, String(tn.annualRent), tn.active ? t('active') : t('inactive')]);
            exportToCsv('tenants.csv', headers, rows);
          }} className="gap-1.5">
            <Download className="h-4 w-4" />{t('exportCsv')}
          </Button>
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />{t('addTenant')}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>{t('tenantName')}</TableHead>
              <TableHead>{t('phone')}</TableHead>
              <TableHead>{t('nationalId')}</TableHead>
              <TableHead>{t('unitNumber')}</TableHead>
              <TableHead>{t('building')}</TableHead>
              <TableHead>{t('annualRent')}</TableHead>
              <TableHead>{t('status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />{t('noTenantsFound')}
                </TableCell>
              </TableRow>
            ) : filtered.map(tenant => (
              <TableRow key={tenant.id}>
                <TableCell className="font-medium">{tenant.fullName}</TableCell>
                <TableCell dir="ltr" className="text-start">{tenant.phone}</TableCell>
                <TableCell dir="ltr" className="text-start">{tenant.nationalId}</TableCell>
                <TableCell>{tenant.unitNumber}</TableCell>
                <TableCell>{lang === 'ar' ? tenant.buildingNameAr : tenant.buildingName}</TableCell>
                <TableCell>{tenant.annualRent.toLocaleString('en', {minimumFractionDigits:3,maximumFractionDigits:3})} OMR</TableCell>
                <TableCell>
                  <Badge variant={tenant.active ? 'default' : 'secondary'} className={tenant.active ? 'bg-status-available text-status-available-foreground' : ''}>
                    {tenant.active ? t('active') : t('inactive')}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AddTenantDialog open={addOpen} onOpenChange={setAddOpen} />
    </PageLayout>
  );
};

export default Tenants;
