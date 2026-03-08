import { useState, useCallback } from 'react';
import { buildings as initialBuildings, Building, Unit } from './data';

// Simple global state for buildings data shared between pages
let globalBuildings = [...initialBuildings.map(b => ({ ...b, units: [...b.units] }))];
let listeners: Set<() => void> = new Set();

function notify() {
  listeners.forEach(fn => fn());
}

export function useBuildings() {
  const [, setTick] = useState(0);

  const subscribe = useCallback(() => {
    const rerender = () => setTick(t => t + 1);
    listeners.add(rerender);
    return () => { listeners.delete(rerender); };
  }, []);

  // Subscribe on mount
  useState(() => {
    const unsub = subscribe();
    return unsub;
  });

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

// Extract existing tenants from building data
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
  const [, setTick] = useState(0);

  useState(() => {
    const rerender = () => setTick(t => t + 1);
    tenantListeners.add(rerender);
    return () => { tenantListeners.delete(rerender); };
  });

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
