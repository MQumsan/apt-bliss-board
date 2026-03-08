import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Printer, Plus, Languages } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useI18n } from '@/lib/i18n';
import { useFinance, useTenants, IncomeRecord, ExpenseRecord, PaymentMethod, IncomeCategory, ExpenseCategory } from '@/lib/store';
import { buildings } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

function printReceipt(record: IncomeRecord, lang: 'en' | 'ar') {
  const isAr = lang === 'ar';
  const w = window.open('', '_blank', 'width=600,height=700');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html dir="${isAr ? 'rtl' : 'ltr'}" lang="${lang}">
<head><meta charset="utf-8"><title>${isAr ? 'إيصال دفع' : 'Payment Receipt'}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; color: #1a1a2e; }
  .header { text-align: center; border-bottom: 3px solid #1a56db; padding-bottom: 20px; margin-bottom: 30px; }
  .header h1 { font-size: 22px; color: #1a56db; }
  .header p { color: #666; font-size: 13px; margin-top: 4px; }
  .receipt-no { background: #f0f4ff; padding: 8px 16px; border-radius: 6px; display: inline-block; margin-top: 12px; font-weight: 600; color: #1a56db; }
  .details { width: 100%; border-collapse: collapse; margin: 20px 0; }
  .details td { padding: 10px 14px; border-bottom: 1px solid #e5e7eb; }
  .details td:first-child { font-weight: 600; width: 40%; color: #374151; background: #f9fafb; }
  .amount-row td { font-size: 18px; font-weight: 700; color: #059669; }
  .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #9ca3af; font-size: 12px; }
  @media print { body { padding: 20px; } }
</style></head><body>
  <div class="header">
    <h1>${isAr ? 'المشرق PMS' : 'Al-Mashreq PMS'}</h1>
    <p>${isAr ? 'نظام إدارة العقارات' : 'Property Management System'}</p>
    <div class="receipt-no">${isAr ? 'رقم الإيصال' : 'Receipt No'}: ${record.id.toUpperCase()}</div>
  </div>
  <table class="details">
    <tr><td>${isAr ? 'التاريخ' : 'Date'}</td><td>${record.date}</td></tr>
    <tr><td>${isAr ? 'المستأجر' : 'Tenant'}</td><td>${record.tenantName}</td></tr>
    <tr><td>${isAr ? 'الوحدة' : 'Unit'}</td><td>${record.unitNumber} — ${isAr ? record.buildingNameAr : record.buildingName}</td></tr>
    <tr><td>${isAr ? 'طريقة الدفع' : 'Payment Method'}</td><td>${record.method}</td></tr>
    <tr><td>${isAr ? 'الفئة' : 'Category'}</td><td>${record.category}</td></tr>
    <tr><td>${isAr ? 'البيان' : 'Statement'}</td><td>${record.statement}</td></tr>
    <tr class="amount-row"><td>${isAr ? 'المبلغ' : 'Amount'}</td><td>${record.amount.toLocaleString()} AED</td></tr>
  </table>
  <div class="footer"><p>${isAr ? 'شكراً لكم' : 'Thank you for your payment'}</p></div>
</body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 300);
}

const Financials = () => {
  const { t, toggleLang, lang } = useI18n();
  const { incomes, expenses, addIncome, addExpense, totalRevenue, totalExpenses } = useFinance();
  const { tenants } = useTenants();
  const [addIncomeOpen, setAddIncomeOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);

  // Income form
  const [incForm, setIncForm] = useState({ date: '', tenantId: '', amount: '', method: '' as string, category: '' as string, statement: '' });
  // Expense form
  const [expForm, setExpForm] = useState({ date: '', category: '' as string, amount: '', buildingId: '', unitNumber: '', statement: '' });

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incForm.date || !incForm.tenantId || !incForm.amount || !incForm.method || !incForm.category || !incForm.statement.trim()) {
      toast({ title: t('fillRequired'), variant: 'destructive' });
      return;
    }
    const tenant = tenants.find(t => t.id === incForm.tenantId);
    if (!tenant) return;
    addIncome({
      date: incForm.date,
      tenantId: tenant.id,
      tenantName: tenant.fullName,
      unitNumber: tenant.unitNumber,
      buildingName: tenant.buildingName,
      buildingNameAr: tenant.buildingNameAr,
      amount: Number(incForm.amount),
      method: incForm.method as PaymentMethod,
      category: incForm.category as IncomeCategory,
      statement: incForm.statement.trim(),
    });
    toast({ title: t('incomeAdded') });
    setIncForm({ date: '', tenantId: '', amount: '', method: '', category: '', statement: '' });
    setAddIncomeOpen(false);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expForm.date || !expForm.category || !expForm.amount || !expForm.statement.trim()) {
      toast({ title: t('fillRequired'), variant: 'destructive' });
      return;
    }
    const building = buildings.find(b => b.id === expForm.buildingId);
    addExpense({
      date: expForm.date,
      category: expForm.category as ExpenseCategory,
      amount: Number(expForm.amount),
      buildingName: building?.name || '',
      buildingNameAr: building?.nameAr || '',
      unitNumber: expForm.unitNumber,
      statement: expForm.statement.trim(),
    });
    toast({ title: t('expenseAdded') });
    setExpForm({ date: '', category: '', amount: '', buildingId: '', unitNumber: '', statement: '' });
    setAddExpenseOpen(false);
  };

  const methodLabel = (m: string) => t(m as 'cash' | 'cheque' | 'transfer');
  const categoryLabel = (c: string) => t(c as 'rent' | 'deposit' | 'maintenance' | 'utilities' | 'commission' | 'other');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h2 className="text-lg font-semibold text-foreground">{t('financials')}</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleLang} className="gap-2">
              <Languages className="h-4 w-4" />
              {t('language')}
            </Button>
          </header>
          <main className="flex-1 p-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-card rounded-lg border border-border p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-status-available bg-status-available/10">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{totalRevenue.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">AED</span></p>
                  <p className="text-xs text-muted-foreground">{t('totalRevenue')}</p>
                </div>
              </div>
              <div className="bg-card rounded-lg border border-border p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-status-occupied bg-status-occupied/10">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{totalExpenses.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">AED</span></p>
                  <p className="text-xs text-muted-foreground">{t('totalExpensesLabel')}</p>
                </div>
              </div>
              <div className="bg-card rounded-lg border border-border p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-primary bg-primary/10">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{(totalRevenue - totalExpenses).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">AED</span></p>
                  <p className="text-xs text-muted-foreground">{t('netIncome')}</p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="incomes" className="w-full">
              <TabsList className="bg-muted mb-4">
                <TabsTrigger value="incomes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t('incomes')}</TabsTrigger>
                <TabsTrigger value="expenses" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t('expenses')}</TabsTrigger>
              </TabsList>

              {/* INCOMES TAB */}
              <TabsContent value="incomes">
                <div className="flex justify-end mb-4">
                  <Button onClick={() => setAddIncomeOpen(true)} className="gap-2"><Plus className="h-4 w-4" />{t('addIncome')}</Button>
                </div>
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>{t('date')}</TableHead>
                        <TableHead>{t('tenantName')}</TableHead>
                        <TableHead>{t('unitNumber')}/{t('building')}</TableHead>
                        <TableHead>{t('amount')}</TableHead>
                        <TableHead>{t('paymentMethod')}</TableHead>
                        <TableHead>{t('category')}</TableHead>
                        <TableHead>{t('statement')}</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomes.length === 0 ? (
                        <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">{t('noRecordsFound')}</TableCell></TableRow>
                      ) : incomes.map(rec => (
                        <TableRow key={rec.id}>
                          <TableCell>{rec.date}</TableCell>
                          <TableCell className="font-medium">{rec.tenantName}</TableCell>
                          <TableCell>{rec.unitNumber} — {lang === 'ar' ? rec.buildingNameAr : rec.buildingName}</TableCell>
                          <TableCell className="font-semibold text-status-available">{rec.amount.toLocaleString()} AED</TableCell>
                          <TableCell><Badge variant="outline">{methodLabel(rec.method)}</Badge></TableCell>
                          <TableCell><Badge variant="secondary">{categoryLabel(rec.category)}</Badge></TableCell>
                          <TableCell className="max-w-[200px] truncate" title={rec.statement}>{rec.statement}</TableCell>
                          <TableCell>
                            <button onClick={() => printReceipt(rec, lang)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors" title={t('printReceipt')}>
                              <Printer className="h-4 w-4" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* EXPENSES TAB */}
              <TabsContent value="expenses">
                <div className="flex justify-end mb-4">
                  <Button onClick={() => setAddExpenseOpen(true)} className="gap-2"><Plus className="h-4 w-4" />{t('addExpense')}</Button>
                </div>
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>{t('date')}</TableHead>
                        <TableHead>{t('category')}</TableHead>
                        <TableHead>{t('amount')}</TableHead>
                        <TableHead>{t('property')}</TableHead>
                        <TableHead>{t('unitNumber')}</TableHead>
                        <TableHead>{t('statement')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t('noRecordsFound')}</TableCell></TableRow>
                      ) : expenses.map(rec => (
                        <TableRow key={rec.id}>
                          <TableCell>{rec.date}</TableCell>
                          <TableCell><Badge variant="secondary">{categoryLabel(rec.category)}</Badge></TableCell>
                          <TableCell className="font-semibold text-status-occupied">{rec.amount.toLocaleString()} AED</TableCell>
                          <TableCell>{lang === 'ar' ? rec.buildingNameAr : rec.buildingName}</TableCell>
                          <TableCell>{rec.unitNumber}</TableCell>
                          <TableCell className="max-w-[250px]" title={rec.statement}>{rec.statement}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Add Income Dialog */}
      <Dialog open={addIncomeOpen} onOpenChange={setAddIncomeOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{t('addIncome')}</DialogTitle></DialogHeader>
          <form onSubmit={handleAddIncome} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{t('date')} *</Label>
                <Input type="date" value={incForm.date} onChange={e => setIncForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('tenantName')} *</Label>
                <Select value={incForm.tenantId} onValueChange={v => setIncForm(p => ({ ...p, tenantId: v }))}>
                  <SelectTrigger><SelectValue placeholder={t('selectTenant')} /></SelectTrigger>
                  <SelectContent>
                    {tenants.filter(t => t.active).map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.fullName} ({t.unitNumber})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t('amount')} (AED) *</Label>
                <Input type="number" min="0" value={incForm.amount} onChange={e => setIncForm(p => ({ ...p, amount: e.target.value }))} dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>{t('paymentMethod')} *</Label>
                <Select value={incForm.method} onValueChange={v => setIncForm(p => ({ ...p, method: v }))}>
                  <SelectTrigger><SelectValue placeholder={t('selectMethod')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">{t('cash')}</SelectItem>
                    <SelectItem value="cheque">{t('cheque')}</SelectItem>
                    <SelectItem value="transfer">{t('transfer')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t('category')} *</Label>
                <Select value={incForm.category} onValueChange={v => setIncForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue placeholder={t('selectCategory')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">{t('rent')}</SelectItem>
                    <SelectItem value="deposit">{t('deposit')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t('statement')} *</Label>
                <Input value={incForm.statement} onChange={e => setIncForm(p => ({ ...p, statement: e.target.value }))} maxLength={200} placeholder={t('statement')} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setAddIncomeOpen(false)}>{t('cancel')}</Button>
              <Button type="submit">{t('addIncome')}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={addExpenseOpen} onOpenChange={setAddExpenseOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{t('addExpense')}</DialogTitle></DialogHeader>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{t('date')} *</Label>
                <Input type="date" value={expForm.date} onChange={e => setExpForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('category')} *</Label>
                <Select value={expForm.category} onValueChange={v => setExpForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue placeholder={t('selectCategory')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">{t('maintenance')}</SelectItem>
                    <SelectItem value="utilities">{t('utilities')}</SelectItem>
                    <SelectItem value="commission">{t('commission')}</SelectItem>
                    <SelectItem value="other">{t('other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t('amount')} (AED) *</Label>
                <Input type="number" min="0" value={expForm.amount} onChange={e => setExpForm(p => ({ ...p, amount: e.target.value }))} dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>{t('property')}</Label>
                <Select value={expForm.buildingId} onValueChange={v => setExpForm(p => ({ ...p, buildingId: v }))}>
                  <SelectTrigger><SelectValue placeholder={t('selectBuilding')} /></SelectTrigger>
                  <SelectContent>
                    {buildings.map(b => (
                      <SelectItem key={b.id} value={b.id}>{lang === 'ar' ? b.nameAr : b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t('unitNumber')}</Label>
                <Input value={expForm.unitNumber} onChange={e => setExpForm(p => ({ ...p, unitNumber: e.target.value }))} maxLength={10} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t('statement')} *</Label>
                <Input value={expForm.statement} onChange={e => setExpForm(p => ({ ...p, statement: e.target.value }))} maxLength={200} placeholder={t('statement')} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setAddExpenseOpen(false)}>{t('cancel')}</Button>
              <Button type="submit">{t('addExpense')}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Financials;
