import { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Users, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

type UserRole = 'admin' | 'accountant' | 'staff';

interface StaffUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  active: boolean;
}

const initialUsers: StaffUser[] = [
  { id: 'usr-1', fullName: 'Admin User', email: 'admin@almshreqom.com', phone: '+968-9000-0001', role: 'admin', active: true },
];

const UserManagement = () => {
  const { lang } = useI18n();
  const isAr = lang === 'ar';
  const [users, setUsers] = useState<StaffUser[]>(initialUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', role: '' as string, password: '' });

  const roleLabel = (r: UserRole) => ({
    admin: { en: 'Admin', ar: 'مدير' },
    accountant: { en: 'Accountant', ar: 'محاسب' },
    staff: { en: 'Staff', ar: 'موظف' },
  }[r]?.[lang] || r);

  const roleBadgeColor = (r: UserRole) => ({
    admin: 'bg-primary/10 text-primary border-primary/20',
    accountant: 'bg-status-expiring/10 text-status-expiring border-status-expiring/20',
    staff: 'bg-muted text-muted-foreground border-border',
  }[r]);

  const openAdd = () => {
    setEditingUser(null);
    setForm({ fullName: '', email: '', phone: '', role: '', password: '' });
    setDialogOpen(true);
  };

  const openEdit = (user: StaffUser) => {
    setEditingUser(user);
    setForm({ fullName: user.fullName, email: user.email, phone: user.phone, role: user.role, password: '' });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.role) {
      toast({ title: isAr ? 'يرجى ملء جميع الحقول' : 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    if (editingUser) {
      const updated = users.map(u => u.id === editingUser.id ? { ...u, fullName: form.fullName, email: form.email, phone: form.phone, role: form.role as UserRole } : u);
      setUsers(updated);
      if (api.isConfigured()) {
        api.request(`/users/${editingUser.id}`, { method: 'PUT', body: JSON.stringify(form) }).catch(console.error);
      }
      toast({ title: isAr ? 'تم تحديث المستخدم' : 'User updated' });
    } else {
      const newUser: StaffUser = { id: `usr-${Date.now()}`, fullName: form.fullName, email: form.email, phone: form.phone, role: form.role as UserRole, active: true };
      setUsers(prev => [...prev, newUser]);
      if (api.isConfigured()) {
        api.request('/users', { method: 'POST', body: JSON.stringify({ ...form }) }).catch(console.error);
      }
      toast({ title: isAr ? 'تمت إضافة المستخدم' : 'User added' });
    }
    setDialogOpen(false);
  };

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{isAr ? 'إدارة المستخدمين' : 'User Management'}</h1>
              <p className="text-xs text-muted-foreground">{isAr ? 'إضافة وتعديل صلاحيات الموظفين' : 'Add and manage staff permissions'}</p>
            </div>
          </div>
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            {isAr ? 'إضافة مستخدم' : 'Add User'}
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>{isAr ? 'الاسم' : 'Name'}</TableHead>
                <TableHead>{isAr ? 'البريد الإلكتروني' : 'Email'}</TableHead>
                <TableHead>{isAr ? 'الهاتف' : 'Phone'}</TableHead>
                <TableHead>{isAr ? 'الدور' : 'Role'}</TableHead>
                <TableHead>{isAr ? 'الحالة' : 'Status'}</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    {isAr ? 'لا يوجد مستخدمون' : 'No users found'}
                  </TableCell>
                </TableRow>
              ) : users.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell dir="ltr" className="text-start">{user.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={roleBadgeColor(user.role)}>{roleLabel(user.role)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={user.active ? 'bg-status-available/10 text-status-available' : 'bg-muted text-muted-foreground'}>
                      {user.active ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطل' : 'Disabled')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(user)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {editingUser ? (isAr ? 'تعديل المستخدم' : 'Edit User') : (isAr ? 'إضافة مستخدم جديد' : 'Add New User')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{isAr ? 'الاسم الكامل' : 'Full Name'} *</Label>
              <Input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>{isAr ? 'البريد الإلكتروني' : 'Email'} *</Label>
              <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>{isAr ? 'الهاتف' : 'Phone'}</Label>
              <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} dir="ltr" />
            </div>
            {!editingUser && (
              <div className="space-y-1.5">
                <Label>{isAr ? 'كلمة المرور' : 'Password'} *</Label>
                <Input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required={!editingUser} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>{isAr ? 'الدور' : 'Role'} *</Label>
              <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue placeholder={isAr ? 'اختر الدور' : 'Select role'} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{isAr ? 'مدير' : 'Admin'}</SelectItem>
                  <SelectItem value="accountant">{isAr ? 'محاسب' : 'Accountant'}</SelectItem>
                  <SelectItem value="staff">{isAr ? 'موظف' : 'Staff'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
              <Button type="submit">{editingUser ? (isAr ? 'تحديث' : 'Update') : (isAr ? 'إضافة' : 'Add')}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default UserManagement;
