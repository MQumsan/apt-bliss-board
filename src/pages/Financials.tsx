import { useState, useMemo, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Printer, Plus, Percent, BarChart3, Download, Pen, Trash2, Share2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { exportToCsv } from '@/lib/exportCsv';
import { formatCurrency, CURRENCY } from '@/lib/currency';
import { PageLayout } from '@/components/PageLayout';
import { useI18n } from '@/lib/i18n';
import { useFinance, useTenants, IncomeRecord, ExpenseRecord, PaymentMethod, IncomeCategory, ExpenseCategory } from '@/lib/store';
import { buildings } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { printReceipt, shareReceiptWhatsApp, printExpenseVoucher, shareExpenseWhatsApp } from '@/lib/receiptPdf';

const Financials = () => {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';
  const { incomes, expenses, addIncome, addExpense, editIncome, deleteIncome, editExpense, deleteExpense, totalRevenue, totalExpenses } = useFinance();
  const { tenants } = useTenants();
  const [addIncomeOpen, setAddIncomeOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'income' | 'expense'>('income');
  const [selectedId, setSelectedId] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('addExpense') === '1') setAddExpenseOpen(true);
    if (searchParams.get('addIncome') === '1') setAddIncomeOpen(true);
  }, [searchParams]);

  const [incForm, setIncForm] = useState({ date: '', tenantId: '', amount: '', method: '', category: '', statement: '' });
  const [expForm, setExpForm] = useState({ date: '', category: '', amount: '', buildingId: '', unitNumber: '', statement: '' });

  const plData = useMemo(() => {
    const incByCat: Record<string, number> = {};
    incomes.forEach(r => { incByCat[r.category] = (incByCat[r.category] || 0) + r.amount; });
    const expByCat: Record<string, number> = {};
    expenses.forEach(r => { expByCat[r.category] = (expByCat[r.category] || 0) + r.amount; });
    const net = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? Math.round((net / totalRevenue) * 100) : 0;
    return { incByCat, expByCat, net, margin };
  }, [incomes, expenses, totalRevenue, totalExpenses]);

  const expBuildingUnits = useMemo(() => {
    if (!expForm.buildingId) return [];
    const b = buildings.find(b => b.id === expForm.buildingId);
    return b?.units || [];
  }, [expForm.buildingId]);

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incForm.date || !incForm.tenantId || !incForm.amount || !incForm.method || !incForm.category || !incForm.statement.trim()) {
      toast({ title: t('fillRequired'), variant: 'destructive' }); return;
    }
    const tenant = tenants.find(tn => tn.id === incForm.tenantId);
    if (!tenant) return;
    addIncome({ date: incForm.date, tenantId: tenant.id, tenantName: tenant.fullName, unitNumber: tenant.unitNumber, buildingName: tenant.buildingName, buildingNameAr: tenant.buildingNameAr, amount: Number(incForm.amount), method: incForm.method as PaymentMethod, category: incForm.category as IncomeCategory, statement: incForm.statement.trim() });
    toast({ title: t('incomeAdded') });
    setIncForm({ date: '', tenantId: '', amount: '', method: '', category: '', statement: '' });
    setAddIncomeOpen(false);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expForm.date || !expForm.category || !expForm.amount || !expForm.statement.trim() || !expForm.buildingId || !expForm.unitNumber) {
      toast({ title: !expForm.buildingId || !expForm.unitNumber ? t('propertyRequired') : t('fillRequired'), variant: 'destructive' }); return;
    }
    const building = buildings.find(b => b.id === expForm.buildingId);
    addExpense({ date: expForm.date, category: expForm.category as ExpenseCategory, amount: Number(expForm.amount), buildingName: building?.name || '', buildingNameAr: building?.nameAr || '', unitNumber: expForm.unitNumber, statement: expForm.statement.trim() });
    toast({ title: t('expenseAdded') });
    setExpForm({ date: '', category: '', amount: '', buildingId: '', unitNumber: '', statement: '' });
    setAddExpenseOpen(false);
  };

  const confirmDeleteIncome = (id: string) => { setSelectedId(id); setDeleteType('income'); setDeleteOpen(true); };
  const confirmDeleteExpense = (id: string) => { setSelectedId(id); setDeleteType('expense'); setDeleteOpen(true); };
  const handleDelete = () => {
    if (deleteType === 'income') { deleteIncome(selectedId); toast({ title: isAr ? 'تم حذف الإيراد' : 'Income deleted' }); }
    else { deleteExpense(selectedId); toast({ title: isAr ? 'تم حذف المصروف' : 'Expense deleted' }); }
    setDeleteOpen(false);
  };

  const methodLabel = (m: string) => t(m as 'cash' | 'cheque' | 'transfer');
  const categoryLabel = (c: string) => t(c as 'rent' | 'deposit' | 'maintenance' | 'utilities' | 'commission' | 'other');

  return (
    <PageLayout>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border-2 border-status-available/30 p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-status-available/15 text-status-available"><TrendingUp className="w-5 h-5" /></div>
          <div><p className="text-2xl font-bold text-status-available">{formatCurrency(totalRevenue, lang)}</p><p className="text-xs text-muted-foreground font-medium">{t('grossIncome')}</p></div>
        </div>
        <div className="bg-card rounded-lg border-2 border-status-occupied/30 p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-status-occupied/15 text-status-occupied"><TrendingDown className="w-5 h-5" /></div>
          <div><p className="text-2xl font-bold text-status-occupied">{formatCurrency(totalExpenses, lang)}</p><p className="text-xs text-muted-foreground font-medium">{t('totalExpensesLabel')}</p></div>
        </div>
        <div className="bg-card rounded-lg border-2 border-primary/30 p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center text-primary"><DollarSign className="w-5 h-5" /></div>
          <div><p className={`text-2xl font-bold ${plData.net >= 0 ? 'text-status-available' : 'text-status-occupied'}`}>{formatCurrency(plData.net, lang)}</p><p className="text-xs text-muted-foreground font-medium">{t('netIncome')}</p></div>
        </div>
        <div className="bg-card rounded-lg border-2 border-primary/30 p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center text-primary"><Percent className="w-5 h-5" /></div>
          <div><p className={`text-2xl font-bold ${plData.margin >= 0 ? 'text-status-available' : 'text-status-occupied'}`}>{plData.margin}%</p><p className="text-xs text-muted-foreground font-medium">{t('profitMargin')}</p></div>
        </div>
      </div>

      <Tabs defaultValue="incomes" className="w-full">
        <TabsList className="bg-muted mb-4 h-auto flex-wrap gap-1 p-1">
          <TabsTrigger value="incomes" className="data-[state=active]:bg-status-available data-[state=active]:text-status-available-foreground gap-1.5"><TrendingUp className="h-3.5 w-3.5" />{t('incomes')}</TabsTrigger>
          <TabsTrigger value="expenses" className="data-[state=active]:bg-status-occupied data-[state=active]:text-status-occupied-foreground gap-1.5"><TrendingDown className="h-3.5 w-3.5" />{t('expenses')}</TabsTrigger>
          <TabsTrigger value="profitloss" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5"><BarChart3 className="h-3.5 w-3.5" />{t('profitLoss')}</TabsTrigger>
        </TabsList>

        {/* INCOMES TAB */}
        <TabsContent value="incomes">
          <div className="flex justify-end gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={() => {
              const headers = [t('date'), t('tenantName'), t('unitNumber') + '/' + t('property'), t('statement'), t('category'), t('paymentMethod'), t('amount')];
              const rows = incomes.map(r => [r.date, r.tenantName, `${r.unitNumber} - ${lang === 'ar' ? r.buildingNameAr : r.buildingName}`, r.statement, categoryLabel(r.category), methodLabel(r.method), String(r.amount)]);
              exportToCsv('incomes.csv', headers, rows);
            }} className="gap-1.5"><Download className="h-4 w-4" />{t('exportCsv')}</Button>
            <Button onClick={() => setAddIncomeOpen(true)} className="gap-2 bg-status-available hover:bg-status-available/90 text-status-available-foreground"><Plus className="h-4 w-4" />{t('addIncome')}</Button>
          </div>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-status-available/5">
                  <TableHead>{t('date')}</TableHead><TableHead>{t('tenantName')}</TableHead><TableHead>{t('unitNumber')} / {t('property')}</TableHead>
                  <TableHead>{t('statement')}</TableHead><TableHead>{t('category')}</TableHead><TableHead>{t('paymentMethod')}</TableHead>
                  <TableHead className="text-end">{t('amount')}</TableHead><TableHead className="w-32">{isAr ? 'إجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">{t('noRecordsFound')}</TableCell></TableRow>
                ) : incomes.map(rec => (
                  <TableRow key={rec.id} className="hover:bg-status-available/5">
                    <TableCell className="whitespace-nowrap">{rec.date}</TableCell>
                    <TableCell className="font-medium">{rec.tenantName}</TableCell>
                    <TableCell className="whitespace-nowrap">{rec.unitNumber} — {lang === 'ar' ? rec.buildingNameAr : rec.buildingName}</TableCell>
                    <TableCell><p className="text-sm max-w-[200px]">{rec.statement}</p></TableCell>
                    <TableCell><Badge variant="secondary" className="bg-status-available/10 text-status-available border-status-available/20">{categoryLabel(rec.category)}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{methodLabel(rec.method)}</Badge></TableCell>
                    <TableCell className="text-end font-bold text-status-available whitespace-nowrap">{formatCurrency(rec.amount, lang)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button onClick={() => printReceipt(rec, lang)} className="p-1.5 rounded hover:bg-status-available/10 text-status-available" title={t('generateReceipt')}><Printer className="h-4 w-4" /></button>
                        <button onClick={() => shareReceiptWhatsApp(rec, lang)} className="p-1.5 rounded hover:bg-status-available/10 text-muted-foreground hover:text-status-available" title="WhatsApp"><Share2 className="h-4 w-4" /></button>
                        <button onClick={() => confirmDeleteIncome(rec.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* EXPENSES TAB */}
        <TabsContent value="expenses">
          <div className="flex justify-end gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={() => {
              const headers = [t('date'), t('category'), t('statement'), t('property'), t('unitNumber'), t('amount')];
              const rows = expenses.map(r => [r.date, categoryLabel(r.category), r.statement, lang === 'ar' ? r.buildingNameAr : r.buildingName, r.unitNumber, String(r.amount)]);
              exportToCsv('expenses.csv', headers, rows);
            }} className="gap-1.5"><Download className="h-4 w-4" />{t('exportCsv')}</Button>
            <Button onClick={() => setAddExpenseOpen(true)} className="gap-2 bg-status-occupied hover:bg-status-occupied/90 text-status-occupied-foreground"><Plus className="h-4 w-4" />{t('addExpense')}</Button>
          </div>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-status-occupied/5">
                  <TableHead>{t('date')}</TableHead><TableHead>{t('category')}</TableHead><TableHead>{t('statement')}</TableHead>
                  <TableHead>{t('property')}</TableHead><TableHead>{t('unitNumber')}</TableHead>
                  <TableHead className="text-end">{t('amount')}</TableHead><TableHead className="w-32">{isAr ? 'إجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t('noRecordsFound')}</TableCell></TableRow>
                ) : expenses.map(rec => (
                  <TableRow key={rec.id} className="hover:bg-status-occupied/5">
                    <TableCell className="whitespace-nowrap">{rec.date}</TableCell>
                    <TableCell><Badge variant="secondary" className="bg-status-occupied/10 text-status-occupied border-status-occupied/10">{categoryLabel(rec.category)}</Badge></TableCell>
                    <TableCell><p className="text-sm max-w-[200px]">{rec.statement}</p></TableCell>
                    <TableCell>{lang === 'ar' ? rec.buildingNameAr : rec.buildingName}</TableCell>
                    <TableCell>{rec.unitNumber}</TableCell>
                    <TableCell className="text-end font-bold text-status-occupied whitespace-nowrap">{formatCurrency(rec.amount, lang)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button onClick={() => printExpenseVoucher(rec, lang)} className="p-1.5 rounded hover:bg-status-occupied/10 text-status-occupied" title={isAr ? 'سند صرف' : 'Voucher'}><Printer className="h-4 w-4" /></button>
                        <button onClick={() => shareExpenseWhatsApp(rec, lang)} className="p-1.5 rounded hover:bg-status-occupied/10 text-muted-foreground hover:text-status-occupied" title="WhatsApp"><Share2 className="h-4 w-4" /></button>
                        <button onClick={() => confirmDeleteExpense(rec.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* PROFIT & LOSS TAB */}
        <TabsContent value="profitloss">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4"><TrendingUp className="h-4 w-4 text-status-available" />{t('incomeByCategory')}</h3>
              <div className="space-y-3">
                {Object.entries(plData.incByCat).map(([cat, amount]) => (
                  <div key={cat} className="flex items-center justify-between p-3 rounded-lg bg-status-available/5 border border-status-available/10">
                    <span className="text-sm font-medium text-foreground">{categoryLabel(cat)}</span>
                    <span className="text-sm font-bold text-status-available">{formatCurrency(amount, lang)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 rounded-lg bg-status-available/15 border border-status-available/30 mt-2">
                  <span className="text-sm font-bold text-foreground">{t('grossIncome')}</span>
                  <span className="text-lg font-bold text-status-available">{formatCurrency(totalRevenue, lang)}</span>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4"><TrendingDown className="h-4 w-4 text-status-occupied" />{t('expenseByCategory')}</h3>
              <div className="space-y-3">
                {Object.entries(plData.expByCat).map(([cat, amount]) => (
                  <div key={cat} className="flex items-center justify-between p-3 rounded-lg bg-status-occupied/5 border border-status-occupied/10">
                    <span className="text-sm font-medium text-foreground">{categoryLabel(cat)}</span>
                    <span className="text-sm font-bold text-status-occupied">{formatCurrency(amount, lang)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 rounded-lg bg-status-occupied/15 border border-status-occupied/30 mt-2">
                  <span className="text-sm font-bold text-foreground">{t('totalExpensesLabel')}</span>
                  <span className="text-lg font-bold text-status-occupied">{formatCurrency(totalExpenses, lang)}</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 bg-card rounded-lg border-2 border-primary/20 p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center"><DollarSign className="w-7 h-7 text-primary" /></div>
                  <div><p className="text-sm font-medium text-muted-foreground">{t('netIncome')}</p><p className={`text-3xl font-bold ${plData.net >= 0 ? 'text-status-available' : 'text-status-occupied'}`}>{formatCurrency(plData.net, lang)}</p></div>
                </div>
                <div className="text-center sm:text-end"><p className="text-sm font-medium text-muted-foreground">{t('profitMargin')}</p><p className={`text-3xl font-bold ${plData.margin >= 0 ? 'text-status-available' : 'text-status-occupied'}`}>{plData.margin}%</p></div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Income Dialog */}
      <Dialog open={addIncomeOpen} onOpenChange={setAddIncomeOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-status-available" />{t('addIncome')}</DialogTitle></DialogHeader>
          <form onSubmit={handleAddIncome} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>{t('date')} *</Label><Input type="date" value={incForm.date} onChange={e => setIncForm(p => ({ ...p, date: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>{t('tenantName')} *</Label>
                <Select value={incForm.tenantId} onValueChange={v => setIncForm(p => ({ ...p, tenantId: v }))}><SelectTrigger><SelectValue placeholder={t('selectTenant')} /></SelectTrigger>
                  <SelectContent>{tenants.filter(tn => tn.active).map(tn => (<SelectItem key={tn.id} value={tn.id}>{tn.fullName} ({tn.unitNumber})</SelectItem>))}</SelectContent></Select>
              </div>
              <div className="space-y-1.5"><Label>{t('amount')} ({CURRENCY}) *</Label><Input type="number" min="0" value={incForm.amount} onChange={e => setIncForm(p => ({ ...p, amount: e.target.value }))} dir="ltr" /></div>
              <div className="space-y-1.5"><Label>{t('paymentMethod')} *</Label>
                <Select value={incForm.method} onValueChange={v => setIncForm(p => ({ ...p, method: v }))}><SelectTrigger><SelectValue placeholder={t('selectMethod')} /></SelectTrigger>
                  <SelectContent><SelectItem value="cash">{t('cash')}</SelectItem><SelectItem value="cheque">{t('cheque')}</SelectItem><SelectItem value="transfer">{t('transfer')}</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2"><Label>{t('category')} *</Label>
                <Select value={incForm.category} onValueChange={v => setIncForm(p => ({ ...p, category: v }))}><SelectTrigger><SelectValue placeholder={t('selectCategory')} /></SelectTrigger>
                  <SelectContent><SelectItem value="rent">{t('rent')}</SelectItem><SelectItem value="deposit">{t('deposit')}</SelectItem></SelectContent></Select>
              </div>
            </div>
            <div className="space-y-1.5 border-t border-border pt-4">
              <Label>{t('statement')} *</Label>
              <Textarea value={incForm.statement} onChange={e => setIncForm(p => ({ ...p, statement: e.target.value }))} maxLength={300} rows={3} placeholder={isAr ? 'مثال: دفعة إيجار شهر مارس - وحدة 101' : 'e.g., March rent payment - Unit 101'} className="resize-none" />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setAddIncomeOpen(false)}>{t('cancel')}</Button>
              <Button type="submit" className="bg-status-available hover:bg-status-available/90 text-status-available-foreground">{t('addIncome')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={addExpenseOpen} onOpenChange={setAddExpenseOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><TrendingDown className="h-5 w-5 text-status-occupied" />{t('addExpense')}</DialogTitle></DialogHeader>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>{t('date')} *</Label><Input type="date" value={expForm.date} onChange={e => setExpForm(p => ({ ...p, date: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>{t('category')} *</Label>
                <Select value={expForm.category} onValueChange={v => setExpForm(p => ({ ...p, category: v }))}><SelectTrigger><SelectValue placeholder={t('selectCategory')} /></SelectTrigger>
                  <SelectContent><SelectItem value="maintenance">{t('maintenance')}</SelectItem><SelectItem value="utilities">{t('utilities')}</SelectItem><SelectItem value="commission">{t('commission')}</SelectItem><SelectItem value="other">{t('other')}</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-1.5"><Label>{t('amount')} ({CURRENCY}) *</Label><Input type="number" min="0" value={expForm.amount} onChange={e => setExpForm(p => ({ ...p, amount: e.target.value }))} dir="ltr" /></div>
              <div className="space-y-1.5"><Label>{t('property')} *</Label>
                <Select value={expForm.buildingId} onValueChange={v => setExpForm(p => ({...p, buildingId: v, unitNumber: ''}))}><SelectTrigger><SelectValue placeholder={t('selectProperty')} /></SelectTrigger>
                  <SelectContent>{buildings.map(b => <SelectItem key={b.id} value={b.id}>{isAr ? b.nameAr : b.name}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2"><Label>{t('unitNumber')} *</Label>
                <Select value={expForm.unitNumber} onValueChange={v => setExpForm(p => ({...p, unitNumber: v}))}><SelectTrigger><SelectValue placeholder={t('selectUnit')} /></SelectTrigger>
                  <SelectContent>{expBuildingUnits.map(u => <SelectItem key={u.id} value={u.unitNumber}>{t('unitNumber')} {u.unitNumber}</SelectItem>)}</SelectContent></Select>
              </div>
            </div>
            <div className="space-y-1.5 border-t border-border pt-4">
              <Label>{t('statement')} *</Label>
              <Textarea value={expForm.statement} onChange={e => setExpForm(p => ({ ...p, statement: e.target.value }))} maxLength={300} rows={3} placeholder={isAr ? 'وصف المصروف...' : 'Expense description...'} className="resize-none" />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setAddExpenseOpen(false)}>{t('cancel')}</Button>
              <Button type="submit" className="bg-status-occupied hover:bg-status-occupied/90 text-status-occupied-foreground">{t('addExpense')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={handleDelete} />
    </PageLayout>
  );
};

export default Financials;
