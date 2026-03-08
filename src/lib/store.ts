import { useState, useCallback, useEffect } from 'react';
import { buildings as initialBuildings, Building, Unit } from './data';

// Simple global state for buildings data shared between pages
let globalBuildings = [...initialBuildings.map(b => ({ ...b, units: [...b.units] }))];
let listeners: Set<() => void> = new Set();

function notify() {
  listeners.forEach(fn => fn());
}

function useSubscribe(listenersSet: Set<() => void>) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const rerender = () => setTick(t => t + 1);
    listenersSet.add(rerender);
    return () => { listenersSet.delete(rerender); };
  }, [listenersSet]);
}

export function useBuildings() {
  useSubscribe(listeners);

  const assignUnit = useCallback((unitId: string, tenantName: string, contractEnd: string) => {
    globalBuildings = globalBuildings.map(b => ({
      ...b,
      units: b.units.map(u =>
        u.id === unitId ? { ...u, status: 'Occupied' as const, tenantName, contractEnd } : u
      ),
    }));
    notify();
  }, []);

  const getAvailableUnits = useCallback(() => {
    const result: (Unit & { buildingName: string; buildingNameAr: string })[] = [];
    globalBuildings.forEach(b => {
      b.units.forEach(u => {
        if (u.status === 'Available') {
          result.push({ ...u, buildingName: b.name, buildingNameAr: b.nameAr });
        }
      });
    });
    return result;
  }, []);

  return { buildings: globalBuildings, assignUnit, getAvailableUnits };
}

export interface Tenant {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  nationalId: string;
  passportNumber?: string;
  unitId: string;
  unitNumber: string;
  buildingName: string;
  buildingNameAr: string;
  contractStart: string;
  contractEnd: string;
  annualRent: number;
  active: boolean;
}

function extractInitialTenants(): Tenant[] {
  const tenants: Tenant[] = [];
  initialBuildings.forEach(b => {
    b.units.forEach(u => {
      if (u.status === 'Occupied' && u.tenantName) {
        tenants.push({
          id: `t-${u.id}`,
          fullName: u.tenantName,
          phone: '+971-50-' + Math.floor(1000000 + Math.random() * 9000000),
          email: u.tenantName.toLowerCase().replace(/\s+/g, '.') + '@email.com',
          nationalId: '784-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000000 + Math.random() * 9000000) + '-1',
          unitId: u.id,
          unitNumber: u.unitNumber,
          buildingName: b.name,
          buildingNameAr: b.nameAr,
          contractStart: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          contractEnd: u.contractEnd || '',
          annualRent: Math.floor(30000 + Math.random() * 70000),
          active: true,
        });
      }
    });
  });
  return tenants;
}

let globalTenants: Tenant[] = extractInitialTenants();
let tenantListeners: Set<() => void> = new Set();

function notifyTenants() {
  tenantListeners.forEach(fn => fn());
}

export function useTenants() {
  useSubscribe(tenantListeners);

  const addTenant = useCallback((tenant: Omit<Tenant, 'id' | 'active'>) => {
    const newTenant: Tenant = {
      ...tenant,
      id: `t-${Date.now()}`,
      active: true,
    };
    globalTenants = [...globalTenants, newTenant];
    notifyTenants();
    return newTenant;
  }, []);

  return { tenants: globalTenants, addTenant };
}

// ─── Financial Records ───

export type PaymentMethod = 'cash' | 'cheque' | 'transfer';
export type IncomeCategory = 'rent' | 'deposit';
export type ExpenseCategory = 'maintenance' | 'utilities' | 'commission' | 'other';

export interface IncomeRecord {
  id: string;
  date: string;
  tenantId: string;
  tenantName: string;
  unitNumber: string;
  buildingName: string;
  buildingNameAr: string;
  amount: number;
  method: PaymentMethod;
  category: IncomeCategory;
  statement: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  buildingName: string;
  buildingNameAr: string;
  unitNumber: string;
  statement: string;
}

function generateInitialIncomes(): IncomeRecord[] {
  const records: IncomeRecord[] = [];
  const methods: PaymentMethod[] = ['cash', 'cheque', 'transfer'];
  globalTenants.forEach((t, i) => {
    records.push({
      id: `inc-${i}`,
      date: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tenantId: t.id,
      tenantName: t.fullName,
      unitNumber: t.unitNumber,
      buildingName: t.buildingName,
      buildingNameAr: t.buildingNameAr,
      amount: Math.floor(t.annualRent / 12),
      method: methods[i % 3],
      category: 'rent',
      statement: `Monthly rent payment - Unit ${t.unitNumber}`,
    });
  });
  return records;
}

function generateInitialExpenses(): ExpenseRecord[] {
  const categories: ExpenseCategory[] = ['maintenance', 'utilities', 'commission', 'other'];
  const statements = [
    'HVAC system repair',
    'Monthly electricity bill',
    'Real Estate Co. Commission',
    'Building cleaning service',
  ];
  return initialBuildings.slice(0, 4).map((b, i) => ({
    id: `exp-${i}`,
    date: new Date(Date.now() - Math.floor(Math.random() * 45) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: categories[i % 4],
    amount: Math.floor(1000 + Math.random() * 9000),
    buildingName: b.name,
    buildingNameAr: b.nameAr,
    unitNumber: b.units[0]?.unitNumber || '',
    statement: statements[i % 4],
  }));
}

let globalIncomes: IncomeRecord[] = generateInitialIncomes();
let globalExpenses: ExpenseRecord[] = generateInitialExpenses();
let financeListeners: Set<() => void> = new Set();

function notifyFinance() {
  financeListeners.forEach(fn => fn());
}

export function useFinance() {
  useSubscribe(financeListeners);

  const addIncome = useCallback((record: Omit<IncomeRecord, 'id'>) => {
    globalIncomes = [...globalIncomes, { ...record, id: `inc-${Date.now()}` }];
    notifyFinance();
  }, []);

  const addExpense = useCallback((record: Omit<ExpenseRecord, 'id'>) => {
    globalExpenses = [...globalExpenses, { ...record, id: `exp-${Date.now()}` }];
    notifyFinance();
  }, []);

  const totalRevenue = globalIncomes.reduce((s, r) => s + r.amount, 0);
  const totalExpenses = globalExpenses.reduce((s, r) => s + r.amount, 0);

  return { incomes: globalIncomes, expenses: globalExpenses, addIncome, addExpense, totalRevenue, totalExpenses };
}
