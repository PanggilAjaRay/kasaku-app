import React, { useState, useRef } from 'react';
import { Save, Upload, Crown, Lock } from 'lucide-react';
import { useData, useLicense } from '../App';
import { InvoiceSettings } from '../types';

const SettingsPage: React.FC = () => {
  const { invoiceSettings, updateInvoiceSettings } = useData();
  const { license } = useLicense();
  
  const [formData, setFormData] = useState<InvoiceSettings>(invoiceSettings);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    updateInvoiceSettings(formData);
    alert('Pengaturan berhasil disimpan!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, logo: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const isBrandingEnabled = license?.addons.custom_branding;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
        <p className="text-gray-500 text-sm mt-1">Konfigurasi mata uang, pajak, dan tampilan faktur.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Pengaturan Umum */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Umum</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mata Uang Dasar</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none bg-white">
                  <option>IDR - Rupiah Indonesia</option>
                  <option>USD - US Dollar</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default PPN / Pajak POS (%)</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none bg-white" 
                  value={formData.taxRate}
                  onChange={e => setFormData({...formData, taxRate: parseFloat(e.target.value) || 0})}
                />
              </div>
            </form>
          </div>
        </div>

        {/* Kolom Kanan: Pengaturan Faktur */}
        <div className="lg:col-span-2">
           <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-lg font-bold text-gray-900">Pengaturan Faktur & Pembayaran</h2>
               <button 
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                >
                  <Save size={16} />
                  Simpan
               </button>
             </div>
             
             <div className="space-y-6">
                
                {/* Logo & Branding */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                   <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                     <Crown size={18} className="text-orange-500" /> Branding & Logo
                   </h3>
                   
                   <div className="flex items-start gap-6">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden relative group">
                          {formData.logo ? (
                            <img src={formData.logo} alt="Logo" className="w-full h-full object-contain p-1" />
                          ) : (
                            <span className="text-gray-400 text-xs text-center px-2">Upload Logo</span>
                          )}
                          <button 
                            disabled={!isBrandingEnabled}
                            onClick={() => logoInputRef.current?.click()}
                            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all disabled:cursor-not-allowed"
                          >
                             {isBrandingEnabled && <Upload className="text-white opacity-0 group-hover:opacity-100" size={24} />}
                          </button>
                        </div>
                        <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                        {!isBrandingEnabled && <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded text-gray-500 flex items-center gap-1"><Lock size={8}/> Terkunci</span>}
                      </div>
                      
                      <div className="flex-1 space-y-4">
                         <div className={`flex items-center justify-between p-3 rounded-lg border ${isBrandingEnabled ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-200 opacity-70'}`}>
                            <div>
                               <div className="font-medium text-gray-900 text-sm">Hapus Watermark "Kasaku"</div>
                               <div className="text-xs text-gray-500">Sembunyikan teks "Dicetak melalui Kasaku" di header/footer.</div>
                            </div>
                            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input 
                                  type="checkbox" 
                                  name="toggle" 
                                  id="toggle" 
                                  disabled={!isBrandingEnabled}
                                  checked={formData.hideWatermark}
                                  onChange={e => setFormData({...formData, hideWatermark: e.target.checked})}
                                  className={`toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer ${formData.hideWatermark ? 'right-0 border-blue-600' : 'left-0 border-gray-300'}`}
                                />
                                <label htmlFor="toggle" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${formData.hideWatermark ? 'bg-blue-600' : 'bg-gray-300'}`}></label>
                            </div>
                         </div>
                         {!isBrandingEnabled && (
                           <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-100">
                             Fitur kustomisasi logo dan watermark tersedia di Add-on Branding.
                           </p>
                         )}
                      </div>
                   </div>
                </div>

                {/* Informasi Pembayaran */}
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Informasi Pembayaran & Bank</label>
                   <textarea 
                     rows={5}
                     className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-mono"
                     value={formData.paymentInfo}
                     onChange={e => setFormData({...formData, paymentInfo: e.target.value})}
                     placeholder="Masukkan detail rekening bank..."
                   />
                   <p className="text-xs text-gray-500 mt-1">Informasi ini akan muncul di bagian bawah setiap faktur.</p>
                </div>

                {/* Footer Note & Signature */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Footer (Ucapan)</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
                        value={formData.footerNote}
                        onChange={e => setFormData({...formData, footerNote: e.target.value})}
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kota (Tempat Tanggal)</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
                        value={formData.city}
                        onChange={e => setFormData({...formData, city: e.target.value})}
                      />
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Penandatangan (Admin/Manager)</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
                        value={formData.signatureName}
                        onChange={e => setFormData({...formData, signatureName: e.target.value})}
                      />
                   </div>
                </div>

             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;