import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useBuildings, useFinance } from '@/lib/store';
import { useMaintenance } from '@/lib/maintenanceStore';
import { useContracts } from '@/lib/contractStore';
import { useCheques } from '@/lib/chequeStore';
import { useI18n } from '@/lib/i18n';
import { formatCurrency } from '@/lib/currency';
import { DollarSign, FileText, AlertTriangle, TrendingUp } from 'lucide-react';

export function DashboardCharts() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';
  const { buildings } = useBuildings();
  const { incomes, totalRevenue } = useFinance();
  const { records: maintenanceRecords } = useMaintenance();
  const { contracts } = useContracts();
  const { getOverduePendingCheques } = useCheques();

  const overdueCheques = getOverduePendingCheques();
  const activeContracts = contracts.filter(c => new Date(c.endDate).getTime() > Date.now());

  // Revenue per building
  const revenueData = useMemo(() => {
    const map: Record<string, { name: string; revenue: number }> = {};
    buildings.forEach(b => {
      map[b.id] = { name: isAr ? b.nameAr : b.name, revenue: 0 };
    });
    incomes.forEach(inc => {
      const building = buildings.find(b =>
        b.name === inc.buildingName || b.nameAr === inc.buildingNameAr
      );
      if (building && map[building.id]) {
        map[building.id].revenue += inc.amount;
      }
    });
    return Object.values(map).filter(d => d.revenue > 0);
  }, [buildings, incomes, isAr]);

  // Maintenance pie chart
  const maintenancePieData = useMemo(() => {
    const pending = maintenanceRecords.filter(r => r.status === 'pending').length;
    const completed = maintenanceRecords.filter(r => r.status === 'completed').length;
    const totalUnits = buildings.reduce((s, b) => s + b.units.length, 0);
    const healthy = Math.max(0, totalUnits - pending);
    return [
      { name: isAr ? 'سليم' : 'Healthy', value: healthy, color: 'hsl(142, 60%, 45%)' },
      { name: isAr ? 'قيد الصيانة' : 'Issues', value: pending, color: 'hsl(25, 90%, 52%)' },
      { name: isAr ? 'مكتمل' : 'Resolved', value: completed, color: 'hsl(215, 70%, 45%)' },
    ].filter(d => d.value > 0);
  }, [maintenanceRecords, buildings, isAr]);

  // Monthly income (current month)
  const monthlyIncome = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return incomes
      .filter(i => { const d = new Date(i.date); return d.getMonth() === month && d.getFullYear() === year; })
      .reduce((s, i) => s + i.amount, 0);
  }, [incomes]);

  const pendingPayments = overdueCheques.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={TrendingUp}
          label={isAr ? 'الدخل الشهري' : 'Monthly Income'}
          value={formatCurrency(monthlyIncome, lang)}
          color="text-status-available bg-status-available/10"
        />
        <SummaryCard
          icon={AlertTriangle}
          label={isAr ? 'مدفوعات معلقة' : 'Pending Payments'}
          value={formatCurrency(pendingPayments, lang)}
          color="text-status-expiring bg-status-expiring/10"
        />
        <SummaryCard
          icon={FileText}
          label={isAr ? 'عقود نشطة' : 'Active Contracts'}
          value={String(activeContracts.length)}
          color="text-primary bg-primary/10"
        />
        <SummaryCard
          icon={DollarSign}
          label={isAr ? 'إجمالي الإيرادات' : 'Total Revenue'}
          value={formatCurrency(totalRevenue, lang)}
          color="text-status-available bg-status-available/10"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue per Building Bar Chart */}
        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            {isAr ? 'الإيرادات حسب المبنى' : 'Revenue per Building'}
          </h3>
          {revenueData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{isAr ? 'لا توجد بيانات' : 'No data'}</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(215, 10%, 50%)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(215, 10%, 50%)' }} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(0, 0%, 100%)', border: '1px solid hsl(214, 20%, 88%)', borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number) => [formatCurrency(value, lang), isAr ? 'الإيراد' : 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="hsl(215, 70%, 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Maintenance Status Pie Chart */}
        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            {isAr ? 'حالة الصيانة' : 'Maintenance Status'}
          </h3>
          {maintenancePieData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{isAr ? 'لا توجد بيانات' : 'No data'}</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={maintenancePieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {maintenancePieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [value, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-card rounded-lg border border-border p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-card-foreground truncate">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
