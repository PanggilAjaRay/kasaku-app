import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import {
  LayoutDashboard,
  Receipt,
  ArrowRightLeft,
  Settings,
  User,
  Briefcase,
  Utensils,
  Factory,
  Calendar,
  Users,
  AlertTriangle,
  Lock,
  Menu
} from 'lucide-react';
import { NavItem } from './types';

// Context Imports
import { AuthProvider, useAuth } from './context/AuthContext';
import { LicenseProvider, useLicense } from './context/LicenseContext';
import { DataProvider, useData } from './context/DataContext';

// Pages
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Invoices from './pages/Invoices';
import InvoicePrint from './pages/InvoicePrint';
import ReceiptPrint from './pages/ReceiptPrint';
import Profile from './pages/Profile';
import SettingsPage from './pages/Settings';
import Manufacturing from './pages/Manufacturing';
import Restaurant from './pages/Restaurant';
import CRM from './pages/CRM';
import Projects from './pages/Projects';
import CalendarPage from './pages/Calendar';

// --- LAYOUT & APP ---

const Sidebar: React.FC<{ mobileOpen: boolean, setMobileOpen: (open: boolean) => void }> = ({ mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const { license } = useLicense();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dasbor Eksekutif', icon: <LayoutDashboard size={20} />, path: '/' },
    { id: 'transaksi', label: 'Transaksi', icon: <ArrowRightLeft size={20} />, path: '/transaksi' },
    { id: 'faktur', label: 'Faktur & Invoice', icon: <Receipt size={20} />, path: '/faktur' },
    { id: 'crm', label: 'Manajemen Klien', icon: <Users size={20} />, path: '/crm', addonRequired: 'plus_advance' },
    { id: 'proyek', label: 'Proyek & Tugas', icon: <Briefcase size={20} />, path: '/proyek', addonRequired: 'plus_advance' },
    { id: 'kalender', label: 'Kalender', icon: <Calendar size={20} />, path: '/kalender', addonRequired: 'plus_advance' },
    { id: 'produksi', label: 'Manufaktur', icon: <Factory size={20} />, path: '/manufaktur', addonRequired: 'manufacturing' },
    { id: 'resto', label: 'Restoran', icon: <Utensils size={20} />, path: '/restoran', addonRequired: 'restaurant' },
    { id: 'profil', label: 'Profil & Langganan', icon: <User size={20} />, path: '/profil' },
    { id: 'pengaturan', label: 'Pengaturan', icon: <Settings size={20} />, path: '/pengaturan' },
  ];

  const visibleItems = navItems.filter(item => {
    if (!item.addonRequired) return true;
    return license?.addons[item.addonRequired];
  });

  return (
    <>
      {mobileOpen && (<div className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden" onClick={() => setMobileOpen(false)} />)}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 no-print`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-orange-500">Kasaku</div>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {visibleItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.id} to={item.path} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                {item.icon} {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

const Header: React.FC<{ toggleMobile: () => void }> = ({ toggleMobile }) => {
  const { license, extendLicense } = useLicense();
  const { userProfile } = useData();
  const showWarning = license && license.days_left <= 7 && license.days_left > 0;

  // Initials for avatar
  const initials = userProfile.companyName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10 no-print">
      <button onClick={toggleMobile} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md md:hidden"><Menu size={24} /></button>
      <div className="flex-1 flex justify-end items-center gap-4">
        {showWarning && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-xs font-medium border border-orange-200">
            <AlertTriangle size={14} />
            <span>Lisensi berakhir dalam {license.days_left} hari</span>
            <button onClick={extendLicense} className="ml-2 text-orange-800 underline hover:text-orange-900 font-bold">Perpanjang</button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-gray-900">{userProfile.companyName}</div>
            <div className="text-xs text-gray-500">{license?.plan} Plan</div>
          </div>
          <div className="h-9 w-9 rounded-full overflow-hidden shadow-sm border border-gray-200">
            {userProfile.avatar ? (
              <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-orange-400 flex items-center justify-center text-white font-bold">
                {initials}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const LockScreen: React.FC = () => {
  const { license, extendLicense } = useLicense();
  if (!license) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-95 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6"><Lock className="w-8 h-8 text-red-600" /></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Terkunci</h2>
        <p className="text-gray-600 mb-6">{license.status === 'EXPIRED' || license.days_left <= 0 ? 'Masa aktif langganan habis.' : 'Akun ditangguhkan.'}</p>
        <button onClick={extendLicense} className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">Perpanjang Langganan</button>
      </div>
    </div>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { license, loading } = useLicense();
  const location = useLocation();

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  const isLocked = license && (license.status !== 'OK' || license.days_left <= 0);
  if (location.pathname.startsWith('/print/')) return <div className="bg-white min-h-screen">{children}</div>;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {isLocked && <LockScreen />}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header toggleMobile={() => setMobileOpen(!mobileOpen)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">{children}</main>
      </div>
    </div>
  );
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/*" element={
            <PrivateRoute>
              <LicenseProvider>
                <DataProvider>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/transaksi" element={<Transactions />} />
                      <Route path="/faktur" element={<Invoices />} />
                      <Route path="/print/invoice/:id" element={<InvoicePrint />} />
                      <Route path="/print/receipt/:id" element={<ReceiptPrint />} />
                      <Route path="/profil" element={<Profile />} />
                      <Route path="/pengaturan" element={<SettingsPage />} />
                      <Route path="/manufaktur" element={<Manufacturing />} />
                      <Route path="/restoran" element={<Restaurant />} />
                      <Route path="/crm" element={<CRM />} />
                      <Route path="/proyek" element={<Projects />} />
                      <Route path="/kalender" element={<CalendarPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                </DataProvider>
              </LicenseProvider>
            </PrivateRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;