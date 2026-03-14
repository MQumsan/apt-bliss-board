import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, Bell, Plus, Languages, LogOut, User, Settings, ChevronDown, UserPlus, DollarSign } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useCheques } from '@/lib/chequeStore';
import { useContracts } from '@/lib/contractStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import logoImage from '@/assets/al-mashreq-logo.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const navItems = [
  { key: 'dashboard', path: '/' },
  { key: 'unitsMonitor', path: '/units-monitor' },
  { key: 'tenants', path: '/tenants' },
  { key: 'contracts', path: '/contracts' },
  { key: 'financials', path: '/financials' },
  { key: 'maintenance', path: '/maintenance' },
  { key: 'cheques', path: '/cheques' },
  { key: 'reports', path: '/reports' },
] as const;

export function TopNavbar() {
  const { t, lang, toggleLang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const { getOverduePendingCheques } = useCheques();
  const { getExpiringContracts } = useContracts();

  const overdue = getOverduePendingCheques();
  const expiring = getExpiringContracts(30);
  const totalAlerts = overdue.length + expiring.length;

  const label = (key: string) => {
    const labels: Record<string, Record<string, string>> = {
      dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
      unitsMonitor: { en: 'Units Monitor', ar: 'مراقبة الوحدات' },
      tenants: { en: 'Tenants', ar: 'المستأجرون' },
      contracts: { en: 'Contracts', ar: 'العقود' },
      financials: { en: 'Financials', ar: 'المالية' },
      maintenance: { en: 'Maintenance', ar: 'الصيانة' },
      cheques: { en: 'Cheques', ar: 'الشيكات' },
      reports: { en: 'Reports', ar: 'التقارير' },
    };
    return labels[key]?.[lang] || key;
  };

  return (
    <nav className="sticky top-0 z-50 h-14 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 px-4 flex items-center justify-between">
      {/* Left: Logo + Nav Links */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <img src={logoImage} alt="Al Mashreq" className="h-8 w-8 rounded-lg" />
          <span className="text-sm font-bold text-foreground hidden md:inline">
            {lang === 'ar' ? 'المشرق' : 'Al Mashreq'}
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {label(item.key)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Quick Add */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 h-8">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">{lang === 'ar' ? 'إضافة سريعة' : 'Quick Add'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate('/tenants?add=1')}>
              <UserPlus className="h-4 w-4 me-2" />
              {lang === 'ar' ? 'مستأجر جديد' : 'New Tenant'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/financials?addExpense=1')}>
              <DollarSign className="h-4 w-4 me-2" />
              {lang === 'ar' ? 'مصروف جديد' : 'New Expense'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications Bell */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="h-4 w-4" />
              {totalAlerts > 0 && (
                <span className="absolute -top-0.5 -end-0.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {totalAlerts}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="p-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground">{lang === 'ar' ? 'التنبيهات' : 'Notifications'}</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {totalAlerts === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">{lang === 'ar' ? 'لا توجد تنبيهات' : 'No alerts'}</p>
              ) : (
                <>
                  {overdue.map(c => (
                    <div key={c.id} className="p-3 border-b border-border hover:bg-accent/50 cursor-pointer" onClick={() => navigate('/cheques')}>
                      <p className="text-xs font-semibold text-destructive">{lang === 'ar' ? 'شيك متأخر' : 'Overdue Cheque'}</p>
                      <p className="text-xs text-muted-foreground">{c.tenantName} — {c.chequeNumber}</p>
                    </div>
                  ))}
                  {expiring.map(c => (
                    <div key={c.id} className="p-3 border-b border-border hover:bg-accent/50 cursor-pointer" onClick={() => navigate('/contracts')}>
                      <p className="text-xs font-semibold text-status-expiring">{lang === 'ar' ? 'عقد ينتهي قريباً' : 'Contract Expiring'}</p>
                      <p className="text-xs text-muted-foreground">{c.tenantName} — {c.unitNumber}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Language */}
        <Button variant="ghost" size="sm" onClick={toggleLang} className="h-8 px-2">
          <Languages className="h-4 w-4" />
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 h-8">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs text-muted-foreground">{lang === 'ar' ? 'الحساب' : 'Account'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/admin/users')}>
              <Settings className="h-4 w-4 me-2" />
              {lang === 'ar' ? 'إدارة النظام' : 'System Admin'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/login')} className="text-destructive">
              <LogOut className="h-4 w-4 me-2" />
              {lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="lg:hidden h-8 px-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {navItems.map(item => (
              <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)}>
                {label(item.key)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
