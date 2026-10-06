import React from 'react';
import { X, Download, Printer } from 'lucide-react';

export default function Receipt80GModal({ receiptData, onClose }) {
  if (!receiptData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-elevated relative animate-scale-in flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-charcoal-500 hover:text-charcoal-900 bg-ivory-100 hover:bg-ivory-200 p-2 rounded-full transition-all duration-300 z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-8" id="printable-receipt">
          {/* Header */}
          <div className="text-center mb-8 border-b-2 border-copper-200 pb-6">
            <h2 className="font-display text-3xl font-bold text-copper-600 mb-1">Shiri Mandir</h2>
            <p className="font-sans text-sm text-charcoal-500">Sacred Connections, Verified Trust</p>
            <h3 className="font-sans text-lg font-bold text-charcoal-900 mt-4 uppercase tracking-wider">80G Tax Exemption Donation Receipt</h3>
          </div>

          {/* Receipt Details */}
          <div className="space-y-4 font-sans text-charcoal-700">
            <div className="flex justify-between border-b border-ivory-200 pb-2">
              <span className="font-semibold">Receipt No:</span>
              <span>{receiptData.receiptNo}</span>
            </div>
            <div className="flex justify-between border-b border-ivory-200 pb-2">
              <span className="font-semibold">Date:</span>
              <span>{receiptData.date}</span>
            </div>
            <div className="flex justify-between border-b border-ivory-200 pb-2">
              <span className="font-semibold">Donor Name:</span>
              <span>{receiptData.donorName}</span>
            </div>
            <div className="flex justify-between border-b border-ivory-200 pb-2">
              <span className="font-semibold">PAN Number:</span>
              <span className="uppercase">{receiptData.pan}</span>
            </div>
            <div className="flex justify-between border-b border-ivory-200 pb-2">
              <span className="font-semibold">Temple:</span>
              <span>{receiptData.temple}</span>
            </div>
            <div className="flex justify-between border-b border-ivory-200 pb-2">
              <span className="font-semibold">Service:</span>
              <span>{receiptData.service}</span>
            </div>
            <div className="flex justify-between border-b border-ivory-200 pb-2 text-lg">
              <span className="font-bold text-charcoal-900">Donation Amount:</span>
              <span className="font-mono font-bold text-copper-600">₹{receiptData.amount}</span>
            </div>
          </div>

          <div className="mt-8 bg-sage-50 border border-sage-200 p-4 rounded-xl text-center">
            <p className="text-sage-700 text-sm font-medium">
              This donation is eligible for 50% tax exemption under Section 80G of Income Tax Act, 1961.
            </p>
          </div>
          
          <div className="mt-8 flex justify-center">
            <div className="w-24 h-24 bg-ivory-100 border border-ivory-200 rounded-lg flex items-center justify-center">
              <span className="text-xs text-charcoal-400">QR Code</span>
            </div>
          </div>
          <p className="text-center text-xs text-charcoal-400 mt-2">Scan to verify authenticity</p>
        </div>

        {/* Actions */}
        <div className="p-6 bg-ivory-50 border-t border-ivory-200 rounded-b-3xl flex flex-col sm:flex-row sm:justify-end gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center justify-center space-x-2 px-5 py-3 min-h-[44px] bg-ivory-200 hover:bg-ivory-300 text-charcoal-700 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-charcoal-200 focus:ring-offset-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button 
            className="flex items-center justify-center space-x-2 px-5 py-3 min-h-[44px] bg-copper-400 hover:bg-copper-500 text-ivory-50 rounded-xl transition-all duration-300 shadow-copper-glow focus:ring-2 focus:ring-copper-400/50 focus:ring-offset-2"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
