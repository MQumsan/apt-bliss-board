import { useMemo } from 'react';
import { Download, BarChart3 } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { useI18n } from '@/lib/i18n';
import { useFinance } from '@/lib/store';
import { buildings } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { exportToCsv } from '@/lib/exportCsv';

const COLORS = ['hsl(142,60%,45%)', 'hsl(0,72%,51%)', 'hsl(215,70%,45%)', 'hsl(45,90%,48%)'];

const Reports = () => {
  const { t, lang } = useI18n();
  const { incomes, expenses, totalRevenue, totalExpenses } = useFinance();

  const monthlyPL = useMemo(() => {
    const map: Record<string, { month: string; income: number; expense: number }> = {};
    incomes.forEach(r => { const m = r.date.slice(0,7); if (!map[m]) map[m] = {month:m,income:0,expense:0}; map[m].income += r.amount; });
    expenses.forEach(r => { const m = r.date.slice(0,7); if (!map[m]) map[m] = {month:m,income:0,expense:0}; map[m].expense += r.amount; });
    return Object.values(map).sort((a,b) => a.month.localeCompare(b.month));
  }, [incomes, expenses]);

  const occupancyData = useMemo(() => {
    const all = buildings.flatMap(b => b.units);
    return [
      { name: lang === 'ar' ? 'مشغول' : 'Occupied', value: all.filter(u => u.status === 'Occupied').length },
      { name: lang === 'ar' ? 'متاح' : 'Available', value: all.filter(u => u.status === 'Available').length },
      { name: lang === 'ar' ? 'صيانة' : 'Maintenance', value: all.filter(u => u.status === 'Maintenance').length },
    ];
  }, [lang]);

  const exportMonthlyPL = () => { exportToCsv('monthly-pl.csv', [t('date'),t('grossIncome'),t('totalExpensesLabel'),t('netIncome')], monthlyPL.map(m => [m.month, String(m.income), String(m.expense), String(m.income-m.expense)])); };
  const exportIncomes = () => { exportToCsv('incomes.csv', [t('date'),t('tenantName'),t('unitNumber'),t('property'),t('statement'),t('category'),t('paymentMethod'),t('amount')], incomes.map(r => [r.date,r.tenantName,r.unitNumber,lang==='ar'?r.buildingNameAr:r.buildingName,r.statement,r.category,r.method,String(r.amount)])); };
  const exportExpenses = () => { exportToCsv('expenses.csv', [t('date'),t('category'),t('statement'),t('property'),t('unitNumber'),t('amount')], expenses.map(r => [r.date,r.category,r.statement,lang==='ar'?r.buildingNameAr:r.buildingName,r.unitNumber,String(r.amount)])); };

  return (
    <PageLayout>
      <Tabs defaultValue="profitloss" className="w-full">
        <TabsList className="bg-muted mb-4">
          <TabsTrigger value="profitloss">{t('profitLoss')}</TabsTrigger>
          <TabsTrigger value="occupancy">{t('occupancyReport')}</TabsTrigger>
          <TabsTrigger value="export">{t('exportCsv')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profitloss">
          <div className="bg-card rounded-lg border border-border p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />{t('monthlyPL')}</h3>
              <Button variant="outline" size="sm" onClick={exportMonthlyPL} className="gap-2"><Download className="h-4 w-4" />{t('exportCsv')}</Button>
            </div>
            {monthlyPL.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyPL}><XAxis dataKey="month" tick={{fontSize:12}} /><YAxis tick={{fontSize:12}} /><Tooltip />
                  <Bar dataKey="income" fill="hsl(142,60%,45%)" name={t('grossIncome')} radius={[4,4,0,0]} />
                  <Bar dataKey="expense" fill="hsl(0,72%,51%)" name={t('totalExpensesLabel')} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground py-8">{t('noRecordsFound')}</p>}
          </div>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader><TableRow><TableHead>{t('date')}</TableHead><TableHead className="text-end">{t('grossIncome')}</TableHead><TableHead className="text-end">{t('totalExpensesLabel')}</TableHead><TableHead className="text-end">{t('netIncome')}</TableHead></TableRow></TableHeader>
              <TableBody>
                {monthlyPL.map(m => (
                  <TableRow key={m.month}><TableCell>{m.month}</TableCell>
                    <TableCell className="text-end font-bold text-status-available">{m.income.toLocaleString('en',{minimumFractionDigits:3,maximumFractionDigits:3})} OMR</TableCell>
                    <TableCell className="text-end font-bold text-status-occupied">{m.expense.toLocaleString('en',{minimumFractionDigits:3,maximumFractionDigits:3})} OMR</TableCell>
                    <TableCell className={`text-end font-bold ${m.income-m.expense>=0?'text-status-available':'text-status-occupied'}`}>{(m.income-m.expense).toLocaleString('en',{minimumFractionDigits:3,maximumFractionDigits:3})} OMR</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-bold"><TableCell>{t('total')}</TableCell>
                  <TableCell className="text-end text-status-available">{totalRevenue.toLocaleString('en',{minimumFractionDigits:3,maximumFractionDigits:3})} OMR</TableCell>
                  <TableCell className="text-end text-status-occupied">{totalExpenses.toLocaleString('en',{minimumFractionDigits:3,maximumFractionDigits:3})} OMR</TableCell>
                  <TableCell className={`text-end ${totalRevenue-totalExpenses>=0?'text-status-available':'text-status-occupied'}`}>{(totalRevenue-totalExpenses).toLocaleString('en',{minimumFractionDigits:3,maximumFractionDigits:3})} OMR</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="occupancy">
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">{t('occupancyReport')}</h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart><Pie data={occupancyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label={({name,percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                {occupancyData.map((_,i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie><Tooltip /><Legend /></PieChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="export">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card rounded-lg border border-border p-6 text-center">
              <h4 className="font-semibold text-foreground mb-2">{t('incomes')}</h4>
              <p className="text-sm text-muted-foreground mb-4">{incomes.length} {lang === 'ar' ? 'سجل' : 'records'}</p>
              <Button onClick={exportIncomes} className="gap-2 bg-status-available hover:bg-status-available/90 text-status-available-foreground"><Download className="h-4 w-4" />{t('exportCsv')}</Button>
            </div>
            <div className="bg-card rounded-lg border border-border p-6 text-center">
              <h4 className="font-semibold text-foreground mb-2">{t('expenses')}</h4>
              <p className="text-sm text-muted-foreground mb-4">{expenses.length} {lang === 'ar' ? 'سجل' : 'records'}</p>
              <Button onClick={exportExpenses} className="gap-2 bg-status-occupied hover:bg-status-occupied/90 text-status-occupied-foreground"><Download className="h-4 w-4" />{t('exportCsv')}</Button>
            </div>
            <div className="bg-card rounded-lg border border-border p-6 text-center">
              <h4 className="font-semibold text-foreground mb-2">{t('profitLoss')}</h4>
              <p className="text-sm text-muted-foreground mb-4">{monthlyPL.length} {lang === 'ar' ? 'شهر' : 'months'}</p>
              <Button onClick={exportMonthlyPL} className="gap-2"><Download className="h-4 w-4" />{t('exportCsv')}</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default Reports;
