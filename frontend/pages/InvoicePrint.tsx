import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData, useLicense } from '../App';

const InvoicePrint: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoices, invoiceSettings, userProfile } = useData();
  const { license } = useLicense();

  const invoice = invoices.find(inv => inv.id === id);

  if (!invoice) return <div className="p-8 text-center text-red-600">Faktur tidak ditemukan</div>;

  // Defaults if data missing
  const items = invoice.items && invoice.items.length > 0 ? invoice.items : [
    { desc: 'Jasa Layanan (Contoh)', qty: 1, price: invoice.amount }
  ];

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.11; // PPN 11%
  const total = subtotal + tax;

  // Branding Logic
  const showWatermark = !license?.addons.custom_branding || !invoiceSettings.hideWatermark;
  
  return (
    <div className="max-w-[210mm] mx-auto bg-white min-h-screen text-gray-800 font-sans relative flex flex-col">
      
      {/* Header Watermark */}
      {showWatermark && (
        <div className="w-full text-center py-2 text-[10px] text-gray-400 border-b border-gray-100 uppercase tracking-widest no-print">
          Dicetak melalui Kasaku by Finologi
        </div>
      )}
      
      <div className="p-8 md:p-12 flex-1">
        {/* Print Controls - Hidden when printing */}
        <div className="fixed top-4 right-4 flex gap-4 no-print z-50">
          <button 
            onClick={() => navigate(-1)} 
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 font-medium flex items-center gap-2"
          >
            Kembali
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Cetak PDF
          </button>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white border border-gray-100 flex items-center justify-center font-bold text-xl rounded-lg overflow-hidden">
              {invoiceSettings.logo ? (
                <img src={invoiceSettings.logo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="bg-blue-600 text-white w-full h-full flex items-center justify-center">
                  {userProfile.companyName.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="font-bold text-2xl text-gray-900">{userProfile.companyName}</h1>
              <p className="text-sm text-gray-500">{userProfile.email}</p>
              {/* Assuming address is static or from userProfile if added there later */}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-bold text-gray-200 uppercase tracking-wide">Invoice</h2>
            <p className="font-medium text-gray-600 mt-2">#{invoice.id}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="flex justify-between mb-12 border-t border-b border-gray-100 py-8">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ditagihkan Kepada:</h3>
            <p className="font-bold text-gray-900">{invoice.customerName}</p>
            <p className="text-sm text-gray-600 mt-1">Pelanggan Terhormat</p>
          </div>
          <div className="text-right space-y-2">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Tanggal Terbit</span>
              <span className="text-sm font-medium">{invoice.date}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Jatuh Tempo</span>
              <span className="text-sm font-medium">{invoice.dueDate}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-100">
              <th className="text-left py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Deskripsi</th>
              <th className="text-center py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Qty</th>
              <th className="text-right py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-40">Harga Satuan</th>
              <th className="text-right py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-40">Total</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-50">
                <td className="py-4 text-gray-800 font-medium">{item.description}</td>
                <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                <td className="py-4 text-right text-gray-600">Rp {item.price.toLocaleString('id-ID')}</td>
                <td className="py-4 text-right text-gray-900 font-medium">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-12">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>PPN (11%)</span>
              <span>Rp {tax.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
              <span>Total</span>
              <span>Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Payment Info & Signature */}
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* Payment Info */}
          <div className="bg-gray-50 rounded-lg p-6 text-sm text-gray-600 flex-1">
            <p className="font-bold text-gray-900 mb-2">Informasi Pembayaran:</p>
            <div className="whitespace-pre-wrap font-mono text-xs">{invoiceSettings.paymentInfo}</div>
            <p className="mt-4 text-xs text-gray-400">Harap sertakan nomor invoice pada berita transfer.</p>
          </div>

          {/* Signature Area */}
          <div className="w-48 text-center pt-4">
             <div className="text-xs text-gray-500 mb-16">
               {invoiceSettings.city}, {invoice.date}<br/>
               Hormat Kami,
             </div>
             <div className="border-b border-gray-300 pb-2 font-bold text-gray-900 text-sm">
               {invoiceSettings.signatureName}
             </div>
             <div className="text-[10px] text-gray-400 mt-1">{userProfile.companyName}</div>
          </div>
        </div>

        <div className="mt-12 text-center text-xs text-gray-400">
          <p>{invoiceSettings.footerNote}</p>
        </div>
      </div>

      {/* Footer Watermark */}
      {showWatermark && (
        <div className="w-full text-center py-2 text-[10px] text-gray-400 bg-gray-50 border-t border-gray-100 uppercase tracking-widest print-only">
          Dicetak melalui Kasaku by Finologi
        </div>
      )}

    </div>
  );
};

export default InvoicePrint;