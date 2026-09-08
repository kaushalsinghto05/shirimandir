import React from 'react';
import { X, Printer, Download, ShieldCheck } from 'lucide-react';

export default function Receipt80GModal({ receiptData, onClose }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-sanctum-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-sanctum-lg border border-gold-500/40 overflow-hidden flex flex-col">
        
        {/* Top Actions Bar (Hidden during print) */}
        <div className="bg-sanctum-950 text-white px-6 py-4 flex items-center justify-between no-print border-b border-gold-500/30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-tulsi-400" />
            <span className="font-serif font-bold text-sm tracking-wide text-sandstone-50">
              Form 10BE / 80G Tax Exemption Donation Certificate
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-sanctum-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-sanctum-900 text-sandstone-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Body */}
        <div id="printable-receipt" className="p-8 sm:p-10 bg-[#FFFEFA] text-sanctum-950 font-sans border-8 border-double border-gold-500/30 m-4 rounded-2xl">
          
          {/* Header */}
          <div className="text-center pb-6 border-b-2 border-sanctum-950">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-sanctum-950 flex items-center justify-center text-gold-400 font-serif font-bold text-2xl border-2 border-gold-500">
              ॐ
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-sanctum-950 uppercase tracking-wide">
              MandirVeda Devasthanam Trust
            </h2>
            <p className="text-xs text-sandstone-700 mt-1">
              Registered Under Indian Public Charitable Trust Act • NITI Aayog Darpan: UP/2023/038921
            </p>
            <p className="text-xs font-semibold text-terracotta-700 mt-1">
              Income Tax Act 1961 - Section 80G (5)(vi) Approval No: CIT(E)/LKO/80G/2021-22/A/10492
            </p>
          </div>

          {/* Receipt Meta */}
          <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-sandstone-200">
            <div>
              <span className="text-sandstone-500 block">Certificate / Receipt No:</span>
              <strong className="font-mono text-sm text-sanctum-950">{receiptData?.taxReceiptNo || 'MV-80G-2026-8942'}</strong>
            </div>
            <div className="text-right">
              <span className="text-sandstone-500 block">Date of Issuance:</span>
              <strong className="text-sanctum-950">{receiptData?.timestamp || '08 September 2026'}</strong>
            </div>
          </div>

          {/* Donor & Seva Details */}
          <div className="py-5 space-y-3 text-xs border-b border-sandstone-200">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-sandstone-500 block">Devotee Donor Name:</span>
                <strong className="text-sm font-serif text-sanctum-950">{receiptData?.donorName || 'Kaushal Singh'}</strong>
              </div>
              <div>
                <span className="text-sandstone-500 block">Devotee Gotra:</span>
                <strong className="text-sanctum-950">{receiptData?.gotra || 'Kashyap Gotra'}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-sandstone-500 block">Temple / Sanctum:</span>
                <strong className="text-sanctum-950">{receiptData?.templeName || 'Shri Kashi Vishwanath Temple, Varanasi'}</strong>
              </div>
              <div>
                <span className="text-sandstone-500 block">Seva / Religious Purpose:</span>
                <strong className="text-sanctum-950">{receiptData?.serviceTitle || 'Maha Rudrabhishek & Vedic Sankalpa'}</strong>
              </div>
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="py-5 border-b-2 border-sanctum-950">
            <div className="flex items-center justify-between text-sm py-1">
              <span className="font-medium text-sandstone-700">Seva Dakshina & Sacred Offering Contribution:</span>
              <span className="font-mono font-bold text-sanctum-950">₹{(receiptData?.amount || 1501).toLocaleString()}.00</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 text-sandstone-600">
              <span>Temple Annadanam & Maintenance Corpus Fund:</span>
              <span className="font-mono">Included</span>
            </div>
            <div className="flex items-center justify-between text-base font-serif font-bold py-2 mt-2 bg-sandstone-100 px-3 rounded-lg border border-sandstone-200">
              <span>Total Contribution Eligible for 80G:</span>
              <span>₹{(receiptData?.amount || 1501).toLocaleString()}.00</span>
            </div>
          </div>

          {/* Legal Certification & Signatures */}
          <div className="pt-6 flex items-end justify-between text-xs">
            <div className="max-w-xs text-[10px] text-sandstone-500 leading-tight">
              * This electronic certificate is generated under Section 80G and does not require a physical ink signature. Eligible for 50% deduction while filing ITR-1 / ITR-2.
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full border-2 border-dashed border-gold-600 flex items-center justify-center p-1 mb-1 text-[9px] text-gold-700 font-bold uppercase rotate-12">
                MandirVeda Seal
              </div>
              <span className="font-bold text-sanctum-950 block">Chief Sanctum Administrator</span>
              <span className="text-[10px] text-sandstone-500">Authorized Signatory</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
