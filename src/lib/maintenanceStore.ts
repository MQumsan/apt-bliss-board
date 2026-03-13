import { useState, useCallback, useEffect } from 'react';
import { api } from './api';

export type MaintenanceStatus = 'pending' | 'completed';

export interface MaintenanceRecord {
  id: string;
  buildingId: string;
  buildingName: string;
  buildingNameAr: string;
  unitNumber: string;
  issueDescription: string;
  cost: number;
  date: string;
  status: MaintenanceStatus;
}

function generateInitialMaintenance(): MaintenanceRecord[] {
  return [
    { id: 'mnt-1', buildingId: 'b1', buildingName: 'Al-Noor Tower', buildingNameAr: 'برج النور', unitNumber: '103', issueDescription: 'تسرب مياه في الحمام', cost: 250, date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], status: 'completed' },
    { id: 'mnt-2', buildingId: 'b2', buildingName: 'Al-Salam Residence', buildingNameAr: 'سكن السلام', unitNumber: '103', issueDescription: 'عطل في نظام التكييف', cost: 800, date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], status: 'pending' },
    { id: 'mnt-3', buildingId: 'b3', buildingName: 'Pearl Heights', buildingNameAr: 'أبراج اللؤلؤ', unitNumber: '201', issueDescription: 'صيانة عامة للسباكة', cost: 450, date: new Date().toISOString().split('T')[0], status: 'pending' },
  ];
}

let globalMaintenance: MaintenanceRecord[] = generateInitialMaintenance();
let maintenanceListeners: Set<() => void> = new Set();

function notifyMaintenance() {
  maintenanceListeners.forEach(fn => fn());
}

export function useMaintenance() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const rerender = () => setTick(t => t + 1);
    maintenanceListeners.add(rerender);
    return () => { maintenanceListeners.delete(rerender); };
  }, []);

  const addRecord = useCallback((record: Omit<MaintenanceRecord, 'id'>) => {
    const newRecord = { ...record, id: `mnt-${Date.now()}` };
    globalMaintenance = [...globalMaintenance, newRecord];
    notifyMaintenance();
    if (api.isConfigured()) {
      api.request('/maintenance', { method: 'POST', body: JSON.stringify(newRecord) }).catch(console.error);
    }
    return newRecord;
  }, []);

  const updateStatus = useCallback((id: string, status: MaintenanceStatus) => {
    globalMaintenance = globalMaintenance.map(r => r.id === id ? { ...r, status } : r);
    notifyMaintenance();
    if (api.isConfigured()) {
      api.request(`/maintenance/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }).catch(console.error);
    }
  }, []);

  const totalMaintenanceCost = globalMaintenance.reduce((s, r) => s + r.cost, 0);

  return { records: globalMaintenance, addRecord, updateStatus, totalMaintenanceCost };
}
