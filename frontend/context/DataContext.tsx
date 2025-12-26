import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Transaction, Invoice, Client, Project, Task, UserProfile, InvoiceSettings,
  RawMaterial, BOM, ProductionOrder, MenuItem, POSOrder, CalendarEvent,
  LicenseData, Addons
} from '../types';
import {
  authService, transactionService, invoiceService, clientService,
  projectService, taskService, calendarService, manufactureService,
  restaurantService, userService
} from '../services/api';

// --- MOCK DATA FOR INITIALIZATION ---
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'TRX-001', date: '2023-10-25', description: 'Pembayaran Invoice #INV-001', amount: 5000000, type: 'income', category: 'Penjualan' },
  { id: 'TRX-002', date: '2023-10-24', description: 'Beli Kertas A4', amount: 45000, type: 'expense', category: 'Perlengkapan Kantor' },
  { id: 'TRX-003', date: '2023-10-22', description: 'Biaya Listrik Oktober', amount: 1200000, type: 'expense', category: 'Utilitas' },
];

const INITIAL_INVOICES: Invoice[] = [
  { id: 'INV-2023-001', customerName: 'PT Teknologi Maju', date: '2023-10-25', dueDate: '2023-11-25', amount: 12500000, status: 'PENDING', items: [] },
  { id: 'INV-2023-002', customerName: 'CV Berkah Abadi', date: '2023-10-20', dueDate: '2023-11-20', amount: 3200000, status: 'PAID', items: [] },
];

const INITIAL_CLIENTS: Client[] = [
  { id: 'C-001', name: 'Budi Santoso', company: 'PT Teknologi Maju', email: 'budi@tekmaju.com', phone: '081234567890', status: 'ACTIVE', totalRevenue: 45000000 },
  { id: 'C-002', name: 'Siti Aminah', company: 'CV Berkah Abadi', email: 'siti@berkah.co.id', phone: '081987654321', status: 'ACTIVE', totalRevenue: 12500000 },
];

const INITIAL_PROJECTS: Project[] = [
  { id: 'P-001', name: 'Website Redesign', clientId: 'C-001', clientName: 'PT Teknologi Maju', status: 'IN_PROGRESS', progress: 75, dueDate: '2023-11-15', budget: 15000000 },
];

const INITIAL_PROFILE: UserProfile = {
  companyName: 'PT Maju Bersama',
  adminName: 'Budi Santoso',
  email: 'admin@majubersama.com'
};

const INITIAL_INVOICE_SETTINGS: InvoiceSettings = {
  paymentInfo: "Bank BCA: 123-456-7890\na/n PT Maju Bersama\n\nBank Mandiri: 987-654-3210\na/n PT Maju Bersama",
  hideWatermark: false,
  footerNote: "Terima kasih atas kepercayaan Anda.",
  signatureName: "Budi Santoso",
  city: "Jakarta",
  taxRate: 11 // Default 11%
};

const INITIAL_MENU: MenuItem[] = [
  { id: 'M01', name: 'Nasi Goreng Spesial', category: 'MAKANAN', price: 25000, cogs: 12000 },
  { id: 'M02', name: 'Ayam Bakar Madu', category: 'MAKANAN', price: 30000, cogs: 15000 },
  { id: 'M03', name: 'Mie Goreng Jawa', category: 'MAKANAN', price: 22000, cogs: 10000 },
  { id: 'M04', name: 'Es Teh Manis', category: 'MINUMAN', price: 5000, cogs: 1500 },
  { id: 'M05', name: 'Kopi Susu Gula Aren', category: 'MINUMAN', price: 18000, cogs: 6000 },
  { id: 'M06', name: 'Kentang Goreng', category: 'CEMILAN', price: 15000, cogs: 5000 },
];

// Mock Manufacturing Data
const INITIAL_MATERIALS: RawMaterial[] = [
  { id: 'RM-001', name: 'Kayu Jati Solid', unit: 'meter', costPerUnit: 150000, currentStock: 45, minStockAlert: 10 },
  { id: 'RM-002', name: 'Cat Varnish', unit: 'kaleng', costPerUnit: 85000, currentStock: 12, minStockAlert: 5 },
  { id: 'RM-003', name: 'Sekrup Baja 5cm', unit: 'pcs', costPerUnit: 500, currentStock: 1500, minStockAlert: 200 },
];

const INITIAL_BOMS: BOM[] = [
  {
    id: 'BOM-001',
    productName: 'Meja Makan Jati (Standard)',
    estimatedCost: 650000,
    items: [
      { materialId: 'RM-001', qtyRequired: 3.5 },
      { materialId: 'RM-002', qtyRequired: 1 },
      { materialId: 'RM-003', qtyRequired: 24 }
    ]
  },
];

