import React, { useState } from 'react';
import { Users, Search, Plus, Mail, Phone, MoreHorizontal, Building, ArrowUpRight, X, Pencil, Trash2 } from 'lucide-react';
import { Client } from '../types';
import { useData } from '../App';

const CRM: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>({});

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setFormData(client);
    } else {
      setFormData({ name: '', company: '', email: '', phone: '', status: 'ACTIVE', totalRevenue: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.company) return;

    if (formData.id) {
      // Edit
      updateClient(formData as Client);
    } else {
      // Add
      const newClient: Client = {
        ...formData as Client,
        id: `C-${Date.now()}`,
        status: 'ACTIVE',
        totalRevenue: 0
      };
      addClient(newClient);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus klien ini? Semua data terkait mungkin akan terpengaruh.')) {
      deleteClient(id);
    }
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Users className="text-blue-600" /> Manajemen Klien (CRM)</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola data pelanggan dan riwayat hubungan bisnis.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-500/30">
          <Plus size={18} /> Klien Baru
        </button>
      </div>

       {/* MODAL */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">{formData.id ? 'Edit Klien' : 'Tambah Klien Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Perusahaan</label>
                <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input required type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
                  <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                 <select className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none bg-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                    <option value="ACTIVE">Aktif</option>
                    <option value="INACTIVE">Non-Aktif</option>
                 </select>
              </div>
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 mt-2">Simpan Klien</button>
            </form>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Klien Aktif</div>
          <div className="text-2xl font-bold text-gray-900">{clients.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Klien Baru (Bulan Ini)</div>
          <div className="text-2xl font-bold text-green-600 flex items-center gap-1">+3 <ArrowUpRight size={16} /></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Pendapatan CRM</div>
          <div className="text-2xl font-bold text-blue-600">Rp {clients.reduce((sum, c) => sum + c.totalRevenue, 0).toLocaleString('id-ID')}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Cari nama, perusahaan, atau email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-white text-gray-700 font-semibold uppercase text-xs border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Nama Klien</th>
                <th className="px-6 py-4">Perusahaan</th>
                <th className="px-6 py-4">Kontak</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Total Revenue</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{client.name}</div>
                    <div className="text-xs text-gray-400">ID: {client.id}</div>
                  </td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2"><Building size={14} className="text-gray-400"/> {client.company}</div></td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs"><Mail size={12} className="text-gray-400"/> {client.email}</div>
                      <div className="flex items-center gap-2 text-xs"><Phone size={12} className="text-gray-400"/> {client.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${client.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {client.status === 'ACTIVE' ? 'Aktif' : 'Non-Aktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">Rp {client.totalRevenue.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <a href={`mailto:${client.email}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Kirim Email"><Mail size={16} /></a>
                       <button onClick={() => handleOpenModal(client)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="Edit"><Pencil size={16} /></button>
                       <button onClick={() => handleDelete(client.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Hapus"><Trash2 size={16} /></button>
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

export default CRM;