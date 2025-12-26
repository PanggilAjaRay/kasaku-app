import React, { useState } from 'react';
import { Plus, Download, Filter, Search, X, Pencil, Trash2 } from 'lucide-react';
import { Transaction } from '../types';
import { useData } from '../App';

const Transactions: React.FC = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useData();
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialForm = {
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: 'Umum',
    date: new Date().toISOString().split('T')[0]
  };
  const [formData, setFormData] = useState(initialForm);

  const handleOpenModal = (trx?: Transaction) => {
    if (trx) {
      setEditingId(trx.id);
      setFormData({
        description: trx.description,
        amount: trx.amount.toString(),
        type: trx.type,
        category: trx.category,
        date: trx.date
      });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      // Edit Mode
      const updatedTrx: Transaction = {
        id: editingId,
        description: formData.description,
        amount: parseInt(formData.amount),
        type: formData.type,
        category: formData.category,
        date: formData.date
      };
      updateTransaction(updatedTrx);
    } else {
      // Add Mode
      const newTrx: Transaction = {
        id: `TRX-${Date.now()}`,
        description: formData.description,
        amount: parseInt(formData.amount),
        type: formData.type,
        category: formData.category,
        date: formData.date
      };
      addTransaction(newTrx);
    }
    setIsModalOpen(false);
    setFormData(initialForm);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
      deleteTransaction(id);
    }
  };

  const handleExport = () => {
    const headers = ['ID', 'Tanggal', 'Keterangan', 'Kategori', 'Tipe', 'Jumlah'];
    const rows = filteredTransactions.map(t => [
      t.id,
      t.date,
      `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
      t.category,
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      t.amount
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transaksi_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesTab = activeTab === 'all' || t.type === activeTab;
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buku Transaksi</h1>
          <p className="text-gray-500 text-sm mt-1">Catat dan pantau setiap pemasukan dan pengeluaran.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            <Download size={18} /> Ekspor
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-500/30"
          >
            <Plus size={18} /> Catat Baru
          </button>
        </div>
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Transaksi' : 'Catat Transaksi'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Transaksi</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="type" checked={formData.type === 'income'} onChange={() => setFormData({...formData, type: 'income'})} className="text-blue-600" />
                    <span className="text-sm">Pemasukan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="type" checked={formData.type === 'expense'} onChange={() => setFormData({...formData, type: 'expense'})} className="text-red-600" />
                    <span className="text-sm">Pengeluaran</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
                <input required type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                  <input required type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <input required type="text" list="categories" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                  <datalist id="categories">
                    <option value="Penjualan" />
                    <option value="Perlengkapan Kantor" />
                    <option value="Gaji Karyawan" />
                    <option value="Utilitas" />
                  </datalist>
                </div>
              </div>
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 mt-2">
                {editingId ? 'Simpan Perubahan' : 'Simpan Transaksi'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50">
          <div className="flex bg-gray-200 p-1 rounded-lg">
            <button onClick={() => setActiveTab('all')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Semua</button>
            <button onClick={() => setActiveTab('income')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'income' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Pemasukan</button>
            <button onClick={() => setActiveTab('expense')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'expense' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Pengeluaran</button>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Cari transaksi..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4 text-right">Jumlah (IDR)</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{trx.date}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {trx.description}
                    {trx.projectId === 'RESTO-POS' && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">POS</span>}
                  </td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{trx.category}</span></td>
                  <td className={`px-6 py-4 text-right font-semibold ${trx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {trx.type === 'income' ? '+' : '-'} Rp {trx.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleOpenModal(trx)} 
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(trx.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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

export default Transactions;