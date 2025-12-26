import React, { useState, useMemo } from 'react';
import { useLicense } from '../context/LicenseContext';
import { useData } from '../context/DataContext';
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  Briefcase,
  Calendar,
  Filter,
  Factory,
  Utensils,
  DollarSign,
  PieChart
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart as RePieChart, Pie, Cell, Legend
} from 'recharts';
import { Link } from 'react-router-dom';

// --- COMPONENTS ---

const KPICard: React.FC<{
  title: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  trend?: string;
  trendUp?: boolean;
}> = ({ title, value, subValue, icon, color, trend, trendUp }) => {
  const styles = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className={`p-3 rounded-lg border ${styles[color]}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full border ${trendUp ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
            {trendUp ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
            {trend}
          </div>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {subValue && <div className="text-xs text-gray-400 mt-1">{subValue}</div>}
    </div>
  );
};

// --- HELPERS ---

type DateFilter = 'MONTH' | 'QUARTER' | 'YEAR' | 'ALL';

const isInDateRange = (dateStr: string, filter: DateFilter): boolean => {
  const date = new Date(dateStr);
  const now = new Date();

  if (filter === 'ALL') return true;
  if (filter === 'YEAR') return date.getFullYear() === now.getFullYear();
  if (filter === 'MONTH') {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
  if (filter === 'QUARTER') {
    const currentQuarter = Math.floor((now.getMonth() + 3) / 3);
    const dateQuarter = Math.floor((date.getMonth() + 3) / 3);
    return dateQuarter === currentQuarter && date.getFullYear() === now.getFullYear();
  }
  return false;
};

const formatDateLabel = (dateStr: string, filter: DateFilter): string => {
  const date = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

  if (filter === 'MONTH') return `${date.getDate()} ${months[date.getMonth()]}`;
  return months[date.getMonth()]; // For Year/Quarter/All usually aggregate by month
};

// --- MAIN DASHBOARD ---

const Dashboard: React.FC = () => {
  const { license } = useLicense();
  const { transactions, invoices, clients, projects, productionOrders, posOrders } = useData();
  const [filter, setFilter] = useState<DateFilter>('MONTH');

  // --- 1. AGGREGATE DATA BASED ON FILTER ---

  const stats = useMemo(() => {
    // Filter Data
    const filteredTrx = transactions.filter(t => isInDateRange(t.date, filter));
    const filteredProd = productionOrders.filter(p => isInDateRange(p.date, filter));
    const filteredPOS = posOrders.filter(p => isInDateRange(p.date, filter));

    // Calculate Totals
    const totalIncome = filteredTrx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filteredTrx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpense;

    // Module Specifics
    const manufacturingCost = filteredProd.reduce((sum, p) => sum + p.totalCost, 0);
    const posRevenue = filteredPOS.reduce((sum, p) => sum + p.total, 0);
    const posCount = filteredPOS.length;

    // Previous Period (Rough Estimate for trends - simplifikasi)
    const prevIncome = totalIncome * 0.9; // Mock trend logic
    const trendIncome = ((totalIncome - prevIncome) / prevIncome) * 100;

    return {
      totalIncome, totalExpense, netProfit, trendIncome,
      manufacturingCost, posRevenue, posCount,
      filteredTrx, filteredProd
    };
  }, [transactions, productionOrders, posOrders, filter]);

  // --- 2. GENERATE CHART DATA ---

  const chartData = useMemo(() => {
    const grouped: Record<string, { name: string, income: number, expense: number }> = {};

    // Sort transactions by date
    const sortedTrx = [...stats.filteredTrx].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedTrx.forEach(t => {
      const label = formatDateLabel(t.date, filter);
      if (!grouped[label]) {
        grouped[label] = { name: label, income: 0, expense: 0 };
      }
      if (t.type === 'income') grouped[label].income += t.amount;
      else grouped[label].expense += t.amount;
    });

    return Object.values(grouped);
  }, [stats.filteredTrx, filter]);

  // Composition Data (Source of Income)
  const pieData = useMemo(() => {
    return [
      { name: 'POS / Resto', value: stats.posRevenue, color: '#F59E0B' }, // Orange
      { name: 'Invoice / Proyek', value: stats.totalIncome - stats.posRevenue, color: '#3B82F6' }, // Blue
    ].filter(d => d.value > 0);
  }, [stats]);


  // --- RENDER ---

  const isPlusAdvance = license?.addons.plus_advance;
  const isManufacturing = license?.addons.manufacturing;
  const isRestaurant = license?.addons.restaurant;

  return (
    <div className="space-y-6">

      {/* HEADER & FILTER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dasbor Eksekutif</h1>
          <p className="text-gray-500 text-sm mt-1">
            Ringkasan performa: <span className="font-semibold text-blue-600 uppercase">{filter === 'ALL' ? 'Semua Waktu' : filter === 'MONTH' ? 'Bulan Ini' : filter === 'QUARTER' ? 'Triwulan Ini' : 'Tahun Ini'}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          <Filter size={16} className="text-gray-400 ml-2" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as DateFilter)}
            className="bg-transparent text-sm font-medium text-gray-700 py-1.5 pr-8 pl-2 outline-none cursor-pointer hover:bg-gray-50 rounded"
          >
            <option value="MONTH">Bulan Ini</option>
            <option value="QUARTER">Triwulan (3 Bln)</option>
            <option value="YEAR">Tahunan</option>
            <option value="ALL">Semua Waktu</option>
          </select>
        </div>
      </div>

      {/* KPI CARDS (FINANCE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Pemasukan"
          value={`Rp ${stats.totalIncome.toLocaleString('id-ID')}`}
          trend={`${stats.trendIncome.toFixed(1)}%`}
          trendUp={stats.trendIncome >= 0}
          icon={<DollarSign size={24} />}
          color="blue"
        />
        <KPICard
          title="Total Pengeluaran"
          value={`Rp ${stats.totalExpense.toLocaleString('id-ID')}`}
          trend="vs periode lalu"
          trendUp={false} // Assume lower expense is better, but simplified here
          icon={<ArrowDownRight size={24} />}
          color="red"
        />
        <KPICard
          title="Laba Bersih"
          value={`Rp ${stats.netProfit.toLocaleString('id-ID')}`}
          trend={stats.netProfit > 0 ? "Profit" : "Loss"}
          trendUp={stats.netProfit > 0}
          icon={<TrendingUp size={24} />}
          color="green"
        />
        <KPICard
          title="Arus Kas (Cash Flow)"
          value={`Rp ${(stats.totalIncome - stats.totalExpense).toLocaleString('id-ID')}`}
          subValue="Saldo tersedia estimasi"
          icon={<Briefcase size={24} />}
          color="purple"
        />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" /> Tren Keuangan
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value / 1000}k`} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
                <Legend />
                <Area type="monotone" dataKey="income" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" name="Pemasukan" />
                <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" name="Pengeluaran" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <PieChart size={20} className="text-blue-600" /> Sumber Pemasukan
          </h3>
          <div className="flex-1 min-h-[250px] relative">
            {stats.totalIncome > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
                  <Legend verticalAlign="bottom" height={36} />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">Belum ada data pemasukan</div>
            )}
          </div>
        </div>
      </div>

      {/* MODULE SPECIFIC WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* 1. Manufacturing Widget */}
        {isManufacturing && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900 flex items-center gap-2"><Factory size={18} className="text-purple-600" /> Manufaktur</h4>
              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">Periode Ini</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Biaya Produksi</span>
                <span className="font-bold text-gray-900">Rp {stats.manufacturingCost.toLocaleString('id-ID')}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 border border-gray-100 rounded-lg">
                  <div className="text-xs text-gray-500 uppercase">Order</div>
                  <div className="font-bold text-lg">{stats.filteredProd.length}</div>
                </div>
                <div className="text-center p-2 border border-gray-100 rounded-lg">
                  <div className="text-xs text-gray-500 uppercase">Selesai</div>
                  <div className="font-bold text-lg text-green-600">{stats.filteredProd.filter(p => p.status === 'COMPLETED').length}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Restaurant Widget */}
        {isRestaurant && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900 flex items-center gap-2"><Utensils size={18} className="text-orange-600" /> Restoran (POS)</h4>
              <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full">Periode Ini</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                <span className="text-sm text-gray-600">Total Omzet POS</span>
                <span className="font-bold text-orange-700">Rp {stats.posRevenue.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Jumlah Transaksi</div>
                <div className="font-bold text-gray-900">{stats.posCount} Struk</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Rata-rata Order</div>
                <div className="font-bold text-gray-900">
                  Rp {stats.posCount > 0 ? (stats.posRevenue / stats.posCount).toLocaleString('id-ID') : 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. CRM & Projects Widget (Default or Plus Advance) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              {isPlusAdvance ? <Briefcase size={18} className="text-blue-600" /> : <Users size={18} className="text-blue-600" />}
              {isPlusAdvance ? 'Proyek & Klien' : 'Status Klien'}
            </h4>
            {isPlusAdvance && <Link to="/proyek" className="text-xs text-blue-600 hover:underline">Detail</Link>}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Klien Aktif</span>
              <span className="font-bold text-gray-900">{clients.length}</span>
            </div>

            {isPlusAdvance ? (
              <>
                <div className="h-px bg-gray-100 my-2"></div>
                <div className="space-y-3">
                  {projects.slice(0, 3).map(p => (
                    <div key={p.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-700 truncate max-w-[150px]">{p.name}</span>
                        <span className="text-blue-600 font-bold">{p.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${p.progress}%` }}></div>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && <p className="text-center text-gray-400 text-xs py-2">Tidak ada proyek aktif</p>}
                </div>
              </>
            ) : (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-xs text-blue-800 mb-2">Upgrade ke <b>Plus Advance</b> untuk manajemen proyek lengkap.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;