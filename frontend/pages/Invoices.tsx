import React, { useState } from 'react';
import { Plus, Search, Printer, Filter, X, Trash2, CheckSquare } from 'lucide-react';
import { Invoice } from '../types';
import { Link } from 'react-router-dom';
import { useData } from '../App';

const Invoices: React.FC = () => {
  const { invoices, addInvoice, updateInvoice, deleteInvoice } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    amount: '',
    dueDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInvoice: Invoice = {
      id: `INV-${new Date().getFullYear()}-${invoices.length + 101}`,
      customerName: formData.customerName,
      date: new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate,
      amount: parseInt(formData.amount),
      status: 'PENDING',
      items: [] // Simplified for demo
    };
    addInvoice(newInvoice);
    setIsModalOpen(false);
    setFormData({ customerName: '', amount: '', dueDate: '' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus faktur ini?')) {
      deleteInvoice(id);
    }
  };

  const handleMarkPaid = (inv: Invoice) => {
    if (inv.status === 'PAID') return;
    if (window.confirm('Tandai faktur ini sebagai Lunas (Paid)?')) {
      updateInvoice({ ...inv, status: 'PAID' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-700 border-green-200';
      case 'PENDING': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'OVERDUE': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faktur Penjualan</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola tagihan pelanggan dan status pembayaran.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 shadow-sm shadow-blue-500/30">
          <Plus size={18} /> Buat Faktur Baru
        </button>
      </div>

       {/* MODAL */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Buat Faktur</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pelanggan</label>
                <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Tagihan (Rp)</label>
                <input required type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jatuh Tempo</label>
                <input required type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 mt-2">Simpan Faktur</button>
            </form>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
           <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Tagihan</div>
           <div className="text-2xl font-bold text-gray-900">Rp {invoices.reduce((a,b) => a+b.amount, 0).toLocaleString('id-ID')}</div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
           <div className="text-orange-600 text-xs font-semibold uppercase tracking-wider mb-1">Belum Dibayar</div>
           <div className="text-2xl font-bold text-gray-900">Rp {invoices.filter(i => i.status === 'PENDING').reduce((a,b) => a+b.amount, 0).toLocaleString('id-ID')}</div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
           <div className="text-red-600 text-xs font-semibold uppercase tracking-wider mb-1">Lewat Jatuh Tempo</div>
           <div className="text-2xl font-bold text-gray-900">Rp {invoices.filter(i => i.status === 'OVERDUE').reduce((a,b) => a+b.amount, 0).toLocaleString('id-ID')}</div>
         </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Cari No. Faktur atau Klien..." className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
          </div>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Filter size={18} /></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">No. Faktur</th>
                <th className="px-6 py-4">Pelanggan</th>
                <th className="px-6 py-4">Jatuh Tempo</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-blue-600">{inv.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{inv.customerName}</td>
                  <td className="px-6 py-4">{inv.dueDate}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(inv.status)}`}>{inv.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">Rp {inv.amount.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-right">
                     <div className="flex items-center justify-end gap-2">
                        {inv.status !== 'PAID' && (
                          <button 
                            onClick={() => handleMarkPaid(inv)} 
                            className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                            title="Tandai Lunas"
                          >
                            <CheckSquare size={16} />
                          </button>
                        )}
                        <Link to={`/print/invoice/${inv.id}`} className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Cetak PDF">
                          <Printer size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(inv.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Invoices;