const INITIAL_ORDERS: ProductionOrder[] = [
  { id: 'PO-2310-01', bomId: 'BOM-001', date: '2023-10-26', qtyProduced: 10, totalCost: 6500000, status: 'IN_PROGRESS' },
];

// --- GLOBAL DATA CONTEXT ---
interface DataContextType {
  userProfile: UserProfile;
  updateUserProfile: (p: UserProfile) => void;
  invoiceSettings: InvoiceSettings;
  updateInvoiceSettings: (s: InvoiceSettings) => void;
  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  invoices: Invoice[];
  addInvoice: (i: Invoice) => void;
  updateInvoice: (i: Invoice) => void;
  deleteInvoice: (id: string) => void;

  // Plus Advance (CRM, Projects, Calendar)
  clients: Client[];
  addClient: (c: Client) => void;
  updateClient: (c: Client) => void;
  deleteClient: (id: string) => void;

  projects: Project[];
  addProject: (p: Project) => void;
  updateProject: (p: Project) => void;
  deleteProject: (id: string) => void;

  tasks: Task[];
  addTask: (t: Task) => void;
  updateTask: (t: Task) => void;
  deleteTask: (id: string) => void;

  customEvents: CalendarEvent[];
  addCustomEvent: (e: CalendarEvent) => void;
  deleteCustomEvent: (id: string) => void;

  // Manufacturing
  materials: RawMaterial[];
  addMaterial: (m: RawMaterial) => void;
  updateMaterial: (m: RawMaterial) => void;
  deleteMaterial: (id: string) => void;
  boms: BOM[];
  addBOM: (b: BOM) => void;
  updateBOM: (b: BOM) => void;
  deleteBOM: (id: string) => void;
  productionOrders: ProductionOrder[];
  addProductionOrder: (o: ProductionOrder) => void;
  updateProductionOrder: (o: ProductionOrder) => void; // General update
  completeProductionOrder: (id: string) => { success: boolean, message: string }; // Logic to deduct stock

