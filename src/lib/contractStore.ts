import { useState, useCallback, useEffect } from 'react';
import { api } from './api';

export type PaymentFrequency = 'monthly' | 'quarterly' | 'semi-annual' | 'annual';

export interface Contract {
  id: string;
  tenantId: string;
  tenantName: string;
  unitId: string;
  unitNumber: string;
  buildingName: string;
  buildingNameAr: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  annualRent: number;
  paymentFrequency: PaymentFrequency;
  contractFile?: string; // URL or reference to uploaded file
}

function generateInitialContracts(): Contract[] {
  const now = Date.now();
  const soon = new Date(now + 20 * 86400000).toISOString().split('T')[0];
  const later = new Date(now + 180 * 86400000).toISOString().split('T')[0];
  const past = new Date(now - 180 * 86400000).toISOString().split('T')[0];
  return [
    { id: 'ctr-1', tenantId: 't-u2', tenantName: 'Ahmed Al-Farsi', unitId: 'u2', unitNumber: '102', buildingName: 'Al-Noor Tower', buildingNameAr: 'برج النور', startDate: past, endDate: later, monthlyRent: 4500, annualRent: 54000, paymentFrequency: 'monthly' },
    { id: 'ctr-2', tenantId: 't-u4', tenantName: 'Sara Mohammed', unitId: 'u4', unitNumber: '201', buildingName: 'Al-Noor Tower', buildingNameAr: 'برج النور', startDate: past, endDate: soon, monthlyRent: 3500, annualRent: 42000, paymentFrequency: 'quarterly' },
    { id: 'ctr-3', tenantId: 't-u6', tenantName: 'Khalid Ibrahim', unitId: 'u6', unitNumber: '203', buildingName: 'Al-Noor Tower', buildingNameAr: 'برج النور', startDate: past, endDate: later, monthlyRent: 6000, annualRent: 72000, paymentFrequency: 'semi-annual' },
    { id: 'ctr-4', tenantId: 't-u9', tenantName: 'Omar Youssef', unitId: 'u9', unitNumber: '101', buildingName: 'Al-Salam Residence', buildingNameAr: 'سكن السلام', startDate: past, endDate: later, monthlyRent: 5000, annualRent: 60000, paymentFrequency: 'annual' },
    { id: 'ctr-5', tenantId: 't-u12', tenantName: 'Layla Nasser', unitId: 'u12', unitNumber: '201', buildingName: 'Al-Salam Residence', buildingNameAr: 'سكن السلام', startDate: past, endDate: soon, monthlyRent: 4000, annualRent: 48000, paymentFrequency: 'monthly' },
  ];
}

let globalContracts: Contract[] = generateInitialContracts();
let contractListeners: Set<() => void> = new Set();

function notifyContracts() {
  contractListeners.forEach(fn => fn());
}

export function useContracts() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const rerender = () => setTick(t => t + 1);
    contractListeners.add(rerender);
    return () => { contractListeners.delete(rerender); };
  }, []);

  const addContract = useCallback((contract: Omit<Contract, 'id'>) => {
    const newContract = { ...contract, id: `ctr-${Date.now()}` };
    globalContracts = [...globalContracts, newContract];
    notifyContracts();
    if (api.isConfigured()) {
      api.request('/contracts', { method: 'POST', body: JSON.stringify(newContract) }).catch(console.error);
    }
    return newContract;
  }, []);

  const editContract = useCallback((id: string, updates: Partial<Contract>) => {
    globalContracts = globalContracts.map(c => c.id === id ? { ...c, ...updates } : c);
    notifyContracts();
    if (api.isConfigured()) {
      api.request(`/contracts/${id}`, { method: 'PUT', body: JSON.stringify(updates) }).catch(console.error);
    }
  }, []);

  const deleteContract = useCallback((id: string) => {
    globalContracts = globalContracts.filter(c => c.id !== id);
    notifyContracts();
    if (api.isConfigured()) {
      api.request(`/contracts/${id}`, { method: 'DELETE' }).catch(console.error);
    }
  }, []);

  const getExpiringContracts = useCallback((days: number = 30) => {
    const now = Date.now();
    const limit = now + days * 86400000;
    return globalContracts.filter(c => {
      const end = new Date(c.endDate).getTime();
      return end > now && end <= limit;
    });
  }, []);

  return { contracts: globalContracts, addContract, editContract, deleteContract, getExpiringContracts };
}
