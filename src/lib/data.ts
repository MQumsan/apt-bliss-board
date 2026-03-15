export type UnitStatus = 'Available' | 'Occupied' | 'Maintenance';

export interface Unit {
  id: string;
  unitNumber: string;
  floor: number;
  type: 'studio' | 'oneBed' | 'twoBed' | 'threeBed' | 'penthouse';
  status: UnitStatus;
  tenantName?: string;
  contractEnd?: string; // ISO date
}

export interface Building {
  id: string;
  name: string;
  nameAr: string;
  address?: string;
  floors?: number;
  units: Unit[];
}

const today = new Date();
const soon = new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const later = new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export const buildings: Building[] = [
  {
    id: 'b1',
    name: 'Al-Noor Tower',
    nameAr: 'برج النور',
    address: 'Muscat, Oman',
    floors: 3,
    units: [
      { id: 'u1', unitNumber: '101', floor: 1, type: 'studio', status: 'Available' },
      { id: 'u2', unitNumber: '102', floor: 1, type: 'oneBed', status: 'Occupied', tenantName: 'Ahmed Al-Farsi', contractEnd: later },
      { id: 'u3', unitNumber: '103', floor: 1, type: 'twoBed', status: 'Maintenance' },
      { id: 'u4', unitNumber: '201', floor: 2, type: 'oneBed', status: 'Occupied', tenantName: 'Sara Mohammed', contractEnd: soon },
      { id: 'u5', unitNumber: '202', floor: 2, type: 'studio', status: 'Available' },
      { id: 'u6', unitNumber: '203', floor: 2, type: 'threeBed', status: 'Occupied', tenantName: 'Khalid Ibrahim', contractEnd: later },
      { id: 'u7', unitNumber: '301', floor: 3, type: 'penthouse', status: 'Available' },
      { id: 'u8', unitNumber: '302', floor: 3, type: 'twoBed', status: 'Occupied', tenantName: 'Fatima Hassan', contractEnd: soon },
    ],
  },
  {
    id: 'b2',
    name: 'Al-Salam Residence',
    nameAr: 'سكن السلام',
    address: 'Muscat, Oman',
    floors: 2,
    units: [
      { id: 'u9', unitNumber: '101', floor: 1, type: 'twoBed', status: 'Occupied', tenantName: 'Omar Youssef', contractEnd: later },
      { id: 'u10', unitNumber: '102', floor: 1, type: 'oneBed', status: 'Available' },
      { id: 'u11', unitNumber: '103', floor: 1, type: 'studio', status: 'Maintenance' },
      { id: 'u12', unitNumber: '201', floor: 2, type: 'threeBed', status: 'Occupied', tenantName: 'Layla Nasser', contractEnd: soon },
      { id: 'u13', unitNumber: '202', floor: 2, type: 'oneBed', status: 'Available' },
      { id: 'u14', unitNumber: '203', floor: 2, type: 'twoBed', status: 'Occupied', tenantName: 'Mustafa Ali', contractEnd: later },
    ],
  },
  {
    id: 'b3',
    name: 'Pearl Heights',
    nameAr: 'أبراج اللؤلؤ',
    address: 'Muscat, Oman',
    floors: 2,
    units: [
      { id: 'u15', unitNumber: '101', floor: 1, type: 'studio', status: 'Available' },
      { id: 'u16', unitNumber: '102', floor: 1, type: 'oneBed', status: 'Occupied', tenantName: 'Nadia Karim', contractEnd: later },
      { id: 'u17', unitNumber: '201', floor: 2, type: 'penthouse', status: 'Maintenance' },
      { id: 'u18', unitNumber: '202', floor: 2, type: 'twoBed', status: 'Occupied', tenantName: 'Hassan Mahmoud', contractEnd: soon },
    ],
  },
];

export function getEffectiveStatus(unit: Unit): UnitStatus | 'ExpiringSoon' {
  if (unit.status === 'Occupied' && unit.contractEnd) {
    const daysLeft = (new Date(unit.contractEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysLeft < 30 && daysLeft > 0) return 'ExpiringSoon';
  }
  return unit.status;
}
