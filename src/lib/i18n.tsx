import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type Lang = 'en' | 'ar';

const translations = {
  en: {
    dashboard: 'Dashboard',
    properties: 'Properties',
    tenants: 'Tenants',
    financials: 'Financials',
    cheques: 'Cheques',
    reports: 'Reports',
    available: 'Available',
    occupied: 'Occupied',
    maintenance: 'Maintenance',
    expiringSoon: 'Expiring Soon',
    unitNumber: 'Unit',
    type: 'Type',
    tenant: 'Tenant',
    view: 'View',
    edit: 'Edit',
    payment: 'Payment',
    floor: 'Floor',
    appTitle: 'Al-Mashreq PMS',
    appSubtitle: 'Property Management System',
    noTenant: 'Vacant',
    studio: 'Studio',
    oneBed: '1 Bedroom',
    twoBed: '2 Bedroom',
    threeBed: '3 Bedroom',
    penthouse: 'Penthouse',
    totalUnits: 'Total Units',
    occupancyRate: 'Occupancy Rate',
    maintenanceRequests: 'Maintenance',
    expiringContracts: 'Expiring Contracts',
    language: 'العربية',
    searchPlaceholder: 'Search by unit number or tenant name...',
    filterByStatus: 'Filter by status',
    allStatuses: 'All Statuses',
    unitDetails: 'Unit Details',
    editUnit: 'Edit Unit',
    paymentDetails: 'Payment',
    status: 'Status',
    contractEnd: 'Contract End',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    tenantName: 'Tenant Name',
    amount: 'Amount',
    recordPayment: 'Record Payment',
    noContractEnd: 'N/A',
    // Tenants page
    addTenant: 'Add Tenant',
    searchTenants: 'Search by name, ID, or unit...',
    phone: 'Phone',
    nationalId: 'National ID',
    building: 'Building',
    annualRent: 'Annual Rent',
    active: 'Active',
    inactive: 'Inactive',
    noTenantsFound: 'No tenants found',
    fullName: 'Full Name',
    email: 'Email',
    passportNumber: 'Passport Number',
    leaseDetails: 'Lease Details',
    selectUnit: 'Select Unit',
    selectAvailableUnit: 'Select an available unit',
    contractStart: 'Contract Start',
    fillRequired: 'Please fill all required fields',
    tenantAdded: 'Tenant added successfully',
  },
  ar: {
    dashboard: 'لوحة التحكم',
    properties: 'العقارات',
    tenants: 'المستأجرون',
    financials: 'المالية',
    cheques: 'الشيكات',
    reports: 'التقارير',
    available: 'متاح',
    occupied: 'مشغول',
    maintenance: 'صيانة',
    expiringSoon: 'ينتهي قريباً',
    unitNumber: 'وحدة',
    type: 'النوع',
    tenant: 'المستأجر',
    view: 'عرض',
    edit: 'تعديل',
    payment: 'دفع',
    floor: 'الطابق',
    appTitle: 'المشرق PMS',
    appSubtitle: 'نظام إدارة العقارات',
    noTenant: 'شاغر',
    studio: 'استوديو',
    oneBed: 'غرفة واحدة',
    twoBed: 'غرفتين',
    threeBed: '3 غرف',
    penthouse: 'بنتهاوس',
    totalUnits: 'إجمالي الوحدات',
    occupancyRate: 'نسبة الإشغال',
    maintenanceRequests: 'الصيانة',
    expiringContracts: 'عقود منتهية',
    language: 'English',
    searchPlaceholder: 'ابحث بالوحدة أو اسم المستأجر...',
    filterByStatus: 'تصفية حسب الحالة',
    allStatuses: 'جميع الحالات',
    unitDetails: 'تفاصيل الوحدة',
    editUnit: 'تعديل الوحدة',
    paymentDetails: 'الدفع',
    status: 'الحالة',
    contractEnd: 'نهاية العقد',
    save: 'حفظ',
    cancel: 'إلغاء',
    close: 'إغلاق',
    tenantName: 'اسم المستأجر',
    amount: 'المبلغ',
    recordPayment: 'تسجيل دفعة',
    noContractEnd: 'غير متاح',
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface I18nContextType {
  lang: Lang;
  t: (key: TranslationKey) => string;
  toggleLang: () => void;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  const t = useCallback((key: TranslationKey) => translations[lang][key], [lang]);
  const toggleLang = useCallback(() => setLang(l => l === 'en' ? 'ar' : 'en'), []);

  return (
    <I18nContext.Provider value={{ lang, t, toggleLang, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};