  // Restaurant
  menuItems: MenuItem[];
  addMenuItem: (m: MenuItem) => void;
  updateMenuItem: (m: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  menuCategories: string[];
  addCategory: (c: string) => void;
  deleteCategory: (c: string) => void;
  posOrders: POSOrder[];
  addPOSOrder: (o: POSOrder) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with default/empty values
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(INITIAL_INVOICE_SETTINGS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([]);

  // Manufacturing State
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [boms, setBoms] = useState<BOM[]>([]);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);

  // Restaurant State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuCategories, setMenuCategories] = useState<string[]>([]);
  const [posOrders, setPosOrders] = useState<POSOrder[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  // Load data from API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Execute all promises in parallel for better performance
        const [
          profileData, settingsData,
          trxData, invData, clientsData,
          projectsData, tasksData, calendarData,
          materialsData, bomsData, ordersData,
          menuData, categoriesData, posData
        ] = await Promise.all([
          userService.getProfile().catch(() => INITIAL_PROFILE),
          userService.getInvoiceSettings().catch(() => INITIAL_INVOICE_SETTINGS),
          transactionService.getAll().catch(() => []),
          invoiceService.getAll().catch(() => []),
          clientService.getAll().catch(() => []),
          projectService.getAll().catch(() => []),
          taskService.getAll().catch(() => []),
          calendarService.getAll().catch(() => []),
          manufactureService.getMaterials().catch(() => []),
          manufactureService.getBOMs().catch(() => []),
          manufactureService.getOrders().catch(() => []),
          restaurantService.getMenu().catch(() => []),
          restaurantService.getCategories().catch(() => []),
          restaurantService.getPOSOrders().catch(() => [])
        ]);

        setUserProfile(profileData);
        setInvoiceSettings(settingsData);
        setTransactions(trxData);
        setInvoices(invData);
        setClients(clientsData);
        setProjects(projectsData);
        setTasks(tasksData);
        setCustomEvents(calendarData);
        setMaterials(materialsData);
        setBoms(bomsData);
        setProductionOrders(ordersData);

        // Fix for categories sometimes returning objects instead of strings or empty
        const cleanCategories = Array.isArray(categoriesData) ? categoriesData : ['MAKANAN', 'MINUMAN', 'CEMILAN'];
        setMenuCategories(cleanCategories.length > 0 ? cleanCategories : ['MAKANAN', 'MINUMAN', 'CEMILAN']);

        setMenuItems(menuData);
        setPosOrders(posData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Action Helpers - Updated to call API
  const updateUserProfile = async (p: UserProfile) => {
    try {
      const updated = await userService.updateProfile(p);
      setUserProfile(updated);
    } catch (e) {
      console.error(e);
      // Fallback/optimistic update could be added here
      setUserProfile(p);
    }
  };

  const updateInvoiceSettings = async (s: InvoiceSettings) => {
    try {
      const updated = await userService.updateInvoiceSettings(s);
      setInvoiceSettings(updated);
    } catch (e) {
      console.error(e);
      setInvoiceSettings(s);
    }
  };

  const addTransaction = async (t: Transaction) => {
    try {
      // Remove ID if it's a temp ID or let API handle it
      const { id, ...data } = t;
      const newTrx = await transactionService.create(data as any);
      setTransactions(prev => [newTrx, ...prev]);
    } catch (e) {
      console.error(e);
    }
  };

  const updateTransaction = async (t: Transaction) => {
    try {
      const updated = await transactionService.update(t.id, t);
      setTransactions(prev => prev.map(item => item.id === t.id ? updated : item));
    } catch (e) { console.error(e); }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await transactionService.delete(id);
      setTransactions(prev => prev.filter(item => item.id !== id));
    } catch (e) { console.error(e); }
  };

  const addInvoice = async (i: Invoice) => {
    try {
      const { id, ...data } = i;
      const newInv = await invoiceService.create(data as any);
      setInvoices(prev => [newInv, ...prev]);
    } catch (e) { console.error(e); }
  };

  const updateInvoice = async (i: Invoice) => {
    try {
      const updated = await invoiceService.update(i.id, i);
      setInvoices(prev => prev.map(item => item.id === i.id ? updated : item));
    } catch (e) { console.error(e); }
  };

  const deleteInvoice = async (id: string) => {
    try {
      await invoiceService.delete(id);
      setInvoices(prev => prev.filter(item => item.id !== id));
    } catch (e) { console.error(e); }
  };

  // Plus Advance Actions
  const addClient = async (c: Client) => {
    try {
      const { id, ...data } = c;
      const newClient = await clientService.create(data as any);
      setClients(prev => [newClient, ...prev]);
    } catch (e) { console.error(e); }
  };

  const updateClient = async (c: Client) => {
    try {
      const updated = await clientService.update(c.id, c);
      setClients(prev => prev.map(item => item.id === c.id ? updated : item));
    } catch (e) { console.error(e); }
  };

  const deleteClient = async (id: string) => {
    try {
      await clientService.delete(id);
      setClients(prev => prev.filter(item => item.id !== id));
    } catch (e) { console.error(e); }
  };

  const addProject = async (p: Project) => {
    try {
      const { id, ...data } = p;
      const newProject = await projectService.create(data as any);
      setProjects(prev => [newProject, ...prev]);
    } catch (e) { console.error(e); }
  };

  const updateProject = async (p: Project) => {
    try {
      const updated = await projectService.update(p.id, p);
      setProjects(prev => prev.map(item => item.id === p.id ? updated : item));
    } catch (e) { console.error(e); }
  };

  const deleteProject = async (id: string) => {
    try {
      await projectService.delete(id);
      setProjects(prev => prev.filter(item => item.id !== id));
      setTasks(prev => prev.filter(t => t.projectId !== id));
    } catch (e) { console.error(e); }
  };

  const addTask = async (t: Task) => {
    try {
      const { id, ...data } = t;
      const newTask = await taskService.create(data as any);
      setTasks(prev => [newTask, ...prev]);
    } catch (e) { console.error(e); }
  };

  const updateTask = async (t: Task) => {
    try {
      const updated = await taskService.update(t.id, t);
      setTasks(prev => prev.map(item => item.id === t.id ? updated : item));
    } catch (e) { console.error(e); }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskService.delete(id);
      setTasks(prev => prev.filter(item => item.id !== id));
    } catch (e) { console.error(e); }
  };

  const addCustomEvent = async (e: CalendarEvent) => {
    try {
      const { id, ...data } = e;
      const newEvent = await calendarService.create(data as any);
      setCustomEvents(prev => [newEvent, ...prev]);
    } catch (e) { console.error(e); }
  };

  const deleteCustomEvent = async (id: string) => {
    try {
      await calendarService.delete(id);
      setCustomEvents(prev => prev.filter(e => e.id !== id));
    } catch (e) { console.error(e); }
  };

  // Manufacturing Actions
  const addMaterial = async (m: RawMaterial) => {
    try {
      const { id, ...data } = m;
      const newMaterial = await manufactureService.createMaterial(data as any);
      setMaterials(prev => [newMaterial, ...prev]);
    } catch (e) { console.error(e); }
  };

  const updateMaterial = async (m: RawMaterial) => {
    try {
      const updated = await manufactureService.updateMaterial(m.id, m);
      setMaterials(prev => prev.map(item => item.id === m.id ? updated : item));
    } catch (e) { console.error(e); }
  };

  const deleteMaterial = async (id: string) => {
    try {
      await manufactureService.deleteMaterial(id);
      setMaterials(prev => prev.filter(item => item.id !== id));
    } catch (e) { console.error(e); }
  };

  const addBOM = async (b: BOM) => {
    try {
      const { id, ...data } = b;
      const newBOM = await manufactureService.createBOM(data as any);
      setBoms(prev => [newBOM, ...prev]);
    } catch (e) { console.error(e); }
  };

  const updateBOM = async (b: BOM) => {
    try {
      const updated = await manufactureService.updateBOM(b.id, b);
      setBoms(prev => prev.map(item => item.id === b.id ? updated : item));
    } catch (e) { console.error(e); }
  };

  const deleteBOM = async (id: string) => {
    try {
      await manufactureService.deleteBOM(id);
      setBoms(prev => prev.filter(item => item.id !== id));
    } catch (e) { console.error(e); }
  };

  const addProductionOrder = async (o: ProductionOrder) => {
    try {
      const { id, ...data } = o;
      const newOrder = await manufactureService.createOrder(data as any);
      setProductionOrders(prev => [newOrder, ...prev]);
    } catch (e) { console.error(e); }
  };

  const updateProductionOrder = async (o: ProductionOrder) => {
    try {
      const updated = await manufactureService.updateOrder(o.id, o);
      setProductionOrders(prev => prev.map(item => item.id === o.id ? updated : item));
    } catch (e) { console.error(e); }
  };

  const completeProductionOrder = async (id: string): Promise<{ success: boolean, message: string }> => {
    try {
      const result = await manufactureService.completeOrder(id);

      // Update local state is a bit tricky because backend updates stocks too
      // So we better re-fetch materials and order
      const [updatedOrder, updatedMaterials] = await Promise.all([
        manufactureService.getOrders(),
        manufactureService.getMaterials()
      ]);

      setProductionOrders(updatedOrder);
      setMaterials(updatedMaterials);

      return { success: true, message: result.message || 'Order completed' };
    } catch (e: any) {
      console.error(e);
      return { success: false, message: e.response?.data?.error || 'Failed to complete order' };
    }
  };

  // Restaurant Actions
  const addMenuItem = async (m: MenuItem) => {
    try {
      const { id, ...data } = m;
      const newItem = await restaurantService.createMenuItem(data as any);
      setMenuItems(prev => [newItem, ...prev]);
    } catch (e) { console.error(e); }
  };

  const updateMenuItem = async (m: MenuItem) => {
    try {
      const updated = await restaurantService.updateMenuItem(m.id, m);
      setMenuItems(prev => prev.map(item => item.id === m.id ? updated : item));
    } catch (e) { console.error(e); }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      await restaurantService.deleteMenuItem(id);
      setMenuItems(prev => prev.filter(item => item.id !== id));
    } catch (e) { console.error(e); }
  };

