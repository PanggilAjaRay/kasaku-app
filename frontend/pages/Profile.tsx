import React, { useState, useRef } from 'react';
import { useLicense, useData } from '../App';
import { User, Shield, CreditCard, CheckCircle, Package, Zap, Utensils, Factory, AlertCircle, Camera, Edit2, Save, X, Crown } from 'lucide-react';
import { Addons, UserProfile } from '../types';

const AddonCard: React.FC<{
  id: keyof Addons;
  title: string;
  description: string;
  price: string;
  icon: React.ReactNode;
  active: boolean;
  onToggle: (id: keyof Addons, val: boolean) => void;
}> = ({ id, title, description, price, icon, active, onToggle }) => {
  return (
    <div className={`border rounded-xl p-5 transition-all ${active ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 bg-white'}`}>
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className={`p-3 rounded-lg ${active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1 mb-2">{description}</p>
            <div className="text-sm font-medium text-gray-900">{price} <span className="text-gray-400 font-normal">/bulan</span></div>
          </div>
        </div>
        <button 
          onClick={() => onToggle(id, !active)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            active 
              ? 'bg-red-50 text-red-600 hover:bg-red-100' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
          }`}
        >
          {active ? 'Nonaktifkan' : 'Aktifkan'}
        </button>
      </div>
    </div>
  );
};

const Profile: React.FC = () => {
  const { license, updateAddon, extendLicense } = useLicense();
  const { userProfile, updateUserProfile } = useData();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile>(userProfile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setEditForm(prev => ({ ...prev, avatar: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    updateUserProfile(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(userProfile);
    setIsEditing(false);
  };

  if (!license) return null;

  // Initials for avatar fallback
  const initials = userProfile.companyName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil & Langganan</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola paket langganan dan informasi perusahaan.</p>
        </div>
      </div>

      {/* Subscription Status & Profile */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:p-8">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar Area */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-md border-2 border-white ring-2 ring-gray-100">
              {isEditing && editForm.avatar ? (
                 <img src={editForm.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : !isEditing && userProfile.avatar ? (
                <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                  {initials}
                </div>
              )}
            </div>
            
            {isEditing && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-white border border-gray-200 p-2 rounded-full shadow-sm hover:bg-gray-50 text-gray-600"
                title="Ubah Foto"
              >
                <Camera size={16} />
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload}
            />
          </div>

          <div className="flex-1 w-full">
            <div className="flex justify-between items-start mb-2">
               {!isEditing ? (
                 <div>
                   <h2 className="text-2xl font-bold text-gray-900">{userProfile.companyName}</h2>
                   <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <User size={16} />
                      <span className="font-medium">{userProfile.adminName}</span>
                      <span className="text-gray-400">|</span>
                      <span>{userProfile.email}</span>
                   </div>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nama Perusahaan</label>
                      <input 
                        type="text" 
                        value={editForm.companyName} 
                        onChange={e => setEditForm({...editForm, companyName: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nama Admin</label>
                      <input 
                        type="text" 
                        value={editForm.adminName} 
                        onChange={e => setEditForm({...editForm, adminName: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                 </div>
               )}

               {!isEditing ? (
                 <button onClick={() => { setIsEditing(true); setEditForm(userProfile); }} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                   <Edit2 size={20} />
                 </button>
               ) : (
                 <div className="flex gap-2">
                   <button onClick={handleCancel} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X size={20}/></button>
                   <button onClick={handleSaveProfile} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Save size={20}/></button>
                 </div>
               )}
            </div>

            <div className="flex items-center gap-2 mt-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg inline-block">
              <Shield size={16} className="text-gray-400" />
              <span>ID Lisensi: KSK-8821-2023-ID</span>
              <span className="mx-2 text-gray-300">|</span>
              <span className={license.days_left <= 7 ? 'text-orange-600 font-bold' : 'text-green-600 font-medium'}>
                {license.plan} Plan ({license.days_left} hari tersisa)
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
          <button 
            onClick={extendLicense}
            className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <CreditCard size={18} />
            Perpanjang Langganan
          </button>
          <button className="flex-1 sm:flex-none px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
            Ubah Paket
          </button>
        </div>
      </div>

      {/* Add-ons Section */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="text-blue-600" size={20} />
          Modul Tambahan (Add-on)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AddonCard 
            id="custom_branding"
            title="Branding & Kustomisasi"
            description="Hapus watermark Kasaku, gunakan logo sendiri pada faktur, dan tema kustom."
            price="Rp 29.000"
            icon={<Crown size={24} className="text-orange-500" />}
            active={license.addons.custom_branding}
            onToggle={updateAddon}
          />
          <AddonCard 
            id="plus_advance"
            title="Plus Advance"
            description="Untuk bisnis jasa. Aktifkan CRM, Manajemen Proyek, dan Kalender Invoice."
            price="Rp 49.000"
            icon={<Zap size={24} />}
            active={license.addons.plus_advance}
            onToggle={updateAddon}
          />
          <AddonCard 
            id="manufacturing"
            title="Manufaktur & Produksi"
            description="Manajemen bahan baku, Bill of Materials (BOM), dan Harga Pokok Produksi."
            price="Rp 99.000"
            icon={<Factory size={24} />}
            active={license.addons.manufacturing}
            onToggle={updateAddon}
          />
          <AddonCard 
            id="restaurant"
            title="Restoran & F&B"
            description="Manajemen resep, COGS real-time, dan integrasi POS sederhana."
            price="Rp 79.000"
            icon={<Utensils size={24} />}
            active={license.addons.restaurant}
            onToggle={updateAddon}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;