import React, { useState } from 'react';
import { Utensils, ChefHat, ShoppingBag, Search, Plus, Minus, Trash2, CreditCard, AlertCircle, Printer, X, Pencil, Filter, CheckCircle } from 'lucide-react';
import { MenuItem, CartItem, Transaction, POSOrder } from '../types';
import { useData } from '../App';
import { Link } from 'react-router-dom';

const Restaurant: React.FC = () => {
  const { 
    addTransaction, 
    invoiceSettings, 
    menuItems, addMenuItem, updateMenuItem, deleteMenuItem,
    menuCategories, addCategory, deleteCategory,
    addPOSOrder
  } = useData();
  
  const [activeTab, setActiveTab] = useState<'pos' | 'menu'>('pos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  
  // Menu Modal State
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [menuForm, setMenuForm] = useState<Partial<MenuItem>>({});
  
  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Checkout Success Modal
  const [successOrder, setSuccessOrder] = useState<POSOrder | null>(null);

  // --- POS LOGIC ---

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));
  
  const subTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const taxAmount = subTotal * (invoiceSettings.taxRate / 100);
  const cartTotal = subTotal + taxAmount;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const date = new Date().toISOString().split('T')[0];
    const orderId = `POS-${Date.now()}`;

    // 1. Create Transaction (Financial Record)
    const newTransaction: Transaction = {
      id: orderId,
      date: date,
      description: `Penjualan POS #${orderId.slice(-6)}`,
      amount: cartTotal,
      type: 'income',
      category: 'Penjualan Restoran',
      projectId: 'RESTO-POS'
    };
    addTransaction(newTransaction);

    // 2. Create POS Order (Receipt Record)
    const newOrder: POSOrder = {
      id: orderId,
      date: date,
      items: [...cart],
      subtotal: subTotal,
      tax: taxAmount,
      total: cartTotal,
      paymentMethod: 'CASH'
    };
    addPOSOrder(newOrder);

    setSuccessOrder(newOrder);
    setCart([]);
  };

  // --- MENU MANAGEMENT LOGIC ---

  const handleOpenMenuModal = (item?: MenuItem) => {
    if (item) {
      setMenuForm(item);
    } else {
      setMenuForm({ name: '', category: menuCategories[0] || 'MAKANAN', price: 0, cogs: 0 });
    }
    setIsMenuModalOpen(true);
  };

  const handleSaveMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuForm.name || !menuForm.category) return;

    if (menuForm.id) {
       updateMenuItem(menuForm as MenuItem);
    } else {
       addMenuItem({ ...menuForm, id: `M-${Date.now()}` } as MenuItem);
    }
    setIsMenuModalOpen(false);
  };

  const handleDeleteMenu = (id: string) => {
    if (window.confirm('Hapus menu ini?')) deleteMenuItem(id);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName && !menuCategories.includes(newCategoryName)) {
      addCategory(newCategoryName);
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
    }
  };

  const handleDeleteCategory = (cat: string) => {
    if (window.confirm(`Hapus kategori "${cat}"? Menu dengan kategori ini mungkin perlu diupdate.`)) {
      deleteCategory(cat);
      if (categoryFilter === cat) setCategoryFilter('ALL');
    }
  };

  const filteredMenu = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Utensils className="text-blue-600" /> Restoran & POS</h1>
          <p className="text-gray-500 text-sm mt-1">Point of Sale kasir dan manajemen menu.</p>
        </div>
        <div className="bg-gray-100 p-1 rounded-lg flex">
          <button onClick={() => setActiveTab('pos')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'pos' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}><span className="flex items-center gap-2"><ShoppingBag size={16} /> Kasir (POS)</span></button>
          <button onClick={() => setActiveTab('menu')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'menu' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}><span className="flex items-center gap-2"><ChefHat size={16} /> Menu & Resep</span></button>
        </div>
      </div>

      {activeTab === 'pos' && (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
          {/* POS MENU SECTION */}
          <div className="flex-1 flex flex-col gap-4">
             <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="Cari menu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                </div>
                {/* Dynamic Category Filter */}
                <select className="bg-white border border-gray-200 rounded-xl px-4 text-sm font-medium outline-none max-w-[150px]" value={categoryFilter} onChange={(e: any) => setCategoryFilter(e.target.value)}>
                  <option value="ALL">Semua Kategori</option>
                  {menuCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
             </div>
             <div className="flex-1 overflow-y-auto pr-2">
               <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                 {filteredMenu.map(item => (
                   <button key={item.id} onClick={() => addToCart(item)} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left flex flex-col justify-between h-32 group">
                     <div><div className="font-bold text-gray-900 line-clamp-2 mb-1">{item.name}</div><div className="text-xs text-gray-500">{item.category}</div></div>
                     <div className="flex justify-between items-end"><span className="font-semibold text-blue-600">Rp {item.price.toLocaleString('id-ID')}</span><div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"><Plus size={16} /></div></div>
                   </button>
                 ))}
               </div>
             </div>
          </div>

          {/* POS CART SECTION */}
          <div className="w-full lg:w-96 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><ShoppingBag size={20} className="text-gray-600"/> Pesanan Baru</h2>
              <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{cart.reduce((a, b) => a + b.qty, 0)} Item</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center"><ShoppingBag size={48} className="mb-2 opacity-20" /><p>Keranjang kosong</p></div> : cart.map(item => (
                <div key={item.id} className="flex gap-3">
                   <div className="flex-1"><div className="font-medium text-gray-900 text-sm">{item.name}</div><div className="text-xs text-gray-500">Rp {item.price.toLocaleString('id-ID')}</div></div>
                   <div className="flex items-center gap-3"><button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"><Minus size={12}/></button><span className="text-sm font-semibold w-4 text-center">{item.qty}</span><button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200"><Plus size={12}/></button></div>
                   <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 pl-2"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-medium">Rp {subTotal.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Pajak ({invoiceSettings.taxRate}%)</span><span className="font-medium">Rp {taxAmount.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200"><span>Total</span><span>Rp {cartTotal.toLocaleString('id-ID')}</span></div>
              </div>
              <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/20 disabled:bg-gray-300 disabled:shadow-none transition-all flex justify-center items-center gap-2"><CreditCard size={18} /> Bayar Sekarang</button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS CHECKOUT MODAL */}
      {successOrder && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600"><CheckCircle size={32} /></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h2>
              <p className="text-gray-600 mb-6">Total Transaksi: <span className="font-bold">Rp {successOrder.total.toLocaleString('id-ID')}</span></p>
              
              <div className="flex flex-col gap-3">
                 <Link to={`/print/receipt/${successOrder.id}`} target="_blank" className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                   <Printer size={18} /> Cetak Nota
                 </Link>
                 <button onClick={() => setSuccessOrder(null)} className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">Tutup</button>
              </div>
           </div>
         </div>
      )}

      {/* MENU MANAGEMENT TAB */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Daftar Menu</h2>
            <div className="flex gap-2">
              <button onClick={() => setIsCategoryModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"><Filter size={16} /> Kelola Kategori</button>
              <button onClick={() => handleOpenMenuModal()} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"><Plus size={16} /> Tambah Menu</button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs">
                    <tr><th className="px-6 py-4">Nama Menu</th><th className="px-6 py-4">Kategori</th><th className="px-6 py-4 text-right">Harga Jual</th><th className="px-6 py-4 text-right">HPP (COGS)</th><th className="px-6 py-4 text-center">Margin</th><th className="px-6 py-4 text-center">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredMenu.map((item) => {
                      const margin = item.price - item.cogs;
                      const marginPercent = item.price > 0 ? Math.round((margin / item.price) * 100) : 0;
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                          <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">{item.category}</span></td>
                          <td className="px-6 py-4 text-right">Rp {item.price.toLocaleString('id-ID')}</td>
                          <td className="px-6 py-4 text-right text-orange-600">Rp {item.cogs.toLocaleString('id-ID')}</td>
                          <td className="px-6 py-4 text-center"><div className="flex items-center justify-center gap-2"><span className={`font-bold ${marginPercent < 30 ? 'text-red-600' : 'text-green-600'}`}>{marginPercent}%</span>{marginPercent < 30 && <AlertCircle size={14} className="text-red-500" />}</div></td>
                          <td className="px-6 py-4 text-center">
                             <div className="flex justify-center gap-2">
                                <button onClick={() => handleOpenMenuModal(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={16} /></button>
                                <button onClick={() => handleDeleteMenu(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                             </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
             </div>
          </div>
        </div>
      )}

      {/* MODAL: Add/Edit Menu */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-bold">{menuForm.id ? 'Edit Menu' : 'Tambah Menu Baru'}</h2>
                 <button onClick={() => setIsMenuModalOpen(false)}><X size={20} className="text-gray-400"/></button>
              </div>
              <form onSubmit={handleSaveMenu} className="space-y-4">
                 <input placeholder="Nama Menu" required className="w-full border p-2 rounded bg-white" value={menuForm.name} onChange={e => setMenuForm({...menuForm, name: e.target.value})} />
                 <select className="w-full border p-2 rounded bg-white" value={menuForm.category} onChange={e => setMenuForm({...menuForm, category: e.target.value})}>
                    {menuCategories.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs text-gray-500 mb-1 block">Harga Jual</label>
                       <input type="number" required className="w-full border p-2 rounded bg-white" value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: parseFloat(e.target.value)})} />
                    </div>
                    <div>
                       <label className="text-xs text-gray-500 mb-1 block">HPP (Modal)</label>
                       <input type="number" required className="w-full border p-2 rounded bg-white" value={menuForm.cogs} onChange={e => setMenuForm({...menuForm, cogs: parseFloat(e.target.value)})} />
                    </div>
                 </div>
                 <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium">Simpan Menu</button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL: Manage Categories */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-bold">Kelola Kategori</h2>
                 <button onClick={() => setIsCategoryModalOpen(false)}><X size={20} className="text-gray-400"/></button>
              </div>
              
              <div className="mb-4 space-y-2">
                 {menuCategories.map(cat => (
                    <div key={cat} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                       <span className="text-sm font-medium">{cat}</span>
                       <button onClick={() => handleDeleteCategory(cat)} className="text-red-500 hover:bg-red-100 p-1 rounded"><Trash2 size={14}/></button>
                    </div>
                 ))}
              </div>

              <form onSubmit={handleSaveCategory} className="flex gap-2">
                 <input placeholder="Kategori Baru..." required className="flex-1 border p-2 rounded bg-white text-sm" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value.toUpperCase())} />
                 <button type="submit" className="bg-blue-600 text-white px-3 rounded text-sm hover:bg-blue-700"><Plus size={18}/></button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};

export default Restaurant;