  const addCategory = async (c: string) => {
    try {
      await restaurantService.addCategory(c);
      setMenuCategories(prev => [...prev, c]);
    } catch (e) { console.error(e); }
  };

  const deleteCategory = async (c: string) => {
    try {
      await restaurantService.deleteCategory(c);
      setMenuCategories(prev => prev.filter(cat => cat !== c));
    } catch (e) { console.error(e); }
  };

  const addPOSOrder = async (o: POSOrder) => {
    try {
      const { id, ...data } = o;
      const newOrder = await restaurantService.createPOSOrder(data as any);
      setPosOrders(prev => [newOrder, ...prev]);
    } catch (e) { console.error(e); }
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <DataContext.Provider value={{
      userProfile, updateUserProfile,
      invoiceSettings, updateInvoiceSettings,
      transactions, addTransaction, updateTransaction, deleteTransaction,
      invoices, addInvoice, updateInvoice, deleteInvoice,

      clients, addClient, updateClient, deleteClient,
      projects, addProject, updateProject, deleteProject,
      tasks, addTask, updateTask, deleteTask,
      customEvents, addCustomEvent, deleteCustomEvent,

      materials, addMaterial, updateMaterial, deleteMaterial,
      boms, addBOM, updateBOM, deleteBOM,
      productionOrders, addProductionOrder, updateProductionOrder, completeProductionOrder: completeProductionOrder as any,
      menuItems, addMenuItem, updateMenuItem, deleteMenuItem,
      menuCategories, addCategory, deleteCategory,
      posOrders, addPOSOrder
    }}>
      {children}
    </DataContext.Provider>
  );
};
