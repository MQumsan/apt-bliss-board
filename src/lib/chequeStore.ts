import { useState, useCallback, useEffect } from 'react';

export type ChequeStatus = 'pending' | 'deposited' | 'bounced' | 'cancelled';

export interface Cheque {
  id: string;
  chequeNumber: string;
  bankName: string;
  dueDate: string;
  amount: number;
  tenantId: string;
  tenantName: string;
  buildingName: string;
  buildingNameAr: string;
  unitNumber: string;
  status: ChequeStatus;
}

function generateInitialCheques(): Cheque[] {
  const banks = ['Emirates NBD', 'ADCB', 'FAB', 'Mashreq Bank'];
  const statuses: ChequeStatus[] = ['pending', 'pending', 'deposited', 'pending'];
  const now = Date.now();
  return [
    { id: 'chq-1', chequeNumber: 'CHQ-001245', bankName: banks[0], dueDate: new Date(now + 3 * 86400000).toISOString().split('T')[0], amount: 4500, tenantId: 't-u2', tenantName: 'Ahmed Al-Farsi', buildingName: 'Al-Noor Tower', buildingNameAr: 'برج النور', unitNumber: '102', status: statuses[0] },
    { id: 'chq-2', chequeNumber: 'CHQ-001246', bankName: banks[1], dueDate: new Date(now + 5 * 86400000).toISOString().split('T')[0], amount: 6200, tenantId: 't-u4', tenantName: 'Sara Mohammed', buildingName: 'Al-Noor Tower', buildingNameAr: 'برج النور', unitNumber: '201', status: statuses[1] },
    { id: 'chq-3', chequeNumber: 'CHQ-001247', bankName: banks[2], dueDate: new Date(now - 10 * 86400000).toISOString().split('T')[0], amount: 5000, tenantId: 't-u9', tenantName: 'Omar Youssef', buildingName: 'Al-Salam Residence', buildingNameAr: 'سكن السلام', unitNumber: '101', status: statuses[2] },
    { id: 'chq-4', chequeNumber: 'CHQ-001248', bankName: banks[3], dueDate: new Date(now + 14 * 86400000).toISOString().split('T')[0], amount: 7800, tenantId: 't-u12', tenantName: 'Layla Nasser', buildingName: 'Al-Salam Residence', buildingNameAr: 'سكن السلام', unitNumber: '201', status: statuses[3] },
  ];
}

let globalCheques: Cheque[] = generateInitialCheques();
let chequeListeners: Set<() => void> = new Set();

function notifyCheques() {
  chequeListeners.forEach(fn => fn());
}

export function useCheques() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const rerender = () => setTick(t => t + 1);
    chequeListeners.add(rerender);
    return () => { chequeListeners.delete(rerender); };
  }, []);

  const addCheque = useCallback((cheque: Omit<Cheque, 'id'>) => {
    globalCheques = [...globalCheques, { ...cheque, id: `chq-${Date.now()}` }];
    notifyCheques();
  }, []);

  const updateStatus = useCallback((id: string, status: ChequeStatus) => {
    globalCheques = globalCheques.map(c => c.id === id ? { ...c, status } : c);
    notifyCheques();
  }, []);

  const getUpcomingCheques = useCallback((days: number = 7) => {
    const now = Date.now();
    const limit = now + days * 86400000;
    return globalCheques.filter(c => c.status === 'pending' && new Date(c.dueDate).getTime() <= limit && new Date(c.dueDate).getTime() >= now);
  }, []);

  return { cheques: globalCheques, addCheque, updateStatus, getUpcomingCheques };
}
