import { LayoutDashboard, Building2, Users, DollarSign, FileCheck, BarChart3, FileText, Wrench } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const { t, lang } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    { title: t('dashboard'), icon: LayoutDashboard, path: '/' },
    { title: t('properties'), icon: Building2, path: '/properties' },
    { title: t('tenants'), icon: Users, path: '/tenants' },
    { title: lang === 'ar' ? 'العقود' : 'Contracts', icon: FileText, path: '/contracts' },
    { title: t('financials'), icon: DollarSign, path: '/financials' },
    { title: lang === 'ar' ? 'الصيانة' : 'Maintenance', icon: Wrench, path: '/maintenance' },
    { title: t('cheques'), icon: FileCheck, path: '/cheques' },
    { title: t('reports'), icon: BarChart3, path: '/reports' },
  ];

  const sidebarSide = lang === 'ar' ? 'right' : 'left';

  return (
    <Sidebar collapsible="icon" side={sidebarSide}>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Building2 className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h1 className="text-sm font-bold text-sidebar-accent-foreground">{t('appTitle')}</h1>
            <p className="text-xs text-sidebar-foreground/60">{t('appSubtitle')}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      className={isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50 cursor-pointer'}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
