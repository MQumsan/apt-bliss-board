/**
 * API Client for Hostinger MySQL Backend
 * 
 * Configure your API base URL here. Your PHP/Node backend should expose
 * RESTful endpoints that this client calls.
 * 
 * Expected endpoints:
 *   GET    /buildings          - List all buildings with units
 *   POST   /buildings          - Create a building { name, nameAr }
 *   POST   /units              - Create a unit { buildingId, unitNumber, floor, type, status }
 *   PUT    /units/:id          - Update a unit { status, tenantName, contractEnd }
 *   POST   /payments           - Record a payment { unitId, tenantId, amount, method, category, statement }
 *   GET    /tenants            - List all tenants
 *   POST   /tenants            - Create a tenant
 *   GET    /incomes            - List incomes
 *   POST   /incomes            - Create income record
 *   GET    /expenses           - List expenses
 *   POST   /expenses           - Create expense record
 *   GET    /cheques            - List cheques
 *   POST   /cheques            - Create cheque
 *   PUT    /cheques/:id        - Update cheque status
 */

// Change this to your Hostinger API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const api = {
  baseUrl: API_BASE_URL,

  /** Returns true if an API base URL is configured */
  isConfigured(): boolean {
    return !!API_BASE_URL;
  },

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    if (!API_BASE_URL) {
      throw new Error('API_BASE_URL not configured. Set VITE_API_BASE_URL in your environment.');
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`API ${res.status}: ${body}`);
    }

    return res.json();
  },

  // Buildings
  getBuildings() { return this.request<any[]>('/buildings'); },
  createBuilding(data: { name: string; nameAr: string }) {
    return this.request<any>('/buildings', { method: 'POST', body: JSON.stringify(data) });
  },

  // Units
  createUnit(data: { buildingId: string; unitNumber: string; floor: number; type: string; status: string }) {
    return this.request<any>('/units', { method: 'POST', body: JSON.stringify(data) });
  },
  updateUnit(id: string, data: Record<string, any>) {
    return this.request<any>(`/units/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  // Payments
  recordPayment(data: Record<string, any>) {
    return this.request<any>('/payments', { method: 'POST', body: JSON.stringify(data) });
  },

  // Tenants
  getTenants() { return this.request<any[]>('/tenants'); },
  createTenant(data: Record<string, any>) {
    return this.request<any>('/tenants', { method: 'POST', body: JSON.stringify(data) });
  },

  // Cheques
  getCheques() { return this.request<any[]>('/cheques'); },
  createCheque(data: Record<string, any>) {
    return this.request<any>('/cheques', { method: 'POST', body: JSON.stringify(data) });
  },
  updateChequeStatus(id: string, status: string) {
    return this.request<any>(`/cheques/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
  },

  // Financials
  getIncomes() { return this.request<any[]>('/incomes'); },
  createIncome(data: Record<string, any>) {
    return this.request<any>('/incomes', { method: 'POST', body: JSON.stringify(data) });
  },
  getExpenses() { return this.request<any[]>('/expenses'); },
  createExpense(data: Record<string, any>) {
    return this.request<any>('/expenses', { method: 'POST', body: JSON.stringify(data) });
  },
};
