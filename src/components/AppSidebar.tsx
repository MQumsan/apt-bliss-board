import { LayoutDashboard, Building2, Users, DollarSign, FileCheck, BarChart3 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
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
  const { t } = useI18n();

  const items = [
    { title: t('dashboard'), icon: LayoutDashboard, active: true },
    { title: t('properties'), icon: Building2 },
    { title: t('tenants'), icon: Users },
    { title: t('financials'), icon: DollarSign },
    { title: t('cheques'), icon: FileCheck },
    { title: t('reports'), icon: BarChart3 },
  ];

  return (
    <Sidebar collapsible="icon">
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
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className={item.active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
