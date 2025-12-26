import React, { useState, useEffect } from 'react';
import { 
  Factory, 
  Package, 
  ClipboardList, 
  Plus, 
  Search, 
  AlertTriangle, 
  MoreHorizontal, 
  ArrowRight,
  Calculator,
  Hammer,
  X,
  Trash2,
  Pencil,
  CheckCircle,
  PlayCircle,
  StopCircle
} from 'lucide-react';
import { RawMaterial, BOM, ProductionOrder, BOMItem } from '../types';
import { useData } from '../App';

const Manufacturing: React.FC = () => {
  const { 
    materials, addMaterial, updateMaterial, deleteMaterial,
    boms, addBOM, updateBOM, deleteBOM,
    productionOrders, addProductionOrder, updateProductionOrder, completeProductionOrder
  } = useData();

  const [activeTab, setActiveTab] = useState<'inventory' | 'bom' | 'production'>('inventory');
  
  // Modals
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showBOMModal, setShowBOMModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Forms State
  const [materialForm, setMaterialForm] = useState<Partial<RawMaterial>>({});
  const [bomForm, setBomForm] = useState<Partial<BOM> & { items: BOMItem[] }>({ items: [] });
  const [orderForm, setOrderForm] = useState<{ bomId: string, qty: string, date: string }>({ bomId: '', qty: '', date: new Date().toISOString().split('T')[0] });

  // --- Inventory Handlers ---
  const handleOpenMaterial = (m?: RawMaterial) => {
    if (m) {
      setMaterialForm(m);
    } else {
      setMaterialForm({ 
        name: '', unit: 'pcs', costPerUnit: 0, currentStock: 0, minStockAlert: 10 
      });
    }
    setShowMaterialModal(true);
  };

  const saveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialForm.name) return;
    
    if (materialForm.id) {
      updateMaterial(materialForm as RawMaterial);
    } else {
      addMaterial({ 
        ...materialForm, 
        id: `RM-${Date.now()}` 
      } as RawMaterial);
    }
    setShowMaterialModal(false);
  };

  // --- BOM Handlers ---
  const handleOpenBOM = (b?: BOM) => {
    if (b) {
      setBomForm(JSON.parse(JSON.stringify(b))); // Deep copy
    } else {
      setBomForm({ productName: '', estimatedCost: 0, items: [] });
    }
    setShowBOMModal(true);
  };

  const addBOMItemLine = () => {
    setBomForm(prev => ({
      ...prev,
      items: [...prev.items, { materialId: materials[0]?.id || '', qtyRequired: 1 }]
    }));
  };

  const removeBOMItemLine = (index: number) => {
    setBomForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateBOMItem = (index: number, field: keyof BOMItem, value: any) => {
    const newItems = [...bomForm.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setBomForm({ ...bomForm, items: newItems });
  };

  // Calculate estimated cost live
  const calculatedCost = bomForm.items.reduce((sum, item) => {
    const mat = materials.find(m => m.id === item.materialId);
    return sum + (mat ? mat.costPerUnit * item.qtyRequired : 0);
  }, 0);

  const saveBOM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bomForm.productName) return;

    const bomData = {
      ...bomForm,
      estimatedCost: calculatedCost
    };

    if (bomForm.id) {
      updateBOM(bomData as BOM);
    } else {
      addBOM({ ...bomData, id: `BOM-${Date.now()}` } as BOM);
    }
    setShowBOMModal(false);
  };

  // --- Production Order Handlers ---
  const handleOpenOrder = () => {
    setOrderForm({ bomId: boms[0]?.id || '', qty: '1', date: new Date().toISOString().split('T')[0] });
    setShowOrderModal(true);
  };

  const saveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const bom = boms.find(b => b.id === orderForm.bomId);
    if (!bom) return;

    const qty = parseInt(orderForm.qty);
    const newOrder: ProductionOrder = {
      id: `PO-${Date.now()}`,
      bomId: orderForm.bomId,
      date: orderForm.date,
      qtyProduced: qty,
      totalCost: bom.estimatedCost * qty,
      status: 'PLANNED'
    };
    addProductionOrder(newOrder);
    setShowOrderModal(false);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    const order = productionOrders.find(o => o.id === id);
    if (!order) return;
    
    if (newStatus === 'COMPLETED') {
        const result = completeProductionOrder(id);
        if (!result.success) {
            alert(result.message);
            return;
        }
    } else {
        updateProductionOrder({ ...order, status: newStatus as any });
    }
  };

  // Helpers
  const getMaterialName = (id: string) => materials.find(m => m.id === id)?.name || id;
  const getBOMName = (id: string) => boms.find(b => b.id === id)?.productName || id;
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PLANNED': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'CANCELED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Factory className="text-blue-600" />
            Manufaktur & Produksi
          </h1>
          <p className="text-gray-500 text-sm mt-1">Kelola bahan baku, resep produk, dan pantau proses produksi.</p>
        </div>
        <div className="flex gap-2">
           {activeTab === 'inventory' && (
             <button onClick={() => handleOpenMaterial()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">
               <Plus size={18} /> Bahan Baru
             </button>
           )}
           {activeTab === 'bom' && (
             <button onClick={() => handleOpenBOM()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">
               <Plus size={18} /> Resep Baru
             </button>
           )}
           {activeTab === 'production' && (
             <button onClick={handleOpenOrder} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">
               <Plus size={18} /> Produksi Baru
             </button>
           )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button onClick={() => setActiveTab('inventory')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'inventory' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            <Package size={18} /> Inventaris Bahan Baku
          </button>
          <button onClick={() => setActiveTab('bom')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'bom' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            <Calculator size={18} /> Bill of Materials (BOM)
          </button>
          <button onClick={() => setActiveTab('production')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'production' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            <Hammer size={18} /> Perintah Produksi
          </button>
        </nav>
      </div>

      {/* --- CONTENT --- */}
      <div className="min-h-[400px]">
        
        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
             {/* ... Search bar skipped for brevity, same as previous ... */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Kode</th>
                    <th className="px-6 py-4">Nama Bahan</th>
                    <th className="px-6 py-4 text-center">Satuan</th>
                    <th className="px-6 py-4 text-right">Harga / Unit</th>
                    <th className="px-6 py-4 text-center">Stok</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {materials.map((item) => {
                    const isLowStock = item.currentStock <= item.minStockAlert;
                    return (
                      <tr key={item.id} className={`${isLowStock ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}>
                        <td className="px-6 py-4 font-mono text-xs">{item.id}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 text-center">{item.unit}</td>
                        <td className="px-6 py-4 text-right">Rp {item.costPerUnit.toLocaleString('id-ID')}</td>
                        <td className={`px-6 py-4 text-center font-bold ${isLowStock ? 'text-red-700 text-lg' : 'text-gray-900'}`}>{item.currentStock}</td>
                        <td className="px-6 py-4 text-center">
                          {isLowStock ? <span className="text-xs font-bold text-red-700 flex justify-center items-center gap-1"><AlertTriangle size={12}/> KRITIS</span> : <span className="text-xs font-medium text-green-700">Aman</span>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                             <button onClick={() => handleOpenMaterial(item)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"><Pencil size={16}/></button>
                             <button onClick={() => deleteMaterial(item.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded"><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BOM TAB */}
        {activeTab === 'bom' && (
          <div className="grid grid-cols-1 gap-6">
            {boms.map((bom) => (
              <div key={bom.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><ClipboardList size={20} /></div>
                    <div>
                      <h3 className="font-bold text-gray-900">{bom.productName}</h3>
                      <p className="text-xs text-gray-500">ID: {bom.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Est. HPP / Unit</p>
                    <p className="font-bold text-gray-900">Rp {bom.estimatedCost.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Komposisi Bahan:</h4>
                  <div className="space-y-2">
                    {bom.items.map((item, idx) => {
                      const mat = materials.find(m => m.id === item.materialId);
                      return (
                        <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                           <span className="text-gray-700 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div> {mat?.name || item.materialId}</span>
                           <span className="font-medium text-gray-900">{item.qtyRequired} {mat?.unit}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 text-right flex justify-end gap-3">
                   <button onClick={() => handleOpenBOM(bom)} className="text-sm text-blue-600 font-medium hover:text-blue-800">Edit Resep</button>
                   <button onClick={() => deleteBOM(bom.id)} className="text-sm text-red-600 font-medium hover:text-red-800">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PRODUCTION TAB */}
        {activeTab === 'production' && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">ID Produksi</th>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Produk</th>
                    <th className="px-6 py-4 text-center">Output</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Total Biaya</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {productionOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-xs text-blue-600 font-medium">{po.id}</td>
                      <td className="px-6 py-4">{po.date}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{getBOMName(po.bomId)}</td>
                      <td className="px-6 py-4 text-center">{po.qtyProduced} Unit</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(po.status)}`}>
                          {po.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">Rp {po.totalCost.toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2">
                            {po.status === 'PLANNED' && (
                                <button onClick={() => handleStatusChange(po.id, 'IN_PROGRESS')} className="p-1 text-blue-600 hover:bg-blue-100 rounded" title="Mulai"><PlayCircle size={18}/></button>
                            )}
                            {po.status === 'IN_PROGRESS' && (
                                <button onClick={() => handleStatusChange(po.id, 'COMPLETED')} className="p-1 text-green-600 hover:bg-green-100 rounded" title="Selesaikan & Kurangi Stok"><CheckCircle size={18}/></button>
                            )}
                            {po.status !== 'COMPLETED' && (
                                <button onClick={() => handleStatusChange(po.id, 'CANCELED')} className="p-1 text-red-600 hover:bg-red-100 rounded" title="Batalkan"><StopCircle size={18}/></button>
                            )}
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      
      {/* Material Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-bold">{materialForm.id ? 'Edit Bahan Baku' : 'Tambah Bahan Baku'}</h2>
                 <button onClick={() => setShowMaterialModal(false)}><X size={20} className="text-gray-400"/></button>
              </div>
              <form onSubmit={saveMaterial} className="space-y-4">
                 <input placeholder="Nama Bahan" required className="w-full border p-2 rounded bg-white" value={materialForm.name} onChange={e => setMaterialForm({...materialForm, name: e.target.value})} />
                 <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Satuan (kg, ltr)" required className="w-full border p-2 rounded bg-white" value={materialForm.unit} onChange={e => setMaterialForm({...materialForm, unit: e.target.value})} />
                    <input type="number" placeholder="Harga / Unit" required className="w-full border p-2 rounded bg-white" value={materialForm.costPerUnit} onChange={e => setMaterialForm({...materialForm, costPerUnit: parseFloat(e.target.value)})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="Stok Saat Ini" required className="w-full border p-2 rounded bg-white" value={materialForm.currentStock} onChange={e => setMaterialForm({...materialForm, currentStock: parseFloat(e.target.value)})} />
                    <input type="number" placeholder="Alert Min. Stok" required className="w-full border p-2 rounded bg-white" value={materialForm.minStockAlert} onChange={e => setMaterialForm({...materialForm, minStockAlert: parseFloat(e.target.value)})} />
                 </div>
                 <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium">Simpan</button>
              </form>
           </div>
        </div>
      )}

      {/* BOM Modal */}
      {showBOMModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-bold">{bomForm.id ? 'Edit Resep (BOM)' : 'Buat Resep Baru'}</h2>
                 <button onClick={() => setShowBOMModal(false)}><X size={20} className="text-gray-400"/></button>
              </div>
              <form onSubmit={saveBOM} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium mb-1">Nama Produk Jadi</label>
                    <input required className="w-full border p-2 rounded bg-white" value={bomForm.productName} onChange={e => setBomForm({...bomForm, productName: e.target.value})} />
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium mb-2">Komposisi Bahan</label>
                    {bomForm.items.map((item, idx) => (
                       <div key={idx} className="flex gap-2 mb-2">
                          <select className="flex-1 border p-2 rounded bg-white" value={item.materialId} onChange={e => updateBOMItem(idx, 'materialId', e.target.value)}>
                             {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit}) - Rp {m.costPerUnit}</option>)}
                          </select>
                          <input type="number" className="w-20 border p-2 rounded bg-white" placeholder="Qty" value={item.qtyRequired} onChange={e => updateBOMItem(idx, 'qtyRequired', parseFloat(e.target.value))} />
                          <button type="button" onClick={() => removeBOMItemLine(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                       </div>
                    ))}
                    <button type="button" onClick={addBOMItemLine} className="text-sm text-blue-600 font-medium flex items-center gap-1 mt-2"><Plus size={16}/> Tambah Bahan</button>
                 </div>

                 <div className="bg-gray-100 p-3 rounded-lg flex justify-between items-center">
                    <span className="font-medium text-gray-700">Estimasi HPP:</span>
                    <span className="font-bold text-xl text-gray-900">Rp {calculatedCost.toLocaleString('id-ID')}</span>
                 </div>

                 <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium">Simpan Resep</button>
              </form>
           </div>
        </div>
      )}

      {/* Production Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-bold">Mulai Produksi Baru</h2>
                 <button onClick={() => setShowOrderModal(false)}><X size={20} className="text-gray-400"/></button>
              </div>
              <form onSubmit={saveOrder} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium mb-1">Pilih Produk (BOM)</label>
                    <select className="w-full border p-2 rounded bg-white" value={orderForm.bomId} onChange={e => setOrderForm({...orderForm, bomId: e.target.value})}>
                       {boms.map(b => <option key={b.id} value={b.id}>{b.productName}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Jumlah Produksi</label>
                    <input type="number" required className="w-full border p-2 rounded bg-white" value={orderForm.qty} onChange={e => setOrderForm({...orderForm, qty: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
                    <input type="date" required className="w-full border p-2 rounded bg-white" value={orderForm.date} onChange={e => setOrderForm({...orderForm, date: e.target.value})} />
                 </div>
                 <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium">Buat Perintah Produksi</button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};

export default Manufacturing;