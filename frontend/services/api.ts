import axios from 'axios';
import {
  Transaction, Invoice, Client, Project, Task,
  UserProfile, InvoiceSettings, LicenseData,
  RawMaterial, BOM, ProductionOrder, MenuItem, POSOrder, CalendarEvent
} from '../types';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for cookies/sessions if used
});

// Add interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling could go here
    console.error('API Error:', error.response?.data?.error || error.message);
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  checkAuth: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      return null;
    }
  }
};

export const licenseService = {
  getLicense: async () => {
    const response = await api.get<LicenseData>('/license');
    return response.data;
  },
  updateAddon: async (addonName: string, value: boolean) => {
    const response = await api.put('/license/addon', { addonName, value });
    return response.data;
  },
  extendLicense: async () => {
    const response = await api.post('/license/extend');
    return response.data;
  }
};

export const userService = {
  getProfile: async () => {
    const response = await api.get<UserProfile>('/auth/me');
    return response.data;
  },
  updateProfile: async (profile: UserProfile) => {
    const response = await api.put('/auth/profile', profile);
    return response.data;
  },
  getInvoiceSettings: async () => {
    const response = await api.get<InvoiceSettings>('/invoices/settings');
    return response.data;
  },
  updateInvoiceSettings: async (settings: InvoiceSettings) => {
    const response = await api.put('/invoices/settings', settings);
    return response.data;
  }
};

export const transactionService = {
  getAll: async () => {
    const response = await api.get<Transaction[]>('/transactions');
    return response.data;
  },
  create: async (transaction: Omit<Transaction, 'id'>) => {
    const response = await api.post<Transaction>('/transactions', transaction);
    return response.data;
  },
  update: async (id: string, transaction: Partial<Transaction>) => {
    const response = await api.put<Transaction>(`/transactions/${id}`, transaction);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/transactions/${id}`);
  }
};

export const invoiceService = {
  getAll: async () => {
    const response = await api.get<Invoice[]>('/invoices');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<Invoice>(`/invoices/${id}`);
    return response.data;
  },
  create: async (invoice: Omit<Invoice, 'id'>) => {
    const response = await api.post<Invoice>('/invoices', invoice);
    return response.data;
  },
  update: async (id: string, invoice: Partial<Invoice>) => {
    const response = await api.put<Invoice>(`/invoices/${id}`, invoice);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/invoices/${id}`);
  }
};

export const clientService = {
  getAll: async () => {
    const response = await api.get<Client[]>('/clients');
    return response.data;
  },
  create: async (client: Omit<Client, 'id'>) => {
    const response = await api.post<Client>('/clients', client);
    return response.data;
  },
  update: async (id: string, client: Partial<Client>) => {
    const response = await api.put<Client>(`/clients/${id}`, client);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/clients/${id}`);
  }
};

export const projectService = {
  getAll: async () => {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },
  create: async (project: Omit<Project, 'id'>) => {
    const response = await api.post<Project>('/projects', project);
    return response.data;
  },
  update: async (id: string, project: Partial<Project>) => {
    const response = await api.put<Project>(`/projects/${id}`, project);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/projects/${id}`);
  }
};

export const taskService = {
  getAll: async () => {
    const response = await api.get<Task[]>('/tasks');
    return response.data;
  },
  create: async (task: Omit<Task, 'id'>) => {
    const response = await api.post<Task>('/tasks', task);
    return response.data;
  },
  update: async (id: string, task: Partial<Task>) => {
    const response = await api.put<Task>(`/tasks/${id}`, task);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/tasks/${id}`);
  }
};

export const calendarService = {
  getAll: async () => {
    const response = await api.get<CalendarEvent[]>('/calendar');
    return response.data;
  },
  create: async (event: Omit<CalendarEvent, 'id'>) => {
    const response = await api.post<CalendarEvent>('/calendar', event);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/calendar/${id}`);
  }
};

export const manufactureService = {
  // Inventory/Materials
  getMaterials: async () => {
    const response = await api.get<RawMaterial[]>('/manufacturing/inventory');
    return response.data;
  },
  createMaterial: async (material: Omit<RawMaterial, 'id'>) => {
    const response = await api.post<RawMaterial>('/manufacturing/inventory', material);
    return response.data;
  },
  updateMaterial: async (id: string, material: Partial<RawMaterial>) => {
    const response = await api.put<RawMaterial>(`/manufacturing/inventory/${id}`, material);
    return response.data;
  },
  deleteMaterial: async (id: string) => {
    await api.delete(`/manufacturing/inventory/${id}`);
  },

  // BOMs
  getBOMs: async () => {
    const response = await api.get<BOM[]>('/manufacturing/bom');
    return response.data;
  },
  createBOM: async (bom: Omit<BOM, 'id'>) => {
    const response = await api.post<BOM>('/manufacturing/bom', bom);
    return response.data;
  },
  updateBOM: async (id: string, bom: Partial<BOM>) => {
    const response = await api.put<BOM>(`/manufacturing/bom/${id}`, bom);
    return response.data;
  },
  deleteBOM: async (id: string) => {
    await api.delete(`/manufacturing/bom/${id}`);
  },

  // Production Orders
  getOrders: async () => {
    const response = await api.get<ProductionOrder[]>('/manufacturing/production');
    return response.data;
  },
  createOrder: async (order: Omit<ProductionOrder, 'id'>) => {
    const response = await api.post<ProductionOrder>('/manufacturing/production', order);
    return response.data;
  },
  updateOrder: async (id: string, order: Partial<ProductionOrder>) => {
    const response = await api.put<ProductionOrder>(`/manufacturing/production/${id}`, order);
    return response.data;
  },
  completeOrder: async (id: string) => {
    const response = await api.put(`/manufacturing/production/${id}/complete`);
    return response.data;
  }
};

export const restaurantService = {
  getMenu: async () => {
    const response = await api.get<MenuItem[]>('/restaurant/menu');
    return response.data;
  },
  getCategories: async () => {
    const response = await api.get<string[]>('/restaurant/menu/categories');
    return response.data;
  },
  createMenuItem: async (item: Omit<MenuItem, 'id'>) => {
    const response = await api.post<MenuItem>('/restaurant/menu', item);
    return response.data;
  },
  updateMenuItem: async (id: string, item: Partial<MenuItem>) => {
    const response = await api.put<MenuItem>(`/restaurant/menu/${id}`, item);
    return response.data;
  },
  deleteMenuItem: async (id: string) => {
    await api.delete(`/restaurant/menu/${id}`);
  },
  addCategory: async (category: string) => {
    const response = await api.post('/restaurant/menu/categories', { category });
    return response.data;
  },
  deleteCategory: async (category: string) => {
    await api.delete(`/restaurant/menu/categories/${category}`);
  },
  getPOSOrders: async () => {
    const response = await api.get<POSOrder[]>('/restaurant/pos/orders');
    return response.data;
  },
  createPOSOrder: async (order: Omit<POSOrder, 'id'>) => {
    const response = await api.post<POSOrder>('/restaurant/pos/orders', order);
    return response.data;
  }
};

export default api;
