import React from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../App';

const ReceiptPrint: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { posOrders, userProfile, invoiceSettings } = useData();
  const order = posOrders.find(o => o.id === id);

  if (!order) return <div className="p-4 text-center">Nota tidak ditemukan</div>;

  return (
    <div className="flex justify-center min-h-screen bg-gray-100 p-4">
      {/* Simulation of 58mm / 80mm thermal receipt paper */}
      <div className="w-[300px] bg-white shadow-lg p-4 text-xs font-mono text-gray-800 self-start print:shadow-none print:w-full">
         <div className="text-center mb-4 border-b border-dashed border-gray-300 pb-2">
            <h1 className="text-base font-bold uppercase">{userProfile.companyName}</h1>
            <p className="text-[10px] text-gray-500 mt-1">{invoiceSettings.city}</p>
            <p className="text-[10px] text-gray-500">{order.date} | {order.id.slice(-6)}</p>
         </div>
         
         <div className="space-y-2 mb-4">
            {order.items.map((item, idx) => (
               <div key={idx} className="flex justify-between items-start">
                  <div className="w-[60%]">
                     <div>{item.name}</div>
                     <div className="text-[10px] text-gray-500">{item.qty} x {item.price.toLocaleString()}</div>
                  </div>
                  <div className="text-right font-medium">
                     {(item.qty * item.price).toLocaleString()}
                  </div>
               </div>
            ))}
         </div>

         <div className="border-t border-dashed border-gray-300 pt-2 space-y-1 mb-4">
            <div className="flex justify-between">
               <span>Subtotal</span>
               <span>{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
               <span>Tax ({invoiceSettings.taxRate}%)</span>
               <span>{order.tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-1 border-t border-gray-200">
               <span>TOTAL</span>
               <span>{order.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[10px] pt-1">
               <span>PAYMENT</span>
               <span>{order.paymentMethod}</span>
            </div>
         </div>

         <div className="text-center text-[10px] text-gray-500 pt-2 border-t border-dashed border-gray-300">
            <p>Terima Kasih</p>
            <p>Powered by Kasaku</p>
         </div>

         {/* Print Button (Hidden in Print Mode) */}
         <button onClick={() => window.print()} className="w-full mt-4 py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 print-only">
            PRINT
         </button>
         <style>{`
            @media print {
              .print-only { display: none; }
              body { background: white; }
              div { box-shadow: none; }
            }
         `}</style>
      </div>
    </div>
  );
};

export default ReceiptPrint;